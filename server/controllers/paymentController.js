import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Initialize the Razorpay Engine with your secret keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: Math.round(amount * 100), // Razorpay requires the amount in PAISE (₹1 = 100 paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Send the exact order details back to React
    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // We use cryptographic hashing to prove the payment actually came from Razorpay and wasn't faked
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res
        .status(200)
        .json({ message: "Payment verified successfully!" });
    } else {
      return res.status(400).json({ message: "Invalid payment signature!" });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error during verification" });
  }
};
