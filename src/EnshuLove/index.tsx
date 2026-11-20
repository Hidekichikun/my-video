import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, continueRender, delayRender, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {timeline} from './timeline';
import {CIRCLES, Ell} from './circles';

const VIDEO_END = timeline.duration + 2;
export const ENSHU_DURATION = Math.ceil(VIDEO_END * 30);
export const PINK = '#ff49a6';
export const CYAN = '#72f4ff';
export const WHITE = '#fff9e7';
export const BAR = 240 / 109;
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = Easing.bezier(.45, 0, .2, 1);
export const asset = (name: string) => staticFile(`enshu-love/${name}`);
export const MATH = 'Cambria Math, STIX Two Math, DejaVu Serif, Georgia, serif';

export const useChalkFont = () => {
  const [handle] = useState(() => delayRender('Load local chalk lettering'));
  useEffect(() => {
    const font = new FontFace('EnshuChalk', `url("${staticFile('fonts/OtsutomeFont_Ver3_16.ttf')}")`);
    font.load().then((loaded) => {document.fonts.add(loaded); continueRender(handle);})
      .catch(() => continueRender(handle));
  }, [handle]);
};

/* ---------- 君 = the circle: revolutions per bar for each section ---------- */
const RATE: Record<string, number> = {
  'Intro': .5, 'Verse 1': .5, 'Pre-Chorus': 1, 'Chorus': 1, 'Post-Chorus': 2, 'Verse 2': .5,
  'Breakdown': .5, 'Bridge': .25, 'Build': 2.5, 'Final Chorus': 1, 'Outro': .25,
};
export const phaseAt = (t: number) => {
  let p = 0;
  for (const s of timeline.sections) {
    if (t <= s.start) break;
    p += (Math.min(t, s.end) - s.start) * (RATE[s.name] ?? .5) / BAR;
  }
  if (t > timeline.duration) p += (t - timeline.duration) * .25 / BAR;
  return p;
};
export const sectionAt = (t: number) => timeline.sections.find((s) => t >= s.start && t < s.end) ?? timeline.sections[timeline.sections.length - 1];

const onEll = (e: Pick<Ell, 'cx' | 'cy' | 'rx' | 'ry' | 'rot'>, a: number, scale = 1) => {
  const r = e.rot * Math.PI / 180;
  const x = e.rx * scale * Math.cos(a), y = e.ry * scale * Math.sin(a);
  return {x: e.cx + x * Math.cos(r) - y * Math.sin(r), y: e.cy + x * Math.sin(r) + y * Math.cos(r)};
};

/* follow the traced chalk line itself; deg = angle around the circle (0 = right, 90 = down) */
const onPath = (e: Ell, deg: number) => {
  const d = ((deg % 360) + 360) % 360, i = Math.floor(d), f = d - i;
  const a = e.path[i], b = e.path[(i + 1) % 360];
  return {x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f};
};
const visAt = (e: Ell, deg: number) => {
  let v = 0;
  for (let k = -8; k <= 8; k += 2) v += e.vis[((Math.round(deg + k) % 360) + 360) % 360];
  return v / 9;
};

