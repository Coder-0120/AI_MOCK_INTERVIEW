const express=require("express");
const router=express.Router();
const {generateQuestion,generatefeedback,saveInterview} =require("../controllers/interviewController");
const protect=require("../middleware/authMiddleware");

router.post("/questions",generateQuestion);
router.post("/feedback",generatefeedback);
router.post("/save",protect,saveInterview);

module.exports=router;
