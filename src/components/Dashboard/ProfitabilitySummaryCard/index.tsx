import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Box, Collapse, IconButton, Paper, Stack, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import React from "react";

type ProfitabilitySummaryCardProps = {
  glassCardSx: SxProps<Theme>;
  isExpanded: boolean;
  onToggle: () => void;
  totalProfit: number;
  totalCost: number;
  netMarginPercent: number;
};

export const ProfitabilitySummaryCard = React.forwardRef<
  HTMLDivElement,
  ProfitabilitySummaryCardProps
>(({ glassCardSx, isExpanded, onToggle, totalProfit, totalCost, netMarginPercent }, ref) => {
  const isProfitPositive = Number(totalProfit ?? 0) >= 0;
  const isNetMarginPositive = Number(netMarginPercent ?? 0) >= 0;

  return (
    <Paper ref={ref} elevation={0} sx={glassCardSx} onClick={onToggle}>
      <Stack spacing={isExpanded ? { xs: 1.5, sm: 2 } : 0}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ minHeight: { xs: 38, sm: 42 } }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Resumen de rentabilidad
          </Typography>
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
                {Number(totalProfit ?? 0).toLocaleString("es-CO", {
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
                {`Costo total: ${Number(totalCost ?? 0).toLocaleString("es-CO", {
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
                {`${netMarginPercent}%`}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                Utilidad / ventas del día
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Stack>
    </Paper>
  );
});

ProfitabilitySummaryCard.displayName = "ProfitabilitySummaryCard";
