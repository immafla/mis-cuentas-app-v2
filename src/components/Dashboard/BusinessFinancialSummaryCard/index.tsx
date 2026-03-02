import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Box, Chip, Collapse, Divider, IconButton, Paper, Stack, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import React from "react";

type BusinessFinancialSummaryCardProps = {
  glassCardSx: SxProps<Theme>;
  isExpanded: boolean;
  onToggle: () => void;
  isPotentialPositive: boolean;
  totalBusinessNetCost: number;
  totalBusinessSaleValue: number;
  potentialInventoryProfit: number;
};

export const BusinessFinancialSummaryCard = React.forwardRef<
  HTMLDivElement,
  BusinessFinancialSummaryCardProps
>(
  (
    {
      glassCardSx,
      isExpanded,
      onToggle,
      isPotentialPositive,
      totalBusinessNetCost,
      totalBusinessSaleValue,
      potentialInventoryProfit,
    },
    ref,
  ) => {
    return (
      <Paper ref={ref} elevation={0} sx={glassCardSx} onClick={onToggle}>
        <Stack spacing={isExpanded ? 2 : 0}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1}
            sx={{ minHeight: { xs: 38, sm: 42 } }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
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
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onToggle();
              }}
              sx={{
                transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform .2s ease",
              }}
            >
              <ExpandMoreRoundedIcon />
            </IconButton>
          </Stack>

          <Collapse in={isExpanded} unmountOnExit>
            <Stack spacing={2}>
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
                    {Number(totalBusinessNetCost ?? 0).toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Costo del inventario disponible
                  </Typography>
                </Box>

                <Box>
                  <Typography color="text.secondary" variant="subtitle2">
                    Valor del negocio
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {Number(totalBusinessSaleValue ?? 0).toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Inventario a precio de venta (stock &gt; 0)
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
          </Collapse>
        </Stack>
      </Paper>
    );
  },
);

BusinessFinancialSummaryCard.displayName = "BusinessFinancialSummaryCard";
