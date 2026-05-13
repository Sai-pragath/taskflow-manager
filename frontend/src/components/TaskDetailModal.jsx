import { useState, useEffect } from 'react';
import { updateTask } from '../api/index.js';
import { useToast } from '../context/ToastContext.jsx';
import { useActivity } from '../context/ActivityContext.jsx';
import './TaskDetailModal.css';

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: 'var(--accent-secondary)' },
  { value: 'MEDIUM', label: 'Medium', color: 'var(--accent-warning)' },
  { value: 'HIGH', label: 'High', color: 'var(--accent-danger)' },
];

function parseSubtasks(description) {
  if (!description) return { text: '', subtasks: [] };
  try {
    const marker = '<!--subtasks:';
    const idx = description.indexOf(marker);
    if (idx === -1) return { text: description, subtasks: [] };
    const jsonStr = description.slice(idx + marker.length, description.indexOf('-->', idx));
    const subtasks = JSON.parse(jsonStr);
    const text = description.slice(0, idx).trim();
    return { text, subtasks };
  } catch {
    return { text: description, subtasks: [] };
  }
}

function serializeSubtasks(text, subtasks) {
  if (subtasks.length === 0) return text;
  return `${text}\n<!--subtasks:${JSON.stringify(subtasks)}-->`;
}

export default function TaskDetailModal({ task, onClose, onUpdate }) {
  const [title, setTitle] = useState(task.title);
  const [descText, setDescText] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [priority, setPriority] = useState(task.priority);
  const [newSubtask, setNewSubtask] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivity();

  useEffect(() => {
    const { text, subtasks: parsed } = parseSubtasks(task.description);
    setDescText(text);
    setSubtasks(parsed);
  }, [task.description]);

  const completedCount = subtasks.filter((s) => s.done).length;

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: Date.now(), text: newSubtask.trim(), done: false }]);
    setNewSubtask('');
  };

  const toggleSubtask = (id) => {
    setSubtasks(subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  };

  const removeSubtask = (id) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const description = serializeSubtasks(descText, subtasks);
      await updateTask(task.id, { title, description, priority });
      logActivity('task_updated', { title, taskId: task.id });
      toast.success('Task updated');
      onUpdate?.();
      onClose();
    } catch (err) {
      console.error('Failed to update task:', err);
      toast.error('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-wide animate-slide-up task-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="task-detail-header">
          <input
            className="task-detail-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />
          <button className="task-detail-close" onClick={onClose}>×</button>
        </div>

        {/* Priority selector */}
        <div className="task-detail-section">
          <label className="input-label">Priority</label>
          <div className="task-detail-priorities">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`task-detail-priority-btn ${priority === opt.value ? 'active' : ''}`}
                onClick={() => setPriority(opt.value)}
                style={priority === opt.value ? { borderColor: opt.color, color: opt.color, background: `${opt.color}15` } : {}}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="task-detail-section">
          <label className="input-label">Description</label>
          <textarea
            className="input-field"
            value={descText}
            onChange={(e) => setDescText(e.target.value)}
            placeholder="Add description..."
            rows={3}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Subtasks / Checklist */}
        <div className="task-detail-section">
          <div className="task-detail-section-header">
            <label className="input-label" style={{ margin: 0 }}>
              Checklist {subtasks.length > 0 && `(${completedCount}/${subtasks.length})`}
            </label>
          </div>

          {/* Progress bar */}
          {subtasks.length > 0 && (
            <div className="subtask-progress-bar">
              <div
                className="subtask-progress-fill"
                style={{ width: `${(completedCount / subtasks.length) * 100}%` }}
              />
            </div>
          )}

          {/* Subtask list */}
          <div className="subtask-list">
            {subtasks.map((s) => (
              <div key={s.id} className={`subtask-item ${s.done ? 'subtask-done' : ''}`}>
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={s.done}
                    onChange={() => toggleSubtask(s.id)}
                  />
                  <span className={s.done ? 'subtask-text-done' : ''}>{s.text}</span>
                </label>
                <button
                  className="subtask-remove"
                  onClick={() => removeSubtask(s.id)}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Add subtask */}
          <div className="subtask-add">
            <input
              className="input-field"
              type="text"
              placeholder="Add a checklist item..."
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
            />
            <button className="btn btn-ghost btn-sm" onClick={handleAddSubtask}>
              + Add
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="task-detail-footer">
          {task.createdAt && (
            <span className="task-detail-created">
              Created {new Date(task.createdAt).toLocaleDateString()}
            </span>
          )}
          <div className="task-detail-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
