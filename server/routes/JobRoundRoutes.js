import express from "express";
import { uploadRoundResults, getRoundsForJob, sendRoundEmails } from "../controllers/JobRoundController.js";
import uploadExcel from "../middleware/uploadExcel.js";
import { verifyToken } from "../middleware/authMiddleware.js";


const router = express.Router();


// Upload Excel for a round
router.post(
  "/upload/:jobId/:roundType",
  verifyToken,
  uploadExcel.single("excel"),
  uploadRoundResults
);


// Get all rounds for a job
router.get("/:jobId", verifyToken, getRoundsForJob);


// Send mail to selected students
router.post("/:jobId/:roundType/send-mails", verifyToken, sendRoundEmails);


export default router;





