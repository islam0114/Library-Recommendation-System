import React, { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const ctx = cv.getContext("2d");
    let raf;
    let running = true;

    const resize = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const cols = ["rgba(13,148,136,", "rgba(99,102,241,", "rgba(6,182,212,", "rgba(14,165,233,"];
    const orbs = [
      { px: .08, py: .12, r: 220, c: "rgba(13,148,136," },
      { px: .88, py: .18, r: 190, c: "rgba(99,102,241," },
      { px: .45, py: .92, r: 200, c: "rgba(6,182,212," },
      { px: .7, py: .55, r: 140, c: "rgba(14,165,233," },
    ];
    
    const pts = Array.from({ length: 65 }, () => ({
      x: Math.random() * (cv.width || 900), y: Math.random() * (cv.height || 700),
      r: Math.random() * 1.9 + 0.4, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * .5 + .22
    }));

    let t = 0;
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      t += .003;

      orbs.forEach((o, i) => {
        const ox = o.px * cv.width + Math.sin(t + i * 1.3) * 38;
        const oy = o.py * cv.height + Math.cos(t + i * .9) * 28;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        g.addColorStop(0, o.c + "0.13)"); g.addColorStop(.4, o.c + "0.06)"); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, o.r, 0, Math.PI * 2); ctx.fill();
      });

      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = p.c + p.a + ")"; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > cv.width) p.vx *= -1; if (p.y < 0 || p.y > cv.height) p.vy *= -1;
      });

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 90) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${.045 * (1 - d / 90)})`; ctx.lineWidth = .5; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.6
      }}
    />
  );
}