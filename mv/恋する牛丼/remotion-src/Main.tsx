import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, Img, Sequence, continueRender, delayRender, random, staticFile, useCurrentFrame } from 'remotion';
import { FPS, H, MIN, NAVY, POP, SONG, TOTAL, W, backOut, bounce, clamp, easeInOut, easeOut, fadeIO, lerp } from './common';
import { LINES, Line } from './lyrics';
import { CHUNK_T } from './chunkTimes';
import { YUSEI } from './yusei';

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all([
      ...[['Nikumaru', 'NikumaruFont.otf'], ['Genkai', 'GenkaiMincho.ttf'], ['Otsutome', 'OtsutomeFont_Ver3_16.ttf']].map(([n, f]) => new FontFace(n, `url(${staticFile(f)})`).load().then((x) => (document.fonts as any).add(x))),
      ...YUSEI.map(([f, r]) => new FontFace('Yusei', `url(${staticFile('yusei/' + f)})`, r ? { unicodeRange: r } : {}).load().then((x) => (document.fonts as any).add(x))),
    ])
      .then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
const STROKE = '#2a1206';
const HAND = "Yusei, Otsutome, Nikumaru, sans-serif";
// マジックのかすれ: 0=うっすら 1=しっかり
const KasureDefs = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }}>
    <defs>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <filter key={i} id={`kasure${i}`} x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency={i < 3 ? '0.012 0.7' : '0.01 0.45'} numOctaves={2} seed={i * 7 + 1} result="n" />
          <feColorMatrix in="n" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  14 0 0 0 ${i < 3 ? -4.4 : -5.8}`} result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
      ))}
    </defs>
  </svg>
);
const step8 = (t: number) => Math.floor(t * 8);

// ================= shots =================
type V3 = [number, number, number];
type Alt = { img: string; mode: 'blink' | 'flip' | 'at' | 'cycle'; rate?: number; at?: number; until?: number; imgs?: string[] };
type Shot = { t: number; img: string; a: V3; b: V3; cut?: boolean; alt?: Alt; top?: 'slow1' | 'fast'; vhs?: boolean; mono?: boolean; real?: boolean; dim?: boolean };
// オフィスで叫ぶ絵。Codexで 45_office_shout（メガネの同僚がビクッ・電気ついてる）ができたら '45' に変える
const OFFICE_SHOUT = '45';
// 電気がついたオフィス（Codexで 27_office_lit / 27b_office_lit ができたら '27L' / '27bL' に）
const OFFICE_WAKE = '27L', OFFICE_MUTTER = '27bL';
// 1:42〜 女将さんのパラパラ（39_okami_fast_p1〜p4 ができたら true）
const FAST_FLIP = true;
// 女将さんの声（voice/gyudon/okami_01〜03.wav が入ったら true）
const OKAMI_VOICE = true;
// 現実の女将さん（明るい牛丼チェーンの店内）。46_okami_real / 46b ができたら true
const OKAMI_REAL = true;
const C: V3 = [960, 540, 1.0];
const S = (t: number, img: string, a: V3, b: V3, o: Partial<Shot> = {}): Shot => ({ t, img, a, b, ...o });
const blink = (img: string): Alt => ({ img, mode: 'blink' });
const flip = (img: string, rate: number): Alt => ({ img, mode: 'flip', rate });
const at = (img: string, a: number, u = 999): Alt => ({ img, mode: 'at', at: a, until: u });

const REW = ['26', '25', '22', '21', '20', '18', '15', '13', '12', '11'];
const SHOTS: Shot[] = [
  S(0, '03', [960, 540, 1.05], [960, 520, 1.16]),
  S(4.18, '04', [900, 500, 1.1], [1000, 470, 1.2], { alt: blink('04b') }),
  S(7.7, '05', C, [960, 600, 1.15]),
  S(16.0, '06', C, [960, 480, 1.12], { alt: blink('06b') }),
  S(25.0, '30', [960, 520, 1.05], [960, 480, 1.18], { alt: blink('30b') }),
  S(28.12, '31', C, [1100, 480, 1.15]),
  S(30.0, '08', [960, 560, 1.1], [960, 560, 1.22]),
  S(33.94, '09', [700, 540, 1.15], [1200, 540, 1.15]),
  S(38.54, '10', C, [960, 430, 1.28]),
  S(44.38, '32', C, [1000, 480, 1.1], { cut: true, alt: at('32b', 44.6, 46.2) }),
  S(47.16, '32', [1000, 420, 1.5], [1000, 420, 1.62], { alt: at('32b', 47.3, 47.9) }),
  S(50.0, '33', C, [1150, 520, 1.18]),
  S(53.1, '13', [1050, 300, 1.9], [1050, 300, 2.0], { alt: flip('13b', 4) }),
  S(55.96, '14', C, [1100, 540, 1.12], { alt: flip('14b', 6) }),
  S(60.2, '34', C, [960, 540, 1.1], { alt: flip('34b', 3) }),
  S(64.4, '35', [960, 540, 1.05], [800, 420, 1.2]),
  S(67.3, '16', C, [800, 500, 1.15]),
  S(70.18, '17', C, [960, 540, 1.1]),
  S(73.32, '36', C, [960, 480, 1.15]),
  S(77.84, '18', [640, 480, 1.7], [640, 480, 1.82], { cut: true }),
  S(81.42, '37', C, [1200, 450, 1.25], { cut: true }),
  S(87.44, '20', [700, 380, 1.7], [700, 380, 1.8]),
  S(92.98, '21', [700, 450, 1.6], [700, 480, 1.72]),
  S(96.12, '38', C, [1250, 460, 1.18], { alt: flip('38b', 4) }),
  S(98.98, '14', [1100, 540, 1.12], C, { alt: flip('14b', 6) }),
  S(102.6, '39', C, [960, 540, 1.1], { cut: true, alt: FAST_FLIP ? { img: '39p1', mode: 'cycle', imgs: ['39p1', '39p2', '39p3', '39p4'], rate: 8, until: 109.2 } : undefined }),
  S(110.24, '23', C, [960, 500, 1.15]),
  S(112.82, '24', [960, 520, 1.1], [960, 680, 1.25]),
  S(116.0, '40', C, [1000, 440, 1.2], { alt: blink('40b') }),
  S(121.0, '41', C, [960, 460, 1.15]),
  S(129.86, '26', [870, 330, 2.2], [870, 330, 2.32]),
  S(132.84, '42', C, [960, 480, 1.15], { alt: at('42b', 134.0) }),
  S(135.42, '41', [960, 460, 1.15], C),
  // v3: お店は全部、残業でトリップしてたオレの妄想。「……そうだ。」でオフィスに戻る
  S(141.28, OFFICE_WAKE, C, [820, 470, 1.12], { cut: true, real: true }),
  S(144.1, OFFICE_MUTTER, [960, 520, 1.15], [900, 470, 1.32], { cut: true, real: true }),
  S(149.6, OFFICE_SHOUT, [900, 500, 1.15], [960, 540, 1.05], { cut: true, real: true }),
  S(153.2, OFFICE_SHOUT, [1600, 560, 1.9], [1600, 560, 2.0], { cut: true, real: true }),
  ...REW.map((img, i) => S(158.78 + i * 0.32, img, C, C, { cut: true, vhs: true })),
  S(161.98, '37', C, C, { cut: true, vhs: true }),
  S(162.45, '19', C, [960, 540, 1.06], { cut: true }),
  S(163.1, 'TOP', C, [960, 540, 1.06], { cut: true, top: 'fast' }),
  // 現実の女将さん（妄想とは別）
  // 回想のあと、オフィスに戻って 吹き出しの中の女将さん「いらっしゃい！」
  S(165.6, OFFICE_MUTTER, [960, 520, 1.15], [900, 470, 1.25], { cut: true, real: true }),
  S(168.0, 'TITLE', C, C, { cut: true }),
];
const shotIdx = (t: number) => { let i = 0; for (let k = 0; k < SHOTS.length; k++) if (SHOTS[k].t <= t) i = k; return i; };
const imgFor = (s: Shot, t: number) => {
  const a = s.alt; if (!a) return s.img;
  if (a.mode === 'blink') { const ph = (t - s.t) % 2.6; return ph > 2.3 && ph < 2.45 ? a.img : s.img; }
  if (a.mode === 'cycle' && a.imgs && a.until && t >= a.until) return a.imgs[a.imgs.length - 1];
  if (a.mode === 'cycle' && a.imgs) return a.imgs[Math.floor((t - s.t) * (a.rate || 10)) % a.imgs.length];
  if (a.mode === 'flip') return Math.floor((t - s.t) * (a.rate || 4)) % 2 ? a.img : s.img;
  return t >= (a.at || 0) && t < (a.until || 999) ? a.img : s.img;
};

// ================= top-down bowl (fast build) =================
const BOWL = 1010;
const Bowl: React.FC<{ lt: number }> = ({ lt }) => {
  const mask = `radial-gradient(circle at 50% 50%, #000 ${BOWL * 0.366}px, transparent ${BOWL * 0.372}px)`;
  const lay: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%' };
  const lineP = easeInOut((lt - 0.1) / 0.6), mouthP = clamp((lt - 0.75) / 0.3);
  const cheekL = clamp((lt - 1.05) / 0.45), cheekR = clamp((lt - 1.25) / 0.45), yolk = clamp((lt - 1.6) / 0.55);
  const wink = lt - 2.2;
  return (
    <div style={{ position: 'absolute', left: W / 2 - BOWL / 2, top: H / 2 - BOWL / 2, width: BOWL, height: BOWL }}>
      <div style={{ ...lay, borderRadius: '50%', transform: 'scale(0.74) translateY(30px)', background: 'rgba(0,0,0,0.55)', filter: 'blur(30px)' }} />
      <div style={{ ...lay, WebkitMaskImage: mask, maskImage: mask }}>
        <Img src={staticFile('gy/02b.jpg')} style={lay} />
        {lineP > 0 && <Img src={staticFile('gy/02c_lines.png')} style={{ ...lay, WebkitMaskImage: `linear-gradient(90deg, #000 ${lineP * 112 - 12}%, transparent ${lineP * 112}%)` }} />}
        {mouthP > 0 && <Img src={staticFile('gy/02c_mouth.png')} style={{ ...lay, transformOrigin: '50% 63%', transform: `scale(${backOut(mouthP)})` }} />}
        {cheekL > 0 && <div style={{ ...lay, clipPath: 'inset(0 50% 0 0)' }}><Img src={staticFile('gy/02c_cheeks.png')} style={{ ...lay, transform: `translateY(${-320 * (1 - bounce(cheekL))}px)` }} /></div>}
        {cheekR > 0 && <div style={{ ...lay, clipPath: 'inset(0 0 0 50%)' }}><Img src={staticFile('gy/02c_cheeks.png')} style={{ ...lay, transform: `translateY(${-320 * (1 - bounce(cheekR))}px)` }} /></div>}
        {yolk > 0 && <Img src={staticFile('gy/02c_yolk.png')} style={{ ...lay, transformOrigin: '38% 48%', transform: `translateY(${-520 * (1 - bounce(yolk))}px) scale(${1 + 0.25 * (1 - yolk)})` }} />}
      </div>
      {wink > 0 && wink < 1.4 && <Star x={BOWL * 0.66} y={BOWL * 0.45} s={110 * backOut(wink / 0.3)} op={1 - clamp((wink - 0.9) / 0.5)} />}
      {wink > 0 && <div style={{ ...lay, borderRadius: '50%', transform: 'scale(0.745)', boxShadow: `0 0 ${130 + 50 * Math.sin(lt * 5)}px rgba(255,210,110,${0.6 * clamp(wink / 0.6)})` }} />}
    </div>
  );
};
const Star: React.FC<{ x: number; y: number; s: number; op: number; color?: string }> = ({ x, y, s, op, color = '#fff6c8' }) => (
  <svg width={s * 2} height={s * 2} viewBox="-1 -1 2 2" style={{ position: 'absolute', left: x - s, top: y - s, opacity: op, filter: 'drop-shadow(0 0 12px rgba(255,220,120,0.9))' }}>
    <path d="M0,-1 C0.08,-0.25 0.25,-0.08 1,0 C0.25,0.08 0.08,0.25 0,1 C-0.08,0.25 -0.25,0.08 -1,0 C-0.25,-0.08 -0.08,-0.25 0,-1Z" fill={color} />
  </svg>
);
const TopBg: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Img src={staticFile('gy/26.jpg')} style={{ width: W, height: H, filter: 'blur(22px) brightness(0.55) saturate(1.2)', transform: 'scale(1.12)' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,170,80,0.35), rgba(20,8,0,0.55) 70%)' }} />
    <Speed t={t} color="rgba(255,230,180,0.35)" />
  </AbsoluteFill>
);

