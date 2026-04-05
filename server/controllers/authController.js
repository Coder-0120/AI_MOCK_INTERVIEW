const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const InterviewModel=require("../models/Interview");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// to register new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// to login user 
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// to fetch all interview per users 
const showHistory=async(req,res)=>{
  try{
    // console.log(req.user);
    // console.log(req.user._id);
    const history=await InterviewModel.find({userId:req.user._id}).sort({createdAt:-1});
   if (history.length === 0) {
      return res.status(200).json({
        message: "No records found",
        history: []
      });
    }
    return res.status(201).json({message:"All interview history fetched succesfully..",history:history});
  }
  catch(error){
    return res.status(500).json({message:error.message})
  }

}
module.exports={registerUser,loginUser,showHistory};