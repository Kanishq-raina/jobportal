import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import Job from "../models/job.js";
import Student from "../models/Student.js";
import { scoreResumeAgainstJob } from "../utils/atsScorer.js"; // ✅ Make sure this is correct
import { generateAIResumeFeedback } from "../utils/aiFeedback.js"; // ✅ Import the AI feedback function




export const scoreResumeForStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const job = await Job.findById(req.params.jobId);


    if (!student || !student.resumeLink) {
      return res.status(400).json({ message: "Resume not uploaded yet." });
    }


    if (!job || !job.description) {
      return res.status(400).json({ message: "Job description not found." });
    }


    const score = await scoreResumeAgainstJob(student.resumeLink, job.description);


    // 🔍 Parse resume text from PDF
    const resumePath = path.join(process.cwd(), student.resumeLink);
    const resumeBuffer = await fs.readFile(resumePath);
    const { text: resumeText } = await pdfParse(resumeBuffer);


    // 🧠 Generate AI Feedback
    const aiFeedback = await generateAIResumeFeedback(resumeText, job.description);


    res.json({ score, feedback: aiFeedback });
  } catch (err) {
    console.error("❌ Error scoring resume:", err);
    res.status(500).json({ message: "Failed to score resume." });
  }
};







