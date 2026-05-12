import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getStatusCounts, getPriorityCounts, getProject } from '../api/index.js';
import './Analytics.css';

const STATUS_COLORS = { TODO: '#6c63ff', IN_PROGRESS: '#3b82f6', REVIEW: '#ffb347', DONE: '#00d4aa' };
const PRIORITY_COLORS = { HIGH: '#ff4757', MEDIUM: '#ffb347', LOW: '#00d4aa' };

export default function Analytics() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProject(projectId),
      getStatusCounts(projectId),
      getPriorityCounts(projectId),
    ]).then(([projRes, statusRes, prioRes]) => {
      setProject(projRes.data);
      setStatusData(Object.entries(statusRes.data).map(([name, value]) => ({ name: name.replace('_', ' '), value, fill: STATUS_COLORS[name] || '#6c63ff' })));
      setPriorityData(Object.entries(prioRes.data).map(([name, value]) => ({ name, value, fill: PRIORITY_COLORS[name] || '#ffb347' })));
    }).catch(console.error).finally(() => setLoading(false));
  }, [projectId]);

  const totalTasks = statusData.reduce((a, b) => a + b.value, 0);
  const doneTasks = statusData.find(s => s.name === 'DONE')?.value || 0;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ height: 32, width: 300, marginBottom: 24 }} />
        <div className="stats-grid">
          {[1,2,3,4].map(i => <div key={i} className="glass-card stat-card"><div className="skeleton" style={{ height: 48, width: 60 }} /></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="board-breadcrumb" style={{ marginBottom: 12 }}>
        <Link to="/" className="board-breadcrumb-link">Dashboard</Link>
        <span className="board-breadcrumb-sep">/</span>
        <Link to={`/board/${projectId}`} className="board-breadcrumb-link">{project?.name}</Link>
        <span className="board-breadcrumb-sep">/</span>
        <span className="board-breadcrumb-current">Analytics</span>
      </div>

      <div className="board-title-row" style={{ marginBottom: 28 }}>
        <h1 className="page-title">📊 Analytics</h1>
        <Link to={`/board/${projectId}`} className="btn btn-ghost btn-sm">← Back to Board</Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="glass-card stat-card"><div className="stat-value">{totalTasks}</div><div className="stat-label">Total Tasks</div></div>
        <div className="glass-card stat-card"><div className="stat-value">{doneTasks}</div><div className="stat-label">Completed</div></div>
        <div className="glass-card stat-card"><div className="stat-value">{completionRate}%</div><div className="stat-label">Completion</div></div>
        <div className="glass-card stat-card"><div className="stat-value">{totalTasks - doneTasks}</div><div className="stat-label">Remaining</div></div>
      </div>

      {/* Charts */}
      <div className="analytics-charts">
        <div className="glass-card analytics-chart-card">
          <h3 className="analytics-chart-title">Tasks by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0f0ff' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No data yet</p></div>}
        </div>

        <div className="glass-card analytics-chart-card">
          <h3 className="analytics-chart-title">Tasks by Priority</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={priorityData}>
                <XAxis dataKey="name" stroke="#6b6b8d" fontSize={12} />
                <YAxis stroke="#6b6b8d" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0f0ff' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No data yet</p></div>}
        </div>
      </div>
    </div>
  );
}
