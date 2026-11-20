import React, { useEffect, useMemo, useState } from 'react';
import {
    AbsoluteFill,
    Audio,
    Easing,
    Img,
    continueRender,
    delayRender,
    interpolate,
    random,
    staticFile,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { I_CLOSE_MY_MIND_LRC } from './lyrics';

// I close my mind — リリックMV v3（1枚絵）
// 歩道橋でふり返る絵を1枚だけ。動きは「ほぼ気づかないズーム」と「色のうつり変わり」だけ。
// ところどころで、デジタル画面の横線グリッチが上から下へシャーッと流れる。

const W = 1920;
const H = 1080;
export const LYRIC_TOTAL_SECONDS = 241.5;
const INTRO_END = 14.6;
const END_TITLE_START = 237.6;
const FONT = "'Genkai Mincho', 'Noto Serif CJK JP', serif";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const IMG = staticFile('i-close-my-mind/v3/bg.jpg');
const IMG_R = staticFile('i-close-my-mind/v3/bg_r.jpg');
const IMG_C = staticFile('i-close-my-mind/v3/bg_c.jpg');

// ───────── 歌詞 ─────────
type Style = 'verse' | 'chorus' | 'night' | 'outro';
const styleAt = (t: number): Style => {
    if (t >= 209.3) return 'outro';
    if ((t >= 50.05 && t < 78.3) || (t >= 105.8 && t < 125.6) || (t >= 180.8 && t < 209.3)) return 'chorus';
    if (t >= 125.6 && t < 180.8) return 'night';
    return 'verse';
};
type Timed = { text: string; start: number; end: number; style: Style; idx: number };
const CAP: Record<Style, number> = { verse: 4.6, chorus: 3.6, night: 4.8, outro: 6.0 };

const parse = (lrc: string) =>
    lrc
        .split('\n')
        .map((l) => {
            const m = l.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/);
            if (!m) return null;
            return { time: parseInt(m[1], 10) * 60 + parseFloat(m[2]), text: m[3].trim() };
        })
        .filter((x): x is { time: number; text: string } => !!x && x.text.length > 0);

const prepare = (): Timed[] => {
    const ls = parse(I_CLOSE_MY_MIND_LRC);
    return ls.map((l, i) => {
        const next = ls[i + 1];
        const style = styleAt(l.time);
        let end = Math.min(next ? next.time : END_TITLE_START, l.time + CAP[style]);
        // 最後の2行は残して、エンドタイトルの前で消す
        if (l.time >= 230) end = END_TITLE_START + 0.8;
        return { text: l.text, start: l.time, end, style, idx: i };
    });
};

const isEnglish = (s: string) => /^[\x20-\x7E’]+$/.test(s);

// ───────── グリッチの出る場所（秒・強さ）─────────
// 少ないほど1回が効く。サビの入りだけ強め
type Sweep = { t: number; s: number };
const SWEEPS: Sweep[] = [
    { t: 2.0, s: 0.8 },
    { t: 14.3, s: 0.6 },
    { t: 28.05, s: 0.3 },
    { t: 46.6, s: 0.35 },
    { t: 49.85, s: 1.0 },
    { t: 57.9, s: 0.3 },
    { t: 68.3, s: 0.65 },
    { t: 78.1, s: 0.55 },
    { t: 91.85, s: 0.35 },
    { t: 105.6, s: 1.0 },
    { t: 113.9, s: 0.3 },
    { t: 125.3, s: 0.6 },
    { t: 149.5, s: 0.55 },
    { t: 158.1, s: 0.3 },
    { t: 172.5, s: 0.3 },
    { t: 180.6, s: 1.0 },
    { t: 196.4, s: 0.6 },
    { t: 209.1, s: 0.55 },
    { t: 230.8, s: 0.3 },
    { t: 237.4, s: 0.6 },
];
const sweepDur = (s: number) => 0.32 + s * 0.26;

/** 今流れているグリッチ（なければ null） */
const activeSweep = (t: number) => {
    for (const sw of SWEEPS) {
        const d = sweepDur(sw.s);
        if (t >= sw.t && t < sw.t + d) return { ...sw, p: (t - sw.t) / d, d };
    }
    return null;
};

