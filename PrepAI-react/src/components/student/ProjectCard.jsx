import "./ProjectCard.css";
import { useNavigate } from "react-router-dom";

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  // Handles both:
  // normal project -> project
  // recommended project -> project.project
  const projectData = project.project || project;

  const match = project.match;
  const reason = project.reason || projectData.reason;

  const difficultyColor = {
    Beginner: "#22c55e",
    Intermediate: "#f59e0b",
    Advanced: "#ef4444",
  };

  return (
    <div className="project-card">
      <div className="card-top">
        <span
          className="difficulty"
          style={{
            background: difficultyColor[projectData.difficulty],
          }}
        >
          {projectData.difficulty}
        </span>

        {match && <span className="match">⭐ {match}%</span>}
      </div>

      {reason && (
        <span className="ai-badge">
          🤖 AI Recommended
        </span>
      )}

      <h3>{projectData.title}</h3>

      <p>{projectData.description}</p>

      {reason && (
        <div className="ai-reason">
          <h4>⭐ Why this project?</h4>
          <p>{reason}</p>
        </div>
      )}

      <div className="chips">
        {(projectData.techStack || []).slice(0, 4).map((tech) => (
          <span key={tech} className="chip">
            {tech}
          </span>
        ))}
      </div>

      {projectData._id && (
        <button
          className="view-btn"
          onClick={() => navigate(`/projects/${projectData._id}`)}
        >
          View Details →
        </button>
      )}
    </div>
  );
}