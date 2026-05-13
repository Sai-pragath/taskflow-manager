import { useMemo } from 'react';

const PARTICLE_COUNT = 30;

function generateParticles() {
  const colors = [
    'rgba(108, 99, 255, 0.3)',
    'rgba(0, 212, 170, 0.2)',
    'rgba(59, 130, 246, 0.25)',
    'rgba(255, 107, 157, 0.2)',
  ];
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 20,
    drift: (Math.random() - 0.5) * 120,
    opacity: Math.random() * 0.4 + 0.2,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}

export default function Particles() {
  const particles = useMemo(generateParticles, []);

  return (
    <div className="particles-container" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            '--size': `${p.size}px`,
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
            '--drift': `${p.drift}px`,
            '--opacity': p.opacity,
            '--color': p.color,
            left: `${p.left}%`,
          }}
        />
      ))}
    </div>
  );
}
