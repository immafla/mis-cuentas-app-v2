import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';

// 1. Definimos la interfaz para los parámetros (debe ser una Promesa)
type Props = {
  params: Promise<{ barcode: string }>
}

export async function GET(request: NextRequest, context: Props) {
  try {
    
    await dbConnect();
    const { barcode } = await context.params;
    const product = await Product.findOne({ bar_code: barcode });
    if (product) {
      return NextResponse.json(product);
    } else {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}