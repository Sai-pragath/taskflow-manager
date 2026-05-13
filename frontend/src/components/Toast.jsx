import { useToast } from '../context/ToastContext.jsx';
import './Toast.css';

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" id="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-item toast-${t.type}`}
          id={`toast-${t.id}`}
          role="alert"
        >
          <div className="toast-icon">{ICONS[t.type]}</div>
          <div className="toast-message">{t.message}</div>
          <button
            className="toast-close"
            onClick={() => removeToast(t.id)}
            aria-label="Close notification"
          >
            ×
          </button>
          {t.duration > 0 && (
            <div
              className="toast-progress"
              style={{ animationDuration: `${t.duration}ms` }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
