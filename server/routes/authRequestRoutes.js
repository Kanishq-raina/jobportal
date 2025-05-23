// server/routes/authRequestRoutes.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getAllAuthRequests,
  approveAuthRequest,
  rejectAuthRequest,
  deleteAuthRequest,
} from "../controllers/authRequestController.js";

const router = express.Router();

// Use full path explicitly (not relying on app.use prefix)
router.get("/authrequests", verifyToken, getAllAuthRequests);
router.patch("/authrequests/:id/approve", verifyToken, approveAuthRequest);
router.patch("/authrequests/:id/reject", verifyToken, rejectAuthRequest);
router.delete("/authrequests/:id", verifyToken, deleteAuthRequest);


export default router;
