import React, { useEffect } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, Car, Bot, Cloud } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Neural Network SVG Animation
───────────────────────────────────────────────────────────── */
const ARCH = [4, 6, 8, 8, 8, 6, 3];
const OUTPUT_LABELS = ['LLM & RAG', 'RL Agent', 'CV & NLP'];
const W = 620;
const H = 260;
const PX = 36;
const PY = 20;

type Neuron = { x: number; y: number; li: number; ni: number; id: string };

function buildNetwork() {
  const maxCount = Math.max(...ARCH);
  const nodeSpacing = (H - PY * 2) / (maxCount - 1);

  const layers: Neuron[][] = ARCH.map((count, li) => {
    const x = PX + (W - PX * 2 - 60) * li / (ARCH.length - 1);
    const totalHeight = nodeSpacing * (count - 1);
    const startY = (H - totalHeight) / 2;
    return Array.from({ length: count }, (_, ni) => ({
      x,
      y: count === 1 ? H / 2 : startY + ni * nodeSpacing,
      li,
      ni,
      id: `nn${li}${ni}`,
    }));
  });

  const edges: { from: Neuron; to: Neuron; id: string; delay: number }[] = [];
  let idx = 0;
  for (let li = 0; li < layers.length - 1; li++) {
    for (const from of layers[li]) {
      for (const to of layers[li + 1]) {
        edges.push({ from, to, id: `e${from.id}${to.id}`, delay: (idx * 0.12) % 2.4 });
        idx++;
      }
    }
  }
  return { layers, edges };
}

const { layers, edges } = buildNetwork();

const NEURON_COLOR = [
  'hsl(185,100%,52%)',   // input  — cyan
  'hsl(200,90%,56%)',    // h1
  'hsl(220,85%,60%)',    // h2
  'hsl(240,80%,63%)',    // h3
  'hsl(255,82%,64%)',    // h4
  'hsl(265,86%,65%)',    // h5
  'hsl(265,89%,66%)',    // output — violet
];

