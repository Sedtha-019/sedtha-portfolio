import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ExternalLink, Lock, Star, ChevronRight, Flame, Car, Scan, Server, FileText, Bot } from 'lucide-react';
import type { Project } from '../types';
import CragDiagram from './CragDiagram';

const projects: Project[] = [
  {
    id: '9',
    title: 'Multi-School AI Assistant — CRAG',
    description: 'Bilingual (English / Khmer) assistant that answers staff questions from their own school’s documents, citing the source pages.',
    points: [
      'CRAG-style (Corrective RAG) pipeline: hybrid vector + keyword search, RRF fusion, and reranking.',
      'An LLM grader checks the retrieved context — if it isn’t enough, it retries with a broadened query, falls back to document-level search, or says “I don’t know” instead of guessing.',
      'Each school’s data isolated at the database level with PostgreSQL Row-Level Security.',
      'Every query traced with Langfuse, plus a retrieval debugging CLI.',
      'Deployed to Kubernetes (AWS) through CI/CD with health-checked rollouts; 250+ automated tests.',
    ],
    image: '',
    diagram: 'crag',
    category: 'LLM & RAG',
    technologies: ['CRAG', 'Hybrid Search', 'Cohere Rerank', 'pgvector', 'FastAPI', 'NestJS', 'RabbitMQ', 'Langfuse', 'Kubernetes', 'Vue.js'],
    highlights: ['EN / KH', 'Multi-tenant (RLS)', 'Page citations', '250+ tests'],
    featured: true,
    isPrivate: true,
  },
  {
    id: '2',
    title: 'Hero by Sala — AI Career Platform',
    description: 'AI-powered career guidance platform for Cambodian students. Five-stage journey: MBTI/Ikigai assessment → vector-based career matching → AI-generated trial tasks → RAG-powered personalised skill roadmap → automated CV generation. Built and shipped as part of an engineering team.',
    image: 'AI.gif',
    category: 'LLM & RAG',
    technologies: ['FastAPI', 'Flutter', 'pgvector', 'RAG', 'Python', 'PostgreSQL', 'OpenRouter'],
    featured: true,
    isPrivate: true,
  },
  {
    id: '1',
    title: 'Autonomous Driving with Deep RL',
    description: 'End-to-end PPO agent trained to drive in the CARLA simulator using only a forward-facing camera and a 6-dim kinematic state vector. Custom 4-phase curriculum: lane-keeping → traffic avoidance → town generalisation — all trained on a laptop RTX 4060 (8 GB VRAM).',
    image: 'https://raw.githubusercontent.com/Sedtha-019/Developing-an-Intelligent-Autonomous-Driving-System-Using-Deep-Reinforcement-Learning-in-the-CARLA-S/main/logs/videos/town03-1.gif',
    category: 'Reinforcement Learning',
    technologies: ['Python', 'PyTorch', 'Stable-Baselines3', 'PPO', 'CARLA', 'gymnasium', 'CNN'],
    githubUrl: 'https://github.com/Sedtha-019',
    featured: true,
  },
  {
    id: '3',
    title: 'Fire Detection System',
    description: 'Real-time fire detection using computer vision and deep learning in surveillance footage.',
    image: 'CameraFire.png',
    category: 'Computer Vision',
    technologies: ['Python', 'PyTorch', 'OpenCV', 'YOLO', 'SSD', 'Faster R-CNN'],
    githubUrl: 'https://github.com/Sedtha-019',
    liveUrl: 'fns.png',
  },
  {
    id: '4',
    title: 'Vehicle Counting',
    description: 'Real-time vehicle detection and counting system using deep learning object detection models.',
    image: 'counting.png',
    category: 'Computer Vision',
    technologies: ['Python', 'OpenCV', 'YOLO'],
    githubUrl: 'https://github.com/Sedtha-019',
    liveUrl: 'counting.png',
  },
  {
    id: '5',
    title: 'Face Recognition System',
    description: 'High-accuracy multi-face detection and recognition in real-time video streams.',
    image: 'Face1.png',
    category: 'AI',
    technologies: ['Python', 'FaceNet', 'Faster R-CNN', 'OpenCV'],
    githubUrl: 'https://github.com/Sedtha-019/face-detection-recognition-pytorch.git',
  },
  {
    id: '6',
    title: 'Scalable ETL Pipeline',
    description: 'End-to-end ETL pipeline for large-scale cloud data processing with modern orchestration tools.',
    image: 'slide.png',
    category: 'Data Engineering',
    technologies: ['PySpark', 'Docker', 'Airflow', 'AWS S3', 'PostgreSQL'],
    githubUrl: 'https://github.com/Sedtha-019',
    liveUrl: 'etl.png',
  },
  {
    id: '7',
    title: 'Khmer Text Summarizer',
    description: 'Fine-tuned Transformer models for Khmer-language text summarisation. Team project.',
    image: 'khmerAI.png',
    category: 'NLP',
    technologies: ['PyTorch', 'Transformers', 'Hugging Face', 'Gradio', 'mBart50', 'LoRA'],
    githubUrl: 'https://github.com/Sedtha-019/Khmer-Text-Summarization-.git',
    liveUrl: 'khmerAI.png',
  },
  {
    id: '8',
    title: 'Khmer Handwritten Recognition',
    description: 'Custom CNN in PyTorch classifying handwritten Khmer characters with high accuracy.',
    image: 'khmer_alphabet_grey2.webp',
    category: 'AI',
    technologies: ['PyTorch', 'CNN', 'OpenCV', 'Data Augmentation'],
    githubUrl: 'https://github.com/Sedtha-019/Khmer-Handwritten-Character-Recognition-Using-PyTorch.git',
  },
];

