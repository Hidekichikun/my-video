import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, interpolate, random, staticFile, useCurrentFrame, Easing } from 'remotion';
import { LINES, Line } from './lyrics';
import { ICONS } from './icons';
import ENV from './env.json';

export const FPS = 30;
export const DURATION = Math.round(220.0 * FPS);
const W = 1920, H = 1080;

const POP = 'Nikumaru';
const GLITCH = 'ToroGlitch, Nikumaru';
const BANG = 'Bangers, Nikumaru';
const CHALK = 'Permanent Marker, Nikumaru';
const PINK = '#ff2e88', GOLD = '#ffd23f', RED = '#ff2e2e', CYAN = '#3ff3ff', CHALKW = 'rgba(255,255,255,0.92)';

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const easeOut = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
const easeInOut = (p: number) => { p = clamp(p); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
const backOut = (p: number) => { p = clamp(p); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const env = (k: 'bass' | 'onset' | 'loud', f: number) => (ENV as any)[k][Math.max(0, Math.min((ENV as any)[k].length - 1, f))] as number;

// ---------- fonts ----------
const FONTS: [string, string][] = [['Nikumaru', 'NikumaruFont.otf'], ['ToroGlitch', 'ToroNoGlitchMinchoH3.otf'], ['Bangers', 'Bangers-Regular.ttf'], ['Permanent Marker', 'PermanentMarker-Regular.ttf']];
const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(FONTS.map(([n, f]) => { const ff = new FontFace(n, `url(${staticFile(f)})`); return ff.load().then((x) => { (document.fonts as any).add(x); }); }))
      .then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
  }, [h]);
};

// ---------- shots ----------
type FX = { shake?: number; pulse?: number; desat?: number; tint?: 'red'; spin?: number; mirror?: boolean; hue?: number; rot?: boolean };
type Shot = { t: number; img: string; a: [number, number, number]; b: [number, number, number]; fx?: FX };
const IMG: Record<string, string> = {
  '01': 'sq/squared-01-lecture.jpg', '02': 'sq/squared-02-eraser.jpg', '03': 'sq/squared-03-440hz.jpg', '04': 'sq/squared-04-calm-down.jpg',
  '05': 'sq/squared-05-chorus.jpg', '06': 'sq/squared-06-rap.jpg', '07': 'sq/squared-07-overflow.jpg', '08': 'sq/squared-08-kimoi.jpg',
  '09': 'sq/squared-09-sideways.jpg', '10': 'sq/squared-10-confession.jpg', '11': 'sq/squared-11-outro.jpg', thumb: 'sq/squared-thumb.jpg', end: 'sq/squared-01-lecture.jpg',
};
const S = (t: number, img: string, a: [number, number, number], b: [number, number, number], fx?: FX): Shot => ({ t, img, a, b, fx });
const SHOTS: Shot[] = [
  S(0, '01', [700, 520, 1.0], [620, 560, 1.12]),
  S(7.0, '01', [1250, 330, 1.25], [1250, 330, 1.38], { shake: 1 }),
  S(10.5, 'thumb', [960, 540, 1.0], [880, 540, 1.08], { pulse: 0.5 }),
  S(26.1, '02', [640, 200, 1.2], [640, 190, 1.5]),
  S(29.48, '02', [960, 540, 1.0], [1000, 520, 1.08], { pulse: 0.5 }),
  S(32.38, '02', [1280, 240, 1.55], [1280, 260, 1.38], { pulse: 0.7 }),
  S(35.16, '02', [960, 540, 1.08], [960, 540, 1.0], { pulse: 0.7 }),
  S(38.4, '03', [960, 500, 1.0], [1000, 480, 1.1], { pulse: 0.5 }),
  S(40.0, '03', [760, 260, 1.5], [760, 260, 1.62], { pulse: 0.5 }),
  S(43.28, '03', [1200, 340, 1.6], [1200, 360, 1.75], { pulse: 0.6 }),
  S(45.86, '03', [1360, 560, 1.9], [1340, 540, 1.6], { shake: 0.6, pulse: 1 }),
  S(48.7, '04', [960, 560, 1.0], [960, 520, 1.2], { spin: 3 }),
  S(52.36, '04', [980, 300, 1.5], [980, 300, 1.85], { spin: -6, shake: 0.4, pulse: 0.8 }),
  S(60.74, '05', [960, 540, 1.0], [960, 540, 1.06], { shake: 0.5, pulse: 1 }),
  S(63.48, '05', [960, 180, 1.6], [960, 180, 1.75], { pulse: 1 }),
  S(65.62, '05', [960, 540, 1.1], [960, 540, 1.35], { pulse: 1 }),
  S(68.48, '05', [1140, 340, 2.1], [1140, 340, 2.35], { shake: 1.5, tint: 'red', pulse: 1 }),
  S(71.48, '05', [960, 540, 1.0], [960, 500, 1.1], { pulse: 1 }),
  S(73.92, '05', [380, 520, 1.5], [1540, 520, 1.5], { pulse: 1 }),
  S(76.74, '05', [960, 200, 1.3], [960, 200, 1.5], { pulse: 1 }),
  S(79.36, '05', [960, 170, 2.2], [960, 170, 2.26], { desat: 1 }),
  S(82.9, '06', [1160, 340, 1.6], [1160, 340, 1.72], { pulse: 1 }),
  S(85.78, '06', [980, 460, 2.0], [980, 460, 2.25], { pulse: 1 }),
  S(88.68, '06', [960, 540, 1.05], [960, 540, 1.12], { pulse: 1 }),
  S(90.7, '06', [580, 240, 2.4], [580, 240, 2.6], { pulse: 1 }),
  S(94.14, '06', [960, 540, 1.0], [960, 540, 1.1], { pulse: 1 }),
  S(96.2, '06', [300, 300, 1.5], [1600, 300, 1.5], { pulse: 1 }),
  S(99.44, '06', [1760, 580, 1.8], [1760, 580, 2.0], { pulse: 1 }),
  S(102.22, '06', [1160, 340, 1.4], [1160, 340, 1.9], { pulse: 1 }),
  S(105.14, '04', [960, 560, 1.1], [960, 560, 1.3], { mirror: true, hue: 160, spin: -3 }),
  S(109.9, '04', [980, 300, 1.6], [980, 300, 1.95], { mirror: true, hue: 160, spin: 8, shake: 0.5, pulse: 0.8 }),
  S(116.18, '07', [960, 540, 1.0], [960, 540, 1.08], { pulse: 1, shake: 0.4 }),
  S(118.06, '07', [900, 220, 1.6], [900, 220, 1.72], { pulse: 1 }),
  S(121.06, '07', [280, 200, 1.4], [280, 200, 1.7], { pulse: 1, spin: 4 }),
  S(123.46, '07', [1600, 120, 1.7], [1600, 80, 1.9], { pulse: 1 }),
  S(126.18, '07', [960, 540, 1.0], [960, 540, 1.15], { pulse: 1, shake: 1.2 }),
  S(129.12, '07', [900, 240, 1.3], [900, 240, 1.4], { pulse: 1 }),
  S(132.32, '07', [900, 200, 2.0], [900, 200, 2.06], { desat: 1 }),
  S(135.48, '08', [960, 200, 1.3], [960, 200, 1.45], { pulse: 1 }),
  S(139.02, '08', [960, 540, 1.0], [960, 540, 1.1], { pulse: 1.5, shake: 1.2, tint: 'red' }),
  S(143.7, '08', [960, 800, 1.5], [960, 800, 1.3], { pulse: 1.5, shake: 1 }),
  S(146.5, '08', [960, 200, 1.6], [960, 200, 1.9], { pulse: 1.5, shake: 0.8 }),
  S(149.32, '08', [960, 540, 1.0], [960, 540, 1.25], { shake: 2, tint: 'red' }),
  S(151.92, '09', [960, 540, 1.0], [960, 540, 1.06], { rot: true }),
  S(159.18, '09', [1320, 460, 1.8], [1320, 460, 1.95], { desat: 0.7 }),
  S(162.72, '10', [960, 540, 1.0], [960, 540, 1.06], { pulse: 1, shake: 0.4 }),
  S(165.48, '10', [1300, 300, 1.6], [1300, 300, 1.75], { pulse: 1 }),
  S(167.68, '10', [960, 540, 1.05], [960, 540, 1.12], { pulse: 1 }),
  S(169.8, '10', [1020, 220, 1.6], [1060, 220, 1.8], { pulse: 1 }),
  S(173.92, 'thumb', [700, 480, 1.15], [700, 480, 1.3], { pulse: 1.2, shake: 0.5 }),
  S(175.82, '10', [420, 240, 1.7], [440, 240, 1.8]),
  S(178.34, '10', [1300, 300, 1.8], [1300, 300, 2.1], { shake: 2 }),
  S(181.38, '11', [960, 540, 1.0], [960, 520, 1.12]),
  S(185.18, '11', [700, 200, 1.5], [700, 200, 1.7]),
  S(190.8, '11', [700, 200, 1.8], [700, 200, 1.9]),
  S(193.54, '11', [960, 540, 1.0], [960, 540, 1.25], { shake: 2, pulse: 1.5 }),
  S(200.5, '11', [700, 200, 1.6], [960, 540, 1.0], { shake: 0.8, pulse: 1.5 }),
  S(207.0, 'end', [960, 540, 1.0], [960, 540, 1.05], { desat: 0.3 }),
];

