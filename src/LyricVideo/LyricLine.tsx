import React, { useEffect } from 'react';
import { interpolate, useCurrentFrame, continueRender, delayRender, staticFile } from 'remotion';
import { loadFont as loadOrbitron } from '@remotion/google-fonts/Orbitron';

const { fontFamily: orbitronFont } = loadOrbitron();

// Custom font definition
const loadCustomFont = async () => {
    const font = new FontFace(
        'Totono Glitch Mincho',
        `url(${staticFile('fonts/TotonoGlitchMincho.otf')}) format('opentype')`
    );
    await font.load();
    document.fonts.add(font);
};

interface LyricLineProps {
    text: string;
    enterTime: number;
    exitTime: number;
}

export const LyricLine: React.FC<LyricLineProps> = ({ text, enterTime, exitTime }) => {
    const frame = useCurrentFrame();

    // Load custom font
    useEffect(() => {
        const handle = delayRender();
        loadCustomFont()
            .then(() => continueRender(handle))
            .catch((err) => {
                console.error('Failed to load custom font:', err);
                continueRender(handle);
            });
    }, []);

    // Check if this is the special quote line (from "「汝" onwards)
    const isQuoteLine =
        text.includes('「汝') || text.includes('如来') || text.includes('歩くのは') || text.includes('歩くのだ');
    const isFinalLine = text.includes('歩くのだ');

    // Split text into segments (English words vs Japanese characters)
    const segments: Array<{ text: string; isEnglish: boolean }> = [];
    let currentSegment = '';
    let isCurrentEnglish = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const isAsciiWord = /[a-zA-Z0-9\s,.!?-]/.test(char);
        const isEnglishChar = isAsciiWord || char === '—';

        if (i === 0) {
            currentSegment = char;
            isCurrentEnglish = isEnglishChar;
        } else if (isEnglishChar === isCurrentEnglish) {
            currentSegment += char;
        } else {
            if (currentSegment.trim()) {
                segments.push({ text: currentSegment, isEnglish: isCurrentEnglish });
            }
            currentSegment = char;
            isCurrentEnglish = isEnglishChar;
        }
    }
    if (currentSegment.trim()) {
        segments.push({ text: currentSegment, isEnglish: isCurrentEnglish });
    }

    const staggerDelay = 2; // frames between each character/word
    const elementDuration = 8; // frames for each element to animate in
    const maxDisplayDuration = isQuoteLine ? 210 : isFinalLine ? 240 : 150; // Let quote/final lines linger longer

    // Collect Japanese and English segments separately
    const japaneseSegments = segments.filter((seg) => !seg.isEnglish);
    const englishSegments = segments.filter((seg) => seg.isEnglish);

    const hasJapanese = japaneseSegments.length > 0;
    const hasEnglish = englishSegments.length > 0;

    // Calculate timing for English and Japanese
    const englishEnterTime = enterTime;
    const englishExitTime = Math.min(enterTime + maxDisplayDuration, exitTime);
    const japaneseEnterTime = enterTime;
    const japaneseExitTime = Math.min(enterTime + maxDisplayDuration, exitTime);

    return (
        <>
            {/* English segments */}
            {hasEnglish &&
                englishSegments.map((segment, segIndex) => {
                    const isWhisperBreak = segment.text.trim().startsWith('Break my Fire ...');
                    const isMainBreak = segment.text.includes('Break my Fire in my senses');
                    const isInside = segment.text.includes('Inside of me');
                    // Only render if within English display time
                    if (frame < englishEnterTime || frame > englishExitTime) {
                        return null;
                    }

                    const startFrame = englishEnterTime;
                    const fadeInDuration = 12; // Faster, sharper fade in
                    const fadeInEnd = startFrame + fadeInDuration;
                    const fadeOutStart = isMainBreak
                        ? englishExitTime - 24
                        : isInside
                        ? englishExitTime - 24
                        : englishExitTime - 15; // give main/inside lines more tail

                    // Fade in progress
                    const fadeInProgress = interpolate(
                        frame,
                        [startFrame, fadeInEnd],
                        [0, 1],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                    );

                    // Fade out progress
                    const fadeOutProgress = interpolate(
                        frame,
                        [fadeOutStart, englishExitTime],
                        [1, 0],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                    );

                    const opacity = Math.min(fadeInProgress, fadeOutProgress);
                    const blur = isWhisperBreak
                        ? interpolate(
                              frame,
                              [startFrame, startFrame + 18, startFrame + 36, englishExitTime],
                              [0, 2, 10, 32],
                              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                          )
                        : interpolate(
                              frame,
                              [fadeOutStart, englishExitTime],
                              [0, 30],
                              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                          );
                    const glowStrength = interpolate(
                        frame,
                        [fadeOutStart, englishExitTime],
                        [0.9, 0.15],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                    );

                    // Dramatic close-up: zoom from 0.3 to 1.0
                    const scale = interpolate(
                        frame,
                        [startFrame, fadeInEnd],
                        [0.3, 1.0],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                    );

                    const translateY = interpolate(
                        frame,
                        [startFrame, fadeInEnd],
                        [50, 0],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                    );

                    // Whisper line: drift down-left and softly zoom in while fading
                    const whisperTranslateX = isWhisperBreak
                        ? interpolate(
                              frame,
                              [startFrame, englishExitTime],
                              [0, -110],
                              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                          )
                        : 0;
                    const whisperTranslateY = isWhisperBreak
                        ? interpolate(
                              frame,
                              [startFrame, englishExitTime],
                              [20, 170],
                              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                          )
                        : translateY;
                    const whisperScale = isWhisperBreak
                        ? interpolate(
                              frame,
                              [startFrame, englishExitTime],
                              [0.85, 1.30],
                              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                          )
                        : scale;

                    return (
                        <div
                            key={`english-${segIndex}`}
                            style={{
                                position: 'absolute',
                                width: '100%',
                                maxWidth: '90%',
                                textAlign: 'center',
                                top: isWhisperBreak ? '56%' : '50%',
                                left: '50%',
                                transform: isWhisperBreak
                                    ? `translate(-50%, -50%) translate(${whisperTranslateX}px, ${whisperTranslateY}px) scale(${whisperScale})`
                                    : `translate(-50%, -50%) scale(${scale}) translateY(${translateY}px)`,
                                opacity,
                                padding: '0 48px',
                                lineHeight: 1.08,
                                wordBreak: 'break-word',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '78px',
                                    fontWeight: '900',
                                    fontFamily: orbitronFont,
                                    color: '#FFFFFF',
                                    textShadow: isWhisperBreak
                                        ? '0 0 28px rgba(255, 255, 255, 0.5), 0 0 18px rgba(255, 255, 255, 0.35)'
                                        : `0 0 40px rgba(255, 255, 255, ${glowStrength}), 0 0 24px rgba(255, 255, 255, ${
                                              glowStrength * 0.8
                                          })`,
                                    display: 'inline-block',
                                    filter: `blur(${blur}px)`,
                                    margin: '0 10px',
                                }}
                            >
                                {segment.text}
                            </span>
                        </div>
                    );
                })}

            {/* Japanese segments - positioned as a group in lower center-right area */}
            {hasJapanese &&
                (() => {
                    // Only render if within Japanese display time
                    if (frame < japaneseEnterTime || frame > japaneseExitTime) {
                        return null;
                    }

                    const japaneseText = japaneseSegments.map((seg) => seg.text).join('');
                    // Keep original spaces so they render as intended while staying on one line
                    const characters = Array.from(japaneseText);

                    return (
                        <div
                            style={
                                isQuoteLine
                                    ? {
                                          position: 'absolute',
                                          top: '50%',
                                          left: '50%',
                                          transform: 'translate(-50%, -50%)',
                                          display: 'flex',
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          flexWrap: 'nowrap',
                                          whiteSpace: 'nowrap',
                                          maxWidth: '100%',
                                          padding: '0 48px',
                                          gap: '10px',
                                      }
                                    : {
                                          position: 'absolute',
                                          left: '55%',
                                          bottom: '12%',
                                          transform: 'translateX(calc(-50% + 150px))',
                                          display: 'flex',
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          flexWrap: 'nowrap',
                                          whiteSpace: 'nowrap',
                                          maxWidth: '100%',
                                          padding: '0 48px',
                                          gap: '6px',
                                      }
                            }
                        >
                            {characters.map((char, charIndex) => {
                                const startFrame = japaneseEnterTime + charIndex * staggerDelay;
                                const endFrame = startFrame + elementDuration;

                                const progress = interpolate(
                                    frame,
                                    [startFrame, endFrame],
                                    [0, 1],
                                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                                );

                                const exitDuration = isFinalLine ? 45 : 15;
                                const exitProgress = interpolate(
                                    frame,
                                    [japaneseExitTime - exitDuration, japaneseExitTime],
                                    [1, 0],
                                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                                );

                                const opacity = Math.min(progress, exitProgress);
                                const scale = interpolate(progress, [0, 1], [0.5, 1]);
                                const translateY = interpolate(progress, [0, 1], [30, 0]);

                                const glitchX = isQuoteLine
                                    ? Math.sin((frame + charIndex * 5) * 0.7) * 2.2
                                    : 0;
                                const glitchY = isQuoteLine
                                    ? Math.cos((frame + charIndex * 7) * 0.9) * 2.0
                                    : 0;

                                return (
                                    <span
                                        key={`char-${charIndex}`}
                                        style={{
                                            fontSize: isQuoteLine ? '78px' : '50px',
                                            fontWeight: isQuoteLine ? '900' : '700',
                                            fontFamily: "'Totono Glitch Mincho', serif",
                                            color: isQuoteLine ? '#FFE6F0' : '#FFFFFF',
                                            textShadow: isQuoteLine
                                                ? '0 0 35px rgba(255, 182, 193, 0.9), 0 0 22px rgba(255, 192, 203, 0.7)'
                                                : '0 0 30px rgba(255, 255, 255, 0.8), 0 4px 8px rgba(0, 0, 0, 0.9)',
                                            display: 'inline-block',
                                            letterSpacing: isQuoteLine ? '3px' : 'normal',
                                            filter: isQuoteLine ? 'blur(0.3px)' : 'none',
                                            opacity,
                                            transform: `scale(${scale}) translate(${glitchX}px, ${translateY + glitchY}px)`,
                                            marginRight: '2px',
                                        }}
                                    >
                                        {char}
                                    </span>
                                );
                            })}
                        </div>
                    );
                })()}
        </>
    );
};
