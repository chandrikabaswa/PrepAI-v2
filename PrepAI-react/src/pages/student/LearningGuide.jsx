import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

import Sidebar from "../../components/student/Sidebar";
import Topbar from "../../components/student/Topbar";

import "./LearningGuide.css";

function isSkillSatisfied(prereq, userSkills = []) {
  if (!prereq || typeof prereq !== "string") return false;
  const pLower = prereq.toLowerCase().trim();

  return userSkills.some((userSkill) => {
    if (!userSkill || typeof userSkill !== "string") return false;
    const uLower = userSkill.toLowerCase().trim();

    if (pLower === uLower) return true;

    const pWords = pLower.split(/[\s,/-]+/);
    const uWords = uLower.split(/[\s,/-]+/);

    return uWords.some((w) => w.length >= 3 && pWords.includes(w));
  });
}

export default function LearningGuide() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const skill = searchParams.get("skill") || "";
  const role = searchParams.get("role") || "";

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guideData, setGuideData] = useState(null);

  const [profileSkills, setProfileSkills] = useState(() => {
    return Array.isArray(user.skills) ? user.skills : [];
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get("/profile");
        if (res.data && Array.isArray(res.data.skills)) {
          setProfileSkills(res.data.skills);
        }
      } catch (err) {
        console.warn("Could not fetch fresh profile skills:", err);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (!skill.trim()) {
      setError("No skill/technology specified for the Learning Guide.");
      setLoading(false);
      return;
    }

    const fetchResources = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/learning/resources", {
          params: {
            skill: skill.trim(),
            role: role.trim(),
          },
        });
        setGuideData(res.data);
      } catch (err) {
        console.error("Learning Guide fetch error:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load external learning resources for this skill."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [skill, role]);

  // Group resources by category
  const categorizedResources = {
    Video: [],
    Course: [],
    Documentation: [],
    Practice: [],
  };

  if (guideData && Array.isArray(guideData.resources)) {
    guideData.resources.forEach((res) => {
      const cat = res.category || "Documentation";
      if (categorizedResources[cat]) {
        categorizedResources[cat].push(res);
      } else {
        categorizedResources.Documentation.push(res);
      }
    });
  }

  const categoryIcons = {
    Video: "🎥",
    Course: "📚",
    Documentation: "📖",
    Practice: "💻",
  };

  const categoryLabels = {
    Video: "Videos & Tutorials",
    Course: "Courses & Classes",
    Documentation: "Official Docs & Guides",
    Practice: "Practice & Exercises",
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/learning");
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main learning-guide-page">
        <Topbar user={user} />

        <div className="lg-container">
          {/* Back button */}
          <div className="lg-nav-row">
            <button
              type="button"
              className="lg-back-btn"
              onClick={handleBack}
            >
              ← Back
            </button>
          </div>

          {!skill.trim() ? (
            <div className="lg-error-card">
              <span className="lg-error-icon">⚠️</span>
              <h3>No Skill Specified</h3>
              <p>Please select a skill or topic to view its Learning Guide.</p>
              <button
                type="button"
                className="lg-primary-btn"
                onClick={() => navigate("/learning")}
              >
                Go to Learnings
              </button>
            </div>
          ) : loading ? (
            <div className="lg-loading-card">
              <div className="lg-spinner" />
              <h3>Discovering Learning Resources for "{skill}"...</h3>
              <p>
                Searching web resources and organizing a concise learning guide.
              </p>
            </div>
          ) : (
            <>
              {/* A. SKILL HEADER */}
              <div className="lg-header-card">
                <div className="lg-header-top">
                  <span className="lg-badge">📖 PrepAI Learning Guide</span>
                  {role && <span className="lg-role-badge">Target Role: {role}</span>}
                </div>

                <h1 className="lg-skill-title">{skill} Learning Guide</h1>

                {role && (
                  <div className="lg-relevance-box">
                    <strong>🎯 Why this matters for your target role ({role}):</strong>
                    <p>{guideData?.relevance}</p>
                  </div>
                )}
              </div>

              {/* Error banner if search failed */}
              {error && (
                <div className="lg-error-banner">
                  <span>⚠️ {error}</span>
                </div>
              )}

              {/* B. WHY LEARN THIS SKILL? */}
              {guideData?.whyLearn && (
                <div className="lg-section-card">
                  <h2 className="lg-section-title">💡 Why Learn {skill}?</h2>
                  <p className="lg-text-body">{guideData.whyLearn}</p>
                </div>
              )}

              {/* C. PREREQUISITES */}
              {guideData && Array.isArray(guideData.prerequisites) && guideData.prerequisites.length > 0 && (
                <div className="lg-section-card">
                  <h2 className="lg-section-title">🧩 Prerequisites</h2>
                  <p className="lg-section-sub">
                    Foundational skills before mastering {skill} (skills in your profile are highlighted in green):
                  </p>

                  <div className="lg-prereq-chips">
                    {guideData.prerequisites.map((prereq, idx) => {
                      const satisfied = isSkillSatisfied(prereq, profileSkills);

                      return (
                        <div
                          key={idx}
                          className={`lg-prereq-chip ${satisfied ? "satisfied" : "neutral"}`}
                          title={
                            satisfied
                              ? `You already have "${prereq}" in your profile!`
                              : `Prerequisite skill for ${skill}`
                          }
                        >
                          <span className="lg-prereq-dot">
                            {satisfied ? "🟢" : "⚪"}
                          </span>
                          <span className="lg-prereq-label">{prereq}</span>
                          {satisfied && (
                            <span className="lg-prereq-tag">Profile Matched</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* D. WHAT YOU'LL LEARN */}
              {guideData && Array.isArray(guideData.whatToLearn) && guideData.whatToLearn.length > 0 && (
                <div className="lg-section-card">
                  <h2 className="lg-section-title">🗺️ What You'll Learn</h2>
                  <p className="lg-section-sub">
                    Concise learning roadmap for {skill}:
                  </p>

                  <div className="lg-roadmap-grid">
                    {guideData.whatToLearn.map((stepItem, index) => (
                      <div className="lg-roadmap-step" key={index}>
                        <span className="lg-step-num">{index + 1}</span>
                        <span className="lg-step-text">{stepItem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* E. KEY CONCEPTS */}
              {guideData && Array.isArray(guideData.keyConcepts) && guideData.keyConcepts.length > 0 && (
                <div className="lg-section-card">
                  <h2 className="lg-section-title">🔑 Key Concepts</h2>
                  <p className="lg-section-sub">
                    Core terminology, capabilities, and building blocks of {skill}:
                  </p>

                  <div className="lg-concepts-chips">
                    {guideData.keyConcepts.map((concept, idx) => (
                      <span className="lg-concept-card" key={idx}>
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* F. RECOMMENDED RESOURCES */}
              <div className="lg-section-card">
                <h2 className="lg-section-title">🔗 Recommended Resources</h2>
                <p className="lg-section-sub">
                  Dynamic web resources discovered for {skill}.
                </p>

                {(!guideData?.resources || guideData.resources.length === 0) ? (
                  <div className="lg-empty-resources">
                    <span className="lg-empty-icon">🔍</span>
                    <p>No external resources discovered at this moment.</p>
                  </div>
                ) : (
                  <div className="lg-categories-stack">
                    {Object.keys(categorizedResources).map((cat) => {
                      const list = categorizedResources[cat];
                      if (list.length === 0) return null;

                      return (
                        <div className="lg-category-group" key={cat}>
                          <h3 className="lg-category-title">
                            {categoryIcons[cat]} {categoryLabels[cat]}
                          </h3>

                          <div className="lg-resources-grid">
                            {list.map((item, idx) => (
                              <div className="lg-resource-card" key={idx}>
                                <div className="lg-resource-header">
                                  <h4 className="lg-resource-title">{item.title}</h4>
                                  {item.platform && (
                                    <span className="lg-platform-tag">
                                      {item.platform}
                                    </span>
                                  )}
                                </div>

                                {item.reason && (
                                  <p className="lg-resource-reason">{item.reason}</p>
                                )}

                                <div className="lg-resource-footer">
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="lg-open-btn"
                                  >
                                    Open Resource →
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* G. SUGGESTED PRACTICE */}
              {guideData && Array.isArray(guideData.suggestedPractice) && guideData.suggestedPractice.length > 0 && (
                <div className="lg-section-card">
                  <h2 className="lg-section-title">🛠️ Suggested Practice</h2>
                  <p className="lg-section-sub">
                    Practical hands-on exercises to solidify your understanding of {skill}:
                  </p>

                  <div className="lg-practice-list">
                    {guideData.suggestedPractice.map((practice, idx) => (
                      <div className="lg-practice-item" key={idx}>
                        <span className="lg-practice-icon">🚀</span>
                        <p>{practice}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* H. INTERVIEW FOCUS */}
              {guideData && Array.isArray(guideData.interviewFocus) && guideData.interviewFocus.length > 0 && (
                <div className="lg-section-card">
                  <h2 className="lg-section-title">💼 Technical Interview Focus</h2>
                  <p className="lg-section-sub">
                    Common concepts and question areas frequently evaluated in technical interviews:
                  </p>

                  <div className="lg-interview-list">
                    {guideData.interviewFocus.map((focusItem, idx) => (
                      <div className="lg-interview-item" key={idx}>
                        <span className="lg-interview-bullet">❓</span>
                        <p>{focusItem}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
