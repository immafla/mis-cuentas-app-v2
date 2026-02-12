"use server";

import connectDB from "@/lib/mongodb";
import Brand from "@/lib/models/Brand";
import { Types } from "mongoose";

export async function createBrand(name: string) {
  try {
    await connectDB();
    const newBrand = new Brand({ name });
    newBrand.name = newBrand.name.toUpperCase();
    await newBrand.save();
    
    return {
      success: true,
      message: "Brand created successfully",
      data: structuredClone(newBrand.toObject()),
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
    console.log({id})
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
      data: structuredClone(deletedBrand),
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
    const normalizedName = name.toUpperCase();
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { name: normalizedName },
      { new: true, runValidators: true }
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
      data: structuredClone(updatedBrand),
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
      data: structuredClone(brands),
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




