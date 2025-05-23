import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Routes
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import authRequestRoutes from "./routes/authRequestRoutes.js";
import courseRoutes from './routes/courseRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import JobRoundRoutes from "./routes/JobRoundRoutes.js";

import "./cronJob.js";

const PORT = process.env.PORT || 5000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Connect to DB
await connectDB();

// ✅ CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://172.20.10.3:5173'],
  credentials: true
}));

// ✅ JSON parser
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ✅ API Routes
app.use('/api', courseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', authRequestRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/jobround', JobRoundRoutes);
app.use('/api/contact', contactRoutes);
app.use('/uploads', express.static('uploads'));

// ✅ Serve static frontend files (after build)
const clientDistPath = path.resolve(__dirname, '..','client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // This will only match non-API routes (like '/', '/about', etc.)
  app.get(/^\/(?!api).*/, (_, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.warn('⚠️ Frontend not built. "client/dist" not found.');
}


// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
