const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
    Evaluate this interview answer:

    Question: ${question}
    Answer: ${answer}

    Give:
    - Score out of 10
    - Strengths
    - Weaknesses
    - Suggestions
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({ feedback: response });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports={analyzeAnswer};