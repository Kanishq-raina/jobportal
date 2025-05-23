import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/user.js";

dotenv.config();

const connectAndAddUser = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to DB:", db.connection.name);

    const name= "Dummy_admin"
    const username = "admin";
    const password = "admin123";
    const email = "demousser1337@gmail.com"; // ✅ Add this
    const role = "admin";

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("⚠️ User already exists:", username);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      password: hashedPassword,
      email, // ✅ include email
      role,
    });

    await newUser.save();
    console.log(`✅ User "${username}" added successfully`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

connectAndAddUser();
