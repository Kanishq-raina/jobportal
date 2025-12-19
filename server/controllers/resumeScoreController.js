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

    // 🧠 Score based on file path (handle /tmp for Render)
    const resumePath = path.isAbsolute(student.resumeLink)
      ? student.resumeLink
      : path.join(process.cwd(), student.resumeLink);

    // ✅ Check if file exists
    try {
      await fs.access(resumePath);
    } catch {
      return res.status(404).json({ message: "Resume file not found on server." });
    }

    // 🔍 Read and parse resume PDF
    const resumeBuffer = await fs.readFile(resumePath);
    const { text: resumeText } = await pdfParse(resumeBuffer);

    // 📊 ATS Score + AI Feedback
    const score = await scoreResumeAgainstJob(resumeText, job.description);
    const aiFeedback = await generateAIResumeFeedback(resumeText, job.description);

    res.json({ score, feedback: aiFeedback });
  } catch (err) {
    console.error("❌ Error scoring resume:", err);
    res.status(500).json({ message: "Failed to score resume." });
  }
};