const getIcon = (title: string) => {
  if (title.includes('Fire')) return Flame;
  if (title.includes('Vehicle')) return Car;
  if (title.includes('Hero') || title.includes('Career') || title.includes('Assistant')) return Bot;
  if (title.includes('Driving') || title.includes('RL')) return Car;
  if (title.includes('ETL')) return Server;
  if (title.includes('Summarizer') || title.includes('Text')) return FileText;
  return Scan;
};

/* ── Featured card: horizontal layout ── */
const FeaturedCard = ({ project, index }: { project: Project; index: number }) => {
  const Icon = getIcon(project.title);
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="glass-card rounded-2xl overflow-hidden group flex flex-col md:flex-row hover:shadow-[0_8px_40px_hsl(var(--primary)/0.08)] transition-shadow duration-400"
    >
      {/* Image panel */}
      <div className={`relative w-full md:w-2/5 ${project.diagram ? 'h-80' : 'h-56'} md:h-auto bg-muted/30 overflow-hidden flex-shrink-0 flex items-center justify-center border-b md:border-b-0 md:border-r border-border/50`}>
        {project.diagram === 'crag' ? (
          <div className="w-full h-full px-4 pt-12 pb-10 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CragDiagram />
          </div>
        ) : imgError ? (
          <div className="w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
            <Icon className="w-20 h-20 text-muted-foreground/20 group-hover:text-primary/30 transition-colors duration-500" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-background/30 z-10 group-hover:bg-transparent transition-colors duration-500" />
            <img
              src={project.image}
              alt={project.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
          </>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex gap-2">
          <span className="flex items-center gap-1 px-2.5 py-1 bg-background/80 backdrop-blur-md text-xs font-heading font-semibold rounded-lg text-primary border border-primary/20">
            <Star className="w-3 h-3" /> Featured
          </span>
          {project.isPrivate && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-background/80 backdrop-blur-md text-xs font-heading rounded-lg text-muted-foreground border border-border/50">
              <Lock className="w-3 h-3" /> Private
            </span>
          )}
        </div>
        {/* Category bottom */}
        <div className="absolute bottom-3 left-3 z-20">
          <span className="px-2 py-1 bg-background/70 backdrop-blur-sm text-xs text-muted-foreground rounded-md border border-border/40">
            {project.category}
          </span>
        </div>
      </div>

      {/* Content panel */}
      <div className="flex flex-col justify-between p-6 md:p-8 w-full">
        <div>
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-heading text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              {project.title}
            </h2>
          </div>
          <p className={`text-sm text-muted-foreground leading-relaxed mb-2 ${expanded || project.points ? '' : 'line-clamp-3'}`}>
            {project.description}
          </p>
          {project.points && (
            <ul className="space-y-1.5 mb-2">
              {(expanded ? project.points : project.points.slice(0, 3)).map(p => (
                <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                  <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-1" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
          {(!project.points || project.points.length > 3) && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs text-primary hover:text-primary/80 font-medium mb-5 transition-colors"
            >
              {expanded ? 'Show less ↑' : 'Read more ↓'}
            </button>
          )}
          {project.highlights && (
            <div className="flex flex-wrap gap-2 mb-5">
              {project.highlights.map(h => (
                <span key={h} className="px-2.5 py-1 rounded-lg text-xs font-heading font-semibold bg-secondary/10 text-secondary border border-secondary/20">
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {project.technologies.map(tech => (
              <span key={tech} className="px-2.5 py-1 bg-muted/60 hover:bg-primary/10 hover:text-primary text-xs font-medium rounded-lg border border-border/50 hover:border-primary/30 transition-all cursor-default text-muted-foreground">
                {tech}
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            {!project.isPrivate && project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground text-sm font-heading font-medium transition-all">
                <Github className="w-4 h-4" /> Source Code
              </a>
            )}
            {project.isPrivate && (
              <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/40 text-muted-foreground border border-border/40 text-sm font-heading">
                <Lock className="w-4 h-4" /> Company Project
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Regular grid card ── */
const GridCard = ({ project, index }: { project: Project; index: number }) => {
  const Icon = getIcon(project.title);
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const altImages = project.title === 'Face Recognition System' ? ['Face1.png', 'Face2.png']
    : project.title === 'Scalable ETL Pipeline' ? ['slide.png', 'etl.png'] : [project.image];
  const [currentImg, setCurrentImg] = useState(project.image);

  useEffect(() => {
    if (altImages.length > 1) {
      const t = setInterval(() => setCurrentImg(p => p === altImages[0] ? altImages[1] : altImages[0]), 3000);
      return () => clearInterval(t);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="glass-card rounded-2xl overflow-hidden group flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-muted/30 flex-shrink-0 flex items-center justify-center">
        {imgError ? (
          <div className="w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
            <Icon className="w-12 h-12 text-muted-foreground/20" />
          </div>
        ) : (
          <img key={currentImg} src={currentImg} alt={project.title} onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        )}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute bottom-2 left-3 text-xs text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
          {project.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start gap-2.5 mb-3">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0 mt-0.5">
            <Icon className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="font-heading text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
            {project.title}
          </h3>
        </div>

        <p className={`text-xs text-muted-foreground leading-relaxed mb-1 ${expanded ? '' : 'line-clamp-3'}`}>
          {project.description}
        </p>
        <button onClick={() => setExpanded(e => !e)} className="text-xs text-primary hover:text-primary/80 font-medium mb-4 transition-colors self-start">
          {expanded ? 'Show less ↑' : 'Read more ↓'}
        </button>

        <div className="flex flex-wrap gap-1 mb-4">
          {project.technologies.slice(0, 4).map(t => (
            <span key={t} className="px-2 py-0.5 bg-muted/60 text-muted-foreground text-xs rounded-md border border-border/40 hover:border-primary/30 hover:text-primary transition-all cursor-default">
              {t}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="px-2 py-0.5 text-muted-foreground/60 text-xs">+{project.technologies.length - 4}</span>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border/40 mt-auto">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-heading">
              <Github className="w-3.5 h-3.5" /> Code
            </a>
          )}
          {project.liveUrl && project.liveUrl !== '#' && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-heading">
              <ExternalLink className="w-3.5 h-3.5" /> Demo
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const CATEGORIES = ['All', 'LLM & RAG', 'Reinforcement Learning', 'Computer Vision', 'AI', 'Data Engineering', 'NLP'];

const Projects = () => {
  const [filter, setFilter] = useState('All');
  const featured = projects.filter(p => p.featured);
  const rest = projects.filter(p => !p.featured);

  const filteredFeatured = filter === 'All' ? featured : featured.filter(p => p.category === filter);
  const filteredRest = filter === 'All' ? rest : rest.filter(p => p.category === filter);

  return (
    <div className="min-h-screen py-24 relative">
      <div className="container mx-auto px-4 sm:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-14">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gradient inline-block mb-3">
            Projects
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            A showcase of LLM products, AI systems, and research experiments.
          </p>
        </motion.div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <motion.button key={cat} whileTap={{ scale: 0.95 }} onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-heading font-medium transition-all duration-200 ${
                filter === cat
                  ? 'bg-primary text-primary-foreground glow-primary'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/30'
              }`}>
              {cat}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {/* Featured — horizontal */}
            {filteredFeatured.length > 0 && (
              <div className="flex flex-col gap-6 mb-10">
                {filteredFeatured.map((p, i) => <FeaturedCard key={p.id} project={p} index={i} />)}
              </div>
            )}

            {/* Rest — grid */}
            {filteredRest.length > 0 && (
              <>
                {filteredFeatured.length > 0 && (
                  <h3 className="font-heading text-sm uppercase tracking-widest text-muted-foreground mb-6">
                    Other Projects
                  </h3>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredRest.map((p, i) => <GridCard key={p.id} project={p} index={i} />)}
                </div>
              </>
            )}

            {filteredFeatured.length === 0 && filteredRest.length === 0 && (
              <p className="text-muted-foreground text-center py-20">No projects in this category.</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Projects;
