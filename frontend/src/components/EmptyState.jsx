import '../styles/EmptyState.css';

/**
 * Reusable empty-state block.
 *
 * Props:
 *   icon        — React node (e.g. <CheckSquare size={28} />)
 *   title       — headline string
 *   description — supporting copy
 *   action      — React node placed below the description (button, link, etc.)
 *   checklist   — optional array of { label, done } rendered as an onboarding list
 */
const EmptyState = ({ icon, title, description, action, checklist }) => {
  return (
    <div className="empty-state-box">
      <div className="empty-state-glow" aria-hidden="true" />
      {icon && <div className="empty-state-icon">{icon}</div>}
      {title && <h3 className="empty-state-title">{title}</h3>}
      {description && <p className="empty-state-description">{description}</p>}

      {checklist && checklist.length > 0 && (
        <ol className="empty-state-checklist">
          {checklist.map((item, idx) => (
            <li
              key={idx}
              className={`empty-state-step ${item.done ? 'done' : ''}`}
              aria-checked={!!item.done}
            >
              <span className="empty-state-step-marker" aria-hidden="true">
                {item.done ? '✓' : idx + 1}
              </span>
              <span className="empty-state-step-label">{item.label}</span>
            </li>
          ))}
        </ol>
      )}

      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};

export default EmptyState;