const shotAt = (t: number) => { let i = 0; for (let k = 0; k < SHOTS.length; k++) if (SHOTS[k].t <= t) i = k; return i; };

const ACCENTS: [number, number][] = [
  [7.0, 1], [15.16, 0.7], [26.1, 0.4], [60.74, 1], [68.48, 1], [70.0, 0.8], [76.74, 0.8], [82.9, 0.5], [116.18, 1], [126.18, 1], [135.48, 0.7], [137.0, 0.9],
  [139.02, 1], [143.7, 0.8], [146.5, 0.8], [147.2, 0.8], [147.9, 0.9], [148.6, 1], [149.32, 1.2], [162.72, 1], [165.48, 0.9], [170.4, 0.8], [173.92, 0.8],
  [178.34, 1.2], [193.54, 1.3], [200.5, 0.7],
];
const accent = (t: number) => ACCENTS.reduce((m, [a, s]) => (t >= a && t < a + 0.6 ? Math.max(m, s * Math.exp(-(t - a) * 7)) : m), 0);

// ---------- camera ----------
const camera = (shot: Shot, t: number, nextT: number) => {
  const p = easeInOut((t - shot.t) / Math.max(0.1, nextT - shot.t));
  const fx = lerp(shot.a[0], shot.b[0], p), fy = lerp(shot.a[1], shot.b[1], p);
  const s = lerp(shot.a[2], shot.b[2], p);
  return { fx, fy, s };
};

const ImageLayer: React.FC<{ shot: Shot; t: number; nextT: number; frame: number; children?: React.ReactNode }> = ({ shot, t, nextT, frame, children }) => {
  const fx = shot.fx || {};
  const cam = camera(shot, t, nextT);
  const pulse = (fx.pulse || 0) * env('onset', frame);
  let s = cam.s * (1 + 0.03 * pulse);
  let rot = fx.spin ? Math.sin((t - shot.t) * 0.9) * fx.spin : 0;
  let tx = W / 2 - cam.fx * s, ty = H / 2 - cam.fy * s;
  tx = clamp(tx, W - W * s, 0); ty = clamp(ty, H - H * s, 0);
  const extra = rot ? 1.08 : 1;
  const filt = [fx.desat ? `grayscale(${fx.desat}) contrast(1.15) brightness(0.9)` : '', fx.hue ? `hue-rotate(${fx.hue}deg) saturate(1.2)` : '', fx.tint === 'red' ? 'sepia(0.4) saturate(2) hue-rotate(-30deg) contrast(1.15)' : ''].join(' ');
  return (
    <AbsoluteFill style={{ transform: `rotate(${rot}deg) scale(${extra})` }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
        <Img src={staticFile(IMG[shot.img])} style={{ width: W, height: H, filter: filt || undefined, transform: fx.mirror ? 'scaleX(-1)' : undefined }} />
        {children}
      </div>
    </AbsoluteFill>
  );
};

// ---------- small helpers ----------
const Txt: React.FC<{ x: number; y: number; size: number; font?: string; color?: string; stroke?: string; sw?: number; rot?: number; scale?: number; op?: number; glow?: string; children: React.ReactNode; anchor?: 'c' | 'l' }> = ({ x, y, size, font = POP, color = '#fff', stroke = '#111', sw = 0, rot = 0, scale = 1, op = 1, glow, children, anchor = 'c' }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'c' ? '-50%' : '0'}, -50%) rotate(${rot}deg) scale(${scale})`, fontFamily: font, fontSize: size, color, opacity: op, whiteSpace: 'nowrap', lineHeight: 1, WebkitTextStroke: sw ? `${sw}px ${stroke}` : undefined, paintOrder: 'stroke fill', textShadow: glow }}>{children}</div>
);
const pop = (t: number, at: number, dur = 0.25) => backOut((t - at) / dur);
const vis = (t: number, a: number, b: number) => t >= a && t < b;
const fadeIO = (t: number, a: number, b: number, d = 0.2) => clamp(Math.min((t - a) / d, (b - t) / d));

const Chalk: React.FC<{ x: number; y: number; size: number; text: string; op?: number; rot?: number; color?: string }> = ({ x, y, size, text, op = 1, rot = 0, color = CHALKW }) => (
  <Txt x={x} y={y} size={size} font={CHALK} color={color} op={op} rot={rot} glow="0 0 6px rgba(255,255,255,0.35)">{text}</Txt>
);

const Stamp: React.FC<{ t: number; at: number; x: number; y: number; text: string; size?: number; color?: string; rot?: number; font?: string }> = ({ t, at, x, y, text, size = 110, color = RED, rot = -12, font = POP }) => {
  const p = clamp((t - at) / 0.18);
  const sc = lerp(2.6, 1, easeOut(p));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${sc})`, opacity: p, border: `10px solid ${color}`, borderRadius: 18, padding: '6px 26px', fontFamily: font, fontSize: size, color, lineHeight: 1.05, whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.12)', boxShadow: '0 0 0 4px rgba(0,0,0,0.25)' }}>{text}</div>
  );
};

const Rays: React.FC<{ frame: number; color?: string; op?: number }> = ({ frame, color = PINK, op = 0.35 }) => {
  const o = env('onset', frame);
  const n = 28;
  const rot = frame * 0.6;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: op * (0.4 + o) }}>
      <g transform={`translate(${W / 2} ${H / 2}) rotate(${rot})`}>
        {Array.from({ length: n }).map((_, i) => {
          const a = (i / n) * Math.PI * 2, a2 = a + 0.05;
          const r1 = 420 + random(`r${i}`) * 120, r2 = 1400;
          return <polygon key={i} points={`${Math.cos(a) * r1},${Math.sin(a) * r1} ${Math.cos(a) * r2},${Math.sin(a) * r2} ${Math.cos(a2) * r2},${Math.sin(a2) * r2}`} fill={i % 3 === 0 ? GOLD : color} />;
        })}
      </g>
    </svg>
  );
};

const Ticker: React.FC<{ t: number; t0: number; rows: string[]; color?: string; op?: number }> = ({ t, t0, rows, color = '#fff', op = 0.55 }) => (
  <>
    {rows.map((r, i) => {
      const sp = 160 + i * 70;
      const x = (i % 2 ? -1 : 1) * ((t - t0) * sp) - 600;
      return (
        <div key={i} style={{ position: 'absolute', top: 70 + i * 150, left: i % 2 ? x - 1200 : -x - 1800, fontFamily: BANG, fontSize: 92 - i * 8, color, opacity: op, whiteSpace: 'nowrap', letterSpacing: 8, WebkitTextStroke: '3px rgba(0,0,0,0.5)', paintOrder: 'stroke fill' }}>{(r + '   ').repeat(6)}</div>
      );
    })}
  </>
);

