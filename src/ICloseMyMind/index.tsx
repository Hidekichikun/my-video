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
import { parseLrc } from '../utils/lrc-parser';
import { BEATS } from './beats';
import { I_CLOSE_MY_MIND_LRC } from './lyrics';
import { Lyrics, prepareLyrics } from './Lyrics';
import { FONT, clamp, easeOut } from './style';
import { DATES, DIR, END_TITLE_START, INTRO_END, SHOTS, Shot, modeAt, nightAt } from './timeline';

// I close my mind MV（六ツ扉）
// 過去＝「君」が使い捨てカメラで撮った写真 ／ 今＝ライブ。ラストは歩道橋でふり返る
// すべて frame から計算する決定的な作り

const DATE_FONT = "'DotGothic16', monospace";

const loadFonts = async () => {
    const fonts = [
        new FontFace('Genkai Mincho', `url(${staticFile('fonts/GenkaiMincho.ttf')}) format('truetype')`),
        new FontFace('DotGothic16', `url(${staticFile('fonts/DotGothic16.ttf')}) format('truetype')`),
    ];
    for (const f of fonts) document.fonts.add(await f.load());
};

/** 直前のビートからの経過で 1→0 に減衰するパルス */
const beatPulse = (t: number) => {
    if (t < BEATS[0]) return 0;
    let lo = 0;
    let hi = BEATS.length - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (BEATS[mid] <= t) lo = mid;
        else hi = mid - 1;
    }
    return Math.exp(-(t - BEATS[lo]) * 8);
};

const fadeFor = (prev: Shot | undefined, cur: Shot) => {
    if (!prev) return 0.001;
    if (cur.fade !== undefined) return cur.fade;
    if (prev.mode === cur.mode && (cur.mode === 'photo' || cur.mode === 'live')) return 0.001;
    if ((prev.mode === 'photo' && cur.mode === 'live') || (prev.mode === 'live' && cur.mode === 'photo')) return 0.001;
    return 1.0;
};

/** フィルムの粒 */
const Grain: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => {
    if (opacity <= 0.01) return null;
    // 2フレームごとに位置を変える（フィルムっぽいチラつき）
    const k = Math.floor(frame / 2);
    const x = Math.floor(random(`gx-${k}`) * 512);
    const y = Math.floor(random(`gy-${k}`) * 512);
    return (
        <AbsoluteFill
            style={{
                pointerEvents: 'none',
                backgroundImage: `url(${staticFile(DIR + 'grain.png')})`,
                backgroundRepeat: 'repeat',
                backgroundSize: '512px 512px',
                backgroundPosition: `${x}px ${y}px`,
                mixBlendMode: 'overlay',
                opacity,
            }}
        />
    );
};

/** 使い捨てカメラの日付 */
const DateStamp: React.FC<{ text: string; opacity: number }> = ({ text, opacity }) => (
    <div
        style={{
            position: 'absolute',
            right: 78,
            bottom: 58,
            fontFamily: DATE_FONT,
            fontSize: 46,
            letterSpacing: '0.12em',
            whiteSpace: 'pre',
            color: '#ffb347',
            textShadow: '0 0 4px rgba(255,110,10,1), 0 0 16px rgba(255,80,0,0.7), 0 2px 6px rgba(0,0,0,0.6)',
            opacity,
        }}
    >
        {text}
    </div>
);

