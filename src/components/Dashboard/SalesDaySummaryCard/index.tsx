import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Box, Collapse, IconButton, Paper, Stack, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import React from "react";

type SalesDaySummaryCardProps = {
  glassCardSx: SxProps<Theme>;
  isExpanded: boolean;
  onToggle: () => void;
  totalSales: number;
  salesCount: number;
  totalItems: number;
};

export const SalesDaySummaryCard = React.forwardRef<HTMLDivElement, SalesDaySummaryCardProps>(
  ({ glassCardSx, isExpanded, onToggle, totalSales, salesCount, totalItems }, ref) => {
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
              Resumen de ventas del día
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
                  Ventas del día
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "success.main",
                    fontSize: { xs: "1.5rem", sm: "2.125rem" },
                  }}
                >
                  {Number(totalSales ?? 0).toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </Typography>
                <Typography
                  color="success.main"
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  {`${salesCount} transacciones`}
                </Typography>
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
                    color: "success.main",
                    fontSize: { xs: "1.5rem", sm: "2.125rem" },
                  }}
                >
                  {totalItems}
                </Typography>
                <Typography
                  color="success.main"
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  Total de unidades
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Stack>
      </Paper>
    );
  },
);

SalesDaySummaryCard.displayName = "SalesDaySummaryCard";
