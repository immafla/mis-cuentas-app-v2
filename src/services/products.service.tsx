"use server";

import connectDB from "@/lib/mongodb";
import Lot from "@/lib/models/Lot";
import Product from "@/lib/models/Product";
import { Types } from "mongoose";

type ProductCreateInput = {
  name: string;
  brand: string;
  amount: number;
  category: string | Types.ObjectId;
  sale_price: string;
  bar_code: string;
  content?: string | number;
};

type ProductUpdate = Partial<ProductCreateInput>;

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

const toSafeString = (value: unknown, fallback = "") => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
};

const toObjectIdString = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Types.ObjectId) {
    return value.toString();
  }

  return "";
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
    const normalizedContentRaw = String(input?.content ?? "").trim();
    const normalizedContent = normalizedContentRaw ? parseNumericInput(normalizedContentRaw) : null;

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

    if (
      normalizedContentRaw &&
      (!Number.isFinite(normalizedContent) || Number(normalizedContent) <= 0)
    ) {
      return {
        success: false,
        error: "Invalid content",
        message: "El contenido en ml es inválido.",
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
      content: normalizedContentRaw ? Number(normalizedContent) : undefined,
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
    const fieldsToSet: Record<string, unknown> = {};
    let unsetContent = false;

    if (typeof updateData.name === "string") {
      fieldsToSet.name = updateData.name.toUpperCase();
    }

    if (updateData.brand !== undefined) {
      fieldsToSet.brand = String(updateData.brand ?? "").trim();
    }

    if (updateData.category !== undefined) {
      fieldsToSet.category = String(updateData.category ?? "").trim();
    }

    if (updateData.bar_code !== undefined) {
      fieldsToSet.bar_code = String(updateData.bar_code ?? "").trim();
    }

    if (updateData.sale_price !== undefined) {
      const normalizedSalePrice = parseNumericInput(updateData.sale_price);

      if (!Number.isFinite(normalizedSalePrice) || normalizedSalePrice < 0) {
        return {
          success: false,
          error: "Invalid sale price",
          message: "El precio de venta es inválido.",
        };
      }

      fieldsToSet.sale_price = String(normalizedSalePrice);
    }

    if (updateData.amount !== undefined) {
      fieldsToSet.amount = Number(updateData.amount ?? 0);
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "content")) {
      const normalizedContentRaw = String(updateData.content ?? "").trim();

      if (!normalizedContentRaw) {
        unsetContent = true;
      } else {
        const normalizedContent = parseNumericInput(normalizedContentRaw);

        if (!Number.isFinite(normalizedContent) || Number(normalizedContent) <= 0) {
          return {
            success: false,
            error: "Invalid content",
            message: "El contenido en ml es inválido.",
          };
        }

        fieldsToSet.content = Number(normalizedContent);
      }
    }

    const updateQuery: Record<string, unknown> = {};

    if (Object.keys(fieldsToSet).length) {
      updateQuery.$set = fieldsToSet;
    }

    if (unsetContent) {
      updateQuery.$unset = { content: "" };
    }

    if (!Object.keys(updateQuery).length) {
      return {
        success: false,
        error: "No update fields",
        message: "No hay campos válidos para actualizar.",
      };
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateQuery, {
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

type ProductListItem = {
  _id: string;
  name: string;
  brand: string;
  category: string;
  brand_name?: string;
  category_name?: string;
  content?: number;
  sale_price: string;
  bar_code: string;
  amount: number;
};

type AggregatedProduct = {
  _id: Types.ObjectId | string;
  name?: string;
  brand?: Types.ObjectId | string | null;
  category?: Types.ObjectId | string | null;
  brand_name?: string;
  category_name?: string;
  content?: number | null;
  sale_price?: string | number;
  bar_code?: string;
  amount?: number;
};

type GetAllProductsParams = {
  q?: string;
  limit?: number;
};

export async function getAllProducts(params?: GetAllProductsParams) {
  try {
    await connectDB();

    const query = String(params?.q ?? "").trim();
    const limitParam = Number(params?.limit ?? 100);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 10;

    const products = await Product.aggregate<AggregatedProduct>([
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, name: 1 } }],
          as: "brandDoc",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, name: 1 } }],
          as: "categoryDoc",
        },
      },
      {
        $addFields: {
          brand_name: {
            $ifNull: [{ $arrayElemAt: ["$brandDoc.name", 0] }, ""],
          },
          category_name: {
            $ifNull: [{ $arrayElemAt: ["$categoryDoc.name", 0] }, ""],
          },
        },
      },
      ...(query
        ? [
            {
              $match: {
                $or: [
                  { name: { $regex: query, $options: "i" } },
                  { bar_code: { $regex: query, $options: "i" } },
                  { brand_name: { $regex: query, $options: "i" } },
                  { category_name: { $regex: query, $options: "i" } },
                ],
              },
            },
          ]
        : []),
      { $sort: { name: 1 } },
      { $limit: limit },
      {
        $project: {
          brandDoc: 0,
          categoryDoc: 0,
        },
      },
    ]);

    return {
      success: true,
      data: products.map((product) => {
        const id = toObjectIdString(product._id);
        const category = toObjectIdString(product.category);

        return {
          ...product,
          _id: id,
          name: toSafeString(product.name),
          brand: toObjectIdString(product.brand),
          category,
          brand_name: toSafeString(product.brand_name),
          category_name: toSafeString(product.category_name),
          content:
            product.content === undefined || product.content === null
              ? undefined
              : Number(product.content),
          sale_price: toSafeString(product.sale_price, "0"),
          bar_code: toSafeString(product.bar_code),
          amount: Number(product.amount ?? 0),
        } as ProductListItem;
      }),
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error: "Failed to fetch products",
      message: error instanceof Error ? error.message : "Unknown error",
      data: [] as ProductListItem[],
    };
  }
}

export async function deleteProductById(id: string) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return {
        success: false,
        error: "Invalid product id",
        message: "El id del producto no es válido.",
      };
    }

    const associatedLots = await Lot.countDocuments({
      "items.product": id,
    });

    if (associatedLots > 0) {
      return {
        success: false,
        error: "Product has associated lots",
        message: `No se puede eliminar. El producto está asociado a ${associatedLots} lote(s), activos o inactivos.`,
      };
    }

    const deletedProduct = await Product.findByIdAndDelete(id).lean();

    if (!deletedProduct) {
      return {
        success: false,
        error: "Product not found",
        message: "No se encontró el producto.",
      };
    }

    return {
      success: true,
      message: "Producto eliminado correctamente",
      data: {
        _id: String(deletedProduct._id),
      },
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: "Failed to delete product",
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
