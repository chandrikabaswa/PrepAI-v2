import "./RecruiterTopbar.css";
import { useNavigate } from "react-router-dom";

export default function RecruiterTopbar({ user }) {
  const navigate = useNavigate();
  const currentUser = user || JSON.parse(localStorage.getItem("user")) || {};

  return (
    <div className="recruiter-topbar">
      <div className="recruiter-portal-badge">
        <span className="dot-indicator"></span> Recruiter Workspace
      </div>

      <div
        className="recruiter-profile-section"
        onClick={() => navigate("/recruiter/profile")}
      >
        <div className="recruiter-profile-info">
          <div className="recruiter-name">{currentUser.name || "Recruiter"}</div>
          <div className="recruiter-sub">
            {currentUser.companyName || currentUser.designation || "Company Portal"}
          </div>
        </div>

        <div className="recruiter-avatar">
          {currentUser.name ? currentUser.name[0].toUpperCase() : "R"}
        </div>
      </div>
    </div>
  );
}
