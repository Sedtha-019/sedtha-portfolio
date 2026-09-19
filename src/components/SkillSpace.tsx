import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

/* ─────────────────────────────────────────────────────────────
   "My skills in embedding space" — a decorative 3D point cloud
   drawn on a plain <canvas> (no 3D library), used as a background
   layer. Skills settle into clusters when it scrolls into view,
   the cloud slowly rotates and tilts toward the mouse, and every
   few seconds a query flies in and links to its nearest skills,
   like a vector search.
───────────────────────────────────────────────────────────── */

type ClusterKey = 'llm' | 'rl' | 'cv' | 'data';

const CLUSTERS: { key: ClusterKey; label: string; center: [number, number, number]; skills: string[] }[] = [
  {
    key: 'llm', label: 'LLM & RAG', center: [-0.95, 0.55, 0.35],
    skills: ['CRAG', 'pgvector', 'Hybrid Search', 'Rerank', 'LLM-as-Judge', 'Embeddings', 'Langfuse', 'Prompting', 'Semantic Cache', 'RAGAS', 'DeepEval', 'OpenRouter'],
  },
  {
    key: 'rl', label: 'Reinforcement Learning', center: [1.0, 0.7, -0.35],
    skills: ['PPO', 'Stable-Baselines3', 'CARLA', 'gymnasium', 'Actor-Critic', 'Curriculum Learning', 'VecNormalize'],
  },
  {
    key: 'cv', label: 'Vision & NLP', center: [0.85, -0.75, 0.55],
    skills: ['PyTorch', 'OpenCV', 'YOLO', 'Faster R-CNN', 'CNN', 'FaceNet', 'Transformers', 'LoRA', 'mBART'],
  },
  {
    key: 'data', label: 'Data & Cloud', center: [-0.75, -0.8, -0.6],
    skills: ['Kubernetes', 'Docker', 'AWS', 'PySpark', 'Airflow', 'PostgreSQL', 'FastAPI', 'NestJS', 'RabbitMQ', 'Dask'],
  },
];

const QUERIES: { text: string; neighbors: [string, string, string] }[] = [
  { text: 'build a RAG chatbot',        neighbors: ['CRAG', 'pgvector', 'Rerank'] },
  { text: 'teach a car to drive',       neighbors: ['PPO', 'CARLA', 'Stable-Baselines3'] },
  { text: 'detect fire in video',       neighbors: ['YOLO', 'OpenCV', 'Faster R-CNN'] },
  { text: 'ship it to the cloud',       neighbors: ['Kubernetes', 'Docker', 'AWS'] },
  { text: 'is the answer faithful?',    neighbors: ['RAGAS', 'DeepEval', 'LLM-as-Judge'] },
  { text: 'summarize Khmer text',       neighbors: ['Transformers', 'LoRA', 'mBART'] },
];

const FORM_SECONDS = 1.8;
const QUERY_SECONDS = 4.8;
const AUTO_SPIN = 0.18; // rad / s
const CAMERA = 4.2;
const BASE_PITCH = 0.32;

// Fades the cloud into the page, so it has no visible edge.
const MASK = 'radial-gradient(ellipse 58% 60% at 55% 50%, #000 40%, transparent 100%)';

type Vec3 = [number, number, number];
type Point = { name: string; cluster: ClusterKey; home: Vec3; start: Vec3; phase: number; links: number[] };

// Deterministic randomness, so the cloud looks the same on every visit.
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildPoints(): Point[] {
  const rand = mulberry32(7);
  const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;
  const points: Point[] = [];
  for (const c of CLUSTERS) {
    for (const name of c.skills) {
      const home: Vec3 = [c.center[0] + gauss() * 0.45, c.center[1] + gauss() * 0.45, c.center[2] + gauss() * 0.45];
      const start: Vec3 = [(rand() - 0.5) * 4, (rand() - 0.5) * 4, (rand() - 0.5) * 4];
      points.push({ name, cluster: c.key, home, start, phase: rand() * Math.PI * 2, links: [] });
    }
  }
  // Connect each skill to its two nearest neighbours in the same cluster.
  points.forEach((p, i) => {
    p.links = points
      .map((q, j) => ({ j, d: q.cluster === p.cluster && j !== i ? dist(p.home, q.home) : Infinity }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .filter(x => x.d < Infinity && x.j > i)
      .map(x => x.j);
  });
  return points;
}

const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);

const POINTS = buildPoints();
const INDEX = new Map(POINTS.map((p, i) => [p.name, i]));

type Palette = Record<ClusterKey, string> & { text: string; muted: string; labelBg: string };

// Colours as "h s% l%" so an alpha can be appended.
function readPalette(dark: boolean): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    llm: v('--secondary') || '265 89% 66%',
    rl: v('--primary') || '185 100% 52%',
    cv: dark ? '158 64% 52%' : '161 94% 30%',
    data: dark ? '43 96% 56%' : '32 95% 44%',
    text: v('--foreground') || '210 40% 96%',
    muted: v('--muted-foreground') || '215 20% 58%',
    labelBg: dark ? '222 47% 6%' : '0 0% 100%',
  };
}

