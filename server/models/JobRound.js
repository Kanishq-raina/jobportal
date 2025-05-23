import mongoose from "mongoose";


const jobRoundSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  roundType: {
    type: String,
    enum: ["oa", "coding", "technical", "hr", "final"],
    required: true,
  },
  selectedStudents: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ],
  resultFile: { type: String },
  mailSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});


jobRoundSchema.index({ job: 1, roundType: 1 }, { unique: true });


const JobRound = mongoose.models.JobRound || mongoose.model("JobRound", jobRoundSchema);
export default JobRound;





