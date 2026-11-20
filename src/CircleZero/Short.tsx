import React from 'react';
import { AbsoluteFill, Audio, Img, random, staticFile, useCurrentFrame } from 'remotion';
import { LYRICS } from './data';
import {
  CHORUS_RANGES,
  CYAN,
  EYE_OPEN_FLASH,
  FallingMincho,
  QuoteBoom,
  quoteActive,
  FPS,
  GlitchImg,
  HANDS,
  LATIN,
  MAGENTA,
  MINCHO,
  SPECIAL,
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
  mod,
  sectionAt,
  tremble,
} from './index';

// CIRCLE Ø ショート（縦 1080x1920）
// MV本編（./index.tsx）と同じ素材・同じ動きを、曲の一部だけ切り出して縦に並べ直したもの。
// from / to は曲の秒数。時計の針・グリッチ・目の開閉は本編とまったく同じタイミングで動く。

export type CircleZeroShortProps = { from: number; to: number; fadeOut?: boolean };

export const SHORT_CUTS = {
  // サビ：「ひとつだけ違う音がした」で針が逆に刻む → サビで開眼・時計が暴走 → RE:FRAME で止まる
  sabi: { from: 40.2, to: 79.6 },
  sabi15: { from: 44.1, to: 59.1 },
  // ラスト：巻き戻し → 午前零時 → 「鳴らなかった。」→ 振り向きニヤリ → 暗転
  ending: { from: 183.2, to: 220.6, fadeOut: false },
} satisfies Record<string, CircleZeroShortProps>;

export const shortFrames = (p: CircleZeroShortProps) => Math.round((p.to - p.from) * FPS);

const W = 1080;
const H = 1920;

// ───────── 背景（縦用の光の筋） ─────────
const STREAKS = Array.from({ length: 34 }).map((_, i) => ({
  x: random(`vsx${i}`) * W,
  w: 1 + Math.floor(random(`vsw${i}`) * 3),
  h: 120 + random(`vsh${i}`) * 520,
  speed: 25 + random(`vsv${i}`) * 110,
  y0: random(`vsy${i}`) * 2400,
  cyan: random(`vsc${i}`) < 0.3,
}));

const Background: React.FC<{ t: number; frame: number; glow: number }> = ({ t, frame, glow }) => (
  <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 40%, #141a3a 0%, #0a0c1c 42%, #040409 100%)' }}>
    {STREAKS.map((s, i) => {
      const y = mod(s.y0 + t * s.speed, H + 400 + s.h) - s.h;
      const flick = 0.05 + 0.12 * random(`sf${i}-${Math.floor(frame / 3)}`) + glow * 0.15;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s.x,
            top: y,
            width: s.w,
            height: s.h,
            opacity: flick,
            background: `linear-gradient(to bottom, transparent, ${s.cyan ? CYAN : '#cfd6ff'}, transparent)`,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

// ───────── 時計（MVと同じく顔の前＝左上。針が見えるように） ─────────
const CLOCK_SIZE = 980;
const CLOCK_LEFT = -150;
const CLOCK_TOP = 300;

const Clock: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const h = HANDS[Math.min(frame, HANDS.length - 1)];
  const sec = sectionAt(t);
  const loud = sec === 'chorus' || sec === 'last' ? 1 : 0.25;
  const pulse = beatPulse(t) * loud;
  const bell = decay(t, T.firstLine, 1.5);
  const cracked =
    inRange(t, T.kowase[0], T.iya) ? 1 : inRange(t, T.last, T.rewind) ? 1 : inRange(t, T.rewind, T.rewind + 1.5) ? 1 - (t - T.rewind) / 1.5 : 0;
  const tr = tremble(t, frame);
  const shake = glitchAt(t, frame) > 0.6 ? (random(`cs${frame}`) - 0.5) * 18 : 0;
  const scale = 1 + 0.014 * pulse + 0.03 * bell;
  const bright = 0.85 + 0.45 * pulse + 0.8 * bell + (sec === 'still' || sec === 'end' ? -0.1 : 0);
  const hand = (name: string, angle: number, extra?: React.CSSProperties) => (
    <Img
      src={img(`hand-${name}`)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: `rotate(${angle}deg)`, mixBlendMode: 'screen', ...extra }}
    />
  );
  const fast = Math.abs(h.vel);
  const trails = fast > 120 ? [1, 2, 3, 4] : [];
  return (
    <div
      style={{
        position: 'absolute',
        left: CLOCK_LEFT + shake,
        top: CLOCK_TOP,
        width: CLOCK_SIZE,
        height: CLOCK_SIZE,
        transform: `scale(${scale})`,
        filter: `brightness(${bright})`,
        mixBlendMode: 'screen',
      }}
    >
      <Img src={img('clock-face')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 1 - cracked }} />
      <Img src={img('clock-face-cracked')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: cracked, mixBlendMode: 'screen' }} />
      {hand('hour', h.hour)}
      {hand('minute', h.min)}
      {trails.map((k) => hand('second', h.sec - (h.vel / FPS) * 0.22 * k, { opacity: 0.45 / k }))}
      {hand('second', h.sec + tr)}
    </div>
  );
};

