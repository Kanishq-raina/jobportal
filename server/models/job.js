// server/models/job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    salary: {
      type: Number,
      required: true,
      min: 1,
    },

    vacancy: {
      type: Number,
      required: true,
      min: 1,
      max: 2000,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "taken"],
      default: "active",
    },
    coursesAllowed: {
      type: [String],
      required: true,
      default: []
    },

    eligibility: {
      minCGPA: {
        type: Number,
        default: 5.0,
        min: 0,
        max: 10,
      },
      maxBacklogs: {
        type: Number,
        default: 0,
        min: 0,
        max: 10,
      },
      allowedGapYears: {
        type: Number,
        default: 0,
        min: 0,
        max: 10,
      },
      semestersAllowed: {
        type: [Number],
        default: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
      branchesAllowed: {
        type: [String],
        default: [],
      },
      minTenthPercent: {
        type: Number,
        
      },
      minTwelfthPercent: {
        type: Number,
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    logo: {
      type: String, 
      required: true,// Path or URL to uploaded JPG logo
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Job", jobSchema);