// ================= manga FX =================
const Speed: React.FC<{ t: number; color?: string; n?: number }> = ({ t, color = 'rgba(255,255,255,0.75)', n = 70 }) => {
  const st = step8(t);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      {[...Array(n)].map((_, i) => {
        const a = (i / n) * Math.PI * 2 + random(`a${i}-${st}`) * 0.08;
        const r0 = 430 + random(`r${i}-${st}`) * 260, r1 = 1300;
        const w = 2 + random(`w${i}-${st}`) * 7;
        const x0 = W / 2 + Math.cos(a) * r0, y0 = H / 2 + Math.sin(a) * r0 * 0.62, x1 = W / 2 + Math.cos(a) * r1, y1 = H / 2 + Math.sin(a) * r1 * 0.62;
        const nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
        return <polygon key={i} points={`${x0},${y0} ${x1 + nx},${y1 + ny} ${x1 - nx},${y1 - ny}`} fill={color} />;
      })}
    </svg>
  );
};
const Heart: React.FC<{ x: number; y: number; s: number; op: number; rot?: number }> = ({ x, y, s, op, rot = 0 }) => (
  <svg width={s} height={s} viewBox="0 0 32 30" style={{ position: 'absolute', left: x - s / 2, top: y - s / 2, opacity: op, transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 0 8px rgba(255,120,170,0.8))' }}>
    <path d="M16 29 C16 29 1 19 1 9.5 C1 4.5 5 1 9.5 1 C12.5 1 15 3 16 5.5 C17 3 19.5 1 22.5 1 C27 1 31 4.5 31 9.5 C31 19 16 29 16 29Z" fill="#ff6fa5" stroke="#fff" strokeWidth={2.2} />
  </svg>
);
const HEART_ON: [number, number][] = [[25.0, 30.0], [47.16, 53.1], [60.2, 64.4], [96.12, 98.9], [116.0, 129.8], [132.84, 140.6]];
const Hearts: React.FC<{ t: number }> = ({ t }) => {
  const on = HEART_ON.find(([a, b]) => t >= a && t < b);
  if (!on) return null;
  const k = fadeIO(t, on[0], on[1], 0.4);
  return <AbsoluteFill>{[...Array(10)].map((_, i) => { const ph = ((t - on[0]) * 0.35 + i / 10) % 1; const x = 120 + ((i * 383) % 1680) + Math.sin(t * 2 + i) * 30; const y = H + 60 - ph * (H + 160); return <Heart key={i} x={x} y={y} s={44 + (i % 3) * 22} op={k * Math.sin(ph * Math.PI)} rot={Math.sin(t * 3 + i) * 15} />; })}</AbsoluteFill>;
};
const SPEED_ON: [number, number][] = [[44.38, 45.6], [87.44, 92.9], [102.6, 107.2], [149.6, 153.2]];
const Sparkles: React.FC<{ t: number }> = ({ t }) => {
  const on = (t > 44.38 && t < 50) || (t > 121 && t < 129.8) || (t > 135.42 && t < 140.6) || (t > 25 && t < 28.1);
  if (!on) return null;
  return <AbsoluteFill>{[...Array(20)].map((_, i) => { const ph = (t * 0.8 + i * 0.37) % 1; const x = (i * 397 + 120) % W, y = (i * 233 + 90) % H; return <Star key={i} x={x} y={y - ph * 40} s={12 + (i % 4) * 9} op={Math.sin(ph * Math.PI) * 0.9} />; })}</AbsoluteFill>;
};

// ================= shot layer (A: 8fps カタカタ) =================
const ShotLayer: React.FC<{ shot: Shot; t: number; nextT: number; si: number }> = ({ shot, t, nextT, si }) => {
  const p = easeInOut((t - shot.t) / Math.max(0.1, nextT - shot.t));
  const cx = lerp(shot.a[0], shot.b[0], p), cy = lerp(shot.a[1], shot.b[1], p), s = lerp(shot.a[2], shot.b[2], p);
  const st = step8(t);
  const jx = (random(`jx${st}`) - 0.5) * 6, jy = (random(`jy${st}`) - 0.5) * 6, jr = (random(`jr${st}`) - 0.5) * 0.5;
  if (shot.img === 'TITLE') return <AbsoluteFill style={{ background: 'radial-gradient(circle, #3a1c0a, #0a0402)' }} />;
  if (shot.img === 'TOP') return (
    <AbsoluteFill>
      <TopBg t={t} />
      <AbsoluteFill style={{ transform: `translate(${jx}px,${jy}px) rotate(${jr}deg) scale(${s})` }}><Bowl lt={t - shot.t} /></AbsoluteFill>
    </AbsoluteFill>
  );
  const img = imgFor(shot, t);
  let tx = W / 2 - cx * s, ty = H / 2 - cy * s;
  tx = clamp(tx, W - W * s, 0); ty = clamp(ty, H - H * s, 0);
  const vj = shot.vhs ? (random(`v${Math.floor(t * 30)}`) - 0.5) * 30 : 0;
  const filt = shot.dim ? 'brightness(0.55) saturate(0.6) blur(3px)' : shot.real ? 'saturate(0.75) contrast(1.02)' : shot.mono ? `grayscale(${clamp((t - 152.6) / 0.4)}) brightness(${1 + 0.2 * clamp((t - 152.6) / 0.4)})` : shot.vhs ? 'saturate(1.4) contrast(1.1)' : undefined;
  return (
    <AbsoluteFill style={{ transform: `translate(${jx + vj}px,${jy}px) rotate(${jr}deg) scale(1.02)` }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
        <Img src={staticFile(`gy/${img}.jpg`)} style={{ width: W, height: H, filter: filt }} />
        {img === '39' && !FAST_FLIP && <Afterimage t={t} />}
      </div>
    </AbsoluteFill>
  );
};
void (0 as unknown as typeof SONG);

// ===== So fast / so kind / so satisfying：放物線でダン・ダン・ダン =====
const SOFAST: [string, number, number, number, string][] = [
  ['So fast,', 104.98, 560, 250, '#fff2c4'],
  ['so kind,', 105.72, 860, 430, '#ffb6d0'],
  ['so satisfying', 106.52, 1160, 610, '#9be7ff'],
];
const SOFAST_END = 107.2;
const SoFast: React.FC<{ t: number }> = ({ t }) => {
  if (t < SOFAST[0][1] - 0.5 || t > SOFAST_END + 0.2) return null;
  const out = clamp((SOFAST_END + 0.2 - t) / 0.2);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {SOFAST.map(([w, land, x1, y1, col], i) => {
        const dur = 0.42, st = land - dur;
        if (t < st) return null;
        const q = clamp((t - st) / dur);
        const x0 = -300, y0 = H + 200;
        const x = lerp(x0, x1, q), y = lerp(y0, y1, q) - 620 * 4 * q * (1 - q);
        const after = t - land;
        const squash = after > 0 && after < 0.25 ? Math.sin((after / 0.25) * Math.PI) : 0;
        const rot = q < 1 ? (1 - q) * -40 - 6 : -6 + Math.sin(after * 30) * Math.exp(-after * 10) * 4;
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(0.45, 1, easeOut(q)) * (1 + 0.18 * squash)}, ${lerp(0.45, 1, easeOut(q)) * (1 - 0.22 * squash)})` }}>
            {after > 0 && after < 0.35 && <div style={{ position: 'absolute', left: '50%', top: '75%', width: 60, height: 20, borderRadius: '50%', border: '8px solid rgba(255,255,255,0.85)', transform: `translate(-50%,-50%) scale(${1 + after * 30}, ${1 + after * 10})`, opacity: 1 - after / 0.35 }} />}
            <span style={{ fontFamily: POP, fontSize: 150, color: col, WebkitTextStroke: `24px ${STROKE}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap', textShadow: '8px 10px 0 rgba(0,0,0,0.35)' }}>{w}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ===== 39: 女将さんの残像モーション =====
const WHIPS = [102.6, 103.4, 104.38, 105.34, 106.16, 107.24, 108.0, 108.9];
const Afterimage: React.FC<{ t: number }> = ({ t }) => {
  const mask = 'radial-gradient(ellipse 360px 430px at 1290px 520px, #000 55%, transparent 100%)';
  const st = Math.floor(t * 12);
  const sw = Math.sin(st * 2.1) * 90;
  const whip = WHIPS.reduce((m, a) => (t >= a && t < a + 0.25 ? Math.max(m, 1 - (t - a) / 0.25) : m), 0);
  return (
    <>
      {[1, 2, 3].map((k) => (
        <div key={k} style={{ position: 'absolute', inset: 0, WebkitMaskImage: mask, maskImage: mask, transform: `translateX(${(sw * k) / 1.5 - whip * 160 * k}px)`, opacity: 0.38 - k * 0.09, mixBlendMode: 'screen', filter: `blur(${2 + k * 2 + whip * 6}px)` }}>
          <Img src={staticFile('gy/39.jpg')} style={{ width: W, height: H }} />
        </div>
      ))}
      <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: mask, maskImage: mask, transform: `translateX(${sw * 0.35 + whip * 70}px)` }}>
        <Img src={staticFile('gy/39.jpg')} style={{ width: W, height: H, filter: whip > 0 ? `blur(${whip * 5}px)` : undefined }} />
      </div>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {[...Array(16)].map((_, i) => { const y = 180 + random(`ly${i}-${st}`) * 700; const x = 700 + random(`lx${i}-${st}`) * 1000; const len = 200 + random(`ll${i}-${st}`) * 400; return <rect key={i} x={x} y={y} width={len} height={3 + random(`lh${i}`) * 5} rx={3} fill="rgba(255,240,210,0.55)" />; })}
      </svg>
    </>
  );
};

// ================= meter (好感度 → つゆだく) =================
const HEARTS_LV: [number, number][] = [[47.16, 1], [53.1, 2], [60.2, 3], [67.3, 3], [96.12, 4], [116.0, 5]];
const Meter: React.FC<{ t: number }> = ({ t }) => {
  const on = (t > 47.16 && t < 141.2) || (t > 163.1 && t < 165.6);
  if (!on) return null;
  if (t > 163.1) {
    // flipped つゆだく meter, center-ish big
    const fp = clamp((t - 164.4) / 0.4);
    const showT = fp > 0.5;
    const rot = fp * 180;
    const lvl = showT ? lerp(0.4, 1.0, easeOut((t - 164.6) / 0.6)) : 0;
    return (
      <div style={{ position: 'absolute', right: 44, top: 36, width: 340, height: showT ? 270 : 150, transform: `perspective(800px) rotateY(${showT ? rot - 180 : rot}deg) scale(${t > 164.4 ? 1 + 0.15 * Math.sin(clamp((t - 164.4) / 0.6) * Math.PI) : 1})` }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 28, background: 'rgba(24,12,4,0.72)', border: '3px solid rgba(255,200,130,0.85)' }} />
        {!showT ? <HeartsPanel n={5} /> : <TsuyuPanel t={t} lvl={lvl} max={t > 165.1} />}
      </div>
    );
  }
  let n = 0; for (const [a, v] of HEARTS_LV) if (t >= a) n = v;
  const lastA = HEARTS_LV.filter(([a]) => a <= t).pop()?.[0] ?? 47.16;
  const pop = backOut((t - lastA) / 0.35);
  return (
    <div style={{ position: 'absolute', right: 44, top: 36, width: 340, height: 150, opacity: fadeIO(t, 47.16, 141.2, 0.3) }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 28, background: 'rgba(40,10,24,0.62)', border: '3px solid rgba(255,160,200,0.85)' }} />
      <HeartsPanel n={n} pop={pop} />
    </div>
  );
};
const HeartsPanel: React.FC<{ n: number; pop?: number }> = ({ n, pop = 1 }) => (
  <>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 12, textAlign: 'center', fontFamily: POP, fontSize: 28, color: '#ffc4dc' }}>好感度メーター</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 58, display: 'flex', justifyContent: 'center', gap: 6 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={54} height={50} viewBox="0 0 32 30" style={{ transform: `scale(${i === n - 1 ? pop : 1})` }}>
          <path d="M16 29 C16 29 1 19 1 9.5 C1 4.5 5 1 9.5 1 C12.5 1 15 3 16 5.5 C17 3 19.5 1 22.5 1 C27 1 31 4.5 31 9.5 C31 19 16 29 16 29Z" fill={i < n ? '#ff6fa5' : 'rgba(255,255,255,0.15)'} stroke="#fff" strokeWidth={2} />
        </svg>
      ))}
    </div>
    {n >= 5 && <div style={{ position: 'absolute', right: 14, bottom: 6, fontFamily: POP, fontSize: 26, color: '#fff36b' }}>MAX!!</div>}
  </>
);
const TsuyuPanel: React.FC<{ t: number; lvl: number; max: boolean }> = ({ t, lvl, max }) => {
  const surf = 168 - lvl * 108;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 10, textAlign: 'center', fontFamily: POP, fontSize: 28, color: '#ffd9a0' }}>つゆだくメーター</div>
      <svg width={340} height={270} viewBox="-20 0 340 270" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <clipPath id="inner"><path d="M58,70 L242,70 Q238,170 150,174 Q62,170 58,70Z" /></clipPath>
          <linearGradient id="ts" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0a542" /><stop offset="1" stopColor="#8a4a14" /></linearGradient>
        </defs>
        <g clipPath="url(#inner)">
          <rect x={40} y={60} width={220} height={130} fill="#2a160a" />
          <ellipse cx={150} cy={150} rx={62} ry={26} fill="#fffaf0" />
          <path d={`M40,${surf} ${[...Array(12)].map((_, i) => `L${40 + i * 20},${surf + Math.sin(t * 6 + i) * 3}`).join(' ')} L260,${surf} L260,200 L40,200Z`} fill="url(#ts)" />
        </g>
        <path d="M50,68 L250,68 Q246,182 150,186 Q54,182 50,68Z" fill="none" stroke="#e8c79a" strokeWidth={4} />
        {max && [...Array(6)].map((_, i) => { const p = ((t * 1.6 + i / 6) % 1); return <ellipse key={i} cx={i % 2 ? 46 - p * 6 : 254 + p * 6} cy={70 + p * 140} rx={7} ry={10} fill="#d88a2c" opacity={1 - p} />; })}
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 4, textAlign: 'center', fontFamily: POP, fontSize: 34, color: max ? '#ffef6b' : '#fff', WebkitTextStroke: `8px ${STROKE}`, paintOrder: 'stroke fill' }}>{max ? 'つゆだくだく MAX!!' : 'つゆだく'}</div>
    </>
  );
};

