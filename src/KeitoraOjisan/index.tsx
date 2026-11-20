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

// 軽トラのおじさん
// スーファミの「レースゲーム」風ドット絵。社長 → 課長 → 社畜 → 部長 に続くシリーズ5作目。
// 設定・場面割りは mv/軽トラのおじさん/制作メモ.md を参照。
//
// 音源は public/music/keitora-ojisan-mv.wav（scripts/keitora_audio.py で作成）。
//   元の曲 TAPE_START〜CUT をテープストップ(TAPE秒) → 寸劇 SKIT 秒 → 元の曲の CUT から再開。最後に余白 POST 秒。
// 歌詞(LRC)は元の曲の秒数。songTime() で動画の秒数から変換して使う。
// 素材は public/photo/keitora/（scripts/keitora_process.py で作成）。主人公・新人・同僚・社長・課長・部長は前作のを流用。

const LRC_FILE = 'lyrics/keitora-ojisan.lrc';
const AUDIO_FILE = 'music/keitora-ojisan-mv.wav';

const CUT = 201.0;
const TAPE = 0.8;
const TAPE_START = CUT - TAPE / 2;
const SKIT = 20.6;
const SONG_LEN = 281.2;
const POST = 3.0;
const FPS = 30;
export const KEITORA_OJISAN_DURATION = Math.ceil((TAPE_START + TAPE + SKIT + (SONG_LEN - CUT) + POST) * FPS);

const PIXEL_FONT = "'DotGothic16', monospace";
const YELLOW = '#ffd23f';
const ORANGE = '#ff9a2e';
const CYAN = '#7fe8ff';
const WHITE = '#fffaf0';
const GREEN = '#7dff9a';
const GREY = '#b9b4d6';
const RED = '#ff5050';
const PINK = '#ff7fb8';

const BEAT = 60 / 143.55;

const songTime = (t: number): { song: number | null; skit: number | null; post: number | null; tape: number | null } => {
  if (t < TAPE_START) return { song: t, skit: null, post: null, tape: null };
  if (t < TAPE_START + TAPE) return { song: TAPE_START - 0.01, skit: null, post: null, tape: (t - TAPE_START) / TAPE };
  if (t < TAPE_START + TAPE + SKIT) return { song: null, skit: t - TAPE_START - TAPE, post: null, tape: null };
  const s = t - TAPE_START - TAPE - SKIT + CUT;
  if (s < SONG_LEN) return { song: s, skit: null, post: null, tape: null };
  return { song: null, skit: null, post: s - SONG_LEN, tape: null };
};

// ---- helpers ----
const step = (frame: number, n: number) => Math.floor(frame / n) * n;
const snap = (v: number, px = 4) => Math.round(v / px) * px;
const between = (s: number | null, a: number, b: number) => s !== null && s >= a && s < b;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const beatIdx = (s: number, base: number) => Math.floor((s - base) / BEAT);
const hopAt = (s: number, a: number, dur = 0.5, h = 90) => {
  const p = (s - a) / dur;
  return p < 0 || p > 1 ? 0 : snap(4 * h * p * (1 - p), 8);
};
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
// 名前の頭: 'o:' = photo/keitora（今回）、's:' = photo/shachiku、'k:' = photo/kacho、'b:' = photo/bucho（前作の流用）
const H: Record<string, number> = {
  'o:O01_idle_armcross': 480, 'o:O02_lecture_finger': 480, 'o:O03_palm_no': 480, 'o:O04_glare_lines': 480,
  'o:O05_monkey_grin': 480, 'o:O06_bow_yes': 470, 'o:O07_angry_point': 470, 'o:O08_chair_check': 400,
  'o:O09_whiteboard': 480, 'o:O10_doya': 490, 'o:O11_scold_down': 450, 'o:O12_spine_straight': 480,
  'o:O13_old_days': 480, 'o:O14_swing_miss': 450, 'o:O15_toneup_greet': 480, 'o:O16_gossip': 460,
  'o:V01_truck_rear_drive': 360, 'o:V02_truck_side_drive': 400, 'o:V03_truck_arrive': 430,
  'o:V04_mirror_closeup': 720, 'o:V05_truck_throne': 600,
  'o:H08_umpire_call': 530, 'o:H09_head_tilt': 516,
  'o:M06_flatter_clap': 400, 'o:M07_ukki_cheer': 420, 'o:K16_hospital_bed': 400,
  's:hero_idle': 500, 's:hero_deadpan': 516, 's:boss_clap': 500, 's:S01_idle': 500, 's:S04_shock': 500,
  's:M01_grumble': 400, 's:M02_aruaru': 390, 's:M03_nod': 390,
  'k:K13_glance': 420, 'k:H01_tsukkomi': 516, 'k:H02_facepalm': 516,
  'b:D01_idle': 560, 'b:D03_chest_thump': 560,
};
const N: Record<string, number> = {
  'o:O05_monkey_grin': 3, 'o:O08_chair_check': 3, 'o:O14_swing_miss': 3, 'o:V01_truck_rear_drive': 3, 'o:V03_truck_arrive': 3,
};
const DIR: Record<string, string> = { o: 'keitora', s: 'shachiku', k: 'kacho', b: 'bucho' };
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
  opacity?: number;
  rotate?: number;
}> = ({ id, frame, every = 6, x, y = 930, scale = 1, flip = false, filter, fixed, bob = 0, hop = 0, opacity = 1, rotate = 0 }) => {
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
        transform: `translate(-50%, -100%) scaleX(${flip ? -1 : 1}) rotate(${rotate}deg)`,
        transformOrigin: '50% 100%',
        imageRendering: 'pixelated',
        opacity,
        filter: `drop-shadow(0 8px 0 rgba(0,0,0,0.35)) ${filter ?? ''}`,
      }}
    />
  );
};


// 首だけ傾けるおじさん（O01 の頭を首の付け根で回す。首の位置は O01 の絵で 上から29%・左から44%）
const TiltOji: React.FC<{ x: number; y?: number; angle: number; frame: number }> = ({ x, y = 930, angle }) => {
  const h = 480;
  const w = h / 2;
  const img = (clip: string, rot: number) => (
    <Img
      src={src('o:O01_idle_armcross', 0)}
      style={{
        position: 'absolute', left: 0, top: 0, width: w, height: h, imageRendering: 'pixelated', clipPath: clip,
        transform: `rotate(${rot}deg)`, transformOrigin: '44% 29%',
      }}
    />
  );
  return (
    <div style={{ position: 'absolute', left: snap(x - w / 2), top: snap(y - h), width: w, height: h, filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.35))' }}>
      {img('inset(29% 0 0 0)', 0)}
      {img('inset(0 0 70% 0)', angle)}
    </div>
  );
};