const ShotLayer: React.FC<{ shot: Shot; next?: Shot; t: number; pulse: number; frame: number }> = ({
    shot,
    next,
    t,
    pulse,
    frame,
}) => {
    const local = t - shot.start;
    const dur = (next ? next.start : 241.5) - shot.start + 1.2;
    const prog = Math.min(1, Math.max(0, local / dur));
    const eased = Easing.inOut(Easing.sin)(prog);
    const isLive = shot.mode === 'live';
    const kick = isLive && shot.start > 1 ? interpolate(local, [0, 0.3], [0.06, 0], { ...clamp, easing: easeOut }) : 0;
    const scale = interpolate(eased, [0, 1], shot.zoom) + kick + (isLive ? pulse * 0.014 : 0);
    const px = shot.panX ? interpolate(eased, [0, 1], shot.panX) : 0;
    const py = shot.panY ? interpolate(eased, [0, 1], shot.panY) : 0;
    // 写真は手持ちっぽく少しだけ揺れる
    const sway = shot.mode === 'photo' ? Math.sin(t * 0.9) * 0.35 : Math.sin(t * 0.4) * 0.15;

    const isPastInNight = shot.file === 'N6b_corner_past.jpg' && shot.mode === 'night';
    const night = shot.mode === 'night' && !isPastInNight ? 1 : isLive ? nightAt(t) : 0;

    let grade = '';
    if (shot.mode === 'photo') grade = 'sepia(0.16) saturate(1.08) contrast(1.06) brightness(1.03)';
    else if (isPastInNight) grade = 'sepia(0.12) saturate(1.05) brightness(1.02)';
    else if (shot.mode === 'outro') grade = 'saturate(1.04) contrast(1.03)';
    else grade = `saturate(${1.12 - 0.5 * night}) brightness(${1 - 0.25 * night}) contrast(${1.05 + 0.04 * night})`;

    const date = shot.mode === 'photo' || isPastInNight ? DATES[shot.file] : undefined;
    const dateIn = isPastInNight ? interpolate(local, [2.5, 4.5], [0, 1], clamp) : 1;

    return (
        <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
            <Img
                src={staticFile(DIR + shot.file)}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: shot.pos,
                    transform: `translate(${px}%, ${py}%) scale(${scale}) rotate(${sway * 0.4}deg)`,
                    filter: grade,
                }}
            />
            {night > 0 && (
                <AbsoluteFill style={{ background: 'rgb(25,40,95)', mixBlendMode: 'soft-light', opacity: night * 0.5 }} />
            )}
            {shot.mode === 'photo' && (
                // フィルムのあったかい光もれ（左上）
                <AbsoluteFill
                    style={{
                        mixBlendMode: 'screen',
                        background: `radial-gradient(ellipse 50% 70% at ${-4 + Math.sin(t * 0.7) * 4}% 20%, rgba(255,120,40,0.42) 0%, rgba(255,90,40,0.12) 45%, rgba(0,0,0,0) 70%)`,
                    }}
                />
            )}
            {date && <DateStamp text={date} opacity={dateIn} />}
            <Grain frame={frame} opacity={shot.mode === 'photo' || isPastInNight ? 0.2 : 0.08} />
        </AbsoluteFill>
    );
};

/** ステージのチリ・光の粒 */
const Particles: React.FC<{ t: number; intensity: number; cool: number }> = ({ t, intensity, cool }) => {
    const ps = useMemo(
        () =>
            new Array(60).fill(0).map((_, i) => ({
                x: random(`px-${i}`) * 1920,
                y0: random(`py-${i}`) * 1300,
                size: 3 + random(`ps-${i}`) ** 2 * 22,
                speed: 10 + random(`pv-${i}`) * 40,
                sway: 10 + random(`pw-${i}`) * 40,
                phase: random(`pp-${i}`) * Math.PI * 2,
                blur: random(`pb-${i}`) < 0.35 ? 6 : 1.5,
                tw: 0.6 + random(`pt-${i}`) * 1.6,
            })),
        []
    );
    if (intensity <= 0.01) return null;
    const c = cool > 0.5 ? '190, 215, 255' : '255, 190, 225';
    return (
        <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
            {ps.map((p, i) => {
                const y = ((p.y0 - t * p.speed) % 1300 + 1300) % 1300 - 110;
                const x = p.x + Math.sin(t * 0.6 + p.phase) * p.sway;
                const tw = 0.45 + 0.55 * Math.sin(t * p.tw + p.phase) ** 2;
                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: x,
                            top: y,
                            width: p.size,
                            height: p.size,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, rgba(${c},0.95) 0%, rgba(${c},0.3) 45%, rgba(${c},0) 72%)`,
                            filter: `blur(${p.blur}px)`,
                            opacity: tw * intensity,
                        }}
                    />
                );
            })}
        </AbsoluteFill>
    );
};

const Vignette: React.FC<{ strength: number }> = ({ strength }) => (
    <AbsoluteFill
        style={{
            pointerEvents: 'none',
            background: `radial-gradient(ellipse 75% 75% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
        }}
    />
);

const Flash: React.FC<{ opacity: number; color?: string }> = ({ opacity, color = '255,250,240' }) =>
    opacity <= 0.005 ? null : (
        <AbsoluteFill style={{ pointerEvents: 'none', background: `rgba(${color},${Math.min(1, opacity)})` }} />
    );

const TitleBlock: React.FC<{ p: number; size: number }> = ({ p, size }) => (
    <div style={{ textAlign: 'center', color: '#fff8f0', fontFamily: FONT }}>
        <div
            style={{
                fontSize: size,
                letterSpacing: '0.1em',
                lineHeight: 1.1,
                textShadow: '0 0 30px rgba(255,140,190,0.55), 0 4px 16px rgba(0,0,0,0.7)',
            }}
        >
            I close my mind
        </div>
        <div
            style={{
                fontSize: size * 0.36,
                letterSpacing: '0.7em',
                marginTop: size * 0.22,
                marginRight: '-0.7em',
                opacity: p,
                textShadow: '0 3px 12px rgba(0,0,0,0.7)',
            }}
        >
            六ツ扉
        </div>
    </div>
);

const IntroTitle: React.FC<{ t: number }> = ({ t }) => {
    const p = interpolate(t, [2.2, 5.0], [0, 1], { ...clamp, easing: easeOut });
    const out = interpolate(t, [12.4, INTRO_END - 0.2], [1, 0], clamp);
    if (out <= 0 || p <= 0) return null;
    return (
        <AbsoluteFill
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                opacity: p * out,
                filter: `blur(${(1 - p) * 12}px)`,
                transform: `scale(${1.04 - p * 0.04})`,
            }}
        >
            <TitleBlock p={p} size={118} />
        </AbsoluteFill>
    );
};