const NeuralNetworkViz = () => (
  <motion.div
    initial={{ opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, delay: 0.4 }}
    className="relative w-full"
  >
    {/* Ambient glow behind card */}
    <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent rounded-3xl blur-2xl" />

    <div className="relative glass-card rounded-2xl overflow-hidden border border-border/50 p-6">

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500/70" />
          <span className="w-3 h-3 rounded-full bg-amber-500/70" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
        </div>
        <span className="ml-2 text-xs font-heading text-muted-foreground/50">NEURAL NETWORK</span>
      </div>

      {/* SVG Network */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: '240px' }}>
        <defs>
          <filter id="nnGlow">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="nnGlowSm">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Path defs for animateMotion */}
          {edges.map(e => (
            <path key={`p-${e.id}`} id={e.id}
              d={`M ${e.from.x} ${e.from.y} L ${e.to.x} ${e.to.y}`}
              fill="none" />
          ))}
        </defs>

        {/* Static connection lines */}
        {edges.map(e => (
          <line key={`l-${e.id}`}
            x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y}
            stroke="white" strokeOpacity="0.06" strokeWidth="0.8"
          />
        ))}

        {/* Traveling signal pulses — every 3rd edge */}
        {edges.filter((_, i) => i % 3 === 0).map(e => (
          <g key={`g-${e.id}`}>
            <circle r="2.5" fill={NEURON_COLOR[e.from.li]} opacity="0.9" filter="url(#nnGlowSm)">
              <animateMotion dur="1.6s" repeatCount="indefinite" begin={`${e.delay}s`}>
                <mpath href={`#${e.id}`} />
              </animateMotion>
            </circle>
          </g>
        ))}

        {/* Neurons */}
        {layers.map(layer => layer.map(n => {
          const isIO = n.li === 0 || n.li === ARCH.length - 1;
          const r = isIO ? 5.5 : 4;
          const dur = `${2.2 + n.ni * 0.35}s`;
          return (
            <g key={n.id}>
              {/* Pulse ring */}
              <circle cx={n.x} cy={n.y} r={r} fill={NEURON_COLOR[n.li]} opacity="0.18">
                <animate attributeName="r"       values={`${r};${r + 5};${r}`} dur={dur} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.18;0.35;0.18"       dur={dur} repeatCount="indefinite" />
              </circle>
              {/* Core */}
              <circle cx={n.x} cy={n.y} r={r} fill={NEURON_COLOR[n.li]}
                filter="url(#nnGlow)" opacity="0.95" />
            </g>
          );
        }))}

        {/* Output labels */}
        {layers[ARCH.length - 1].map((n, i) => (
          <text key={`ol-${i}`}
            x={n.x + 14} y={n.y + 4}
            fontSize="9.5" fill={NEURON_COLOR[ARCH.length - 1]}
            fontFamily="Oxanium, sans-serif" opacity="0.85">
            {OUTPUT_LABELS[i]}
          </text>
        ))}

        {/* Layer labels */}
        {['Input', 'H1', 'H2', 'H3', 'H4', 'H5', 'Output'].map((lbl, li) => (
          <text key={`ll-${li}`}
            x={layers[li][0].x} y={H - 2}
            textAnchor="middle" fontSize="8"
            fill="hsl(215,20%,45%)" fontFamily="Oxanium, sans-serif">
            {lbl}
          </text>
        ))}
      </svg>

      {/* Metrics row */}
      <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-5 flex-wrap">
        {[
          { label: 'Activation',  value: 'ReLU' },
          { label: 'Optimizer',   value: 'AdamW' },
          { label: 'Loss',        value: 'Cross-Entropy' },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-heading">{label}</span>
            <span className="text-xs font-heading font-bold text-primary">{value}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────
   Competency cards
───────────────────────────────────────────────────────────── */
const COMPETENCIES = [
  {
    icon: Bot,
    title: 'LLM & RAG Systems',
    desc: 'CRAG-style retrieval pipelines — hybrid vector + keyword search, reranking, and an LLM grader that corrects or abstains instead of guessing. Bilingual English / Khmer.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/20',
    glow: 'group-hover:shadow-[0_0_30px_hsl(var(--secondary)/0.10)]',
  },
  {
    icon: Cloud,
    title: 'LLMOps & Cloud',
    desc: 'Tracing every query with Langfuse, multi-tenant data isolation, and shipping services to Kubernetes on AWS through CI/CD.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'group-hover:shadow-[0_4px_30px_rgba(251,191,36,0.10)]',
  },
  {
    icon: Car,
    title: 'Reinforcement Learning',
    desc: 'Training end-to-end RL agents (PPO) to navigate complex environments — from autonomous driving in CARLA to curriculum-based multi-phase learning.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    glow: 'group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.12)]',
  },
  {
    icon: BrainCircuit,
    title: 'Computer Vision & NLP',
    desc: 'Designing CNNs for face recognition, object detection, and Khmer handwriting — plus fine-tuning Transformers for low-resource language tasks.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'group-hover:shadow-[0_4px_30px_rgba(52,211,153,0.10)]',
  },
];

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────── */
const Home = () => {
  useEffect(() => { document.title = 'MAO SEDTHA'; }, []);
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen flex flex-col justify-center relative overflow-hidden dot-grid">
      <div className="container mx-auto px-4 sm:px-8 pt-28 pb-20">

        {/* Two-column hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">

          {/* Left — text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-heading font-medium mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Available for opportunities
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-5"
            >
              Hello, I'm <br />
              <span className="text-gradient">MAO SEDTHA</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex items-center gap-2 text-xl sm:text-2xl font-heading font-medium text-muted-foreground mb-8 h-9"
            >
              <span className="text-primary">&gt;</span>
              <TypeAnimation
                sequence={[
                  'AI Engineer.', 2200,
                  'LLM & RAG Engineer.', 2200,
                  'Reinforcement Learning Researcher.', 2200,
                  'Computer Vision Specialist.', 2200,
                  'Data Scientist.', 2200,
                ]}
                wrapper="span" speed={55} deletionSpeed={70} repeat={Infinity} cursor={true}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-10"
            >
              AI Engineer at Sala, Data Science Engineering background from ITC, Cambodia.
              I build <span className="text-foreground font-medium">intelligent systems</span> —
              from training PPO agents to drive autonomously in simulation, to shipping{' '}
              <span className="text-foreground font-medium">LLM & RAG products</span> on the cloud.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-4"
            >
              <button
                onClick={() => scrollTo('projects')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold bg-primary text-primary-foreground hover:opacity-90 glow-primary hover:-translate-y-0.5 transition-all duration-200"
              >
                View Projects <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollTo('contact')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                Contact Me
              </button>
            </motion.div>
          </div>

          {/* Right — neural network */}
          <div className="hidden lg:block">
            <NeuralNetworkViz />
          </div>
        </div>

        {/* Competency cards — full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        >
          <h3 className="font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Core Competencies
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {COMPETENCIES.map(({ icon: Icon, title, desc, color, bg, border, glow }) => (
              <div key={title} className={`glass-card group rounded-2xl p-6 relative overflow-hidden ${glow} transition-shadow duration-300`}>
                <div className={`absolute -top-8 -right-8 w-32 h-32 ${bg} rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`w-11 h-11 rounded-xl ${bg} ${border} border flex items-center justify-center mb-4 relative z-10`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h4 className={`font-heading text-base font-bold mb-2 ${color} relative z-10`}>{title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed relative z-10">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
