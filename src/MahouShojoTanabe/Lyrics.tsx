import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export interface LyricLineData {
    time: number;
    text: string;
}

const highlightTimes = [49.5, 134.95, 144.4];

const largeTimes = new Set([
    55.3,
    58.3,
    60.5,
    63.5,
    65.5,
    68.0,
    70.9,
    157.0,
    159.5,
    162.3,
    164.9,
    168.5,
    171.0,
    173.6,
]);

const glitchFontTimes = new Set([96.5, 99.2]);
const hanazomeTimes = new Set([106.9, 108.9, 111.9, 114.0]);
const centerLiftTimes = new Set([55.3, 58.3, 60.5, 63.5, 65.5, 68.0, 70.9]);
const pulseTimes = new Set([86.5, 88.5, 90.9, 93.7]);
const colorPulseTimes = new Set([102.0, 104.2]);
const megaGrowTimes = new Set([144.4]);

const isHighlightLine = (time: number) =>
    highlightTimes.some((target) => Math.abs(time - target) < 0.06);

export const Lyrics: React.FC<{ lines: LyricLineData[] }> = ({ lines }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const globalScale = 1.25;

    return (
        <>
            {lines.map((line, index) => {
                const startFrame = line.time * fps;
                const nextLine = lines[index + 1];
                const hardMax = startFrame + fps * 7;
                const endFrame = nextLine ? Math.min(nextLine.time * fps, hardMax) : hardMax;

                if (frame < startFrame || frame > endFrame) {
                    return null;
                }

                const fadeIn = 10;
                const fadeOut = 12;
                const opacity = Math.min(
                    interpolate(frame, [startFrame, startFrame + fadeIn], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                    }),
                    interpolate(frame, [endFrame - fadeOut, endFrame], [1, 0], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                    })
                );

                const highlight = isHighlightLine(line.time);
                const isLarge = largeTimes.has(line.time);
                const useGlitchFont = glitchFontTimes.has(line.time);
                const useHanazome = hanazomeTimes.has(line.time);
                const useCenterLift = centerLiftTimes.has(line.time);
                const usePulse = pulseTimes.has(line.time);
                const useColorPulse = colorPulseTimes.has(line.time);
                const useMegaGrow = megaGrowTimes.has(line.time);
                const scaleIn = interpolate(frame, [startFrame, startFrame + 12], [0.96, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });
                const floatY = isLarge
                    ? interpolate(frame, [startFrame, endFrame], [18, -8], {
                          extrapolateLeft: 'clamp',
                          extrapolateRight: 'clamp',
                      })
                    : useGlitchFont
                    ? Math.sin((frame - startFrame) * 0.08) * 8
                    : 0;
                const driftX = isLarge
                    ? Math.sin((frame - startFrame) * 0.08) * 4
                    : useGlitchFont
                    ? Math.sin((frame - startFrame) * 0.11) * 6
                    : 0;
                const slideX = useHanazome
                    ? interpolate(frame, [startFrame, endFrame], [260, -80], {
                          extrapolateLeft: 'clamp',
                          extrapolateRight: 'clamp',
                      })
                    : 0;
                const pulse =
                    highlight && frame >= startFrame
                        ? 1 + Math.sin(((frame - startFrame) / fps) * 2.2) * 0.015
                        : 1;
                const pop = isLarge
                    ? interpolate(frame, [startFrame, startFrame + 10], [0.92, 1], {
                          extrapolateLeft: 'clamp',
                          extrapolateRight: 'clamp',
                      })
                    : 1;
                const pulseScale = usePulse
                    ? 1 + Math.sin((frame - startFrame) * 0.12) * 0.08
                    : 1;
                const grow = useGlitchFont
                    ? interpolate(frame, [startFrame, endFrame], [0.92, 1.2], {
                          extrapolateLeft: 'clamp',
                          extrapolateRight: 'clamp',
                      })
                    : 1;
                const megaGrow = useMegaGrow
                    ? interpolate(frame, [startFrame, endFrame], [1, 2.5], {
                          extrapolateLeft: 'clamp',
                          extrapolateRight: 'clamp',
                      })
                    : 1;
                const rotate = useGlitchFont
                    ? Math.sin((frame - startFrame) * 0.06) * 4
                    : 0;
                const colorPulse = useColorPulse
                    ? Math.round(
                          interpolate(
                              frame,
                              [startFrame, (startFrame + endFrame) / 2, endFrame],
                              [0, 255, 0],
                              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                          )
                      )
                    : null;

                return (
                    <div
                        key={`${line.time}-${index}`}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            bottom: useCenterLift ? '36%' : highlight ? '18%' : '14%',
                            transform: `translateX(calc(-50% + ${driftX}px + ${slideX}px)) translateY(${floatY}px) scale(${
                                scaleIn * pulse * pop * grow * pulseScale * megaGrow
                            }) rotate(${rotate}deg)`,
                            opacity,
                            maxWidth: '86%',
                            textAlign: 'center',
                            fontFamily: useGlitchFont
                                ? "'Todono Glitch Mincho', 'Nikumaru', 'ZenInShugo', sans-serif"
                                : useHanazome
                                ? "'Hanazome', 'Nikumaru', 'ZenInShugo', sans-serif"
                                : "'Nikumaru', 'ZenInShugo', sans-serif",
                            fontSize:
                                (highlight
                                    ? 86
                                    : useCenterLift
                                    ? 84
                                    : isLarge
                                    ? 72
                                    : useGlitchFont
                                    ? 74
                                    : useHanazome
                                    ? 68
                                    : 58) * globalScale,
                            fontWeight: highlight ? 900 : isLarge ? 800 : useGlitchFont ? 800 : useHanazome ? 700 : 700,
                            letterSpacing: highlight ? '0.06em' : '0.04em',
                            lineHeight: 1.4,
                            color: useColorPulse
                                ? `rgb(${colorPulse}, ${colorPulse}, ${colorPulse})`
                                : useGlitchFont
                                ? '#FFFFFF'
                                : highlight
                                ? '#FFD1E8'
                                : '#FFC0DA',
                            textShadow: highlight
                                ? '0 0 26px rgba(255, 150, 210, 0.9), 0 0 48px rgba(255, 110, 180, 0.6)'
                                : isLarge
                                ? '0 0 24px rgba(255, 140, 200, 0.55), 0 10px 20px rgba(0, 0, 0, 0.75)'
                                : useGlitchFont
                                ? '0 0 22px rgba(255, 255, 255, 0.5), 0 10px 18px rgba(0, 0, 0, 0.8)'
                                : '0 8px 18px rgba(0, 0, 0, 0.75)',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}
                    >
                        {line.text}
                    </div>
                );
            })}
        </>
    );
};
