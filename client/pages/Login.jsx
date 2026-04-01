import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);

      localStorage.setItem("token", res.data.token);
      alert("Login Successful");

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Error logging in");
    }
  };

  return (
    <div className="auth-container">
      <div className="bg-glow"></div>

      <form className="auth-box" onSubmit={handleSubmit}>
        <h2>Welcome Back 👋</h2>
        <p className="sub">Login to continue your AI interview journey</p>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <button type="submit">Login →</button>

        <p className="switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;