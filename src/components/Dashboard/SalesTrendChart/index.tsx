"use client";

import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { DashboardTrendMetric } from "@/services/sales.service";
import useSalesTrendChart from "./hooks/useSalesTrendChart";

type SalesTrendChartProps = {
  glassCardSx: object;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

const SalesTrendChart = ({ glassCardSx }: SalesTrendChartProps) => {
  const {
    isLoading,
    metric,
    rangeValue,
    startDate,
    endDate,
    isCustomRange,
    customRangeError,
    points,
    chartValues,
    maxValue,
    metricLabel,
    trendRangeOptions,
    setMetric,
    setRangeValue,
    setStartDate,
    setEndDate,
  } = useSalesTrendChart();

  const width = 1000;
  const height = 320;
  const padding = { top: 20, right: 24, bottom: 48, left: 72 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const pointCoordinates = points.map((point, index) => {
    const value = chartValues[index] ?? 0;
    const x =
      points.length <= 1 ? padding.left : padding.left + (index / (points.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - (Math.max(value, 0) / maxValue) * chartHeight;

    return {
      key: point.date,
      x,
      y,
      value,
      label: point.label,
    };
  });

  const linePath = pointCoordinates
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, index) => (maxValue * index) / yTicks);
  const xLabelStep = Math.max(Math.ceil(points.length / 8), 1);

  return (
    <Paper elevation={0} sx={{ ...glassCardSx, width: "100%" }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Ventas por día
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Eje Y: valores en pesos · Eje X: días
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <FormControl size="small" sx={{ minWidth: 240 }}>
              <InputLabel id="sales-trend-metric-label">Métrica</InputLabel>
              <Select
                labelId="sales-trend-metric-label"
                value={metric}
                label="Métrica"
                onChange={(event) => setMetric(event.target.value as DashboardTrendMetric)}
              >
                <MenuItem value="grossSales">Total vendido por día</MenuItem>
                <MenuItem value="netProfit">Valor neto ganado por día</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 190 }}>
              <InputLabel id="sales-trend-range-label">Rango</InputLabel>
              <Select
                labelId="sales-trend-range-label"
                value={rangeValue}
                label="Rango"
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setRangeValue(nextValue === "custom" ? "custom" : Number(nextValue));
                }}
              >
                {trendRangeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {isCustomRange && (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  label="Desde"
                  type="date"
                  size="small"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  error={Boolean(customRangeError)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Hasta"
                  type="date"
                  size="small"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  error={Boolean(customRangeError)}
                  helperText={customRangeError || " "}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            )}
          </Stack>
        </Stack>

        {isCustomRange && customRangeError && (
          <Typography variant="body2" color="error">
            {customRangeError}
          </Typography>
        )}

        {isLoading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 280 }}>
            <CircularProgress size={30} />
          </Stack>
        ) : points.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 280 }}>
            <Typography color="text.secondary">No hay datos en el rango seleccionado.</Typography>
          </Stack>
        ) : (
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Box sx={{ minWidth: 760 }}>
              <svg
                width="100%"
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label={metricLabel}
              >
                <line
                  x1={padding.left}
                  y1={padding.top + chartHeight}
                  x2={padding.left + chartWidth}
                  y2={padding.top + chartHeight}
                  stroke="currentColor"
                  opacity={0.4}
                />
                <line
                  x1={padding.left}
                  y1={padding.top}
                  x2={padding.left}
                  y2={padding.top + chartHeight}
                  stroke="currentColor"
                  opacity={0.4}
                />

                {yTickValues.map((tickValue) => {
                  const y = padding.top + chartHeight - (tickValue / maxValue) * chartHeight;

                  return (
                    <g key={tickValue}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={padding.left + chartWidth}
                        y2={y}
                        stroke="currentColor"
                        opacity={0.12}
                      />
                      <text
                        x={padding.left - 10}
                        y={y + 4}
                        textAnchor="end"
                        fill="currentColor"
                        opacity={0.7}
                        style={{ fontSize: 11 }}
                      >
                        {formatCurrency(tickValue)}
                      </text>
                    </g>
                  );
                })}

                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    opacity={0.85}
                  />
                )}

                {pointCoordinates.map((point, index) => (
                  <g key={point.key}>
                    <circle cx={point.x} cy={point.y} r={3.5} fill="currentColor" opacity={0.9}>
                      <title>{`${point.label}: ${formatCurrency(point.value)}`}</title>
                    </circle>
                    {(index % xLabelStep === 0 || index === pointCoordinates.length - 1) && (
                      <text
                        x={point.x}
                        y={padding.top + chartHeight + 20}
                        textAnchor="middle"
                        fill="currentColor"
                        opacity={0.7}
                        style={{ fontSize: 11 }}
                      >
                        {point.label}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </Box>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default SalesTrendChart;
