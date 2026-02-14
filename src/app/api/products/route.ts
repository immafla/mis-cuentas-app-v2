import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";
    const limitParam = Number(searchParams.get("limit") ?? "100");
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 10;

    const filters = query
      ? {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { bar_code: { $regex: query, $options: "i" } },
          ],
        }
      : {};

    const products = await Product.find(filters).sort({ name: 1 }).limit(limit).lean();

    const normalizedProducts = products.map((product) => ({
      ...product,
      _id: String(product._id),
    }));

    return NextResponse.json(normalizedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const deletedProduct = await Product.findByIdAndDelete(body.id);
    return NextResponse.json(deletedProduct, { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
