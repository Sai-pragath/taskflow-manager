import './TaskCard.css';

const PRIORITY_MAP = {
  HIGH: { label: 'High', className: 'badge-high' },
  MEDIUM: { label: 'Medium', className: 'badge-medium' },
  LOW: { label: 'Low', className: 'badge-low' },
};

export default function TaskCard({ task, provided, onDelete }) {
  const priority = PRIORITY_MAP[task.priority] || PRIORITY_MAP.MEDIUM;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className="task-card glass-card"
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={provided.draggableProps.style}
      id={`task-card-${task.id}`}
    >
      {/* Header row */}
      <div className="task-card-header">
        <span className={`badge ${priority.className}`}>{priority.label}</span>
        {onDelete && (
          <button
            className="task-card-delete"
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            title="Delete task"
          >
            ×
          </button>
        )}
      </div>

      {/* Title */}
      <h4 className="task-card-title">{task.title}</h4>

      {/* Description */}
      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      {/* Footer */}
      <div className="task-card-footer">
        {task.assignee && (
          <div className="task-card-assignee" title={task.assignee.name}>
            {task.assignee.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        {task.dueDate && (
          <span className="task-card-due">
            📅 {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
