import { useState } from "react";
import { useNavigate } from "react-router-dom";

function InterviewSetup() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  return (
    <div>
      <h2>Select Role</h2>

      <select onChange={(e) => setRole(e.target.value)}>
        <option value="">Select</option>
        <option value="frontend">Frontend</option>
        <option value="backend">Backend</option>
        <option value="mern">MERN</option>
      </select>

      <br /><br />

      <button
        onClick={() => navigate("/session", { state: { role } })}
      >
        Start
      </button>
    </div>
  );
}

export default InterviewSetup;