import express from "express";
import {
  getCart,
  saveCart,
  validateCart,
} from "../controllers/cartController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // Import the Bouncer!

const router = express.Router();

// Notice how we put verifyToken right in the middle!
// The request MUST pass the bouncer before it reaches the controller.
router.get("/", verifyToken, getCart);
router.post("/", verifyToken, saveCart);
router.post("/validate-cart", verifyToken, validateCart);

export default router;
