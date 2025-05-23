import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

import { randomBytes } from "crypto";
import { sendResetEmail } from "../utils/sendResetEmail.js";

// =========================
// ✅ LOGIN CONTROLLER
// =========================
export const login = async (req, res) => {
  const { identifier, password } = req.body; // changed from `username` to `identifier`


  try {
    // Try to find the user by email OR username
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });


    if (!user) return res.status(404).json({ message: "User not found" });


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });


    res.status(200).json({
      message: "Login successful",
      _id: user._id,
      username: user.username,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      token: generateToken(user._id),
    });


  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};




// =========================
// ✅ FORGOT PASSWORD
// =========================
export const forgotPassword = async (req, res) => {
  const { identifier } = req.body; // Accept username OR email


  if (!identifier) {
    return res.status(400).json({ message: "Please enter your username or email." });
  }


  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });


    if (!user || !user.email) {
      return res.status(404).json({ message: "No user found with that email or username." });
    }


    // Generate secure token
    const resetToken = randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins expiry


    await user.save();


   const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;


    await sendResetEmail(user.email, resetLink);


    res.status(200).json({ message: "Reset link sent to your registered email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};





// =========================
// ✅ RESET PASSWORD
// =========================
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // still valid
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



export const setPassword = async (req, res) => {
  try {
    const { token, username, password } = req.body;

    if (!token || !username || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // ✅ Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken." });
    }

    // ✅ Find user by resetToken and check expiry
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // ✅ Set username and password, clear token
    user.username = username;
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    return res.status(200).json({ message: "Password set successfully." });
  } catch (err) {
    console.error("Set password error:", err);
    res.status(500).json({ message: "Server error." });
  }
};
