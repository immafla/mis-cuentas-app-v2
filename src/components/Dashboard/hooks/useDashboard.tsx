import { useEffect, useMemo, useState } from "react";

import { getDashboardSalesData } from "@/services/sales.service";
import {
  getCurrentUserSettings,
  updateCurrentUserDailySalesGoal,
} from "@/services/userSettings.service";
import { DashboardKpis, DashboardSale } from "../interfaces";

const DEFAULT_DAILY_SALES_GOAL = 100000;

const useDashboard = () => {
  const LIMIT_SHOW_SALES = 8;
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDailyGoal, setIsSavingDailyGoal] = useState(false);
  const [recentSales, setRecentSales] = useState<DashboardSale[]>([]);
  const [kpis, setKpis] = useState<DashboardKpis>({
    totalSales: 0,
    totalCost: 0,
    totalProfit: 0,
    netMarginPercent: 0,
    totalItems: 0,
    avgTicket: 0,
    salesCount: 0,
    dailySalesGoal: DEFAULT_DAILY_SALES_GOAL,
    goalProgress: 0,
    totalBusinessNetCost: 0,
    totalBusinessSaleValue: 0,
  });

  const loadDashboard = async (dailySalesGoalTarget?: number) => {
    const normalizedTarget = Math.max(
      0,
      Math.floor(Number(dailySalesGoalTarget ?? kpis.dailySalesGoal ?? DEFAULT_DAILY_SALES_GOAL)),
    );

    const { success, data } = await getDashboardSalesData(LIMIT_SHOW_SALES, normalizedTarget);

    if (success && data) {
      setRecentSales(data.recentSales);
      setKpis({
        ...data.kpis,
        dailySalesGoal: normalizedTarget,
      });
    }
  };

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { success: settingsSuccess, data: settingsData } = await getCurrentUserSettings();
        const dailySalesGoalTarget = settingsSuccess
          ? Math.max(
              0,
              Math.floor(Number(settingsData?.dailySalesGoal ?? DEFAULT_DAILY_SALES_GOAL)),
            )
          : DEFAULT_DAILY_SALES_GOAL;

        const { success, data } = await getDashboardSalesData(
          LIMIT_SHOW_SALES,
          dailySalesGoalTarget,
        );

        if (!active) {
          return;
        }

        if (success && data) {
          setRecentSales(data.recentSales);
          setKpis({
            ...data.kpis,
            dailySalesGoal: dailySalesGoalTarget,
          });
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

  const saveDailySalesGoal = async (nextDailySalesGoal: number) => {
    const normalizedGoal = Math.max(0, Math.floor(Number(nextDailySalesGoal) || 0));

    try {
      setIsSavingDailyGoal(true);
      const result = await updateCurrentUserDailySalesGoal(normalizedGoal);

      if (!result.success) {
        return {
          success: false,
          message: result.message || "No se pudo guardar la meta diaria.",
        };
      }

      await loadDashboard(result.data?.dailySalesGoal ?? normalizedGoal);

      return {
        success: true,
        message: result.message || "Meta diaria actualizada.",
      };
    } catch (error) {
      console.error("Error saving daily sales goal", error);
      return {
        success: false,
        message: "No se pudo guardar la meta diaria.",
      };
    } finally {
      setIsSavingDailyGoal(false);
    }
  };

  const glassCardSx = useMemo(
    () => ({
      p: 3,
      borderRadius: 2,
      border: "1px solid rgba(255,255,255,0.45)",
      backgroundColor: "rgba(255, 255, 255, 0.16)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      cursor: "pointer",
      transition: "box-shadow .2s ease, background-color .2s ease, transform .2s ease",
      position: "relative",
      overflow: "hidden",
      isolation: "isolate",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.22)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.14)",
        transform: "translateY(-1px)",
      },
      "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
        opacity: 0,
        pointerEvents: "none",
        zIndex: 0,
      },
      "&:hover::after": {
        animation: "fadeIn .22s ease-out forwards",
      },
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
      "@keyframes fadeIn": {
        "0%": {
          opacity: 0,
        },
        "100%": {
          opacity: 1,
        },
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
    isSavingDailyGoal,
    recentSales,
    kpis,
    saveDailySalesGoal,
    glassCardSx,
  };
};

export default useDashboard;
