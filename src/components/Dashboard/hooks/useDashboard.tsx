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
      position: "relative",
      overflow: "hidden",
      isolation: "isolate",
      "&::before": {
        content: '""',
        position: "absolute",
        inset: "-40%",
        background:
          "linear-gradient(115deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.26) 50%, rgba(255,255,255,0) 65%)",
        transform: "translateX(-65%) rotate(8deg)",
        animation: "glassShimmer 9s ease-in-out infinite",
        pointerEvents: "none",
        zIndex: 0,
      },
      "& > *": {
        position: "relative",
        zIndex: 1,
      },
      "@keyframes glassShimmer": {
        "0%": {
          transform: "translateX(-70%) rotate(8deg)",
          opacity: 0.15,
        },
        "50%": {
          transform: "translateX(62%) rotate(8deg)",
          opacity: 0.35,
        },
        "100%": {
          transform: "translateX(135%) rotate(8deg)",
          opacity: 0.1,
        },
      },
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
