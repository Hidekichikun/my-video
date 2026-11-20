import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, random, staticFile, useCurrentFrame } from 'remotion';
import { BEATS, LYRICS } from './data';
import {
  CYAN,
  FPS,
  FallingMincho,
  GlitchImg,
  LATIN,
  MAGENTA,
  MINCHO,
  T,
  WHITE,
  beatPulse,
  clamp,
  decay,
  easeInOut,
  girlLayers,
  glitchAt,
  img,
  inRange,
  lineEnd,
} from './index';

// CIRCLE Ø ショート・タイポグラフィ版（縦 1080x1920）
// 主役は文字。画面の真ん中に「文字でできた時計」を置いて、歌詞は円周に沿って並び、拍ごとに秒針みたいにカチッと進む。
// ・ひとつだけ違う音がした … 針が逆回り
// ・Round and round … 特大の英字イタリックが時計の上を右→左に通過（RoundPass）
// ・何千回目の「初めまして」… 円の中でカウンターが回る
// ・決められた頁を破って … 円の文字が上下に裂ける / 物語の外へ … 文字が円の外へ飛んでいく
// ・RE:FRAME … 円がつぶれて中心へ → 大きな「Ø」とタイトルが残る
// 女の子と時計は暗く沈めて背景に下げる。

export type CircleZeroTypeProps = { from: number; to: number; endCard?: boolean; credits?: boolean };

export const TYPE_CUTS = {
  sabi: { from: 40.2, to: 79.6 },
  sabi15: { from: 44.1, to: 59.1, endCard: true },
  // 六ツ扉・リリース日なし（タイトルだけ）
  'sabi-plain': { from: 40.2, to: 79.6, credits: false },
  'sabi15-plain': { from: 44.1, to: 59.1, endCard: true, credits: false },
} satisfies Record<string, CircleZeroTypeProps>;

export const typeFrames = (p: CircleZeroTypeProps) => Math.round((p.to - p.from) * FPS);

const ITALIC = "'CZ Cormorant Italic', serif";
const fontHandle = typeof window !== 'undefined' ? delayRender('CZ italic') : null;
if (typeof window !== 'undefined') {
  new FontFace('CZ Cormorant Italic', `url(${staticFile('fonts/CormorantGaramond-Italic-VF.ttf')})`)
    .load()
    .then((f) => document.fonts.add(f))
    .catch((e) => console.error(e))
    .finally(() => fontHandle !== null && continueRender(fontHandle));
}

const W = 1080;
const H = 1920;
const CX = 540;
const CY = 880;
const R = 400;

const ROUND_T = 44.38;
const COUNT_T = 57.72;
const TEAR_T = 67.6;
const OUT_T = 70.26;
const COLLAPSE_END = T.reframe + 0.7;
const CARD_T = 75.9;

// ───────── 秒針の角度（拍ごとに6°カチッ。違う音〜サビ頭までは逆回り、RE:FRAMEで止まる） ─────────
const stepDir = (b: number) => {
  if (b < T.wrongSound) return 0;
  if (b < T.ch1) return -1;
  if (b < T.reframe) return 1;
  return 0;
};
const tickAngle = (t: number) => {
  let a = 0;
  for (const b of BEATS) {
    if (b > t) break;
    const d = stepDir(b);
    if (d === 0) continue;
    const u = clamp((t - b) / 0.09);
    a += d * 6 * (1 - Math.pow(1 - u, 3));
  }
  return a;
};

// 円に乗せる歌詞（特別な演出のものはのぞく）
const RING_SKIP = new Set(['Round and round', '――RE:FRAME']);
const ringIndexAt = (t: number) => {
  let cur = -1;
  for (let i = 0; i < LYRICS.length; i++) if (LYRICS[i].t <= t && !RING_SKIP.has(LYRICS[i].text)) cur = i;
  return cur;
};