// ───────── ゆっくり変わっていくもの ─────────
const ramp = (t: number, pts: [number, number][]) =>
    interpolate(
        t,
        pts.map((p) => p[0]),
        pts.map((p) => p[1]),
        { ...clamp, easing: Easing.inOut(Easing.sin) },
    );

/** 夜の深さ：Verse3〜ブリッジで青く静かに */
const nightAt = (t: number) => ramp(t, [[0, 0], [121, 0], [131, 1], [176, 1], [181.5, 0], [241.5, 0]]);
/** ラスサビ〜アウトロで、髪のピンクと街の灯りがじわっとあたたかく */
const warmAt = (t: number) => ramp(t, [[0, 0], [178, 0], [200, 1], [232, 1], [241.5, 0.7]]);

/** 絵そのもの（ズーム・パン込み） */
const Plate: React.FC<{ src: string; t: number; dx?: number; style?: React.CSSProperties }> = ({ src, t, dx = 0, style }) => {
    const p = interpolate(t, [0, LYRIC_TOTAL_SECONDS], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
    const zoom = 1.0 + p * 0.075; // 4分かけて1.075倍
    const panX = interpolate(p, [0, 1], [0.6, -0.9]); // %
    const panY = interpolate(p, [0, 1], [0, 1.0]);
    return (
        <Img
            src={src}
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: W,
                height: H,
                objectFit: 'cover',
                objectPosition: '50% 45%',
                transformOrigin: '60% 32%',
                transform: `translate(${dx}px, 0) translate(${panX}%, ${panY}%) scale(${zoom})`,
                ...style,
            }}
        />
    );
};

/** グリッチの帯：上から下へ流れる */
const GlitchBand: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
    const sw = activeSweep(t);
    if (!sw) return null;
    const { s, p } = sw;
    const e = Easing.inOut(Easing.quad)(p);
    const bandH = 90 + s * 230;
    const center = interpolate(e, [0, 1], [-bandH * 0.6, H + bandH * 0.6]);
    const top = center - bandH / 2;

    // 帯の中を細い横のスライスに切って、それぞれ横にずらす
    const slices: React.ReactNode[] = [];
    let y = Math.max(0, Math.floor(top));
    const bottom = Math.min(H, Math.ceil(top + bandH));
    let i = 0;
    const seed = `${sw.t}-${Math.floor(frame / 2)}`;
    while (y < bottom) {
        const h = Math.floor(4 + random(`h-${seed}-${i}`) * 34);
        const fall = 1 - Math.abs((y + h / 2 - center) / (bandH / 2)); // 帯の中心ほど強い
        const r = random(`x-${seed}-${i}`);
        const big = r > 0.82;
        const dx = (random(`d-${seed}-${i}`) - 0.5) * 2 * (big ? 140 : 46) * s * Math.max(0, fall);
        const split = (8 + random(`s-${seed}-${i}`) * 16) * s * Math.max(0.2, fall);
        const rgb = random(`c-${seed}-${i}`) > 0.45;
        slices.push(
            <div
                key={i}
                style={{ position: 'absolute', left: 0, top: y, width: W, height: h, overflow: 'hidden', background: '#000' }}
            >
                <div style={{ position: 'absolute', left: 0, top: -y, width: W, height: H }}>
                    {rgb ? (
                        <>
                            <Plate src={IMG_R} t={t} dx={dx + split} style={{ mixBlendMode: 'screen' }} />
                            <Plate src={IMG_C} t={t} dx={dx - split} style={{ mixBlendMode: 'screen' }} />
                        </>
                    ) : (
                        <Plate src={IMG} t={t} dx={dx} style={{ filter: `brightness(${1 + 0.25 * s * fall})` }} />
                    )}
                </div>
            </div>,
        );
        y += h;
        i++;
    }

    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            {slices}
            {/* 走査線 */}
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top,
                    width: W,
                    height: bandH,
                    opacity: 0.35 + 0.25 * s,
                    background:
                        'repeating-linear-gradient(180deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, rgba(0,0,0,0.35) 2px, rgba(0,0,0,0) 4px)',
                    mixBlendMode: 'overlay',
                }}
            />
            {/* 先頭の光るライン */}
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: top + bandH - 2,
                    width: W,
                    height: 2,
                    background: 'rgba(235,250,255,0.9)',
                    boxShadow: `0 0 ${10 + 18 * s}px rgba(120,230,255,0.9), 0 0 ${30 + 30 * s}px rgba(255,90,180,0.5)`,
                    opacity: 0.5 + 0.5 * s,
                }}
            />
        </AbsoluteFill>
    );
};

