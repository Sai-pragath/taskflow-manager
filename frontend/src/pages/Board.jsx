import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProject } from '../api/index.js';
import KanbanBoard from '../components/KanbanBoard.jsx';
import './Board.css';

export default function Board() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    getProject(projectId)
      .then((res) => setProject(res.data))
      .catch((err) => console.error('Failed to load project:', err));
  }, [projectId]);

  return (
    <div className="page-container animate-fade-in">
      {/* Breadcrumb + header */}
      <div className="board-header">
        <div className="board-breadcrumb">
          <Link to="/" className="board-breadcrumb-link">Dashboard</Link>
          <span className="board-breadcrumb-sep">/</span>
          <span className="board-breadcrumb-current">{project?.name || 'Loading...'}</span>
        </div>
        <div className="board-title-row">
          <h1 className="page-title">{project?.name || 'Project Board'}</h1>
          <Link to={`/analytics/${projectId}`} className="btn btn-ghost btn-sm">
            📊 Analytics
          </Link>
        </div>
        {project?.description && (
          <p className="page-subtitle">{project.description}</p>
        )}
      </div>

      {/* Kanban Board */}
      <KanbanBoard projectId={projectId} />
    </div>
  );
}
