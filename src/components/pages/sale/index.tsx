import React, { useEffect, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Button,
  InputLabel,
  MenuItem,
  AppBar,
  FormControl,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  Autocomplete,
  CircularProgress,
  Container,
  Box,
  Grid,
  ListItemText,
  ListItem,
  List,
  Divider,
} from "@mui/material";

import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";

import LiquorIcon from "@mui/icons-material/Liquor";

import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import Select, { SelectChangeEvent } from "@mui/material/Select";

import { IActionsModal } from "./interface";
import { ApiService } from "../../../services/api.service";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";
import { Product } from "@/interfaces/";


export const NewSale = ({ open, setOpen }: IActionsModal) => {
  const [barCodeProduct, setBarCodeProduct] = useState<string>();
  const [openAutocomplete, setOpenAutocomplete] = React.useState(false);
  const [options, setOptions] = React.useState<readonly Product[]>([]);
  const [listSelectedProducts, setListSelectedProducts] = useState<any[]>([]);

  function sleep(delay = 0) {
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }

  const loading = open && options.length === 0;
  interface Product {
    name: string;
    price: number;
  }

  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(Date.now());

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      const currentTime = Date.now();

      // 1. Calcular velocidad: Los lectores disparan teclas con < 30ms de diferencia
      const diff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      // 2. Si el usuario presiona Enter, el escaneo terminó
      if (event.key === "Enter") {
        if (bufferRef.current.length > 2) {
          // Evitar falsos positivos
          setBarCodeProduct(bufferRef.current);
          bufferRef.current = ""; // Limpiar para la siguiente lectura
        }
        return;
      }

      // 3. Limpiar buffer si pasó demasiado tiempo (el usuario está escribiendo manual)
      if (diff > 100) {
        bufferRef.current = "";
      }

      // 4. Acumular solo caracteres válidos (evitar Shift, Alt, etc.)
      if (event.key.length === 1) {
        bufferRef.current += event.key;
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);

    return () => {
      globalThis.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (barCodeProduct) {
      const apiService = new ApiService();
      apiService.getProductByBarcode(barCodeProduct).then((response) => {
        response.json().then((data) => {
          setListSelectedProducts((prevState) => [
            ...prevState,
            {
              barCode: barCodeProduct,
              name: data[0]?.name,
              price: data[0]?.sale_price,
            },
          ]);
        });
      });
    }
  }, [barCodeProduct]);

  React.useEffect(() => {
    let active = true;
    if (!loading) {
      return undefined;
    }
    (async () => {
      await sleep(1e3);
      if (active) {
        setOptions([...products]);
      }
    })();
    return () => {
      active = false;
    };
  }, [loading]);

  React.useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={() => setOpen()} fullScreen>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={setOpen}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Ingresar venta
          </Typography>
          <Button autoFocus color="inherit" onClick={setOpen}>
            Cerrar
          </Button>
        </Toolbar>
      </AppBar>

      <Container fixed>
        <Grid
          container
          sx={{ m: 2 }}
          rowSpacing={2}
          columnSpacing={{ xs: 15, sm: 2, md: 3 }}
        >
          {/* NEGOCIO */}
          <Grid>
            <Box
              component="form"
              sx={{
                overflow: "auto",
                maxHeight: "80vh",
                paddingInline: 1,
                paddingBottom: 1,
                border: "1px dashed grey",
              }}
            >
              <Typography sx={{ mt: 3, ml: 2, flex: 1, textAlign: "center" }} variant="h5" component="div">
                Listado de productos
              </Typography>
              <List>
                {listSelectedProducts.map((element, index) => (
                  <Grid container key={`${index}${element?.barCode}`} spacing={2}>
                    <Grid>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <LiquorIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={element.name}
                          secondary={`Cod.: ${element?.barCode}`}
                        />
                      </ListItem>
                    </Grid>
                    <Grid>
                      <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component='div'>
                        {`$ ${element?.price}`}
                      </Typography>
                    </Grid>
                    <Divider />
                  </Grid>
                ))}
              </List>
            </Box>
          </Grid>

          {/* FECHA DE COMPRA */}
          {/* <Grid item xs={4}>
            <FormControl fullWidth>
              <Autocomplete
                id="asynchronous-demo"
                //sx={{ width: 300 }}
                open={openAutocomplete}
                onOpen={() => {
                  setOpenAutocomplete(true);
                }}
                onClose={() => {
                  setOpenAutocomplete(false);
                }}
                onChange={(_, value) => {
                  setListSelectedProducts((prevState) => {
                    console.log(value);
                    prevState.push(value);
                    return prevState;
                  });
                }}
                isOptionEqualToValue={(option, value) =>
                  option.name === value.name
                }
                getOptionLabel={(option) => option.name}
                options={options}
                loading={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Producto"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {loading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
              />
            </FormControl>
          </Grid> */}
        </Grid>
      </Container>
    </Dialog>
  );
};

const products = [
  { name: "Aguardiente cristal litro", price: 40000 },
  { name: "Aguardiente cristal media", price: 5000 },
  { name: "Aguardiente cristal media", price: 500 },
  { name: "Aguardiente cristal media", price: 50 },
  { name: "Aguardiente cristal media", price: 5 },
];
