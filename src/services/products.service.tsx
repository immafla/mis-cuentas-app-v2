"use server";

import connectDB from "@/lib/mongodb";
import Product, { IProduct } from "@/lib/models/Product";
import { Types } from "mongoose";

type ProductUpdate = Partial<
  Pick<IProduct, "name" | "brand" | "amount" | "category" | "sale_price" | "bar_code">
>;

type ProductCreateInput = Pick<
  IProduct,
  "name" | "brand" | "amount" | "category" | "sale_price" | "bar_code"
>;

const parseNumericInput = (value: unknown) => {
  if (typeof value !== "string" && typeof value !== "number") {
    return Number.NaN;
  }

  const raw = String(value).trim();
  if (!raw) {
    return Number.NaN;
  }

  const normalized = raw.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".");
  return Number(normalized);
};

export async function createProduct(input: ProductCreateInput) {
  try {
    await connectDB();

    const normalizedName = String(input?.name ?? "")
      .trim()
      .replaceAll(/\s+/g, " ")
      .toUpperCase();
    const normalizedBarCode = String(input?.bar_code ?? "").trim();
    const normalizedBrand = String(input?.brand ?? "").trim();
    const normalizedCategory = String(input?.category ?? "").trim();
    const normalizedSalePrice = parseNumericInput(input?.sale_price);

    const hasRequiredFields =
      normalizedName.length > 0 &&
      normalizedBarCode.length > 0 &&
      normalizedBrand.length > 0 &&
      normalizedCategory.length > 0;

    if (!hasRequiredFields) {
      return {
        success: false,
        error: "Missing required fields",
        message: "Campos obligatorios incompletos",
      };
    }

    if (!Number.isFinite(normalizedSalePrice) || normalizedSalePrice < 0) {
      return {
        success: false,
        error: "Invalid sale price",
        message: "El precio de venta es inválido.",
      };
    }

    const existingByName = await Product.findOne({ name: normalizedName }).lean();
    if (existingByName) {
      return {
        success: false,
        error: "Duplicated product name",
        message: "Ya existe un producto con ese nombre",
      };
    }

    const newProduct = await Product.create({
      ...input,
      name: normalizedName,
      brand: normalizedBrand,
      category: normalizedCategory,
      bar_code: normalizedBarCode,
      sale_price: String(normalizedSalePrice),
      amount: Number(input?.amount ?? 0),
    });

    return {
      success: true,
      message: "Product created successfully",
      data: structuredClone(newProduct.toObject()),
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: "Failed to create product",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateProductById(id: string, update: ProductUpdate) {
  try {
    await connectDB();

    const updateData: ProductUpdate = { ...update };
    if (typeof updateData.name === "string") {
      updateData.name = updateData.name.toUpperCase();
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedProduct) {
      return {
        success: false,
        error: "Product not found",
        message: "No product found with the provided ID",
      };
    }

    return {
      success: true,
      message: "Product updated successfully",
      data: structuredClone(updatedProduct),
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: "Failed to update product",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

type ProductAmountUpdate = {
  id: string;
  quantity: number;
};

export async function updateProductsAmountBatch(updates: ProductAmountUpdate[]) {
  try {
    await connectDB();

    if (!updates || updates.length === 0) {
      return {
        success: true,
        message: "No updates to apply",
        data: [],
      };
    }

    const normalizedUpdates = updates
      .map((update) => ({
        id: String(update.id ?? "").trim(),
        quantity: Math.max(0, Math.floor(Number(update.quantity ?? 0))),
      }))
      .filter(
        (update) =>
          update.id.length > 0 &&
          update.id !== "[object Object]" &&
          Types.ObjectId.isValid(update.id) &&
          update.quantity > 0,
      );

    if (!normalizedUpdates.length) {
      return {
        success: true,
        message: "No valid updates to apply",
        data: [],
      };
    }

    const products = await Product.find({
      _id: { $in: normalizedUpdates.map((update) => update.id) },
    })
      .select("_id amount")
      .lean();

    const currentAmountById = new Map(
      products.map((product) => [String(product._id), Number(product.amount ?? 0)]),
    );

    const operations = normalizedUpdates.map(({ id, quantity }) => {
      const currentAmount = currentAmountById.get(id) ?? 0;
      const nextAmount = Math.max(currentAmount - quantity, 0);

      return {
        updateOne: {
          filter: { _id: id },
          update: { $set: { amount: nextAmount } },
        },
      };
    });

    const result = await Product.bulkWrite(operations, { ordered: false });

    return {
      success: true,
      message: "Products amount updated successfully",
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    };
  } catch (error) {
    console.error("Error updating products amount:", error);
    return {
      success: false,
      error: "Failed to update products amount",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getProductByBarcode(barCode: string) {
  try {
    await connectDB();

    const product = await Product.findOne({ bar_code: barCode }).lean();

    if (!product) {
      return {
        success: false,
        error: "Product not found",
        message: "No product found with the provided barcode",
      };
    }

    const normalizedProduct = {
      ...product,
      _id: String(product._id),
    };

    return {
      success: true,
      message: "Product fetched successfully",
      data: structuredClone(normalizedProduct),
    };
  } catch (error) {
    console.error("Error fetching product by barcode:", error);
    return {
      success: false,
      error: "Failed to fetch product",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
