"use server";

import connectDB from "@/lib/mongodb";
import Lot from "@/lib/models/Lot";
import Product from "@/lib/models/Product";
import "@/lib/models/Brand"; // registrar schema para populate
import "@/lib/models/Category"; // registrar schema para populate
import Supplier from "@/lib/models/Supplier";
import { Types } from "mongoose";

export type LotItemDetail = {
  name: string;
  quantity: number;
  remainingQuantity: number;
  purchasePrice: number;
  brand_name: string;
  category_name: string;
};

export type LotRow = {
  _id: string;
  receivedAt: string;
  supplierName: string;
  supplierNit: string;
  productsSummary: string;
  productsDetails: LotItemDetail[];
  productsCount: number;
  totalQuantity: number;
  totalCost: number;
  isActive: boolean;
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
      brand?: { name?: string } | null;
      category?: { name?: string } | null;
    };
    quantity?: number;
    remainingQuantity?: number;
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
  productsDetails: Array.isArray(lot.items)
    ? lot.items.map((item) => ({
        name: String(item.product?.name ?? ""),
        quantity: Number(item.quantity ?? 0),
        remainingQuantity: Number(item.remainingQuantity ?? 0),
        purchasePrice: Number(item.purchasePrice ?? 0),
        brand_name: String(item.product?.brand?.name ?? ""),
        category_name: String(item.product?.category?.name ?? ""),
      }))
    : [],
  productsCount: Array.isArray(lot.items) ? lot.items.length : 0,
  totalQuantity: Number(
    lot.totalQuantity ??
      (Array.isArray(lot.items)
        ? lot.items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0)
        : 0),
  ),
  totalCost: Number(lot.totalCost ?? 0),
  isActive: Array.isArray(lot.items)
    ? lot.items.some((item) => Number(item.remainingQuantity ?? 0) > 0)
    : false,
});

