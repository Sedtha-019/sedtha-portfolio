import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Download, BookOpen, Award, Compass, ChevronRight } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;

type CardItem = { label: string; sub?: string; detail?: string };

const CARDS: { icon: typeof BookOpen; title: string; color: string; bg: string; border: string; glow: string; items: CardItem[] }[] = [
  {
    icon: BookOpen,
    title: 'Education',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    glow: 'from-primary/8',
    items: [
      {
        label: 'Institute of Technology of Cambodia (ITC)',
        sub: 'Engineering Degree in Data Science · 2021–2026',
        detail: 'GPA: 3.5',
      },
      {
        label: 'ANT Technology Training Center',
        sub: 'Scholarship Student · Nov 2025 – Present',
      },
      {
        label: 'Anlong Veng High School',
        sub: '2015 – 2021',
        detail: 'Grade: A',
      },
    ],
  },
  {
    icon: Award,
    title: 'Expertise',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/20',
    glow: 'from-secondary/8',
    items: [
      { label: 'Reinforcement Learning (PPO, Stable-Baselines3, CARLA)' },
      { label: 'LLM & RAG Systems (CRAG, Hybrid Search, Reranking, pgvector)' },
      { label: 'LLMOps & Cloud (Langfuse, Kubernetes, AWS, CI/CD)' },
      { label: 'Machine Learning & Deep Learning (PyTorch, CNNs)' },
      { label: 'Data Engineering (PySpark, Docker, Airflow, AWS S3)' },
      { label: 'NLP & Transformers (Fine-tuning, Khmer Language Models)' },
      { label: 'Computer Vision (OpenCV, YOLO, Faster R-CNN, SSD)' },
    ],
  },
  {
    icon: Compass,
    title: 'Right Now',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'from-emerald-500/8',
    items: [
      {
        label: 'AI Engineer — Sala',
        sub: 'Nov 2025 – Present',
        detail: 'Building a CRAG-based, multi-school AI assistant and the Hero by Sala career platform.',
      },
      {
        label: 'Learning: RAG evaluation',
        sub: 'RAGAS · DeepEval',
        detail: 'Building a test-question set to measure retrieval and answer quality with numbers.',
      },
      {
        label: 'Interested in',
        sub: 'LLM Engineering · LLMOps · Applied RL',
      },
    ],
  },
];

const AboutCard = ({ card, index }: { card: typeof CARDS[0]; index: number }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const { icon: Icon, title, color, bg, border, glow, items } = card;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="glass-card rounded-2xl p-7 relative overflow-hidden group"
    >
      <div className={`absolute -top-8 -right-8 w-36 h-36 rounded-full bg-gradient-to-br ${glow} to-transparent blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className={`flex items-center gap-3 mb-6 relative z-10`}>
        <div className={`p-2.5 rounded-xl ${bg} ${border} border`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <h3 className="font-heading text-lg font-bold text-foreground">{title}</h3>
      </div>
      <ul className="space-y-4 relative z-10">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <ChevronRight className={`w-4 h-4 ${color} flex-shrink-0 mt-0.5`} />
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              {item.sub && <p className={`text-xs ${color} mt-0.5`}>{item.sub}</p>}
              {item.detail && <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>}
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

const About = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="min-h-screen py-24 relative">
      <div className="container mx-auto px-4 sm:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gradient inline-block mb-3">
            About Me
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
            AI Engineer at Sala with a Data Science Engineering background from ITC, Cambodia. I build{' '}
            <span className="text-foreground font-medium">end-to-end AI systems</span> — from
            training reinforcement learning agents to drive autonomously in simulation, to shipping{' '}
            <span className="text-foreground font-medium">LLM and RAG products</span> with the backend,
            observability, and cloud deployment behind them. Passionate about bridging research and real-world impact.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {CARDS.map((card, i) => <AboutCard key={card.title} card={card} index={i} />)}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="flex justify-start"
        >
          <a
            href={`${BASE}SEDTHA MAO_v2.pdf`}
            download
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold bg-primary text-primary-foreground hover:opacity-90 glow-primary hover:-translate-y-0.5 transition-all duration-200"
          >
            <Download className="w-4 h-4" /> Download Resume
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
