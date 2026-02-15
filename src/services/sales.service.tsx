"use server";

import connectDB from "@/lib/mongodb";
import Lot from "@/lib/models/Lot";
import Product from "@/lib/models/Product";
import Sale from "@/lib/models/Sale";
import { Types } from "mongoose";

type SaleInputItem = {
  id: string;
  name: string;
  barCode: string;
  quantity: number;
  price: number;
  purchasePrice: number;
};

type DashboardSale = {
  id: string;
  customer: string;
  total: number;
  items: number;
  soldAt: string;
  totalCost: number;
  totalProfit: number;
  soldItems: {
    name: string;
    barCode: string;
    quantity: number;
    unitPrice: number;
    unitCost: number;
    lineTotal: number;
    lineCost: number;
    lineProfit: number;
  }[];
};

type SaleItemSummary = {
  name: string;
  quantity: number;
};

type SaleStoredItem = {
  name: string;
  barCode: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  lineTotal: number;
  lineCost: number;
  lineProfit: number;
};

type SaleHistoryRow = {
  _id: string;
  soldAt: string;
  total: number;
  profit: number;
  totalItems: number;
  products: string;
};

type LotAllocation = {
  lotId: string;
  quantity: number;
  unitCost: number;
};

const consumeProductFromLots = (
  item: {
    productId: string;
    name: string;
    barCode: string;
    quantity: number;
    unitPrice: number;
  },
  lotDocs: Array<{
    _id: unknown;
    items: Array<{
      product: unknown;
      quantity?: number;
      remainingQuantity?: number;
      purchasePrice?: number;
    }>;
  }>,
) => {
  let quantityPending = item.quantity;
  let lineCost = 0;
  const lotAllocations: LotAllocation[] = [];

  for (const lotDoc of lotDocs) {
    if (quantityPending <= 0) {
      break;
    }

    for (const lotItem of lotDoc.items) {
      if (quantityPending <= 0) {
        break;
      }

      const isSameProduct = String(lotItem.product) === item.productId;
      if (!isSameProduct) {
        continue;
      }

      const available = Math.max(
        0,
        Math.floor(Number(lotItem.remainingQuantity ?? lotItem.quantity ?? 0)),
      );

      if (available <= 0) {
        continue;
      }

      const consumeQuantity = Math.min(quantityPending, available);
      const unitCost = Number(lotItem.purchasePrice ?? 0);

      lotItem.remainingQuantity = available - consumeQuantity;
      quantityPending -= consumeQuantity;
      lineCost += consumeQuantity * unitCost;
      lotAllocations.push({
        lotId: String(lotDoc._id),
        quantity: consumeQuantity,
        unitCost,
      });
    }
  }

  if (quantityPending > 0) {
    throw new Error(`Stock por lote insuficiente para ${item.name || item.productId}`);
  }

  const unitCost = item.quantity > 0 ? lineCost / item.quantity : 0;
  const lineTotal = item.quantity * item.unitPrice;
  const lineProfit = lineTotal - lineCost;

  return {
    productId: item.productId,
    name: item.name,
    barCode: item.barCode,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    unitCost,
    lineTotal,
    lineCost,
    lineProfit,
    lotAllocations,
  };
};

const BOGOTA_UTC_OFFSET_HOURS = -5;

const getBogotaDayRange = () => {
  const now = new Date();
  const bogotaNow = new Date(now.getTime() + BOGOTA_UTC_OFFSET_HOURS * 60 * 60 * 1000);

  const year = bogotaNow.getUTCFullYear();
  const month = bogotaNow.getUTCMonth();
  const day = bogotaNow.getUTCDate();

  const dayStartUtc = new Date(Date.UTC(year, month, day, -BOGOTA_UTC_OFFSET_HOURS, 0, 0, 0));
  const dayEndUtc = new Date(Date.UTC(year, month, day + 1, -BOGOTA_UTC_OFFSET_HOURS, 0, 0, 0));

  return { dayStartUtc, dayEndUtc };
};

