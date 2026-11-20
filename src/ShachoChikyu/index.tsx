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
import { parseLrc } from '../utils/lrc-parser';

// 社長、ここは地球です
// スーファミの格ゲー風ドット絵 × カクカク動くリリックモーション。
// 設定・進め方は mv/社長ここは地球です/制作メモ.md を参照。

const LRC_FILE = 'lyrics/shacho-chikyu.lrc';
const AUDIO_FILE = 'music/shacho-chikyu.mp3';
const P = (name: string) => staticFile(`photo/shacho/${name}`);

export const SHACHO_CHIKYU_DURATION = 6530; // 217.6s @30fps

type Section = 'intro' | 'v1' | 'pre1' | 'ch1' | 'v2' | 'pre2' | 'ch2' | 'v3' | 'break' | 'final' | 'quiet' | 'outro';

// セクションの区切り（秒）。LRCのタイミングに合わせてある。
const sections: Array<{ start: number; end: number; type: Section }> = [
  { start: 0, end: 7.3, type: 'intro' },
  { start: 7.3, end: 21, type: 'v1' },
  { start: 21, end: 34.4, type: 'pre1' },
  { start: 34.4, end: 60.8, type: 'ch1' },
  { start: 60.8, end: 81, type: 'v2' },
  { start: 81, end: 94.3, type: 'pre2' },
  { start: 94.3, end: 121, type: 'ch2' },
  { start: 121, end: 150.9, type: 'v3' },
  { start: 150.9, end: 172.6, type: 'break' },
  { start: 172.6, end: 205.6, type: 'final' },
  { start: 205.6, end: 208.8, type: 'quiet' },
  { start: 208.8, end: 999, type: 'outro' },
];
const sectionAt = (t: number) => (sections.find((s) => t >= s.start && t < s.end) ?? sections[0]);

// ラウンド表示
const banners: Array<{ at: number; text: string; sub?: string }> = [
  { at: 7.3, text: 'ROUND 1', sub: 'FIGHT!' },
  { at: 60.8, text: 'ROUND 2', sub: 'FIGHT!' },
  { at: 121, text: 'ROUND 3', sub: 'FIGHT!' },
];

const PIXEL_FONT = "'DotGothic16', monospace";
const YELLOW = '#ffd23f';
const PINK = '#ff6fb5';
const CYAN = '#5fe3ff';
const WHITE = '#fffaf0';

// ---- カクカク用のヘルパー ----
const step = (frame: number, n: number) => Math.floor(frame / n) * n; // nフレームごとに止める
const snap = (v: number, px = 4) => Math.round(v / px) * px; // 位置をドット単位にそろえる

const loadFont = async () => {
  const font = new FontFace('DotGothic16', `url(${staticFile('fonts/DotGothic16.ttf')}) format('truetype')`);
  const loaded = await font.load();
  document.fonts.add(loaded);
};
const isAbortError = (err: unknown) => err instanceof DOMException && err.name === 'AbortError';
const isLatin = (text: string) => /^[\x20-\x7E—…]+$/.test(text);

// ---- スプライト（カクカク上下に揺れるキャラ） ----
const Sprite: React.FC<{
  src: string;
  frame: number;
  x: number; // 足元の中心X
  height: number;
  bobEvery?: number; // 何フレームごとに上下するか
  bob?: number;
  flip?: boolean;
  rotate?: number;
  y?: number; // 足元のY
  filter?: string;
}> = ({ src, frame, x, height, bobEvery = 8, bob = 8, flip = false, rotate = 0, y = 890, filter }) => {
  const up = Math.floor(frame / bobEvery) % 2 === 0 ? 0 : -bob;
  return (
    <Img
      src={src}
      style={{
        position: 'absolute',
        left: snap(x),
        top: snap(y + up),
        height,
        transform: `translate(-50%, -100%) scaleX(${flip ? -1 : 1}) rotate(${rotate}deg)`,
        transformOrigin: '50% 50%',
        imageRendering: 'pixelated',
        filter: `drop-shadow(0 8px 0 rgba(0,0,0,0.35)) ${filter ?? ''}`,
      }}
    />
  );
};