const arcPath = (r: number) => `M ${CX} ${CY + r} A ${r} ${r} 0 1 1 ${CX} ${CY - r} A ${r} ${r} 0 1 1 ${CX} ${CY + r}`;
// 下側用：まん中が円の下にくる逆回りの道（下に置いても文字が逆さまにならない）
const arcPathLow = (r: number) => `M ${CX} ${CY - r} A ${r} ${r} 0 1 0 ${CX} ${CY + r} A ${r} ${r} 0 1 0 ${CX} ${CY - r}`;

// 行ごとに円のどこから始まるか（時計の「何時」）。行が変わるたびに 12時→3時→6時→9時 と時計回りに進む
// 3時・9時はどちらも上から下へ読める向き、6時は逆さまにならない向きで置く。「頁を破って」は12時固定
const HOURS = [12, 3, 6, 9];
const RING_ORDER = LYRICS.map((_, i) => i).filter((i) => !RING_SKIP.has(LYRICS[i].text));
const FIRST_RING = RING_ORDER.findIndex((i) => LYRICS[i].t === T.wrongSound || Math.abs(LYRICS[i].t - 40.74) < 0.01);
const hourOf = (idx: number) => {
  if (LYRICS[idx].t === TEAR_T) return 12;
  const k = RING_ORDER.indexOf(idx) - FIRST_RING;
  return HOURS[((k % HOURS.length) + HOURS.length) % HOURS.length];
};

// ───────── 背景：女の子と時計は暗く・少しぼかす ─────────
const Backdrop: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const g = glitchAt(t, frame) * 0.6;
  const layers = girlLayers(t);
  const seed = `tg${Math.floor(frame / 2)}`;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 46%, #121735 0%, #080a18 45%, #030307 100%)' }}>
      <AbsoluteFill style={{ filter: 'brightness(0.24) blur(2.5px) saturate(0.7)' }}>
        {layers.map((l) => (
          <GlitchImg
            key={l.name}
            src={img(`girl-${l.name}`)}
            amount={g}
            seed={seed + l.name}
            opacity={l.opacity}
            style={{ left: 60, top: 980, width: 1500, height: Math.round((1500 * 1080) / 1432) }}
          />
        ))}
      </AbsoluteFill>
      <Img
        src={img('clock-face')}
        style={{
          position: 'absolute',
          left: CX - R - 60,
          top: CY - R - 60,
          width: 2 * R + 120,
          height: 2 * R + 120,
          opacity: 0.16,
          mixBlendMode: 'screen',
          filter: 'blur(1px)',
        }}
      />
      <AbsoluteFill style={{ opacity: 0.35 }}>
        <FallingMincho t={t} w={W} h={H} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ───────── 文字の時計（目盛り・秒針・中央のØ） ─────────
const Dial: React.FC<{ t: number; collapse: number }> = ({ t, collapse }) => {
  const a = tickAngle(t);
  const pulse = beatPulse(t) * (inRange(t, T.ch1, T.reframe) ? 1 : 0.3);
  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const major = i % 5 === 0;
    const ang = ((i * 6 + a * 0.25) * Math.PI) / 180;
    const r1 = R + 38;
    const r2 = R + (major ? 70 : 52);
    return (
      <line
        key={i}
        x1={CX + r1 * Math.sin(ang)}
        y1={CY - r1 * Math.cos(ang)}
        x2={CX + r2 * Math.sin(ang)}
        y2={CY - r2 * Math.cos(ang)}
        stroke={WHITE}
        strokeOpacity={major ? 0.75 : 0.32}
        strokeWidth={major ? 3 : 1.5}
      />
    );
  });
  const ha = (a * Math.PI) / 180;
  const s = (1 - collapse) * (1 + 0.012 * pulse);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: 1 - collapse * 0.6 }}>
      <g transform={`translate(${CX} ${CY}) scale(${s}) translate(${-CX} ${-CY})`}>
        <circle cx={CX} cy={CY} r={R + 24} fill="none" stroke={WHITE} strokeOpacity={0.22 + 0.25 * pulse} strokeWidth={1.5} />
        <circle cx={CX} cy={CY} r={R - 110} fill="none" stroke={CYAN} strokeOpacity={0.12} strokeWidth={1} strokeDasharray="2 10" />
        {ticks}
        {/* 秒針 */}
        <line
          x1={CX - 60 * Math.sin(ha)}
          y1={CY + 60 * Math.cos(ha)}
          x2={CX + (R - 130) * Math.sin(ha)}
          y2={CY - (R - 130) * Math.cos(ha)}
          stroke={CYAN}
          strokeOpacity={0.55}
          strokeWidth={2}
        />
        <circle cx={CX} cy={CY} r={6} fill={CYAN} fillOpacity={0.8} />
      </g>
    </svg>
  );
};

