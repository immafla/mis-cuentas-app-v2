import { useEffect, useMemo, useState } from "react";

import { getDashboardSalesData } from "@/services/sales.service";
import { DashboardKpis, DashboardSale } from "../interfaces";

const useDashboard = () => {
  const LIMIT_SHOW_SALES = 8;
  const [isLoading, setIsLoading] = useState(true);
  const [recentSales, setRecentSales] = useState<DashboardSale[]>([]);
  const [kpis, setKpis] = useState<DashboardKpis>({
    totalSales: 0,
    totalCost: 0,
    totalProfit: 0,
    netMarginPercent: 0,
    totalItems: 0,
    avgTicket: 0,
    salesCount: 0,
    goalProgress: 0,
  });

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { success, data } = await getDashboardSalesData(LIMIT_SHOW_SALES);

        if (!active) {
          return;
        }

        if (success && data) {
          setRecentSales(data.recentSales);
          setKpis(data.kpis);
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

  return {
    isLoading,
    recentSales,
    kpis,
    glassCardSx,
  };
};

export default useDashboard;
