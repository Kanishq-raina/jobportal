import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  branches: [{ type: String, required: true }]
}, {
  collection: "course"  // 👈 explicitly use your existing collection
});

export default mongoose.model("Course", courseSchema);
