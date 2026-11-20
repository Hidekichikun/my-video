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
import { FIMS_LYRICS } from './lyrics';

// Fire in my senses — リリックMV（1枚絵＋雪ループ）
// 絵は1枚だけ。ゆっくりズーム＋色のうつり変わり。
// ふだんは雪。サビに入ると雪がだんだん火の粉（オレンジの光の粒）に変わって、心に火がつく。

const W = 1920;
const H = 1080;
export const FIMS_TOTAL_SECONDS = 217.5;
const INTRO_END = 11.6;
const END_TITLE_START = 210.4;
const JP = "'FIMS Shippori', 'Noto Serif CJK JP', serif";
const EN = "'FIMS Cormorant', 'FIMS Shippori', serif";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const FACE = staticFile('fire-in-my-senses/mv/face.jpg');
const FILL = staticFile('fire-in-my-senses/mv/fill.jpg');

// ───────── ゆっくり変わっていくもの ─────────
const ramp = (t: number, pts: [number, number][]) =>
    interpolate(
        t,
        pts.map((p) => p[0]),
        pts.map((p) => p[1]),
        { ...clamp, easing: Easing.inOut(Easing.sin) },
    );
/** 火の強さ（0=雪だけ、1=火の粉がいっぱい） ※時間と強さはこの表で調整 */
const FIRE: [number, number][] = [
    [0, 0], [49, 0], [57.2, 0.28], [58.4, 1], [82, 1], [86.5, 0.12], [103, 0.12], [118.5, 0.38], [120.4, 1],
    [150.5, 1], [154, 0], [163, 0], [166.4, 0.3], [167.8, 1], [209, 1], [217.5, 0.4],
];
const fireAt = (t: number) => ramp(t, FIRE);
/** ブリッジ：青く静かな夜 → 「夜明けを待つだけ」で少し明るく */
const nightAt = (t: number) => ramp(t, [[0, 0], [150.5, 0], [155, 1], [161.5, 1], [166.8, 0]]);
const dawnAt = (t: number) => ramp(t, [[0, 0], [161, 0], [165.5, 1], [168, 0.3], [217.5, 0.3]]);

