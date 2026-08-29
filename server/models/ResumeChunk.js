const mongoose = require("mongoose");

const resumeChunkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    text: {
      type: String,
      required: true
    },

    chunkIndex: {
      type: Number,
      required: true
    },

    // We'll populate this in the next RAG step
    embedding: {
      type: [Number],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "ResumeChunk",
  resumeChunkSchema
);