import React, { useMemo } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface LyricComponentProps {
    text: string;
    enterTime: number; // Frames
    exitTime: number; // Frames
    index: number;
}

const palette = ['#ff73d3', '#7ef7ff', '#c6ff7a', '#8d7bff'];
const chorusWords = ['越えて', '進め', '攻め', '跳ねて', '翔べ'];

const LyricComponent: React.FC<LyricComponentProps> = ({ text, enterTime, exitTime, index }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const characters = useMemo(() => Array.from(text), [text]);

    const startFrame = frame - enterTime;
    const appear = spring({
        frame: Math.max(0, startFrame),
        fps,
        config: { damping: 14, stiffness: 220 },
    });
    const exitFade = interpolate(frame, [exitTime - 18, exitTime], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const opacity = Math.min(appear, exitFade);
    if (opacity <= 0.01) return null;

    const laneOffset = [-52, 6, 54][index % 3];
    const chorus = chorusWords.some((word) => text.includes(word));
    const accent = palette[index % palette.length];
    const secondary = palette[(index + 1) % palette.length];
    const size = chorus ? 88 : 64;
    const wobble = Math.sin((frame + index * 14) * 0.04) * 4;

    const containerStyle: React.CSSProperties = chorus
        ? {
              position: 'absolute',
              left: '25%',
              top: `calc(46% + ${laneOffset}px)`,
              maxWidth: '54%',
              filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.72))',
              lineHeight: 1.08,
              transform: 'translateX(-14%)',
              textAlign: 'center',
          }
        : {
              position: 'absolute',
              left: '6%',
              top: `calc(46% + ${laneOffset}px)`,
              maxWidth: '46%',
              filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.7))',
              lineHeight: 1.12,
              transform: 'translateX(-4%)',
              textAlign: 'left',
          };

    return (
        <div style={containerStyle}>
            <div
                style={{
                    position: 'absolute',
                    inset: chorus ? '-14% -8% -20% -6%' : '-12% -6% -18% -2%',
                    background: chorus
                        ? `linear-gradient(120deg, ${accent} 0%, ${secondary} 70%)`
                        : `linear-gradient(90deg, ${accent} 0%, ${secondary} 70%)`,
                    opacity: chorus ? 0.2 : 0.14,
                    filter: chorus ? 'blur(22px)' : 'blur(18px)',
                    transform: `translateY(${wobble * (chorus ? 0.65 : 0.5)}px)`,
                }}
            />

            <div
                style={{
                    position: 'absolute',
                    inset: chorus ? '-10px' : '-8px',
                    color: 'transparent',
                    WebkitTextStroke: '3px rgba(255, 255, 255, 0.14)',
                    fontFamily: "'KlsMaru', 'Genkai Mincho', serif",
                    fontSize: size + 14,
                    transform: `translateY(${wobble * 0.35}px) translateX(${chorus ? 2 : 4}px)`,
                    opacity: opacity * 0.62,
                    filter: chorus ? 'blur(8px)' : 'blur(7px)',
                }}
            >
                {text}
            </div>

            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    position: 'relative',
                    justifyContent: chorus ? 'center' : 'flex-start',
                }}
            >
                {characters.map((char, charIndex) => {
                    const charSpring = spring({
                        frame: Math.max(0, startFrame - charIndex * 2.1),
                        fps,
                        config: { damping: 16, stiffness: chorus ? 240 : 180 },
                    });
                    const charOpacity = Math.min(charSpring, exitFade);
                    const lift = interpolate(charSpring, [0, 1], [chorus ? 26 : 22, 0]);
                    const skew = interpolate(charSpring, [0, 1], [chorus ? -6 : -3, 0]);
                    const jitter = Math.sin((frame + charIndex * 9) * 0.1) * 1.5;

                    return (
                        <span
                            key={`${char}-${charIndex}`}
                            style={{
                                display: 'inline-block',
                                opacity: charOpacity * opacity,
                                transform: `translateY(${lift + wobble}px) rotate(${skew + jitter}deg) scale(${
                                    1 + 0.022 * Math.sin((frame + charIndex * 7) * 0.06)
                                })`,
                                backgroundImage: `linear-gradient(90deg, ${accent}, ${secondary})`,
                                color: 'transparent',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                WebkitTextStroke: '1.2px rgba(255, 255, 255, 0.35)',
                                textShadow: `0 4px 18px rgba(0,0,0,0.55), 0 0 32px ${accent}80, 0 0 18px ${secondary}70`,
                                fontFamily: "'KlsMaru', 'Genkai Mincho', serif",
                                fontSize: size,
                                letterSpacing: chorus ? '0.08em' : '0.04em',
                                padding: '0 4px',
                                lineHeight: 1.1,
                            }}
                        >
                            {char}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export const Lyrics: React.FC<{ lyrics: { time: number; text: string }[] }> = ({ lyrics }) => {
    const { fps } = useVideoConfig();

    return (
        <>
            {lyrics.map((line, i) => {
                const enterTime = line.time * fps;
                const nextLine = lyrics[i + 1];
                const gapAdjustedExit = nextLine ? nextLine.time * fps - 6 : enterTime + 5 * fps;
                const exitTime = Math.max(enterTime + 40, gapAdjustedExit);

                return (
                    <LyricComponent
                        key={i}
                        index={i}
                        text={line.text}
                        enterTime={enterTime}
                        exitTime={exitTime}
                    />
                );
            })}
        </>
    );
};
