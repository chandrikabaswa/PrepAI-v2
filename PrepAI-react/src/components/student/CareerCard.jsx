import "./CareerCard.css";

export default function CareerCard({
  goal,
  readiness,
}) {
  return (
    <div className="card goal-card">
      <div className="goal-readiness">
        <div className="goal-section">
          <h3>Career Goal</h3>
          <h2>{goal}</h2>
        </div>

        <div className="readiness-section">
          <h3>Career Readiness</h3>

          <div className="progress-bar">
            <div
              className="progress"
              style={{
                width: `${readiness}%`,
              }}
            ></div>
          </div>

          <p>{readiness}% Ready</p>
        </div>
      </div>
    </div>
  );
}