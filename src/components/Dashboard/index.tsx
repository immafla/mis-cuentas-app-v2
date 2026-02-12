"use client";

import { useMemo } from "react";
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
} from "@mui/material";

const Dashboard = () => {
  const recentSales = useMemo(
    () => [
      { id: "S-1001", customer: "Cliente mostrador", total: 18500, items: 4 },
      { id: "S-1002", customer: "María R.", total: 7600, items: 2 },
      { id: "S-1003", customer: "Carlos M.", total: 12400, items: 3 },
      { id: "S-1004", customer: "Cliente mostrador", total: 5600, items: 1 },
      { id: "S-1005", customer: "Ana P.", total: 21400, items: 5 },
    ],
    [],
  );

  const kpis = useMemo(() => {
    const totalSales = recentSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalItems = recentSales.reduce((sum, sale) => sum + sale.items, 0);
    const avgTicket = recentSales.length ? Math.round(totalSales / recentSales.length) : 0;

    return {
      totalSales,
      totalItems,
      avgTicket,
      goalProgress: Math.min(Math.round((totalSales / 100000) * 100), 100),
    };
  }, [recentSales]);

  const glassCardSx = useMemo(
    () => ({
      p: 3,
      borderRadius: 2,
      border: "1px solid rgba(255,255,255,0.45)",
      backgroundColor: "rgba(255,255,255,0.7)",
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
                    {`${recentSales.length} transacciones`}
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
                  <List disablePadding>
                    {recentSales.map((sale, index) => (
                      <Box key={sale.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText
                            primary={sale.customer}
                            secondary={`#${sale.id} · ${sale.items} items`}
                          />
                          <Typography sx={{ fontWeight: 600 }}>{`$ ${sale.total}`}</Typography>
                        </ListItem>
                        {index < recentSales.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
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
