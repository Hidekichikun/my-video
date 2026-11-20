import React from 'react';
import { AbsoluteFill, Audio, Img, random, staticFile, useCurrentFrame } from 'remotion';
import { LINES, Line } from './lyrics';
import { DURATION, FPS, Fm, GOLD, H, INK, LAV, MIN, MINT, PINK, POP, RED, SER, SONG, W, backOut, clamp, easeInOut, easeOut, env, fadeIO, lerp, rad, useFonts } from './common';
import { Diagrams, dimAt } from './diagrams';
import { MinchoDrift } from './drift';
export { DURATION, FPS };

// ---------- shots ----------
type FX = { shake?: number; pulse?: number; desat?: number; spin?: number };
type Shot = { t: number; img: string; a: [number, number, number]; b: [number, number, number]; fx?: FX };
const S = (t: number, img: string, a: [number, number, number], b: [number, number, number], fx?: FX): Shot => ({ t, img, a, b, fx });
const C: [number, number, number] = [960, 540, 1.0];
export const SHOTS: Shot[] = [
  S(0, '04', [960, 460, 1.0], [960, 480, 1.1]),
  S(7.0, 'thumb', C, [880, 540, 1.1], { pulse: 0.5 }),
  S(18.12, '05', [600, 520, 1.25], [1300, 520, 1.25], { pulse: 0.4 }),
  S(21.22, '05', [1500, 400, 1.5], [1500, 400, 1.62], { pulse: 0.4 }),
  S(23.9, '05', C, [960, 540, 1.05]),
  S(27.08, '06', [960, 520, 1.0], [880, 420, 1.3], { desat: 0.25 }),
  S(29.86, '07', C, [960, 540, 1.06], { desat: 0.15 }),
  S(35.4, '08', [960, 540, 1.0], [960, 540, 1.12], { pulse: 0.5 }),
  S(37.74, '08', [960, 420, 1.3], [960, 420, 1.42], { pulse: 0.8 }),
  S(42.06, '09', C, [960, 540, 1.08], { pulse: 1, shake: 0.4 }),
  S(45.38, '09', [1420, 420, 1.55], [1420, 420, 1.7], { pulse: 0.8 }),
  S(47.88, '09', C, [960, 540, 1.05], { pulse: 0.6 }),
  S(53.9, '10', [1300, 420, 1.5], [1300, 420, 1.6], { pulse: 0.8 }),
  S(57.08, '10', [560, 420, 1.45], [560, 420, 1.6], { pulse: 1, spin: 3 }),
  S(59.72, '11', C, [960, 540, 1.06], { pulse: 1, shake: 0.4 }),
  S(68.08, '11', [960, 480, 1.25], [960, 480, 1.4], { pulse: 1 }),
  S(71.38, '12', C, [960, 520, 1.08]),
  S(74.0, '12', [520, 400, 1.6], [520, 400, 1.72]),
  S(76.2, '12', [1420, 480, 1.6], [1420, 480, 1.72]),
  S(78.64, '12', [960, 420, 1.2], [960, 420, 1.0]),
  S(81.52, '13', [1400, 420, 1.45], [1400, 420, 1.58]),
  S(85.68, '13', [560, 420, 1.4], [560, 420, 1.2], { shake: 0.8, pulse: 1 }),
  S(88.56, '14', C, [960, 540, 1.05]),
  S(95.12, '11', C, [960, 540, 1.08], { pulse: 1, shake: 0.4 }),
  S(98.42, '15', [1300, 420, 1.4], [1300, 420, 1.52], { pulse: 0.8 }),
  S(100.46, '15', [1420, 400, 1.7], [1420, 400, 1.85], { pulse: 0.6 }),
  S(103.48, '15', [1300, 820, 1.7], [1300, 780, 1.85], { pulse: 0.6 }),
  S(107.16, '10', [1300, 420, 1.45], [1300, 420, 1.58], { pulse: 0.8 }),
  S(109.86, '10', [560, 480, 1.3], [700, 480, 1.3], { pulse: 1, spin: 3 }),
  S(112.68, '14', [1440, 540, 1.6], [1440, 540, 1.7], { pulse: 1 }),
  S(115.28, '11', C, [960, 540, 1.06], { pulse: 1 }),
  S(120.9, '09', C, [960, 540, 1.1], { pulse: 1, shake: 0.4 }),
  S(124.02, '16', C, [980, 540, 1.04]),
  S(133.86, '16', [960, 540, 1.04], [960, 540, 1.0]),
  S(144.32, '16', [960, 540, 1.0], [980, 540, 1.04], { pulse: 0.6 }),
  S(147.66, '17', C, [960, 540, 1.08]),
  S(150.0, '17', [960, 420, 1.3], [960, 420, 1.4]),
  S(152.24, '17', C, [960, 540, 1.04]),
  S(166.64, '18', C, [960, 540, 1.12], { shake: 1.6, pulse: 1.4 }),
  S(169.0, '19', [960, 520, 1.0], [1100, 420, 1.35]),
  S(172.44, '20', C, [960, 540, 1.08], { pulse: 1.2, shake: 0.4 }),
  S(175.68, '20', [1400, 420, 1.5], [1400, 420, 1.62], { pulse: 1 }),
  S(178.16, '19', [1200, 420, 1.5], [1200, 420, 1.62], { pulse: 0.7 }),
  S(180.96, '20', [1380, 400, 1.75], [1380, 400, 1.9], { pulse: 1 }),
  S(183.96, '20', C, [960, 540, 1.08], { pulse: 1.2 }),
  S(189.98, '21', C, [960, 540, 1.08]),
  S(196.6, '21', [960, 540, 1.08], [960, 540, 1.16], { desat: 0.2 }),
];
export const DARK = new Set(['11', '16', '17', '20', '06', '14']);
export const shotAt = (t: number) => { let i = 0; for (let k = 0; k < SHOTS.length; k++) if (SHOTS[k].t <= t) i = k; return i; };