// ---- 体力ゲージ（格ゲー風HUD） ----
const Hud: React.FC<{ t: number; hitsPassed: number }> = ({ t, hitsPassed }) => {
  let genba = Math.max(12, 100 - hitsPassed * 6);
  if (t > 189.5) genba = Math.max(genba, 55); // 「なんとかみんなで回してます」でちょっと回復
  const timer = Math.max(0, Math.min(99, Math.floor(217.6 - t)));
  const bar = (pct: number, right: boolean, color: string) => (
    <div style={{ width: 720, height: 44, background: '#2a0d12', border: '6px solid #fff', boxShadow: '0 0 0 4px #000', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          [right ? 'left' : 'right']: 0,
          width: `${snap(pct, 4)}%`,
          background: color,
          boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.25)',
        }}
      />
    </div>
  );
  return (
    <div style={{ position: 'absolute', top: 34, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 28, fontFamily: PIXEL_FONT }}>
      <div>
        {bar(genba, false, YELLOW)}
        <div style={{ color: WHITE, fontSize: 34, marginTop: 8, textShadow: '4px 4px 0 #000' }}>現場</div>
      </div>
      <div style={{ color: WHITE, fontSize: 76, lineHeight: '64px', textShadow: '5px 5px 0 #000', width: 110, textAlign: 'center' }}>
        {String(timer).padStart(2, '0')}
      </div>
      <div style={{ textAlign: 'right' }}>
        {bar(100, true, YELLOW)}
        <div style={{ color: WHITE, fontSize: 34, marginTop: 8, textShadow: '4px 4px 0 #000' }}>社長</div>
      </div>
    </div>
  );
};

// ---- フキフキ（ロボを雑巾で拭く） ----
// 泡・キラキラ・擬音。cx はロボの中心X、textX は擬音の位置
const Wipe: React.FC<{ frame: number; shine: boolean; cx: number; textX: number; tilt: number }> = ({ frame, shine, cx, textX, tilt }) => {
  const word = Math.floor(frame / 8) % 2 ? 'フキフキ' : 'フキッ';
  return (
    <>
      {/* 泡 */}
      {new Array(5).fill(0).map((_, i) => {
        const bk = Math.floor(frame / 6) + i * 7;
        return (
          <Img
            key={`b${i}`}
            src={P('bubble.png')}
            style={{
              position: 'absolute',
              left: snap(cx - 180 + random(`bx${bk}`) * 360),
              top: snap(280 + random(`by${bk}`) * 340 - (frame % 6) * 4),
              width: 24 + Math.floor(random(`bs${bk}`) * 3) * 12,
              imageRendering: 'pixelated',
            }}
          />
        );
      })}
      {/* キラキラ */}
      {new Array(shine ? 8 : 3).fill(0).map((_, i) => {
        const sk = Math.floor(frame / 5) + i * 13;
        return (
          <Img
            key={`s${i}`}
            src={P('sparkle.png')}
            style={{
              position: 'absolute',
              left: snap(cx - 220 + random(`sx${sk}`) * 440),
              top: snap(250 + random(`sy${sk}`) * 420),
              width: shine ? 96 : 56,
              imageRendering: 'pixelated',
            }}
          />
        );
      })}
      {/* 擬音 */}
      <div
        style={{
          position: 'absolute',
          left: textX,
          top: 230 + (Math.floor(frame / 8) % 2) * 16,
          fontFamily: PIXEL_FONT,
          fontSize: shine ? 110 : 84,
          color: shine ? YELLOW : CYAN,
          transform: `rotate(${shine ? 0 : (Math.floor(frame / 4) % 2 ? -1 : 1) * tilt}deg)`,
          textShadow: '6px 6px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000',
          whiteSpace: 'nowrap',
        }}
      >
        {shine ? 'ピカーン!' : word}
      </div>
    </>
  );
};

