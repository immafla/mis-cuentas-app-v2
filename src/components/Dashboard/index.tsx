"use client";

import { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
  Container,
  Divider,
  Grid,
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

const Dashboard = () => {
  const { isLoading, recentSales, kpis, glassCardSx } = useDashboard();
  const [selectedSale, setSelectedSale] = useState<DashboardSale | null>(null);

  const handleOpenSaleDetail = (sale: DashboardSale) => {
    setSelectedSale(sale);
  };

  const handleCloseSaleDetail = () => {
    setSelectedSale(null);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundBlendMode: "screen",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Información de ventas
            </Typography>
            <Typography color="text.secondary">Resumen rápido del desempeño del día.</Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper elevation={0} sx={glassCardSx}>
                <Stack spacing={1}>
                  <Typography color="text.secondary" variant="subtitle2">
                    Ventas del día
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {`$ ${kpis.totalSales}`}
                  </Typography>
                  <Typography color="text.secondary">
                    {`${kpis.salesCount} transacciones`}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper elevation={0} sx={glassCardSx}>
                <Stack spacing={1}>
                  <Typography color="text.secondary" variant="subtitle2">
                    Productos vendidos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {kpis.totalItems}
                  </Typography>
                  <Typography color="text.secondary">Total de unidades</Typography>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper elevation={0} sx={glassCardSx}>
                <Stack spacing={1}>
                  <Typography color="text.secondary" variant="subtitle2">
                    Ganancia neta
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {`$ ${kpis.totalProfit}`}
                  </Typography>
                  <Typography color="text.secondary">{`Costo total: $ ${kpis.totalCost}`}</Typography>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper elevation={0} sx={glassCardSx}>
                <Stack spacing={1}>
                  <Typography color="text.secondary" variant="subtitle2">
                    Margen neto
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {`${kpis.netMarginPercent}%`}
                  </Typography>
                  <Typography color="text.secondary">Utilidad / ventas del día</Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper elevation={0} sx={glassCardSx}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
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
                              <Typography sx={{ fontWeight: 600 }}>{`$ ${sale.total}`}</Typography>
                            </ListItemButton>
                          </ListItem>
                          {index < recentSales.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </List>
                  )}
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
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
