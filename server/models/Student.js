// server/models/student.js
import mongoose from "mongoose";


const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },


    // Academic Information
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    branch: { type: String, required: true },
    cgpa: { type: Number, required: true },
    tenthPercent: { type: Number,required : true},
    twelfthPercent: { type: Number,required: true},
    passingYear: { type: Number },
    backlogs: { type: Number, default: 0 },
    gapYears: { type: Number, default: 0 },
    semester: { type: Number, required: true },
      resumeData: {
  type: mongoose.Schema.Types.Mixed,
  default: {}
},
resumeLink: { type: String, default: "" },


    // Professional Profile (Optional but Useful)
   
    skills: { type: [String], default: [] },
 
    tenthMarksheet: {type: String, default: ""},
    twelfthMarksheet: {type: String,default:""},


    // Applied Job History (Optional)
    appliedJobs: [
      {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
        status: {
          type: String,
          enum: ["applied", "accepted", "rejected"],
          default: "applied",
        },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);


export default mongoose.model("Student", studentSchema);



