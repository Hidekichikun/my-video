import React from 'react';

const S = { stroke: '#1a1a1a', strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

export const ICONS: Record<string, React.FC<{ p: number }>> = {
  heart: ({ p }) => (
    <svg viewBox="0 0 100 100">
      <path d="M50 86 C10 58 8 30 28 20 C40 14 48 22 50 30 C52 22 60 14 72 20 C92 30 90 58 50 86Z" fill="#ff4f9a" {...S} />
      <path d="M30 32 C34 26 40 26 42 30" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
    </svg>
  ),
  eraser: () => (
    <svg viewBox="0 0 100 100">
      <g transform="rotate(-18 50 50)">
        <rect x="14" y="34" width="72" height="34" rx="6" fill="#ff9ec7" {...S} />
        <rect x="14" y="34" width="26" height="34" rx="6" fill="#4aa3ff" {...S} />
        <path d="M20 44 h12" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
      </g>
    </svg>
  ),
  spiral: ({ p }) => {
    const pts: string[] = [];
    for (let i = 0; i <= 220; i++) {
      const a = i * 0.07;
      const r = 2 * Math.pow(1.17, a * 1.9);
      pts.push(`${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`);
    }
    return (
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill="#ffe27a" {...S} />
        <polyline points={pts.join(' ')} fill="none" stroke="#b8860b" strokeWidth={5} strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - p)} />
      </svg>
    );
  },
  graph: ({ p }) => (
    <svg viewBox="0 0 100 100">
      <rect x="8" y="8" width="84" height="84" rx="8" fill="#fff" {...S} />
      <path d="M20 80 V20 M20 80 H84" stroke="#1a1a1a" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M22 76 L50 66 Q66 60 74 22" stroke="#ff2e63" strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray={120} strokeDashoffset={120 * (1 - p)} />
    </svg>
  ),
  boom: () => (
    <svg viewBox="0 0 100 100">
      <path d="M50 4 L60 32 L90 20 L72 46 L98 62 L66 66 L72 96 L50 74 L28 96 L32 66 L2 62 L28 46 L10 20 L40 32Z" fill="#ffd23f" {...S} />
      <circle cx="50" cy="52" r="14" fill="#ff5a1f" {...S} />
    </svg>
  ),
  dice: () => (
    <svg viewBox="0 0 100 100">
      <g transform="rotate(12 50 50)">
        <rect x="14" y="14" width="72" height="72" rx="14" fill="#fff" {...S} />
        {[[32, 32], [68, 32], [50, 50], [32, 68], [68, 68]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" fill={i === 2 ? '#ff2e63' : '#1a1a1a'} />)}
      </g>
    </svg>
  ),
  pencil: () => (
    <svg viewBox="0 0 100 100">
      <g transform="rotate(-40 50 50)">
        <rect x="10" y="40" width="62" height="20" fill="#ffd23f" {...S} />
        <path d="M72 40 L92 50 L72 60Z" fill="#f5d6a8" {...S} />
        <path d="M86 47 L92 50 L86 53Z" fill="#1a1a1a" />
        <rect x="4" y="40" width="10" height="20" fill="#ff9ec7" {...S} />
      </g>
    </svg>
  ),
  note: () => (
    <svg viewBox="0 0 100 100">
      <path d="M38 76 V20 L82 10 V64" fill="none" stroke="#1a1a1a" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="28" cy="76" rx="14" ry="11" fill="#6ad1ff" {...S} />
      <ellipse cx="72" cy="66" rx="14" ry="11" fill="#6ad1ff" {...S} />
    </svg>
  ),
  calc: ({ p }) => (
    <svg viewBox="0 0 100 100">
      <path d={`M30 18 Q${36 + Math.sin(p * 30) * 6} 0 50 6 Q${60 + Math.cos(p * 25) * 6} -2 70 16`} fill="#ff5a1f" stroke="#ffd23f" strokeWidth={4} />
      <rect x="20" y="14" width="60" height="80" rx="8" fill="#5a6270" {...S} />
      <rect x="28" y="22" width="44" height="18" rx="3" fill="#b8f2a0" stroke="#1a1a1a" strokeWidth={3} />
      <text x="70" y="37" textAnchor="end" fontFamily="Bangers" fontSize="16" fill="#c00">ERR</text>
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={30 + c * 14} y={48 + r * 14} width="10" height="10" rx="2" fill="#fff" stroke="#1a1a1a" strokeWidth={2} />))}
    </svg>
  ),
  notebook: () => (
    <svg viewBox="0 0 100 100">
      <rect x="18" y="10" width="66" height="80" rx="4" fill="#fff" {...S} />
      {[28, 42, 56, 70].map((y) => <path key={y} d={`M30 ${y} H74`} stroke="#8ab4ff" strokeWidth={3} />)}
      <text x="34" y="40" fontFamily="Permanent Marker" fontSize="18" fill="#ff2e63">x²</text>
      {[20, 36, 52, 68, 84].map((y) => <circle key={y} cx="18" cy={y - 4} r="4" fill="#1a1a1a" />)}
    </svg>
  ),
  phone: () => (
    <svg viewBox="0 0 100 100">
      <rect x="28" y="6" width="44" height="88" rx="9" fill="#2b2f3a" {...S} />
      <rect x="33" y="16" width="34" height="62" rx="3" fill="#8fe3ff" />
      <rect x="37" y="24" width="22" height="10" rx="5" fill="#fff" />
      <text x="60" y="72" textAnchor="end" fontFamily="Nikumaru" fontSize="9" fill="#1a1a1a">既読</text>
    </svg>
  ),
  bug: () => (
    <svg viewBox="0 0 100 100">
      {[30, 50, 70].map((y) => <path key={y} d={`M20 ${y} L80 ${y}`} stroke="#1a1a1a" strokeWidth={5} strokeLinecap="round" />)}
      <ellipse cx="50" cy="54" rx="22" ry="30" fill="#7ad151" {...S} />
      <circle cx="50" cy="22" r="12" fill="#3a8f2a" {...S} />
      <path d="M50 28 V84" stroke="#1a1a1a" strokeWidth={4} />
      <circle cx="45" cy="20" r="3" fill="#fff" /><circle cx="55" cy="20" r="3" fill="#fff" />
    </svg>
  ),
  ticket: () => (
    <svg viewBox="0 0 100 100">
      <g transform="rotate(-10 50 50)">
        <path d="M6 30 H94 V44 A6 6 0 0 0 94 56 V70 H6 V56 A6 6 0 0 0 6 44Z" fill="#ffe27a" {...S} />
        <path d="M68 32 V68" stroke="#1a1a1a" strokeWidth={3} strokeDasharray="5 5" />
        <text x="36" y="58" textAnchor="middle" fontFamily="Nikumaru" fontSize="20" fill="#d11">君</text>
      </g>
    </svg>
  ),
  letter: () => (
    <svg viewBox="0 0 100 100">
      <rect x="10" y="24" width="80" height="56" rx="4" fill="#fff" {...S} />
      <path d="M10 26 L50 56 L90 26" fill="none" {...S} />
      <path d="M50 70 C40 62 40 54 46 52 C49 51 50 54 50 55 C50 54 51 51 54 52 C60 54 60 62 50 70Z" fill="#ff4f9a" stroke="#1a1a1a" strokeWidth={3} />
    </svg>
  ),
  book: () => (
    <svg viewBox="0 0 100 100">
      <path d="M50 24 Q30 14 10 20 V80 Q30 74 50 84 Q70 74 90 80 V20 Q70 14 50 24Z" fill="#a37cf0" {...S} />
      <path d="M50 24 V84" stroke="#1a1a1a" strokeWidth={4} />
      <path d="M20 34 Q32 30 42 36 M20 46 Q32 42 42 48 M58 36 Q68 30 80 34" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
    </svg>
  ),
  arrow: ({ p }) => (
    <svg viewBox="0 0 100 100">
      <g transform={`rotate(${-30 + 30 * p} 50 50)`}>
        <path d="M14 58 L62 58 L62 74 L90 50 L62 26 L62 42 L14 42 Z" fill="#ff2e88" {...S} />
      </g>
    </svg>
  ),
  tri: () => (
    <svg viewBox="0 0 100 100">
      <path d="M14 86 L86 86 L14 20 Z" fill="#7fd3ff" fillOpacity={0.85} {...S} />
      <path d="M28 72 L54 72 L28 48 Z" fill="#fff" {...S} />
      <path d="M14 76 h10 v10" fill="none" stroke="#1a1a1a" strokeWidth={4} />
    </svg>
  ),
  star: () => (
    <svg viewBox="0 0 100 100">
      <path d="M50 8 L61 38 L93 39 L67 58 L77 90 L50 71 L23 90 L33 58 L7 39 L39 38 Z" fill="#ffd23f" {...S} />
    </svg>
  ),
  proto: ({ p }) => (
    <svg viewBox="0 0 100 100">
      <path d="M8 72 A42 42 0 0 1 92 72 Z" fill="#ffd3ea" {...S} />
      <path d="M50 72 L50 34" stroke="#1a1a1a" strokeWidth={3} />
      <path d={`M50 72 L${50 + Math.cos(Math.PI * (1 - p * 0.5)) * 38} ${72 - Math.sin(Math.PI * (1 - p * 0.5)) * 38}`} stroke="#ff2e88" strokeWidth={6} strokeLinecap="round" />
    </svg>
  ),
  sparkle: () => (
    <svg viewBox="0 0 100 100">
      <path d="M50 6 C54 40 60 46 94 50 C60 54 54 60 50 94 C46 60 40 54 6 50 C40 46 46 40 50 6 Z" fill="#ffd23f" {...S} />
    </svg>
  ),
};
