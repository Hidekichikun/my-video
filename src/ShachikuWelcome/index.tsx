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

// ウェルカム・トゥ・ザ・社畜！
// スーファミの「育成シミュレーション」風ドット絵。社長 → 課長 に続くシリーズ3作目。
// 設定・場面割りは mv/ウェルカムトゥザ社畜/制作メモ.md を参照。
//
// 音源は public/music/shachiku-welcome-mv.wav（「……あれ、もう月曜日？」のあとに寸劇18秒＋最後に余白4秒）。
// 歌詞(LRC)は「元の曲の秒数」。songTime() で動画の秒数から変換して使う。

const LRC_FILE = 'lyrics/shachiku-welcome.lrc';
const AUDIO_FILE = 'music/shachiku-welcome-mv.wav';
const P = (name: string) => staticFile(`photo/shachiku/${name}`);
const PK = (name: string) => staticFile(`photo/kacho/${name}`);

const CUT = 172.45; // 寸劇を入れる位置（曲の秒数）
const SKIT = 18.0;
const SONG_LEN = 230.0;
const POST = 4.0;
const FPS = 30;
export const SHACHIKU_WELCOME_DURATION = Math.ceil((SONG_LEN + SKIT + POST) * FPS); // 252s

const PIXEL_FONT = "'DotGothic16', monospace";
const YELLOW = '#ffd23f';
const PINK = '#ff7fb8';
const CYAN = '#7fe8ff';
const WHITE = '#fffaf0';
const GREEN = '#7dff9a';
const GREY = '#b9b4d6';
const RED = '#ff5050';

type Section =
  | 'intro' | 'title' | 'v1' | 'v1b' | 'pre1' | 'build1' | 'ch1' | 'v2' | 'pre2' | 'build2' | 'ch2'
  | 'v3' | 'bdown' | 'stop' | 'skit' | 'bridge' | 'final' | 'outro' | 'ending' | 'post';

const sections: Array<{ start: number; type: Section }> = [
  { start: 0, type: 'intro' },
  { start: 12.0, type: 'title' },
  { start: 18.24, type: 'v1' },
  { start: 30.42, type: 'v1b' },
  { start: 37.46, type: 'pre1' },
  { start: 46.82, type: 'build1' },
  { start: 52.26, type: 'ch1' },
  { start: 77.86, type: 'v2' },
  { start: 90.96, type: 'pre2' },
  { start: 100.26, type: 'build2' },
  { start: 104.26, type: 'ch2' },
  { start: 129.92, type: 'v3' },
  { start: 151.2, type: 'bdown' },
  { start: 170.3, type: 'stop' },
  { start: CUT, type: 'bridge' },
  { start: 187.02, type: 'final' },
  { start: 213.5, type: 'outro' },
  { start: 223.0, type: 'ending' },
];
const sectionAtSong = (s: number): Section => {
  let cur: Section = 'intro';
  for (const sec of sections) if (s >= sec.start) cur = sec.type;
  return cur;
};

const songTime = (t: number): { song: number | null; skit: number | null; post: number | null } => {
  if (t < CUT) return { song: t, skit: null, post: null };
  if (t < CUT + SKIT) return { song: null, skit: t - CUT, post: null };
  const s = t - SKIT;
  if (s < SONG_LEN) return { song: s, skit: null, post: null };
  return { song: null, skit: null, post: s - SONG_LEN };
};

// ---- helpers ----
const step = (frame: number, n: number) => Math.floor(frame / n) * n;
const snap = (v: number, px = 4) => Math.round(v / px) * px;
const between = (s: number | null, a: number, b: number) => s !== null && s >= a && s < b;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

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
const Sprite: React.FC<{
  name: string;
  n?: number;
  frame: number;
  every?: number;
  x: number;
  y?: number;
  height: number;
  flip?: boolean;
  filter?: string;
  fixed?: number;
  bob?: number;
  kacho?: boolean; // photo/kacho から読む
  hop?: number; // 上にジャンプする量(px)
}> = ({ name, n = 1, frame, every = 4, x, y = 860, height, flip = false, filter, fixed, bob = 0, kacho = false, hop = 0 }) => {
  const idx = fixed !== undefined ? fixed : Math.floor(frame / every) % n;
  const up = (bob ? (Math.floor(frame / 8) % 2 === 0 ? 0 : -bob) : 0) - hop;
  return (
    <Img
      src={(kacho ? PK : P)(`${name}_${idx}.png`)}
      style={{
        position: 'absolute',
        left: snap(x),
        top: snap(y + up),
        height,
        transform: `translate(-50%, -100%) scaleX(${flip ? -1 : 1})`,
        transformOrigin: '50% 100%',
        imageRendering: 'pixelated',
        filter: `drop-shadow(0 8px 0 rgba(0,0,0,0.35)) ${filter ?? ''}`,
      }}
    />
  );
};


// ジャンプ（a秒から dur秒の放物線）
const hopAt = (s: number, a: number, dur = 0.5, h = 90) => {
  const p = (s - a) / dur;
  return p < 0 || p > 1 ? 0 : snap(4 * h * p * (1 - p), 8);
};

// 新人のうろうろ（立ってるだけにしない）
// fresh: 歩く → ぴょこぴょこ → きょろきょろ → 戻る / tired: のろのろ歩く → ふらふら → 戻る
const Wander: React.FC<{ s: number; frame: number; x0: number; x1: number; tired?: boolean; filter?: string; seed?: number; h?: number }> = ({ s, frame, x0, x1, tired = false, filter, seed = 0, h = 520 }) => {
  const L = tired ? 6.0 : 4.8;
  const p = (s + seed) % L;
  if (!tired) {
    if (p < 1.3) return <Sprite name="S03_walk" n={4} every={4} frame={frame} x={x0 + ((x1 - x0) * p) / 1.3} height={h - 20} filter={filter} />;
    if (p < 2.3) return <Sprite name="S01_idle" n={2} every={4} frame={frame} x={x1} height={h} bob={8} filter={filter} />;
    if (p < 3.3) return <Sprite name="S07_look_around" n={3} frame={frame} x={x1} height={h - 20} fixed={Math.floor((p - 2.3) / 0.34)} filter={filter} />;
    if (p < 4.4) return <Sprite name="S03_walk" n={4} every={4} frame={frame} x={x1 - ((x1 - x0) * (p - 3.3)) / 1.1} height={h - 20} flip filter={filter} />;
    return <Sprite name="S01_idle" n={2} every={4} frame={frame} x={x0} height={h} hop={hopAt(p, 4.4, 0.4, 40)} filter={filter} />;
  }
  if (p < 2.4) return <Sprite name="S06_zombie_walk" n={4} every={7} frame={frame} x={x0 + ((x1 - x0) * p) / 2.4} height={h - 20} filter={filter} />;
  if (p < 3.6) return <Sprite name="S06_zombie_walk" n={4} frame={frame} fixed={Math.floor(frame / 12) % 2 === 0 ? 0 : 2} x={x1 + (Math.floor(frame / 12) % 2) * 8} height={h - 20} filter={filter} />;
  if (p < 5.6) return <Sprite name="S06_zombie_walk" n={4} every={7} frame={frame} x={x1 - ((x1 - x0) * (p - 3.6)) / 2.0} height={h - 20} flip filter={filter} />;
  return <Sprite name="S06_zombie_walk" n={4} frame={frame} fixed={Math.floor(frame / 12) % 2 === 0 ? 0 : 2} x={x0} height={h - 20} filter={filter} />;
};

