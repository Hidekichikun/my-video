import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { normalizeLrcText } from '../resources/lyrics';
import { Lyrics, LyricLineData } from './Lyrics';

type Visual = {
    start: number;
    end: number;
    file: string;
    fadeFromBlack?: boolean;
    fadeDuration?: number;
};

const visualsTimeline: Visual[] = [
    { start: 0, end: 10.5, file: 'photo/mahou-shoujo-tanabe/intro-01.png' },
    { start: 10.5, end: 11.25, file: 'photo/mahou-shoujo-tanabe/intro-01.png' },
    { start: 11.25, end: 21, file: 'photo/mahou-shoujo-tanabe/intro-02.png' },
    {
        start: 21,
        end: 24,
        file: 'photo/mahou-shoujo-tanabe/intro-fade.png',
        fadeFromBlack: true,
        fadeDuration: 2.4,
    },
    { start: 24, end: 33.7, file: 'photo/mahou-shoujo-tanabe/scene-01.png' },
    { start: 33.7, end: 44.5, file: 'photo/mahou-shoujo-tanabe/scene-02.png' },
    { start: 44.5, end: 54.5, file: 'photo/mahou-shoujo-tanabe/scene-03.png' },
    {
        start: 54.5,
        end: 65.5,
        file: 'photo/mahou-shoujo-tanabe/scene-04.png',
        fadeFromBlack: true,
        fadeDuration: 1.1,
    },
    { start: 65.5, end: 80, file: 'photo/mahou-shoujo-tanabe/scene-05.png' },
    { start: 80, end: 81.625, file: 'photo/mahou-shoujo-tanabe/dot-1.png' },
    { start: 81.625, end: 83.25, file: 'photo/mahou-shoujo-tanabe/dot-2.png' },
    { start: 83.25, end: 84.875, file: 'photo/mahou-shoujo-tanabe/dot-3.png' },
    { start: 84.875, end: 86.5, file: 'photo/mahou-shoujo-tanabe/dot-4.png' },
    { start: 86.5, end: 96.5, file: 'photo/mahou-shoujo-tanabe/scene-06.png' },
    { start: 96.5, end: 106.9, file: 'photo/mahou-shoujo-tanabe/scene-07.png' },
    { start: 106.9, end: 117, file: 'photo/mahou-shoujo-tanabe/scene-08.png' },
    { start: 117, end: 126.9, file: 'photo/mahou-shoujo-tanabe/scene-09.png' },
    { start: 126.9, end: 137, file: 'photo/mahou-shoujo-tanabe/scene-08b.png' },
    { start: 137, end: 144.4, file: 'photo/mahou-shoujo-tanabe/scene-10.png' },
    { start: 144.4, end: 157, file: 'photo/mahou-shoujo-tanabe/scene-11.png' },
    { start: 157, end: 168.5, file: 'photo/mahou-shoujo-tanabe/scene-12.png' },
    { start: 168.5, end: 179.5, file: 'photo/mahou-shoujo-tanabe/scene-13.png' },
    { start: 179.5, end: 189.5, file: 'photo/mahou-shoujo-tanabe/scene-14.png' },
    { start: 189.5, end: 194.5, file: 'photo/mahou-shoujo-tanabe/scene-15.png' },
    { start: 194.5, end: 200, file: 'photo/mahou-shoujo-tanabe/scene-15b.png' },
    { start: 200, end: 215, file: 'photo/mahou-shoujo-tanabe/scene-16.png' },
];

const loadNikumaruFont = async () => {
    const fonts = [
        new FontFace('Nikumaru', `url(${staticFile('fonts/nikumaru.otf')}) format('opentype')`),
        new FontFace(
            'Todono Glitch Mincho',
            `url(${staticFile('fonts/todono-glitch-mincho-h3.otf')}) format('opentype')`
        ),
        new FontFace('Hanazome', `url(${staticFile('fonts/hanazome.ttf')}) format('truetype')`),
    ];

    const loaded = await Promise.all(fonts.map((font) => font.load()));
    loaded.forEach((font) => document.fonts.add(font));
};

