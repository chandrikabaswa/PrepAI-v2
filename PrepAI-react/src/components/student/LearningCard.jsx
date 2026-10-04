import "./LearningCard.css";

export default function LearningCard({ item, fullView = false }) {
  return (
    <div className={`learning-card ${fullView ? "full-view" : ""}`}>
      <div className="learning-header">
        {item.reason && <span className="ai-badge">🤖 AI Recommended</span>}

        <h4>{item.title}</h4>

        <span className={`difficulty ${item.difficulty.toLowerCase()}`}>
          {item.difficulty}
        </span>
      </div>

      <p className="learning-desc">{item.description}</p>

      {item.reason && (
        <div className="ai-reason">
          <h5>⭐ Why learn this?</h5>

          <p>{item.reason}</p>
        </div>
      )}

      <div className="learning-duration">
        ⏳ {item.duration || "Self-paced"}
      </div>

      {fullView && (
        <>
          <h5>Resources</h5>

          <div className="resources">
            {(item.resources || []).map((resource) => (
              <a
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noreferrer"
              >
                {resource.name}
              </a>
            ))}

            {(!item.resources || item.resources.length === 0) && (
              <p>No resources available.</p>
            )}
          </div>
        </>
      )}

      {!fullView && item.resources && item.resources.length > 0 && (
        <a
          href={item.resources[0].url}
          target="_blank"
          rel="noreferrer"
          className="learning-link"
        >
          Start Learning →
        </a>
      )}
    </div>
  );
}