/** グリッチ中の文字のずれ量 */
const glitchJitter = (t: number, frame: number) => {
    const sw = activeSweep(t);
    if (!sw) return { dx: 0, split: 0 };
    const k = Math.floor(frame / 2);
    const amt = sw.s * Math.sin(Math.PI * sw.p);
    return {
        dx: (random(`tj-${k}`) - 0.5) * 22 * amt,
        split: (3 + random(`ts-${k}`) * 6) * amt,
    };
};

const rgbShadow = (split: number, base: string) =>
    split > 0.3 ? `${split}px 0 0 rgba(255,40,110,0.85), ${-split}px 0 0 rgba(40,230,255,0.85), ${base}` : base;

// ───────── 歌詞の描画 ─────────
const CharReveal: React.FC<{ text: string; local: number; stagger: number; dur: number }> = ({ text, local, stagger, dur }) => (
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
                        filter: `blur(${(1 - p) * 6}px)`,
                        transform: `translateY(${(1 - p) * 8}px)`,
                    }}
                >
                    {ch}
                </span>
            );
        })}
    </>
);

/** サビの英語：デジタルっぽくチカチカしながら出る */
const GlitchIn: React.FC<{ text: string; local: number; frame: number; seed: number }> = ({ text, local, frame, seed }) => {
    const k = Math.floor(frame / 2);
    const words = text.split(' ');
    return (
        <>
            {words.map((w, i) => {
                const l = local - i * 0.09;
                const on = l < 0 ? 0 : l < 0.22 ? (random(`gi-${seed}-${i}-${k}`) > 0.4 ? 1 : 0.15) : 1;
                const jit = l < 0.22 && l >= 0 ? (random(`gj-${seed}-${i}-${k}`) - 0.5) * 18 : 0;
                const sp = l < 0.3 && l >= 0 ? 7 : 0;
                return (
                    <span
                        key={i}
                        style={{
                            display: 'inline-block',
                            marginRight: '0.28em',
                            opacity: on,
                            transform: `translateX(${jit}px)`,
                            textShadow: sp ? `${sp}px 0 0 rgba(255,40,110,0.9), ${-sp}px 0 0 rgba(40,230,255,0.9)` : undefined,
                        }}
                    >
                        {w}
                    </span>
                );
            })}
        </>
    );
};

const SHADOW: Record<Style, string> = {
    verse: '0 0 18px rgba(255,170,110,0.35), 0 3px 12px rgba(0,0,0,0.85)',
    chorus: '0 0 26px rgba(255,90,170,0.55), 0 4px 16px rgba(0,0,0,0.8)',
    night: '0 0 20px rgba(150,190,255,0.45), 0 3px 12px rgba(0,0,0,0.85)',
    outro: '0 0 26px rgba(255,160,130,0.5), 0 3px 14px rgba(0,0,0,0.85)',
};
const COLOR: Record<Style, string> = { verse: '#fff6ea', chorus: '#ffffff', night: '#eef3ff', outro: '#fff4ec' };

const splitRows = (text: string, eng: boolean): string[] => {
    if (eng) {
        const c = text.indexOf(', ');
        if (c > 0 && text.length > 18) return [text.slice(0, c + 1), text.slice(c + 2)];
        return [text];
    }
    if (text.includes('　') && Array.from(text).length > 11) {
        const i = text.indexOf('　');
        return [text.slice(0, i), text.slice(i + 1)];
    }
    return [text];
};

