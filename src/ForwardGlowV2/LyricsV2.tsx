import React from 'react';
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import type { LyricLine } from '../utils/lrc-parser';
import { END_CARD_START, Mode, modeAt, nextModeChange } from './timeline';

const FONT = "'Genkai Mincho', 'Noto Serif JP', serif";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

type Timed = {
    text: string;
    start: number;
    end: number;
    mode: Mode;
    idx: number;
    blockId: number;
    isBlockLast: boolean;
};

const glow = '0 0 18px rgba(255,190,120,0.55), 0 0 42px rgba(255,150,80,0.25), 0 3px 10px rgba(0,0,0,0.65)';

/** 1文字ずつふわっと出す */
const CharReveal: React.FC<{ text: string; local: number; stagger: number; dur?: number }> = ({
    text,
    local,
    stagger,
    dur = 0.55,
}) => (
    <>
        {Array.from(text).map((ch, i) => {
            const p = interpolate(local - i * stagger, [0, dur], [0, 1], { ...clamp, easing: easeOut });
            return (
                <span
                    key={i}
                    style={{
                        display: 'inline-block',
                        opacity: p,
                        filter: `blur(${(1 - p) * 8}px)`,
                        transform: `translateY(${(1 - p) * 10}px)`,
                    }}
                >
                    {ch === ' ' ? '　' : ch}
                </span>
            );
        })}
    </>
);

/** Aメロ・Bメロ：左側に縦書き。新しい行が右に出て、前の行が左へ流れる */
const VerticalLyrics: React.FC<{ lines: Timed[]; t: number }> = ({ lines, t }) => {
    const curIdx = lines.findIndex((l) => l.start <= t && t < l.end);
    if (curIdx < 0) return null;
    const cur = lines[curIdx];
    const p = interpolate(t - cur.start, [0, 0.6], [0, 1], { ...clamp, easing: easeOut });
    // ブロックの最後の行は、次のブロック直前でフェードアウト
    const blockEndFade = cur.isBlockLast ? interpolate(t, [cur.end - 0.45, cur.end], [1, 0], clamp) : 1;

    const items: { line: Timed; x: number; opacity: number; local: number }[] = [];
    for (let k = 0; k <= 2; k++) {
        const line = lines[curIdx - k];
        if (!line || line.blockId !== cur.blockId) continue;
        const local = t - line.start;
        if (k === 0) items.push({ line, x: 640, opacity: 1, local });
        if (k === 1) items.push({ line, x: 640 - 150 * p, opacity: 1 - 0.62 * p, local });
        if (k === 2) items.push({ line, x: 490 - 150 * p, opacity: 0.38 * (1 - p), local });
    }

    return (
        <AbsoluteFill style={{ opacity: blockEndFade }}>
            {items.map(({ line, x, opacity, local }) => (
                <div
                    key={line.idx}
                    style={{
                        position: 'absolute',
                        left: x,
                        top: 130,
                        height: 820,
                        transform: 'translateX(-50%)',
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        fontFamily: FONT,
                        fontSize: 56,
                        letterSpacing: '0.16em',
                        lineHeight: 1,
                        color: '#fff8ee',
                        textShadow: glow,
                        opacity,
                        whiteSpace: 'nowrap',
                    }}
                >
                    <CharReveal text={line.text} local={local} stagger={0.055} />
                </div>
            ))}
        </AbsoluteFill>
    );
};

