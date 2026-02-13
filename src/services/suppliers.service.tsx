"use server";

import connectDB from "@/lib/mongodb";
import Supplier from "@/lib/models/Supplier";
import { Types } from "mongoose";

export type SupplierRow = {
  _id: string;
  name: string;
  nit: string;
};

const normalizeName = (value: string) => value.trim().replaceAll(/\s+/g, " ").toUpperCase();
const normalizeNit = (value: string) => value.trim();

export async function getAllSuppliers() {
  try {
    await connectDB();

    const suppliers = await Supplier.find({}).sort({ name: 1 }).lean();

    return {
      success: true,
      data: suppliers.map((supplier) => ({
        _id: String(supplier._id),
        name: String(supplier.name ?? ""),
        nit: String(supplier.nit ?? ""),
      })) as SupplierRow[],
    };
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return {
      success: false,
      error: "Failed to fetch suppliers",
      message: error instanceof Error ? error.message : "Unknown error",
      data: [] as SupplierRow[],
    };
  }
}

export async function createSupplier(name: string, nit: string) {
  try {
    await connectDB();

    const normalizedName = normalizeName(String(name ?? ""));
    const normalizedNit = normalizeNit(String(nit ?? ""));

    if (!normalizedName || !normalizedNit) {
      return {
        success: false,
        error: "Missing required fields",
        message: "Nombre y NIT son obligatorios.",
      };
    }

    const existingByName = await Supplier.findOne({ name: normalizedName }).lean();
    if (existingByName) {
      return {
        success: false,
        error: "Duplicated supplier",
        message: "Ya existe un proveedor con ese nombre.",
      };
    }

    const existingByNit = await Supplier.findOne({ nit: normalizedNit }).lean();
    if (existingByNit) {
      return {
        success: false,
        error: "Duplicated nit",
        message: "Ya existe un proveedor con ese NIT.",
      };
    }

    const supplier = await Supplier.create({
      name: normalizedName,
      nit: normalizedNit,
    });

    return {
      success: true,
      data: {
        _id: String(supplier._id),
        name: supplier.name,
        nit: supplier.nit,
      } as SupplierRow,
    };
  } catch (error) {
    console.error("Error creating supplier:", error);
    return {
      success: false,
      error: "Failed to create supplier",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateSupplierById(id: string, payload: { name: string; nit: string }) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return {
        success: false,
        error: "Invalid supplier id",
        message: "ID de proveedor inválido.",
      };
    }

    const normalizedName = normalizeName(String(payload?.name ?? ""));
    const normalizedNit = normalizeNit(String(payload?.nit ?? ""));

    if (!normalizedName || !normalizedNit) {
      return {
        success: false,
        error: "Missing required fields",
        message: "Nombre y NIT son obligatorios.",
      };
    }

    const duplicatedByName = await Supplier.findOne({
      _id: { $ne: id },
      name: normalizedName,
    }).lean();

    if (duplicatedByName) {
      return {
        success: false,
        error: "Duplicated supplier",
        message: "Ya existe un proveedor con ese nombre.",
      };
    }

    const duplicatedByNit = await Supplier.findOne({
      _id: { $ne: id },
      nit: normalizedNit,
    }).lean();

    if (duplicatedByNit) {
      return {
        success: false,
        error: "Duplicated nit",
        message: "Ya existe un proveedor con ese NIT.",
      };
    }

    const updated = await Supplier.findByIdAndUpdate(
      id,
      {
        name: normalizedName,
        nit: normalizedNit,
      },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return {
        success: false,
        error: "Supplier not found",
        message: "No se encontró el proveedor.",
      };
    }

    return {
      success: true,
      data: {
        _id: String(updated._id),
        name: String(updated.name ?? ""),
        nit: String(updated.nit ?? ""),
      } as SupplierRow,
    };
  } catch (error) {
    console.error("Error updating supplier:", error);
    return {
      success: false,
      error: "Failed to update supplier",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteSupplierById(id: string) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return {
        success: false,
        error: "Invalid supplier id",
        message: "ID de proveedor inválido.",
      };
    }

    const deleted = await Supplier.findByIdAndDelete(id).lean();

    if (!deleted) {
      return {
        success: false,
        error: "Supplier not found",
        message: "No se encontró el proveedor.",
      };
    }

    return {
      success: true,
      data: { _id: String(deleted._id) },
    };
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return {
      success: false,
      error: "Failed to delete supplier",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