const ACCENTS: [number, number][] = [
  [7.0, 0.8], [18.12, 0.4], [37.74, 0.9], [39.14, 0.7], [42.06, 1], [59.72, 0.9], [62.4, 0.6], [85.68, 0.8], [95.12, 1], [112.68, 0.9],
  [124.02, 0.5], [144.32, 0.9], [154.58, 0.8], [161.36, 0.7], [166.64, 1.3], [172.44, 1.2], [180.96, 0.6], [183.96, 1],
];
export const accent = (t: number) => ACCENTS.reduce((m, [a, s]) => (t >= a && t < a + 0.6 ? Math.max(m, s * Math.exp(-(t - a) * 7)) : m), 0);

const ImageLayer: React.FC<{ shot: Shot; t: number; nextT: number; frame: number; dim: number }> = ({ shot, t, nextT, frame, dim }) => {
  const fx = shot.fx || {};
  const p = easeInOut((t - shot.t) / Math.max(0.1, nextT - shot.t));
  const cx = lerp(shot.a[0], shot.b[0], p), cy = lerp(shot.a[1], shot.b[1], p), sc0 = lerp(shot.a[2], shot.b[2], p);
  const s = sc0 * (1 + 0.025 * (fx.pulse || 0) * env('onset', frame));
  const rot = fx.spin ? Math.sin((t - shot.t) * 0.9) * fx.spin : 0;
  let tx = W / 2 - cx * s, ty = H / 2 - cy * s;
  tx = clamp(tx, W - W * s, 0); ty = clamp(ty, H - H * s, 0);
  const filt = [fx.desat ? `grayscale(${fx.desat})` : '', dim > 0 ? `brightness(${1 - dim * 0.72}) saturate(${1 - dim * 0.35})` : ''].join(' ').trim();
  return (
    <AbsoluteFill style={{ transform: `rotate(${rot}deg) scale(${rot ? 1.06 : 1})` }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
        <Img src={staticFile(`cs/sine-${shot.img}.jpg`)} style={{ width: W, height: H, filter: filt || undefined }} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- HUD: section + area meter ----------
const SECTIONS: [number, string][] = [
  [0, '序論'], [18.12, '第1章 平行なファンたち'], [29.86, '復習 内積'], [37.74, '定義 外積'], [42.06, '定理 好きの面積'], [71.38, '第2章 図書室の窓際'],
  [88.56, '比較 cos と sin'], [95.12, '定理 好きの面積'], [124.02, '補講 sinの定義'], [147.66, '第3章 右手の法則'], [166.64, '反例 同時発言'], [172.44, '最終定理 θ＝90°'], [189.98, '結論'],
];
// [time, theta, who]  who: fan / kimi ; flag z: +1 up, -1 down, 0 cancel
const ANG: [number, number, 'fan' | 'kimi'][] = [
  [0, 0, 'fan'], [29.86, 0, 'fan'], [37.74, 90, 'kimi'], [124.02, 90, 'kimi'], [128.9, 30, 'kimi'], [131.5, 30, 'kimi'], [132.42, 90, 'kimi'], [133.86, 150, 'kimi'], [137.72, 60, 'kimi'], [144.32, 90, 'kimi'], [SONG, 90, 'kimi'],
];
const angleAt = (t: number) => {
  let i = 0; for (let k = 0; k < ANG.length; k++) if (ANG[k][0] <= t) i = k;
  const [t0, a0, w0] = ANG[i]; const nx = ANG[i + 1];
  if (!nx) return { th: a0, who: w0 };
  if (w0 !== nx[2]) return { th: a0, who: w0 };
  const p = easeInOut((t - t0) / Math.max(0.1, Math.min(nx[0] - t0, 1.2)));
  return { th: lerp(a0, nx[1], p), who: w0 };
};
const zAt = (t: number) => (t >= 161.36 && t < 166.64 ? -1 : t >= 166.64 && t < 169.0 ? 0 : 1);
const lastOf = <T,>(arr: [number, T][], t: number) => { let r = arr[0]; for (const a of arr) if (a[0] <= t) r = a; return r; };

export const HUD: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  if (t > 196.6) return null;
  const [st, sname] = lastOf(SECTIONS, t);
  const sp = backOut((t - st) / 0.3);
  const { th, who } = angleAt(t);
  const sn = Math.sin(rad(th));
  const z = zAt(t);
  const max = who === 'kimi' && sn > 0.999 && ((t > 42 && t < 71.3) || (t > 95 && t < 124) || t > 172.4);
  const glow = max ? 0.6 + 0.4 * Math.sin(t * 8) : 0;
  const col = who === 'fan' ? PINK : MINT;
  const op = t < 1 ? clamp(t) : 1;
  // mini parallelogram
  const ox = 34, oy = 128, la = 118, lb = 92;
  const bx = ox + Math.cos(rad(th)) * lb, by = oy - Math.sin(rad(th)) * lb;
  const showZ = t >= 152.24 && t < 172.44;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op }}>
      <div style={{ position: 'absolute', left: 40, top: 34, background: 'rgba(12,16,44,0.78)', border: `2px solid rgba(255,255,255,0.7)`, borderRadius: 6, padding: '8px 22px 10px', transform: `scale(${lerp(0.92, 1, clamp(sp))})`, transformOrigin: 'left top' }}>
        <div style={{ fontFamily: MIN, fontSize: 24, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.08em' }}>本日の講義：外積 × <Fm s="sin" /></div>
        <div style={{ fontFamily: MIN, fontSize: 36, color: '#fff', letterSpacing: '0.06em' }}><span style={{ color: MINT }}>§</span> {sname}</div>
      </div>
      <div style={{ position: 'absolute', right: 40, top: 30, width: 540, height: 172, background: 'rgba(12,16,44,0.82)', border: `3px solid ${max ? '#fff' : col}`, borderRadius: 10, boxShadow: max ? `0 0 ${30 * glow}px ${MINT}, 0 0 ${60 * glow}px ${LAV}` : undefined }}>
        <svg width={250} height={172} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <polygon points={`${ox},${oy} ${ox + la},${oy} ${ox + la + bx - ox},${by} ${bx},${by}`} fill={max ? `rgba(47,230,196,${0.35 + 0.25 * glow})` : 'rgba(180,140,255,0.3)'} stroke="#fff" strokeWidth={2} />
          <line x1={ox} y1={oy} x2={ox + la} y2={oy} stroke={LAV} strokeWidth={6} strokeLinecap="round" />
          <line x1={ox} y1={oy + (th < 1 ? 5 : 0)} x2={bx} y2={by + (th < 1 ? 5 : 0)} stroke={col} strokeWidth={6} strokeLinecap="round" />
          {showZ && z !== 0 && <><line x1={ox} y1={oy} x2={ox} y2={oy - 100 * z} stroke="#fff" strokeWidth={6} /><polygon points={`${ox},${oy - 112 * z} ${ox - 9},${oy - 94 * z} ${ox + 9},${oy - 94 * z}`} fill="#fff" /></>}
          <text x={ox + la} y={oy + 30} fontFamily={MIN} fontSize={20} fill={LAV} textAnchor="end">僕</text>
          <text x={bx + 10} y={by + (th < 10 ? 34 : 0)} fontFamily={MIN} fontSize={20} fill={col}>{who === 'fan' ? 'ファン' : '君'}</text>
        </svg>
        <div style={{ position: 'absolute', left: 240, top: 14, fontFamily: MIN, fontSize: 26, color: '#fff' }}>僕×{who === 'fan' ? 'ファン' : '君'}{showZ ? <span style={{ fontSize: 22, color: z > 0 ? '#fff' : z < 0 ? RED : GOLD }}>　{z > 0 ? '↑ 上向き' : z < 0 ? '↓ 逆向き' : '＝ 0 !?'}</span> : null}</div>
        <div style={{ position: 'absolute', left: 240, top: 52, fontSize: 44, color: '#fff' }}><Fm s={`θ ＝ ${Math.round(th)}°`} /></div>
        <div style={{ position: 'absolute', left: 240, top: 104, fontSize: 44, color: max ? GOLD : col, transform: `scale(${max ? 1 + 0.05 * glow : 1})`, transformOrigin: 'left center' }}><Fm s={`sinθ ＝ ${sn.toFixed(2)}`} /></div>
      </div>
      {max && <div style={{ position: 'absolute', right: 52, top: 214, fontFamily: POP, fontSize: 38, color: GOLD, WebkitTextStroke: '6px #111', paintOrder: 'stroke fill', letterSpacing: 3 }}>好きの面積 MAX!!</div>}
    </div>
  );
};

// ---------- lyrics ----------
type Tok = { k: 't' | 'h' | 'p' | 'm'; v: string; w?: string };
const parse = (s: string): Tok[] => {
  const out: Tok[] = [];
  const re = /\*([^*]+)\*|\[([^\]]+)\]|<([^|>]+)\|([^>]+)>/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ k: 't', v: s.slice(last, m.index) });
    if (m[1]) out.push({ k: 'h', v: m[1] }); else if (m[2]) out.push({ k: 'p', v: m[2] }); else out.push({ k: 'm', v: m[3], w: m[4] });
    last = re.lastIndex;
  }
  if (last < s.length) out.push({ k: 't', v: s.slice(last) });
  return out;
};
const units = (toks: Tok[]) => toks.reduce((n, tk) => n + (tk.k === 'm' ? Math.max([...tk.v].length * 0.75, [...(tk.w || '')].length * 0.8) : [...tk.v].length), 0);
const KIND: Record<string, { size: number; fill: string; stroke: string; sw: number; shadow: string }> = {
  n: { size: 72, fill: '#fff', stroke: '#141414', sw: 14, shadow: `6px 6px 0 ${LAV}` },
  c: { size: 88, fill: '#fff', stroke: '#141414', sw: 16, shadow: `7px 7px 0 ${LAV}, -3px -3px 0 ${MINT}` },
  q: { size: 60, fill: '#fff', stroke: '#202020', sw: 10, shadow: '0 0 18px rgba(0,0,0,0.6)' },
  k: { size: 96, fill: '#fff', stroke: '#141414', sw: 0, shadow: `0 0 18px ${MINT}` },
  r: { size: 58, fill: '#eafffb', stroke: '#06302a', sw: 10, shadow: `0 0 16px ${MINT}, 0 0 30px #0aa88a` },
  s: { size: 120, fill: '#fff', stroke: '#000', sw: 16, shadow: `8px 0 0 ${RED}, -8px 0 0 ${MINT}` },
};
const WHO: Record<string, string> = { 僕: 'prince', 君: 'rikei', 彼女: 'rikei' };
const WHOCOL: Record<string, string> = { prince: LAV, rikei: MINT, rikei2: MINT };

