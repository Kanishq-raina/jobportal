// cronJob.js
import cron from "node-cron";
import mongoose from "mongoose";
import AuthRequest from "./models/AuthRequest.js";
import connectDB from "./config/db.js";
import 'dotenv/config';
export const runCleanup = async () => {
  try {
    await connectDB(); // Ensures DB is connected
    const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    const result = await AuthRequest.deleteMany({ createdAt: { $lt: cutoff } });
    console.log(`🧹 ${result.deletedCount} old auth requests deleted`);
  } catch (err) {
    console.error("❌ Cron cleanup failed:", err);
  }
};

// Schedule the job: every day at 00:00
cron.schedule("0 0 * * *", () => {
  console.log("⏰ Running daily auth request cleanup...");
  runCleanup();
});
