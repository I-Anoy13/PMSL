import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedY: number;
  color: string;
  opacity: number;
}

export default function ParticleBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate static particles with random traits
    const initialParticles: Particle[] = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speedY: -(Math.random() * 0.15 + 0.05),
      color: Math.random() > 0.5 ? '#00ff87' : '#00d4ff',
      opacity: Math.random() * 0.5 + 0.1,
    }));
    setParticles(initialParticles);

    // Animation loop to float upwards
    const interval = setInterval(() => {
      setParticles((prevParticles) =>
        prevParticles.map((p) => {
          let newY = p.y + p.speedY;
          let newX = p.x + (Math.sin(newY / 10) * 0.05); // slight sway
          if (newY < -5) {
            newY = 105;
            newX = Math.random() * 100;
          }
          return { ...p, y: newY, x: newX };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none blur-[1px] transition-transform duration-500"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 8px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}
