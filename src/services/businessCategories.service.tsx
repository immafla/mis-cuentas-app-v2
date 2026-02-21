"use server";

import connectDB from "@/lib/mongodb";
import BussinesCategory from "@/lib/models/BussinesCategory";

export type BusinessCategoryRow = {
  _id: string;
  name: string;
};

export async function getAllBusinessCategories() {
  try {
    await connectDB();

    const businessCategories = await BussinesCategory.find({}).sort({ name: 1 }).lean();

    return {
      success: true,
      data: businessCategories.map((category) => ({
        _id: String(category._id),
        name: String(category.name ?? ""),
      })) as BusinessCategoryRow[],
    };
  } catch (error) {
    console.error("Error fetching business categories:", error);
    return {
      success: false,
      error: "Failed to fetch business categories",
      message: error instanceof Error ? error.message : "Unknown error",
      data: [] as BusinessCategoryRow[],
    };
  }
}
