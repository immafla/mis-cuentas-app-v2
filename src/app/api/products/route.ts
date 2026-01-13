import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from 'next/server';
import connectDB from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({});
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// export default async function GET(req: NextApiRequest, res: NextApiResponse) {
//   await connectDB();

//   console.log("Fetching all todos");
//   try {
//     const todos = await Product.find({});

//     res.status(200).json(todos);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching todos" });
//   }

// }

// export async function POST(request: NextRequest) {
//   try {
//     await dbConnect();
//     const body = await request.json();
//     const newProduct = new Product({ ...body, type: 'product' });
//     await newProduct.save();
//     return NextResponse.json(newProduct, { status: 201 });
//   } catch (error) {
//     console.error('Error creating product:', error);
//     return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
//   }
// }