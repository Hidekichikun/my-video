import React, { useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, Audio, Img, staticFile, useVideoConfig } from 'remotion';
import { FIRE_IN_MY_SENSES_LRC_FILE } from '../resources/lyrics';
import { parseLrc } from '../utils/lrc-parser';
import { LyricLine } from './LyricLine';

export const LyricVideo: React.FC = () => {
    const { fps } = useVideoConfig();
    const [lyrics, setLyrics] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const loadLyrics = async () => {
            try {
                const response = await fetch(staticFile(FIRE_IN_MY_SENSES_LRC_FILE), {
                    signal: controller.signal,
                });
                const text = await response.text();
                setLyrics(text);
            } catch (err) {
                if ((err as any)?.name === 'AbortError') return;
                console.error('Failed to load lyrics file:', err);
                setLyrics(''); // allow render to proceed even if fetch failed
            }
        };

        loadLyrics();
        return () => controller.abort();
    }, []);

    const parsedLyrics = useMemo(() => (lyrics ? parseLrc(lyrics) : []), [lyrics]);

    return (
        <AbsoluteFill>
            {/* Background Image */}
            <Img
                src={staticFile("fire-in-my-senses-bg.png")}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    filter: 'sepia(0.6) contrast(1.2)', // Sepia atmosphere
                }}
                alt="background"
            />

            {/* Dark overlay for better text readability */}
            <AbsoluteFill style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />

            <Audio src={staticFile("fire-in-my-senses.mp3")} />

            <AbsoluteFill>
                {parsedLyrics.map((line, index) => {
                    const nextLine = parsedLyrics[index + 1];
                    const enterTime = line.time * fps;
                    // End time is the start of the next line, or a default duration if it's the last line
                    const baseExit = nextLine ? nextLine.time * fps : enterTime + 5 * fps;
                    let exitTime = baseExit;
                    // Let key lines linger a bit more
                    if (line.text.includes('Break my Fire')) {
                        // Keep the line alive slightly past the following line
                        const afterNext = nextLine ? nextLine.time * fps + 0.5 * fps : enterTime + 3 * fps;
                        exitTime = Math.max(exitTime, afterNext);
                    }
                    if (line.text.includes('Inside of me')) {
                        const safeGap = nextLine ? nextLine.time * fps - 0.15 * fps : Infinity;
                        exitTime = Math.max(exitTime, enterTime + 4 * fps);
                        exitTime = Math.min(exitTime, safeGap); // avoid overlapping the next Japanese line
                    }
                    if (line.text.includes('汝らは務めよ')) {
                        exitTime = Math.max(exitTime, enterTime + 6 * fps); // carry into ~3:26
                    }
                    if (line.text.includes('歩くのだ')) {
                        exitTime = Math.max(exitTime, enterTime + 7 * fps); // slow fade on the final line
                    }

                    return (
                        <LyricLine
                            key={index}
                            text={line.text}
                            enterTime={enterTime}
                            exitTime={exitTime}
                        />
                    );
                })}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
