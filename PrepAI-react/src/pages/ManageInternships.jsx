import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import RecruiterSidebar from "../components/RecruiterSidebar";
import RecruiterTopbar from "../components/RecruiterTopbar";
import "./ManageInternships.css";

export default function ManageInternships() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPostings = async () => {
    try {
      const res = await api.get("/internships/recruiter/my-postings");
      setInternships(res.data);
    } catch (err) {
      console.error("Failed to load postings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostings();
  }, []);

  const handleDelete = async (id, title) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the posting "${title}"? This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/internships/${id}`);
      setInternships((prev) => prev.filter((item) => item._id !== id));
      alert("Posting deleted successfully.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete internship.");
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return internships.filter((item) => {
      return (
        item.title?.toLowerCase().includes(q) ||
        item.company?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.skills?.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [internships, search]);

  return (
    <div className="layout">
      <RecruiterSidebar />

      <div className="recruiter-main">
        <RecruiterTopbar />

        <div className="manage-header-row">
          <div>
            <h1>💼 Manage Your Internship Postings</h1>
            <p>Review, edit, track candidates, or remove your active job opportunities.</p>
          </div>

          <button
            className="create-posting-btn"
            onClick={() => navigate("/recruiter/post-internship")}
          >
            ➕ Post New Internship
          </button>
        </div>

        <div className="manage-toolbar">
          <input
            type="text"
            placeholder="🔍 Search postings by role, location, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="postings-count">
            {filtered.length} {filtered.length === 1 ? "posting" : "postings"} found
          </span>
        </div>

        {loading ? (
          <p>Loading your postings...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-postings-card">
            <div className="empty-icon">📋</div>
            <h3>No Internship Postings Found</h3>
            <p>
              {search
                ? "No listings match your search query."
                : "You haven't posted any internships yet. Create your first opening to start matching with students!"}
            </p>
            <button
              className="create-posting-btn"
              onClick={() => navigate("/recruiter/post-internship")}
            >
              Post Your First Internship
            </button>
          </div>
        ) : (
          <div className="postings-grid">
            {filtered.map((item) => (
              <div key={item._id} className="recruiter-posting-card">
                <div className="card-top-row">
                  <div>
                    <h3>{item.title}</h3>
                    <div className="company-sub">{item.company}</div>
                  </div>
                  <span
                    className={`status-pill ${
                      item.status === "Closed" ? "closed" : "active"
                    }`}
                  >
                    {item.status || "Active"}
                  </span>
                </div>

                <div className="posting-meta-row">
                  <span>📍 {item.location}</span>
                  <span>💻 {item.mode}</span>
                  <span>⏳ {item.duration}</span>
                  <span className="meta-stipend">💰 {item.stipend}</span>
                </div>

                {item.description && (
                  <p className="posting-description-snippet">
                    {item.description.length > 130
                      ? item.description.substring(0, 130) + "..."
                      : item.description}
                  </p>
                )}

                <div className="skills-row">
                  {(item.skills || []).map((skill) => (
                    <span key={skill} className="skill-chip">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="posting-actions">
                  <button
                    className="match-candidates-btn"
                    onClick={() => navigate(`/recruiter/candidates/${item._id}`)}
                  >
                    🎯 Match Candidates
                  </button>

                  <button
                    className="edit-btn"
                    onClick={() => navigate(`/recruiter/edit-internship/${item._id}`)}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item._id, item.title)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