const parseLrcExtended = (lrc: string): LyricLineData[] => {
    const normalized = normalizeLrcText(lrc);
    const lines = normalized.split('\n');
    const entries: LyricLineData[] = [];
    const timeRegex = /\[(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\.(\d{1,3}))?\]/g;

    const toSeconds = (match: RegExpExecArray) => {
        const part1 = parseInt(match[1], 10);
        const part2 = parseInt(match[2], 10);
        const part3 = match[3] ? parseInt(match[3], 10) : undefined;
        const part4 = match[4] ? parseInt(match[4], 10) : 0;
        const milliseconds =
            match[4] && match[4].length === 3 ? part4 / 1000 : part4 / 100;

        if (part3 !== undefined) {
            return part1 * 3600 + part2 * 60 + part3 + milliseconds;
        }
        return part1 * 60 + part2 + milliseconds;
    };

    for (const line of lines) {
        const matches = [...line.matchAll(timeRegex)];
        if (matches.length === 0) continue;

        matches.forEach((match, index) => {
            const startIndex = (match.index ?? 0) + match[0].length;
            const endIndex =
                index + 1 < matches.length ? matches[index + 1].index ?? line.length : line.length;
            const text = line.slice(startIndex, endIndex).trim();
            if (!text) return;
            entries.push({ time: toSeconds(match), text });
        });
    }

    return entries.sort((a, b) => a.time - b.time);
};

