import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import RecruiterSidebar from "../components/RecruiterSidebar";
import RecruiterTopbar from "../components/RecruiterTopbar";
import "./RecruiterDashboard.css";

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [profileRes, postingsRes] = await Promise.all([
          api.get("/users/profile"),
          api.get("/internships/recruiter/my-postings"),
        ]);
        setUser(profileRes.data);
        setPostings(postingsRes.data || []);
      } catch (err) {
        console.error("Failed to load recruiter dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const activeCount = postings.filter((p) => p.status !== "Closed").length;

  return (
    <div className="layout">
      <RecruiterSidebar />

      <div className="recruiter-main">
        <RecruiterTopbar user={user} />

        <div className="dashboard-welcome">
          <div>
            <h1>Welcome, {user.name} 👋</h1>
            <p>
              Manage your internship openings and discover top tech talent for{" "}
              <strong>{user.companyName || "your company"}</strong>.
            </p>
          </div>

          <button
            className="header-action-btn"
            onClick={() => navigate("/recruiter/post-internship")}
          >
            ➕ Post New Internship
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-box purple">💼</div>
            <div>
              <div className="kpi-value">{postings.length}</div>
              <div className="kpi-title">Total Postings</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box green">🟢</div>
            <div>
              <div className="kpi-value">{activeCount}</div>
              <div className="kpi-title">Active Postings</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box indigo">🏢</div>
            <div>
              <div className="kpi-value">{user.companyName ? "Verified" : "Setup"}</div>
              <div className="kpi-title">Company Profile</div>
            </div>
          </div>
        </div>

        {/* Recent Postings Section */}
        <div className="card dashboard-section-card">
          <div className="section-title-row">
            <div>
              <h3>Recent Internship Postings</h3>
              <p>Quick access to your latest opportunities and matched candidates.</p>
            </div>

            <Link to="/recruiter/internships" className="view-all-link">
              View All Postings →
            </Link>
          </div>

          {loading ? (
            <p>Loading your dashboard...</p>
          ) : postings.length === 0 ? (
            <div className="empty-dashboard-box">
              <div className="empty-icon">🚀</div>
              <h4>No internships posted yet</h4>
              <p>Post your first internship to start finding qualified student applicants.</p>
              <button
                className="header-action-btn"
                onClick={() => navigate("/recruiter/post-internship")}
              >
                Post Your First Internship
              </button>
            </div>
          ) : (
            <div className="dashboard-postings-list">
              {postings.slice(0, 4).map((job) => (
                <div key={job._id} className="dashboard-job-row">
                  <div className="job-info">
                    <h4>{job.title}</h4>
                    <div className="job-sub">
                      📍 {job.location} • 💻 {job.mode} • 💰 {job.stipend}
                    </div>
                  </div>

                  <div className="job-skills-preview">
                    {(job.skills || []).slice(0, 3).map((s) => (
                      <span key={s} className="tag-preview">
                        {s}
                      </span>
                    ))}
                    {(job.skills || []).length > 3 && (
                      <span className="tag-more">+{job.skills.length - 3}</span>
                    )}
                  </div>

                  <div className="job-actions">
                    <button
                      className="view-matches-btn"
                      onClick={() => navigate(`/recruiter/candidates/${job._id}`)}
                    >
                      🎯 Match Candidates
                    </button>
                    <button
                      className="quick-edit-btn"
                      onClick={() => navigate(`/recruiter/edit-internship/${job._id}`)}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips & Next Steps */}
        <div className="dashboard-footer-grid">
          <div className="card tip-card">
            <h4>💡 Recruiter Pro-Tip</h4>
            <p>
              Include detailed skills in your postings (e.g. React, Docker, Python). Our matching
              algorithm scores candidates against your skill tags to present the best talent first.
            </p>
          </div>

          <div className="card tip-card">
            <h4>🏢 Complete Your Profile</h4>
            <p>
              Students are 4x more likely to apply to internships from companies with detailed bios,
              office locations, and official websites.
            </p>
            <Link to="/recruiter/profile" className="profile-link">
              Update Company Profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
