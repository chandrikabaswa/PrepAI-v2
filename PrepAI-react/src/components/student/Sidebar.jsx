import "./Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <h2 className="logo" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
        AI Student Mentor
      </h2>

      <ul className="menu">
        <li
          className={isActive("/dashboard") ? "active" : ""}
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </li>

        <li
          className={isActive("/learning") ? "active" : ""}
          onClick={() => navigate("/learning")}
        >
          Learnings
        </li>

        <li
          className={isActive("/projects") ? "active" : ""}
          onClick={() => navigate("/projects")}
        >
          Project Guidance
        </li>

        <li
          className={isActive("/resume-analyzer") ? "active" : ""}
          onClick={() => navigate("/resume-analyzer")}
        >
          Resume Analyzer
        </li>

        <li
          className={isActive("/internships") ? "active" : ""}
          onClick={() => navigate("/internships")}
        >
          Internships
        </li>

        <li
          className={isActive("/mock-interview") ? "active" : ""}
          onClick={() => navigate("/mock-interview")}
        >
          Mock Interviews
        </li>
      </ul>
      <div className="signout" onClick={handleSignOut} style={{ cursor: "pointer" }}>
        Sign Out
      </div>
    </div>
  );
}
