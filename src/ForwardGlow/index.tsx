import React, { useEffect, useMemo, useState } from 'react';
import {
    AbsoluteFill,
    Audio,
    Img,
    continueRender,
    delayRender,
    interpolate,
    staticFile,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { parseLrc } from '../utils/lrc-parser';
import { Lyrics } from './Lyrics';

type Visual = { file: string; objectPosition: string };

// Visual assignments based on the latest cue times (seconds)
const visualsTimeline: (Visual & { start: number; end: number })[] = [
    { start: 0, end: 22.57, file: 'forward-glow-01.png', objectPosition: '50% 36%' }, // intro
    { start: 22.57, end: 34.24, file: 'forward-glow-06.png', objectPosition: '50% 36%' }, // 静かに息を吸う 〜 前に 攻め…
    { start: 34.24, end: 55.67, file: 'forward-glow-02.png', objectPosition: '50% 38%' }, // 前に 攻め 跳ねて 進め 上げて 出でて 〜 傷ついて転んでも
    { start: 55.67, end: 66.64, file: 'forward-glow-03.png', objectPosition: '50% 34%' }, // 傷ついて転んでも 〜 遠回りした日々まで
    { start: 66.64, end: 77.59, file: 'forward-glow-09.png', objectPosition: '50% 34%' }, // 遠回りした日々まで 〜 目を閉じれば浮かぶ
    { start: 77.59, end: 92.42, file: 'forward-glow-12.png', objectPosition: '50% 38%' }, // 目を閉じれば浮かぶ 〜 進め 極め 挑め もっと 攻めて もっと 直前
    { start: 92.42, end: 113.79, file: 'forward-glow-17.png', objectPosition: '50% 36%' }, // 進め 極め 挑め もっと 攻めて もっと 〜 弱さがまだ残っても 直前
    { start: 113.79, end: 125.15, file: 'forward-glow-05.png', objectPosition: '50% 36%' }, // 心が走るほうへ後〜大丈夫直前
    { start: 125.15, end: 136.90, file: 'forward-glow-12.png', objectPosition: '50% 38%' }, // 大丈夫 〜 越えろ翔べよ直前
    { start: 136.90, end: 157.59, file: 'forward-glow-04.png', objectPosition: '50% 34%' }, // 越えろ 翔べよ… 〜 越えていけ
    { start: 157.59, end: 10_000, file: 'forward-glow-16.png', objectPosition: '50% 38%' }, // 越えていけ 以降
];

const darkPhase = {
    start: 113.79, // 01:53.79
    end: 136.9, // 02:16.90
};

const loadForwardGlowFonts = async () => {
    const fonts = [
        new FontFace('KlsMaru', `url(${staticFile('fonts/klsmaru.otf')}) format('opentype')`),
        new FontFace('Genkai Mincho', `url(${staticFile('fonts/GenkaiMincho.ttf')}) format('truetype')`),
    ];

    await Promise.all(
        fonts.map(async (font) => {
            const loaded = await font.load();
            document.fonts.add(loaded);
        })
    );
};

export const ForwardGlow: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const [lrcContent, setLrcContent] = useState<string | null>(null);
    const [fontHandle] = useState(() => delayRender('forward-glow-fonts'));

    useEffect(() => {
        loadForwardGlowFonts()
            .catch((err) => console.error('Failed to load Forward Glow fonts:', err))
            .finally(() => continueRender(fontHandle));
    }, [fontHandle]);

    useEffect(() => {
        const controller = new AbortController();
        fetch(staticFile('forward-glow.lrc'), { signal: controller.signal })
            .then((res) => res.text())
            .then((text) => setLrcContent(text))
            .catch((err) => {
                if ((err as any)?.name === 'AbortError') return;
                console.error('Failed to load LRC:', err);
                setLrcContent('');
            });

        return () => controller.abort();
    }, []);

    const parsedLyrics = useMemo(() => {
        return lrcContent ? parseLrc(lrcContent) : [];
    }, [lrcContent]);

    const nowSeconds = frame / fps;
    const desiredVisual = useMemo(() => {
        return (
            visualsTimeline.find((v) => nowSeconds >= v.start && nowSeconds < v.end) ??
            visualsTimeline[visualsTimeline.length - 1]
        );
    }, [nowSeconds]);

    const [currentVisual, setCurrentVisual] = useState<Visual>(desiredVisual);
    const [previousVisual, setPreviousVisual] = useState<Visual | null>(null);
    const [switchFrame, setSwitchFrame] = useState<number>(0);

    useEffect(() => {
        if (desiredVisual.file !== currentVisual.file) {
            setPreviousVisual(currentVisual);
            setCurrentVisual(desiredVisual);
            setSwitchFrame(frame);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [desiredVisual, frame]);

    const fadeDuration = Math.round(fps * 1.2);
    const progress = interpolate(frame, [switchFrame, switchFrame + fadeDuration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const currentOpacity = previousVisual ? 1 - progress : 1;
    const nextOpacity = previousVisual ? progress : 1;

    const float = Math.sin((frame / fps) * 2) * 4;
    const tilt = Math.sin((frame / fps) * 0.7) * 1.2;
    const vibrationBeats = [34.24, 45.54, 92.42, 102.62, 136.9, 148.02];

    const swayFor = (visual: Visual | null) => {
        if (!visual) return { x: 0, y: 0 };
        const strong = ['forward-glow-02.png', 'forward-glow-04.png', 'forward-glow-17.png'];
        const medium = ['forward-glow-03.png', 'forward-glow-09.png', 'forward-glow-13.png'];

        const initialKick =
            strong.includes(visual.file) && (frame - switchFrame) < 10
                ? Math.sin((frame - switchFrame) * 0.9) * 10
                : 0;

        // Extra micro-vibrations at specified beats (two quick pulses each)
        const extraVibration = vibrationBeats.reduce((acc, beat) => {
            const beatFrame = beat * fps;
            const windowFrames = fps * 1.2; // ~1.2s window per burst

            const local = frame - beatFrame;
            if (Math.abs(local) > windowFrames) return acc;

            const envelope = 1 - Math.abs(local) / windowFrames;
            const burst =
                Math.sin(local * 0.9) * 6 * envelope + // pulse 1
                Math.sin(local * 1.7) * 4 * envelope; // pulse 2

            return acc + burst;
        }, 0);

        const verticalOnly = strong.includes(visual.file);

        if (strong.includes(visual.file)) {
            const y = initialKick + Math.sin((frame - switchFrame) * 0.12) * 7 + extraVibration;
            return { x: verticalOnly ? 0 : y, y };
        }
        if (medium.includes(visual.file)) {
            const y = initialKick + Math.sin((frame - switchFrame) * 0.1) * 5 + extraVibration * 0.6;
            return { x: verticalOnly ? 0 : y, y };
        }
        const y = initialKick + Math.sin((frame - switchFrame) * 0.08) * 4 + extraVibration * 0.4;
        return { x: verticalOnly ? 0 : y, y };
    };

    const darkOpacity = interpolate(
        nowSeconds,
        [darkPhase.start, darkPhase.start + 6, darkPhase.end, darkPhase.end + 0.8],
        [0, 0.5, 0.65, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#000',
                overflow: 'hidden',
                color: '#fff',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '50%',
                    height: '100%',
                    background: '#000',
                    boxShadow: '8px 0 28px rgba(0,0,0,0.75)',
                }}
            />

            <div
                style={{
                    position: 'absolute',
                    top: '-4%',
                    right: '-6%',
                    width: '58%',
                    height: '108%',
                    overflow: 'hidden',
                    borderTopLeftRadius: 32,
                    borderBottomLeftRadius: 32,
                    boxShadow: '0 0 32px rgba(0,0,0,0.5)',
                }}
            >
                {(() => {
                    const baseStyle = {
                        position: 'absolute' as const,
                        inset: 0,
                        objectFit: 'cover' as const,
                        width: '100%',
                        height: '100%',
                    };
                    const prevSway = swayFor(previousVisual);
                    const currSway = swayFor(currentVisual);
                    const prevTransform = (v: Visual) =>
                        `translateX(${prevSway.x}px) translateY(${float * 0.3 + prevSway.y}px) rotate(${tilt * 0.18}deg)`;
                    const currTransform = (v: Visual) =>
                        `translateX(${currSway.x}px) translateY(${float * 0.3 + currSway.y}px) rotate(${tilt * 0.18}deg)`;
                    return (
                        <>
                            {previousVisual && (
                                <Img
                                    src={staticFile(previousVisual.file)}
                                    style={{
                                        ...baseStyle,
                                        objectPosition: previousVisual.objectPosition,
                                        opacity: currentOpacity,
                                        transform: prevTransform(previousVisual),
                                    }}
                                />
                            )}
                            <Img
                                src={staticFile(currentVisual.file)}
                                style={{
                                    ...baseStyle,
                                    objectPosition: currentVisual.objectPosition,
                                    opacity: nextOpacity,
                                    transform: currTransform(currentVisual),
                                }}
                            />
                        </>
                    );
                })()}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: '#000',
                        opacity: darkOpacity,
                        pointerEvents: 'none',
                    }}
                />
            </div>

            <div
                style={{
                    position: 'absolute',
                    top: 44,
                    left: 52,
                    padding: '12px 18px',
                    borderRadius: 999,
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    background: 'rgba(12, 10, 26, 0.5)',
                    boxShadow: '0 0 18px rgba(255, 255, 255, 0.12)',
                    letterSpacing: '0.06em',
                    fontFamily: "'KlsMaru', 'Genkai Mincho', serif",
                    fontSize: 22,
                    textTransform: 'uppercase',
                }}
            >
                Forward Glow
            </div>

            <div
                style={{
                    position: 'absolute',
                    bottom: 46,
                    left: 60,
                    width: '62%',
                    height: 6,
                    borderRadius: 999,
                    background: 'rgba(255, 255, 255, 0.18)',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: `${Math.min(100, (frame / (fps * 180)) * 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #ff73d3 0%, #7ef7ff 50%, #c6ff7a 100%)',
                        boxShadow: '0 0 18px rgba(255, 115, 211, 0.35)',
                    }}
                />
            </div>

            <Lyrics lyrics={parsedLyrics} />

            <Audio src={staticFile('forward-glow.mp3')} />
        </AbsoluteFill>
    );
};
