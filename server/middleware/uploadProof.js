import multer from "multer";
import fs from "fs";
import path from "path";

const proofDir = path.join("uploads", "proofs");
if (!fs.existsSync(proofDir)) {
  fs.mkdirSync(proofDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, proofDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadProof = multer({ storage });

export default uploadProof;
