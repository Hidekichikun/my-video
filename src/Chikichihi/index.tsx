import React, { useEffect, useMemo, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { LyricLine, parseLrc } from '../utils/lrc-parser';

type PhotoCue = {
  src: string;
  startSec: number;
  endSec?: number;
};

type PhotoTweak = {
  baseScale?: number;
  liftPx?: number;
  objectPosition?: string;
};

type VerticalOverride = {
  time: number;
  entries: Array<{
    text: string;
    mode: 'vertical' | 'horizontal' | 'slant' | 'center';
    color: string;
    travelFrom?: number; // percent for vertical travel start
    travelTo?: number; // percent for vertical travel end
    delaySec?: number;
  }>;
};

type FlybyLyric = {
  time: number;
  direction: 'ltr' | 'rtl';
};

const photoCues: PhotoCue[] = [
  { src: 'photo/chikichihi/u2944115231_A_beautiful_woman_inspired_by_Confucius_portrayed_0444d40f-7f01-4821-b256-d0cec04eb8b1_3.png', startSec: 0, endSec: 22.12 },
  { src: 'photo/chikichihi/u2944115231_A_beautiful_woman_inspired_by_Confucius_portrayed_c0b43cb7-c100-4c37-9b15-9d358b45b12b_2.png', startSec: 22.12, endSec: 42.58 },
  { src: 'photo/chikichihi/u2944115231_A_beautiful_woman_inspired_by_Confucius_depicted__ab6e956e-b8e6-4281-81d5-01b5b265ba54_3.png', startSec: 42.58, endSec: 62.39 },
  { src: 'photo/chikichihi/up2944115231_A_side-profile_scene_of_a_beautiful_woman_inspire_af04775a-e789-4525-8d58-0c43f4b5c280_2.png', startSec: 62.39, endSec: 95.12 },
  { src: 'photo/chikichihi/u2944115231_A_beautiful_woman_inspired_by_Confucius_portrayed_0444d40f-7f01-4821-b256-d0cec04eb8b1_3.png', startSec: 95.12, endSec: 105.74 },
  { src: 'photo/chikichihi/up2944115231_A_side-profile_scene_of_a_beautiful_woman_inspire_44b88b45-9f50-47c2-88dc-12976f85f932_2.png', startSec: 105.74, endSec: 115.97 },
  { src: 'photo/chikichihi/u2944115231_A_beautiful_woman_inspired_by_Confucius_portrayed_9ff284ad-5b29-4fd7-9799-058b36595e56_3.png', startSec: 115.97, endSec: 126.12 },
  { src: 'photo/chikichihi/u2944115231_A_beautiful_woman_inspired_by_Confucius_portrayed_b23a4a5d-7706-4da5-af91-cc40a0322582_3.png', startSec: 126.12, endSec: 146.54 },
  { src: 'photo/chikichihi/up2944115231_A_side-profile_scene_of_a_beautiful_woman_inspire_5e2580ae-7c8c-4547-84e2-9919ed9357ae_0.png', startSec: 146.54, endSec: 156.56 },
  { src: 'photo/chikichihi/u2944115231_A_Confucius-inspired_female_scholar-artist_from_a_a614eb00-ff8c-4fd9-bcf1-55f69e91f11e_1.png', startSec: 156.56, endSec: 167.01 },
  { src: 'photo/chikichihi/u2944115231_A_beautiful_woman_inspired_by_Confucius_depicted__568b4421-66a9-4144-8f21-884a86f141b2_0.png', startSec: 167.01, endSec: 182.39 },
  { src: 'photo/chikichihi/up2944115231_A_beautiful_woman_inspired_by_Confucius_portrayed_b8ce8271-1953-4dfe-93d5-12611a521445_3.png', startSec: 182.39, endSec: 192.18 },
  { src: 'photo/chikichihi/u2944115231_A_Confucius-inspired_female_scholar-artist_from_a_dd4db194-652f-40c3-bcd8-af5da29eae37_3.png', startSec: 192.18 },
];

const loadFont = (family: string, path: string, format: 'opentype' | 'truetype') => {
  const font = new FontFace(family, `url(${staticFile(path)}) format('${format}')`);
  return font.load().then((loaded) => {
    document.fonts.add(loaded);
    return loaded;
  });
};

export const Chikichihi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [lyrics, setLyrics] = useState<string | null>(null);

  useEffect(() => {
    const handle = delayRender('load-chikichihi-fonts');
    Promise.all([
      loadFont('GenkaiMincho', 'fonts/GenkaiMincho.ttf', 'truetype'),
      loadFont('GenEiLateMin', 'fonts/GenEiLateMin_v2.ttc', 'truetype'),
      loadFont('KlsMaru', 'fonts/klsmaru.otf', 'opentype'),
      loadFont('ShizukaGlitch', 'fonts/ChikichihiGlitch.otf', 'opentype'),
    ])
      .catch((err) => console.error('Font load failed', err))
      .finally(() => continueRender(handle));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const handle = delayRender('load-chikichihi-lrc');
    fetch(staticFile('chikichihi.lrc'), { signal: controller.signal })
      .then((response) => response.text())
      .then((text) => setLyrics(text))
      .catch((err) => {
        if ((err as any)?.name !== 'AbortError') {
          console.error('Failed to load chikichihi.lrc', err);
          setLyrics('');
        }
      })
      .finally(() => continueRender(handle));

    return () => controller.abort();
  }, []);

  const parsedLyrics = useMemo<LyricLine[]>(() => (lyrics ? parseLrc(lyrics) : []), [lyrics]);
  const lyricFontStack = "'GenkaiMincho', 'GenEiLateMin', 'KlsMaru', 'ShizukaGlitch', serif";

  const faceTweaks: Record<string, PhotoTweak> = useMemo(
    () => ({
      'photo/chikichihi/up2944115231_A_beautiful_woman_inspired_by_Confucius_portrayed_b8ce8271-1953-4dfe-93d5-12611a521445_3.png': {
        baseScale: 0.98,
        liftPx: 36,
        objectPosition: '50% 58%',
      },
      'photo/chikichihi/up2944115231_A_side-profile_scene_of_a_beautiful_woman_inspire_44b88b45-9f50-47c2-88dc-12976f85f932_2.png': {
        baseScale: 0.98,
        liftPx: 42,
        objectPosition: '50% 60%',
      },
      'photo/chikichihi/up2944115231_A_side-profile_scene_of_a_beautiful_woman_inspire_5e2580ae-7c8c-4547-84e2-9919ed9357ae_0.png': {
        baseScale: 0.98,
        liftPx: 42,
        objectPosition: '50% 60%',
      },
      'photo/chikichihi/up2944115231_A_side-profile_scene_of_a_beautiful_woman_inspire_af04775a-e789-4525-8d58-0c43f4b5c280_2.png': {
        baseScale: 0.98,
        liftPx: 170,
        objectPosition: '52% 72%',
      },
    }),
    []
  );

  const overrideVertical: VerticalOverride[] = useMemo(
    () => [
      { time: 62.39, entries: [{ text: '己を知るとき　世界の色が変わる', mode: 'vertical', color: '#F6D8AA' }] },
      { time: 66.94, entries: [{ text: '涙も痛みも　未来を照らす  灯りになる', mode: 'horizontal', color: '#D7E3FF' }] },
      {
        time: 71.89,
        entries: [
          { text: '彼を知るってことは', mode: 'slant', color: '#F8E6C8' },
          { text: '心を開くこと', mode: 'vertical', color: '#DCE7FF' },
        ],
      },
      { time: 76.59, entries: [{ text: '勝ち負けより大事な', mode: 'horizontal', color: '#F6D8AA' }] },
      {
        time: 78.49,
        entries: [
          { text: 'ふたりの未来を', mode: 'vertical', color: '#FFE3EF' },
          { text: '探すために', mode: 'slant', color: '#E8F6D7' },
        ],
      },
      {
        time: 126.12,
        entries: [
          { text: '己を知れば', mode: 'vertical', color: '#DCE7FF', travelFrom: -110, travelTo: 110 },
          { text: '嵐の中でも立てる', mode: 'vertical', color: '#F6D8AA', travelFrom: -110, travelTo: 110, delaySec: 0.6 },
        ],
      },
      {
        time: 130.42,
        entries: [
          { text: '迷いも不安も　', mode: 'vertical', color: '#FFE3EF' },
          { text: 'もう振り回されない', mode: 'horizontal', color: '#E8F6D7' },
        ],
      },
      {
        time: 135.22,
        entries: [
          { text: '彼を知れば', mode: 'vertical', color: '#F8E6C8' },
          { text: '道は一本じゃなくなる', mode: 'horizontal', color: '#DCE7FF' },
        ],
      },
      {
        time: 140.02,
        entries: [
          { text: 'ぶつかるより', mode: 'vertical', color: '#F6D8AA' },
          { text: '並んで歩ける未来へ', mode: 'horizontal', color: '#D7E3FF' },
        ],
      },
      {
        time: 184.53,
        entries: [
          { text: '怒りよりも', mode: 'vertical', color: '#FFE3EF' },
          { text: '想いを選んで', mode: 'horizontal', color: '#E8F6D7' },
        ],
      },
      {
        time: 194.59,
        entries: [
          { text: '壊し合うより', mode: 'vertical', color: '#F8E6C8' },
          { text: '守り合える道がある', mode: 'horizontal', color: '#DCE7FF' },
        ],
      },
      { time: 202.68, entries: [{ text: '己を知り　彼を知る者は', mode: 'center', color: '#D7F9FF' }] },
      { time: 206.17, entries: [{ text: '戦わずして勝つ。', mode: 'center', color: '#F8E6C8' }] },
    ],
    []
  );

  const flybyLyrics = useMemo<FlybyLyric[]>(
    () => [
      { time: 146.54, direction: 'ltr' },
      { time: 149.35, direction: 'ltr' },
      { time: 152.48, direction: 'ltr' },
      { time: 154.34, direction: 'ltr' },
      { time: 156.56, direction: 'rtl' },
      { time: 159.17, direction: 'rtl' },
      { time: 161.67, direction: 'rtl' },
      { time: 164.38, direction: 'rtl' },
    ],
    []
  );

  const findOverride = (time: number) => overrideVertical.find((o) => Math.abs(o.time - time) < 0.06);
  const findFlyby = (time: number) => flybyLyrics.find((o) => Math.abs(o.time - time) < 0.06);

  return (
    <AbsoluteFill style={{ backgroundColor: '#040509' }}>
      {photoCues.map((cue, idx) => {
        const startFrame = Math.floor(cue.startSec * fps);
        const endFrame = Math.floor((cue.endSec ?? durationInFrames / fps) * fps);
        const opacity = interpolate(frame, [startFrame, startFrame + 12, endFrame - 16, endFrame], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const tweak = faceTweaks[cue.src] ?? {};
        const baseScale = tweak.baseScale ?? 1.04;
        const scale = interpolate(frame, [startFrame, endFrame], [baseScale, baseScale - 0.04], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const driftY = interpolate(frame, [startFrame, endFrame], [6, -6], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const translateY = (tweak.liftPx ?? 0) + driftY;

        return (
          <Img
            key={`${cue.src}-${idx}`}
            src={staticFile(cue.src)}
            alt=""
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: tweak.objectPosition ?? '50% 50%',
              filter: 'contrast(1.06) saturate(1.05)',
              opacity,
              transform: `scale(${scale}) translateY(${translateY}px)`,
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 70% 20%, rgba(255,228,201,0.18), transparent 40%), radial-gradient(circle at 20% 80%, rgba(157,195,255,0.16), transparent 36%)',
          mixBlendMode: 'screen',
          opacity: 0.85,
        }}
      />
      <AbsoluteFill style={{ backgroundColor: 'rgba(2, 4, 10, 0.55)' }} />
      {/* EVA-ish scanlines and grid tint */}
      <AbsoluteFill
        style={{
          mixBlendMode: 'screen',
          background:
            'repeating-linear-gradient(180deg, rgba(120, 255, 200, 0.08), rgba(120, 255, 200, 0.08) 2px, transparent 2px, transparent 6px)',
          opacity: 0.35,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.4), rgba(0,0,0,0.1) 10%, rgba(0,0,0,0.4)), radial-gradient(circle at 20% 20%, rgba(76, 255, 180, 0.12), transparent 30%), radial-gradient(circle at 80% 80%, rgba(120, 200, 255, 0.12), transparent 30%)',
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />

      <Audio src={staticFile('chikichihi.mp3')} />

      <AbsoluteFill style={{ justifyContent: 'flex-end', padding: '0 120px 120px', boxSizing: 'border-box' }}>
        {parsedLyrics.map((line, idx) => {
          const enterFrame = Math.floor(line.time * fps);
          const nextTime = parsedLyrics[idx + 1]?.time ?? line.time + 4.5;
          const exitFrame = Math.floor(nextTime * fps);
          const override = findOverride(line.time);
          const flyby = findFlyby(line.time);
          const hasCustomMotion = Boolean(override || flyby);
          const preRoll = flyby ? Math.floor(fps * 1.2) : override ? Math.floor(fps * 0.6) : 12;
          const postRoll = flyby ? Math.floor(fps * 1.1) : override ? Math.floor(fps * 0.75) : 2;
          const windowExitFrame = exitFrame + postRoll;

          const fadeInStart = hasCustomMotion ? enterFrame - Math.floor(preRoll * 0.6) : enterFrame - 6;
          const fadeInEnd = hasCustomMotion ? enterFrame + Math.floor(fps * 0.7) : enterFrame + 10;
          const fadeOutEnd = hasCustomMotion ? windowExitFrame : exitFrame;
          const fadeOutStart = hasCustomMotion ? fadeOutEnd - Math.floor(fps * 0.95) : exitFrame - 14;
          const opacity = interpolate(frame, [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          if (frame < enterFrame - preRoll || frame > windowExitFrame) {
            return null;
          }

          const y = interpolate(
            frame,
            [enterFrame - Math.floor(preRoll * 0.5), enterFrame + Math.floor(fps * 0.35)],
            [12, 0],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          );

          const letterSpacing = override ? '0.12em' : line.isChorus ? '0.08em' : '0.04em';
          const textShadow = override
            ? '0 0 36px rgba(120,255,210,0.65), 0 0 18px rgba(140,180,255,0.5)'
            : line.isChorus
            ? '0 0 32px rgba(120,255,200,0.7), 0 0 22px rgba(255,140,220,0.6)'
            : '0 0 24px rgba(140,220,255,0.45), 0 6px 16px rgba(0,0,0,0.55)';

          if (flyby) {
            const travelStart = enterFrame - Math.floor(preRoll * 0.4);
            const travelRange = [travelStart, windowExitFrame];
            const [travelFrom, travelTo] = flyby.direction === 'rtl' ? [70, -70] : [-70, 70];
            const travelX = interpolate(frame, travelRange, [travelFrom, travelTo], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const driftY = interpolate(frame, travelRange, [4, -4], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={`${line.time}-${idx}`}
                style={{
                  position: 'absolute',
                  top: '58%',
                  left: '50%',
                  transform: `translate(-50%, ${y}px) translateX(${travelX}vw) translateY(${driftY}px)`,
                  whiteSpace: 'nowrap',
                  padding: '12px 20px',
                  borderRadius: 14,
                  background: 'rgba(8, 10, 16, 0.6)',
                  color: '#D9E8FF',
                  fontSize: 56,
                  fontWeight: 660,
                  letterSpacing: '0.1em',
                  fontFamily: lyricFontStack,
                  textShadow: '0 0 26px rgba(120,200,255,0.6), 0 10px 22px rgba(0,0,0,0.55)',
                  opacity,
                }}
              >
                {line.text}
              </div>
            );
          }

          if (override) {
            const typingSpeed = 10; // chars per second (slower for glide motion)
            const typingSpeedCenter = 6; // chars per second for center lines
            const entryTimings: number[] = [];
            let cursor = 0;
            override.entries.forEach((entry, entryIdx) => {
              const speed = entry.mode === 'center' ? typingSpeedCenter : typingSpeed;
              const start = entry.delaySec ?? cursor;
              entryTimings[entryIdx] = start;
              const finish = start + entry.text.length / speed + 0.18;
              cursor = Math.max(cursor, finish);
            });

            return (
              <div
                key={`${line.time}-${idx}`}
                style={{
                  position: 'absolute',
                  width: '100%',
                  bottom: '4%',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 30,
                  opacity,
                  transform: `translateY(${y}px)`,
                  padding: '0 48px',
                }}
              >
                {override.entries.map((entry, entryIdx) => {
                  const chars = Array.from(entry.text);
                  const elapsedSec = Math.max(0, (frame - enterFrame) / fps - entryTimings[entryIdx]);
                  const visibleCount = Math.min(
                    chars.length,
                    Math.floor(elapsedSec * (entry.mode === 'center' ? typingSpeedCenter : typingSpeed))
                  );
                    const renderedChars = chars.slice(0, visibleCount);

                  const commonStyle: React.CSSProperties = {
                    color: entry.color,
                    fontFamily: lyricFontStack,
                    textShadow,
                    fontWeight: entry.mode === 'horizontal' ? 680 : 760,
                  };

                  if (entry.mode === 'vertical') {
                    const verticalTravel = interpolate(
                      frame,
                      [enterFrame - Math.floor(preRoll * 0.4), windowExitFrame],
                      [entry.travelFrom ?? 110, entry.travelTo ?? -110],
                      {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                      }
                    );

                    return (
                      <div
                        key={entryIdx}
                        style={{
                          display: 'flex',
                          writingMode: 'vertical-rl',
                          textOrientation: 'upright',
                          padding: '8px 6px',
                          borderRadius: 12,
                          boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 0 18px rgba(120,255,200,0.25)',
                          fontSize: 72,
                          letterSpacing,
                          ...commonStyle,
                          transform: `translateY(${verticalTravel}%)`,
                        }}
                      >
                        {renderedChars.map((char, cIdx) => {
                          const jitterX = Math.sin((frame + cIdx * 13) * 0.9) * 2.8;
                          const jitterY = Math.cos((frame + cIdx * 17) * 0.8) * 3.1;
                          const colorShift = cIdx % 2 === 0 ? 'rgba(110,255,200,0.75)' : 'rgba(180,200,255,0.75)';
                          return (
                            <span
                              key={cIdx}
                              style={{
                                margin: '6px 0',
                                transform: `translate(${jitterX}px, ${jitterY}px)`,
                                textShadow: `0 0 32px ${colorShift}, 0 0 14px rgba(255,255,255,0.5)`,
                              }}
                            >
                              {char}
                            </span>
                          );
                        })}
                      </div>
                    );
                  }

                  if (entry.mode === 'slant') {
                    return (
                      <div
                        key={entryIdx}
                        style={{
                          display: 'inline-block',
                          transform: 'rotate(-8deg)',
                          padding: '8px 10px',
                          borderRadius: 10,
                          fontSize: 56,
                          letterSpacing,
                          boxShadow: '0 10px 28px rgba(0,0,0,0.4), 0 0 18px rgba(120,255,200,0.25)',
                          ...commonStyle,
                        }}
                      >
                        {renderedChars.join('')}
                      </div>
                    );
                  }

                  if (entry.mode === 'center') {
                    return (
                      <div
                        key={entryIdx}
                        style={{
                          position: 'absolute',
                          bottom: '14%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: 82,
                          fontWeight: 780,
                          letterSpacing,
                          textAlign: 'center',
                          ...commonStyle,
                        }}
                      >
                        {renderedChars.join('')}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={entryIdx}
                      style={{
                        display: 'inline-block',
                        padding: '8px 10px',
                        borderRadius: 10,
                        fontSize: 56,
                        letterSpacing,
                        boxShadow: '0 10px 26px rgba(0,0,0,0.4), 0 0 16px rgba(120,200,255,0.2)',
                        ...commonStyle,
                      }}
                    >
                      {renderedChars.join('')}
                    </div>
                  );
                })}
              </div>
            );
          }

          return (
            <div
              key={`${line.time}-${idx}`}
              style={{
                position: 'absolute',
                width: '100%',
                bottom: line.isChorus ? '20%' : '14%',
                textAlign: 'center',
                color: line.isChorus ? '#9CF7D4' : '#D9E8FF',
                fontSize: line.isChorus ? 66 : 54,
                fontWeight: 600,
                lineHeight: 1.24,
                letterSpacing,
                fontFamily: lyricFontStack,
                opacity,
                transform: `translateY(${y}px)`,
                textShadow,
                padding: '0 48px',
              }}
            >
              {line.text}
            </div>
          );
        })}

        <div
          style={{
            position: 'absolute',
            top: 42,
            left: 48,
            padding: '10px 18px',
            borderRadius: 999,
            background: 'rgba(12, 13, 22, 0.62)',
            color: '#E4E5F1',
            fontSize: 22,
            letterSpacing: '0.12em',
            fontFamily: lyricFontStack,
            textTransform: 'uppercase',
            boxShadow: '0 6px 22px rgba(0,0,0,0.45)',
          }}
        >
          己知己彼
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