// ───────── 円周に沿った歌詞 ─────────
const RingLine: React.FC<{
  idx: number;
  t: number;
  frame: number;
  fade: number;
  r: number;
  size: number;
  tear?: number;
  scale?: number;
}> = ({ idx, t, frame, fade, r, size, tear = 0, scale = 1 }) => {
  const L = LYRICS[idx];
  const chars = Array.from(L.text.replace('　', '  '));
  const ang = (hourOf(idx) % 12) * 30;
  const low = ang > 90 && ang <= 270;
  const rot = (low ? ang - 180 : ang) + tickAngle(t) - tickAngle(L.t);
  const chorus = inRange(L.t, T.ch1, T.reframe);
  const id = `czr${idx}`;
  const glow = chorus ? 'rgba(127,232,255,0.85)' : 'rgba(170,190,255,0.6)';
  const jitter = (k: string) => (random(`${k}${idx}-${Math.floor(frame / 2)}`) - 0.5);
  const text = (clip?: string, dx = 0, dy = 0, color = chorus ? '#e9fcff' : WHITE, key = 'm', op = 1) => (
    <g key={key} transform={`translate(${dx} ${dy})`} clipPath={clip} opacity={op}>
      <g transform={`rotate(${rot} ${CX} ${CY}) translate(${CX} ${CY}) scale(${scale}) translate(${-CX} ${-CY})`}>
        <text fontFamily={MINCHO} fontSize={size} fill={color} letterSpacing="0.14em" style={{ filter: `drop-shadow(0 0 14px ${glow}) drop-shadow(0 2px 6px rgba(0,0,0,0.9))` }}>
          <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
            {chars.map((c, i) => {
              const ct = t - L.t - i * 0.05;
              const a = clamp(ct / 0.16);
              return (
                <tspan key={i} fillOpacity={a} dy={ct >= 0 && ct < 0.12 ? jitter(`j${i}`) * 14 : 0}>
                  {c === ' ' ? ' ' : c}
                </tspan>
              );
            })}
          </textPath>
        </text>
      </g>
    </g>
  );
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: fade }}>
      <defs>
        <path id={id} d={low ? arcPathLow(r) : arcPath(r)} />
        <clipPath id={`${id}top`}>
          <rect x={0} y={0} width={W} height={CY - R + 40} />
        </clipPath>
        <clipPath id={`${id}bot`}>
          <rect x={0} y={CY - R + 40} width={W} height={H} />
        </clipPath>
      </defs>
      {tear > 0
        ? [
            text(`url(#${id}top)`, -tear * 70, -tear * 40, undefined, 'a'),
            text(`url(#${id}bot)`, tear * 70, tear * 30, undefined, 'b'),
            text(undefined, -10, 0, CYAN, 'c', 0.35 * Math.min(1, tear * 3)),
            text(undefined, 10, 0, MAGENTA, 'd', 0.35 * Math.min(1, tear * 3)),
          ]
        : text()}
    </svg>
  );
};

