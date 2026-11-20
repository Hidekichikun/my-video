import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  continueRender,
  delayRender,
  random,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { BEATS, LYRICS } from './data';

// CIRCLE Ø
// 正面固定の女の子（横顔）＋後ろの大きな時計。時計と女の子は別素材で、針はここで回す。
// 閉じ目 → サビで開眼 → 戻る → サビで開眼 → ラスサビは崩壊版 → 時計が12時に巻き戻る
// → 「鳴らなかった。」で閉じ目のままニヤリ（ヒビが浮き出る）→ 振り向きニヤリ → 暗転
// 素材: public/circle-zero/（女の子は緑を抜いた透過PNG）
// 音源: public/music/circle-zero.mp3 / 歌詞の秒数: ./data.ts（public/lyrics/circle-zero.lrc と同じ）

export const FPS = 30;
export const SONG_LEN = 222.31;
export const END_BLACK = 219.8; // ここで暗転
export const CIRCLE_ZERO_DURATION = Math.ceil((SONG_LEN + 1.5) * FPS);

// ───────── 主要な時刻（曲の秒数） ─────────
export const T = {
  firstLine: 10.68, // 午前零時 鐘が鳴る（ここから秒針スタート）
  pre1: 31.16, // ねえ
  wrongSound: 40.7, // ひとつだけ違う音がした
  ch1: 44.34,
  reframe: 73.58,
  v2: 80.3,
  who: 104.3,
  rewindQ: 107.82, // この世界を巻き戻してる？
  ch2: 111.08,
  kowase: [139.7, 140.34, 140.96],
  iya: 141.88,
  tokei: 149.06, // 時計は止めない
  tada: 156.76,
  nextSec: 159.94, // 次の一秒を見たい
  last: 163.64,
  meWoTojinai: 170.26,
  rewind: 190.38, // 昨日でも（ここから12時に巻き戻す）
  zero: 202.9, // 午前零時
  kane: 205.3, // 鐘は――
  naranakatta: 208.0,
  grin: 213.6, // 振り向きニヤリ
};

// ───────── 色・フォント ─────────
export const WHITE = '#f2f4ff';
export const CYAN = '#7fe8ff';
export const MAGENTA = '#ff5ad1';
export const RED = '#ff2d55';
export const MINCHO = "'CZ Shippori', serif";
export const GLITCH = "'CZ Glitch', serif";
export const LATIN = "'CZ Cormorant', serif";

const fontHandle = typeof window !== 'undefined' ? delayRender('CircleZero fonts') : null;
if (typeof window !== 'undefined') {
  const faces = [
    new FontFace('CZ Shippori', `url(${staticFile('fonts/ShipporiMincho-SemiBold.ttf')})`),
    new FontFace('CZ Glitch', `url(${staticFile('fonts/瀞ノグリッチ明朝H2.otf')})`),
    new FontFace('CZ Cormorant', `url(${staticFile('fonts/CormorantGaramond-VF.ttf')})`),
  ];
  Promise.all(faces.map((f) => f.load().then((ff) => document.fonts.add(ff))))
    .catch((e) => console.error(e))
    .finally(() => fontHandle !== null && continueRender(fontHandle));
}

export const img = (n: string) => staticFile(`circle-zero/circle-zero-${n}.png`);

// ───────── 小物 ─────────
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
export const mod = (x: number, m: number) => ((x % m) + m) % m;
export const inRange = (t: number, a: number, b: number) => t >= a && t < b;
// 時刻 x を過ぎてからの減衰（x 前は 0）
export const decay = (t: number, x: number, k: number) => (t >= x ? Math.exp(-(t - x) * k) : 0);

// ───────── 時計の針 ─────────
// 秒針の角速度（度/秒）のキーフレーム。同じ時刻を2回書くと瞬間で切り替わる。
const SEC_KEYS: Array<[number, number]> = [
  [0, 0],
  [T.firstLine, 0],
  [T.firstLine, 6],
  [T.wrongSound, 6],
  [T.wrongSound, -6], // 「ひとつだけ違う音」で一瞬だけ逆に刻む
  [43.7, -6],
  [43.7, 6],
  [T.ch1, 6],
  [T.ch1 + 1.0, 360], // サビ1：1周/秒
  [T.reframe - 0.05, 360],
  [T.reframe, 0], // RE:FRAME で止まる
  [T.v2, 0],
  [T.v2, 6],
  [T.rewindQ, 6],
  [T.ch2, -90], // 巻き戻してる？ → 逆回転し始める
  [T.ch2 + 0.6, -540], // サビ2：逆回転
  [T.kowase[0] - 0.05, -540],
  [T.kowase[0], 0], // 壊せ〜選ばなかった方へ：止まる
  [T.tokei, 0],
  [T.tokei, 6], // 時計は止めない：また動く
  [T.tada, 6],
  [T.tada, 0], // ただ……
  [T.nextSec, 0],
  [T.nextSec, 6], // 次の一秒
  [T.last, 6],
  [T.last + 1.0, 900], // ラスサビ：最高速
  [T.rewind, 900],
];

