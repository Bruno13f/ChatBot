// backend/middleware/upload.js
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log("🔍 Multer fileFilter - Processing file:", file.originalname);
    // Check if file is an image
    if (file.mimetype.startsWith("image/")) {
      console.log("✅ File accepted:", file.mimetype);
      cb(null, true);
    } else {
      console.log("❌ File rejected:", file.mimetype);
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

module.exports = upload;
