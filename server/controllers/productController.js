import Product from "../models/Product.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); // Fetch everything!
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: " Server error getting the product!" });
  }
};

export const createProduct = async (req, res) => {
  try {
    // req.body contains the box of form data we sent from React
    const newProduct = new Product(req.body);
    await newProduct.save(); // Save it permanently to MongoDB

    res.status(201).json(newProduct); // Send back a success message
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deleteProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product successfully deleted!" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error deleting product" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body, // The new data box from React
      { new: true }, // Return the freshly updated product
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error updating product" });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    // If the query is empty, return an empty array instantly
    if (!q || q.trim() === "") {
      return res.status(200).json([]);
    }

    // Find products matching the query anywhere in the name
    const products = await Product.find({
      name: {
        $regex: q,
        $options: "i", // 'i' means case-insensitive matching
      },
    })
      .select("name price image category inStock") // Only fetch fields needed for the dropdown
      .limit(5); // Cap results to keep the dropdown compact and efficient

    res.status(200).json(products);
  } catch (error) {
    console.error("Search API Error:", error);
    res.status(500).json({ message: "Error searching products" });
  }
};