export const LyricLine: React.FC<{ line: Line; t: number; frame: number; narrow?: boolean }> = ({ line, t, frame, narrow }) => {
  const toks = parse(line.text);
  const st = KIND[line.kind];
  const n = units(toks);
  const maxW = narrow ? 960 : line.kind === 'k' ? 1500 : 1760;
  const size = Math.min(st.size, maxW / (n * 1.02));
  const dur = line.e - line.t;
  const stagger = Math.min(line.kind === 's' ? 0.05 : 0.04, (dur * 0.45) / Math.max(1, n));
  const out = clamp((line.e - t) / 0.18);
  const lt = t - line.t;
  let idx = 0;
  const shakeAmt = line.kind === 's' ? 9 : 0;
  const beat = line.kind === 'c' ? 1 + 0.04 * env('onset', frame) : 1;
  const hiCol = line.kind === 'r' ? GOLD : line.kind === 'k' ? MINT : GOLD;
  const charEl = (ch: string, i: number, extra?: React.CSSProperties) => {
    const p = clamp((lt - i * stagger) / 0.13);
    const sc = line.kind === 'q' || line.kind === 'r' ? lerp(1.15, 1, easeOut(p)) : lerp(1.9, 1, backOut(p));
    const jx = shakeAmt ? (random(`jx${i}-${frame}`) - 0.5) * shakeAmt : 0, jy = shakeAmt ? (random(`jy${i}-${frame}`) - 0.5) * shakeAmt : 0;
    const math = /[×＝θ°|]/.test(ch);
    return <span key={i} style={{ display: 'inline-block', opacity: p, transform: `translate(${jx}px,${jy}px) scale(${sc})`, whiteSpace: 'pre', fontFamily: math ? MIN : undefined, ...extra }}>{ch}</span>;
  };
  const nodes: React.ReactNode[] = [];
  toks.forEach((tk, ti) => {
    if (tk.k === 't') [...tk.v].forEach((ch) => { nodes.push(charEl(ch, idx)); idx++; });
    else if (tk.k === 'h') {
      const startIdx = idx;
      const chars = [...tk.v].map((ch) => { const el = charEl(ch, idx, { color: hiCol }); idx++; return el; });
      const hp = clamp((lt - startIdx * stagger) / 0.2);
      nodes.push(<span key={`h${ti}`} style={{ display: 'inline-block', transform: `rotate(${lerp(-8, ti % 2 ? 2 : -2, easeOut(hp))}deg)` }}>{chars}</span>);
    } else if (tk.k === 'p') {
      const [word, forced] = tk.v.split('@');
      const who = forced || WHO[word] || 'rikei';
      const p = clamp((lt - idx * stagger) / 0.2);
      nodes.push(
        <span key={`p${ti}`} style={{ position: 'relative', display: 'inline-block', fontSize: '1.3em', lineHeight: 1, verticalAlign: '-0.08em', margin: '0 0.04em', opacity: clamp(p * 2), transform: `scale(${lerp(2.2, 1, backOut(p))}) rotate(${Math.sin(t * 5 + ti) * 6}deg)` }}>
          <span style={{ color: '#111', WebkitTextStroke: `${Math.max(14, st.sw * 1.6)}px #111`, paintOrder: 'stroke fill', textShadow: `5px 5px 0 ${WHOCOL[who]}` }}>{word}</span>
          <span style={{ position: 'absolute', left: 0, top: 0, color: '#fff', WebkitTextStroke: `${Math.max(7, st.sw * 0.8)}px #fff`, paintOrder: 'stroke fill', textShadow: 'none' }}>{word}</span>
          <span style={{ position: 'absolute', left: 0, top: 0, color: 'transparent', backgroundImage: `url(${staticFile(`cs/face-${who}.jpg`)})`, backgroundSize: '115% auto', backgroundPosition: '50% 40%', WebkitBackgroundClip: 'text', backgroundClip: 'text', textShadow: 'none', WebkitTextStroke: '0px' }}>{word}</span>
        </span>,
      );
      idx++;
    } else {
      const at = idx * stagger;
      const mt = at + Math.min(0.55, Math.max(0.28, dur * 0.18));
      const p1 = clamp((lt - at) / 0.13), mp = clamp((lt - mt) / 0.12), flash = clamp(1 - Math.abs(lt - mt) / 0.12);
      nodes.push(
        <span key={`m${ti}`} style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ display: 'inline-block', opacity: p1 * clamp(1 - mp * 2), transform: `scale(${lerp(1.6, 1, backOut(p1)) * lerp(1, 0.4, mp)})`, fontSize: '0.75em', whiteSpace: 'nowrap', position: mp >= 1 ? 'absolute' : 'relative', left: 0, top: 0 }}>{tk.v}</span>
          <span style={{ display: 'inline-block', opacity: mp, color: line.kind === 'k' ? '#fff' : GOLD, transform: `scale(${lerp(2.4, 1, backOut(mp))}) rotate(${lerp(-25, 0, easeOut(mp))}deg)`, whiteSpace: 'nowrap', position: mp >= 1 ? 'relative' : 'absolute', left: 0, top: 0, textShadow: `0 0 ${18 * flash}px #fff, ${st.shadow}` }}><Fm s={tk.w || ''} hi={line.kind === 'k' ? MINT : undefined} /></span>
        </span>,
      );
      idx += Math.max([...tk.v].length * 0.75, 1);
    }
  });
  if (line.kind === 'k') {
    const pin = backOut(clamp(lt / 0.25));
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: narrow ? 330 : 40, display: 'flex', justifyContent: 'center', opacity: out, transform: `translateY(${(1 - pin) * 200}px) scale(${1 + 0.03 * env('onset', frame)})` }}>
        <div style={{ position: 'relative', background: 'rgba(12,16,44,0.88)', backgroundImage: `linear-gradient(rgba(47,230,196,0.13) 2px, transparent 2px), linear-gradient(90deg, rgba(180,140,255,0.13) 2px, transparent 2px)`, backgroundSize: '40px 40px', border: `3px solid ${MINT}`, outline: `2px solid ${LAV}`, outlineOffset: 6, borderRadius: 6, padding: narrow ? '22px 30px 16px' : '24px 70px 20px', minWidth: narrow ? 900 : 1100, boxShadow: `0 0 40px rgba(47,230,196,0.35)` }}>
          <div style={{ position: 'absolute', left: 22, top: 8, fontFamily: MIN, fontSize: 24, color: LAV, letterSpacing: '0.2em' }}>定理</div>
          <div style={{ fontFamily: POP, fontSize: size, color: st.fill, lineHeight: 1.2, whiteSpace: 'nowrap', textAlign: 'center', textShadow: st.shadow }}>{nodes}</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: narrow ? 360 : line.kind === 's' ? 70 : 58, textAlign: 'center',
      fontFamily: POP, fontSize: size, color: st.fill, lineHeight: 1.25, WebkitTextStroke: `${st.sw * (size / st.size)}px ${st.stroke}`, paintOrder: 'stroke fill', textShadow: st.shadow,
      opacity: out, transform: `translateY(${(1 - out) * -20}px) scale(${beat}) rotate(${line.kind === 'c' ? -1.5 : line.kind === 'r' ? 1 : 0}deg)`, padding: '0 40px',
    }}>{nodes}</div>
  );
};