export const Kimi: React.FC<{e: Ell; w: number; h: number; phase: number; draw: number; flash: number; hot: boolean}> = ({e, w, h, phase, draw, flash, hot}) => {
  const head = e.line + phase * 360;
  const trailN = hot ? 40 : 26, step = hot ? 2.9 : 2.3;
  const trail = Array.from({length: trailN}, (_, i) => {
    const deg = head - i * step;
    const p = onPath(e, deg);
    return <circle key={i} cx={p.x} cy={p.y} r={(hot ? 7 : 5.5) * (1 - i / (trailN + 4))} fill={i < 3 ? WHITE : i % 2 ? PINK : WHITE} opacity={(1 - i / trailN) * .85 * visAt(e, deg)}/>;
  });
  const hp = onPath(e, head);
  const hv = visAt(e, head);
  /* visible arcs of the circle as one path, drawn on from the radius line */
  const d = e.path.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join('') + 'Z';
  let len = 0;
  for (let i = 0; i < 360; i++) {const a = e.path[i], b = e.path[(i + 1) % 360]; len += Math.hypot(b[0] - a[0], b[1] - a[1]);}
  const hidden = e.vis.some((v) => !v);
  const visMask = hidden ? <mask id="kimiVis"><rect x="0" y="0" width={w} height={h} fill="#fff"/>
    {e.vis.map((v, i) => v ? null : <circle key={i} cx={e.path[i][0]} cy={e.path[i][1]} r="16" fill="#000"/>)}</mask> : null;
  return <svg viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none'}}>
    <defs>
      <filter id="kimiGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <radialGradient id="kimiHead"><stop offset="0" stopColor="#fff"/><stop offset=".35" stopColor={WHITE} stopOpacity=".9"/><stop offset="1" stopColor={PINK} stopOpacity="0"/></radialGradient>
      {visMask}
    </defs>
    <g filter="url(#kimiGlow)" mask={hidden ? 'url(#kimiVis)' : undefined}>
      <path d={d} fill="none" stroke={WHITE} strokeWidth={3 + flash * 5} opacity={.28 + flash * .7} strokeDasharray={len} strokeDashoffset={len * (1 - draw)}/>
      {draw >= 1 ? trail : null}
    </g>
    {draw >= 1 && hv > .02 ? <g opacity={hv}>
      <circle cx={hp.x} cy={hp.y} r={hot ? 54 : 40} fill="url(#kimiHead)"/>
      <circle cx={hp.x} cy={hp.y} r={hot ? 9 : 7} fill="#fff" filter="url(#kimiGlow)"/>
    </g> : null}
    <circle cx={e.dx} cy={e.dy} r={7 + Math.max(0, Math.sin(phase * Math.PI * 8)) * 6 + flash * 10} fill={WHITE} opacity={.35 + flash * .6} filter="url(#kimiGlow)"/>
  </svg>;
};

export const Dust: React.FC<{frame: number; intense: boolean}> = ({frame, intense}) => (
  <svg viewBox="0 0 1920 1080" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', mixBlendMode: 'screen'}}>
    {Array.from({length: intense ? 85 : 35}, (_, i) => {
      const x = (random(i * 3) * 1920 + Math.sin(frame / 90 + i) * 35 + 1920) % 1920;
      const y = (random(i * 3 + 1) * 1080 - frame * (intense ? 1.8 : .35) * (.4 + random(i)) + 100000) % 1080;
      return <circle key={i} cx={x} cy={y} r={.8 + random(i + 90) * (intense ? 3 : 1.8)} fill={i % 7 === 0 ? PINK : i % 9 === 0 ? CYAN : WHITE} opacity={.15 + .5 * Math.abs(Math.sin(frame / 38 + i))}/>;
    })}
  </svg>
);

/* ---------- lyrics: chalk write-on, eraser wipe-off ---------- */
const KEY = /(円周|代入|二乗|イコール|数式|式|君|点|線|解|プラス|マイナス|Feel my love[!…]?|Round and round|Solve( for)? me!?|Spin it)/;
export type Cue = {text: string; start: number; end: number};

