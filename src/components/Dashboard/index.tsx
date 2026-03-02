"use client";

import { useState } from "react";
import { Box, Container, Fade, Grid, Grow, Stack, Typography } from "@mui/material";
import useDashboard from "./hooks/useDashboard";
import { BusinessFinancialSummaryCard } from "./BusinessFinancialSummaryCard";
import { DailyGoalCard } from "./DailyGoalCard";
import { ProfitabilitySummaryCard } from "./ProfitabilitySummaryCard";
import { RecentSalesCard } from "./RecentSalesCard";
import { SalesDaySummaryCard } from "./SalesDaySummaryCard";
import SalesTrendChart from "./SalesTrendChart";
import bgImage from "@/assets/images/bg.jpg";

const Dashboard = () => {
  const { isLoading, isSavingDailyGoal, recentSales, kpis, saveDailySalesGoal, glassCardSx } =
    useDashboard();
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
                <RecentSalesCard
                  glassCardSx={glassCardSx}
                  isExpanded={expandedCards.recentSales}
                  onToggle={() => toggleCard("recentSales")}
                  isLoading={isLoading}
                  recentSales={recentSales}
                />
              </Fade>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Fade in timeout={1020}>
                <DailyGoalCard
                  key={kpis.dailySalesGoal}
                  glassCardSx={glassCardSx}
                  isExpanded={expandedCards.dailyGoal}
                  onToggle={() => toggleCard("dailyGoal")}
                  dailySalesGoal={kpis.dailySalesGoal}
                  goalProgress={kpis.goalProgress}
                  isSaving={isSavingDailyGoal}
                  onSaveDailyGoal={saveDailySalesGoal}
                />
              </Fade>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

export default Dashboard;
