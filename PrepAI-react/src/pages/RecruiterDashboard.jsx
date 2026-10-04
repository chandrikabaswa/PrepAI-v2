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
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [profileRes, postingsRes, analyticsRes] = await Promise.all([
          api.get("/users/profile"),
          api.get("/internships/recruiter/my-postings"),
          api
            .get("/applications/recruiter/analytics")
            .catch(() => ({ data: null })),
        ]);
        setUser(profileRes.data || {});
        setPostings(postingsRes.data || []);
        if (analyticsRes.data) {
          setAnalytics(analyticsRes.data);
        }
      } catch (err) {
        console.error("Failed to load recruiter dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const metrics = analytics?.metrics || {};
  const statusCounts = metrics.statusCounts || {
    Applied: 0,
    Reviewing: 0,
    Shortlisted: 0,
    Rejected: 0,
  };
  const recentApps = analytics?.recentApplications || [];

  const totalPostings = metrics.totalPostings ?? postings.length;
  const activeCount =
    metrics.activePostings ??
    postings.filter((p) => p.status !== "Closed").length;
  const totalApplicants = metrics.totalApplicants ?? 0;

  // Pipeline percentages
  const totalAppsForFunnel = totalApplicants > 0 ? totalApplicants : 1;
  const appliedPct = Math.round(
    ((statusCounts.Applied || 0) / totalAppsForFunnel) * 100
  );
  const reviewingPct = Math.round(
    ((statusCounts.Reviewing || 0) / totalAppsForFunnel) * 100
  );
  const shortlistedPct = Math.round(
    ((statusCounts.Shortlisted || 0) / totalAppsForFunnel) * 100
  );
  const rejectedPct = Math.round(
    ((statusCounts.Rejected || 0) / totalAppsForFunnel) * 100
  );

  return (
    <div className="layout">
      <RecruiterSidebar />

      <div className="recruiter-main">
        <RecruiterTopbar user={user} />

        {/* Dashboard Header */}
        <div className="dashboard-welcome">
          <div>
            <h1>Welcome, {user.name} 👋</h1>
            <p>
              Manage your internship openings and discover top tech talent for{" "}
              <strong>{user.companyName || "your company"}</strong>.
            </p>
          </div>

          <div className="header-actions-group">
            <button
              className="header-secondary-btn"
              onClick={() => navigate("/recruiter/applicants")}
            >
              👥 View Applicants
            </button>
            <button
              className="header-action-btn"
              onClick={() => navigate("/recruiter/post-internship")}
            >
              ➕ Post New Internship
            </button>
          </div>
        </div>

        {/* 5-Card KPI Grid */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-box purple">💼</div>
            <div>
              <div className="kpi-value">{totalPostings}</div>
              <div className="kpi-title">Total Postings</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box green">🟢</div>
            <div>
              <div className="kpi-value">{activeCount}</div>
              <div className="kpi-title">Active Openings</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box blue">👥</div>
            <div>
              <div className="kpi-value">{totalApplicants}</div>
              <div className="kpi-title">Total Applicants</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box amber">🟡</div>
            <div>
              <div className="kpi-value">{statusCounts.Reviewing || 0}</div>
              <div className="kpi-title">In Review</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box emerald">🎉</div>
            <div>
              <div className="kpi-value">{statusCounts.Shortlisted || 0}</div>
              <div className="kpi-title">Shortlisted</div>
            </div>
          </div>
        </div>

        {/* Recruitment Pipeline Funnel Overview */}
        <div className="card dashboard-section-card pipeline-card">
          <div className="section-title-row">
            <div>
              <h3>📊 Candidate Pipeline Overview</h3>
              <p>Live distribution of candidates across your hiring stages.</p>
            </div>
            <Link to="/recruiter/applicants" className="view-all-link">
              Manage Applicants →
            </Link>
          </div>

          <div className="pipeline-breakdown-bar">
            {totalApplicants === 0 ? (
              <div className="pipeline-bar-empty">
                No active applicants yet. Postings are ready to accept candidate
                applications.
              </div>
            ) : (
              <>
                <div className="multi-stage-progress">
                  {statusCounts.Applied > 0 && (
                    <div
                      className="stage-bar applied"
                      style={{ width: `${appliedPct}%` }}
                      title={`Applied: ${statusCounts.Applied} (${appliedPct}%)`}
                    />
                  )}
                  {statusCounts.Reviewing > 0 && (
                    <div
                      className="stage-bar reviewing"
                      style={{ width: `${reviewingPct}%` }}
                      title={`In Review: ${statusCounts.Reviewing} (${reviewingPct}%)`}
                    />
                  )}
                  {statusCounts.Shortlisted > 0 && (
                    <div
                      className="stage-bar shortlisted"
                      style={{ width: `${shortlistedPct}%` }}
                      title={`Shortlisted: ${statusCounts.Shortlisted} (${shortlistedPct}%)`}
                    />
                  )}
                  {statusCounts.Rejected > 0 && (
                    <div
                      className="stage-bar rejected"
                      style={{ width: `${rejectedPct}%` }}
                      title={`Not Selected: ${statusCounts.Rejected} (${rejectedPct}%)`}
                    />
                  )}
                </div>

                <div className="pipeline-stages-legend">
                  <div className="legend-item">
                    <span className="dot dot-applied" />
                    <span>
                      Applied: <strong>{statusCounts.Applied || 0}</strong>
                    </span>
                  </div>
                  <div className="legend-item">
                    <span className="dot dot-reviewing" />
                    <span>
                      In Review: <strong>{statusCounts.Reviewing || 0}</strong>
                    </span>
                  </div>
                  <div className="legend-item">
                    <span className="dot dot-shortlisted" />
                    <span>
                      Shortlisted:{" "}
                      <strong>{statusCounts.Shortlisted || 0}</strong>
                    </span>
                  </div>
                  <div className="legend-item">
                    <span className="dot dot-rejected" />
                    <span>
                      Not Selected:{" "}
                      <strong>{statusCounts.Rejected || 0}</strong>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Candidate Applications Stream */}
        <div className="card dashboard-section-card">
          <div className="section-title-row">
            <div>
              <h3>⚡ Recent Candidate Applications</h3>
              <p>Latest students who applied to your open internships.</p>
            </div>
            {recentApps.length > 0 && (
              <Link to="/recruiter/applicants" className="view-all-link">
                View All Applicants →
              </Link>
            )}
          </div>

          {recentApps.length === 0 ? (
            <div className="empty-sub-state">
              <div className="empty-sub-icon">📭</div>
              <p>
                No direct applications received yet. Discover matched candidates
                proactively using our Candidate Matching engine!
              </p>
            </div>
          ) : (
            <div className="recent-apps-list">
              {recentApps.slice(0, 5).map((app) => {
                const student = app.student || {};
                const internship = app.internship || {};
                const appliedDate = app.createdAt
                  ? new Date(app.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Recently";

                return (
                  <div key={app._id} className="recent-app-item">
                    <div className="recent-app-avatar">
                      {student.name?.charAt(0).toUpperCase() || "S"}
                    </div>

                    <div className="recent-app-details">
                      <div className="recent-app-name-row">
                        <h4>{student.name || "Student Applicant"}</h4>
                        <span
                          className={`status-pill-small status-${app.status?.toLowerCase()}`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <div className="recent-app-sub">
                        Applied for{" "}
                        <strong>{internship.title || "Internship"}</strong> •{" "}
                        {student.college || "College"} • {appliedDate}
                      </div>
                    </div>

                    <div className="recent-app-action">
                      <button
                        className="review-applicant-btn"
                        onClick={() =>
                          navigate(
                            `/recruiter/internships/${internship._id}/applicants`
                          )
                        }
                      >
                        Review ➔
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Postings Section */}
        <div className="card dashboard-section-card">
          <div className="section-title-row">
            <div>
              <h3>💼 Your Internship Postings</h3>
              <p>Quick access to manage applicants and find matched talent.</p>
            </div>

            <Link to="/recruiter/internships" className="view-all-link">
              View All Postings ({postings.length}) →
            </Link>
          </div>

          {loading ? (
            <p>Loading your dashboard...</p>
          ) : postings.length === 0 ? (
            <div className="empty-dashboard-box">
              <div className="empty-icon">🚀</div>
              <h4>No internships posted yet</h4>
              <p>
                Post your first internship to start finding qualified student
                applicants.
              </p>
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
                    <div className="dashboard-job-metrics-pill">
                      <span>
                        👥 <strong>{job.applicantCount || 0}</strong>{" "}
                        {job.applicantCount === 1 ? "applicant" : "applicants"}
                      </span>
                      {job.statusCounts?.Shortlisted > 0 && (
                        <span className="dash-sub-chip shortlisted">
                          🟢 {job.statusCounts.Shortlisted} Shortlisted
                        </span>
                      )}
                      {job.statusCounts?.Reviewing > 0 && (
                        <span className="dash-sub-chip reviewing">
                          🟡 {job.statusCounts.Reviewing} In Review
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="job-skills-preview">
                    {(job.skills || []).slice(0, 3).map((s) => (
                      <span key={s} className="tag-preview">
                        {s}
                      </span>
                    ))}
                    {(job.skills || []).length > 3 && (
                      <span className="tag-more">
                        +{job.skills.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="job-actions">
                    <button
                      className="view-applicants-btn"
                      onClick={() =>
                        navigate(
                          `/recruiter/internships/${job._id}/applicants`
                        )
                      }
                    >
                      👥 Applicants ({job.applicantCount || 0})
                    </button>
                    <button
                      className="view-matches-btn"
                      onClick={() =>
                        navigate(`/recruiter/candidates/${job._id}`)
                      }
                    >
                      🎯 Matches
                    </button>
                    <button
                      className="quick-edit-btn"
                      onClick={() =>
                        navigate(`/recruiter/edit-internship/${job._id}`)
                      }
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
            <h4>💡 Candidate Matching Engine</h4>
            <p>
              Don't wait for applicants to apply! Click <strong>Matches</strong>{" "}
              on any posting to let our AI scan student skills, readiness
              scores, and coursework to find ideal candidates instantly.
            </p>
          </div>

          <div className="card tip-card">
            <h4>🏢 Company Profile</h4>
            <p>
              Students are 4x more likely to apply to internships from companies
              with detailed bios, office locations, and official websites.
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
