import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, random, staticFile, useCurrentFrame } from 'remotion';
import { LINES, Line } from './lyrics';
import { ICONS } from './icons';
import ENV from './env.json';
import { MathNotes } from './notes';

export const FPS = 30;
export const DURATION = Math.round(234.8 * FPS);
const W = 1920, H = 1080;

const FB = ", 'DejaVu Sans', sans-serif";
export const POP = 'Nikumaru' + FB;
const GLITCH = 'ToroGlitch, Nikumaru' + FB;
export const BANG = 'Bangers, Nikumaru' + FB;
export const CHALK = 'Permanent Marker, Nikumaru' + FB;
export const PINK = '#ff2e88', GOLD = '#ffc928', LAV = '#a77bff', RED = '#ff2e2e', CYAN = '#3ff3ff', NAVY = '#1f2f6b', CHALKW = 'rgba(255,255,255,0.92)', GRIDB = '#7fb6ff';

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const easeOut = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
export const easeInOut = (p: number) => { p = clamp(p); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
const backOut = (p: number) => { p = clamp(p); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
export const env = (k: 'bass' | 'onset' | 'loud', f: number) => (ENV as any)[k][Math.max(0, Math.min((ENV as any)[k].length - 1, f))] as number;

// ---------- fonts ----------
const FONTS: [string, string][] = [['Nikumaru', 'NikumaruFont.otf'], ['ToroGlitch', 'ToroNoGlitchMinchoH3.otf'], ['Bangers', 'Bangers-Regular.ttf'], ['Permanent Marker', 'PermanentMarker-Regular.ttf']];
export const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(FONTS.map(([n, f]) => { const ff = new FontFace(n, `url(${staticFile(f)})`); return ff.load().then((x) => { (document.fonts as any).add(x); }); }))
      .then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
  }, [h]);
};

// ---------- shots ----------
type FX = { shake?: number; pulse?: number; desat?: number; tint?: 'red' | 'night'; spin?: number; tiltOut?: boolean; tiltIn?: boolean };
type Shot = { t: number; img: string; a: [number, number, number]; b: [number, number, number]; fx?: FX };
const S = (t: number, img: string, a: [number, number, number], b: [number, number, number], fx?: FX): Shot => ({ t, img, a, b, fx });
const C: [number, number, number] = [960, 540, 1.0];
export const SHOTS: Shot[] = [
  S(0, '04', [960, 420, 1.0], [980, 470, 1.12]),
  S(7.2, '04', [980, 430, 1.4], [980, 430, 1.55], { pulse: 0.5 }),
  S(12.6, 'thumb', C, [900, 540, 1.08], { pulse: 0.6 }),
  S(23.18, '05', [960, 540, 1.0], [700, 420, 1.3], { pulse: 0.4 }),
  S(26.14, '05', [1250, 640, 1.5], [1250, 640, 1.65], { pulse: 0.5 }),
  S(28.86, '06', [960, 540, 1.0], [1000, 520, 1.1], { pulse: 0.4 }),
  S(30.4, '06', [620, 380, 1.6], [620, 380, 1.75]),
  S(32.0, '06', [1300, 400, 1.6], [1300, 420, 1.8], { shake: 0.6, pulse: 0.8 }),
  S(34.84, '07', C, [960, 520, 1.1], { pulse: 0.6 }),
  S(36.6, '07', [960, 360, 1.5], [960, 360, 1.62], { pulse: 0.5 }),
  S(40.3, '07', C, [960, 540, 1.04], { pulse: 0.5 }),
  S(42.06, '07', [960, 400, 1.3], [960, 400, 1.36], { desat: 0.5 }),
  S(46.4, '08', [960, 560, 1.25], [960, 540, 1.0]),
  S(51.56, '08', [960, 540, 1.0], [960, 600, 1.12], { pulse: 0.8 }),
  S(56.94, '09', C, [960, 540, 1.08], { shake: 0.5, pulse: 1 }),
  S(59.62, '09', [1250, 380, 1.5], [1250, 380, 1.65], { pulse: 1, spin: 3 }),
  S(62.34, '09', [760, 500, 1.3], [1100, 500, 1.3], { pulse: 1 }),
  S(65.26, '09', [320, 600, 1.7], [320, 600, 1.85], { pulse: 1 }),
  S(68.28, '09', C, [960, 500, 1.1], { pulse: 1 }),
  S(70.74, '09', [900, 340, 1.4], [900, 340, 1.55], { pulse: 1 }),
  S(74.34, '10', [1200, 420, 1.5], [1200, 420, 1.62], { tint: 'night' }),
  S(76.04, '10', C, [960, 540, 1.06], { tint: 'night' }),
  S(78.86, '10', [700, 380, 1.4], [760, 380, 1.5], { tint: 'night' }),
  S(80.44, '10', [1400, 700, 1.5], [1400, 700, 1.6], { tint: 'night' }),
  S(82.44, '10', [1150, 380, 1.8], [1150, 380, 2.0], { tint: 'night' }),
  S(85.86, '11', C, [960, 520, 1.08], { pulse: 0.6 }),
  S(87.52, '11', [560, 360, 1.6], [560, 360, 1.75], { pulse: 0.7 }),
  S(89.62, '11', [760, 700, 1.4], [760, 640, 1.55], { pulse: 0.8 }),
  S(92.33, '11', [600, 340, 1.8], [620, 340, 1.95], { pulse: 0.6 }),
  S(94.52, '11', C, [960, 540, 1.06], { pulse: 0.6 }),
  S(97.38, '11', [1380, 420, 1.6], [1380, 420, 1.8], { pulse: 0.5 }),
  S(100.44, '11', [760, 640, 1.5], [760, 640, 1.6], { pulse: 0.8 }),
  S(102.66, '11', [1380, 420, 1.9], [1380, 420, 2.1], { desat: 0.6 }),
  S(107.4, '12', [960, 540, 1.1], [960, 520, 1.25], { spin: 3 }),
  S(113.84, '12', [960, 360, 1.5], [960, 360, 1.8], { spin: -5, shake: 0.4, pulse: 0.8 }),
  S(119.06, '13', C, [960, 540, 1.06], { shake: 0.5, pulse: 1 }),
  S(121.64, '13', [1500, 640, 1.5], [1500, 640, 1.65], { pulse: 1 }),
  S(124.52, '13', [500, 400, 1.4], [500, 360, 1.55], { pulse: 1 }),
  S(126.84, '13', C, [960, 540, 1.15], { pulse: 1, shake: 0.6 }),
  S(130.4, '13', [960, 540, 1.0], [960, 500, 1.1], { pulse: 1 }),
  S(132.66, '13', [400, 300, 1.6], [1500, 400, 1.5], { pulse: 1 }),
  S(136.06, '13', [1500, 500, 1.9], [1500, 500, 2.0], { desat: 1 }),
  S(141.66, '14', [480, 540, 1.7], [480, 540, 1.85], { tint: 'red', pulse: 1 }),
  S(144.04, '14', C, [960, 540, 1.05], { pulse: 1.2, shake: 0.6 }),
  S(146.44, '14', [1450, 520, 1.7], [1450, 520, 1.9], { pulse: 1 }),
  S(147.96, '14', [1450, 520, 1.3], [1450, 520, 1.0], { pulse: 1.2, shake: 0.8 }),
  S(151.06, '14', C, [960, 540, 1.2], { shake: 2, pulse: 1.5 }),
  S(153.54, '15', C, [960, 540, 1.08], { shake: 1.4, pulse: 1.5, tint: 'red' }),
  S(155.04, '15', [1500, 400, 1.6], [1500, 400, 1.8], { shake: 1, pulse: 1.3 }),
  S(156.81, '08', [960, 600, 1.0], [960, 700, 1.0], { tiltOut: true }),
  S(157.5, '15b', [960, 540, 1.0], [960, 540, 1.06], { tiltIn: true, shake: 0.8, pulse: 1.2 }),
  S(160.06, '15', [700, 500, 1.4], [700, 500, 1.6], { shake: 2, pulse: 1.5, tint: 'red' }),
  S(162.7, '16', C, [960, 500, 1.1], { tint: 'night' }),
  S(167.94, '16', [1150, 380, 1.5], [1150, 360, 1.65], { tint: 'night' }),
  S(172.92, '16', [520, 480, 1.6], [520, 470, 1.75], { tint: 'night' }),
  S(175.52, '16', [960, 300, 1.2], [960, 300, 1.35], { tint: 'night' }),
  S(179.4, '17', [1600, 500, 1.6], [1600, 500, 1.75]),
  S(182.56, '17', [800, 380, 1.5], [800, 380, 1.65]),
  S(184.94, '17', [960, 720, 1.4], [900, 720, 1.25]),
  S(190.62, '18', C, [960, 540, 1.08], { pulse: 1.2, shake: 0.5 }),
  S(194.32, '18', [650, 480, 1.5], [650, 480, 1.65], { pulse: 1 }),
  S(195.92, '18', [1500, 300, 1.5], [1500, 300, 1.7], { pulse: 1 }),
  S(200.32, '18', C, [960, 540, 1.15], { pulse: 1.2, shake: 0.6 }),
  S(202.7, '18', [960, 480, 1.25], [960, 480, 1.4], { pulse: 1 }),
  S(206.22, '18', C, [960, 540, 1.06], { pulse: 1.5, shake: 1 }),
  S(208.62, '18', [650, 480, 1.7], [650, 480, 1.85]),
  S(213.8, '19', [960, 540, 1.0], [960, 520, 1.1]),
  S(220.08, '19', [1600, 640, 1.7], [1600, 640, 1.85]),
  S(221.86, '19', [700, 480, 1.4], [700, 480, 1.55]),
  S(226.08, '19', C, [960, 540, 1.2], { shake: 2, pulse: 1.5 }),
  S(231.06, '04', C, [960, 540, 1.05], { desat: 0.2 }),
];
export const DARK = new Set(['10', '12', '15', '15b', '16']);
export const shotAt = (t: number) => { let i = 0; for (let k = 0; k < SHOTS.length; k++) if (SHOTS[k].t <= t) i = k; return i; };

