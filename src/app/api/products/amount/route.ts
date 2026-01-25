import { NextRequest, NextResponse } from 'next/server';
import connectDB from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const productoActualizado = await Product.findByIdAndUpdate(
      body.id,
      { $set: { amount: body.amount } }, 
      { new: true } // Esto devuelve el documento ya modificado
    );


    return NextResponse.json(productoActualizado, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}