const splitKeys = (text: string) => {
  const out: {ch: string; key: boolean}[] = [];
  let rest = text;
  while (rest.length) {
    const m = rest.match(KEY);
    if (!m || m.index === undefined) {out.push(...Array.from(rest).map((ch) => ({ch, key: false}))); break;}
    out.push(...Array.from(rest.slice(0, m.index)).map((ch) => ({ch, key: false})));
    out.push(...Array.from(m[0]).map((ch) => ({ch, key: true})));
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
};

const SCRUB = 3.5;
export const ChalkLine: React.FC<{cue: Cue; t: number; vertical: boolean; frame: number; width: number}> = ({cue, t, vertical, frame, width}) => {
  const chars = splitKeys(cue.text);
  const english = /^[\x00-\x7F’—…]+$/.test(cue.text);
  const dur = cue.end - cue.start;
  const writeTime = Math.min(dur * .6, Math.max(.25, chars.length * (english ? .035 : .07)));
  const eraseLen = Math.min(.55, dur * .3);
  const ep = interpolate(t, [cue.end - eraseLen, cue.end], [0, 1], clamp);
  const erasing = t > cue.end - eraseLen;
  const spacing = english ? 2 : 6;
  const base = vertical ? (english ? 100 : 78) : (english ? 122 : 92);
  const est = chars.reduce((a, {ch}) => a + (/[\x00-\x7F]/.test(ch) ? .5 : 1) * base + spacing, 0);
  const maxW = width * (vertical ? .86 : .84);
  const size = vertical ? base : base * Math.min(1, maxW / est);
  const tilt = (random(cue.start) - .5) * 3;
  const punch = english ? interpolate(t - cue.start, [0, .18], [1.18, 1], {...clamp, easing: Easing.out(Easing.back(2))}) : 1;
  /* the eraser scrubs up and down while it travels to the right */
  const headAt = (q: number) => .5 + .5 * Math.sin(q * Math.PI * 2 * SCRUB);
  const wipeAt = (q: number) => -18 + q * 140;
  const edge = (y: number) => {
    let m = -100;
    for (let q = 0; q <= ep + 1e-6; q += .015) m = Math.max(m, wipeAt(q) - 30 * Math.abs(y - headAt(q)));
    return m;
  };
  const text = (style?: React.CSSProperties, key?: number) => <div key={key} style={{whiteSpace: vertical ? 'normal' : 'nowrap', textAlign: 'center', fontFamily: 'EnshuChalk, serif', fontSize: size, lineHeight: 1.3, letterSpacing: spacing, ...style}}>
    {chars.map(({ch, key: k}, i) => {
      const at = cue.start + writeTime * i / Math.max(1, chars.length);
      const age = t - at;
      if (age < 0) return <span key={i} style={{opacity: 0}}>{ch}</span>;
      const reveal = interpolate(age, [0, english ? .06 : .12], [0, 100], clamp);
      const spark = interpolate(age, [0, .25], [1, 0], clamp);
      const color = k ? PINK : WHITE;
      const shadow = english
        ? `3px 0 ${PINK}, -3px 0 ${CYAN}, 0 0 ${18 + spark * 30}px ${k ? PINK : '#fff8'}, 0 4px 14px #001813`
        : `0 0 ${3 + spark * 20}px ${k ? PINK : '#fffa'}, 0 3px 12px #001813, 0 0 26px #001813`;
      return <span key={i} style={{display: 'inline-block', color, textShadow: shadow, clipPath: `inset(-20% ${100 - reveal}% -20% -20%)`,
        transform: `translateY(${(1 - Math.min(1, age / .15)) * (english ? -18 : 6)}px) rotate(${(random(i + cue.start * 7) - .5) * (english ? 2 : 5)}deg)`,
        minWidth: ch === ' ' ? '.35em' : undefined}}>{ch}</span>;
    })}
  </div>;
  const STRIPS = 10;
  const hy = headAt(ep), hx = wipeAt(ep);
  return <div style={{position: 'absolute', left: vertical ? '6%' : '6%', right: vertical ? '6%' : '6%', bottom: vertical ? '13%' : '8%', display: 'flex', justifyContent: 'center', transform: `rotate(${tilt}deg) scale(${punch})`}}>
    <div style={{position: 'relative', padding: '0 .3em'}}>
      {!erasing ? text() : <>
        <div style={{visibility: 'hidden'}}>{text()}</div>
        {Array.from({length: STRIPS}, (_, j) => {
          const y0 = j / STRIPS, y1 = (j + 1) / STRIPS;
          const e = edge((y0 + y1) / 2);
          const m = `linear-gradient(90deg, transparent ${e - 2}%, #000 ${e + 5}%)`;
          return <div key={j} style={{position: 'absolute', inset: 0, padding: '0 .3em', clipPath: `inset(${j === 0 ? -30 : y0 * 100 - .4}% -10% ${j === STRIPS - 1 ? -30 : 100 - y1 * 100 - .4}% -10%)`}}>
            <div style={{WebkitMaskImage: m, maskImage: m}}>{text()}</div>
            <div style={{position: 'absolute', inset: 0, filter: 'blur(4px)', opacity: .9,
              background: `linear-gradient(90deg, transparent ${e - 40}%, rgba(225,240,232,.09) ${e - 22}%, rgba(238,246,242,.30) ${e - 3}%, transparent ${e + 1}%)`}}/>
          </div>;
        })}
        <div style={{position: 'absolute', left: `${hx}%`, top: `${hy * 100}%`, width: '1.4em', height: '1em', fontSize: size, transform: 'translate(-60%, -50%)', borderRadius: '45%',
          background: 'radial-gradient(closest-side, rgba(240,248,244,.42), rgba(240,248,244,.12) 60%, transparent)', filter: 'blur(6px)'}}/>
      </>}
      {!erasing && t - cue.start < writeTime + .1 ? <ChalkSpark frame={frame} progress={(t - cue.start) / writeTime}/> : null}
    </div>
  </div>;
};

const ChalkSpark: React.FC<{frame: number; progress: number}> = ({frame, progress}) => {
  const x = Math.min(100, Math.max(0, progress * 100));
  return <div style={{position: 'absolute', left: `${x}%`, top: '50%', width: 0, height: 0}}>
    {Array.from({length: 7}, (_, i) => <div key={i} style={{position: 'absolute', width: 3 + random(frame + i) * 4, height: 3 + random(frame + i) * 4, borderRadius: '50%', background: i % 3 ? WHITE : PINK,
      transform: `translate(${(random(frame * 3 + i) - .5) * 60}px, ${(random(frame * 5 + i) - .2) * 50}px)`, opacity: .8, boxShadow: '0 0 6px #fff'}}/>)}
  </div>;
};

/* ---------- equation: written term by term, then it rolls itself into a circle ---------- */
export const TERMS = ['(x − a)²', '+ (y − b)²', '= r²'];
const EQ = '(x − a)² + (y − b)² = r²';
const termOf = (i: number) => (i < 8 ? 0 : i < 19 ? 1 : 2);
export const groups = (() => {
  const out: Cue[][] = [];
  const cues = timeline.cues as unknown as Cue[];
  cues.forEach((c, i) => {if (c.text === TERMS[0]) out.push([c, cues[i + 1], cues[i + 2]]);});
  return out;
})();

const eqTiming = (g: Cue[]) => {
  const formStart = g[2].start + .5;
  const shot = timeline.shots.find((sh) => formStart >= sh.start && formStart < sh.end);
  const fadeStart = Math.min(formStart + 3.6, (shot?.end ?? Infinity) - .75);
  return {formStart, flyEnd: formStart + .8, fadeStart, fadeEnd: fadeStart + .7};
};

export const Equation: React.FC<{t: number; e: Ell | null; w: number; h: number; vertical: boolean}> = ({t, e, w, h, vertical}) => {
  const g = groups.find((gr) => t >= gr[0].start && t < eqTiming(gr).fadeEnd);
  if (!g) return null;
  const {formStart, flyEnd, fadeStart, fadeEnd} = eqTiming(g);
  const chars = Array.from(EQ);
  const size = vertical ? 74 : 136;
  const adv = (c: string) => (c === ' ' ? .28 : c === '²' ? .34 : c === '−' || c === '+' || c === '=' ? .62 : .55) * size;
  const total = chars.reduce((s, c) => s + adv(c), 0);
  const fly = ease(interpolate(t, [formStart, flyEnd], [0, 1], clamp));
  const spin = Math.max(0, t - formStart - .3) * Math.PI * 2 / (BAR * 2);
  const fade = interpolate(t, [fadeStart, fadeEnd], [1, 0], clamp);
  const target = e ?? {cx: w / 2, cy: h * .45, rx: h * .3, ry: h * .3, rot: 0, dx: w / 2, dy: h * .45, line: 0};
  let x0 = w / 2 - total / 2;
  const baseY = vertical ? h * .62 : h * .6;
  const visible = chars.filter((c) => c !== ' ').length;
  const settle = interpolate(t, [flyEnd, flyEnd + .3], [0, 1], clamp);
  let k = 0;
  return <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
    {chars.map((c, i) => {
      const lineX = x0 + adv(c) / 2; x0 += adv(c);
      if (c === ' ') return null;
      const idx = k++;
      const term = g[termOf(i)];
      const first = chars.slice(0, i).filter((ch, j) => ch !== ' ' && termOf(j) === termOf(i)).length;
      const age = t - (term.start + first * .07);
      if (age < 0) return null;
      const a = -Math.PI / 2 + idx / visible * Math.PI * 2 + spin;
      const tp = onEll(target, a, .86 + (1 - fade) * .12); const cx = tp.x, cy = tp.y;
      const x = lineX + (cx - lineX) * fly, y = baseY + (cy - baseY) * fly + Math.sin(fly * Math.PI) * -60 * (idx % 2 ? 1 : -1);
      const rot = fly * (a * 180 / Math.PI + 90);
      const pinkTerm = termOf(i) === 2;
      return <div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${interpolate(age, [0, .12], [1.5, 1], clamp)})`,
        fontFamily: MATH, fontSize: c === '²' ? size * .8 : size, marginTop: c === '²' ? -size * .22 : 0, color: pinkTerm ? PINK : WHITE,
        opacity: Math.min(interpolate(age, [0, .1], [0, 1], clamp), fade), textShadow: `0 0 ${16 + fly * 20 + settle * 12}px ${pinkTerm ? PINK : '#fffc'}, 0 4px 16px #001813`,
        clipPath: `inset(-30% ${100 - interpolate(age, [0, .1], [0, 100], clamp)}% -30% -30%)`}}>{c}</div>;
    })}
  </div>;
};
/* how strongly the circle lights up when the equation becomes the circle */
export const eqFlash = (t: number) => {
  for (const g of groups) {
    const {flyEnd, fadeStart, fadeEnd} = eqTiming(g);
    if (t > flyEnd - .2 && t < flyEnd + 1.2) return interpolate(t, [flyEnd - .2, flyEnd, flyEnd + 1.2], [0, 1, .25], clamp);
    if (t >= flyEnd + 1.2 && t < fadeEnd + .8) return interpolate(t, [flyEnd + 1.2, fadeStart, fadeEnd, fadeEnd + .8], [.25, .25, .9, 0], clamp);
  }
  return 0;
};