const ACCENTS: [number, number][] = [
  [12.6, 0.7], [23.18, 0.4], [32.0, 0.6], [40.3, 0.7], [56.94, 1], [65.26, 0.8], [68.28, 1], [85.86, 0.4], [100.44, 0.6], [119.06, 1], [126.84, 0.8], [130.4, 1],
  [141.66, 0.7], [144.04, 1], [145.08, 0.9], [147.96, 1], [151.06, 1.2], [153.54, 1.2], [155.04, 1], [157.5, 1.3], [160.06, 1.2], [190.62, 1.2], [200.32, 0.8], [206.22, 1], [226.08, 1.3],
];
export const accent = (t: number) => ACCENTS.reduce((m, [a, s]) => (t >= a && t < a + 0.6 ? Math.max(m, s * Math.exp(-(t - a) * 7)) : m), 0);

export const camera = (shot: Shot, t: number, nextT: number) => {
  const p = easeInOut((t - shot.t) / Math.max(0.1, nextT - shot.t));
  return { fx: lerp(shot.a[0], shot.b[0], p), fy: lerp(shot.a[1], shot.b[1], p), s: lerp(shot.a[2], shot.b[2], p) };
};

const ImageLayer: React.FC<{ shot: Shot; t: number; nextT: number; frame: number }> = ({ shot, t, nextT, frame }) => {
  const fx = shot.fx || {};
  const cam = camera(shot, t, nextT);
  const pulse = (fx.pulse || 0) * env('onset', frame);
  const s = cam.s * (1 + 0.03 * pulse);
  const rot = fx.spin ? Math.sin((t - shot.t) * 0.9) * fx.spin : 0;
  let tx = W / 2 - cam.fx * s, ty = H / 2 - cam.fy * s;
  tx = clamp(tx, W - W * s, 0); ty = clamp(ty, H - H * s, 0);
  const extra = rot ? 1.08 : 1;
  const filt = [fx.desat ? `grayscale(${fx.desat}) contrast(1.1) brightness(0.92)` : '', fx.tint === 'red' ? 'saturate(1.3) contrast(1.12)' : '', fx.tint === 'night' ? 'saturate(1.1)' : ''].join(' ').trim();
  let tilt = '';
  if (fx.tiltOut) { const p = easeInOut((t - shot.t) / 0.69); tilt = `perspective(1400px) rotateX(${lerp(0, 72, p)}deg) rotateZ(${lerp(0, 90, p)}deg) scale(${lerp(1, 1.6, p)})`; }
  if (fx.tiltIn) { const p = easeOut((t - shot.t) / 0.5); tilt = `rotateZ(${lerp(-45, 0, p)}deg) scale(${lerp(1.5, 1, p)})`; }
  return (
    <AbsoluteFill style={{ transform: `${tilt} rotate(${rot}deg) scale(${extra})` }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
        <Img src={staticFile(`cs/${shot.img}.jpg`)} style={{ width: W, height: H, filter: filt || undefined }} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- helpers ----------
const SYM = /[⊥θ∥]/;
const SYMST: React.CSSProperties = { fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 700 };
// vector-arrow rendering (combining U+20D7 -> arrow drawn above the letter)
const vx = (str: string): React.ReactNode => {
  if (!/[\u20D7⊥θ∥]/.test(str)) return str;
  const cs = [...str]; const out: React.ReactNode[] = [];
  for (let i = 0; i < cs.length; i++) {
    if (cs[i + 1] === '\u20D7') {
      out.push(<span key={i} style={{ position: 'relative', display: 'inline-block' }}>{cs[i]}<span style={{ position: 'absolute', left: '50%', top: '-0.42em', transform: 'translateX(-50%) scaleX(1.25)', fontSize: '0.62em', fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 700, lineHeight: 1 }}>→</span></span>);
      i++;
    } else if (SYM.test(cs[i])) out.push(<span key={i} style={SYMST}>{cs[i]}</span>);
    else if (cs[i] !== '\u20D7') out.push(<React.Fragment key={i}>{cs[i]}</React.Fragment>);
  }
  return <>{out}</>;
};
const vxNode = (n: React.ReactNode): React.ReactNode => {
  if (typeof n === 'string') return vx(n);
  if (Array.isArray(n)) return n.map((c, i) => <React.Fragment key={i}>{vxNode(c)}</React.Fragment>);
  if (React.isValidElement(n) && (n.props as any).children !== undefined) return React.cloneElement(n as any, {}, vxNode((n.props as any).children));
  return n;
};

export const Txt: React.FC<{ x: number; y: number; size: number; font?: string; color?: string; stroke?: string; sw?: number; rot?: number; scale?: number; op?: number; glow?: string; children: React.ReactNode; anchor?: 'c' | 'l' }> = ({ x, y, size, font = POP, color = '#fff', stroke = '#111', sw = 0, rot = 0, scale = 1, op = 1, glow, children, anchor = 'c' }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'c' ? '-50%' : '0'}, -50%) rotate(${rot}deg) scale(${scale})`, fontFamily: font, fontSize: size, color, opacity: op, whiteSpace: 'nowrap', lineHeight: 1, WebkitTextStroke: sw ? `${sw}px ${stroke}` : undefined, paintOrder: 'stroke fill', textShadow: glow }}>{vxNode(children)}</div>
);
const pop = (t: number, at: number, dur = 0.25) => backOut((t - at) / dur);
const vis = (t: number, a: number, b: number) => t >= a && t < b;
const fadeIO = (t: number, a: number, b: number, d = 0.2) => clamp(Math.min((t - a) / d, (b - t) / d));

const Pen: React.FC<{ x: number; y: number; size: number; text: React.ReactNode; op?: number; rot?: number; color?: string; dark?: boolean }> = ({ x, y, size, text, op = 1, rot = 0, color, dark }) => (
  <Txt x={x} y={y} size={size} font={CHALK} color={color || (dark ? CHALKW : NAVY)} op={op} rot={rot} stroke={dark ? '#000' : '#fff'} sw={dark ? 0 : 6} glow={dark ? '0 0 8px rgba(255,255,255,0.4)' : undefined}>{text}</Txt>
);

const Stamp: React.FC<{ t: number; at: number; x: number; y: number; text: React.ReactNode; size?: number; color?: string; rot?: number; font?: string }> = ({ t, at, x, y, text, size = 110, color = RED, rot = -12, font = POP }) => {
  const p = clamp((t - at) / 0.18);
  const sc = lerp(2.6, 1, easeOut(p));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${sc})`, opacity: p, border: `10px solid ${color}`, borderRadius: 18, padding: '6px 26px', fontFamily: font, fontSize: size, color, lineHeight: 1.05, whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.78)', boxShadow: '0 0 0 4px rgba(0,0,0,0.25)' }}>{vxNode(text)}</div>
  );
};

const Rays: React.FC<{ frame: number; color?: string; color2?: string; op?: number }> = ({ frame, color = PINK, color2 = GOLD, op = 0.35 }) => {
  const o = env('onset', frame);
  const n = 28;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: op * (0.4 + o) }}>
      <g transform={`translate(${W / 2} ${H / 2}) rotate(${frame * 0.6})`}>
        {Array.from({ length: n }).map((_, i) => {
          const a = (i / n) * Math.PI * 2, a2 = a + 0.05;
          const r1 = 420 + random(`r${i}`) * 120, r2 = 1400;
          return <polygon key={i} points={`${Math.cos(a) * r1},${Math.sin(a) * r1} ${Math.cos(a) * r2},${Math.sin(a) * r2} ${Math.cos(a2) * r2},${Math.sin(a2) * r2}`} fill={i % 3 === 0 ? color2 : color} />;
        })}
      </g>
    </svg>
  );
};

const Ticker: React.FC<{ t: number; t0: number; rows: string[]; color?: string; op?: number }> = ({ t, t0, rows, color = '#fff', op = 0.55 }) => (
  <>
    {rows.map((r, i) => {
      const x = (i % 2 ? -1 : 1) * ((t - t0) * (160 + i * 70)) - 600;
      return <div key={i} style={{ position: 'absolute', top: 70 + i * 150, left: i % 2 ? x - 1200 : -x - 1800, fontFamily: BANG, fontSize: 92 - i * 8, color, opacity: op, whiteSpace: 'nowrap', letterSpacing: 8, WebkitTextStroke: '3px rgba(0,0,0,0.5)', paintOrder: 'stroke fill' }}>{(r + '   ').repeat(6)}</div>;
    })}
  </>
);

