import React, { useMemo } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/MPLUSRounded1c';

const { fontFamily: fallbackFontFamily } = loadFont();

interface GlitchLineProps {
    text: string;
    enterTime: number;
    exitTime: number;
    isChorus?: boolean;
    fontFamily?: string;
    kanjiFontFamily?: string;
}

export const GlitchLine: React.FC<GlitchLineProps> = ({
    text,
    enterTime,
    exitTime,
    isChorus,
    fontFamily,
    kanjiFontFamily,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const activeFontFamily = fontFamily ?? fallbackFontFamily;
    const activeKanjiFontFamily =
        kanjiFontFamily ?? `'KlsMaru', ${activeFontFamily}, 'M PLUS Rounded 1c', sans-serif`;

    const exitLift = interpolate(frame, [exitTime, exitTime + 18], [0, -32], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const characters = useMemo(
        () =>
            Array.from(text).map((char) => ({
                char: char === ' ' ? '\u00A0' : char,
                isAscii: /^[\u0000-\u007f]+$/.test(char),
                isKanji: /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/.test(char),
            })),
        [text]
    );

    const staggerDelay = 4;
    const fallStartY = -960;

    return (
        <div
            style={{
                position: 'absolute',
                width: '100%',
                textAlign: 'center',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontFamily: activeFontFamily,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0 120px',
                lineHeight: 1.06,
                gap: '8px',
                perspective: '1000px',
            }}
        >
            {characters.map((item, order) => {
                const randomOffset = (order * 19) % 37;
                const startFrame = enterTime + order * staggerDelay + randomOffset;
                const localFrame = frame - startFrame;
                const appearFrame = Math.max(0, localFrame);

                const dropProgress = spring({
                    frame: appearFrame,
                    fps,
                    config: { damping: 18, stiffness: 120, mass: 1.1 },
                });

                const fadeIn = interpolate(dropProgress, [0, 0.12], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });

                const fadeOut = interpolate(frame, [exitTime - 16, exitTime + 12], [1, 0], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });

                const opacity = Math.min(fadeIn, fadeOut);
                if (opacity < 0.01) return null;

                const landing = interpolate(
                    dropProgress,
                    [0, 0.58, 0.84, 1],
                    [fallStartY - order * 6, 32, -14, 0],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );

                const sway = Math.sin(order * 0.7 + dropProgress * 3.4) * (18 + (order % 6) * 3);
                const horizontalDrift = interpolate(dropProgress, [0, 1], [sway * 1.1, 0], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });

                const bouncePhase = Math.max(0, appearFrame - fps * 0.18);
                const bounce = Math.exp(-bouncePhase / 14) * Math.sin(bouncePhase / 3.6) * 12;

                const squish = interpolate(dropProgress, [0, 0.72, 0.9, 1], [0.84, 1.18, 0.92, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });

                const rotateX = interpolate(dropProgress, [0, 0.55, 1], [16, -7, 0], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });

                const rotateZ = interpolate(dropProgress, [0, 0.6, 1], [10, -8, 0], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });

                const blur = interpolate(dropProgress, [0, 0.24], [6, 0], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });

                const colorProgress = dropProgress;
                let currentColor: string;
                if (colorProgress < 0.4) {
                    const t = colorProgress / 0.4;
                    const r = Math.round(150 + (64 - 150) * t);
                    const g = Math.round(78 + (148 - 78) * t);
                    const b = Math.round(182 + (236 - 182) * t);
                    currentColor = `rgb(${r}, ${g}, ${b})`;
                } else if (colorProgress < 0.75) {
                    const t = (colorProgress - 0.4) / 0.35;
                    const r = Math.round(64 + (255 - 64) * t);
                    const g = Math.round(148 + (62 - 148) * t);
                    const b = Math.round(236 + (164 - 236) * t);
                    currentColor = `rgb(${r}, ${g}, ${b})`;
                } else {
                    currentColor = '#ff2fa2';
                }

                const getShadowColor = (alpha: number) => {
                    if (colorProgress < 0.4) {
                        const t = colorProgress / 0.4;
                        const r = Math.round(150 + (64 - 150) * t);
                        const g = Math.round(78 + (148 - 78) * t);
                        const b = Math.round(182 + (236 - 182) * t);
                        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    } else if (colorProgress < 0.75) {
                        const t = (colorProgress - 0.4) / 0.35;
                        const r = Math.round(64 + (255 - 64) * t);
                        const g = Math.round(148 + (62 - 148) * t);
                        const b = Math.round(236 + (164 - 236) * t);
                        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    } else {
                        return `rgba(255, 47, 162, ${alpha})`;
                    }
                };

                const textShadow3D = [
                    `0 2px 0 ${getShadowColor(0.9)}`,
                    `0 4px 0 ${getShadowColor(0.75)}`,
                    `0 6px 0 ${getShadowColor(0.6)}`,
                    `0 9px 14px ${getShadowColor(0.4)}`,
                    `0 0 22px rgba(90, 178, 255, ${0.4 * opacity})`,
                    `0 0 36px rgba(255, 71, 174, ${0.32 * opacity})`,
                ].join(', ');

                return (
                    <span
                        key={order}
                        style={{
                            fontSize: isChorus
                                ? item.isAscii
                                    ? '94px'
                                    : '104px'
                                : item.isAscii
                                  ? '78px'
                                  : '86px',
                            fontWeight: 900,
                            color: currentColor,
                            display: 'inline-block',
                            fontFamily: item.isKanji ? activeKanjiFontFamily : activeFontFamily,
                            letterSpacing: isChorus
                                ? item.isAscii
                                    ? '0.08em'
                                    : '0.04em'
                                : item.isAscii
                                  ? '0.06em'
                                  : '0.02em',
                            opacity,
                            transform: `translate(${horizontalDrift}px, ${landing + bounce + exitLift}px) scale(${squish}) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`,
                            filter: `blur(${blur}px) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.28))`,
                            whiteSpace: 'pre',
                            textShadow: textShadow3D,
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        {item.char}
                    </span>
                );
            })}
        </div>
    );
};