export const MahouShojoTanabe: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    const [lrcContent, setLrcContent] = useState<string | null>(null);
    const [fontHandle] = useState(() => delayRender('nikumaru-font'));

    useEffect(() => {
        loadNikumaruFont()
            .catch((err) => console.error('Failed to load Nikumaru font:', err))
            .finally(() => continueRender(fontHandle));
    }, [fontHandle]);

    useEffect(() => {
        const controller = new AbortController();
        fetch(staticFile('lyrics/mahou-shoujo-tanabe.lrc'), { signal: controller.signal })
            .then((res) => res.text())
            .then((text) => setLrcContent(text))
            .catch((err) => {
                if ((err as any)?.name === 'AbortError') return;
                console.error('Failed to load LRC:', err);
                setLrcContent('');
            });
        return () => controller.abort();
    }, []);

    const lyricLines = useMemo(
        () => (lrcContent ? parseLrcExtended(lrcContent) : []),
        [lrcContent]
    );

    const nowSeconds = frame / fps;
    const activeVisual =
        visualsTimeline.find((visual) => nowSeconds >= visual.start && nowSeconds < visual.end) ??
        visualsTimeline[visualsTimeline.length - 1];
    const [currentVisual, setCurrentVisual] = useState(activeVisual);
    const [previousVisual, setPreviousVisual] = useState<Visual | null>(null);
    const [switchFrame, setSwitchFrame] = useState(frame);

    useEffect(() => {
        if (activeVisual.file !== currentVisual.file) {
            setPreviousVisual(currentVisual);
            setCurrentVisual(activeVisual);
            setSwitchFrame(frame);
        }
    }, [activeVisual, currentVisual, frame]);


    const fadeDuration = activeVisual.fadeDuration ?? 0.8;
    const fadeInOpacity = activeVisual.fadeFromBlack
        ? interpolate(nowSeconds, [activeVisual.start, activeVisual.start + fadeDuration], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
          })
        : 1;

    const containFiles = [
        'photo/mahou-shoujo-tanabe/scene-05.png',
        'photo/mahou-shoujo-tanabe/dot-1.png',
        'photo/mahou-shoujo-tanabe/dot-2.png',
        'photo/mahou-shoujo-tanabe/dot-3.png',
        'photo/mahou-shoujo-tanabe/dot-4.png',
        'photo/mahou-shoujo-tanabe/scene-08b.png',
        'photo/mahou-shoujo-tanabe/scene-09.png',
        'photo/mahou-shoujo-tanabe/scene-10.png',
        'photo/mahou-shoujo-tanabe/scene-12.png',
        'photo/mahou-shoujo-tanabe/scene-13.png',
        'photo/mahou-shoujo-tanabe/scene-14.png',
        'photo/mahou-shoujo-tanabe/scene-16.png',
    ];
    const isContainFile = (file: string) => containFiles.includes(file);
    const fitContain = isContainFile(activeVisual.file);
    const noFadeVisuals = new Set([
        'photo/mahou-shoujo-tanabe/intro-01.png',
        'photo/mahou-shoujo-tanabe/dot-1.png',
        'photo/mahou-shoujo-tanabe/dot-2.png',
        'photo/mahou-shoujo-tanabe/dot-3.png',
        'photo/mahou-shoujo-tanabe/dot-4.png',
    ]);
    const isRightAligned = (file: string) =>
        file === 'photo/mahou-shoujo-tanabe/scene-09.png';
    const rightAlignedContain = isRightAligned(activeVisual.file);
    const slideAcross =
        activeVisual.file === 'photo/mahou-shoujo-tanabe/scene-09.png';
    const isSplitSlide = nowSeconds >= 65.5 && nowSeconds < 80;
    const isDualScene08b = activeVisual.file === 'photo/mahou-shoujo-tanabe/scene-08b.png';
    const isSlotLoop = false;
    const slideOnlyVisuals = new Set([
        'photo/mahou-shoujo-tanabe/scene-08b.png',
        'photo/mahou-shoujo-tanabe/scene-10.png',
        'photo/mahou-shoujo-tanabe/scene-14.png',
    ]);
    const isSlideOnly = slideOnlyVisuals.has(activeVisual.file);
    const isFirstVisual = activeVisual.file === 'photo/mahou-shoujo-tanabe/intro-01.png';
    const slowSway = isSlideOnly ? 0 : Math.sin(nowSeconds * 0.18) * 8;
    const driftX = isSlideOnly ? 0 : Math.sin(nowSeconds * 0.45) * 8;
    const driftY =
        isSlideOnly || isFirstVisual ? 0 : Math.cos(nowSeconds * 0.28) * 10 + slowSway;
    const switchKickFrames = Math.max(1, Math.round(fps * 0.18));
    const switchKickT = (frame - switchFrame) / switchKickFrames;
    const noKickVisuals = new Set([
        'photo/mahou-shoujo-tanabe/dot-1.png',
        'photo/mahou-shoujo-tanabe/dot-2.png',
        'photo/mahou-shoujo-tanabe/dot-3.png',
        'photo/mahou-shoujo-tanabe/dot-4.png',
    ]);
    const suppressSwitchKick =
        noKickVisuals.has(currentVisual.file) ||
        (previousVisual ? noKickVisuals.has(previousVisual.file) : false);
    const switchKick =
        !suppressSwitchKick && switchKickT >= 0 && switchKickT <= 1
            ? Math.sin(switchKickT * Math.PI) * (1 - switchKickT) * 28
            : 0;
    const intro02Wobble =
        currentVisual.file === 'photo/mahou-shoujo-tanabe/intro-02.png'
            ? Math.sin(nowSeconds * 1.2) * 2.5 + Math.sin(nowSeconds * 0.35) * 1.2
            : 0;
    const baseScale = 1.02 + Math.sin(nowSeconds * 0.2) * 0.004;
    const steppedScale = (() => {
        if (!isFirstVisual) return 1;
        if (nowSeconds < 3.5) return 0.3;
        if (nowSeconds < 7.0) return 0.6;
        return 1.0;
    })();
    const growFromCenter =
        activeVisual.file === 'photo/mahou-shoujo-tanabe/scene-10.png' && !isSlideOnly;
    const growScale = growFromCenter
        ? interpolate(
              nowSeconds,
              [activeVisual.start, activeVisual.end],
              [0.4, 1.0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          )
        : 1;
    const slideDirection =
        activeVisual.file === 'photo/mahou-shoujo-tanabe/scene-12.png' ? -1 : 1;
    const oscillateSlide = activeVisual.file === 'photo/mahou-shoujo-tanabe/scene-14.png';
    const slideX = slideAcross
        ? interpolate(
              nowSeconds,
              [activeVisual.start, activeVisual.end],
              [-420, 420],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          )
        : isSlideOnly
        ? oscillateSlide
            ? Math.sin(
                  ((nowSeconds - activeVisual.start) /
                      Math.max(0.01, activeVisual.end - activeVisual.start)) *
                      Math.PI *
                      2
              ) * 260
            : slideDirection *
              interpolate(
                  nowSeconds,
                  [activeVisual.start, activeVisual.end],
                  [-260, 260],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              )
        : 0;

    const loopDuration = 4.8;
    const loopT = ((nowSeconds - 65.5) % loopDuration + loopDuration) % loopDuration;
    const slideOffset = (loopT / loopDuration) * 1080;
    const slideScale = 1.5;
    const dualPhase = (nowSeconds - activeVisual.start) * 0.3;
    const dualProgress = (1 - Math.cos(dualPhase * Math.PI * 2)) / 2;
    const dualShiftLeft = interpolate(dualProgress, [0, 1], [-720, 160]);
    const dualShiftRight = interpolate(dualProgress, [0, 1], [720, -160]);

    const slotDuration = 5.6;
    const slotT = ((nowSeconds - activeVisual.start) % slotDuration + slotDuration) % slotDuration;
    const slotOffset = (slotT / slotDuration) * 1080;

    const scene11Fade =
        activeVisual.file === 'photo/mahou-shoujo-tanabe/scene-11.png'
            ? interpolate(
                  nowSeconds,
                  [activeVisual.start, activeVisual.end],
                  [1, 0],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              )
            : 1;
    const scene15bFade =
        currentVisual.file === 'photo/mahou-shoujo-tanabe/scene-15b.png'
            ? interpolate(
                  nowSeconds,
                  [currentVisual.start, currentVisual.end],
                  [1, 0],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              )
            : 1;
    const fadeFrames = Math.max(1, Math.round(fps * 0.6));
    const fadeProgress = interpolate(frame, [switchFrame, switchFrame + fadeFrames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const allowCrossfade =
        !noFadeVisuals.has(currentVisual.file) &&
        !(previousVisual && noFadeVisuals.has(previousVisual.file));
    const prevOpacity = previousVisual && allowCrossfade ? 1 - fadeProgress : 0;
    const currOpacity = allowCrossfade ? fadeProgress : 1;
    const effectiveFadeIn = allowCrossfade ? 1 : fadeInOpacity;
    const currentOpacity = effectiveFadeIn * scene11Fade * scene15bFade * currOpacity;

    const isPixelDeathScene = currentVisual.file === 'photo/mahou-shoujo-tanabe/scene-16.png';
    const pixelProgress = isPixelDeathScene
        ? interpolate(
              nowSeconds,
              [currentVisual.start, currentVisual.end],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          )
        : 0;
    const pixelCanvasRef = useRef<HTMLCanvasElement>(null);
    const pixelSize = 32;
    const pixelGrid = useMemo(() => {
        const cols = Math.ceil(width / pixelSize);
        const rows = Math.ceil(height / pixelSize);
        const total = cols * rows;
        const values = new Float32Array(total);
        let seed = 1337;
        for (let i = 0; i < total; i += 1) {
            seed = (seed * 1664525 + 1013904223) >>> 0;
            values[i] = (seed % 10000) / 10000;
        }
        return { cols, rows, values };
    }, [height, width]);

    useEffect(() => {
        if (!isPixelDeathScene) return;
        const canvas = pixelCanvasRef.current;
        if (!canvas) return;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#000';
        const { cols, values } = pixelGrid;
        const threshold = pixelProgress;
        for (let i = 0; i < values.length; i += 1) {
            if (values[i] > threshold) continue;
            const x = (i % cols) * pixelSize;
            const y = Math.floor(i / cols) * pixelSize;
            ctx.fillRect(x, y, pixelSize, pixelSize);
        }
    }, [frame, height, isPixelDeathScene, pixelGrid, pixelProgress, width]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', color: '#fff' }}>
            {previousVisual && allowCrossfade && (
                <Img
                    src={staticFile(previousVisual.file)}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: isContainFile(previousVisual.file) ? 'contain' : 'cover',
                        objectPosition: isRightAligned(previousVisual.file) ? '75% 50%' : '50% 50%',
                        backgroundColor: isContainFile(previousVisual.file) ? '#000' : 'transparent',
                        opacity: prevOpacity,
                    }}
                />
            )}
            {isSplitSlide ? (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        opacity: currentOpacity,
                    }}
                >
                        <div
                            style={{
                                position: 'relative',
                                width: '50%',
                                height: '100%',
                                overflow: 'hidden',
                                backgroundColor: '#000',
                            }}
                        >
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((copy) => (
                                <Img
                                    key={`left-loop-${copy}`}
                                    src={staticFile('photo/mahou-shoujo-tanabe/scene-04.png')}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: `${copy * 100}%`,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        transform: `scale(${slideScale}) translateY(${-slideOffset}px)`,
                                    }}
                                />
                            ))}
                        </div>
                        <div
                            style={{
                                position: 'relative',
                                width: '50%',
                                height: '100%',
                                overflow: 'hidden',
                                backgroundColor: '#000',
                            }}
                        >
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((copy) => (
                                <Img
                                    key={`right-loop-${copy}`}
                                    src={staticFile('photo/mahou-shoujo-tanabe/scene-05.png')}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: `${-copy * 100}%`,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        transform: `scale(${slideScale}) translateY(${slideOffset}px)`,
                                    }}
                                />
                            ))}
                        </div>
                </div>
            ) : isDualScene08b ? (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        opacity: currentOpacity,
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            width: '50%',
                            height: '100%',
                            overflow: 'hidden',
                            backgroundColor: '#000',
                        }}
                    >
                        <Img
                            src={staticFile('photo/mahou-shoujo-tanabe/scene-08c.png')}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                transform: `translateX(${dualShiftLeft}px)`,
                            }}
                        />
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            width: '50%',
                            height: '100%',
                            overflow: 'hidden',
                            backgroundColor: '#000',
                        }}
                    >
                        <Img
                            src={staticFile('photo/mahou-shoujo-tanabe/scene-08b.png')}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                objectPosition: '80% 50%',
                                transform: `translateX(${dualShiftRight}px)`,
                            }}
                        />
                    </div>
                </div>
            ) : isSlotLoop ? (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        overflow: 'hidden',
                        backgroundColor: '#000',
                        opacity: currentOpacity,
                    }}
                >
                    {[0, 1, 2, 3, 4, 5, 6].map((copy) => (
                        <Img
                            key={`slot-loop-${copy}`}
                            src={staticFile('photo/mahou-shoujo-tanabe/scene-13.png')}
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: `${copy * 100}%`,
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                transform: `translateY(${-slotOffset}px)`,
                            }}
                        />
                    ))}
                </div>
            ) : (
                <>
                    <Img
                        src={staticFile(currentVisual.file)}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: fitContain || isSlideOnly ? 'contain' : 'cover',
                            objectPosition: rightAlignedContain ? '75% 50%' : '50% 50%',
                            backgroundColor: fitContain || isSlideOnly ? '#000' : 'transparent',
                            opacity: currentOpacity,
                            transform: `translate(${driftX + slideX}px, ${
                                driftY + intro02Wobble + switchKick
                            }px) scale(${
                                (isSlideOnly ? 1 : baseScale) * steppedScale * growScale
                            })`,
                        }}
                    />
                    {isPixelDeathScene && (
                        <canvas
                            ref={pixelCanvasRef}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                opacity: currentOpacity,
                            }}
                        />
                    )}
                </>
            )}
            <AbsoluteFill
                style={{
                    background:
                        'linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.55) 75%, rgba(0,0,0,0.75) 100%)',
                }}
            />
            <Lyrics lines={lyricLines} />
            <Audio src={staticFile('music/mahou-shoujo-tanabe.mp3')} />
        </AbsoluteFill>
    );
};
