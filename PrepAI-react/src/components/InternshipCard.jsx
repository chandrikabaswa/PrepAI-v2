import { useState } from "react";
import api from "../services/api";
import "./InternshipCard.css";

export default function InternshipCard({
  internship,
  isApplied = false,
  appliedStatus,
  onApplied,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const hasMatchedSkills =
    internship.matchedSkills && internship.matchedSkills.length > 0;
  const hasMissingSkills =
    internship.missingSkills && internship.missingSkills.length > 0;

  const isRecruiterPosting = Boolean(internship.postedBy);
  const applied = isApplied || submitted;
  const currentStatus = appliedStatus || (submitted ? "Applied" : null);

  const handleApply = async () => {
    if (!isRecruiterPosting) {
      if (internship.applyLink) {
        window.open(internship.applyLink, "_blank");
      }
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await api.post(`/applications/${internship._id}`);
      setSubmitted(true);
      setSuccessMsg("Application submitted successfully!");
      if (onApplied) onApplied(internship._id);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit application.";
      if (msg.toLowerCase().includes("already applied")) {
        setSubmitted(true);
        setSuccessMsg("You have already applied to this internship.");
        if (onApplied) onApplied(internship._id);
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="internship-card">
      <div className="internship-top">
        <div>
          <div className="company-header-row">
            <h3>{internship.company}</h3>
            {internship.postedBy && (
              <span className="recruiter-badge">🏢 Recruiter Opening</span>
            )}
          </div>

          <p className="role">{internship.title}</p>
        </div>

        {typeof internship.match === "number" && internship.match > 0 && (
          <span className="match-badge">⭐ {internship.match}% Match</span>
        )}
      </div>

      <div className="internship-meta">
        <span>📍 {internship.location}</span>
        <span>💻 {internship.mode}</span>
        <span>⏳ {internship.duration}</span>
      </div>

      <div className="stipend">💰 {internship.stipend}</div>

      {internship.description && (
        <p className="internship-desc">
          {internship.description.length > 130
            ? internship.description.substring(0, 130) + "..."
            : internship.description}
        </p>
      )}

      {/* Skills & Opportunity Matching Breakdown */}
      <div className="skills-container">
        {hasMatchedSkills && (
          <div className="skills-group">
            <span className="skills-sublabel">
              ✔ Matched Skills ({internship.matchedSkills.length}):
            </span>
            <div className="skills-chips">
              {internship.matchedSkills.map((skill) => (
                <span key={skill} className="skill-chip matched">
                  ✔ {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasMissingSkills && (
          <div className="skills-group">
            <span className="skills-sublabel">Missing Skills:</span>
            <div className="skills-chips">
              {internship.missingSkills.map((skill) => (
                <span key={skill} className="skill-chip missing">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {!hasMatchedSkills && !hasMissingSkills && internship.skills && (
          <div className="skills-chips">
            {internship.skills.map((skill) => (
              <span key={skill} className="skill-chip">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Application Actions */}
      <div className="card-footer-actions">
        {successMsg && (
          <div className="application-success-banner">🎉 {successMsg}</div>
        )}
        {errorMsg && (
          <div className="application-error-banner">⚠️ {errorMsg}</div>
        )}

        <div className="action-buttons-group">
          {isRecruiterPosting ? (
            applied ? (
              <>
                <button className="apply-btn applied-btn" disabled>
                  ✔ Already Applied {currentStatus ? `(${currentStatus})` : ""}
                </button>
                {internship.applyLink && (
                  <button
                    className="secondary-link-btn"
                    onClick={() => window.open(internship.applyLink, "_blank")}
                  >
                    External Link ↗
                  </button>
                )}
              </>
            ) : (
              <button
                className="apply-btn"
                disabled={submitting}
                onClick={handleApply}
              >
                {submitting ? "Submitting..." : "Apply Now →"}
              </button>
            )
          ) : (
            <button
              className="apply-btn"
              onClick={() => window.open(internship.applyLink, "_blank")}
            >
              Apply Now →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}