// server/models/user.js
import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, sparse: true },
    password: { type: String },
    role: { type: String, enum: ["admin", "student"], required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },

    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  
  
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);


// ✅ Virtual to link Student academic info
userSchema.virtual("student", {
  ref: "Student",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});


export default mongoose.model("User", userSchema);





