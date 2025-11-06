import {
  collection,
  getDocs,
  writeBatch,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase/config";
import { CreateProductInput } from "@/types";

// Product data for each category
const productsByCategory: Record<string, CreateProductInput[]> = {
  Fruits: [
    {
      name: "Fresh Apple",
      description: "Crisp and juicy red apples, perfect for snacking or baking.",
      price: 120,
      category: "fruits",
      stockQuantity: 50,
      emoji: "🍎",
    },
    {
      name: "Ripe Banana",
      description: "Sweet and creamy bananas, rich in potassium and energy.",
      price: 40,
      category: "fruits",
      stockQuantity: 80,
      emoji: "🍌",
    },
    {
      name: "Juicy Orange",
      description: "Fresh oranges packed with vitamin C and natural sweetness.",
      price: 80,
      category: "fruits",
      stockQuantity: 60,
      emoji: "🍊",
    },
    {
      name: "Sweet Mango",
      description: "Delicious Alphonso mangoes, the king of fruits.",
      price: 150,
      category: "fruits",
      stockQuantity: 30,
      emoji: "🥭",
    },
    {
      name: "Fresh Grapes",
      description: "Seedless green grapes, sweet and refreshing.",
      price: 90,
      category: "fruits",
      stockQuantity: 45,
      emoji: "🍇",
    },
    {
      name: "Watermelon",
      description: "Large, juicy watermelon perfect for summer days.",
      price: 60,
      category: "fruits",
      stockQuantity: 25,
      emoji: "🍉",
    },
    {
      name: "Strawberries",
      description: "Fresh red strawberries, sweet and aromatic.",
      price: 200,
      category: "fruits",
      stockQuantity: 20,
      emoji: "🍓",
    },
    {
      name: "Pineapple",
      description: "Tropical pineapple, sweet and tangy flavor.",
      price: 100,
      category: "fruits",
      stockQuantity: 15,
      emoji: "🍍",
    },
  ],
  Vegetables: [
    {
      name: "Fresh Tomato",
      description: "Ripe red tomatoes, perfect for salads and cooking.",
      price: 30,
      category: "vegetables",
      stockQuantity: 100,
      emoji: "🍅",
    },
    {
      name: "Organic Carrot",
      description: "Crunchy orange carrots, rich in beta-carotene.",
      price: 50,
      category: "vegetables",
      stockQuantity: 70,
      emoji: "🥕",
    },
    {
      name: "Fresh Potato",
      description: "Versatile potatoes for all your cooking needs.",
      price: 25,
      category: "vegetables",
      stockQuantity: 120,
      emoji: "🥔",
    },
    {
      name: "White Onion",
      description: "Fresh onions, essential for every kitchen.",
      price: 35,
      category: "vegetables",
      stockQuantity: 90,
      emoji: "🧅",
    },
    {
      name: "Green Broccoli",
      description: "Nutritious broccoli florets, packed with vitamins.",
      price: 80,
      category: "vegetables",
      stockQuantity: 40,
      emoji: "🥦",
    },
    {
      name: "Bell Pepper",
      description: "Colorful bell peppers, crisp and sweet.",
      price: 60,
      category: "vegetables",
      stockQuantity: 55,
      emoji: "🫑",
    },
    {
      name: "Cucumber",
      description: "Fresh cucumbers, perfect for salads and snacks.",
      price: 40,
      category: "vegetables",
      stockQuantity: 65,
      emoji: "🥒",
    },
    {
      name: "Spinach",
      description: "Fresh green spinach leaves, rich in iron.",
      price: 30,
      category: "vegetables",
      stockQuantity: 50,
      emoji: "🥬",
    },
  ],
  Dairy: [
    {
      name: "Fresh Milk",
      description: "Pure cow's milk, 1 liter pack, homogenized and pasteurized.",
      price: 60,
      category: "dairy",
      stockQuantity: 80,
      emoji: "🥛",
    },
    {
      name: "Cheddar Cheese",
      description: "Premium cheddar cheese, perfect for sandwiches and cooking.",
      price: 250,
      category: "dairy",
      stockQuantity: 40,
      emoji: "🧀",
    },
    {
      name: "Greek Yogurt",
      description: "Creamy Greek yogurt, high in protein and probiotics.",
      price: 80,
      category: "dairy",
      stockQuantity: 60,
      emoji: "🥛",
    },
    {
      name: "Butter",
      description: "Salted butter, ideal for cooking and baking.",
      price: 120,
      category: "dairy",
      stockQuantity: 50,
      emoji: "🧈",
    },
    {
      name: "Fresh Paneer",
      description: "Soft cottage cheese, perfect for Indian dishes.",
      price: 180,
      category: "dairy",
      stockQuantity: 35,
      emoji: "🧈",
    },
    {
      name: "Ice Cream",
      description: "Vanilla ice cream, creamy and delicious.",
      price: 150,
      category: "dairy",
      stockQuantity: 45,
      emoji: "🍦",
    },
  ],
  Bakery: [
    {
      name: "White Bread",
      description: "Fresh white bread loaf, soft and perfect for sandwiches.",
      price: 40,
      category: "bakery",
      stockQuantity: 60,
      emoji: "🍞",
    },
    {
      name: "Butter Croissant",
      description: "Flaky French croissant, buttery and delicious.",
      price: 50,
      category: "bakery",
      stockQuantity: 40,
      emoji: "🥐",
    },
    {
      name: "Sesame Bagel",
      description: "Fresh bagels with sesame seeds, perfect for breakfast.",
      price: 45,
      category: "bakery",
      stockQuantity: 35,
      emoji: "🥯",
    },
    {
      name: "Blueberry Muffin",
      description: "Moist blueberry muffins, freshly baked.",
      price: 60,
      category: "bakery",
      stockQuantity: 30,
      emoji: "🧁",
    },
    {
      name: "Chocolate Cake",
      description: "Rich chocolate cake, perfect for celebrations.",
      price: 400,
      category: "bakery",
      stockQuantity: 15,
      emoji: "🍰",
    },
    {
      name: "Whole Wheat Bread",
      description: "Healthy whole wheat bread, high in fiber.",
      price: 50,
      category: "bakery",
      stockQuantity: 50,
      emoji: "🍞",
    },
    {
      name: "Danish Pastry",
      description: "Sweet Danish pastry with fruit filling.",
      price: 70,
      category: "bakery",
      stockQuantity: 25,
      emoji: "🥐",
    },
  ],
  Meat: [
    {
      name: "Chicken Breast",
      description: "Boneless chicken breast, fresh and tender.",
      price: 280,
      category: "meat",
      stockQuantity: 50,
      emoji: "🍗",
    },
    {
      name: "Beef Steak",
      description: "Premium beef steak, perfectly marbled.",
      price: 500,
      category: "meat",
      stockQuantity: 30,
      emoji: "🥩",
    },
    {
      name: "Lamb Chops",
      description: "Tender lamb chops, ideal for grilling.",
      price: 600,
      category: "meat",
      stockQuantity: 20,
      emoji: "🍖",
    },
    {
      name: "Pork Ribs",
      description: "Juicy pork ribs, perfect for BBQ.",
      price: 450,
      category: "meat",
      stockQuantity: 25,
      emoji: "🥩",
    },
    {
      name: "Turkey Breast",
      description: "Lean turkey breast, healthy and delicious.",
      price: 350,
      category: "meat",
      stockQuantity: 35,
      emoji: "🍗",
    },
    {
      name: "Ground Beef",
      description: "Fresh ground beef for burgers and meatballs.",
      price: 300,
      category: "meat",
      stockQuantity: 40,
      emoji: "🥩",
    },
  ],
  Seafood: [
    {
      name: "Fresh Salmon",
      description: "Atlantic salmon fillet, rich in omega-3.",
      price: 600,
      category: "seafood",
      stockQuantity: 25,
      emoji: "🐟",
    },
    {
      name: "Jumbo Shrimp",
      description: "Large shrimp, cleaned and deveined.",
      price: 500,
      category: "seafood",
      stockQuantity: 30,
      emoji: "🦐",
    },
    {
      name: "Tuna Steak",
      description: "Fresh tuna steak, perfect for grilling.",
      price: 550,
      category: "seafood",
      stockQuantity: 20,
      emoji: "🐟",
    },
    {
      name: "Crab Meat",
      description: "Fresh crab meat, sweet and succulent.",
      price: 700,
      category: "seafood",
      stockQuantity: 15,
      emoji: "🦀",
    },
    {
      name: "Lobster Tail",
      description: "Premium lobster tail, a true delicacy.",
      price: 1200,
      category: "seafood",
      stockQuantity: 10,
      emoji: "🦞",
    },
    {
      name: "Sea Bass",
      description: "Fresh sea bass fillet, mild and flaky.",
      price: 650,
      category: "seafood",
      stockQuantity: 18,
      emoji: "🐟",
    },
  ],
  Beverages: [
    {
      name: "Fresh Coffee",
      description: "Premium roasted coffee beans, 250g pack.",
      price: 200,
      category: "beverages",
      stockQuantity: 40,
      emoji: "☕",
    },
    {
      name: "Green Tea",
      description: "Organic green tea leaves, antioxidant-rich.",
      price: 150,
      category: "beverages",
      stockQuantity: 50,
      emoji: "🍵",
    },
    {
      name: "Orange Juice",
      description: "Fresh-squeezed orange juice, 1 liter pack.",
      price: 100,
      category: "beverages",
      stockQuantity: 60,
      emoji: "🧃",
    },
    {
      name: "Cola Soda",
      description: "Classic cola soda, 2 liter bottle.",
      price: 80,
      category: "beverages",
      stockQuantity: 70,
      emoji: "🥤",
    },
    {
      name: "Mineral Water",
      description: "Pure mineral water, 1 liter bottle.",
      price: 20,
      category: "beverages",
      stockQuantity: 100,
      emoji: "💧",
    },
    {
      name: "Energy Drink",
      description: "Energy drink with vitamins and caffeine.",
      price: 90,
      category: "beverages",
      stockQuantity: 45,
      emoji: "🥤",
    },
    {
      name: "Smoothie",
      description: "Mixed fruit smoothie, healthy and refreshing.",
      price: 120,
      category: "beverages",
      stockQuantity: 35,
      emoji: "🧃",
    },
  ],
  Snacks: [
    {
      name: "Potato Chips",
      description: "Crispy potato chips, classic salted flavor.",
      price: 30,
      category: "snacks",
      stockQuantity: 80,
      emoji: "🥔",
    },
    {
      name: "Chocolate Cookies",
      description: "Delicious chocolate chip cookies, freshly baked.",
      price: 60,
      category: "snacks",
      stockQuantity: 50,
      emoji: "🍪",
    },
    {
      name: "Buttered Popcorn",
      description: "Movie-style buttered popcorn, ready to eat.",
      price: 50,
      category: "snacks",
      stockQuantity: 60,
      emoji: "🍿",
    },
    {
      name: "Mixed Nuts",
      description: "Premium mixed nuts, roasted and salted.",
      price: 150,
      category: "snacks",
      stockQuantity: 40,
      emoji: "🥜",
    },
    {
      name: "Gummy Candy",
      description: "Colorful gummy candies, fruity flavors.",
      price: 40,
      category: "snacks",
      stockQuantity: 70,
      emoji: "🍬",
    },
    {
      name: "Pretzels",
      description: "Crunchy salted pretzels, perfect snack.",
      price: 55,
      category: "snacks",
      stockQuantity: 45,
      emoji: "🥨",
    },
    {
      name: "Granola Bar",
      description: "Healthy granola bar with oats and honey.",
      price: 35,
      category: "snacks",
      stockQuantity: 65,
      emoji: "🍫",
    },
    {
      name: "Nachos",
      description: "Crispy corn tortilla chips, cheesy flavor.",
      price: 45,
      category: "snacks",
      stockQuantity: 55,
      emoji: "🌮",
    },
  ],
};

export async function seedProducts() {
  try {
    console.log("Starting product seeding...");

    // Check if products already exist
    const productsRef = collection(db, "products");
    const existingProducts = await getDocs(productsRef);

    if (existingProducts.size > 0) {
      console.log(`Products already exist (${existingProducts.size} products found)`);
      return {
        success: true,
        message: `Skipped: ${existingProducts.size} products already exist`,
        count: existingProducts.size,
      };
    }

    // Get all categories to map category names to IDs
    const categoriesRef = collection(db, "categories");
    const categoriesSnapshot = await getDocs(categoriesRef);
    const categoryMap: Record<string, string> = {};

    categoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      categoryMap[data.name.toLowerCase()] = doc.id;
    });

    // Prepare batch writes
    const batch = writeBatch(db);
    let productCount = 0;

    // Add all products
    for (const [categoryName, products] of Object.entries(productsByCategory)) {
      const categoryId = categoryMap[categoryName.toLowerCase()];

      if (!categoryId) {
        console.warn(`Category not found: ${categoryName}`);
        continue;
      }

      for (const product of products) {
        const productRef = doc(collection(db, "products"));
        batch.set(productRef, {
          ...product,
          category: categoryId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        productCount++;
      }
    }

    // Commit batch
    await batch.commit();

    console.log(`Successfully seeded ${productCount} products`);
    return {
      success: true,
      message: `Successfully seeded ${productCount} products`,
      count: productCount,
    };
  } catch (error) {
    console.error("Error seeding products:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      count: 0,
    };
  }
}
