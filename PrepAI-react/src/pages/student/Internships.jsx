import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";

import Sidebar from "../../components/student/Sidebar";
import "./Internships.css";
import InternshipCard from "../../components/student/InternshipCard";

function Internships({ defaultTab = "recommended" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const tabsRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });
  const [recommendedInternships, setRecommendedInternships] = useState([]);
  const [allInternships, setAllInternships] = useState([]);
  const [appliedInternships, setAppliedInternships] = useState({});
  const [myApplications, setMyApplications] = useState([]);

  const getTabFromLocation = (searchValue, defaultTabValue) => {
    const params = new URLSearchParams(searchValue);
    const tabParam = params.get("tab");

    if (tabParam === "skills" || defaultTabValue === "skills") return "skills";
    if (tabParam === "applied" || defaultTabValue === "applied") return "applied";
    if (tabParam === "all" || defaultTabValue === "all") return "all";
    if (tabParam === "recommended") return "recommended";
    return "recommended";
  };

  const activeTab = useMemo(
    () => getTabFromLocation(location.search, defaultTab),
    [defaultTab, location.search]
  );

  const [search, setSearch] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("search") || "";
  });
  const [prevLocationSearch, setPrevLocationSearch] = useState(location.search);

  if (prevLocationSearch !== location.search) {
    setPrevLocationSearch(location.search);
    const searchParam = new URLSearchParams(location.search).get("search");
    if (searchParam !== null && searchParam !== search) {
      setSearch(searchParam);
    }
  }

  const [statusFilter, setStatusFilter] = useState("all");
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [skillsSubTab, setSkillsSubTab] = useState("mySkills");

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

  // ─────────────────────────────────────────────────────────────
  // YOUR SKILL STRENGTH: Frequency of existing skills in Explore All
  // ─────────────────────────────────────────────────────────────
  const skillStrengthData = useMemo(() => {
    const rawSkills = Array.isArray(user?.skills) ? user.skills : [];

    // Deduplicate student's existing skills (case-insensitive, whitespace-normalized)
    const uniqueSkills = [];
    const seen = new Set();
    for (const s of rawSkills) {
      if (typeof s === "string" && s.trim()) {
        const normalized = s.trim().toLowerCase();
        if (!seen.has(normalized)) {
          seen.add(normalized);
          uniqueSkills.push(s.trim());
        }
      }
    }

    // Complete internship dataset from Explore -> All
    const totalOpportunities = allInternships.length;

    // Count appearances of each skill across all internships in Explore -> All
    const stats = uniqueSkills.map((skillName) => {
      const normalizedSkill = skillName.trim().toLowerCase();

      // Check how many internships mention/require that skill
      // Count an internship only once for a skill, even if the skill appears multiple times
      // Matching is case-insensitive and whitespace-normalized
      let opportunityCount = 0;
      for (const internship of allInternships) {
        const intSkills = Array.isArray(internship?.skills) ? internship.skills : [];
        const hasSkill = intSkills.some(
          (item) => typeof item === "string" && item.trim().toLowerCase() === normalizedSkill
        );
        if (hasSkill) {
          opportunityCount++;
        }
      }

      // Calculate opportunity percentage (avoid division by zero)
      const percentage =
        totalOpportunities > 0
          ? Math.round((opportunityCount / totalOpportunities) * 100)
          : 0;

      return {
        skill: skillName,
        opportunityCount,
        totalOpportunities,
        percentage,
      };
    });

    // Sort student's skills by opportunityCount descending so most widely used skills appear first
    stats.sort((a, b) => {
      if (b.opportunityCount !== a.opportunityCount) {
        return b.opportunityCount - a.opportunityCount;
      }
      return a.skill.localeCompare(b.skill);
    });

    return {
      stats,
      totalOpportunities,
      hasSkills: uniqueSkills.length > 0,
    };
  }, [user.skills, allInternships]);

  // ─────────────────────────────────────────────────────────────
  // 2. SKILL DEMAND: Student's missing skills in Explore All
  // ─────────────────────────────────────────────────────────────
  const skillDemandData = useMemo(() => {
    const userSkillSet = new Set(
      (Array.isArray(user?.skills) ? user.skills : [])
        .filter((s) => typeof s === "string" && s.trim())
        .map((s) => s.trim().toLowerCase())
    );

    // Identify all unique missing skills across all internships in Explore -> All
    const missingSkillsMap = new Map();
    allInternships.forEach((internship) => {
      const intSkills = Array.isArray(internship?.skills) ? internship.skills : [];
      intSkills.forEach((s) => {
        if (typeof s === "string" && s.trim()) {
          const norm = s.trim().toLowerCase();
          if (!userSkillSet.has(norm) && !missingSkillsMap.has(norm)) {
            missingSkillsMap.set(norm, s.trim());
          }
        }
      });
    });

    const totalOpportunities = allInternships.length;

    const stats = Array.from(missingSkillsMap.entries()).map(([, displayName]) => {
      const normSkill = displayName.trim().toLowerCase();
      let opportunityCount = 0;
      for (const internship of allInternships) {
        const intSkills = Array.isArray(internship?.skills) ? internship.skills : [];
        const hasSkill = intSkills.some(
          (item) => typeof item === "string" && item.trim().toLowerCase() === normSkill
        );
        if (hasSkill) {
          opportunityCount++;
        }
      }

      const percentage =
        totalOpportunities > 0
          ? Math.round((opportunityCount / totalOpportunities) * 100)
          : 0;

      return {
        skill: displayName,
        opportunityCount,
        totalOpportunities,
        percentage,
      };
    });

    stats.sort((a, b) => {
      if (b.opportunityCount !== a.opportunityCount) {
        return b.opportunityCount - a.opportunityCount;
      }
      return a.skill.localeCompare(b.skill);
    });

    return {
      stats,
      totalOpportunities,
      hasMissingSkills: stats.length > 0,
    };
  }, [user.skills, allInternships]);

  const handleViewOpportunities = (skillName) => {
    const params = new URLSearchParams(location.search);
    params.set("tab", "all");
    params.set("search", skillName);
    navigate({ pathname: "/internships", search: `?${params.toString()}` });
    setSearch(skillName);
    if (tabsRef.current) {
      tabsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLearnSkill = (skillName) => {
    navigate(`/learning?tab=explore&search=${encodeURIComponent(skillName)}`);
  };

  const internships =
    activeTab === "recommended" ? recommendedInternships : allInternships;

  const filteredInternships = useMemo(() => {
    return internships.filter((internship) => {
      const keyword = search.toLowerCase();

      return (
        (internship.title || "").toLowerCase().includes(keyword) ||
        (internship.company || "").toLowerCase().includes(keyword) ||
        (internship.location || "").toLowerCase().includes(keyword) ||
        (internship.skills || []).some((skill) =>
          typeof skill === "string" && skill.toLowerCase().includes(keyword)
        )
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
              : activeTab === "skills"
              ? "Skill Insights"
              : "Internship Opportunities"}
          </h1>

          <p>
            {activeTab === "applied"
              ? "Track your submitted applications, review progress, and status updates in real-time."
              : activeTab === "skills"
              ? "Analyze your skill strength and discover market demand across current opportunities."
              : "Discover internships matched to your skills."}
          </p>
        </div>

        {feedbackMessage && (
          <div className={`feedback-alert ${feedbackMessage.type}`}>
            {feedbackMessage.type === "success" ? "✔ " : "⚠️ "}
            {feedbackMessage.text}
          </div>
        )}

        <div ref={tabsRef} className="internship-tabs tabs">
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
            All ({allInternships.length})
          </button>

          <button
            className={`internship-tab ${activeTab === "applied" ? "active" : ""}`}
            onClick={() => handleTabChange("applied")}
          >
            My Applications ({myApplications.length})
          </button>

          <button
            className={`internship-tab ${activeTab === "skills" ? "active" : ""}`}
            onClick={() => handleTabChange("skills")}
          >
            Skills
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
        ) : activeTab === "skills" ? (
          <div className="skills-tab-container">
            <div className="skills-subtabs tabs">
              <button
                className={`internship-tab ${skillsSubTab === "mySkills" ? "active" : ""}`}
                onClick={() => setSkillsSubTab("mySkills")}
              >
                My Skills
              </button>
              <button
                className={`internship-tab ${skillsSubTab === "skillsToLearn" ? "active" : ""}`}
                onClick={() => setSkillsSubTab("skillsToLearn")}
              >
                Skills to Learn
              </button>
            </div>

            {skillsSubTab === "mySkills" && (
              <section
                className="skill-strength-section"
                aria-label="Your Skill Strength"
              >
                <div className="skill-strength-header">
                  <h2 className="skill-strength-title">🧠 My Skills</h2>
                  <p className="skill-strength-subtitle">
                    See how often your existing skills appear across current PrepAI opportunities.
                  </p>
                </div>

                {!skillStrengthData.hasSkills ? (
                  <div className="skill-strength-empty">
                    <p className="skill-strength-empty-text">
                      Add skills to your profile to see how they match current opportunities.
                    </p>
                    <button
                      type="button"
                      className="skill-strength-profile-btn"
                      onClick={() => navigate("/profile?tab=profile")}
                    >
                      Add Skills to Profile →
                    </button>
                  </div>
                ) : skillStrengthData.totalOpportunities === 0 ? (
                  <div className="skill-strength-empty">
                    <p className="skill-strength-empty-text">
                      No active internship opportunities are currently available.
                    </p>
                  </div>
                ) : (
                  <div className="skills-list">
                    <div className="skills-list-header">
                      <span className="col-skill">Skill</span>
                      <span className="col-opportunities">Opportunities</span>
                      <span className="col-actions"></span>
                    </div>
                    {skillStrengthData.stats.map((item) => (
                      <div key={item.skill} className="skills-list-row">
                        <div className="skill-row-info">
                          <span className="skill-row-name">{item.skill}</span>
                        </div>
                        <div className="skill-row-stats">
                          <div className="skill-row-numbers">
                            <span>{item.opportunityCount} / {item.totalOpportunities} opportunities</span>
                            <span className="skill-row-percent">{item.percentage}%</span>
                          </div>
                          <div className="skill-row-bar-bg" aria-hidden="true">
                            <div
                              className="skill-row-bar-fill"
                              style={{
                                width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="skill-row-actions">
                          <button
                            type="button"
                            className="skill-strength-action-btn"
                            onClick={() => handleViewOpportunities(item.skill)}
                          >
                            View Opportunities →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {skillsSubTab === "skillsToLearn" && (
              <section
                className="skill-strength-section skill-demand-section"
                aria-label="Skill Demand"
              >
                <div className="skill-strength-header">
                  <h2 className="skill-strength-title">📊 Skills to Learn</h2>
                  <p className="skill-strength-subtitle">
                    See which missing skills appear most often in current PrepAI opportunities.
                  </p>
                </div>

                {!skillDemandData.hasMissingSkills ? (
                  <div className="skill-strength-empty">
                    <p className="skill-strength-empty-text">
                      You currently don't have any identified skill gaps.
                    </p>
                  </div>
                ) : skillDemandData.totalOpportunities === 0 ? (
                  <div className="skill-strength-empty">
                    <p className="skill-strength-empty-text">
                      No active internship opportunities are currently available.
                    </p>
                  </div>
                ) : (
                  <div className="skills-list">
                    <div className="skills-list-header">
                      <span className="col-skill">Skill</span>
                      <span className="col-opportunities">Opportunities</span>
                      <span className="col-actions"></span>
                    </div>
                    {skillDemandData.stats.map((item) => (
                      <div key={item.skill} className="skills-list-row">
                        <div className="skill-row-info">
                          <span className="skill-row-name">{item.skill}</span>
                        </div>
                        <div className="skill-row-stats">
                          <div className="skill-row-numbers">
                            <span>{item.opportunityCount} / {item.totalOpportunities} opportunities</span>
                            <span className="skill-row-percent">{item.percentage}%</span>
                          </div>
                          <div className="skill-row-bar-bg" aria-hidden="true">
                            <div
                              className="skill-row-bar-fill demand-fill"
                              style={{
                                width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="skill-row-actions">
                          <button
                            type="button"
                            className="skill-strength-action-btn demand-btn"
                            onClick={() => handleLearnSkill(item.skill)}
                          >
                            Learn {item.skill} →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        ) : filteredInternships.length > 0 ? (
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
        ) : (
          <div className="empty-applications-card">
            <div className="empty-icon">🔍</div>
            <h3>No matching internships</h3>
            <p>
              {search
                ? `No internships match "${search}". Try searching for another skill or company.`
                : "No internships available in this section."}
            </p>
            {search && (
              <button
                className="explore-btn"
                onClick={() => {
                  setSearch("");
                  const params = new URLSearchParams(location.search);
                  params.delete("search");
                  navigate({
                    pathname: location.pathname,
                    search: params.toString() ? `?${params.toString()}` : "",
                  });
                }}
              >
                Clear Search Filter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Internships;