// ───────── 女の子（右寄り。顔の前に時計がくる） ─────────
const GIRL_W = 1500;
const GIRL_H = Math.round((GIRL_W * 1080) / 1432);
const GIRL_LEFT = 80;
const GIRL_TOP = 420;

const Girl: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const g = glitchAt(t, frame);
  const layers = girlLayers(t);
  const seed = `g${Math.floor(frame / 2)}`;
  return (
    <AbsoluteFill>
      {layers.map((l) => (
        <GlitchImg
          key={l.name}
          src={img(`girl-${l.name}`)}
          amount={g}
          seed={seed + l.name}
          opacity={l.opacity}
          style={{ left: GIRL_LEFT, top: GIRL_TOP, width: GIRL_W, height: GIRL_H }}
        />
      ))}
    </AbsoluteFill>
  );
};

// ───────── 歌詞（横書き・下） ─────────
const LyricLine: React.FC<{ text: string; t0: number; t: number; frame: number; fade: number; perChar: number; y: number; size: number; dim?: boolean }> = ({
  text,
  t0,
  t,
  frame,
  fade,
  perChar,
  y,
  size,
  dim,
}) => {
  const chorus = CHORUS_RANGES.some(([a, b]) => inRange(t0, a, b));
  const chars = Array.from(text);
  const latin = /^[\x20-\x7e]+$/.test(text);
  return (
    <div
      style={{
        position: 'absolute',
        left: 40,
        right: 40,
        top: y,
        textAlign: 'center',
        fontFamily: latin ? LATIN : MINCHO,
        fontWeight: latin ? 600 : undefined,
        fontStyle: latin ? 'italic' : undefined,
        fontSize: latin ? size * 1.25 : size,
        letterSpacing: latin ? '0.06em' : '0.12em',
        lineHeight: 1.2,
        color: chorus && !dim ? '#e6fbff' : WHITE,
        textShadow: `0 2px 10px rgba(0,0,0,0.9), 0 0 18px ${chorus ? 'rgba(127,232,255,0.8)' : 'rgba(170,190,255,0.55)'}`,
        opacity: fade,
        whiteSpace: 'nowrap',
      }}
    >
      {chars.map((c, i) => {
        const ct = t - t0 - i * perChar;
        const a = clamp(ct / 0.18);
        const jitter = ct >= 0 && ct < 0.15 ? (random(`lj${t0}-${i}-${frame}`) - 0.5) * 16 : 0;
        return (
          <span key={i} style={{ opacity: a, display: 'inline-block', transform: `translateY(${jitter}px)`, filter: `blur(${(1 - a) * 6}px)` }}>
            {c === ' ' ? ' ' : c}
          </span>
        );
      })}
    </div>
  );
};

const LYRIC_Y = 1540;

const Lyrics: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const shown: React.ReactNode[] = [];
  let cur = -1;
  for (let i = 0; i < LYRICS.length; i++) if (LYRICS[i].t <= t && !SPECIAL.has(LYRICS[i].text)) cur = i;
  if (cur >= 0) {
    const L = LYRICS[cur];
    const end = lineEnd(cur);
    const slow = L.text === '鳴らなかった。' || L.text === '鐘は――';
    const perChar = slow ? 0.16 : 0.045;
    const big = slow || L.text === '午前零時';
    if (t < end + 0.6) {
      const fade = (1 - clamp((t - end) / 0.6)) * (1 - 0.8 * quoteActive(t));
      shown.push(
        <LyricLine key={`c${cur}`} text={L.text} t0={L.t} t={t} frame={frame} fade={fade} perChar={perChar} y={LYRIC_Y} size={big ? 82 : 66} />,
      );
    }
    // ひとつ前の行を上にうっすら
    let prev = cur - 1;
    while (prev >= 0 && SPECIAL.has(LYRICS[prev].text)) prev--;
    if (prev >= 0 && t < lineEnd(cur) && L.t - lineEnd(prev) < 0.5) {
      const fade = 0.34 * (1 - clamp((t - L.t) / 2.5));
      if (fade > 0.01)
        shown.push(
          <LyricLine key={`p${prev}`} text={LYRICS[prev].text} t0={-99} t={t} frame={frame} fade={fade} perChar={0} y={LYRIC_Y - 92} size={48} dim />,
        );
    }
  }
  return <AbsoluteFill>{shown}</AbsoluteFill>;
};