const Ring: React.FC<{ t: number; frame: number; collapse: number }> = ({ t, frame, collapse }) => {
  const cur = ringIndexAt(t);
  if (cur < 0 || collapse >= 1) return null;
  const out: React.ReactNode[] = [];
  const L = LYRICS[cur];
  const end = Math.min(lineEnd(cur), T.reframe);
  const size = Array.from(L.text).length > 11 ? 74 : 88;
  // 今の行
  {
    let fade = 1 - clamp((t - end) / 0.5);
    let r = R;
    let scale = 1;
    let tear = 0;
    if (L.t === TEAR_T) tear = easeInOut(clamp((t - TEAR_T - 1.35) / 0.5));
    if (L.t === OUT_T) {
      const u = easeInOut(clamp((t - OUT_T - 1.3) / 1.6));
      scale = 1 + u * 1.2;
      fade *= 1 - u;
    }
    if (t >= T.reframe) fade *= 1 - collapse;
    out.push(<RingLine key={`c${cur}`} idx={cur} t={t} frame={frame} fade={fade} r={r} size={size} tear={tear} scale={scale} />);
  }
  // ひとつ前の行：内側に縮みながら消える
  let prev = cur - 1;
  while (prev >= 0 && RING_SKIP.has(LYRICS[prev].text)) prev--;
  if (prev >= 0 && LYRICS[prev].t !== OUT_T) {
    const u = clamp((t - L.t) / 0.6);
    const fade = 0.55 * (1 - u) * (LYRICS[prev].t === TEAR_T ? 0 : 1);
    if (fade > 0.01)
      out.push(<RingLine key={`p${prev}`} idx={prev} t={t} frame={frame} fade={fade} r={R} size={74} scale={1 - 0.3 * easeInOut(u)} />);
  }
  return <AbsoluteFill>{out}</AbsoluteFill>;
};

// ───────── Round and round：特大イタリックが右→左に通過 ─────────
const RoundPass: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const dur = 2.3;
  if (!inRange(t, ROUND_T - 0.1, ROUND_T + dur)) return null;
  const u = clamp((t - ROUND_T + 0.1) / dur);
  // 入りと抜けは速く、真ん中で少しゆっくり
  const e = 0.5 + 0.5 * Math.sign(u - 0.5) * Math.pow(Math.abs(2 * u - 1), 1.6);
  const textW = 1900;
  const x = W + 40 - e * (W + textW + 80);
  const x2 = -textW * 0.7 + e * (W + textW * 0.9);
  const split = 6 + 18 * beatPulse(t);
  const shake = (random(`rp${frame}`) - 0.5) * 6;
  const base: React.CSSProperties = {
    position: 'absolute',
    whiteSpace: 'nowrap',
    fontFamily: ITALIC,
    fontStyle: 'italic',
    fontWeight: 600,
    lineHeight: 1,
  };
  return (
    <AbsoluteFill>
      {/* 下：細い輪郭だけの逆向き */}
      <div style={{ ...base, left: x2, top: CY + 190, fontSize: 150, color: 'transparent', WebkitTextStroke: `1.5px ${CYAN}`, opacity: 0.5 }}>
        round and round and round
      </div>
      <div
        style={{
          ...base,
          left: x,
          top: CY - 170 + shake,
          fontSize: 300,
          color: '#ffffff',
          letterSpacing: '-0.01em',
          textShadow: `-${split}px 0 ${CYAN}, ${split}px 0 ${MAGENTA}, 0 0 40px rgba(127,232,255,0.6)`,
          filter: `blur(${u < 0.12 || u > 0.88 ? 2.5 : 0}px)`,
        }}
      >
        Round and round
      </div>
    </AbsoluteFill>
  );
};

