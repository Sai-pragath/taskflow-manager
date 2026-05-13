import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useActivity } from '../context/ActivityContext.jsx';
import './Auth.css';

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: '', color: '' },
    { label: 'Weak', color: 'var(--accent-danger)' },
    { label: 'Fair', color: 'var(--accent-warning)' },
    { label: 'Good', color: '#f5a623' },
    { label: 'Strong', color: 'var(--accent-secondary)' },
    { label: 'Excellent', color: '#00e5b0' },
  ];
  return { score, ...levels[score] };
}

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const { logActivity } = useActivity();
  const navigate = useNavigate();

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const passwordErrors = useMemo(() => {
    const errs = [];
    if (form.password && form.password.length < 6) errs.push('At least 6 characters');
    if (form.password && !/[A-Z]/.test(form.password)) errs.push('One uppercase letter');
    if (form.password && !/[0-9]/.test(form.password)) errs.push('One number');
    return errs;
  }, [form.password]);

  const confirmError = form.confirmPassword && form.password !== form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await registerUser({ name: form.name, email: form.email, password: form.password });
      // Auto-login after registration
      const res = await loginUser({ email: form.email, password: form.password });
      login(res.data.token, {
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      });
      logActivity('account_created', { name: form.name, email: form.email });
      toast.success('Welcome to TaskFlow! 🎉');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />
      <div className="auth-mesh" />

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
            <div className="input-wrapper">
              <input
                className="input-field"
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
              <button
                type="button"
                className="input-action-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>

            {/* Password strength meter */}
            {form.password && (
              <div className="password-strength">
                <div className="password-strength-bar">
                  <div
                    className="password-strength-fill"
                    style={{
                      width: `${(strength.score / 5) * 100}%`,
                      background: strength.color,
                    }}
                  />
                </div>
                <span className="password-strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}

            {/* Password requirements */}
            {form.password && passwordErrors.length > 0 && (
              <div className="password-hints">
                {passwordErrors.map((hint) => (
                  <span key={hint} className="password-hint">
                    <span className="password-hint-icon">○</span> {hint}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <input
                className={`input-field ${confirmError ? 'input-field-error' : ''}`}
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
              <button
                type="button"
                className="input-action-btn"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? '🙈' : '👁'}
              </button>
            </div>
            {confirmError && (
              <p className="field-error">Passwords do not match</p>
            )}
          </div>

          <button
            className="btn btn-primary auth-submit"
            type="submit"
            disabled={loading || confirmError}
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
