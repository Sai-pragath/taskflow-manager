import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import './Dashboard.css';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const { user } = useAuth();

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
      setNewProject({ name: '', description: '' });
      await fetchProjects();
      setShowNew(false);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err.response?.data?.error || 'Failed to create project. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      await deleteProject(id);
    } catch (err) {
      console.error('Failed to delete project:', err);
      fetchProjects();
    }
  };

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
          {projects.map((project) => (
            <div key={project.id} className="glass-card project-card" id={`project-${project.id}`}>
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
