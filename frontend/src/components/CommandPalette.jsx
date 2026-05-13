import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../api/index.js';
import './CommandPalette.css';

function fuzzyMatch(text, query) {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  if (lower.includes(q)) return true;
  let qi = 0;
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      inputRef.current?.focus();
      // Fetch projects
      getProjects()
        .then((res) => setProjects(res.data))
        .catch(() => {});
    }
  }, [open]);

  // Build commands list
  const commands = useMemo(() => {
    const cmds = [
      { id: 'nav-dashboard', label: 'Go to Dashboard', icon: '🏠', action: () => navigate('/'), category: 'Navigation' },
    ];

    projects.forEach((p) => {
      cmds.push({
        id: `board-${p.id}`,
        label: `Open Board: ${p.name}`,
        icon: '📋',
        action: () => navigate(`/board/${p.id}`),
        category: 'Projects',
      });
      cmds.push({
        id: `analytics-${p.id}`,
        label: `Analytics: ${p.name}`,
        icon: '📊',
        action: () => navigate(`/analytics/${p.id}`),
        category: 'Projects',
      });
    });

    return cmds;
  }, [projects, navigate]);

  // Filtered commands
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    return commands.filter((cmd) => fuzzyMatch(cmd.label, query));
  }, [commands, query]);

  // Reset index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
        setOpen(false);
      }
    },
    [filtered, selectedIndex]
  );

  if (!open) return null;

  // Group by category
  const grouped = {};
  filtered.forEach((cmd) => {
    if (!grouped[cmd.category]) grouped[cmd.category] = [];
    grouped[cmd.category].push(cmd);
  });

  let flatIndex = 0;

  return (
    <div className="cmd-overlay" onClick={() => setOpen(false)}>
      <div className="cmd-palette animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div className="cmd-search">
          <span className="cmd-search-icon">🔍</span>
          <input
            ref={inputRef}
            className="cmd-search-input"
            type="text"
            placeholder="Search commands, projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            id="cmd-palette-input"
          />
          <kbd>ESC</kbd>
        </div>

        {/* Results */}
        <div className="cmd-results">
          {filtered.length === 0 ? (
            <div className="cmd-empty">No results found</div>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category} className="cmd-group">
                <div className="cmd-group-label">{category}</div>
                {cmds.map((cmd) => {
                  const idx = flatIndex++;
                  return (
                    <button
                      key={cmd.id}
                      className={`cmd-item ${idx === selectedIndex ? 'cmd-item-active' : ''}`}
                      onClick={() => {
                        cmd.action();
                        setOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      id={`cmd-${cmd.id}`}
                    >
                      <span className="cmd-item-icon">{cmd.icon}</span>
                      <span className="cmd-item-label">{cmd.label}</span>
                      {idx === selectedIndex && (
                        <span className="cmd-item-hint">
                          <kbd>↵</kbd>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="cmd-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
          <span><kbd>↵</kbd> Select</span>
          <span><kbd>ESC</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
