import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function Session() {
  const { state } = useLocation();
  const role = state?.role;

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [listening, setListening] = useState(false);

  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(null);
  const [completed, setCompleted] = useState(false);

  const token = localStorage.getItem("token");

  // 🎤 Speech Recognition (FIXED)
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;

      setAnswers((prev) => [...prev, text]);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // 🔥 Get AI Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/interview/questions",
          { role }
        );
        setQuestions(res.data.questions);
      } catch (err) {
        console.error(err);
      }
    };

    fetchQuestions();
  }, [role]);

  const startRecording = () => {
    if (!recognitionRef.current) return;

    setListening(true);
    recognitionRef.current.start();
  };

  const nextQuestion = async () => {
    // if not last question
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      try {
        // 🎯 Get feedback from AI
        const res = await axios.post(
          "http://localhost:5000/api/interview/feedback",
          {
            role,
            questions,
            answers
          }
        );

        console.log("FEEDBACK:", res.data);

        // ✅ store feedback
        setFeedback(res.data.feedback);
        setScore(res.data.score);

        // 💾 Save to DB
        await axios.post(
          "http://localhost:5000/api/interview/save",
          {
            role,
            questions,
            answers,
            feedback: res.data.feedback,
            score: res.data.score
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        // ✅ mark completed
        setCompleted(true);

      } catch (err) {
        console.error(err);
        alert("Error occurred");
      }
    }
  };

  return (
    <div>
      <h3>Role: {role}</h3>

      {/* 🧠 Interview Section */}
      {!completed && questions.length > 0 && (
        <>
          <p>
            Question {current + 1} of {questions.length}
          </p>

          <p>{questions[current]}</p>

          <button onClick={startRecording}>
            {listening ? "Listening..." : "Speak Answer"}
          </button>

          <br /><br />

          <button onClick={nextQuestion}>
            {current === questions.length - 1 ? "Submit" : "Next"}
          </button>
        </>
      )}

      {/* 🎯 RESULT SECTION */}
      {completed && (
        <div>
          <h2>Interview Completed</h2>

          <h3>Feedback:</h3>
          <p>{feedback}</p>

          <h3>Score: {score} / 10</h3>
        </div>
      )}
    </div>
  );
}

export default Session;