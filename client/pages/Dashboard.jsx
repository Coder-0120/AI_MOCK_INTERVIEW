import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();


  return (
    <div>
      <h2>Welcome User</h2>

      <button onClick={() => navigate("/setup")}>
        Start Interview
      </button>
    </div>
  );
}

export default Dashboard;