// ---- 背景 ----
const bgSrc = (n: number | string) => (typeof n === 'number' ? staticFile(`photo/keitora/B${n}.png`) : staticFile(n));
const KACHO_DESK = 'photo/kacho/B2.png';
const BG: React.FC<{ n: number | string; filter?: string; zoom?: number; ox?: number; oy?: number; flip?: boolean }> = ({ n, filter, zoom = 1, ox = 0.5, oy = 0.5, flip }) => (
  <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${ox * 100}% ${oy * 100}%` }}>
    <Img src={bgSrc(n)} style={{ position: 'absolute', left: -40, top: -40, width: 2000, height: 1125, imageRendering: 'pixelated', filter, transform: flip ? 'scaleX(-1)' : undefined }} />
  </AbsoluteFill>
);

// レース画面（後ろから見た疑似3D）。地平線に向かってズームをくり返して「走ってる感」を出す
const RaceView: React.FC<{ s: number; frame: number; n?: number; speed?: number; truck?: boolean; boost?: boolean; filter?: string; spin?: boolean; truckFilter?: string }> = ({
  s, frame, n = 2, speed = 1, truck = true, boost = false, filter, spin = false, truckFilter,
}) => {
  const cyc = (((s * speed * (boost ? 3.2 : 1.6)) % 1) + 1) % 1;
  const z = 1 + snap(cyc * 0.12 * 100, 2) / 100;
  const sway = Math.sin(s * 1.7) * (boost ? 30 : 60);
  const lines = boost
    ? new Array(14).fill(0).map((_, i) => {
        const a = random(`ln${i}`) * Math.PI * 2;
        const r0 = 200 + ((step(frame, 2) * 37 + i * 97) % 500);
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: 960 + Math.cos(a) * r0, top: 430 + Math.sin(a) * r0 * 0.6, width: 140, height: 8, background: WHITE, opacity: 0.8,
              transform: `rotate(${a}rad)`, transformOrigin: '0 50%',
            }}
          />
        );
      })
    : null;
  return (
    <>
      <BG n={n} zoom={z} ox={0.5} oy={0.42} filter={filter} />
      {lines}
      {truck && (
        <Sprite
          id="o:V01_truck_rear_drive"
          frame={frame}
          fixed={spin ? Math.floor(frame / 2) % 3 : sway > 40 ? 2 : Math.floor(frame / (boost ? 3 : 6)) % 2}
          x={snap(960 + sway)}
          y={1000}
          flip={spin ? Math.floor(frame / 4) % 2 === 0 : sway < -40}
          filter={truckFilter}
        />
      )}
    </>
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

const Banner: React.FC<{ text: string; color?: string; since: number; top?: number; size?: number }> = ({ text, color = YELLOW, since, top = 200, size = 86 }) => {
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

const Icon: React.FC<{ name: string; size: number; x: number; y: number; filter?: string; rotate?: number }> = ({ name, size, x, y, filter, rotate = 0 }) => (
  <Img
    src={staticFile(`photo/keitora/icon_${name}.png`)}
    style={{
      position: 'absolute', left: snap(x - size / 2), top: snap(y - size / 2), height: size, imageRendering: 'pixelated',
      filter: `drop-shadow(0 6px 0 rgba(0,0,0,0.4)) ${filter ?? ''}`, transform: `rotate(${rotate}deg)`,
    }}
  />
);

// アイテムボックス（A・C・E）
const ItemBox: React.FC<{ letter: string; x: number; y: number; size?: number; frame: number; glow?: boolean }> = ({ letter, x, y, size = 200, frame, glow }) => (
  <div
    style={{
      position: 'absolute', left: snap(x - size / 2), top: snap(y - size / 2), width: size, height: size,
      background: glow && Math.floor(frame / 4) % 2 ? '#fff27a' : '#ffb52e', border: '10px solid #fff', boxShadow: '0 0 0 8px #000, 0 12px 0 8px rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: PIXEL_FONT, fontSize: size * 0.62, color: '#7a2a00', textShadow: '6px 6px 0 #fff',
    }}
  >
    {letter}
  </div>
);

// ---- タイムライン ----
const STRIKES = [90.08, 159.32, 259.04];
const UKKI = [58.9, 121.14, 149.34, 167.64, 169.3, 170.98, 197.94, 198.8, 199.96, 224.88, 231.66, 271.0];
const BOOSTS = [56.4, 118.08, 228.7];
// 玉座のシーン: [King of 内弁慶, 自称正義のヒーロー, 今日も玉座で無敵です, おわり]
const THRONES: Array<[number | null, number, number, number]> = [[69.26, 73.26, 76.7, 80.2], [null, 132.44, 135.94, 139.48], [240.36, 243.32, 246.8, 250.42]];
const inMuteki = (s: number | null) => THRONES.some(([, , mt, en]) => between(s, mt, en));
const strikeCount = (s: number) => STRIKES.filter((x) => s >= x).length;
// ごきげんメーター（0〜5）。ご機嫌取りで給油される
const GOKIGEN_PTS: Array<[number, number]> = [
  [0, 3], [27.98, 2], [48.24, 4], [56.4, 5], [80.2, 3], [96.58, 2], [118.08, 4], [139.48, 3], [152.8, 1], [166.66, 2],
  [182.82, 3], [190.86, 5], [201.0, 4], [212.74, 1], [218.96, 3], [221.14, 4], [225.54, 5],
];
const gokigenAt = (s: number) => {
  let v = 0;
  for (const [tt, n] of GOKIGEN_PTS) if (s >= tt) v = n;
  return v;
};

// ---- HUD ----
const Hud: React.FC<{ frame: number; s: number; posBlink: boolean; strikes: number; strikeBlink: boolean; gokigen: number; speed: number }> = ({ frame, s, posBlink, strikes, strikeBlink, gokigen, speed }) => {
  const blink = Math.floor(frame / 5) % 2 === 0;
  const erai = Math.floor(s / 4) % 3 === 2;
  return (
    <>
      <Win style={{ left: 40, top: 36, padding: '10px 24px 12px', whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: 40, display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span style={{ color: posBlink && blink ? WHITE : YELLOW, fontSize: posBlink ? 56 : 40 }}>POS 1/1</span>
          <span style={{ fontSize: 30 }}>おじさん</span>
          <span style={{ fontSize: 24, color: erai ? ORANGE : GREY }}>{erai ? 'えらい（じこしんこく）' : 'やくしょく：なし'}</span>
        </div>
        <div style={{ fontSize: 26, marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>ごきげん</span>
          <span style={{ color: RED }}>E</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} style={{ width: 28, height: 22, background: i < gokigen ? (gokigen >= 5 && blink ? WHITE : GREEN) : '#222', border: '3px solid #fff' }} />
          ))}
          <span style={{ color: GREEN }}>F</span>
        </div>
      </Win>
      <Win style={{ right: 40, top: 36, padding: '10px 26px 12px', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 36 }}>
          <span style={{ color: CYAN }}>STRIKE</span>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 40, height: 40, borderRadius: 20, border: '4px solid #fff',
                background: i < strikes ? (strikeBlink && blink ? WHITE : RED) : '#222',
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 26, marginTop: 8, textAlign: 'right' }}>
          <span style={{ color: GREY }}>じしょう せいぎ　</span>
          <span style={{ color: ORANGE, fontSize: 34 }}>{String(speed).padStart(3, '0')}</span> km/h
        </div>
      </Win>
    </>
  );
};

// 名前タグ
const HERO_LINES = ['いや 今のは', 'Strike', 'Bは どこ', '誰が 見たって', '「これ 無理です」', 'あの、それ', 'いや それ', '「アレ、使って'];
const OJI_LINES = ['「おかしい', '「真面目', '「機械', '「現場で', '「俺は', '「報連相', '「会社の 行事', '「雇って', '「昔は', '「二種類', '面倒だろ', '「責任は', '「あいつは', '分かる やつだけ', 'でも 俺の', '俺の 辞書', '「会社の ため」'];
const speakerOf = (text: string) => {
  if (text.startsWith('（ウッキー')) return { name: '現場一同', color: CYAN, tag: '#0b5c74', big: true };
  if (text.startsWith('「さすが')) return { name: '現場一同', color: CYAN, tag: '#0b5c74', big: false };
  if (HERO_LINES.some((h) => text.startsWith(h))) return { name: '主人公', color: YELLOW, tag: '#7a6400', big: text.startsWith('Strike') || text.startsWith('いや それ') };
  if (OJI_LINES.some((h) => text.startsWith(h))) return { name: 'おじさん', color: ORANGE, tag: '#7a3b00', big: text.startsWith('分かる') };
  return { name: 'ナレーション', color: WHITE, tag: '#3b1a6b', big: false };
};

export const KeitoraOjisan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [lrcContent, setLrcContent] = useState<string | null>(null);
  const [fontHandle] = useState(() => delayRender('keitora-font'));

  useEffect(() => {
    loadFont()
      .catch((err) => console.error('Failed to load font:', err))
      .finally(() => continueRender(fontHandle));
  }, [fontHandle]);

  useEffect(() => {
    const controller = new AbortController();
    const handle = delayRender('keitora-lrc');
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
  const { song: s, skit: k, post, tape } = songTime(t);
  const f = frame;
  const sv = s ?? 0;
  const since = (a: number) => Math.round((sv - a) * fps);
  const ENDING = 272.5;
  const inEnding = post !== null || (s !== null && sv >= ENDING);

  // ---- 今の歌詞 ----
  const idx = s === null ? -1 : lyrics.findIndex((l, i) => l.time <= s && (!lyrics[i + 1] || lyrics[i + 1].time > s));
  const line = idx >= 0 && lyrics[idx].text ? lyrics[idx] : null;
  const next = idx >= 0 ? lyrics[idx + 1] : null;
  const lineFrame = line && s !== null ? Math.round((s - line.time) * fps) : 0;
  const lineHold = line ? (next ? next.time - line.time : 4) : 0;

  // ---- 揺れ ----
  const thuds = [9.6, 62.68, 91.76, 154.14, 176.5, 190.86, 268.3, ...STRIKES, ...UKKI];
  let sinceHit = 999;
  if (s !== null) for (const h of thuds) if (s >= h) sinceHit = Math.min(sinceHit, (s - h) * fps);
  const angry = between(s, 176.5, 180.82);
  const skitShake = k !== null && ((k >= 11.7 && k < 12.0) || (k >= 16.2 && k < 16.5));
  const shaking = sinceHit < 8 || skitShake || (angry && Math.floor(f / 3) % 2 === 0);
  const shakeX = shaking ? snap((random(`sx${step(f, 2)}`) - 0.5) * 36, 8) : 0;
  const shakeY = shaking ? snap((random(`sy${step(f, 2)}`) - 0.5) * 28, 8) : 0;

  // ---- 白フラッシュ ----
  const flashSongTimes = [7.94, 8.16, 56.4, 82.88, 109.84, 118.08, 139.48, 166.66, 180.82, 201.0, 218.96, 228.7, 250.42, 268.3, ...UKKI];
  let sinceFlash = 999;
  if (s !== null) for (const ft of flashSongTimes) if (s >= ft) sinceFlash = Math.min(sinceFlash, (s - ft) * fps);
  const bigFlash = between(s, 268.3, 269.0) ? 1 : 0;
  const flash = Math.max(bigFlash, sinceFlash < 3 ? 0.85 : sinceFlash < 6 ? 0.4 : 0);

  const rainbow = `hue-rotate(${(f * 24) % 360}deg) saturate(1.6)`;
  const strikeScene = (base: number) => {
    const d = sv - base;
    return (
      <>
        <BG n={3} zoom={1.15} oy={0.6} filter="brightness(0.75)" />
        <Sprite id="o:O03_palm_no" frame={f} fixed={1} x={1450} y={930} scale={0.85} filter="brightness(0.8)" />
        <Sprite id="o:H08_umpire_call" frame={f} fixed={d < 0.25 ? 0 : 1} x={760} y={1000} scale={1.25} hop={hopAt(sv, base + 0.2, 0.3, 30)} />
      </>
    );
  };
  const throne = (base: number) => {
    const d = sv - base;
    const enter = clamp(d / 0.9, 0, 1);
    const lit = Math.floor(f / 6) % 2 === 1;
    return (
      <>
        <BG n={4} />
        <Sprite id="o:V05_truck_throne" frame={f} fixed={lit ? 1 : 0} x={snap(-500 + enter * 1460)} y={990} filter={inMuteki(sv) ? rainbow : undefined} />
        {enter >= 1 && <Icon name="crown" size={120} x={snap(-500 + enter * 1460) - 110} y={snap(380 - Math.abs(Math.sin(sv * 4)) * 20)} />}
      </>
    );
  };

  // ===== シーン（背景＋キャラ）=====
  const scene = (): React.ReactNode => {
    if (k !== null) return skitScene(k);
    if (s === null) return null;
    // ---- イントロ ----
    if (sv < 4.5) return <BG n={2} filter="brightness(0.35)" />;
    if (sv < 6.2) return null;
    if (sv < 8.16) {
      const go = sv >= 7.94;
      if (!go) return <RaceView s={0} frame={0} truck />;
      const p = clamp((sv - 7.94) / 0.22, 0, 1);
      return (
        <>
          <RaceView s={sv} frame={f} truck={false} boost />
          <Sprite id="o:V01_truck_rear_drive" frame={f} every={2} x={960} y={snap(1000 - p * 300)} scale={1 - p * 0.6} />
        </>
      );
    }
    // ---- Verse1 ----
    if (sv < 12.22) {
      if (sv < 9.6) return (<><BG n={1} /><Sprite id="o:V02_truck_side_drive" frame={f} every={3} x={snap(-500 + ((sv - 8.16) / 1.44) * 1450)} y={960} /></>);
      return (<><BG n={1} /><Sprite id="o:V03_truck_arrive" frame={f} fixed={sv < 10.4 ? 0 : sv < 11.2 ? 1 : 2} x={950} y={960} /></>);
    }
    if (sv < 21.4) {
      const cuts = [12.22, 14.88, 16.82, 18.52];
      let ci = 0;
      cuts.forEach((c, i) => { if (sv >= c) ci = i; });
      const zoom = [1, 1.35, 1.7, 2.1][ci];
      return (
        <>
          <BG n={3} zoom={zoom} ox={0.62} oy={0.45} />
          {ci === 0 && <Sprite id="s:M01_grumble" frame={f} every={14} x={520} y={930} />}
          <Sprite id="o:O02_lecture_finger" frame={f} fixed={beatIdx(sv, 12.22) % 2} x={ci === 0 ? 1250 : 1100} y={930 + (zoom - 1) * 700} scale={zoom} />
        </>
      );
    }
    if (sv < 23.0) return (<><BG n={3} /><Sprite id="o:O02_lecture_finger" frame={f} every={4} x={1100} /></>);
    if (sv < 25.56) return (<><BG n={3} /><Sprite id="s:M01_grumble" frame={f} every={14} x={600} /><Sprite id="o:O01_idle_armcross" frame={f} every={14} x={1300} /></>);
    if (sv < 27.98) return (<><BG n={3} /><Sprite id="s:M01_grumble" frame={f} fixed={0} x={600} /><Sprite id="o:O03_palm_no" frame={f} fixed={sv < 26.6 ? 0 : 1} x={1300} /></>);
    // ---- Verse1b ----
    if (sv < 29.74) return (<><BG n={3} /><Sprite id="k:H01_tsukkomi" frame={f} every={6} x={640} /><Sprite id="o:O03_palm_no" frame={f} fixed={1} x={1320} /></>);
    if (sv < 31.86) return (<><BG n={3} /><Sprite id="o:O10_doya" frame={f} fixed={0} x={960} /></>);
    if (sv < 34.7) return (<><BG n={3} /><Sprite id="o:O01_idle_armcross" frame={f} every={14} x={960} /></>);
    if (sv < 36.82) return (<><BG n={3} zoom={2.2} ox={0.5} oy={0.4} /><Sprite id="o:O04_glare_lines" frame={f} fixed={sv < 35.6 ? 0 : 1} x={960} y={2100} scale={3.6} /></>);
    if (sv < 38.94) {
      const p = (sv - 37.4) / 0.5;
      return (
        <>
          <BG n={1} />
          <Sprite id="o:O04_glare_lines" frame={f} fixed={1} x={1500} />
          {p > 0 && p < 1 && <Sprite id="o:V02_truck_side_drive" frame={f} every={2} x={snap(2400 - p * 3200)} y={960} flip />}
        </>
      );
    }
    if (sv < 42.02) {
      const night = sv < 40.6;
      return (
        <>
          <BG n={3} filter={night ? 'brightness(0.35) hue-rotate(200deg)' : undefined} />
          <Sprite id="s:hero_deadpan" frame={f} every={30} x={760} filter={night ? 'brightness(0.5)' : undefined} />
          {!night && <Sprite id="o:O01_idle_armcross" frame={f} every={14} x={1320} />}
        </>
      );
    }
    if (sv < 45.5) return (<><BG n={3} /><Sprite id="s:hero_deadpan" frame={f} fixed={0} x={680} /><Sprite id="o:O03_palm_no" frame={f} fixed={sv < 43.8 ? 0 : 1} x={1320} /></>);
    if (sv < 48.24) return (<><BG n={3} zoom={1.6} ox={0.5} oy={0.3} /><Sprite id="o:O01_idle_armcross" frame={f} every={14} x={960} y={1400} scale={1.8} /></>);
    // ---- Pre-Chorus1（レース画面）----
    if (sv < 56.4) {
      const fly = sv >= 50.4 && sv < 52.02;
      return (
        <>
          <RaceView s={sv} frame={f} />
          {between(s, 48.24, 50.4) && <Sprite id="s:M03_nod" frame={f} every={8} x={260} y={900} scale={0.8} />}
          {fly && <Sprite id="s:M01_grumble" frame={f} fixed={0} x={snap(1650 + (sv - 50.4) * 500)} y={snap(900 - (sv - 50.4) * 700)} scale={0.8} rotate={(sv - 50.4) * 500} />}
          {sv >= 52.02 && <Sprite id="o:O10_doya" frame={f} fixed={0} x={1640} y={900} scale={0.7} />}
        </>
      );
    }
    // ---- Chorus1 ----
    if (sv < 59.6) return <RaceView s={sv} frame={f} boost />;
    // 人には 首を 45°（おじさんが先に傾ける）→ 傾げ返したら（主人公も傾ける）→「なんだ その 態度は！」
    if (sv < 64.5) {
      const ang = -snap(clamp((sv - 59.9) / 0.35, 0, 1) * 45, 5);
      return (<><BG n={3} /><Sprite id="o:H09_head_tilt" frame={f} fixed={sv < 62.9 ? 0 : 1} x={680} /><TiltOji x={1320} angle={ang} frame={f} /></>);
    }
    if (sv < 66.58) return (<><BG n={3} /><Sprite id="o:H09_head_tilt" frame={f} fixed={1} x={680} /><Sprite id="o:O07_angry_point" frame={f} every={6} x={1300} flip /></>);
    if (sv < 69.26) return (<><BG n={5} /><Sprite id="o:O06_bow_yes" frame={f} fixed={beatIdx(sv, 66.58) % 2} x={1000} /></>);
    if (sv < 80.2) return throne(69.26);
    if (sv < 82.88) return <RaceView s={sv} frame={f} />;
    // ---- Verse2 ----
    if (sv < 84.96) return (<><BG n={3} /><Sprite id="s:M01_grumble" frame={f} every={14} x={560} /><Sprite id="o:O03_palm_no" frame={f} fixed={0} x={1300} /></>);
    if (sv < 86.74) return (<><BG n={3} /><Sprite id="o:O13_old_days" frame={f} fixed={sv < 85.8 ? 0 : 1} x={1100} /></>);
    if (sv < 88.68) return (<><BG n={3} /><Sprite id="s:hero_idle" frame={f} every={14} x={640} /><Sprite id="o:O01_idle_armcross" frame={f} every={14} x={1320} /></>);
    if (sv < 90.08) return (<><BG n={3} /><Sprite id="s:hero_idle" frame={f} fixed={0} x={640} /><Sprite id="o:O03_palm_no" frame={f} fixed={1} x={1320} /></>);
    if (sv < 91.76) return strikeScene(90.08);
    if (sv < 93.52) return (<><BG n={3} /><Sprite id="s:hero_deadpan" frame={f} fixed={0} x={640} /><Sprite id="o:O03_palm_no" frame={f} fixed={1} x={1320} /></>);
    if (sv < 95.16) return (<><BG n={3} /><Sprite id="o:O16_gossip" frame={f} every={10} x={1100} /><Sprite id="s:M02_aruaru" frame={f} fixed={0} x={1600} flip /></>);
    if (sv < 96.58) return (<><BG n={3} /><Sprite id="o:O07_angry_point" frame={f} every={6} x={1000} /></>);
    // ---- Verse2b ----
    if (sv < 101.92) {
      const dim = sv >= 100.3 ? 'brightness(0.6)' : undefined;
      return (
        <>
          <BG n={3} filter={dim} />
          <Sprite id="s:hero_deadpan" frame={f} every={30} x={820} filter={dim} />
          <Sprite id="o:O09_whiteboard" frame={f} fixed={sv >= 98.7 ? 1 : 0} x={1180} filter={dim} />
          {between(s, 98.7, 100.3) && <Icon name="marker" size={130} x={1450} y={snap(380 + (sv - 98.7) * 300)} rotate={(sv - 98.7) * 200} />}
        </>
      );
    }
    if (sv < 103.7) return (<><BG n={3} /><Sprite id="s:M02_aruaru" frame={f} fixed={0} x={700} /><Sprite id="o:O04_glare_lines" frame={f} fixed={1} x={1350} /></>);
    if (sv < 105.18) return (<><BG n={3} /><Sprite id="s:M03_nod" frame={f} every={10} x={700} /><Sprite id="o:O10_doya" frame={f} fixed={0} x={1350} /></>);
    if (sv < 109.84) return (<><BG n={3} /><Sprite id="o:O02_lecture_finger" frame={f} fixed={beatIdx(sv, 105.18) % 2} x={1100} /><Sprite id="s:S01_idle" frame={f} every={14} x={560} /></>);
    // ---- Pre-Chorus2 ----
    if (sv < 111.6) return (<><BG n={3} /><Sprite id="o:O13_old_days" frame={f} fixed={0} x={1000} /></>);
    if (sv < 113.3) return (<><BG n={8} filter="sepia(0.9) contrast(1.1)" /><Sprite id="o:O13_old_days" frame={f} fixed={1} x={900} filter="sepia(0.9)" /></>);
    if (sv < 115.08) return (<><BG n={3} filter="brightness(0.7)" /><Sprite id="o:O12_spine_straight" frame={f} fixed={1} x={1000} /></>);
    if (sv < 118.08) return (<><BG n={3} /><Sprite id="o:O10_doya" frame={f} fixed={sv < 116.4 ? 0 : 1} x={1000} /></>);
    // ---- Chorus2 ----
    if (sv < 121.46) return <RaceView s={sv} frame={f} boost />;
    if (sv < 124.66) return (<><BG n={3} /><Sprite id="s:S04_shock" frame={f} fixed={Math.floor(f / 4) % 2} x={1380} /><Sprite id="o:O11_scold_down" frame={f} fixed={beatIdx(sv, 121.46) % 2} x={700} /></>);
    if (sv < 128.06) return (<><BG n={8} filter="sepia(0.9)" /><Sprite id="o:O10_doya" frame={f} fixed={1} x={960} filter="sepia(0.6)" /></>);
    if (sv < 130.14) return (<><BG n={3} /><Sprite id="o:O02_lecture_finger" frame={f} every={8} x={1300} /><Sprite id="s:M03_nod" frame={f} every={10} x={560} /></>);
    if (sv < 132.44) return (<><BG n={3} /><Sprite id="o:O16_gossip" frame={f} every={10} x={1400} /></>);
    if (sv < 139.48) return throne(132.44);
    // ---- Verse3 ----
    if (sv < 145.98) {
      const e = sv >= 144.38;
      return (
        <>
          <BG n={3} />
          <Sprite id={sv < 142.66 ? 'o:O02_lecture_finger' : 'o:O03_palm_no'} frame={f} every={8} x={1450} />
          {!e && <ItemBox letter="A" x={360} y={430} frame={f} />}
          {!e && <ItemBox letter="C" x={900} y={430} frame={f} />}
          {between(s, 142.66, 144.38) && <div style={{ position: 'absolute', left: 560, top: 380, fontFamily: PIXEL_FONT, fontSize: 90, color: WHITE, textShadow: '6px 6px 0 #000' }}>→？←</div>}
          {e && <ItemBox letter="E" x={630} y={snap(430 - hopAt(sv, 144.38, 0.5, 80))} size={260} frame={f} glow />}
        </>
      );
    }
    if (sv < 147.64) return (<><BG n={3} /><Sprite id="o:H09_head_tilt" frame={f} fixed={1} x={800} /><ItemBox letter="E" x={1350} y={430} frame={f} /></>);
    if (sv < 151.0) return (<><BG n={3} /><Sprite id="o:O10_doya" frame={f} fixed={sv >= 149.74 ? 1 : 0} x={1000} /></>);
    if (sv < 154.14) {
      const p = clamp((sv - 151.0) / 1.6, 0, 1);
      return (
        <>
          <RaceView s={sv} frame={f} />
          {p < 1 && <ItemBox letter="E" x={960} y={snap(800 - p * 400)} size={snap(200 - p * 140, 4)} frame={f} glow />}
        </>
      );
    }
    if (sv < 155.96) {
      return (
        <>
          <RaceView s={sv} frame={f} spin truckFilter="brightness(0.7) sepia(0.4)" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ position: 'absolute', left: snap(760 + random(`bx${i}`) * 400), top: snap(560 + random(`by${i}`) * 200 - (sv - 154.14) * 200), width: 140, height: 140, borderRadius: 70, background: i % 2 ? '#888' : '#ccc', opacity: 0.85 }} />
          ))}
        </>
      );
    }
    // ---- Verse3b ----
    if (sv < 157.68) return (<><BG n={3} /><Sprite id="s:hero_idle" frame={f} every={14} x={640} /><Sprite id="o:O01_idle_armcross" frame={f} every={14} x={1320} /></>);
    if (sv < 159.32) return (<><BG n={3} /><Sprite id="s:hero_idle" frame={f} fixed={0} x={640} /><Sprite id="o:O03_palm_no" frame={f} fixed={1} x={1320} /></>);
    if (sv < 160.82) return strikeScene(159.32);
    if (sv < 162.4) return (<><BG n={3} /><Sprite id="o:O02_lecture_finger" frame={f} every={8} x={1100} opacity={clamp((sv - 160.82) / 0.4, 0, 1)} /></>);
    if (sv < 164.6) return (<><BG n={6} /><Sprite id="o:O02_lecture_finger" frame={f} fixed={1} x={1350} /><Sprite id="k:H01_tsukkomi" frame={f} every={6} x={600} /></>);
    if (sv < 166.66) return (<><BG n={6} /><Sprite id="o:O10_doya" frame={f} fixed={1} x={1450} /><ItemBox letter="E" x={800} y={snap(560 - hopAt(sv, 164.6, 0.6, 120))} size={240} frame={f} glow /></>);
    // ---- Interlude ----
    if (sv < 171.42) {
      return (
        <>
          <RaceView s={sv} frame={f} />
          <Sprite id="o:M07_ukki_cheer" frame={f} fixed={UKKI.some((u) => sv >= u && sv < u + 0.45) ? 1 : 0} x={300} y={940} scale={0.8} />
        </>
      );
    }
    if (sv < 176.5) {
      const p = clamp((sv - 171.42) / 4.6, 0, 1);
      return (
        <>
          <RaceView s={sv} frame={f} />
          {p < 0.92 && (
            <div style={{ position: 'absolute', left: 960, top: snap(560 + p * 420), transform: `translate(-50%, -50%) scale(${0.4 + p * 1.6})`, width: 260, height: 180, background: '#fffaf0', border: '6px solid #000', fontFamily: PIXEL_FONT, fontSize: 40, color: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              かいぜんあん
            </div>
          )}
        </>
      );
    }
    if (sv < 180.82) return (<><BG n={3} filter="saturate(1.4) brightness(0.9) sepia(0.3)" /><Sprite id="o:O07_angry_point" frame={f} every={4} x={960} y={1300} scale={1.8} /></>);
    // ---- Rap Bridge ----
    if (sv < 182.82) return (<><BG n={9} /><Sprite id="o:K16_hospital_bed" frame={f} fixed={sv < 181.8 ? 0 : 1} x={960} y={960} scale={1.2} /></>);
    if (sv < 184.76) return (<><BG n={3} /><Sprite id="o:O01_idle_armcross" frame={f} every={14} x={960} /></>);
    if (sv < 190.86) {
      const fr = sv < 186.2 ? 0 : sv < 187.86 ? 1 : 2;
      const z = sv >= 189.36;
      return (
        <>
          <BG n={KACHO_DESK} zoom={z ? 1.5 : 1} ox={0.55} oy={0.7} />
          <Sprite id="o:O08_chair_check" frame={f} fixed={fr} x={1000} y={z ? 1080 : 960} scale={z ? 1.6 : 1.1} />
        </>
      );
    }
    if (sv < 197.94) return (<><BG n={KACHO_DESK} /><Sprite id="k:H01_tsukkomi" frame={f} every={6} x={560} /><Sprite id="o:O08_chair_check" frame={f} fixed={2} x={1250} y={960} scale={1.1} /></>);
    {
      // ウッキー！×3（ピカーッ3連発）
      const u = sv >= 199.96 ? 199.96 : sv >= 198.8 ? 198.8 : 197.94;
      const fr = sv - u < 0.15 ? 1 : 2;
      return (<><BG n={KACHO_DESK} zoom={1.3} oy={0.6} /><Sprite id="o:O05_monkey_grin" frame={f} fixed={fr} x={960} y={1180} scale={1.6} /></>);
    }
  };

  const scene2 = (): React.ReactNode => {
    // 寸劇のあと（Verse4〜）
    if (s === null) return null;
    // ---- Verse4 ----
    if (sv < 202.8) return (<><BG n={3} /><Sprite id="o:O01_idle_armcross" frame={f} every={14} x={960} /></>);
    if (sv < 204.5) return (<><BG n={3} /><Sprite id="b:D01_idle" frame={f} every={14} x={1400} /><Sprite id="o:O15_toneup_greet" frame={f} fixed={0} x={700} hop={hopAt(sv, 202.9, 0.4, 50)} /></>);
    if (sv < 206.06) return (<><BG n={3} /><Sprite id="s:boss_clap" frame={f} every={6} x={1400} /><Sprite id="o:O15_toneup_greet" frame={f} fixed={beatIdx(sv, 204.5) % 2} x={700} hop={beatHop(sv, 204.5, 1, 40)} /></>);
    if (sv < 207.64) return (<><BG n={3} /><Sprite id="o:O16_gossip" frame={f} every={10} x={1100} /><Sprite id="s:M02_aruaru" frame={f} fixed={0} x={1600} flip /></>);
    if (sv < 209.78) return (<><BG n={3} /><Sprite id="o:O16_gossip" frame={f} fixed={0} x={600} /><Sprite id="s:M03_nod" frame={f} every={8} x={1150} /><Sprite id="s:M02_aruaru" frame={f} fixed={1} x={1550} /></>);
    if (sv < 212.74) return (<><BG n={3} /><Sprite id="o:O16_gossip" frame={f} every={10} x={960} /></>);
    if (sv < 218.96) return (<><BG n={3} /><Sprite id="o:O12_spine_straight" frame={f} fixed={sv < 213.3 ? 0 : 1} x={960} hop={hopAt(sv, 213.3, 0.3, 40)} /></>);
    // ---- Pre-Chorus4 ----
    if (sv < 221.14) return (<><BG n={7} /><Sprite id="o:M06_flatter_clap" frame={f} fixed={beatIdx(sv, 218.96) % 2} x={600} /><Sprite id="o:O05_monkey_grin" frame={f} fixed={sv < 220.04 ? 0 : 1} x={1400} /></>);
    if (sv < 223.42) return (<><BG n={7} zoom={1.4} oy={0.5} /><Sprite id="o:O05_monkey_grin" frame={f} fixed={Math.floor(f / 5) % 2 ? 2 : 1} x={960} y={1300} scale={1.8} /></>);
    if (sv < 225.54) return (<><BG n={7} /><Sprite id="o:H09_head_tilt" frame={f} fixed={1} x={800} /><Sprite id="o:O05_monkey_grin" frame={f} fixed={1} x={1400} /></>);
    if (sv < 228.7) {
      return (
        <>
          <BG n={7} />
          <Sprite id="o:V02_truck_side_drive" frame={f} fixed={0} x={1150} y={960} />
          <Sprite id="o:M06_flatter_clap" frame={f} fixed={beatIdx(sv, 225.54) % 2} x={400} y={960} scale={0.9} />
          <Icon name="fuel" size={140} x={snap(700 + Math.sin(sv * 6) * 20)} y={560} />
        </>
      );
    }
    // ---- Final Chorus ----
    if (sv < 232.3) return <RaceView s={sv} frame={f} boost />;
    if (sv < 235.2) {
      // 振り向いたら Nobody's there（後ろの道に誰もいない）
      const look = sv >= 233.0;
      return look ? <BG n={10} zoom={1.05} /> : <RaceView s={sv} frame={f} n={10} />;
    }
    if (sv < 238.56) return (<><BG n={10} filter="brightness(0.6) blur(2px)" /><Sprite id="o:V04_mirror_closeup" frame={f} fixed={sv < 236.8 ? 0 : 1} x={960} y={1000} /></>);
    if (sv < 240.36) return (<><BG n={3} filter="sepia(0.3) saturate(1.3)" /><Sprite id="o:M06_flatter_clap" frame={f} fixed={beatIdx(sv, 238.56) % 2} x={600} /><Sprite id="o:O10_doya" frame={f} fixed={0} x={1400} /></>);
    if (sv < 250.42) return throne(240.36);
    // ---- Outro ----
    if (sv < 252.0) return (<><BG n={3} filter="sepia(0.3)" /><Sprite id="o:O03_palm_no" frame={f} fixed={0} x={1200} /><Sprite id="s:hero_deadpan" frame={f} fixed={0} x={600} /></>);
    if (sv < 253.92) return (<><BG n={3} filter="sepia(0.3)" /><Sprite id="o:O13_old_days" frame={f} fixed={1} x={1200} /><Sprite id="s:hero_deadpan" frame={f} fixed={0} x={600} /></>);
    if (sv < 257.24) return (<><BG n={3} zoom={1.8} ox={0.3} oy={0.5} /><Sprite id="s:hero_deadpan" frame={f} every={40} x={960} y={1700} scale={2.4} /></>);
    if (sv < 259.04) return (<><BG n={3} filter="sepia(0.3)" /><Sprite id="o:O03_palm_no" frame={f} fixed={1} x={1200} /><Sprite id="s:hero_deadpan" frame={f} fixed={0} x={600} /></>);
    if (sv < 263.58) return strikeScene(259.04);
    if (sv < 265.16) return (<><BG n={3} /><Sprite id="o:O10_doya" frame={f} fixed={0} x={960} /></>);
    if (sv < 269.42) return (<><BG n={3} zoom={1.6} oy={0.3} /><Sprite id="o:O10_doya" frame={f} fixed={sv < 266.4 ? 0 : 1} x={960} y={1500} scale={2.0} /></>);
    if (sv < 271.0) {
      const d = sv - 269.42;
      return (<><BG n={3} /><Sprite id="o:O14_swing_miss" frame={f} fixed={d < 0.35 ? 0 : d < 0.7 ? 1 : 2} x={960} /><Icon name="ball" size={70} x={snap(300 + d * 1400)} y={snap(560 - d * 60)} /></>);
    }
    return (<><BG n={3} /><Sprite id="o:O05_monkey_grin" frame={f} fixed={sv - 271.0 < 0.15 ? 1 : 2} x={960} y={1200} scale={1.6} /></>);
  };

  // ===== 寸劇の絵 =====
  const skitScene = (kk: number): React.ReactNode => {
    if (kk < 1.0) {
      return (
        <>
          <BG n={KACHO_DESK} zoom={1.3} oy={0.6} filter="grayscale(1)" />
          <Sprite id="o:O05_monkey_grin" frame={f} fixed={2} x={960} y={1180} scale={1.6} filter="grayscale(1)" />
        </>
      );
    }
    if (kk >= 18.9) {
      return (
        <>
          <BG n={KACHO_DESK} zoom={1.8} ox={0.3} oy={0.5} filter="brightness(0.8)" />
          <Sprite id="s:hero_deadpan" frame={f} every={40} x={960} y={1700} scale={2.4} />
        </>
      );
    }
    const buchoX = kk < 10.4 ? null : snap(2200 - clamp((kk - 10.4) / 1.1, 0, 1) * 700);
    let oji: React.ReactNode = <Sprite id="o:O08_chair_check" frame={f} fixed={2} x={1150} y={960} scale={1.1} />;
    if (kk >= 5.7 && kk < 11.7) oji = <Sprite id="o:O08_chair_check" frame={f} fixed={2} x={1050} y={960} scale={1.1} />;
    if (kk >= 11.7 && kk < 16.2) oji = <Sprite id="o:O15_toneup_greet" frame={f} fixed={0} x={900} hop={hopAt(kk, 11.7, 0.35, 70)} />;
    if (kk >= 16.2) oji = <Sprite id="o:O15_toneup_greet" frame={f} fixed={kk < 17.0 ? 1 : 0} x={900} hop={hopAt(kk, 17.0, 0.35, 90)} />;
    return (
      <>
        <BG n={KACHO_DESK} />
        {kk >= 5.7 && <Sprite id="o:H09_head_tilt" frame={f} fixed={kk < 6.2 ? 0 : 1} x={400} />}
        {oji}
        {buchoX !== null && <Sprite id={kk >= 13.9 && kk < 16.2 ? 'b:D03_chest_thump' : 'b:D01_idle'} frame={f} fixed={kk >= 13.9 && kk < 16.2 ? (kk < 14.4 ? 0 : 1) : 0} x={buchoX} />}
      </>
    );
  };

  // ===== 上に重ねる演出 =====
  const overlays = (): React.ReactNode => {
    const nodes: React.ReactNode[] = [];
    if (s === null || k !== null) return nodes;
    // タイトル画面
    if (sv < 4.5) {
      const blinkOn = Math.floor(f / 15) % 2 === 0;
      nodes.push(
        <div key="title" style={{ position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: PIXEL_FONT }}>
          <div style={{ fontSize: 46, color: CYAN, textShadow: '4px 4px 0 #000' }}>KEI-TORA GRAND PRIX</div>
          <div style={{ fontSize: 150, color: YELLOW, marginTop: 10, textShadow: '8px 8px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000' }}>軽トラのおじさん</div>
          <div style={{ fontSize: 48, marginTop: 70, textShadow: '4px 4px 0 #000', color: sv < 3.6 ? WHITE : YELLOW, opacity: sv < 3.6 ? (blinkOn ? 1 : 0) : Math.floor(f / 3) % 2 ? 1 : 0 }}>PUSH START</div>
          <div style={{ fontSize: 30, marginTop: 50, color: GREY }}>エントリー：1だい</div>
        </div>
      );
    } else if (sv < 6.2) {
      nodes.push(
        <AbsoluteFill key="course" style={{ background: '#000' }}>
          <Banner text="COURSE 1" color={WHITE} since={since(4.5)} top={380} size={110} />
          <Banner text="こうじょう しきち" color={YELLOW} since={since(4.8)} top={520} size={80} />
        </AbsoluteFill>
      );
    } else if (sv < 8.16) {
      // シグナル 3・2・1・GO
      const lit = [6.29, 6.71, 7.13].filter((x) => sv >= x).length;
      const go = sv >= 7.94;
      nodes.push(
        <div key="signal" style={{ position: 'absolute', left: 660, top: 140, width: 600, height: 200, background: '#111', border: '8px solid #fff', boxShadow: '0 0 0 6px #000', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 130, height: 130, borderRadius: 65, border: '6px solid #444', background: go ? GREEN : i < lit ? RED : '#333' }} />
          ))}
        </div>
      );
      if (go) nodes.push(<Banner key="go" text="GO!!" color={GREEN} since={6} top={420} size={200} />);
    }
    const B = (key: string, a: number, b: number, text: string, color = YELLOW, size = 86, top = 200) => {
      if (between(s, a, b)) nodes.push(<Banner key={key} text={text} color={color} since={since(a)} top={top} size={size} />);
    };
    B('erai', 10.4, 12.22, 'えらいひと が あらわれた！', ORANGE, 90);
    if (between(s, 14.88, 21.4)) {
      const n = Math.min(12, 1 + Math.floor((sv - 14.88) * 2));
      for (let i = 0; i < n; i++) {
        nodes.push(<div key={`ex${i}`} style={{ position: 'absolute', left: snap(200 + random(`ex${i}`) * 1500), top: snap(170 + random(`ey${i}`) * 450), fontFamily: PIXEL_FONT, fontSize: 110, color: i % 2 ? YELLOW : RED, textShadow: '6px 6px 0 #000' }}>！</div>);
      }
    }
    B('okotoba', 21.4, 23.0, 'おことば ×99', ORANGE, 120);
    B('claim', 23.0, 25.56, 'となりの ぶしょから クレーム！', RED);
    B('seigi', 29.74, 31.86, 'じしょう せいぎ +100', ORANGE, 100);
    B('jisho', 31.86, 34.7, 'じしょに「まちがい」の ページが ない', WHITE, 76);
    B('hikari', 36.82, 38.94, 'みすてる はやさ：ひかり', CYAN, 90);
    B('yokuasa', 40.6, 42.02, '― よくあさ ―', WHITE, 90);
    B('fuseikai', 43.4, 45.5, 'ブブー　ふせいかい', RED, 100);
    if (between(s, 45.5, 48.24)) nodes.push(<div key="batsu" style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: PIXEL_FONT, fontSize: 260, color: RED, textShadow: '10px 10px 0 #000' }}>✕</div>);
    B('nakama', 48.24, 50.4, 'さんせいは なかまに なった！', GREEN, 80);
    B('hajiki', 50.4, 52.02, 'はんたいは はじかれた！', RED, 80);
    B('saiten', 52.02, 56.4, 'さいてん きじゅん：おれ', ORANGE, 100);
    for (const b of BOOSTS) B(`boost${b}`, b, b + 2.4, 'アクセル ぜんかい！', ORANGE, 110, 230);
    if (between(s, 60.3, 62.68)) nodes.push(<Banner key="k45" text="おじさんは くびを 45°かしげた" color={WHITE} since={since(60.3)} top={200} size={80} />);
    if (between(s, 62.9, 64.5)) nodes.push(<Banner key="h45" text="しゅじんこうも 45°かしげかえした" color={YELLOW} since={since(62.9)} top={200} size={80} />);
    B('soto', 66.58, 69.26, 'そとづら モード', CYAN, 100);
    for (const [kg, hr, mt, en] of THRONES) {
      if (kg !== null) B(`king${kg}`, kg + 0.9, hr, 'KING OF うちべんけい', YELLOW, 110);
      B(`hero${hr}`, hr, mt, 'しょうごう『じしょう せいぎの ヒーロー』', ORANGE, 76);
      if (between(s, mt, en)) nodes.push(<Banner key={`muteki${mt}`} text="むてき！" color={WHITE} since={since(mt)} top={200} size={150} />);
    }
    B('shutter-t', 91.76, 93.52, 'ガラガラ ガッシャン！', GREY, 110, 380);
    if (between(s, 91.76, 93.52)) {
      const p = clamp((sv - 91.76) / 0.6, 0, 1);
      nodes.push(
        <div key="shutter" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: snap(p * 640, 8), backgroundImage: 'repeating-linear-gradient(180deg, #9aa0ad 0 36px, #5b616e 36px 44px)', borderBottom: '16px solid #333' }} />
      );
    }
    B('ink', 98.7, 100.3, 'インク ぎれ', RED, 100);
    B('horenso', 100.3, 101.92, 'ほうれんそう：つうしん けんがい', GREY, 80);
    if (between(s, 101.92, 103.7)) nodes.push(<div key="x2" style={{ position: 'absolute', left: 560, top: 380, fontFamily: PIXEL_FONT, fontSize: 220, color: RED, textShadow: '8px 8px 0 #000' }}>✕</div>);
    if (between(s, 103.7, 105.18)) nodes.push(<div key="hanamaru" style={{ position: 'absolute', left: 520, top: 360, width: 360, height: 360, borderRadius: 180, border: '22px solid #ff7fb8', boxShadow: '0 0 0 8px #000' }} />);
    B('kyujitsu', 105.18, 106.82, 'きゅうじつ しゅっきん ＝ せいぎ', ORANGE, 86);
    if (between(s, 111.6, 113.3)) nodes.push(<Banner key="4k" text="4K REMASTER" color={Math.floor(f / 4) % 2 ? YELLOW : WHITE} since={since(111.6)} top={200} size={140} />);
    B('kieta', 113.3, 115.08, 'さぎょうデータが きえた', RED, 90);
    B('kaikaku', 115.08, 118.08, 'おれが かいかく した！（※ほんにん しらべ）', ORANGE, 72);
    if (between(s, 121.46, 124.66)) {
      const n = Math.min(100, Math.floor((sv - 121.46) * 34) + 1);
      nodes.push(<Banner key="dame" text={`ダメだし ×${n}`} color={RED} since={6} top={200} size={120} />);
    }
    B('legend', 124.66, 128.06, 'でんせつ（じこしんこく）', YELLOW, 100);
    if (between(s, 130.14, 132.44)) {
      const items = ['ぜんさい：しゃちょうの わるぐち', 'スープ：しゃちょうの わるぐち', 'メイン：しゃちょうの わるぐち', 'デザート：しゃちょうの わるぐち'];
      const n = clamp(Math.floor((sv - 130.14) * 2.2) + 1, 1, 4);
      nodes.push(
        <Win key="course" style={{ left: 160, top: 170, width: 900, padding: '20px 30px', fontSize: 40, lineHeight: 1.5 }}>
          <div style={{ color: YELLOW, fontSize: 32 }}>本日の フルコース</div>
          {items.slice(0, n).map((x) => <div key={x}>{x}</div>)}
        </Win>
      );
    }
    B('item-e', 144.38, 145.98, 'アイテム『E』を てにいれた！', YELLOW, 86);
    if (between(s, 145.98, 147.64)) nodes.push(<Banner key="bd" text="B？　D？" color={WHITE} since={since(145.98)} top={240} size={130} />);
    B('dokan', 154.14, 155.96, 'ドカーン！　だめでした', RED, 110);
    B('kieta2', 160.82, 162.4, '― わすれたころ ―', GREY, 86);
    B('e-revive', 164.6, 166.66, 'Eが ふっかつ した！', YELLOW, 100);
    B('hantai', 176.5, 180.82, 'ぜんりょく はんたい！！', RED, 140, 160);
    B('shinpai', 182.82, 184.76, 'しんぱい（たてまえ）', GREY, 100);
    B('fukafuka', 189.36, 190.86, 'フカフカ ど：MAX', PINK, 100);
    B('isu', 190.86, 197.94, 'それ かちょうの いす！', RED, 120);
    // Verse4〜
    B('shirabe', 201.0, 202.8, '※ほんにん しらべ', GREY, 100);
    if (between(s, 202.8, 206.06)) {
      const lvl = sv < 204.5 ? 3 : 5;
      nodes.push(
        <Win key="tone" style={{ left: 760, top: 200, padding: '14px 26px', fontSize: 36, whiteSpace: 'nowrap' }}>
          <span>こえの たかさ　</span>
          {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ display: 'inline-block', width: 34, height: 26 + i * 8, marginRight: 6, background: i < lvl ? (i >= 4 ? RED : YELLOW) : '#333', border: '3px solid #fff', verticalAlign: 'bottom' }} />)}
          <span style={{ color: RED }}>{sv >= 204.5 ? '　うらごえ' : '　1トーン UP'}</span>
        </Win>
      );
    }
    B('karui', 209.78, 212.74, 'くちの かるさ：しゃない さいけいりょう', CYAN, 76);
    if (between(s, 213.3, 218.96)) {
      const r = ((sv - 213.3) * 300) % 200;
      nodes.push(
        <div key="radar" style={{ position: 'absolute', left: 1500, top: 260, width: 300, height: 300, borderRadius: 150, border: '8px solid #7dff9a', background: 'rgba(0,40,0,0.7)' }}>
          <div style={{ position: 'absolute', left: 150 - r / 2 - 4, top: 150 - r / 2 - 4, width: r, height: r, borderRadius: r, border: '6px solid #7dff9a' }} />
          <div style={{ position: 'absolute', left: 120, top: 100, fontFamily: PIXEL_FONT, fontSize: 60, color: RED }}>！</div>
        </div>
      );
      B('sensor', 214.72, 218.96, 'こうせいのう センサー（パワハラ せんよう）', GREEN, 66);
    }
    B('pika1', 221.14, 223.42, 'ピカーッ！', YELLOW, 150);
    B('rendou', 223.42, 224.88, 'かんじょう れんどう？', GREY, 90);
    B('mantan', 225.54, 228.7, 'しょうにん よっきゅう まんタン！', GREEN, 90);
    B('nobody', 233.0, 235.2, 'うしろには だれも いない', GREY, 90);
    B('entry', 233.6, 235.2, 'エントリー：1だい', YELLOW, 100, 330);
    B('iiotoko', 236.8, 238.56, 'ナルシスト ど：MAX', PINK, 90);
    B('strike1', 90.08, 91.76, 'STRIKE ONE!', CYAN, 150, 180);
    B('strike2', 159.32, 160.82, 'STRIKE TWO!!', CYAN, 150, 180);
    B('strike3', 259.04, 263.58, 'STRIKE THREE!!!', RED, 150, 180);
    B('pika2', 266.4, 269.42, 'ピカーッ！', YELLOW, 170);
    B('sanshin', 269.42, 271.0, 'さんしん！', RED, 150);
    if (between(s, 271.0, 272.5)) nodes.push(<Banner key="gameset" text="GAME SET" color={WHITE} since={since(271.0)} top={260} size={170} />);
    // ウッキー！のカットイン（サル顔＋ライト）
    for (const u of UKKI) {
      if (sv >= 197.9 && sv < 201.0) continue; // ラップ明けは画面ぜんたいでやる
      if (between(s, u, u + 0.55)) {
        const d = sv - u;
        const x = d < 0.08 ? 1920 : 1340;
        nodes.push(
          <div key={`ukki${u}`} style={{ position: 'absolute', left: x, top: 300, width: 520, height: 420, overflow: 'hidden', background: '#ffd23f', border: '10px solid #fff', boxShadow: '0 0 0 8px #000' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-conic-gradient(#ffb52e 0 10deg, #ffd23f 10deg 20deg)' }} />
            <Img src={src('o:O05_monkey_grin', d < 0.2 ? 1 : 2)} style={{ position: 'absolute', left: 260, top: 40, height: 1100, transform: 'translateX(-50%)', imageRendering: 'pixelated' }} />
            <div style={{ position: 'absolute', left: 20, bottom: 10, fontFamily: PIXEL_FONT, fontSize: 72, color: RED, textShadow: '5px 5px 0 #fff' }}>ウッキー！</div>
          </div>
        );
      }
    }
    return nodes;
  };

  // ===== 寸劇のメッセージ =====
  const skitNodes = (): React.ReactNode => {
    if (k === null) return null;
    const kf = (from: number) => Math.round((k - from) * fps);
    const nodes: React.ReactNode[] = [];
    if (k < 1.0) {
      nodes.push(
        <AbsoluteFill key="pit" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <Banner text="― ピットイン ―" color={YELLOW} since={kf(0.1)} top={380} size={110} />
          <Banner text="『かちょうの いす』" color={WHITE} since={kf(0.3)} top={530} size={80} />
        </AbsoluteFill>
      );
      return nodes;
    }
    type M = { text: string; name?: string; color?: string; tag?: string };
    const O = { name: 'おじさん', color: ORANGE, tag: '#7a3b00' };
    const Bu = { name: '部長', color: '#ffb080', tag: '#5a2a00' };
    const Hh = { name: '主人公', color: YELLOW, tag: '#7a6400' };
    const msgs: Array<[number, number, M]> = [
      [1.0, 5.2, { text: '「うん。この椅子、俺のほうが似合うな」', ...O }],
      [5.2, 5.7, { text: 'おじさんは かちょうの いすを てにいれた！', color: GREEN }],
      [5.7, 9.6, { text: '「課長、あした退院だそうです」', ...Hh }],
      [9.6, 10.4, { text: 'しかし きこえて いない！', color: PINK }],
      [10.4, 11.7, { text: 'ぶちょう が あらわれた！', color: WHITE }],
      [11.7, 13.9, { text: '「部長！おつかれさまですっ！」', ...O }],
      [13.9, 16.2, { text: '「おう！絶好調か！」', ...Bu }],
      [16.2, 18.9, { text: '「はいっ！絶好調でありますっ！」', ...O }],
      [18.9, 20.7, { text: '「……声、高っ」', ...Hh }],
    ];
    for (const [a, b, m] of msgs) {
      if (k >= a && k < b) nodes.push(<MessageBox key="m" text={m.text} name={m.name} color={m.color} tagColor={m.tag} sinceStart={kf(a)} speed={2} frame={f} />);
    }
    if (k >= 5.2 && k < 5.9) nodes.push(<Icon key="chair" name="chair" size={160} x={1150} y={snap(300 - (k - 5.2) * 100)} />);
    if (k >= 9.6 && k < 10.4) nodes.push(<Banner key="bubu" text="ブブー" color={RED} since={kf(9.6)} top={200} size={130} />);
    if (k >= 13.5 && k < 15.0) nodes.push(<Banner key="t1" text="こえが 1トーン あがった！" color={CYAN} since={kf(13.5)} top={200} size={86} />);
    if (k >= 18.6 && k < 18.9) nodes.push(<Banner key="t2" text="さらに あがった！" color={RED} since={6} top={200} size={100} />);
    return nodes;
  };

  // ===== 歌詞 =====
  let lyricNode: React.ReactNode = null;
  if (line && s !== null && k === null && sv >= 8.0 && !inEnding) {
    const sp = speakerOf(line.text);
    const speed = Math.max(1, Math.min(3, Math.floor((lineHold * fps * 0.55) / Array.from(line.text).length)));
    lyricNode = <MessageBox text={line.text} name={sp.name} color={sp.color} tagColor={sp.tag} sinceStart={lineFrame} speed={speed} frame={f} big={sp.big} shake={{ x: shakeX * 0.5, y: shakeY * 0.5 }} />;
  }

  // ===== エンディング（リザルト → NEXT RACE：あした → また軽トラが入ってくる） =====
  let endNode: React.ReactNode = null;
  if (inEnding) {
    const e = post !== null ? SONG_LEN - ENDING + post : sv - ENDING;
    const row = (label: string, value: string, color: string, at: number) =>
      e > at ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: 1100, margin: '0 auto', fontSize: 60 }}>
          <span>{label}</span>
          <span style={{ color }}>{value}</span>
        </div>
      ) : null;
    endNode = (
      <AbsoluteFill style={{ background: '#000' }}>
        {e < 6.0 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: PIXEL_FONT, color: WHITE }}>
            {e > 0.2 && <div style={{ fontSize: 90, color: YELLOW, marginBottom: 50, textShadow: '8px 8px 0 #333' }}>RESULT</div>}
            {row('じゅんい', '1 / 1（エントリー1だい）', YELLOW, 0.8)}
            {row('STRIKE', '3（さんしん）', RED, 1.4)}
            {row('ベストラップ', '※ほんにん しらべ', CYAN, 2.0)}
            {row('ごきげん', 'まんタン', GREEN, 2.6)}
            {e > 3.6 && <div style={{ fontSize: 80, color: CYAN, marginTop: 70 }}>NEXT RACE：あした</div>}
          </div>
        ) : e < 8.4 ? (
          <>
            <BG n={1} filter={`brightness(${clamp((e - 6.0) / 0.6, 0, 1) * 0.95})`} />
            <Sprite id="o:V02_truck_side_drive" frame={f} every={3} fixed={e > 7.8 ? 0 : undefined} x={snap(-500 + Math.min(e - 6.0, 1.8) * 800)} y={960} />
            {e > 7.4 && <Banner text="また きた…" color={WHITE} since={Math.round((e - 7.4) * fps)} top={220} size={90} />}
          </>
        ) : (
          <>
            {/* 最後はミラー越しに にやっ */}
            <BG n={1} zoom={1.4} oy={0.6} filter="blur(3px) brightness(0.85)" />
            <AbsoluteFill style={{ transform: `scale(${1 + snap(clamp((e - 8.4) / 3.0, 0, 1) * 16, 1) / 100})`, transformOrigin: '50% 45%' }}>
              <Sprite id="o:V04_mirror_closeup" frame={f} fixed={e < 9.4 ? 0 : 1} x={1010} y={1060} scale={1.35} />
            </AbsoluteFill>
            {e >= 9.4 && e < 9.55 && <AbsoluteFill style={{ background: '#fff', opacity: 0.7 }} />}
          </>
        )}
      </AbsoluteFill>
    );
  }

  const isIntro = s !== null && sv < 8.16;
  const showHud = !isIntro && !inEnding && !(k !== null && k < 1.0) && tape === null;
  const strikeBlink = STRIKES.some((x) => between(s, x, x + 2.0)) || between(s, 259.04, 272.5);
  const posBlink = between(s, 233.0, 235.2);
  const boostNow = BOOSTS.some((b) => between(s, b, b + 3.2));
  const speedKmh = Math.round(boostNow ? 999 : 120 + Math.abs(Math.sin(sv * 0.7)) * 60);
  const sceneNode = k !== null ? skitScene(k) : s !== null && t >= TAPE_START + TAPE + SKIT ? scene2() : scene();
  const tapeFilter = tape !== null ? `grayscale(${tape}) brightness(${1 - tape * 0.4})` : undefined;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px)`, filter: tapeFilter }}>{sceneNode}</AbsoluteFill>
      {showHud && <Hud frame={f} s={k !== null ? CUT : sv} posBlink={posBlink} strikes={k !== null ? 2 : strikeCount(sv)} strikeBlink={strikeBlink} gokigen={k !== null ? 5 : gokigenAt(sv)} speed={k !== null ? 0 : speedKmh} />}
      {tape === null && overlays()}
      {skitNodes()}
      {tape === null && lyricNode}
      {endNode}
      <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 4px)' }} />
      <AbsoluteFill style={{ background: '#fff', opacity: k === null && tape === null ? flash : 0 }} />
      <AbsoluteFill style={{ background: '#000', opacity: frame > durationInFrames - 15 ? 1 : 0 }} />
      <Audio src={staticFile(AUDIO_FILE)} />
    </AbsoluteFill>
  );
};