const FaceBadge: React.FC<{ who: 'girl' | 'boy'; x: number; y: number; size: number; p: number; rot?: number }> = ({ who, x, y, size, p, rot = 0 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: size, height: size, transform: `translate(-50%,-50%) scale(${backOut(p)}) rotate(${rot}deg)`, borderRadius: '50%', overflow: 'hidden', border: `${Math.max(4, size * 0.06)}px solid #fff`, boxShadow: `0 0 0 ${Math.max(3, size * 0.04)}px #111, 0 8px 18px rgba(0,0,0,0.4)`, opacity: clamp(p * 3) }}>
    <Img src={staticFile(`sq/face-${who}.jpg`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  </div>
);

// ---------- chalk floaters ----------
const FLOAT = ['x²+y²=r²', '∫ f(x) dx', 'π', '√2', 'e^iπ', 'Σ n²', '∞', 'dy/dx', 'a²+b²=c²', '1.618…', 'i²=−1', 'n!', 'log₂', 'lim→∞', 'f(君)=好き²', 'Q.E.D.'];
const Floaters: React.FC<{ t: number; op: number }> = ({ t, op }) => (
  <>
    {FLOAT.map((s, i) => {
      const bx = random(`fx${i}`) * W, by = 60 + random(`fy${i}`) * 600;
      const sp = 14 + random(`fs${i}`) * 26;
      const x = ((bx + t * sp * (i % 2 ? 1 : -1)) % (W + 400) + W + 400) % (W + 400) - 200;
      const y = by + Math.sin(t * 0.6 + i) * 24;
      return <Chalk key={i} x={x} y={y} size={38 + random(`fz${i}`) * 34} text={s} op={op * (0.12 + random(`fo${i}`) * 0.16)} rot={(random(`fr${i}`) - 0.5) * 24} />;
    })}
  </>
);

// ---------- HUD ----------
const SECTIONS: [number, string][] = [
  [0, '序論'], [26.1, '第1章 一目惚れの微積分'], [48.7, '補題 π'], [60.74, '定理 君²'], [82.9, '第2章 確率と期待値'], [105.14, '補題 e'],
  [116.18, '定理 妄想²'], [135.48, '反例'], [139.02, '逆演算 √'], [151.92, '第3章 虚数'], [162.72, '最終定理'], [181.38, '結論'],
];
const SUKI: [number, string][] = [
  [0, '1'], [7.0, '1²'], [26.1, '2'], [32.38, '2ⁿ'], [60.74, '4'], [63.48, '16'], [65.62, '256'], [66.3, '65536'], [67.0, '4.3×10⁹'], [67.7, '1.8×10¹⁹'],
  [68.48, 'ERROR'], [71.48, '∞'], [79.36, '？'], [82.9, '0.3s'], [85.78, '−∞'], [94.14, '≒0'], [96.2, '0.0001'], [99.44, '赤字'], [116.18, '2'], [118.06, '4'],
  [121.06, 'n!'], [123.46, 'OVERFLOW'], [132.32, '未計算'], [135.48, '−1'], [139.02, '√?'], [146.5, '2'], [147.2, '4'], [147.9, '16'], [148.6, '256'], [149.32, '65536'],
  [151.92, 'i'], [156.54, '−1'], [162.72, '好き²'], [165.48, '∞'], [169.8, '0'], [175.82, '÷0'], [181.38, '0'], [193.54, 'ERROR'],
];
const lastOf = <T,>(arr: [number, T][], t: number) => { let r = arr[0]; for (const a of arr) if (a[0] <= t) r = a; return r; };

const HUD: React.FC<{ t: number }> = ({ t }) => {
  if (t > 206.5) return null;
  const [st, sname] = lastOf(SECTIONS, t);
  const [kt, kv] = lastOf(SUKI, t);
  const sp = pop(t, st, 0.3), kp = pop(t, kt, 0.22);
  const bad = /ERROR|OVERFLOW|−|赤字|÷|未/.test(kv);
  const op = t < 1 ? clamp(t) : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op }}>
      <div style={{ position: 'absolute', left: 40, top: 34, background: 'rgba(20,52,40,0.82)', border: '4px solid rgba(255,255,255,0.85)', borderRadius: 10, padding: '8px 20px 10px', transform: `scale(${lerp(0.9, 1, sp)})`, transformOrigin: 'left top' }}>
        <div style={{ fontFamily: POP, fontSize: 24, color: '#cfe9dc' }}>本日の講義：恋</div>
        <div style={{ fontFamily: POP, fontSize: 34, color: '#fff' }}>§ {sname}</div>
      </div>
      <div style={{ position: 'absolute', right: 40, top: 34, background: 'rgba(15,15,25,0.8)', border: `4px solid ${bad ? RED : GOLD}`, borderRadius: 10, padding: '8px 20px', display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <span style={{ fontFamily: POP, fontSize: 30, color: '#fff' }}>好き度 =</span>
        <span style={{ fontFamily: /^[0-9A-Z.,×−+?!¹²³⁴⁵⁶⁷⁸⁹⁰ⁿ√ s]+$/.test(kv) ? BANG : POP, fontSize: 54, color: bad ? RED : GOLD, display: 'inline-block', transform: `scale(${lerp(1.8, 1, kp)})`, letterSpacing: 2 }}>{supify(kv, bad ? RED : GOLD)}</span>
      </div>
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
const SUPMAP: Record<string, string> = { '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', 'ⁿ': 'n', '¹': '1', '⁹': '9', '⁰': '0', '⁷': '7', '⁸': '8' };
const supify = (s: string, col: string) => [...s].map((c, i) => SUPMAP[c] ? <span key={i} style={{ fontFamily: /[0-9]/.test(SUPMAP[c]) ? BANG : POP, fontSize: '0.95em', position: 'relative', top: '-0.42em', color: col, margin: '0 0.04em', WebkitTextStroke: 'inherit' }}>{SUPMAP[c]}</span> : <React.Fragment key={i}>{c}</React.Fragment>);
const mathText = (s: string, col = PINK) => { if (!s.includes('^')) return supify(s, col); const i = s.indexOf('^'); if (i < 0) return s; const j = s.indexOf('＋', i); const sup = s.slice(i + 1, j < 0 ? undefined : j); return <>{s.slice(0, i)}<sup style={{ fontSize: '0.6em', verticalAlign: '0.7em' }}>{sup}</sup>{j < 0 ? '' : s.slice(j)}</>; };

const KIND: Record<string, { size: number; font: string; fill: string; stroke: string; sw: number; shadow: string }> = {
  n: { size: 72, font: POP, fill: '#fff', stroke: '#141414', sw: 14, shadow: `6px 6px 0 ${PINK}` },
  c: { size: 90, font: POP, fill: '#fff', stroke: '#141414', sw: 16, shadow: `7px 7px 0 ${PINK}, -3px -3px 0 ${CYAN}` },
  q: { size: 60, font: POP, fill: '#fff', stroke: '#202020', sw: 10, shadow: '0 0 18px rgba(0,0,0,0.6)' },
  f: { size: 82, font: POP, fill: '#ffd3ea', stroke: '#8a0040', sw: 14, shadow: '6px 6px 0 #fff' },
  g: { size: 88, font: GLITCH, fill: RED, stroke: '#000', sw: 12, shadow: `5px 0 0 ${CYAN}, -5px 0 0 #ff00aa` },
  k: { size: 84, font: POP, fill: '#1d2a14', stroke: '#1d2a14', sw: 0, shadow: '3px 3px 0 rgba(0,0,0,0.18)' },
  s: { size: 150, font: GLITCH, fill: '#fff', stroke: '#000', sw: 16, shadow: `8px 0 0 ${RED}, -8px 0 0 ${CYAN}` },
};

const LyricLine: React.FC<{ line: Line; t: number; frame: number }> = ({ line, t, frame }) => {
  const toks = parse(line.text);
  const st = KIND[line.kind];
  const n = units(toks);
  const maxW = line.kind === 's' ? 1700 : 1780;
  const size = Math.min(st.size, maxW / (n * 1.02));
  const dur = line.e - line.t;
  const stagger = Math.min(line.kind === 's' ? 0.05 : 0.04, (dur * 0.45) / Math.max(1, n));
  const out = clamp((line.e - t) / 0.18);
  const lt = t - line.t;
  let idx = 0;
  const shakeAmt = line.kind === 's' ? 9 : line.kind === 'g' ? 5 : 0;
  const beat = line.kind === 'c' ? 1 + 0.04 * env('onset', frame) : 1;
  const sScale = line.kind === 's' ? lerp(0.92, 1.12, clamp(lt / dur)) : 1;

  const charEl = (ch: string, i: number, extra?: React.CSSProperties) => {
    const at = i * stagger;
    const p = clamp((lt - at) / 0.13);
    const sc = line.kind === 'q' ? lerp(1.15, 1, easeOut(p)) : lerp(1.9, 1, backOut(p));
    const jx = shakeAmt ? (random(`jx${i}-${frame}`) - 0.5) * shakeAmt : 0, jy = shakeAmt ? (random(`jy${i}-${frame}`) - 0.5) * shakeAmt : 0;
    return (
      <span key={i} style={{ display: 'inline-block', opacity: p, transform: `translate(${jx}px,${jy}px) scale(${sc})`, whiteSpace: 'pre', ...extra }}>{ch}</span>
    );
  };

  const nodes: React.ReactNode[] = [];
  toks.forEach((tk, ti) => {
    if (tk.k === 't') {
      [...tk.v].forEach((ch) => { nodes.push(charEl(ch, idx)); idx++; });
    } else if (tk.k === 'h') {
      const startIdx = idx;
      const chars = [...tk.v].map((ch) => { const el = charEl(ch, idx, { color: line.kind === 'g' ? '#fff' : line.kind === 'k' ? '#b0002e' : GOLD }); idx++; return el; });
      const hp = clamp((lt - startIdx * stagger) / 0.2);
      nodes.push(<span key={`h${ti}`} style={{ display: 'inline-block', transform: `rotate(${lerp(-8, (ti % 2 ? 2 : -2), easeOut(hp))}deg)` }}>{chars}</span>);
    } else if (tk.k === 'p') {
      const at = idx * stagger;
      const p = clamp((lt - at) / 0.2);
      const who = tk.v === '俺' ? 'boy' : 'girl';
      nodes.push(
        <span key={`p${ti}`} style={{ position: 'relative', display: 'inline-block', fontSize: '1.3em', lineHeight: 1, verticalAlign: '-0.08em', margin: '0 0.04em', opacity: clamp(p * 2), transform: `scale(${lerp(2.2, 1, backOut(p))}) rotate(${Math.sin(t * 5 + ti) * 6}deg)` }}>
          <span style={{ color: '#111', WebkitTextStroke: `${Math.max(14, st.sw * 1.6)}px #111`, paintOrder: 'stroke fill', textShadow: `5px 5px 0 ${who === 'girl' ? PINK : '#1a6cff'}` }}>{tk.v}</span>
          <span style={{ position: 'absolute', left: 0, top: 0, color: '#fff', WebkitTextStroke: `${Math.max(7, st.sw * 0.8)}px #fff`, paintOrder: 'stroke fill', textShadow: 'none' }}>{tk.v}</span>
          <span style={{ position: 'absolute', left: 0, top: 0, color: 'transparent', backgroundImage: `url(${staticFile(`sq/face-${who}.jpg`)})`, backgroundSize: '115% auto', backgroundPosition: who === 'girl' ? '45% 40%' : '50% 35%', WebkitBackgroundClip: 'text', backgroundClip: 'text', textShadow: 'none', WebkitTextStroke: '0px' }}>{tk.v}</span>
        </span>,
      );
      idx++;
    } else if (tk.k === 'm') {
      const at = idx * stagger;
      const mt = at + Math.min(0.55, Math.max(0.28, dur * 0.18));
      const p1 = clamp((lt - at) / 0.13);
      const mp = clamp((lt - mt) / 0.12);
      const flash = clamp(1 - Math.abs(lt - mt) / 0.12);
      const toCol = line.kind === 'k' ? '#b0002e' : line.kind === 'g' || line.kind === 's' ? '#fff' : GOLD;
      nodes.push(
        <span key={`m${ti}`} style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ display: 'inline-block', opacity: p1 * clamp(1 - mp * 2), transform: `scale(${lerp(1.6, 1, backOut(p1)) * lerp(1, 0.4, mp)})`, filter: flash ? `blur(${flash * 3}px)` : undefined, fontSize: '0.75em', whiteSpace: 'nowrap', position: mp >= 1 ? 'absolute' : 'relative', left: 0, top: 0 }}>{tk.v}</span>
          <span style={{ display: 'inline-block', opacity: mp, color: toCol, transform: `scale(${lerp(2.4, 1, backOut(mp))}) rotate(${lerp(-25, 0, easeOut(mp))}deg)`, whiteSpace: 'nowrap', position: mp >= 1 ? 'relative' : 'absolute', left: 0, top: 0, textShadow: line.kind === 'k' ? 'none' : `0 0 ${18 * flash}px #fff, ${st.shadow}` }}>{mathText(tk.w || '', line.kind === 'k' ? '#d4004a' : line.kind === 's' || line.kind === 'g' ? RED : PINK)}</span>
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
      idx += 1.2 as any;
    }
  });

  const isCenter = line.kind === 's';
  if (line.kind === 'k') {
    const pin = backOut(clamp(lt / 0.25));
    const tilt = Math.sin(t * 2) * 1.5;
    const blink = Math.floor(t * 2.5) % 2 === 0;
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center', opacity: out, transform: `translateY(${(1 - pin) * 220}px) rotate(${tilt - 1}deg) scale(${beat})` }}>
        <div style={{ background: 'linear-gradient(#5b6372,#3a404c)', border: '6px solid #111', borderRadius: 26, padding: '16px 22px 14px', boxShadow: '10px 12px 0 rgba(0,0,0,0.45)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: BANG, fontSize: 24, color: '#d9dde6', letterSpacing: 3, padding: '0 8px 6px' }}><span>SQUARED-2</span><span style={{ color: GOLD }}>☀ SOLAR</span></div>
          <div style={{ background: 'linear-gradient(#c9e6a9,#a9cf83)', border: '5px solid #222', borderRadius: 10, padding: '8px 34px 6px', minWidth: 1100, textAlign: 'right', position: 'relative', boxShadow: 'inset 0 6px 14px rgba(0,0,0,0.25)' }}>
            <div style={{ position: 'absolute', left: 16, top: 8, fontFamily: BANG, fontSize: 26, color: '#2f4220', opacity: 0.85 }}>{lt > dur * 0.6 ? 'E' : 'M+'}</div>
            <div style={{ fontFamily: POP, fontSize: size, color: st.fill, lineHeight: 1.18, textShadow: st.shadow, whiteSpace: 'nowrap' }}>{nodes}<span style={{ opacity: blink ? 1 : 0, marginLeft: 6 }}>▮</span></div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'center' }}>
            {['7', '8', '9', '×', '÷', 'x²', '√', '='].map((kk, i) => {
              const hit = env('onset', frame) > 0.55 && (Math.floor(frame / 3) + i) % 8 === 0;
              return <div key={kk} style={{ width: 118, height: 50, borderRadius: 10, background: kk === '=' ? PINK : kk === 'x²' ? GOLD : '#eef0f4', border: '4px solid #111', fontFamily: BANG, fontSize: 32, color: '#111', textAlign: 'center', lineHeight: '44px', transform: `translateY(${hit ? 5 : 0}px)`, boxShadow: hit ? 'none' : '0 5px 0 #111' }}>{kk}</div>;
            })}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, ...(isCenter ? { bottom: 70 } : { bottom: 58 }), textAlign: 'center',
      fontFamily: st.font, fontSize: size, color: st.fill, lineHeight: 1.25, WebkitTextStroke: `${st.sw * (size / st.size)}px ${st.stroke}`, paintOrder: 'stroke fill', textShadow: st.shadow,
      opacity: out, transform: `translateY(${(1 - out) * -20}px) scale(${beat * sScale}) rotate(${line.kind === 'c' ? -1.5 : 0}deg)`, padding: '0 40px',
    }}>{nodes}</div>
  );
};

