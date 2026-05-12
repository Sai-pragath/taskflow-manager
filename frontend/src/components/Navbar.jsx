import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">⚡</span>
          <span className="navbar-logo-text">TaskFlow</span>
        </Link>

        {/* Nav links */}
        <div className="navbar-links">
          <Link
            to="/"
            className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
            id="nav-dashboard"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
            Dashboard
          </Link>
        </div>

        {/* User section */}
        <div className="navbar-user">
          <div className="navbar-avatar" id="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className="navbar-username">{user?.name || 'User'}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
