const express = require("express");
const router = express.Router();
const {registerUser,loginUser, showHistory,showProfile} =require("../controllers/authController");
const protect =require("../middleware/authMiddleware");

// routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/history", protect,showHistory);
router.get("/profile", protect,showProfile);

module.exports = router;