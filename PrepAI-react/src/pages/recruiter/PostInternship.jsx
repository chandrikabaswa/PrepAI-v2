import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import RecruiterSidebar from "../../components/recruiter/RecruiterSidebar";
import RecruiterTopbar from "../../components/recruiter/RecruiterTopbar";
import "./PostInternship.css";

export default function PostInternship() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("Remote");
  const [stipend, setStipend] = useState("");
  const [duration, setDuration] = useState("6 Months");
  const [skills, setSkills] = useState("");
  const [applyLink, setApplyLink] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const profileRes = await api.get("/users/profile");
        if (!isEditMode && profileRes.data.companyName) {
          setCompany(profileRes.data.companyName);
        }

        if (isEditMode) {
          const intRes = await api.get(`/internships/${id}`);
          const data = intRes.data;
          setTitle(data.title || "");
          setCompany(data.company || "");
          setLocation(data.location || "");
          setMode(data.mode || "Remote");
          setStipend(data.stipend || "");
          setDuration(data.duration || "6 Months");
          setSkills(Array.isArray(data.skills) ? data.skills.join(", ") : "");
          setApplyLink(data.applyLink || "");
          setDescription(data.description || "");
          setStatus(data.status || "Active");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load internship details.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const skillsArray = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title,
      company,
      location,
      mode,
      stipend,
      duration,
      skills: skillsArray,
      applyLink: applyLink || "https://careers.company.com",
      description,
      status,
    };

    try {
      if (isEditMode) {
        await api.put(`/internships/${id}`, payload);
        alert("Internship updated successfully!");
      } else {
        await api.post("/internships", payload);
        alert("Internship posted successfully!");
      }
      navigate("/recruiter/internships");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save internship.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="layout">
        <RecruiterSidebar />
        <div className="recruiter-main">
          <p>Loading internship form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <RecruiterSidebar />

      <div className="recruiter-main">
        <RecruiterTopbar />

        <div className="page-header">
          <h1>{isEditMode ? "✏️ Edit Internship Posting" : "➕ Post New Internship"}</h1>
          <p>
            {isEditMode
              ? "Update details, requirements, or status for this posting."
              : "Create an internship opportunity and immediately match with skilled student candidates."}
          </p>
        </div>

        {error && <div className="alert-banner error">{error}</div>}

        <div className="card form-container-card">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Job / Internship Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Developer Intern"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Hiring Company *</label>
                <input
                  type="text"
                  placeholder="e.g. Google, Microsoft, StartupX"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row three-cols">
              <div className="form-group">
                <label>Work Mode *</label>
                <select value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>

              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore, Hyderabad, or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Duration *</label>
                <input
                  type="text"
                  placeholder="e.g. 3 Months, 6 Months"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stipend / Compensation *</label>
                <input
                  type="text"
                  placeholder="e.g. ₹40,000/month or Unpaid"
                  value={stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Application Link / Instructions *</label>
                <input
                  type="url"
                  placeholder="https://company.com/apply"
                  value={applyLink}
                  onChange={(e) => setApplyLink(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Required Skills (Comma separated) *</label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, JavaScript, MongoDB, Python"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                required
              />
              <span className="helper-text">
                💡 These skills power candidate matching scores and student recommendations.
              </span>
            </div>

            <div className="form-group">
              <label>Role Description & Candidate Requirements</label>
              <textarea
                rows="5"
                placeholder="Describe day-to-day responsibilities, learning opportunities, and candidate requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {isEditMode && (
              <div className="form-group">
                <label>Posting Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Active">Active (Accepting candidates)</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/recruiter/internships")}
              >
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : isEditMode
                  ? "Update Internship"
                  : "Publish Internship Posting"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
