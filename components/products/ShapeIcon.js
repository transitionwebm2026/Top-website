// Line-art product icons, used until a real photo is supplied for a shape/item.
// "Piped" strokes are drawn twice (outer gold, inner tile colour) to read as hollow pipe.

const TILE = '#0c2218';
const RED = '#e0513f';

function Piped({ d }) {
  return (
    <>
      <path d={d} stroke="currentColor" strokeWidth="13" fill="none" strokeLinejoin="round" />
      <path d={d} stroke={TILE} strokeWidth="8.5" fill="none" strokeLinejoin="round" />
    </>
  );
}

const hex = (cx, cy, r) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');

function Sprinkler() {
  return (
    <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="25" y="4" width="14" height="10" rx="1.5" />
      <path d="M26 7.5h12M26 10.5h12" strokeWidth="1.2" />
      <path d="M22 14h20l-2 5H24z" fill="currentColor" fillOpacity="0.2" />
      <path d="M24 19 L20 44 L32 50 L44 44 L40 19" />
      <ellipse cx="32" cy="32" rx="3" ry="8" fill={RED} stroke={RED} />
      <path d="M12 54 H52" strokeWidth="3" />
      <path d="M16 54 l-3 5 M24 54 l-2 5 M32 54 v5 M40 54 l2 5 M48 54 l3 5" strokeWidth="1.6" />
      <path d="M32 50 V54" />
    </g>
  );
}

