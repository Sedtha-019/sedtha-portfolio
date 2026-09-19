import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import SkillSpace from './SkillSpace';
import { Briefcase, Calendar, ChevronRight, ChevronDown, Sparkles } from 'lucide-react';

type Highlight = { title: string; points: string[] };

type Job = {
  id: string;
  role: string;
  org: string;
  period: string;
  current?: boolean;
  summary?: string;
  highlights?: Highlight[];
  tags?: string[];
};

const JOBS: Job[] = [
  {
    id: 'sala',
    role: 'AI Engineer',
    org: 'Sala',
    period: 'Nov 2025 – Present',
    current: true,
    summary: 'Building LLM-powered products end to end — retrieval pipelines, backend services, observability, and cloud deployment.',
    highlights: [
      {
        title: 'Multi-School AI Assistant',
        points: [
          'Designed a CRAG-style (Corrective RAG) pipeline: hybrid vector + keyword search, RRF fusion, reranking, and an LLM grader that retries with a broadened query, falls back to document-level search, or abstains instead of guessing.',
          'Bilingual English / Khmer answers with page-level citations.',
          'Isolated every school’s data at the database level with PostgreSQL Row-Level Security.',
          'Traced every query with Langfuse and built a retrieval debugging CLI.',
          'Deployed to Kubernetes (AWS) through a CI/CD pipeline with health-checked rollouts; 250+ automated tests.',
        ],
      },
      {
        title: 'Hero by Sala — AI Career Platform',
        points: [
          'RAG-powered personalised skill roadmaps, pgvector career matching, and AI-generated trial tasks for Cambodian students.',
        ],
      },
    ],
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
  const [expanded, setExpanded] = useState(false);
  const pointCount = job.highlights?.reduce((n, h) => n + h.points.length, 0) ?? 0;

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

        {job.highlights && (
          <>
            {/* Collapsed: project names only */}
            {!expanded && (
              <div className="flex flex-wrap gap-2 mt-4">
                {job.highlights.map(h => (
                  <span key={h.title} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-heading font-semibold bg-secondary/10 text-secondary border border-secondary/20">
                    <Sparkles className="w-3 h-3" /> {h.title}
                  </span>
                ))}
              </div>
            )}

            {/* Expanded: full description */}
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key="details"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  {job.highlights.map(h => (
                    <div key={h.title} className="mt-5">
                      <h4 className="flex items-center gap-2 font-heading text-sm font-bold text-foreground mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-secondary" /> {h.title}
                      </h4>
                      <ul className="space-y-1.5">
                        {h.points.map(p => (
                          <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                            <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-1" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setExpanded(e => !e)}
              aria-expanded={expanded}
              className="flex items-center gap-1 mt-4 text-xs font-heading font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {expanded ? 'Show less' : `Show details (${pointCount})`}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </>
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
      <div className="container mx-auto px-4 sm:px-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-10 xl:gap-14">
          <div className="max-w-3xl">
            {JOBS.map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
          </div>

          {/* Passion panel — stays in view while the timeline scrolls */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <SkillSpace />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default WorkExperience;
