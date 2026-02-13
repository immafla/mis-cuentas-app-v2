"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { getDashboardSalesData } from "@/services/sales.service";

type DashboardSale = {
  id: string;
  customer: string;
  total: number;
  items: number;
  soldAt: string;
};

type DashboardKpis = {
  totalSales: number;
  totalItems: number;
  avgTicket: number;
  salesCount: number;
  goalProgress: number;
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [recentSales, setRecentSales] = useState<DashboardSale[]>([]);
  const [kpis, setKpis] = useState<DashboardKpis>({
    totalSales: 0,
    totalItems: 0,
    avgTicket: 0,
    salesCount: 0,
    goalProgress: 0,
  });

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const result = await getDashboardSalesData(8);

        if (!active) {
          return;
        }

        if (result.success && result.data) {
          setRecentSales(result.data.recentSales);
          setKpis(result.data.kpis);
        }
      } catch (error) {
        console.error("Error loading dashboard sales", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const glassCardSx = useMemo(
    () => ({
      p: 3,
      borderRadius: 2,
      border: "1px solid rgba(255,255,255,0.45)",
      backgroundColor: "rgba(255, 255, 255, 0.16)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    }),
    [],
  );

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
              Dashboard de ventas
            </Typography>
            <Typography color="text.secondary">Resumen rápido del desempeño del día.</Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
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
            <Grid size={{ xs: 12, md: 4 }}>
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
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper elevation={0} sx={glassCardSx}>
                <Stack spacing={1}>
                  <Typography color="text.secondary" variant="subtitle2">
                    Ticket promedio
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {`$ ${kpis.avgTicket}`}
                  </Typography>
                  <Typography color="text.secondary">Promedio por venta</Typography>
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
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary={sale.customer}
                              secondary={`#${sale.id.slice(-6).toUpperCase()} · ${sale.items} items · ${new Date(sale.soldAt).toLocaleString("es-CO")}`}
                            />
                            <Typography sx={{ fontWeight: 600 }}>{`$ ${sale.total}`}</Typography>
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
    </Box>
  );
};

export default Dashboard;