/* ---------- title ---------- */
const Title: React.FC<{t: number; start: number}> = ({t, start}) => {
  const chars = Array.from('円周ラブ');
  return <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 30}}>
    {chars.map((c, i) => {
      const age = t - start - .3 - i * .28;
      if (age < 0) return <span key={i} style={{fontSize: 190, opacity: 0, fontFamily: 'EnshuChalk'}}>{c}</span>;
      return <span key={i} style={{display: 'inline-block', fontFamily: 'EnshuChalk', fontSize: 190, letterSpacing: 18, color: i === 3 ? PINK : WHITE,
        clipPath: `inset(-20% ${100 - interpolate(age, [0, .22], [0, 100], clamp)}% -20% -20%)`,
        textShadow: `5px 0 ${PINK}, -4px 0 ${CYAN}, 0 0 ${10 + interpolate(age, [0, .4], [40, 0], clamp)}px #fff, 0 6px 25px #00120d`}}>{c}</span>;
    })}
  </div>;
};


/* ---------- the big "Feel my love!" that kicks off each chorus: the picture shows through the letters ---------- */
export const bigFeel = (cue: Cue | undefined) => {
  if (!cue || cue.text !== 'Feel my love!') return false;
  const cues = timeline.cues as unknown as Cue[];
  const i = cues.findIndex((c) => c.start === cue.start && c.text === cue.text);
  return i >= 0 && cues[i + 1]?.text === TERMS[0];
};
export const BigFeel: React.FC<{cue: Cue; t: number; w: number; h: number; image: string; vertical: boolean}> = ({cue, t, w, h, image, vertical}) => {
  const age = t - cue.start, dur = cue.end - cue.start;
  const p = Math.min(1, age / dur);
  const pop = interpolate(age, [0, .16], [1.45, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  const out = interpolate(t, [cue.end - .16, cue.end], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const dx = (-60 + p * 120) + out * w * .7, dy = (40 - p * 80) - out * h * .5;
  const rot = vertical ? -12 : -9;
  const s1 = vertical ? 190 : 300, s2 = vertical ? 330 : 540;
  const cx = w / 2, cy = h * (vertical ? .42 : .5);
  const tf = `translate(${cx + dx} ${cy + dy}) rotate(${rot}) scale(${pop})`;
  const words = (fill: string, extra: React.SVGProps<SVGTextElement> = {}) => <>
    <text x={vertical ? -10 : -40} y={-s1 * .32} textAnchor="middle" fontFamily="EnshuChalk, serif" fontSize={s1} fill={fill} {...extra}>Feel my</text>
    <text x={vertical ? 20 : 90} y={s2 * .62} textAnchor="middle" fontFamily="EnshuChalk, serif" fontSize={s2} fill={fill} {...extra}>love!</text>
  </>;
  const flash = interpolate(age, [0, .12], [.55, 0], clamp);
  return <svg viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible'}}>
    <defs>
      <clipPath id={`feel${Math.round(cue.start * 100)}`}>{words('#fff', {transform: tf})}</clipPath>
      <filter id="feelGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>
    <rect x="0" y="0" width={w} height={h} fill="#020c09" opacity={.5 * (1 - out)}/>
    <g transform={tf} opacity={1 - out}>
      <g filter="url(#feelGlow)" opacity=".9">{words(PINK)}</g>
      <g transform="translate(-9 4)" opacity=".85">{words(CYAN)}</g>
      <g transform="translate(9 -4)" opacity=".85">{words(PINK)}</g>
    </g>
    <g clipPath={`url(#feel${Math.round(cue.start * 100)})`} opacity={1 - out}>
      <image href={asset(image)} x="0" y="0" width={w} height={h} preserveAspectRatio="xMidYMid slice" style={{filter: 'brightness(1.55) saturate(1.5) contrast(1.1)'}}
        transform={`translate(${-dx * .35} ${-dy * .35}) scale(1.05)`}/>
      <rect x="0" y="0" width={w} height={h} fill="#fff" opacity={flash}/>
    </g>
    <g transform={tf} opacity={1 - out}>{words('none', {stroke: WHITE, strokeWidth: 5})}</g>
  </svg>;
};

type Mode = 'full' | 'chorus' | 'breakdown';
export const EnshuLove: React.FC<{mode?: Mode}> = ({mode = 'full'}) => {
  useChalkFont();
  const localFrame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const vertical = height > width;
  const offset = mode === 'chorus' ? timeline.sections[3].start : mode === 'breakdown' ? timeline.sections[9].start : 0;
  const frame = localFrame + Math.round(offset * fps);
  const t = frame / fps;
  const shot = timeline.shots.find((s) => t >= s.start && t < s.end) ?? timeline.shots[timeline.shots.length - 1];
  const cue = (timeline.cues as unknown as Cue[]).find((c) => t >= c.start && t < c.end);
  const section = sectionAt(t).name;
  const intense = [18, 19, 22].includes(shot.id);
  const freeze = cue?.text === '(glitch stop)';
  const freezeAt = timeline.cues.find((c) => c.text === '(glitch stop)')?.start ?? 0;
  const motionFrame = freeze ? Math.round(Math.max(shot.start, freezeAt) * fps) : frame;
  const motionT = motionFrame / fps;
  const shotProgress = Math.min(1, Math.max(0, (motionT - shot.start) / (shot.end - shot.start)));
  const beat = Math.pow(Math.max(0, Math.sin(motionFrame * Math.PI / (fps * 60 / 109))), 10);
  const glitch = !freeze && (intense ? frame % 37 < 3 : frame % 157 < 2);
  const image = mode === 'chorus' ? 'short_01.png' : mode === 'breakdown' ? 'short_02.png' : shot.image;
  const ell = CIRCLES[image] ?? null;
  const cameraScale = shot.id === 24 ? 1.12 - shotProgress * .085 : 1.035 + shotProgress * .055;
  const shake = shot.id === 18 && !freeze ? Math.sin(frame * 1.8) * beat * 11 : 0;
  const isEq = !!cue && TERMS.includes(cue.text);
  const draw = shot.id === 3 && !vertical ? interpolate(t - shot.start, [.2, 3.2], [0, 1], {...clamp, easing: ease}) : 1;
  const flash = eqFlash(t) + (shot.id === 4 ? interpolate(t - shot.start, [0, .6], [.8, 0], clamp) : 0);
  const fade = Math.min(interpolate(localFrame, [0, 12], [0, 1], clamp), mode === 'full' ? interpolate(t, [VIDEO_END - .8, VIDEO_END], [1, 0], clamp) : 1);
  const hot = ['Chorus', 'Final Chorus', 'Post-Chorus', 'Build'].includes(section);

  return <AbsoluteFill style={{backgroundColor: '#04130f', overflow: 'hidden'}}>
    <Audio src={asset('song.mp3')} trimBefore={Math.round(offset * fps)}/>
    <AbsoluteFill style={{opacity: fade}}>
      <AbsoluteFill style={{transform: `translate(${shake}px, ${shake * .35}px) scale(${cameraScale}) rotate(${shot.id === 13 ? Math.sin(motionFrame / 180) * 2 : shot.id === 24 ? -2 + shotProgress * 4 : 0}deg)`, transformOrigin: ell && shot.id === 13 ? `${ell.cx}px ${ell.cy}px` : '50% 50%'}}>
        <Img src={asset(image)} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
        {ell ? <Kimi e={ell} w={width} h={height} phase={phaseAt(motionT)} draw={draw} flash={Math.min(1, flash)} hot={hot}/> : null}
        {!vertical && shot.id === 6 && ell ? <>
          <div style={{position: 'absolute', left: ell.dx - 40, top: ell.dy + 22, color: WHITE, fontFamily: 'EnshuChalk', fontSize: 40, textShadow: '0 0 10px #fff8', opacity: interpolate(t - shot.start, [.3, .8], [0, 1], clamp)}}>(a, b)</div>
          <div style={{position: 'absolute', left: (ell.dx + onPath(ell, ell.line).x) / 2 + 10, top: (ell.dy + onPath(ell, ell.line).y) / 2 - 70, color: PINK, fontFamily: MATH, fontStyle: 'italic', fontSize: 60, textShadow: `0 0 14px ${PINK}`, opacity: interpolate(t - shot.start, [.9, 1.4], [0, 1], clamp)}}>r</div>
        </> : null}
        {!vertical && shot.id === 15 ? <div style={{position: 'absolute', left: '59%', top: '44%', color: '#75334e', fontSize: 38, fontFamily: 'EnshuChalk', transform: 'rotate(12deg) skewX(-15deg)'}}>x, y</div> : null}
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(0,12,10,.4) 100%)'}}/>
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,12,10,.85), transparent 37%, transparent 84%, rgba(0,12,10,.22))'}}/>
      <Dust frame={motionFrame} intense={intense || hot}/>
      {!vertical && shot.id === 4 ? <Title t={t} start={shot.start}/> : null}
      {shot.id === 17 ? <div style={{position: 'absolute', top: '21%', right: '16%', fontFamily: MATH, color: WHITE, fontSize: 200, opacity: .65, textShadow: `0 0 25px ${PINK}`}}>{shotProgress < .4 ? '−' : '+'}</div> : null}
      {shot.id === 20 ? <AbsoluteFill style={{pointerEvents: 'none', opacity: .13, backgroundImage: 'repeating-linear-gradient(105deg, transparent 0px, transparent 100px, #bce9ff 101px, transparent 102px)', backgroundPosition: `${motionFrame * 2}px ${motionFrame * 12}px`}}/> : null}
      {shot.id === 22 && cue?.text.includes('Three') ? <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'EnshuChalk', color: WHITE, fontSize: vertical ? 240 : 320, textShadow: `6px 0 ${PINK}, -6px 0 ${CYAN}, 0 0 40px #fff`, transform: `scale(${1.25 - ((t - cue.start) * 3 / Math.max(.1, cue.end - cue.start) % 1) * .25})`}}>{Math.max(1, 3 - Math.floor((t - cue.start) / Math.max(.1, (cue.end - cue.start) / 3)))}</div> : null}
      <Equation t={t} e={ell} w={width} h={height} vertical={vertical}/>
      {cue && bigFeel(cue) ? <BigFeel cue={cue} t={t} w={width} h={height} image={image} vertical={vertical}/> : null}
      {cue && !isEq && !bigFeel(cue) && cue.text !== '(glitch stop)' && shot.id !== 4 ? <ChalkLine cue={cue} t={freeze ? motionT : t} vertical={vertical} frame={frame} width={width}/> : null}
      {glitch ? <>
        {[0, 1, 2].map((i) => <AbsoluteFill key={i} style={{clipPath: `inset(${15 + i * 27}% 0 ${80 - i * 27}% 0)`, transform: `translateX(${(i % 2 ? 1 : -1) * (18 + beat * 25)}px)`, mixBlendMode: 'screen', opacity: .65}}><Img src={asset(image)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: i % 2 ? 'hue-rotate(100deg)' : 'hue-rotate(300deg) saturate(2)'}}/></AbsoluteFill>)}
        <AbsoluteFill style={{background: `linear-gradient(0deg, transparent 49%, ${CYAN}22 50%, transparent 51%)`, backgroundSize: '100% 8px', mixBlendMode: 'screen'}}/>
      </> : null}
      {intense && !freeze ? <AbsoluteFill style={{background: WHITE, opacity: beat * .035, mixBlendMode: 'screen'}}/> : null}
      {mode === 'full' && t > timeline.duration ? <AbsoluteFill style={{background: WHITE, opacity: interpolate(t, [timeline.duration, timeline.duration + .5], [0, 1], clamp)}}/> : null}
      {mode === 'full' && t > timeline.duration + .3 ? <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#164238', fontFamily: MATH, fontSize: 180, opacity: interpolate(t, [timeline.duration + .3, timeline.duration + .7], [0, 1], clamp)}}>=</div> : null}
    </AbsoluteFill>
  </AbsoluteFill>;
};

export const EnshuLoveThumbnail: React.FC = () => {
  useChalkFont();
  return <AbsoluteFill style={{backgroundColor: '#08221b'}}>
    <Img src={asset('thumb_main.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
    <AbsoluteFill style={{background: 'linear-gradient(90deg, transparent 35%, #00171199)'}}/>
    <div style={{position: 'absolute', right: '5%', top: '27%', color: WHITE, fontFamily: 'EnshuChalk', fontSize: 182, letterSpacing: 6, textShadow: `5px 0 ${PINK}, -4px 0 ${CYAN}, 0 5px 25px #00120d`}}>円周ラブ</div>
    <div style={{position: 'absolute', right: '7%', top: '55%', color: WHITE, fontFamily: 'EnshuChalk', fontSize: 48, letterSpacing: 6}}>数式に恋しました。</div>
  </AbsoluteFill>;
};
