"use server";

import connectDB from "@/lib/mongodb";
import Lot from "@/lib/models/Lot";
import Product from "@/lib/models/Product";
import Supplier from "@/lib/models/Supplier";
import { Types } from "mongoose";

export type LotRow = {
  _id: string;
  receivedAt: string;
  supplierName: string;
  supplierNit: string;
  productsSummary: string;
  productsCount: number;
  totalQuantity: number;
  totalCost: number;
};

export type CreateLotInput = {
  receivedAt: string;
  supplierId: string;
  items: Array<{
    productId: string;
    quantity: number;
    purchasePrice: number;
  }>;
};

type LotPopulateShape = {
  _id: unknown;
  receivedAt: Date;
  supplier?: {
    name?: string;
    nit?: string;
  };
  items?: Array<{
    product?: {
      name?: string;
      bar_code?: string;
    };
    quantity?: number;
    purchasePrice?: number;
    totalCost?: number;
  }>;
  totalQuantity?: number;
  totalCost?: number;
};

const mapLot = (lot: LotPopulateShape): LotRow => ({
  _id: String(lot._id),
  receivedAt: new Date(lot.receivedAt).toISOString(),
  supplierName: String(lot.supplier?.name ?? ""),
  supplierNit: String(lot.supplier?.nit ?? ""),
  productsSummary: Array.isArray(lot.items)
    ? lot.items
        .map((item) => `${String(item.product?.name ?? "")} x${Number(item.quantity ?? 0)}`)
        .join(" · ")
    : "",
  productsCount: Array.isArray(lot.items) ? lot.items.length : 0,
  totalQuantity: Number(
    lot.totalQuantity ??
      (Array.isArray(lot.items)
        ? lot.items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0)
        : 0),
  ),
  totalCost: Number(lot.totalCost ?? 0),
});

export async function getAllLots(limit = 200) {
  try {
    await connectDB();

    const lots = await Lot.find({})
      .sort({ receivedAt: -1 })
      .limit(limit)
      .populate("supplier", "name nit")
      .populate("items.product", "name bar_code")
      .lean();

    return {
      success: true,
      data: lots.map((lot) => mapLot(lot as LotPopulateShape)),
    };
  } catch (error) {
    console.error("Error fetching lots:", error);
    return {
      success: false,
      error: "Failed to fetch lots",
      message: error instanceof Error ? error.message : "Unknown error",
      data: [] as LotRow[],
    };
  }
}

export async function createLot(input: CreateLotInput) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(input.supplierId)) {
      return {
        success: false,
        error: "Invalid supplier",
        message: "Proveedor inválido.",
      };
    }

    const receivedAt = new Date(input.receivedAt);
    const rawItems = Array.isArray(input.items) ? input.items : [];

    if (!Number.isFinite(receivedAt.getTime())) {
      return {
        success: false,
        error: "Invalid date",
        message: "La fecha del lote es inválida.",
      };
    }

    if (rawItems.length === 0) {
      return {
        success: false,
        error: "Missing items",
        message: "Debes agregar al menos un producto al lote.",
      };
    }

    const normalizedItems = rawItems.map((item) => ({
      productId: String(item.productId ?? ""),
      quantity: Math.floor(Number(item.quantity ?? 0)),
      purchasePrice: Number(item.purchasePrice ?? 0),
    }));

    const hasInvalidItem = normalizedItems.some(
      (item) =>
        !Types.ObjectId.isValid(item.productId) ||
        item.quantity <= 0 ||
        !Number.isFinite(item.purchasePrice) ||
        item.purchasePrice < 0,
    );

    if (hasInvalidItem) {
      return {
        success: false,
        error: "Invalid items",
        message: "Verifica producto, cantidad y precio de compra en cada fila.",
      };
    }

    const supplier = await Supplier.findById(input.supplierId).lean();

    if (!supplier) {
      return {
        success: false,
        error: "Supplier not found",
        message: "No se encontró el proveedor.",
      };
    }

    const productIds = normalizedItems.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } })
      .select({ _id: 1 })
      .lean();

    if (products.length !== new Set(productIds).size) {
      return {
        success: false,
        error: "Product not found",
        message: "Uno o más productos no existen.",
      };
    }

    const lotItems = normalizedItems.map((item) => ({
      product: new Types.ObjectId(item.productId),
      quantity: item.quantity,
      purchasePrice: item.purchasePrice,
      totalCost: item.quantity * item.purchasePrice,
    }));

    const totalQuantity = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalCost = normalizedItems.reduce(
      (sum, item) => sum + item.quantity * item.purchasePrice,
      0,
    );

    const stockUpdatesByProduct = normalizedItems.reduce((acc, item) => {
      const current = acc.get(item.productId) ?? { quantity: 0 };
      acc.set(item.productId, {
        quantity: current.quantity + item.quantity,
      });
      return acc;
    }, new Map<string, { quantity: number }>());

    const productBulkOps = Array.from(stockUpdatesByProduct.entries()).map(([productId, data]) => ({
      updateOne: {
        filter: { _id: productId },
        update: {
          $inc: { amount: data.quantity },
        },
      },
    }));

    const createdLot = new Lot({
      receivedAt,
      supplier: new Types.ObjectId(input.supplierId),
      items: lotItems,
      totalQuantity,
      totalCost,
    });

    await createdLot.save();

    await Product.bulkWrite(productBulkOps, { ordered: true });

    const populatedLot = await Lot.findById(createdLot._id)
      .populate("supplier", "name nit")
      .populate("items.product", "name bar_code")
      .lean();

    return {
      success: true,
      data: populatedLot ? mapLot(populatedLot as LotPopulateShape) : null,
      message: "Lote registrado correctamente",
    };
  } catch (error) {
    console.error("Error creating lot:", error);
    return {
      success: false,
      error: "Failed to create lot",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
