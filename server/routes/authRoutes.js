import express from "express";
import { getAllUsers, registerUser } from "../controllers/authController.js";
import { loginUser } from "../controllers/authController.js";
import { requestOTP } from "../controllers/authController.js";
import { verifyOTP } from "../controllers/authController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// When a POST request hits /register, send it to the registerUser function
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/auth/request-otp", requestOTP);
router.post("/auth/verify-otp", verifyOTP);

// Admin only. This returns every registered account, so it must never bep.
router.get("/users", verifyToken, verifyAdmin, getAllUsers);

export default router;