// ================= pop text / bubbles =================
const Pop: React.FC<{ t: number; a: number; b: number; x: number; y: number; size?: number; color?: string; rot?: number; children: React.ReactNode; font?: string }> = ({ t, a, b, x, y, size = 64, color = '#fff', rot = 0, children, font = POP }) => {
  if (t < a || t > b) return null;
  const p = (t - a) / 0.18;
  const sc = p < 1 ? lerp(3.2, 1, easeOut(p)) : 1 + 0.06 * Math.exp(-(t - a - 0.18) * 10) * Math.sin((t - a) * 40);
  return <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${sc})`, fontFamily: font, fontSize: size, color, whiteSpace: 'nowrap', opacity: Math.min(clamp(p * 2), fadeIO(t, a, b, 0.15)), filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined, WebkitTextStroke: `${Math.max(8, size * 0.16)}px ${STROKE}`, paintOrder: 'stroke fill', lineHeight: 1.1 }}>{children}</div>;
};
const Bubble: React.FC<{ t: number; a: number; b: number; x: number; y: number; text: string; think?: boolean; size?: number }> = ({ t, a, b, x, y, text, think, size = 54 }) => {
  if (t < a || t > b) return null;
  const sc = backOut((t - a) / 0.25);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${sc})`, opacity: fadeIO(t, a, b, 0.15) }}>
      <div style={{ background: '#fff', border: `5px solid ${STROKE}`, borderRadius: think ? 60 : 40, padding: '18px 34px', fontFamily: POP, fontSize: size, color: '#3a1a08', whiteSpace: 'nowrap', boxShadow: '6px 8px 0 rgba(0,0,0,0.35)', borderStyle: think ? 'dashed' : 'solid' }}>{text}</div>
      <div style={{ position: 'absolute', left: '22%', bottom: -26, width: 0, height: 0, borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderTop: `30px solid ${STROKE}` }} />
    </div>
  );
};
const Note: React.FC<{ t: number; a: number; b: number; text: string }> = ({ t, a, b, text }) => (
  t < a || t > b ? null : <div style={{ position: 'absolute', right: 70, bottom: 250, fontFamily: POP, fontSize: 46, color: '#fff', opacity: fadeIO(t, a, b, 0.2), transform: `scale(${backOut((t - a) / 0.25)})`, WebkitTextStroke: `9px ${STROKE}`, paintOrder: 'stroke fill' }}>{text}</div>
);