export const ShachoChikyu: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [lrcContent, setLrcContent] = useState<string | null>(null);
  const [fontHandle] = useState(() => delayRender('shacho-font'));

  useEffect(() => {
    loadFont()
      .catch((err) => console.error('Failed to load font:', err))
      .finally(() => continueRender(fontHandle));
  }, [fontHandle]);

  useEffect(() => {
    const controller = new AbortController();
    const handle = delayRender('shacho-lrc');
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
  const sec = sectionAt(t);
  const S = sec.type;

  // ---- 今の歌詞 ----
  const idx = lyrics.findIndex((l, i) => l.time <= t && (!lyrics[i + 1] || lyrics[i + 1].time > t));
  const line = idx >= 0 ? lyrics[idx] : null;
  const next = idx >= 0 ? lyrics[idx + 1] : null;
  const lineFrame = line ? frame - Math.round(line.time * fps) : 0;

  // 画面を揺らすタイミング：サビの「社長　ここは地球です」、ブレイクの全部の行
  const hitTimes = useMemo(
    () =>
      lyrics
        .filter((l) => {
          const s = sectionAt(l.time).type;
          return s === 'break' || (l.text.startsWith('社長') && !l.text.startsWith('社長を'));
        })
        .map((l) => l.time),
    [lyrics]
  );
  const lastHit = [...hitTimes].reverse().find((h) => h <= t);
  const sinceHit = lastHit !== undefined ? (t - lastHit) * fps : 999;
  const shaking = sinceHit < 8 && S !== 'intro' && S !== 'outro';
  const shakeX = shaking ? snap((random(`sx${step(frame, 2)}`) - 0.5) * 36, 8) : 0;
  const shakeY = shaking ? snap((random(`sy${step(frame, 2)}`) - 0.5) * 24, 8) : 0;
  const hitsPassed = hitTimes.filter((h) => h <= t).length;

  // 画面切り替えの白フラッシュ（カクッと2段階で消える）
  const flashAt = [7.3, 150.9, 172.6, 208.8];
  const sinceFlash = Math.min(...flashAt.map((f) => (t >= f ? (t - f) * fps : 999)));
  const flash = sinceFlash < 3 ? 1 : sinceFlash < 6 ? 0.5 : 0;

  // ---- 背景 ----
  const bgFor: Partial<Record<Section, string>> = {
    v1: 'bg_dawn.png',
    pre1: 'bg_day.png',
    ch1: 'bg_day.png',
    v2: 'bg_day.png',
    pre2: 'bg_dawn.png',
    ch2: 'bg_night.png',
    v3: 'bg_day.png',
    break: 'bg_space.png',
    final: 'bg_sunset.png',
    quiet: 'bg_sunset.png',
  };
  const onPaper = S === 'intro' || S === 'outro';

  // ---- 紙の上のクレヨン地球（イントロ／アウトロ） ----
  const globeLayer = () => {
    const boil = Math.floor(frame / 3) % 3; // 線がブルブル
    const rot = step(frame, 4) * 7.5; // 4フレームごとに30°ずつ
    const jx = snap((random(`gx${step(frame, 3)}`) - 0.5) * 6, 2);
    const jy = snap((random(`gy${step(frame, 3)}`) - 0.5) * 6, 2);
    // イントロの最後（6.8秒〜）はドット絵になってから切り替わる
    const pixel = S === 'intro' && t > 6.8;
    const src = pixel ? P('globe_pixel.png') : S === 'outro' ? P(`globe_bolt_boil${boil}.png`) : P(`globe_boil${boil}.png`);
    const size = S === 'outro' ? 560 : 600;
    return (
      <AbsoluteFill style={{ background: '#f3eee2' }}>
        <AbsoluteFill
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(120,100,80,0.10) 0 1px, transparent 1px), radial-gradient(circle, rgba(255,255,255,0.5) 0 1px, transparent 1px)',
            backgroundSize: '6px 6px, 9px 9px',
          }}
        />
        <Img
          src={src}
          style={{
            position: 'absolute',
            left: 960 - size / 2 + jx,
            top: (S === 'outro' ? 400 : 500) - size / 2 + jy,
            width: size,
            transform: `rotate(${rot}deg)`,
            imageRendering: pixel ? 'pixelated' : 'auto',
          }}
        />
      </AbsoluteFill>
    );
  };

  // ---- ステージのキャラ配置 ----
  const actors = () => {
    const f = frame;
    switch (S) {
      case 'v1':
        return (
          <>
            <Sprite src={P('hero.png')} frame={f} x={420} height={520} bobEvery={12} bob={4} />
            <Sprite src={P('boss.png')} frame={f} x={1340} height={640} bobEvery={8} bob={8} />
          </>
        );
      case 'pre1':
        return (
          <>
            <Sprite src={P('hero.png')} frame={f} x={300} height={470} bobEvery={12} bob={4} />
            <Sprite src={P('boss.png')} frame={f} x={1060} height={760} bobEvery={6} bob={12} />
          </>
        );
      case 'ch1':
      case 'ch2': {
        const big = 780;
        return (
          <>
            {S === 'ch1' ? (
              <Sprite src={P('boss.png')} frame={f} x={1520} height={500} bobEvery={8} bob={4} />
            ) : (
              <Sprite src={P('robot_r.png')} frame={f} x={1500} height={520} bobEvery={6} bob={8} />
            )}
            <Sprite src={P('hero.png')} frame={f} x={760} height={big} bobEvery={4} bob={12} />
          </>
        );
      }
      case 'v2': {
        const error = t > 67.8 && t < 74.6 && Math.floor(f / 4) % 2 === 0;
        // フキフキ1回目「気づけば二人で面倒見てる」：ロボの左から右向きで拭く
        const wipe1 = t > 66.2 && t < 67.8;
        // フキフキ2回目「……その機械の世話 誰がしてると思ってます？」：反対側から左向きで拭く
        const wipe2 = t > 77.5 && t < 81;
        const shine = t > 80.2 && t < 81; // 最後にピカーン
        const wf = Math.floor(f / 4) % 4; // 4フレームごとに腕が動く（上→横→下→戻す）
        const robotFilter = error ? 'sepia(1) saturate(6) hue-rotate(-40deg) brightness(0.9)' : shine ? 'brightness(1.35)' : undefined;
        if (wipe1) {
          return (
            <>
              <Sprite src={P('robot.png')} frame={f} x={1260} height={640} bobEvery={99999} bob={0} filter={robotFilter} />
              <Sprite src={P(`hero_wipe${wf}.png`)} frame={f} x={990} height={560} bobEvery={99999} bob={0} />
              <Wipe frame={f} shine={false} cx={1240} textX={1460} tilt={8} />
            </>
          );
        }
        if (wipe2) {
          return (
            <>
              <Sprite src={P('robot_r.png')} frame={f} x={1000} height={640} bobEvery={99999} bob={0} filter={robotFilter} />
              <Sprite src={P(`hero_wipe_left${wf}.png`)} frame={f} x={1290} height={560} bobEvery={99999} bob={0} />
              <Wipe frame={f} shine={shine} cx={1020} textX={shine ? 300 : 360} tilt={8} />
            </>
          );
        }
        return (
          <>
            <Sprite src={P('robot.png')} frame={f} x={1260} height={640} bobEvery={6} bob={6} filter={robotFilter} />
            <Sprite src={P('hero.png')} frame={f} x={380} height={540} bobEvery={t > 67.8 && t < 74.6 ? 3 : 12} bob={6} />
          </>
        );
      }
      case 'pre2': {
        // 「今日も機械を叩いてます」でポカポカ叩きに行く
        const smack = t > 90.9;
        const hx = smack ? 820 + (Math.floor(f / 4) % 2) * 60 : 420;
        return (
          <>
            <Sprite src={P('robot.png')} frame={f} x={1260} height={620} bobEvery={smack ? 4 : 10} bob={smack ? 10 : 4} rotate={smack ? (Math.floor(f / 4) % 2 ? -4 : 4) : 0} />
            <Sprite src={P('hero.png')} frame={f} x={hx} height={540} bobEvery={smack ? 4 : 12} bob={6} />
          </>
        );
      }
      case 'v3': {
        // 「迷子なんですか」あたりで社長がキョロキョロ（左右反転）
        const lost = t > 133 && t < 141;
        const flip = lost ? Math.floor(f / 10) % 2 === 0 : false;
        return (
          <>
            <Sprite src={P('hero.png')} frame={f} x={360} height={500} bobEvery={12} bob={4} />
            <Sprite src={P('boss.png')} frame={f} x={1220} height={680} bobEvery={lost ? 5 : 8} bob={8} flip={flip} />
          </>
        );
      }
      case 'break': {
        const rot = step(f, 4) * 5; // 宇宙で社長がカクカク回る
        const point = t > 167.8;
        return (
          <>
            <Img
              src={P('globe_pixel.png')}
              style={{ position: 'absolute', left: 1180, top: 160, width: 820, transform: `rotate(${-step(f, 6) * 2.5}deg)`, imageRendering: 'pixelated' }}
            />
            <Sprite src={P('boss.png')} frame={f} x={1340} y={snap(560 + Math.sin(step(f, 6) / 12) * 60)} height={440} rotate={rot} bobEvery={6} bob={0} />
            <Sprite src={P('hero.png')} frame={f} x={point ? 560 : 420} height={point ? 760 : 600} y={1000} bobEvery={4} bob={10} />
          </>
        );
      }
      case 'final':
        return (
          <>
            <Sprite src={P('robot.png')} frame={f} x={1480} height={560} bobEvery={8} bob={8} />
            <Sprite src={P('boss.png')} frame={f + 4} x={1040} height={620} bobEvery={8} bob={8} />
            <Sprite src={P('hero.png')} frame={f} x={540} height={640} bobEvery={8} bob={8} />
          </>
        );
      case 'quiet':
        return (
          <>
            <Sprite src={P('boss.png')} frame={f} x={1420} height={420} bobEvery={16} bob={4} />
            <Sprite src={P('hero.png')} frame={f} x={620} height={560} bobEvery={20} bob={4} />
          </>
        );
      default:
        return null;
    }
  };

  // ---- 歌詞 ----
  let lyricNode: React.ReactNode = null;
  if (line) {
    const lineSec = sectionAt(line.time).type;
    const hold = next ? next.time - line.time : 4;
    const fadeOut = !next && lineFrame > hold * fps;
    const isChorusHook = line.text.startsWith('社長');
    const latin = isLatin(line.text);

    if (lineSec === 'break') {
      // ブレイク：画面のまんなかに叩きつける
      const colors = [YELLOW, PINK, CYAN, WHITE];
      const color = colors[idx % colors.length];
      const len = Array.from(line.text).length;
      const base = Math.min(200, 1300 / Math.max(4, len * (latin ? 0.62 : 1)));
      const scale = lineFrame < 2 ? 1.6 : lineFrame < 4 ? 1.2 : 1;
      lyricNode = (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 120 }}>
          <div
            style={{
              fontFamily: PIXEL_FONT,
              fontSize: base,
              color,
              whiteSpace: 'nowrap',
              transform: `scale(${scale}) rotate(${(idx % 2 ? 1 : -1) * 3}deg)`,
              textShadow: '8px 8px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000',
            }}
          >
            {line.text}
          </div>
        </AbsoluteFill>
      );
    } else if (!fadeOut) {
      // ふつうの行：RPGみたいなメッセージウィンドウに1文字ずつ出す
      const chars = Array.from(line.text);
      const speed = Math.max(1, Math.min(3, Math.floor((hold * fps * 0.6) / chars.length)));
      const shown = Math.min(chars.length, Math.floor(lineFrame / speed) + 1);
      // 「まあ……社長は今日も 社長をやってるな」は現場の心の声
      const innerVoice = line.text.startsWith('「まあ') || line.text.startsWith('社長をやってるな');
      const quoted = line.text.includes('「') && !innerVoice;
      const name = innerVoice ? '心の声' : quoted ? '社長' : latin ? 'ALL' : isChorusHook ? '現場一同' : '現場';
      const color = innerVoice ? '#c9c2ff' : isChorusHook ? YELLOW : quoted ? CYAN : latin ? PINK : WHITE;
      const fontSize = Math.min(isChorusHook ? 92 : 72, 1560 / Math.max(6, chars.length * (latin ? 0.55 : 1)));
      const blink = Math.floor(frame / 8) % 2 === 0;
      const boxIn = lineFrame < 2 && (idx === 0 || sectionAt(lyrics[idx - 1].time).type !== lineSec) ? 0.6 : 1;
      lyricNode = (
        <div
          style={{
            position: 'absolute',
            left: 120,
            right: 120,
            bottom: 40,
            height: 200,
            background: 'rgba(10,12,40,0.92)',
            border: '8px solid #fff',
            boxShadow: '0 0 0 6px #000, inset 0 0 0 6px #1d2a8a',
            transform: `translate(${shakeX * 0.5}px, ${shakeY * 0.5}px) scaleY(${boxIn})`,
            fontFamily: PIXEL_FONT,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -40,
              left: 30,
              padding: '2px 22px',
              background: quoted ? '#0b5c74' : isChorusHook ? '#7a4b00' : '#3b1a6b',
              border: '6px solid #fff',
              boxShadow: '0 0 0 4px #000',
              color: WHITE,
              fontSize: 34,
            }}
          >
            {name}
          </div>
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
              letterSpacing: latin ? '0.02em' : '0.06em',
              textShadow: '5px 5px 0 #000',
            }}
          >
            {chars.slice(0, shown).join('')}
          </div>
          {shown >= chars.length && blink && (
            <div style={{ position: 'absolute', right: 34, bottom: 14, color: WHITE, fontSize: 34 }}>▼</div>
          )}
        </div>
      );
    }
  }

  // ---- タイトル（イントロ） ----
  const titleNode =
    S === 'intro' && t < 6.8 ? (
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 70,
          textAlign: 'center',
          fontFamily: PIXEL_FONT,
          fontSize: 96,
          color: '#1b1b2a',
          letterSpacing: '0.08em',
          textShadow: `6px 6px 0 ${[PINK, CYAN, YELLOW][Math.floor(frame / 6) % 3]}`,
          transform: `translate(${snap((random(`tt${step(frame, 3)}`) - 0.5) * 6, 2)}px, 0)`,
          opacity: t < 0.5 ? 0 : 1,
        }}
      >
        社長、ここは地球です
      </div>
    ) : null;

  // ---- ラウンド表示 ----
  const banner = banners.find((b) => t >= b.at && t < b.at + 2.2);
  let bannerNode: React.ReactNode = null;
  if (banner) {
    const bf = frame - Math.round(banner.at * fps);
    const x = bf < 4 ? -1400 : bf < 8 ? -300 : 0; // カクッ、カクッと入ってくる
    const showSub = banner.sub && bf > 34;
    bannerNode = (
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 220 }}>
        <div
          style={{
            fontFamily: PIXEL_FONT,
            fontSize: showSub ? 200 : 160,
            color: showSub ? '#ff4a3d' : YELLOW,
            transform: `translateX(${x}px)`,
            textShadow: '10px 10px 0 #000, -5px -5px 0 #000, 5px -5px 0 #000, -5px 5px 0 #000',
            letterSpacing: '0.06em',
          }}
        >
          {showSub ? banner.sub : banner.text}
        </div>
      </AbsoluteFill>
    );
  }

  // ---- エンディング ----
  const endNode =
    t > 215.2 ? (
      <AbsoluteFill style={{ background: '#f3eee2', alignItems: 'center', justifyContent: 'center', opacity: t > 215.6 ? 1 : 0.5 }}>
        <div style={{ fontFamily: PIXEL_FONT, fontSize: 64, color: '#1b1b2a', textShadow: `4px 4px 0 ${PINK}` }}>TO BE CONTINUED…</div>
      </AbsoluteFill>
    ) : null;

  const bg = bgFor[S];

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      {onPaper ? (
        globeLayer()
      ) : (
        <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>
          {bg && (
            <Img
              src={P(bg)}
              style={{
                position: 'absolute',
                left: -40,
                top: -40,
                width: 2000,
                height: 1120,
                imageRendering: 'pixelated',
              }}
            />
          )}
          {actors()}
        </AbsoluteFill>
      )}

      {!onPaper && <Hud t={t} hitsPassed={hitsPassed} />}
      {titleNode}
      {bannerNode}
      {lyricNode}
      {endNode}

      {/* ブラウン管っぽい走査線 */}
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 4px)',
          opacity: onPaper ? 0.25 : 1,
        }}
      />
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
      <AbsoluteFill style={{ background: '#000', opacity: frame > durationInFrames - 20 ? 1 : 0 }} />

      <Audio src={staticFile(AUDIO_FILE)} />
    </AbsoluteFill>
  );
};
