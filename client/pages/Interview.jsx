import React, { useState } from "react";
import axios from "axios";

const Interview = () => {
  const [question] = useState("Tell me about yourself");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");

  let recognition;

  const startRecording = () => {
    recognition = new window.webkitSpeechRecognition();
    recognition.start();

    recognition.onresult = (event) => {
      setAnswer(event.results[0][0].transcript);
    };
  };

  const stopRecording = () => {
    if (recognition) recognition.stop();
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/interview/analyze",
        { question, answer }
      );

      setResult(res.data.feedback);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Mock Interview</h2>

      <h3>Question:</h3>
      <p>{question}</p>

      <button onClick={startRecording}>Start 🎤</button>
      <button onClick={stopRecording}>Stop ⏹️</button>

      <h3>Your Answer:</h3>
      <p>{answer}</p>

      <button onClick={handleSubmit}>Submit</button>

      <h3>Result:</h3>
      <p>{result}</p>
    </div>
  );
};

export default Interview;