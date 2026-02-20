"use server";

import connectDB from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import { Types } from "mongoose";

export type CategoryRow = {
  _id: string;
  name: string;
};

const normalizeName = (value: string) => value.trim().replaceAll(/\s+/g, " ").toUpperCase();

export async function getAllCategories() {
  try {
    await connectDB();

    const categories = await Category.find({}).sort({ name: 1 }).lean();

    return {
      success: true,
      data: categories.map((category) => ({
        _id: String(category._id),
        name: String(category.name ?? ""),
      })) as CategoryRow[],
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      error: "Failed to fetch categories",
      message: error instanceof Error ? error.message : "Unknown error",
      data: [] as CategoryRow[],
    };
  }
}

export async function createCategory(name: string) {
  try {
    await connectDB();

    const normalizedName = normalizeName(String(name ?? ""));

    if (!normalizedName) {
      return {
        success: false,
        error: "Missing required fields",
        message: "El nombre es obligatorio.",
      };
    }

    const existingByName = await Category.findOne({ name: normalizedName }).lean();
    if (existingByName) {
      return {
        success: false,
        error: "Duplicated category",
        message: "Ya existe una categoría con ese nombre.",
      };
    }

    const category = await Category.create({
      name: normalizedName,
    });

    return {
      success: true,
      data: {
        _id: String(category._id),
        name: category.name,
      } as CategoryRow,
    };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error: "Failed to create category",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateCategoryById(id: string, payload: { name: string }) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return {
        success: false,
        error: "Invalid category id",
        message: "ID de categoría inválido.",
      };
    }

    const normalizedName = normalizeName(String(payload?.name ?? ""));

    if (!normalizedName) {
      return {
        success: false,
        error: "Missing required fields",
        message: "El nombre es obligatorio.",
      };
    }

    const duplicatedByName = await Category.findOne({
      _id: { $ne: id },
      name: normalizedName,
    }).lean();

    if (duplicatedByName) {
      return {
        success: false,
        error: "Duplicated category",
        message: "Ya existe una categoría con ese nombre.",
      };
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      {
        name: normalizedName,
      },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return {
        success: false,
        error: "Category not found",
        message: "No se encontró la categoría.",
      };
    }

    return {
      success: true,
      data: {
        _id: String(updated._id),
        name: String(updated.name ?? ""),
      } as CategoryRow,
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: "Failed to update category",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteCategoryById(id: string) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return {
        success: false,
        error: "Invalid category id",
        message: "ID de categoría inválido.",
      };
    }

    const deleted = await Category.findByIdAndDelete(id).lean();

    if (!deleted) {
      return {
        success: false,
        error: "Category not found",
        message: "No se encontró la categoría.",
      };
    }

    return {
      success: true,
      data: { _id: String(deleted._id) },
    };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: "Failed to delete category",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
