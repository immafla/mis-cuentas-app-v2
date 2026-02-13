"use server";

import connectDB from "@/lib/mongodb";
import Sale from "@/lib/models/Sale";
import Product from "@/lib/models/Product";
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
  totalItems: number;
  products: string;
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

    const productIds = items
      .map((item) => item.id)
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    const products = await Product.find({ _id: { $in: productIds } })
      .select({ _id: 1, purchase_price: 1 })
      .lean();

    const purchaseByProductId = new Map<string, number>(
      products.map((product) => [String(product._id), Number(product.purchase_price ?? 0)]),
    );

    const normalizedItems = items.map((item) => {
      const quantity = Math.max(1, Number(item.quantity ?? 1));
      const unitPrice = Number(item.price ?? 0);
      const purchaseFromProduct = purchaseByProductId.get(String(item.id));
      const unitCost = Number(
        purchaseFromProduct ??
          (Number.isFinite(Number(item.purchasePrice)) ? item.purchasePrice : 0),
      );
      const lineTotal = quantity * unitPrice;
      const lineCost = quantity * unitCost;
      const lineProfit = lineTotal - lineCost;

      return {
        productId: String(item.id),
        name: String(item.name),
        barCode: String(item.barCode),
        quantity,
        unitPrice,
        unitCost,
        lineTotal,
        lineCost,
        lineProfit,
      };
    });

    const total = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalCost = normalizedItems.reduce((sum, item) => sum + item.lineCost, 0);
    const totalProfit = normalizedItems.reduce((sum, item) => sum + item.lineProfit, 0);
    const totalItems = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);

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
