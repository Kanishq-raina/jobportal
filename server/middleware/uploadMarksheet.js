import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Use /tmp for Render deployment compatibility
const uploadPath = path.join("/tmp", "marksheets");

// ✅ Ensure the folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-marksheet${ext}`);
  },
});

const uploadMarksheet = multer({ storage });

export default uploadMarksheet;
