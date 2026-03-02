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

export type DashboardTrendMetric = "grossSales" | "netProfit";

export type DashboardTrendPoint = {
  date: string;
  label: string;
  grossSales: number;
  netProfit: number;
};

export type DashboardSalesTrendFilters = {
  rangeDays?: number;
  startDate?: string;
  endDate?: string;
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
const MAX_TREND_RANGE_DAYS = 365;

const pad2 = (value: number) => String(value).padStart(2, "0");

const getBogotaDateParts = (date: Date) => {
  const bogotaDate = new Date(date.getTime() + BOGOTA_UTC_OFFSET_HOURS * 60 * 60 * 1000);

  return {
    year: bogotaDate.getUTCFullYear(),
    month: bogotaDate.getUTCMonth(),
    day: bogotaDate.getUTCDate(),
  };
};

const buildBogotaDateKey = (year: number, month: number, day: number) =>
  `${year}-${pad2(month + 1)}-${pad2(day)}`;

const parseDateKey = (value: string) => {
  const match = String(value ?? "")
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const isSameDate =
    utcDate.getUTCFullYear() === year &&
    utcDate.getUTCMonth() === month - 1 &&
    utcDate.getUTCDate() === day;

  if (!isSameDate) {
    return null;
  }

  return {
    year,
    month: month - 1,
    day,
  };
};

const buildBogotaBoundaryUtc = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month, day, -BOGOTA_UTC_OFFSET_HOURS, 0, 0, 0));

const getBogotaDayRange = () => {
  const now = new Date();
  const { year, month, day } = getBogotaDateParts(now);

  const dayStartUtc = new Date(Date.UTC(year, month, day, -BOGOTA_UTC_OFFSET_HOURS, 0, 0, 0));
  const dayEndUtc = new Date(Date.UTC(year, month, day + 1, -BOGOTA_UTC_OFFSET_HOURS, 0, 0, 0));

  return { dayStartUtc, dayEndUtc };
};

