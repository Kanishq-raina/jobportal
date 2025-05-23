// server/models/application.js
import mongoose from "mongoose";


const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  roundStatus: {
  oa: { type: String, enum: ["pending", "selected", "rejected"], default: "pending" },
  coding: { type: String, enum: ["pending", "selected", "rejected"], default: "pending" },
  technical: { type: String, enum: ["pending", "selected", "rejected"], default: "pending" },
  hr: { type: String, enum: ["pending", "selected", "rejected"], default: "pending" },
  final: { type: String, enum: ["pending", "selected", "rejected"], default: "pending" },
},
  status: { type: String,
    enum:["pending","accepted","rejected"],
     default: "pending" },
  appliedAt: { type: Date, default: Date.now },
});


applicationSchema.index({ job: 1, student: 1 }, { unique: true });


export default mongoose.model("Application", applicationSchema);





