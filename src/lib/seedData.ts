import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase/config";
import { CreateCategoryInput } from "@/types";

const categories: CreateCategoryInput[] = [
  { name: "Fruits", emoji: "🍎", displayOrder: 1 },
  { name: "Vegetables", emoji: "🥕", displayOrder: 2 },
  { name: "Dairy", emoji: "🥛", displayOrder: 3 },
  { name: "Bakery", emoji: "🍞", displayOrder: 4 },
  { name: "Meat", emoji: "🍖", displayOrder: 5 },
  { name: "Seafood", emoji: "🐟", displayOrder: 6 },
  { name: "Beverages", emoji: "🥤", displayOrder: 7 },
  { name: "Snacks", emoji: "🍿", displayOrder: 8 },
];

/**
 * Seeds initial categories into Firestore
 * Checks if categories already exist before creating
 */
export async function seedCategories(): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  try {
    // Check if Firebase is configured
    if (!isFirebaseConfigured()) {
      return {
        success: false,
        message: "Firebase is not configured. Please add environment variables.",
      };
    }

    // Check if categories already exist
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);

    if (!snapshot.empty) {
      return {
        success: false,
        message: `Categories already exist (${snapshot.size} found). Skipping seed.`,
        count: snapshot.size,
      };
    }

    // Create all categories using batch write for atomicity
    const batch = writeBatch(db);

    categories.forEach((category) => {
      const newDocRef = doc(categoriesRef);
      batch.set(newDocRef, category);
    });

    await batch.commit();

    return {
      success: true,
      message: `Successfully seeded ${categories.length} categories!`,
      count: categories.length,
    };
  } catch (error) {
    console.error("Error seeding categories:", error);
    return {
      success: false,
      message: `Error seeding categories: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Standalone script to run seed function
 * Usage: node --loader ts-node/esm src/lib/seedData.ts
 * Or call via API endpoint
 */
if (require.main === module) {
  seedCategories()
    .then((result) => {
      console.log(result.message);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}
