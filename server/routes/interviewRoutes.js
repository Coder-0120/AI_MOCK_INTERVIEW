const express = require("express");
const router = express.Router();
const { analyzeAnswer } = require("../controllers/interviewController");

router.post("/analyze", analyzeAnswer);

module.exports = router;