// ---------- section overlays ----------
const Overlays: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const o = env('onset', frame), b = env('bass', frame);
  const n: React.ReactNode[] = [];
  const k = (key: string, el: React.ReactNode) => n.push(<React.Fragment key={key}>{el}</React.Fragment>);

  // intro title card on thumb
  if (vis(t, 10.5, 26.1)) {
    const p = clamp((t - 10.9) / 1.2);
    const fo = fadeIO(t, 10.5, 26.1, 0.4);
    k('title', <div style={{ position: 'absolute', left: 1150, top: 230, width: 780, textAlign: 'center', opacity: fo }}>
      <div style={{ fontFamily: CHALK, fontSize: 150, whiteSpace: 'nowrap', color: CHALKW, clipPath: `inset(0 ${100 - p * 100}% 0 0)`, textShadow: '0 0 10px rgba(255,255,255,0.4)', transform: `scale(${1 + 0.05 * o})` }}>Squared<span style={{ fontFamily: BANG, color: PINK, fontSize: 110, verticalAlign: 'top', display: 'inline-block', transform: `scale(${t > 15.16 && t < 15.9 ? lerp(2, 1, easeOut((t - 15.16) / 0.7)) : 1})` }}>²</span></div>
      <div style={{ fontFamily: POP, fontSize: 52, color: '#fff', marginTop: 10, opacity: clamp((t - 12.2) / 0.6), WebkitTextStroke: '10px #143428', paintOrder: 'stroke fill' }}>〜僕×君＝好きの2乗!?〜</div>
      <div style={{ fontFamily: POP, fontSize: 30, color: GOLD, marginTop: 30, opacity: clamp((t - 13.2) / 0.6) }}>ただいま正気を失い中</div>
    </div>);
    const eqs = ['f(君) = 好き²', '僕 × 君 = ?', 'lim 恋 → ∞', '∴ 好き²'];
    eqs.forEach((e, i) => { const at = 16.5 + i * 2.2; if (t > at) k(`eq${i}`, <div style={{ opacity: fo * clamp((t - at) / 0.5) }}><Chalk x={1560 + (i % 2 ? 120 : -140)} y={640 + i * 90} size={46} text={e} rot={i % 2 ? 4 : -4} /></div>); });
  }
  // 01 board 恋²  (screen space; camera framed)
  if (vis(t, 1.8, 10.5)) {
    const p = clamp((t - 2.0) / 0.5);
    const inZoom = t >= 7.0;
    const x = inZoom ? 1060 : 1140, y = inZoom ? 470 : 300, sz = inZoom ? 380 : 250;
    k('koi', <Txt x={x} y={y} size={sz} font={POP} color={CHALKW} op={p * fadeIO(t, 1.8, 10.5, 0.3)} glow="0 0 14px rgba(255,255,255,0.5)">恋</Txt>);
    if (t >= 7.0) { const q = pop(t, 7.0, 0.35); k('sq', <Txt x={x + sz * 0.62} y={y - sz * 0.42} size={sz * 0.7} font={BANG} color={PINK} scale={lerp(3, 1, q)} op={fadeIO(t, 7, 10.5, 0.2)} stroke="#fff" sw={8}>2</Txt>); }
  }
  // 1st verse
  if (vis(t, 26.1, 29.48)) {
    const p = clamp((t - 26.6) / 1.8);
    const pts: string[] = [];
    for (let i = 0; i <= 260; i++) { const a = i * 0.06; const r = 3 * Math.pow(1.19, a * 1.6); pts.push(`${Math.cos(-a) * r},${Math.sin(-a) * r}`); }
    k('spiral', <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}><g transform={`translate(780 330) scale(1.1)`}><polyline points={pts.join(' ')} fill="none" stroke={GOLD} strokeWidth={8} strokeLinecap="round" strokeDasharray={3000} strokeDashoffset={3000 * (1 - p)} style={{ filter: 'drop-shadow(0 0 10px #ffd23f)' }} /></g></svg>);
    if (t > 28) k('phi', <Chalk x={1180} y={180} size={80} text="φ = 1.618…" op={clamp((t - 28) / 0.4)} color={GOLD} />);
  }
  if (vis(t, 29.48, 32.38)) {
    const p = clamp((t - 29.7) / 2.2);
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) { const x = i / 60; const y = x < 0.55 ? x * 0.35 : 0.1925 + Math.pow((x - 0.55) / 0.45, 3) * 0.8; pts.push(`${x * 520},${300 - y * 300}`); }
    k('g1', <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}><g transform="translate(1300 120)">
      <rect x={-30} y={-30} width={600} height={380} rx={14} fill="rgba(20,52,40,0.85)" stroke="#fff" strokeWidth={5} />
      <path d="M0 300 H540 M0 300 V-10" stroke="#fff" strokeWidth={5} />
      <polyline points={pts.join(' ')} fill="none" stroke={PINK} strokeWidth={9} strokeLinecap="round" strokeDasharray={1400} strokeDashoffset={1400 * (1 - p)} />
    </g></svg>);
    k('g1t', <Chalk x={1590} y={160} size={44} text={t < 31 ? 'y = x' : 'y = eˣ !!'} color={t < 31 ? '#fff' : PINK} />);
  }
  if (vis(t, 32.38, 35.16)) {
    const q = pop(t, 34.0, 0.3);
    k('ex', <Txt x={600} y={330} size={230} font={BANG} color={GOLD} stroke="#111" sw={10} scale={t > 34 ? lerp(3, 1, q) * (1 + 0.08 * o) : 0} rot={-10}>eˣ</Txt>);
  }
  if (vis(t, 35.16, 38.4)) {
    k('axes', <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: 0.85 }}><path d={`M100 ${H / 2} H${W - 100} M${W / 2} 60 V${H - 60}`} stroke="#fff" strokeWidth={7} strokeDasharray={2400} strokeDashoffset={2400 * (1 - clamp((t - 35.2) / 0.6))} /></svg>);
    k('xl', <Chalk x={W - 120} y={H / 2 - 50} size={70} text="x" />); k('yl', <Chalk x={W / 2 + 50} y={90} size={70} text="y" />);
    for (let i = 0; i < 26; i++) {
      const at = 36.0 + i * 0.07;
      const x = 120 + random(`bx${i}`) * (W - 240), y = 120 + random(`by${i}`) * 620;
      if (t > at) k(`b${i}`, <FaceBadge who="girl" x={x} y={y} size={90 + random(`bs${i}`) * 70} p={clamp((t - at) / 0.25)} rot={(random(`br${i}`) - 0.5) * 40} />);
    }
  }
  if (vis(t, 38.4, 43.28)) {
    for (let i = 0; i < 5; i++) {
      const ph = (t - 38.4) * (1.4 + i * 0.2) + i;
      const x = 200 + i * 380 + Math.sin(ph) * 40, y = 160 + Math.abs(Math.sin(ph * 2.2)) * -120 + 160;
      k(`d${i}`, <div style={{ position: 'absolute', left: x, top: y, width: 140, height: 140, transform: `rotate(${ph * 120}deg)` }}>{React.createElement(ICONS.dice, { p: 1 })}</div>);
    }
    if (t > 39.2) k('prob', <Txt x={960} y={120} size={86} font={BANG} color={GOLD} stroke="#111" sw={8} scale={pop(t, 39.2)}>P = 1 / 10⁹⁹</Txt>);
  }
  if (vis(t, 43.28, 48.7)) {
    const amp = 40 + 90 * b;
    const pts: string[] = []; for (let x = 0; x <= W; x += 12) pts.push(`${x},${300 + Math.sin(x * 0.03 - t * 18) * amp * Math.sin((x / W) * Math.PI)}`);
    k('wave', <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}><polyline points={pts.join(' ')} fill="none" stroke={CYAN} strokeWidth={9} style={{ filter: 'drop-shadow(0 0 12px #3ff3ff)' }} /></svg>);
    k('hz', <Txt x={360} y={150} size={92} font={BANG} color="#fff" stroke="#111" sw={8} scale={pop(t, 43.5)}>440Hz</Txt>);
    if (t > 47.3) k('la', <Txt x={1560} y={150} size={120} color={GOLD} stroke="#111" sw={10} scale={pop(t, 47.3)}>＝ラ♪</Txt>);
  }
  if (vis(t, 48.7, 60.6)) {
    k('pi', <Ticker t={t} t0={48.7} rows={['3.14159265358979', '3238462643383279', '5028841971693993', '7510582097494459']} op={0.5 * fadeIO(t, 48.7, 60.6, 0.4)} />);
    [54.4, 56.4, 58.4].forEach((a, i) => { if (t > a) k(`mr${i}`, <Stamp t={t} at={a} x={[480, 1440, 960][i]} y={[260, 300, 520][i]} text="無理数" rot={[-14, 10, -4][i]} />); });
  }
  // chorus 1
  if (vis(t, 60.74, 79.3)) {
    k('rays', <Rays frame={frame} />);
    [65.62, 66.3, 67.0, 67.7].forEach((a, i) => { if (vis(t, a, 68.48)) k(`ex${i}`, <Txt x={420 + i * 360} y={300 - i * 40} size={200 + i * 30} font={POP} color={i % 2 ? PINK : GOLD} stroke="#111" sw={10} scale={lerp(3, 1, pop(t, a, 0.2))} rot={-8 + i * 5}>{supify(`x${['³', '⁴', '⁵', '⁶'][i]}`, '#fff')}</Txt>); });
    if (vis(t, 68.48, 71.4)) {
      const g = t > 70 ? (random(`eg${frame}`) - 0.5) * 30 : 0;
      k('err', <div style={{ position: 'absolute', left: 960 + g, top: 330, transform: `translate(-50%,-50%) scale(${pop(t, 68.6, 0.2)})`, width: 860, background: '#e9e9ee', border: '5px solid #111', borderRadius: 10, boxShadow: '12px 12px 0 rgba(0,0,0,0.5)' }}>
        <div style={{ background: RED, color: '#fff', fontFamily: BANG, fontSize: 46, padding: '6px 18px', letterSpacing: 3 }}>FATAL ERROR</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '24px 30px' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: RED, color: '#fff', fontFamily: BANG, fontSize: 86, textAlign: 'center', lineHeight: '104px' }}>×</div>
          <div style={{ fontFamily: POP, fontSize: 46, color: '#111', lineHeight: 1.3 }}>「好き」が大きすぎて<br />計算できません</div>
        </div>
      </div>);
    }
    if (vis(t, 76.74, 79.3)) k('qed', <Stamp t={t} at={76.9} x={960} y={330} text="Q.E.D. ∎" size={170} color={GOLD} rot={-6} font={BANG} />);
  }
  if (vis(t, 79.36, 82.8)) {
    k('q', <Txt x={1500} y={300} size={300} font={BANG} color="#fff" stroke="#111" sw={12} scale={pop(t, 79.6, 0.4)} rot={Math.sin(t * 3) * 8}>?</Txt>);
    if (t > 80.6) k('undef', <div style={{ position: 'absolute', left: 140, top: 170, fontFamily: 'monospace', fontSize: 52, color: '#7CFC9A', background: 'rgba(0,0,0,0.75)', padding: '10px 22px', borderRadius: 8, opacity: clamp((t - 80.6) / 0.3) }}>{'> 君.name'}<br />{'undefined'.slice(0, Math.max(0, Math.floor((t - 80.9) * 14)))}</div>);
  }
  // verse 2
  if (vis(t, 82.9, 85.7)) {
    const v = Math.min(0.3, (t - 82.95) * 0.12);
    k('timer', <div style={{ position: 'absolute', left: 260, top: 210, transform: 'translate(-50%,-50%)', background: '#111', border: `6px solid ${GOLD}`, borderRadius: 16, padding: '10px 26px', textAlign: 'center' }}>
      <div style={{ fontFamily: POP, fontSize: 32, color: '#fff' }}>既読まで</div>
      <div style={{ fontFamily: BANG, fontSize: 96, color: GOLD, letterSpacing: 4 }}>{v.toFixed(2)}s</div>
    </div>);
    if (t > 84.3) k('dydx', <Chalk x={1500} y={170} size={110} text="d君/dt" color={CYAN} />);
  }
  if (vis(t, 85.78, 88.6)) {
    const p = clamp((t - 85.9) / 1.6);
    k('dive', <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}><path d={`M200 140 L700 200 Q900 220 960 ${200 + p * 900}`} fill="none" stroke={RED} strokeWidth={14} strokeLinecap="round" strokeDasharray={1600} strokeDashoffset={1600 * (1 - p)} style={{ filter: 'drop-shadow(0 0 10px #ff2e2e)' }} /></svg>);
    if (t > 86.8) k('slope', <Txt x={1420} y={200} size={88} font={POP} color="#fff" stroke="#111" sw={10} scale={pop(t, 86.8)}>傾き = −∞</Txt>);
  }
  if (vis(t, 88.68, 90.6)) k('primes', <Ticker t={t} t0={88.68} rows={['2  3  5  7  11  13  17  19  23  29', '31  37  41  43  47  53  59  61  俺']} color={GOLD} op={0.75} />);
  if (vis(t, 90.7, 94.1)) {
    k('bug', <div style={{ position: 'absolute', left: -100, top: 120, width: 2200, transform: 'rotate(-6deg)', background: `repeating-linear-gradient(45deg, ${GOLD} 0 40px, #111 40px 80px)`, height: 120, opacity: clamp((t - 90.9) / 0.15) }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 12, textAlign: 'center', fontFamily: BANG, fontSize: 96, color: '#fff', WebkitTextStroke: '8px #111', paintOrder: 'stroke fill', letterSpacing: 10 }}>⚠ BUG DETECTED ⚠</div>
    </div>);
    if (t > 92.4) k('sig', <Txt x={1560} y={460} size={380} font={GLITCH} color={PINK} stroke="#fff" sw={10} scale={pop(t, 92.4, 0.25)} rot={10}>Σ</Txt>);
  }
  if (vis(t, 94.14, 99.3)) {
    const zeros = '0.' + '0'.repeat(Math.max(0, Math.min(14, Math.floor((t - 94.2) * 7)))) + '1';
    k('p0', <div style={{ position: 'absolute', left: 960, top: 180, transform: 'translate(-50%,-50%)', fontFamily: BANG, fontSize: 84, color: '#fff', WebkitTextStroke: '8px #111', paintOrder: 'stroke fill', whiteSpace: 'nowrap' }}>P(振り向く) = <span style={{ color: CYAN }}>{t < 96.2 ? zeros : '0.00000000000001'}</span></div>);
    if (t > 96.6) k('ne0', <Stamp t={t} at={96.6} x={1400} y={380} text="≠ 0 !!" size={150} color={GOLD} font={BANG} rot={8} />);
  }
  if (vis(t, 99.44, 102.1)) {
    k('ex2', <Txt x={700} y={230} size={110} font={BANG} color="#fff" stroke="#111" sw={10} scale={pop(t, 99.6)}>E[X] = −¥∞</Txt>);
    if (t > 100.8) k('akaji', <Stamp t={t} at={100.8} x={1200} y={420} text="赤字" size={160} />);
  }
  if (vis(t, 102.22, 105.1)) {
    for (let i = 0; i < 18; i++) {
      const x = random(`tx${i}`) * W, sp = 300 + random(`ts${i}`) * 300;
      const y = -150 + ((t - 102.22) * sp + random(`ty${i}`) * 300);
      k(`tk${i}`, <div style={{ position: 'absolute', left: x, top: y, width: 150, height: 150, transform: `rotate(${(t * 90 + i * 40) % 360}deg)` }}>{React.createElement(ICONS.ticket, { p: 1 })}</div>);
    }
  }
  if (vis(t, 105.14, 116.1)) {
    k('e', <Ticker t={t} t0={105.14} rows={['2.718281828459045', '2352360287471352', '0.99999999999999…', '0.333333333333…']} color="#bfe6ff" op={0.5 * fadeIO(t, 105.14, 116.1, 0.4)} />);
    [110.0, 112.0, 114.0].forEach((a, i) => { if (t > a) k(`jk${i}`, <Stamp t={t} at={a} x={[520, 1400, 960][i]} y={[280, 260, 500][i]} text="循環" color={CYAN} rot={[-12, 9, -3][i]} />); });
  }
  // chorus 2
  if (vis(t, 116.18, 132.2)) {
    k('rays2', <Rays frame={frame} color="#8a5cff" />);
    [[121.1, 'n!'], [121.8, 'aⁿ'], [122.5, 'F(n)']].forEach(([a, s], i) => { if (vis(t, a as number, 123.46)) k(`f${i}`, <Txt x={500 + i * 460} y={320} size={210} font={POP} color={[GOLD, PINK, CYAN][i]} stroke="#111" sw={10} scale={lerp(3, 1, pop(t, a as number, 0.2))} rot={-10 + i * 10}>{s as string}</Txt>); });
    if (vis(t, 126.18, 127.2)) {
      const g = (random(`og${frame}`) - 0.5) * 60;
      k('of', <div style={{ position: 'absolute', left: 0, right: 0, top: 260, height: 220, background: 'rgba(0,0,0,0.75)', borderTop: `6px solid ${RED}`, borderBottom: `6px solid ${RED}` }}>
        <div style={{ position: 'absolute', left: g, right: 0, top: 28, textAlign: 'center', fontFamily: BANG, fontSize: 170, color: RED, letterSpacing: 14, textShadow: `6px 0 0 ${CYAN}, -6px 0 0 #ff00aa` }}>OVERFLOW!!</div>
      </div>);
    }
    if (vis(t, 129.4, 132.32)) k('done', <Stamp t={t} at={129.6} x={1450} y={320} text="✔ 計算済み" size={110} color="#3fdc6a" rot={-8} />);
  }
  if (vis(t, 132.32, 135.4)) {
    k('notdone', <div><Stamp t={t} at={132.32} x={1450} y={320} text="✔ 計算済み" size={110} color="#777" rot={-8} />
      <Txt x={1450} y={320} size={260} font={BANG} color={RED} stroke="#111" sw={10} scale={pop(t, 133.2, 0.2)}>✗</Txt></div>);
    if (t > 133.6) k('mikeisan', <Txt x={1450} y={520} size={70} color="#fff" stroke="#111" sw={10} op={clamp((t - 133.6) / 0.3)}>未計算</Txt>);
  }
  // kimoi / breakdown
  if (vis(t, 135.48, 139.0)) {
    k('bubble', <div style={{ position: 'absolute', left: 1180, top: 140, transform: `scale(${pop(t, 135.5, 0.25)}) rotate(6deg)`, background: '#fff', border: '7px solid #111', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', padding: '30px 50px', fontFamily: POP, fontSize: 96, color: PINK }}>キモ〜い！</div>);
    if (t > 137.0) k('kimo2', <Txt x={560} y={340} size={170} color={PINK} stroke="#fff" sw={14} scale={lerp(3, 1, pop(t, 137.0, 0.25)) * (1 + 0.06 * o)} rot={-8} glow="8px 8px 0 #111">キモ²</Txt>);
  }
  if (vis(t, 139.02, 146.4)) {
    for (let i = 0; i < 22; i++) {
      const x = random(`rx${i}`) * W, sp = 500 + random(`rs${i}`) * 700;
      const y = -200 + (((t - 139.02) * sp + random(`ry${i}`) * 1300) % 1400);
      k(`rt${i}`, <Txt x={x} y={y} size={110 + random(`rz${i}`) * 140} font={GLITCH} color={i % 3 ? RED : '#fff'} stroke="#000" sw={6} op={0.85}>√</Txt>);
    }
    if (t > 143.7) k('back', <Txt x={960} y={300} size={260} font={BANG} color="#fff" stroke="#000" sw={12} scale={pop(t, 143.7)}>{'↩ ✗'}</Txt>);
  }
  if (vis(t, 146.5, 149.3)) {
    const seq = [[146.5, '2'], [147.2, '4'], [147.9, '16'], [148.6, '256']] as [number, string][];
    const [a, v] = lastOf(seq, t);
    k('num', <Txt x={960} y={330} size={300 + seq.findIndex((s) => s[0] === a) * 60} font={BANG} color={GOLD} stroke="#000" sw={14} scale={lerp(2.4, 1, pop(t, a, 0.18))} glow={`10px 0 0 ${RED}, -10px 0 0 ${CYAN}`}>{v}</Txt>);
    if (t > 146.7) k('sqarrow', <Txt x={960 + 330} y={140} size={140} font={BANG} color={PINK} stroke="#fff" sw={6} rot={-10}>²↑</Txt>);
  }
  if (vis(t, 149.32, 151.9)) k('655', <Txt x={960} y={250} size={330} font={BANG} color={RED} stroke="#000" sw={16} scale={lerp(0.3, 1.15, easeOut((t - 149.32) / 2.2))} glow={`12px 0 0 ${CYAN}, -12px 0 0 #ff00aa`}>65536</Txt>);
  // bridge
  if (vis(t, 151.92, 162.6)) {
    if (t > 153.6 && t < 159.18) k('xi', <Txt x={1540} y={200} size={130} font={POP} color={GOLD} stroke="#111" sw={10} op={clamp((t - 153.6) / 0.3)}>{t < 156.54 ? '× i' : '× i × i'}</Txt>);
    if (vis(t, 156.54, 159.18)) k('m1', <Txt x={960} y={880 - 520} size={150} font={POP} color="#fff" stroke="#111" sw={12} scale={pop(t, 156.9, 0.3)}>i × i = −1</Txt>);
  }
  // final chorus
  if (vis(t, 162.72, 178.3) && !(t > 175.82)) k('rays3', <Rays frame={frame} color={GOLD} op={0.3} />);
  if (vis(t, 162.72, 165.4)) k('suki2', <Txt x={1500} y={250} size={170} color={PINK} stroke="#fff" sw={14} scale={lerp(3, 1, pop(t, 163.6, 0.25)) * (1 + 0.05 * o)} rot={8} glow="8px 8px 0 #111">好き²</Txt>);
  if (vis(t, 165.48, 167.6)) k('inf', <Txt x={960} y={300} size={420} color={GOLD} stroke="#111" sw={14} scale={lerp(0.2, 1, easeOut((t - 165.5) / 0.6)) * (1 + 0.08 * o)} rot={Math.sin(t * 4) * 8} font={POP}>∞</Txt>);
  if (vis(t, 169.8, 173.9)) {
    const p = clamp((t - 170.2) / 1.6);
    k('euler', <div style={{ position: 'absolute', left: 960, top: 260, transform: `translate(-50%,-50%) scale(${1 + 0.04 * o})`, fontFamily: POP, fontSize: 170, color: '#fff', textShadow: `0 0 30px ${GOLD}, 0 0 60px ${PINK}`, clipPath: `inset(0 ${100 - p * 100}% 0 0)`, whiteSpace: 'nowrap' }}>e<sup style={{ fontSize: 90 }}>iπ</sup> + 1 = 0</div>);
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2 + t; k(`sp${i}`, <Txt x={960 + Math.cos(a) * (520 + 40 * Math.sin(t * 3 + i))} y={260 + Math.sin(a) * 200} size={60} color={GOLD} op={p}>✦</Txt>); }
  }
  if (vis(t, 175.82, 178.3)) k('bunkei', <Stamp t={t} at={176.8} x={1400} y={300} text="文系" size={150} color="#a37cf0" rot={-10} />);
  if (vis(t, 178.34, 181.3)) {
    const p = clamp((t - 178.34) / 0.25);
    k('crack', <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 12 }).map((_, i) => { const a = (i / 12) * Math.PI * 2 + random(`ca${i}`); const r = 300 + random(`cr${i}`) * 900; const mx = 960 + Math.cos(a + 0.2) * r * 0.45, my = 470 + Math.sin(a + 0.2) * r * 0.45; return <path key={i} d={`M960 470 L${mx} ${my} L${960 + Math.cos(a) * r} ${470 + Math.sin(a) * r}`} stroke="#fff" strokeWidth={6} fill="none" strokeDasharray={2000} strokeDashoffset={2000 * (1 - p)} style={{ filter: 'drop-shadow(0 0 6px #000)' }} />; })}
    </svg>);
    k('div', <Txt x={960} y={330} size={420} font={BANG} color={RED} stroke="#fff" sw={14} scale={lerp(2.5, 1, pop(t, 178.4, 0.2))}>÷</Txt>);
  }
  // outro
  if (vis(t, 181.38, 185.1)) k('end1', <Stamp t={t} at={181.6} x={960} y={240} text="講義終了" size={130} color="#fff" rot={-4} />);
  if (vis(t, 190.8, 193.5)) k('ore', <Chalk x={1350} y={300} size={140} text="俺 × 君 = ?" op={clamp((t - 191) / 0.4)} />);
  if (vis(t, 193.54, 207)) {
    k('ne', <div style={{ opacity: fadeIO(t, 193.54, 207, 0.3) }}>
      <Txt x={960} y={250} size={150} font={POP} color={CHALKW} stroke="#143428" sw={10}>俺 × 君 = 好き{supify('²', PINK)}</Txt>
      <Txt x={960} y={250} size={560} font={BANG} color={RED} stroke="#fff" sw={12} scale={lerp(3, 1, pop(t, 194.2, 0.2)) * (1 + 0.05 * o)} op={0.85}>✗</Txt>
    </div>);
  }
  return <>{n}</>;
};

