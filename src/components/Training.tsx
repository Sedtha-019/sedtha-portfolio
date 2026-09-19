import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Award, Calendar } from 'lucide-react';

const certifications = [
  {
    id: '1',
    org: 'UNESCO UNITWIN in Cambodia',
    role: 'Data Science Camp — Standard Level',
    date: 'March 2023',
    desc: 'Completed the Standard level of the 2024 UNESCO UNITWIN Data Science Camp. Gained practical experience in cutting-edge data science techniques and methodologies.',
  },
  {
    id: '2',
    org: 'ASEAN Data Science Explorers',
    role: 'SAP Analytics Cloud & SAP Build Apps Training',
    date: 'April 2024',
    desc: 'Participated in the 2024 Enablement Session on SAP Analytics Cloud (SAC) and SAP Build Apps. Hands-on experience with data visualisation and no-code application development.',
  },
];

const CertCard = ({ cert, index }: { cert: typeof certifications[0]; index: number }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative pl-8 pb-10 last:pb-0"
    >
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border/60">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background ring-2 ring-primary/30" />
      </div>

      <div className="glass-card rounded-2xl p-6 group hover:shadow-[0_4px_30px_hsl(var(--primary)/0.07)] transition-shadow duration-300">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
            <Award className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors">
              {cert.role}
            </h3>
            <p className="text-primary text-sm font-medium">{cert.org}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-3 pl-1">
          <Calendar className="w-3.5 h-3.5" />
          {cert.date}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{cert.desc}</p>
      </div>
    </motion.div>
  );
};

const Training = () => {
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
            Training & Achievements
          </h2>
          <p className="text-muted-foreground text-lg">Programs and recognitions outside of formal employment.</p>
        </motion.div>

        <div className="max-w-2xl">
          {certifications.map((c, i) => <CertCard key={c.id} cert={c} index={i} />)}
        </div>
      </div>
    </div>
  );
};

export default Training;
