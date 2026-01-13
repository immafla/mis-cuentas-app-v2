import React, { useState, useEffect, Fragment } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Button,
  InputLabel,
  MenuItem,
  AppBar,
  DialogActions,
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
} from "@mui/material";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import Select, { SelectChangeEvent } from "@mui/material/Select";

import { IActionsModal } from "./interface";

import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";
import { Product } from "../../../interfaces";
import { ApiService } from "../../../services/api.service";

export const NewInventary = ({ open, setOpen }: IActionsModal) => {
  const apiService = new ApiService();
  const [age, setAge] = useState("");
  const [openAutocomplete, setOpenAutocomplete] = useState(false);
  const [options, setOptions] = useState<Product[]>([]);
  const [value, setValue] = useState<Dayjs | null>(
    dayjs("2014-08-18T21:11:54")
  );

  function sleep(delay = 0) {
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
  };

  const handleChangeDate = (newValue: Dayjs | null) => {
    setValue(newValue);
  };

  const loading = open && options.length === 0;

  interface Film {
    title: string;
    year: number;
  }

  const getAllProducts = async () => {
    try {
      const products = await (await apiService.getAllProducts()).json();
      console.log('products =>', {products})
      return products;
      // const productsParsed = products.map((element: Product) => {
      //     return {
      //         ...element,
      //         brand: parseBrand(element.brand).name,
      //         category: parseCategory(element.category).name
      //     }
      //     })

      //     setTableData(productsParsed)
    } catch (e) {
      console.log("Error al obtener la lista de productos =>", { e });
    }
  };

  useEffect(() => {
    let active = true;
    if (!loading) {
      return undefined;
    }
    (async () => {
      await sleep(1e3); // For demo purposes.
      if (active) {
        const products = await getAllProducts();
        setOptions(products);
      }
    })();

    return () => {
      active = false;
    };
  }, [loading]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen()}
      fullWidth={true}
      maxWidth={"sm"}
    >
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
            Ingresar inventario
          </Typography>
          <Button autoFocus color="inherit" onClick={setOpen}>
            Guardar
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
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Negocio</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={age}
                label="Negocio"
                onChange={handleChange}
              >
                <MenuItem value={10}>Licorera</MenuItem>
                <MenuItem value={20}>Papeleria</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* PRODUCTO */}
          <Grid>
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
                        <Fragment>
                          {loading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </Fragment>
                      ),
                    }}
                  />
                )}
              />
            </FormControl>
          </Grid>

          {/* CANTIDAD */}
          <Grid>
            <FormControl fullWidth>
              <TextField
                id="outlined-number"
                label="Cantidad"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormControl>
          </Grid>

          {/* VALOR UNITARIO */}
          <Grid>
            <FormControl fullWidth>
              <TextField
                id="outlined-number"
                label="Valor unitario"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Container>
      <DialogActions>
        <Button variant="contained" onClick={() => setOpen()}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
