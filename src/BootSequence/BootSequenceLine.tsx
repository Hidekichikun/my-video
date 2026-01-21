import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Orbitron';

const { fontFamily } = loadFont();

interface BootSequenceLineProps {
    text: string;
    enterTime: number;
    exitTime: number;
    index: number;
}

export const BootSequenceLine: React.FC<BootSequenceLineProps> = ({
    text,
    enterTime,
    exitTime,
    index
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Calculate if this line should be visible
    if (frame < enterTime || frame > exitTime) {
        return null;
    }

    const localFrame = frame - enterTime;
    const displayDuration = exitTime - enterTime;

    // Typewriter effect - reveal characters one by one
    const charsPerSecond = 25; // Speed of typing
    const totalChars = text.length;
    const typewriterDuration = Math.min(totalChars / charsPerSecond * fps, displayDuration * 0.4);

    const visibleChars = Math.floor(
        interpolate(
            localFrame,
            [0, typewriterDuration],
            [0, totalChars],
            { extrapolateRight: 'clamp' }
        )
    );

    // Initial glitch effect
    const glitchIntensity = interpolate(
        localFrame,
        [0, 8, 16],
        [8, 4, 0],
        { extrapolateRight: 'clamp' }
    );

    // RGB split effect
    const rgbSplit = interpolate(
        localFrame,
        [0, 12],
        [4, 0],
        { extrapolateRight: 'clamp' }
    );

    // Fade in
    const opacity = interpolate(
        localFrame,
        [0, 6],
        [0, 1],
        { extrapolateRight: 'clamp' }
    );

    // Fade out at the end
    const fadeOut = interpolate(
        frame,
        [exitTime - 15, exitTime],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const finalOpacity = Math.min(opacity, fadeOut);

    // Random glitch offset for this specific line
    const glitchOffset = (index * 17) % 7 - 3;

    // Scanline effect position
    const scanlinePosition = (frame * 3) % 1080;

    const visibleText = text.substring(0, visibleChars);
    const cursor = localFrame < typewriterDuration ? '█' : '';

    return (
        <div
            style={{
                position: 'absolute',
                width: '100%',
                textAlign: 'center',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, calc(-50% + ${index * 80 - 200}px))`,
                fontFamily,
                fontSize: '56px',
                fontWeight: 900,
                letterSpacing: '0.08em',
                color: '#00ff88',
                opacity: finalOpacity,
                textTransform: 'uppercase',
                filter: `blur(${glitchIntensity * 0.3}px)`,
            }}
        >
            {/* Main text with glow */}
            <div
                style={{
                    position: 'relative',
                    display: 'inline-block',
                    textShadow: `
                        0 0 10px rgba(0, 255, 136, 0.8),
                        0 0 20px rgba(0, 255, 136, 0.6),
                        0 0 30px rgba(0, 255, 136, 0.4),
                        0 0 40px rgba(0, 255, 136, 0.2),
                        ${rgbSplit}px 0 0 rgba(255, 0, 0, 0.5),
                        ${-rgbSplit}px 0 0 rgba(0, 255, 255, 0.5)
                    `,
                    transform: `translateX(${glitchOffset * glitchIntensity * 0.5}px)`,
                }}
            >
                {visibleText}
                <span
                    style={{
                        color: '#00ff88',
                        animation: 'blink 1s step-end infinite',
                    }}
                >
                    {cursor}
                </span>
            </div>

            {/* Scanline overlay effect */}
            {localFrame > 0 && (
                <div
                    style={{
                        position: 'fixed',
                        top: scanlinePosition,
                        left: 0,
                        width: '100%',
                        height: '2px',
                        background: 'rgba(0, 255, 136, 0.3)',
                        pointerEvents: 'none',
                        opacity: 0.5,
                    }}
                />
            )}

            {/* Glitch bars */}
            {glitchIntensity > 2 && (
                <>
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: `${(frame * 7) % 100}%`,
                            width: '2px',
                            height: '100%',
                            background: 'rgba(0, 255, 255, 0.6)',
                            transform: 'translateY(-50%)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: `${(frame * 11) % 100}%`,
                            width: '2px',
                            height: '100%',
                            background: 'rgba(255, 0, 255, 0.6)',
                            transform: 'translateY(-50%)',
                        }}
                    />
                </>
            )}

            <style>
                {`
                    @keyframes blink {
                        0%, 50% { opacity: 1; }
                        51%, 100% { opacity: 0; }
                    }
                `}
            </style>
        </div>
    );
};
