const express=require("express");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes=require("./routes/authRoutes");
const interviewRoutes =require("./routes/interviewRoutes");
const app=express();
const cors=require("cors");
app.use(cors());
app.use(express.json());
connectDB();
app.get("/",(req,res)=>{
    res.send("hello world..");
})

app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);
app.listen(5000,()=>{
    console.log("server is running on port 5000");
})