// ---------- end card ----------
const EndCard: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  if (t < 207) return null;
  const p = clamp((t - 207) / 0.6);
  const o = env('onset', frame);
  return (
    <AbsoluteFill style={{ background: `rgba(18,46,36,${0.86 * p})`, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', opacity: p }}>
        <div style={{ fontFamily: BANG, fontSize: 220, color: GOLD, letterSpacing: 8, transform: `scale(${lerp(1.6, 1, easeOut(p)) * (1 + 0.03 * o)})`, WebkitTextStroke: '10px #111', paintOrder: 'stroke fill' }}>Q.E.D.</div>
        <div style={{ fontFamily: POP, fontSize: 88, color: '#fff', marginTop: -10, opacity: clamp((t - 208) / 0.4), WebkitTextStroke: '12px #111', paintOrder: 'stroke fill' }}>（失恋）</div>
        <div style={{ fontFamily: CHALK, fontSize: 96, color: CHALKW, marginTop: 50, opacity: clamp((t - 209.5) / 0.6) }}>Squared<span style={{ color: PINK }}>²</span></div>
        <div style={{ fontFamily: POP, fontSize: 46, color: '#fff', opacity: clamp((t - 209.8) / 0.6) }}>〜僕×君＝好きの2乗!?〜</div>
        <div style={{ fontFamily: POP, fontSize: 36, color: GOLD, marginTop: 26, opacity: clamp((t - 210.4) / 0.6) }}>ただいま正気を失い中</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- main ----------
export const Squared: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const si = shotAt(t);
  const shot = SHOTS[si];
  const nextT = SHOTS[si + 1]?.t ?? 220;
  const fx = shot.fx || {};
  const acc = accent(t);
  const b = env('bass', frame);

  // shake
  const sAmp = ((fx.shake || 0) * (6 + 10 * b) + acc * 26);
  const sx = (random(`sx${frame}`) - 0.5) * sAmp, sy = (random(`sy${frame}`) - 0.5) * sAmp;

  // bridge rotation gag (multiply by i = rotate 90deg)
  let rot = 0;
  if (fx.rot) {
    rot = 90 * easeInOut((t - 153.9) / 0.7) + 90 * easeInOut((t - 156.7) / 0.7);
  }
  const rs = 1 - 0.42 * Math.abs(Math.sin((rot * Math.PI) / 180));

  // cut glitch (first frames of a shot)
  const sinceCut = t - shot.t;
  const glitch = sinceCut < 0.17 && si > 0 && !fx.desat ? 1 - sinceCut / 0.17 : acc > 0.6 ? (acc - 0.6) * 2 : 0;
  const quietLine = LINES.find((l) => t >= l.t && t < l.e);

  const layer = (
    <ImageLayer shot={shot} t={t} nextT={nextT} frame={frame} />
  );

  return (
    <AbsoluteFill style={{ background: '#143428', overflow: 'hidden' }}>
      <Audio src={staticFile('song.wav')} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <AbsoluteFill style={{ transform: `rotate(${rot}deg) scale(${rs})`, boxShadow: rot ? '0 0 0 10px #fff, 0 30px 80px rgba(0,0,0,0.6)' : undefined }}>
          {layer}
        </AbsoluteFill>
        {glitch > 0 && [0, 1, 2].map((i) => {
          const y0 = random(`gy${i}-${frame}`) * 900, hgt = 60 + random(`gh${i}-${frame}`) * 160;
          const off = (random(`go${i}-${frame}`) - 0.5) * 160 * glitch;
          return (
            <AbsoluteFill key={i} style={{ clipPath: `inset(${y0}px 0 ${Math.max(0, H - y0 - hgt)}px 0)`, transform: `translateX(${off}px)`, filter: i === 1 ? 'hue-rotate(90deg) saturate(2)' : undefined }}>
              <AbsoluteFill style={{ transform: `rotate(${rot}deg) scale(${rs})` }}>{layer}</AbsoluteFill>
            </AbsoluteFill>
          );
        })}
        <Floaters t={t} op={t > 207 ? 0 : 1} />
        <Overlays t={t} frame={frame} />
        <AbsoluteFill style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 62%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none' }} />
        <EndCard t={t} frame={frame} />
        <HUD t={t} />
        {LINES.filter((l) => t >= l.t && t < l.e).map((l) => <LyricLine key={l.t} line={l} t={t} frame={frame} />)}
      </AbsoluteFill>
      {/* flash */}
      <AbsoluteFill style={{ background: shot.fx?.tint === 'red' ? RED : '#fff', opacity: acc * 0.35, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ boxShadow: 'inset 0 0 220px rgba(0,0,0,0.55)' }} />
      <AbsoluteFill style={{ background: '#000', opacity: clamp((t - 219.0) / 0.9) }} />
      {quietLine ? null : null}
    </AbsoluteFill>
  );
};
