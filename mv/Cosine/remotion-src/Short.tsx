import React from 'react';
import { AbsoluteFill, Audio, Img, random, staticFile, useCurrentFrame } from 'remotion';
import { LINES } from './lyrics';
import {
  FPS, SHOTS, shotAt, camera, accent, Overlays, HUD, LyricLine, useFonts, clamp, lerp, easeOut, env,
  POP, BANG, CHALK, PINK, GOLD, CHALKW,
} from './Cosine';

const VW = 1080, VH = 1920;
export type ShortProps = { start: number; end: number; label: string };

// background: 16:9 picture filling the vertical frame, following the shot's focus point
const VBg: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const si = shotAt(t);
  const shot = SHOTS[si];
  const nextT = SHOTS[si + 1]?.t ?? 234.8;
  const cam = camera(shot, t, nextT);
  const fx = shot.fx || {};
  const base = VH / 1080; // 1.778
  const s = base * Math.max(1, cam.s * 0.85) * (1 + 0.03 * (fx.pulse || 0) * env('onset', frame));
  const iw = 1920 * s, ih = 1080 * s;
  let tx = VW / 2 - cam.fx * s, ty = VH / 2 - cam.fy * s;
  tx = clamp(tx, VW - iw, 0); ty = clamp(ty, VH - ih, 0);
  let tilt = '';
  if (fx.tiltOut) { const p = clamp((t - shot.t) / 0.69); tilt = `perspective(1400px) rotateX(${lerp(0, 72, p)}deg) rotateZ(${lerp(0, 90, p)}deg) scale(${lerp(1, 1.6, p)})`; }
  if (fx.tiltIn) { const p = easeOut((t - shot.t) / 0.5); tilt = `rotateZ(${lerp(-45, 0, p)}deg) scale(${lerp(1.5, 1, p)})`; }
  const filt = fx.desat ? `grayscale(${fx.desat}) contrast(1.1) brightness(0.92)` : undefined;
  const sinceCut = t - shot.t;
  const glitch = sinceCut < 0.17 && !fx.desat && !fx.tiltIn ? 1 - sinceCut / 0.17 : 0;
  const img = (
    <AbsoluteFill style={{ transform: tilt || undefined }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: iw, height: ih, transform: `translate(${tx}px, ${ty}px)` }}>
        <Img src={staticFile(`cs/${shot.img}.jpg`)} style={{ width: iw, height: ih, filter: filt }} />
      </div>
    </AbsoluteFill>
  );
  return (
    <>
      {img}
      {glitch > 0 && [0, 1].map((i) => {
        const y0 = random(`vgy${i}-${frame}`) * 1700, hgt = 80 + random(`vgh${i}-${frame}`) * 220;
        const off = (random(`vgo${i}-${frame}`) - 0.5) * 140 * glitch;
        return <AbsoluteFill key={i} style={{ clipPath: `inset(${y0}px 0 ${Math.max(0, VH - y0 - hgt)}px 0)`, transform: `translateX(${off}px)`, filter: i ? 'hue-rotate(90deg) saturate(2)' : undefined }}>{img}</AbsoluteFill>;
      })}
    </>
  );
};

export const CosineShort: React.FC<ShortProps> = ({ start, end, label }) => {
  useFonts();
  const f = useCurrentFrame();
  const g = Math.round(start * FPS) + f; // global frame
  const t = g / FPS;
  const lt = t - start;
  const dur = end - start;
  const acc = accent(t);
  const si = shotAt(t);
  const fx = SHOTS[si].fx || {};
  const b = env('bass', g);
  const sAmp = (fx.shake || 0) * (6 + 10 * b) + acc * 22;
  const sx = (random(`ssx${g}`) - 0.5) * sAmp, sy = (random(`ssy${g}`) - 0.5) * sAmp;
  const endP = clamp((lt - (dur - 1.4)) / 0.4);
  return (
    <AbsoluteFill style={{ background: '#f4f8ff', overflow: 'hidden' }}>
      <Audio src={staticFile('song.wav')} startFrom={Math.round(start * FPS)} endAt={Math.round(end * FPS)} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <VBg t={t} frame={g} />
        {/* overlays from the MV, scaled into the middle band */}
        <div style={{ position: 'absolute', left: (VW - 1920 * 0.75) / 2, top: 620, width: 1920, height: 1080, transform: 'scale(0.75)', transformOrigin: '0 0' }}>
          <div style={{ position: 'relative', width: 1920, height: 1080 }}><Overlays t={t} frame={g} /></div>
        </div>
        <AbsoluteFill style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.55) 100%)' }} />
        {/* title */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center' }}>
          <div style={{ fontFamily: CHALK, fontSize: 120, color: CHALKW, textShadow: '0 0 14px rgba(0,0,0,0.6)', WebkitTextStroke: '8px #143428', paintOrder: 'stroke fill' }}>Cosine</div>
          <div style={{ fontFamily: POP, fontSize: 50, color: '#fff', WebkitTextStroke: '10px #143428', paintOrder: 'stroke fill', marginTop: 6 }}>〜<span style={{ color: PINK }}>私</span>・<span style={{ color: GOLD }}>君</span>＝好きの最大値!?〜</div>
        </div>
        {/* HUD (section + protractor) */}
        <div style={{ position: 'absolute', left: 0, top: 330, width: 1440, height: 300, transform: 'scale(0.75)', transformOrigin: '0 0' }}>
          <div style={{ position: 'relative', width: 1440, height: 300 }}><HUD t={t} frame={g} /></div>
        </div>
        {LINES.filter((l) => t >= l.t && t < l.e).map((l) => <LyricLine key={l.t} line={l} t={t} frame={g} narrow />)}
        {/* end tag */}
        {endP > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', opacity: endP, transform: `scale(${lerp(1.3, 1, easeOut(endP))})` }}>
            <span style={{ display: 'inline-block', background: PINK, border: '6px solid #111', borderRadius: 40, padding: '14px 40px', fontFamily: POP, fontSize: 52, color: '#fff', boxShadow: '8px 8px 0 #111' }}>▶ フルMVは関連動画から</span>
          </div>
        )}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: POP, fontSize: 34, color: GOLD, WebkitTextStroke: '6px #111', paintOrder: 'stroke fill' }}>ただいま正気を失い中</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: '#fff', opacity: acc * 0.28, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ background: '#000', opacity: clamp(1 - lt / 0.25) * 0.8 + clamp((lt - (dur - 0.3)) / 0.3) }} />
      <div style={{ display: 'none' }}>{label}{BANG}</div>
    </AbsoluteFill>
  );
};