// ---- 拍（148BPM） ----
const BEAT = 60 / 148;
const beatIdx = (s: number, base: number) => Math.floor((s - base) / BEAT);
const beatHop = (s: number, base: number, every = 1, h = 60) => {
  const p = (((s - base) / (BEAT * every)) % 1 + 1) % 1;
  return snap(4 * h * p * (1 - p), 8);
};

// サビの新人（拍に合わせて動く）
const ChorusNewbie: React.FC<{ s: number; base: number; frame: number; x: number; tired: boolean; filter?: string; h?: number }> = ({ s, base, frame, x, tired, filter, h = 520 }) => {
  const d = s - base;
  const b = beatIdx(s, base);
  // 前例がないから〜首を振る：先輩のマネして首ふり
  if (d < 6) {
    if (tired) return <Sprite name="S06_zombie_walk" n={4} frame={frame} fixed={b % 2 === 0 ? 0 : 2} x={x + (b % 2) * 12} height={h - 20} filter={filter} />;
    return <Sprite name="S07_look_around" n={3} frame={frame} x={x} height={h - 20} fixed={b % 2} hop={d > 2.7 ? beatHop(s, base, 2, 40) : 0} filter={filter} />;
  }
  // 新しいことは誰か待ち：きょろきょろ
  if (d < 9.2) return <Sprite name="S07_look_around" n={3} frame={frame} x={x} height={h - 20} fixed={b % 3} hop={tired ? 0 : beatHop(s, base, 1, 24)} filter={filter} />;
  // いつもの仕事に戻ってく：歩いて画面の外へ → 反対から戻ってくる
  if (d < 12.8) {
    const p = (d - 9.2) / 3.6;
    const xx = x + p * 900;
    const wrapped = xx > 2050 ? xx - 2300 : xx;
    return tired ? (
      <Sprite name="S06_zombie_walk" n={4} every={6} frame={frame} x={snap(wrapped)} height={h - 20} filter={filter} />
    ) : (
      <Sprite name="S03_walk" n={4} every={3} frame={frame} x={snap(wrapped)} height={h - 20} filter={filter} />
    );
  }
  // 承知しました：拍ごとにおじぎ
  if (d < 19.6) return <Sprite name="S02_bow" n={3} frame={frame} x={x} height={h} fixed={[0, 1, 2, 1][b % 4]} filter={filter} />;
  // 考えるより言うとおり：その場で行進
  if (d < 22.7) {
    return tired ? (
      <Sprite name="S06_zombie_walk" n={4} frame={frame} fixed={b % 4} x={x} height={h - 20} filter={filter} />
    ) : (
      <Sprite name="S03_walk" n={4} frame={frame} fixed={b % 4} x={x} height={h - 20} hop={beatHop(s, base, 1, 20)} filter={filter} />
    );
  }
  // ウェルカム！：拍ごとにジャンプ（2回目のサビはヤケクソ気味）
  if (tired) return <Sprite name="S06_zombie_walk" n={4} frame={frame} fixed={b % 2 === 0 ? 0 : 2} x={x} height={h - 20} hop={beatHop(s, base, 1, 36)} filter={filter} />;
  return <Sprite name={b % 2 === 0 ? 'S04_shock' : 'S01_idle'} n={2} frame={frame} fixed={1} x={x} height={h} hop={beatHop(s, base, 1, 110)} filter={filter} />;
};

const Icon: React.FC<{ name: string; size: number; style?: React.CSSProperties }> = ({ name, size, style }) => (
  <Img src={P(`icon_${name}.png`)} style={{ height: size, imageRendering: 'pixelated', ...style }} />
);

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

