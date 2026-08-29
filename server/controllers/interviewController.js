const model=require("../config/gemini");
const InterviewModel=require("../models/Interview");
const generateEmbedding = require("../services/embeddingService");
const retrieveResumeContext = require("../services/retriever");
const generateQuestion = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        error: "Role is required"
      });
    }

    // Query used for resume retrieval
    const query = `${role} interview questions candidate skills projects experience`;

    // Convert query into embedding
    const queryEmbedding = await generateEmbedding(query);

    // Retrieve relevant chunks from THIS user's resume
    const relevantChunks = await retrieveResumeContext(
      req.user._id,
      queryEmbedding,
      3
    );

    // Convert retrieved chunks into context
    const resumeContext = relevantChunks
      .map((chunk, index) => {
        return `Resume Context ${index + 1}:\n${chunk.text}`;
      })
      .join("\n\n");

    const prompt = `
You are an expert technical interviewer.

Candidate Role:
${role}

Candidate Resume:
${resumeContext || "No relevant resume information was found."}

Generate exactly 2 interview questions.

IMPORTANT:
- Make the questions relevant to the candidate's resume.
- Prefer asking about their actual projects, skills, technologies, and experience.
- Do not invent experience that is not present in the resume.
- Mix conceptual and practical/scenario-based questions when appropriate.
- If the resume contains a project using a technology relevant to the role, ask about that project.
- Return ONLY the questions, one per line.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const questions = text
      .split("\n")
      .map(q => q.trim())
      .filter(q => q !== "");

    res.json({
      questions,
      resumeBased: relevantChunks.length > 0
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Error generating questions"
    });
  }
};

const generatefeedback=async(req,res)=>{
  try{

    const{role,questions,answers,cameraStats }=req.body;
    const prompt = `
    You are an interviewer.
    Role: ${role}
    Questions:
    ${questions.join("\n")}
    Answers:
    ${answers.join("\n")}
    Give:
    1. Feedback
    2. Score out of 10 (just number)
    Format:
    Feedback: ...
    Score: ...
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    let score = 0;
    const match = text.match(/Score:\s*(\d+)/i);
    if (match) score = parseInt(match[1]);
    
    res.json({
      feedback: text,
      score
    });
  }
  catch(err){
     console.log(err);
    res.status(500).json({ error: "Error generating feedback" });
  }

}
const saveInterview = async (req, res) => {
  try {
    const data = new InterviewModel({
      ...req.body,
      userId: req.user._id, 
      faceOffSeconds: req.body.cameraStats?.faceOffSeconds || 0
 
    });

    await data.save();

    res.json({ msg: "Saved" });
  } catch (err) {
    return res.status(500).json({ message: "Error in saving data" });
  }
};



module.exports={generateQuestion,generatefeedback,saveInterview};