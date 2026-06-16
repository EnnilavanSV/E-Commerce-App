import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct,
  searchProducts,
} from "../controllers/productController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllProducts); // When a GET request hits /api/products, send them all
router.post("/", verifyToken, verifyAdmin, createProduct);
router.put("/:id", verifyToken, verifyAdmin, updateProduct);
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct);
router.get("/search", searchProducts);
router.get("/:id", getProductById);

export default router;
