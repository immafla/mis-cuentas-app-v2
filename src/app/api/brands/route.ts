import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Brand from "@/lib/models/Brand";

const normalizeName = (value: string) => value.trim().replaceAll(/\s+/g, " ").toUpperCase();

export async function GET() {
  try {
    await connectDB();
    const brands = await Brand.find({});
    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const normalizedName = normalizeName(String(body?.name ?? ""));

    if (!normalizedName) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const existingByName = await Brand.findOne({ name: normalizedName }).lean();
    if (existingByName) {
      return NextResponse.json({ error: "Brand already exists" }, { status: 409 });
    }

    const newBrand = new Brand({ ...body, name: normalizedName, type: "brand" });
    await newBrand.save();
    return NextResponse.json(newBrand, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { id } = body; // Assuming body has id
    await Brand.findByIdAndDelete(id);
    return NextResponse.json({ message: "Brand deleted" });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
