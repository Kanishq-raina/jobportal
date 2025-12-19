import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Use /tmp on Render, otherwise use local uploads/resumes
const isRender = process.env.RENDER === "true" || process.env.NODE_ENV === "production";
const resumeDir = isRender ? "/tmp" : path.join(process.cwd(), "uploads", "resumes");

if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, resumeDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    req.tempResumePath = path.join(resumeDir, filename); // ✅ pass path to controller
    cb(null, filename);
  },
});

const uploadResume = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"));
  },
});

export default uploadResume;
