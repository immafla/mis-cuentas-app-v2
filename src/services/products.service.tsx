"use server";

import connectDB from "@/lib/mongodb";
import Product, { IProduct } from "@/lib/models/Product";

type ProductUpdate = Partial<
  Pick<IProduct, "name" | "brand" | "amount" | "category" | "sale_price" | "bar_code">
>;

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
      data: JSON.parse(JSON.stringify(updatedProduct)),
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
  amount: number;
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

    const operations = updates.map(({ id, amount }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { amount } },
      },
    }));

    const result = await Product.bulkWrite(operations, {
      ordered: false,
    });

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

    return {
      success: true,
      message: "Product fetched successfully",
      data: JSON.parse(JSON.stringify(product)),
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
