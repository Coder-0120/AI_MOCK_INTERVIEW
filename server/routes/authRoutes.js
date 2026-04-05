const express = require("express");
const router = express.Router();
const {registerUser,loginUser, showHistory} =require("../controllers/authController");
const protect =require("../middleware/authMiddleware");

// routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/history", protect,showHistory);

module.exports = router;