// ───────── 絵 ─────────
const S = 1260; // 正方形の絵の表示サイズ
const FACE_LEFT = 1300 - S / 2;
const Plate: React.FC<{ t: number }> = ({ t }) => {
    const p = interpolate(t, [0, FIMS_TOTAL_SECONDS], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
    const zoom = 1.0 + p * 0.085; // 3分半かけて1.085倍（目に向かって）
    const fillZoom = 1.06 + p * 0.04;
    return (
        <AbsoluteFill>
            <Img
                src={FILL}
                style={{ position: 'absolute', inset: 0, width: W, height: H, objectFit: 'cover', transform: `scale(${fillZoom})` }}
            />
            <Img
                src={FACE}
                style={{
                    position: 'absolute',
                    left: FACE_LEFT,
                    top: (H - S) / 2 + 10,
                    width: S,
                    height: S,
                    transformOrigin: '50% 36%',
                    transform: `scale(${zoom})`,
                    WebkitMaskImage: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 12%, #000 26%)',
                    maskImage: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 12%, #000 26%)',
                }}
            />
        </AbsoluteFill>
    );
};

// ───────── 雪と火の粉 ─────────
type Flake = { x0: number; y0: number; r: number; a: number; v: number; sway: number; f: number; ph: number; soft: boolean };
// (数, 半径, 透明度, 速さpx/s, ゆれ, ボケ)
const SNOW_LAYERS: [number, [number, number], [number, number], number, number, boolean][] = [
    [110, [1.0, 2.0], [0.35, 0.6], 70, 8, false], // 奥：小さくゆっくり
    [55, [2.2, 3.6], [0.55, 0.85], 120, 16, false], // 中
    [14, [9, 16], [0.18, 0.32], 200, 30, true], // 手前：大きいボケ
];
const SNOW_TILT = 0.16;
const makeSnow = (): Flake[] => {
    const out: Flake[] = [];
    let n = 0;
    for (const [count, [r0, r1], [a0, a1], v, sway, soft] of SNOW_LAYERS) {
        for (let i = 0; i < count; i++, n++) {
            const rr = (k: string) => random(`snow-${k}-${n}`);
            out.push({
                x0: -200 + rr('x') * (W + 200),
                y0: rr('y'),
                r: r0 + rr('r') * (r1 - r0),
                a: a0 + rr('a') * (a1 - a0),
                v: v * (0.8 + rr('v') * 0.4),
                sway: sway * (0.5 + rr('s') * 0.5),
                f: 0.08 + rr('f') * 0.15,
                ph: rr('p') * 6.283,
                soft,
            });
        }
    }
    return out;
};
const EMBER_LAYERS: [number, [number, number], [number, number], number, number, boolean][] = [
    [130, [1.5, 3.0], [0.6, 1.0], 70, 26, false], // 奥：小さい火の粉
    [50, [3.0, 5.2], [0.7, 1.0], 115, 40, false], // 中
    [14, [14, 26], [0.22, 0.4], 165, 60, true], // 手前：大きいボケ
];
const makeEmbers = (): Flake[] => {
    const out: Flake[] = [];
    let n = 0;
    for (const [count, [r0, r1], [a0, a1], v, sway, soft] of EMBER_LAYERS) {
        for (let i = 0; i < count; i++, n++) {
            const rr = (k: string) => random(`ember-${k}-${n}`);
            // 火の粉は右側（顔のまわり〜下）に多め
            const x = rr('x');
            out.push({
                x0: Math.pow(x, 0.8) * (W + 100),
                y0: rr('y'),
                r: r0 + rr('r') * (r1 - r0),
                a: a0 + rr('a') * (a1 - a0),
                v: v * (0.7 + rr('v') * 0.6),
                sway: sway * (0.5 + rr('s') * 0.5),
                f: 0.1 + rr('f') * 0.25,
                ph: rr('p') * 6.283,
                soft,
            });
        }
    }
    return out;
};

const mix = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(v + (b[i] - v) * k));