const secVelocity = (t: number) => {
  for (let i = SEC_KEYS.length - 1; i >= 0; i--) {
    const [t0, v0] = SEC_KEYS[i];
    if (t >= t0) {
      const next = SEC_KEYS[i + 1];
      if (!next || next[0] === t0) return v0;
      return lerp(v0, next[1], clamp((t - t0) / (next[0] - t0)));
    }
  }
  return 0;
};

type Hands = { sec: number; min: number; hour: number; vel: number };
const TOTAL_FRAMES = CIRCLE_ZERO_DURATION;
export const HANDS: Hands[] = (() => {
  const out: Hands[] = [];
  let a = 0;
  let rewindFrom: { s: number; m: number; h: number } | null = null;
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const t = f / FPS;
    if (t < T.rewind) {
      const v = secVelocity(t);
      a += v / FPS;
      // ゆっくりの時はカチッと刻む
      const slow = Math.abs(v) <= 12;
      let sec = a;
      if (slow) {
        const base = Math.floor(a / 6);
        const frac = a / 6 - base;
        sec = 6 * (base + clamp(frac * 7));
      }
      out.push({ sec, min: a / 60, hour: a / 720, vel: v });
    } else {
      if (!rewindFrom) rewindFrom = { s: a, m: a / 60, h: a / 720 };
      const { s, m, h } = rewindFrom;
      const target = { s: s - mod(s, 360) - 360 * 14, m: m - mod(m, 360) - 360, h: h - mod(h, 360) };
      const u = easeInOut(clamp((t - T.rewind) / (T.zero - T.rewind)));
      const prev = out[out.length - 1];
      const sec = lerp(s, target.s, u);
      out.push({ sec, min: lerp(m, target.m, u), hour: lerp(h, target.h, u), vel: (sec - prev.sec) * FPS });
    }
  }
  return out;
})();

// 止まっている間の震え
export const tremble = (t: number, frame: number) => {
  const frozen = inRange(t, T.reframe, T.v2) || inRange(t, T.kowase[0], T.tokei) || inRange(t, T.tada, T.nextSec);
  if (!frozen) return 0;
  return (random(`tr${Math.floor(frame / 2)}`) - 0.5) * 4;
};

// ───────── 拍 ─────────
export const beatPulse = (t: number) => {
  let lo = 0;
  let hi = BEATS.length - 1;
  if (t < BEATS[0]) return 0;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (BEATS[mid] <= t) lo = mid;
    else hi = mid - 1;
  }
  return Math.exp(-(t - BEATS[lo]) * 7);
};

// ───────── 区間 ─────────
export type Sec = 'intro' | 'verse' | 'pre' | 'chorus' | 'reframe' | 'who' | 'kowase' | 'bridge' | 'last' | 'rewind' | 'still' | 'end';
export const sectionAt = (t: number): Sec => {
  if (t < T.firstLine) return 'intro';
  if (t < T.pre1) return 'verse';
  if (t < T.ch1) return 'pre';
  if (t < T.reframe) return 'chorus';
  if (t < T.v2) return 'reframe';
  if (inRange(t, T.who, T.who + 0.9)) return 'who';
  if (t < T.ch2) return 'verse';
  if (t < T.kowase[0]) return 'chorus';
  if (t < T.iya) return 'kowase';
  if (t < T.last) return 'bridge';
  if (t < T.rewind) return 'last';
  if (t < T.zero) return 'rewind';
  if (t < T.naranakatta) return 'still';
  return 'end';
};

const BASE_GLITCH: Record<Sec, number> = {
  intro: 0.03,
  verse: 0.06,
  pre: 0.14,
  chorus: 0.28,
  reframe: 0.55,
  who: 0.75,
  kowase: 0.7,
  bridge: 0.1,
  last: 0.45,
  rewind: 0.15,
  still: 0,
  end: 0,
};

// 女の子の切り替え時刻（ここでグリッチをドカッと入れる）
const SWITCHES = [T.ch1, T.reframe, T.ch2, ...T.kowase, T.iya, T.last, T.rewind];
export const EYE_OPEN_FLASH = [T.ch1, T.ch2, T.last, T.meWoTojinai];

