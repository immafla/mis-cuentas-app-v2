import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Product from '../../../../lib/models/Product';

export async function GET(request: Request, { params }: { params: { barcode: string } }) {
  try {
    await dbConnect();
    const product = await Product.findOne({ barcode: params.barcode, type: 'product' });
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