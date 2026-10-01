import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import RecruiterSidebar from "../components/RecruiterSidebar";
import RecruiterTopbar from "../components/RecruiterTopbar";
import "./CandidateMatching.css";

export default function CandidateMatching() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [postings, setPostings] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(id || "");
  const [internshipData, setInternshipData] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [minMatch, setMinMatch] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactFeedback, setContactFeedback] = useState("");
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

  // Load recruiter's postings for the dropdown selector
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

  // Load candidate matches for the selected internship
  useEffect(() => {
    if (!selectedJobId) {
      setLoading(false);
      return;
    }

    const fetchMatches = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/internships/${selectedJobId}/candidates`);
        setInternshipData(res.data.internship);
        setCandidates(res.data.candidates || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load candidate matches.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [selectedJobId]);

  const handleJobSelect = (e) => {
    const newId = e.target.value;
    setSelectedJobId(newId);
    navigate(`/recruiter/candidates/${newId}`, { replace: true });
  };

  const filteredCandidates = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return candidates.filter((c) => {
      const matchesScore = c.match >= minMatch;
      const matchesSearch =
        c.name?.toLowerCase().includes(q) ||
        c.college?.toLowerCase().includes(q) ||
        c.branch?.toLowerCase().includes(q) ||
        c.skills?.some((s) => s.toLowerCase().includes(q));
      return matchesScore && matchesSearch;
    });
  }, [candidates, minMatch, searchQuery]);

  const getCandidateMailtoUrl = (candidate) => {
    const company =
      recruiterProfile.companyName ||
      internshipData?.company ||
      "Our Team";
    const recruiterName = recruiterProfile.name || "Hiring Team";
    const designationPart = recruiterProfile.designation
      ? `${recruiterProfile.designation}, `
      : "";

    const subject = `Opportunity: ${internshipData?.title || "Internship"} at ${company}`;
    const body = `Hi ${candidate.name},\n\nI came across your profile on PrepAI and was impressed by your skills and background. We currently have an opening for ${internshipData?.title || "Internship"} at ${company} that aligns well with your experience.\n\nWe would love to discuss this opportunity with you. Please let us know if you would be interested in connecting for a brief introductory call.\n\nBest regards,\n${recruiterName}\n${designationPart}${company}`;

    return `mailto:${candidate.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const handleContactCandidate = async (e, candidate) => {
    e.preventDefault();
    if (!selectedJobId || !candidate.id) return;

    setContactingId(candidate.id);
    try {
      const res = await api.post(
        `/internships/${selectedJobId}/contact/${candidate.id}`
      );
      const { mailtoUrl } = res.data.contact;
      setContactFeedback(`Opening email draft for ${candidate.name}...`);
      window.location.href = mailtoUrl;
      setTimeout(() => setContactFeedback(""), 4000);
    } catch (err) {
      console.error("Failed to contact candidate:", err);
      alert(
        err.response?.data?.message ||
          "Failed to authorize contact with this candidate."
      );
    } finally {
      setContactingId(null);
    }
  };

  return (
    <div className="layout">
      <RecruiterSidebar />

      <div className="recruiter-main">
        <RecruiterTopbar />

        <div className="matching-header">
          <div>
            <h1>🎯 Candidate Matching Engine</h1>
            <p>AI-powered talent matching based on skill overlap and profile readiness.</p>
          </div>

          {postings.length > 0 && (
            <div className="job-selector-box">
              <label>Select Posting:</label>
              <select value={selectedJobId} onChange={handleJobSelect}>
                {postings.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} ({job.company})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {contactFeedback && (
          <div className="contact-toast-notification">
            ✉️ {contactFeedback}
          </div>
        )}

        {error && <div className="alert-banner error">{error}</div>}

        {internshipData && (
          <div className="card active-job-summary-card">
            <div className="job-summary-top">
              <div>
                <h2>{internshipData.title}</h2>
                <div className="job-summary-company">
                  🏢 {internshipData.company} • 📍 {internshipData.location} ({internshipData.mode})
                </div>
              </div>

              <div className="match-counter-pill">
                ⭐ {candidates.length} Matched Candidates
              </div>
            </div>

            <div className="required-skills-wrapper">
              <strong>Required Skills:</strong>
              <div className="skills-row">
                {(internshipData.skills || []).map((skill) => (
                  <span key={skill} className="skill-chip">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        {internshipData && (
          <div className="matching-toolbar">
            <input
              type="text"
              placeholder="🔍 Search candidate name, college, branch, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="filter-group">
              <label>Filter Match:</label>
              <button
                className={`filter-pill ${minMatch === 0 ? "active" : ""}`}
                onClick={() => setMinMatch(0)}
              >
                All Matches
              </button>
              <button
                className={`filter-pill ${minMatch === 50 ? "active" : ""}`}
                onClick={() => setMinMatch(50)}
              >
                50%+ Match
              </button>
              <button
                className={`filter-pill ${minMatch === 75 ? "active" : ""}`}
                onClick={() => setMinMatch(75)}
              >
                75%+ Match
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p>Analyzing candidate profiles and computing match scores...</p>
        ) : postings.length === 0 ? (
          <div className="empty-postings-card">
            <div className="empty-icon">📢</div>
            <h3>No Active Postings Found</h3>
            <p>You need to post an internship first to match with students.</p>
            <button
              className="create-posting-btn"
              onClick={() => navigate("/recruiter/post-internship")}
            >
              Post an Internship
            </button>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="empty-postings-card">
            <div className="empty-icon">🔍</div>
            <h3>No Candidates Found</h3>
            <p>
              {searchQuery || minMatch > 0
                ? "No candidates match the specified filter criteria."
                : "No students currently match the required skills for this job."}
            </p>
          </div>
        ) : (
          <div className="candidates-list">
            {filteredCandidates.map((candidate, idx) => (
              <div key={candidate.id} className="candidate-card">
                <div className="candidate-card-header">
                  <div className="candidate-avatar">
                    {candidate.name ? candidate.name[0].toUpperCase() : "S"}
                  </div>

                  <div className="candidate-identity">
                    <div className="candidate-name-row">
                      <h3>{candidate.name}</h3>
                      <span className="rank-tag">#{idx + 1} Ranked</span>
                    </div>

                    <div className="candidate-education">
                      🎓 {candidate.degree || "B.Tech"} in {candidate.branch || "CS"} •{" "}
                      {candidate.college || "University"} {candidate.year ? `(${candidate.year})` : ""}
                    </div>
                  </div>

                  <div className="candidate-score-badge">
                    <div className="score-number">{candidate.match}%</div>
                    <div className="score-label">Skill Match</div>
                  </div>
                </div>

                {candidate.goal && (
                  <div className="candidate-goal">
                    <strong>Career Goal:</strong> {candidate.goal}
                  </div>
                )}

                {candidate.bio && (
                  <p className="candidate-bio">
                    "{candidate.bio.length > 180
                      ? candidate.bio.substring(0, 180) + "..."
                      : candidate.bio}"
                  </p>
                )}

                <div className="skill-breakdown-section">
                  <div className="matched-skills-group">
                    <span className="sub-label">✔ Matched Skills ({candidate.matchedSkills.length}):</span>
                    <div className="skills-row">
                      {candidate.matchedSkills.map((skill) => (
                        <span key={skill} className="skill-pill-matched">
                          ✔ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {candidate.missingSkills.length > 0 && (
                    <div className="missing-skills-group">
                      <span className="sub-label">Missing Skills:</span>
                      <div className="skills-row">
                        {candidate.missingSkills.map((skill) => (
                          <span key={skill} className="skill-pill-missing">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="candidate-footer">
                  <span className="candidate-email">✉️ {candidate.email}</span>

                  <a
                    href={getCandidateMailtoUrl(candidate)}
                    onClick={(e) => handleContactCandidate(e, candidate)}
                    className="contact-btn"
                  >
                    {contactingId === candidate.id
                      ? "Connecting..."
                      : "✉️ Contact Candidate"}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
