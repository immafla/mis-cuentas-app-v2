'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Typography,
  Container,
  Box,
  Grid,
  ListItemText,
  ListItem,
  List,
  Divider,
  Paper,
  Stack,
  Chip,
} from "@mui/material";

import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import LiquorIcon from "@mui/icons-material/Liquor";
import {
  getProductByBarcode,
  updateProductsAmountBatch,
} from "../../services/products.service";

type SaleLineItem = {
  id: string;
  barCode: string;
  name: string;
  price: number;
  amount: number;
};
const NewSale = () => {
  const [listSelectedProducts, setListSelectedProducts] = useState<
    SaleLineItem[]
  >([
    {
      id: "mock-product-1",
      barCode: "000000000001",
      name: "Producto de prueba",
      price: 2500,
      amount: 10,
    },
  ]);
  const [isPaying, setIsPaying] = useState(false);

  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);

  const addProductByBarcode = useCallback(async (barCode: string) => {
    try {
      const { success, data } = await getProductByBarcode(barCode);

      if (!success || !data) {
        throw new Error("Producto no encontrado");
      }

      setListSelectedProducts((prevState) => [
        ...prevState,
        {
          id: data._id,
          barCode,
          name: data.name,
          price: data.sale_price,
          amount: data.amount ?? 0,
        },
      ]);
    } catch (error) {
      console.error("Error al obtener producto por código de barras", error);
    }
  }, []);

  const total = useMemo(
    () =>
      listSelectedProducts.reduce((sum, item) => sum + (item.price ?? 0), 0),
    [listSelectedProducts],
  );

  const handlePay = useCallback(async () => {
    if (listSelectedProducts.length === 0 || isPaying) {
      return;
    }

    setIsPaying(true);
    try {
      const grouped = listSelectedProducts.reduce((acc, item) => {
        const existing = acc.get(item.id);
        if (existing) {
          existing.count += 1;
        } else {
          acc.set(item.id, {
            id: item.id,
            amount: item.amount ?? 0,
            count: 1,
          });
        }
        return acc;
      }, new Map<string, { id: string; amount: number; count: number }>());

      const updates = Array.from(grouped.values()).map(
        ({ id, amount, count }) => ({
          id,
          amount: Math.max((amount ?? 0) - count, 0),
        }),
      );

      await updateProductsAmountBatch(updates);

      setListSelectedProducts([]);
    } catch (error) {
      console.error("Error al actualizar el inventario", error);
    } finally {
      setIsPaying(false);
    }
  }, [isPaying, listSelectedProducts]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const currentTime = Date.now();

      // 1. Calcular velocidad: Los lectores disparan teclas con < 30ms de diferencia
      const diff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      // 2. Si el usuario presiona Enter, el escaneo terminó
      if (event.key === "Enter") {
        const scannedBarCode = bufferRef.current;
        bufferRef.current = ""; // Limpiar para la siguiente lectura

        if (scannedBarCode.length > 2) {
          // Evitar falsos positivos
          addProductByBarcode(scannedBarCode);
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
  }, [addProductByBarcode]);

  return (
    <Container fixed sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* NEGOCIO */}
        <Grid size={12}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6" component="div">
                  Listado de productos
                </Typography>
                <Chip
                  label={`${listSelectedProducts.length} items`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Stack>
            </Box>

            <Box sx={{ maxHeight: "60vh", overflow: "auto" }}>
              <List sx={{ px: 2, py: 1 }}>
                {listSelectedProducts.length === 0 && (
                  <ListItem sx={{ py: 3 }}>
                    <ListItemText
                      primary="No hay productos escaneados"
                      secondary="Escanea un código de barras para añadir productos."
                    />
                  </ListItem>
                )}
                {listSelectedProducts.map((element, index) => (
                  <Box key={`${index}-${element.barCode}`}>
                    <ListItem sx={{ py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: "primary.light",
                            color: "primary.contrastText",
                          }}
                        >
                          <LiquorIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={element.name}
                        secondary={`Cod.: ${element.barCode}`}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                      <Typography variant="h6" component="div">
                        {`$ ${element.price}`}
                      </Typography>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </Box>
                ))}
              </List>
            </Box>

            <Box
              sx={{
                px: 3,
                py: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total
                  </Typography>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 700 }}
                  >
                    {`$ ${total}`}
                  </Typography>
                </Box>
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
                  onClick={handlePay}
                  disabled={isPaying || listSelectedProducts.length === 0}
                >
                  {isPaying ? "Procesando..." : "Pagar"}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default NewSale;
