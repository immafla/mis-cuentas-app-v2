"use client";

import { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
  Container,
  Fade,
  Divider,
  Grid,
  Grow,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import useDashboard from "./hooks/useDashboard";
import { DashboardSale } from "./interfaces";
import SalesTrendChart from "./SalesTrendChart";
import bgImage from "@/assets/images/bg.jpg";

const Dashboard = () => {
  const { isLoading, recentSales, kpis, glassCardSx } = useDashboard();
  const [selectedSale, setSelectedSale] = useState<DashboardSale | null>(null);
  const potentialInventoryProfit =
    Number(kpis.totalBusinessSaleValue ?? 0) - Number(kpis.totalBusinessNetCost ?? 0);
  const isPotentialPositive = potentialInventoryProfit >= 0;
  const isProfitPositive = Number(kpis.totalProfit ?? 0) >= 0;
  const isNetMarginPositive = Number(kpis.netMarginPercent ?? 0) >= 0;

  const handleOpenSaleDetail = (sale: DashboardSale) => {
    setSelectedSale(sale);
  };

  const handleCloseSaleDetail = () => {
    setSelectedSale(null);
  };

  return (
    <Box
      sx={{
        height: "100%",
        position: "relative",
        isolation: "isolate",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundImage: `url(${bgImage.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          opacity: 0.15,
          zIndex: -1,
          pointerEvents: "none",
        }}
      />
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={{ xs: 2, sm: 3 }}>
          <Fade in timeout={350}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Información de ventas
              </Typography>
              <Typography color="text.secondary">Resumen rápido del desempeño del día.</Typography>
            </Box>
          </Fade>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Grow in timeout={420}>
                <Paper elevation={0} sx={glassCardSx}>
                  <Stack spacing={{ xs: 1.5, sm: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Resumen de ventas del día
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          color="text.secondary"
                          variant="subtitle2"
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          Ventas del día
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: "info.main",
                            fontSize: { xs: "1.5rem", sm: "2.125rem" },
                          }}
                        >
                          {Number(kpis.totalSales ?? 0).toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >{`${kpis.salesCount} transacciones`}</Typography>
                      </Box>

                      <Box>
                        <Typography
                          color="text.secondary"
                          variant="subtitle2"
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          Productos vendidos
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: "primary.main",
                            fontSize: { xs: "1.5rem", sm: "2.125rem" },
                          }}
                        >
                          {kpis.totalItems}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          Total de unidades
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </Grow>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Grow in timeout={620}>
                <Paper elevation={0} sx={glassCardSx}>
                  <Stack spacing={{ xs: 1.5, sm: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Resumen de rentabilidad
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          color="text.secondary"
                          variant="subtitle2"
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          Ganancia neta
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: isProfitPositive ? "success.main" : "error.main",
                            fontSize: { xs: "1.5rem", sm: "2.125rem" },
                          }}
                        >
                          {Number(kpis.totalProfit ?? 0).toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {`Costo total: ${Number(kpis.totalCost ?? 0).toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}`}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          color="text.secondary"
                          variant="subtitle2"
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          Margen neto
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: isNetMarginPositive ? "success.main" : "error.main",
                            fontSize: { xs: "1.5rem", sm: "2.125rem" },
                          }}
                        >
                          {`${kpis.netMarginPercent}%`}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          Utilidad / ventas del día
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </Grow>
            </Grid>
          </Grid>

          <Fade in timeout={780}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Valor del negocio
              </Typography>
              <Typography color="text.secondary">
                Costo acumulado de lotes y valorización del inventario a precio de venta.
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Grow in timeout={860}>
                <Paper elevation={0} sx={glassCardSx}>
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Resumen financiero del negocio
                      </Typography>
                      <Chip
                        size="small"
                        color={isPotentialPositive ? "success" : "error"}
                        label={
                          isPotentialPositive
                            ? "Utilidad potencial positiva"
                            : "Utilidad potencial negativa"
                        }
                      />
                    </Stack>

                    <Divider />

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography color="text.secondary" variant="subtitle2">
                          Costo total neto
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {Number(kpis.totalBusinessNetCost ?? 0).toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          Suma de todos los lotes
                        </Typography>
                      </Box>

                      <Box>
                        <Typography color="text.secondary" variant="subtitle2">
                          Valor del negocio
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {Number(kpis.totalBusinessSaleValue ?? 0).toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          Inventario a precio de venta
                        </Typography>
                      </Box>

                      <Box>
                        <Typography color="text.secondary" variant="subtitle2">
                          Utilidad potencial
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 800,
                            color: isPotentialPositive ? "success.main" : "error.main",
                          }}
                        >
                          {Number(potentialInventoryProfit).toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          Valor del negocio - costo total neto
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </Grow>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Fade in timeout={820}>
                <Box>
                  <SalesTrendChart glassCardSx={glassCardSx} />
                </Box>
              </Fade>
            </Grid>

            <Grid size={{ xs: 12, lg: 8 }}>
              <Fade in timeout={920}>
                <Paper
                  elevation={0}
                  sx={{
                    ...glassCardSx,
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: { xs: 400, sm: 450, lg: "none" },
                  }}
                >
                  <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ flexShrink: 0 }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Ventas recientes
                      </Typography>
                      <Chip label="Hoy" size="small" color="primary" variant="outlined" />
                    </Stack>
                    <Divider />
                    {isLoading ? (
                      <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
                        <CircularProgress size={28} />
                      </Stack>
                    ) : (
                      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                        <List disablePadding>
                          {recentSales.length === 0 && (
                            <ListItem sx={{ px: 0 }}>
                              <ListItemText
                                primary="Sin ventas registradas"
                                secondary="Cuando se registren ventas aparecerán aquí"
                              />
                            </ListItem>
                          )}
                          {recentSales.map((sale, index) => (
                            <Box key={sale.id}>
                              <ListItem disablePadding>
                                <ListItemButton
                                  onClick={() => handleOpenSaleDetail(sale)}
                                  sx={{
                                    px: 2,
                                    borderRadius: 1,
                                    "&:hover": { backgroundColor: "action.hover" },
                                  }}
                                >
                                  <ListItemText
                                    primary={sale.customer}
                                    secondary={`${sale.items} items · ${new Date(sale.soldAt).toLocaleString("es-CO")} · Haz click para ver detalle`}
                                  />
                                  <Typography
                                    sx={{ fontWeight: 600 }}
                                  >{`$ ${sale.total}`}</Typography>
                                </ListItemButton>
                              </ListItem>
                              {index < recentSales.length - 1 && <Divider />}
                            </Box>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Fade>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Fade in timeout={1020}>
                <Paper elevation={0} sx={glassCardSx}>
                  <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Meta diaria
                    </Typography>
                    <Typography color="text.secondary">$ 100000</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={kpis.goalProgress}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {`${kpis.goalProgress}% completado`}
                    </Typography>
                  </Stack>
                </Paper>
              </Fade>
            </Grid>
          </Grid>
        </Stack>
      </Container>

      <Dialog open={Boolean(selectedSale)} onClose={handleCloseSaleDetail} fullWidth maxWidth="sm">
        <DialogTitle>Detalle de venta</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {selectedSale
                ? `${new Date(selectedSale.soldAt).toLocaleString("es-CO")} · ${selectedSale.items} items`
                : ""}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedSale
                ? `Venta: $ ${selectedSale.total} · Costo: $ ${selectedSale.totalCost} · Utilidad: $ ${selectedSale.totalProfit}`
                : ""}
            </Typography>
            <Divider />
            <List disablePadding>
              {selectedSale?.soldItems.map((item, index) => (
                <Box key={`${item.barCode}-${index}`}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.quantity} x $ ${item.unitPrice} · Compra: $ ${item.unitCost} · Utilidad: $ ${item.lineProfit} · Código: ${item.barCode}`}
                    />
                    <Typography sx={{ fontWeight: 600 }}>{`$ ${item.lineTotal}`}</Typography>
                  </ListItem>
                  {selectedSale.soldItems.length - 1 > index && <Divider />}
                </Box>
              ))}
            </List>
            {!selectedSale?.soldItems.length && (
              <Typography variant="body2" color="text.secondary">
                Esta venta no tiene ítems disponibles.
              </Typography>
            )}
            <Divider />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontWeight: 600 }}>Total</Typography>
              <Typography sx={{ fontWeight: 700 }}>{`$ ${selectedSale?.total ?? 0}`}</Typography>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
