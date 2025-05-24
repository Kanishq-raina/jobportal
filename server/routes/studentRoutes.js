import express from "express";
import {
  applyToJob,
  getStudentJobs,
  getStudentProfile,
  updateCredentials,
 
 
  updateStudentProfile,
  updateStudentPhone,
  getResumeData,
  saveResumeData,
} from "../controllers/studentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import uploadResume from "../middleware/uploadResume.js";
import Student from "../models/Student.js";
import uploadProof from "../middleware/uploadProof.js";
import uploadMarksheet from "../middleware/uploadMarksheet.js"
import { submitAuthRequest } from "../controllers/authRequestController.js";
import path from "path";
import fs from "fs";
import { sendStudentEmailOTP, verifyStudentEmailOTP,getStudentAuthRequests } from '../controllers/studentController.js';
import { getStudentApplicationsWithRounds } from "../controllers/studentController.js";
import { scoreResumeForStudent } from '../controllers/resumeScoreController.js';






const router = express.Router();
let verificationMap = {};
router.get("/profile", verifyToken, getStudentProfile);
router.patch("/credentials", verifyToken, updateCredentials);


router.patch('/profileupdate', verifyToken, updateStudentProfile);
router.post("/apply/:jobId", verifyToken, applyToJob);
router.get("/jobs", verifyToken, getStudentJobs);
router.post("/auth-request", verifyToken, uploadProof.single("proof"), submitAuthRequest);
router.post("/update-phone", verifyToken, updateStudentPhone);
router.get("/resume", verifyToken, getResumeData);
router.post("/resume", verifyToken, saveResumeData);
router.post('/send-email-otp', verifyToken, sendStudentEmailOTP);
router.post('/verify-email-otp', verifyToken, verifyStudentEmailOTP);
router.get("/authrequests",verifyToken,getStudentAuthRequests);
router.get("/requests", verifyToken, getStudentAuthRequests); // <-- Add this


router.get("/applications", verifyToken, getStudentApplicationsWithRounds);


router.get('/resume/score/:jobId', verifyToken, scoreResumeForStudent);
















router.post("/upload-resume", verifyToken, uploadResume.single("resume"), async (req, res) => {
  try {
    const userId = req.user.id;

    const student = await Student.findOne({ user: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Delete old resume if exists
    if (student.resumeLink) {
      try {
        await fs.promises.unlink(student.resumeLink);
      } catch (err) {
        console.warn("Old resume not found or already deleted");
      }
    }

    student.resumeLink = req.file.path; // ✅ Absolute path that exists even on Render's /tmp
    await student.save();

    res.status(200).json({ message: "Resume uploaded", path: req.file.path });
  } catch (err) {
    console.error("Resume upload error:", err);
    res.status(500).json({ message: "Failed to upload resume" });
  }
});

// Add this line
// server/routes/student.js




// POST /api/student/start-phone-verification
router.post(
  "/upload-marksheet",
  verifyToken,
  uploadMarksheet.single("marksheet"),
  async (req, res) => {
    try {
      const { type } = req.body; // Should be "10" or "12"
      const userId = req.user.id;

      const student = await Student.findOne({ user: userId });
      if (!student) return res.status(404).json({ message: "Student not found" });

      // This is the URL path that will work with express.static('/uploads', express.static('/tmp'))
      const filePath = `/uploads/marksheets/${req.file.filename}`;

      if (type === "10") {
        student.tenthMarksheet = filePath;
      } else if (type === "12") {
        student.twelfthMarksheet = filePath;
      } else {
        return res.status(400).json({ message: "Invalid marksheet type" });
      }

      await student.save();

      res.status(200).json({ message: `${type}th Marksheet uploaded`, path: filePath });
    } catch (err) {
      console.error("❌ Marksheet upload error:", err);
      res.status(500).json({ message: "Failed to upload marksheet" });
    }
  }
);



export default router;



