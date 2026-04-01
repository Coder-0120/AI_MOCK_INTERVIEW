import React from "react";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "User"
  };

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
        }

        .dashboard {
          padding: 20px;
        }

        .header {
          font-size: 24px;
          margin-bottom: 20px;
        }

        .start-btn {
          padding: 12px 20px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }

        .start-btn:hover {
          background-color: #218838;
        }

        .section {
          background: white;
          padding: 15px;
          margin-top: 20px;
          border-radius: 8px;
          box-shadow: 0 0 5px rgba(0,0,0,0.1);
        }

        .section h3 {
          margin-bottom: 10px;
        }

        .stats {
          display: flex;
          gap: 20px;
        }

        .card {
          flex: 1;
          background: #f9f9f9;
          padding: 10px;
          border-radius: 6px;
          text-align: center;
        }

        .logout-btn {
          margin-top: 20px;
          padding: 10px;
          background-color: red;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .logout-btn:hover {
          background-color: darkred;
        }
      `}</style>

      <div className="dashboard">
        <div className="header">
          Welcome {user.name} 👋
        </div>

        <button className="start-btn">
          Start Mock Interview 🚀
        </button>

        <div className="section">
          <h3>Stats</h3>
          <div className="stats">
            <div className="card">
              <p>Interviews</p>
              <h4>5</h4>
            </div>
            <div className="card">
              <p>Best Score</p>
              <h4>8.2</h4>
            </div>
            <div className="card">
              <p>Weak Area</p>
              <h4>Communication</h4>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>AI Suggestions</h3>
          <ul>
            <li>Improve confidence</li>
            <li>Practice DSA daily</li>
          </ul>
        </div>

        <div className="section">
          <h3>Recent Activity</h3>
          <p>Frontend Interview → 7/10</p>
          <p>HR Round → 6/10</p>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>
    </>
  );
};

export default Dashboard;