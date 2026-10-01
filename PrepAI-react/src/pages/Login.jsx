import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");

  const [loginEmail, setLoginEmail] = useState("");

  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");

  const [signupEmail, setSignupEmail] = useState("");

  const [signupPassword, setSignupPassword] = useState("");

  async function createAccount() {
    if (!signupName || !signupEmail || !signupPassword) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await api.post("/users/signup", {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Account created successfully");

      navigate("/profile-setup");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    }
  }

  async function loginUser() {
    try {
      const res = await api.post("/users/login", {
        email: loginEmail,
        password: loginPassword,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="login-page">
      <div className="container">
        <h1>AI Student Career Mentor</h1>

        <p className="subtitle">Your personalized path to a tech career.</p>

        <div className="tabs">
          <button
            className={activeTab === "login" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>

          <button
            className={activeTab === "signup" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("signup")}
          >
            Sign Up
          </button>
        </div>

        {activeTab === "login" && (
          <div className="form-section">
            <label>Email</label>

            <input
              type="email"
              placeholder="student@university.edu.in"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />

            <button className="primary-btn" onClick={loginUser}>
              Login
            </button>
          </div>
        )}

        {activeTab === "signup" && (
          <div className="form-section">
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Alex Student"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
            />

            <label>Email</label>

            <input
              type="email"
              placeholder="student@university.edu.in"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Create password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
            />

            <button className="primary-btn" onClick={createAccount}>
              Create Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
