import { NextRequest, NextResponse } from 'next/server';
import connectDB from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { updateProductsAmountBatch } from "@/services/products.service";

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (Array.isArray(body?.updates)) {
      const result = await updateProductsAmountBatch(body.updates);
      const status = result.success ? 200 : 500;
      return NextResponse.json(result, { status });
    }

    const productoActualizado = await Product.findByIdAndUpdate(
      body.id,
      { $set: { amount: body.amount } },
      { new: true }
    );

    return NextResponse.json(productoActualizado, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}