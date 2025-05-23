import express from 'express';
import { login ,forgotPassword,resetPassword,setPassword,} from '../controllers/authController.js';


const router = express.Router();

// Existing login route
router.post('/login', login);

// ✅ Forgot password route
router.post('/forgot-password', forgotPassword);

// ✅ Reset password route
router.post('/reset-password', resetPassword);

router.post("/set-password",setPassword);

export default router;
