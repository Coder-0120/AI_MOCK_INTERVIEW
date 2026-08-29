const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  registerUser,
  loginUser,
  showHistory,
  showProfile
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

// -----------------------------
// Multer configuration
// -----------------------------

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX resumes are allowed"));
    }
  }
});

// -----------------------------
// Routes
// -----------------------------

router.post(
  "/register",
  upload.single("resume"),
  registerUser
);

router.post("/login", loginUser);

router.get("/history", protect, showHistory);

router.get("/profile", protect, showProfile);

module.exports = router;