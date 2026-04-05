const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true   
    },
    role: {
      type: String,
      required: true
    },
    questions: {
      type: [String],
      required: true
    },
    answers: {
      type: [String],
      required: true
    },
    feedback: {
      type: String
    },
    score: {
      type: Number
    }
  },
  {
    timestamps: true   
  }
);

module.exports = mongoose.model("Interview", schema);