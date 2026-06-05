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
import { parseLrc } from '../utils/lrc-parser';

const LRC_FILE = 'lyrics/JiGaMe.lrc';
const AUDIO_FILE = 'music/JiGaMe.mp3';
const IMAGE_FILE = 'photo/JiGaMe/油絵.png';

const visualSegments = [
  { start: 0, end: 25, scale: 1.05, x: -18, y: -8, brightness: 0.72, contrast: 1.08, saturate: 0.82 },
  { start: 25, end: 55.5, scale: 1.1, x: 12, y: -18, brightness: 0.78, contrast: 1.1, saturate: 0.9 },
  { start: 55.5, end: 84.5, scale: 1.14, x: -8, y: 12, brightness: 0.68, contrast: 1.18, saturate: 0.76 },
  { start: 84.5, end: 113.8, scale: 1.18, x: 22, y: 0, brightness: 0.74, contrast: 1.2, saturate: 0.86 },
  { start: 113.8, end: 136.9, scale: 1.22, x: -26, y: -12, brightness: 0.56, contrast: 1.28, saturate: 0.7 },
  { start: 136.9, end: 164.4, scale: 1.16, x: 16, y: 16, brightness: 0.76, contrast: 1.16, saturate: 0.9 },
  { start: 164.4, end: 192.2, scale: 1.2, x: -12, y: -18, brightness: 0.66, contrast: 1.25, saturate: 0.78 },
  { start: 192.2, end: 999, scale: 1.08, x: 0, y: 0, brightness: 0.82, contrast: 1.05, saturate: 0.92 },
];

const emphasisTimes = [55.5, 84.5, 113.8, 136.9, 164.4, 192.2, 203];
const chorusRanges = [
  { start: 59, end: 84.5 },
  { start: 183, end: 203 },
];

const isWithinRange = (time: number, ranges: Array<{ start: number; end: number }>) =>
  ranges.some((range) => time >= range.start && time < range.end);

const loadFonts = async () => {
  const fonts = [
    new FontFace('Soukou Mincho', `url(${staticFile('fonts/SoukouMincho.ttf')}) format('truetype')`),
    new FontFace(
      'Totono Glitch Mincho',
      `url(${staticFile('fonts/TotonoGlitchMincho.otf')}) format('opentype')`
    ),
  ];

  await Promise.all(
    fonts.map(async (font) => {
      const loaded = await font.load();
      document.fonts.add(loaded);
    })
  );
};

const isAbortError = (err: unknown) => err instanceof DOMException && err.name === 'AbortError';

