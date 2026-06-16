import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied." });

  // MAKE SURE THIS TRY/CATCH IS HERE!
  try {
    const cleanToken = token.replace("Bearer ", "");
    const verified = jwt.verify(cleanToken, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    // If the token is bad, it gracefully sends an error to React instead of crashing the server
    res.status(400).json({ message: "Invalid ticket." });
  }
};

export const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user && user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Access Denied. Admins only." }); // Kick them out!
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying admin status." });
  }
};