export const glitchAt = (t: number, frame: number) => {
  const sec = sectionAt(t);
  let g = BASE_GLITCH[sec];
  if (sec === 'pre') g += 0.15 * clamp((t - T.pre1) / (T.ch1 - T.pre1));
  if (sec === 'rewind') g *= 1 - clamp((t - T.rewind) / (T.zero - T.rewind));
  for (const s of SWITCHES) g += 1.1 * decay(t, s, 9);
  // ランダムなバースト
  const step = Math.floor(frame / 2);
  const p = sec === 'chorus' || sec === 'last' ? 0.07 : sec === 'verse' || sec === 'bridge' || sec === 'pre' ? 0.025 : 0;
  if (random(`burst${step}`) < p) g += 0.55;
  if (sec === 'chorus' || sec === 'last') g += 0.25 * beatPulse(t);
  if (sec === 'end') g = 0;
  return clamp(g, 0, 1.4);
};

// ───────── グリッチ画像 ─────────
export const GlitchImg: React.FC<{
  src: string;
  amount: number;
  seed: string;
  style: React.CSSProperties;
  opacity?: number;
}> = ({ src, amount, seed, style, opacity = 1 }) => {
  if (opacity <= 0.001) return null;
  const base = (
    <Img src={src} style={{ ...style, position: 'absolute', opacity }} />
  );
  if (amount < 0.02) return base;
  const split = 3 + amount * 16;
  const nSlices = Math.floor(2 + amount * 7);
  const slices = Array.from({ length: nSlices }).map((_, i) => {
    const top = random(`${seed}t${i}`) * 100;
    const h = 1.5 + random(`${seed}h${i}`) * 9 * amount;
    const dx = (random(`${seed}x${i}`) - 0.5) * 220 * amount;
    return (
      <Img
        key={i}
        src={src}
        style={{
          ...style,
          position: 'absolute',
          opacity,
          clipPath: `inset(${top}% 0 ${clamp(100 - top - h, 0, 100)}% 0)`,
          transform: `${style.transform ?? ''} translateX(${dx}px)`,
        }}
      />
    );
  });
  return (
    <>
      <Img
        src={src}
        style={{
          ...style,
          position: 'absolute',
          opacity: opacity * clamp(0.35 + amount * 0.4),
          transform: `${style.transform ?? ''} translateX(${-split}px)`,
          filter: 'brightness(0.9) sepia(1) hue-rotate(150deg) saturate(6)',
          mixBlendMode: 'screen',
        }}
      />
      <Img
        src={src}
        style={{
          ...style,
          position: 'absolute',
          opacity: opacity * clamp(0.3 + amount * 0.4),
          transform: `${style.transform ?? ''} translateX(${split}px)`,
          filter: 'brightness(0.9) sepia(1) hue-rotate(260deg) saturate(6)',
          mixBlendMode: 'screen',
        }}
      />
      {base}
      {slices}
    </>
  );
};

// ───────── 背景 ─────────
const STREAKS = Array.from({ length: 42 }).map((_, i) => ({
  x: random(`sx${i}`) * 1920,
  w: 1 + Math.floor(random(`sw${i}`) * 3),
  h: 80 + random(`sh${i}`) * 420,
  speed: 20 + random(`sv${i}`) * 90,
  y0: random(`sy${i}`) * 1400,
  cyan: random(`sc${i}`) < 0.3,
}));