const icons = {
  pipe: () => (
    <>
      <Piped d="M6 32 H54" />
      <ellipse cx="54" cy="32" rx="3.5" ry="6.5" stroke="currentColor" strokeWidth="2.5" fill={TILE} />
    </>
  ),
  elbow90: () => <Piped d="M20 60 V38 Q20 20 38 20 H60" />,
  elbow45: () => <Piped d="M22 60 V40 L46 16" />,
  tee: () => (
    <>
      <Piped d="M4 24 H60" />
      <Piped d="M32 24 V60" />
    </>
  ),
  cross: () => (
    <>
      <Piped d="M4 32 H60" />
      <Piped d="M32 4 V60" />
    </>
  ),
  reducer: () => (
    <path d="M6 18 H24 L40 25 H58 V39 H40 L24 46 H6 Z" stroke="currentColor" strokeWidth="2.8" fill="currentColor" fillOpacity="0.15" strokeLinejoin="round" />
  ),
  bushing: () => (
    <g stroke="currentColor" strokeWidth="2.8" fill="none">
      <polygon points={hex(32, 32, 24)} fill="currentColor" fillOpacity="0.15" />
      <circle cx="32" cy="32" r="13" />
      <circle cx="32" cy="32" r="7" strokeWidth="1.8" />
    </g>
  ),
  cap: () => (
    <g stroke="currentColor" strokeWidth="2.8" fill="currentColor" fillOpacity="0.15" strokeLinejoin="round">
      <path d="M14 14 H50 V32 Q50 52 32 52 Q14 52 14 32 Z" />
      <path d="M14 22 H50" fill="none" />
    </g>
  ),
  union: () => (
    <>
      <Piped d="M4 32 H60" />
      <g stroke="currentColor" strokeWidth="2.6" fill={TILE}>
        <polygon points="18,16 30,16 32,32 30,48 18,48 16,32" />
        <polygon points="34,20 44,20 46,32 44,44 34,44 32,32" />
      </g>
    </>
  ),
  socket: () => (
    <g stroke="currentColor" strokeWidth="2.8" fill="currentColor" fillOpacity="0.15">
      <rect x="12" y="18" width="40" height="28" rx="3" />
      <path d="M20 18 V46 M26 18 V46 M38 18 V46 M44 18 V46" strokeWidth="1.3" fill="none" />
    </g>
  ),
  coupling: () => (
    <g stroke="currentColor" strokeWidth="2.6" fill="none">
      <circle cx="32" cy="32" r="18" strokeWidth="7" stroke={RED} />
      <circle cx="32" cy="32" r="12" />
      <rect x="4" y="26" width="12" height="12" rx="2" fill={RED} stroke={RED} />
      <rect x="48" y="26" width="12" height="12" rx="2" fill={RED} stroke={RED} />
      <path d="M2 32 H62" strokeWidth="1.6" stroke="currentColor" strokeDasharray="3 3" />
    </g>
  ),
  valve: () => (
    <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
      <ellipse cx="32" cy="9" rx="13" ry="3.5" />
      <path d="M32 9 V26 M27 26 h10" />
      <rect x="4" y="30" width="7" height="24" rx="1.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="53" y="30" width="7" height="24" rx="1.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M11 36 H18 Q20 26 32 26 Q44 26 46 36 H53 V48 H46 Q44 58 32 58 Q20 58 18 48 H11 Z" fill={RED} fillOpacity="0.85" stroke={RED} />
    </g>
  ),
  check: () => (
    <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
      <rect x="4" y="24" width="7" height="26" rx="1.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="53" y="24" width="7" height="26" rx="1.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M11 30 H16 Q18 18 32 18 Q46 18 48 30 H53 V44 H48 Q46 56 32 56 Q18 56 16 44 H11 Z" fill={RED} fillOpacity="0.85" stroke={RED} />
      <rect x="22" y="10" width="20" height="8" rx="2" fill="currentColor" fillOpacity="0.25" />
      <path d="M22 37 H42 M36 32 l6 5 -6 5" stroke="#fff" strokeWidth="2.2" />
    </g>
  ),
  ball: () => (
    <>
      <Piped d="M4 40 H60" />
      <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
        <circle cx="32" cy="40" r="13" fill={TILE} />
        <circle cx="32" cy="40" r="6" fill="currentColor" fillOpacity="0.3" />
        <path d="M32 27 V20 L56 14" strokeWidth="4" stroke={RED} fill="none" />
      </g>
    </>
  ),
  switch: () => (
    <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
      <rect x="14" y="14" width="36" height="30" rx="4" fill={RED} fillOpacity="0.85" stroke={RED} />
      <circle cx="24" cy="26" r="3" fill="#fff" stroke="none" />
      <path d="M32 24 H44 M32 32 H44" stroke="#fff" strokeWidth="2" />
      <path d="M22 44 V52 H10 M42 44 V56" />
    </g>
  ),
  drain: () => (
    <>
      <Piped d="M4 24 H60" />
      <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <rect x="22" y="14" width="20" height="20" rx="4" fill={RED} fillOpacity="0.85" stroke={RED} />
        <circle cx="32" cy="24" r="5" fill="#9ad7ff" fillOpacity="0.8" stroke="#fff" strokeWidth="1.5" />
        <path d="M32 36 V56 M26 50 l6 6 6 -6" />
      </g>
    </>
  ),
  balance: () => (
    <>
      <Piped d="M4 42 H60" />
      <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <rect x="20" y="32" width="24" height="20" rx="4" fill={TILE} />
        <circle cx="32" cy="16" r="11" fill="currentColor" fillOpacity="0.15" />
        <path d="M32 16 L38 10 M32 27 V32" />
        <path d="M24 20 A10 10 0 0 1 40 20" strokeWidth="1.5" />
      </g>
    </>
  ),
  strainer: () => (
    <>
      <Piped d="M4 24 H60" />
      <Piped d="M30 26 L46 52" />
      <rect x="40" y="50" width="14" height="8" rx="2" transform="rotate(-32 47 54)" fill="currentColor" />
    </>
  ),
  zone: () => (
    <>
      <Piped d="M32 4 V60" />
      <g stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round">
        <rect x="24" y="12" width="16" height="12" rx="2" fill={RED} stroke={RED} />
        <circle cx="50" cy="36" r="8" fill={TILE} />
        <path d="M50 36 l3 -4 M38 36 H42" />
        <rect x="24" y="44" width="16" height="10" rx="2" fill="currentColor" fillOpacity="0.3" />
        <path d="M12 49 H24" />
      </g>
    </>
  ),
  pendent: () => <Sprinkler />,
  upright: () => (
    <g transform="rotate(180 32 32)">
      <Sprinkler />
    </g>
  ),
  sidewall: () => (
    <g transform="rotate(-90 32 32)">
      <Sprinkler />
    </g>
  ),
  sprinkler: () => <Sprinkler />,
  fitting: () => <Piped d="M20 60 V38 Q20 20 38 20 H60" />,
  cabinet: () => (
    <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
      <rect x="10" y="6" width="44" height="52" rx="3" fill={RED} fillOpacity="0.85" stroke={RED} />
      <rect x="15" y="11" width="34" height="42" rx="2" fill="#dff1ff" fillOpacity="0.25" stroke="#fff" strokeWidth="1.5" />
      <circle cx="32" cy="28" r="11" stroke="#fff" />
      <circle cx="32" cy="28" r="4" fill="#fff" stroke="none" />
      <path d="M22 46 H42" stroke="#fff" />
    </g>
  ),
};

export default function ShapeIcon({ name, className = 'h-16 w-16' }) {
  const Icon = icons[name] || icons.pipe;
  return (
    <svg viewBox="0 0 64 64" className={`text-gold ${className}`} aria-hidden>
      <Icon />
    </svg>
  );
}

export const TILE_COLOR = TILE;
