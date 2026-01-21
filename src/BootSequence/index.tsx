import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, staticFile, useVideoConfig } from 'remotion';
import { parseLrc, LyricLine as LyricLineType } from '../utils/lrc-parser';
import { BootSequenceLine } from './BootSequenceLine';

export const BootSequence: React.FC = () => {
    const [lyrics, setLyrics] = useState<LyricLineType[]>([]);
    const { fps } = useVideoConfig();

    useEffect(() => {
        fetch(staticFile('boot-sequence-00.lrc'))
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
            {/* Dark tech background with grid */}
            <AbsoluteFill
                style={{
                    background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
                }}
            />

            {/* Grid pattern overlay */}
            <AbsoluteFill
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                    opacity: 0.4,
                }}
            />

            {/* Vignette effect */}
            <AbsoluteFill
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.8) 100%)',
                }}
            />

            {/* Scanline overlay */}
            <AbsoluteFill
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 255, 136, 0.03) 0px, transparent 1px, transparent 2px, rgba(0, 255, 136, 0.03) 3px)',
                    pointerEvents: 'none',
                }}
            />

            {/* Audio */}
            <Audio src={staticFile('boot-sequence-00.mp3')} />

            {/* Title overlay at top */}
            <AbsoluteFill
                style={{
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    paddingTop: '60px',
                }}
            >
                <div
                    style={{
                        fontFamily: 'Orbitron, monospace',
                        fontSize: '32px',
                        fontWeight: 900,
                        letterSpacing: '0.15em',
                        color: '#00ff88',
                        textShadow: `
                            0 0 10px rgba(0, 255, 136, 0.8),
                            0 0 20px rgba(0, 255, 136, 0.6),
                            0 0 30px rgba(0, 255, 136, 0.4)
                        `,
                        textTransform: 'uppercase',
                        borderBottom: '2px solid rgba(0, 255, 136, 0.5)',
                        paddingBottom: '10px',
                    }}
                >
                    BOOT_SEQUENCE__00
                </div>
            </AbsoluteFill>

            {/* Corner decorations */}
            <div
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    width: '60px',
                    height: '60px',
                    borderTop: '3px solid rgba(0, 255, 136, 0.6)',
                    borderLeft: '3px solid rgba(0, 255, 136, 0.6)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderTop: '3px solid rgba(0, 255, 136, 0.6)',
                    borderRight: '3px solid rgba(0, 255, 136, 0.6)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    width: '60px',
                    height: '60px',
                    borderBottom: '3px solid rgba(0, 255, 136, 0.6)',
                    borderLeft: '3px solid rgba(0, 255, 136, 0.6)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderBottom: '3px solid rgba(0, 255, 136, 0.6)',
                    borderRight: '3px solid rgba(0, 255, 136, 0.6)',
                }}
            />

            {/* Lyrics */}
            <AbsoluteFill>
                {lyrics.map((line, index) => {
                    const nextLine = lyrics[index + 1];
                    const startTime = line.time * fps;
                    const endTime = nextLine ? nextLine.time * fps : startTime + 5 * fps;

                    return (
                        <BootSequenceLine
                            key={index}
                            text={line.text}
                            enterTime={startTime}
                            exitTime={endTime}
                            index={index}
                        />
                    );
                })}
            </AbsoluteFill>

            {/* Bottom status bar */}
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
                        fontSize: '14px',
                        color: 'rgba(0, 255, 136, 0.6)',
                        letterSpacing: '0.1em',
                    }}
                >
                    SYSTEM STATUS: ACTIVE | PROTOCOL: OVERRIDE | AUTH: GRANTED
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
