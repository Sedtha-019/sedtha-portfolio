import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import SkillSpace from './SkillSpace';
import { Briefcase, Calendar, ArrowDownRight } from 'lucide-react';

type Job = {
  id: string;
  role: string;
  org: string;
  period: string;
  current?: boolean;
  summary?: string;
  /** Project names; the details live in the Projects section. */
  projects?: string[];
  tags?: string[];
};

const JOBS: Job[] = [
  {
    id: 'sala',
    role: 'AI Engineer',
    org: 'Sala',
    period: 'Nov 2025 – Present',
    current: true,
    summary: 'Building LLM products end to end — RAG pipelines, backend services, and cloud deployment.',
    projects: ['Multi-School AI Assistant (CRAG)', 'Hero by Sala — AI Career Platform'],
    tags: ['CRAG', 'pgvector', 'NestJS', 'FastAPI', 'RabbitMQ', 'Langfuse', 'Kubernetes', 'AWS', 'Vue.js'],
  },
  {
    id: 'moeys',
    role: 'AI, ML & Robotics Intern',
    org: 'Ministry of Education, Youth and Sport',
    period: 'Jul – Dec 2025',
    summary: 'Thesis: a scalable ETL pipeline for cloud data.',
    tags: ['PySpark', 'AWS S3', 'Docker', 'Airflow'],
  },
  {
    id: 'searle',
    role: 'Data Analyst Intern',
    org: 'SEARLE Company',
    period: 'Sep – Oct 2024',
  },
  {
    id: 'idp',
    role: 'Volunteer Interpreter',
    org: 'IDP Education',
    period: 'Mar 2024',
    summary: 'Assisted international students during university orientation.',
  },
];

const JobCard = ({ job, index }: { job: Job; index: number }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative pl-8 pb-10 last:pb-0"
    >
      {/* Timeline line + dot */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border/60">
        <div className={`absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-background ${
          job.current ? 'bg-primary ring-4 ring-primary/25' : 'bg-muted-foreground/50 ring-2 ring-border'
        }`} />
      </div>

      <div className="glass-card rounded-2xl p-6 group hover:shadow-[0_4px_30px_hsl(var(--primary)/0.07)] transition-shadow duration-300">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {job.role}
              </h3>
              <p className="text-primary text-sm font-medium">{job.org}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {job.current && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-heading font-semibold bg-primary/10 text-primary border border-primary/20">
                Current
              </span>
            )}
            <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Calendar className="w-3.5 h-3.5" /> {job.period}
            </span>
          </div>
        </div>

        {job.summary && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">{job.summary}</p>
        )}

        {job.projects && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {job.projects.map(name => (
              <button
                key={name}
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-heading font-semibold bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-colors"
              >
                {name} <ArrowDownRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        {job.tags && (
          <div className="flex flex-wrap gap-1.5 mt-5">
            {job.tags.map(t => (
              <span key={t} className="px-2.5 py-1 bg-muted/60 text-muted-foreground text-xs font-medium rounded-lg border border-border/50">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const WorkExperience = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-24 relative">
      {/* Background layer: skill cloud behind the timeline, stays in view while scrolling */}
      <div aria-hidden="true" className="hidden lg:block absolute inset-y-0 right-0 w-[58%] pointer-events-none z-0">
        <div className="sticky top-0 h-screen">
          <SkillSpace />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gradient inline-block mb-3">
            Work Experience
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Where I've applied AI and engineering to real products.
          </p>
        </motion.div>

        <div className="max-w-3xl">
          {JOBS.map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
        </div>
      </div>
    </div>
  );
};

export default WorkExperience;
