import './TaskCard.css';

const PRIORITY_MAP = {
  HIGH: { label: 'High', className: 'badge-high' },
  MEDIUM: { label: 'Medium', className: 'badge-medium' },
  LOW: { label: 'Low', className: 'badge-low' },
};

function parseSubtasks(description) {
  if (!description) return [];
  try {
    const marker = '<!--subtasks:';
    const idx = description.indexOf(marker);
    if (idx === -1) return [];
    const jsonStr = description.slice(idx + marker.length, description.indexOf('-->', idx));
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}

function getCleanDescription(description) {
  if (!description) return '';
  const marker = '<!--subtasks:';
  const idx = description.indexOf(marker);
  if (idx === -1) return description;
  return description.slice(0, idx).trim();
}

export default function TaskCard({ task, provided, onDelete, onOpen }) {
  const priority = PRIORITY_MAP[task.priority] || PRIORITY_MAP.MEDIUM;
  const subtasks = parseSubtasks(task.description);
  const completedCount = subtasks.filter((s) => s.done).length;
  const cleanDesc = getCleanDescription(task.description);

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
      onClick={() => onOpen?.(task)}
    >
      {/* Header row */}
      <div className="task-card-header">
        <span className={`badge ${priority.className}`}>{priority.label}</span>
        <div className="task-card-actions-row">
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
      </div>

      {/* Title */}
      <h4 className="task-card-title">{task.title}</h4>

      {/* Description */}
      {cleanDesc && (
        <p className="task-card-desc">{cleanDesc}</p>
      )}

      {/* Subtasks progress */}
      {subtasks.length > 0 && (
        <div className="task-card-subtasks">
          <div className="task-card-subtask-bar">
            <div
              className="task-card-subtask-fill"
              style={{ width: `${(completedCount / subtasks.length) * 100}%` }}
            />
          </div>
          <span className="task-card-subtask-label">
            ✓ {completedCount}/{subtasks.length}
          </span>
        </div>
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
