import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Creepster';

const { fontFamily } = loadFont();

interface WorldHateLineProps {
    text: string;
    enterTime: number;
    exitTime: number;
    index: number;
}

export const WorldHateLine: React.FC<WorldHateLineProps> = ({
    text,
    enterTime,
    exitTime,
    index
}) => {
    const frame = useCurrentFrame();

    // Calculate if this line should be visible
    if (frame < enterTime || frame > exitTime) {
        return null;
    }

    const localFrame = frame - enterTime;

    // Check if this is a violent/emphasized word
    const isViolent = /FUCK|HATE|BREAK|ERASE|BURN|REJECT|REFUSE|COLLAPSE|DROP|TEAR|EXECUTE/i.test(text);
    const isAllCaps = text === text.toUpperCase() && text.length > 3;

    // Violent shake effect for emphasized words
    const shakeIntensity = isViolent ? 8 : 2;
    const shakeX = interpolate(
        localFrame % 4,
        [0, 2, 4],
        [-shakeIntensity, shakeIntensity, -shakeIntensity],
        { extrapolateRight: 'clamp' }
    );
    const shakeY = interpolate(
        (localFrame + 2) % 4,
        [0, 2, 4],
        [-shakeIntensity * 0.5, shakeIntensity * 0.5, -shakeIntensity * 0.5],
        { extrapolateRight: 'clamp' }
    );

    // Blood drip effect - slower for violent words
    const dripSpeed = isViolent ? 0.3 : 0.5;
    const dripAmount = interpolate(
        localFrame,
        [0, 30],
        [0, 20],
        { extrapolateRight: 'clamp' }
    ) * dripSpeed;

    // Entrance: violent slam effect
    const slamScale = interpolate(
        localFrame,
        [0, 4, 8],
        [isViolent ? 1.5 : 1.2, 0.95, 1],
        { extrapolateRight: 'clamp' }
    );

    // Glitch effect - more intense for violent words
    const glitchIntensity = interpolate(
        localFrame,
        [0, 10, 20],
        [isViolent ? 12 : 6, isViolent ? 6 : 3, 0],
        { extrapolateRight: 'clamp' }
    );

    // RGB split for corruption effect
    const rgbSplit = interpolate(
        localFrame,
        [0, 15],
        [isViolent ? 8 : 4, 0],
        { extrapolateRight: 'clamp' }
    );

    // Fade in with blood effect
    const opacity = interpolate(
        localFrame,
        [0, 8],
        [0, 1],
        { extrapolateRight: 'clamp' }
    );

    // Fade out
    const fadeOut = interpolate(
        frame,
        [exitTime - 20, exitTime],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const finalOpacity = Math.min(opacity, fadeOut);

    // Random corruption offset
    const corruptionOffset = (index * 23) % 11 - 5;

    // Blood color - darker red for violent words
    const bloodColor = isViolent ? '#8B0000' : '#A52A2A';
    const glowColor = isViolent ? 'rgba(139, 0, 0, 0.8)' : 'rgba(165, 42, 42, 0.6)';

    // Keep lyrics within a limited vertical range using modulo
    const verticalOffset = ((index % 6) - 2.5) * 70; // Cycles between -175px and +175px

    return (
        <div
            style={{
                position: 'absolute',
                width: '100%',
                maxWidth: '90%',
                left: '50%',
                textAlign: 'center',
                top: '50%',
                transform: `translate(-50%, calc(-50% + ${verticalOffset}px)) translate(${shakeX}px, ${shakeY}px) scale(${slamScale})`,
                fontFamily,
                fontSize: isAllCaps ? '56px' : '48px',
                fontWeight: 400,
                letterSpacing: '0.05em',
                color: bloodColor,
                opacity: finalOpacity,
                filter: `blur(${glitchIntensity * 0.2}px) contrast(1.2)`,
                padding: '0 20px',
            }}
        >
            {/* Main text with blood drip effect */}
            <div
                style={{
                    position: 'relative',
                    display: 'inline-block',
                    textShadow: `
                        0 ${dripAmount}px 0 ${bloodColor},
                        0 0 20px ${glowColor},
                        0 0 40px ${glowColor},
                        0 0 60px rgba(139, 0, 0, 0.4),
                        ${rgbSplit}px 0 0 rgba(255, 0, 0, 0.6),
                        ${-rgbSplit}px 0 0 rgba(0, 255, 255, 0.3),
                        2px 2px 4px rgba(0, 0, 0, 0.9)
                    `,
                    transform: `translateX(${corruptionOffset * glitchIntensity * 0.3}px)`,
                }}
            >
                {text}
            </div>

            {/* Blood splatter effect for violent words */}
            {isViolent && localFrame < 20 && (
                <>
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: `${20 + (frame * 3) % 60}%`,
                            width: `${interpolate(localFrame, [0, 20], [8, 3], { extrapolateRight: 'clamp' })}px`,
                            height: `${interpolate(localFrame, [0, 20], [8, 3], { extrapolateRight: 'clamp' })}px`,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, #8B0000, transparent)',
                            opacity: interpolate(localFrame, [0, 10, 20], [0.8, 0.4, 0], { extrapolateRight: 'clamp' }),
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: `${15 + (frame * 5) % 70}%`,
                            width: `${interpolate(localFrame, [0, 20], [6, 2], { extrapolateRight: 'clamp' })}px`,
                            height: `${interpolate(localFrame, [0, 20], [6, 2], { extrapolateRight: 'clamp' })}px`,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, #A52A2A, transparent)',
                            opacity: interpolate(localFrame, [0, 10, 20], [0.6, 0.3, 0], { extrapolateRight: 'clamp' }),
                        }}
                    />
                </>
            )}

            {/* Corruption bars */}
            {glitchIntensity > 3 && (
                <>
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: `${(frame * 13) % 100}%`,
                            width: '3px',
                            height: '120%',
                            background: 'rgba(139, 0, 0, 0.7)',
                            transform: 'translateY(-50%)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: `${(frame * 17) % 100}%`,
                            width: '2px',
                            height: '120%',
                            background: 'rgba(165, 42, 42, 0.5)',
                            transform: 'translateY(-50%)',
                        }}
                    />
                </>
            )}
        </div>
    );
};
