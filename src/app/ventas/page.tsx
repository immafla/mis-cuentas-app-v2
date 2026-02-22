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
    saleSuccessMessage,
    setProductSearchInput,
    clearStockWarning,
    clearSaleSuccessMessage,
    handleSelectSearchedProduct,
    handleRemoveOneProduct,
    handleIncreaseProductQuantity,
    handleSetProductQuantity,
    handleSetProductPrice,
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
    <Container
      fixed
      sx={{
        py: { xs: 1, sm: 2, md: 3 },
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
        {/* NEGOCIO */}
        <Grid size={12} sx={{ display: "flex", minHeight: 0 }}>
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              minHeight: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
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
                <Stack direction="row" alignItems="center" justifyContent="space-between">
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
                  sx={{
                    "& .MuiAutocomplete-noOptions, & .MuiAutocomplete-loading": {
                      justifyContent: "center",
                      textAlign: "center",
                    },
                  }}
                  options={productSearchOptions}
                  loading={isSearchingProducts}
                  autoHighlight
                  openOnFocus
                  selectOnFocus
                  handleHomeEndKeys
                  clearOnBlur={false}
                  value={null}
                  inputValue={productSearchInput}
                  onInputChange={(_, newInputValue) => setProductSearchInput(newInputValue)}
                  onChange={(_, selectedOption) => handleSelectSearchedProduct(selectedOption)}
                  filterOptions={(options) => options}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
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
                        <Typography
                          fontWeight={600}
                        >{`${option.category_name || "N/A"} ${option.brand_name || "N/A"} ${option.name}`}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {`Cod.: ${option.bar_code} • Stock: ${option.amount} • Precio: ${Number(
                            option.sale_price ?? 0,
                          ).toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}`}
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

            <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
              <List
                sx={{ px: 2, py: 1, minHeight: "100%", display: "flex", flexDirection: "column" }}
              >
                {totalItems === 0 && (
                  <ListItem
                    sx={{
                      py: 3,
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <ListItemText
                      primary="No hay productos escaneados"
                      secondary="Escanea un código de barras para añadir productos."
                      primaryTypographyProps={{ textAlign: "center" }}
                      secondaryTypographyProps={{ textAlign: "center" }}
                    />
                  </ListItem>
                )}
                {groupedSelectedProducts.map((element) => (
                  <Box key={`${element.id}-${element.barCode}`}>
                    <ListItem
                      sx={{
                        py: 1.5,
                        alignItems: { xs: "flex-start", sm: "center" },
                        flexWrap: { xs: "wrap", sm: "nowrap" },
                        rowGap: 1,
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: { xs: 44, sm: 56 } }}>
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
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          mr: { xs: 0, sm: 2 },
                        }}
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {`Cod.: ${element.barCode}`}
                            </Typography>
                            <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                              {`Cantidad: ${element.quantity}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {`Precio venta unidad: $ ${Number(element.price ?? 0).toLocaleString("es-CO")}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {` Stock: ${element.amount}`}
                            </Typography>
                          </>
                        }
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                      <Stack
                        spacing={1}
                        sx={{
                          width: { xs: "100%", sm: "auto" },
                          alignItems: { xs: "flex-start", sm: "flex-end" },
                          ml: { xs: 5.5, sm: 0 },
                        }}
                      >
                        <Typography variant="h6" component="div" sx={{ lineHeight: 1.2 }}>
                          {Number((element.price ?? 0) * (element.quantity ?? 0)).toLocaleString(
                            "es-CO",
                            {
                              style: "currency",
                              currency: "COP",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            },
                          )}
                        </Typography>
                        <TextField
                          size="small"
                          type="text"
                          label="Precio venta"
                          value={Number(element.price ?? 0).toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                          onChange={(event) => {
                            const rawValue = event.target.value;
                            const parsedValue = Number(rawValue.replaceAll(/[^\d]/g, ""));
                            handleSetProductPrice(
                              element.id,
                              Number.isFinite(parsedValue) ? parsedValue : 0,
                            );
                          }}
                          inputProps={{
                            min: 0,
                            style: {
                              width: 118,
                              textAlign: "center",
                              padding: "4px 6px",
                            },
                          }}
                          sx={{
                            width: { xs: 150, sm: 168 },
                            "& .MuiInputBase-root": {
                              height: { xs: 28, sm: 32 },
                            },
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.8rem", sm: "0.875rem" },
                            },
                          }}
                        />
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ flexWrap: "wrap" }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 500 }}
                          >
                            Cant.
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleRemoveOneProduct(element.id)}
                            sx={{
                              minWidth: { xs: 28, sm: 36 },
                              px: { xs: 0.5, sm: 1 },
                              height: { xs: 28, sm: 32 },
                            }}
                          >
                            -
                          </Button>
                          <TextField
                            size="small"
                            type="number"
                            value={element.quantity}
                            onChange={(event) =>
                              handleSetProductQuantity(element.id, Number(event.target.value))
                            }
                            inputProps={{
                              min: 1,
                              max: element.amount,
                              style: {
                                width: 44,
                                textAlign: "center",
                                padding: "4px 6px",
                              },
                            }}
                            sx={{
                              "& .MuiInputBase-root": {
                                height: { xs: 28, sm: 32 },
                              },
                              "& .MuiInputBase-input": {
                                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                              },
                            }}
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleIncreaseProductQuantity(element.id)}
                            disabled={element.quantity >= (element.amount ?? 0)}
                            sx={{
                              minWidth: { xs: 28, sm: 36 },
                              px: { xs: 0.5, sm: 1 },
                              height: { xs: 28, sm: 32 },
                            }}
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
                  <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
                    {Number(total ?? 0).toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
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

      <Snackbar
        open={Boolean(saleSuccessMessage)}
        autoHideDuration={2200}
        onClose={clearSaleSuccessMessage}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={clearSaleSuccessMessage} severity="success" variant="filled">
          {saleSuccessMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NewSale;
