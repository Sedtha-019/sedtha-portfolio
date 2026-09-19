import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

/* ─────────────────────────────────────────────────────────────
   "My skills in embedding space" — a 3D point cloud drawn on a
   plain <canvas> (no 3D library). Skills settle into clusters,
   the cloud slowly rotates, and every few seconds a query flies
   in and links to its nearest skills, like a vector search.
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
  const [queryIndex, setQueryIndex] = useState(0);
  const [reduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

  const paletteRef = useRef<Palette | null>(null);
  useEffect(() => { paletteRef.current = readPalette(theme === 'dark'); }, [theme]);

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

    // Rotation state: auto-spin, plus drag with inertia.
    let yaw = 0.6, pitch = 0.32, velYaw = 0, velPitch = 0;
    let dragging = false, lastX = 0, lastY = 0;
    let hovered = -1;
    let elapsed = reduced ? FORM_SECONDS + QUERY_SECONDS * 0.6 : 0;
    let lastQuery = -1;
    let visible = true;
    let prev = performance.now();
    let raf = 0;
    let projected: { x: number; y: number; s: number; z: number }[] = [];

    const onDown = (e: PointerEvent) => {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      if (dragging) {
        const dx = e.clientX - lastX, dy = e.clientY - lastY;
        lastX = e.clientX; lastY = e.clientY;
        yaw += dx * 0.008; pitch = Math.max(-1.2, Math.min(1.2, pitch + dy * 0.008));
        velYaw = dx * 0.5; velPitch = dy * 0.5;
      }
      let best = -1, bestD = 14;
      projected.forEach((p, i) => {
        const d = Math.hypot(p.x - mx, p.y - my);
        if (d < bestD) { bestD = d; best = i; }
      });
      hovered = best;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };
    const onLeave = () => { hovered = -1; };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', onLeave);

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(wrap);

    const project = (v: Vec3) => {
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const x1 = v[0] * cy + v[2] * sy;
      const z1 = -v[0] * sy + v[2] * cy;
      const y2 = v[1] * cp - z1 * sp;
      const z2 = v[1] * sp + z1 * cp;
      const scale = CAMERA / (CAMERA - z2);
      const unit = Math.min(width, height) * 0.27;
      return { x: width / 2 + x1 * scale * unit, y: height / 2 - y2 * scale * unit, s: scale, z: z2 };
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      if (!visible || !paletteRef.current || width === 0) return;
      const pal = paletteRef.current;

      if (!reduced) {
        elapsed += dt;
        if (!dragging) {
          yaw += (AUTO_SPIN + velYaw * 0.01) * dt;
          pitch = Math.max(-1.2, Math.min(1.2, pitch + velPitch * 0.01 * dt));
          velYaw *= 0.94; velPitch *= 0.94;
        }
      }

      const form = easeOut((elapsed) / FORM_SECONDS);
      const qTime = Math.max(elapsed - FORM_SECONDS, 0);
      const qIdx = Math.floor(qTime / QUERY_SECONDS) % QUERIES.length;
      const qt = (qTime % QUERY_SECONDS) / QUERY_SECONDS;
      if (qIdx !== lastQuery) { lastQuery = qIdx; setQueryIndex(qIdx); }

      // Positions: fly from scattered start to home, then drift gently.
      const t = elapsed;
      const world: Vec3[] = POINTS.map(p => {
        const wobble = reduced ? 0 : 0.035;
        return [
          p.start[0] + (p.home[0] - p.start[0]) * form + Math.sin(t * 0.9 + p.phase) * wobble,
          p.start[1] + (p.home[1] - p.start[1]) * form + Math.cos(t * 0.7 + p.phase) * wobble,
          p.start[2] + (p.home[2] - p.start[2]) * form + Math.sin(t * 0.6 + p.phase * 2) * wobble,
        ];
      });
      projected = world.map(project);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const depthAlpha = (z: number) => 0.35 + 0.65 * clamp01((z + 1.8) / 3.6);

      // Intra-cluster links
      ctx.lineWidth = 1;
      POINTS.forEach((p, i) => {
        for (const j of p.links) {
          const a = projected[i], b = projected[j];
          ctx.strokeStyle = hsl(pal[p.cluster], 0.16 * form * depthAlpha((a.z + b.z) / 2));
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      });

      // Query: fly in → draw links → hold → fade
      const query = QUERIES[qIdx];
      const neighborIdx = query.neighbors.map(n => INDEX.get(n)!).filter(i => i !== undefined);
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
          grad.addColorStop(0, hsl(pal.text, 0.75 * qFade));
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
        const lit = highlighted.has(i) || i === hovered;
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

      // Labels: cluster names, highlighted neighbours, hovered skill
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (form > 0.6) {
        ctx.font = '600 10px Oxanium, sans-serif';
        for (const c of CLUSTERS) {
          const members = POINTS.map((p, i) => (p.cluster === c.key ? projected[i] : null)).filter(Boolean) as typeof projected;
          const cx = members.reduce((s, m) => s + m.x, 0) / members.length;
          const top = Math.min(...members.map(m => m.y));
          ctx.fillStyle = hsl(pal[c.key], 0.55 * (form - 0.6) / 0.4);
          ctx.fillText(c.label.toUpperCase(), cx, top - 14);
        }
      }
      const labelled = new Set<number>([...highlighted, ...(hovered >= 0 ? [hovered] : [])]);
      ctx.font = '600 11px Inter, sans-serif';
      labelled.forEach(i => {
        const p = projected[i];
        const label = POINTS[i].name;
        const w = ctx.measureText(label).width + 10;
        const alpha = i === hovered ? 1 : qFade;
        ctx.fillStyle = hsl(pal.labelBg, 0.8 * alpha);
        ctx.beginPath();
        ctx.roundRect?.(p.x - w / 2, p.y - 22, w, 16, 5);
        ctx.fill();
        ctx.fillStyle = hsl(pal[POINTS[i].cluster], alpha);
        ctx.fillText(label, p.x, p.y - 14);
      });
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  const query = QUERIES[queryIndex];
  const legend: { key: ClusterKey; label: string; dot: string }[] = [
    { key: 'llm', label: 'LLM & RAG', dot: 'bg-secondary' },
    { key: 'rl', label: 'RL', dot: 'bg-primary' },
    { key: 'cv', label: 'Vision & NLP', dot: 'bg-emerald-500' },
    { key: 'data', label: 'Data & Cloud', dot: 'bg-amber-500' },
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-to-br from-secondary/10 via-primary/5 to-transparent rounded-3xl blur-2xl" />
      <div className="relative glass-card rounded-2xl overflow-hidden border border-border/50">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 pt-4">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/70" />
            <span className="w-3 h-3 rounded-full bg-amber-500/70" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          <span className="ml-2 text-xs font-heading text-muted-foreground/60 tracking-wide">MY SKILLS · EMBEDDING SPACE</span>
        </div>

        {/* Query caption */}
        <div className="px-5 pt-3 min-h-[3.25rem]">
          <p className="font-heading text-sm text-foreground">
            <span className="text-primary">✦ query:</span> “{query.text}”
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            nearest → {query.neighbors.join(' · ')}
          </p>
        </div>

        {/* Canvas */}
        <div ref={wrapRef} className="relative h-[360px] cursor-grab active:cursor-grabbing touch-none">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="A rotating 3D cloud of my skills grouped into LLM & RAG, reinforcement learning, vision & NLP, and data & cloud. Queries link to their nearest skills, like a vector search."
            className="absolute inset-0"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 py-3 border-t border-border/40">
          {legend.map(l => (
            <span key={l.key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${l.dot}`} /> {l.label}
            </span>
          ))}
          <span className="ml-auto text-[11px] text-muted-foreground/60">drag to rotate</span>
        </div>
      </div>
    </div>
  );
};

export default SkillSpace;
