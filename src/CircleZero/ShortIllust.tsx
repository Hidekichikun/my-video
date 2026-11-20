import React from 'react';
import { AbsoluteFill, Audio, Img, random, staticFile, useCurrentFrame } from 'remotion';
import { LYRICS } from './data';
import {
  CHORUS_RANGES,
  CYAN,
  FPS,
  KasureDefs,
  LATIN,
  MAGENTA,
  MINCHO,
  QuoteBoom,
  SPECIAL,
  T,
  WHITE,
  beatPulse,
  clamp,
  easeInOut,
  inRange,
  lerp,
  lineEnd,
  quoteActive,
  splitChorus,
} from './index';

// CIRCLE Ø ショート（縦 1080x1920・イラスト版）
// Codexで作った8枚（public/circle-zero/short/）を歌詞に合わせて切り替える。
// 1枚ごとにズーム・スライドの動き、切り替えはグリッチ。日本語の歌詞は縦書き。

export type IllustShortProps = { from: number; to: number };

export const ILLUST_CUTS_PROPS = {
  sabi: { from: 40.2, to: 79.6 },
  sabi15: { from: 44.1, to: 59.1 },
} satisfies Record<string, IllustShortProps>;

export const illustFrames = (p: IllustShortProps) => Math.round((p.to - p.from) * FPS);

const W = 1080;
const H = 1920;

// ───────── カット（曲の秒数）と動き ─────────
type Move = 'zoomIn' | 'zoomOut' | 'panUp' | 'panDown' | 'drift' | 'freeze';
type Cut = { t: number; file: string; move: Move; side: 'left' | 'right'; echo?: boolean; rain?: boolean };
const CUTS: Cut[] = [
  { t: 0, file: 'short-01-different-sound', move: 'zoomIn', side: 'right' }, // ひとつだけ違う音がした
  { t: T.ch1, file: 'short-02-same-morning', move: 'drift', side: 'right', echo: true }, // Round and round 同じ朝へ
  { t: 48.02, file: 'short-03-reborn', move: 'zoomOut', side: 'right' }, // 名前を変えて 生まれ直して
  { t: 51.26, file: 'short-04-lose-you', move: 'panUp', side: 'left', rain: true }, // 同じ場所で 君を失う
  { t: 57.72, file: 'short-05-hajimemashite', move: 'zoomIn', side: 'right' }, // 何千回目の「初めまして」
  { t: 64.3, file: 'short-06-not-take-hand', move: 'zoomIn', side: 'right' }, // でも 今回は 手を取らない
  { t: 67.6, file: 'short-07-tear-page', move: 'panDown', side: 'right' }, // 決められた頁を破って 物語の外へ
  { t: T.reframe, file: 'short-08-reframe', move: 'freeze', side: 'right' }, // RE:FRAME
];

const cutIndexAt = (t: number) => {
  let k = 0;
  for (let i = 0; i < CUTS.length; i++) if (t >= CUTS[i].t) k = i;
  return k;
};

const moveTransform = (m: Move, u: number, t: number, frame: number) => {
  const e = easeInOut(u);
  switch (m) {
    case 'zoomIn':
      return `scale(${lerp(1.04, 1.16, e)})`;
    case 'zoomOut':
      return `scale(${lerp(1.18, 1.04, e)})`;
    case 'panUp':
      return `scale(1.14) translateY(${lerp(70, -70, e)}px)`;
    case 'panDown':
      return `scale(1.14) translateY(${lerp(-70, 70, e)}px)`;
    case 'drift':
      return `scale(${lerp(1.08, 1.12, e)}) translateX(${lerp(-30, 30, e)}px)`;
    case 'freeze': {
      // RE:FRAME：ぐっと寄ってから止まり、細かく震える
      const shake = (random(`fz${Math.floor(frame / 2)}`) - 0.5) * 6;
      return `scale(${lerp(1.0, 1.1, easeInOut(clamp(u * 6)))}) translate(${shake}px, ${shake * 0.6}px)`;
    }
  }
};

// グリッチで切れた画像（RGBずれ＋横スライス）
const GlitchLayer: React.FC<{ src: string; amount: number; seed: string; transform: string }> = ({ src, amount, seed, transform }) => {
  const base: React.CSSProperties = { position: 'absolute', inset: 0, width: W, height: H, objectFit: 'cover' };
  if (amount < 0.02) return <Img src={src} style={{ ...base, transform }} />;
  const split = 4 + amount * 22;
  const n = Math.floor(3 + amount * 9);
  return (
    <>
      <Img src={src} style={{ ...base, transform: `${transform} translateX(${-split}px)`, opacity: 0.6, filter: 'sepia(1) hue-rotate(150deg) saturate(6)', mixBlendMode: 'screen' }} />
      <Img src={src} style={{ ...base, transform: `${transform} translateX(${split}px)`, opacity: 0.5, filter: 'sepia(1) hue-rotate(260deg) saturate(6)', mixBlendMode: 'screen' }} />
      <Img src={src} style={{ ...base, transform }} />
      {Array.from({ length: n }).map((_, i) => {
        const top = random(`${seed}t${i}`) * 100;
        const h = 1 + random(`${seed}h${i}`) * 7 * amount;
        const dx = (random(`${seed}x${i}`) - 0.5) * 260 * amount;
        return (
          <Img
            key={i}
            src={src}
            style={{ ...base, transform: `${transform} translateX(${dx}px)`, clipPath: `inset(${top}% 0 ${clamp(100 - top - h, 0, 100)}% 0)` }}
          />
        );
      })}
    </>
  );
};

