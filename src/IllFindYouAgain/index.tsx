import React, { useEffect, useMemo, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  continueRender,
  delayRender,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { parseLrc } from '../utils/lrc-parser';

// I'll find you again / 六ツ扉
// 横書き・くすんだ金の明朝体を、絵の右側（暗い夜空）に置くリリックモーション。

const LRC_FILE = 'lyrics/IllFindYouAgain.lrc';
const AUDIO_FILE = 'music/IllFindYouAgain.mp3';
const IMAGE_FILE = 'photo/IllFindYouAgain/bg.png';

export const ILL_FIND_YOU_AGAIN_DURATION = 8760; // 292s @30fps

const GOLD = '#e3c37a';
const GOLD_DIM = 'rgba(227,195,122,0.55)';

type Section = 'intro' | 'verse' | 'pre' | 'chorus' | 'breakdown' | 'bridge' | 'final' | 'outro' | 'inter';

// セクションの区切り（秒）。LRCのタイミングに合わせてある。
const sections: Array<{ start: number; end: number; type: Section }> = [
  { start: 0, end: 23.2, type: 'intro' },
  { start: 23.2, end: 49.0, type: 'verse' },
  { start: 49.0, end: 61.6, type: 'pre' },
  { start: 61.6, end: 88.0, type: 'chorus' },
  { start: 88.0, end: 99.5, type: 'inter' },
  { start: 99.5, end: 125.0, type: 'verse' },
  { start: 125.0, end: 137.7, type: 'pre' },
  { start: 137.7, end: 163.1, type: 'chorus' },
  { start: 163.1, end: 189.5, type: 'breakdown' },
  { start: 189.5, end: 221.7, type: 'bridge' },
  { start: 221.7, end: 259.8, type: 'final' },
  { start: 259.8, end: 999, type: 'outro' },
];

const sectionAt = (t: number): Section => (sections.find((s) => t >= s.start && t < s.end) ?? sections[0]).type;

// 画面を揺らす・光らせるタイミング（サビ頭、ブレイクダウンの叩きつけなど）
const hitTimes = [
  61.86, 137.96, 163.3, 164.5, 165.3, 166.7, 167.5, 168.3, 169.55, 170.86, 172.0, 174.17, 175.0, 221.96,
];

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const loadFonts = async () => {
  const fonts = [
    new FontFace('Genkai Mincho', `url(${staticFile('fonts/GenkaiMincho.ttf')}) format('truetype')`),
    new FontFace('Toro Glitch Mincho', `url(${staticFile('fonts/ToroNoGlitchMinchoH3.otf')}) format('opentype')`),
  ];
  await Promise.all(
    fonts.map(async (font) => {
      const loaded = await font.load();
      document.fonts.add(loaded);
    })
  );
};

const isAbortError = (err: unknown) => err instanceof DOMException && err.name === 'AbortError';
const isLatin = (text: string) => /^[\x20-\x7E]+$/.test(text);

// 文字幅のざっくり見積もり（em単位）
const textWidthEm = (text: string, letterSpacing: number) =>
  Array.from(text).reduce((w, c) => {
    if (c === ' ') return w + 0.35 + letterSpacing;
    if (/[A-Z]/.test(c)) return w + 0.74 + letterSpacing;
    if (/[\x21-\x7E]/.test(c)) return w + 0.5 + letterSpacing;
    return w + 1 + letterSpacing;
  }, 0);

const SandParticles: React.FC<{ frame: number; intensity: number }> = ({ frame, intensity }) => {
  const particles = useMemo(
    () =>
      new Array(90).fill(0).map((_, i) => ({
        x: random(`x${i}`) * 1920,
        y: random(`y${i}`) * 1080,
        size: 1 + random(`s${i}`) * 3.2,
        speed: 0.25 + random(`v${i}`) * 0.9,
        phase: random(`p${i}`) * Math.PI * 2,
        alpha: 0.15 + random(`a${i}`) * 0.5,
      })),
    []
  );
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {particles.map((p, i) => {
        const travel = frame * p.speed * (1 + intensity * 2.5);
        const x = (((p.x + travel * 1.6) % 2000) + 2000) % 2000 - 40;
        const y = (((p.y - travel * 0.35 + Math.sin(frame / 40 + p.phase) * 18) % 1120) + 1120) % 1120 - 20;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: `rgba(230,196,125,${p.alpha * (0.7 + intensity * 0.6)})`,
              boxShadow: `0 0 ${p.size * 2}px rgba(240,200,120,${p.alpha * 0.6})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const IllFindYouAgain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [lrcContent, setLrcContent] = useState<string | null>(null);
  const [fontHandle] = useState(() => delayRender('ifya-fonts'));

  useEffect(() => {
    loadFonts()
      .catch((err) => console.error('Failed to load fonts:', err))
      .finally(() => continueRender(fontHandle));
  }, [fontHandle]);

  useEffect(() => {
    const controller = new AbortController();
    const handle = delayRender('ifya-lrc');
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
  const section = sectionAt(t);

  // ---- 背景のカメラ ----
  const lastHit = [...hitTimes].reverse().find((h) => h <= t);
  const sinceHit = lastHit !== undefined ? (t - lastHit) * fps : 999;
  const hitAmp = section === 'breakdown' ? 1 : 0.55;
  const shake = sinceHit < 12 ? interpolate(sinceHit, [0, 12], [1, 0], clamp) * hitAmp : 0;
  const shakeX = shake * 14 * Math.sin(frame * 2.3);
  const shakeY = shake * 10 * Math.cos(frame * 3.1);
  const flash = sinceHit < 8 ? interpolate(sinceHit, [0, 8], [section === 'breakdown' ? 0.28 : 0.1, 0], clamp) : 0;

  const intensity =
    section === 'breakdown' ? 1 : section === 'chorus' || section === 'final' ? 0.55 : section === 'pre' ? 0.3 : 0.1;
  const brightness = interpolate(t, [0, 6], [0, 1], clamp) *
    (section === 'breakdown' ? 0.78 : section === 'chorus' || section === 'final' ? 0.95 : section === 'outro' ? 0.8 : 0.86);
  const endFade = interpolate(frame, [durationInFrames - 90, durationInFrames - 10], [1, 0], clamp);
  const zoom = 1.04 + interpolate(frame, [0, durationInFrames], [0, 0.1]) + Math.sin(t / 9) * 0.008;
  const driftX = Math.sin(t / 11) * 12;
  const driftY = Math.cos(t / 13) * 8;

  // ---- 今の歌詞 ----
  const idx = lyrics.findIndex((l, i) => l.time <= t && (!lyrics[i + 1] || lyrics[i + 1].time > t));
  const line = idx >= 0 ? lyrics[idx] : null;
  const next = idx >= 0 ? lyrics[idx + 1] : null;

  let lyricNode: React.ReactNode = null;
  if (line) {
    const chars = Array.from(line.text);
    const latin = isLatin(line.text);
    const lineSection = sectionAt(line.time);
    const isBreak = lineSection === 'breakdown';
    const isChorus = lineSection === 'chorus' || lineSection === 'final';
    const isWhisper = line.text.includes('やっと会えたね') || line.text.startsWith('I found you');

    const hold = Math.min(next ? next.time - line.time : 8, chars.length * 0.32 + (isBreak ? 1.2 : 3.2));
    const start = line.time * fps;
    const end = (line.time + hold) * fps;
    const local = frame - start;
    const exitLen = isBreak ? 6 : 16;
    const exitStart = end - exitLen;

    const letterSpacing = latin ? 0.06 : 0.1;
    const base = isBreak ? (latin ? 132 : 120) : isChorus ? 82 : isWhisper ? 66 : 70;
    const fontSize = Math.min(base, 780 / textWidthEm(line.text, letterSpacing));
    const fontFamily = isBreak
      ? "'Toro Glitch Mincho', 'Genkai Mincho', serif"
      : "'Genkai Mincho', 'Noto Serif CJK JP', serif";
    const color = isWhisper ? '#f4ead2' : GOLD;
    const stagger = isBreak ? 0.6 : isChorus ? 1.6 : 2.4;
    const appearLen = isBreak ? 4 : 12;

    const underline = interpolate(local, [4, 30], [0, 1], clamp) * interpolate(frame, [exitStart, end], [1, 0], clamp);

    lyricNode = (
      <div
        style={{
          position: 'absolute',
          left: 1010,
          width: 840,
          top: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translate(${shakeX * 0.6}px, ${shakeY * 0.6}px)`,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize,
            fontWeight: 700,
            letterSpacing: `${letterSpacing}em`,
            color,
            whiteSpace: 'nowrap',
            lineHeight: 1.2,
          }}
        >
          {chars.map((c, i) => {
            const ci = local - i * stagger;
            const inP = interpolate(ci, [0, appearLen], [0, 1], clamp);
            // 退場：右上へ砂のように流れて消える（左の文字から順に）
            const ei = frame - (exitStart + i * (isBreak ? 0.3 : 0.9));
            const outP = interpolate(ei, [0, exitLen], [0, 1], clamp);
            const seed = random(`${line.time}-${i}`);
            const enterY = isBreak ? 0 : (1 - inP) * 22;
            const enterScale = isBreak ? interpolate(inP, [0, 1], [1.7, 1]) : isChorus ? interpolate(inP, [0, 1], [1.25, 1]) : 1;
            const outX = outP * (40 + seed * 70);
            const outY = -outP * (18 + seed * 40);
            const blur = (1 - inP) * (isBreak ? 2 : 8) + outP * 6;
            const opacity = inP * (1 - outP);
            const glitch = isBreak && local < 10 ? Math.sin(local * 3 + i) * 6 * (1 - local / 10) : 0;
            const glow = isChorus
              ? 0.45 + 0.2 * Math.sin(frame / 8)
              : isBreak
                ? 0.6
                : 0.35;
            return (
              <span
                key={`${line.time}-${i}`}
                style={{
                  display: 'inline-block',
                  whiteSpace: 'pre',
                  opacity,
                  filter: `blur(${blur}px)`,
                  transform: `translate(${outX + glitch}px, ${enterY + outY}px) scale(${enterScale}) rotate(${outP * (seed - 0.5) * 30}deg)`,
                  textShadow: isBreak
                    ? `${-3 - Math.abs(glitch)}px 0 rgba(255,60,40,0.45), ${3 + Math.abs(glitch)}px 0 rgba(80,180,255,0.35), 0 0 26px rgba(255,190,100,${glow}), 0 8px 30px rgba(0,0,0,0.95)`
                    : `0 0 22px rgba(255,200,110,${glow}), 0 6px 26px rgba(0,0,0,0.95)`,
                }}
              >
                {c}
              </span>
            );
          })}
        </div>
        {!isBreak && (
          <div
            style={{
              marginTop: 30,
              width: 460 * underline,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)`,
            }}
          />
        )}
      </div>
    );
  }

  // ---- タイトル（イントロ） ----
  const titleIn = interpolate(t, [3, 6], [0, 1], clamp);
  const titleOut = interpolate(t, [19.5, 22.5], [1, 0], clamp);
  const titleOpacity = titleIn * titleOut;

  return (
    <AbsoluteFill style={{ backgroundColor: '#020306', overflow: 'hidden' }}>
      <AbsoluteFill style={{ opacity: endFade }}>
        <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>
          <Img
            src={staticFile(IMAGE_FILE)}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transformOrigin: '30% 45%',
              transform: `translate(${driftX}px, ${driftY}px) scale(${zoom})`,
              filter: `brightness(${brightness}) contrast(1.06) saturate(0.88)`,
            }}
          />
        </AbsoluteFill>

        {/* 右側を少し暗くして文字を読みやすく */}
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(90deg, transparent 40%, rgba(0,0,0,0.42) 70%, rgba(0,0,0,0.38) 100%)',
          }}
        />
        {/* 周辺減光 */}
        <AbsoluteFill
          style={{ background: 'radial-gradient(ellipse at 45% 50%, transparent 55%, rgba(0,0,0,0.6) 100%)' }}
        />

        <SandParticles frame={frame} intensity={intensity} />

        {/* フィルムグレイン */}
        <AbsoluteFill
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.05) 0 1px, transparent 1px), radial-gradient(circle, rgba(0,0,0,0.18) 0 1px, transparent 1px)',
            backgroundPosition: `${(frame * 7) % 47}px ${(frame * 5) % 31}px, ${(frame * 3) % 29}px ${(frame * 11) % 43}px`,
            backgroundSize: '5px 5px, 7px 7px',
            mixBlendMode: 'overlay',
            opacity: section === 'breakdown' ? 0.3 : 0.16,
          }}
        />

        {/* タイトル */}
        {titleOpacity > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 1010,
              width: 840,
              top: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: titleOpacity,
              filter: `blur(${(1 - titleIn) * 6}px)`,
            }}
          >
            <div
              style={{
                fontFamily: "'Genkai Mincho', serif",
                fontSize: 76,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                color: GOLD,
                textShadow: '0 0 24px rgba(255,200,110,0.45), 0 6px 26px rgba(0,0,0,0.95)',
              }}
            >
              I&apos;ll find you again
            </div>
            <div style={{ marginTop: 26, width: 420, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }} />
            <div
              style={{
                marginTop: 22,
                fontFamily: "'Genkai Mincho', serif",
                fontSize: 30,
                letterSpacing: '0.5em',
                color: GOLD_DIM,
              }}
            >
              六ツ扉
            </div>
          </div>
        )}

        {lyricNode}

        {/* ヒット時のフラッシュ */}
        <AbsoluteFill style={{ background: 'rgba(255,225,170,1)', opacity: flash, mixBlendMode: 'screen' }} />
      </AbsoluteFill>

      <Audio src={staticFile(AUDIO_FILE)} />
    </AbsoluteFill>
  );
};
