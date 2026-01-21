import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, staticFile, useVideoConfig } from 'remotion';
import { parseLrc, LyricLine as LyricLineType } from '../utils/lrc-parser';
import { WorldHateLine } from './WorldHateLine';

export const WorldHateProtocol: React.FC = () => {
    const [lyrics, setLyrics] = useState<LyricLineType[]>([]);
    const { fps } = useVideoConfig();

    useEffect(() => {
        fetch(staticFile('world-hate-protocol.lrc'))
            .then((res) => res.text())
            .then((text) => {
                const parsed = parseLrc(text);
                setLyrics(parsed);
            })
            .catch((err) => console.error('Failed to load lyrics', err));
    }, []);

    if (lyrics.length === 0) {
        return null;
    }

    return (
        <AbsoluteFill>
            {/* Dark blood-red gradient background */}
            <AbsoluteFill
                style={{
                    background: 'linear-gradient(180deg, #0a0000 0%, #1a0000 25%, #0f0000 50%, #1a0000 75%, #0a0000 100%)',
                }}
            />

            {/* Blood texture overlay */}
            <AbsoluteFill
                style={{
                    background: `
                        radial-gradient(circle at 20% 30%, rgba(139, 0, 0, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(139, 0, 0, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 50% 50%, rgba(165, 42, 42, 0.08) 0%, transparent 70%)
                    `,
                }}
            />

            {/* Cracked texture pattern */}
            <AbsoluteFill
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(139, 0, 0, 0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(139, 0, 0, 0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                    opacity: 0.3,
                }}
            />

            {/* Heavy vignette effect */}
            <AbsoluteFill
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.9) 100%)',
                }}
            />

            {/* Corruption scanlines */}
            <AbsoluteFill
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(139, 0, 0, 0.05) 0px, transparent 1px, transparent 3px, rgba(139, 0, 0, 0.05) 4px)',
                    pointerEvents: 'none',
                }}
            />

            {/* Audio */}
            <Audio src={staticFile('world-hate-protocol.mp3')} />

            {/* Title overlay at top */}
            <AbsoluteFill
                style={{
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    paddingTop: '50px',
                }}
            >
                <div
                    style={{
                        fontFamily: 'monospace',
                        fontSize: '28px',
                        fontWeight: 900,
                        letterSpacing: '0.2em',
                        color: '#8B0000',
                        textShadow: `
                            0 0 15px rgba(139, 0, 0, 0.9),
                            0 0 30px rgba(139, 0, 0, 0.6),
                            0 0 45px rgba(139, 0, 0, 0.4),
                            2px 2px 4px rgba(0, 0, 0, 0.9)
                        `,
                        textTransform: 'uppercase',
                        borderBottom: '3px solid rgba(139, 0, 0, 0.6)',
                        paddingBottom: '12px',
                        filter: 'contrast(1.3)',
                    }}
                >
                    WORLD_HATE.PROTOCOL
                </div>
            </AbsoluteFill>

            {/* Blood drip decorations from corners */}
            <div
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '40px',
                    width: '4px',
                    height: '150px',
                    background: 'linear-gradient(180deg, #8B0000 0%, transparent 100%)',
                    opacity: 0.6,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '0',
                    right: '60px',
                    width: '3px',
                    height: '120px',
                    background: 'linear-gradient(180deg, #A52A2A 0%, transparent 100%)',
                    opacity: 0.5,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '25%',
                    width: '2px',
                    height: '80px',
                    background: 'linear-gradient(180deg, #8B0000 0%, transparent 100%)',
                    opacity: 0.4,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '0',
                    right: '30%',
                    width: '3px',
                    height: '100px',
                    background: 'linear-gradient(180deg, #A52A2A 0%, transparent 100%)',
                    opacity: 0.5,
                }}
            />

            {/* Corner blood splatters */}
            <div
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    width: '80px',
                    height: '80px',
                    borderTop: '4px solid rgba(139, 0, 0, 0.7)',
                    borderLeft: '4px solid rgba(139, 0, 0, 0.7)',
                    boxShadow: '0 0 20px rgba(139, 0, 0, 0.5)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '80px',
                    height: '80px',
                    borderTop: '4px solid rgba(139, 0, 0, 0.7)',
                    borderRight: '4px solid rgba(139, 0, 0, 0.7)',
                    boxShadow: '0 0 20px rgba(139, 0, 0, 0.5)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    width: '80px',
                    height: '80px',
                    borderBottom: '4px solid rgba(139, 0, 0, 0.7)',
                    borderLeft: '4px solid rgba(139, 0, 0, 0.7)',
                    boxShadow: '0 0 20px rgba(139, 0, 0, 0.5)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    width: '80px',
                    height: '80px',
                    borderBottom: '4px solid rgba(139, 0, 0, 0.7)',
                    borderRight: '4px solid rgba(139, 0, 0, 0.7)',
                    boxShadow: '0 0 20px rgba(139, 0, 0, 0.5)',
                }}
            />

            {/* Lyrics */}
            <AbsoluteFill>
                {lyrics.map((line, index) => {
                    const nextLine = lyrics[index + 1];
                    const startTime = line.time * fps;
                    const endTime = nextLine ? nextLine.time * fps : startTime + 5 * fps;

                    return (
                        <WorldHateLine
                            key={index}
                            text={line.text}
                            enterTime={startTime}
                            exitTime={endTime}
                            index={index}
                        />
                    );
                })}
            </AbsoluteFill>

            {/* Bottom status bar with corruption theme */}
            <AbsoluteFill
                style={{
                    justifyContent: 'flex-end',
                    alignItems: 'flex-start',
                    padding: '30px',
                }}
            >
                <div
                    style={{
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        color: 'rgba(139, 0, 0, 0.7)',
                        letterSpacing: '0.15em',
                        textShadow: '0 0 10px rgba(139, 0, 0, 0.5)',
                    }}
                >
                    STATUS: CORRUPTED | PROTOCOL: ACTIVE | SYSTEM: FAILED
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
