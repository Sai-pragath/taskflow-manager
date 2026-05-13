import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

export default function Navbar({ onToggleTimer, timerVisible }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

        {/* Right section */}
        <div className="navbar-right">
          {/* Search hint */}
          <button
            className="navbar-search-hint"
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            }}
            title="Quick search (⌘K)"
            id="search-hint-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span className="navbar-search-hint-text">Search</span>
            <kbd>⌘K</kbd>
          </button>

          {/* Focus timer toggle */}
          <button
            className={`navbar-timer-btn ${timerVisible ? 'active' : ''}`}
            onClick={onToggleTimer}
            title="Focus Timer"
            id="timer-toggle-btn"
          >
            🍅
          </button>

          {/* User dropdown */}
          <div className="navbar-user-wrapper" ref={menuRef}>
            <button
              className="navbar-avatar-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              id="user-avatar"
            >
              <div className="navbar-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <span className="navbar-username">{user?.name || 'User'}</span>
              <svg className={`navbar-chevron ${showUserMenu ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            {showUserMenu && (
              <div className="navbar-dropdown animate-slide-up">
                <div className="navbar-dropdown-header">
                  <div className="navbar-dropdown-avatar">
                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="navbar-dropdown-name">{user?.name || 'User'}</div>
                    <div className="navbar-dropdown-email">{user?.email || ''}</div>
                  </div>
                </div>
                <div className="navbar-dropdown-divider" />
                <div className="navbar-dropdown-role">
                  <span className="badge badge-todo">{user?.role || 'MEMBER'}</span>
                </div>
                <div className="navbar-dropdown-divider" />
                <button
                  className="navbar-dropdown-item navbar-dropdown-logout"
                  onClick={handleLogout}
                  id="logout-btn"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
