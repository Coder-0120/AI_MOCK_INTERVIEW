const model=require("../config/gemini");
const InterviewModel=require("../models/Interview");
const generateQuestion=async(req,res)=>{
  try {
    const { role } = req.body;

    const prompt = `Generate 2 interview questions for ${role}. 
    Only give questions line by line.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const questions = text
      .split("\n")
      .map(q => q.trim())
      .filter(q => q !== "");

    res.json({ questions });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error generating questions" });
  }
}

const generatefeedback=async(req,res)=>{
  try{

    const{role,questions,answers}=req.body;
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
      userId: req.user._id  
    });

    await data.save();

    res.json({ msg: "Saved" });
  } catch (err) {
    return res.status(500).json({ message: "Error in saving data" });
  }
};



module.exports={generateQuestion,generatefeedback,saveInterview};