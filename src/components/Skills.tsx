import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BrainCircuit, Code2, Database, Server, Car, Shield, CheckCircle2, Bot, Activity, Cloud, FlaskConical } from 'lucide-react';

const SKILL_GROUPS = [
  {
    category: 'Programming Languages',
    icon: Code2,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    glow: 'from-primary/10',
    items: ['Python', 'TypeScript', 'SQL', 'C++', 'Java'],
  },
  {
    category: 'LLM & RAG Engineering',
    icon: Bot,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/20',
    glow: 'from-secondary/10',
    items: ['CRAG (Corrective RAG)', 'Hybrid Search', 'RRF Fusion', 'Cohere Rerank', 'LLM-as-Judge', 'pgvector', 'Embeddings', 'Query Routing', 'Semantic Cache', 'Prompt Engineering (EN / KH)', 'OpenRouter'],
  },
  {
    category: 'LLMOps & Evaluation',
    icon: Activity,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'from-amber-500/10',
    items: ['Langfuse Tracing', 'Retrieval Debugging', 'Score-based Tuning', 'Privacy-aware Tracing'],
  },
  {
    category: 'DevOps & Cloud',
    icon: Cloud,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    glow: 'from-sky-500/10',
    items: ['Kubernetes (AWS EKS)', 'AWS ECR', 'AWS RDS', 'AWS S3', 'CI/CD (Gitea Actions)', 'Docker', 'Docker Compose', 'Health Probes', 'Runbooks'],
  },
  {
    category: 'Backend & APIs',
    icon: Server,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    glow: 'from-violet-500/10',
    items: ['FastAPI', 'NestJS', 'Flask', 'RabbitMQ', 'Redis / Valkey', 'MinIO / S3', 'KrakenD API Gateway', 'Background Jobs', 'Vue.js'],
  },
  {
    category: 'Security',
    icon: Shield,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    glow: 'from-rose-500/10',
    items: ['PostgreSQL Row-Level Security', 'Multi-tenant Isolation', 'Keycloak / JWT (RS256)', 'Least-Privilege Access', 'Penetration Testing Basics', 'Network Fundamentals'],
  },
  {
    category: 'AI & Deep Learning',
    icon: BrainCircuit,
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/20',
    glow: 'from-fuchsia-500/10',
    items: ['PyTorch', 'TensorFlow', 'Keras', 'OpenCV', 'Scikit-learn', 'Transformers / HuggingFace', 'Gradio', 'LoRA Fine-tuning'],
  },
  {
    category: 'Reinforcement Learning',
    icon: Car,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'from-emerald-500/10',
    items: ['Stable-Baselines3', 'PPO / Actor-Critic', 'gymnasium', 'CARLA Simulator', 'Curriculum Learning', 'VecNormalize'],
  },
  {
    category: 'Data Science & Visualization',
    icon: Database,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    glow: 'from-cyan-500/10',
    items: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Plotly', 'Power BI', 'Metabase', 'Jupyter', 'Statistical Modelling'],
  },
  {
    category: 'Data Engineering & Testing',
    icon: FlaskConical,
    color: 'text-lime-400',
    bg: 'bg-lime-500/10',
    border: 'border-lime-500/20',
    glow: 'from-lime-500/10',
    items: ['PySpark', 'Dask', 'Apache Airflow', 'PostgreSQL', 'MySQL', 'MongoDB', 'pytest', 'Jest'],
  },
];

const LEARNING = [
  { name: 'RAGAS', desc: 'Faithfulness, answer relevancy, context precision & recall' },
  { name: 'DeepEval', desc: 'pytest-style LLM regression tests for CI' },
];


const SkillGroup = ({ group, index }: { group: typeof SKILL_GROUPS[0]; index: number }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const { icon: Icon, category, color, bg, border, glow, items } = group;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden group"
    >
      {/* Ambient blob */}
      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br ${glow} to-transparent blur-2xl opacity-50 group-hover:opacity-90 transition-opacity duration-500`} />

      <div className={`flex items-center gap-3 mb-5 relative z-10`}>
        <div className={`p-2 rounded-lg ${bg} ${border} border`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <h3 className="font-heading text-base font-bold text-foreground">{category}</h3>
      </div>

      <div className="flex flex-wrap gap-2 relative z-10">
        {items.map(item => (
          <motion.span
            key={item}
            whileHover={{ scale: 1.05 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 hover:${bg} hover:${color} text-sm font-medium rounded-lg border border-border/50 hover:${border} transition-all duration-200 cursor-default text-muted-foreground hover:text-foreground`}
          >
            <CheckCircle2 className="w-3 h-3 opacity-40" />
            {item}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

const Skills = () => {
  return (
    <div className="min-h-screen py-24 relative">
      <div className="container mx-auto px-4 sm:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-14">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gradient inline-block mb-3">
            Technical Skills
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            An inventory of the tools, frameworks, and technologies I work with.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SKILL_GROUPS.map((group, i) => (
            <SkillGroup key={group.category} group={group} index={i} />
          ))}
        </div>

        {/* Currently learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <h3 className="font-heading text-base font-bold text-foreground">Currently Learning — RAG Evaluation</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Measuring retrieval and answer quality with numbers instead of by feel.
          </p>
          <div className="flex flex-wrap gap-3">
            {LEARNING.map(l => (
              <div key={l.name} className="px-4 py-2.5 rounded-xl bg-background/60 border border-border/50">
                <p className="font-heading text-sm font-bold text-primary">{l.name}</p>
                <p className="text-xs text-muted-foreground">{l.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Skills;
