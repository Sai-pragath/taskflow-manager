import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useActivity } from '../context/ActivityContext.jsx';
import './Dashboard.css';

const ACTION_ICONS = {
  task_created: '📝',
  task_moved: '➡️',
  task_deleted: '🗑️',
  task_updated: '✏️',
  project_created: '📁',
  project_deleted: '🗑️',
  login: '🔑',
  account_created: '🎉',
};

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function activityLabel(activity) {
  const d = activity.details;
  switch (activity.action) {
    case 'task_created': return `Created task "${d.title}"`;
    case 'task_moved': return `Moved "${d.title}" to ${d.status?.replace('_', ' ')}`;
    case 'task_deleted': return `Deleted task "${d.title}"`;
    case 'task_updated': return `Updated task "${d.title}"`;
    case 'project_created': return `Created project "${d.name}"`;
    case 'project_deleted': return `Deleted project "${d.name}"`;
    case 'login': return 'Signed in';
    case 'account_created': return 'Created account';
    default: return activity.action;
  }
}

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const { activities, logActivity } = useActivity();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(err.response?.data?.error || 'Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      setError('Please enter a project name.');
      return;
    }

    setError('');
    try {
      await createProject(newProject);
      logActivity('project_created', { name: newProject.name });
      toast.success(`Project "${newProject.name}" created!`);
      setNewProject({ name: '', description: '' });
      await fetchProjects();
      setShowNew(false);
    } catch (err) {
      console.error('Failed to create project:', err);
      const msg = err.response?.data?.error || 'Failed to create project. Please try again.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    const project = projects.find((p) => p.id === id);
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      await deleteProject(id);
      logActivity('project_deleted', { name: project?.name });
      toast.success('Project deleted');
    } catch (err) {
      console.error('Failed to delete project:', err);
      toast.error('Failed to delete project');
      fetchProjects();
    }
  };

  const recentActivities = activities.slice(0, 10);

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
          <p className="page-subtitle">Manage your projects and track progress in real-time</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)} id="new-project-btn">
          + New Project
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-value">{projects.length}</div>
          <div className="stat-label">Projects</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">
            {projects.reduce((acc, p) => acc + (p.members?.length || 0), 0)}
          </div>
          <div className="stat-label">Team Members</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-secondary)', WebkitTextFillColor: 'var(--accent-secondary)' }}>
            Active
          </div>
          <div className="stat-label">Status</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">{recentActivities.length}</div>
          <div className="stat-label">Recent Actions</div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="projects-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="project-card-skeleton glass-card">
              <div className="skeleton" style={{ height: 24, width: '60%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, width: '40%' }} />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <p className="empty-state-text">No projects yet</p>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>
            Create your first project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="glass-card project-card"
              id={`project-${project.id}`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="project-card-header">
                <div className="project-card-icon">
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <button
                  className="project-card-delete"
                  onClick={() => handleDelete(project.id)}
                  title="Delete project"
                >
                  ×
                </button>
              </div>
              <h3 className="project-card-name">{project.name}</h3>
              {project.description && (
                <p className="project-card-desc">{project.description}</p>
              )}
              <div className="project-card-meta">
                <span>{project.members?.length || 1} member{(project.members?.length || 1) !== 1 && 's'}</span>
                <span>•</span>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="project-card-actions">
                <Link to={`/board/${project.id}`} className="btn btn-primary btn-sm">
                  Open Board
                </Link>
                <Link to={`/analytics/${project.id}`} className="btn btn-ghost btn-sm">
                  Analytics
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity Timeline */}
      {recentActivities.length > 0 && (
        <div className="activity-section">
          <h2 className="activity-section-title">Recent Activity</h2>
          <div className="activity-timeline">
            {recentActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="activity-item animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="activity-dot" />
                <div className="activity-icon">
                  {ACTION_ICONS[activity.action] || '📌'}
                </div>
                <div className="activity-content">
                  <span className="activity-label">{activityLabel(activity)}</span>
                  <span className="activity-time">{timeAgo(activity.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Create New Project</h3>
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label className="input-label">Project Name</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. Sprint 23"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  autoFocus
                  id="new-project-name"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea
                  className="input-field"
                  placeholder="What is this project about?"
                  rows={3}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                  id="new-project-desc"
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="submit-new-project">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
