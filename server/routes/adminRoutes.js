import express from 'express';
import { getAdminProfile,getAllStudents ,addSingleStudent,addBulkStudents,sendMailToStudents,deleteStudents,sendRejectionMail,updateAdminCredentials,updateAdminPhone,updateStudentByAdmin,updateStudentsFromExcel} from '../controllers/adminController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import {  getStudentProfileForAdmin } from '../controllers/studentController.js';
import { createJob ,uploadJobsFromExcel, getAllJobs,deleteJob,updateJob,getJobApplicants,updateApplicantStatus} from '../controllers/jobController.js';
import uploadLogo from '../middleware/uploadLogo.js';
import uploadExcel  from '../middleware/uploadExcel.js';


import {
  sendAdminEmailOTP,
  verifyAdminEmailOTP,
} from '../controllers/adminController.js';
import { sendReminderMailToNonApplicants } from "../controllers/adminController.js";

import { getDashboardMetrics } from "../controllers/adminController.js";













const router = express.Router();


// @route GET /api/admin/profile
router.get('/profile', verifyToken, getAdminProfile);
router.post('/add-student', verifyToken, addSingleStudent);
router.post('/add-students-bulk', verifyToken, addBulkStudents);
router.get('/students',verifyToken,getAllStudents);
router.post('/send-mail', verifyToken, sendMailToStudents);
router.post('/create-job', verifyToken,uploadLogo.single('logo'), createJob);
router.post('/delete-students', verifyToken, deleteStudents);
router.post('/send-rejection-mail', verifyToken, sendRejectionMail);
router.post('/upload-jobs-excel', verifyToken,uploadExcel.single('excelFile'),uploadJobsFromExcel);
router.get('/jobs', verifyToken, getAllJobs);
router.delete('/jobs/:id', verifyToken, deleteJob);
router.put('/jobs/:id', verifyToken, updateJob);
router.get('/jobs/:id/applicants', verifyToken, getJobApplicants);
router.put('/jobs/:id/applicants/:studentId/:action', verifyToken, updateApplicantStatus);
router.patch('/credentials',verifyToken,updateAdminCredentials);
router.patch('/update-phone',verifyToken,updateAdminPhone);
router.get('/student/:id',verifyToken,getStudentProfileForAdmin);
router.put('/update-student/:id',verifyToken,updateStudentByAdmin);
router.post('/update-students-excel',verifyToken,uploadExcel.single("file"),updateStudentsFromExcel);
router.post('/send-email-otp', verifyToken, sendAdminEmailOTP);
router.post('/verify-email-otp', verifyToken, verifyAdminEmailOTP);
router.post("/send-reminder-mail", verifyToken, sendReminderMailToNonApplicants);
router.get("/dashboard-metrics", getDashboardMetrics);
export default router;





