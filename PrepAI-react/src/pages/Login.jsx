import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState("student");
  const [activeTab, setActiveTab] = useState("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupCompany, setSignupCompany] = useState("");

  async function createAccount() {
    if (!signupName || !signupEmail || !signupPassword) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await api.post("/users/signup", {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        role: userRole,
        companyName: userRole === "recruiter" ? signupCompany : "",
      });

if (res.data.token) {
  localStorage.setItem("token", res.data.token);
}

if (res.data.user) {
  localStorage.setItem("user", JSON.stringify(res.data.user));
}

if (userRole === "recruiter") {
  alert("Account created successfully! Please login.");
  setActiveTab("login");
} else {
  alert("Account created successfully");
  navigate("/profile-setup");
}
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

      if (res.data.user?.role === "recruiter") {
        navigate("/recruiter/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="login-page">
      <div className="container">
        {/* Role Switcher */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${userRole === "student" ? "active" : ""}`}
            onClick={() => setUserRole("student")}
          >
            🎓 Student
          </button>
          <button
            type="button"
            className={`role-btn ${userRole === "recruiter" ? "active" : ""}`}
            onClick={() => setUserRole("recruiter")}
          >
            💼 Recruiter
          </button>
        </div>

        <h1>
          {userRole === "recruiter"
            ? "PrepAI Recruiter Portal"
            : "AI Student Career Mentor"}
        </h1>

        <p className="subtitle">
          {userRole === "recruiter"
            ? "Post openings and match with top pre-vetted tech talent."
            : "Your personalized path to a tech career."}
        </p>

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
              placeholder={
                userRole === "recruiter"
                  ? "recruiter@company.com"
                  : "student@university.edu.in"
              }
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
              {userRole === "recruiter" ? "Login to Recruiter Portal" : "Login"}
            </button>
          </div>
        )}

        {activeTab === "signup" && (
          <div className="form-section">
            <label>Full Name</label>

            <input
              type="text"
              placeholder={
                userRole === "recruiter" ? "Sarah Recruiter" : "Alex Student"
              }
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
            />

            {userRole === "recruiter" && (
              <>
                <label>Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={signupCompany}
                  onChange={(e) => setSignupCompany(e.target.value)}
                />
              </>
            )}

            <label>Work / Personal Email</label>

            <input
              type="email"
              placeholder={
                userRole === "recruiter"
                  ? "recruiter@company.com"
                  : "student@university.edu.in"
              }
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
              {userRole === "recruiter"
                ? "Create Recruiter Account"
                : "Create Account"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
