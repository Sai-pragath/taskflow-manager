import { createContext, useContext, useState, useCallback } from 'react';

const ActivityContext = createContext(null);

const MAX_ACTIVITIES = 50;
const STORAGE_KEY = 'taskflow_activity_log';

function loadActivities() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveActivities(activities) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities.slice(0, MAX_ACTIVITIES)));
  } catch {
    // Storage full, silently fail
  }
}

export function ActivityProvider({ children }) {
  const [activities, setActivities] = useState(loadActivities);

  const logActivity = useCallback((action, details = {}) => {
    const entry = {
      id: Date.now() + Math.random(),
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => {
      const next = [entry, ...prev].slice(0, MAX_ACTIVITIES);
      saveActivities(next);
      return next;
    });
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ActivityContext.Provider value={{ activities, logActivity, clearActivities }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}
