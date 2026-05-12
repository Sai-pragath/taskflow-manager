import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser(form);
      // Auto-login after registration
      const res = await loginUser({ email: form.email, password: form.password });
      login(res.data.token, {
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <div className="auth-container animate-slide-up">
        <div className="auth-brand">
          <span className="auth-brand-icon">⚡</span>
          <h1 className="auth-brand-text">TaskFlow</h1>
          <p className="auth-brand-sub">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="input-group">
            <label className="input-label" htmlFor="name">Full Name</label>
            <input
              className="input-field"
              id="name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
            />
          </div>

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
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input
              className="input-field"
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <button
            className="btn btn-primary auth-submit"
            type="submit"
            disabled={loading}
            id="register-btn"
          >
            {loading ? <span className="auth-spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" id="login-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
