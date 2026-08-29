const ResumeChunk = require("../models/ResumeChunk");

const cosineSimilarity = (a, b) => {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
};

const retrieveResumeContext = async (
  userId,
  queryEmbedding,
  topK = 3
) => {
  const chunks = await ResumeChunk.find({
    userId,
    embedding: { $exists: true, $ne: [] }
  }).lean();

  const results = chunks.map((chunk) => ({
    text: chunk.text,
    chunkIndex: chunk.chunkIndex,
    score: cosineSimilarity(
      queryEmbedding,
      chunk.embedding
    )
  }));

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topK);
};

module.exports = retrieveResumeContext;