import React, { useEffect, useMemo, useState } from 'react';
import {
    AbsoluteFill,
    Audio,
    Easing,
    Img,
    continueRender,
    delayRender,
    interpolate,
    staticFile,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { parseLrc } from '../utils/lrc-parser';
import { BEATS, FORWARD_GLOW_LRC } from './data';
import { Flash, LightLeak, Particles, Vignette } from './Effects';
import { LyricsV2, prepareLyrics } from './LyricsV2';
import { END_CARD_START, SHOTS, Shot, darknessAt, modeAt } from './timeline';

// Forward Glow MV v2（六ツ扉）
// すべて frame から計算する決定的な作り（並列レンダリングでもブレない）

const FONT = "'Genkai Mincho', 'Noto Serif JP', serif";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const loadFonts = async () => {
    const font = new FontFace('Genkai Mincho', `url(${staticFile('fonts/GenkaiMincho.ttf')}) format('truetype')`);
    document.fonts.add(await font.load());
};

/** 直前のビートからの経過で 1→0 に減衰するパルス */
const beatPulse = (t: number) => {
    let lo = 0;
    let hi = BEATS.length - 1;
    if (t < BEATS[0]) return 0;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (BEATS[mid] <= t) lo = mid;
        else hi = mid - 1;
    }
    return Math.exp(-(t - BEATS[lo]) * 7);
};

/** 切り替えのフェード秒数 */
const fadeFor = (prev: Shot | undefined, cur: Shot) => {
    if (!prev) return 0.001;
    if (prev.mode === 'full' && cur.mode === 'full') return 0.2;
    if (prev.mode !== cur.mode) return cur.mode === 'full' ? 0.35 : 1.0;
    if (cur.mode === 'dark') return 1.6;
    return 1.2;
};

const ShotLayer: React.FC<{ shot: Shot; next?: Shot; t: number; pulse: number; darkness: number }> = ({
    shot,
    next,
    t,
    pulse,
    darkness,
}) => {
    const local = t - shot.start;
    const dur = (next ? next.start : END_CARD_START + 1.5) - shot.start + 1.6;
    const prog = Math.min(1, Math.max(0, local / dur));
    const eased = Easing.inOut(Easing.sin)(prog);
    const kick = shot.mode === 'full' ? interpolate(local, [0, 0.35], [0.05, 0], { ...clamp, easing: easeOut }) : 0;
    const scale = interpolate(eased, [0, 1], shot.zoom) + kick + (shot.mode === 'full' ? pulse * 0.012 : 0);
    const px = shot.panX ? interpolate(eased, [0, 1], shot.panX) : 0;
    const py = shot.panY ? interpolate(eased, [0, 1], shot.panY) : 0;
    const sway = Math.sin(t * 0.5) * 0.25;

    const grade = `saturate(${1.1 - 0.62 * darkness}) brightness(${1 - 0.3 * darkness}) contrast(${1.04 + 0.06 * darkness})`;
    const transform = `translate(${px}%, ${py}%) scale(${scale}) rotate(${sway * 0.4}deg)`;
    const src = staticFile(shot.file);

    if (shot.mode === 'panel') {
        return (
            <AbsoluteFill style={{ overflow: 'hidden', background: '#0b0806' }}>
                {/* 背景：同じ絵をぼかして敷く */}
                <Img
                    src={src}
                    style={{
                        position: 'absolute',
                        inset: -80,
                        width: 'calc(100% + 160px)',
                        height: 'calc(100% + 160px)',
                        objectFit: 'cover',
                        objectPosition: shot.pos,
                        filter: `blur(38px) brightness(0.42) saturate(1.2)`,
                        transform: `scale(${1.1 + prog * 0.05})`,
                    }}
                />
                {/* 右：絵のパネル（左端はグラデで溶かす） */}
                <div
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        width: 1180,
                        height: 1080,
                        overflow: 'hidden',
                        WebkitMaskImage: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 22%)',
                        maskImage: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 22%)',
                    }}
                >
                    <Img
                        src={src}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: shot.pos,
                            transform,
                            filter: grade,
                        }}
                    />
                </div>
            </AbsoluteFill>
        );
    }

    return (
        <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
            <Img
                src={src}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: shot.pos,
                    transform,
                    filter: grade,
                }}
            />
        </AbsoluteFill>
    );
};

const TitleIntro: React.FC<{ t: number }> = ({ t }) => {
    const p = interpolate(t, [0.6, 2.4], [0, 1], { ...clamp, easing: easeOut });
    const out = interpolate(t, [8.2, 9.6], [1, 0], clamp);
    if (out <= 0) return null;
    return (
        <div
            style={{
                position: 'absolute',
                right: 110,
                bottom: 120,
                textAlign: 'right',
                color: '#fff8ee',
                fontFamily: FONT,
                opacity: p * out,
                filter: `blur(${(1 - p) * 10}px)`,
                textShadow: '0 0 26px rgba(255,180,100,0.6), 0 3px 12px rgba(0,0,0,0.7)',
            }}
        >
            <div style={{ fontSize: 92, letterSpacing: '0.08em', lineHeight: 1.1 }}>Forward Glow</div>
            <div style={{ fontSize: 34, letterSpacing: '0.6em', marginTop: 14, marginRight: -12 }}>六ツ扉</div>
        </div>
    );
};

const Watermark: React.FC<{ t: number }> = ({ t }) => {
    const o = interpolate(t, [9.6, 11], [0, 0.72], clamp) * interpolate(t, [END_CARD_START - 1, END_CARD_START], [1, 0], clamp);
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
                textShadow: '0 2px 8px rgba(0,0,0,0.7)',
            }}
        >
            Forward Glow <span style={{ opacity: 0.6, margin: '0 10px' }}>／</span> 六ツ扉
        </div>
    );
};