export async function getAllLots(limit = 200) {
  try {
    await connectDB();

    const lots = await Lot.find({})
      .sort({ receivedAt: -1 })
      .limit(limit)
      .populate("supplier", "name nit")
      .populate({
        path: "items.product",
        select: "name bar_code brand category",
        populate: [
          { path: "brand", select: "name" },
          { path: "category", select: "name" },
        ],
      })
      .lean();

    return {
      success: true,
      data: (lots as LotPopulateShape[]).map(mapLot),
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
      remainingQuantity: item.quantity,
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
      .populate({
        path: "items.product",
        select: "name bar_code brand category",
        populate: [
          { path: "brand", select: "name" },
          { path: "category", select: "name" },
        ],
      })
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

export type UpdateLotInput = {
  receivedAt: string;
  supplierId: string;
  items: Array<{
    productId: string;
    quantity: number;
    purchasePrice: number;
  }>;
};

export async function updateLotById(id: string, input: UpdateLotInput) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return { success: false, error: "Invalid lot id", message: "El id del lote no es válido." };
    }

    const existingLot = await Lot.findById(id).lean();
    if (!existingLot) {
      return { success: false, error: "Lot not found", message: "No se encontró el lote." };
    }

    const oldItems = Array.isArray(existingLot.items) ? existingLot.items : [];
    const hasRemaining = oldItems.some((item) => Number(item.remainingQuantity ?? 0) > 0);
    if (!hasRemaining) {
      return {
        success: false,
        error: "Lot inactive",
        message: "No se puede editar un lote inactivo (sin productos restantes).",
      };
    }

    if (!Types.ObjectId.isValid(input.supplierId)) {
      return { success: false, error: "Invalid supplier", message: "Proveedor inválido." };
    }

    const receivedAt = new Date(input.receivedAt);
    if (!Number.isFinite(receivedAt.getTime())) {
      return { success: false, error: "Invalid date", message: "La fecha del lote es inválida." };
    }

    const rawItems = Array.isArray(input.items) ? input.items : [];
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
      return { success: false, error: "Supplier not found", message: "No se encontró el proveedor." };
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

    // Build map of old items by productId
    const oldItemsByProduct = new Map(
      oldItems.map((item) => [
        String(item.product),
        {
          quantity: Number(item.quantity ?? 0),
          remainingQuantity: Number(item.remainingQuantity ?? 0),
        },
      ]),
    );

    // Calculate stock deltas and new remainingQuantity per item
    const stockDeltas = new Map<string, number>();

    const newLotItems = normalizedItems.map((item) => {
      const old = oldItemsByProduct.get(item.productId);
      let remainingQuantity: number;

      if (old) {
        // Existing product: adjust remaining by the quantity delta
        const quantityDelta = item.quantity - old.quantity;
        remainingQuantity = Math.max(old.remainingQuantity + quantityDelta, 0);
        stockDeltas.set(
          item.productId,
          (stockDeltas.get(item.productId) ?? 0) + quantityDelta,
        );
        oldItemsByProduct.delete(item.productId);
      } else {
        // New product added to the lot
        remainingQuantity = item.quantity;
        stockDeltas.set(
          item.productId,
          (stockDeltas.get(item.productId) ?? 0) + item.quantity,
        );
      }

      return {
        product: new Types.ObjectId(item.productId),
        quantity: item.quantity,
        remainingQuantity,
        purchasePrice: item.purchasePrice,
        totalCost: item.quantity * item.purchasePrice,
      };
    });

    // Products removed from the lot: reverse their remainingQuantity
    for (const [productId, old] of oldItemsByProduct.entries()) {
      if (old.remainingQuantity > 0) {
        stockDeltas.set(
          productId,
          (stockDeltas.get(productId) ?? 0) - old.remainingQuantity,
        );
      }
    }

    const totalQuantity = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalCost = normalizedItems.reduce(
      (sum, item) => sum + item.quantity * item.purchasePrice,
      0,
    );

    // Apply stock deltas
    const allProductIds = Array.from(stockDeltas.keys()).filter(
      (pid) => stockDeltas.get(pid) !== 0,
    );

    if (allProductIds.length > 0) {
      const currentProducts = await Product.find({ _id: { $in: allProductIds } })
        .select("_id amount")
        .lean();

      const amountMap = new Map(
        currentProducts.map((p) => [String(p._id), Number(p.amount ?? 0)]),
      );

      const bulkOps = allProductIds
        .filter((pid) => amountMap.has(pid))
        .map((pid) => {
          const delta = stockDeltas.get(pid) ?? 0;
          const currentAmount = amountMap.get(pid) ?? 0;
          return {
            updateOne: {
              filter: { _id: pid },
              update: { $set: { amount: Math.max(currentAmount + delta, 0) } },
            },
          };
        });

      if (bulkOps.length > 0) {
        await Product.bulkWrite(bulkOps, { ordered: true });
      }
    }

    await Lot.findByIdAndUpdate(id, {
      receivedAt,
      supplier: new Types.ObjectId(input.supplierId),
      items: newLotItems,
      totalQuantity,
      totalCost,
    });

    const populatedLot = await Lot.findById(id)
      .populate("supplier", "name nit")
      .populate({
        path: "items.product",
        select: "name bar_code brand category",
        populate: [
          { path: "brand", select: "name" },
          { path: "category", select: "name" },
        ],
      })
      .lean();

    return {
      success: true,
      data: populatedLot ? mapLot(populatedLot as LotPopulateShape) : null,
      message: "Lote actualizado correctamente",
    };
  } catch (error) {
    console.error("Error updating lot:", error);
    return {
      success: false,
      error: "Failed to update lot",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteLotById(id: string) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return {
        success: false,
        error: "Invalid lot id",
        message: "El id del lote no es válido.",
      };
    }

    const lot = await Lot.findById(id).lean();

    if (!lot) {
      return {
        success: false,
        error: "Lot not found",
        message: "No se encontró el lote.",
      };
    }

    const quantityByProduct = new Map<string, number>();

    (Array.isArray(lot.items) ? lot.items : []).forEach((item) => {
      const productId = String(item.product ?? "").trim();
      const quantity = Math.max(
        0,
        Math.floor(Number(item.remainingQuantity ?? item.quantity ?? 0)),
      );

      if (!productId || quantity <= 0) {
        return;
      }

      quantityByProduct.set(productId, (quantityByProduct.get(productId) ?? 0) + quantity);
    });

    const productIds = Array.from(quantityByProduct.keys());

    if (productIds.length > 0) {
      const products = await Product.find({ _id: { $in: productIds } })
        .select("_id amount")
        .lean();

      const amountByProductId = new Map(
        products.map((product) => [String(product._id), Number(product.amount ?? 0)]),
      );

      const operations = productIds
        .filter((productId) => amountByProductId.has(productId))
        .map((productId) => {
          const currentAmount = amountByProductId.get(productId) ?? 0;
          const quantityToRollback = quantityByProduct.get(productId) ?? 0;
          const nextAmount = Math.max(currentAmount - quantityToRollback, 0);

          return {
            updateOne: {
              filter: { _id: productId },
              update: { $set: { amount: nextAmount } },
            },
          };
        });

      if (operations.length > 0) {
        await Product.bulkWrite(operations, { ordered: true });
      }
    }

    await Lot.findByIdAndDelete(id).lean();

    return {
      success: true,
      message: "Lote eliminado correctamente",
      data: { _id: id },
    };
  } catch (error) {
    console.error("Error deleting lot:", error);
    return {
      success: false,
      error: "Failed to delete lot",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
