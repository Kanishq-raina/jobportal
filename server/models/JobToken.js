// models/JobToken.js
import mongoose from "mongoose";

const jobTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // or "Student" if you're using the Student model directly
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("JobToken", jobTokenSchema);
