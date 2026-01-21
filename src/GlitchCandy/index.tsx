import React, { useEffect, useState } from 'react';
import {
    AbsoluteFill,
    Audio,
    continueRender,
    delayRender,
    staticFile,
    useVideoConfig,
} from 'remotion';
import { parseLrc, LyricLine as LyricLineType } from '../utils/lrc-parser';
import { GlitchLine } from './GlitchLine';

export const GlitchCandy: React.FC = () => {
    const [lyrics, setLyrics] = useState<LyricLineType[]>([]);
    const [fontHandle] = useState(() => delayRender('glitch-candy-font'));
    const { fps } = useVideoConfig();
    const glitchFontFamily = "'FuwaFude', 'M PLUS Rounded 1c', sans-serif";
    const kanjiFontFamily = "'KlsMaru', 'FuwaFude', 'M PLUS Rounded 1c', sans-serif";

    useEffect(() => {
        const fuwaFude = new FontFace(
            'FuwaFude',
            `url(${staticFile('fonts/FuwaFude.ttf')}) format('truetype')`
        );
        const klsMaru = new FontFace(
            'KlsMaru',
            `url(${staticFile('fonts/klsmaru.otf')}) format('opentype')`
        );

        Promise.all(
            [fuwaFude, klsMaru].map((font) =>
                font
                    .load()
                    .then((loaded) => {
                        document.fonts.add(loaded);
                    })
                    .catch((err) => {
                        console.error(`Failed to load font ${font.family}:`, err);
                    })
            )
        ).finally(() => continueRender(fontHandle));
    }, [fontHandle]);

    useEffect(() => {
        fetch(staticFile('glitch-candy-v2.lrc'))
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
            <AbsoluteFill
                style={{
                    backgroundImage: `url(${staticFile('glitch-candy-v2-bg.png')})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <AbsoluteFill
                style={{
                    background:
                        'linear-gradient(180deg, rgba(9, 7, 16, 0.72) 0%, rgba(9, 7, 16, 0.35) 45%, rgba(9, 7, 16, 0.65) 100%), radial-gradient(circle at 20% 25%, rgba(255, 79, 177, 0.3), transparent 32%), radial-gradient(circle at 80% 70%, rgba(94, 186, 255, 0.25), transparent 38%)',
                }}
            />

            <Audio src={staticFile('glitch-candy-v2.mp3')} />

            <AbsoluteFill>
                {lyrics.map((line, index) => {
                    const nextLine = lyrics[index + 1];
                    const startTime = line.time * fps;
                    const endTime = nextLine ? nextLine.time * fps : startTime + 5 * fps;

                    return (
                        <GlitchLine
                            key={index}
                            text={line.text}
                            enterTime={startTime}
                            exitTime={endTime}
                            isChorus={line.isChorus}
                            fontFamily={glitchFontFamily}
                            kanjiFontFamily={kanjiFontFamily}
                        />
                    );
                })}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
