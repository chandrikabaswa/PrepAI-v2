import "./Experience.css";
import { useState, useEffect } from "react";
import api from "../../services/api";
import Sidebar from "../../components/student/Sidebar";
import Topbar from "../../components/student/Topbar";

function formatUrl(url) {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function deduplicateSkills(skills) {
  if (!Array.isArray(skills)) return [];
  const seen = new Set();
  const result = [];
  for (const s of skills) {
    const trimmed = (typeof s === "string" ? s : String(s)).trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(trimmed);
    }
  }
  return result;
}

const EXPERIENCE_TYPES = [
  "Internship",
  "Full-time",
  "Part-time",
  "Freelance",
  "Research",
  "Volunteer",
  "Other",
];

export default function Experience() {
  const initialUser = JSON.parse(localStorage.getItem("user")) || {
    name: "",
    branch: "",
    experience: [],
  };

  const [user, setUser] = useState(initialUser);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: "", type: "" });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    type: "Internship",
    company: "",
    role: "",
    location: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    description: "",
    achievements: "",
    skills: "",
    link: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const showNotification = (text, type = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg({ text: "", type: "" });
    }, 4000);
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      if (res.data) {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      }
    } catch (err) {
      console.error("Error loading experience:", err);
    }
  };

  const handleOpenAdd = () => {
    setEditIndex(null);
    setFormData({
      type: "Internship",
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
      achievements: "",
      skills: "",
      link: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    const item = user.experience?.[index];
    if (!item) return;
    setEditIndex(index);
    setFormData({
      type: item.type || "Internship",
      company: item.company || "",
      role: item.role || "",
      location: item.location || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      currentlyWorking: Boolean(item.currentlyWorking),
      description: item.description || "",
      achievements: item.achievements || "",
      skills: Array.isArray(item.skills) ? item.skills.join(", ") : item.skills || "",
      link: item.link || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveExperience = async (e) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.role.trim()) {
      showNotification("Company name and role are required.", "error");
      return;
    }

    const skillsArray = deduplicateSkills(
      formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
    );

    const experienceEntry = {
      type: formData.type || "Internship",
      company: formData.company.trim(),
      role: formData.role.trim(),
      location: formData.location.trim(),
      startDate: formData.startDate.trim(),
      endDate: formData.currentlyWorking ? "" : formData.endDate.trim(),
      currentlyWorking: formData.currentlyWorking,
      description: formData.description.trim(),
      achievements: formData.achievements.trim(),
      skills: skillsArray,
      link: formData.link.trim(),
    };

    const updatedExperience = [...(user.experience || [])];
    if (editIndex !== null && editIndex >= 0) {
      updatedExperience[editIndex] = {
        ...updatedExperience[editIndex],
        ...experienceEntry,
      };
    } else {
      updatedExperience.push(experienceEntry);
    }

    try {
      const res = await api.put("/users/profile", { experience: updatedExperience });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      showNotification(
        editIndex !== null ? "Experience updated successfully!" : "Experience added successfully!",
        "success"
      );
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save experience error:", err);
      showNotification(err.response?.data?.message || "Failed to save experience", "error");
    }
  };

  const handleDeleteExperience = async (index) => {
    if (!window.confirm("Are you sure you want to delete this experience entry?")) return;
    const updatedExperience = (user.experience || []).filter((_, i) => i !== index);

    try {
      const res = await api.put("/users/profile", { experience: updatedExperience });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      showNotification("Experience entry deleted", "success");
    } catch (err) {
      console.error("Delete experience error:", err);
      showNotification("Failed to delete experience", "error");
    }
  };

  const experiences = user.experience || [];

  return (
    <div className="layout">
      <Sidebar />

      <div className="main experience-page-main">
        <Topbar user={user} />

        {feedbackMsg.text && (
          <div className={`experience-toast-banner ${feedbackMsg.type}`}>
            {feedbackMsg.text}
          </div>
        )}

        <div className="experience-header-row">
          <div>
            <h1 className="page-main-title">Experience</h1>
            <p className="page-sub-desc">
              Where you have worked, interned, and contributed. Distinct from what you have built in Projects.
            </p>
          </div>
          <button className="primary-add-btn" onClick={handleOpenAdd}>
            + Add Experience
          </button>
        </div>

        {experiences.length > 0 ? (
          <div className="experience-cards-grid">
            {experiences.map((exp, idx) => (
              <div key={exp._id || idx} className="experience-card">
                <div className="exp-card-header">
                  <div>
                    <div className="exp-role-line">
                      <h3 className="exp-role">{exp.role}</h3>
                      <span className={`exp-type-badge ${exp.type?.toLowerCase().replace(/\s+/g, "-") || "internship"}`}>
                        {exp.type || "Internship"}
                      </span>
                    </div>
                    <h4 className="exp-company">{exp.company}</h4>
                  </div>

                  <div className="exp-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleOpenEdit(idx)}
                      title="Edit Experience"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDeleteExperience(idx)}
                      title="Delete Experience"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="exp-meta-row">
                  <span className="exp-meta-item">
                    📅 {exp.startDate || "N/A"} – {exp.currentlyWorking ? "Present" : exp.endDate || "N/A"}
                  </span>
                  {exp.location && (
                    <span className="exp-meta-item">
                      📍 {exp.location}
                    </span>
                  )}
                </div>

                {exp.description && (
                  <div className="exp-section-block">
                    <span className="block-label">Description:</span>
                    <p className="block-text">{exp.description}</p>
                  </div>
                )}

                {exp.achievements && (
                  <div className="exp-section-block">
                    <span className="block-label">Achievements / Impact:</span>
                    <p className="block-text">{exp.achievements}</p>
                  </div>
                )}

                {exp.skills && exp.skills.length > 0 && (
                  <div className="exp-section-block">
                    <span className="block-label">Skills Used:</span>
                    <div className="exp-skills-wrap">
                      {exp.skills.map((skill) => (
                        <span key={skill} className="exp-skill-chip">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {exp.link && (
                  <div className="exp-link-row">
                    <a
                      href={formatUrl(exp.link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="exp-evidence-link"
                    >
                      View Organization / Project Link ↗
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="experience-empty-box">
            <div className="empty-icon-large">💼</div>
            <h3>No experience added yet.</h3>
            <p>
              Add your internships, full-time positions, research experience, or freelance work history.
            </p>
            <button className="primary-add-btn" onClick={handleOpenAdd}>
              + Add Experience
            </button>
          </div>
        )}
      </div>

      {/* ADD / EDIT EXPERIENCE MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card modal-experience">
            <div className="modal-header">
              <h3>{editIndex !== null ? "Edit Experience" : "Add Experience"}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExperience} className="modal-form">
              <div className="row-2col">
                <div className="col-field">
                  <label>Experience Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    {EXPERIENCE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-field">
                  <label>Role / Position *</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineering Intern"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row-2col">
                <div className="col-field">
                  <label>Company / Organization *</label>
                  <input
                    type="text"
                    placeholder="e.g. ABC Technologies"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                </div>

                <div className="col-field">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad, Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="row-2col">
                <div className="col-field">
                  <label>Start Date</label>
                  <input
                    type="text"
                    placeholder="e.g. May 2026"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="col-field">
                  <label>End Date</label>
                  <input
                    type="text"
                    placeholder="e.g. July 2026"
                    value={formData.endDate}
                    disabled={formData.currentlyWorking}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="checkbox-field-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.currentlyWorking}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentlyWorking: e.target.checked,
                        endDate: e.target.checked ? "" : formData.endDate,
                      })
                    }
                  />
                  <span>Currently working here</span>
                </label>
              </div>

              <label>Description</label>
              <textarea
                rows="3"
                placeholder="Developed REST APIs using Node.js and Express, collaborated with frontend team..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <label>Achievements / Impact (Optional)</label>
              <textarea
                rows="2"
                placeholder="Optional key achievements or contributions..."
                value={formData.achievements}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
              />

              <label>Skills Used (comma-separated)</label>
              <input
                type="text"
                placeholder="Node.js, Express, MongoDB, Git"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />

              <label>Optional Experience Link</label>
              <input
                type="text"
                placeholder="https://company.com or recommendation link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editIndex !== null ? "Update Experience" : "Save Experience"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