// ───────── 円の中心：Ø／カウンター ─────────
const Center: React.FC<{ t: number; frame: number; collapse: number }> = ({ t, frame, collapse }) => {
  const counting = inRange(t, COUNT_T, 61.54 + 0.5);
  const pulse = beatPulse(t);
  const out: React.ReactNode[] = [];
  if (!counting && t < T.reframe) {
    const op = (0.1 + 0.08 * pulse) * (inRange(t, ROUND_T - 0.1, ROUND_T + 2.3) ? 0.3 : 1);
    out.push(
      <div key="o" style={{ position: 'absolute', left: 0, right: 0, top: CY - 300, textAlign: 'center', fontFamily: LATIN, fontWeight: 300, fontSize: 560, lineHeight: 1, color: WHITE, opacity: op }}>
        Ø
      </div>,
    );
  }
  if (counting) {
    const u = clamp((t - COUNT_T) / 2.6);
    const n = Math.max(1, Math.floor((1 - Math.pow(1 - u, 2.2)) * 2999) + (u >= 1 ? 1 : 0));
    const fade = clamp((t - COUNT_T) / 0.15) * (1 - clamp((t - 61.54) / 0.5));
    const g = u < 1 && random(`cn${frame}`) < 0.3;
    out.push(
      <div key="n" style={{ position: 'absolute', left: 0, right: 0, top: CY - 150, textAlign: 'center', opacity: fade }}>
        <div
          style={{
            fontFamily: LATIN,
            fontWeight: 500,
            fontSize: 210,
            lineHeight: 1,
            color: '#fff',
            fontVariantNumeric: 'tabular-nums',
            textShadow: g ? `-8px 0 ${CYAN}, 8px 0 ${MAGENTA}` : '0 0 30px rgba(127,232,255,0.7)',
          }}
        >
          #{n.toLocaleString('en-US')}
        </div>
        <div style={{ fontFamily: ITALIC, fontStyle: 'italic', fontSize: 52, color: CYAN, opacity: 0.85, marginTop: 10, letterSpacing: '0.08em' }}>
          nice to meet you
        </div>
      </div>,
    );
  }
  return <AbsoluteFill style={{ opacity: 1 - collapse }}>{out}</AbsoluteFill>;
};

// ───────── RE:FRAME ─────────
const Reframe: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  if (!inRange(t, T.reframe, CARD_T + 0.3)) return null;
  const u = (t - T.reframe) / (CARD_T - T.reframe);
  const op = clamp((t - T.reframe) / 0.12) * (1 - clamp((t - CARD_T + 0.3) / 0.4));
  const heavy = u < 0.15 || random(`rf${Math.floor(frame / 2)}`) < 0.2;
  const jx = heavy ? (random(`rfx${Math.floor(frame / 2)}`) - 0.5) * 60 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: CY - 90,
        textAlign: 'center',
        fontFamily: LATIN,
        fontWeight: 500,
        fontSize: 150,
        letterSpacing: '0.18em',
        paddingLeft: '0.18em',
        color: '#fff',
        mixBlendMode: 'difference',
        opacity: op,
        transform: `translateX(${jx}px) scale(${1 + u * 0.08})`,
        textShadow: heavy ? `-10px 0 ${CYAN}, 10px 0 ${MAGENTA}` : '0 0 30px rgba(255,255,255,0.4)',
      }}
    >
      RE:FRAME
    </div>
  );
};