export async function createSaleRecord(items: SaleInputItem[]) {
  try {
    await connectDB();

    if (!items.length) {
      return {
        success: false,
        error: "Empty sale",
        message: "No hay productos para registrar la venta.",
      };
    }

    const groupedByProduct = items.reduce(
      (accumulator, item) => {
        const productId = String(item.id ?? "").trim();

        if (!Types.ObjectId.isValid(productId)) {
          return accumulator;
        }

        const quantity = Math.max(1, Math.floor(Number(item.quantity ?? 1)));
        const unitPrice = Number(item.price ?? 0);

        const previous = accumulator.get(productId);
        if (!previous) {
          accumulator.set(productId, {
            productId,
            name: String(item.name ?? ""),
            barCode: String(item.barCode ?? ""),
            quantity,
            unitPrice,
          });
          return accumulator;
        }

        previous.quantity += quantity;
        previous.unitPrice = unitPrice;
        if (!previous.name) {
          previous.name = String(item.name ?? "");
        }
        if (!previous.barCode) {
          previous.barCode = String(item.barCode ?? "");
        }
        return accumulator;
      },
      new Map<
        string,
        {
          productId: string;
          name: string;
          barCode: string;
          quantity: number;
          unitPrice: number;
        }
      >(),
    );

    const groupedItems = Array.from(groupedByProduct.values());

    if (!groupedItems.length) {
      return {
        success: false,
        error: "Invalid sale items",
        message: "No hay productos válidos para registrar la venta.",
      };
    }

    const productIds = groupedItems.map((item) => item.productId);

    const productDocs = await Product.find({ _id: { $in: productIds } }).select("_id amount");
    const productDocById = new Map(productDocs.map((doc) => [String(doc._id), doc]));

    const missingProduct = productIds.find((productId) => !productDocById.has(productId));
    if (missingProduct) {
      return {
        success: false,
        error: "Product not found",
        message: "Uno o más productos no existen.",
      };
    }

    const hasInsufficientStock = groupedItems.some((item) => {
      const productDoc = productDocById.get(item.productId);
      const currentAmount = Number(productDoc?.amount ?? 0);
      return currentAmount < item.quantity;
    });

    if (hasInsufficientStock) {
      return {
        success: false,
        error: "Insufficient stock",
        message: "Stock insuficiente para completar la venta.",
      };
    }

    const lotDocs = await Lot.find({
      "items.product": { $in: productIds },
    }).sort({ receivedAt: 1, _id: 1 });

    const normalizedItems = groupedItems.map((item) => consumeProductFromLots(item, lotDocs));

    const total = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalCost = normalizedItems.reduce((sum, item) => sum + item.lineCost, 0);
    const totalProfit = normalizedItems.reduce((sum, item) => sum + item.lineProfit, 0);
    const totalItems = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);

    groupedItems.forEach((item) => {
      const productDoc = productDocById.get(item.productId);

      if (!productDoc) {
        return;
      }

      const currentAmount = Number(productDoc.amount ?? 0);
      productDoc.amount = Math.max(currentAmount - item.quantity, 0);
    });

    await Promise.all(lotDocs.map((lotDoc) => lotDoc.save()));
    await Promise.all(productDocs.map((productDoc) => productDoc.save()));

    const sale = await Sale.create({
      items: normalizedItems,
      total,
      totalCost,
      totalProfit,
      totalItems,
      soldAt: new Date(),
    });

    return {
      success: true,
      message: "Venta registrada correctamente",
      data: {
        id: String(sale._id),
        total,
        totalCost,
        totalProfit,
        totalItems,
        soldAt: sale.soldAt,
      },
    };
  } catch (error) {
    console.error("Error creating sale record:", error);
    return {
      success: false,
      error: "Failed to create sale record",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getDashboardSalesData(limit = 8) {
  try {
    await connectDB();

    const { dayStartUtc, dayEndUtc } = getBogotaDayRange();

    const todaySales = await Sale.find({ soldAt: { $gte: dayStartUtc, $lt: dayEndUtc } })
      .sort({ soldAt: -1 })
      .lean();

    const recentSales: DashboardSale[] = todaySales.slice(0, limit).map((sale) => ({
      id: String(sale._id),
      customer: "Cliente mostrador",
      total: Number(sale.total ?? 0),
      items: Number(sale.totalItems ?? 0),
      soldAt: new Date(sale.soldAt).toISOString(),
      totalCost: Number(
        sale.totalCost ??
          (Array.isArray(sale.items)
            ? (sale.items as SaleStoredItem[]).reduce(
                (sum, item) =>
                  sum +
                  Number(item.lineCost ?? Number(item.unitCost ?? 0) * Number(item.quantity ?? 0)),
                0,
              )
            : 0),
      ),
      totalProfit: Number(
        sale.totalProfit ??
          Number(sale.total ?? 0) -
            (Array.isArray(sale.items)
              ? (sale.items as SaleStoredItem[]).reduce(
                  (sum, item) =>
                    sum +
                    Number(
                      item.lineCost ?? Number(item.unitCost ?? 0) * Number(item.quantity ?? 0),
                    ),
                  0,
                )
              : 0),
      ),
      soldItems: Array.isArray(sale.items)
        ? (sale.items as SaleStoredItem[]).map((item) => ({
            name: String(item.name ?? ""),
            barCode: String(item.barCode ?? ""),
            quantity: Number(item.quantity ?? 0),
            unitPrice: Number(item.unitPrice ?? 0),
            unitCost: Number(item.unitCost ?? 0),
            lineTotal: Number(item.lineTotal ?? 0),
            lineCost:
              Number(item.lineCost ?? 0) || Number(item.unitCost ?? 0) * Number(item.quantity ?? 0),
            lineProfit:
              Number(item.lineProfit ?? 0) ||
              Number(item.lineTotal ?? 0) -
                (Number(item.lineCost ?? 0) ||
                  Number(item.unitCost ?? 0) * Number(item.quantity ?? 0)),
          }))
        : [],
    }));

    const totalSales = todaySales.reduce((sum, sale) => sum + Number(sale.total ?? 0), 0);
    const totalCost = todaySales.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.totalCost ??
            (Array.isArray(sale.items)
              ? (sale.items as SaleStoredItem[]).reduce(
                  (itemsSum, item) =>
                    itemsSum +
                    Number(
                      item.lineCost ?? Number(item.unitCost ?? 0) * Number(item.quantity ?? 0),
                    ),
                  0,
                )
              : 0),
        ),
      0,
    );
    const totalProfit = totalSales - totalCost;
    const netMarginPercent = totalSales > 0 ? Math.round((totalProfit / totalSales) * 100) : 0;
    const totalItems = todaySales.reduce((sum, sale) => sum + Number(sale.totalItems ?? 0), 0);
    const avgTicket = todaySales.length ? Math.round(totalSales / todaySales.length) : 0;

    return {
      success: true,
      data: {
        recentSales,
        kpis: {
          totalSales,
          totalCost,
          totalProfit,
          netMarginPercent,
          totalItems,
          avgTicket,
          salesCount: todaySales.length,
          goalProgress: Math.min(Math.round((totalSales / 100000) * 100), 100),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard sales data:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard sales data",
      message: error instanceof Error ? error.message : "Unknown error",
      data: {
        recentSales: [] as DashboardSale[],
        kpis: {
          totalSales: 0,
          totalCost: 0,
          totalProfit: 0,
          netMarginPercent: 0,
          totalItems: 0,
          avgTicket: 0,
          salesCount: 0,
          goalProgress: 0,
        },
      },
    };
  }
}

export async function getSalesHistory(limit = 200) {
  try {
    await connectDB();

    const sales = await Sale.find({}).sort({ soldAt: -1 }).limit(limit).lean();

    const rows: SaleHistoryRow[] = sales.map((sale) => ({
      _id: String(sale._id),
      soldAt: new Date(sale.soldAt).toISOString(),
      total: Number(sale.total ?? 0),
      profit: Number(sale.totalProfit ?? 0),
      totalItems: Number(sale.totalItems ?? 0),
      products: Array.isArray(sale.items)
        ? (sale.items as SaleItemSummary[])
            .map((item) => `${item.name} x${item.quantity}`)
            .join(" · ")
        : "",
    }));

    return {
      success: true,
      data: rows,
    };
  } catch (error) {
    console.error("Error fetching sales history:", error);
    return {
      success: false,
      error: "Failed to fetch sales history",
      message: error instanceof Error ? error.message : "Unknown error",
      data: [] as SaleHistoryRow[],
    };
  }
}

export async function deleteSaleById(id: string) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return {
        success: false,
        error: "Invalid sale id",
        message: "El id de la venta no es válido.",
      };
    }

    const deletedSale = await Sale.findByIdAndDelete(id).lean();

    if (!deletedSale) {
      return {
        success: false,
        error: "Sale not found",
        message: "No se encontró la venta a eliminar.",
      };
    }

    return {
      success: true,
      message: "Venta eliminada correctamente",
      data: { _id: String(deletedSale._id) },
    };
  } catch (error) {
    console.error("Error deleting sale:", error);
    return {
      success: false,
      error: "Failed to delete sale",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
