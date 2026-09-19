import React, { useRef } from 'react';
import { motion } from 'framer-motion';

const DI = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/';
const SI = 'https://cdn.simpleicons.org/';

type Logo = {
  name: string;
  src: string;
  invertDark?: boolean;
};

const ROW1: Logo[] = [
  { name: 'Python',       src: `${DI}python/python-original.svg` },
  { name: 'PyTorch',      src: `${DI}pytorch/pytorch-original.svg` },
  { name: 'TensorFlow',   src: `${DI}tensorflow/tensorflow-original.svg` },
  { name: 'OpenCV',       src: `${DI}opencv/opencv-original.svg` },
  { name: 'Scikit-learn', src: `${SI}scikitlearn` },
  { name: 'Keras',        src: `${DI}keras/keras-original.svg` },
  { name: 'Pandas',       src: `${DI}pandas/pandas-original.svg` },
  { name: 'NumPy',        src: `${DI}numpy/numpy-original.svg` },
  { name: 'Docker',       src: `${DI}docker/docker-original.svg` },
  { name: 'PostgreSQL',   src: `${DI}postgresql/postgresql-original.svg` },
  { name: 'FastAPI',      src: `${DI}fastapi/fastapi-original.svg` },
  { name: 'AWS',          src: `${SI}amazonwebservices` },
  { name: 'Kubernetes',   src: `${DI}kubernetes/kubernetes-original.svg` },
  { name: 'TypeScript',   src: `${DI}typescript/typescript-original.svg` },
  { name: 'NestJS',       src: `${DI}nestjs/nestjs-original.svg` },
  { name: 'RabbitMQ',     src: `${DI}rabbitmq/rabbitmq-original.svg` },
];

const ROW2: Logo[] = [
  { name: 'MySQL',        src: `${DI}mysql/mysql-original.svg` },
  { name: 'MongoDB',      src: `${DI}mongodb/mongodb-original.svg` },
  { name: 'Java',         src: `${DI}java/java-original.svg` },
  { name: 'C++',          src: `${DI}cplusplus/cplusplus-original.svg` },
  { name: 'Flask',        src: `${DI}flask/flask-original.svg`, invertDark: true },
  { name: 'Jupyter',      src: `${DI}jupyter/jupyter-original.svg` },
  { name: 'GitHub',       src: `${DI}github/github-original.svg`, invertDark: true },
  { name: 'Apache Spark', src: `${SI}apachespark` },
  { name: 'Airflow',      src: `${SI}apacheairflow` },
  { name: 'Hugging Face', src: `${SI}huggingface` },
  { name: 'Power BI',     src: `${SI}powerbi` },
  { name: 'Gradio',       src: `${SI}gradio` },
  { name: 'Vue.js',       src: `${DI}vuejs/vuejs-original.svg` },
  { name: 'Redis',        src: `${DI}redis/redis-original.svg` },
  { name: 'Keycloak',     src: `${SI}keycloak` },
  { name: 'Gitea',        src: `${SI}gitea` },
];

/* ------------------------------------------------------------------ */
/* Card                                                                  */
/* ------------------------------------------------------------------ */
const LogoCard = ({ logo }: { logo: Logo }) => (
  <div
    className={[
      'group flex flex-col items-center justify-center gap-3',
      'mx-3 px-6 py-5 flex-shrink-0 min-w-[110px]',
      'rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm',
      'cursor-default select-none',
      // smooth transition for all animatable props
      'transition-all duration-300 ease-out',
      // hover: lift + border glow
      'hover:-translate-y-2 hover:border-primary/50',
      // hover: card shadow glow (light + dark friendly)
      'hover:shadow-[0_12px_40px_rgba(0,0,0,0.25),0_0_24px_hsl(var(--primary)/0.25)]',
    ].join(' ')}
  >
    {/* Logo image */}
    <div className="w-12 h-12 flex items-center justify-center">
      <img
        src={logo.src}
        alt={logo.name}
        width={40}
        height={40}
        className={[
          'w-10 h-10 object-contain',
          'transition-all duration-300',
          'group-hover:scale-115',
          'group-hover:drop-shadow-[0_0_12px_hsl(var(--primary)/0.7)]',
          logo.invertDark ? 'dark:invert dark:brightness-90' : '',
        ].join(' ')}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>

    {/* Name label */}
    <span className="text-[11px] font-heading font-semibold text-muted-foreground/60 group-hover:text-primary transition-colors duration-300 whitespace-nowrap">
      {logo.name}
    </span>
  </div>
);

/* ------------------------------------------------------------------ */
/* One infinite-scroll row                                              */
/* ------------------------------------------------------------------ */
const MarqueeRow = ({
  logos,
  direction,
  duration = 38,
}: {
  logos: Logo[];
  direction: 'left' | 'right';
  duration?: number;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const pause  = () => { if (trackRef.current) trackRef.current.style.animationPlayState = 'paused'; };
  const resume = () => { if (trackRef.current) trackRef.current.style.animationPlayState = 'running'; };

  // Duplicate the set so the -50% translate creates a perfect seamless loop
  const doubled = [...logos, ...logos];

  return (
    <div className="relative overflow-hidden w-full">
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-28 z-10 bg-gradient-to-r from-background to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-28 z-10 bg-gradient-to-l from-background to-transparent" />

      {/* Scrolling track */}
      <div
        ref={trackRef}
        className="flex py-2"
        style={{
          width: 'max-content',
          animation: `${direction === 'left' ? 'marquee-left' : 'marquee-right'} ${duration}s linear infinite`,
        }}
        onMouseEnter={pause}
        onMouseLeave={resume}
      >
        {doubled.map((logo, i) => (
          <LogoCard key={`${logo.name}-${i}`} logo={logo} />
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Section                                                              */
/* ------------------------------------------------------------------ */
const TechStack = () => (
  <section className="py-16 relative overflow-hidden border-y border-border/40">
    {/* Section heading */}
    <div className="container mx-auto px-4 sm:px-8 mb-10">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-gradient inline-block mb-2">
          Tech Stack
        </h2>
      </motion.div>
    </div>

    {/* Two marquee rows */}
    <div className="flex flex-col gap-5">
      <MarqueeRow logos={ROW1} direction="left"  duration={38} />
      <MarqueeRow logos={ROW2} direction="right" duration={32} />
    </div>
  </section>
);

export default TechStack;