// ───────── 最後のカード：Ø＋タイトル ─────────
const EndCard: React.FC<{ lt: number; frame: number; dark: boolean; credits: boolean }> = ({ lt, frame, dark, credits }) => {
  if (lt < 0) return null;
  const a = easeInOut(clamp(lt / 0.7));
  const b = easeInOut(clamp((lt - 0.5) / 0.7));
  const g = lt < 0.4 && random(`ec${frame}`) < 0.5;
  return (
    <AbsoluteFill style={{ backgroundColor: dark ? `rgba(3,3,7,${0.82 * a})` : undefined }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: CY - 330,
          textAlign: 'center',
          fontFamily: LATIN,
          fontWeight: 300,
          fontSize: 620,
          lineHeight: 1,
          color: WHITE,
          opacity: a,
          transform: `scale(${1.25 - 0.25 * a})`,
          textShadow: g ? `-12px 0 ${CYAN}, 12px 0 ${MAGENTA}` : '0 0 50px rgba(127,232,255,0.45)',
        }}
      >
        Ø
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: CY + 360, textAlign: 'center', opacity: b }}>
        <div style={{ fontFamily: LATIN, fontWeight: 500, fontSize: 104, letterSpacing: '0.3em', paddingLeft: '0.3em', color: WHITE }}>CIRCLE Ø</div>
        {credits && <div style={{ fontFamily: MINCHO, fontSize: 52, letterSpacing: '0.4em', paddingLeft: '0.4em', color: '#cfd6ff', marginTop: 26 }}>六ツ扉</div>}
        {credits && <div style={{ fontFamily: LATIN, fontSize: 46, letterSpacing: '0.22em', paddingLeft: '0.22em', color: CYAN, marginTop: 34 }}>2026.11.27 RELEASE</div>}
      </div>
    </AbsoluteFill>
  );
};

// ───────── 上の小さいタイトル ─────────
const Title: React.FC<{ frame: number; hide: number }> = ({ frame, hide }) => {
  const glitch = random(`tt${Math.floor(frame / 2)}`) < 0.06;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 150,
        textAlign: 'center',
        fontFamily: LATIN,
        fontSize: 60,
        letterSpacing: '0.34em',
        paddingLeft: '0.34em',
        color: WHITE,
        opacity: 0.7 * (1 - hide),
        textShadow: glitch ? `-6px 0 ${CYAN}, 6px 0 ${MAGENTA}` : '0 0 18px rgba(170,190,255,0.5)',
      }}
    >
      CIRCLE Ø
    </div>
  );
};

// ───────── 本体 ─────────
export const CircleZeroTypeShort: React.FC<CircleZeroTypeProps> = ({ from, to, endCard = false, credits = true }) => {
  const local = useCurrentFrame();
  const startFrame = Math.round(from * FPS);
  const frame = startFrame + local;
  const t = frame / FPS;
  const lt = local / FPS;
  const len = to - from;

  const collapse = easeInOut(clamp((t - T.reframe) / (COLLAPSE_END - T.reframe)));
  const flash = decay(t, T.ch1, 10) * 0.35 + decay(t, T.reframe, 8) * 0.5;
  const cardStart = endCard ? len - 2.4 : CARD_T - from;
  const cardLt = lt - cardStart;
  const fadeIn = clamp(lt / 0.25);
  const zoom = 1 + 0.015 * Math.sin(t / 5) + 0.04 * decay(t, T.ch1, 2.5);
  const volume = (f: number) => {
    const s = f / FPS;
    return clamp(s / 0.15) * (1 - clamp((s - (len - 0.7)) / 0.7));
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('music/circle-zero.mp3')} startFrom={startFrame} volume={volume} />
      <AbsoluteFill style={{ opacity: fadeIn }}>
        <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `50% ${(CY / H) * 100}%` }}>
          <Backdrop t={t} frame={frame} />
          <Dial t={t} collapse={collapse} />
          <Center t={t} frame={frame} collapse={collapse} />
          <Ring t={t} frame={frame} collapse={collapse} />
          <RoundPass t={t} frame={frame} />
          <Reframe t={t} frame={frame} />
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 2px, transparent 4px)',
            mixBlendMode: 'overlay',
          }}
        />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, transparent 52%, rgba(0,0,0,0.65) 100%)' }} />
        <Title frame={frame} hide={clamp(cardLt / 0.5)} />
        <EndCard lt={cardLt} frame={frame} dark={endCard} credits={credits} />
        <AbsoluteFill style={{ backgroundColor: '#fff', opacity: flash, mixBlendMode: 'screen' }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