// vector arrow in screen space
const Vec: React.FC<{ x: number; y: number; len: number; ang: number; color: string; w?: number; p?: number; label?: string; dash?: boolean; op?: number; who?: string; R?: number }> = ({ x, y, len, ang, color, w = 16, p = 1, label, dash, op = 1, who, R = 64 }) => {
  const a = (ang * Math.PI) / 180;
  const L = len * easeOut(p);
  const ex = x + Math.cos(a) * L, ey = y - Math.sin(a) * L;
  const hs = w * 2.6;
  const h1x = ex - Math.cos(a - 0.45) * hs, h1y = ey + Math.sin(a - 0.45) * hs;
  const h2x = ex - Math.cos(a + 0.45) * hs, h2y = ey + Math.sin(a + 0.45) * hs;
  const fcx = ex + Math.cos(a) * (R + 8), fcy = ey - Math.sin(a) * (R + 8);
  const fp = clamp((p - 0.15) / 0.5);
  return (
    <>
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity: op }}>
      <line x1={x} y1={y} x2={ex - Math.cos(a) * hs * 0.6} y2={ey + Math.sin(a) * hs * 0.6} stroke="#111" strokeWidth={w + 8} strokeLinecap="round" strokeDasharray={dash ? '22 18' : undefined} />
      <line x1={x} y1={y} x2={ex - Math.cos(a) * hs * 0.6} y2={ey + Math.sin(a) * hs * 0.6} stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash ? '22 18' : undefined} />
      {p > 0.05 && <polygon points={`${ex},${ey} ${h1x},${h1y} ${h2x},${h2y}`} fill={color} stroke="#111" strokeWidth={5} strokeLinejoin="round" />}
      {!who && label && p > 0.5 && <text x={ex + Math.cos(a) * 30} y={ey - Math.sin(a) * 30 + 20} fontFamily={POP} fontSize={58} fill={color} stroke="#111" strokeWidth={10} paintOrder="stroke" textAnchor="middle">{label.replace(/\u20D7/g, '')}</text>}
    </svg>
    {who && fp > 0 && (
      <div style={{ position: 'absolute', left: fcx - R, top: fcy - R, width: R * 2, height: R * 2, borderRadius: '50%', overflow: 'hidden', border: `${Math.max(4, R * 0.1)}px solid ${color}`, boxShadow: '0 0 0 4px #111, 0 6px 14px rgba(0,0,0,0.45)', transform: `scale(${backOut(fp)})`, opacity: op * clamp(fp * 3), background: '#fff' }}>
        <Img src={staticFile(`cs/face-${who}.jpg`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )}
    </>
  );
};

const Arc: React.FC<{ x: number; y: number; r: number; a0: number; a1: number; color: string }> = ({ x, y, r, a0, a1, color }) => {
  const p = (d: number) => `${x + Math.cos((d * Math.PI) / 180) * r},${y - Math.sin((d * Math.PI) / 180) * r}`;
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}><path d={`M${p(a0)} A${r},${r} 0 ${large} 0 ${p(a1)}`} fill="none" stroke={color} strokeWidth={8} /></svg>;
};

const FaceBadge: React.FC<{ who: string; x: number; y: number; size: number; p: number; rot?: number; ring?: string }> = ({ who, x, y, size, p, rot = 0, ring = '#fff' }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: size, height: size, transform: `translate(-50%,-50%) scale(${backOut(p)}) rotate(${rot}deg)`, borderRadius: '50%', overflow: 'hidden', border: `${Math.max(4, size * 0.06)}px solid ${ring}`, boxShadow: `0 0 0 ${Math.max(3, size * 0.04)}px #111, 0 8px 18px rgba(0,0,0,0.4)`, opacity: clamp(p * 3) }}>
    <Img src={staticFile(`cs/face-${who}.jpg`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  </div>
);

// ---------- floaters ----------
const FLOAT = ['a⃗・b⃗', 'cos θ', '|a⃗|', 'θ = 0°', '⊥', '∥', 'sin²θ+cos²θ=1', '√3', '√2', 'e^iπ', '90°', 'x成分', 'y成分', '→', 'Q.E.D.', '1:2:√3', '内積'];
const Floaters: React.FC<{ t: number; op: number; dark: boolean }> = ({ t, op, dark }) => (
  <>
    {FLOAT.map((s, i) => {
      const bx = random(`fx${i}`) * W, by = 60 + random(`fy${i}`) * 600;
      const sp = 14 + random(`fs${i}`) * 26;
      const x = ((bx + t * sp * (i % 2 ? 1 : -1)) % (W + 400) + W + 400) % (W + 400) - 200;
      const y = by + Math.sin(t * 0.6 + i) * 24;
      return <Txt key={i} x={x} y={y} size={36 + random(`fz${i}`) * 32} font={CHALK} color={dark ? CHALKW : NAVY} op={op * (0.1 + random(`fo${i}`) * 0.14)} rot={(random(`fr${i}`) - 0.5) * 24}>{s}</Txt>;
    })}
  </>
);

// ---------- HUD: section + protractor meter ----------
const SECTIONS: [number, string][] = [
  [0, '序論'], [23.18, '第1章 平行線の錯覚'], [56.94, '定義 ベクトル'], [74.34, '補講 内積'], [85.86, '第2章 図書室の角度'], [107.4, '補題 √3'],
  [119.06, '定理 君向き'], [141.66, '逆ベクトル'], [153.54, '反例 直交'], [162.7, '第3章 星と数式'], [190.62, '最終定理 θ＝0'], [213.8, '結論'],
];
// [time, theta, target]   theta < 0 => unknown (spin)
const ANG: [number, number, 'kimi' | 'ouji'][] = [
  [0, 90, 'kimi'], [34.84, 90, 'ouji'], [40.3, 0, 'ouji'], [46.4, 0, 'ouji'], [56.94, -1, 'kimi'], [74.1, -1, 'kimi'], [74.34, 90, 'kimi'], [85.86, 90, 'kimi'],
  [97.38, 70, 'kimi'], [102.66, -1, 'kimi'], [107.4, 65, 'kimi'], [119.06, 45, 'kimi'], [136.0, 40, 'kimi'], [141.66, 180, 'kimi'], [144.6, 180, 'kimi'],
  [145.6, 25, 'kimi'], [153.3, 25, 'kimi'], [153.54, 0, 'ouji'], [156.81, 0, 'ouji'], [157.5, 90, 'ouji'], [162.5, 90, 'ouji'], [162.7, 25, 'kimi'],
  [182.56, 15, 'kimi'], [190.62, 8, 'kimi'], [194.32, 0, 'kimi'], [234.8, 0, 'kimi'],
];
const angleAt = (t: number) => {
  let i = 0; for (let k = 0; k < ANG.length; k++) if (ANG[k][0] <= t) i = k;
  const [t0, a0, w0] = ANG[i]; const nx = ANG[i + 1];
  if (a0 < 0) return { th: ((t * 520) % 360), unknown: true, who: w0 };
  if (!nx || nx[1] < 0 || nx[2] !== w0) return { th: a0, unknown: false, who: w0 };
  const p = easeInOut((t - t0) / Math.max(0.1, Math.min(nx[0] - t0, 4)));
  return { th: lerp(a0, nx[1], p), unknown: false, who: w0 };
};
const lastOf = <T,>(arr: [number, T][], t: number) => { let r = arr[0]; for (const a of arr) if (a[0] <= t) r = a; return r; };

export const HUD: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  if (t > 230.9) return null;
  const [st, sname] = lastOf(SECTIONS, t);
  const sp = pop(t, st, 0.3);
  const { th, unknown, who } = angleAt(t);
  const cos = Math.cos((th * Math.PI) / 180);
  const col = unknown ? CYAN : who === 'ouji' ? LAV : cos > 0.95 ? '#fff' : cos < 0 ? RED : GOLD;
  const op = t < 1 ? clamp(t) : 1;
  const R = 92, cx = 130, cy = 128;
  const nx = cx + Math.cos((th * Math.PI) / 180) * R, ny = cy - Math.sin((th * Math.PI) / 180) * R;
  const max = !unknown && cos > 0.999 && who === 'kimi' && t > 190;
  const glow = max ? 0.6 + 0.4 * Math.sin(t * 8) : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op }}>
      <div style={{ position: 'absolute', left: 40, top: 34, background: 'rgba(255,255,255,0.88)', border: `4px solid ${NAVY}`, borderRadius: 10, padding: '8px 20px 10px', transform: `scale(${lerp(0.9, 1, sp)})`, transformOrigin: 'left top', backgroundImage: `linear-gradient(${GRIDB}33 2px, transparent 2px), linear-gradient(90deg, ${GRIDB}33 2px, transparent 2px)`, backgroundSize: '22px 22px' }}>
        <div style={{ fontFamily: POP, fontSize: 24, color: NAVY }}>本日の講義：ベクトル×三角関数</div>
        <div style={{ fontFamily: POP, fontSize: 34, color: PINK, WebkitTextStroke: '6px #fff', paintOrder: 'stroke fill' }}>§ {sname}</div>
      </div>
      <div style={{ position: 'absolute', right: 40, top: 30, width: 520, height: 170, background: 'rgba(15,18,40,0.82)', border: `4px solid ${col}`, borderRadius: 14, boxShadow: max ? `0 0 ${30 * glow}px ${GOLD}, 0 0 ${60 * glow}px ${PINK}` : undefined }}>
        <svg width={260} height={170} style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d={`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy} Z`} fill="rgba(255,211,234,0.18)" stroke="#fff" strokeWidth={3} />
          {Array.from({ length: 19 }).map((_, i) => { const a = (i * 10 * Math.PI) / 180; const r2 = i % 9 === 0 ? R - 18 : R - 9; return <line key={i} x1={cx + Math.cos(a) * R} y1={cy - Math.sin(a) * R} x2={cx + Math.cos(a) * r2} y2={cy - Math.sin(a) * r2} stroke="#fff" strokeWidth={2} />; })}
          <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke={GOLD} strokeWidth={7} strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={who === 'ouji' ? LAV : PINK} strokeWidth={7} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={7} fill="#fff" />
          <text x={cx + R - 8} y={cy + 30} fontFamily={POP} fontSize={20} fill={GOLD} textAnchor="end">{who === 'ouji' ? '王子' : '君'}</text>
          <text x={cx - R + 4} y={cy + 30} fontFamily={POP} fontSize={20} fill={who === 'ouji' ? LAV : PINK}>私</text>
        </svg>
        <div style={{ position: 'absolute', left: 250, top: 14, fontFamily: POP, fontSize: 26, color: '#fff' }}>私→{who === 'ouji' ? '王子' : '君'}</div>
        <div style={{ position: 'absolute', left: 250, top: 50, fontFamily: BANG, fontSize: 46, color: '#fff', letterSpacing: 2 }}>θ = {unknown ? '???' : `${Math.round(th)}°`}</div>
        <div style={{ position: 'absolute', left: 250, top: 104, fontFamily: BANG, fontSize: 46, color: col, letterSpacing: 2, transform: `scale(${max ? 1 + 0.06 * glow : 1})`, transformOrigin: 'left center' }}>cos θ = {unknown ? '?.??' : cos.toFixed(2)}</div>
      </div>
      {max && <div style={{ position: 'absolute', right: 52, top: 206, fontFamily: BANG, fontSize: 40, color: GOLD, WebkitTextStroke: '6px #111', paintOrder: 'stroke fill', letterSpacing: 3 }}>好き度 MAX!!</div>}
    </div>
  );
};