export async function getDashboardSalesTrend(filters: DashboardSalesTrendFilters = {}) {
  try {
    await connectDB();

    const now = new Date();
    const nowParts = getBogotaDateParts(now);

    const parsedStart = filters.startDate ? parseDateKey(filters.startDate) : null;
    const parsedEnd = filters.endDate ? parseDateKey(filters.endDate) : null;

    const hasCustomRange = Boolean(parsedStart && parsedEnd);

    let rangeStartUtc = new Date(
      Date.UTC(
        nowParts.year,
        nowParts.month,
        nowParts.day -
          (Math.min(
            Math.max(Math.floor(Number(filters.rangeDays) || 30), 1),
            MAX_TREND_RANGE_DAYS,
          ) -
            1),
        -BOGOTA_UTC_OFFSET_HOURS,
        0,
        0,
        0,
      ),
    );
    let rangeEndUtc = buildBogotaBoundaryUtc(nowParts.year, nowParts.month, nowParts.day + 1);

    if (hasCustomRange && parsedStart && parsedEnd) {
      const customStartUtc = buildBogotaBoundaryUtc(
        parsedStart.year,
        parsedStart.month,
        parsedStart.day,
      );
      const customEndExclusiveUtc = buildBogotaBoundaryUtc(
        parsedEnd.year,
        parsedEnd.month,
        parsedEnd.day + 1,
      );

      if (customStartUtc < customEndExclusiveUtc) {
        const requestedDays = Math.ceil(
          (customEndExclusiveUtc.getTime() - customStartUtc.getTime()) / (24 * 60 * 60 * 1000),
        );

        if (requestedDays > MAX_TREND_RANGE_DAYS) {
          rangeStartUtc = new Date(customEndExclusiveUtc.getTime());
          rangeStartUtc.setUTCDate(rangeStartUtc.getUTCDate() - MAX_TREND_RANGE_DAYS);
        } else {
          rangeStartUtc = customStartUtc;
        }

        rangeEndUtc = customEndExclusiveUtc;
      }
    }

    const safeRange = Math.max(
      1,
      Math.ceil((rangeEndUtc.getTime() - rangeStartUtc.getTime()) / (24 * 60 * 60 * 1000)),
    );

    const pointsByDate = new Map<string, DashboardTrendPoint>();

    for (let index = 0; index < safeRange; index += 1) {
      const cursor = new Date(rangeStartUtc.getTime());
      cursor.setUTCDate(cursor.getUTCDate() + index);

      const cursorParts = getBogotaDateParts(cursor);
      const key = buildBogotaDateKey(cursorParts.year, cursorParts.month, cursorParts.day);

      pointsByDate.set(key, {
        date: key,
        label: `${pad2(cursorParts.day)}/${pad2(cursorParts.month + 1)}`,
        grossSales: 0,
        netProfit: 0,
      });
    }

    const sales = await Sale.find({ soldAt: { $gte: rangeStartUtc, $lt: rangeEndUtc } })
      .select("soldAt total totalProfit totalCost")
      .lean();

    for (const sale of sales) {
      const soldAt = new Date(sale.soldAt);
      const soldAtParts = getBogotaDateParts(soldAt);
      const dateKey = buildBogotaDateKey(soldAtParts.year, soldAtParts.month, soldAtParts.day);
      const point = pointsByDate.get(dateKey);

      if (!point) {
        continue;
      }

      const grossSales = Number(sale.total ?? 0);
      const netProfit = Number(
        sale.totalProfit ?? Number(sale.total ?? 0) - Number(sale.totalCost ?? 0),
      );

      point.grossSales += Number.isFinite(grossSales) ? grossSales : 0;
      point.netProfit += Number.isFinite(netProfit) ? netProfit : 0;
    }

    return {
      success: true,
      data: {
        rangeDays: safeRange,
        points: Array.from(pointsByDate.values()),
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard sales trend:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard sales trend",
      message: error instanceof Error ? error.message : "Unknown error",
      data: {
        rangeDays: 30,
        points: [] as DashboardTrendPoint[],
      },
    };
  }
}

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

    const productDocs = await Product.find({ _id: { $in: productIds } }).select("_id");
    const productDocById = new Map(productDocs.map((doc) => [String(doc._id), doc]));

    const missingProduct = productIds.find((productId) => !productDocById.has(productId));
    if (missingProduct) {
      return {
        success: false,
        error: "Product not found",
        message: "Uno o más productos no existen.",
      };
    }

    const lotDocs = await Lot.find({
      "items.product": { $in: productIds },
    }).sort({ receivedAt: 1, _id: 1 });

    const availableByProductId = new Map<string, number>();

    for (const lotDoc of lotDocs) {
      for (const lotItem of lotDoc.items) {
        const productId = String(lotItem.product ?? "");

        if (!productDocById.has(productId)) {
          continue;
        }

        const available = Math.max(
          0,
          Math.floor(Number(lotItem.remainingQuantity ?? lotItem.quantity ?? 0)),
        );

        if (available <= 0) {
          continue;
        }

        availableByProductId.set(productId, (availableByProductId.get(productId) ?? 0) + available);
      }
    }

    const hasInsufficientStock = groupedItems.some((item) => {
      const available = availableByProductId.get(item.productId) ?? 0;
      return available < item.quantity;
    });

    if (hasInsufficientStock) {
      return {
        success: false,
        error: "Insufficient stock",
        message: "Stock insuficiente para completar la venta.",
      };
    }

    const normalizedItems = groupedItems.map((item) => consumeProductFromLots(item, lotDocs));

    const total = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalCost = normalizedItems.reduce((sum, item) => sum + item.lineCost, 0);
    const totalProfit = normalizedItems.reduce((sum, item) => sum + item.lineProfit, 0);
    const totalItems = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);

    await Promise.all(lotDocs.map((lotDoc) => lotDoc.save()));

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

export async function getDashboardSalesData(limit = 8, dailySalesGoalTarget = 100000) {
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

    const inventoryValuationSummary = await Lot.aggregate([
      { $unwind: "$items" },
      {
        $project: {
          product: "$items.product",
          purchasePrice: { $toDouble: { $ifNull: ["$items.purchasePrice", 0] } },
          availableQuantity: {
            $max: [
              0,
              {
                $toDouble: {
                  $ifNull: ["$items.remainingQuantity", "$items.quantity"],
                },
              },
            ],
          },
        },
      },
      {
        $match: {
          availableQuantity: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: {
          path: "$productData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          lineNetCost: { $multiply: ["$availableQuantity", "$purchasePrice"] },
          lineSaleValue: {
            $multiply: [
              "$availableQuantity",
              { $toDouble: { $ifNull: ["$productData.sale_price", "0"] } },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalBusinessNetCost: { $sum: "$lineNetCost" },
          totalBusinessSaleValue: { $sum: "$lineSaleValue" },
        },
      },
    ]);

    const totalBusinessNetCost = Number(inventoryValuationSummary[0]?.totalBusinessNetCost ?? 0);
    const totalBusinessSaleValue = Number(
      inventoryValuationSummary[0]?.totalBusinessSaleValue ?? 0,
    );

    const safeDailyGoalTarget = Math.max(0, Math.floor(Number(dailySalesGoalTarget) || 0));
    const goalProgress =
      safeDailyGoalTarget > 0
        ? Math.min(Math.round((totalSales / safeDailyGoalTarget) * 100), 100)
        : 0;

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
          goalProgress,
          totalBusinessNetCost,
          totalBusinessSaleValue,
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
          totalBusinessNetCost: 0,
          totalBusinessSaleValue: 0,
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
