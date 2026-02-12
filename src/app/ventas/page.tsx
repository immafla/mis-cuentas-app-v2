"use client";

import { useEffect, useRef } from "react";

import {
  Alert,
  Autocomplete,
  Button,
  CircularProgress,
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
  Snackbar,
  Chip,
  TextField,
} from "@mui/material";

import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import LiquorIcon from "@mui/icons-material/Liquor";
import { ProductSearchOption, useSales } from "./hooks/useSales";

const NewSale = () => {
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const {
    groupedSelectedProducts,
    total,
    totalItems,
    isPaying,
    productSearchInput,
    productSearchOptions,
    isSearchingProducts,
    stockWarning,
    setProductSearchInput,
    clearStockWarning,
    handleSelectSearchedProduct,
    handleRemoveOneProduct,
    handleIncreaseProductQuantity,
    handleSetProductQuantity,
    handlePay,
  } = useSales();

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const isCtrlK = event.ctrlKey && event.key.toLowerCase() === "k";

      if (!isCtrlK) {
        return;
      }

      event.preventDefault();
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    };

    globalThis.addEventListener("keydown", handleShortcut);

    return () => {
      globalThis.removeEventListener("keydown", handleShortcut);
    };
  }, []);

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
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" component="div">
                    Listado de productos
                  </Typography>
                  <Chip
                    label={`${totalItems} items`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </Stack>

                <Autocomplete<ProductSearchOption, false, false, false>
                  options={productSearchOptions}
                  loading={isSearchingProducts}
                  autoHighlight
                  openOnFocus
                  selectOnFocus
                  handleHomeEndKeys
                  clearOnBlur={false}
                  value={null}
                  inputValue={productSearchInput}
                  onInputChange={(_, newInputValue) =>
                    setProductSearchInput(newInputValue)
                  }
                  onChange={(_, selectedOption) =>
                    handleSelectSearchedProduct(selectedOption)
                  }
                  filterOptions={(options) => options}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  getOptionLabel={(option) => option.name}
                  noOptionsText={
                    productSearchInput.trim().length < 2
                      ? "Escribe al menos 2 caracteres"
                      : "No se encontraron productos"
                  }
                  loadingText="Buscando productos..."
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option._id}>
                      <Stack sx={{ width: "100%" }}>
                        <Typography fontWeight={600}>{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {`Cod.: ${option.bar_code} • Stock: ${option.amount} • $ ${option.sale_price}`}
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputRef={searchInputRef}
                      size="small"
                      label="Buscar y añadir producto"
                      placeholder="Nombre o código de barras"
                      helperText="Usa ↑ ↓ + Enter para seleccionar. Atajo: Ctrl+K"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isSearchingProducts ? (
                              <CircularProgress color="inherit" size={18} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Stack>
            </Box>

            <Box sx={{ maxHeight: "60vh", overflow: "auto" }}>
              <List sx={{ px: 2, py: 1 }}>
                {totalItems === 0 && (
                  <ListItem sx={{ py: 3 }}>
                    <ListItemText
                      primary="No hay productos escaneados"
                      secondary="Escanea un código de barras para añadir productos."
                    />
                  </ListItem>
                )}
                {groupedSelectedProducts.map((element) => (
                  <Box key={`${element.id}-${element.barCode}`}>
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
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {`Cod.: ${element.barCode}`}
                            </Typography>
                            <Typography
                              sx={{ fontSize: "14px", fontWeight: 500 }}
                            >
                              {`Cantidad: ${element.quantity}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {`Stock: ${element.amount}`}
                            </Typography>
                          </>
                        }
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                      <Stack alignItems="flex-end" spacing={1}>
                        <Typography variant="h6" component="div">
                          {`$ ${element.price * element.quantity}`}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleRemoveOneProduct(element.id)}
                          >
                            -
                          </Button>
                          <TextField
                            size="small"
                            type="number"
                            value={element.quantity}
                            onChange={(event) =>
                              handleSetProductQuantity(
                                element.id,
                                Number(event.target.value),
                              )
                            }
                            inputProps={{
                              min: 1,
                              max: element.amount,
                              style: {
                                width: 52,
                                textAlign: "center",
                                padding: "6px 8px",
                              },
                            }}
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() =>
                              handleIncreaseProductQuantity(element.id)
                            }
                            disabled={element.quantity >= (element.amount ?? 0)}
                          >
                            +
                          </Button>
                        </Stack>
                      </Stack>
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
                  disabled={isPaying || totalItems === 0}
                >
                  {isPaying ? "Procesando..." : "Pagar"}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={Boolean(stockWarning)}
        autoHideDuration={2500}
        onClose={clearStockWarning}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={clearStockWarning} severity="warning" variant="filled">
          {stockWarning}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NewSale;
