import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import { seedProducts } from "./data/products.js";

dotenv.config();

const runSeeder = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB...");

    await Product.deleteMany(); // Clear out old products
    await Product.insertMany(seedProducts); // Inject the new ones

    console.log("Data seeded successfully! Database is locked and loaded.");
    process.exit();
  } catch (error) {
    console.error("Error with seeder:", error);
    process.exit(1);
  }
};

runSeeder();
