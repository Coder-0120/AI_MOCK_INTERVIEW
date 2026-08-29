const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001",
});

const generateEmbedding = async (text) => {
  if (!text || !text.trim()) {
    throw new Error("Text is required for embedding");
  }

  const result = await embeddingModel.embedContent(text);

  return result.embedding.values;
};

module.exports = generateEmbedding;