const Watermark: React.FC<{ t: number }> = ({ t }) => {
    const o = interpolate(t, [INTRO_END + 1, INTRO_END + 2.5], [0, 0.7], clamp) *
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

const EndTitle: React.FC<{ t: number }> = ({ t }) => {
    const local = t - END_TITLE_START;
    if (local < 0) return null;
    const p = interpolate(local, [0, 2.2], [0, 1], { ...clamp, easing: easeOut });
    return (
        <AbsoluteFill
            style={{
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: 150,
                opacity: p,
                filter: `blur(${(1 - p) * 10}px)`,
            }}
        >
            <TitleBlock p={p} size={96} />
        </AbsoluteFill>
    );
};

export const ICloseMyMind: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const t = frame / fps;

    const [handle] = useState(() => delayRender('i-close-my-mind-fonts'));
    useEffect(() => {
        loadFonts()
            .catch((e) => console.error('font load failed', e))
            .finally(() => continueRender(handle));
    }, [handle]);

    const lyrics = useMemo(() => prepareLyrics(parseLrc(I_CLOSE_MY_MIND_LRC)), []);

    let idx = 0;
    for (let i = 0; i < SHOTS.length; i++) if (SHOTS[i].start <= t) idx = i;
    const cur = SHOTS[idx];
    const prev = SHOTS[idx - 1];
    const fade = fadeFor(prev, cur);
    const fadeP = interpolate(t - cur.start, [0, fade], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });

    const mode = modeAt(t);
    const night = nightAt(t);
    const inChorus = mode === 'live' && t > INTRO_END;
    const pulse = inChorus ? beatPulse(t) : 0;

    // カット替わり：写真はカメラのフラッシュ、ライブは白く飛ばす
    let cutFlash = 0;
    if (prev && fade < 0.01) {
        const strength = cur.mode === 'photo' ? (prev.mode === 'photo' ? 0.55 : 0.75) : prev.mode === 'live' ? 0.3 : 0.6;
        cutFlash = interpolate(t - cur.start, [0, cur.mode === 'photo' ? 0.32 : 0.25], [strength, 0], clamp);
    }
    // 間奏でステージが暗くなっていく途中はビートフラッシュを弱める
    const beatFlash = inChorus ? pulse * 0.06 * (1 - night) : 0;
    const finalChorus = t >= 180.8 && t < 209.3;

    const finalFade = interpolate(frame, [durationInFrames - 30, durationInFrames - 1], [0, 1], clamp);
    const introFadeIn = interpolate(t, [0, 1.2], [1, 0], clamp);

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
            {prev && fadeP < 1 && <ShotLayer shot={prev} next={cur} t={t} pulse={pulse} frame={frame} />}
            <AbsoluteFill style={{ opacity: fadeP }}>
                <ShotLayer shot={cur} next={SHOTS[idx + 1]} t={t} pulse={pulse} frame={frame} />
            </AbsoluteFill>

            {mode === 'live' && (
                <Particles t={t} intensity={(finalChorus ? 0.9 : 0.6) * (1 - night * 0.6)} cool={night} />
            )}
            {mode === 'night' && <Particles t={t * 0.5} intensity={0.25} cool={1} />}
            <Vignette strength={mode === 'night' ? 0.7 : mode === 'photo' ? 0.5 : 0.55} />
            <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.42) 100%)' }} />

            {/* サビ：ビートでピンクに光る（ラスサビは強め） */}
            {beatFlash > 0.003 && (
                <AbsoluteFill
                    style={{
                        mixBlendMode: 'screen',
                        background: `radial-gradient(ellipse 70% 60% at 50% 30%, rgba(255,90,170,${beatFlash * (finalChorus ? 3.2 : 2)}) 0%, rgba(0,0,0,0) 70%)`,
                    }}
                />
            )}
            <Flash opacity={cutFlash} />

            <Lyrics lyrics={lyrics} t={t} />
            <IntroTitle t={t} />
            <Watermark t={t} />
            <EndTitle t={t} />

            <Flash opacity={Math.max(finalFade, introFadeIn)} color="0,0,0" />
            <Audio src={staticFile(DIR + 'audio.wav')} />
        </AbsoluteFill>
    );
};
