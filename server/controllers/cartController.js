import User from "../models/User.js";
import Product from "../models/Product.js";

export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user.cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching the cart" });
  }
};

export const saveCart = async (req, res) => {
  try {
    //  Find the user and overwrite the cart in one single, safe action
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { cart: req.body.cart }, // The new data
      { new: true }, // Tells MongoDB to return the updated version to us
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser.cart);
  } catch (error) {
    console.error("Error saving cart:", error);
    res.status(500).json({ message: "Server error saving cart" });
  }
};

export const validateCart = async (req, res) => {
  try {
    // React will send us an array of the Product IDs currently in the user's cart
    const { cartItemIds } = req.body;

    // Find all products in the database that match those IDs
    const liveProducts = await Product.find({
      _id: { $in: cartItemIds },
    });

    // Send the fresh, live data back to React
    res.status(200).json(liveProducts);
  } catch (error) {
    console.error("Cart Validation Error:", error);
    res.status(500).json({ message: "Failed to validate cart items" });
  }
};
