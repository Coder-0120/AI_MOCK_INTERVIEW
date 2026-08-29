const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const InterviewModel = require("../models/Interview");
const extractResumeText = require("../services/resumeParser");
const chunkText = require("../services/chunker");
const ResumeChunk = require("../models/ResumeChunk");
const generateEmbedding = require("../services/embeddingService");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// to register new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Resume will come through multer
    const resume = req.file;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Resume is required during signup
    if (!resume) {
      return res.status(400).json({
        message: "Resume is required during signup",
      });
    }
    // Extract text from resume
    const resumeText = await extractResumeText(resume);

    if (!resumeText) {
      return res.status(400).json({
        message: "Could not extract text from resume",
      });
    }

    // Check user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,

      resume: {
        fileName: resume.originalname,
        uploadedAt: new Date(),
        processed: false,
      },
    });
  const chunks = chunkText(resumeText);

if (chunks.length > 0) {
  const resumeChunks = [];

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i]);

    resumeChunks.push({
      userId: user._id,
      text: chunks[i],
      chunkIndex: i,
      embedding: embedding
    });
  }

  await ResumeChunk.insertMany(resumeChunks);
}

    // Generate token immediately
    const token = generateToken(user._id);

    // Return token so frontend can directly login
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      resume: {
        fileName: resume.originalname,
        processed: false,
      },
    });

// Mark resume as processed
user.resume.processed = true;
await user.save();

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
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
const showHistory = async (req, res) => {
  try {
    // console.log(req.user);
    // console.log(req.user._id);
    const history = await InterviewModel.find({ userId: req.user._id }).sort({ createdAt: -1 });
    if (history.length === 0) {
      return res.status(200).json({
        message: "No records found",
        history: []
      });
    }
    return res.status(201).json({ message: "All interview history fetched succesfully..", history: history });
  }
  catch (error) {
    return res.status(500).json({ message: error.message })
  }

}
const showProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports = { registerUser, loginUser, showHistory, showProfile };