// ---- 新人のパラメータ（左上） ----
type Params = { yaruki: number; gimon: number; stress: number; job: string };
const Bar: React.FC<{ label: string; v: number; color: string; frame: number; danger?: boolean }> = ({ label, v, color, frame, danger }) => (
  <div style={{ fontSize: 26, display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
    <span style={{ width: 120, whiteSpace: 'nowrap' }}>{label}</span>
    <div style={{ flex: 1, height: 16, background: '#300', border: '3px solid #fff' }}>
      <div style={{ width: `${snap(clamp(v, 0, 100), 5)}%`, height: '100%', background: danger && Math.floor(frame / 6) % 2 ? RED : color }} />
    </div>
  </div>
);
const StatusWin: React.FC<{ p: Params; frame: number; yukyuBlink: boolean }> = ({ p, frame, yukyuBlink }) => (
  <Win style={{ left: 40, top: 36, width: 440, padding: '12px 24px 14px' }}>
    <div style={{ fontSize: 36, display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: p.job === 'しゃちく' ? PINK : WHITE }}>{p.job}</span>
      <span style={{ color: YELLOW }}>Lv1</span>
    </div>
    <Bar label="やるき" v={p.yaruki} color={GREEN} frame={frame} danger={p.yaruki < 25} />
    <Bar label="ぎもん" v={p.gimon} color={CYAN} frame={frame} />
    <Bar label="ストレス" v={p.stress} color={PINK} frame={frame} danger={p.stress > 80} />
    <div style={{ fontSize: 28, marginTop: 6, whiteSpace: 'nowrap', color: yukyuBlink && Math.floor(frame / 5) % 2 ? RED : WHITE }}>
      ゆうきゅう　<span style={{ color: yukyuBlink ? RED : YELLOW }}>0</span> にち
    </div>
  </Win>
);

// 曲の進み具合でパラメータが変わる
const paramsAt = (s: number | null, k: number | null): Params => {
  if (k !== null) {
    const after = k >= 15.9;
    return { yaruki: 30, gimon: after ? 20 : 50, stress: k >= 7.1 ? 85 : 70, job: 'しんじん' };
  }
  const sv = s ?? 0;
  const pts: Array<[number, number, number, number]> = [
    // 秒, やるき, ぎもん, ストレス
    [0, 100, 100, 0],
    [46.8, 100, 100, 5],
    [52.2, 95, 90, 10],
    [77.8, 85, 80, 20],
    [84.2, 70, 70, 35],
    [104.2, 60, 60, 45],
    [129.9, 50, 55, 55],
    [151.2, 40, 50, 65],
    [171.0, 25, 50, 85],
    [CUT, 30, 20, 85],
    [206.5, 20, 20, 90],
    [209.7, 10, 0, 95],
  ];
  let cur = pts[0];
  for (const p of pts) if (sv >= p[0]) cur = p;
  return { yaruki: cur[1], gimon: cur[2], stress: cur[3], job: sv >= 210.3 ? 'しゃちく' : 'しんじん' };
};

// ---- 週間スケジュール ----
const DAYS = ['月', '火', '水', '木', '金', '土', '日'];
const Schedule: React.FC<{ cells: string[][]; top?: number; title?: string; highlight?: number; frame: number }> = ({ cells, top = 240, title = 'こんしゅうの よてい', highlight, frame }) => (
  <Win style={{ left: 260, right: 260, top, height: 300, padding: '14px 24px' }}>
    <div style={{ fontSize: 32, color: CYAN }}>{title}</div>
    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
      {DAYS.map((d, i) => (
        <div
          key={d}
          style={{
            flex: 1, height: 200, border: '4px solid #fff', background: i === highlight && Math.floor(frame / 6) % 2 ? '#4a2a8a' : '#141a5a',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 30, color: i === 6 ? PINK : i === 5 ? CYAN : WHITE }}>{d}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, marginTop: 6 }}>
            {(cells[i] ?? []).map((ic, j) => (
              <Icon key={j} name={ic} size={(cells[i] ?? []).length > 1 ? 64 : 110} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </Win>
);

// ---- 紙ふぶき ----
const Confetti: React.FC<{ since: number; seed: string; count?: number }> = ({ since, seed, count = 70 }) => {
  const cols = ['#ff5a5a', '#ffd23f', '#5ad1ff', '#7dff9a', '#ff7fb8', '#b38bff', '#fff'];
  return (
    <AbsoluteFill>
      {new Array(count).fill(0).map((_, i) => {
        const x0 = random(`${seed}x${i}`) * 1920;
        const vy = 6 + random(`${seed}v${i}`) * 10;
        const y = -60 + step(since, 2) * vy - random(`${seed}d${i}`) * 300;
        const sw = Math.sin(step(since, 3) / 6 + i) * 30;
        if (y > 1100) return null;
        const sz = 14 + Math.floor(random(`${seed}s${i}`) * 3) * 8;
        return <div key={i} style={{ position: 'absolute', left: snap(x0 + sw, 8), top: snap(y, 8), width: sz, height: sz * (i % 3 === 0 ? 2 : 1), background: cols[i % cols.length] }} />;
      })}
    </AbsoluteFill>
  );
};

// 背景だけを描く
const BG: React.FC<{ name: string; filter?: string; zoom?: number; ox?: number; oy?: number }> = ({ name, filter, zoom = 1, ox = 0.5, oy = 0.5 }) => (
  <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${ox * 100}% ${oy * 100}%` }}>
    <Img src={P(`${name}.png`)} style={{ position: 'absolute', left: -40, top: -40, width: 2000, height: 1125, imageRendering: 'pixelated', filter }} />
  </AbsoluteFill>
);

const ARUARU = [39.3, 42.6, 45.8, 92.96, 96.26, 99.46];

const speakerOf = (text: string, sec: Section) => {
  if (text.startsWith('（あるある')) return { name: '現場一同', color: YELLOW, tag: '#7a4b00', big: true };
  if (text.startsWith('ウェルカム')) return { name: '現場一同', color: YELLOW, tag: '#7a4b00', big: true };
  if (sec === 'intro') return { name: '先輩', color: GREY, tag: '#3b3b5b', big: false };
  if (sec === 'outro' || sec === 'stop' || text.includes('月曜日')) return { name: 'しんじん', color: CYAN, tag: '#0b5c74', big: false };
  if (sec === 'bdown') return { name: '現場', color: WHITE, tag: '#6b1a1a', big: false };
  return { name: '現場', color: WHITE, tag: '#3b1a6b', big: false };
};

export const ShachikuWelcome: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [lrcContent, setLrcContent] = useState<string | null>(null);
  const [fontHandle] = useState(() => delayRender('shachiku-font'));

  useEffect(() => {
    loadFont()
      .catch((err) => console.error('Failed to load font:', err))
      .finally(() => continueRender(fontHandle));
  }, [fontHandle]);

  useEffect(() => {
    const controller = new AbortController();
    const handle = delayRender('shachiku-lrc');
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
  const hitTimes = [...ARUARU, 74.96, 126.84, 209.74, 157.64, 158.5, ...lyrics.filter((l) => l.time >= 151.4 && l.time < 170 && l.text.startsWith('寝て')).map((l) => l.time)];
  let sinceHit = 999;
  if (s !== null) for (const h of hitTimes) if (s >= h) sinceHit = Math.min(sinceHit, (s - h) * fps);
  const freezeShake = k !== null && k >= 7.1 && k < 7.5;
  const shaking = sinceHit < 8 || freezeShake;
  const shakeX = shaking ? snap((random(`sx${step(f, 2)}`) - 0.5) * 36, 8) : 0;
  const shakeY = shaking ? snap((random(`sy${step(f, 2)}`) - 0.5) * 24, 8) : 0;

  // ---- 白フラッシュ ----
  const flashSongTimes = [18.24, 52.26, 77.86, 104.26, 129.92, 149.0, 187.02, 210.3, 213.5];
  let sinceFlash = 999;
  if (s !== null) for (const ft of flashSongTimes) if (s >= ft) sinceFlash = Math.min(sinceFlash, (s - ft) * fps);
  const flash = sinceFlash < 3 ? 0.9 : sinceFlash < 6 ? 0.45 : 0;

  const aruaruNow = ARUARU.some((a) => between(s, a, a + 0.85));
  const newbieFilter = sv >= 151.2 || k !== null ? 'saturate(0.75) brightness(0.92)' : undefined;

  // ===== シーン（背景＋キャラ）=====
  const scene = (): React.ReactNode => {
    switch (S) {
      case 'intro': {
        let hero: React.ReactNode = <Sprite name="hero_idle" n={2} every={24} frame={f} x={900} height={560} />;
        if (between(s, 2.56, 8.4)) hero = <Sprite name="H04_look_around" n={3} frame={f} x={900} height={560} fixed={sv < 3.6 ? 0 : sv < 4.7 ? 1 : 2} />;
        if (sv >= 8.4) hero = <Sprite name="hero_deadpan" n={2} every={40} frame={f} x={900} height={560} />;
        return (
          <>
            <BG name="B1" filter="brightness(0.85)" />
            {hero}
          </>
        );
      }
      case 'title': {
        const walking = sv >= 15.8;
        return (
          <>
            <BG name="B8" filter={walking ? undefined : 'brightness(0.35)'} />
            {walking && <Sprite name="S03_walk" n={4} every={5} frame={f} x={snap(-80 + (sv - 15.8) * 420)} height={500} />}
          </>
        );
      }
      case 'v1': {
        const lecture = sv >= 27.36;
        return (
          <>
            <BG name="B2" />
            {lecture ? (
              <Sprite name="K14_lecture" kacho n={2} every={6} frame={f} x={640} height={440} />
            ) : (
              <Sprite name="K05_whiteboard" kacho n={3} every={5} frame={f} x={640} height={430} />
            )}
            <Wander s={sv} frame={f} x0={1250} x1={1600} />
          </>
        );
      }
      case 'v1b': {
        if (between(s, 33.86, 35.72)) {
          return (
            <>
              <BG name="B2" />
              <Sprite name="M03_nod" n={2} every={6} frame={f} x={640} height={470} />
              <Sprite name="S02_bow" n={3} frame={f} x={1450} height={520} fixed={Math.min(2, Math.floor((sv - 34.3) / 0.25)) < 0 ? 0 : Math.min(2, Math.floor((sv - 34.3) / 0.25))} />
            </>
          );
        }
        return (
          <>
            <BG name="B3" />
            <Sprite name="M01_grumble" n={2} every={14} frame={f} x={820} height={480} />
            <Wander s={sv} frame={f} x0={1380} x1={1700} h={500} seed={1.5} />
          </>
        );
      }
      case 'pre1': {
        return (
          <>
            <BG name="B2" filter="brightness(0.55)" />
            <Sprite name="M02_aruaru" n={2} frame={f} x={560} height={aruaruNow ? 520 : 440} fixed={aruaruNow ? 1 : 0} />
            {aruaruNow ? (
              <Sprite name="S04_shock" n={2} frame={f} x={1480} height={520} fixed={1} hop={Math.max(...ARUARU.map((a) => hopAt(sv, a, 0.45, 110)))} />
            ) : (
              <Sprite name="S07_look_around" n={3} frame={f} x={1480} height={500} fixed={Math.floor(f / 9) % 3} />
            )}
          </>
        );
      }
      case 'build1': {
        const obey = sv >= 48.86;
        return (
          <>
            <BG name="B2" />
            {obey ? <Sprite name="M03_nod" n={2} every={6} frame={f} x={600} height={470} /> : <Sprite name="M01_grumble" n={2} every={12} frame={f} x={600} height={480} />}
            {obey ? (
              <Sprite name="S02_bow" n={3} frame={f} x={1450} height={520} fixed={Math.floor(f / 6) % 3} />
            ) : (
              <Sprite name="S07_look_around" n={3} frame={f} x={1450} height={500} fixed={Math.floor(f / 10) % 3} />
            )}
          </>
        );
      }
      case 'ch1':
      case 'ch2': {
        const base = S === 'ch1' ? 52.26 : 104.26;
        const d = sv - base;
        const tired = S === 'ch2';
        const nf = tired ? newbieFilter : undefined;
        const nb = (x: number, h = 520) => <ChorusNewbie s={sv} base={base} frame={f} x={x} tired={tired} filter={nf} h={h} />;
        // 0〜6: 首を振る / 6〜12.8: だれか待ち・戻ってく / 12.8〜16: 陰と表 / 16〜19.6: 承知しました / 19.6〜22.7: 言うとおり / 22.7〜: ウェルカム
        if (d >= 12.8 && d < 16.0) {
          // 画面2分割（左＝陰で文句、右＝表で同意）。新人はどっちにもいて、どっちもマネしてる
          return (
            <>
              <div style={{ position: 'absolute', left: 0, top: 0, width: 956, height: 1080, overflow: 'hidden' }}>
                <BG name="B3" filter="brightness(0.6) saturate(0.6)" />
                <Sprite name="M01_grumble" n={2} every={10} frame={f} x={400} height={480} />
                <Sprite name="S07_look_around" n={3} frame={f} x={800} height={480} fixed={beatIdx(sv, base) % 2} hop={beatHop(sv, base, 2, 30)} filter={nf} />
              </div>
              <div style={{ position: 'absolute', left: 964, top: 0, width: 956, height: 1080, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: -964, top: 0, width: 1920, height: 1080 }}>
                  <BG name="B2" />
                </div>
                <Sprite name="M03_nod" n={2} frame={f} x={380} height={470} fixed={beatIdx(sv, base) % 2} />
                <Sprite name="S02_bow" n={3} frame={f} x={790} height={480} fixed={[0, 1, 2, 1][beatIdx(sv, base) % 4]} filter={nf} />
              </div>
              <div style={{ position: 'absolute', left: 952, top: 0, width: 16, height: 1080, background: '#fff', boxShadow: '0 0 0 4px #000' }} />
            </>
          );
        }
        if (d >= 22.7) {
          const pop = sv >= base + 23.3;
          return (
            <>
              <BG name="B8" />
              <Sprite name="H03_welcome" n={2} frame={f} x={760} height={580} fixed={pop ? 1 : 0} />
              {nb(1420)}
            </>
          );
        }
        if (d >= 19.6) {
          return (
            <>
              <BG name="B8" />
              <Sprite name="hero_coffee" n={3} every={12} frame={f} x={560} height={480} />
              {nb(1300)}
            </>
          );
        }
        let crowd: React.ReactNode = <Sprite name="M03_nod" n={2} frame={f} x={560} height={470} fixed={beatIdx(sv, base) % 2} />;
        if (d < 6) crowd = <Sprite name="M04_headshake" n={2} frame={f} x={560} height={480} fixed={beatIdx(sv, base) % 2} />;
        if (d >= 16.0) crowd = <Sprite name="M03_nod" n={2} frame={f} x={560} height={470} fixed={beatIdx(sv, base) % 2} />;
        return (
          <>
            <BG name="B8" />
            {crowd}
            {nb(1400)}
          </>
        );
      }
      case 'v2': {
        if (sv < 84.26) {
          return (
            <>
              <BG name="B2" filter="brightness(0.4)" />
              {between(s, 80.96, 84.26) && <Sprite name="S04_shock" n={2} every={4} frame={f} x={1620} height={460} />}
            </>
          );
        }
        return (
          <>
            <BG name="B4" />
            <Sprite name="S08_pc_color" n={2} every={sv > 87.76 ? 14 : 6} frame={f} x={820} y={860} height={460} />
          </>
        );
      }
      case 'pre2': {
        const kachoTalk = sv < 92.96;
        return (
          <>
            <BG name="B2" />
            <Sprite name="M02_aruaru" n={2} frame={f} x={520} height={aruaruNow ? 500 : 430} fixed={aruaruNow ? 1 : 0} />
            {kachoTalk ? (
              <Sprite name="K14_lecture" kacho n={2} every={6} frame={f} x={1420} height={440} />
            ) : between(s, 93.76, 96.26) ? (
              <Sprite name="S02_bow" n={3} frame={f} x={1420} height={520} fixed={Math.floor(f / 5) % 3} />
            ) : (
              <Sprite name="K01_idle" kacho n={2} every={16} frame={f} x={1420} height={430} />
            )}
          </>
        );
      }
      case 'build2':
        return (
          <>
            <BG name="B2" filter="brightness(0.45)" />
            <Sprite name="S02_bow" n={3} frame={f} x={1620} height={460} fixed={Math.floor(f / 4) % 3} />
          </>
        );
      case 'v3': {
        const zoom = 1 + clamp((sv - 129.92) / 20, 0, 1) * 0.5;
        if (sv >= 147.9) {
          const shot = sv >= 149.0;
          return (
            <>
              <BG name="B5" filter={shot ? 'sepia(0.7)' : undefined} />
              <Sprite name="M05_group_photo" n={2} frame={f} x={760} height={480} fixed={sv >= 148.4 ? 1 : 0} filter={shot ? 'sepia(0.7)' : undefined} />
              <Sprite name="S06_zombie_walk" n={4} frame={f} fixed={shot ? 0 : Math.floor(f / 10) % 2 === 0 ? 0 : 2} x={1350} height={480} filter={shot ? 'sepia(0.7)' : newbieFilter} />
            </>
          );
        }
        let newbie: React.ReactNode = <Sprite name="S01_idle" n={2} every={6} frame={f} x={1500} height={480} bob={6} filter="saturate(0.85)" />;
        if (between(s, 138.98, 143.6)) newbie = <Sprite name="S07_look_around" n={3} frame={f} x={1500} height={460} fixed={Math.floor(f / 9) % 3} filter="saturate(0.85)" />;
        if (between(s, 132.46, 135.18)) newbie = <Sprite name="S09_raise_hand" n={2} every={10} frame={f} x={1500} height={480} />;
        if (between(s, 143.6, 147.9)) newbie = <Sprite name="S02_bow" n={3} frame={f} x={1500} height={480} fixed={Math.floor(f / 8) % 2} />;
        let crowd: React.ReactNode = <Sprite name="M03_nod" n={2} every={30} frame={f} x={560} height={450} />;
        if (between(s, 143.6, 147.9)) crowd = <Sprite name="M03_nod" n={2} every={8} frame={f} x={560} height={450} />;
        let kacho: React.ReactNode = <Sprite name="K01_idle" kacho n={2} every={16} frame={f} x={1040} height={420} />;
        if (between(s, 135.18, 141.96)) kacho = <Sprite name="K14_lecture" kacho n={2} every={6} frame={f} x={1040} height={430} />;
        return (
          <>
            <BG name="B5" zoom={zoom} ox={0.52} oy={0.3} />
            {crowd}
            {kacho}
            {newbie}
          </>
        );
      }
      case 'bdown': {
        // 寝て起きたら また仕事 のループ
        const cur = line && line.time >= 151.2 ? line : null;
        const prog = cur ? (sv - cur.time) / Math.max(0.5, lineHold) : 0;
        let actor: React.ReactNode;
        if (cur && cur.text.startsWith('寝て')) {
          actor =
            prog < 0.55 ? (
              <Sprite name="S05_bed_wake" n={3} frame={f} x={960} height={300} fixed={prog < 0.2 ? 0 : prog < 0.35 ? 1 : 2} />
            ) : (
              <Sprite name="S06_zombie_walk" n={4} every={4} frame={f} x={snap(600 + (prog - 0.55) * 1400)} height={460} />
            );
        } else if (cur && (cur.text.includes('時計') || cur.text.includes('残ってる'))) {
          actor = <Sprite name="S08_pc_color" n={2} every={8} frame={f} x={960} height={420} filter="brightness(0.8)" />;
        } else if (cur && cur.text.includes('日曜')) {
          actor = <Sprite name="S05_bed_wake" n={3} frame={f} x={960} height={300} fixed={0} />;
        } else {
          actor = <Sprite name="S06_zombie_walk" n={4} every={3} frame={f} x={snap(400 + ((sv * 500) % 1200))} height={460} />;
        }
        return (
          <>
            <BG name="B7" />
            {actor}
          </>
        );
      }
      case 'stop':
        return (
          <>
            <BG name="B6" filter="brightness(0.3)" />
            {sv >= 171.3 && <Sprite name="S05_bed_wake" n={3} frame={f} x={960} y={880} height={320} fixed={2} />}
          </>
        );
      case 'skit': {
        const kk = k ?? 0;
        if (kk < 1.2) return null; // イベントはっせい（黒）
        const frozen = kk >= 7.1 && kk < 13.6;
        const gray = frozen ? 'grayscale(1) contrast(1.1)' : undefined;
        let newbie: React.ReactNode = <Sprite name="S01_idle" n={2} every={16} frame={f} x={1560} height={500} filter={gray ?? newbieFilter} />;
        if (kk >= 1.4 && kk < 4.6) newbie = <Sprite name="S09_raise_hand" n={2} frame={f} x={1560} height={500} fixed={0} />;
        if (kk >= 4.6 && kk < 13.7) newbie = <Sprite name="S09_raise_hand" n={2} frame={f} x={1560} height={500} fixed={1} filter={gray} />;
        if (kk >= 13.7) newbie = <Sprite name="S04_shock" n={2} frame={f} x={1560} height={500} fixed={1} />;
        let kacho: React.ReactNode = <Sprite name="K01_idle" kacho n={2} every={16} frame={f} x={1060} height={430} filter={gray} />;
        if (kk >= 8.2 && kk < 10.3) kacho = <Sprite name="K16_dictionary" n={3} frame={f} x={1060} height={430} fixed={Math.floor(f / 3) % 2 === 0 ? 1 : 0} />;
        if (kk >= 10.3 && kk < 11.3) kacho = <Sprite name="K16_dictionary" n={3} frame={f} x={1060} height={430} fixed={2} />;
        if (kk >= 11.3) kacho = <Sprite name="K16_dictionary" n={3} frame={f} x={1060} height={430} fixed={0} filter={kk < 13.6 ? 'grayscale(0.4)' : undefined} />;
        const crowdAru = kk >= 14.8 && kk < 15.9;
        return (
          <>
            <BG name="B2" filter={gray ?? 'brightness(0.9)'} />
            <Sprite name="hero_deadpan" n={2} every={40} frame={f} x={210} height={520} filter={gray} />
            {crowdAru ? (
              <Sprite name="M02_aruaru" n={2} frame={f} x={600} height={400} fixed={0} />
            ) : (
              <Sprite name="M03_nod" n={2} frame={f} x={600} height={440} fixed={0} filter={gray} />
            )}
            {kacho}
            {newbie}
          </>
        );
      }
      case 'bridge': {
        const blue = sv >= 181.98;
        let fx = 0;
        if (sv < 173.4) fx = 0;
        else if (sv < 174.0) fx = 1;
        else fx = 2;
        if (between(s, 178.98, 181.98)) fx = 0;
        return (
          <>
            <BG name="B6" filter={blue ? 'brightness(0.55) hue-rotate(15deg) saturate(1.4)' : 'brightness(0.8)'} />
            <Sprite name="S05_bed_wake" n={3} frame={f} x={960} y={880} height={320} fixed={fx} filter={blue ? 'brightness(0.7) hue-rotate(20deg)' : undefined} />
          </>
        );
      }
      case 'final': {
        const sunset = 'sepia(0.35) saturate(1.5) hue-rotate(-12deg) brightness(0.95)';
        if (between(s, 199.84, 203.04)) {
          return (
            <>
              <div style={{ position: 'absolute', left: 0, top: 0, width: 956, height: 1080, overflow: 'hidden' }}>
                <BG name="B3" filter="brightness(0.6) saturate(0.6)" />
                <Sprite name="M01_grumble" n={2} every={10} frame={f} x={478} height={480} />
              </div>
              <div style={{ position: 'absolute', left: 964, top: 0, width: 956, height: 1080, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: -964, top: 0, width: 1920, height: 1080 }}>
                  <BG name="B2" />
                </div>
                <Sprite name="M03_nod" n={2} every={8} frame={f} x={300} height={420} />
                <Sprite name="S02_bow" n={3} frame={f} x={720} height={440} fixed={Math.floor(f / 8) % 3} filter={newbieFilter} />
              </div>
              <div style={{ position: 'absolute', left: 952, top: 0, width: 16, height: 1080, background: '#fff', boxShadow: '0 0 0 4px #000' }} />
            </>
          );
        }
        if (sv >= 209.74) {
          const changed = sv >= 210.3;
          return (
            <>
              <BG name="B8" filter={sunset} />
              <Sprite name="H03_welcome" n={2} frame={f} x={560} height={560} fixed={sv >= 210.9 ? 1 : 0} />
              {changed ? (
                <Sprite name="S06_zombie_walk" n={4} frame={f} fixed={beatIdx(sv, 187.02) % 2 === 0 ? 0 : 2} x={1360 + (beatIdx(sv, 187.02) % 2) * 12} height={500} hop={beatHop(sv, 187.02, 1, 30)} />
              ) : (
                <Sprite name="S01_idle" n={2} every={3} frame={f} x={1360} height={520} filter={`brightness(${1 + (Math.floor(f / 2) % 2) * 0.8})`} />
              )}
            </>
          );
        }
        let left: React.ReactNode = <Sprite name="K01_idle" kacho n={2} every={14} frame={f} x={560} height={430} />;
        if (between(s, 192.96, 196.16)) left = <Sprite name="boss_clap" n={2} every={5} frame={f} x={560} height={560} />;
        if (between(s, 196.16, 199.84)) left = <Sprite name="K05_whiteboard" kacho n={3} every={5} frame={f} x={560} height={430} />;
        if (sv >= 203.04) left = <Sprite name="M03_nod" n={2} every={8} frame={f} x={560} height={460} />;
        const fb = beatIdx(sv, 187.02);
        let newbie: React.ReactNode = <Sprite name="S06_zombie_walk" n={4} frame={f} fixed={fb % 4} x={snap(1250 + ((sv - 187.02) % 4) * 90)} height={500} hop={beatHop(sv, 187.02, 2, 24)} filter={newbieFilter} />;
        if (between(s, 189.66, 192.96)) newbie = <Sprite name="S07_look_around" n={3} frame={f} x={1360} height={480} fixed={fb % 3} filter={newbieFilter} />;
        if (between(s, 206.54, 209.74)) newbie = <Sprite name="S07_look_around" n={3} frame={f} x={1360} height={480} fixed={sv < 208.2 ? fb % 3 : 0} filter={`${newbieFilter} grayscale(${clamp((sv - 206.54) / 3, 0, 1)})`} />;
        if (sv < 189.66) newbie = <Sprite name="S02_bow" n={3} frame={f} x={1360} height={500} fixed={[0, 1, 2, 1][fb % 4]} filter={newbieFilter} />;
        if (between(s, 203.04, 206.54)) newbie = <Sprite name="S02_bow" n={3} frame={f} x={1360} height={500} fixed={[0, 1, 2, 1][fb % 4]} filter={newbieFilter} />;
        return (
          <>
            <BG name="B8" filter={sunset} />
            {left}
            {newbie}
          </>
        );
      }
      case 'outro': {
        let newbie: React.ReactNode = sv < 216.34 ? <Sprite name="S06_zombie_walk" n={4} every={7} frame={f} x={snap(1750 - clamp((sv - 213.5) / 2.6, 0, 1) * 650)} height={480} flip /> : <Sprite name="S06_zombie_walk" n={4} frame={f} fixed={Math.floor(f / 12) % 2 === 0 ? 0 : 2} x={1100} height={480} />;
        if (between(s, 216.34, 221.34)) newbie = <Sprite name="S07_look_around" n={3} frame={f} x={1100} height={500} fixed={sv < 217.4 ? 0 : sv < 218.6 ? 1 : 2} filter="saturate(0.75) brightness(0.92)" />;
        const nextOne = sv >= 221.6;
        return (
          <>
            <BG name="B1" filter="brightness(0.8)" />
            <Sprite name="hero_coffee" n={3} every={20} frame={f} x={480} height={460} />
            {newbie}
            {nextOne && <Sprite name="S03_walk" n={4} every={6} frame={f} x={snap(-60 + (sv - 221.6) * 260)} height={440} filter="brightness(0)" />}
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
    // 定時の時計
    if (S === 'intro' || S === 'outro') {
      nodes.push(
        <Win key="clock" style={{ right: 60, top: 40, padding: '10px 26px', fontSize: 48, whiteSpace: 'nowrap' }}>
          <span style={{ color: CYAN, fontSize: 30 }}>ていじ　</span>
          {S === 'intro' ? '17:00' : '17:00'}
        </Win>
      );
    }
    // タイトル画面
    if (S === 'title') {
      const blinkOn = Math.floor(f / 15) % 2 === 0;
      if (sv < 15.8) {
        nodes.push(
          <div key="title" style={{ position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', fontFamily: PIXEL_FONT }}>
            <div style={{ fontSize: 40, color: CYAN, textShadow: '4px 4px 0 #000' }}>しんじん いくせい シミュレーション</div>
            <div style={{ fontSize: 120, color: YELLOW, letterSpacing: '0.04em', marginTop: 10, textShadow: '8px 8px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000' }}>
              ウェルカム・トゥ・ザ・社畜！
            </div>
            {sv < 14.4 ? (
              <div style={{ fontSize: 44, color: WHITE, marginTop: 40, textShadow: '4px 4px 0 #000', opacity: blinkOn ? 1 : 0 }}>PRESS START</div>
            ) : (
              <div style={{ display: 'inline-block', marginTop: 40, fontSize: 48, textAlign: 'left', color: WHITE, textShadow: '4px 4px 0 #000' }}>
                <div style={{ color: YELLOW }}>▶ NEW GAME</div>
                <div style={{ color: '#777' }}>　CONTINUE（ありません）</div>
              </div>
            )}
          </div>
        );
      }
    }
    // 「課長が言った」
    if (between(s, 28.6, 30.42)) nodes.push(<Banner key="kacho" text="※ 理由：課長が言った" color={WHITE} since={since(28.6)} top={160} size={72} />);
    // スケジュール：Pre-Chorus1
    if (S === 'pre1') {
      const cells: string[][] = [[], [], [], [], [], [], []];
      if (sv >= 37.6) for (let i = 0; i < 5; i++) cells[i].push('clean');
      if (sv >= 40.5) cells[4].push('beer');
      if (sv >= 43.7) for (let i = 0; i < 5; i++) cells[i].push('meeting');
      nodes.push(<Schedule key="sch" cells={cells} top={110} frame={f} highlight={sv >= 40.5 && sv < 42.6 ? 4 : undefined} />);
    }
    // スケジュール：Verse2（週六）
    if (S === 'v2' && sv < 84.26) {
      const n = clamp(Math.floor((sv - 77.86) / 0.22) + 1, 0, 6);
      const cells: string[][] = DAYS.map((_, i) => (i < n ? ['work'] : i === 6 ? [sv < 79.36 ? 'off' : 'sleep'] : []));
      if (sv >= 82.56) for (let i = 0; i < 6; i++) cells[i].push('overtime');
      nodes.push(<Schedule key="sch2" cells={cells} top={110} frame={f} highlight={sv >= 79.36 && sv < 80.96 ? 6 : undefined} />);
      if (between(s, 80.96, 82.56)) nodes.push(<Banner key="yukyu" text="ゆうきゅう：0 にち" color={RED} since={since(80.96)} top={460} size={100} />);
    }
    // 資料の見出しの色
    if (S === 'v2' && sv >= 84.26) {
      const done = clamp(Math.floor(((sv - 84.26) / (89.4 - 84.26)) * 100), 1, 100);
      const navy = sv >= 86.0 && Math.floor(f / 6) % 2 === 0;
      nodes.push(
        <Win key="midashi" style={{ right: 80, top: 80, width: 560, padding: '18px 28px', fontSize: 40 }}>
          <div style={{ color: CYAN, fontSize: 30 }}>しりょう の みだし</div>
          <div style={{ marginTop: 6 }}>
            {done} / 100 まい
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, fontSize: 34 }}>
            <div style={{ width: 70, height: 50, background: '#2f6bff', border: '4px solid #fff' }} />
            ▶
            <div style={{ width: 70, height: 50, background: navy ? '#1a2a6b' : '#2f6bff', border: '4px solid #fff' }} />
            <span style={{ color: GREY }}>あお → こん</span>
          </div>
        </Win>
      );
      if (between(s, 87.76, 89.4)) nodes.push(<Banner key="daremo" text="（だれも みない）" color={GREY} since={since(87.76)} top={470} size={64} />);
      if (sv >= 89.4) nodes.push(<Banner key="toitsu" text="✔ いろの とういつ かんりょう！" color={GREEN} since={since(89.4)} top={470} size={80} />);
    }
    // あるある！
    for (const a of ARUARU) {
      if (between(s, a, a + 0.85)) nodes.push(<Banner key={`aru${a}`} text="あるある！" color={YELLOW} since={since(a)} top={S === 'pre1' ? 420 : 160} size={150} />);
    }
    // Pre-Chorus2：判子・結論保留
    if (between(s, 93.76, 96.26)) {
      const nStamp = Math.floor((sv - 93.76) / 0.35) + 1;
      nodes.push(
        <div key="hanko" style={{ position: 'absolute', left: 760, top: 180 }}>
          {new Array(Math.min(nStamp, 7)).fill(0).map((_, i) => (
            <Icon key={i} name="hanko" size={150} style={{ position: 'absolute', left: (i % 4) * 110, top: Math.floor(i / 4) * 120 + (i % 2) * 20 }} />
          ))}
        </div>
      );
    }
    if (between(s, 97.06, 99.46)) nodes.push(<Banner key="horyu" text="けつろん：ほりゅう" color={WHITE} since={since(97.06)} top={180} size={90} />);
    // 「今回だけ」が毎回に
    if (S === 'build2') {
      const n = clamp(Math.floor((sv - 101.9) / 0.3) + 1, 0, 7);
      nodes.push(
        <Win key="konkai" style={{ left: 260, top: 80, width: 900, padding: '18px 30px', fontSize: 42 }}>
          <div style={{ color: CYAN, fontSize: 30 }}>きろく</div>
          <div>1しゅうめ：こんかいだけ</div>
          {new Array(n).fill(0).map((_, i) => (
            <div key={i} style={{ color: i === n - 1 ? YELLOW : WHITE }}>
              {i + 2}しゅうめ：こんかいだけ
            </div>
          ))}
        </Win>
      );
    }
    // ウェルカム！（紙ふぶき）
    for (const w of [74.96, 126.84, 209.74]) {
      if (between(s, w + 0.4, w + 3.6)) nodes.push(<Confetti key={`cf${w}`} since={since(w + 0.4)} seed={`c${w}`} count={w === 126.84 ? 40 : 80} />);
    }
    // 会議
    if (between(s, 141.96, 143.6)) nodes.push(<Banner key="shiin" text="……シーン……" color={GREY} since={since(141.96)} top={160} size={90} />);
    if (between(s, 146.54, 147.9)) nodes.push(<Banner key="giji" text="ぎじろく が かんせいした！" color={GREEN} since={since(146.54)} top={160} size={86} />);
    if (between(s, 149.0, 151.0)) {
      nodes.push(
        <div key="photo" style={{ position: 'absolute', left: 300, top: 60, width: 1320, height: 760, border: '28px solid #f4efe2', boxShadow: '0 0 0 6px #000, 20px 20px 0 rgba(0,0,0,0.5)', transform: 'rotate(-3deg)' }}>
          <div style={{ position: 'absolute', right: 20, bottom: 10, fontFamily: PIXEL_FONT, fontSize: 40, color: '#e0262b' }}>かつどう じっせき</div>
        </div>
      );
    }
    // ブレイクダウン：スロット
    if (S === 'bdown') {
      const icons = ['work', 'sleep', 'overtime', 'beer', 'meeting', 'clean', 'hanko', 'off'];
      const spinning = sv < 169.5;
      const cells = DAYS.map((_, i) => [spinning ? icons[Math.floor(random(`sl${i}${step(f, 2)}`) * icons.length)] : i === 6 ? 'sleep' : 'work']);
      nodes.push(<Schedule key="slot" cells={cells} top={60} title="こんしゅうの よてい（ぜんぶ しごと）" frame={f} />);
      if (between(s, 157.64, 159.34)) nodes.push(<Banner key="zan" text={sv < 158.5 ? 'ざんぎょう！ ざんぎょう！' : 'サービス ざんぎょう！'} color={RED} since={since(sv < 158.5 ? 157.64 : 158.5)} top={440} size={110} />);
      if (between(s, 159.34, 162.54)) {
        nodes.push(
          <Win key="tc" style={{ right: 100, top: 400, padding: '18px 30px', fontSize: 44, whiteSpace: 'nowrap' }}>
            <div style={{ color: CYAN, fontSize: 30 }}>タイムカード</div>
            <div>たいきん 17:00 <span style={{ color: GREEN }}>✔</span></div>
          </Win>
        );
      }
      if (between(s, 165.74, 167.84)) nodes.push(<Banner key="nichi" text="にちようび：ねて おわり" color={PINK} since={since(165.74)} top={440} size={90} />);
    }
    // ブリッジ：時計とカレンダー
    if (S === 'bridge') {
      let txt = 'げつようび　5:59';
      if (sv >= 175.68) txt = 'どようび　5:59';
      if (sv >= 178.98) txt = 'どようび　ZZZ…';
      if (sv >= 181.98) txt = 'にちようび　21:00';
      nodes.push(
        <Win key="cal" style={{ right: 80, top: 60, padding: '14px 30px', fontSize: 56, whiteSpace: 'nowrap', color: sv >= 181.98 ? CYAN : WHITE }}>
          {txt}
        </Win>
      );
      if (between(s, 173.4, 175.68)) nodes.push(<Banner key="mesame" text="（めざましより はやく おきた）" color={GREY} since={since(173.4)} top={220} size={64} />);
    }
    // ラスサビ
    if (between(s, 192.96, 196.16)) nodes.push(<Banner key="tassei" text="もくひょう たっせい！" color={YELLOW} since={since(192.96)} top={140} size={110} />);
    if (between(s, 196.16, 199.84)) {
      const n = clamp(Math.floor((sv - 196.6) / 0.5) + 1, 1, 5);
      nodes.push(
        <Win key="mokuhyo" style={{ right: 100, top: 80, width: 780, padding: '18px 30px', fontSize: 42 }}>
          <div style={{ color: CYAN, fontSize: 30 }}>らいき の もくひょう</div>
          {new Array(n).fill(0).map((_, i) => (
            <div key={i}>{2027 + i}ねん：きょねん どおり</div>
          ))}
        </Win>
      );
    }
    if (between(s, 206.54, 209.74)) nodes.push(<Banner key="gimon0" text={sv < 208.2 ? 'ぎもん が へっていく…' : 'ぎもん：0'} color={CYAN} since={since(sv < 208.2 ? 206.54 : 208.2)} top={300} size={100} />);
    if (between(s, 210.3, 213.5)) {
      nodes.push(
        <div key="cc" style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: PIXEL_FONT, color: PINK, fontSize: 84, textShadow: '8px 8px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000', whiteSpace: 'nowrap' }}>
          しんじん は しゃちく に
          <br />
          クラスチェンジ した！
        </div>
      );
    }
    // 次の新人
    if (between(s, 221.6, 223.0)) nodes.push(<Banner key="next" text="……つぎの しんじん" color={GREY} since={since(221.6)} top={160} size={60} />);
    return nodes;
  };

  // ===== 寸劇のメッセージ =====
  const skitNodes = (): React.ReactNode => {
    if (k === null) return null;
    const kf = (from: number) => Math.round((k - from) * fps);
    const nodes: React.ReactNode[] = [];
    if (k < 1.2) {
      nodes.push(
        <AbsoluteFill key="ev" style={{ background: '#000' }}>
          <Banner text="― イベント はっせい ―" color={YELLOW} since={kf(0)} top={400} size={100} />
          <Banner text="『ゆうきゅう』" color={WHITE} since={kf(0.3)} top={540} size={80} />
        </AbsoluteFill>
      );
      return nodes;
    }
    nodes.push(
      <Win key="day" style={{ right: 60, top: 40, padding: '10px 26px', fontSize: 44, whiteSpace: 'nowrap' }}>
        げつようび　あさ 8:00
      </Win>
    );
    type M = { text: string; name?: string; color?: string; tag?: string; from: number };
    const msgs: Array<[number, number, M]> = [
      [1.4, 3.5, { text: '「あの……課長」', name: 'しんじん', color: CYAN, tag: '#0b5c74', from: 1.4 }],
      [3.5, 4.6, { text: '「なんだ？」', name: '課長', color: YELLOW, tag: '#7a4b00', from: 3.5 }],
      [4.6, 7.1, { text: '「来月、有給を……」', name: 'しんじん', color: CYAN, tag: '#0b5c74', from: 4.6 }],
      [7.1, 8.2, { text: '――じかんが とまった。', color: GREY, from: 7.1 }],
      [8.2, 8.9, { text: '課長は じしょを しらべている……', from: 8.2 }],
      [8.9, 10.3, { text: '「……ゆうきゅう？」', name: '課長', color: YELLOW, tag: '#7a4b00', from: 8.9 }],
      [10.3, 11.3, { text: 'しかし みつからなかった！', color: PINK, from: 10.3 }],
      [11.3, 13.7, { text: '「……うち、ないよ」', name: '課長', color: YELLOW, tag: '#7a4b00', from: 11.3 }],
      [13.7, 14.8, { text: '「えっ？」', name: 'しんじん', color: CYAN, tag: '#0b5c74', from: 13.7 }],
      [14.8, 15.9, { text: '「……あるある」', name: '現場一同', color: GREY, tag: '#3b3b5b', from: 14.8 }],
      [15.9, 16.9, { text: 'しんじんの ぎもんが 30 へった', color: CYAN, from: 15.9 }],
    ];
    for (const [a, b, m] of msgs) {
      if (k >= a && k < b) nodes.push(<MessageBox key="m" text={m.text} name={m.name} color={m.color} tagColor={m.tag} sinceStart={kf(m.from)} frame={f} />);
    }
    if (k >= 7.1 && k < 7.6) nodes.push(<Banner key="pishi" text="ピシッ！" color={WHITE} since={kf(7.1)} top={200} size={140} />);
    if (k >= 10.3 && k < 11.3) nodes.push(<Banner key="bubu" text="ブブー" color={RED} since={kf(10.3)} top={200} size={120} />);
    if (k >= 16.9) {
      nodes.push(
        <AbsoluteFill key="alarm" style={{ background: k >= 17.5 ? '#000' : 'transparent' }}>
          <Banner text="ジリリリリ！" color={YELLOW} since={kf(16.9)} top={380} size={150} />
        </AbsoluteFill>
      );
    }
    return nodes;
  };

  // ===== 歌詞 =====
  let lyricNode: React.ReactNode = null;
  const hideLyric = S === 'title' && sv < 15.8;
  if (line && s !== null && S !== 'skit' && S !== 'ending' && !hideLyric) {
    const sp = speakerOf(line.text, S);
    const speed = Math.max(1, Math.min(3, Math.floor((lineHold * fps * 0.55) / Array.from(line.text).length)));
    lyricNode = (
      <MessageBox text={line.text} name={sp.name} color={sp.color} tagColor={sp.tag} sinceStart={lineFrame} speed={speed} frame={f} big={sp.big} shake={{ x: shakeX * 0.5, y: shakeY * 0.5 }} />
    );
  }
  if (S === 'title' && between(s, 15.8, 18.24)) {
    lyricNode = <MessageBox text="あたらしい しんじんが はいってきた！" color={WHITE} sinceStart={since(15.8)} speed={1} frame={f} />;
  }

  // ===== エンディング =====
  let endNode: React.ReactNode = null;
  if (S === 'ending' || post !== null) {
    const e = S === 'ending' ? sv - 223.0 : 7.0 + (post ?? 0);
    const ef = Math.round(e * fps);
    endNode = (
      <AbsoluteFill style={{ background: '#000' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: PIXEL_FONT, color: WHITE }}>
          {e > 0.3 && <div style={{ fontSize: 50, color: GREY }}>エンディング No.1</div>}
          {e > 1.2 && (
            <div style={{ fontSize: 120, color: YELLOW, marginTop: 20, textShadow: '8px 8px 0 #333' }}>『りっぱな しゃちく』</div>
          )}
          {e > 2.4 && <div style={{ fontSize: 40, color: GREY, marginTop: 24 }}>ほかの エンディング：0</div>}
        </div>
        {e > 4.5 && (
          <>
            <MessageBox text="つぎの しんじんを そだてますか？" sinceStart={Math.round((e - 4.5) * fps)} speed={1} frame={f} />
            {e > 5.6 && (
              <Win style={{ right: 160, bottom: 280, padding: '16px 34px', fontSize: 56 }}>
                <div style={{ color: Math.floor(ef / 12) % 2 === 0 ? YELLOW : WHITE }}>{Math.floor(ef / 12) % 2 === 0 ? '▶' : '　'}はい</div>
                <div style={{ color: Math.floor(ef / 12) % 2 === 1 ? YELLOW : WHITE }}>{Math.floor(ef / 12) % 2 === 1 ? '▶' : '　'}はい</div>
              </Win>
            )}
          </>
        )}
      </AbsoluteFill>
    );
  }

  const showStatus = !['intro', 'title', 'ending', 'post', 'stop'].includes(S) && !(k !== null && k < 1.2) && !between(s, 149.0, 151.0) && !(S === 'ch1' && between(s, 65.06, 68.3)) && !(S === 'ch2' && between(s, 117.06, 120.2)) && !between(s, 199.84, 203.04);
  const p = paramsAt(s, k);

  // グリッチ（Verse3 → ブレイクダウン）
  const glitch = between(s, 150.6, 151.6);
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
      {showStatus && <StatusWin p={p} frame={f} yukyuBlink={between(s, 80.96, 84.26) || (k !== null && k >= 4.6 && k < 13.7)} />}
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
