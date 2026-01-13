import { NextResponse } from 'next/server';
import connectDB from "@/lib/mongodb";
import BussinesCategory from "@/lib/models/BussinesCategory";

export async function GET() {
  try {
    await connectDB();
    const businessCategories = await BussinesCategory.find({});

    console.log('Fetched business categories:', {businessCategories});
    return NextResponse.json(businessCategories);
  } catch (error) {
    console.error('Error fetching business categories:', error);
    return NextResponse.json({ error: 'Failed to fetch business categories' }, { status: 500 });
  }
};