// 残像（同じ朝のループ感）
const Echo: React.FC<{ src: string; transform: string; t: number }> = ({ src, transform, t }) => (
  <>
    {[1, 2, 3].map((k) => (
      <Img
        key={k}
        src={src}
        style={{
          position: 'absolute',
          inset: 0,
          width: W,
          height: H,
          objectFit: 'cover',
          transform: `${transform} translate(${k * 26 + Math.sin(t * 2 + k) * 8}px, ${-k * 10}px)`,
          opacity: 0.16 / k,
          mixBlendMode: 'screen',
        }}
      />
    ))}
  </>
);

// 雨
const RAIN = Array.from({ length: 70 }).map((_, i) => ({
  x: random(`rx${i}`) * W,
  y0: random(`ry${i}`) * H,
  len: 40 + random(`rl${i}`) * 90,
  sp: 1400 + random(`rs${i}`) * 900,
  op: 0.12 + random(`ro${i}`) * 0.25,
}));
const Rain: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    {RAIN.map((r, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: r.x - (((r.y0 + t * r.sp) % (H + 200)) - 100) * 0.12,
          top: ((r.y0 + t * r.sp) % (H + 200)) - 100,
          width: 2,
          height: r.len,
          opacity: r.op,
          background: 'linear-gradient(to bottom, transparent, #cfeeff)',
          transform: 'rotate(7deg)',
        }}
      />
    ))}
  </AbsoluteFill>
);

// ───────── 歌詞（縦書き） ─────────
const isChorus = (t0: number) => CHORUS_RANGES.some(([a, b]) => inRange(t0, a, b));

const LyricColumn: React.FC<{ text: string; t0: number; t: number; end: number; frame: number; side: 'left' | 'right'; fade: number }> = ({
  text,
  t0,
  t,
  end,
  frame,
  side,
  fade,
}) => {
  const chorus = isChorus(t0);
  const shown = chorus ? splitChorus(text) : text;
  const parts = shown.split('　');
  const longest = Math.max(...parts.map((x) => Array.from(x).length));
  const size = Math.min(chorus ? 92 : 76, 1180 / (longest * 1.16));
  const chars = Array.from(shown);
  const u = clamp((t - t0) / Math.max(0.5, end - t0));
  const flow = lerp(-30, 70, u); // 上から下へゆっくり流れる
  const pos: React.CSSProperties = side === 'right' ? { right: 70 } : { left: 70 };
  return (
    <div
      style={{
        position: 'absolute',
        ...pos,
        top: 330 + flow,
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        fontFamily: MINCHO,
        fontSize: size,
        letterSpacing: '0.14em',
        lineHeight: 1,
        color: chorus ? '#e9fbff' : WHITE,
        textShadow: '0 0 4px rgba(4,4,12,0.95), 0 0 16px rgba(4,4,12,0.9), 0 0 28px rgba(127,232,255,0.65)',
        opacity: fade,
        whiteSpace: 'nowrap',
      }}
    >
      {chars.map((c, i) => {
        if (c === '　') return <br key={i} />;
        const ct = t - t0 - i * 0.045;
        const a = clamp(ct / 0.22);
        const drop = -(1 - easeInOut(a)) * 90;
        const jitter = ct >= 0 && ct < 0.15 ? (random(`ilj${t0}-${i}-${frame}`) - 0.5) * 14 : 0;
        return (
          <span key={i} style={{ display: 'inline-block', opacity: a, transform: `translate(${jitter}px, ${drop}px)`, filter: `blur(${(1 - a) * 6}px)` }}>
            {c}
          </span>
        );
      })}
    </div>
  );
};

const Lyrics: React.FC<{ t: number; frame: number; side: 'left' | 'right' }> = ({ t, frame, side }) => {
  let cur = -1;
  for (let i = 0; i < LYRICS.length; i++) if (LYRICS[i].t <= t && !SPECIAL.has(LYRICS[i].text)) cur = i;
  if (cur < 0) return null;
  const L = LYRICS[cur];
  const end = lineEnd(cur);
  if (t >= end + 0.5) return null;
  const fade = (1 - clamp((t - end) / 0.5)) * (1 - 0.85 * quoteActive(t));
  return <LyricColumn text={L.text} t0={L.t} t={t} end={end} frame={frame} side={side} fade={fade} />;
};