// ---------- lyrics ----------
type Tok = { k: 't' | 'h' | 'p' | 'i' | 'm'; v: string; w?: string };
const parse = (s: string): Tok[] => {
  const out: Tok[] = [];
  const re = /\*([^*]+)\*|\[([^\]]+)\]|\{([^}]+)\}|<([^|>]+)\|([^>]+)>/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ k: 't', v: s.slice(last, m.index) });
    if (m[1]) out.push({ k: 'h', v: m[1] }); else if (m[2]) out.push({ k: 'p', v: m[2] }); else if (m[3]) out.push({ k: 'i', v: m[3] }); else out.push({ k: 'm', v: m[4], w: m[5] });
    last = re.lastIndex;
  }
  if (last < s.length) out.push({ k: 't', v: s.slice(last) });
  return out;
};
const units = (toks: Tok[]) => toks.reduce((n, tk) => n + (tk.k === 'i' ? 1.2 : tk.k === 'm' ? Math.max([...tk.v].length * 0.75, [...(tk.w || '')].length) : [...tk.v].length), 0);
const SUPMAP: Record<string, string> = { '²': '2', '³': '3' };
const supify = (s: string, col: string) => [...s].map((c, i) => SUPMAP[c] ? <span key={i} style={{ fontFamily: BANG, fontSize: '0.95em', position: 'relative', top: '-0.42em', color: col, margin: '0 0.04em', WebkitTextStroke: 'inherit' }}>{SUPMAP[c]}</span> : <React.Fragment key={i}>{c}</React.Fragment>);
const mathText = (s: string, col = PINK) => { if (/[\u20D7⊥θ∥]/.test(s)) return vx(s); if (!s.includes('^')) return supify(s, col); const i = s.indexOf('^'); const j = s.indexOf('＋', i); const sup = s.slice(i + 1, j < 0 ? undefined : j); return <>{s.slice(0, i)}<sup style={{ fontSize: '0.6em', verticalAlign: '0.7em' }}>{sup}</sup>{j < 0 ? '' : s.slice(j)}</>; };

const KIND: Record<string, { size: number; font: string; fill: string; stroke: string; sw: number; shadow: string }> = {
  n: { size: 72, font: POP, fill: '#fff', stroke: '#141414', sw: 14, shadow: `6px 6px 0 ${PINK}` },
  c: { size: 90, font: POP, fill: '#fff', stroke: '#141414', sw: 16, shadow: `7px 7px 0 ${PINK}, -3px -3px 0 ${GOLD}` },
  q: { size: 60, font: POP, fill: '#fff', stroke: '#202020', sw: 10, shadow: '0 0 18px rgba(0,0,0,0.6)' },
  f: { size: 80, font: POP, fill: '#ffd3ea', stroke: '#8a0040', sw: 14, shadow: '6px 6px 0 #fff' },
  g: { size: 86, font: GLITCH, fill: RED, stroke: '#000', sw: 12, shadow: `5px 0 0 ${CYAN}, -5px 0 0 #ff00aa` },
  k: { size: 96, font: POP, fill: PINK, stroke: '#fff', sw: 0, shadow: '3px 3px 0 rgba(0,0,0,0.12)' },
  r: { size: 56, font: POP, fill: '#f3e9ff', stroke: '#2a0a4a', sw: 10, shadow: `0 0 16px ${LAV}, 0 0 30px #7a3cff` },
  s: { size: 140, font: GLITCH, fill: '#fff', stroke: '#000', sw: 16, shadow: `8px 0 0 ${PINK}, -8px 0 0 ${CYAN}` },
};
const WHO: Record<string, string> = { 私: 'girl', 君: 'boy', 俺: 'boy', 王子: 'prince' };
const WHOCOL: Record<string, string> = { girl: PINK, boy: GOLD, prince: LAV };

export const LyricLine: React.FC<{ line: Line; t: number; frame: number; narrow?: boolean }> = ({ line, t, frame, narrow }) => {
  const toks = parse(line.text);
  const st = KIND[line.kind];
  const n = units(toks);
  const maxW = narrow ? (line.kind === 'k' ? 820 : 980) : line.kind === 's' ? 1700 : line.kind === 'k' ? 1300 : 1780;
  const size = Math.min(st.size, maxW / (n * 1.02));
  const dur = line.e - line.t;
  const stagger = Math.min(line.kind === 's' ? 0.05 : 0.04, (dur * 0.45) / Math.max(1, n));
  const out = clamp((line.e - t) / 0.18);
  const lt = t - line.t;
  let idx = 0;
  const shakeAmt = line.kind === 's' ? 9 : line.kind === 'g' ? 5 : 0;
  const beat = line.kind === 'c' ? 1 + 0.04 * env('onset', frame) : 1;
  const sScale = line.kind === 's' ? lerp(0.92, 1.12, clamp(lt / dur)) : 1;
  const hiCol = line.kind === 'g' ? '#fff' : line.kind === 'k' ? GOLD : line.kind === 'r' ? '#ffd23f' : GOLD;

  const charEl = (ch: string, i: number, extra?: React.CSSProperties) => {
    const at = i * stagger;
    const p = clamp((lt - at) / 0.13);
    const sc = line.kind === 'q' || line.kind === 'r' ? lerp(1.15, 1, easeOut(p)) : lerp(1.9, 1, backOut(p));
    const jx = shakeAmt ? (random(`jx${i}-${frame}`) - 0.5) * shakeAmt : 0, jy = shakeAmt ? (random(`jy${i}-${frame}`) - 0.5) * shakeAmt : 0;
    return <span key={i} style={{ display: 'inline-block', opacity: p, transform: `translate(${jx}px,${jy}px) scale(${sc})`, whiteSpace: 'pre', ...(SYM.test(ch) ? SYMST : {}), ...extra }}>{ch}</span>;
  };

  const nodes: React.ReactNode[] = [];
  toks.forEach((tk, ti) => {
    if (tk.k === 't') {
      [...tk.v].forEach((ch) => { nodes.push(charEl(ch, idx)); idx++; });
    } else if (tk.k === 'h') {
      const startIdx = idx;
      const chars = [...tk.v].map((ch) => { const el = charEl(ch, idx, { color: hiCol }); idx++; return el; });
      const hp = clamp((lt - startIdx * stagger) / 0.2);
      nodes.push(<span key={`h${ti}`} style={{ display: 'inline-block', transform: `rotate(${lerp(-8, ti % 2 ? 2 : -2, easeOut(hp))}deg)` }}>{chars}</span>);
    } else if (tk.k === 'p') {
      const [word, forced] = tk.v.split('@');
      const who = forced || WHO[word] || 'girl';
      const at = idx * stagger;
      const p = clamp((lt - at) / 0.2);
      nodes.push(
        <span key={`p${ti}`} style={{ position: 'relative', display: 'inline-block', fontSize: '1.3em', lineHeight: 1, verticalAlign: '-0.08em', margin: '0 0.04em', opacity: clamp(p * 2), transform: `scale(${lerp(2.2, 1, backOut(p))}) rotate(${Math.sin(t * 5 + ti) * 6}deg)` }}>
          <span style={{ color: '#111', WebkitTextStroke: `${Math.max(14, st.sw * 1.6)}px #111`, paintOrder: 'stroke fill', textShadow: `5px 5px 0 ${WHOCOL[who]}` }}>{word}</span>
          <span style={{ position: 'absolute', left: 0, top: 0, color: '#fff', WebkitTextStroke: `${Math.max(7, st.sw * 0.8)}px #fff`, paintOrder: 'stroke fill', textShadow: 'none' }}>{word}</span>
          <span style={{ position: 'absolute', left: 0, top: 0, color: 'transparent', backgroundImage: `url(${staticFile(`cs/face-${who}.jpg`)})`, backgroundSize: '115% auto', backgroundPosition: '50% 40%', WebkitBackgroundClip: 'text', backgroundClip: 'text', textShadow: 'none', WebkitTextStroke: '0px' }}>{word}</span>
        </span>,
      );
      idx++;
    } else if (tk.k === 'm') {
      const at = idx * stagger;
      const mt = at + Math.min(0.55, Math.max(0.28, dur * 0.18));
      const p1 = clamp((lt - at) / 0.13);
      const mp = clamp((lt - mt) / 0.12);
      const flash = clamp(1 - Math.abs(lt - mt) / 0.12);
      const toCol = line.kind === 'g' || line.kind === 's' ? '#fff' : line.kind === 'k' ? NAVY : GOLD;
      nodes.push(
        <span key={`m${ti}`} style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ display: 'inline-block', opacity: p1 * clamp(1 - mp * 2), transform: `scale(${lerp(1.6, 1, backOut(p1)) * lerp(1, 0.4, mp)})`, filter: flash ? `blur(${flash * 3}px)` : undefined, fontSize: '0.75em', whiteSpace: 'nowrap', position: mp >= 1 ? 'absolute' : 'relative', left: 0, top: 0 }}>{tk.v}</span>
          <span style={{ display: 'inline-block', opacity: mp, color: toCol, transform: `scale(${lerp(2.4, 1, backOut(mp))}) rotate(${lerp(-25, 0, easeOut(mp))}deg)`, whiteSpace: 'nowrap', position: mp >= 1 ? 'relative' : 'absolute', left: 0, top: 0, textShadow: line.kind === 'k' ? 'none' : `0 0 ${18 * flash}px #fff, ${st.shadow}` }}>{mathText(tk.w || '', line.kind === 's' || line.kind === 'g' ? RED : PINK)}</span>
        </span>,
      );
      idx += Math.max([...tk.v].length * 0.75, 1);
    } else {
      const Ic = ICONS[tk.v];
      const at = idx * stagger;
      const p = clamp((lt - at) / 0.25);
      const bob = Math.sin((t + ti) * 7) * 6;
      nodes.push(
        <span key={`i${ti}`} style={{ display: 'inline-block', width: size * 1.15, height: size * 1.15, verticalAlign: 'middle', margin: '0 4px', transform: `translateY(${bob - size * 0.08}px) scale(${backOut(p)}) rotate(${lerp(-90, Math.sin(t * 4 + ti) * 10, easeOut(p))}deg)`, filter: 'drop-shadow(4px 4px 0 rgba(0,0,0,0.45))' }}>
          {Ic ? <Ic p={clamp((lt - at) / 0.9)} /> : null}
        </span>,
      );
      idx += 1.2;
    }
  });

  if (line.kind === 'k') {
    const pin = backOut(clamp(lt / 0.25));
    const tilt = Math.sin(t * 2) * 1.5;
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: narrow ? 330 : 34, display: 'flex', justifyContent: 'center', opacity: out, transform: `translateY(${(1 - pin) * 220}px) rotate(${tilt - 1.5}deg) scale(${1 + 0.03 * env('onset', frame)})` }}>
        <div style={{ position: 'relative', background: '#fdfdfb', backgroundImage: `linear-gradient(${GRIDB}55 2px, transparent 2px), linear-gradient(90deg, ${GRIDB}55 2px, transparent 2px)`, backgroundSize: '36px 36px', border: '6px solid #111', borderRadius: 14, padding: narrow ? '22px 30px 14px 84px' : '26px 60px 18px 90px', minWidth: narrow ? 900 : 1180, boxShadow: '12px 14px 0 rgba(0,0,0,0.4)' }}>
          {Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ position: 'absolute', left: 22, top: 22 + i * 34, width: 44, height: 18, borderRadius: 10, border: '5px solid #777', background: '#ddd' }} />)}
          <div style={{ position: 'absolute', right: 24, top: 10, fontFamily: CHALK, fontSize: 26, color: '#c0306a' }}>No.{line.t < 100 ? 1 : line.t < 160 ? 2 : 3}  Date ・ ・</div>
          <div style={{ position: 'absolute', left: 80, top: 0, bottom: 0, width: 4, background: '#ff8fb8' }} />
          <div style={{ fontFamily: POP, fontSize: size, color: st.fill, lineHeight: 1.2, whiteSpace: 'nowrap', textAlign: 'center', WebkitTextStroke: '0px', textShadow: st.shadow }}>{nodes}</div>
        </div>
      </div>
    );
  }
  const isCenter = line.kind === 's';
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, ...(narrow ? { bottom: 360 } : isCenter ? { bottom: 70 } : { bottom: 58 }), textAlign: 'center',
      fontFamily: st.font, fontSize: size, color: st.fill, lineHeight: 1.25, WebkitTextStroke: `${st.sw * (size / st.size)}px ${st.stroke}`, paintOrder: 'stroke fill', textShadow: st.shadow,
      opacity: out, transform: `translateY(${(1 - out) * -20}px) scale(${beat * sScale}) rotate(${line.kind === 'c' ? -1.5 : line.kind === 'r' ? 1 : 0}deg)`, padding: '0 40px',
    }}>{nodes}</div>
  );
};

