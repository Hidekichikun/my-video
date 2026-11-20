import React, { useEffect, useMemo, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  continueRender,
  delayRender,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// 部長、ここは地上です！
// スーファミの「横スクロールアクション」風ドット絵。社長 → 課長 → 社畜 に続くシリーズ4作目。
// 設定・場面割りは mv/部長ここは地上です/制作メモ.md を参照。
//
// 音源は public/music/bucho-chijo-mv.wav（scripts/bucho_audio.py で作成）。
//   「そうか」のあと CUT_IN で止めて寸劇 SKIT 秒 → 元の曲の CUT_OUT（「オイ！」の直前）から再開。最後に余白 POST 秒。
// 歌詞(LRC)は「採用版の曲の秒数」。songTime() で動画の秒数から変換して使う。
// 素材は public/photo/bucho/（scripts/bucho_process.py で作成）。主人公・新人・同僚・社長・課長は前作のを流用。

const LRC_FILE = 'lyrics/bucho-chijo.lrc';
const AUDIO_FILE = 'music/bucho-chijo-mv.wav';

const CUT_IN = 155.6;
const PAD = 0.8; // 「そうか」のあとの間（曲の無音 2:35.12〜CUT_IN ＋ PAD 秒）。この間は画面もそのまま
const CUT_OUT = 155.93;
const SKIT = 19.8;
const SONG_LEN = 226.476;
const POST = 3.0;
const FPS = 30;
export const BUCHO_CHIJO_DURATION = Math.ceil((CUT_IN + PAD + SKIT + (SONG_LEN - CUT_OUT) + POST) * FPS);

const PIXEL_FONT = "'DotGothic16', monospace";
const YELLOW = '#ffd23f';
const ORANGE = '#ff9a2e';
const CYAN = '#7fe8ff';
const WHITE = '#fffaf0';
const GREEN = '#7dff9a';
const GREY = '#b9b4d6';
const RED = '#ff5050';
const PINK = '#ff7fb8';

const BEAT = 60 / 143.5;

type Section =
  | 'intro' | 'title' | 'iverse' | 'inst' | 'v1' | 'v1b' | 'pre1' | 'ch1' | 'v2' | 'pre2' | 'ch2'
  | 'bdown' | 'meeting' | 'prebreak' | 'skit' | 'shout' | 'v3' | 'quiet' | 'final' | 'outro' | 'ending' | 'post';

const sections: Array<{ start: number; type: Section }> = [
  { start: 0, type: 'intro' },
  { start: 4.0, type: 'title' },
  { start: 14.08, type: 'iverse' },
  { start: 24.0, type: 'inst' },
  { start: 30.28, type: 'v1' },
  { start: 43.1, type: 'v1b' },
  { start: 54.16, type: 'pre1' },
  { start: 60.82, type: 'ch1' },
  { start: 81.18, type: 'v2' },
  { start: 94.78, type: 'pre2' },
  { start: 101.1, type: 'ch2' },
  { start: 121.34, type: 'bdown' },
  { start: 140.1, type: 'meeting' },
  { start: 141.8, type: 'prebreak' },
  { start: CUT_OUT, type: 'shout' },
  { start: 164.2, type: 'v3' },
  { start: 171.02, type: 'quiet' },
  { start: 178.6, type: 'final' },
  { start: 201.24, type: 'outro' },
  { start: 212.84, type: 'ending' },
];
const sectionAtSong = (s: number): Section => {
  let cur: Section = 'intro';
  for (const sec of sections) if (s >= sec.start) cur = sec.type;
  return cur;
};

const songTime = (t: number): { song: number | null; skit: number | null; post: number | null } => {
  if (t < CUT_IN) return { song: t, skit: null, post: null };
  if (t < CUT_IN + PAD) return { song: CUT_IN - 0.01, skit: null, post: null }; // 間（「そうか」の絵のまま止める）
  if (t < CUT_IN + PAD + SKIT) return { song: null, skit: t - CUT_IN - PAD, post: null };
  const s = t - CUT_IN - PAD - SKIT + CUT_OUT;
  if (s < SONG_LEN) return { song: s, skit: null, post: null };
  return { song: null, skit: null, post: s - SONG_LEN };
};

// ---- helpers ----
const step = (frame: number, n: number) => Math.floor(frame / n) * n;
const snap = (v: number, px = 4) => Math.round(v / px) * px;
const between = (s: number | null, a: number, b: number) => s !== null && s >= a && s < b;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const beatIdx = (s: number, base: number) => Math.floor((s - base) / BEAT);
const beatHop = (s: number, base: number, every = 1, h = 60) => {
  const p = ((((s - base) / (BEAT * every)) % 1) + 1) % 1;
  return snap(4 * h * p * (1 - p), 8);
};

type Lyric = { time: number; text: string };
const parseLrc = (lrc: string): Lyric[] => {
  const out: Lyric[] = [];
  for (const raw of lrc.split(/\r?\n/)) {
    const m = raw.match(/^\[(\d{1,2}):(\d{1,2}(?:\.\d{1,3})?)\](.*)$/);
    if (!m) continue;
    out.push({ time: parseInt(m[1], 10) * 60 + parseFloat(m[2]), text: m[3].trim() });
  }
  return out.sort((a, b) => a.time - b.time);
};

const loadFont = async () => {
  const font = new FontFace('DotGothic16', `url(${staticFile('fonts/DotGothic16.ttf')}) format('truetype')`);
  const loaded = await font.load();
  document.fonts.add(loaded);
};
const isAbortError = (err: unknown) => err instanceof DOMException && err.name === 'AbortError';

// ---- スプライト ----
// 名前の頭: 'b:' = photo/bucho（今回）、's:' = photo/shachiku、'k:' = photo/kacho（前作の流用）
// 表示の高さ(px)。シートごとに絵の大きさがちがうので、キャラの背の高さがそろうように決めてある
const H: Record<string, number> = {
  'b:D01_idle': 560, 'b:D02_ganimata_walk': 530, 'b:D03_chest_thump': 560, 'b:D04_never_said': 560,
  'b:D05_float': 560, 'b:D06_point_shout': 550, 'b:D07_fix_machine': 470, 'b:D08_souka': 565,
  'b:D09_eye_to_eye': 430, 'b:D10_fly': 250, 'b:D11_rush': 400, 'b:D12_walk_away': 520, 'b:D13_question': 545,
  'b:G01_papers': 500, 'b:G02_sigh': 500, 'b:H05_pull_down': 540, 'b:H06_tsukkomi_point': 516,
  'b:H07_extinguisher': 440, 'b:S10_no_helmet': 500, 'b:S11_helmet_on': 430,
  's:hero_idle': 500, 's:hero_deadpan': 516, 's:boss_clap': 500, 's:S01_idle': 500, 's:S04_shock': 500,
  's:M01_grumble': 400, 's:M02_aruaru': 390, 's:M03_nod': 390,
  'k:K01_idle': 440, 'k:K03_nod': 440, 'k:K13_glance': 420, 'k:H01_tsukkomi': 516, 'k:H02_facepalm': 516,
};
const N: Record<string, number> = {
  'b:D01_idle': 2, 'b:D02_ganimata_walk': 4, 'b:D03_chest_thump': 2, 'b:D04_never_said': 2, 'b:D05_float': 3,
  'b:D06_point_shout': 2, 'b:D07_fix_machine': 3, 'b:D08_souka': 2, 'b:D09_eye_to_eye': 2, 'b:D10_fly': 3,
  'b:D11_rush': 4, 'b:D12_walk_away': 4, 'b:D13_question': 2, 'b:G01_papers': 2, 'b:G02_sigh': 2,
  'b:H05_pull_down': 3, 'b:H06_tsukkomi_point': 2, 'b:H07_extinguisher': 3, 'b:S10_no_helmet': 2, 'b:S11_helmet_on': 3,
};
const DIR: Record<string, string> = { b: 'bucho', s: 'shachiku', k: 'kacho' };
const src = (id: string, idx: number) => {
  const [d, name] = id.split(':');
  return staticFile(`photo/${DIR[d]}/${name}_${idx}.png`);
};

const Sprite: React.FC<{
  id: string;
  frame: number;
  every?: number;
  x: number;
  y?: number;
  scale?: number;
  flip?: boolean;
  filter?: string;
  fixed?: number;
  bob?: number;
  hop?: number;
}> = ({ id, frame, every = 6, x, y = 900, scale = 1, flip = false, filter, fixed, bob = 0, hop = 0 }) => {
  const n = N[id] ?? 2;
  const idx = fixed !== undefined ? clamp(fixed, 0, n - 1) : Math.floor(frame / every) % n;
  const up = (bob ? (Math.floor(frame / 8) % 2 === 0 ? 0 : -bob) : 0) - hop;
  return (
    <Img
      src={src(id, idx)}
      style={{
        position: 'absolute',
        left: snap(x),
        top: snap(y + up),
        height: snap((H[id] ?? 500) * scale),
        transform: `translate(-50%, -100%) scaleX(${flip ? -1 : 1})`,
        transformOrigin: '50% 100%',
        imageRendering: 'pixelated',
        filter: `drop-shadow(0 8px 0 rgba(0,0,0,0.35)) ${filter ?? ''}`,
      }}
    />
  );
};

const hopAt = (s: number, a: number, dur = 0.5, h = 90) => {
  const p = (s - a) / dur;
  return p < 0 || p > 1 ? 0 : snap(4 * h * p * (1 - p), 8);
};

// ---- 背景 ----
const bg = (n: number) => staticFile(`photo/bucho/B${n}.png`);
const BG: React.FC<{ n: number; filter?: string; zoom?: number; ox?: number; oy?: number }> = ({ n, filter, zoom = 1, ox = 0.5, oy = 0.5 }) => (
  <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${ox * 100}% ${oy * 100}%` }}>
    <Img src={bg(n)} style={{ position: 'absolute', left: -40, top: -40, width: 2000, height: 1125, imageRendering: 'pixelated', filter }} />
  </AbsoluteFill>
);
// 横スクロール（2枚目は左右反転してつなぎ目をなくす）
const ScrollBG: React.FC<{ n: number; pos: number; filter?: string }> = ({ n, pos, filter }) => {
  const W = 2000;
  const off = snap(((pos % (2 * W)) + 2 * W) % (2 * W), 8);
  return (
    <AbsoluteFill>
      {[0, 1, 2].map((i) => (
        <Img
          key={i}
          src={bg(n)}
          style={{
            position: 'absolute', left: i * W - off - 40, top: -40, width: W, height: 1125, imageRendering: 'pixelated', filter,
            transform: i % 2 === 1 ? 'scaleX(-1)' : undefined,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// ---- ウィンドウ ----
const Win: React.FC<{ style: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div
    style={{
      position: 'absolute',
      background: 'rgba(10,12,48,0.94)',
      border: '8px solid #fff',
      boxShadow: '0 0 0 6px #000, inset 0 0 0 6px #1d2a8a',
      fontFamily: PIXEL_FONT,
      color: WHITE,
      ...style,
    }}
  >
    {children}
  </div>
);

const MessageBox: React.FC<{
  text: string;
  name?: string;
  color?: string;
  tagColor?: string;
  sinceStart: number;
  speed?: number;
  frame: number;
  big?: boolean;
  shake?: { x: number; y: number };
}> = ({ text, name, color = WHITE, tagColor = '#3b1a6b', sinceStart, speed = 2, frame, big, shake }) => {
  const chars = Array.from(text);
  const shown = Math.min(chars.length, Math.floor(sinceStart / speed) + 1);
  const fontSize = Math.min(big ? 96 : 76, 1560 / Math.max(6, chars.length));
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <Win style={{ left: 120, right: 120, bottom: 40, height: 200, transform: shake ? `translate(${shake.x}px, ${shake.y}px)` : undefined }}>
      {name && (
        <div style={{ position: 'absolute', top: -44, left: 30, padding: '2px 22px', background: tagColor, border: '6px solid #fff', boxShadow: '0 0 0 4px #000', color: WHITE, fontSize: 34 }}>
          {name}
        </div>
      )}
      <div
        style={{
          position: 'absolute', left: 50, right: 50, top: 0, bottom: 0, display: 'flex', alignItems: 'center',
          fontSize, color, whiteSpace: 'nowrap', letterSpacing: '0.06em', textShadow: '5px 5px 0 #000',
        }}
      >
        {chars.slice(0, shown).join('')}
      </div>
      {shown >= chars.length && blink && <div style={{ position: 'absolute', right: 34, bottom: 14, fontSize: 34 }}>▼</div>}
    </Win>
  );
};

const Banner: React.FC<{ text: string; color?: string; since: number; top?: number; size?: number }> = ({ text, color = YELLOW, since, top = 120, size = 96 }) => {
  const x = since < 3 ? -1600 : since < 6 ? -300 : 0;
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: PIXEL_FONT, fontSize: size, color,
        transform: `translateX(${x}px)`, textShadow: '8px 8px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000', whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

// ---- トラブル ----
const ICONS = ['fire', 'smoke', 'gear', 'lamp', 'spark', 'leak', 'papers', 'phone'];
const Icon: React.FC<{ name: string; size: number; x: number; y: number; filter?: string }> = ({ name, size, x, y, filter }) => (
  <Img
    src={staticFile(`photo/bucho/icon_${name}.png`)}
    style={{ position: 'absolute', left: snap(x - size / 2), top: snap(y - size / 2), height: size, imageRendering: 'pixelated', filter: `drop-shadow(0 6px 0 rgba(0,0,0,0.4)) ${filter ?? ''}` }}
  />
);
// TROUBLE カウンタ（曲が進むほど増える。部長がさわると倍）
const TROUBLE_PTS: Array<[number, number]> = [
  [0, 0], [43.1, 1], [47.06, 2], [50.04, 3], [55.0, 6], [57.64, 12], [60.82, 24], [67.58, 48], [77.8, 49],
  [94.78, 98], [96.5, 196], [101.1, 392], [121.34, 400], [130.12, 800], [131.84, 801], [136.84, 802], [138.5, 803],
  [145.18, 804], [146.88, 805], [CUT_OUT, 806], [166.1, 807], [178.6, 899], [192.16, 950], [198.44, 998], [212.0, 999],
];
const troubleAt = (s: number) => {
  let v = 0;
  for (const [tt, n] of TROUBLE_PTS) if (s >= tt) v = n;
  return v;
};
const X2_TIMES = [55.0, 57.64, 60.82, 67.58, 94.78, 96.5, 101.1, 130.12];

// ---- HUD（上のステータス） ----
const Hud: React.FC<{ frame: number; trouble: number; helmet: string; helmetAlert: boolean; maxBlink: boolean }> = ({ frame, trouble, helmet, helmetAlert, maxBlink }) => {
  const blink = Math.floor(frame / 5) % 2 === 0;
  return (
    <>
      <Win style={{ left: 40, top: 36, padding: '10px 24px 12px', whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: 34, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>部長</span>
          <span style={{ fontSize: 26, color: GREY }}>ぜっこうちょう</span>
          <span style={{ display: 'flex', gap: 4 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} style={{ width: 26, height: 22, background: maxBlink && blink ? WHITE : ORANGE, border: '3px solid #fff' }} />
            ))}
          </span>
          <span style={{ color: maxBlink && blink ? WHITE : YELLOW }}>MAX</span>
        </div>
        <div style={{ fontSize: 26, marginTop: 6, color: helmetAlert && blink ? RED : WHITE }}>
          ヘルメット：<span style={{ color: helmetAlert ? RED : YELLOW }}>{helmet}</span>
        </div>
      </Win>
      <Win style={{ right: 40, top: 36, padding: '10px 26px', whiteSpace: 'nowrap', fontSize: 44 }}>
        <span style={{ color: RED, fontSize: 30 }}>TROUBLE　</span>
        {String(trouble).padStart(3, '0')}
      </Win>
    </>
  );
};

// 名前タグ
const speakerOf = (text: string) => {
  if (text.startsWith('「俺') || text.startsWith('「そうか') || text.startsWith('(Leave') || text.startsWith('(I never') || text.startsWith('オイ'))
    return { name: '部長', color: ORANGE, tag: '#7a3b00', big: text.startsWith('オイ') };
  if (text.startsWith('部長、ここは') || text.startsWith('部長もなー') || text.startsWith('部長、これ以上'))
    return { name: '主人公', color: YELLOW, tag: '#7a6400', big: true };
  if (text.startsWith('Trouble') || text.startsWith('Here we go') || text.startsWith('はいはい') || text.startsWith('部長は'))
    return { name: '現場一同', color: CYAN, tag: '#0b5c74', big: text.startsWith('Trouble') || text.startsWith('部長は') };
  return { name: 'ナレーション', color: WHITE, tag: '#3b1a6b', big: false };
};

// サビの中の区切り（サビの頭からの秒数。1回目・2回目・ラスサビで同じ）
const CH_LOCAL = { leave: 0, facepalm: 3.34, never: 6.76, facepalm2: 10.08, float: 13.66, chijo: 16.98, end: 20.36 };

export const BuchoChijo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [lrcContent, setLrcContent] = useState<string | null>(null);
  const [fontHandle] = useState(() => delayRender('bucho-font'));

  useEffect(() => {
    loadFont()
      .catch((err) => console.error('Failed to load font:', err))
      .finally(() => continueRender(fontHandle));
  }, [fontHandle]);

  useEffect(() => {
    const controller = new AbortController();
    const handle = delayRender('bucho-lrc');
    fetch(staticFile(LRC_FILE), { signal: controller.signal })
      .then((res) => res.text())
      .then((text) => setLrcContent(text))
      .catch((err) => {
        if (isAbortError(err)) return;
        console.error('Failed to load LRC:', err);
        setLrcContent('');
      })
      .finally(() => continueRender(handle));
    return () => controller.abort();
  }, []);

  const lyrics = useMemo(() => (lrcContent ? parseLrc(lrcContent) : []), [lrcContent]);
  const t = frame / fps;
  const { song: s, skit: k, post } = songTime(t);
  const S: Section = k !== null ? 'skit' : post !== null ? 'post' : sectionAtSong(s ?? 0);
  const f = frame;
  const sv = s ?? 0;
  const since = (a: number) => Math.round((sv - a) * fps);

  // ---- 今の歌詞 ----
  const idx = s === null ? -1 : lyrics.findIndex((l, i) => l.time <= s && (!lyrics[i + 1] || lyrics[i + 1].time > s));
  const line = idx >= 0 && lyrics[idx].text ? lyrics[idx] : null;
  const next = idx >= 0 ? lyrics[idx + 1] : null;
  const lineFrame = line && s !== null ? Math.round((s - line.time) * fps) : 0;
  const lineHold = line ? (next ? next.time - line.time : 4) : 0;

  // ---- 揺れ ----
  const chBases = [60.82, 101.1, 178.6];
  const thuds = [20.94, 79.6, 119.9, 199.9, 208.76, 144.5, CUT_OUT + 0.1, 130.12, 131.84];
  // ガニ股の足音（2拍ごと）
  const stomping = between(s, 30.28, 37.02) || between(s, 14.08, 15.88);
  let sinceHit = 999;
  if (s !== null) for (const h of [...thuds, ...X2_TIMES]) if (s >= h) sinceHit = Math.min(sinceHit, (s - h) * fps);
  if (stomping) sinceHit = Math.min(sinceHit, (((sv - 30.28) / (BEAT * 2)) % 1) * BEAT * 2 * fps);
  const skitShake = k !== null && ((k >= 0 && k < 0.3) || [17.9, 18.25, 18.6, 18.95].some((a) => k >= a && k < a + 0.15));
  const shaking = sinceHit < (stomping ? 4 : 8) || skitShake;
  const amp = stomping ? 0.5 : 1;
  const shakeX = shaking ? snap((random(`sx${step(f, 2)}`) - 0.5) * 36 * amp, 8) : 0;
  const shakeY = shaking ? snap((random(`sy${step(f, 2)}`) - 0.5) * 28 * amp, 8) : 0;

  // ---- 白フラッシュ ----
  const flashSongTimes = [14.08, 30.28, 60.82, 81.18, 101.1, 121.34, 141.8, 164.2, 178.6, 201.24];
  let sinceFlash = 999;
  if (s !== null) for (const ft of flashSongTimes) if (s >= ft) sinceFlash = Math.min(sinceFlash, (s - ft) * fps);
  const flash = sinceFlash < 3 ? 0.9 : sinceFlash < 6 ? 0.45 : 0;

  // ---- サビの共通シーン ----
  const chorus = (base: number, second: boolean, sunset?: string): React.ReactNode => {
    const d = sv - base;
    const L = CH_LOCAL;
    const fl = sunset;
    const crowd = sunset ? (
      <>
        <Sprite id="s:boss_clap" frame={f} every={5} x={250} y={880} scale={0.8} filter={fl} />
        <Sprite id="k:K03_nod" frame={f} fixed={beatIdx(sv, base) % 2} x={470} y={880} scale={0.85} filter={fl} />
        <Sprite id="s:M03_nod" frame={f} fixed={beatIdx(sv, base) % 2} x={1660} y={900} scale={0.85} filter={fl} />
        <Sprite id="s:S01_idle" frame={f} every={8} x={1430} y={880} scale={0.8} hop={beatHop(sv, base, 2, 24)} filter={fl} />
      </>
    ) : null;
    const pos = (sv - base) * 260;
    if (d < L.facepalm) {
      return (
        <>
          <ScrollBG n={2} pos={pos * 0.3} filter={fl} />
          {crowd}
          <Sprite id="b:D03_chest_thump" frame={f} fixed={beatIdx(sv, base) % 2} x={900} hop={beatHop(sv, base, 2, 20)} filter={fl} />
        </>
      );
    }
    if (d < L.never) {
      return (
        <>
          <ScrollBG n={2} pos={pos * 0.3} filter={fl} />
          {crowd}
          <Sprite id="b:D03_chest_thump" frame={f} fixed={1} x={1150} filter={fl} />
          <Sprite id="k:H02_facepalm" frame={f} every={10} x={640} filter={fl} />
        </>
      );
    }
    if (d < L.facepalm2) {
      return (
        <>
          <ScrollBG n={2} pos={pos * 0.3} filter={fl} />
          {crowd}
          <Sprite id="b:D04_never_said" frame={f} fixed={beatIdx(sv, base) % 2} x={900} filter={fl} />
        </>
      );
    }
    if (d < L.float) {
      return (
        <>
          <ScrollBG n={2} pos={pos * 0.3} filter={fl} />
          {crowd}
          <Sprite id="b:D04_never_said" frame={f} fixed={0} x={1150} filter={fl} />
          <Sprite id="s:hero_deadpan" frame={f} every={30} x={640} filter={fl} />
        </>
      );
    }
    if (d < L.chijo) {
      // ふわっと浮いてる（2回目は空まで飛んでいく）
      const p = (d - L.float) / (L.chijo - L.float);
      if (second && p > 0.45) {
        return (
          <>
            <BG n={6} />
            <Sprite id="b:D10_fly" frame={f} every={4} x={snap(400 + (p - 0.45) * 1800)} y={snap(560 - (p - 0.45) * 300)} />
          </>
        );
      }
      const lift = snap((second ? 260 : 160) * Math.min(1, p * 1.6) + Math.sin(d * 6) * 20, 8);
      return (
        <>
          <ScrollBG n={2} pos={pos * 0.1} filter={fl} />
          {crowd}
          <Sprite id="b:D05_float" frame={f} every={6} x={960} y={900 - lift} filter={fl} />
          {sunset && <Sprite id="s:hero_deadpan" frame={f} every={30} x={600} filter={fl} />}
        </>
      );
    }
    // 部長、ここは地上です！（引きずり下ろす）
    const dd = d - L.chijo;
    const hf = dd < 0.6 ? 0 : dd < 1.3 ? 1 : 2;
    const drop = dd < 0.6 ? 260 : dd < 1.3 ? snap(260 - ((dd - 0.6) / 0.7) * 260, 8) : 0;
    const sky = second && !sunset && dd < 1.3;
    return (
      <>
        <BG n={sky ? 6 : 2} filter={fl} />
        {crowd}
        <Sprite id={drop > 0 ? 'b:D05_float' : 'b:D01_idle'} frame={f} every={6} x={1050} y={900 - drop} filter={fl} />
        <Sprite id="b:H05_pull_down" frame={f} fixed={hf} x={800} filter={fl} />
      </>
    );
  };

  // ===== シーン（背景＋キャラ）=====
  const scene = (): React.ReactNode => {
    switch (S) {
      case 'intro':
        return null;
      case 'title':
        return sv >= 12.0 ? <BG n={1} /> : <BG n={1} filter="brightness(0.3)" />;
      case 'iverse': {
        if (sv < 15.88) {
          return (
            <>
              <BG n={1} />
              <Sprite id="b:D02_ganimata_walk" frame={f} every={5} x={snap(-200 + ((sv - 14.08) / 1.8) * 1160)} />
            </>
          );
        }
        if (sv < 19.12) {
          // 黒いオールバック 広い肩 → Too seasoned, too 昭和（アップ）
          const shouwa = sv >= 17.66 ? 'sepia(0.8) saturate(1.3)' : undefined;
          return (
            <>
              <BG n={1} zoom={1.6} ox={0.5} oy={0.55} filter={shouwa} />
              <Sprite id="b:D01_idle" frame={f} every={12} x={960} y={1500} scale={2.0} filter={shouwa} />
            </>
          );
        }
        if (sv < 20.94) {
          // 右手にヘルメット（手元ズーム）
          return (
            <>
              <BG n={1} zoom={2} ox={0.4} oy={0.8} />
              <Sprite id="b:D01_idle" frame={f} every={12} x={1240} y={1720} scale={2.6} />
            </>
          );
        }
        return (
          <>
            <BG n={1} />
            <Sprite id="b:D03_chest_thump" frame={f} fixed={sv < 21.6 ? 0 : 1} x={960} />
          </>
        );
      }
      case 'inst': {
        const scroll = sv >= 26.0;
        const pos = scroll ? (sv - 26.0) * 420 : 0;
        return (
          <>
            <ScrollBG n={sv < 28.0 ? 1 : 2} pos={pos} />
            <Sprite id="b:D02_ganimata_walk" frame={f} every={scroll ? 5 : 7} x={scroll ? 760 : snap(960 - (sv - 24) * 100)} />
          </>
        );
      }
      case 'v1': {
        if (between(s, 39.68, 43.1)) {
          // まっすぐな目は 今日も本気（体のアップ → 目までスライド）
          const p = clamp((sv - 39.9) / 1.4, 0, 1);
          const e = 1 - (1 - p) * (1 - p) * (1 - p); // だんだんゆっくり止まる
          const pan = snap(e * 560, 8);
          return (
            <>
              <BG n={2} zoom={2.2} ox={0.5} oy={0.45 - e * 0.4} />
              <Sprite id="b:D01_idle" frame={f} fixed={0} x={946} y={2050 + pan} scale={4.2} />
            </>
          );
        }
        const rush = sv >= 37.02;
        return (
          <>
            <ScrollBG n={2} pos={(sv - 30.28) * (rush ? 900 : 320)} />
            {rush ? (
              <Sprite id="b:D11_rush" frame={f} every={3} x={900} />
            ) : (
              <Sprite id="b:D02_ganimata_walk" frame={f} every={Math.round((BEAT * fps) / 2)} x={760} />
            )}
          </>
        );
      }
      case 'v1b': {
        const storm = sv >= 47.06;
        const head = sv >= 50.04;
        const n = storm ? 8 : Math.min(8, 1 + Math.floor((sv - 43.1) * 1.5));
        return (
          <>
            <ScrollBG n={5} pos={(sv - 43.1) * (storm ? 30 : 260)} />
            {head ? (
              <Sprite id="b:D13_question" frame={f} every={10} x={960} />
            ) : (
              <Sprite id={storm ? 'b:D01_idle' : 'b:D02_ganimata_walk'} frame={f} every={storm ? 12 : 5} x={960} />
            )}
            {new Array(n).fill(0).map((_, i) => {
              const a = (i / 8) * Math.PI * 2 + (storm ? sv * 2.4 : 0);
              const r = storm ? 360 : 500 + i * 30;
              return <Icon key={i} name={ICONS[i]} size={130} x={960 + Math.cos(a) * r} y={560 + Math.sin(a) * 200} />;
            })}
          </>
        );
      }
      case 'pre1':
      case 'pre2': {
        const base = S === 'pre1' ? 54.16 : 94.78;
        const big = S === 'pre2' ? 1.6 : 1;
        const d = sv - base;
        const fires = Math.min(12, (S === 'pre2' ? 6 : 2) + Math.floor(d * (S === 'pre2' ? 2 : 1.2)));
        return (
          <>
            <BG n={5} />
            {new Array(fires).fill(0).map((_, i) => (
              <Icon
                key={i}
                name={i % 3 === 2 ? 'smoke' : 'fire'}
                size={snap((110 + random(`fs${i}`) * 60) * big, 8)}
                x={1100 + random(`fx${i}`) * 760}
                y={620 + random(`fy${i}`) * 220 + (Math.floor(f / 6 + i) % 2) * 8}
              />
            ))}
            <Sprite id="b:H07_extinguisher" frame={f} fixed={Math.min(2, Math.floor(d * 2) % 3)} x={420} />
            <Sprite id="b:D11_rush" frame={f} every={3} x={snap(1000 + (d % 1.4) * 500)} />
          </>
        );
      }
      case 'ch1':
        return chorus(60.82, false);
      case 'ch2':
        return chorus(101.1, true);
      case 'v2': {
        if (sv >= 91.48) {
          // 周りは顔を見合わせる（社長と課長がカメオ）
          return (
            <>
              <BG n={3} />
              <Sprite id="s:boss_clap" frame={f} fixed={0} x={560} />
              <Sprite id="k:K13_glance" frame={f} every={20} x={1360} flip />
              <Sprite id="b:D01_idle" frame={f} every={14} x={960} y={920} scale={0.9} />
            </>
          );
        }
        let bucho: React.ReactNode = <Sprite id="b:D13_question" frame={f} every={14} x={1200} />;
        if (between(s, 84.96, 88.1)) bucho = <Sprite id="b:D04_never_said" frame={f} every={10} x={1200} />;
        if (between(s, 88.1, 91.48)) bucho = <Sprite id="b:D03_chest_thump" frame={f} every={14} x={1200} />;
        const crowd = between(s, 83.08, 84.96) ? <Sprite id="s:M03_nod" frame={f} every={6} x={560} /> : <Sprite id="s:M01_grumble" frame={f} every={14} x={560} />;
        return (
          <>
            <BG n={3} />
            {crowd}
            {bucho}
          </>
        );
      }
      case 'bdown': {
        const d = sv - 121.34;
        const two = sv >= 131.84;
        const rush = between(s, 130.12, 131.84) || between(s, 136.84, 138.5);
        const tsukkomi = between(s, 133.3, 135.16);
        const bossY = 470 + Math.sin(d * 3) * 30;
        const boss = (cx: number, seed: string) => (
          <React.Fragment key={seed}>
            {ICONS.map((nm, i) => {
              const a = (i / ICONS.length) * Math.PI * 2 + d * 1.5;
              return <Icon key={nm + seed} name={nm} size={200} x={cx + Math.cos(a) * 130} y={bossY + Math.sin(a) * 120} filter={Math.floor(f / 4) % 2 ? 'brightness(1.4)' : undefined} />;
            })}
            <Icon name="fire" size={260} x={cx} y={bossY} />
          </React.Fragment>
        );
        return (
          <>
            <BG n={7} filter={Math.floor(f / 10) % 2 ? 'brightness(1.15)' : undefined} />
            {sv >= 122.14 && boss(two ? 1150 : 1350, 'a')}
            {two && boss(1650, 'b')}
            {rush ? (
              <Sprite id="b:D11_rush" frame={f} every={3} x={snap(500 + ((sv % 1.7) / 1.7) * 600)} />
            ) : (
              <Sprite id="b:D03_chest_thump" frame={f} fixed={beatIdx(sv, 122.14) % 2} x={620} />
            )}
            {tsukkomi && <Sprite id="b:H06_tsukkomi_point" frame={f} every={6} x={260} />}
            {!tsukkomi && sv >= 122.14 && <Sprite id="s:M02_aruaru" frame={f} fixed={beatIdx(sv, 122.14) % 2} x={250} hop={beatHop(sv, 122.14, 1, 70)} scale={0.9} />}
          </>
        );
      }
      case 'meeting':
        return (
          <>
            <BG n={4} />
            <Sprite id="b:D02_ganimata_walk" frame={f} every={5} x={snap(200 + (sv - 140.1) * 600)} />
          </>
        );
      case 'prebreak': {
        if (sv < 148.52) {
          const d7 = sv < 143.54 ? 0 : sv < 144.5 ? 1 : 2;
          const nextMachine = sv >= 146.88;
          return (
            <>
              <ScrollBG n={8} pos={nextMachine ? (sv - 146.88) * 700 : 0} />
              {between(s, 145.18, 146.88) && <Icon name="smoke" size={snap(160 + (sv - 145.18) * 60, 8)} x={1500} y={480 - (sv - 145.18) * 80} />}
              {between(s, 145.18, 146.88) && <Icon name="lamp" size={120} x={1500} y={330} />}
              {nextMachine ? <Sprite id="b:D11_rush" frame={f} every={3} x={900} /> : <Sprite id="b:D07_fix_machine" frame={f} fixed={d7} x={760} />}
            </>
          );
        }
        // 自分から質問してくる → ちゃんと答えた → そうか
        const souka = sv >= 154.3;
        return (
          <>
            <BG n={2} />
            <Sprite id={souka ? 'b:D08_souka' : 'b:D13_question'} frame={f} every={12} fixed={souka ? (sv < 154.8 ? 0 : 1) : undefined} x={1250} />
            <Sprite id="s:hero_deadpan" frame={f} every={30} x={620} />
          </>
        );
      }
      case 'skit': {
        const kk = k ?? 0;
        if (kk < 1.2) {
          // 「そうか」のままフリーズ
          return (
            <>
              <BG n={2} filter="grayscale(1) contrast(1.1)" />
              <Sprite id="b:D08_souka" frame={f} fixed={1} x={1250} filter="grayscale(1)" />
              <Sprite id="s:hero_deadpan" frame={f} fixed={0} x={620} filter="grayscale(1)" />
            </>
          );
        }
        if (kk >= 10.0 && kk < 13.0) {
          // 主人公アップ
          return (
            <>
              <BG n={3} zoom={1.8} ox={0.3} oy={0.5} filter="brightness(0.8)" />
              <Sprite id="s:hero_deadpan" frame={f} every={40} x={960} y={1700} scale={2.4} />
            </>
          );
        }
        if (kk >= 19.0) {
          // 現場にとうちゃく。ノーヘルの新人
          return (
            <>
              <BG n={2} />
              <Sprite id="b:S10_no_helmet" frame={f} every={10} x={1450} bob={4} />
              <Sprite id="b:D01_idle" frame={f} fixed={0} x={640} scale={1 + clamp((kk - 19.0) / 0.8, 0, 1) * 0.04} />
            </>
          );
        }
        let bucho: React.ReactNode = <Sprite id="b:D01_idle" frame={f} every={14} x={620} />;
        if (kk >= 6.6 && kk < 10.0) bucho = <Sprite id="b:D03_chest_thump" frame={f} fixed={kk < 7.2 ? 0 : 1} x={620} />;
        if (kk >= 13.0 && kk < 16.6) bucho = <Sprite id="b:D04_never_said" frame={f} fixed={0} x={620} />;
        if (kk >= 17.8) bucho = <Sprite id="b:D02_ganimata_walk" frame={f} every={5} x={snap(620 + (kk - 17.8) * 900)} />;
        const somu =
          kk >= 16.6 && kk < 17.3 ? (
            <Sprite id="b:G02_sigh" frame={f} fixed={1} x={1380} />
          ) : (
            <Sprite id="b:G01_papers" frame={f} fixed={kk < 6.6 ? Math.floor(kk * 1.5) % 2 : 0} x={1380} />
          );
        return (
          <>
            <BG n={3} />
            {somu}
            {bucho}
          </>
        );
      }
      case 'shout': {
        if (sv >= 160.36) {
          // 部長もなーー！！（主人公が部長の右手のヘルメットを指さす）
          return (
            <>
              <BG n={2} />
              <Sprite id="b:D01_idle" frame={f} fixed={0} x={1000} />
              <Sprite id="b:H06_tsukkomi_point" frame={f} fixed={Math.floor(f / 6) % 2} x={420} />
              <Sprite id="b:S11_helmet_on" frame={f} fixed={2} x={1600} scale={0.9} />
            </>
          );
        }
        const helmetOn = sv >= 157.4;
        let newbie: React.ReactNode = <Sprite id="s:S04_shock" frame={f} fixed={1} x={1450} hop={hopAt(sv, 156.1, 0.4, 60)} />;
        if (helmetOn) newbie = <Sprite id="b:S11_helmet_on" frame={f} fixed={sv < 158.0 ? 0 : sv < 158.6 ? 1 : 2} x={1450} />;
        return (
          <>
            <BG n={2} />
            <Sprite id="b:D06_point_shout" frame={f} fixed={beatIdx(sv, 156.03) % 2} x={640} />
            {newbie}
          </>
        );
      }
      case 'v3': {
        if (sv >= 169.16) {
          return (
            <>
              <BG n={6} />
              <Sprite id="b:D10_fly" frame={f} every={4} x={snap(300 + (sv - 169.16) * 900)} y={snap(640 - (sv - 169.16) * 120)} />
            </>
          );
        }
        const eye = sv >= 166.1;
        return (
          <>
            <BG n={2} />
            <Sprite id="s:S04_shock" frame={f} every={20} x={1250} filter="saturate(0.8)" />
            {eye ? <Sprite id="b:D09_eye_to_eye" frame={f} every={14} x={900} /> : <Sprite id="b:D02_ganimata_walk" frame={f} every={5} x={snap(200 + (sv - 164.2) * 360)} />}
          </>
        );
      }
      case 'quiet': {
        if (sv >= 176.0) {
          return (
            <>
              <BG n={9} zoom={1.5} ox={0.5} oy={0.4} />
              <Sprite id="b:D01_idle" frame={f} fixed={0} x={960} y={1900} scale={3.4} />
            </>
          );
        }
        const look = between(s, 172.7, 174.34);
        return (
          <>
            <BG n={9} />
            {look && <Sprite id="s:M01_grumble" frame={f} every={14} x={420} flip />}
            {sv < 174.34 ? (
              <Sprite id="b:D12_walk_away" frame={f} every={8} x={1200} scale={1 - (sv - 171.02) * 0.03} />
            ) : (
              <Sprite id="b:D01_idle" frame={f} every={14} x={1100} />
            )}
          </>
        );
      }
      case 'final': {
        const sunset = 'sepia(0.35) saturate(1.5) hue-rotate(-12deg) brightness(0.95)';
        if (between(s, 192.16, 195.9)) {
          return (
            <>
              <BG n={9} />
              <Sprite id="b:D12_walk_away" frame={f} every={8} x={snap(1000 + (sv - 192.16) * 120)} scale={1 - (sv - 192.16) * 0.06} />
              <Sprite id="s:hero_deadpan" frame={f} every={30} x={480} filter={sunset} />
            </>
          );
        }
        if (between(s, 195.9, 198.44)) {
          // どっちかといえば好き（主人公アップ）
          return (
            <>
              <BG n={9} zoom={1.6} ox={0.3} oy={0.5} />
              <Sprite id="s:hero_deadpan" frame={f} fixed={0} x={960} y={1700} scale={2.4} />
            </>
          );
        }
        return chorus(178.6, false, sunset);
      }
      case 'outro': {
        if (between(s, 201.92, 204.98)) {
          return (
            <>
              <BG n={1} zoom={2} ox={0.4} oy={0.8} filter="sepia(0.3)" />
              <Sprite id="b:D01_idle" frame={f} every={12} x={1240} y={1720} scale={2.6} />
            </>
          );
        }
        if (between(s, 204.98, 208.76)) {
          return (
            <>
              <BG n={1} zoom={1.8} ox={0.5} oy={0.2} filter="sepia(0.3)" />
              <Sprite id="b:D01_idle" frame={f} fixed={0} x={960} y={2150} scale={3.6} />
            </>
          );
        }
        return (
          <>
            <BG n={1} filter="sepia(0.3)" />
            {sv >= 208.76 ? <Sprite id="b:D03_chest_thump" frame={f} fixed={sv < 209.4 ? 0 : 1} x={960} /> : <Sprite id="b:D01_idle" frame={f} every={14} x={960} />}
          </>
        );
      }
      default:
        return null;
    }
  };

  // ===== 上に重ねる演出 =====
  const overlays = (): React.ReactNode => {
    const nodes: React.ReactNode[] = [];
    // タイトル画面
    if (S === 'title') {
      const blinkOn = Math.floor(f / 15) % 2 === 0;
      if (sv < 10.0) {
        nodes.push(
          <div key="title" style={{ position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: PIXEL_FONT }}>
            <div style={{ fontSize: 40, color: CYAN, textShadow: '4px 4px 0 #000' }}>よこスクロール げんば アクション</div>
            <div style={{ fontSize: 130, color: YELLOW, marginTop: 10, textShadow: '8px 8px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000' }}>
              部長、ここは地上です！
            </div>
            <div
              style={{
                fontSize: 48, marginTop: 60, textShadow: '4px 4px 0 #000',
                color: sv < 8.6 ? WHITE : YELLOW,
                opacity: sv < 8.6 ? (blinkOn ? 1 : 0) : Math.floor(f / 3) % 2 ? 1 : 0,
              }}
            >
              PUSH START
            </div>
          </div>
        );
      } else if (sv < 12.0) {
        nodes.push(
          <AbsoluteFill key="stage" style={{ background: '#000' }}>
            <Banner text="STAGE 1" color={WHITE} since={since(10.0)} top={380} size={110} />
            <Banner text="こうじょう" color={YELLOW} since={since(10.3)} top={520} size={80} />
          </AbsoluteFill>
        );
      } else if (sv >= 12.6) {
        nodes.push(<Banner key="ready" text="READY…" color={WHITE} since={since(12.6)} top={420} size={110} />);
      }
    }
    if (between(s, 20.94, 24.0)) nodes.push(<Banner key="zekko" text="ぜっこうちょう MAX！" color={ORANGE} since={since(20.94)} top={180} size={110} />);
    if (between(s, 37.02, 39.68)) nodes.push(<Banner key="ma" text="まよい：0" color={WHITE} since={since(37.02)} top={200} size={90} />);
    if (between(s, 43.1, 47.06)) nodes.push(<Banner key="hassei" text="トラブル はっせい！" color={RED} since={since(43.1)} top={190} size={100} />);
    if (between(s, 50.04, 54.16)) nodes.push(<Banner key="bikkuri" text="！" color={YELLOW} since={6} top={snap(150 - hopAt(sv, 50.04, 0.4, 40))} size={180} />);
    // トラブル ×2
    for (const x2 of X2_TIMES) {
      if (chBases.includes(x2)) continue; // サビ頭は「まかせろ」のメッセージを優先（カウンタだけ増える）
      if (between(s, x2, x2 + 1.2)) {
        const big = troubleAt(x2) >= 96;
        nodes.push(<Banner key={`x2${x2}`} text={big ? 'トラブル ×4！' : 'トラブル ×2！'} color={RED} since={since(x2)} top={snap(300 - (sv - x2) * 60, 8)} size={120} />);
      }
    }
    // サビのシステムメッセージ
    for (const [base, second] of [[60.82, false], [101.1, true], [178.6, false]] as Array<[number, boolean]>) {
      const d = sv - base;
      if (s === null || d < 0 || d > CH_LOCAL.end) continue;
      if (base === 178.6 && sv >= 192.16) continue;
      if (d < 2.3) nodes.push(<Banner key="makase" text="ぶちょうは「まかせろ」を つかった！" color={ORANGE} since={since(base)} top={200} size={76} />);
      else if (d >= CH_LOCAL.never && d < CH_LOCAL.never + 2.3) nodes.push(<Banner key="reset" text="ぶちょうの きおくが リセットされた" color={CYAN} since={since(base + CH_LOCAL.never)} top={200} size={76} />);
      else if (d >= CH_LOCAL.float && d < CH_LOCAL.chijo) nodes.push(<Banner key="hanare" text={second ? 'ぶちょうは そらを とんだ！' : 'ぶちょうは ちじょうから はなれた'} color={WHITE} since={since(base + CH_LOCAL.float)} top={200} size={76} />);
      else if (d >= CH_LOCAL.chijo + 1.3 && d < CH_LOCAL.end) nodes.push(<Banner key="chakuchi" text="ちゃくち せいこう！" color={GREEN} since={since(base + CH_LOCAL.chijo + 1.3)} top={200} size={80} />);
    }
    if (between(s, 81.18, 83.08)) nodes.push(<Banner key="save" text="きのうの セーブデータが ありません" color={WHITE} since={since(81.18)} top={200} size={76} />);
    if (between(s, 86.42, 88.1)) nodes.push(<Banner key="uso" text="※ ほんきです" color={YELLOW} since={since(86.42)} top={200} size={80} />);
    // ブレイクダウン
    if (between(s, 121.34, 122.6) && Math.floor(f / 5) % 2 === 0) nodes.push(<Banner key="warn" text="WARNING!!" color={RED} since={6} top={360} size={200} />);
    if (between(s, 122.6, 124.5)) nodes.push(<Banner key="boss" text="ボス『TROUBLE』が あらわれた！" color={RED} since={since(122.6)} top={190} size={76} />);
    if (between(s, 131.84, 133.3)) nodes.push(<Banner key="bai" text="TROUBLEが ぶんれつした！" color={RED} since={since(131.84)} top={190} size={80} />);
    if (between(s, 138.5, 140.1)) nodes.push(<Banner key="kaishu" text="トラブルは かいしゅう できなかった" color={GREY} since={since(138.5)} top={190} size={76} />);
    if (S === 'meeting') nodes.push(<Banner key="kaigi" text="ぶちょうは かいぎに むかった" color={WHITE} since={since(140.1)} top={190} size={76} />);
    if (between(s, 144.5, 145.18)) nodes.push(<Banner key="gan" text="ガンッ！" color={YELLOW} since={6} top={260} size={160} />);
    if (between(s, 145.18, 146.88)) nodes.push(<Banner key="tonari" text="となりが とまった" color={RED} since={since(145.18)} top={190} size={86} />);
    if (between(s, 150.2, 154.3)) {
      // 主人公の長い答え（文字送り）
      const ans = 'ええと、その件は　先週の会議で　決まった手順どおりに　現場で　確認ずみで……';
      const n = clamp(Math.floor((sv - 150.2) * 14), 0, Array.from(ans).length);
      nodes.push(
        <Win key="ans" style={{ left: 160, top: 170, width: 860, padding: '18px 28px', fontSize: 38, lineHeight: 1.4 }}>
          <div style={{ color: YELLOW, fontSize: 28 }}>しゅじんこう</div>
          {Array.from(ans).slice(0, n).join('')}
        </Win>
      );
    }
    if (between(s, 160.36, 164.2)) nodes.push(<Banner key="mo" text="ヘルメット：てにもってる" color={RED} since={since(160.36)} top={200} size={80} />);
    if (between(s, 167.68, 169.16)) nodes.push(<Banner key="akugi" text="あくぎ 0 ／ ねつ 100" color={ORANGE} since={since(167.68)} top={200} size={90} />);
    if (between(s, 172.7, 174.34)) nodes.push(<Banner key="akogare" text="あこがれ：0" color={GREY} since={since(172.7)} top={200} size={86} />);
    if (between(s, 176.0, 178.6)) {
      nodes.push(<Banner key="ikemen" text="イケメンりょくで ゆるされた！" color={PINK} since={since(176.0)} top={180} size={90} />);
      for (let i = 0; i < 6; i++) {
        if (Math.floor(f / 6 + i) % 3 === 0) {
          nodes.push(
            <div key={`kira${i}`} style={{ position: 'absolute', left: snap(500 + random(`kx${i}`) * 900), top: snap(300 + random(`ky${i}`) * 400), width: 32, height: 32, background: WHITE, transform: 'rotate(45deg)', boxShadow: '0 0 0 6px #ffd23f' }} />
          );
        }
      }
    }
    if (between(s, 195.9, 198.44)) nodes.push(<Banner key="suki" text="こうかんど が 1 あがった" color={PINK} since={since(195.9)} top={200} size={80} />);
    if (between(s, 204.98, 208.76)) nodes.push(<Banner key="nai" text="ヘルメット：あたまに のってない" color={RED} since={since(204.98)} top={200} size={80} />);
    if (between(s, 208.76, 212.84)) nodes.push(<Banner key="ashita" text="あしたも ぜっこうちょう！" color={ORANGE} since={since(208.76)} top={190} size={100} />);
    return nodes;
  };

  // ===== 寸劇のメッセージ =====
  const skitNodes = (): React.ReactNode => {
    if (k === null) return null;
    const kf = (from: number) => Math.round((k - from) * fps);
    const nodes: React.ReactNode[] = [];
    if (k >= 0.15 && k < 1.2) {
      nodes.push(
        <AbsoluteFill key="ev" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <Banner text="― イベント はっせい ―" color={YELLOW} since={kf(0.15)} top={380} size={100} />
          <Banner text="『あんぜんパトロール』" color={WHITE} since={kf(0.4)} top={520} size={80} />
        </AbsoluteFill>
      );
      return nodes;
    }
    type M = { text: string; name?: string; color?: string; tag?: string; from: number };
    const B = { name: '部長', color: ORANGE, tag: '#7a3b00' };
    const G = { name: '総務部', color: CYAN, tag: '#0b5c74' };
    const Hh = { name: '主人公', color: YELLOW, tag: '#7a6400' };
    const msgs: Array<[number, number, M]> = [
      [1.2, 6.6, { text: '「部長、来週の安全パトロールですが、ヘルメット着用の徹底を……」', ...G, from: 1.2 }],
      [6.6, 9.0, { text: '「俺が言っといてやる」', ...B, from: 6.6 }],
      [9.0, 10.0, { text: 'ぶちょうの たのもしさが 10 あがった！', color: GREEN, from: 9.0 }],
      [10.0, 13.0, { text: '「……それ、先月も言ってましたよね」', ...Hh, from: 10.0 }],
      [13.0, 15.6, { text: '「俺は言ってねぇぞ」', ...B, from: 13.0 }],
      [15.6, 16.6, { text: 'しかし きおくは なかった……', color: PINK, from: 15.6 }],
      [16.6, 17.3, { text: '（ためいき）', ...G, color: GREY, from: 16.6 }],
      [17.3, 17.8, { text: '「よし！」', ...B, from: 17.3 }],
      [17.8, 19.0, { text: 'ぶちょうは げんばへ むかった！', from: 17.8 }],
      [19.0, 19.8, { text: '……スーッ', ...B, color: GREY, from: 19.0 }],
    ];
    for (const [a, b, m] of msgs) {
      if (k >= a && k < b) nodes.push(<MessageBox key="m" text={m.text} name={m.name} color={m.color} tagColor={m.tag} sinceStart={kf(m.from)} speed={a === 1.2 ? 1 : 2} frame={f} />);
    }
    if (k >= 9.0 && k < 10.0) nodes.push(<Banner key="up" text="たのもしさ ↑10" color={GREEN} since={kf(9.0)} top={200} size={90} />);
    if (k >= 15.6 && k < 16.6) nodes.push(<Banner key="bubu" text="ブブー" color={RED} since={kf(15.6)} top={200} size={130} />);
    return nodes;
  };

  // ===== 歌詞 =====
  let lyricNode: React.ReactNode = null;
  if (line && s !== null && S !== 'ending' && S !== 'title' && S !== 'intro') {
    const sp = speakerOf(line.text);
    const speed = Math.max(1, Math.min(3, Math.floor((lineHold * fps * 0.55) / Array.from(line.text).length)));
    lyricNode = <MessageBox text={line.text} name={sp.name} color={sp.color} tagColor={sp.tag} sinceStart={lineFrame} speed={speed} frame={f} big={sp.big} shake={{ x: shakeX * 0.5, y: shakeY * 0.5 }} />;
  }

  // ===== エンディング（リザルト → NEXT STAGE：あした → また部長が入ってくる） =====
  let endNode: React.ReactNode = null;
  if (S === 'ending' || post !== null) {
    const e = S === 'ending' ? sv - 212.84 : SONG_LEN - 212.84 + (post ?? 0);
    const row = (label: string, value: string, color: string, at: number) =>
      e > at ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: 900, margin: '0 auto', fontSize: 64 }}>
          <span>{label}</span>
          <span style={{ color }}>{value}</span>
        </div>
      ) : null;
    endNode = (
      <AbsoluteFill style={{ background: '#000' }}>
        {e < 9.5 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', fontFamily: PIXEL_FONT, color: WHITE }}>
            {e > 0.3 && <div style={{ fontSize: 90, color: YELLOW, marginBottom: 50, textShadow: '8px 8px 0 #333' }}>STAGE 1　クリア？</div>}
            {row('TROUBLE', '999', RED, 1.4)}
            {row('かいけつ', '1', GREEN, 2.4)}
            {row('ヘルメット', 'てにもってる', ORANGE, 3.4)}
            {row('ぶちょう', 'ぜっこうちょう', YELLOW, 4.4)}
            {e > 6.0 && <div style={{ fontSize: 80, color: CYAN, marginTop: 70 }}>NEXT STAGE：あした</div>}
          </div>
        ) : (
          <>
            <BG n={1} filter={`brightness(${clamp((e - 9.5) / 1.0, 0, 1) * 0.9})`} />
            <Sprite id="b:D02_ganimata_walk" frame={f} every={5} x={snap(-200 + Math.min(e - 9.5, 2.6) * 420)} />
            {e > 12.3 && <Banner text="Here he comes…" color={WHITE} since={Math.round((e - 12.3) * fps)} top={220} size={90} />}
          </>
        )}
      </AbsoluteFill>
    );
  }

  const showHud = !['intro', 'title', 'ending', 'post'].includes(S) && !(k !== null && k < 1.2);
  const helmetAlert = between(s, 160.36, 164.2) || between(s, 204.98, 208.76) || between(s, 19.12, 20.94) || (k !== null && k >= 19.0);
  const helmetText = between(s, 204.98, 212.84) ? 'あたまに のってない' : 'てにもってる';
  const maxBlink = between(s, 20.94, 24.0) || between(s, 208.76, 212.84) || chBases.some((b) => between(s, b, b + 2.3));

  // グリッチ（「嵐を止めに」の2回目・ブレイクダウンの入り）
  const glitch = between(s, 43.1, 43.4) || between(s, 44.6, 45.4) || between(s, 120.9, 121.4);
  const glitchNode = glitch ? (
    <AbsoluteFill>
      {new Array(10).fill(0).map((_, i) => {
        const y = Math.floor(random(`gy${i}${step(f, 2)}`) * 1080);
        const h = 20 + Math.floor(random(`gh${i}${step(f, 2)}`) * 80);
        const dx = snap((random(`gx${i}${step(f, 2)}`) - 0.5) * 300, 8);
        const col = ['rgba(255,0,80,0.5)', 'rgba(0,255,220,0.5)', 'rgba(0,0,0,0.8)'][i % 3];
        return <div key={i} style={{ position: 'absolute', left: dx, top: y, width: 1920, height: h, background: col, mixBlendMode: 'screen' }} />;
      })}
    </AbsoluteFill>
  ) : null;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${shakeX + (glitch ? snap((random(`gg${step(f, 2)}`) - 0.5) * 60, 8) : 0)}px, ${shakeY}px)` }}>{scene()}</AbsoluteFill>
      {showHud && <Hud frame={f} trouble={k !== null ? troubleAt(CUT_IN) : troubleAt(sv)} helmet={helmetText} helmetAlert={helmetAlert} maxBlink={maxBlink} />}
      {overlays()}
      {skitNodes()}
      {lyricNode}
      {glitchNode}
      {endNode}
      <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 4px)' }} />
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
      <AbsoluteFill style={{ background: '#000', opacity: frame > durationInFrames - 15 ? 1 : 0 }} />
      <Audio src={staticFile(AUDIO_FILE)} />
    </AbsoluteFill>
  );
};
