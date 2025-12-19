import multer from "multer";
import path from "path";
import fs from "fs";

const logoDir = path.join("/tmp", "logos");

if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, logoDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  },
});

const uploadLogo = multer({ storage });

export default uploadLogo;