/** サビ：単語ごとにビート感のあるポップ。合いの手は大きく金色で */
const ChorusLyric: React.FC<{ line: Timed; t: number; outro: boolean }> = ({ line, t, outro }) => {
    const words = line.text.split(/\s+/).filter(Boolean);
    const isChant = words.length > 1;
    const local = t - line.start;
    const span = Math.max(0.6, line.end - line.start - 0.35);
    const exit = interpolate(t, [line.end - 0.22, line.end], [1, 0], clamp);
    const exitY = (1 - exit) * -14;

    if (isChant) {
        const step = Math.min(0.42, span / words.length);
        return (
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 800,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 30,
                    opacity: exit,
                    transform: `translateY(${exitY}px)`,
                }}
            >
                {words.map((w, i) => {
                    const p = interpolate(local - i * step, [0, 0.32], [0, 1], { ...clamp, easing: easeOut });
                    const scale = interpolate(p, [0, 1], [1.55, 1]);
                    return (
                        <span
                            key={i}
                            style={{
                                display: 'inline-block',
                                fontFamily: FONT,
                                fontSize: 70,
                                letterSpacing: '0.06em',
                                color: '#ffffff',
                                textShadow: glow,
                                opacity: p,
                                transform: `scale(${scale})`,
                                filter: `blur(${(1 - p) * 6}px)`,
                            }}
                        >
                            {w}
                        </span>
                    );
                })}
            </div>
        );
    }

    // 合いの手 / アウトロの「越えていけ」
    const dur = outro ? 1.6 : 0.4;
    const p = interpolate(local, [0, dur], [0, 1], { ...clamp, easing: easeOut });
    const outroExit = outro ? interpolate(t, [line.end - 1.2, line.end], [1, 0], clamp) : exit;
    return (
        <div
            style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: outro ? 760 : 780,
                textAlign: 'center',
                fontFamily: FONT,
                fontSize: outro ? 120 : 104,
                letterSpacing: '0.14em',
                color: '#ffe2b0',
                textShadow:
                    '0 0 24px rgba(255,180,90,0.85), 0 0 60px rgba(255,140,60,0.45), 0 4px 14px rgba(0,0,0,0.6)',
                opacity: p * outroExit,
                transform: `scale(${interpolate(p, [0, 1], [outro ? 1.08 : 1.3, 1])}) translateY(${exitY}px)`,
                filter: `blur(${(1 - p) * (outro ? 12 : 6)}px)`,
            }}
        >
            {line.text}
        </div>
    );
};

/** Cメロ：中央下にしずかに */
const DarkLyric: React.FC<{ line: Timed; t: number }> = ({ line, t }) => {
    const local = t - line.start;
    const exit = interpolate(t, [line.end - 0.5, line.end], [1, 0], clamp);
    const big = line.text.includes('大丈夫');
    return (
        <div
            style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: big ? 470 : 800,
                textAlign: 'center',
                fontFamily: FONT,
                fontSize: big ? 110 : 60,
                letterSpacing: big ? '0.3em' : '0.14em',
                color: '#eef3ff',
                textShadow: '0 0 20px rgba(170,200,255,0.5), 0 3px 12px rgba(0,0,0,0.7)',
                opacity: exit,
            }}
        >
            <CharReveal text={line.text} local={local} stagger={big ? 0.16 : 0.07} dur={big ? 1.0 : 0.7} />
        </div>
    );
};

export const prepareLyrics = (lyrics: LyricLine[]): Timed[] => {
    const timed: Timed[] = lyrics.map((l, i) => {
        const next = lyrics[i + 1];
        return {
            text: l.text,
            start: l.time,
            end: next ? next.time : Math.min(l.time + 3.5, END_CARD_START),
            mode: modeAt(l.time),
            idx: i,
            blockId: 0,
            isBlockLast: false,
        };
    });
    // 同じモードが続く範囲を1ブロックにする
    let block = 0;
    timed.forEach((l, i) => {
        if (i > 0 && (timed[i - 1].mode !== l.mode || l.start - timed[i - 1].start > 9)) block++;
        l.blockId = block;
    });
    timed.forEach((l, i) => {
        const next = timed[i + 1];
        l.isBlockLast = !next || next.blockId !== l.blockId;
        // ブロック最後の行が残りすぎないように
        if (l.isBlockLast && l.mode === 'panel') l.end = Math.min(l.end, l.start + 5.2);
        if (l.isBlockLast && l.mode === 'dark') l.end = Math.min(l.end, l.start + 5.5);
        if (!next) l.end = END_CARD_START - 0.3;
        l.end = Math.min(l.end, nextModeChange(l.start) - 0.05);
    });
    return timed;
};

export const LyricsV2: React.FC<{ lyrics: Timed[]; t: number }> = ({ lyrics, t }) => {
    const mode = modeAt(t);
    if (t >= END_CARD_START) return null;
    if (mode === 'panel') {
        return <VerticalLyrics lines={lyrics.filter((l) => l.mode === 'panel')} t={t} />;
    }
    const cur = lyrics.find((l) => l.start <= t && t < l.end && l.mode === mode);
    if (!cur) return null;
    if (mode === 'dark') return <DarkLyric line={cur} t={t} />;
    return <ChorusLyric line={cur} t={t} outro={cur.start >= 157} />;
};