export const JiGaMe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [lrcContent, setLrcContent] = useState<string | null>(null);
  const [fontHandle] = useState(() => delayRender('jigame-fonts'));

  useEffect(() => {
    loadFonts()
      .catch((err) => console.error('Failed to load JiGaMe fonts:', err))
      .finally(() => continueRender(fontHandle));
  }, [fontHandle]);

  useEffect(() => {
    const controller = new AbortController();
    const handle = delayRender('jigame-lrc');
    fetch(staticFile(LRC_FILE), { signal: controller.signal })
      .then((res) => res.text())
      .then((text) => setLrcContent(text))
      .catch((err) => {
        if (isAbortError(err)) return;
        console.error('Failed to load JiGaMe LRC:', err);
        setLrcContent('');
      })
      .finally(() => continueRender(handle));

    return () => controller.abort();
  }, []);

  const lyrics = useMemo(() => (lrcContent ? parseLrc(lrcContent) : []), [lrcContent]);
  const currentTime = frame / fps;
  const currentIndex = lyrics.findIndex((line, index) => {
    const nextLine = lyrics[index + 1];
    return line.time <= currentTime && (!nextLine || nextLine.time > currentTime);
  });
  const currentLine = currentIndex >= 0 ? lyrics[currentIndex] : null;
  const previousLine = currentIndex > 0 ? lyrics[currentIndex - 1] : null;
  const nextLine = currentIndex >= 0 ? lyrics[currentIndex + 1] : null;
  const lineStartFrame = currentLine ? Math.floor(currentLine.time * fps) : 0;
  const nextLineFrame = nextLine ? Math.floor(nextLine.time * fps) : lineStartFrame + fps * 7;
  const localFrame = frame - lineStartFrame;

  const activeSegment =
    visualSegments.find((segment) => currentTime >= segment.start && currentTime < segment.end) ??
    visualSegments[visualSegments.length - 1];
  const nextSegment = visualSegments.find((segment) => currentTime < segment.start);
  const segmentMix =
    nextSegment && currentTime > nextSegment.start - 2
      ? interpolate(currentTime, [nextSegment.start - 2, nextSegment.start], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0;

  const mix = (key: keyof typeof activeSegment) => {
    const current = activeSegment[key];
    const next = nextSegment?.[key] ?? current;
    return typeof current === 'number' && typeof next === 'number'
      ? interpolate(segmentMix, [0, 1], [current, next])
      : current;
  };

  const driftX = Math.sin(frame / fps / 6) * 10 + (mix('x') as number);
  const driftY = Math.cos(frame / fps / 7) * 8 + (mix('y') as number);
  const slowZoom = interpolate(frame, [0, durationInFrames], [0, 0.06], { extrapolateRight: 'clamp' });
  const scale = (mix('scale') as number) + slowZoom;
  const brightness = mix('brightness') as number;
  const contrast = mix('contrast') as number;
  const saturate = mix('saturate') as number;

  const isChorusLine = currentLine ? isWithinRange(currentLine.time, chorusRanges) : false;
  const isEmphasisLine = currentLine
    ? emphasisTimes.some((time) => Math.abs(currentLine.time - time) < 0.65)
    : false;
  const emphasisEntrance = isEmphasisLine
    ? interpolate(localFrame, [0, 5, 18, 28], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;
  const visualNoiseBoost = isEmphasisLine && localFrame < 28;
  const lineDuration = Math.max(18, nextLineFrame - lineStartFrame);
  const lyricOpacity = currentLine
    ? interpolate(frame, [lineStartFrame - 6, lineStartFrame + 10, nextLineFrame - 14, nextLineFrame], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;
  const lineLift = interpolate(localFrame, [0, Math.min(16, lineDuration * 0.3)], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const chorusDecay = isChorusLine
    ? interpolate(frame, [nextLineFrame - 24, nextLineFrame], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;
  const pulse = Math.sin(frame * 0.08) * 0.8 + Math.sin(localFrame * 0.9) * 2.6 * emphasisEntrance;
  const glitchShift = Math.sin(localFrame * 1.65) * 4 * emphasisEntrance;
  const lyricFont = isEmphasisLine || isChorusLine ? "'Totono Glitch Mincho', 'Soukou Mincho', serif" : "'Soukou Mincho', serif";
  const currentCharacters = Array.from(currentLine?.text ?? '');

  return (
    <AbsoluteFill style={{ backgroundColor: '#050609', color: '#eef3f8', overflow: 'hidden' }}>
      <Img
        src={staticFile(IMAGE_FILE)}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translate(-50%, -50%) translate(${driftX}px, ${driftY}px) scale(${scale})`,
          filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(3,5,10,0.42) 0%, rgba(3,5,10,0.2) 34%, rgba(3,5,10,0.82) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 35% 22%, rgba(190,205,230,0.16), transparent 34%), radial-gradient(circle at 76% 72%, rgba(92,114,146,0.2), transparent 38%)',
          mixBlendMode: 'screen',
          opacity: 0.65,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 4px)',
          opacity: visualNoiseBoost ? 0.26 : 0.16,
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.06) 0 1px, transparent 1px), radial-gradient(circle, rgba(0,0,0,0.16) 0 1px, transparent 1px)',
          backgroundPosition: `${frame % 47}px ${frame % 31}px, ${frame % 29}px ${frame % 43}px`,
          backgroundSize: '5px 5px, 7px 7px',
          mixBlendMode: 'overlay',
          opacity: visualNoiseBoost ? 0.22 : 0.13,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 54,
          top: 44,
          color: 'rgba(235, 242, 250, 0.58)',
          fontFamily: "'Soukou Mincho', serif",
          fontSize: 22,
          letterSpacing: '0.14em',
          textShadow: '0 4px 16px rgba(0,0,0,0.55)',
        }}
      >
        JiGaMe
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '11%',
          transform: 'translateX(-50%)',
          width: '88%',
          maxWidth: 1540,
          height: 310,
          textAlign: 'center',
          fontFamily: "'Soukou Mincho', serif",
          perspective: 900,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            color: 'rgba(230, 238, 248, 0.34)',
            fontSize: 34,
            lineHeight: 1.25,
            letterSpacing: '0.08em',
            textShadow: '0 5px 18px rgba(0,0,0,0.62)',
            transform: 'translateY(6px) rotateX(30deg)',
            opacity: previousLine ? lyricOpacity * 0.78 : 0,
          }}
        >
          {previousLine?.text ?? ''}
        </div>

        <div
          style={{
            position: 'absolute',
            top: 92,
            left: 0,
            right: 0,
            padding: '0 36px',
            boxSizing: 'border-box',
            color: isEmphasisLine || isChorusLine ? '#ffffff' : '#edf3fa',
            fontFamily: lyricFont,
            fontSize: isEmphasisLine || isChorusLine ? 78 : 68,
            lineHeight: 1.16,
            letterSpacing: isEmphasisLine || isChorusLine ? '0.12em' : '0.06em',
            fontWeight: isEmphasisLine || isChorusLine ? 760 : 640,
            textShadow:
              isEmphasisLine || isChorusLine
                ? '0 0 22px rgba(205,225,255,0.72), 0 9px 30px rgba(0,0,0,0.7)'
                : '0 7px 24px rgba(0,0,0,0.68), 0 0 14px rgba(180,205,235,0.28)',
            opacity: lyricOpacity,
            transform: `translate(${glitchShift}px, ${lineLift + pulse}px)`,
            wordBreak: 'keep-all',
            overflowWrap: 'anywhere',
          }}
        >
          {isChorusLine
            ? currentCharacters.map((char, index) => {
                const charDecay = interpolate(chorusDecay, [index / Math.max(1, currentCharacters.length), 1], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                const crumbleY = Math.sin(index * 1.7 + frame * 0.08) * 8 * charDecay;
                const ageOpacity = interpolate(charDecay, [0, 0.65, 1], [1, 0.55, 0], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                return (
                  <span
                    key={`${char}-${index}`}
                    style={{
                      display: 'inline-block',
                      opacity: ageOpacity,
                      color: `rgba(238, 243, 250, ${0.58 + 0.42 * (1 - charDecay)})`,
                      transform: `translateY(${crumbleY}px) rotate(${charDecay * ((index % 3) - 1) * 3}deg)`,
                      textShadow:
                        charDecay > 0.2
                          ? '0 0 10px rgba(210,205,190,0.42), 0 8px 24px rgba(0,0,0,0.65)'
                          : undefined,
                    }}
                  >
                    {char}
                  </span>
                );
              })
            : currentLine?.text ?? ''}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 4,
            left: 0,
            right: 0,
            color: 'rgba(230, 238, 248, 0.26)',
            fontSize: 34,
            lineHeight: 1.25,
            letterSpacing: '0.08em',
            textShadow: '0 5px 18px rgba(0,0,0,0.62)',
            transform: 'translateY(-4px) rotateX(-26deg)',
            opacity: nextLine ? lyricOpacity * 0.72 : 0,
          }}
        >
          {nextLine?.text ?? ''}
        </div>
      </div>

      <Audio src={staticFile(AUDIO_FILE)} />
    </AbsoluteFill>
  );
};
