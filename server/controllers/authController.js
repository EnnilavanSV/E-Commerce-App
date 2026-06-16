import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateOTP, sendMockSMS } from "../utils/mockSms.js";

// THE OTP MEMORY BANK (Phone Number -> OTP)
const otpCache = new Map();

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Send the ticket AND the user data back to React!
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    //generating vip wristband
    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Login succesful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login." });
  }
};

export const requestOTP = async (req, res) => {
  console.log(
    "➡️ 1. Backend received request for phone:",
    req.body.phoneNumber,
  );

  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    console.log("❌ 2. Failed: No phone number provided.");
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    const otp = generateOTP();
    otpCache.set(phoneNumber, { otp , timestamp: Date.now() });

    await sendMockSMS(phoneNumber, otp);

    console.log("✅ 3. SMS Printed! Now sending success back to React...");

    // IF THIS LINE HAS A TYPO, REACT GETS AN ERROR:
    res.status(200).json({ message: "OTP sent successfully!" });

    console.log("🚀 4. Success message successfully delivered to React!");
  } catch (error) {
    console.error("🚨 CRASH ERROR:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  // Check the Memory Bank
  const cachedData = otpCache.get(phoneNumber);

  if (!cachedData || cachedData.otp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  try {
    //  Find the user in the database (or create a new one!)
    //  generate a dummy email/password so your Mongoose schema doesn't crash!
    let user = await User.findOne({ email: `${phoneNumber}@phone.com` });

    if (!user) {
      const hashedPassword = await bcrypt.hash(
        phoneNumber + process.env.JWT_SECRET,
        10,
      );
      user = new User({
        name: "Mobile User",
        email: `${phoneNumber}@phone.com`, // Dummy email
        password: hashedPassword, // Dummy password
      });
      await user.save();
    }

    //  Erase the used code from memory so it can't be reused
    otpCache.delete(phoneNumber);

    //  Issue the standard VIP Ticket!
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};
