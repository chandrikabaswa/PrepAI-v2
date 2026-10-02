import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "./Learning.css";

const POPULAR_TOPICS = [
  "React",
  "Docker",
  "AWS",
  "Kubernetes",
  "Python",
  "Java",
  "System Design",
  "Machine Learning",
  "SQL",
  "Git",
  "Cybersecurity",
  "TypeScript",
  "Node.js",
  "Next.js",
];

export default function Learning() {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Personalized Recommended Topics
  const [recommendedTopics, setRecommendedTopics] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [aiRoadmapLoading, setAiRoadmapLoading] = useState(false);

  // Filter toolbar for recommended topics
  const [filterQuery, setFilterQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  // Explore Something New Search State
  const [searchTopic, setSearchTopic] = useState("");
  const [exploredTopic, setExploredTopic] = useState(null);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreError, setExploreError] = useState("");

  // Detail Modal State
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Load recommended learning from existing database backend
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        setLoadingRecommended(true);
        const res = await api.get("/learning/recommended");
        setRecommendedTopics(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load recommended learning topics:", err);
      } finally {
        setLoadingRecommended(false);
      }
    };

    fetchRecommended();
  }, []);

  // Generate AI Learning Recommendations based on user profile
  const handleGenerateAIRoadmap = async () => {
    try {
      setAiRoadmapLoading(true);
      const res = await api.get("/learning/ai-recommended");
      if (Array.isArray(res.data) && res.data.length > 0) {
        setRecommendedTopics(res.data);
      }
    } catch (err) {
      console.error("Failed to generate AI recommendations:", err);
      alert("Failed to generate AI learning roadmap. Please try again.");
    } finally {
      setAiRoadmapLoading(false);
    }
  };

  // Explore any technology / skill
  const handleExploreTopic = async (topicToSearch) => {
    const query = (topicToSearch || searchTopic).trim();
    if (!query) return;

    setExploreError("");
    setExploreLoading(true);

    try {
      const res = await api.post("/learning/explore", { topic: query });
      setExploredTopic(res.data);
      setSearchTopic(query);
    } catch (err) {
      console.error("Explore topic error:", err);
      setExploreError(
        err.response?.data?.message ||
          "Could not generate learning roadmap for this topic. Please try again."
      );
    } finally {
      setExploreLoading(false);
    }
  };

  const handleClearExplored = () => {
    setExploredTopic(null);
    setSearchTopic("");
    setExploreError("");
  };

  // Filtered recommended topics list
  const filteredRecommended = useMemo(() => {
    return recommendedTopics.filter((item) => {
      const title = item.title || "";
      const desc = item.description || "";
      const skills = (item.skills || []).join(" ");
      const matchSearch =
        title.toLowerCase().includes(filterQuery.toLowerCase()) ||
        desc.toLowerCase().includes(filterQuery.toLowerCase()) ||
        skills.toLowerCase().includes(filterQuery.toLowerCase());

      const matchDifficulty =
        difficultyFilter === "All" ||
        item.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();

      return matchSearch && matchDifficulty;
    });
  }, [recommendedTopics, filterQuery, difficultyFilter]);

  // Helper to open details modal with structured roadmap data
  const handleOpenDetails = (topic) => {
    // Format topic to ensure all modal sections render gracefully
    const formatted = {
      ...topic,
      prerequisites:
        topic.prerequisites ||
        (Array.isArray(topic.skills) && topic.skills.length > 0
          ? topic.skills
          : ["Basic Programming Foundations"]),
      whatYouWillLearn:
        topic.whatYouWillLearn || [
          `Core principles, concepts, and workflows of ${topic.title}`,
          `Practical implementation and design patterns`,
          `Solving real-world problems and interview questions`,
        ],
      whyLearn:
        topic.whyLearn ||
        topic.reason ||
        `Mastering ${topic.title} builds essential competence for software career pathways and technical interview rounds.`,
      roadmap:
        topic.roadmap || [
          {
            step: 1,
            phase: "Foundations",
            title: "Getting Started & Core Concepts",
            description: `Understand the fundamental architecture, terminology, and core syntax of ${topic.title}.`,
          },
          {
            step: 2,
            phase: "Hands-on Development",
            title: "Building Features & Practical Patterns",
            description: `Implement real functional components, apply best practices, and work through coding exercises.`,
          },
          {
            step: 3,
            phase: "Advanced & Production",
            title: "Performance & Project Integration",
            description: `Integrate ${topic.title} into portfolio applications, optimize code, and prepare interview explanations.`,
          },
        ],
      keyConcepts:
        topic.keyConcepts || [
          topic.title,
          ...(topic.skills || []),
          "Best Practices",
          "Production Standards",
        ],
      projects:
        topic.projects || [
          {
            title: `${topic.title} Portfolio Project`,
            description: `Build an end-to-end practical application showcasing proficiency in ${topic.title}.`,
          },
        ],
      resources: topic.resources || [],
    };

    setSelectedTopic(formatted);
  };

  const handleCloseDetails = () => {
    setSelectedTopic(null);
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main learning-page">
        <Topbar user={user} />

        {/* ========================================================
            1. HEADER & SEARCH BAR
        ======================================================== */}
        <div className="learning-header-section">
          <div className="learning-header-titles">
            <h1 className="learning-page-title">Learn & Upskill</h1>
            <p className="learning-page-subtitle">
              Build the skills you need for your career.
            </p>
          </div>

          {/* Search bar: What do you want to learn? */}
          <form
            className="learning-search-box"
            onSubmit={(e) => {
              e.preventDefault();
              handleExploreTopic();
            }}
          >
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="What do you want to learn? (e.g. React, Docker, AWS, System Design, SQL...)"
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
              />
              {searchTopic && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchTopic("")}
                  title="Clear input"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              className="explore-btn"
              disabled={exploreLoading || !searchTopic.trim()}
            >
              {exploreLoading ? "🤖 Curating..." : "🚀 Explore Topic"}
            </button>
          </form>

          {/* Quick Explore Topic Chips */}
          <div className="popular-topics-row">
            <span className="popular-label">Popular Topics:</span>
            <div className="popular-chips">
              {POPULAR_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  className={`popular-chip ${
                    searchTopic.toLowerCase() === topic.toLowerCase()
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleExploreTopic(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================
            2. EXPLORE SOMETHING NEW (MAIN NEW FEATURE)
        ======================================================== */}
        {exploreLoading && (
          <div className="explore-loading-card">
            <div className="explore-loading-spinner" />
            <div className="explore-loading-text">
              <h3>Exploring "{searchTopic}"...</h3>
              <p>
                Checking our curriculum database and utilizing AI to generate a
                step-by-step roadmap, prerequisites, project ideas, and
                verified resources.
              </p>
            </div>
          </div>
        )}

        {exploreError && (
          <div className="explore-error-card">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <strong>Exploration Error</strong>
              <p>{exploreError}</p>
            </div>
            <button
              type="button"
              className="retry-btn"
              onClick={() => handleExploreTopic(searchTopic)}
            >
              Retry
            </button>
          </div>
        )}

        {exploredTopic && !exploreLoading && (
          <div className="explore-result-container">
            <div className="explore-result-header">
              <div className="explore-result-title-group">
                <span className="explore-section-badge">
                  🎯 Explore Something New
                </span>
                <h2>{exploredTopic.title}</h2>
              </div>

              <div className="explore-header-actions">
                <button
                  type="button"
                  className="clear-explored-btn"
                  onClick={handleClearExplored}
                >
                  ✕ Clear Search
                </button>
              </div>
            </div>

            <div className="explore-card">
              <div className="explore-card-top">
                <div className="explore-meta-badges">
                  <span
                    className={`diff-tag ${
                      exploredTopic.difficulty?.toLowerCase() || "intermediate"
                    }`}
                  >
                    {exploredTopic.difficulty || "Intermediate"}
                  </span>
                  <span className="duration-tag">
                    ⏳ {exploredTopic.duration || "2-3 Weeks"}
                  </span>
                  <span
                    className={`source-tag ${
                      exploredTopic.source === "database" ? "db" : "ai"
                    }`}
                  >
                    {exploredTopic.source === "database"
                      ? "🗄️ Database Verified"
                      : "✨ AI Curated Roadmap"}
                  </span>
                </div>
              </div>

              <p className="explore-desc">{exploredTopic.description}</p>

              {exploredTopic.whyLearn && (
                <div className="why-learn-box">
                  <strong>💡 Why learn this skill:</strong>
                  <p>{exploredTopic.whyLearn}</p>
                </div>
              )}

              {/* Prerequisites & Key Concepts Preview */}
              <div className="explore-preview-grid">
                {exploredTopic.prerequisites &&
                  exploredTopic.prerequisites.length > 0 && (
                    <div className="preview-col">
                      <span className="preview-label">Prerequisites:</span>
                      <div className="preview-chips">
                        {exploredTopic.prerequisites.map((req, i) => (
                          <span key={i} className="preview-chip req">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {exploredTopic.keyConcepts &&
                  exploredTopic.keyConcepts.length > 0 && (
                    <div className="preview-col">
                      <span className="preview-label">Important Concepts:</span>
                      <div className="preview-chips">
                        {exploredTopic.keyConcepts.slice(0, 5).map((c, i) => (
                          <span key={i} className="preview-chip concept">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Action Button */}
              <div className="explore-card-footer">
                <button
                  type="button"
                  className="view-roadmap-main-btn"
                  onClick={() => handleOpenDetails(exploredTopic)}
                >
                  📖 View Complete Learning Roadmap & Guide →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            3. RECOMMENDED FOR YOU (EXISTING LOGIC PRESERVED)
        ======================================================== */}
        <div className="recommended-section">
          <div className="recommended-header">
            <div>
              <h2 className="recommended-title">Recommended For You</h2>
              <p className="recommended-sub">
                Personalized topics aligned with your career goal (
                <strong>{user.goal || "Software Engineer"}</strong>) and skills.
              </p>
            </div>

            <div className="recommended-top-actions">
              <button
                type="button"
                className="ai-refresh-btn"
                onClick={handleGenerateAIRoadmap}
                disabled={aiRoadmapLoading}
              >
                {aiRoadmapLoading ? "🤖 Generating..." : "✨ AI Custom Recommendations"}
              </button>
            </div>
          </div>

          {/* Filter Toolbar for Recommended Cards */}
          <div className="learning-toolbar">
            <div className="toolbar-search">
              <span className="toolbar-icon">🔍</span>
              <input
                type="text"
                placeholder="Filter recommended topics..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
              />
            </div>

            <div className="toolbar-filter">
              <label>Difficulty:</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {loadingRecommended ? (
            <div className="loading-grid-placeholder">
              <div className="spinner" />
              <p>Loading personalized learning recommendations...</p>
            </div>
          ) : filteredRecommended.length === 0 ? (
            <div className="empty-learning-card">
              <span className="empty-icon">📚</span>
              <h3>No matching recommended topics found</h3>
              <p>
                Try changing your difficulty filter or search query, or explore
                any custom skill using the search bar above.
              </p>
            </div>
          ) : (
            <div className="learning-cards-grid">
              {filteredRecommended.map((topic, idx) => {
                const diffClass =
                  topic.difficulty?.toLowerCase() === "beginner"
                    ? "diff-beginner"
                    : topic.difficulty?.toLowerCase() === "intermediate"
                    ? "diff-intermediate"
                    : "diff-advanced";

                return (
                  <div className="learning-card" key={topic._id || topic.title || idx}>
                    <div className="card-top-row">
                      <span className={`difficulty-badge ${diffClass}`}>
                        {topic.difficulty || "Beginner"}
                      </span>
                      <span className="card-duration">
                        ⏳ {topic.duration || "1-2 Weeks"}
                      </span>
                    </div>

                    <h3 className="card-title">{topic.title}</h3>
                    <p className="card-description">{topic.description}</p>

                    {/* Relevant Career Goals or Why Learn */}
                    {topic.goals && topic.goals.length > 0 && (
                      <div className="card-goals-row">
                        <span className="card-meta-label">Relevant Goal:</span>
                        <div className="goal-chips">
                          {topic.goals.map((g, gIdx) => (
                            <span key={gIdx} className="goal-chip">
                              🎯 {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills Covered / Prerequisites */}
                    {topic.skills && topic.skills.length > 0 && (
                      <div className="card-skills-row">
                        <span className="card-meta-label">Skills / Prereqs:</span>
                        <div className="skill-chips">
                          {topic.skills.map((s, sIdx) => (
                            <span key={sIdx} className="skill-chip">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources preview */}
                    {topic.resources && topic.resources.length > 0 && (
                      <div className="card-resources-row">
                        <span className="card-meta-label">Docs & Guides:</span>
                        <div className="resources-links">
                          {topic.resources.slice(0, 2).map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="card-resource-link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              🔗 {res.name} ↗
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Card Action */}
                    <div className="card-action-box">
                      <button
                        type="button"
                        className="view-learning-btn"
                        onClick={() => handleOpenDetails(topic)}
                      >
                        📖 View Learning →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================
            4. LEARNING DETAIL VIEW MODAL
        ======================================================== */}
        {selectedTopic && (
          <div className="learning-modal-overlay" onClick={handleCloseDetails}>
            <div
              className="learning-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="modal-header">
                <div>
                  <div className="modal-top-badges">
                    <span
                      className={`diff-tag ${
                        selectedTopic.difficulty?.toLowerCase() || "intermediate"
                      }`}
                    >
                      {selectedTopic.difficulty || "Intermediate"}
                    </span>
                    <span className="duration-tag">
                      ⏳ {selectedTopic.duration || "2-3 Weeks"}
                    </span>
                    {selectedTopic.source && (
                      <span
                        className={`source-tag ${
                          selectedTopic.source === "database" ? "db" : "ai"
                        }`}
                      >
                        {selectedTopic.source === "database"
                          ? "🗄️ Database Verified"
                          : "✨ AI Curated"}
                      </span>
                    )}
                  </div>
                  <h2 className="modal-title">{selectedTopic.title}</h2>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={handleCloseDetails}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                {/* 1. Overview */}
                <div className="modal-section">
                  <h4 className="section-heading">📝 Overview</h4>
                  <p className="modal-desc-text">{selectedTopic.description}</p>
                </div>

                {/* 2. Why Learn This Skill */}
                {selectedTopic.whyLearn && (
                  <div className="modal-section modal-highlight-box">
                    <h4 className="section-heading">💡 Why Learn This Skill?</h4>
                    <p className="modal-highlight-text">{selectedTopic.whyLearn}</p>
                  </div>
                )}

                {/* 3. Prerequisites */}
                {selectedTopic.prerequisites &&
                  selectedTopic.prerequisites.length > 0 && (
                    <div className="modal-section">
                      <h4 className="section-heading">
                        🎯 Recommended Prerequisites
                      </h4>
                      <div className="modal-chips-row">
                        {selectedTopic.prerequisites.map((p, i) => (
                          <span key={i} className="modal-chip prereq">
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* 4. What You'll Learn */}
                {selectedTopic.whatYouWillLearn &&
                  selectedTopic.whatYouWillLearn.length > 0 && (
                    <div className="modal-section">
                      <h4 className="section-heading">✨ What You'll Learn</h4>
                      <ul className="modal-bullet-list">
                        {selectedTopic.whatYouWillLearn.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* 5. Phased Learning Roadmap */}
                {selectedTopic.roadmap && selectedTopic.roadmap.length > 0 && (
                  <div className="modal-section">
                    <h4 className="section-heading">
                      📋 Step-by-Step Learning Roadmap
                    </h4>
                    <div className="modal-roadmap-timeline">
                      {selectedTopic.roadmap.map((step, i) => (
                        <div key={i} className="roadmap-step-card">
                          <div className="roadmap-step-header">
                            <span className="step-number">{step.step || i + 1}</span>
                            <div className="step-title-box">
                              {step.phase && (
                                <span className="step-phase-badge">
                                  {step.phase}
                                </span>
                              )}
                              <h5 className="step-title">{step.title}</h5>
                            </div>
                          </div>
                          <p className="step-description">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Important Concepts */}
                {selectedTopic.keyConcepts &&
                  selectedTopic.keyConcepts.length > 0 && (
                    <div className="modal-section">
                      <h4 className="section-heading">🔑 Important Concepts</h4>
                      <div className="modal-chips-row">
                        {selectedTopic.keyConcepts.map((concept, i) => (
                          <span key={i} className="modal-chip concept">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* 7. Practical Project Ideas */}
                {selectedTopic.projects && selectedTopic.projects.length > 0 && (
                  <div className="modal-section">
                    <h4 className="section-heading">
                      🛠️ Practical Project Ideas
                    </h4>
                    <div className="modal-projects-grid">
                      {selectedTopic.projects.map((proj, i) => (
                        <div key={i} className="modal-project-card">
                          <h5>🚀 {proj.title}</h5>
                          <p>{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. Recommended Resources */}
                <div className="modal-section">
                  <h4 className="section-heading">📚 Recommended Resources</h4>
                  {selectedTopic.resources &&
                  selectedTopic.resources.length > 0 ? (
                    <div className="modal-resources-grid">
                      {selectedTopic.resources.map((res, i) => (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="modal-resource-card"
                        >
                          <span className="resource-icon">🌐</span>
                          <span className="resource-name">{res.name}</span>
                          <span className="resource-arrow">↗</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(
                        selectedTopic.title + " official documentation tutorial"
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="modal-resource-card"
                    >
                      <span className="resource-icon">🌐</span>
                      <span className="resource-name">
                        Explore {selectedTopic.title} Documentation & Tutorials
                      </span>
                      <span className="resource-arrow">↗</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-done-btn"
                  onClick={handleCloseDetails}
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