const Background: React.FC<{ t: number; frame: number; glow: number }> = ({ t, frame, glow }) => (
  <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 43%, #141a3a 0%, #0a0c1c 45%, #040409 100%)' }}>
    {STREAKS.map((s, i) => {
      const y = mod(s.y0 + t * s.speed, 1400 + s.h) - s.h;
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

// ───────── 時計 ─────────
// v3 と同じ：大きい時計を画面のまん中やや左に、女の子の顔の上に重ねる
const CLOCK_SIZE = 1340;
const CLOCK_LEFT = 270;
const CLOCK_TOP = -140;

const Clock: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const h = HANDS[Math.min(frame, HANDS.length - 1)];
  const sec = sectionAt(t);
  const loud = sec === 'chorus' || sec === 'last' ? 1 : 0.25;
  const pulse = beatPulse(t) * loud;
  const bell = decay(t, T.firstLine, 1.5); // 鐘が鳴る
  const cracked =
    inRange(t, T.kowase[0], T.iya) ? 1 : inRange(t, T.last, T.rewind) ? 1 : inRange(t, T.rewind, T.rewind + 1.5) ? 1 - (t - T.rewind) / 1.5 : 0;
  const intro = clamp((t - 0.5) / 4);
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
        // v3 みたいに少しだけ透かす。最後のニヤリでは目が見えるように時計をすっと薄くする
        opacity: intro * 0.82 * lerp(1, 0.3, easeInOut(clamp((t - T.grin) / 1.6))),
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

// ───────── 女の子 ─────────
// 女の子は大きく（顔が画面の左寄りに大きく入る）
const GIRL_W = 2700;
const GIRL_H = Math.round((GIRL_W * 1080) / 1432);
const GIRL_LEFT = -740;
const GIRL_TOP = -25;

type Layer = { name: string; opacity: number };
export const girlLayers = (t: number): Layer[] => {
  if (t >= T.grin) {
    // 振り向きニヤリ：同じ横顔のまま目だけ開けて横目でこっちを見る（grin-side）。時計の後ろでじわっと切り替える
    const u = easeInOut(clamp((t - T.grin) / 1.6));
    return [
      { name: 'grin-closed', opacity: 1 },
      { name: 'grin-side', opacity: u },
    ];
  }
  if (t >= T.naranakatta) {
    const u = easeInOut(clamp((t - T.naranakatta) / 1.8));
    // 下の閉じ目は不透明のまま、上に閉じ目ニヤリを重ねていく（透けないように）
    return [
      { name: 'closed', opacity: 1 },
      { name: 'grin-closed', opacity: u },
    ];
  }
  if (inRange(t, T.ch1, T.reframe) || inRange(t, T.ch2, T.kowase[0])) return [{ name: 'open', opacity: 1 }];
  if (inRange(t, T.kowase[0], T.iya)) {
    const hit = T.kowase.some((k) => inRange(t, k, k + 0.3));
    return [{ name: hit ? 'broken' : 'open', opacity: 1 }];
  }
  if (inRange(t, T.last, T.rewind)) return [{ name: 'broken', opacity: 1 }];
  return [{ name: 'closed', opacity: 1 }];
};

// front=false：時計の後ろで暗め（v3 と同じグレーっぽい感じ）
// front=true ：最後の振り向きニヤリで、明るく時計の前に出てくる
const Girl: React.FC<{ t: number; frame: number; front?: boolean }> = ({ t, frame, front = false }) => {
  const g = glitchAt(t, frame);
  // 最後は、あるかないかくらいまで薄くなって終わる
  const outro = lerp(1, 0.4, easeInOut(clamp((t - T.grin) / (END_BLACK - T.grin))));
  const intro = (front ? clamp((t - T.grin) / 0.2) : clamp((t - 1.5) / 4.5)) * outro;
  if (intro <= 0) return null;
  const layers = girlLayers(t);
  const seed = `g${Math.floor(frame / 2)}`;
  return (
    <AbsoluteFill
      style={{
        opacity: intro,
        // 最後のニヤリでは、目を開けるのに合わせて少しだけ明るくする
        filter: front ? 'none' : `brightness(${lerp(0.5, 0.8, easeInOut(clamp((t - T.grin) / 1.6)))}) saturate(0.6)`,
      }}
    >
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

// ───────── 歌詞（縦書き・右側） ─────────
export const SPECIAL = new Set(['――RE:FRAME', '壊せ', 'Who changed it?']);
export const CHORUS_RANGES: Array<[number, number]> = [
  [T.ch1, T.reframe],
  [T.ch2, T.kowase[0]],
  [T.last, T.rewind],
];

export const lineEnd = (i: number) => {
  const next = LYRICS[i + 1];
  if (LYRICS[i].text === '鳴らなかった。') return T.grin - 0.4;
  return Math.min(next ? next.t : SONG_LEN, LYRICS[i].t + 6.5);
};

// ───────── 大きい・かすれた縦書きの決めフレーズ ─────────
// 短いフレーズのかたまりを、右の暗いところに大きく縦書きで出して、上から下へ流す。
// 文字はかすれ（SVGのノイズで削る）＋グリッチで少しチラつく。
const BIG_GROUPS: Array<{ times: number[]; end: number }> = [
  { times: [31.16, 31.72, 32.94], end: 35.22 }, // ねえ / これは記憶？ / それとも予告？
  { times: [86.9, 88.78], end: 89.84 }, // 記録にない / 記憶にない
  { times: [93.46, 94.88, 95.68, 96.44], end: 97.7 }, // 白い部屋 / 赤い花 / 閉じた扉 / 午前二時十三分
  { times: [105.12, 105.98, 106.76], end: 107.82 }, // 僕じゃない / 君でもない / なら誰が
  { times: [156.76, 157.16, 159.94], end: 163.64 }, // ただ / まだ誰も見たことのない / 次の一秒を見たい
  { times: [190.38, 192.36, 193.66], end: 200.5 }, // 昨日でも / 明日でもない / ここじゃない何処かへ
];
const BIG_T = new Set(BIG_GROUPS.flatMap((g) => g.times));
const BIG_COL_RIGHT = [110, 270, 430, 590];
const textAt = (time: number) => LYRICS.find((L) => Math.abs(L.t - time) < 0.001)?.text ?? '';

// かすれ用のSVGフィルター（seed を変えるとかすれ方が変わる）
export const KasureDefs: React.FC<{ seed: number }> = ({ seed }) => (
  <svg width="0" height="0" style={{ position: 'absolute' }}>
    <defs>
      <filter id={`kasure${seed}`} x="-10%" y="-10%" width="120%" height="120%">
        {/* 横に流れるかすれ（筆のかすれっぽい筋）と細かい粒 */}
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.22" numOctaves="3" seed={seed} result="streak" />
        <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -7 0 0 0 5.3" result="holesA" />
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="1" seed={seed + 7} result="grain" />
        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -8 0 0 0 6.6" result="holesB" />
        <feComposite in="holesA" in2="holesB" operator="in" result="holes" />
        <feComposite in="SourceGraphic" in2="holes" operator="in" result="worn" />
        <feTurbulence type="fractalNoise" baseFrequency="0.02 0.4" numOctaves="1" seed={seed + 3} result="warp" />
        <feDisplacementMap in="worn" in2="warp" scale="3" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
);

export const BigLines: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const g = BIG_GROUPS.find((x) => t >= x.times[0] && t < x.end + 0.7);
  if (!g) return null;
  const seed = 1 + (Math.floor(frame / 3) % 9);
  const groupFade = 1 - clamp((t - g.end) / 0.7);
  return (
    <AbsoluteFill>
      <KasureDefs seed={seed} />
      {g.times.map((t0, ci) => {
        if (t < t0) return null;
        const text = textAt(t0);
        const chars = Array.from(text);
        const size = Math.min(132, 900 / (chars.length * 1.02));
        const life = g.end + 0.7 - t0;
        const u = clamp((t - t0) / life);
        // 行ぜんたいが上から下へ流れる
        const flow = lerp(-70, 150, u);
        const jx = random(`bl${ci}-${Math.floor(frame / 2)}`) < 0.1 ? (random(`blx${frame}${ci}`) - 0.5) * 30 : 0;
        const latest = ci === g.times.filter((x) => x <= t).length - 1;
        return (
          <div
            key={t0}
            style={{
              position: 'absolute',
              right: BIG_COL_RIGHT[ci] - size / 2 + 40 + jx,
              top: 60 + flow,
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontFamily: MINCHO,
              fontSize: size,
              lineHeight: 1,
              letterSpacing: '0.02em',
              color: '#f4f8ff',
              opacity: groupFade * (latest ? 0.95 : 0.6),
              whiteSpace: 'nowrap',
              filter: `url(#kasure${seed}) drop-shadow(0 0 10px rgba(127,232,255,0.55)) drop-shadow(0 0 3px rgba(0,0,10,0.9))`,
            }}
          >
            {chars.map((c, i) => {
              const ct = t - t0 - i * 0.06;
              const a = clamp(ct / 0.25);
              const drop = -(1 - easeInOut(a)) * 140;
              return (
                <span key={i} style={{ display: 'inline-block', opacity: a, transform: `translateY(${drop}px)`, filter: `blur(${(1 - a) * 8}px)` }}>
                  {c}
                </span>
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ───────── 「」の中身をドーンと出す ─────────
const QUOTE_HOLD = 1.9;
const QUOTES = LYRICS.flatMap((L) => {
  const open = L.text.indexOf('「');
  const close = L.text.indexOf('」');
  return open >= 0 && close > open ? [{ text: L.text.slice(open, close + 1), start: L.t + open * 0.045 }] : [];
});
// 0〜1：ドーンが出ている間は1（出入りはなめらかに）
export const quoteActive = (t: number) =>
  Math.max(0, ...QUOTES.map((q) => clamp((t - q.start) / 0.12) * (1 - clamp((t - (q.start + QUOTE_HOLD - 0.3)) / 0.3))));

// サビの長い行は、ここで決めたところで2列に折る（全角スペースの行はそこで折る）
const CHORUS_BREAKS: Record<string, string> = {
  '笑えるほど上手くなった': '笑えるほど\u3000上手くなった',
  '決められた頁を破って': '決められた頁を\u3000破って',
  '原因だけを置き去りにして': '原因だけを\u3000置き去りにして',
  '結末だけが僕らを待つ': '結末だけが\u3000僕らを待つ',
  '何千回目の「初めまして」': '何千回目の\u3000「初めまして」',
  '何千回目の「さようなら」': '何千回目の\u3000「さようなら」',
  '今度こそ言わないで': '今度こそ\u3000言わないで',
  '同じ朝を用意しても': '同じ朝を\u3000用意しても',
  '予定された僕を演じない': '予定された僕を\u3000演じない',
  '何千回でも繰り返すなら': '何千回でも\u3000繰り返すなら',
  '何千一回目だけ逸れればいい': '何千一回目だけ\u3000逸れればいい',
  '存在しないはずの線を引く': '存在しないはずの\u3000線を引く',
};
export const splitChorus = (text: string) => CHORUS_BREAKS[text] ?? text;


// サビの歌詞は画面の中心寄り（女の子の後ろ髪のあたり）に出して、上から下へゆっくり流す
const CHORUS_RIGHT = 600;
const isChorusTime = (t0: number) => CHORUS_RANGES.some(([a, b]) => inRange(t0, a, b));

const VerticalLine: React.FC<{
  text: string;
  t0: number;
  t: number;
  frame: number;
  column: number;
  fade: number;
  perChar: number;
  chorus: boolean;
  end: number;
}> = ({ text, t0, t, frame, column, fade, perChar, chorus, end }) => {
  // サビ：全角スペースのところで2列に分けて、文字を大きく。
  // スペースがない長い行は CHORUS_BREAKS で決めたところで折る
  const shown = chorus ? splitChorus(text) : text;
  const chars = Array.from(shown);
  const parts = shown.split('\u3000');
  const longest = Math.max(...parts.map((x) => Array.from(x).length));
  const chorusSize = Math.min(100, 900 / (longest * 1.16));
  // サビ：行ぜんたいが上から下へすべり落ちる
  const u = clamp((t - t0) / Math.max(0.5, end - t0));
  const flow = chorus ? lerp(-30, 60, u) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        right: chorus ? CHORUS_RIGHT - column * 170 : 96 + column * 112,
        top: (chorus ? 70 : 140) + flow,
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        fontFamily: MINCHO,
        fontSize: chorus ? chorusSize : 54,
        letterSpacing: '0.14em',
        lineHeight: 1,
        color: chorus ? '#e6fbff' : WHITE,
        textShadow: chorus
          ? '0 0 4px rgba(4,4,12,0.95), 0 0 14px rgba(4,4,12,0.9), 0 0 26px rgba(127,232,255,0.7)'
          : '0 0 14px rgba(170,190,255,0.5)',
        opacity: fade,
        whiteSpace: 'nowrap',
      }}
    >
      {chars.map((c, i) => {
        const ct = t - t0 - i * perChar;
        const a = clamp(ct / (chorus ? 0.22 : 0.18));
        const jitter = ct >= 0 && ct < 0.15 ? (random(`lj${t0}-${i}-${frame}`) - 0.5) * 16 : 0;
        // サビ：1文字ずつ上から落ちてくる
        const drop = chorus ? -(1 - easeInOut(a)) * 90 : 0;
        if (chorus && c === '\u3000') return <br key={i} />;
        return (
          <span
            key={i}
            style={{
              opacity: a,
              display: 'inline-block',
              transform: `translate(${jitter}px, ${drop}px)`,
              filter: `blur(${(1 - a) * 6}px)`,
            }}
          >
            {c === ' ' ? ' ' : c}
          </span>
        );
      })}
    </div>
  );
};

const Lyrics: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const shown: React.ReactNode[] = [];
  // 今の行＝column 0、ひとつ前の行＝column 1（薄く）
  let cur = -1;
  for (let i = 0; i < LYRICS.length; i++) if (LYRICS[i].t <= t && !SPECIAL.has(LYRICS[i].text) && !BIG_T.has(LYRICS[i].t)) cur = i;
  if (cur >= 0) {
    const L = LYRICS[cur];
    const end = lineEnd(cur);
    const slow = L.text === '鳴らなかった。' || L.text === '鐘は――';
    const perChar = slow ? 0.16 : 0.045;
    const chorus = isChorusTime(L.t);
    if (t < end + 0.6) {
      const fade = (1 - clamp((t - end) / 0.6)) * (1 - 0.8 * quoteActive(t));
      shown.push(
        <VerticalLine key={`c${cur}`} text={L.text} t0={L.t} t={t} frame={frame} column={0} fade={fade} perChar={perChar} chorus={chorus} end={end} />,
      );
    }
    // ひとつ前
    let prev = cur - 1;
    while (prev >= 0 && (SPECIAL.has(LYRICS[prev].text) || BIG_T.has(LYRICS[prev].t))) prev--;
    if (prev >= 0 && t < lineEnd(cur) && L.t - lineEnd(prev) < 0.5) {
      const fade = 0.32 * (1 - clamp((t - L.t) / 2.5));
      const pc = isChorusTime(LYRICS[prev].t);
      if (fade > 0.01)
        shown.push(
          <VerticalLine
            key={`p${prev}`}
            text={LYRICS[prev].text}
            t0={pc ? LYRICS[prev].t : -99}
            t={pc ? Math.max(t, lineEnd(prev)) : t}
            frame={frame}
            column={1}
            fade={fade}
            perChar={0}
            chorus={pc && chorus}
            end={lineEnd(prev)}
          />,
        );
    }
  }
  return <AbsoluteFill>{shown}</AbsoluteFill>;
};

export const QuoteBoom: React.FC<{ t: number; frame: number; cx: number; cy: number; size: number; maxH: number }> = ({
  t,
  frame,
  cx,
  cy,
  size,
  maxH,
}) => {
  let hit: { text: string; start: number } | null = null;
  for (const q of QUOTES) if (inRange(t, q.start, q.start + QUOTE_HOLD)) hit = q;
  if (!hit) return null;
  const age = t - hit.start;
  const inU = clamp(age / 0.14);
  const scale = lerp(1.7, 1, easeInOut(inU)) + 0.04 * clamp(age / QUOTE_HOLD);
  const op = inU * (1 - clamp((age - (QUOTE_HOLD - 0.4)) / 0.4));
  const shaking = age < 0.3 || random(`qb${Math.floor(frame / 2)}`) < 0.12;
  const jy = shaking ? (random(`qbx${frame}`) - 0.5) * 28 : 0;
  const split = shaking ? 9 : 0;
  // 日本語は縦書き。長い時は画面に収まるように文字を小さく
  const n = Array.from(hit.text).length;
  const fs = Math.min(size, maxH / (n * 1.04));
  const colH = fs * n * 1.04;
  return (
    <AbsoluteFill>
      {/* 文字の後ろをすこし暗くして読みやすく */}
      <div
        style={{
          position: 'absolute',
          left: cx - fs * 1.6,
          top: cy - colH * 0.7,
          width: fs * 3.2,
          height: colH * 1.4,
          background: 'radial-gradient(ellipse at center, rgba(4,4,12,0.72) 0%, rgba(4,4,12,0.4) 45%, transparent 72%)',
          opacity: op,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: cx - fs * 0.5,
          top: cy - colH / 2,
          width: fs,
          height: colH,
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          fontFamily: MINCHO,
          fontSize: fs,
          lineHeight: 1,
          letterSpacing: '0.04em',
          color: '#ffffff',
          opacity: op,
          whiteSpace: 'nowrap',
          transform: `translateY(${jy}px) scale(${scale})`,
          transformOrigin: '50% 50%',
          textShadow: `${-split}px 0 ${CYAN}, ${split}px 0 ${MAGENTA}, 0 0 24px rgba(127,232,255,0.8), 0 0 60px rgba(127,232,255,0.45)`,
        }}
      >
        {hit.text}
      </div>
    </AbsoluteFill>
  );
};


// ───────── サビの後ろで明朝の歌詞が上から下へ流れる ─────────
type Fall = { t0: number; x: number; size: number; speed: number; op: number; text: string };
const FALLS: Fall[] = (() => {
  const out: Fall[] = [];
  CHORUS_RANGES.forEach(([a, b], ci) => {
    const pool = LYRICS.filter((L) => inRange(L.t, a, b) && !SPECIAL.has(L.text)).map((L) => L.text.replace(/　/g, ''));
    let k = 0;
    for (let s = a - 0.6; s < b - 0.8; s += 0.33) {
      const r = (n: string) => random(`fall${ci}-${k}-${n}`);
      out.push({
        t0: s,
        x: r('x'),
        size: 28 + r('s') * 34,
        speed: 260 + r('v') * 420,
        op: 0.1 + r('o') * 0.2,
        text: pool[Math.floor(r('p') * pool.length)] ?? '',
      });
      k++;
    }
  });
  return out;
})();

export const FallingMincho: React.FC<{ t: number; w: number; h: number }> = ({ t, w, h }) => {
  return (
    <AbsoluteFill>
      {FALLS.map((f, i) => {
        if (t < f.t0) return null;
        const len = Array.from(f.text).length * f.size * 1.1;
        const y = -len + (t - f.t0) * f.speed;
        if (y > h) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: f.x * (w - f.size),
              top: y,
              writingMode: 'vertical-rl',
              fontFamily: MINCHO,
              fontSize: f.size,
              lineHeight: 1,
              letterSpacing: '0.1em',
              color: '#cfeeff',
              opacity: f.op,
              whiteSpace: 'nowrap',
              textShadow: '0 0 10px rgba(127,232,255,0.6)',
            }}
          >
            {f.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// RE:FRAME / Who changed it? / 壊せ
const SpecialText: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const out: React.ReactNode[] = [];
  const jit = (k: string, a: number) => (random(`${k}${Math.floor(frame / 2)}`) - 0.5) * a;
  // RE:FRAME
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
          top: 470,
          textAlign: 'center',
          fontFamily: LATIN,
          fontWeight: 500,
          fontSize: 170,
          letterSpacing: '0.28em',
          color: '#ffffff',
          mixBlendMode: 'difference',
          opacity: op,
          transform: `translateX(${heavy ? jit('rfx', 60) : 0}px) scale(${1 + u * 0.06})`,
          textShadow: heavy ? `${-8}px 0 ${CYAN}, 8px 0 ${MAGENTA}` : 'none',
        }}
      >
        RE:FRAME
      </div>,
    );
  }
  // Who changed it?
  if (inRange(t, T.who, T.who + 1.2)) {
    const op = clamp((t - T.who) / 0.1) * (1 - clamp((t - T.who - 0.9) / 0.3));
    out.push(
      <div
        key="who"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 820,
          textAlign: 'center',
          fontFamily: LATIN,
          fontStyle: 'italic',
          fontSize: 96,
          letterSpacing: '0.12em',
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
  // 壊せ ×3（かすれ用のフィルターもここで用意）
  if (inRange(t, T.kowase[0], T.iya + 0.15)) out.push(<KasureDefs key="kd" seed={1 + (Math.floor(frame / 3) % 9)} />);
  const spots = [
    { x: 150, y: 210, r: -6 },
    { x: 1440, y: 420, r: 5 },
    { x: 760, y: 330, r: -2 },
  ];
  T.kowase.forEach((k, i) => {
    if (!inRange(t, k, T.iya + 0.15)) return;
    const age = t - k;
    const s = 1.35 - 0.35 * clamp(age / 0.12);
    const op = t > T.iya ? 1 - clamp((t - T.iya) / 0.15) : 1;
    out.push(
      <div
        key={`k${i}`}
        style={{
          position: 'absolute',
          left: spots[i].x + jit(`kx${i}`, 24),
          top: spots[i].y + jit(`ky${i}`, 16),
          writingMode: 'vertical-rl',
          lineHeight: 1,
          fontFamily: GLITCH,
          fontSize: 230,
          // 赤はやめて、ほかの文字と同じ白。かすれ＋グリッチのずれで荒らす
          color: '#eef3ff',
          opacity: op * 0.92,
          transform: `rotate(${spots[i].r}deg) scale(${s})`,
          textShadow: `-7px 0 ${CYAN}, 7px 0 ${MAGENTA}, 0 0 22px rgba(200,230,255,0.45)`,
          filter: `url(#kasure${1 + (Math.floor(frame / 3) % 9)})`,
        }}
      >
        壊せ
      </div>,
    );
  });
  return <AbsoluteFill>{out}</AbsoluteFill>;
};

// ───────── タイトル ─────────
const Title: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const op = clamp((t - 2.2) / 1.2) * (1 - clamp((t - 8.6) / 1.4));
  if (op <= 0) return null;
  const glitch = random(`tt${Math.floor(frame / 2)}`) < 0.1;
  return (
    <div
      style={{
        position: 'absolute',
        left: 110,
        bottom: 120,
        fontFamily: LATIN,
        fontWeight: 400,
        fontSize: 92,
        letterSpacing: '0.32em',
        color: WHITE,
        opacity: op,
        textShadow: glitch ? `-6px 0 ${CYAN}, 6px 0 ${MAGENTA}` : '0 0 18px rgba(170,190,255,0.5)',
        transform: `translateX(${glitch ? (random(`ttx${frame}`) - 0.5) * 30 : 0}px)`,
      }}
    >
      CIRCLE Ø
    </div>
  );
};

// ───────── 本体 ─────────
export const CircleZero: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sec = sectionAt(t);

  // カメラ：ゆっくり寄る。「目を閉じない」でドンと寄る。「鐘は――」で静かに寄る
  const drift = 1 + 0.02 * Math.sin(t / 9);
  const punch = 0.07 * decay(t, T.meWoTojinai, 3);
  const kanePush = 0.06 * easeInOut(clamp((t - T.kane) / (T.naranakatta - T.kane + 1.5)));
  const zoom = drift + punch + kanePush;

  const flash = Math.max(...EYE_OPEN_FLASH.map((x) => decay(t, x, 12))) * 0.4 + decay(t, T.firstLine, 3) * 0.25;
  const black = t >= END_BLACK ? 1 : 0;
  const fadeIn = clamp(t / 0.8);
  const glow = sec === 'chorus' || sec === 'last' ? beatPulse(t) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('music/circle-zero.mp3')} />
      <AbsoluteFill style={{ opacity: fadeIn * (1 - black) }}>
        <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: '52% 40%' }}>
          <Background t={t} frame={frame} glow={glow} />
          <FallingMincho t={t} w={1920} h={1080} />
          {/* 時計は女の子の前に重ねる（スクリーン合成で黒が抜けて、時計ごしに顔が透ける） */}
          <Girl t={t} frame={frame} />
          <Clock t={t} frame={frame} />
        </AbsoluteFill>
        {/* 走査線とビネット */}
        <AbsoluteFill
          style={{
            background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 2px, transparent 4px)',
            mixBlendMode: 'overlay',
          }}
        />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.65) 100%)' }} />
        <Title t={t} frame={frame} />
        <Lyrics t={t} frame={frame} />
        <BigLines t={t} frame={frame} />
        <SpecialText t={t} frame={frame} />
        <QuoteBoom t={t} frame={frame} cx={960} cy={540} size={130} maxH={900} />
        <AbsoluteFill style={{ backgroundColor: '#fff', opacity: flash, mixBlendMode: 'screen' }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
