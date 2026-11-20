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
import { parseLrc, LyricLine } from '../utils/lrc-parser';

// 課長、ここは会社です
// スーファミRPG風ドット絵 × リリックモーション。前作「社長、ここは地球です」の続編。
// 設定・進め方は mv/課長ここは会社ですよ/制作メモ.md を参照。
//
// 音源は public/music/kacho-kaisha-mv.wav（曲の途中に寸劇12秒＋最後に5秒の余白を足したもの）。
// 歌詞(LRC)は「元の曲の秒数」で書いてあるので、songTime() で動画の秒数から変換して使う。

const LRC_FILE = 'lyrics/kacho-kaisha.lrc';
const AUDIO_FILE = 'music/kacho-kaisha-mv.wav';
const P = (name: string) => staticFile(`photo/kacho/${name}`);

const CUT = 116.99; // 寸劇を入れる位置（曲の秒数）
const SKIT = 12.0; // 寸劇の長さ
const SONG_LEN = 335.56;
const POST = 5.0;
const FPS = 30;
export const KACHO_KAISHA_DURATION = Math.ceil((SONG_LEN + SKIT + POST) * FPS); // 352.56s

const PIXEL_FONT = "'DotGothic16', monospace";
const YELLOW = '#ffd23f';
const PINK = '#ff7fb8';
const CYAN = '#7fe8ff';
const WHITE = '#fffaf0';
const GREEN = '#7dff9a';

type Section =
  | 'intro' | 'v1' | 'pre1' | 'ch1' | 'v2' | 'pre2' | 'ch2' | 'skit' | 'v3' | 'pre3' | 'ch3'
  | 'break' | 'bdown' | 'v4' | 'bridge' | 'final' | 'fbd' | 'outro' | 'post';

// セクションの区切り（曲の秒数）
const sections: Array<{ start: number; type: Section }> = [
  { start: 0, type: 'intro' },
  { start: 14.4, type: 'v1' },
  { start: 34.9, type: 'pre1' },
  { start: 42.1, type: 'ch1' },
  { start: 62.4, type: 'v2' },
  { start: 82.75, type: 'pre2' },
  { start: 96.45, type: 'ch2' },
  { start: CUT, type: 'v3' },
  { start: 147.05, type: 'pre3' },
  { start: 155.9, type: 'ch3' },
  { start: 176.0, type: 'break' },
  { start: 196.8, type: 'bdown' },
  { start: 210.1, type: 'v4' },
  { start: 250.85, type: 'bridge' },
  { start: 271.25, type: 'final' },
  { start: 298.75, type: 'fbd' },
  { start: 306.7, type: 'outro' },
];
const sectionAtSong = (s: number): Section => {
  let cur: Section = 'intro';
  for (const sec of sections) if (s >= sec.start) cur = sec.type;
  return cur;
};

// 動画の秒数 → { 曲の秒数 | 寸劇の秒数 | 余白 }
const songTime = (t: number): { song: number | null; skit: number | null; post: number | null } => {
  if (t < CUT) return { song: t, skit: null, post: null };
  if (t < CUT + SKIT) return { song: null, skit: t - CUT, post: null };
  const s = t - SKIT;
  if (s < SONG_LEN) return { song: s, skit: null, post: null };
  return { song: null, skit: null, post: s - SONG_LEN };
};

// ---- カクカク用のヘルパー ----
const step = (frame: number, n: number) => Math.floor(frame / n) * n;
const snap = (v: number, px = 4) => Math.round(v / px) * px;
const between = (s: number | null, a: number, b: number) => s !== null && s >= a && s < b;

const loadFont = async () => {
  const font = new FontFace('DotGothic16', `url(${staticFile('fonts/DotGothic16.ttf')}) format('truetype')`);
  const loaded = await font.load();
  document.fonts.add(loaded);
};
const isAbortError = (err: unknown) => err instanceof DOMException && err.name === 'AbortError';

// ---- スプライト ----
// frames: ファイル名の頭（例 'K04_walk'）と コマ数。every フレームごとに次のコマ。
const Sprite: React.FC<{
  name: string;
  n?: number;
  frame: number;
  every?: number;
  x: number; // 足元の中心X
  y?: number; // 足元のY
  height: number;
  flip?: boolean;
  rotate?: number;
  filter?: string;
  fixed?: number; // コマを固定
  bob?: number;
}> = ({ name, n = 1, frame, every = 4, x, y = 836, height, flip = false, rotate = 0, filter, fixed, bob = 0 }) => {
  const idx = fixed !== undefined ? fixed : Math.floor(frame / every) % n;
  const up = bob ? (Math.floor(frame / 8) % 2 === 0 ? 0 : -bob) : 0;
  return (
    <Img
      src={P(`${name}_${idx}.png`)}
      style={{
        position: 'absolute',
        left: snap(x),
        top: snap(y + up),
        height,
        transform: `translate(-50%, -100%) scaleX(${flip ? -1 : 1}) rotate(${rotate}deg)`,
        transformOrigin: '50% 100%',
        imageRendering: 'pixelated',
        filter: `drop-shadow(0 8px 0 rgba(0,0,0,0.35)) ${filter ?? ''}`,
      }}
    />
  );
};

