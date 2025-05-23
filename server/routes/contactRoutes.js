import express from 'express';
import { sendContactEmail } from '../controllers/contactController.js';
import { verifyToken } from '../middleware/authMiddleware.js';


const router = express.Router();
router.post('/send', verifyToken, sendContactEmail);
export default router;



