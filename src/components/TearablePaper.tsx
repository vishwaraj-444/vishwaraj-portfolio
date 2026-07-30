import { useEffect, useRef, useState } from "react";

// Mesh density adapts to viewport area so the cell count (and therefore the
// solver cost) stays roughly constant across desktop and mobile.
const TARGET_CELLS = 7600;
const MIN_SPACING = 11;
const TEAR_STRAIN = 2.35; // silk stretches a lot before the weave gives way
const STIFFNESS = 0.58; // <1 = soft, elastic weave (never rubbery: strain-limited)
const GRAVITY = 470;
const FRICTION = 0.991; // air drag on a light fabric
const FIXED_DT = 1 / 100;
const SHADE_BUCKETS = 48;

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
    let linkTear = new Float32Array(0); // per-link tear threshold -> organic rip path
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
    let time = 0;

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

      const spacing = Math.max(MIN_SPACING, Math.sqrt((w * h) / TARGET_CELLS));
      cols = Math.max(16, Math.round(w / spacing)) + 1;
      rows = Math.max(16, Math.round(h / spacing)) + 1;
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
      linkTear = new Float32Array(maxLinks);
      linkAlive = new Uint8Array(maxLinks);
      linkCount = 0;

      const diag = Math.hypot(sx, sy);
      const addLink = (a: number, b: number, len: number) => {
        links[linkCount * 2] = a;
        links[linkCount * 2 + 1] = b;
        linkLen[linkCount] = len;
        // weave strength varies along the grain -> the rip wanders instead of
        // running dead straight
        const wx = (px[a] + px[b]) * 0.5;
        const wy = (py[a] + py[b]) * 0.5;
        linkTear[linkCount] =
          len *
          TEAR_STRAIN *
          (1 +
            Math.sin(wx * 0.07 + Math.cos(wy * 0.031) * 2.4) * 0.16 +
            Math.sin(wy * 0.21 - wx * 0.013) * 0.1 +
            Math.sin(wx * 0.83 + wy * 0.57) * 0.05);
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
      // after release: per-piece flutter (air catching the fabric) so the
      // shreds sway and rotate on the way down instead of dropping like bricks
      const flutter = released ? 1 : 0;
      for (let i = 0; i < n; i++) {
        if (pinned[i] && !released) continue;
        const vx = (px[i] - ox[i]) * FRICTION;
        const vy = (py[i] - oy[i]) * FRICTION;
        ox[i] = px[i];
        oy[i] = py[i];
        let ax = 0;
        if (flutter) {
          const phase = time * 2.6 + px[i] * 0.012 + py[i] * 0.007;
          ax = (Math.sin(phase) + Math.sin(phase * 1.83 + 1.1) * 0.5) * 320 * dt * dt;
        }
        px[i] += vx + ax;
        py[i] += vy + gdt;
      }
      const iterations = released ? 2 : 5;
      for (let it = 0; it < iterations; it++) {
        for (let k = 0; k < linkCount; k++) {
          if (!linkAlive[k]) continue;
          const a = links[k * 2];
          const b = links[k * 2 + 1];
          let dx = px[b] - px[a];
          let dy = py[b] - py[a];
          const dist = Math.hypot(dx, dy) || 0.0001;
          if (dist > linkTear[k]) {
            breakLink(k);
            continue;
          }
          const rest = linkLen[k];
          // soft, non-linear response: gentle near rest (silk drapes and
          // wrinkles), rapidly stiffening as the weave approaches its limit
          const strain = dist / rest;
          const k2 = STIFFNESS + (strain > 1 ? Math.min(0.4, (strain - 1) * 0.45) : 0);
          const diff = ((dist - rest) / dist) * 0.5 * k2;
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
      const cull = Math.max(sx, sy) * TEAR_STRAIN * 1.3;

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

          // wrinkle term: axis-asymmetric stretch reads as a fold running
          // through the weave, which is what gives silk its rippling sheen
          const stretchU = Math.hypot(e1x, e1y) / (sx || 1);
          const stretchV = Math.hypot(e2x, e2y) / (sy || 1);
          const wrinkle = (stretchU - stretchV) * 0.5;

          let light =
            0.9 +
            skew * 0.5 + // directional lighting from slope
            (compression - 1) * 0.62 + // shadow in folds and curls
            wrinkle * 0.34 + // soft highlight along wrinkle ridges
            fiber[i0] * 0.022 + // woven grain
            (((c * 73 + r * 149) % 17) / 17 - 0.5) * 0.006;

          // anisotropic sheen: silk flares bright at grazing slopes
          light += Math.abs(skew) > 0.12 ? Math.min(0.12, (Math.abs(skew) - 0.12) * 0.5) : 0;

          if (curl) {
            // torn edge: bright lit lip with a deeper shadow just behind it
            light += 0.2 - compression * 0.22;
          }

          light = light < 0.3 ? 0.3 : light > 1.18 ? 1.18 : light;

          let bucket = Math.round(((light - 0.3) / (1.18 - 0.3)) * (SHADE_BUCKETS - 1));
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
        const t = 0.3 + (i / (SHADE_BUCKETS - 1)) * (1.18 - 0.3);
        // pearl silk: shadows go cool, highlights bloom warm-white
        const l = Math.min(253, 228 * t);
        const warm = Math.max(0, t - 0.95) * 40;
        const cool = Math.max(0, 0.95 - t) * 18;
        const rC = Math.min(255, l + warm);
        const gC = Math.min(255, l - 2 + warm * 0.7);
        const bC = Math.min(255, l - 9 + cool + warm * 0.3);
        const color = `rgb(${rC | 0}, ${gC | 0}, ${bC | 0})`;
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
      time += frame;
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
