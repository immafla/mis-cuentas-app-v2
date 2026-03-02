"use client";

import { useState } from "react";
import {
  Box,
  Collapse,
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
  IconButton,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import useDashboard from "./hooks/useDashboard";
import { DashboardSale } from "./interfaces";
import { BusinessFinancialSummaryCard } from "./BusinessFinancialSummaryCard";
import { ProfitabilitySummaryCard } from "./ProfitabilitySummaryCard";
import { SalesDaySummaryCard } from "./SalesDaySummaryCard";
import SalesTrendChart from "./SalesTrendChart";
import bgImage from "@/assets/images/bg.jpg";

const Dashboard = () => {
  const { isLoading, recentSales, kpis, glassCardSx } = useDashboard();
  const [selectedSale, setSelectedSale] = useState<DashboardSale | null>(null);
  const [expandedCards, setExpandedCards] = useState({
    salesSummary: false,
    profitabilitySummary: false,
    businessSummary: false,
    recentSales: false,
    dailyGoal: false,
  });
  const potentialInventoryProfit =
    Number(kpis.totalBusinessSaleValue ?? 0) - Number(kpis.totalBusinessNetCost ?? 0);
  const isPotentialPositive = potentialInventoryProfit >= 0;

  const handleOpenSaleDetail = (sale: DashboardSale) => {
    setSelectedSale(sale);
  };

  const handleCloseSaleDetail = () => {
    setSelectedSale(null);
  };

  const toggleCard = (key: keyof typeof expandedCards) => {
    setExpandedCards((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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

          <Grid container spacing={3} alignItems="flex-start">
            <Grid size={{ xs: 12, lg: 6 }}>
              <Grow in timeout={420}>
                <SalesDaySummaryCard
                  glassCardSx={glassCardSx}
                  isExpanded={expandedCards.salesSummary}
                  onToggle={() => toggleCard("salesSummary")}
                  totalSales={kpis.totalSales}
                  salesCount={kpis.salesCount}
                  totalItems={kpis.totalItems}
                />
              </Grow>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Grow in timeout={620}>
                <ProfitabilitySummaryCard
                  glassCardSx={glassCardSx}
                  isExpanded={expandedCards.profitabilitySummary}
                  onToggle={() => toggleCard("profitabilitySummary")}
                  totalProfit={kpis.totalProfit}
                  totalCost={kpis.totalCost}
                  netMarginPercent={kpis.netMarginPercent}
                />
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
                <BusinessFinancialSummaryCard
                  glassCardSx={glassCardSx}
                  isExpanded={expandedCards.businessSummary}
                  onToggle={() => toggleCard("businessSummary")}
                  isPotentialPositive={isPotentialPositive}
                  totalBusinessNetCost={kpis.totalBusinessNetCost}
                  totalBusinessSaleValue={kpis.totalBusinessSaleValue}
                  potentialInventoryProfit={potentialInventoryProfit}
                />
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
                  onClick={() => toggleCard("recentSales")}
                  elevation={0}
                  sx={{
                    ...glassCardSx,
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: { xs: 400, sm: 450, lg: "none" },
                  }}
                >
                  <Stack spacing={expandedCards.recentSales ? 2 : 0} sx={{ flex: 1, minHeight: 0 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ flexShrink: 0, minHeight: { xs: 38, sm: 42 } }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Ventas recientes
                        </Typography>
                        <Chip label="Hoy" size="small" color="primary" variant="outlined" />
                      </Stack>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleCard("recentSales");
                        }}
                        sx={{
                          transform: expandedCards.recentSales ? "rotate(0deg)" : "rotate(-90deg)",
                          transition: "transform .2s ease",
                        }}
                      >
                        <ExpandMoreRoundedIcon />
                      </IconButton>
                    </Stack>
                    <Collapse
                      in={expandedCards.recentSales}
                      unmountOnExit
                      sx={{ flex: 1, minHeight: 0 }}
                    >
                      <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
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
                                      data-no-toggle="true"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleOpenSaleDetail(sale);
                                      }}
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
                    </Collapse>
                  </Stack>
                </Paper>
              </Fade>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Fade in timeout={1020}>
                <Paper elevation={0} sx={glassCardSx} onClick={() => toggleCard("dailyGoal")}>
                  <Stack spacing={expandedCards.dailyGoal ? 2 : 0}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ minHeight: { xs: 38, sm: 42 } }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Meta diaria
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleCard("dailyGoal");
                        }}
                        sx={{
                          transform: expandedCards.dailyGoal ? "rotate(0deg)" : "rotate(-90deg)",
                          transition: "transform .2s ease",
                        }}
                      >
                        <ExpandMoreRoundedIcon />
                      </IconButton>
                    </Stack>
                    <Collapse in={expandedCards.dailyGoal} unmountOnExit>
                      <Stack spacing={2}>
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
                    </Collapse>
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
