import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

//  Creates the initial order ticket
router.post("/create-order", createRazorpayOrder);

//  Verifies the payment after the user pays
router.post("/verify-payment", verifyRazorpayPayment);

export default router;
