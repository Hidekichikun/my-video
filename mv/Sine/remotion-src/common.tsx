import React, { useEffect, useState } from 'react';
import { Img, continueRender, delayRender, staticFile } from 'remotion';
import ENV from './env.json';

export const FPS = 30;
export const SONG = 207.96;
export const DURATION = Math.round(SONG * FPS);
export const W = 1920, H = 1080;

const FB = ", 'DejaVu Sans', sans-serif";
export const POP = 'Nikumaru' + FB;
export const MIN = "Genkai, 'DejaVu Serif', serif";
export const SER = "Cormorant, Genkai, 'DejaVu Serif', serif";
export const SERI = "CormorantI, Genkai, 'DejaVu Serif', serif";
export const LAV = '#b48cff', MINT = '#2fe6c4', PINK = '#ff5fa8', GOLD = '#ffd45c', RED = '#ff3b5c', NAVY = '#141a3a', INK = '#0d1030', WHITE = '#ffffff';

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const easeOut = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
export const easeInOut = (p: number) => { p = clamp(p); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
export const backOut = (p: number) => { p = clamp(p); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
export const env = (k: 'bass' | 'onset' | 'loud', f: number) => (ENV as any)[k][Math.max(0, Math.min((ENV as any)[k].length - 1, f))] as number;
export const fadeIO = (t: number, a: number, b: number, d = 0.35) => clamp(Math.min((t - a) / d, (b - t) / d));
export const rad = (d: number) => (d * Math.PI) / 180;

const FONTS: [string, string, FontFaceDescriptors?][] = [
  ['Nikumaru', 'NikumaruFont.otf'], ['Genkai', 'GenkaiMincho.ttf'],
  ['Cormorant', 'CormorantGaramond-VF.ttf', { weight: '300 700' }], ['CormorantI', 'CormorantGaramond-Italic-VF.ttf', { weight: '300 700' }],
];
export const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(FONTS.map(([n, f, d]) => { const ff = new FontFace(n, `url(${staticFile(f)})`, d); return ff.load().then((x) => { (document.fonts as any).add(x); }); }))
      .then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
  }, [h]);
};

// ---- math typesetting: latin letters in serif italic, digits in serif, rest in Mincho ----
export const Fm: React.FC<{ s: string; color?: string; hi?: string }> = ({ s, color, hi }) => {
  const out: React.ReactNode[] = [];
  const cs = [...s];
  for (let i = 0; i < cs.length; i++) {
    const c = cs[i];
    if (/[a-zA-Z]/.test(c)) {
      // keep words like sin / cos / Q.E.D. upright, single letters italic
      let j = i; while (j < cs.length && /[a-zA-Z]/.test(cs[j])) j++;
      const word = cs.slice(i, j).join('');
      const upright = word.length > 1;
      out.push(<span key={i} style={{ fontFamily: upright ? SER : SERI, fontWeight: 600, fontSize: '1.12em', color: !upright && hi ? hi : undefined, letterSpacing: upright ? '0.01em' : 0, margin: upright ? '0 0.04em' : '0 0.02em' }}>{word}</span>);
      i = j - 1;
    } else if (/[0-9.]/.test(c)) out.push(<span key={i} style={{ fontFamily: SER, fontWeight: 600, fontSize: '1.1em', fontFeatureSettings: '"lnum" 1' }}>{c}</span>);
    else if (c === '·' || c === '・') out.push(<span key={i} style={{ fontFamily: MIN, fontWeight: 700, margin: '0 0.02em' }}>・</span>);
    else if (c === 'θ') out.push(<span key={i} style={{ fontFamily: MIN, fontStyle: 'italic', color: hi || undefined }}>θ</span>);
    else if (/[＝=×＋+−]/.test(c)) out.push(<span key={i} style={{ fontFamily: MIN, margin: '0 0.08em' }}>{c === '=' ? '＝' : c}</span>);
    else if (c === '|') out.push(<span key={i} style={{ fontFamily: MIN, margin: '0 0.04em' }}>|</span>);
    else out.push(<span key={i} style={{ fontFamily: MIN }}>{c}</span>);
  }
  return <span style={{ color, whiteSpace: 'nowrap', fontFeatureSettings: '"lnum" 1' }}>{out}</span>;
};

