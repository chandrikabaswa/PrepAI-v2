import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import RecruiterSidebar from "../../components/recruiter/RecruiterSidebar";
import RecruiterTopbar from "../../components/recruiter/RecruiterTopbar";
import "./RecruiterApplicants.css";

export default function RecruiterApplicants() {
  const { internshipId, id } = useParams();
  const activeParamId = internshipId || id;
  const navigate = useNavigate();

  const [postings, setPostings] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(activeParamId || "");
  const [internshipData, setInternshipData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState("");
  const [contactingId, setContactingId] = useState(null);
  const [recruiterProfile, setRecruiterProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

  // Fetch latest recruiter profile for personalized contact messages
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        if (res.data) {
          setRecruiterProfile(res.data);
        }
      } catch (err) {
        // Fallback to localStorage data
      }
    };
    fetchProfile();
  }, []);

  const getApplicantMailtoUrl = (app) => {
    const student = app.student || {};
    const company =
      recruiterProfile.companyName ||
      internshipData?.company ||
      "Our Team";
    const recruiterName = recruiterProfile.name || "Hiring Team";
    const designationPart = recruiterProfile.designation
      ? `${recruiterProfile.designation}, `
      : "";

    const subject = `Regarding your application for ${
      internshipData?.title || "Internship"
    } at ${company}`;
    const body = `Hi ${student.name || "Candidate"},\n\nThank you for applying to the ${
      internshipData?.title || "internship"
    } position at ${company} via PrepAI. We have reviewed your profile and application, and would like to connect with you regarding the next steps in our hiring process.\n\nPlease let us know your availability for a brief conversation in the coming days.\n\nBest regards,\n${recruiterName}\n${designationPart}${company}`;

    return `mailto:${student.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const handleContactApplicant = async (e, app) => {
    e.preventDefault();
    const student = app.student || {};
    if (!student._id && !student.id) return;

    setContactingId(app._id);
    try {
      const res = await api.post(`/applications/${app._id}/contact`);
      const { mailtoUrl } = res.data.contact;
      setNotification(
        `Opening email draft for ${student.name || "candidate"}...`
      );
      window.location.href = mailtoUrl;
      setTimeout(() => setNotification(""), 4000);
    } catch (err) {
      console.error("Failed to contact applicant:", err);
      alert(
        err.response?.data?.message ||
          "Failed to authorize contact with this applicant."
      );
    } finally {
      setContactingId(null);
    }
  };

  // Load recruiter's postings for the posting selector
  useEffect(() => {
    const fetchPostings = async () => {
      try {
        const res = await api.get("/internships/recruiter/my-postings");
        setPostings(res.data);
        if (!selectedJobId && res.data.length > 0) {
          setSelectedJobId(res.data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load recruiter postings:", err);
      }
    };

    fetchPostings();
  }, [selectedJobId]);

  // Load applicants for selected internship
  useEffect(() => {
    if (!selectedJobId) {
      setLoading(false);
      return;
    }

    const fetchApplicants = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/applications/internship/${selectedJobId}`);
        setInternshipData(res.data.internship);
        setApplications(res.data.applications || []);
      } catch (err) {
        console.error("Failed to load applicants:", err);
        setError(
          err.response?.data?.message || "Failed to load internship applicants."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [selectedJobId]);

  const handleJobSelect = (e) => {
    const newId = e.target.value;
    setSelectedJobId(newId);
    navigate(`/recruiter/internships/${newId}/applicants`, { replace: true });
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      await api.put(`/applications/${applicationId}/status`, {
        status: newStatus,
      });

      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      setNotification(`Status updated to "${newStatus}"`);
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Failed to update application status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const statusCounts = useMemo(() => {
    const counts = { All: applications.length, Applied: 0, Reviewing: 0, Shortlisted: 0, Rejected: 0 };
    applications.forEach((app) => {
      if (counts[app.status] !== undefined) {
        counts[app.status] += 1;
      }
    });
    return counts;
  }, [applications]);

  const filteredApplicants = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return applications.filter((app) => {
      const student = app.student || {};
      const matchesSearch =
        student.name?.toLowerCase().includes(q) ||
        student.email?.toLowerCase().includes(q) ||
        student.college?.toLowerCase().includes(q) ||
        student.branch?.toLowerCase().includes(q) ||
        student.skills?.some((s) => s.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "All" || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  return (
    <div className="layout">
      <RecruiterSidebar />

      <div className="recruiter-main">
        <RecruiterTopbar />

        <div className="applicants-top-bar">
          <button
            className="back-nav-btn"
            onClick={() => navigate("/recruiter/internships")}
          >
            ← Back to Manage Postings
          </button>
        </div>

        <div className="applicants-header">
          <div>
            <h1>👥 Internship Applicants</h1>
            <p>
              Review submitted student applications, update candidate status,
              and connect with candidates.
            </p>
          </div>

          {postings.length > 0 && (
            <div className="posting-selector-box">
              <label>Select Posting:</label>
              <select value={selectedJobId} onChange={handleJobSelect}>
                {postings.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} — {job.company}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {notification && (
          <div className="toast-notification">✔ {notification}</div>
        )}

        {/* Selected Internship Summary Banner */}
        {internshipData && (
          <div className="selected-job-summary">
            <div className="job-summary-info">
              <h3>{internshipData.title}</h3>
              <div className="summary-meta">
                <span>🏢 {internshipData.company}</span>
                <span>📍 {internshipData.location}</span>
                <span>💻 {internshipData.mode}</span>
                <span className="summary-status">
                  {internshipData.status || "Active"}
                </span>
              </div>
            </div>

            <div className="job-summary-stats">
              <div className="stats-pill">
                <strong>{applications.length}</strong> Total Applicants
              </div>
              <button
                className="switch-matching-btn"
                onClick={() =>
                  navigate(`/recruiter/candidates/${selectedJobId}`)
                }
              >
                🎯 View Match Candidates
              </button>
            </div>
          </div>
        )}

        {/* Toolbar: Search and Filter Tabs */}
        <div className="applicants-toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search applicant by name, email, college, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="status-tabs">
            {["All", "Applied", "Reviewing", "Shortlisted", "Rejected"].map(
              (st) => (
                <button
                  key={st}
                  className={`status-tab ${statusFilter === st ? "active" : ""}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st} ({statusCounts[st] || 0})
                </button>
              )
            )}
          </div>
        </div>

        {/* Applicants Grid / Cards */}
        {loading ? (
          <div className="loading-state">
            <p>Loading applicants...</p>
          </div>
        ) : error ? (
          <div className="error-card">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-applicants-card">
            <div className="empty-icon">📭</div>
            <h3>No Direct Applications Yet</h3>
            <p>
              Students haven't submitted applications for this posting yet. You
              can also proactively discover top candidates using the Candidate
              Matching engine.
            </p>
            <button
              className="cta-btn"
              onClick={() =>
                navigate(`/recruiter/candidates/${selectedJobId}`)
              }
            >
              🎯 Explore Matched Candidates
            </button>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="empty-applicants-card">
            <div className="empty-icon">🔍</div>
            <h3>No Applicants Match Filters</h3>
            <p>Try resetting the search query or changing the status filter.</p>
            <button
              className="cta-btn secondary"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="applicants-grid">
            {filteredApplicants.map((app) => {
              const student = app.student || {};
              const appliedDate = app.createdAt
                ? new Date(app.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recently";

              return (
                <div key={app._id} className="applicant-card">
                  <div className="applicant-card-header">
                    <div className="applicant-avatar">
                      {student.name?.charAt(0).toUpperCase() || "S"}
                    </div>

                    <div className="applicant-primary-info">
                      <div className="applicant-name-row">
                        <h3>{student.name || "Student Applicant"}</h3>
                        <span
                          className={`applicant-status-badge status-${app.status?.toLowerCase()}`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <div className="applicant-email">
                        📧 {student.email || "No email available"}
                      </div>
                    </div>
                  </div>

                  {/* Education / Branch info */}
                  <div className="applicant-meta-section">
                    <div className="meta-item">
                      <span className="meta-icon">🎓</span>
                      <span>
                        {student.degree || "Degree not specified"}
                        {student.branch ? ` • ${student.branch}` : ""}
                      </span>
                    </div>

                    {student.college && (
                      <div className="meta-item">
                        <span className="meta-icon">🏛️</span>
                        <span>{student.college}</span>
                      </div>
                    )}

                    {student.year && (
                      <div className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span>Year: {student.year}</span>
                      </div>
                    )}

                    <div className="meta-item">
                      <span className="meta-icon">🕒</span>
                      <span>Applied: {appliedDate}</span>
                    </div>
                  </div>

                  {/* Student Skills */}
                  {student.skills && student.skills.length > 0 && (
                    <div className="applicant-skills-box">
                      <span className="skills-title">Skills:</span>
                      <div className="skills-chips">
                        {student.skills.map((skill) => (
                          <span key={skill} className="skill-chip">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio / Goal */}
                  {student.bio && (
                    <p className="applicant-bio">
                      &quot;{student.bio.length > 120
                        ? student.bio.substring(0, 120) + "..."
                        : student.bio}&quot;
                    </p>
                  )}

                  {/* Controls: Status update and Contact button */}
                  <div className="applicant-footer">
                    <div className="status-control-group">
                      <label>Status:</label>
                      <select
                        className={`status-select status-${app.status?.toLowerCase()}`}
                        value={app.status}
                        disabled={updatingId === app._id}
                        onChange={(e) =>
                          handleStatusChange(app._id, e.target.value)
                        }
                      >
                        <option value="Applied">Applied</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <a
                      href={getApplicantMailtoUrl(app)}
                      onClick={(e) => handleContactApplicant(e, app)}
                      className="contact-btn"
                    >
                      {contactingId === app._id
                        ? "Connecting..."
                        : "✉️ Contact Candidate"}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
