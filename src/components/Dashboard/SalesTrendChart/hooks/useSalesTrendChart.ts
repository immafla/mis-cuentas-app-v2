import { useEffect, useMemo, useState } from "react";

import {
  DashboardSalesTrendFilters,
  DashboardTrendMetric,
  DashboardTrendPoint,
  getDashboardSalesTrend,
} from "@/services/sales.service";

export type TrendRangeOption = {
  label: string;
  value: number | "custom";
};

const trendRangeOptions: TrendRangeOption[] = [
  { label: "Últimos 7 días", value: 7 },
  { label: "Últimos 15 días", value: 15 },
  { label: "Últimos 30 días", value: 30 },
  { label: "Últimos 90 días", value: 90 },
  { label: "Personalizado", value: "custom" },
];

const formatDateInput = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

const metricLabelByValue: Record<DashboardTrendMetric, string> = {
  grossSales: "Total vendido por día",
  netProfit: "Valor neto ganado por día",
};

const useSalesTrendChart = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [metric, setMetric] = useState<DashboardTrendMetric>("grossSales");
  const [rangeValue, setRangeValue] = useState<number | "custom">(30);
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    return formatDateInput(start);
  });
  const [endDate, setEndDate] = useState(() => formatDateInput(new Date()));
  const [points, setPoints] = useState<DashboardTrendPoint[]>([]);

  const customRangeError = useMemo(() => {
    if (rangeValue !== "custom") {
      return "";
    }

    if (!startDate || !endDate) {
      return "Selecciona ambas fechas.";
    }

    if (startDate > endDate) {
      return "La fecha inicial no puede ser mayor que la fecha final.";
    }

    return "";
  }, [endDate, rangeValue, startDate]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        if (rangeValue === "custom" && customRangeError) {
          if (active) {
            setPoints([]);
            setIsLoading(false);
          }
          return;
        }

        setIsLoading(true);

        const filters: DashboardSalesTrendFilters =
          rangeValue === "custom"
            ? {
                startDate,
                endDate,
              }
            : {
                rangeDays: rangeValue,
              };

        const { success, data } = await getDashboardSalesTrend(filters);

        if (!active) {
          return;
        }

        if (success) {
          setPoints(data?.points ?? []);
        }
      } catch (error) {
        console.error("Error loading dashboard sales trend", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [rangeValue, startDate, endDate, customRangeError]);

  const chartValues = useMemo(
    () => points.map((point) => (metric === "grossSales" ? point.grossSales : point.netProfit)),
    [metric, points],
  );

  const maxValue = useMemo(() => {
    const candidate = Math.max(...chartValues, 0);
    return candidate > 0 ? candidate : 1;
  }, [chartValues]);

  return {
    isLoading,
    metric,
    rangeValue,
    startDate,
    endDate,
    isCustomRange: rangeValue === "custom",
    customRangeError,
    points,
    chartValues,
    maxValue,
    metricLabel: metricLabelByValue[metric],
    trendRangeOptions,
    setMetric,
    setRangeValue,
    setStartDate,
    setEndDate,
  };
};

export default useSalesTrendChart;