// ---- vector arrow (screen space, angle CCW in degrees) ----
export const Vec: React.FC<{ x: number; y: number; len: number; ang: number; color: string; w?: number; p?: number; op?: number; who?: string; R?: number; glow?: boolean }> = ({ x, y, len, ang, color, w = 14, p = 1, op = 1, who, R = 54, glow }) => {
  const a = rad(ang);
  const L = len * easeOut(p);
  if (L < 1) return null;
  const ex = x + Math.cos(a) * L, ey = y - Math.sin(a) * L;
  const hs = w * 2.5;
  const h1x = ex - Math.cos(a - 0.45) * hs, h1y = ey + Math.sin(a - 0.45) * hs;
  const h2x = ex - Math.cos(a + 0.45) * hs, h2y = ey + Math.sin(a + 0.45) * hs;
  const bx = ex - Math.cos(a) * hs * 0.6, by = ey + Math.sin(a) * hs * 0.6;
  const fcx = ex + Math.cos(a) * (R + 10), fcy = ey - Math.sin(a) * (R + 10);
  const fp = clamp((p - 0.2) / 0.5);
  return (
    <>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity: op, filter: glow ? `drop-shadow(0 0 14px ${color})` : undefined }}>
        <line x1={x} y1={y} x2={bx} y2={by} stroke={INK} strokeWidth={w + 8} strokeLinecap="round" />
        <line x1={x} y1={y} x2={bx} y2={by} stroke={color} strokeWidth={w} strokeLinecap="round" />
        <polygon points={`${ex},${ey} ${h1x},${h1y} ${h2x},${h2y}`} fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      </svg>
      {who && fp > 0 && <FaceBadge who={who} x={fcx} y={fcy} size={R * 2} p={fp} ring={color} op={op} />}
    </>
  );
};

export const FaceBadge: React.FC<{ who: string; x: number; y: number; size: number; p: number; ring?: string; op?: number }> = ({ who, x, y, size, p, ring = '#fff', op = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: size, height: size, transform: `translate(-50%,-50%) scale(${backOut(p)})`, borderRadius: '50%', overflow: 'hidden', border: `${Math.max(4, size * 0.07)}px solid ${ring}`, boxShadow: `0 0 0 ${Math.max(3, size * 0.04)}px ${INK}, 0 8px 18px rgba(0,0,0,0.45)`, opacity: op * clamp(p * 3), background: '#fff' }}>
    <Img src={staticFile(`cs/face-${who}.jpg`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  </div>
);

// caption in Mincho (front, crisp) — used when a diagram is the main subject
export const Cap: React.FC<{ t: number; a: number; b: number; x: number; y: number; size?: number; children: React.ReactNode; color?: string; anchor?: 'c' | 'l' }> = ({ t, a, b, x, y, size = 60, children, color = '#fff', anchor = 'c' }) => {
  if (t < a || t > b) return null;
  const op = fadeIO(t, a, b, 0.4);
  const rise = (1 - easeOut((t - a) / 0.6)) * 18;
  return (
    <div style={{ position: 'absolute', left: x, top: y + rise, transform: `translate(${anchor === 'c' ? '-50%' : '0'}, -50%)`, fontFamily: MIN, fontSize: size, color, opacity: op, whiteSpace: 'nowrap', lineHeight: 1.2, letterSpacing: '0.04em', textShadow: '0 0 18px rgba(5,8,30,0.95), 0 0 4px rgba(5,8,30,0.95), 0 2px 0 rgba(5,8,30,0.9)' }}>{children}</div>
  );
};
