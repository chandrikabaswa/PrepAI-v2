import "./SkillsCard.css";

export default function SkillsCard({
  skills,
}) {
  return (
    <div className="card">
      <h3>Your Skills</h3>

      <div className="skills">
        {skills.map((skill) => (
          <div
            key={skill}
            className="skill"
          >
            {skill}
          </div>
        ))}
      </div>
    </div>
  );
}