const Line: React.FC<{ line: Timed; t: number; frame: number }> = ({ line, t, frame }) => {
    const local = t - line.start;
    const eng = isEnglish(line.text);
    const st = line.style;
    const fadeOut = st === 'outro' ? 1.2 : 0.35;
    const exit = interpolate(t, [line.end - fadeOut, line.end], [1, 0], clamp);
    const rows = splitRows(line.text, eng);

    let size: number;
    if (st === 'chorus') size = eng ? 112 : 70;
    else if (st === 'outro') size = eng ? 80 : 62;
    else size = eng ? 66 : 60;
    const finale = st === 'outro' && line.start >= 230;
    if (finale) size = 84;

    const { dx, split } = glitchJitter(t, frame);
    const letter = eng ? '0.02em' : st === 'chorus' ? '0.08em' : '0.1em';
    const bigEng = st === 'chorus' && eng;

    let charIdx = 0;
    return (
        <div
            style={{
                position: 'absolute',
                left: 140,
                bottom: finale ? (line.start >= 235 ? 190 : 300) : 168,
                fontFamily: FONT,
                color: COLOR[st],
                letterSpacing: letter,
                lineHeight: bigEng ? 1.02 : 1.3,
                fontStyle: eng && !bigEng ? 'italic' : undefined,
                opacity: exit,
                transform: `translate(${dx}px, ${(1 - exit) * -8}px)`,
                textShadow: rgbShadow(split, SHADOW[st]),
                whiteSpace: 'nowrap',
            }}
        >
            {rows.map((r, ri) => {
                const offset = charIdx;
                charIdx += Array.from(r).length;
                const rowLocal = local - (bigEng ? ri * 0.28 : 0);
                const stagger = st === 'chorus' ? 0.035 : st === 'outro' ? 0.08 : 0.055;
                return (
                    <div key={ri} style={{ fontSize: size, paddingLeft: bigEng && ri === 1 ? '0.6em' : 0 }}>
                        {bigEng ? (
                            <GlitchIn text={r} local={rowLocal} frame={frame} seed={line.idx * 10 + ri} />
                        ) : (
                            <CharReveal
                                text={r}
                                local={local - offset * stagger}
                                stagger={stagger}
                                dur={st === 'outro' ? 1.0 : 0.5}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const Lyrics: React.FC<{ lyrics: Timed[]; t: number; frame: number }> = ({ lyrics, t, frame }) => {
    const shown = lyrics.filter((l) => l.start <= t && t < l.end);
    if (!shown.length) return null;
    let lines = shown.slice(-1);
    // ラストの2行だけは重ねて残す
    const last = lines[0];
    if (last.start >= 235) {
        const prev = lyrics[last.idx - 1];
        if (prev && prev.start >= 230) lines = [prev, last];
    }
    return (
        <AbsoluteFill>
            {lines.map((l) => (
                <Line key={l.idx} line={l} t={t} frame={frame} />
            ))}
        </AbsoluteFill>
    );
};

// ───────── タイトル ─────────
const Title: React.FC<{ p: number; t: number; frame: number; size: number }> = ({ p, t, frame, size }) => {
    const { dx, split } = glitchJitter(t, frame);
    return (
        <div
            style={{
                position: 'absolute',
                left: 140,
                top: '50%',
                transform: `translate(${dx}px, -50%)`,
                fontFamily: FONT,
                color: '#fff',
                opacity: p,
                filter: `blur(${(1 - p) * 10}px)`,
            }}
        >
            <div
                style={{
                    fontSize: size,
                    letterSpacing: '0.04em',
                    lineHeight: 1.05,
                    textShadow: rgbShadow(split, '0 0 30px rgba(255,110,180,0.5), 0 4px 16px rgba(0,0,0,0.75)'),
                }}
            >
                I close
                <br />
                my mind
            </div>
            <div
                style={{
                    fontSize: size * 0.3,
                    letterSpacing: '0.7em',
                    marginTop: size * 0.32,
                    textShadow: '0 3px 12px rgba(0,0,0,0.8)',
                    opacity: 0.9,
                }}
            >
                六ツ扉
            </div>
        </div>
    );
};

const IntroTitle: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
    const p = interpolate(t, [2.1, 4.6], [0, 1], { ...clamp, easing: easeOut });
    const out = interpolate(t, [12.4, INTRO_END - 0.3], [1, 0], clamp);
    if (p <= 0 || out <= 0) return null;
    return <Title p={p * out} t={t} frame={frame} size={132} />;
};

const EndTitle: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
    const p = interpolate(t, [END_TITLE_START, END_TITLE_START + 2.0], [0, 1], { ...clamp, easing: easeOut });
    if (p <= 0) return null;
    return <Title p={p} t={t} frame={frame} size={112} />;
};

const Watermark: React.FC<{ t: number }> = ({ t }) => {
    const o =
        interpolate(t, [INTRO_END + 1, INTRO_END + 2.5], [0, 0.65], clamp) *
        interpolate(t, [END_TITLE_START - 2, END_TITLE_START - 0.5], [1, 0], clamp);
    if (o <= 0) return null;
    return (
        <div
            style={{
                position: 'absolute',
                top: 46,
                left: 58,
                fontFamily: FONT,
                fontSize: 24,
                letterSpacing: '0.18em',
                color: '#fff',
                opacity: o,
                textShadow: '0 2px 8px rgba(0,0,0,0.75)',
            }}
        >
            I close my mind <span style={{ opacity: 0.6, margin: '0 10px' }}>／</span> 六ツ扉
        </div>
    );
};

const Grain: React.FC<{ frame: number }> = ({ frame }) => {
    const k = Math.floor(frame / 2);
    const x = Math.floor(random(`gx-${k}`) * 512);
    const y = Math.floor(random(`gy-${k}`) * 512);
    return (
        <AbsoluteFill
            style={{
                backgroundImage: `url(${staticFile('i-close-my-mind/grain.png')})`,
                backgroundSize: '512px 512px',
                backgroundPosition: `${x}px ${y}px`,
                opacity: 0.1,
                mixBlendMode: 'overlay',
            }}
        />
    );
};

const loadFont = async () => {
    const f = new FontFace('Genkai Mincho', `url(${staticFile('fonts/GenkaiMincho.ttf')}) format('truetype')`);
    document.fonts.add(await f.load());
};

export const ICloseMyMindLyric: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const t = frame / fps;

    const [handle] = useState(() => delayRender('font'));
    useEffect(() => {
        loadFont()
            .catch((e) => console.error(e))
            .finally(() => continueRender(handle));
    }, [handle]);

    const lyrics = useMemo(prepare, []);
    const night = nightAt(t);
    const warm = warmAt(t);
    // 呼吸みたいなごくわずかな明るさのゆれ（10秒周期）
    const breathe = 1 + 0.025 * Math.sin((t / 10) * Math.PI * 2);

    const sw = activeSweep(t);
    const flicker = sw ? 1 + (random(`fl-${Math.floor(frame / 2)}`) - 0.5) * 0.1 * sw.s : 1;

    const fadeIn = interpolate(t, [0, 1.6], [1, 0], clamp);
    const fadeOut = interpolate(frame, [durationInFrames - 40, durationInFrames - 1], [0, 1], clamp);

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
            <AbsoluteFill
                style={{
                    filter: `saturate(${1 - 0.28 * night + 0.08 * warm}) brightness(${(1 - 0.2 * night) * breathe * flicker}) hue-rotate(${-10 * night}deg)`,
                }}
            >
                <Plate src={IMG} t={t} />
                <GlitchBand t={t} frame={frame} />
            </AbsoluteFill>

            {/* 夜：青く沈む */}
            <AbsoluteFill style={{ background: 'rgb(20,40,95)', mixBlendMode: 'multiply', opacity: 0.32 * night }} />
            {/* ラスサビ〜：髪のピンクと灯りがあたたかく */}
            <AbsoluteFill
                style={{
                    mixBlendMode: 'screen',
                    opacity: 0.22 * warm,
                    background:
                        'radial-gradient(ellipse 28% 34% at 57% 28%, rgba(255,90,170,0.9) 0%, rgba(0,0,0,0) 70%), radial-gradient(ellipse 60% 40% at 20% 65%, rgba(255,150,70,0.6) 0%, rgba(0,0,0,0) 70%)',
                }}
            />

            <Grain frame={frame} />
            {/* 左側の文字エリアを少し落とす＋周辺減光 */}
            <AbsoluteFill
                style={{
                    background:
                        'linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.28) 32%, rgba(0,0,0,0) 55%), radial-gradient(ellipse 85% 80% at 55% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)',
                }}
            />

            <Lyrics lyrics={lyrics} t={t} frame={frame} />
            <IntroTitle t={t} frame={frame} />
            <Watermark t={t} />
            <EndTitle t={t} frame={frame} />

            <AbsoluteFill style={{ background: '#000', opacity: Math.max(fadeIn, fadeOut) }} />
            <Audio src={staticFile('i-close-my-mind/audio.wav')} />
        </AbsoluteFill>
    );
};