// ---------- section overlays ----------
export const Overlays: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const o = env('onset', frame), b = env('bass', frame);
  const n: React.ReactNode[] = [];
  const k = (key: string, el: React.ReactNode) => n.push(<React.Fragment key={key}>{el}</React.Fragment>);

  // intro: chalkboard
  if (vis(t, 1.2, 12.6)) {
    const fo = fadeIO(t, 1.2, 12.6, 0.3);
    const p = clamp((t - 2.6) / 1.6);
    const inZoom = t >= 7.2;
    k('board', <div style={{ position: 'absolute', left: inZoom ? 960 : 960, top: inZoom ? 300 : 230, transform: `translate(-50%,-50%) scale(${inZoom ? 1.35 : 1})`, opacity: fo, fontFamily: CHALK, fontSize: 96, color: CHALKW, whiteSpace: 'nowrap', clipPath: `inset(0 ${100 - p * 100}% 0 0)`, textShadow: '0 0 10px rgba(255,255,255,0.4)' }}>ベクトル × 三角関数</div>);
    if (t > 7.6) {
      const q = clamp((t - 7.6) / 0.8);
      k('v1', <div style={{ opacity: fo }}><Vec x={640} y={760} len={520} ang={0} color={GOLD} p={q} label="君⃗" who="boy" /></div>);
      k('v2', <div style={{ opacity: fo }}><Vec x={640} y={760} len={460} ang={50} color={PINK} p={clamp((t - 8.2) / 0.8)} label="私⃗" who="girl" /></div>);
      if (t > 9.2) k('th', <div style={{ opacity: fo * clamp((t - 9.2) / 0.4) }}><Arc x={640} y={760} r={150} a0={0} a1={50} color="#fff" /><Txt x={830} y={690} size={64} font={CHALK} color="#fff">θ</Txt></div>);
      if (t > 10.2) k('cos', <Txt x={1350} y={620} size={120} font={CHALK} color={PINK} stroke="#fff" sw={4} scale={pop(t, 10.2, 0.3)} op={fo}>cos θ = ?</Txt>);
    }
  }
  // title card
  if (vis(t, 12.6, 23.1)) {
    const p = clamp((t - 13.0) / 1.2);
    const fo = fadeIO(t, 12.6, 23.1, 0.4);
    k('title', <div style={{ position: 'absolute', left: 1180, top: 210, width: 760, textAlign: 'center', opacity: fo }}>
      <div style={{ fontFamily: CHALK, fontSize: 160, whiteSpace: 'nowrap', color: CHALKW, clipPath: `inset(0 ${100 - p * 100}% 0 0)`, textShadow: '0 0 10px rgba(255,255,255,0.4)', transform: `scale(${1 + 0.05 * o})` }}>Cosine</div>
      <div style={{ fontFamily: POP, fontSize: 50, color: '#fff', marginTop: 16, opacity: clamp((t - 14.4) / 0.6), WebkitTextStroke: '10px #143428', paintOrder: 'stroke fill', whiteSpace: 'nowrap' }}>〜<span style={{ color: PINK }}>私</span>・<span style={{ color: GOLD }}>君</span>＝好きの最大値!?〜</div>
      <div style={{ fontFamily: POP, fontSize: 30, color: GOLD, marginTop: 30, opacity: clamp((t - 15.4) / 0.6) }}>ただいま正気を失い中</div>
      <div style={{ fontFamily: POP, fontSize: 26, color: '#cfe9dc', marginTop: 14, opacity: clamp((t - 16.4) / 0.6) }}>― 「Squared」アンサーソング ―</div>
    </div>);
    const eqs = ['私⃗・君⃗ = |私⃗||君⃗| cos θ', 'θ = ?', '∥ or ⊥ ?'];
    eqs.forEach((e, i) => { const at = 17.5 + i * 1.8; if (t > at) k(`eq${i}`, <div style={{ opacity: fo * clamp((t - at) / 0.5) }}><Pen dark x={1560 + (i % 2 ? 120 : -100)} y={700 + i * 90} size={44} text={e} rot={i % 2 ? 4 : -4} /></div>); });
  }
  // verse 1
  if (vis(t, 23.4, 26.1)) k('aka', <Stamp t={t} at={24.4} x={1500} y={260} text="赤点" size={130} rot={-10} />);
  if (vis(t, 26.6, 28.8)) k('ufo', <Stamp t={t} at={27.0} x={430} y={250} text="解読不能" size={90} color={LAV} rot={8} />);
  if (vis(t, 28.86, 32.0)) {
    const c = t < 30.4 ? 1 : t < 31.0 ? 2 : 3;
    k('cnt', <div style={{ position: 'absolute', left: 1500, top: 170, transform: 'translate(-50%,-50%)', background: '#111', border: `6px solid ${PINK}`, borderRadius: 16, padding: '8px 26px', textAlign: 'center' }}>
      <div style={{ fontFamily: POP, fontSize: 28, color: '#fff' }}>名前を聞かれた回数</div>
      <div style={{ fontFamily: BANG, fontSize: 110, color: PINK, transform: `scale(${pop(t, [28.86, 30.4, 31.0][c - 1], 0.2)})` }}>{c}回目</div>
    </div>);
  }
  if (vis(t, 32.0, 34.8)) k('half', <Txt x={560} y={240} size={120} font={BANG} color={GOLD} stroke="#111" sw={10} scale={pop(t, 32.4)} rot={-8}>180日!?</Txt>);
  if (vis(t, 34.84, 46.3)) {
    const fo = fadeIO(t, 34.84, 46.3, 0.3);
    if (t > 36.6) k('pb', <div style={{ opacity: fo }}><FaceBadge who="girl" x={760} y={150} size={130} p={clamp((t - 36.8) / 0.3)} ring={PINK} /><FaceBadge who="prince" x={1160} y={150} size={130} p={clamp((t - 37.4) / 0.3)} ring={LAV} /></div>);
    if (t > 38.4) {
      const q = clamp((t - 38.4) / 1.2);
      k('pl', <div style={{ opacity: fo }}><Vec x={300} y={330} len={1300} ang={0} color={PINK} p={q} w={14} who="girl" R={50} /><Vec x={300} y={420} len={1300} ang={0} color={LAV} p={clamp((t - 38.8) / 1.2)} w={14} who="prince" R={50} /></div>);
    }
    if (t > 40.6) k('par', <Txt x={960} y={380} size={240} font={BANG} color="#fff" stroke="#111" sw={12} scale={pop(t, 40.6, 0.3) * (1 + 0.05 * o)} op={fo}>∥</Txt>);
    if (t > 43.0) k('nocross', <Stamp t={t} at={43.2} x={1500} y={560} text="交点：なし" size={80} color={NAVY} rot={-6} />);
  }
  if (vis(t, 47.14, 56.7)) {
    const fo = fadeIO(t, 47.14, 56.7, 0.3);
    k('mag', <div style={{ opacity: fo * clamp((t - 47.6) / 0.4) }}><Pen x={960} y={120} size={64} text="|私⃗| = |王子⃗|　向き：そろってる" /></div>);
    [53.2, 54.8].forEach((a, i) => { if (t > a) k(`pp${i}`, <Txt x={[640, 1280][i]} y={400} size={260} font={BANG} color={i ? LAV : PINK} stroke="#111" sw={12} scale={lerp(3, 1, pop(t, a, 0.2))} op={fo} rot={i ? 8 : -8}>∥</Txt>); });
  }
  // chorus 1
  if (vis(t, 56.94, 74.1)) {
    k('rays', <Rays frame={frame} />);
    if (vis(t, 56.94, 62.3) || vis(t, 68.28, 70.7)) {
      const ang = (t * 520) % 360;
      k('spin', <Vec x={960} y={400} len={300} ang={ang} color={PINK} w={22} label="?" who="girl" />);
    }
    if (vis(t, 62.34, 65.2)) {
      k('diag', <Vec x={560} y={480} len={760} ang={20} color={PINK} w={20} p={clamp((t - 62.4) / 0.6)} who="girl" />);
      const labs: [number, string, number, number][] = [[62.4, '始点', 520, 560], [63.0, '終点', 1300, 180], [63.6, '大きさ |a⃗|', 960, 260], [64.2, '向き θ', 820, 520]];
      labs.forEach(([a, s, x, y], i) => { if (t > a) k(`lab${i}`, <Txt x={x} y={y} size={64} color="#fff" stroke="#111" sw={10} scale={pop(t, a)}>{s}</Txt>); });
    }
    if (vis(t, 65.4, 68.2)) k('sub', <Stamp t={t} at={65.8} x={1450} y={300} text="数B" size={150} color={GOLD} rot={-8} font={POP} />);
    if (vis(t, 70.74, 74.1)) k('dot', <Txt x={960} y={330} size={150} color="#fff" stroke="#111" sw={12} scale={pop(t, 71.0, 0.3) * (1 + 0.05 * o)}>私⃗ ・ 君⃗ ＝ <span style={{ color: PINK }}>？</span></Txt>);
  }
  // rap: neon formula
  if (vis(t, 74.34, 85.7)) {
    const fo = fadeIO(t, 74.34, 85.7, 0.3);
    const neon = (c: string) => `0 0 10px ${c}, 0 0 26px ${c}`;
    if (t > 76.04) {
      const p = clamp((t - 76.2) / 1.6);
      k('f', <div style={{ position: 'absolute', left: 760, top: 150, transform: 'translate(-50%,-50%)', opacity: fo, fontFamily: POP, fontSize: 70, color: '#fff', textShadow: neon(LAV), clipPath: `inset(0 ${100 - p * 100}% 0 0)`, whiteSpace: 'nowrap' }}>{vx('a⃗ ・ b⃗ ＝ |a⃗| |b⃗| cos θ')}</div>);
    }
    const demo = (th: number, at: number, txt: string, col: string) => {
      const q = clamp((t - at) / 0.5);
      k(`d${at}`, <div style={{ opacity: fo }}>
        <Vec x={1300} y={560} len={300} ang={0} color={GOLD} w={12} p={q} who="boy" R={46} />
        <Vec x={1300} y={560} len={260} ang={th} color={PINK} w={12} p={q} who="girl" R={46} />
        <Txt x={1450} y={680} size={60} color={col} stroke="#111" sw={8} scale={pop(t, at + 0.2)} glow={neon(col)}>{txt}</Txt>
      </div>);
    };
    if (vis(t, 78.86, 80.44)) demo(0, 78.9, 'θ＝0° → ＋最大', GOLD);
    if (vis(t, 80.44, 81.5)) demo(90, 80.5, 'θ＝90° → 0', '#fff');
    if (vis(t, 81.5, 82.44)) demo(180, 81.5, 'θ＝180° → −', RED);
    if (vis(t, 82.44, 85.7)) k('zero', <Txt x={1400} y={420} size={130} color="#fff" stroke="#2a0a4a" sw={10} scale={pop(t, 83.6, 0.3)} glow={neon(PINK)} op={fo}>好き ＝ 0 ？</Txt>);
  }
  // verse 2
  if (vis(t, 89.62, 92.3)) {
    const p = clamp((t - 89.8) / 1.0);
    k('euler', <div style={{ position: 'absolute', left: 960, top: 200, transform: `translate(-50%,-50%) scale(${1 + 0.04 * o})`, fontFamily: POP, fontSize: 150, color: '#fff', textShadow: `0 0 30px ${GOLD}, 0 0 60px ${PINK}`, clipPath: `inset(0 ${100 - p * 100}% 0 0)`, whiteSpace: 'nowrap', WebkitTextStroke: '4px #8a4a00', paintOrder: 'stroke fill' }}>e<sup style={{ fontSize: 80 }}>iπ</sup> + 1 = 0</div>);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + t; k(`gem${i}`, <Txt x={960 + Math.cos(a) * 520} y={200 + Math.sin(a) * 150} size={56} color={i % 2 ? GOLD : CYAN} op={p}>◆</Txt>); }
  }
  if (vis(t, 92.6, 94.4)) k('zurui', <Stamp t={t} at={93.4} x={1480} y={240} text="ズルい" size={110} color={PINK} rot={10} />);
  if (vis(t, 97.38, 100.3)) k('yoko', <div><FaceBadge who="boy" x={1600} y={200} size={180} p={clamp((t - 97.6) / 0.3)} ring={GOLD} /><Txt x={1600} y={330} size={46} color={PINK} stroke="#fff" sw={8}>♡ 観測中</Txt></div>);
  if (vis(t, 100.44, 102.6)) k('cos0', <Txt x={1300} y={240} size={140} font={POP} color={GOLD} stroke="#111" sw={10} scale={pop(t, 100.7, 0.3)} rot={-6}>cos 0° = 1</Txt>);
  if (vis(t, 102.66, 107.4)) {
    k('thq', <Txt x={560} y={260} size={240} font={BANG} color="#fff" stroke="#111" sw={12} scale={pop(t, 103.0, 0.3)} rot={Math.sin(t * 3) * 8}>θ = ?</Txt>);
    if (t > 104.6) k('err', <div style={{ position: 'absolute', left: 1320, top: 300, transform: `translate(-50%,-50%) scale(${pop(t, 104.6, 0.2)})`, width: 720, background: '#e9e9ee', border: '5px solid #111', borderRadius: 10, boxShadow: '12px 12px 0 rgba(0,0,0,0.5)' }}>
      <div style={{ background: PINK, color: '#fff', fontFamily: BANG, fontSize: 42, padding: '6px 18px', letterSpacing: 3 }}>CALC ERROR</div>
      <div style={{ fontFamily: POP, fontSize: 44, color: '#111', lineHeight: 1.3, padding: '20px 28px' }}>ドキドキで<br />角度が測れません</div>
    </div>);
  }
  // pre 2: root 3 & triangle
  if (vis(t, 108.0, 118.9)) {
    const fo = fadeIO(t, 108.0, 118.9, 0.4);
    k('r3', <Ticker t={t} t0={108} rows={['√3 = 1.7320508075688772', 'ひとなみにおごれや', '1.7320508075688772935', '√3 √3 √3 √3']} color="#ffd3ea" op={0.45 * fo} />);
    if (t > 113.84) {
      const q = clamp((t - 113.9) / 0.8);
      const x0 = 1400, y0 = 760, s = 210;
      k('tri', <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: fo }}>
        <path d={`M${x0} ${y0} L${x0 + s * 1.732} ${y0} L${x0} ${y0 - s} Z`} fill="rgba(255,255,255,0.85)" stroke="#111" strokeWidth={8} strokeDasharray={2400} strokeDashoffset={2400 * (1 - q)} />
        <path d={`M${x0} ${y0 - 34} h34 v34`} fill="none" stroke="#111" strokeWidth={5} />
        <text x={x0 - 40} y={y0 - s / 2} fontFamily={BANG} fontSize={72} fill={NAVY} textAnchor="middle">1</text>
        <text x={x0 + s * 0.866} y={y0 + 70} fontFamily={BANG} fontSize={72} fill={NAVY} textAnchor="middle">√3</text>
        <text x={x0 + s * 0.95} y={y0 - s * 0.62} fontFamily={BANG} fontSize={96 * (1 + 0.15 * o)} fill={PINK} stroke="#fff" strokeWidth={6} paintOrder="stroke" textAnchor="middle">2 ♡</text>
      </svg>);
    }
  }
  // chorus 2
  if (vis(t, 119.06, 136.0)) {
    k('rays2', <Rays frame={frame} color={PINK} color2={GOLD} />);
    if (vis(t, 124.52, 126.8)) {
      const x0 = 1120, y0 = 700, L = 520, a = 35;
      const ex = Math.cos((a * Math.PI) / 180) * L, ey = Math.sin((a * Math.PI) / 180) * L;
      k('comp', <div>
        <Vec x={x0} y={y0} len={L} ang={a} color={PINK} p={clamp((t - 124.6) / 0.4)} label="私⃗" who="girl" />
        <Vec x={x0} y={y0} len={ex} ang={0} color={CYAN} w={10} dash p={clamp((t - 124.9) / 0.4)} />
        <Vec x={x0 + ex} y={y0} len={ey} ang={90} color={CYAN} w={10} dash p={clamp((t - 125.6) / 0.4)} />
        {t > 125.2 && <Txt x={x0 + ex / 2} y={y0 + 60} size={54} color="#fff" stroke="#111" sw={8}>x成分 = 君</Txt>}
        {t > 125.9 && <Txt x={x0 + ex + 170} y={y0 - ey / 2} size={54} color="#fff" stroke="#111" sw={8}>y成分 = 君</Txt>}
      </div>);
    }
    if (vis(t, 126.84, 130.3)) {
      for (let i = 0; i < 8; i++) { const at = 127 + i * 0.12; if (t > at) k(`fb${i}`, <FaceBadge who="boy" x={220 + i * 210} y={190 + (i % 2) * 90} size={140} p={clamp((t - at) / 0.25)} ring={GOLD} rot={(random(`bb${i}`) - 0.5) * 30} />); }
    }
    if (vis(t, 132.66, 136.0)) k('memo', <Stamp t={t} at={133.0} x={1450} y={300} text="✔ 暗記済み" size={110} color="#2fbf5a" rot={-8} />);
  }
  if (vis(t, 136.06, 140.8)) k('neq', <Pen x={960} y={300} size={130} text={<span>公式 <span style={{ color: PINK }}>≠</span> 気持ち</span>} op={clamp((t - 136.6) / 0.6)} />);
  // female rap: flip
  if (vis(t, 141.66, 144.0)) k('kimo', <div style={{ position: 'absolute', left: 1240, top: 170, transform: `scale(${pop(t, 141.9, 0.25)}) rotate(6deg)`, background: '#fff', border: '7px solid #111', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', padding: '24px 46px', fontFamily: POP, fontSize: 86, color: '#888' }}>キモ〜い！<span style={{ fontSize: 40 }}>（前回）</span></div>);
  if (vis(t, 144.04, 146.4)) {
    k('m1', <Txt x={960} y={280} size={250} font={BANG} color={GOLD} stroke="#111" sw={12} scale={lerp(3, 1, pop(t, 144.1, 0.2)) * (1 + 0.06 * o)} rot={-6}>×(−1)</Txt>);
    if (t > 145.08) { const q = easeInOut((t - 145.08) / 0.6); k('flipv', <Vec x={960} y={560} len={360} ang={lerp(180, 0, q)} color={PINK} w={22} label="−a⃗" who="girl-blush" />); }
  }
  if (vis(t, 146.44, 151.0)) {
    k('ichizu', <Stamp t={t} at={146.9} x={560} y={260} text="一途" size={150} color={PINK} rot={-10} />);
    if (t > 147.96) k('ich2', <Txt x={1420} y={300} size={180} color={PINK} stroke="#fff" sw={14} scale={lerp(3, 1, pop(t, 148.8, 0.25)) * (1 + 0.06 * o)} rot={8} glow="8px 8px 0 #111">一途{supify('²', GOLD)}</Txt>);
  }
  if (vis(t, 151.06, 153.4)) {
    const q = easeInOut((t - 151.1) / 0.8);
    k('card', <div style={{ position: 'absolute', left: 960, top: 300, transform: `translate(-50%,-50%) perspective(900px) rotateY(${lerp(0, 180, q)}deg)`, width: 640, height: 240 }}>
      <div style={{ position: 'absolute', inset: 0, background: '#444', border: '8px solid #111', borderRadius: 20, fontFamily: POP, fontSize: 100, color: '#bbb', textAlign: 'center', lineHeight: '224px', backfaceVisibility: 'hidden' }}>キモい</div>
      <div style={{ position: 'absolute', inset: 0, background: PINK, border: '8px solid #111', borderRadius: 20, fontFamily: POP, fontSize: 100, color: '#fff', textAlign: 'center', lineHeight: '224px', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>一途 ♡</div>
    </div>);
  }
  // breakdown: orthogonal
  if (vis(t, 153.54, 156.8)) {
    for (let i = 0; i < 20; i++) {
      const x = random(`rx${i}`) * W, sp = 500 + random(`rs${i}`) * 700;
      const y = -200 + (((t - 153.54) * sp + random(`ry${i}`) * 1300) % 1400);
      k(`pr${i}`, <Txt x={x} y={y} size={110 + random(`rz${i}`) * 140} font={GLITCH} color={i % 3 ? RED : '#fff'} stroke="#000" sw={6} op={0.85}>⊥</Txt>);
    }
    if (t > 155.04) k('90', <Txt x={1440} y={260} size={300} font={BANG} color="#fff" stroke="#000" sw={14} scale={lerp(2.4, 1, pop(t, 155.2, 0.2))} glow={`10px 0 0 ${RED}, -10px 0 0 ${CYAN}`}>90°</Txt>);
  }
  if (vis(t, 156.81, 157.5)) k('flash', <AbsoluteFill style={{ background: '#fff', opacity: clamp((t - 157.1) / 0.4) }} />);
  if (vis(t, 157.5, 160.0)) {
    k('ortho', <Txt x={960} y={180} size={130} font={POP} color="#fff" stroke="#000" sw={12} scale={pop(t, 157.7, 0.3)} glow={`6px 0 0 ${RED}, -6px 0 0 ${CYAN}`}>∥ じゃなくて ⊥ だった！</Txt>);
    if (t > 158.1) k('dot0', <Txt x={1500} y={780} size={110} font={BANG} color={LAV} stroke="#fff" sw={8} scale={pop(t, 158.3, 0.25)}>私⃗・王子⃗ = 0</Txt>);
  }
  if (vis(t, 160.06, 162.5)) k('sakkaku', <Stamp t={t} at={160.4} x={1350} y={300} text="錯覚" size={170} color={RED} rot={-8} />);
  // bridge: constellation
  if (vis(t, 162.7, 179.3)) {
    const fo = fadeIO(t, 162.7, 179.3, 0.6);
    const pts = Array.from({ length: 9 }).map((_, i) => [260 + random(`cx${i}`) * 1400, 90 + random(`cy${i}`) * 330]);
    const p = clamp((t - 165.0) / 6);
    k('const', <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: fo }}>
      {pts.slice(1).map((q, i) => { const a = pts[i]; const seg = clamp(p * 8 - i); return <line key={i} x1={a[0]} y1={a[1]} x2={lerp(a[0], q[0], seg)} y2={lerp(a[1], q[1], seg)} stroke="#fff6c8" strokeWidth={3} opacity={0.8} style={{ filter: 'drop-shadow(0 0 6px #ffd23f)' }} />; })}
      {pts.map((a, i) => <circle key={i} cx={a[0]} cy={a[1]} r={7 + 3 * Math.sin(t * 3 + i)} fill="#fff" style={{ filter: 'drop-shadow(0 0 10px #ffd23f)' }} />)}
    </svg>);
    if (t > 172.92) { k('jumon', <Pen dark x={520} y={160} size={58} text="∮ ∇ ∑ ∂ … (呪文)" op={fadeIO(t, 172.92, 175.5, 0.3)} />); }
    if (t > 174.3 && t < 175.5) k('ango', <Pen dark x={1400} y={200} size={58} text="a⃗・b⃗ ?! (暗号)" />);
    if (t > 175.52) k('shi', <Pen dark x={960} y={140} size={64} color="#ffe9a8" text="a⃗ と b⃗ が　同じ向きを向くとき ――（詩）" op={clamp((t - 175.8) / 0.8) * fo} />);
  }
  if (vis(t, 179.4, 182.5)) k('name', <div style={{ position: 'absolute', left: 1100, top: 150, transform: `scale(${pop(t, 179.6, 0.25)}) rotate(-4deg)`, background: '#fff', border: '6px solid #111', borderRadius: 30, padding: '18px 36px', fontFamily: POP, fontSize: 60, color: PINK }}>私の名前、覚えてるでしょ？</div>);
  if (vis(t, 182.56, 184.9)) k('shitteta', <Stamp t={t} at={183.4} x={500} y={220} text="知ってたよ" size={100} color={GOLD} rot={-8} />);
  if (vis(t, 184.94, 190.5)) {
    const q = clamp((t - 185.4) / 1.4);
    k('nb', <div>
      <Vec x={620} y={880} len={560} ang={12} color={GOLD} w={14} p={q} />
      {t > 187.2 && <Txt x={1230} y={740} size={110} font={CHALK} color={PINK} scale={pop(t, 187.4, 0.4)} rot={-8} glow="0 0 12px #fff">♡</Txt>}
    </div>);
  }
  // final chorus
  if (vis(t, 190.62, 213.7)) k('rays3', <Rays frame={frame} color={PINK} color2={GOLD} op={0.32} />);
  if (vis(t, 190.62, 194.3)) {
    const q = easeInOut((t - 190.8) / 2.6);
    k('merge', <div>
      <Vec x={360} y={420} len={1200} ang={0} color={GOLD} w={22} p={clamp((t - 190.7) / 0.6)} label="君⃗" who="boy" R={70} />
      <Vec x={360} y={420} len={1020} ang={lerp(40, 0, q)} color={PINK} w={18} p={clamp((t - 191.0) / 0.6)} label="私⃗" who="girl" R={70} />
      {q > 0.98 && <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 39%, rgba(255,255,255,0.9), rgba(255,255,255,0) 45%)', opacity: clamp(1 - (t - 193.4) / 0.9) }} />}
    </div>);
  }
  if (vis(t, 194.32, 195.9)) k('th0', <Txt x={1400} y={250} size={110} font={BANG} color="#fff" stroke="#111" sw={10} scale={pop(t, 194.4, 0.25)}>θ=0 → cos θ = 1</Txt>);
  if (vis(t, 195.92, 200.3)) k('maxp', <Txt x={960} y={250} size={140} color={GOLD} stroke="#111" sw={12} scale={pop(t, 196.6, 0.3) * (1 + 0.05 * o)}>内積 ＝ |私⃗||君⃗| <span style={{ color: PINK }}>MAX</span></Txt>);
  if (vis(t, 200.32, 202.6)) k('nodiv', <div><Txt x={1450} y={300} size={260} font={BANG} color={RED} stroke="#fff" sw={10} scale={pop(t, 200.5, 0.2)}>÷</Txt><Txt x={1450} y={300} size={380} font={BANG} color="#111" stroke="#fff" sw={10} op={0.85} scale={pop(t, 201.1, 0.2)}>✗</Txt></div>);
  if (vis(t, 202.7, 206.1)) {
    const x0 = 1300, y0 = 640, s = 300;
    const q = clamp((t - 202.8) / 0.6);
    k('tri2', <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <path d={`M${x0} ${y0} L${x0 + s} ${y0} L${x0} ${y0 - s} Z`} fill="rgba(255,255,255,0.9)" stroke="#111" strokeWidth={8} strokeDasharray={2000} strokeDashoffset={2000 * (1 - q)} />
      <text x={x0 - 40} y={y0 - s / 2} fontFamily={BANG} fontSize={72} fill={PINK} textAnchor="middle">1</text>
      <text x={x0 + s / 2} y={y0 + 70} fontFamily={BANG} fontSize={72} fill={GOLD} textAnchor="middle">1</text>
      <text x={x0 + s * 0.68} y={y0 - s * 0.55} fontFamily={BANG} fontSize={80} fill={NAVY} textAnchor="middle">√2</text>
    </svg>);
    if (t > 204.44) k('r2', <Ticker t={t} t0={204.44} rows={['√2 = 1.41421356', 'ひとよひとよにひとみごろ']} color={GOLD} op={0.6} />);
  }
  if (vis(t, 206.22, 208.6)) k('qed', <Stamp t={t} at={206.4} x={960} y={300} text="Q.E.D. ∎" size={170} color={GOLD} rot={-6} font={BANG} />);
  if (vis(t, 208.62, 213.7)) k('namae', <Pen x={1350} y={230} size={84} color={PINK} text="次は名前で ♡" op={clamp((t - 209.2) / 0.6)} rot={-4} />);
  // outro
  if (vis(t, 214.92, 220.0)) {
    k('ore', <div style={{ opacity: fadeIO(t, 214.92, 220.0, 0.3) }}>
      <Pen dark x={700} y={240} size={110} text={<span>俺 × 君 = 好き{supify('²', PINK)}</span>} />
      <Txt x={700} y={240} size={300} font={BANG} color={RED} stroke="#fff" sw={10} op={0.85} scale={pop(t, 217.0, 0.2)}>✗</Txt>
    </div>);
  }
  if (vis(t, 220.08, 221.8)) k('iiyo', <Txt x={700} y={240} size={90} color={PINK} stroke="#fff" sw={10} scale={pop(t, 220.3, 0.3)}>ならなくていいよ</Txt>);
  if (vis(t, 221.86, 226.0)) k('aa', <div style={{ opacity: fadeIO(t, 221.86, 226.0, 0.3) }}>
    <Pen dark x={760} y={220} size={110} text={<span>a⃗・a⃗ = |a⃗|{supify('²', GOLD)}</span>} op={clamp((t - 222.6) / 0.6)} />
    {t > 223.6 && <Txt x={760} y={360} size={56} color="#fff" stroke="#111" sw={8}>同じ向き・同じ長さなら ぴったり2乗</Txt>}
  </div>);
  if (vis(t, 226.08, 230.9)) k('dekai', <Txt x={960} y={300} size={360} font={BANG} color={GOLD} stroke="#111" sw={16} scale={lerp(0.3, 1.1, easeOut((t - 226.1) / 1.6)) * (1 + 0.06 * o)} glow={`12px 0 0 ${PINK}, -12px 0 0 ${CYAN}`}>MAX!!</Txt>);
  void b;
  return <>{n}</>;
};

// ---------- end card ----------
const EndCard: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  if (t < 231.0) return null;
  const p = clamp((t - 231.0) / 0.6);
  const o = env('onset', frame);
  return (
    <AbsoluteFill style={{ background: `rgba(18,46,36,${0.86 * p})`, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', opacity: p }}>
        <div style={{ fontFamily: BANG, fontSize: 200, color: GOLD, letterSpacing: 8, transform: `scale(${lerp(1.6, 1, easeOut(p)) * (1 + 0.03 * o)})`, WebkitTextStroke: '10px #111', paintOrder: 'stroke fill' }}>Q.E.D.</div>
        <div style={{ fontFamily: POP, fontSize: 84, color: '#fff', marginTop: -10, opacity: clamp((t - 231.6) / 0.4), WebkitTextStroke: '12px #111', paintOrder: 'stroke fill' }}>（<span style={{ color: PINK }}>両想い</span>）</div>
        <div style={{ fontFamily: CHALK, fontSize: 92, color: CHALKW, marginTop: 40, opacity: clamp((t - 232.2) / 0.5) }}>Cosine</div>
        <div style={{ fontFamily: POP, fontSize: 44, color: '#fff', opacity: clamp((t - 232.4) / 0.5) }}>〜私・君＝好きの最大値!?〜</div>
        <div style={{ fontFamily: POP, fontSize: 34, color: GOLD, marginTop: 22, opacity: clamp((t - 232.8) / 0.5) }}>ただいま正気を失い中</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- main ----------
export const Cosine: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const si = shotAt(t);
  const shot = SHOTS[si];
  const nextT = SHOTS[si + 1]?.t ?? 234.8;
  const fx = shot.fx || {};
  const acc = accent(t);
  const b = env('bass', frame);
  const sAmp = (fx.shake || 0) * (6 + 10 * b) + acc * 26;
  const sx = (random(`sx${frame}`) - 0.5) * sAmp, sy = (random(`sy${frame}`) - 0.5) * sAmp;
  const sinceCut = t - shot.t;
  const glitch = sinceCut < 0.17 && si > 0 && !fx.desat && !fx.tiltIn ? 1 - sinceCut / 0.17 : acc > 0.6 ? (acc - 0.6) * 2 : 0;
  const dark = DARK.has(shot.img) || shot.img === '04' || shot.img === 'thumb';
  const layer = <ImageLayer shot={shot} t={t} nextT={nextT} frame={frame} />;
  return (
    <AbsoluteFill style={{ background: '#f4f8ff', overflow: 'hidden' }}>
      <Audio src={staticFile('song.wav')} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        {layer}
        {glitch > 0 && [0, 1, 2].map((i) => {
          const y0 = random(`gy${i}-${frame}`) * 900, hgt = 60 + random(`gh${i}-${frame}`) * 160;
          const off = (random(`go${i}-${frame}`) - 0.5) * 160 * glitch;
          return <AbsoluteFill key={i} style={{ clipPath: `inset(${y0}px 0 ${Math.max(0, H - y0 - hgt)}px 0)`, transform: `translateX(${off}px)`, filter: i === 1 ? 'hue-rotate(90deg) saturate(2)' : undefined }}>{layer}</AbsoluteFill>;
        })}
        <Floaters t={t} op={t > 231 ? 0 : 1} dark={dark} />
        {(() => { const A = angleAt(t); return <MathNotes t={t} th={A.th} unknown={A.unknown} />; })()}
        <Overlays t={t} frame={frame} />
        <AbsoluteFill style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 62%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none' }} />
        <EndCard t={t} frame={frame} />
        <HUD t={t} frame={frame} />
        {LINES.filter((l) => t >= l.t && t < l.e).map((l) => <LyricLine key={l.t} line={l} t={t} frame={frame} />)}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: fx.tint === 'red' ? RED : '#fff', opacity: acc * 0.3, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ boxShadow: 'inset 0 0 220px rgba(0,0,0,0.45)' }} />
      <AbsoluteFill style={{ background: '#000', opacity: clamp((t - 234.0) / 0.8) }} />
    </AbsoluteFill>
  );
};