// RE:FRAME / Who changed it?
const SpecialText: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const out: React.ReactNode[] = [];
  const jit = (k: string, a: number) => (random(`${k}${Math.floor(frame / 2)}`) - 0.5) * a;
  if (inRange(t, T.reframe, T.v2)) {
    const u = (t - T.reframe) / (T.v2 - T.reframe);
    const op = clamp((t - T.reframe) / 0.15) * (1 - clamp((u - 0.8) / 0.2));
    const heavy = u < 0.12 || random(`rf${Math.floor(frame / 2)}`) < 0.18;
    out.push(
      <div
        key="rf"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1500,
          textAlign: 'center',
          fontFamily: LATIN,
          fontWeight: 500,
          fontSize: 132,
          letterSpacing: '0.2em',
          paddingLeft: '0.2em',
          color: '#ffffff',
          mixBlendMode: 'difference',
          opacity: op,
          transform: `translateX(${heavy ? jit('rfx', 50) : 0}px) scale(${1 + u * 0.06})`,
          textShadow: heavy ? `-8px 0 ${CYAN}, 8px 0 ${MAGENTA}` : 'none',
        }}
      >
        RE:FRAME
      </div>,
    );
  }
  if (inRange(t, T.who, T.who + 1.2)) {
    const op = clamp((t - T.who) / 0.1) * (1 - clamp((t - T.who - 0.9) / 0.3));
    out.push(
      <div
        key="who"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1560,
          textAlign: 'center',
          fontFamily: LATIN,
          fontStyle: 'italic',
          fontSize: 90,
          color: '#fff',
          mixBlendMode: 'difference',
          opacity: op,
          transform: `translateX(${jit('who', 40)}px)`,
          textShadow: `-6px 0 ${CYAN}, 6px 0 ${MAGENTA}`,
        }}
      >
        Who changed it?
      </div>,
    );
  }
  return <AbsoluteFill>{out}</AbsoluteFill>;
};

// ───────── タイトル（上） ─────────
const Title: React.FC<{ frame: number; local: number }> = ({ frame, local }) => {
  // 最初の3秒は大きめ、そのあとは小さく残す
  const big = 1 - easeInOut(clamp((local - 2.6) / 0.8));
  const glitch = random(`tt${Math.floor(frame / 2)}`) < 0.08;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 120 - 20 * (1 - big),
        textAlign: 'center',
        fontFamily: LATIN,
        fontWeight: 400,
        fontSize: 64 + 44 * big,
        letterSpacing: '0.32em',
        paddingLeft: '0.32em',
        color: WHITE,
        opacity: 0.75 + 0.25 * big,
        textShadow: glitch ? `-6px 0 ${CYAN}, 6px 0 ${MAGENTA}` : '0 0 18px rgba(170,190,255,0.55)',
        transform: `translateX(${glitch ? (random(`ttx${frame}`) - 0.5) * 30 : 0}px)`,
      }}
    >
      CIRCLE Ø
    </div>
  );
};

// ───────── 本体 ─────────
export const CircleZeroShort: React.FC<CircleZeroShortProps> = ({ from, to, fadeOut = true }) => {
  const local = useCurrentFrame();
  const startFrame = Math.round(from * FPS);
  const frame = startFrame + local; // 曲の中のフレーム（針やグリッチは本編と同じ値）
  const t = frame / FPS;
  const lt = local / FPS;
  const len = to - from;
  const sec = sectionAt(t);

  const drift = 1 + 0.02 * Math.sin(t / 9);
  const punch = 0.07 * decay(t, T.meWoTojinai, 3);
  const kanePush = 0.06 * easeInOut(clamp((t - T.kane) / (T.naranakatta - T.kane + 1.5)));
  const zoom = drift + punch + kanePush;

  const flash = Math.max(...EYE_OPEN_FLASH.map((x) => decay(t, x, 12))) * 0.4;
  const black = t >= 219.8 ? 1 : 0;
  const fadeIn = clamp(lt / 0.25);
  const out = fadeOut ? 1 - clamp((lt - (len - 0.6)) / 0.6) : 1;
  const glow = sec === 'chorus' || sec === 'last' ? beatPulse(t) : 0;
  // 音もはじめと終わりだけ少しフェード
  const volume = (f: number) => {
    const s = f / FPS;
    const a = clamp(s / 0.15);
    const b = fadeOut ? 1 - clamp((s - (len - 0.6)) / 0.6) : 1;
    return a * b;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('music/circle-zero.mp3')} startFrom={startFrame} volume={volume} />
      <AbsoluteFill style={{ opacity: fadeIn * out * (1 - black) }}>
        <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: '50% 38%' }}>
          <Background t={t} frame={frame} glow={glow} />
          <FallingMincho t={t} w={W} h={H} />
          <Clock t={t} frame={frame} />
          <Girl t={t} frame={frame} />
        </AbsoluteFill>
        {/* 下を暗くして歌詞を読みやすく */}
        <AbsoluteFill style={{ background: 'linear-gradient(to bottom, transparent 62%, rgba(4,4,9,0.82) 76%, #040409 90%)' }} />
        <AbsoluteFill
          style={{
            background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 2px, transparent 4px)',
            mixBlendMode: 'overlay',
          }}
        />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />
        <Title frame={frame} local={lt} />
        <Lyrics t={t} frame={frame} />
        <SpecialText t={t} frame={frame} />
        <QuoteBoom t={t} frame={frame} cx={540} cy={1250} size={112} />
        <AbsoluteFill style={{ backgroundColor: '#fff', opacity: flash, mixBlendMode: 'screen' }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