// RE:FRAME（英語なので横）
const ReFrame: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  if (!inRange(t, T.reframe, T.v2)) return null;
  const u = (t - T.reframe) / (T.v2 - T.reframe);
  const op = clamp((t - T.reframe) / 0.15);
  const heavy = u < 0.1 || random(`rf${Math.floor(frame / 2)}`) < 0.18;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 1420,
        textAlign: 'center',
        fontFamily: LATIN,
        fontWeight: 500,
        fontSize: 140,
        letterSpacing: '0.18em',
        paddingLeft: '0.18em',
        color: '#fff',
        mixBlendMode: 'difference',
        opacity: op,
        transform: `translateX(${heavy ? (random(`rfx${frame}`) - 0.5) * 50 : 0}px) scale(${1 + u * 0.05})`,
        textShadow: heavy ? `-8px 0 ${CYAN}, 8px 0 ${MAGENTA}` : 'none',
      }}
    >
      RE:FRAME
    </div>
  );
};

// タイトル（英語なので横）
const Title: React.FC<{ lt: number; frame: number }> = ({ lt, frame }) => {
  const big = 1 - easeInOut(clamp((lt - 2.4) / 0.8));
  const glitch = random(`itt${Math.floor(frame / 2)}`) < 0.08;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 110 - 20 * (1 - big),
        textAlign: 'center',
        fontFamily: LATIN,
        fontSize: 60 + 40 * big,
        letterSpacing: '0.32em',
        paddingLeft: '0.32em',
        color: WHITE,
        opacity: 0.7 + 0.3 * big,
        textShadow: glitch ? `-6px 0 ${CYAN}, 6px 0 ${MAGENTA}` : '0 0 18px rgba(170,190,255,0.6), 0 2px 8px rgba(0,0,0,0.8)',
      }}
    >
      CIRCLE Ø
    </div>
  );
};

// ───────── 本体 ─────────
export const CircleZeroIllustShort: React.FC<IllustShortProps> = ({ from, to }) => {
  const local = useCurrentFrame();
  const startFrame = Math.round(from * FPS);
  const frame = startFrame + local;
  const t = frame / FPS;
  const lt = local / FPS;
  const len = to - from;

  const k = cutIndexAt(t);
  const cut = CUTS[k];
  const cutStart = Math.max(cut.t, from);
  const cutEnd = Math.min(CUTS[k + 1]?.t ?? to, to);
  const u = clamp((t - cutStart) / Math.max(0.1, cutEnd - cutStart));
  const pulse = isChorus(t) ? beatPulse(t) : 0;
  const transform = `${moveTransform(cut.move, u, t, frame)} scale(${1 + 0.012 * pulse})`;

  // 切り替えの前後でグリッチ
  const sinceCut = t - cutStart;
  const toNext = cutEnd - t;
  let g = Math.max(clamp(1 - sinceCut / 0.3), clamp(1 - toNext / 0.15)) * (cutStart === from ? 0 : 1);
  if (cut.move === 'freeze' && random(`fg${Math.floor(frame / 2)}`) < 0.12) g = Math.max(g, 0.35);
  if (random(`ig${Math.floor(frame / 2)}`) < (isChorus(t) ? 0.05 : 0.02)) g = Math.max(g, 0.3);
  const flash = clamp(1 - sinceCut / 0.12) * (cutStart === from ? 0 : 0.35);

  const src = staticFile(`circle-zero/short/${cut.file}.png`);
  const fadeIn = clamp(lt / 0.25);
  const fadeOut = 1 - clamp((lt - (len - 0.6)) / 0.6);
  const volume = (f: number) => clamp(f / FPS / 0.15) * (1 - clamp((f / FPS - (len - 0.6)) / 0.6));

  return (
    <AbsoluteFill style={{ backgroundColor: '#05060d' }}>
      <Audio src={staticFile('music/circle-zero.mp3')} startFrom={startFrame} volume={volume} />
      <KasureDefs seed={1 + (Math.floor(frame / 3) % 9)} />
      <AbsoluteFill style={{ opacity: fadeIn * fadeOut, overflow: 'hidden' }}>
        <GlitchLayer src={src} amount={g} seed={`c${k}-${Math.floor(frame / 2)}`} transform={transform} />
        {cut.echo ? <Echo src={src} transform={transform} t={t} /> : null}
        {cut.rain ? <Rain t={t} /> : null}
        {/* 走査線とビネット */}
        <AbsoluteFill
          style={{
            background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 2px, transparent 4px)',
            mixBlendMode: 'overlay',
          }}
        />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)' }} />
        {/* 歌詞がある側だけ少し暗くして読みやすく */}
        <AbsoluteFill
          style={{
            background: `linear-gradient(to ${cut.side === 'right' ? 'left' : 'right'}, rgba(4,4,12,0.6) 0%, rgba(4,4,12,0.25) 22%, transparent 40%)`,
          }}
        />
        <Title lt={lt} frame={frame} />
        <Lyrics t={t} frame={frame} side={cut.side} />
        <QuoteBoom t={t} frame={frame} cx={540} cy={1000} size={140} maxH={1150} />
        <ReFrame t={t} frame={frame} />
        <AbsoluteFill style={{ backgroundColor: '#fff', opacity: flash, mixBlendMode: 'screen' }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
