import "./Sidebar.css";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <div className="sidebar">
      <h2 className="logo">AI Student Mentor</h2>

      <ul className="menu">
        <li onClick={() => navigate("/dashboard")}>Dashboard</li>

        <li onClick={() => navigate("/projects")}>Project Guidance</li>

        <li onClick={() => navigate("/resume-analyzer")}>Resume Analyzer</li>

        <li onClick={() => navigate("/internships")}>Internships</li>

        <li onClick={() => navigate("/my-applications")}>My Applications</li>

        <li onClick={() => navigate("/mock-interview")}>Mock Interview</li>

        <li onClick={() => navigate("/profile")}>Profile</li>
      </ul>

      <div className="signout">Sign Out</div>
    </div>
  );
}
