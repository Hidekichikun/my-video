import React, { useMemo } from 'react';
import { AbsoluteFill, random } from 'remotion';

/** 舞い上がる光の粒（木漏れ日のボケ） */
export const Particles: React.FC<{ t: number; intensity: number; cool: number }> = ({ t, intensity, cool }) => {
    const particles = useMemo(
        () =>
            new Array(70).fill(0).map((_, i) => ({
                x: random(`px-${i}`) * 1920,
                y0: random(`py-${i}`) * 1300,
                size: 4 + random(`ps-${i}`) ** 2 * 26,
                speed: 14 + random(`pv-${i}`) * 46,
                sway: 10 + random(`pw-${i}`) * 40,
                phase: random(`pp-${i}`) * Math.PI * 2,
                blur: random(`pb-${i}`) < 0.35 ? 6 : 1.5,
                tw: 0.6 + random(`pt-${i}`) * 1.6,
            })),
        []
    );
    if (intensity <= 0.01) return null;
    const warm = `255, ${Math.round(214 - cool * 40)}, ${Math.round(150 + cool * 100)}`;
    return (
        <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
            {particles.map((p, i) => {
                const y = ((p.y0 - t * p.speed) % 1300 + 1300) % 1300 - 110;
                const x = p.x + Math.sin(t * 0.6 + p.phase) * p.sway;
                const twinkle = 0.45 + 0.55 * Math.sin(t * p.tw + p.phase) ** 2;
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
                            background: `radial-gradient(circle, rgba(${warm},0.95) 0%, rgba(${warm},0.35) 45%, rgba(${warm},0) 72%)`,
                            filter: `blur(${p.blur}px)`,
                            opacity: twinkle * intensity,
                        }}
                    />
                );
            })}
        </AbsoluteFill>
    );
};

/** ゆっくり動くあたたかい光漏れ */
export const LightLeak: React.FC<{ t: number; strength: number }> = ({ t, strength }) => {
    if (strength <= 0.01) return null;
    const ax = 18 + Math.sin(t * 0.13) * 14;
    const ay = 12 + Math.cos(t * 0.11) * 10;
    const bx = 86 + Math.sin(t * 0.09 + 1.3) * 10;
    const by = 78 + Math.cos(t * 0.15 + 0.4) * 12;
    return (
        <AbsoluteFill
            style={{
                pointerEvents: 'none',
                mixBlendMode: 'screen',
                opacity: strength,
                background: [
                    `radial-gradient(ellipse 55% 60% at ${ax}% ${ay}%, rgba(255,170,70,0.55) 0%, rgba(255,140,60,0.18) 40%, rgba(0,0,0,0) 70%)`,
                    `radial-gradient(ellipse 45% 50% at ${bx}% ${by}%, rgba(255,110,150,0.35) 0%, rgba(255,110,150,0.1) 45%, rgba(0,0,0,0) 72%)`,
                ].join(','),
            }}
        />
    );
};

export const Vignette: React.FC<{ strength: number }> = ({ strength }) => (
    <AbsoluteFill
        style={{
            pointerEvents: 'none',
            background: `radial-gradient(ellipse 75% 75% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
        }}
    />
);

/** 画面全体のフラッシュ（カット替わり・ビート） */
export const Flash: React.FC<{ opacity: number; color?: string }> = ({ opacity, color = '255,236,205' }) =>
    opacity <= 0.005 ? null : (
        <AbsoluteFill style={{ pointerEvents: 'none', background: `rgba(${color},${Math.min(1, opacity)})` }} />
    );
