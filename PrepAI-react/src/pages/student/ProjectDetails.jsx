import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

import "./ProjectDetails.css";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProject();
  }, [id]);

  if (!project) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="project-details">
      <h1>{project.title}</h1>

      <p>{project.description}</p>

      <h3>Difficulty</h3>
      <p>{project.difficulty}</p>

      <h3>Skills Required</h3>
      <div className="chips">
        {project.skills.map((skill) => (
          <span
            key={skill}
            className="chip"
            style={{ cursor: "pointer" }}
            title={`View Learning Guide for ${skill}`}
            onClick={() => navigate(`/learning-guide?skill=${encodeURIComponent(skill)}`)}
          >
            {skill} 📖
          </span>
        ))}
      </div>

      <h3>Tech Stack</h3>
      <div className="chips">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="chip"
            style={{ cursor: "pointer" }}
            title={`View Learning Guide for ${tech}`}
            onClick={() => navigate(`/learning-guide?skill=${encodeURIComponent(tech)}`)}
          >
            {tech} 📖
          </span>
        ))}
      </div>

      <h3>Roadmap</h3>

      <ol>
        {project.roadmap.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

export default ProjectDetails;