const EndCard: React.FC<{ t: number }> = ({ t }) => {
    const local = t - END_CARD_START;
    if (local < 0) return null;
    const bgIn = interpolate(local, [0, 1.8], [0, 1], clamp);
    const jIn = interpolate(local, [0.8, 2.6], [0, 1], { ...clamp, easing: easeOut });
    const tIn = (d: number) => interpolate(local, [1.6 + d, 3.2 + d], [0, 1], { ...clamp, easing: easeOut });
    const jacket = staticFile('forward-glow-jacket.jpg');
    return (
        <AbsoluteFill style={{ opacity: bgIn }}>
            <Img
                src={jacket}
                style={{
                    position: 'absolute',
                    inset: -100,
                    width: 'calc(100% + 200px)',
                    height: 'calc(100% + 200px)',
                    objectFit: 'cover',
                    filter: 'blur(46px) brightness(0.38) saturate(1.25)',
                    transform: `scale(${1.1 + local * 0.006})`,
                }}
            />
            <Img
                src={jacket}
                style={{
                    position: 'absolute',
                    left: 230,
                    top: 210,
                    width: 660,
                    height: 660,
                    objectFit: 'cover',
                    borderRadius: 6,
                    boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(255,170,90,0.18)',
                    opacity: jIn,
                    transform: `translateY(${(1 - jIn) * 30}px) scale(${1 + local * 0.002})`,
                }}
            />
            <div style={{ position: 'absolute', left: 1010, top: 330, color: '#fff8ee', fontFamily: FONT }}>
                <div style={{ fontSize: 98, letterSpacing: '0.06em', opacity: tIn(0), transform: `translateX(${(1 - tIn(0)) * 24}px)` }}>
                    Forward Glow
                </div>
                <div style={{ fontSize: 40, letterSpacing: '0.6em', marginTop: 18, opacity: tIn(0.3) }}>六ツ扉</div>
                <div
                    style={{
                        width: 520 * tIn(0.6),
                        height: 1,
                        background: 'linear-gradient(90deg, rgba(255,215,160,0.9), rgba(255,215,160,0))',
                        margin: '46px 0 34px',
                    }}
                />
                <div style={{ fontSize: 34, letterSpacing: '0.2em', opacity: tIn(0.9) }}>2026.10.30 Release</div>
            </div>
            <Particles t={t} intensity={0.55 * bgIn} cool={0} />
        </AbsoluteFill>
    );
};

export const ForwardGlowV2: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const t = frame / fps;

    const [handle] = useState(() => delayRender('forward-glow-v2-fonts'));
    useEffect(() => {
        loadFonts()
            .catch((e) => console.error('font load failed', e))
            .finally(() => continueRender(handle));
    }, [handle]);

    const lyrics = useMemo(() => prepareLyrics(parseLrc(FORWARD_GLOW_LRC)), []);

    // 今のショットと、フェード中の前ショット
    let idx = 0;
    for (let i = 0; i < SHOTS.length; i++) if (SHOTS[i].start <= t) idx = i;
    const cur = SHOTS[idx];
    const prev = SHOTS[idx - 1];
    const fade = fadeFor(prev, cur);
    const fadeP = interpolate(t - cur.start, [0, fade], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });

    const mode = modeAt(t);
    const darkness = darknessAt(t);
    const pulse = mode === 'full' ? beatPulse(t) : 0;

    // サビのカット替わりフラッシュ
    const cutFlash = cur.mode === 'full' && prev ? interpolate(t - cur.start, [0, 0.28], [prev.mode === 'full' ? 0.32 : 0.6, 0], clamp) : 0;
    const beatFlash = mode === 'full' && t < 157 ? pulse * 0.05 : 0;

    const particleIntensity = (mode === 'full' ? 0.95 : 0.6) * (1 - darkness * 0.55);
    const leak = (mode === 'full' ? 0.85 : 0.6) * (1 - darkness * 0.9);
    const finalFade = interpolate(frame, [durationInFrames - 36, durationInFrames - 1], [0, 1], clamp);

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
            {prev && fadeP < 1 && <ShotLayer shot={prev} next={cur} t={t} pulse={pulse} darkness={darkness} />}
            <AbsoluteFill style={{ opacity: fadeP }}>
                <ShotLayer shot={cur} next={SHOTS[idx + 1]} t={t} pulse={pulse} darkness={darkness} />
            </AbsoluteFill>

            {/* Cメロ：青みを足す */}
            {darkness > 0 && (
                <AbsoluteFill style={{ background: 'rgb(30,45,90)', mixBlendMode: 'soft-light', opacity: darkness * 0.45 }} />
            )}

            <LightLeak t={t} strength={leak} />
            <Particles t={t} intensity={particleIntensity} cool={darkness} />
            <Vignette strength={0.55 + darkness * 0.25} />
            {/* 歌詞が読みやすいよう下を少し落とす */}
            {mode !== 'panel' && (
                <AbsoluteFill
                    style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(0,0,0,0.45) 100%)' }}
                />
            )}

            <Flash opacity={cutFlash + beatFlash} />

            <LyricsV2 lyrics={lyrics} t={t} />
            <TitleIntro t={t} />
            <Watermark t={t} />
            <EndCard t={t} />

            <Flash opacity={finalFade} color="0,0,0" />
            <Audio src={staticFile('forward-glow.mp3')} />
        </AbsoluteFill>
    );
};
