"use server";

import connectDB from "@/lib/mongodb";
import Brand from "@/lib/models/Brand";
import Product from "@/lib/models/Product";
import { Types } from "mongoose";

const normalizeBrand = (brand: { _id: unknown; name: string }) => ({
  _id: String(brand._id),
  name: brand.name,
});

const normalizeName = (value: string) => value.trim().replaceAll(/\s+/g, " ").toUpperCase();
const escapeRegex = (value: string) => value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

export async function createBrand(name: string) {
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

    const existingByName = await Brand.findOne({ name: normalizedName }).lean();
    if (existingByName) {
      return {
        success: false,
        error: "Duplicated brand",
        message: "Ya existe una marca con ese nombre.",
      };
    }

    const newBrand = new Brand({ name: normalizedName });
    await newBrand.save();

    return {
      success: true,
      message: "Brand created successfully",
      data: normalizeBrand(newBrand.toObject()),
    };
  } catch (error) {
    console.error("Error creating brand:", error);
    return {
      success: false,
      error: "Failed to create brand",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteBrandById(id: string) {
  try {
    await connectDB();

    const brand = await Brand.findById(id).lean();
    if (!brand) {
      return {
        success: false,
        error: "Brand not found",
        message: "No se encontró la marca.",
      };
    }

    const normalizedBrandName = normalizeName(String(brand.name ?? ""));
    const associatedProducts = await Product.countDocuments({
      $or: [
        { brand: id },
        { brand: normalizedBrandName },
        { brand: { $regex: `^${escapeRegex(normalizedBrandName)}$`, $options: "i" } },
      ],
    });

    if (associatedProducts > 0) {
      return {
        success: false,
        error: "Brand has associated products",
        message: `No se puede eliminar. Hay ${associatedProducts} producto(s) asociado(s) a esta marca.`,
      };
    }

    const deletedBrand = await Brand.findByIdAndDelete(id).lean();

    if (!deletedBrand) {
      return {
        success: false,
        error: "Brand not found",
        message: "No brand found with the provided ID",
      };
    }

    return {
      success: true,
      message: "Brand deleted successfully",
      data: normalizeBrand(deletedBrand as { _id: unknown; name: string }),
    };
  } catch (error) {
    console.error("Error deleting brand:", error);
    return {
      success: false,
      error: "Failed to delete brand",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateBrandById(id: string, name: string) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return {
        success: false,
        error: "Invalid brand id",
        message: "Invalid brand id",
      };
    }

    const normalizedName = normalizeName(String(name ?? ""));

    if (!normalizedName) {
      return {
        success: false,
        error: "Missing required fields",
        message: "El nombre es obligatorio.",
      };
    }

    const duplicatedByName = await Brand.findOne({
      _id: { $ne: id },
      name: normalizedName,
    }).lean();

    if (duplicatedByName) {
      return {
        success: false,
        error: "Duplicated brand",
        message: "Ya existe una marca con ese nombre.",
      };
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { name: normalizedName },
      { new: true, runValidators: true },
    ).lean();

    if (!updatedBrand) {
      return {
        success: false,
        error: "Brand not found",
        message: "No brand found with the provided ID",
      };
    }

    return {
      success: true,
      message: "Brand updated successfully",
      data: normalizeBrand(updatedBrand as { _id: unknown; name: string }),
    };
  } catch (error) {
    console.error("Error updating brand:", error);
    return {
      success: false,
      error: "Failed to update brand",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAllBrands() {
  try {
    await connectDB();
    const brands = await Brand.find({}).sort({ name: 1 }).lean();

    return {
      success: true,
      message: "Brands fetched successfully",
      data: brands.map((brand) => normalizeBrand(brand as { _id: unknown; name: string })),
    };
  } catch (error) {
    console.error("Error fetching brands:", error);
    return {
      success: false,
      error: "Failed to fetch brands",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
