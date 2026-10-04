import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import "./Dashboard.css";

import Sidebar from "../../components/student/Sidebar";
import Topbar from "../../components/student/Topbar";
import ProjectGuideModal from "../../components/student/ProjectGuideModal";
import {
  getDailyMotivationalMessage,
  countTechnicalSkills,
} from "../../data/motivationalMessages";

function getGreeting(name) {
  const hour = new Date().getHours();
  let timeStr = "Good evening";
  if (hour < 12) {
    timeStr = "Good morning";
  } else if (hour < 17) {
    timeStr = "Good afternoon";
  }
  const cleanName = name
    ? name.trim().charAt(0).toUpperCase() + name.trim().slice(1)
    : "Student";
  return `${timeStr}, ${cleanName} 👋`;
}

function formatRole(goal) {
  if (!goal || !goal.trim()) return "Software Developer";
  return goal
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    goal: "",
    branch: "",
    year: "",
    college: "",
    skills: [],
    projects: [],
    experience: [],
    resume: {},
  });

  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [learningRecommendations, setLearningRecommendations] = useState([]);
  const [guideProject, setGuideProject] = useState(null);

  // Daily motivational message (computed deterministically from current date)
  const motivationalMessage = useMemo(() => getDailyMotivationalMessage(), []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [profileRes, projectsRes, learningRes] =
          await Promise.allSettled([
            api.get("/users/profile"),
            api.get("/projects/recommended"),
            api.get("/learning/recommended"),
          ]);

        if (profileRes.status === "fulfilled") {
          const profileData = profileRes.value.data || {};
          setUser(profileData);
          localStorage.setItem("user", JSON.stringify(profileData));
        }

        if (projectsRes.status === "fulfilled") {
          const rawProjects = projectsRes.value.data || [];
          const normalized = rawProjects.map((item) => ({
            ...(item.project || item),
            match: item.match,
          }));
          setRecommendedProjects(normalized);
        }

        if (learningRes.status === "fulfilled") {
          setLearningRecommendations(learningRes.value.data || []);
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
      }
    };

    loadDashboard();
  }, []);

  // ──────────────────────────────────────────────
  // Career Snapshot Counts (Database-only values)
  // ──────────────────────────────────────────────
  // Exclude soft skills like Communication, Team Collaboration, Time Management
  const technicalSkillsCount = useMemo(
    () => countTechnicalSkills(user.skills),
    [user.skills]
  );
  // Student's own completed/built projects from profile
  const ownProjectsCount = user.projects?.length || 0;
  const hasResume = Boolean(user.resume?.fileName || user.resume?.fileUrl);
  const experienceCount = user.experience?.length || 0;

  // ──────────────────────────────────────────────
  // "YOUR NEXT MOVE" — Dynamic State Selection
  // ──────────────────────────────────────────────
  let savedJobMatch = null;
  try {
    const raw = localStorage.getItem("prepai_job_match");
    if (raw) savedJobMatch = JSON.parse(raw);
  } catch (e) {
    console.warn("Could not read saved job match:", e);
  }

  let nextMove = null;

  if (!hasResume) {
    // STATE 1 — No resume uploaded
    nextMove = {
      tag: "📄 Resume Required",
      tagClass: "tag-warning",
      title: "Upload your resume",
      description:
        "Add your resume to unlock personalized career recommendations.",
      meta: null,
      btnText: "Upload Resume →",
      onAction: () => navigate("/profile?tab=profile"),
    };
  } else if (
    savedJobMatch &&
    Array.isArray(savedJobMatch.skillGaps) &&
    savedJobMatch.skillGaps.length > 0
  ) {
    // STATE 3 — Job Match exists and skill gaps are available
    const firstGap = savedJobMatch.skillGaps[0];
    const skillName = typeof firstGap === "string" ? firstGap : firstGap.skill;
    nextMove = {
      tag: "🎯 Skill Gap Identified",
      tagClass: "tag-danger",
      title: "Close your skill gap",
      highlight: skillName,
      description: "This skill was identified as a gap for your target role.",
      meta: null,
      btnText: "Explore Learning →",
      onAction: () => navigate("/learning"),
    };
  } else if (recommendedProjects.length > 0) {
    // STATE 4 — A recommended project exists
    const topProject = recommendedProjects[0];
    const techStack =
      topProject.techStack ||
      topProject.technologies ||
      topProject.skills ||
      [];
    const techText = Array.isArray(techStack)
      ? techStack.slice(0, 4).join(" • ")
      : techStack;

    nextMove = {
      tag: "🚀 Build something real",
      tagClass: "tag-primary",
      title: topProject.title,
      highlight: techText,
      description:
        topProject.description ||
        "Build a real-world project to strengthen your development skills.",
      btnText: "View Project Guide →",
      onAction: () => setGuideProject(topProject),
    };
  } else if (!savedJobMatch) {
    // STATE 2 — Resume exists but no Job Match yet
    nextMove = {
      tag: "🔍 Job Match",
      tagClass: "tag-info",
      title: "Analyze a job you're targeting",
      description:
        "Compare your resume with a real job description and discover your skill gaps.",
      meta: null,
      btnText: "Analyze a Job →",
      onAction: () => navigate("/resume-analyzer?tab=jobMatch"),
    };
  } else {
    // STATE 5 — Mock interview action
    nextMove = {
      tag: "🎤 Interview Ready",
      tagClass: "tag-success",
      title: "Put yourself to the test",
      description:
        "Practice answering questions for your target role with an AI mock interview.",
      meta: null,
      btnText: "Start Interview →",
      onAction: () => navigate("/mock-interview"),
    };
  }

  // Two compact recommendations for bottom columns
  const previewProjects = recommendedProjects.slice(0, 2);
  const previewLearning = learningRecommendations.slice(0, 2);

  return (
    <div className="layout">
      <Sidebar />

      <div className="db-main">
        <Topbar user={user} />

        <div className="db-content-wrap">
          {/* 1. HERO SECTION */}
          <div className="db-hero">
            <div className="db-hero-content">
              <h1 className="db-hero-greeting">
                {getGreeting(user.name)}
              </h1>
              <div className="db-hero-role">{formatRole(user.goal)}</div>
              <div className="db-hero-quote">
                <span className="db-quote-text">{motivationalMessage}</span>
              </div>
            </div>
          </div>

          {/* 2. CAREER SNAPSHOT (4 Compact Cards) */}
          <div className="db-section-block">
            <div className="db-section-label">YOUR CAREER SNAPSHOT</div>

            <div className="db-snapshot-grid">
              {/* Card 1: Technical Skills */}
              <div className="db-snapshot-card">
                <div className="db-snapshot-icon-wrap">
                  <span className="db-snapshot-icon">💻</span>
                </div>
                <div className="db-snapshot-body">
                  <div className="db-snapshot-number">
                    {technicalSkillsCount}
                  </div>
                  <div className="db-snapshot-text">
                    Technical Skills
                  </div>
                </div>
              </div>

              {/* Card 2: Projects Built */}
              <div className="db-snapshot-card">
                <div className="db-snapshot-icon-wrap">
                  <span className="db-snapshot-icon">🚀</span>
                </div>
                <div className="db-snapshot-body">
                  <div className="db-snapshot-number">{ownProjectsCount}</div>
                  <div className="db-snapshot-text">Projects Built</div>
                </div>
              </div>

              {/* Card 3: Resume Uploaded */}
              <div className="db-snapshot-card">
                <div className="db-snapshot-icon-wrap">
                  <span className="db-snapshot-icon">📄</span>
                </div>
                <div className="db-snapshot-body">
                  <div
                    className={`db-snapshot-number ${
                      hasResume ? "status-success" : "status-muted"
                    }`}
                  >
                    {hasResume ? "✓" : "—"}
                  </div>
                  <div className="db-snapshot-text">
                    {hasResume ? "Resume Uploaded" : "Resume Missing"}
                  </div>
                </div>
              </div>

              {/* Card 4: Experience */}
              <div className="db-snapshot-card">
                <div className="db-snapshot-icon-wrap">
                  <span className="db-snapshot-icon">🏢</span>
                </div>
                <div className="db-snapshot-body">
                  <div className="db-snapshot-number">{experienceCount}</div>
                  <div className="db-snapshot-text">
                    {experienceCount === 1 ? "Experience" : "Experience"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. YOUR NEXT MOVE (Featured Action Card) */}
          <div className="db-section-block">
            <div className="db-section-label">YOUR NEXT MOVE</div>

            <div className="db-next-move-card">
              <div className="db-next-move-top">
                <span className={`db-tag ${nextMove.tagClass}`}>
                  {nextMove.tag}
                </span>
              </div>

              <h2 className="db-next-move-title">{nextMove.title}</h2>

              {nextMove.highlight && (
                <div className="db-next-move-highlight">
                  {nextMove.highlight}
                </div>
              )}

              <p className="db-next-move-desc">{nextMove.description}</p>

              <div className="db-next-move-actions">
                <button
                  className="db-primary-btn"
                  onClick={nextMove.onAction}
                >
                  {nextMove.btnText}
                </button>
              </div>
            </div>
          </div>

          {/* 4. TWO-COLUMN BOTTOM SECTION: RECOMMENDED PROJECTS & LEARNING */}
          <div className="db-two-col-grid">
            {/* LEFT: RECOMMENDED PROJECTS */}
            <div className="db-col-block">
              <div className="db-col-header">
                <h3 className="db-col-title">RECOMMENDED PROJECTS</h3>
                <Link to="/projects" className="db-view-all-link">
                  View All →
                </Link>
              </div>

              <div className="db-col-cards">
                {previewProjects.length > 0 ? (
                  previewProjects.map((p, idx) => {
                    const techList =
                      p.techStack || p.technologies || p.skills || [];
                    return (
                      <div key={p._id || idx} className="db-preview-card">
                        <div className="db-preview-header">
                          <h4 className="db-preview-title">{p.title}</h4>
                          {p.difficulty && (
                            <span className="db-diff-chip">{p.difficulty}</span>
                          )}
                        </div>

                        {p.description && (
                          <p className="db-preview-desc">{p.description}</p>
                        )}

                        <div className="db-preview-chips">
                          {techList.slice(0, 3).map((tech) => (
                            <span key={tech} className="db-mini-chip">
                              {tech}
                            </span>
                          ))}
                        </div>

                        <div className="db-preview-action">
                          <button
                            className="db-card-btn"
                            onClick={() => setGuideProject(p)}
                          >
                            View Guide →
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="db-empty-box">
                    <p>No project recommendations available.</p>
                    <Link to="/projects" className="db-inline-link">
                      Explore Projects →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: RECOMMENDED LEARNING */}
            <div className="db-col-block">
              <div className="db-col-header">
                <h3 className="db-col-title">RECOMMENDED LEARNING</h3>
                <Link to="/learning" className="db-view-all-link">
                  View All →
                </Link>
              </div>

              <div className="db-col-cards">
                {previewLearning.length > 0 ? (
                  previewLearning.map((l, idx) => (
                    <div key={l._id || idx} className="db-preview-card">
                      <div className="db-preview-header">
                        <h4 className="db-preview-title">{l.title}</h4>
                        {l.difficulty && (
                          <span className="db-diff-chip">{l.difficulty}</span>
                        )}
                      </div>

                      <p className="db-preview-desc">
                        {l.description ||
                          "Recommended topic to strengthen your core technical profile."}
                      </p>

                      <div className="db-preview-chips">
                        {(l.skills || []).slice(0, 3).map((skill) => (
                          <span key={skill} className="db-mini-chip">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="db-preview-action">
                        <button
                          className="db-card-btn"
                          onClick={() => navigate("/learning")}
                        >
                          Explore →
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="db-empty-box">
                    <p>No learning recommendations available.</p>
                    <Link to="/learning" className="db-inline-link">
                      Browse Topics →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 5. MOCK INTERVIEW WIDE FEATURE CARD */}
          <div className="db-mock-banner">
            <div className="db-mock-content">
              <div className="db-mock-tag">
                <span className="db-mock-icon">🎤</span>
                <span className="db-mock-label">AI MOCK INTERVIEW</span>
              </div>
              <h3 className="db-mock-title">
                Practice questions tailored to your target role.
              </h3>
              <p className="db-mock-subtitle">
                Test your technical knowledge and articulate architectural
                decisions for {formatRole(user.goal)}.
              </p>
            </div>

            <div className="db-mock-action">
              <button
                className="db-mock-btn"
                onClick={() => navigate("/mock-interview")}
              >
                Start Mock Interview →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Implementation Guide Modal */}
      {guideProject && (
        <ProjectGuideModal
          project={guideProject}
          onClose={() => setGuideProject(null)}
        />
      )}
    </div>
  );
}
