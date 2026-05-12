import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { loginUser } from '../api/index.js';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser(form);
      login(res.data.token, {
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Decorative orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <div className="auth-container animate-slide-up">
        {/* Brand */}
        <div className="auth-brand">
          <span className="auth-brand-icon">⚡</span>
          <h1 className="auth-brand-text">TaskFlow</h1>
          <p className="auth-brand-sub">Sign in to your workspace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" id="login-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <input
              className="input-field"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input
              className="input-field"
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            className="btn btn-primary auth-submit"
            type="submit"
            disabled={loading}
            id="login-btn"
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" id="register-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
