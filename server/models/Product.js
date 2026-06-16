import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    // Adding description for later when we build a product details page!
    description: { type: String, default: "A premium item from our catalog." },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