// ================= title with mosaic =================
const Mosaic: React.FC<{ w: number; h: number; t: number; break0?: number }> = ({ w, h, t, break0 }) => {
  const n = 7, m = 4, cw = w / n, ch = h / m;
  const st = Math.floor(t * 6);
  const bp = break0 !== undefined ? t - break0 : -1;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {[...Array(n * m)].map((_, i) => {
        const cx = i % n, cy = Math.floor(i / n);
        const c = 120 + random(`m${i}-${st}`) * 100;
        const fly = bp > 0 ? bp : 0;
        const dx = (random(`dx${i}`) - 0.5) * 1400 * fly, dy = (random(`dy${i}`) - 0.6) * 1000 * fly + 1400 * fly * fly, rr = (random(`rr${i}`) - 0.5) * 720 * fly;
        if (bp > 1.2) return null;
        return <div key={i} style={{ position: 'absolute', left: cx * cw, top: cy * ch, width: cw + 1, height: ch + 1, background: `rgb(${c},${c * 0.72},${c * 0.5})`, transform: `translate(${dx}px,${dy}px) rotate(${rr}deg)`, opacity: 1 - clamp(bp / 1.2) }} />;
      })}
    </div>
  );
};
const Title: React.FC<{ t: number; a: number; b: number; reveal?: number; y?: number }> = ({ t, a, b, reveal, y = 330 }) => {
  if (t < a || t > b) return null;
  const op = Math.min(clamp((t - a) / 0.6), reveal ? 1 : clamp((b - t) / 0.6));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: op }}>
      <div style={{ position: 'relative', fontFamily: MIN, fontSize: 150, color: '#fff3dc', letterSpacing: '0.12em', textShadow: '0 0 40px rgba(255,170,80,0.85), 0 0 12px rgba(255,140,60,0.8)', whiteSpace: 'nowrap' }}>
        恋する<span style={{ position: 'relative', display: 'inline-block' }}>牛丼<Mosaic w={330} h={170} t={t} break0={reveal} /></span>
      </div>
    </div>
  );
};

