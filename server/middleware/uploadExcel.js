import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads/excels directory exists
const uploadDir = path.join('uploads', 'excels');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const uploadExcel = multer({ storage });

export default uploadExcel;
