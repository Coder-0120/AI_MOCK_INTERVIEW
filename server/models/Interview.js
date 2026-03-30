import mongoose from "mongoose";

const qaSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },

  answerText: {
    type: String,
    default: "",
  },

  // AI Evaluation
  score: {
    type: Number,
    default: 0,
  },

  feedback: {
    type: String,
    default: "",
  },

  // Future AI features
  confidenceScore: {
    type: Number,
    default: 0,
  },

  emotion: {
    type: String,
    default: "neutral",
  },

  speakingSpeed: {
    type: Number,
    default: 0,
  },
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    // All questions + answers together
    qa: [qaSchema],

    // Final result
    overallScore: {
      type: Number,
      default: 0,
    },

    feedbackSummary: {
      type: String,
      default: "",
    },

    // Status of interview
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);