// ================= lyrics: バーン！ =================
const COLORS = ['#ffffff', '#ffe066', '#ff9ec4', '#9be7ff', '#ffc27a'];
type Chunk = { text: string; at: number; rot: number; color: string; dy: number; fx: number; spin: number; kas: number };
const FLY = 0.26;
const chunksOf = (l: Line): Chunk[] => {
  const parts = l.kind === 'e' ? [l.text] : l.text.split(' ').filter(Boolean);
  const ts = CHUNK_T[String(l.t)] || parts.map((_, i) => l.t + i * 0.3);
  return parts.map((p, i) => ({ text: p, at: (ts[i] ?? l.t) + 0.04, rot: (random(`r${l.t}${i}`) - 0.5) * 14, color: COLORS[Math.floor(random(`c${l.t}${i}`) * COLORS.length)], dy: (random(`y${l.t}${i}`) - 0.5) * 30, fx: (random(`x${l.t}${i}`) - 0.5) * 900, spin: (random(`s${l.t}${i}`) > 0.5 ? 1 : -1) * (30 + random(`sp${l.t}${i}`) * 40), kas: random(`k${l.t}${i}`) < 0.3 ? 3 + Math.floor(random(`kk${l.t}${i}`) * 3) : Math.floor(random(`kk${l.t}${i}`) * 3) }));
};
const ALL_CHUNKS = LINES.filter((l) => l.kind !== 's').flatMap(chunksOf);
export const impact = (t: number) => ALL_CHUNKS.reduce((m, c) => (t >= c.at && t < c.at + 0.35 ? Math.max(m, Math.exp(-(t - c.at) * 14)) : m), 0);
const shade = (hex: string) => { const n = parseInt(hex.slice(1), 16); const f = (v: number) => Math.round(v * 0.62 + 30); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
const ChunkSpan: React.FC<{ c: Chunk; t: number; size: number }> = ({ c, t, size }) => {
  const p = (t - (c.at - FLY)) / FLY; // 0..1 flight
  const base: React.CSSProperties = { display: 'inline-block', fontFamily: HAND, fontSize: size, color: c.color, WebkitTextStroke: `11px ${STROKE}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap', letterSpacing: '0.02em' };
  if (p < 0) return <span style={{ ...base, visibility: 'hidden' }}>{c.text}</span>;
  const pose = (q: number) => {
    q = clamp(q); const e = easeOut(q);
    const sc = q < 1 ? lerp(10, 1, Math.pow(e, 0.8)) : 1 + 0.1 * Math.exp(-(t - c.at) * 9) * Math.cos((t - c.at) * 40);
    return `translate(${(1 - e) * c.fx}px, ${c.dy - (1 - e) * 420}px) rotate(${c.rot + (1 - e) * c.spin}deg) scale(${sc})`;
  };
  const landed = p >= 1;
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {!landed && [0.12, 0.24, 0.36].map((d, k) => p - d > 0 && <span key={k} style={{ ...base, position: 'absolute', left: 0, top: 0, transform: pose(p - d), opacity: 0.32 - k * 0.09, filter: `blur(${4 + k * 3}px)` }}>{c.text}</span>)}
      <span style={{ ...base, transform: pose(p), opacity: clamp(p * 4), filter: landed ? undefined : `blur(${(1 - p) * 12}px)`, color: landed ? shade(c.color) : c.color }}>{c.text}</span>
      {landed && <span style={{ ...base, position: 'absolute', left: 0, top: 0, transform: pose(p), WebkitTextStroke: '0px transparent', filter: `url(#kasure${c.kas})` }}>{c.text}</span>}
      {landed && t - c.at < 0.3 && <span style={{ position: 'absolute', left: '50%', top: '50%', width: 40, height: 40, borderRadius: '50%', border: '6px solid rgba(255,255,255,0.9)', transform: `translate(-50%,-50%) scale(${1 + (t - c.at) * 18})`, opacity: 1 - (t - c.at) / 0.3 }} />}
    </span>
  );
};
const Lyrics: React.FC<{ t: number }> = ({ t }) => {
  const l = LINES.find((x) => t >= x.t - FLY && t < x.e) ;
  if (!l || l.kind === 's' || l.t === 104.38) return null;
  const out = clamp((l.e - t) / 0.18);
  const q = l.kind === 'q';
  if (l.kind === 'e') {
    const p = easeOut((t - l.t) / 0.22);
    if (p <= 0) return null;
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', opacity: out, transform: `translateX(${(1 - p) * 1400}px) skewX(${(1 - p) * -25}deg)` }}>
        <span style={{ fontFamily: HAND, fontSize: 84, color: '#fff2c4', WebkitTextStroke: `11px ${STROKE}`, filter: 'url(#kasure1)', paintOrder: 'stroke fill', letterSpacing: '0.02em' }}>{l.text}</span>
      </div>
    );
  }
  const cs = chunksOf(l);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: q ? 440 : 80, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 26, opacity: out }}>
      {cs.map((c, i) => <ChunkSpan key={i} c={c} t={t} size={q ? 100 : 86} />)}
    </div>
  );
};