// ---- RPGのウィンドウ ----
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

// メッセージウィンドウ（1文字ずつ出る）
const MessageBox: React.FC<{
  text: string;
  name?: string;
  color?: string;
  tagColor?: string;
  sinceStart: number; // フレーム
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
        <div
          style={{
            position: 'absolute',
            top: -44,
            left: 30,
            padding: '2px 22px',
            background: tagColor,
            border: '6px solid #fff',
            boxShadow: '0 0 0 4px #000',
            color: WHITE,
            fontSize: 34,
          }}
        >
          {name}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          left: 50,
          right: 50,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          fontSize,
          color,
          whiteSpace: 'nowrap',
          letterSpacing: '0.06em',
          textShadow: '5px 5px 0 #000',
        }}
      >
        {chars.slice(0, shown).join('')}
      </div>
      {shown >= chars.length && blink && <div style={{ position: 'absolute', right: 34, bottom: 14, fontSize: 34 }}>▼</div>}
    </Win>
  );
};

// 上に出るシステムメッセージ（「しかし かえれない！」など）
const Banner: React.FC<{ text: string; color?: string; since: number; top?: number; size?: number }> = ({ text, color = YELLOW, since, top = 120, size = 96 }) => {
  const x = since < 3 ? -1600 : since < 6 ? -300 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top,
        textAlign: 'center',
        fontFamily: PIXEL_FONT,
        fontSize: size,
        color,
        transform: `translateX(${x}px)`,
        textShadow: '8px 8px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

// 課長のステータス（左上）
const Status: React.FC<{ hpPct: number; frame: number }> = ({ hpPct, frame }) => (
  <Win style={{ left: 40, top: 36, width: 400, height: 168, padding: '12px 26px' }}>
    <div style={{ fontSize: 36, display: 'flex', justifyContent: 'space-between' }}>
      <span>課長</span>
      <span style={{ color: YELLOW }}>Lv59</span>
    </div>
    <div style={{ fontSize: 26, marginTop: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
      <span>HP</span>
      <div style={{ flex: 1, height: 18, background: '#300', border: '3px solid #fff' }}>
        <div style={{ width: `${snap(hpPct, 5)}%`, height: '100%', background: hpPct < 30 && Math.floor(frame / 6) % 2 ? '#ff5050' : GREEN }} />
      </div>
    </div>
    <div style={{ fontSize: 26, marginTop: 8, color: CYAN, whiteSpace: 'nowrap' }}>ていねんまで あと1ねん</div>
  </Win>
);

// 歌詞の話者を決める
const speakerOf = (text: string) => {
  if (text.startsWith('課長！')) return { name: '現場一同', color: YELLOW, tag: '#7a4b00', big: true };
  if (text.startsWith('「')) return { name: '課長', color: CYAN, tag: '#0b5c74', big: false };
  const tsukkomi = ['……どの口ですか', '知らんがな！', '……何の？', '出ました', 'いや課長', '……課長。', '課長。', 'ここは会社です。', '色々で　済ますな', 'そこ変えていいとこです', '人件費です', 'いやもう現場', '誰もいません'];
  if (tsukkomi.some((w) => text.startsWith(w))) return { name: '現場', color: PINK, tag: '#6b1a4b', big: false };
  return { name: '現場', color: WHITE, tag: '#3b1a6b', big: false };
};

const ITEMS: Record<string, string> = {
  'ホワイトボード！': 'whiteboard',
  '紙！': 'paper',
  'ペン！': 'pen',
  '電卓！': 'calculator',
  '印刷！': 'printer',
  'コピー！': 'copier',
  '赤ペン！': 'redpen',
  '回覧！': 'clipboard',
};

export const KachoKaisha: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [lrcContent, setLrcContent] = useState<string | null>(null);
  const [fontHandle] = useState(() => delayRender('kacho-font'));

  useEffect(() => {
    loadFont()
      .catch((err) => console.error('Failed to load font:', err))
      .finally(() => continueRender(fontHandle));
  }, [fontHandle]);

  useEffect(() => {
    const controller = new AbortController();
    const handle = delayRender('kacho-lrc');
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

  const lyrics: LyricLine[] = useMemo(() => (lrcContent ? parseLrc(lrcContent) : []), [lrcContent]);
  const t = frame / fps;
  const { song: s, skit: k, post } = songTime(t);
  const S: Section = k !== null ? 'skit' : post !== null ? 'post' : sectionAtSong(s ?? 0);
  const f = frame;

  // ---- 今の歌詞 ----
  const idx = s === null ? -1 : lyrics.findIndex((l, i) => l.time <= s && (!lyrics[i + 1] || lyrics[i + 1].time > s));
  const line = idx >= 0 ? lyrics[idx] : null;
  const next = idx >= 0 ? lyrics[idx + 1] : null;
  const lineFrame = line && s !== null ? Math.round((s - line.time) * fps) : 0;
  const lineHold = line ? (next ? next.time - line.time : 4) : 0;

  // 画面揺れ：サビ頭「課長！」、ブレイクダウン、「帰れ！」、ツッコミの一部
  const hitLine = (l: LyricLine) => {
    const sec = sectionAtSong(l.time);
    return (
      l.text.startsWith('課長！') ||
      sec === 'bdown' ||
      l.text.startsWith('帰れ') ||
      ['知らんがな！', '人件費です', 'プリントアウト！！', 'おかあちゃん。', '計算！', 'パソコン！', '分析！', 'グラフ！'].includes(l.text)
    );
  };
  const lastHit = s === null ? undefined : [...lyrics].reverse().find((l) => l.time <= s && hitLine(l));
  const sinceHit = lastHit && s !== null ? (s - lastHit.time) * fps : 999;
  const shaking = sinceHit < 8;
  const shakeX = shaking ? snap((random(`sx${step(f, 2)}`) - 0.5) * 36, 8) : 0;
  const shakeY = shaking ? snap((random(`sy${step(f, 2)}`) - 0.5) * 24, 8) : 0;

  // セクションの切り替わりで白フラッシュ
  const flashSongTimes = [14.4, 42.1, 62.4, 96.45, 155.9, 196.8, 210.1, 250.85, 271.25, 298.75];
  let sinceFlash = 999;
  if (s !== null) for (const ft of flashSongTimes) if (s >= ft) sinceFlash = Math.min(sinceFlash, (s - ft) * fps);
  const flash = sinceFlash < 3 ? 0.9 : sinceFlash < 6 ? 0.45 : 0;

  // RPGのエンカウント演出（寸劇の終わり・ブレイク頭）：白黒の帯がシャッ
  const encounterAt = k !== null && k > 11.3 ? (k - 11.3) * fps : s !== null && s >= 175.4 && s < 176.0 ? (s - 175.4) * fps : -1;

  // ---- 背景 ----
  let bg = 'B2.png';
  let bgFilter: string | undefined;
  let bgZoom: { scale: number; ox: number; oy: number } | null = null;
  switch (S) {
    case 'intro':
      bg = 'B1.png';
      break;
    case 'v1':
    case 'pre1':
      bg = 'B3.png';
      break;
    case 'v2':
      bg = between(s, 62.4, 79.1) ? 'B4.png' : 'B2.png';
      if (between(s, 62.4, 79.1)) bgFilter = 'sepia(0.85) contrast(1.05)';
      break;
    case 'skit':
      bg = 'B2.png';
      bgFilter = 'brightness(0.55) saturate(0.7)';
      break;
    case 'v3':
      if (between(s, 120.5, 123.4)) bgFilter = 'brightness(0.3)';
      break;
    case 'ch3':
      bg = 'B6.png';
      break;
    case 'break':
      bg = 'B5.png';
      break;
    case 'v4': {
      const inLoop = (s ?? 0) < 230.7 ? (s ?? 0) - 210.1 : (s ?? 0) - 230.7;
      bg = inLoop < 6.3 ? 'B9.png' : 'B7.png';
      break;
    }
    case 'bridge':
      bg = 'B3.png';
      break;
    case 'fbd':
      bg = 'B8.png';
      break;
    case 'outro':
      bg = 'B2.png';
      // ホワイトボードにズーム
      if (between(s, 306.7, 321.3)) bgZoom = { scale: 2.1, ox: 0.555, oy: 0.17 };
      break;
    default:
      break;
  }

  // ---- キャラ ----
  const actors = (): React.ReactNode => {
    const sv = s ?? 0;
    switch (S) {
      case 'intro': {
        if (sv < 8) {
          // 「白髪をビシッと オールバック」
          return <Sprite name="K02_slick" n={3} every={6} frame={f} x={960} height={520} fixed={sv < 2 ? 0 : sv < 3.6 ? 1 : 2} />;
        }
        // 歩いて事務所へ
        const walkX = 300 + (sv - 8) * 160;
        return <Sprite name="K04_walk" n={4} frame={f} every={5} x={walkX} height={430} />;
      }
      case 'v1':
      case 'pre1': {
        const nod = between(s, 28.8, 31.5) || between(s, 38.1, 40.2);
        const bossTalk = between(s, 18.1, 21.1) || between(s, 21.9, 28.8) || between(s, 38.1, 40.2);
        return (
          <>
            <Sprite name="hero_deadpan" n={2} every={40} frame={f} x={330} height={520} />
            {nod ? (
              <Sprite name="K03_nod" n={2} every={6} frame={f} x={900} height={420} />
            ) : (
              <Sprite name="K01_idle" n={2} every={16} frame={f} x={900} height={420} />
            )}
            <Sprite name="boss_present" n={2} every={bossTalk ? 6 : 20} frame={f} x={1500} height={560} />
          </>
        );
      }
      case 'ch1': {
        let kacho: React.ReactNode = <Sprite name="K05_whiteboard" n={3} every={4} frame={f} x={1250} height={430} />;
        if (between(s, 48.9, 50.6)) kacho = <Sprite name="K06_calculator" n={2} every={3} frame={f} x={1200} height={430} />;
        if (between(s, 50.6, 58.7)) kacho = <Sprite name="K12_headshake" n={2} every={6} frame={f} x={1200} height={430} />;
        if (between(s, 58.7, 62.4)) kacho = <Sprite name="K01_idle" n={2} every={16} frame={f} x={1200} height={430} />;
        const facepalm = between(s, 58.7, 62.4);
        return (
          <>
            {facepalm ? (
              <Sprite name="H02_facepalm" n={2} every={12} frame={f} x={420} height={560} />
            ) : (
              <Sprite name="hero_deadpan" n={2} every={30} frame={f} x={420} height={560} />
            )}
            {kacho}
          </>
        );
      }
      case 'v2': {
        if (between(s, 62.4, 79.1)) {
          // 回想：昔は同じ現場側
          if (between(s, 72.6, 79.1)) return <Sprite name="K11_sleep" n={2} every={14} frame={f} x={960} height={440} />;
          if (between(s, 65.9, 72.6)) return <Sprite name="K04_walk" n={4} every={3} frame={f} x={snap(((sv - 65.9) * 260) % 2200 - 100)} height={400} />;
          return <Sprite name="K01_idle" n={2} every={16} frame={f} x={960} height={430} filter="sepia(0.6)" />;
        }
        return (
          <>
            {between(s, 81.85, 83) ? (
              <Sprite name="H01_tsukkomi" n={2} every={99} frame={f} x={520} height={580} fixed={1} />
            ) : (
              <Sprite name="hero_deadpan" n={2} every={30} frame={f} x={420} height={560} />
            )}
            <Sprite name="K14_lecture" n={2} every={8} frame={f} x={1250} height={440} />
          </>
        );
      }
      case 'pre2': {
        const glance = between(s, 87.9, 93.1);
        const tsukkomi = between(s, 93.1, 96.45);
        return (
          <>
            {tsukkomi ? (
              <Sprite name="H01_tsukkomi" n={2} every={99} frame={f} x={520} height={580} fixed={sv < 93.6 ? 0 : 1} />
            ) : (
              <Sprite name="hero_deadpan" n={2} every={30} frame={f} x={420} height={560} />
            )}
            {glance ? (
              <Sprite name="K13_glance" n={2} every={99} frame={f} x={1250} height={440} fixed={1} />
            ) : (
              <Sprite name="K14_lecture" n={2} every={6} frame={f} x={1250} height={440} />
            )}
          </>
        );
      }
      case 'ch2': {
        let kacho: React.ReactNode = <Sprite name="K01_idle" n={2} every={10} frame={f} x={1220} height={430} />;
        if (between(s, 103.4, 105.2)) kacho = <Sprite name="K12_headshake" n={2} every={5} frame={f} x={1220} height={430} />;
        if (between(s, 113.5, 115.3)) kacho = <Sprite name="K14_lecture" n={2} every={6} frame={f} x={1220} height={440} />;
        let hero: React.ReactNode = <Sprite name="hero_deadpan" n={2} every={30} frame={f} x={420} height={560} />;
        if (between(s, 105.2, 107.4)) hero = <Sprite name="H01_tsukkomi" n={2} every={99} frame={f} x={520} height={580} fixed={1} />;
        if (between(s, 115.3, CUT)) hero = <Sprite name="H02_facepalm" n={2} every={12} frame={f} x={420} height={560} />;
        return (
          <>
            {hero}
            {kacho}
          </>
        );
      }
      case 'skit': {
        const kk = k ?? 0;
        let kacho: React.ReactNode = <Sprite name="K01_idle" n={2} every={16} frame={f} x={1100} height={440} />;
        if (kk >= 3.7 && kk < 5.0) kacho = <Sprite name="K09_phone" n={3} every={99} frame={f} x={1100} height={440} fixed={0} />;
        if (kk >= 5.0 && kk < 7.6) kacho = <Sprite name="K09_phone" n={3} every={99} frame={f} x={1100} height={440} fixed={1} />;
        if (kk >= 7.6 && kk < 10.5) kacho = <Sprite name="K09_phone" n={3} every={99} frame={f} x={snap(1100 + (Math.floor(f / 3) % 2) * 6)} height={440} fixed={2} />;
        const ringShake = (kk >= 1.2 && kk < 2.3) || (kk >= 2.6 && kk < 3.7);
        return (
          <>
            {kk >= 10.6 && <Sprite name="hero_deadpan" n={2} every={99} frame={f} x={420} height={560} fixed={0} />}
            <div style={{ transform: ringShake ? `translate(${snap((random(`r${step(f, 2)}`) - 0.5) * 20, 4)}px, 0)` : undefined }}>{kacho}</div>
          </>
        );
      }
      case 'v3': {
        if (between(s, 120.5, 123.4)) {
          // 「その名も――」「おかあちゃん。」
          const big = sv >= 121.4;
          return big ? (
            <>
              <div style={{ position: 'absolute', left: 460, top: 60, width: 1000, height: 900, background: 'radial-gradient(ellipse at 50% 55%, rgba(255,140,200,0.95) 0 38%, rgba(255,90,170,0.5) 52%, transparent 70%)' }} />
              <Sprite name="okaachan" n={1} frame={f} x={960} y={900} height={snap(sv < 121.6 ? 900 : 760)} />
            </>
          ) : null;
        }
        const panic = between(s, 132.0, 142.5);
        const pale = between(s, 142.5, 144.3);
        let kacho: React.ReactNode = <Sprite name="K01_idle" n={2} every={16} frame={f} x={700} height={420} />;
        if (panic) {
          const dir = Math.floor((sv - 132) / 2.6) % 2 === 0;
          const p = ((sv - 132) % 2.6) / 2.6;
          kacho = <Sprite name="K10_panic_run" n={4} every={3} frame={f} x={dir ? 300 + p * 1000 : 1300 - p * 1000} flip={!dir} height={360} />;
        }
        if (pale) kacho = <Sprite name="K09_phone" n={3} every={99} frame={f} x={700} height={440} fixed={2} />;
        return (
          <>
            {between(s, 144.3, 147.05) ? (
              <Sprite name="H01_tsukkomi" n={2} every={99} frame={f} x={420} height={600} fixed={sv < 144.7 ? 0 : 1} />
            ) : null}
            {kacho}
            <Sprite name="O01_okaachan_phone" n={2} every={12} frame={f} x={1520} height={560} />
          </>
        );
      }
      case 'pre3':
        return (
          <>
            <Sprite name="okaachan" n={1} frame={f} x={1540} height={560} />
            <Sprite name="K01_idle" n={2} every={between(s, 150.7, 152.1) ? 3 : 14} frame={f} x={800} height={430} bob={between(s, 150.7, 152.1) ? 8 : 0} />
          </>
        );
      case 'ch3': {
        const dir = Math.floor((sv - 155.9) / 3.4) % 2 === 0;
        const p = ((sv - 155.9) % 3.4) / 3.4;
        return (
          <>
            <Sprite name="okaachan" n={1} frame={f} x={1620} y={snap(560 + Math.sin(step(f, 6) / 10) * 20)} height={300} />
            <Sprite name="K10_panic_run" n={4} every={3} frame={f} x={dir ? 200 + p * 1300 : 1500 - p * 1300} flip={!dir} height={340} />
          </>
        );
      }
      case 'break': {
        const fled = sv >= 194.2;
        const fx = fled ? 560 - (sv - 194.2) * 500 : 560;
        return (
          <>
            <Sprite name="E01_excel_float" n={2} every={10} frame={f} x={1260} y={snap(640 + (Math.floor(f / 10) % 2) * 12)} height={420} />
            {fled ? (
              <Sprite name="K04_walk" n={4} every={2} frame={f} x={fx} height={380} flip />
            ) : between(s, 184.3, 194.2) ? (
              <Sprite name="K07_pc_stare" n={2} every={between(s, 185.1, 188.8) ? 10 : 30} frame={f} x={560} height={360} />
            ) : (
              <Sprite name="K06_calculator" n={2} every={3} frame={f} x={560} height={420} />
            )}
          </>
        );
      }
      case 'bdown': {
        const print = sv >= 207.4;
        return print ? (
          <Sprite name="K08_printout" n={2} every={6} frame={f} x={960} height={560} />
        ) : (
          <Sprite name="K01_idle" n={2} every={6} frame={f} x={560} height={430} />
        );
      }
      case 'v4': {
        const loop = sv < 230.7 ? sv - 210.1 : sv - 230.7;
        if (loop < 6.3) {
          // 朝の渋滞（すぐそこ）
          return <Sprite name="K04_walk" n={4} every={5} frame={f} x={snap(400 + loop * 70)} height={360} />;
        }
        const empty = loop >= 16.8;
        return (
          <>
            <Sprite name="K01_idle" n={2} every={20} frame={f} x={960} height={380} filter="brightness(0.85)" />
            {empty && <Sprite name="hero_deadpan" n={2} every={99} frame={f} x={330} height={520} fixed={0} filter="brightness(0.8)" />}
          </>
        );
      }
      case 'bridge': {
        let kacho: React.ReactNode = <Sprite name="K01_idle" n={2} every={16} frame={f} x={1100} height={430} />;
        if (between(s, 256.3, 259.7)) kacho = <Sprite name="K12_headshake" n={2} every={5} frame={f} x={1100} height={430} />;
        if (between(s, 259.7, 267.5)) kacho = <Sprite name="K14_lecture" n={2} every={5} frame={f} x={1100} height={440} />;
        return (
          <>
            {between(s, 267.5, 271.25) ? (
              <Sprite name="H01_tsukkomi" n={2} every={99} frame={f} x={480} height={600} fixed={sv < 268 ? 0 : 1} />
            ) : (
              <Sprite name="hero_deadpan" n={2} every={30} frame={f} x={420} height={560} />
            )}
            {kacho}
          </>
        );
      }
      case 'final': {
        const boss = between(s, 283.5, 292.0);
        const nod = between(s, 290.3, 292.0) || between(s, 293.6, 298.75);
        return (
          <>
            <Sprite name="hero_deadpan" n={2} every={30} frame={f} x={360} height={560} />
            {nod ? (
              <Sprite name="K03_nod" n={2} every={6} frame={f} x={900} height={420} />
            ) : (
              <Sprite name="K05_whiteboard" n={3} every={4} frame={f} x={900} height={430} />
            )}
            {boss && <Sprite name="boss_present" n={2} every={6} frame={f} x={1520} height={560} />}
          </>
        );
      }
      case 'fbd': {
        const glance = between(s, 303.9, 305.6);
        return glance ? (
          <Sprite name="K13_glance" n={2} every={99} frame={f} x={760} height={440} fixed={sv < 304.4 ? 0 : 1} />
        ) : (
          <Sprite name="K01_idle" n={2} every={6} frame={f} x={760} height={440} />
        );
      }
      case 'outro': {
        if (between(s, 306.7, 321.3)) return null; // ホワイトボードのアップ
        if (between(s, 321.3, 324.4)) return <Sprite name="K03_nod" n={2} every={12} frame={f} x={1150} height={440} />;
        if (between(s, 324.4, 330.1)) return <Sprite name="K14_lecture" n={2} every={10} frame={f} x={1150} height={440} />;
        return (
          <>
            <Sprite name="K01_idle" n={2} every={20} frame={f} x={1250} height={430} />
            <Sprite name="hero_deadpan" n={2} every={40} frame={f} x={snap(sv > 333.2 ? 640 : 480)} height={sv > 333.2 ? 680 : 560} />
          </>
        );
      }
      default:
        return null;
    }
  };

  // ---- 上に重ねるもの（RPGの演出） ----
  const overlays = (): React.ReactNode => {
    const sv = s ?? 0;
    const nodes: React.ReactNode[] = [];
    // イントロのタイトル
    if (S === 'intro') {
      if (sv < 8) {
        const blinkStart = Math.floor(f / 15) % 2 === 0;
        nodes.push(
          <div key="title" style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: PIXEL_FONT }}>
            <div style={{ fontSize: 110, color: YELLOW, letterSpacing: '0.08em', textShadow: '8px 8px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000' }}>
              課長、ここは会社です
            </div>
            <div style={{ fontSize: 40, color: WHITE, marginTop: 10, textShadow: '4px 4px 0 #000', opacity: sv > 4 && blinkStart ? 1 : 0 }}>
              PRESS START
            </div>
          </div>
        );
        if (between(s, 3.0, 4.6)) nodes.push(<Banner key="kira" text="キラーン！" color={CYAN} since={(sv - 3.0) * fps} top={330} size={80} />);
      }
    }
    // 「はい決定」「はい終了」
    if (between(s, 21.16, 21.9)) nodes.push(<Banner key="kettei" text="▶ はい  いいえ" since={(sv - 21.16) * fps} top={300} />);
    if (between(s, 33.5, 34.9)) nodes.push(<Banner key="shuryo" text="▶ はい  いいえ" since={(sv - 33.5) * fps} top={300} />);
    // 回想
    if (between(s, 62.4, 79.1)) nodes.push(<Banner key="kaiso" text="～ 30ねんまえ ～" color={WHITE} since={(sv - 62.4) * fps} top={60} size={64} />);
    // 「報告！対策！水平展開！」コマンドメニュー
    if (between(s, 86.1, 87.9)) {
      const sel = sv < 86.7 ? 0 : sv < 87.3 ? 1 : 2;
      nodes.push(
        <Win key="cmd" style={{ right: 100, top: 220, width: 600, whiteSpace: 'nowrap', padding: '20px 30px', fontSize: 58 }}>
          {['ほうこく', 'たいさく', 'すいへいてんかい'].map((c, i) => (
            <div key={c} style={{ color: i === sel ? YELLOW : WHITE }}>
              {i === sel ? '▶' : '　'}
              {c}
            </div>
          ))}
        </Win>
      );
    }
    // おかあちゃん登場
    if (between(s, 121.4, 123.4)) nodes.push(<Banner key="okaa" text="おかあちゃんが あらわれた！" color={PINK} since={(sv - 121.4) * fps} top={90} />);
    // 組織図
    if (between(s, 172.6, 176.0)) nodes.push(<Banner key="post" text="※ そのポストは ありません" color={WHITE} since={(sv - 172.6) * fps} top={80} size={70} />);
    // ブレイク：戦闘
    if (S === 'break') {
      nodes.push(
        <Win key="enemy" style={{ right: 80, top: 40, width: 560, height: 110, padding: '14px 26px', fontSize: 44 }}>
          <div>エクセルモンスター</div>
          <div style={{ fontSize: 28, color: GREEN }}>HP ????? / ?????</div>
        </Win>
      );
      if (between(s, 176.0, 177.0)) nodes.push(<Banner key="enc" text="エクセルモンスターが あらわれた！" color={GREEN} since={(sv - 176.0) * fps} top={200} size={80} />);
      if (between(s, 194.2, 196.8)) nodes.push(<Banner key="nige" text="課長は にげだした！" color={YELLOW} since={(sv - 194.2) * fps} top={200} />);
    }
    // ブレイクダウン：アイテム
    if (S === 'bdown' && line) {
      const item = ITEMS[line.text];
      const names = Object.keys(ITEMS);
      const cur = names.indexOf(line.text);
      if (sv < 200.3) {
        nodes.push(
          <Win key="items" style={{ right: 80, top: 60, width: 520, padding: '18px 26px', fontSize: 40 }}>
            <div style={{ color: CYAN, fontSize: 30, marginBottom: 6 }}>どうぐ</div>
            {names.map((nm, i) => (
              <div key={nm} style={{ color: i === cur ? YELLOW : i < cur ? '#8888aa' : WHITE }}>
                {i === cur ? '▶' : '　'}
                {nm.replace('！', '')}
              </div>
            ))}
          </Win>
        );
      }
      if (item) {
        const pop = lineFrame < 2 ? 1.4 : lineFrame < 4 ? 1.15 : 1;
        nodes.push(
          <Img
            key="item"
            src={P(`item_${item}.png`)}
            style={{ position: 'absolute', left: 1000, top: 330, height: 340, transform: `translate(-50%, 0) scale(${pop})`, imageRendering: 'pixelated', filter: 'drop-shadow(8px 8px 0 #000)' }}
          />
        );
      }
      if (line.text.startsWith('保存済み')) {
        nodes.push(
          <div key="saved" style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: PIXEL_FONT, fontSize: 200, color: GREEN, textShadow: '10px 10px 0 #000' }}>
            ✔ 保存済み
          </div>
        );
      }
      if (sv >= 207.4) nodes.push(<Banner key="print" text="ガガガガ…" color={WHITE} since={(sv - 207.4) * fps} top={120} />);
    }
    // 定年までのステータスを減らす演出（残業）
    // 帰れ！コマンド
    if (S === 'fbd') {
      const kaereLines = [298.82, 300.6, 302.28, 305.68];
      const lastK = kaereLines.filter((x) => x <= sv).pop();
      nodes.push(
        <Win key="fbdcmd" style={{ right: 120, top: 200, width: 420, padding: '20px 30px', fontSize: 58 }}>
          {['たたかう', 'かえる', 'にげる'].map((c, i) => (
            <div key={c} style={{ color: i === 1 ? YELLOW : WHITE }}>
              {i === 1 && Math.floor(f / 8) % 2 === 0 ? '▶' : '　'}
              {c}
            </div>
          ))}
        </Win>
      );
      const replyStarts = [299.5, 301.36, 302.86, 304.9];
      const lastR = replyStarts.filter((x) => x <= sv).pop();
      if (lastR !== undefined && (lastK === undefined || lastR > lastK)) {
        nodes.push(<Banner key="kaerenai" text="しかし かえれない！" color={PINK} since={(sv - lastR) * fps} top={80} />);
      }
      if (between(s, 303.9, 305.6)) {
        nodes.push(<Banner key="chira" text="ちらっ" color={YELLOW} since={(sv - 303.9) * fps} top={340} size={120} />);
      }
    }
    // アウトロ：ホワイトボードの「重要」
    if (between(s, 318.1, 321.3)) {
      nodes.push(
        <div key="juyo" style={{ position: 'absolute', left: 860, top: 330, fontFamily: PIXEL_FONT, fontSize: 170, color: '#e0262b', border: '14px solid #e0262b', borderRadius: '50%', padding: '10px 50px', transform: 'rotate(-8deg)' }}>
          重要
        </div>
      );
    }
    return nodes;
  };

  // ---- 寸劇のメッセージ ----
  const skitNodes = (): React.ReactNode => {
    if (k === null) return null;
    const kf = (from: number) => Math.round((k - from) * fps);
    const nodes: React.ReactNode[] = [];
    let msg: { text: string; name?: string; color?: string; tag?: string; from: number } | null = null;
    if (k >= 1.2 && k < 3.7) msg = { text: 'でんわが なっている！', from: 1.2 };
    if (k >= 4.0 && k < 5.0) msg = { text: '「……はい」', name: '課長', color: CYAN, tag: '#0b5c74', from: 4.0 };
    if (k >= 5.0 && k < 7.6) msg = { text: '「あんた、あれ どうなっとるん？」', name: '？？？', color: PINK, tag: '#6b1a4b', from: 5.0 };
    if (k >= 7.6 && k < 9.0) msg = { text: '課長の かおいろが かわった！', color: '#b8a4ff', from: 7.6 };
    if (k >= 9.0 && k < 10.6) msg = { text: '「……すぐ やる」', name: '課長', color: CYAN, tag: '#0b5c74', from: 9.0 };
    if (k >= 10.6 && k < 11.3) msg = { text: '（……なにを？）', name: '心の声', color: '#c9c2ff', tag: '#3b1a6b', from: 10.6 };
    if (msg) nodes.push(<MessageBox key="m" text={msg.text} name={msg.name} color={msg.color} tagColor={msg.tag} sinceStart={kf(msg.from)} frame={f} />);
    if ((k >= 1.2 && k < 2.3) || (k >= 2.6 && k < 3.7)) {
      nodes.push(<Banner key="jiri" text="ジリリリリン！" color={YELLOW} since={kf(k < 2.4 ? 1.2 : 2.6)} top={160} size={110} />);
    }
    // 電話の向こう（右上のワイプ）
    if (k >= 5.0 && k < 7.6) {
      nodes.push(
        <Win key="wipe" style={{ right: 90, top: 70, width: 520, height: 420, overflow: 'hidden', background: '#ff9fc8' }}>
          <Img src={P('O01_okaachan_phone_' + (Math.floor(f / 8) % 2) + '.png')} style={{ position: 'absolute', left: 60, bottom: -10, height: 400, imageRendering: 'pixelated' }} />
          <div style={{ position: 'absolute', left: 16, top: 10, fontSize: 30, color: '#3b0a2b' }}>でんわの むこう</div>
        </Win>
      );
    }
    return nodes;
  };

  // ---- 歌詞 ----
  let lyricNode: React.ReactNode = null;
  if (line && s !== null && S !== 'skit') {
    const sp = speakerOf(line.text);
    const speed = Math.max(1, Math.min(3, Math.floor((lineHold * fps * 0.55) / Array.from(line.text).length)));
    lyricNode = (
      <MessageBox
        text={line.text}
        name={sp.name}
        color={sp.color}
        tagColor={sp.tag}
        sinceStart={lineFrame}
        speed={speed}
        frame={f}
        big={sp.big}
        shake={{ x: shakeX * 0.5, y: shakeY * 0.5 }}
      />
    );
  }

  // ---- 曲が終わったあと ----
  let postNode: React.ReactNode = null;
  if (post !== null) {
    postNode = (
      <AbsoluteFill style={{ background: '#000' }}>
        {post > 0.8 && (
          <MessageBox text="※ おかあちゃんは 役員では ありません。" color={WHITE} sinceStart={Math.round((post - 0.8) * fps)} speed={3} frame={f} />
        )}
      </AbsoluteFill>
    );
  }

  const showStatus = S !== 'intro' && S !== 'break' && S !== 'post' && !(S === 'outro' && between(s, 306.7, 321.3)) && !(S === 'v3' && between(s, 120.5, 123.4));
  // HPはサビのたびにちょっと減って、おかあちゃん案件でガクッと減る
  const hp = (() => {
    const sv = s ?? CUT;
    if (S === 'skit') return 40;
    if (sv < 116.99) return 100 - Math.floor(sv / 30) * 5;
    if (sv < 176) return 25;
    if (sv < 271) return 60;
    return 35;
  })();

  const zoomStyle: React.CSSProperties = bgZoom
    ? {
        transform: `scale(${bgZoom.scale})`,
        transformOrigin: `${bgZoom.ox * 100}% ${bgZoom.oy * 100}%`,
      }
    : {};

  // エンカウントの帯
  let encounterNode: React.ReactNode = null;
  if (encounterAt >= 0) {
    const bars = 12;
    encounterNode = (
      <AbsoluteFill>
        {new Array(bars).fill(0).map((_, i) => {
          const prog = Math.min(1, Math.max(0, (encounterAt - i * 0.6) / 6));
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: (1080 / bars) * i,
                height: 1080 / bars + 1,
                left: i % 2 ? 0 : undefined,
                right: i % 2 ? undefined : 0,
                width: `${snap(prog * 100, 10)}%`,
                background: Math.floor(encounterAt / 2) % 2 ? '#fff' : '#000',
              }}
            />
          );
        })}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>
        <AbsoluteFill style={zoomStyle}>
          <Img
            src={P(bg)}
            style={{ position: 'absolute', left: -40, top: -40, width: 2000, height: 1125, imageRendering: 'pixelated', filter: bgFilter }}
          />
        </AbsoluteFill>
        {actors()}
      </AbsoluteFill>

      {showStatus && <Status hpPct={hp} frame={f} />}
      {overlays()}
      {skitNodes()}
      {lyricNode}
      {postNode}
      {encounterNode}

      {/* ブラウン管っぽい走査線 */}
      <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 4px)' }} />
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
      <AbsoluteFill style={{ background: '#000', opacity: frame > durationInFrames - 15 ? 1 : 0 }} />

      <Audio src={staticFile(AUDIO_FILE)} />
    </AbsoluteFill>
  );
};
