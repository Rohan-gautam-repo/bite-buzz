import { NextResponse } from "next/server";
import { seedCategories } from "@/lib/seedData";

/**
 * API endpoint to seed categories
 * GET or POST /api/seed/categories
 */
export async function POST() {
  try {
    const result = await seedCategories();
    
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("Error in seed API:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

/**
 * Allow GET requests to make it easier to seed from browser
 */
export async function GET() {
  return POST();
}
