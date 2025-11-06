import { NextResponse } from "next/server";
import { seedProducts } from "@/lib/seedProducts";

// Disable static generation for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  try {
    const result = await seedProducts();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to seed products" 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await seedProducts();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to seed products" 
      },
      { status: 500 }
    );
  }
}
