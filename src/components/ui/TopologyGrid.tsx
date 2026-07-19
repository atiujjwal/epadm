'use client';

import { m } from 'framer-motion';
import { useState, useEffect } from 'react';

/* ── Tenant node data ─────────────────────────────────────── */
const tenants = [
  { id: 'T1', label: 'Tenant A', x: 20,  y: 18,  status: 'active',   role: 'Enterprise' },
  { id: 'T2', label: 'Tenant B', x: 75,  y: 12,  status: 'active',   role: 'Business'   },
  { id: 'T3', label: 'Tenant C', x: 58,  y: 58,  status: 'active',   role: 'Enterprise' },
  { id: 'T4', label: 'Tenant D', x: 18,  y: 65,  status: 'inactive', role: 'Starter'    },
  { id: 'T5', label: 'Tenant E', x: 88,  y: 68,  status: 'active',   role: 'Business'   },
] as const;

const controlPlane = { x: 50, y: 40 };

const edges = tenants.map((t) => ({ from: t, to: controlPlane }));

const statusColors: Record<string, string> = {
  active:   '#4f6ef7',
  inactive: '#475569',
};

const roleColors: Record<string, string> = {
  Enterprise: '#4f6ef7',
  Business:   '#6b87fa',
  Starter:    '#8fa4fc',
};

/* ── Animated connection line ─────────────────────────────── */
function ConnectionLine({ from, to, index }: {
  from: { x: number; y: number };
  to:   { x: number; y: number };
  index: number;
}) {
  const x1 = `${from.x}%`;
  const y1 = `${from.y}%`;
  const x2 = `${to.x}%`;
  const y2 = `${to.y}%`;

  return (
    <m.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="rgba(79, 110, 247, 0.25)"
      strokeWidth="1"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
    />
  );
}

/* ── Animated data packet ─────────────────────────────────── */
function DataPacket({ from, to, delay }: {
  from: { x: number; y: number };
  to:   { x: number; y: number };
  delay: number;
}) {
  return (
    <m.circle
      r="3"
      fill="var(--accent-primary)"
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        cx: [`${from.x}%`, `${to.x}%`],
        cy: [`${from.y}%`, `${to.y}%`],
      }}
      transition={{
        duration: 1.8,
        delay,
        repeat: Infinity,
        repeatDelay: 3,
        ease: 'easeInOut',
      }}
    />
  );
}

/* ── Topology Grid ────────────────────────────────────────── */
export function TopologyGrid() {
  const [mounted, setMounted] = useState(false);
  // Client-only render guard: framer-motion initial states differ from SSR
  // output, so defer rendering until after hydration to avoid mismatches.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-slate-950/95 p-4 text-slate-100 shadow-2xl ring-1 ring-white/10" aria-hidden="true" role="img" aria-label="EPADM tenant topology visualization">
      <svg
        viewBox="0 0 100 80"
        preserveAspectRatio="xMidYMid meet"
        className="h-[22rem] w-full"
      >
        {/* Connection lines */}
        {edges.map((edge, i) => (
          <ConnectionLine key={edge.from.id} from={edge.from} to={edge.to} index={i} />
        ))}

        {/* Data packets */}
        {tenants.map((t, i) => (
          <DataPacket
            key={`packet-${t.id}`}
            from={t}
            to={controlPlane}
            delay={1.5 + i * 0.7}
          />
        ))}

        {/* Tenant nodes */}
        {tenants.map((t, i) => (
          <m.g
            key={t.id}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.1, ease: 'backOut' }}
          >
            {/* Outer ring */}
            <circle
              cx={`${t.x}%`}
              cy={`${t.y}%`}
              r="7"
              fill="none"
              stroke={statusColors[t.status]}
              strokeWidth="0.5"
              opacity="0.4"
            />
            {/* Inner fill */}
            <circle
              cx={`${t.x}%`}
              cy={`${t.y}%`}
              r="4.5"
              fill={roleColors[t.role]}
              opacity="0.9"
            />
            {/* Label */}
            <text
              x={`${t.x}%`}
              y={`${t.y + 12}%`}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="4"
              fontFamily="'Inter', sans-serif"
            >
              {t.label}
            </text>
          </m.g>
        ))}

        {/* Control Plane (center hub) */}
        <m.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'backOut' }}
        >
          {/* Pulsing ring */}
          <m.circle
            cx={`${controlPlane.x}%`}
            cy={`${controlPlane.y}%`}
            r="13"
            fill="none"
            stroke="rgba(79, 110, 247, 0.2)"
            strokeWidth="0.5"
            animate={{ r: [13, 16, 13], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <circle
            cx={`${controlPlane.x}%`}
            cy={`${controlPlane.y}%`}
            r="10"
            fill="rgba(79, 110, 247, 0.12)"
            stroke="rgba(79, 110, 247, 0.5)"
            strokeWidth="0.75"
          />
          {/* Hub icon — grid of 4 dots */}
          {[[-3, -3], [3, -3], [-3, 3], [3, 3]].map(([dx, dy], k) => (
            <circle
              key={k}
              cx={`${controlPlane.x + dx * 0.8}%`}
              cy={`${controlPlane.y + dy * 0.8}%`}
              r="1.5"
              fill="var(--accent-primary)"
              opacity="0.9"
            />
          ))}
          {/* Label */}
          <text
            x={`${controlPlane.x}%`}
            y={`${controlPlane.y + 18}%`}
            textAnchor="middle"
            fill="rgba(79, 110, 247, 0.9)"
            fontSize="4.5"
            fontWeight="600"
            fontFamily="'Inter', sans-serif"
          >
            Control Plane
          </text>
        </m.g>
      </svg>

      {/* Legend */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-slate-100">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-indigo-400" aria-hidden="true" />
          Active tenant
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-slate-100">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-500" aria-hidden="true" />
          Suspended
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-slate-100">
          <span className="inline-flex h-2.5 w-2.5 rounded-full border border-indigo-400 bg-indigo-400/30" aria-hidden="true" />
          Control plane
        </div>
      </div>
    </div>
  );
}
