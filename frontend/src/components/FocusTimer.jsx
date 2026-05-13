import { useState, useEffect, useRef, useCallback } from 'react';
import './FocusTimer.css';

const PRESETS = {
  work: { label: 'Focus', duration: 25 * 60, color: 'var(--accent-primary)' },
  shortBreak: { label: 'Short Break', duration: 5 * 60, color: 'var(--accent-secondary)' },
  longBreak: { label: 'Long Break', duration: 15 * 60, color: 'var(--accent-tertiary)' },
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function FocusTimer({ visible, onClose }) {
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(PRESETS.work.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const preset = PRESETS[mode];
  const progress = 1 - timeLeft / preset.duration;
  const circumference = 2 * Math.PI * 90;

  const sendNotification = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '⚡' });
    }
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (mode === 'work') {
        setSessions((prev) => prev + 1);
        sendNotification('Focus session complete! 🎉', 'Time for a break.');
        // Auto-switch to break
        const nextMode = (sessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
        setMode(nextMode);
        setTimeLeft(PRESETS[nextMode].duration);
      } else {
        sendNotification('Break over! 💪', 'Time to get back to work.');
        setMode('work');
        setTimeLeft(PRESETS.work.duration);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, mode, sessions, sendNotification]);

  const handleModeChange = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(PRESETS[newMode].duration);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(preset.duration);
  };

  if (!visible) return null;

  return (
    <div className="focus-timer animate-slide-up" id="focus-timer">
      {/* Header */}
      <div className="focus-timer-header">
        <h3 className="focus-timer-title">🍅 Focus Timer</h3>
        <button className="focus-timer-close" onClick={onClose} aria-label="Close timer">×</button>
      </div>

      {/* Mode tabs */}
      <div className="focus-timer-modes">
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            key={key}
            className={`focus-timer-mode ${mode === key ? 'active' : ''}`}
            onClick={() => handleModeChange(key)}
            style={mode === key ? { background: `${p.color}22`, color: p.color } : {}}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Circular progress */}
      <div className="focus-timer-ring">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke={preset.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
          />
        </svg>
        <div className="focus-timer-time">{formatTime(timeLeft)}</div>
        <div className="focus-timer-mode-label">{preset.label}</div>
      </div>

      {/* Controls */}
      <div className="focus-timer-controls">
        <button className="btn btn-ghost btn-sm" onClick={handleReset}>
          ↺ Reset
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setIsRunning(!isRunning)}
          style={{ minWidth: 100 }}
        >
          {isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
      </div>

      {/* Sessions counter */}
      <div className="focus-timer-sessions">
        <span className="focus-timer-sessions-count">{sessions}</span>
        <span className="focus-timer-sessions-label">sessions today</span>
      </div>
    </div>
  );
}