const Particles: React.FC<{ t: number; fire: number; snow: Flake[]; embers: Flake[] }> = ({ t, fire, snow, embers }) => {
    const SPAN = H + 120;
    // 雪：火が強くなるほど少なく、色もあたたかく
    const snowAmt = 1 - 0.72 * fire;
    const snowCol = mix([244, 247, 252], [255, 196, 140], fire * 0.75);
    const nodes: React.ReactNode[] = [];
    snow.forEach((s, i) => {
        // 火が強いときは、半分くらいの雪が消えていく（順番に）
        const keep = interpolate(fire, [0.15 + (i % 7) * 0.1, 0.25 + (i % 7) * 0.1], [1, 0], clamp);
        const op = s.a * snowAmt * (i % 2 === 0 ? 1 : keep + (1 - keep) * 0.0);
        if (op <= 0.01) return;
        const p = (s.y0 + (s.v * t) / SPAN) % 1;
        const y = -60 + p * SPAN;
        const x = s.x0 + p * SPAN * SNOW_TILT + s.sway * Math.sin(6.283 * s.f * t + s.ph);
        const d = s.r * 2;
        const c = `rgba(${snowCol[0]},${snowCol[1]},${snowCol[2]},`;
        nodes.push(
            <div
                key={`s${i}`}
                style={{
                    position: 'absolute',
                    left: x - s.r,
                    top: y - s.r,
                    width: d,
                    height: d,
                    borderRadius: '50%',
                    opacity: op,
                    background: s.soft
                        ? `radial-gradient(circle, ${c}0.9) 0%, ${c}0.45) 40%, ${c}0) 70%)`
                        : `radial-gradient(circle, ${c}1) 0%, ${c}0.9) 45%, ${c}0) 100%)`,
                }}
            />,
        );
    });
    // 火の粉：下から上へ、ゆらゆら＋チカチカ
    embers.forEach((e, i) => {
        const appear = interpolate(fire, [(i % 10) * 0.05, (i % 10) * 0.05 + 0.25], [0, 1], clamp);
        if (appear <= 0.01) return;
        const p = (e.y0 + (e.v * t) / SPAN) % 1;
        const y = H + 60 - p * SPAN;
        const x = e.x0 + e.sway * Math.sin(6.283 * e.f * t + e.ph) - p * 120;
        const flick = 0.65 + 0.35 * Math.sin(t * (7 + (i % 5) * 2.3) + e.ph * 3);
        const fadeTop = interpolate(p, [0, 0.12, 0.7, 1], [0, 1, 1, 0], clamp);
        const op = e.a * appear * flick * fadeTop;
        if (op <= 0.01) return;
        const d = e.r * 2;
        const hot = i % 3 === 0 ? '255,236,190' : '255,170,90';
        nodes.push(
            <div
                key={`e${i}`}
                style={{
                    position: 'absolute',
                    left: x - e.r,
                    top: y - e.r,
                    width: d,
                    height: d,
                    borderRadius: '50%',
                    opacity: op,
                    background: e.soft
                        ? 'radial-gradient(circle, rgba(255,150,70,0.85) 0%, rgba(255,110,40,0.35) 45%, rgba(255,90,30,0) 72%)'
                        : `radial-gradient(circle, rgba(${hot},1) 0%, rgba(255,140,60,0.85) 45%, rgba(255,90,30,0) 100%)`,
                    boxShadow: e.soft ? undefined : `0 0 ${8 + e.r * 4}px rgba(255,120,40,0.95), 0 0 ${3 + e.r}px rgba(255,200,120,0.9)`,
                }}
            />,
        );
    });
    return <AbsoluteFill style={{ pointerEvents: 'none' }}>{nodes}</AbsoluteFill>;
};

// ───────── 歌詞 ─────────
type Style = 'verse' | 'chorus' | 'bridge' | 'outro';
const styleAt = (t: number): Style => {
    if (t >= 197) return 'outro';
    if ((t >= 57.5 && t < 86) || (t >= 119.5 && t < 150) || (t >= 167 && t < 197)) return 'chorus';
    if (t >= 150 && t < 167) return 'bridge';
    return 'verse';
};
type Timed = { text: string; start: number; end: number; style: Style; idx: number };
const CAP: Record<Style, number> = { verse: 5.0, chorus: 4.2, bridge: 4.4, outro: 7.0 };

const prepare = (): Timed[] =>
    FIMS_LYRICS.map(([time, text], i) => {
        const next = FIMS_LYRICS[i + 1];
        const style = styleAt(time);
        let end = Math.min(next ? next[0] : END_TITLE_START, time + CAP[style]);
        if (time >= 205) end = END_TITLE_START + 0.6;
        return { text, start: time, end, style, idx: i };
    });

const isEnglish = (s: string) => /^[\x20-\x7E’.]+$/.test(s);

