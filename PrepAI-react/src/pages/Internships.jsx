import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

import Sidebar from "../components/Sidebar";
import "./Internships.css";
import InternshipCard from "../components/InternshipCard";

function Internships({ defaultTab = "recommended" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState({});
  const [recommendedInternships, setRecommendedInternships] = useState([]);
  const [allInternships, setAllInternships] = useState([]);
  const [appliedInternships, setAppliedInternships] = useState({});
  const [myApplications, setMyApplications] = useState([]);

  const getTabFromLocation = (searchValue, defaultTabValue) => {
    const params = new URLSearchParams(searchValue);
    const tabParam = params.get("tab");

    if (tabParam === "applied" || defaultTabValue === "applied") return "applied";
    if (tabParam === "all" || defaultTabValue === "all") return "all";
    if (tabParam === "recommended") return "recommended";
    return "recommended";
  };

  const activeTab = useMemo(
    () => getTabFromLocation(location.search, defaultTab),
    [defaultTab, location.search]
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const handleTabChange = (tab) => {
    const params = new URLSearchParams(location.search);
    params.set("tab", tab);
    navigate({ pathname: location.pathname, search: `?${params.toString()}` });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [profileRes, recommendedRes, allRes, applicationsRes] =
          await Promise.all([
            api.get("/users/profile"),
            api.get("/internships/recommended"),
            api.get("/internships"),
            api.get("/applications/student").catch(() => ({ data: [] })),
          ]);

        if (!isMounted) return;

        setUser(profileRes.data || {});
        setRecommendedInternships(recommendedRes.data || []);
        setAllInternships(allRes.data || []);

        const apps = applicationsRes.data || [];
        setMyApplications(apps);

        const appliedMap = {};
        apps.forEach((app) => {
          const intId = app.internship?._id || app.internship;
          if (intId) {
            appliedMap[intId] = app.status || "Applied";
          }
        });
        setAppliedInternships(appliedMap);
      } catch (err) {
        console.error("Error loading internships data:", err);
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleApplySuccess = async (internshipId) => {
    setAppliedInternships((prev) => ({
      ...prev,
      [internshipId]: "Applied",
    }));

    try {
      const res = await api.get("/applications/student");
      const apps = res.data || [];
      setMyApplications(apps);
      const appliedMap = {};
      apps.forEach((app) => {
        const intId = app.internship?._id || app.internship;
        if (intId) {
          appliedMap[intId] = app.status || "Applied";
        }
      });
      setAppliedInternships(appliedMap);
    } catch (err) {
      console.error("Error refreshing applications:", err);
    }
  };

  const handleWithdraw = async (applicationId, internshipId, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to withdraw your application for "${title}"?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    setWithdrawingId(applicationId);
    setFeedbackMessage(null);

    try {
      await api.delete(`/applications/${applicationId}`);

      setMyApplications((prev) => prev.filter((a) => a._id !== applicationId));
      if (internshipId) {
        setAppliedInternships((prev) => {
          const updated = { ...prev };
          delete updated[internshipId];
          return updated;
        });
      }

      setFeedbackMessage({
        type: "success",
        text: `Application for "${title}" was successfully withdrawn.`,
      });

      setTimeout(() => {
        setFeedbackMessage(null);
      }, 5000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to withdraw application. Please try again.";
      setFeedbackMessage({
        type: "error",
        text: msg,
      });
    } finally {
      setWithdrawingId(null);
    }
  };

  const internships =
    activeTab === "recommended" ? recommendedInternships : allInternships;

  const filteredInternships = useMemo(() => {
    return internships.filter((internship) => {
      const keyword = search.toLowerCase();

      return (
        internship.title.toLowerCase().includes(keyword) ||
        internship.company.toLowerCase().includes(keyword) ||
        internship.location.toLowerCase().includes(keyword) ||
        internship.skills.some((skill) => skill.toLowerCase().includes(keyword))
      );
    });
  }, [internships, search]);

  const applicationCounts = useMemo(() => {
    const counts = {
      all: myApplications.length,
      applied: 0,
      reviewing: 0,
      shortlisted: 0,
      rejected: 0,
    };
    myApplications.forEach((app) => {
      const s = (app.status || "Applied").toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [myApplications]);

  const filteredApplications = useMemo(() => {
    return myApplications.filter((app) => {
      // Status filter
      if (statusFilter !== "all") {
        if ((app.status || "").toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Keyword search
      if (!search.trim()) return true;
      const kw = search.toLowerCase();
      const internship = app.internship || {};
      const recruiter = app.recruiter || {};

      return (
        (internship.title || "").toLowerCase().includes(kw) ||
        (internship.company || "").toLowerCase().includes(kw) ||
        (recruiter.companyName || "").toLowerCase().includes(kw) ||
        (recruiter.name || "").toLowerCase().includes(kw) ||
        (internship.location || "").toLowerCase().includes(kw) ||
        (app.status || "").toLowerCase().includes(kw) ||
        (internship.skills || []).some((s) => s.toLowerCase().includes(kw))
      );
    });
  }, [myApplications, statusFilter, search]);

  const getStatusBadgeConfig = (status) => {
    switch (status) {
      case "Shortlisted":
        return {
          label: "Shortlisted 🎉",
          desc: "Next steps & interview invitation coming",
          className: "badge-shortlisted",
          dotColor: "#10b981",
        };
      case "Reviewing":
        return {
          label: "In Review 🟡",
          desc: "Hiring team is evaluating your application",
          className: "badge-reviewing",
          dotColor: "#f59e0b",
        };
      case "Rejected":
        return {
          label: "Not Selected",
          desc: "Application process concluded for this role",
          className: "badge-rejected",
          dotColor: "#6b7280",
        };
      case "Applied":
      default:
        return {
          label: "Applied 🔵",
          desc: "Application submitted and received",
          className: "badge-applied",
          dotColor: "#3b82f6",
        };
    }
  };

  const getStepState = (status, stepIndex) => {
    const s = (status || "Applied").toLowerCase();
    if (stepIndex === 0) return "completed";
    if (stepIndex === 1) {
      if (["reviewing", "shortlisted", "rejected"].includes(s)) return "completed";
      return "current";
    }
    if (stepIndex === 2) {
      if (s === "shortlisted") return "completed-shortlisted";
      if (s === "rejected") return "completed-rejected";
      if (s === "reviewing") return "current";
      return "upcoming";
    }
    return "upcoming";
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="intern-main">
        <div className="intern-topbar">
          <input
            type="text"
            placeholder={
              activeTab === "applied"
                ? "🔍 Search applied roles, companies, status..."
                : "🔍 Search company, role or skill..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="profile-section" onClick={() => navigate("/profile")}>
            <div className="profile-info">
              <div>{user.name}</div>
              <div className="profile-branch">{user.branch}</div>
            </div>

            <div className="avatar">{user.name?.charAt(0).toUpperCase()}</div>
          </div>
        </div>

        <div className="intern-header">
          <h1>
            {activeTab === "applied"
              ? "My Applications"
              : "Internship Opportunities"}
          </h1>

          <p>
            {activeTab === "applied"
              ? "Track your submitted applications, review progress, and status updates in real-time."
              : "Discover internships matched to your skills."}
          </p>
        </div>

        {feedbackMessage && (
          <div className={`feedback-alert ${feedbackMessage.type}`}>
            {feedbackMessage.type === "success" ? "✔ " : "⚠️ "}
            {feedbackMessage.text}
          </div>
        )}

        <div className="internship-tabs tabs">
          <button
            className={`internship-tab ${activeTab === "recommended" ? "active" : ""}`}
            onClick={() => handleTabChange("recommended")}
          >
            Recommended ({recommendedInternships.length})
          </button>

          <button
            className={`internship-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => handleTabChange("all")}
          >
            Explore All ({allInternships.length})
          </button>

          <button
            className={`internship-tab ${activeTab === "applied" ? "active" : ""}`}
            onClick={() => handleTabChange("applied")}
          >
            My Applications ({myApplications.length})
          </button>
        </div>

        {/* Tab 3: My Applications View */}
        {activeTab === "applied" ? (
          <div className="applications-tracking-container">
            {/* Status Filter Bar */}
            <div className="status-filter-bar">
              <button
                className={`status-filter-btn ${
                  statusFilter === "all" ? "active" : ""
                }`}
                onClick={() => setStatusFilter("all")}
              >
                All ({applicationCounts.all})
              </button>
              <button
                className={`status-filter-btn ${
                  statusFilter === "applied" ? "active" : ""
                }`}
                onClick={() => setStatusFilter("applied")}
              >
                🔵 Applied ({applicationCounts.applied})
              </button>
              <button
                className={`status-filter-btn ${
                  statusFilter === "reviewing" ? "active" : ""
                }`}
                onClick={() => setStatusFilter("reviewing")}
              >
                🟡 In Review ({applicationCounts.reviewing})
              </button>
              <button
                className={`status-filter-btn ${
                  statusFilter === "shortlisted" ? "active" : ""
                }`}
                onClick={() => setStatusFilter("shortlisted")}
              >
                🟢 Shortlisted ({applicationCounts.shortlisted})
              </button>
              <button
                className={`status-filter-btn ${
                  statusFilter === "rejected" ? "active" : ""
                }`}
                onClick={() => setStatusFilter("rejected")}
              >
                ⚪ Not Selected ({applicationCounts.rejected})
              </button>
            </div>

            {filteredApplications.length > 0 ? (
              <div className="my-applications-grid">
                {filteredApplications.map((app) => {
                  const statusConfig = getStatusBadgeConfig(app.status);
                  const internship = app.internship || {};
                  const isShortlisted = app.status === "Shortlisted";
                  const isReviewing = app.status === "Reviewing";

                  return (
                    <div
                      className={`application-tracking-card ${
                        isShortlisted ? "card-shortlisted" : ""
                      }`}
                      key={app._id}
                    >
                      <div className="app-card-header">
                        <div>
                          <div className="app-company-row">
                            <h3 className="app-company-name">
                              {internship.company ||
                                app.recruiter?.companyName ||
                                "Company"}
                            </h3>
                            {app.recruiter && (
                              <span className="recruiter-tag">
                                🏢 Posted by {app.recruiter.name}
                                {app.recruiter.designation
                                  ? ` • ${app.recruiter.designation}`
                                  : ""}
                              </span>
                            )}
                          </div>
                          <h2 className="app-role-title">
                            {internship.title || "Internship Role"}
                          </h2>
                        </div>

                        <div className={`status-pill ${statusConfig.className}`}>
                          <span
                            className="status-dot"
                            style={{ backgroundColor: statusConfig.dotColor }}
                          />
                          <span className="status-title">
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>

                      {/* Status Explainer */}
                      <div className="app-status-explainer">
                        <span className="explainer-icon">ℹ️</span>
                        <span>{statusConfig.desc}</span>
                      </div>

                      {/* Application Pipeline Stepper */}
                      <div className="pipeline-stepper-container">
                        <div className="pipeline-stepper">
                          <div
                            className={`step-item ${getStepState(
                              app.status,
                              0
                            )}`}
                          >
                            <div className="step-circle">✔</div>
                            <span className="step-label">Submitted</span>
                          </div>
                          <div
                            className={`step-line ${
                              getStepState(app.status, 1) !== "upcoming"
                                ? "active"
                                : ""
                            }`}
                          />
                          <div
                            className={`step-item ${getStepState(
                              app.status,
                              1
                            )}`}
                          >
                            <div className="step-circle">
                              {[
                                "reviewing",
                                "shortlisted",
                                "rejected",
                              ].includes((app.status || "").toLowerCase())
                                ? "✔"
                                : "2"}
                            </div>
                            <span className="step-label">In Review</span>
                          </div>
                          <div
                            className={`step-line ${
                              [
                                "shortlisted",
                                "rejected",
                              ].includes((app.status || "").toLowerCase())
                                ? "active"
                                : ""
                            }`}
                          />
                          <div
                            className={`step-item ${getStepState(
                              app.status,
                              2
                            )}`}
                          >
                            <div className="step-circle">
                              {app.status === "Shortlisted"
                                ? "🎉"
                                : app.status === "Rejected"
                                ? "✕"
                                : "3"}
                            </div>
                            <span className="step-label">
                              {app.status === "Shortlisted"
                                ? "Shortlisted"
                                : app.status === "Rejected"
                                ? "Concluded"
                                : "Decision"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Celebratory Banner if Shortlisted */}
                      {isShortlisted && (
                        <div className="shortlisted-celebration-banner">
                          🎉 <strong>Congratulations!</strong> You have been
                          shortlisted by{" "}
                          <strong>
                            {internship.company ||
                              app.recruiter?.companyName ||
                              "the recruiter"}
                          </strong>
                          . Keep an eye on your inbox (
                          <strong>{user.email}</strong>) for follow-up details
                          or interview scheduling!
                        </div>
                      )}

                      {/* In Review Banner */}
                      {isReviewing && (
                        <div className="reviewing-banner">
                          ⏳ <strong>Application in Review:</strong> The hiring
                          team is evaluating your profile and skills.
                        </div>
                      )}

                      {/* Internship Metadata */}
                      <div className="app-meta-grid">
                        <span>📍 {internship.location || "Remote"}</span>
                        <span>💻 {internship.mode || "Flexible"}</span>
                        <span>⏳ {internship.duration || "N/A"}</span>
                        <span>💰 {internship.stipend || "Not specified"}</span>
                        <span className="app-date-tag">
                          📅 Applied:{" "}
                          {new Date(app.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      {/* Skills */}
                      {internship.skills && internship.skills.length > 0 && (
                        <div className="app-skills-section">
                          <span className="skills-sublabel">
                            Required Skills:
                          </span>
                          <div className="skills-chips">
                            {internship.skills.map((skill) => (
                              <span key={skill} className="skill-chip">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="app-card-footer">
                        {internship.applyLink && (
                          <button
                            className="external-link-btn"
                            onClick={() =>
                              window.open(internship.applyLink, "_blank")
                            }
                          >
                            External Posting ↗
                          </button>
                        )}

                        <button
                          className="withdraw-action-btn"
                          disabled={withdrawingId === app._id}
                          onClick={() =>
                            handleWithdraw(
                              app._id,
                              internship._id,
                              internship.title || "this position"
                            )
                          }
                        >
                          {withdrawingId === app._id
                            ? "Withdrawing..."
                            : "Withdraw Application"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-applications-card">
                <div className="empty-icon">📋</div>
                {myApplications.length === 0 ? (
                  <>
                    <h3>No applications yet</h3>
                    <p>
                      You haven't applied to any internships yet. Explore our
                      AI-recommended opportunities matched to your skills and
                      apply in one click!
                    </p>
                    <button
                      className="explore-btn"
                      onClick={() => handleTabChange("recommended")}
                    >
                      Explore Recommended Opportunities →
                    </button>
                  </>
                ) : (
                  <>
                    <h3>No matching applications</h3>
                    <p>
                      No applications match status{" "}
                      <strong>"{statusFilter}"</strong>
                      {search ? ` and search "${search}"` : ""}.
                    </p>
                    <button
                      className="explore-btn"
                      onClick={() => {
                        setStatusFilter("all");
                        setSearch("");
                      }}
                    >
                      Clear Filters & View All
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="intern-grid">
            {filteredInternships.map((internship) => (
              <InternshipCard
                key={internship._id}
                internship={internship}
                isApplied={Boolean(appliedInternships[internship._id])}
                appliedStatus={appliedInternships[internship._id]}
                onApplied={() => handleApplySuccess(internship._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Internships;
