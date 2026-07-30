import { useEffect, useRef, useState } from "react";

const SPACING_TARGET = 15; // denser mesh -> finer, more organic tears
const TEAR_DISTANCE = 46;
const GRAVITY = 520;
const FRICTION = 0.996;
const FIXED_DT = 1 / 120; // fixed-step verlet for stable, deterministic physics
const SHADE_BUCKETS = 40;

export function TearablePaper({ onRevealed }: { onRevealed?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gone, setGone] = useState(false);
  const [torn, setTorn] = useState(false);
  const [tearing, setTearing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let cols = 0;
    let rows = 0;
    let sx = 0;
    let sy = 0;

    // typed arrays: fast, cache friendly
    let px = new Float32Array(0);
    let py = new Float32Array(0);
    let ox = new Float32Array(0);
    let oy = new Float32Array(0);
    let pinned = new Uint8Array(0);
    let links = new Int32Array(0); // [a, b] pairs
    let linkLen = new Float32Array(0);
    let linkAlive = new Uint8Array(0);
    let degree = new Uint8Array(0); // remaining links per point -> curl detection
    let baseDegree = new Uint8Array(0);
    let fiber = new Float32Array(0); // per-cell fiber/grain value

    let linkCount = 0;
    let brokenCount = 0;
    let fade = 1;
    let released = false;
    let dragging = false;
    let mx = 0;
    let my = 0;
    let pmx = 0;
    let pmy = 0;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let finished = false;
    let tearStarted = false;

    const buckets: Path2D[] = [];

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

      cols = Math.max(16, Math.round(w / SPACING_TARGET)) + 1;
      rows = Math.max(16, Math.round(h / SPACING_TARGET)) + 1;
      sx = w / (cols - 1);
      sy = h / (rows - 1);

      const n = cols * rows;
      px = new Float32Array(n);
      py = new Float32Array(n);
      ox = new Float32Array(n);
      oy = new Float32Array(n);
      pinned = new Uint8Array(n);
      degree = new Uint8Array(n);
      baseDegree = new Uint8Array(n);
      fiber = new Float32Array(n);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = idx(c, r);
          const x = c * sx;
          const y = r * sy;
          px[i] = ox[i] = x;
          py[i] = oy[i] = y;
          pinned[i] = r === 0 || r === rows - 1 || c === 0 || c === cols - 1 ? 1 : 0;
          // layered pseudo-noise = paper fibres running mostly horizontally
          fiber[i] =
            Math.sin(y * 0.9 + Math.sin(x * 0.045) * 2.2) * 0.5 +
            Math.sin(x * 0.31 + y * 0.11) * 0.28 +
            Math.sin(x * 1.7 + y * 0.6) * 0.16;
        }
      }

      // structural + shear links (shear adds bend resistance -> stiffer cardstock)
      const maxLinks = n * 4;
      links = new Int32Array(maxLinks * 2);
      linkLen = new Float32Array(maxLinks);
      linkAlive = new Uint8Array(maxLinks);
      linkCount = 0;

      const diag = Math.hypot(sx, sy);
      const addLink = (a: number, b: number, len: number) => {
        links[linkCount * 2] = a;
        links[linkCount * 2 + 1] = b;
        linkLen[linkCount] = len;
        linkAlive[linkCount] = 1;
        degree[a]++;
        degree[b]++;
        linkCount++;
      };

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = idx(c, r);
          if (c < cols - 1) addLink(i, idx(c + 1, r), sx);
          if (r < rows - 1) addLink(i, idx(c, r + 1), sy);
          if (c < cols - 1 && r < rows - 1) {
            addLink(i, idx(c + 1, r + 1), diag);
            addLink(idx(c + 1, r), idx(c, r + 1), diag);
          }
        }
      }
      baseDegree.set(degree);
      brokenCount = 0;

      buckets.length = 0;
    }

    function breakLink(k: number) {
      linkAlive[k] = 0;
      degree[links[k * 2]]--;
      degree[links[k * 2 + 1]]--;
      brokenCount++;
    }

    function tearNear(x0: number, y0: number, x1: number, y1: number) {
      const radius = 26;
      const dx = x1 - x0;
      const dy = y1 - y0;
      const l2 = dx * dx + dy * dy || 1;
      for (let k = 0; k < linkCount; k++) {
        if (!linkAlive[k]) continue;
        const a = links[k * 2];
        const b = links[k * 2 + 1];
        const cx = (px[a] + px[b]) * 0.5;
        const cy = (py[a] + py[b]) * 0.5;
        let t = ((cx - x0) * dx + (cy - y0) * dy) / l2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const ddx = cx - (x0 + t * dx);
        const ddy = cy - (y0 + t * dy);
        const d = Math.hypot(ddx, ddy);
        // multi-octave jitter -> ragged, fibre-following tear edge
        const jitter =
          (Math.sin(cx * 0.13 + cy * 0.07) + Math.cos(cy * 0.19 - cx * 0.05)) * 6 +
          Math.sin(cx * 0.61 + cy * 0.43) * 3.5;
        if (d < radius + jitter) breakLink(k);
      }
    }

    function step(dt: number) {
      const g = released ? GRAVITY * 1.7 : GRAVITY;
      const gdt = g * dt * dt;
      const n = px.length;
      for (let i = 0; i < n; i++) {
        if (pinned[i] && !released) continue;
        const vx = (px[i] - ox[i]) * FRICTION;
        const vy = (py[i] - oy[i]) * FRICTION;
        ox[i] = px[i];
        oy[i] = py[i];
        px[i] += vx;
        py[i] += vy + gdt;
      }
      const iterations = released ? 2 : 4;
      for (let it = 0; it < iterations; it++) {
        for (let k = 0; k < linkCount; k++) {
          if (!linkAlive[k]) continue;
          const a = links[k * 2];
          const b = links[k * 2 + 1];
          let dx = px[b] - px[a];
          let dy = py[b] - py[a];
          const dist = Math.hypot(dx, dy) || 0.0001;
          if (dist > TEAR_DISTANCE) {
            breakLink(k);
            continue;
          }
          const diff = ((dist - linkLen[k]) / dist) * 0.5;
          dx *= diff;
          dy *= diff;
          if (!(pinned[a] && !released)) {
            px[a] += dx;
            py[a] += dy;
          }
          if (!(pinned[b] && !released)) {
            px[b] -= dx;
            py[b] -= dy;
          }
        }
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      ctx!.globalAlpha = fade;

      for (let i = 0; i < SHADE_BUCKETS; i++) buckets[i] = new Path2D();

      const restArea = sx * sy;
      const cull = TEAR_DISTANCE * 1.25;

      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const i0 = idx(c, r);
          const i1 = i0 + 1;
          const i3 = i0 + cols;
          const i2 = i3 + 1;

          const ax = px[i0];
          const ay = py[i0];
          const bx = px[i1];
          const by = py[i1];
          const cx2 = px[i2];
          const cy2 = py[i2];
          const dx2 = px[i3];
          const dy2 = py[i3];

          const e1x = bx - ax;
          const e1y = by - ay;
          const e2x = dx2 - ax;
          const e2y = dy2 - ay;
          if (Math.hypot(e1x, e1y) > cull || Math.hypot(e2x, e2y) > cull) continue;
          if (Math.hypot(cx2 - bx, cy2 - by) > cull) continue;

          // signed area -> how much the quad is compressed/rotated = surface slope
          const area = Math.abs(e1x * e2y - e1y * e2x);
          const compression = area / restArea; // 1 = flat, <1 = curling away
          // pseudo-normal from edge skew, lit from top-left
          const skew = (e1y / (sx || 1)) * 0.7 - (e2x / (sy || 1)) * 0.7;
          const curl =
            degree[i0] < baseDegree[i0] ||
            degree[i1] < baseDegree[i1] ||
            degree[i2] < baseDegree[i2] ||
            degree[i3] < baseDegree[i3]
              ? 1
              : 0;

          let light =
            0.9 +
            skew * 0.42 + // directional lighting from slope
            (compression - 1) * 0.55 + // shadow where the sheet folds/curls
            fiber[i0] * 0.018 + // fibre grain
            (((c * 73 + r * 149) % 17) / 17 - 0.5) * 0.008;

          if (curl) light += 0.16 - compression * 0.1; // bright lip on curled torn edge

          light = light < 0.35 ? 0.35 : light > 1.12 ? 1.12 : light;

          let bucket = Math.round(((light - 0.35) / (1.12 - 0.35)) * (SHADE_BUCKETS - 1));
          bucket = bucket < 0 ? 0 : bucket > SHADE_BUCKETS - 1 ? SHADE_BUCKETS - 1 : bucket;

          const p = buckets[bucket];
          p.moveTo(ax, ay);
          p.lineTo(bx, by);
          p.lineTo(cx2, cy2);
          p.lineTo(dx2, dy2);
          p.closePath();
        }
      }

      ctx!.lineWidth = 1;
      ctx!.lineJoin = "round";
      for (let i = 0; i < SHADE_BUCKETS; i++) {
        const t = 0.35 + (i / (SHADE_BUCKETS - 1)) * (1.12 - 0.35);
        const l = Math.min(252, 232 * t);
        const color = `rgb(${l | 0}, ${(l - 3) | 0}, ${(l - 11) | 0})`;
        ctx!.fillStyle = color;
        ctx!.strokeStyle = color; // closes hairline seams between quads
        ctx!.fill(buckets[i]);
        ctx!.stroke(buckets[i]);
      }
      ctx!.globalAlpha = 1;
    }

    function loop(now: number) {
      let frame = (now - last) / 1000;
      last = now;
      if (frame > 0.05) frame = 0.05;
      acc += frame;
      let steps = 0;
      while (acc >= FIXED_DT && steps < 6) {
        step(FIXED_DT);
        acc -= FIXED_DT;
        steps++;
      }
      draw();

      if (!released && !tearStarted && brokenCount > 0) {
        tearStarted = true;
        setTearing(true);
      }
      if (!released && brokenCount > (cols + rows) * 4.5) {
        released = true;
        setTorn(true);
        pinned.fill(0);
      }
      if (released) {
        fade -= frame * 0.85;
        let offscreen = true;
        for (let i = 0; i < py.length; i++) {
          if (py[i] < h + 80) {
            offscreen = false;
            break;
          }
        }
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

    const onDown = (e: PointerEvent) => {
      dragging = true;
      mx = pmx = e.clientX;
      my = pmy = e.clientY;
      canvas!.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      pmx = mx;
      pmy = my;
      mx = e.clientX;
      my = e.clientY;
      const dx = mx - pmx;
      const dy = my - pmy;
      for (let i = 0; i < px.length; i++) {
        if (pinned[i]) continue;
        const d = Math.hypot(px[i] - mx, py[i] - my);
        if (d < 55) {
          const falloff = 1 - d / 55;
          ox[i] = px[i] - dx * 0.9 * falloff;
          oy[i] = py[i] - dy * 0.9 * falloff;
          px[i] += dx * 0.55 * falloff;
          py[i] += dy * 0.55 * falloff;
        }
      }
      tearNear(pmx, pmy, mx, my);
    };
    const onUp = () => {
      dragging = false;
    };

    const onResize = () => {
      if (!released) build();
    };

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
    <div className="fixed inset-0 z-50 select-none" style={{ touchAction: "none" }}>
      <canvas ref={canvasRef} className="block h-full w-full cursor-grab active:cursor-grabbing" />
      <div className="paper-fibers pointer-events-none absolute inset-0" />
      <div className="paper-grain pointer-events-none absolute inset-0" />
      <div className="paper-light pointer-events-none absolute inset-0" />
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
