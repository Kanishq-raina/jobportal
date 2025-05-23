import express from "express";




import Job from "../models/job.js";
import Student from "../models/Student.js";
import JobToken from "../models/JobToken.js"; // ✅ Add this


const router = express.Router();


// GET job from token
router.get("/token/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const jobToken = await JobToken.findOne({ token });


    if (!jobToken || jobToken.expiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired job token" });
    }


    const job = await Job.findById(jobToken.jobId);
    const student = await Student.findOne({ user: jobToken.studentId }).populate("user");


    if (!job) return res.status(404).json({ message: "Job not found" });


    res.status(200).json({ job, student });
  } catch (err) {
    console.error("Token lookup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;





