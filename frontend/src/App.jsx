import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Particles from './components/Particles.jsx';
import Toast from './components/Toast.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import FocusTimer from './components/FocusTimer.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Board from './pages/Board.jsx';
import Analytics from './pages/Analytics.jsx';

export default function App() {
  const { token } = useAuth();
  const [timerVisible, setTimerVisible] = useState(false);

  return (
    <>
      {/* Global decorative particles */}
      <Particles />

      {/* Toast notifications */}
      <Toast />

      {/* Command palette (⌘K) — only when logged in */}
      {token && <CommandPalette />}

      {/* Focus timer widget */}
      {token && (
        <FocusTimer
          visible={timerVisible}
          onClose={() => setTimerVisible(false)}
        />
      )}

      {token && (
        <Navbar
          onToggleTimer={() => setTimerVisible(!timerVisible)}
          timerVisible={timerVisible}
        />
      )}

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/board/:projectId" element={<Board />} />
          <Route path="/analytics/:projectId" element={<Analytics />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
