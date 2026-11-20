import React from 'react';
import { AbsoluteFill, Audio, Img, random, staticFile, useCurrentFrame } from 'remotion';
import { LINES } from './lyrics';
import { SHOTS, DARK, shotAt, accent, HUD, LyricLine } from './Sine';
import { FPS, SONG, GOLD, LAV, MIN, MINT, POP, SER, clamp, easeInOut, easeOut, env, lerp, useFonts } from './common';
import { Diagrams, dimAt } from './diagrams';
import { MinchoDrift } from './drift';

const VW = 1080, VH = 1920;
export type ShortProps = { start: number; end: number; label: string; silent?: boolean; clean?: boolean };

// 16:9 illustration filling the vertical frame, following the shot's focus point
const VBg: React.FC<{ t: number; frame: number; dim: number }> = ({ t, frame, dim }) => {
  const si = shotAt(t);
  const shot = SHOTS[si];
  const nextT = SHOTS[si + 1]?.t ?? SONG;
  const fx = shot.fx || {};
  const p = easeInOut((t - shot.t) / Math.max(0.1, nextT - shot.t));
  const cx = lerp(shot.a[0], shot.b[0], p), cy = lerp(shot.a[1], shot.b[1], p), z = lerp(shot.a[2], shot.b[2], p);
  const s = (VH / 1080) * Math.max(1, z * 0.8) * (1 + 0.025 * (fx.pulse || 0) * env('onset', frame));
  const iw = 1920 * s, ih = 1080 * s;
  const tx = clamp(VW / 2 - cx * s, VW - iw, 0), ty = clamp(VH / 2 - cy * s, VH - ih, 0);
  const rot = fx.spin ? Math.sin((t - shot.t) * 0.9) * fx.spin : 0;
  const filt = [fx.desat ? `grayscale(${fx.desat})` : '', dim > 0 ? `brightness(${1 - dim * 0.72}) saturate(${1 - dim * 0.35})` : ''].join(' ').trim();
  const sinceCut = t - shot.t;
  const glitch = sinceCut < 0.15 && si > 0 && SHOTS[si - 1].img !== shot.img ? 1 - sinceCut / 0.15 : 0;
  return (
    <AbsoluteFill style={{ transform: `rotate(${rot}deg) scale(${rot ? 1.06 : 1})` }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: iw, height: ih, transform: `translate(${tx}px, ${ty}px)` }}>
        <Img src={staticFile(`cs/sine-${shot.img}.jpg`)} style={{ width: iw, height: ih, filter: filt || undefined }} />
      </div>
      {glitch > 0 && <AbsoluteFill style={{ background: '#fff', opacity: glitch * 0.35 }} />}
    </AbsoluteFill>
  );
};

export const SineShort: React.FC<ShortProps> = ({ start, end, label, silent, clean }) => {
  useFonts();
  const f = useCurrentFrame();
  const g = Math.round(start * FPS) + f;
  const t = g / FPS;
  const lt = t - start;
  const dur = end - start;
  const si = shotAt(t);
  const shot = SHOTS[si];
  const fx = shot.fx || {};
  const acc = accent(t);
  const b = env('bass', g);
  const sAmp = (fx.shake || 0) * (6 + 10 * b) + acc * 22;
  const sx = (random(`ssx${g}`) - 0.5) * sAmp, sy = (random(`ssy${g}`) - 0.5) * sAmp;
  const dim = dimAt(t);
  const dark = DARK.has(shot.img) || dim > 0.3;
  const BS = VW / 1920; // band scale for 16:9 overlays
  const endP = clamp((lt - (dur - 1.6)) / 0.4);
  return (
    <AbsoluteFill style={{ background: '#0c1030', overflow: 'hidden' }}>
      {!silent && <Audio src={staticFile('song.wav')} startFrom={Math.round(start * FPS)} endAt={Math.round(end * FPS)} />}
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <VBg t={t} frame={g} dim={dim} />
        {/* drifting mincho formulas, full height (two bands) */}
        {[330, 1150].map((y) => (
          <div key={y} style={{ position: 'absolute', left: 0, top: y, width: 1920, height: 1080, transform: `scale(${BS * 1.25})`, transformOrigin: '0 0' }}>
            <MinchoDrift t={t + y / 200} strength={dim > 0.3 ? 0.55 : 1} dark={dark} />
          </div>
        ))}
        {/* diagrams from the MV, in the middle band */}
        <div style={{ position: 'absolute', left: 0, top: 640, width: 1920, height: 1080, transform: `scale(${BS})`, transformOrigin: '0 0' }}>
          <div style={{ position: 'relative', width: 1920, height: 1080 }}><Diagrams t={t} /></div>
        </div>
        <AbsoluteFill style={{ background: 'linear-gradient(to bottom, rgba(8,10,34,0.75) 0%, rgba(8,10,34,0) 24%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)' }} />
        {/* title */}
        {!clean && <>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center', color: '#fff', fontFamily: MIN, whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: 34, letterSpacing: '0.35em', color: GOLD }}>恋する数学講義　第3講</div>
          <div style={{ fontFamily: SER, fontStyle: 'italic', fontWeight: 600, fontSize: 150, lineHeight: 1.0, textShadow: `0 0 26px ${MINT}` }}>Sine</div>
          <div style={{ fontSize: 50, letterSpacing: '0.06em', textShadow: '0 0 12px rgba(0,0,0,0.8)' }}>〜<span style={{ color: LAV }}>僕</span>×<span style={{ color: MINT }}>君</span>＝好きの面積!?〜</div>
        </div>
        </>}
        {/* HUD (section + area meter) */}
        <div style={{ position: 'absolute', left: 0, top: clean ? 120 : 360, width: 1440, height: 300, transform: 'scale(0.75)', transformOrigin: '0 0' }}>
          <div style={{ position: 'relative', width: 1440, height: 300 }}><HUD t={t} frame={g} /></div>
        </div>
        {!clean && LINES.filter((l) => t >= l.t && t < l.e).map((l) => <LyricLine key={l.t} line={l} t={t} frame={g} narrow />)}
        {!clean && endP > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 160, textAlign: 'center', opacity: endP, transform: `scale(${lerp(1.3, 1, easeOut(endP))})` }}>
            <span style={{ display: 'inline-block', background: 'rgba(12,16,44,0.9)', border: `4px solid ${MINT}`, outline: `2px solid ${LAV}`, outlineOffset: 6, borderRadius: 8, padding: '14px 40px', fontFamily: MIN, fontSize: 50, color: '#fff', letterSpacing: '0.08em' }}>▶ フルMVは関連動画から</span>
          </div>
        )}
        {!clean && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 76, textAlign: 'center', fontFamily: MIN, fontSize: 32, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.85)' }}>ただいま正気を失い中</div>}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: '#fff', opacity: acc * 0.25, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ background: '#000', opacity: clamp(1 - lt / 0.25) * 0.8 + clamp((lt - (dur - 0.3)) / 0.3) }} />
      <div style={{ display: 'none' }}>{label}{POP}</div>
    </AbsoluteFill>
  );
};
