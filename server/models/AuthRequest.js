import mongoose from "mongoose";

const authRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    field: {
      type: String,
      enum: ["cgpa", "semester", "branch", "tenthPercent", "twelfthPercent", "backlogs"],
      required: true,
    },
    oldValue:{
      type: String,
      default: "",
    },
    newValue: {
      type: String,
      required: true,
    },
    proof: {
      type: String, // file path
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("AuthRequest", authRequestSchema);