// ================= v3: 妄想の女将さん（右端の考えごとの雲の中で手をふる） =================
const OkamiDream: React.FC<{ t: number }> = ({ t }) => {
  const a = 165.75, b = 168.0;
  if (t < a || t > b) return null;
  const sc = backOut((t - a) / 0.45);
  const op = fadeIO(t, a, b, 0.3);
  const img = Math.floor((t - a) * 3) % 2 ? '46b' : '46';
  const cw = 760, ch = 480;
  const bob = Math.sin(t * 2.2) * 8;
  return (
    <AbsoluteFill style={{ opacity: op }}>
      {[[1050, 170, 22], [1100, 235, 32], [1150, 320, 44]].map(([x, y, r], i) => (
        <div key={i} style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: '#fff', border: `5px solid ${STROKE}`, transform: `scale(${backOut((t - a - i * 0.08) / 0.3)})` }} />
      ))}
      <div style={{ position: 'absolute', left: 1430 - cw / 2, top: 600 - ch / 2 + bob, width: cw, height: ch, transform: `scale(${sc})` }}>
        <div style={{ position: 'absolute', inset: -14, borderRadius: '50%', background: '#fff', border: `6px solid ${STROKE}`, boxShadow: '8px 12px 0 rgba(0,0,0,0.35)' }} />
        <div style={{ position: 'absolute', inset: 6, borderRadius: '50%', overflow: 'hidden' }}>
          <Img src={staticFile(`gy/${img}.jpg`)} style={{ position: 'absolute', width: 1920 * 0.8, height: 1080 * 0.8, left: -340, top: -10, filter: 'saturate(1.1) brightness(1.05)' }} />
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse, transparent 60%, rgba(255,240,220,0.55) 100%)' }} />
        </div>
      </div>
      <Bubble t={t} a={a + 0.35} b={b} x={1450} y={300 + bob} text="いらっしゃい！" size={60} />
      {[...Array(6)].map((_, i) => { const ph = ((t - a) * 0.5 + i / 6) % 1; return <Heart key={i} x={1180 + i * 120} y={900 - ph * 520} s={40 + (i % 3) * 14} op={Math.sin(ph * Math.PI) * 0.9} />; })}
    </AbsoluteFill>
  );
};

