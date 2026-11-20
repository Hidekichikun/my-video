import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import type { LyricLine } from '../utils/lrc-parser';
import { END_TITLE_START } from './timeline';
import { FONT, clamp, easeOut } from './style';

// 歌詞の見せ方は「パート」で決める（ショートの切り替えとは別）
type Style = 'verse' | 'chorus' | 'night' | 'outro';

const styleAt = (t: number): Style => {
    if (t >= 209.3) return 'outro';
    if ((t >= 50.05 && t < 78.3) || (t >= 105.8 && t < 125.6) || (t >= 180.8 && t < 209.3)) return 'chorus';
    if (t >= 125.6 && t < 180.8) return 'night';
    return 'verse';
};

type Timed = { text: string; start: number; end: number; style: Style; idx: number };

const CAP: Record<Style, number> = { verse: 4.6, chorus: 3.6, night: 4.8, outro: 5.5 };

export const prepareLyrics = (lyrics: LyricLine[]): Timed[] =>
    lyrics.map((l, i) => {
        const next = lyrics[i + 1];
        const style = styleAt(l.time);
        let end = Math.min(next ? next.time : END_TITLE_START + 1.5, l.time + CAP[style]);
        if (!next) end = END_TITLE_START + 1.6;
        return { text: l.text, start: l.time, end, style, idx: i };
    });

/** 1文字ずつふわっと出す */
const CharReveal: React.FC<{ text: string; local: number; stagger: number; dur?: number }> = ({
    text,
    local,
    stagger,
    dur = 0.5,
}) => (
    <>
        {Array.from(text).map((ch, i) => {
            const p = interpolate(local - i * stagger, [0, dur], [0, 1], { ...clamp, easing: easeOut });
            return (
                <span
                    key={i}
                    style={{
                        display: 'inline-block',
                        whiteSpace: 'pre',
                        opacity: p,
                        filter: `blur(${(1 - p) * 7}px)`,
                        transform: `translateY(${(1 - p) * 10}px)`,
                    }}
                >
                    {ch}
                </span>
            );
        })}
    </>
);

/** 英語のフレーズは単語ごとにポンッと */
const WordPop: React.FC<{ text: string; local: number; step: number }> = ({ text, local, step }) => (
    <>
        {text.split(' ').map((w, i) => {
            const p = interpolate(local - i * step, [0, 0.3], [0, 1], { ...clamp, easing: easeOut });
            return (
                <span
                    key={i}
                    style={{
                        display: 'inline-block',
                        margin: '0 0.22em',
                        opacity: p,
                        transform: `scale(${interpolate(p, [0, 1], [1.45, 1])})`,
                        filter: `blur(${(1 - p) * 6}px)`,
                    }}
                >
                    {w}
                </span>
            );
        })}
    </>
);

const isEnglish = (s: string) => /^[\x20-\x7E’]+$/.test(s);

const LINE_STYLE: Record<Style, React.CSSProperties> = {
    verse: {
        top: 868,
        fontSize: 54,
        letterSpacing: '0.12em',
        color: '#fff7ec',
        textShadow: '0 0 16px rgba(255,170,100,0.45), 0 3px 10px rgba(0,0,0,0.8)',
    },
    chorus: {
        top: 840,
        fontSize: 70,
        letterSpacing: '0.08em',
        color: '#ffffff',
        textShadow: '0 0 20px rgba(255,100,180,0.75), 0 0 48px rgba(255,80,160,0.35), 0 4px 12px rgba(0,0,0,0.7)',
    },
    night: {
        top: 860,
        fontSize: 56,
        letterSpacing: '0.14em',
        color: '#eef3ff',
        textShadow: '0 0 18px rgba(160,195,255,0.5), 0 3px 12px rgba(0,0,0,0.8)',
    },
    outro: {
        top: 840,
        fontSize: 64,
        letterSpacing: '0.12em',
        color: '#fff6ec',
        textShadow: '0 0 22px rgba(255,170,120,0.55), 0 3px 12px rgba(0,0,0,0.8)',
    },
};

const Line: React.FC<{ line: Timed; t: number }> = ({ line, t }) => {
    const local = t - line.start;
    const fadeOut = line.style === 'outro' ? 0.9 : 0.3;
    const exit = interpolate(t, [line.end - fadeOut, line.end], [1, 0], clamp);
    const eng = isEnglish(line.text);
    const st = LINE_STYLE[line.style];
    // アウトロの最後の2行は画面のまんなかに大きく
    const finale = line.style === 'outro' && line.start >= 230;
    const top = finale ? (line.start >= 235 ? 520 : 440) : (st.top as number);
    const size = finale ? 78 : (st.fontSize as number);

    let body: React.ReactNode;
    if (line.style === 'chorus' && eng) body = <WordPop text={line.text} local={local} step={0.2} />;
    else {
        const stagger = line.style === 'chorus' ? 0.04 : line.style === 'outro' ? 0.09 : 0.06;
        body = <CharReveal text={line.text} local={local} stagger={stagger} dur={line.style === 'outro' ? 0.9 : 0.5} />;
    }

    return (
        <div
            style={{
                ...st,
                position: 'absolute',
                left: 0,
                right: 0,
                top,
                fontSize: size,
                textAlign: 'center',
                fontFamily: FONT,
                whiteSpace: 'nowrap',
                opacity: exit,
                transform: `translateY(${(1 - exit) * -10}px)`,
            }}
        >
            {body}
        </div>
    );
};

export const Lyrics: React.FC<{ lyrics: Timed[]; t: number }> = ({ lyrics, t }) => {
    const shown = lyrics.filter((l) => l.start <= t && t < l.end);
    if (shown.length === 0) return null;
    // 基本は1行。アウトロの最後だけ2行重ねて残す
    const lines = shown.slice(-1);
    const last = lines[0];
    if (last.style === 'outro' && last.start >= 235) {
        const prev = lyrics[last.idx - 1];
        if (prev && t < prev.end + 4) lines.unshift({ ...prev, end: Math.max(prev.end, END_TITLE_START + 1.6) });
    }
    return (
        <AbsoluteFill>
            {lines.map((l) => (
                <Line key={l.idx} line={l} t={t} />
            ))}
        </AbsoluteFill>
    );
};
