"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import UserSettings from "@/lib/models/UserSettings";

const DEFAULT_DAILY_SALES_GOAL = 100000;

const normalizeDailySalesGoal = (value: number) => {
  const parsed = Math.floor(Number(value));

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
};

const getAuthenticatedUserEmail = async () => {
  const session = await getServerSession(authOptions);
  const email = String(session?.user?.email ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    return null;
  }

  return email;
};

export async function getCurrentUserSettings() {
  try {
    await connectDB();

    const userEmail = await getAuthenticatedUserEmail();

    if (!userEmail) {
      return {
        success: false,
        error: "Unauthorized",
        message: "No se pudo identificar el usuario autenticado.",
        data: {
          dailySalesGoal: DEFAULT_DAILY_SALES_GOAL,
        },
      };
    }

    const userSettings = await UserSettings.findOne({ userEmail }).lean();

    return {
      success: true,
      data: {
        dailySalesGoal:
          Number(userSettings?.preferences?.dashboard?.dailySalesGoal) || DEFAULT_DAILY_SALES_GOAL,
      },
    };
  } catch (error) {
    console.error("Error fetching current user settings:", error);
    return {
      success: false,
      error: "Failed to fetch user settings",
      message: error instanceof Error ? error.message : "Unknown error",
      data: {
        dailySalesGoal: DEFAULT_DAILY_SALES_GOAL,
      },
    };
  }
}

export async function updateCurrentUserDailySalesGoal(nextDailySalesGoal: number) {
  try {
    await connectDB();

    const userEmail = await getAuthenticatedUserEmail();

    if (!userEmail) {
      return {
        success: false,
        error: "Unauthorized",
        message: "No se pudo identificar el usuario autenticado.",
      };
    }

    const normalizedGoal = normalizeDailySalesGoal(nextDailySalesGoal);

    if (normalizedGoal === null) {
      return {
        success: false,
        error: "Invalid daily sales goal",
        message: "La meta diaria debe ser un número mayor o igual a 0.",
      };
    }

    const updatedSettings = await UserSettings.findOneAndUpdate(
      { userEmail },
      {
        $set: {
          userEmail,
          "preferences.dashboard.dailySalesGoal": normalizedGoal,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

    return {
      success: true,
      message: "Meta diaria actualizada correctamente.",
      data: {
        dailySalesGoal:
          Number(updatedSettings?.preferences?.dashboard?.dailySalesGoal) || normalizedGoal,
      },
    };
  } catch (error) {
    console.error("Error updating current user daily sales goal:", error);
    return {
      success: false,
      error: "Failed to update daily sales goal",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
