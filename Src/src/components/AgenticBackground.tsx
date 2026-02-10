import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulseSpeed: number;
  pulseOffset: number;
}

const AgenticBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    const mouse = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 18000), 80);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseOffset: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 160) {
            const opacity = (1 - dist / 160) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 229, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw & update particles
      particles.forEach(p => {
        const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.3 + 0.7;

        // Mouse repulsion
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 180) {
          const force = (180 - mDist) / 180;
          p.vx += (mdx / mDist) * force * 0.15;
          p.vy += (mdy / mDist) * force * 0.15;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Damping
        p.vx *= 0.995;
        p.vy *= 0.995;

        // Wrap around
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${p.opacity * pulse})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${p.opacity * pulse * 0.08})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleResize = () => {
      resize();
      createParticles();
    };

    resize();
    createParticles();
    animationId = requestAnimationFrame(draw);

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="agentic-background"
    />
  );
};

export default AgenticBackground;
