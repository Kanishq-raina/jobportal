import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/marksheets/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-marksheet${ext}`);
  },
});

const uploadMarksheet = multer({ storage });

export default uploadMarksheet;