const hsl = (c: string, a = 1) => `hsl(${c} / ${a})`;

const SkillSpace = () => {
  const { theme } = useTheme();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

  const paletteRef = useRef<{ pal: Palette; dark: boolean } | null>(null);
  useEffect(() => { paletteRef.current = { pal: readPalette(theme === 'dark'), dark: theme === 'dark' }; }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0, dpr = 1;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Rotation: steady auto-spin plus an eased tilt toward the mouse.
    let spin = 0.6;
    let tiltX = 0, tiltY = 0, targetX = 0, targetY = 0;
    const onPointer = (e: PointerEvent) => {
      targetX = e.clientX / window.innerWidth - 0.5;
      targetY = e.clientY / window.innerHeight - 0.5;
    };
    if (!reduced) window.addEventListener('pointermove', onPointer, { passive: true });

    // Time only runs while the layer is on screen, so visitors see the
    // clusters form when they reach the section, not on page load.
    let elapsed = reduced ? FORM_SECONDS + QUERY_SECONDS * 0.6 : 0;
    let visible = false;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.2 });
    io.observe(wrap);

    let prev = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      if (!visible || !paletteRef.current || width === 0) return;
      const { pal, dark } = paletteRef.current;

      if (!reduced) {
        elapsed += dt;
        spin += AUTO_SPIN * dt;
        const ease = Math.min(dt * 2.5, 1);
        tiltX += (targetX - tiltX) * ease;
        tiltY += (targetY - tiltY) * ease;
      }
      const yaw = spin + tiltX * 0.7;
      const pitch = BASE_PITCH + tiltY * 0.45;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const unit = Math.min(width, height) * 0.3;
      const project = (v: Vec3) => {
        const x1 = v[0] * cy + v[2] * sy;
        const z1 = -v[0] * sy + v[2] * cy;
        const y2 = v[1] * cp - z1 * sp;
        const z2 = v[1] * sp + z1 * cp;
        const scale = CAMERA / (CAMERA - z2);
        return { x: width * 0.55 + x1 * scale * unit, y: height / 2 - y2 * scale * unit, s: scale, z: z2 };
      };

      const form = easeOut(elapsed / FORM_SECONDS);
      const qTime = Math.max(elapsed - FORM_SECONDS, 0);
      const qIdx = Math.floor(qTime / QUERY_SECONDS) % QUERIES.length;
      const qt = (qTime % QUERY_SECONDS) / QUERY_SECONDS;

      // Positions: fly from scattered start to home, then drift gently.
      const t = elapsed;
      const wobble = reduced ? 0 : 0.035;
      const world: Vec3[] = POINTS.map(p => [
        p.start[0] + (p.home[0] - p.start[0]) * form + Math.sin(t * 0.9 + p.phase) * wobble,
        p.start[1] + (p.home[1] - p.start[1]) * form + Math.cos(t * 0.7 + p.phase) * wobble,
        p.start[2] + (p.home[2] - p.start[2]) * form + Math.sin(t * 0.6 + p.phase * 2) * wobble,
      ]);
      const projected = world.map(project);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const layerAlpha = dark ? 0.9 : 0.7;
      ctx.globalAlpha = layerAlpha;

      const depthAlpha = (z: number) => 0.35 + 0.65 * clamp01((z + 1.8) / 3.6);

      // Intra-cluster links
      ctx.lineWidth = 1;
      POINTS.forEach((p, i) => {
        for (const j of p.links) {
          const a = projected[i], b = projected[j];
          ctx.strokeStyle = hsl(pal[p.cluster], 0.18 * form * depthAlpha((a.z + b.z) / 2));
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      });

      // Query: fly in → draw links → hold → fade
      const query = QUERIES[qIdx];
      const neighborIdx = query.neighbors.map(n => INDEX.get(n)).filter((i): i is number => i !== undefined);
      const active = form >= 1 && neighborIdx.length > 0;
      const qFade = active ? (qt < 0.85 ? 1 : 1 - (qt - 0.85) / 0.15) : 0;
      const target: Vec3 = [0, 0, 0];
      neighborIdx.forEach(i => { target[0] += world[i][0] / 3; target[1] += world[i][1] / 3; target[2] += world[i][2] / 3; });
      target[1] += 0.35;
      const fly = easeOut(qt / 0.18);
      const from: Vec3 = [target[0] * 2.4, 2.2, target[2] * 2.4];
      const qPos: Vec3 = [from[0] + (target[0] - from[0]) * fly, from[1] + (target[1] - from[1]) * fly, from[2] + (target[2] - from[2]) * fly];
      const q = project(qPos);
      const linkProgress = easeOut((qt - 0.18) / 0.15);

      if (active) {
        ctx.lineWidth = 1.4;
        neighborIdx.forEach(i => {
          const n = projected[i];
          const ex = q.x + (n.x - q.x) * linkProgress, ey = q.y + (n.y - q.y) * linkProgress;
          const grad = ctx.createLinearGradient(q.x, q.y, ex, ey);
          grad.addColorStop(0, hsl(pal.text, 0.7 * qFade));
          grad.addColorStop(1, hsl(pal[POINTS[i].cluster], 0.9 * qFade));
          ctx.strokeStyle = grad;
          ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(ex, ey); ctx.stroke();
        });
      }

      // Points, far to near
      const order = projected.map((_, i) => i).sort((a, b) => projected[a].z - projected[b].z);
      const highlighted = new Set(active && linkProgress >= 1 ? neighborIdx : []);
      for (const i of order) {
        const p = projected[i], pt = POINTS[i];
        const a = depthAlpha(p.z);
        const lit = highlighted.has(i);
        const r = (lit ? 4.2 : 2.6) * p.s;
        ctx.fillStyle = hsl(pal[pt.cluster], (lit ? 0.28 : 0.12) * a);
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = hsl(pal[pt.cluster], (lit ? 1 : 0.85) * a);
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      }

      // Query star
      if (active && qFade > 0) {
        const pulse = 1 + Math.sin(t * 5) * 0.15;
        ctx.fillStyle = hsl(pal.text, 0.15 * qFade);
        ctx.beginPath(); ctx.arc(q.x, q.y, 11 * pulse * q.s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = hsl(pal.text, 0.95 * qFade);
        ctx.save();
        ctx.translate(q.x, q.y);
        ctx.rotate(t * 0.8);
        ctx.beginPath();
        for (let k = 0; k < 8; k++) {
          const rr = (k % 2 === 0 ? 6 : 2.4) * q.s;
          const ang = (k * Math.PI) / 4;
          ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
        }
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }

      // Labels: cluster names, the query, and its nearest skills
      ctx.globalAlpha = 1;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (form > 0.6) {
        ctx.font = '600 10px Oxanium, sans-serif';
        for (const c of CLUSTERS) {
          const members = POINTS.flatMap((p, i) => (p.cluster === c.key ? [projected[i]] : []));
          const cx = members.reduce((s, m) => s + m.x, 0) / members.length;
          const top = Math.min(...members.map(m => m.y));
          ctx.fillStyle = hsl(pal[c.key], 0.5 * layerAlpha * (form - 0.6) / 0.4);
          ctx.fillText(c.label.toUpperCase(), cx, top - 16);
        }
      }
      if (active && qFade > 0 && fly > 0.6) {
        ctx.font = '600 12px Oxanium, sans-serif';
        ctx.fillStyle = hsl(pal.text, 0.85 * qFade * (fly - 0.6) / 0.4);
        ctx.fillText(`“${query.text}”`, q.x, q.y - 20 * q.s);
      }
      ctx.font = '600 11px Inter, sans-serif';
      highlighted.forEach(i => {
        const p = projected[i];
        const label = POINTS[i].name;
        const w = ctx.measureText(label).width + 10;
        ctx.fillStyle = hsl(pal.labelBg, 0.75 * qFade);
        ctx.beginPath();
        ctx.roundRect?.(p.x - w / 2, p.y - 22, w, 16, 5);
        ctx.fill();
        ctx.fillStyle = hsl(pal[POINTS[i].cluster], qFade);
        ctx.fillText(label, p.x, p.y - 14);
      });
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
    };
  }, [reduced]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="relative w-full h-full pointer-events-none"
      style={{ maskImage: MASK, WebkitMaskImage: MASK }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};

export default SkillSpace;