/** 日本語は明朝、英字はCormorantで、1行の中で書体を切り替える */
const Mixed: React.FC<{ text: string; local: number; stagger: number; dur: number; enScale: number }> = ({
    text,
    local,
    stagger,
    dur,
    enScale,
}) => (
    <>
        {Array.from(text).map((ch, i) => {
            const en = ch.charCodeAt(0) < 256 && ch !== ' ';
            const p = interpolate(local - i * stagger, [0, dur], [0, 1], { ...clamp, easing: easeOut });
            return (
                <span
                    key={i}
                    style={{
                        display: 'inline-block',
                        whiteSpace: 'pre',
                        fontFamily: en || ch === ' ' ? EN : JP,
                        fontWeight: en ? 600 : undefined,
                        fontSize: en ? `${enScale}em` : undefined,
                        letterSpacing: en ? '0.01em' : undefined,
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

/** サビの英語：単語ごとに、火がつくみたいにオレンジに光ってから白く落ち着く */
const Ignite: React.FC<{ text: string; local: number }> = ({ text, local }) => {
    const words = text.split(' ');
    return (
        <>
            {words.map((w, i) => {
                const l = local - i * 0.12;
                const p = interpolate(l, [0, 0.45], [0, 1], { ...clamp, easing: easeOut });
                const heat = interpolate(l, [0, 0.15, 1.4], [0, 1, 0], clamp);
                return (
                    <span
                        key={i}
                        style={{
                            display: 'inline-block',
                            whiteSpace: 'pre',
                            marginRight: '0.24em',
                            opacity: p,
                            filter: `blur(${(1 - p) * 10}px)`,
                            transform: `translateY(${(1 - p) * 18}px) scale(${1 + (1 - p) * 0.06})`,
                            color: `rgb(255, ${Math.round(255 - heat * 85)}, ${Math.round(250 - heat * 170)})`,
                            textShadow: `0 0 ${18 + heat * 40}px rgba(255,130,50,${0.35 + heat * 0.55}), 0 4px 18px rgba(0,0,0,0.85)`,
                        }}
                    >
                        {w}
                    </span>
                );
            })}
        </>
    );
};

const shadowFor = (st: Style, fire: number) => {
    const warm = `0 0 ${22 + 14 * fire}px rgba(255,${Math.round(190 - 60 * fire)},${Math.round(150 - 90 * fire)},${0.25 + 0.3 * fire})`;
    if (st === 'bridge') return '0 0 22px rgba(160,195,255,0.45), 0 3px 14px rgba(0,0,0,0.9)';
    return `${warm}, 0 3px 14px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.6)`;
};

const splitRows = (text: string, eng: boolean): string[] => {
    if (eng) {
        const k = text.indexOf(' in my');
        if (k > 0) return [text.slice(0, k), text.slice(k + 1)];
        return [text];
    }
    const t = text.replace(/[「」]/g, (m) => m);
    if (t.includes('、') && Array.from(t).length > 12) {
        const i = t.indexOf('、');
        return [t.slice(0, i + 1), t.slice(i + 1)];
    }
    if (t.includes('　') && Array.from(t).length > 12) {
        const i = t.lastIndexOf('　', Math.floor(t.length * 0.66));
        const j = i > 0 ? i : t.indexOf('　');
        return [t.slice(0, j), t.slice(j + 1)];
    }
    return [t];
};

const Line: React.FC<{ line: Timed; t: number; fire: number }> = ({ line, t, fire }) => {
    const local = t - line.start;
    const eng = isEnglish(line.text);
    const st = line.style;
    const fadeOut = st === 'outro' ? 1.4 : 0.4;
    const exit = interpolate(t, [line.end - fadeOut, line.end], [1, 0], clamp);
    const rows = splitRows(line.text, eng);
    const bigEng = eng;

    let size: number;
    if (bigEng) size = st === 'chorus' ? 138 : 110;
    else if (st === 'chorus') size = 86;
    else if (st === 'outro') size = line.start >= 205 ? 84 : 62;
    else size = 70;

    const stagger = st === 'chorus' ? 0.035 : st === 'outro' ? 0.075 : 0.05;
    let charIdx = 0;
    return (
        <div
            style={{
                position: 'absolute',
                left: 120,
                bottom: 150,
                fontFamily: bigEng ? EN : JP,
                fontWeight: bigEng ? 600 : undefined,
                color: st === 'bridge' ? '#eef3ff' : '#fffaf3',
                letterSpacing: bigEng ? '0.005em' : '0.09em',
                lineHeight: bigEng ? 0.98 : 1.38,
                opacity: exit,
                transform: `translateY(${(1 - exit) * -10}px)`,
                textShadow: bigEng ? undefined : shadowFor(st, fire),
                whiteSpace: 'nowrap',
            }}
        >
            {rows.map((r, ri) => {
                const offset = charIdx;
                charIdx += Array.from(r).length;
                return (
                    <div key={ri} style={{ fontSize: size, paddingLeft: bigEng && ri === 1 ? '0.9em' : 0 }}>
                        {bigEng ? (
                            <Ignite text={r} local={local - ri * 0.3} />
                        ) : (
                            <Mixed
                                text={r}
                                local={local - offset * stagger}
                                stagger={stagger}
                                dur={st === 'outro' ? 1.1 : 0.55}
                                enScale={1.12}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const Lyrics: React.FC<{ lyrics: Timed[]; t: number; fire: number }> = ({ lyrics, t, fire }) => {
    const shown = lyrics.filter((l) => l.start <= t && t < l.end);
    if (!shown.length) return null;
    const l = shown[shown.length - 1];
    return (
        <AbsoluteFill>
            <Line key={l.idx} line={l} t={t} fire={fire} />
        </AbsoluteFill>
    );
};

// ───────── タイトル ─────────
const Title: React.FC<{ p: number; size: number }> = ({ p, size }) => (
    <div
        style={{
            position: 'absolute',
            left: 120,
            top: '50%',
            transform: `translateY(-50%) translateY(${(1 - p) * 12}px)`,
            color: '#fffaf3',
            opacity: p,
            filter: `blur(${(1 - p) * 10}px)`,
        }}
    >
        <div
            style={{
                fontFamily: EN,
                fontWeight: 500,
                fontSize: size,
                letterSpacing: '0.04em',
                lineHeight: 1.0,
                textShadow: '0 0 34px rgba(255,170,110,0.45), 0 4px 18px rgba(0,0,0,0.8)',
            }}
        >
            Fire in
            <br />
            my senses
        </div>
        <div
            style={{
                fontFamily: JP,
                fontSize: size * 0.27,
                letterSpacing: '0.75em',
                marginTop: size * 0.34,
                textShadow: '0 3px 12px rgba(0,0,0,0.85)',
                opacity: 0.92,
            }}
        >
            六ツ扉
        </div>
    </div>
);

const IntroTitle: React.FC<{ t: number }> = ({ t }) => {
    const p = interpolate(t, [1.8, 4.4], [0, 1], { ...clamp, easing: easeOut });
    const out = interpolate(t, [9.6, INTRO_END - 0.2], [1, 0], clamp);
    if (p <= 0 || out <= 0) return null;
    return <Title p={p * out} size={150} />;
};
const EndTitle: React.FC<{ t: number }> = ({ t }) => {
    const p = interpolate(t, [END_TITLE_START, END_TITLE_START + 2.2], [0, 1], { ...clamp, easing: easeOut });
    if (p <= 0) return null;
    return <Title p={p} size={128} />;
};

const Watermark: React.FC<{ t: number }> = ({ t }) => {
    const o =
        interpolate(t, [INTRO_END + 1, INTRO_END + 2.5], [0, 0.7], clamp) *
        interpolate(t, [END_TITLE_START - 2, END_TITLE_START - 0.5], [1, 0], clamp);
    if (o <= 0) return null;
    return (
        <div
            style={{
                position: 'absolute',
                top: 50,
                left: 62,
                fontSize: 26,
                letterSpacing: '0.16em',
                color: '#fff',
                opacity: o,
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}
        >
            <span style={{ fontFamily: EN, fontWeight: 600, fontSize: 30 }}>Fire in my senses</span>
            <span style={{ opacity: 0.6, margin: '0 12px', fontFamily: JP }}>／</span>
            <span style={{ fontFamily: JP }}>六ツ扉</span>
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
                opacity: 0.08,
                mixBlendMode: 'overlay',
            }}
        />
    );
};

const loadFonts = async () => {
    const a = new FontFace('FIMS Shippori', `url(${staticFile('fonts/ShipporiMincho-SemiBold.ttf')}) format('truetype')`);
    const b = new FontFace('FIMS Cormorant', `url(${staticFile('fonts/CormorantGaramond-VF.ttf')}) format('truetype')`, {
        weight: '300 700',
    });
    const [fa, fb] = await Promise.all([a.load(), b.load()]);
    (document.fonts as any).add(fa);
    (document.fonts as any).add(fb);
};

export const FireInMySensesLyric: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const t = frame / fps;

    const [handle] = useState(() => delayRender('fonts'));
    useEffect(() => {
        loadFonts()
            .catch((e) => console.error(e))
            .finally(() => continueRender(handle));
    }, [handle]);

    const lyrics = useMemo(prepare, []);
    const snow = useMemo(makeSnow, []);
    const embers = useMemo(makeEmbers, []);
    const fire = fireAt(t);
    const night = nightAt(t);
    const dawn = dawnAt(t);
    const breathe = 1 + 0.02 * Math.sin((t / 10) * Math.PI * 2);

    const fadeIn = interpolate(t, [0, 1.8], [1, 0], clamp);
    const fadeOut = interpolate(frame, [durationInFrames - 45, durationInFrames - 1], [0, 1], clamp);

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
            <AbsoluteFill
                style={{
                    filter: `saturate(${0.62 - 0.15 * night + 0.33 * fire}) contrast(1.08) brightness(${(0.9 - 0.14 * night + 0.05 * fire) * breathe}) hue-rotate(${-8 * night}deg)`,
                }}
            >
                <Plate t={t} />
            </AbsoluteFill>

            {/* ふだん：冷たい冬の空気 */}
            <AbsoluteFill style={{ background: 'rgb(150,175,210)', mixBlendMode: 'soft-light', opacity: 0.35 * (1 - fire) }} />
            {/* 夜（ブリッジ）：青く沈む */}
            <AbsoluteFill style={{ background: 'rgb(18,36,90)', mixBlendMode: 'multiply', opacity: 0.38 * night }} />
            {/* 火：下からオレンジの光 */}
            <AbsoluteFill
                style={{
                    mixBlendMode: 'screen',
                    opacity: 0.32 * fire,
                    background:
                        'radial-gradient(ellipse 70% 55% at 62% 105%, rgba(255,110,30,0.95) 0%, rgba(255,80,20,0.35) 45%, rgba(0,0,0,0) 75%), radial-gradient(ellipse 30% 30% at 70% 40%, rgba(255,170,90,0.4) 0%, rgba(0,0,0,0) 70%)',
                }}
            />
            {/* 夜明け：右上からうっすら */}
            <AbsoluteFill
                style={{
                    mixBlendMode: 'screen',
                    opacity: 0.25 * dawn,
                    background: 'radial-gradient(ellipse 60% 50% at 85% 0%, rgba(255,205,160,0.9) 0%, rgba(0,0,0,0) 70%)',
                }}
            />

            <Particles t={t} fire={fire} snow={snow} embers={embers} />
            <Grain frame={frame} />

            {/* 左下の文字エリアを落とす＋周辺減光 */}
            <AbsoluteFill
                style={{
                    background:
                        'linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 34%, rgba(0,0,0,0) 56%), linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 40%), radial-gradient(ellipse 85% 85% at 60% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)',
                }}
            />

            <Lyrics lyrics={lyrics} t={t} fire={fire} />
            <IntroTitle t={t} />
            <Watermark t={t} />
            <EndTitle t={t} />

            <AbsoluteFill style={{ background: '#000', opacity: Math.max(fadeIn, fadeOut) }} />
            <Audio src={staticFile('fire-in-my-senses/mv/audio.wav')} />
        </AbsoluteFill>
    );
};
