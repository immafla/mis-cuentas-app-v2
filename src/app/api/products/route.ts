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

    const products = await Product.aggregate([
      {
        $lookup: {
          from: "brands",
          let: { brandId: "$brand" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$_id" }, "$$brandId"],
                },
              },
            },
            { $project: { _id: 0, name: 1 } },
          ],
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

    const normalizedProducts = products.map((product) => ({
      ...product,
      _id: String(product._id),
      category: product.category ? String(product.category) : product.category,
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
