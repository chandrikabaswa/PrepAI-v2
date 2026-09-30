import "./RecruiterSidebar.css";
import { useNavigate, useLocation } from "react-router-dom";

export default function RecruiterSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path) => {
    if (path === "/recruiter/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="recruiter-sidebar">
      <div className="recruiter-logo-container" onClick={() => navigate("/recruiter/dashboard")}>
        <h2 className="recruiter-logo">PrepAI Recruiter</h2>
        <span className="recruiter-badge">Portal</span>
      </div>

      <ul className="recruiter-menu">
        <li
          className={isActive("/recruiter/dashboard") ? "active" : ""}
          onClick={() => navigate("/recruiter/dashboard")}
        >
          📊 Dashboard
        </li>

        <li
          className={isActive("/recruiter/internships") ? "active" : ""}
          onClick={() => navigate("/recruiter/internships")}
        >
          💼 Manage Postings
        </li>

        <li
          className={isActive("/recruiter/post-internship") ? "active" : ""}
          onClick={() => navigate("/recruiter/post-internship")}
        >
          ➕ Post Internship
        </li>

        <li
          className={isActive("/recruiter/candidates") ? "active" : ""}
          onClick={() => navigate("/recruiter/candidates")}
        >
          🎯 Candidate Matching
        </li>

        <li
          className={isActive("/recruiter/profile") ? "active" : ""}
          onClick={() => navigate("/recruiter/profile")}
        >
          🏢 Company Profile
        </li>
      </ul>

      <div className="recruiter-signout" onClick={handleSignOut}>
        🚪 Sign Out
      </div>
    </div>
  );
}
