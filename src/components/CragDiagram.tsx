/* ─────────────────────────────────────────────────────────────
   CRAG pipeline diagram — used in place of a screenshot for the
   private AI Assistant project. Colours come from the theme, so
   it follows light / dark mode.
───────────────────────────────────────────────────────────── */

type Box = { x: number; y: number; w: number; title: string; sub?: string; tone?: 'main' | 'grader' | 'ok' | 'stop' };

const H = 34;

const BOXES: Box[] = [
  { x: 70,  y: 10,  w: 160, title: 'Question', sub: 'English / Khmer' },
  { x: 70,  y: 68,  w: 160, title: 'Hybrid Search', sub: 'pgvector + trigram' },
  { x: 70,  y: 126, w: 160, title: 'RRF Fusion + Rerank' },
  { x: 70,  y: 184, w: 160, title: 'CRAG Grader', sub: 'LLM-as-judge', tone: 'grader' },
  { x: 70,  y: 242, w: 160, title: 'Document Fallback', sub: 'summary search' },
  { x: 262, y: 184, w: 110, title: 'Answer', sub: '+ page citations', tone: 'ok' },
  { x: 262, y: 242, w: 110, title: "I don't know", sub: 'abstain, no guessing', tone: 'stop' },
];

const BOX_CLASS: Record<NonNullable<Box['tone']>, string> = {
  main:   'fill-card stroke-border',
  grader: 'fill-primary/10 stroke-primary',
  ok:     'fill-emerald-500/10 stroke-emerald-500',
  stop:   'fill-amber-500/10 stroke-amber-500',
};

const TITLE_CLASS: Record<NonNullable<Box['tone']>, string> = {
  main:   'fill-foreground',
  grader: 'fill-primary',
  ok:     'fill-emerald-500',
  stop:   'fill-amber-500',
};

const CragDiagram = () => (
  <svg
    viewBox="0 0 380 286"
    className="w-full h-full font-heading"
    role="img"
    aria-label="CRAG pipeline: question, hybrid search, fusion and rerank, CRAG grader. If the context is sufficient it answers with citations; if not it retries with a broadened query, then tries a document-level fallback, and otherwise says it doesn't know."
  >
    <defs>
      <marker id="crag-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" className="fill-muted-foreground" />
      </marker>
    </defs>

    {/* Main flow */}
    <g className="stroke-muted-foreground/60" strokeWidth="1.2" fill="none" markerEnd="url(#crag-arrow)">
      <path d="M150 44 V66" />
      <path d="M150 102 V124" />
      <path d="M150 160 V182" />
      <path d="M230 201 H260" />
      <path d="M150 218 V240" />
      <path d="M230 259 H260" />
      {/* Fallback succeeded → answer */}
      <path d="M230 250 C 250 250, 300 244, 305 220" strokeDasharray="3 3" />
      {/* Retry loop: grader → broaden query → hybrid search */}
      <path d="M70 201 H34 V85 H68" strokeDasharray="3 3" />
    </g>

    {/* Edge labels */}
    <text x="238" y="195" fontSize="8" className="fill-emerald-500">✓ enough</text>
    <text x="156" y="233" fontSize="8" className="fill-muted-foreground">✗ after retries</text>
    <text
      x="24" y="143" fontSize="8" textAnchor="middle"
      transform="rotate(-90 24 143)"
      className="fill-primary"
    >
      ✗ retry · broaden query
    </text>

    {/* A request travelling down the happy path */}
    <circle r="3.5" className="fill-primary">
      <animateMotion dur="3.2s" repeatCount="indefinite" path="M150 44 V201 H262" />
    </circle>

    {/* Boxes */}
    {BOXES.map(b => {
      const tone = b.tone ?? 'main';
      return (
        <g key={b.title}>
          <rect x={b.x} y={b.y} width={b.w} height={H} rx="8" strokeWidth="1.2" className={BOX_CLASS[tone]} />
          <text
            x={b.x + b.w / 2} y={b.sub ? b.y + 14.5 : b.y + 21}
            textAnchor="middle" fontSize="11" fontWeight="700"
            className={TITLE_CLASS[tone]}
          >
            {b.title}
          </text>
          {b.sub && (
            <text x={b.x + b.w / 2} y={b.y + 26.5} textAnchor="middle" fontSize="8" className="fill-muted-foreground">
              {b.sub}
            </text>
          )}
        </g>
      );
    })}
  </svg>
);

export default CragDiagram;