// ---------- title & end ----------
const Title: React.FC<{ t: number }> = ({ t }) => {
  if (t < 7.0 || t > 18.0) return null;
  const op = fadeIO(t, 7.0, 17.9, 0.6);
  const r = (d: number) => ({ opacity: clamp((t - d) / 0.6), transform: `translateY(${(1 - easeOut((t - d) / 0.8)) * 24}px)` });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(0,0,0,0) 45%, rgba(8,10,34,${0.78 * op}) 70%)` }}>
      <div style={{ position: 'absolute', right: 110, top: 300, textAlign: 'right', opacity: op, color: '#fff', fontFamily: MIN, whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: 40, letterSpacing: '0.35em', color: GOLD, ...r(7.4) }}>恋する数学講義　第3講</div>
        <div style={{ fontFamily: SER, fontStyle: 'italic', fontWeight: 600, fontSize: 230, lineHeight: 1.0, textShadow: `0 0 30px ${MINT}`, ...r(8.0) }}>Sine</div>
        <div style={{ fontSize: 64, letterSpacing: '0.08em', ...r(8.8) }}>〜僕<span style={{ margin: '0 0.15em' }}>×</span>君＝好きの面積!?〜</div>
        <div style={{ fontSize: 30, letterSpacing: '0.3em', marginTop: 34, color: 'rgba(255,255,255,0.8)', ...r(9.6) }}>ただいま正気を失い中</div>
      </div>
    </AbsoluteFill>
  );
};
const END0 = 197.0;
const EndCard: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  if (t < END0) return null;
  const p = clamp((t - END0) / 0.8);
  const o = env('onset', frame);
  return (
    <AbsoluteFill style={{ background: `rgba(8,10,34,${0.88 * p})`, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', opacity: p, color: '#fff', fontFamily: MIN, whiteSpace: 'nowrap' }}>
        <div style={{ fontFamily: SER, fontStyle: 'italic', fontWeight: 700, fontSize: 190, color: GOLD, transform: `scale(${lerp(1.4, 1, easeOut(p)) * (1 + 0.02 * o)})` }}>Q.E.D.</div>
        <div style={{ fontSize: 64, marginTop: -6, opacity: clamp((t - END0 - 0.6) / 0.5) }}>（<span style={{ color: MINT }}>違うからこそ最大</span>）</div>
        <div style={{ fontFamily: SER, fontStyle: 'italic', fontWeight: 600, fontSize: 100, marginTop: 40, opacity: clamp((t - END0 - 1.2) / 0.5) }}>Sine</div>
        <div style={{ fontSize: 46, opacity: clamp((t - END0 - 1.4) / 0.5) }}>〜僕×君＝好きの面積!?〜</div>
        <div style={{ fontSize: 30, letterSpacing: '0.3em', marginTop: 26, color: 'rgba(255,255,255,0.8)', opacity: clamp((t - END0 - 1.8) / 0.5) }}>恋する数学講義 第3講　／　ただいま正気を失い中</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- main ----------
export const Sine: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const si = shotAt(t);
  const shot = SHOTS[si];
  const nextT = SHOTS[si + 1]?.t ?? SONG;
  const fx = shot.fx || {};
  const acc = accent(t);
  const b = env('bass', frame);
  const sAmp = (fx.shake || 0) * (6 + 10 * b) + acc * 22;
  const sx = (random(`sx${frame}`) - 0.5) * sAmp, sy = (random(`sy${frame}`) - 0.5) * sAmp;
  const sinceCut = t - shot.t;
  const glitch = sinceCut < 0.15 && si > 0 && SHOTS[si - 1].img !== shot.img ? 1 - sinceCut / 0.15 : 0;
  const dim = dimAt(t);
  const dark = DARK.has(shot.img) || dim > 0.3 || shot.img === 'thumb' || shot.img === '04';
  return (
    <AbsoluteFill style={{ background: '#0c1030', overflow: 'hidden' }}>
      <Audio src={staticFile('song.wav')} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <ImageLayer shot={shot} t={t} nextT={nextT} frame={frame} dim={dim} />
        {glitch > 0 && <AbsoluteFill style={{ background: '#fff', opacity: glitch * 0.35 }} />}
        <MinchoDrift t={t} strength={t > END0 ? 0 : dim > 0.3 ? 0.55 : 1} dark={dark} />
        <Title t={t} />
        <Diagrams t={t} />
        <AbsoluteFill style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 64%, rgba(0,0,0,0.5) 100%)' }} />
        <EndCard t={t} frame={frame} />
        <HUD t={t} frame={frame} />
        {LINES.filter((l) => t >= l.t && t < l.e).map((l) => <LyricLine key={l.t} line={l} t={t} frame={frame} />)}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: '#fff', opacity: acc * 0.25, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ boxShadow: 'inset 0 0 220px rgba(0,0,0,0.45)' }} />
      <AbsoluteFill style={{ background: '#000', opacity: clamp((t - (SONG - 0.9)) / 0.8) }} />
    </AbsoluteFill>
  );
};
export const _k = INK;
