import { useEffect, useMemo, useState, useRef } from "react";
import api from "../../services/api";
import "./Projects.css";
import Sidebar from "../../components/student/Sidebar";
import ProjectGuideModal from "../../components/student/ProjectGuideModal";

// ──────────────────────────────────────────────
// Difficulty badge colour map (shared)
// ──────────────────────────────────────────────
const DIFFICULTY_COLOR = {
  Beginner: { bg: "#dcfce7", color: "#15803d" },
  Intermediate: { bg: "#fef9c3", color: "#a16207" },
  Advanced: { bg: "#fee2e2", color: "#b91c1c" },
};

const DOMAINS = [
  "Any",
  "Healthcare",
  "Education",
  "Finance",
  "E-commerce",
  "Sustainability",
  "Social Impact",
  "Productivity",
  "Developer Tools",
  "Entertainment",
];

// ──────────────────────────────────────────────
// Compact Project Card (shared between tabs)
// ──────────────────────────────────────────────
function CompactProjectCard({ project, onGuideOpen }) {
  const dc = DIFFICULTY_COLOR[project.difficulty] || {
    bg: "#f3f4f6",
    color: "#374151",
  };

  // Support both DB projects (project.match) and AI projects (project.technologies)
  const techList =
    project.techStack || project.technologies || project.skills || [];
  const matchScore =
    typeof project.match === "number" ? project.match : null;

  return (
    <div className="pg-card">
      <div className="pg-card-top">
        <span
          className="pg-diff-badge"
          style={{ background: dc.bg, color: dc.color }}
        >
          {project.difficulty}
        </span>
        {matchScore !== null && (
          <span className="pg-match-badge">{matchScore}% Skill Match</span>
        )}
      </div>

      <h3 className="pg-card-title">{project.title}</h3>
      <p className="pg-card-desc">{project.description}</p>

      <div className="pg-chips">
        {techList.slice(0, 5).map((t) => (
          <span key={t} className="pg-chip">
            {t}
          </span>
        ))}
      </div>

      <button
        className="pg-guide-btn"
        onClick={() => onGuideOpen(project)}
      >
        View Project Guide →
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// TAB 1 — Recommended for You
// ──────────────────────────────────────────────
function RecommendedTab({ onGuideOpen }) {
  const [loading, setLoading] = useState(true);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/projects/recommended");
        const recommendations = res.data.map((item) => ({
          ...item.project,
          match: item.match,
        }));
        setRecommendedProjects(recommendations);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return [...recommendedProjects]
      .filter((p) => {
        const kw = search.toLowerCase();
        const matchesSearch =
          !kw ||
          p.title?.toLowerCase().includes(kw) ||
          p.description?.toLowerCase().includes(kw) ||
          (p.techStack || []).some((t) => t.toLowerCase().includes(kw)) ||
          (p.skills || []).some((s) => s.toLowerCase().includes(kw));

        const matchesDiff =
          filterDifficulty === "All" || p.difficulty === filterDifficulty;

        return matchesSearch && matchesDiff;
      })
      .sort((a, b) => (b.match || 0) - (a.match || 0));
  }, [recommendedProjects, search, filterDifficulty]);

  return (
    <div className="pg-tab-content">
      {/* Filter toolbar — search + difficulty only */}
      <div className="pg-toolbar">
        <div className="pg-search-wrap">
          <span className="pg-search-icon">🔍</span>
          <input
            className="pg-search"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="pg-select pg-diff-select"
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
        >
          <option value="All">Difficulty ▾</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {loading ? (
        <div className="pg-loading">
          <div className="pg-spinner" />
          <p>Finding projects that match your skills…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="pg-empty">
          <span className="pg-empty-icon">📭</span>
          <p>No projects match your current filters.</p>
          <button
            className="pg-clear-btn"
            onClick={() => {
              setSearch("");
              setFilterDifficulty("All");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p className="pg-count">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""} matched
          </p>
          <div className="pg-grid">
            {filtered.map((p) => (
              <CompactProjectCard
                key={p._id}
                project={p}
                onGuideOpen={onGuideOpen}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// TAB 2 — AI Project Builder
// ──────────────────────────────────────────────
function AIBuilderTab({ onGuideOpen }) {
  const [techInput, setTechInput] = useState("");
  const [technologies, setTechnologies] = useState([]);
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [domain, setDomain] = useState("Any");
  const [generating, setGenerating] = useState(false);
  const [aiProjects, setAiProjects] = useState([]);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const addTechnology = (raw) => {
    const val = raw.trim();
    if (!val) return;
    const exists = technologies.some(
      (t) => t.toLowerCase() === val.toLowerCase()
    );
    if (!exists) {
      setTechnologies((prev) => [...prev, val]);
    }
    setTechInput("");
  };

  const removeTechnology = (tech) => {
    setTechnologies((prev) => prev.filter((t) => t !== tech));
  };

  const handleTechKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTechnology(techInput);
    }
    if (e.key === "Backspace" && !techInput && technologies.length > 0) {
      setTechnologies((prev) => prev.slice(0, -1));
    }
  };

  const handleGenerate = async () => {
    if (technologies.length === 0) {
      setError("Please add at least one technology.");
      inputRef.current?.focus();
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const res = await api.post("/projects/ai-builder", {
        technologies,
        difficulty,
        domain: domain === "Any" ? "" : domain,
      });
      setAiProjects(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to generate project ideas. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateMore = async () => {
    if (technologies.length === 0) return;
    setError("");
    setGenerating(true);
    try {
      const res = await api.post("/projects/ai-builder", {
        technologies,
        difficulty,
        domain: domain === "Any" ? "" : domain,
        regenerate: true,
      });
      setAiProjects(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to generate new ideas. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="pg-tab-content">
      {/* Builder panel */}
      <div className="pg-builder-panel">
        <div className="pg-builder-header">
          <span className="pg-builder-sparkle">✨</span>
          <div>
            <h2 className="pg-builder-title">
              Build a Project Around Your Interests
            </h2>
            <p className="pg-builder-sub">
              Choose the technologies and difficulty you want to work with.
              PrepAI will generate project ideas for you.
            </p>
          </div>
        </div>

        {/* Technologies */}
        <div className="pg-field">
          <label className="pg-label">Technologies</label>
          <div
            className="pg-tech-input-wrap"
            onClick={() => inputRef.current?.focus()}
          >
            {technologies.map((t) => (
              <span key={t} className="pg-tech-chip">
                {t}
                <button
                  className="pg-tech-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTechnology(t);
                  }}
                  aria-label={`Remove ${t}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              className="pg-tech-input"
              placeholder={
                technologies.length === 0
                  ? "Type a technology and press Enter…"
                  : "Add more…"
              }
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleTechKeyDown}
              onBlur={() => {
                if (techInput.trim()) addTechnology(techInput);
              }}
            />
          </div>
          <p className="pg-field-hint">
            Press{" "}
            <kbd>Enter</kbd> or{" "}
            <kbd>,</kbd> to add. Examples: React, Node.js, Python, FastAPI,
            Docker, AWS, TensorFlow, Flutter, Firebase.
          </p>
        </div>

        {/* Difficulty */}
        <div className="pg-field">
          <label className="pg-label">Difficulty</label>
          <div className="pg-diff-row">
            {["Beginner", "Intermediate", "Advanced"].map((d) => (
              <button
                key={d}
                className={`pg-diff-btn ${difficulty === d ? "active" : ""}`}
                onClick={() => setDifficulty(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Domain */}
        <div className="pg-field">
          <label className="pg-label">Project Domain (Optional)</label>
          <select
            className="pg-select pg-domain-select"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          >
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="pg-error">{error}</p>}

        <button
          className="pg-generate-btn"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <>
              <span className="pg-spinner-sm" /> Generating…
            </>
          ) : (
            "✨ Generate Project Ideas"
          )}
        </button>
      </div>

      {/* AI Results */}
      {generating && (
        <div className="pg-loading">
          <div className="pg-spinner" />
          <p>PrepAI is crafting project ideas for you…</p>
        </div>
      )}

      {!generating && aiProjects.length > 0 && (
        <div className="pg-ai-results">
          <div className="pg-results-header">
            <h3 className="pg-results-title">✨ AI Project Ideas</h3>
            <span className="pg-results-count">
              {aiProjects.length} ideas generated
            </span>
          </div>

          <div className="pg-grid">
            {aiProjects.map((p, i) => (
              <CompactProjectCard
                key={`ai-${i}`}
                project={p}
                onGuideOpen={onGuideOpen}
              />
            ))}
          </div>

          <div className="pg-regen-row">
            <button
              className="pg-regen-btn"
              onClick={handleGenerateMore}
              disabled={generating}
            >
              ✨ Generate More Ideas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────
function Projects() {
  const [activeTab, setActiveTab] = useState("recommended");
  const [guideProject, setGuideProject] = useState(null);

  const handleGuideOpen = (project) => setGuideProject(project);
  const handleGuideClose = () => setGuideProject(null);

  return (
    <div className="layout">
      <Sidebar />

      <div className="pg-main">
        {/* Page header */}
        <div className="pg-page-header">
          <div>
            <h1 className="pg-page-title">Project Guidance</h1>
            <p className="pg-page-sub">
              Discover projects that match your skills or generate ideas around
              technologies you want to use.
            </p>
          </div>
        </div>

        {/* Two main tabs */}
        <div className="pg-tabs">
          <button
            className={`pg-tab-btn ${activeTab === "recommended" ? "active" : ""}`}
            onClick={() => setActiveTab("recommended")}
          >
            Recommended for You
          </button>
          <button
            className={`pg-tab-btn ${activeTab === "ai-builder" ? "active" : ""}`}
            onClick={() => setActiveTab("ai-builder")}
          >
            ✨ AI Project Builder
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "recommended" ? (
          <RecommendedTab onGuideOpen={handleGuideOpen} />
        ) : (
          <AIBuilderTab onGuideOpen={handleGuideOpen} />
        )}
      </div>

      {/* Existing Project Guide Modal — unchanged */}
      {guideProject && (
        <ProjectGuideModal project={guideProject} onClose={handleGuideClose} />
      )}
    </div>
  );
}

export default Projects;
