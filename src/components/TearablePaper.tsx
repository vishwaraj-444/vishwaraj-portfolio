import { useEffect, useRef, useState } from "react";

type Point = {
  x: number; y: number; px: number; py: number; pinned: boolean;
};
type Constraint = { a: number; b: number; len: number; alive: boolean };

const SPACING_TARGET = 26;
const TEAR_DISTANCE = 95;
const GRAVITY = 420;
const FRICTION = 0.995;

export function TearablePaper({ onRevealed }: { onRevealed?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gone, setGone] = useState(false);
  const [torn, setTorn] = useState(false);
  const [tearing, setTearing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let cols = 0, rows = 0, sx = 0, sy = 0;
    let points: Point[] = [];
    let constraints: Constraint[] = [];
    let totalConstraints = 1;
    let brokenCount = 0;
    let fade = 1;
    let released = false;
    let dragging = false;
    let mx = 0, my = 0, pmx = 0, pmy = 0;
    let raf = 0;
    let last = performance.now();
    let finished = false;
    let tearStarted = false;

    const idx = (c: number, r: number) => r * cols + c;

    function build() {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.max(10, Math.round(w / SPACING_TARGET)) + 1;
      rows = Math.max(10, Math.round(h / SPACING_TARGET)) + 1;
      sx = w / (cols - 1);
      sy = h / (rows - 1);

      points = [];
      constraints = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * sx;
          const y = r * sy;
          const edge = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
          points.push({ x, y, px: x, py: y, pinned: edge });
        }
      }
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (c < cols - 1) constraints.push({ a: idx(c, r), b: idx(c + 1, r), len: sx, alive: true });
          if (r < rows - 1) constraints.push({ a: idx(c, r), b: idx(c, r + 1), len: sy, alive: true });
        }
      }
      totalConstraints = constraints.length;
      brokenCount = 0;
    }

    function tearNear(x0: number, y0: number, x1: number, y1: number) {
      const radius = 34;
      for (const con of constraints) {
        if (!con.alive) continue;
        const pa = points[con.a];
        const pb = points[con.b];
        const cx = (pa.x + pb.x) / 2;
        const cy = (pa.y + pb.y) / 2;
        // distance from segment (x0,y0)-(x1,y1)
        const dx = x1 - x0, dy = y1 - y0;
        const l2 = dx * dx + dy * dy || 1;
        let t = ((cx - x0) * dx + (cy - y0) * dy) / l2;
        t = Math.max(0, Math.min(1, t));
        const ddx = cx - (x0 + t * dx);
        const ddy = cy - (y0 + t * dy);
        const d = Math.hypot(ddx, ddy);
        // irregular tear edge via pseudo-noise
        const jitter = (Math.sin(cx * 0.13 + cy * 0.07) + Math.cos(cy * 0.19 - cx * 0.05)) * 9;
        if (d < radius + jitter) {
          con.alive = false;
          brokenCount++;
        }
      }
    }

    function simulate(dt: number) {
      const g = released ? GRAVITY * 1.8 : GRAVITY;
      for (const p of points) {
        if (p.pinned && !released) continue;
        const vx = (p.x - p.px) * FRICTION;
        const vy = (p.y - p.py) * FRICTION;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy + g * dt * dt;
      }
      const iterations = released ? 2 : 6;
      for (let i = 0; i < iterations; i++) {
        for (const con of constraints) {
          if (!con.alive) continue;
          const pa = points[con.a];
          const pb = points[con.b];
          let dx = pb.x - pa.x;
          let dy = pb.y - pa.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          if (dist > TEAR_DISTANCE) {
            con.alive = false;
            brokenCount++;
            continue;
          }
          const diff = (dist - con.len) / dist * 0.5;
          dx *= diff;
          dy *= diff;
          if (!(pa.pinned && !released)) { pa.x += dx; pa.y += dy; }
          if (!(pb.pinned && !released)) { pb.x -= dx; pb.y -= dy; }
        }
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      ctx!.globalAlpha = fade;
      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const i0 = idx(c, r), i1 = idx(c + 1, r), i2 = idx(c + 1, r + 1), i3 = idx(c, r + 1);
          const p0 = points[i0], p1 = points[i1], p2 = points[i2], p3 = points[i3];
          const maxEdge = Math.max(
            Math.hypot(p1.x - p0.x, p1.y - p0.y),
            Math.hypot(p3.x - p0.x, p3.y - p0.y),
            Math.hypot(p2.x - p1.x, p2.y - p1.y),
          );
          if (maxEdge > TEAR_DISTANCE * 1.25) continue;
          // shading from local stretch -> curled-edge illusion
          const stretch = Math.min(1, Math.abs(maxEdge - Math.max(sx, sy)) / 22);
          const grain = ((c * 73 + r * 149) % 17) / 17;
          const light = 236 - stretch * 74 + grain * 6;
          ctx!.fillStyle = `rgb(${light}, ${light - 4}, ${light - 12})`;
          ctx!.beginPath();
          ctx!.moveTo(p0.x, p0.y);
          ctx!.lineTo(p1.x, p1.y);
          ctx!.lineTo(p2.x, p2.y);
          ctx!.lineTo(p3.x, p3.y);
          ctx!.closePath();
          ctx!.fill();
          // stroke with the same colour to close hairline seams between quads
          ctx!.strokeStyle = ctx!.fillStyle as string;
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }
      }
      ctx!.globalAlpha = 1;
    }

    function loop(now: number) {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      simulate(dt);
      draw();

      if (!released && !tearStarted && brokenCount > 0) {
        tearStarted = true;
        setTearing(true);
      }
      if (!released && brokenCount / totalConstraints > 0.05) {
        released = true;
        setTorn(true);
        for (const p of points) p.pinned = false;
      }
      if (released) {
        fade -= dt * 0.85;
        let offscreen = true;
        for (const p of points) { if (p.y < h + 80) { offscreen = false; break; } }
        if (fade <= 0 || offscreen) {
          if (!finished) {
            finished = true;
            setGone(true);
            onRevealed?.();
          }
          return;
        }
      }
      raf = requestAnimationFrame(loop);
    }

    function pos(e: PointerEvent) {
      return { x: e.clientX, y: e.clientY };
    }
    const onDown = (e: PointerEvent) => {
      dragging = true;
      const p = pos(e);
      mx = pmx = p.x; my = pmy = p.y;
      canvas!.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const p = pos(e);
      pmx = mx; pmy = my; mx = p.x; my = p.y;
      // drag: pull nearby points
      for (const pt of points) {
        const d = Math.hypot(pt.x - mx, pt.y - my);
        if (d < 60 && !pt.pinned) {
          pt.px = pt.x - (mx - pmx) * 0.9;
          pt.py = pt.y - (my - pmy) * 0.9;
          pt.x += (mx - pmx) * 0.5;
          pt.y += (my - pmy) * 0.5;
        }
      }
      tearNear(pmx, pmy, mx, my);
    };
    const onUp = () => { dragging = false; };

    const onResize = () => { if (!released) build(); };

    const skip = () => {
      if (finished) return;
      finished = true;
      setTorn(true);
      setGone(true);
      onRevealed?.();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skip();
    };

    build();
    if (reduced) {
      skip();
      return () => {};
    }

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [onRevealed]);

  if (gone) return null;

  return (
    <div
      className="fixed inset-0 z-50 select-none"
      style={{ touchAction: "none" }}
    >
      <canvas ref={canvasRef} className="block h-full w-full cursor-grab active:cursor-grabbing" />
      <div className="paper-grain pointer-events-none absolute inset-0" />
      <button
        type="button"
        onClick={() => {
          setTorn(true);
          setGone(true);
          onRevealed?.();
        }}
        className="paper-ink absolute right-5 top-5 rounded-full border border-black/10 bg-white/40 px-4 py-2 text-xs uppercase tracking-widest backdrop-blur-sm"
      >
        Skip intro
      </button>
      {!torn && !tearing && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
          <p className="paper-ink text-sm uppercase tracking-[0.45em]">Tear to enter</p>
          <p className="paper-ink-muted text-xs tracking-widest">drag across the paper</p>
        </div>
      )}
    </div>
  );
}