// ================= telops =================
const Telops: React.FC<{ t: number }> = ({ t }) => {
  const strike = clamp((t - 108.7) / 0.2);
  return (
    <AbsoluteFill>
      <Note t={t} a={4.6} b={7.5} text="※残業4時間目" />
      <Title t={t} a={8.8} b={15.6} />
      {[[34.6, 360, 520], [35.9, 760, 470], [37.0, 300, 300]].map(([a, x, y], i) => <Pop key={i} t={t} a={a} b={38.5} x={x} y={y} size={170} color="#ff4b4b">✕</Pop>)}
      {t > 39.0 && t < 44.3 && (
        <div style={{ position: 'absolute', left: W / 2, top: 120, transform: `translate(-50%,0) scale(${backOut((t - 39) / 0.4)})`, opacity: fadeIO(t, 39, 44.3, 0.3), background: 'linear-gradient(#5a3418,#3a200c)', border: '6px solid #c99a5c', borderRadius: 14, padding: '10px 52px', fontFamily: MIN, fontSize: 72, color: '#fff1d6', letterSpacing: '0.3em', boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 40px rgba(255,170,80,0.5)' }}>ゆげや</div>
      )}
      <Bubble t={t} a={44.6} b={46.6} x={1400} y={230} text="いらっしゃい！" />
      <Pop t={t} a={50.4} b={52.6} x={1450} y={250} size={130} color="#ff7fb0" rot={8}>ドキッ</Pop>
      {['Day 2', 'Day 3', 'Day 4'].map((d, i) => <Pop key={d} t={t} a={56.3 + i * 1.3} b={56.3 + i * 1.3 + 1.25} x={1330} y={330} size={120} color="#ffe08a" rot={-8}>{d}</Pop>)}
      <Bubble t={t} a={60.5} b={63.8} x={560} y={230} text="また来てね〜♡" />
      <Pop t={t} a={65.2} b={67.0} x={1500} y={300} size={110} color="#9be7ff" rot={-6}>キラッ</Pop>
      {['23:00', '2:00', '5:00'].map((d, i) => <Pop key={d} t={t} a={70.6 + i * 1.5} b={70.6 + i * 1.5 + 1.45} x={360} y={200} size={130} color="#ffd27a">{d}</Pop>)}
      <Pop t={t} a={74.0} b={77.6} x={360} y={200} size={130} color="#ffd27a">5:00</Pop>
      <Pop t={t} a={79.0} b={81.4} x={1420} y={300} size={130} color="#ff9ec4" rot={6}>誰…？</Pop>
      <Pop t={t} a={82.0} b={86.8} x={420} y={260} size={150} color="#c9d6ff" rot={-6}>ガーン</Pop>
      <Note t={t} a={93.5} b={96.0} text="残高 612円" />
      <Bubble t={t} a={96.4} b={98.9} x={1250} y={190} text="出世払いでいいのよ〜" size={50} />
      <Pop t={t} a={102.9} b={104.3} x={1450} y={220} size={120} color="#9be7ff" rot={-6}>シュバババッ</Pop>
      <Pop t={t} a={107.24} b={110.15} x={620} y={300} size={140} color="#fff">はやくて</Pop>
      {t > 108.0 && t < 110.15 && (
        <div style={{ position: 'absolute', left: 1280, top: 300, transform: 'translate(-50%,-50%)' }}>
          <Pop t={t} a={108.0} b={110.15} x={0} y={0} size={140} color="#fff">やさしくて</Pop>
          {strike > 0 && <div style={{ position: 'absolute', left: -360 * strike, width: 720 * strike, top: -8, height: 24, background: '#ff2d3c', borderRadius: 12, transform: 'rotate(-6deg)', boxShadow: '0 0 0 5px #fff' }} />}
        </div>
      )}
      <Pop t={t} a={108.9} b={110.15} x={1290} y={530} size={210} color="#ffde3a" rot={-8}>やすい!!</Pop>
      <Pop t={t} a={113.6} b={115.6} x={1500} y={260} size={130} color="#ff7fb0" rot={8}>ドキッ</Pop>
      <Bubble t={t} a={134.2} b={135.4} x={1350} y={220} text="あらやだ…♡" />
      <Pop t={t} a={141.4} b={143.9} x={1450} y={250} size={120} color="#c9d6ff" rot={6}>ハッ</Pop>
      <Note t={t} a={142.2} b={149.5} text="※残業6時間目" />
      <OkamiDream t={t} />
      <Pop t={t} a={150.2} b={153.2} x={1640} y={300} size={130} color="#c9d6ff" rot={10}>ビクッ</Pop>
      <Bubble t={t} a={153.8} b={158.6} x={1250} y={230} text="（……つゆだく？）" think />
      {/* after song */}
      {t > 158.78 && t < 161.98 && <div style={{ position: 'absolute', left: 60, top: 50, fontFamily: POP, fontSize: 70, color: '#fff', WebkitTextStroke: `10px ${STROKE}`, paintOrder: 'stroke fill', opacity: Math.floor(t * 3) % 2 ? 1 : 0.6 }}>◀◀ 巻き戻し</div>}
      <Pop t={t} a={159.0} b={160.5} x={960} y={900} size={86} color="#fff">※ここまで残業中の妄想でした</Pop>
      <Pop t={t} a={160.5} b={161.98} x={960} y={900} size={86} color="#ffe066">※しかもずっと牛丼を見てました</Pop>
      <Pop t={t} a={162.45} b={163.1} x={960} y={200} size={110} color="#ff8fb8">※紅しょうがでした</Pop>
      <Title t={t} a={168.0} b={TOTAL + 1} reveal={168.6} y={360} />
      {t > 169.0 && <div style={{ position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', fontFamily: MIN, fontSize: 46, color: '#d9c3a3', letterSpacing: '0.2em', opacity: clamp((t - 169) / 0.5) }}>ただいま正気を失い中</div>}
    </AbsoluteFill>
  );
};

// ================= effects =================
const FLASH: [number, number, number][] = [[30.3, 0.35, 0.18], [44.38, 1, 0.6], [81.42, 0.4, 0.2], [149.6, 0.9, 0.3], [162.45, 0.6, 0.2], [163.1, 0.5, 0.25], [164.6, 0.6, 0.3], [168.6, 0.8, 0.3]];
const Flash: React.FC<{ t: number }> = ({ t }) => {
  const v = FLASH.reduce((m, [a, s, d]) => (t >= a && t < a + d * 3 ? Math.max(m, s * Math.exp(-(t - a) / d * 2.2)) : m), 0);
  return v > 0.01 ? <AbsoluteFill style={{ background: '#fff', opacity: v }} /> : null;
};
const VHS: React.FC<{ t: number }> = ({ t }) => (t > 158.78 && t < 162.45 ? (
  <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 5px)', mixBlendMode: 'multiply' }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: ((t * 900) % (H + 200)) - 100, height: 70, background: 'rgba(255,255,255,0.18)', filter: 'blur(6px)' }} />
  </AbsoluteFill>
) : null);
const Vignette = () => <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(10,4,0,0.45) 100%)' }} />;
const BigShout: React.FC<{ t: number }> = ({ t }) => (t > 149.6 && t < 153.2 ? (
  <div style={{ position: 'absolute', left: W / 2, top: H / 2 - 80, transform: `translate(-50%,-50%) scale(${(t - 149.6) < 0.18 ? lerp(5, 1, easeOut((t - 149.6) / 0.18)) : 1 + 0.03 * Math.sin(t * 50)}) rotate(-4deg)`, fontFamily: POP, fontSize: 230, color: '#ffe066', WebkitTextStroke: `32px ${STROKE}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap', opacity: fadeIO(t, 149.6, 153.2, 0.12) }}>つゆだくで！！</div>
) : null);

export const Main: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const i = shotIdx(t);
  const shot = SHOTS[i];
  const nextT = SHOTS[i + 1]?.t ?? TOTAL;
  const prev = i > 0 ? SHOTS[i - 1] : null;
  const xf = !shot.cut && prev ? clamp((t - shot.t) / 0.25) : 1;
  const sfImp = SOFAST.reduce((m, [, land]) => (t >= land && t < land + 0.35 ? Math.max(m, Math.exp(-(t - land) * 12)) : m), 0);
  const imp = sfImp * 22 + impact(t) * 9 + (t > 149.6 && t < 151.2 ? (1 - (t - 149.6) / 1.56) * 22 : 0) + (t > 81.42 && t < 81.9 ? 14 : 0);
  const sx = imp ? Math.sin(t * 95) * imp : 0, sy = imp ? Math.cos(t * 81) * imp : 0;
  const speed = SPEED_ON.find(([a, b]) => t >= a && t < b);
  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <Audio src={staticFile('song.wav')} />
      <KasureDefs />
      {OKAMI_VOICE && <Sequence from={Math.round(44.6 * FPS)}><Audio src={staticFile('voice/okami_01.wav')} volume={1.4} /></Sequence>}
      <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
        {xf < 1 && prev && <ShotLayer shot={prev} t={t} nextT={shot.t + 0.25} si={i - 1} />}
        <AbsoluteFill style={{ opacity: xf }}><ShotLayer shot={shot} t={t} nextT={nextT} si={i} /></AbsoluteFill>
        {speed && <Speed t={t} />}
        <Sparkles t={t} />
        <Hearts t={t} />
        {shot.img !== 'TITLE' && <Vignette />}
        <VHS t={t} />
        <Telops t={t} />
        <Meter t={t} />
        <Lyrics t={t} />
        <BigShout t={t} />
        <SoFast t={t} />
      </AbsoluteFill>
      <Flash t={t} />
      {t < 0.8 && <AbsoluteFill style={{ background: '#000', opacity: 1 - t / 0.8 }} />}
    </AbsoluteFill>
  );
};
