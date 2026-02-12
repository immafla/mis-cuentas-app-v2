import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Brand from "@/lib/models/Brand";

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
    const newBrand = new Brand({ ...body, type: "brand" });
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
