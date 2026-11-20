import React from 'react';
import { Cap, Fm, FaceBadge, H, INK, LAV, MIN, MINT, PINK, GOLD, RED, SER, Vec, W, backOut, clamp, easeInOut, easeOut, fadeIO, lerp, rad } from './common';

// time windows where a diagram is the main subject. dim: how much the illustration is darkened
export const DIA: [number, number, number][] = [
  [1.0, 5.2, 0.55], [23.9, 29.75, 0.6], [30.4, 41.95, 0.62], [47.88, 53.85, 0.6], [59.72, 71.2, 0.6],
  [88.56, 95.0, 0.66], [103.48, 106.9, 0.35], [112.68, 123.9, 0.6], [152.24, 166.5, 0.62], [183.96, 189.8, 0.3], [190.2, 196.6, 0.62],
];
export const dimAt = (t: number) => DIA.reduce((m, [a, b, d]) => Math.max(m, d * fadeIO(t, a, b, 0.5)), 0);

const S = (p: { children: React.ReactNode; op?: number; glow?: string }) => (
  <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity: p.op ?? 1, filter: p.glow ? `drop-shadow(0 0 16px ${p.glow})` : undefined }}>{p.children}</svg>
);
const pt = (ox: number, oy: number, len: number, ang: number) => [ox + Math.cos(rad(ang)) * len, oy - Math.sin(rad(ang)) * len];

const Para: React.FC<{ ox: number; oy: number; la: number; lb: number; th: number; op?: number; fill?: string; heart?: number }> = ({ ox, oy, la, lb, th, op = 1, fill = 'url(#pg)', heart = 0 }) => {
  const [bx, by] = pt(ox, oy, lb, th);
  const ax = ox + la;
  return (
    <S op={op} glow={heart ? PINK : undefined}>
      <defs>
        <linearGradient id="pg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor={LAV} stopOpacity={0.55} /><stop offset="1" stopColor={MINT} stopOpacity={0.55} /></linearGradient>
      </defs>
      <polygon points={`${ox},${oy} ${ax},${oy} ${ax + bx - ox},${by} ${bx},${by}`} fill={heart ? `rgba(255,95,168,${0.35 + 0.35 * heart})` : fill} stroke="#fff" strokeWidth={3} strokeDasharray="10 8" />
    </S>
  );
};
const AngleArc: React.FC<{ ox: number; oy: number; r: number; th: number; color?: string; label?: boolean }> = ({ ox, oy, r, th, color = '#fff', label = true }) => {
  if (th < 1) return null;
  const [x1, y1] = pt(ox, oy, r, th);
  const right = Math.abs(th - 90) < 0.5;
  const [lx, ly] = pt(ox, oy, r + 34, th / 2);
  return (
    <S>
      {right ? <path d={`M${ox + r * 0.6} ${oy} v${-r * 0.6} h${-r * 0.6}`} fill="none" stroke={color} strokeWidth={5} />
        : <path d={`M${ox + r} ${oy} A${r} ${r} 0 0 0 ${x1} ${y1}`} fill="none" stroke={color} strokeWidth={5} />}
      {label && <text x={lx} y={ly + 14} fontFamily={MIN} fontStyle="italic" fontSize={44} fill={color} textAnchor="middle" stroke={INK} strokeWidth={6} paintOrder="stroke">θ</text>}
    </S>
  );
};
const Lbl: React.FC<{ x: number; y: number; s: string; color?: string; size?: number; op?: number }> = ({ x, y, s, color = '#fff', size = 46, op = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', fontSize: size, color, opacity: op, whiteSpace: 'nowrap', textShadow: '0 0 10px rgba(5,8,30,0.95), 0 0 3px rgba(5,8,30,1)' }}><Fm s={s} /></div>
);

// --------------- individual diagrams ---------------
const D1: React.FC<{ t: number }> = ({ t }) => { // intro: two vectors and the angle between them
  const ox = 700, oy = 640, p = easeOut((t - 1.2) / 0.8), pb = easeOut((t - 1.8) / 0.8);
  return (
    <>
      <Vec x={ox} y={oy} len={480} ang={0} color={LAV} p={p} who="prince" />
      <Vec x={ox} y={oy} len={400} ang={52} color={MINT} p={pb} who="rikei" />
      {pb > 0.6 && <AngleArc ox={ox} oy={oy} r={110} th={52 * clamp((t - 2.3) / 0.5)} />}
      <Cap t={t} a={2.6} b={5.2} x={960} y={230} size={58}>今日の主役：2本のベクトルと、その間の角度 <Fm s="θ" /></Cap>
    </>
  );
};

const D2: React.FC<{ t: number }> = ({ t }) => { // parallel -> flat
  const ox = 560, oy = 600;
  const th = lerp(38, 0, easeInOut((t - 24.3) / 1.2));
  return (
    <>
      <Para ox={ox} oy={oy} la={520} lb={420} th={th} />
      <Vec x={ox} y={oy} len={520} ang={0} color={LAV} who="prince" />
      <Vec x={ox} y={oy + (th < 1 ? 14 : 0)} len={420} ang={th} color={PINK} R={40} />
      <AngleArc ox={ox} oy={oy} r={120} th={th} />
      <Cap t={t} a={25.0} b={29.75} x={1280} y={300} size={60}>同じ向き → 面積 <Fm s="0" /></Cap>
      <Cap t={t} a={25.6} b={29.75} x={1280} y={400} size={72}><Fm s="sin0° ＝ 0" color={GOLD} /></Cap>
    </>
  );
};

const D3: React.FC<{ t: number }> = ({ t }) => { // dot product = shadow; then switch to cross mode
  const ox = 520, oy = 640, la = 620, lb = 420;
  const th = t < 32.4 ? 45 : t < 37.74 ? lerp(45, 90, easeInOut((t - 32.4) / 1.6)) : 90;
  const mint = t >= 37.74;
  const snap = mint ? backOut((t - 37.74) / 0.3) : 0;
  const [bx, by] = pt(ox, oy, lb, th);
  const shadow = lb * Math.cos(rad(th));
  const crossP = clamp((t - 39.14) / 0.5);
  const modeOp = t < 37.0 ? 1 : clamp(1 - (t - 37.0) / 0.5);
  return (
    <>
      {/* light from above + shadow */}
      <S op={modeOp}>
        <defs><linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff8c8" stopOpacity={0} /><stop offset="1" stopColor="#fff8c8" stopOpacity={0.4} /></linearGradient></defs>
        <polygon points={`${ox},${oy - 520} ${bx},${oy - 520} ${bx},${by} ${ox},${oy}`} fill="url(#beam)" />
        <line x1={bx} y1={by} x2={bx} y2={oy} stroke="#fff8c8" strokeWidth={4} strokeDasharray="10 10" />
        <line x1={ox} y1={oy + 26} x2={ox + Math.max(4, shadow)} y2={oy + 26} stroke={GOLD} strokeWidth={18} strokeLinecap="round" />
      </S>
      <Vec x={ox} y={oy} len={la} ang={0} color={LAV} who="prince" />
      <Vec x={ox} y={oy} len={lb * (mint ? lerp(1.15, 1, snap) : 1)} ang={th} color={mint ? MINT : PINK} R={mint ? 54 : 40} who={mint ? 'rikei' : undefined} glow={mint} />
      <AngleArc ox={ox} oy={oy} r={110} th={th} />
      <Cap t={t} a={30.6} b={36.9} x={1360} y={250} size={58}>内積 ＝ <span style={{ color: GOLD }}>影の長さ</span></Cap>
      <Cap t={t} a={31.2} b={36.9} x={1360} y={350} size={64}><Fm s="a·b ＝ |a||b|cosθ" /></Cap>
      <Cap t={t} a={32.9} b={36.9} x={1360} y={460} size={72}><Fm s="cos90° ＝ 0" color={GOLD} /></Cap>
      {t > 37.74 && t < 39.2 && <Cap t={t} a={37.8} b={39.2} x={1360} y={340} size={64}>直角に交わる <span style={{ color: MINT }}>彼女</span></Cap>}
      {t > 39.14 && (
        <div style={{ position: 'absolute', left: 1360, top: 380, transform: `translate(-50%,-50%) rotate(${lerp(-180, 0, easeOut(crossP))}deg) scale(${backOut(crossP)})`, fontFamily: MIN, fontSize: 260, color: '#fff', textShadow: `0 0 40px ${MINT}, 0 0 80px ${LAV}`, opacity: fadeIO(t, 39.14, 41.95, 0.3) }}>
          {crossP < 0.5 ? '·' : '×'}
        </div>
      )}
      <Cap t={t} a={39.7} b={41.95} x={1360} y={560} size={54}><span style={{ color: MINT }}>外積</span>モードに切りかえ</Cap>
      {crossP > 0 && crossP < 1 && <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: (1 - crossP) * 0.5 }} />}
    </>
  );
};

const AreaScene: React.FC<{ t: number; t0: number; th: number; heart?: number; ox?: number; oy?: number; la?: number; lb?: number; height?: boolean }> = ({ t, t0, th, heart = 0, ox = 520, oy = 660, la = 560, lb = 440, height }) => {
  const [bx, by] = pt(ox, oy, lb, th);
  const hp = height ? clamp((t - t0) / 0.6) : 0;
  return (
    <>
      <Para ox={ox} oy={oy} la={la} lb={lb} th={th} heart={heart} />
      <Vec x={ox} y={oy} len={la} ang={0} color={LAV} who="prince" />
      <Vec x={ox} y={oy} len={lb} ang={th} color={MINT} who="rikei" />
      <AngleArc ox={ox} oy={oy} r={100} th={th} />
      {hp > 0 && (
        <S>
          <line x1={bx} y1={by} x2={bx} y2={lerp(by, oy, hp)} stroke={GOLD} strokeWidth={7} strokeDasharray="14 10" />
        </S>
      )}
      {hp > 0.8 && <Lbl x={bx - 150} y={(by + oy) / 2} s="|b|sinθ" color={GOLD} size={48} />}
      {hp > 0.8 && <Lbl x={ox + la / 2} y={oy + 58} s="|a|" color={LAV} size={48} />}
    </>
  );
};

const D4: React.FC<{ t: number }> = ({ t }) => {
  const th = lerp(4, 90, easeInOut((t - 48.2) / 4.2));
  const area = Math.sin(rad(th));
  return (
    <>
      <AreaScene t={t} t0={0} th={th} />
      <Cap t={t} a={48.4} b={53.85} x={1400} y={280} size={56}>外積の大きさ ＝</Cap>
      <Cap t={t} a={48.8} b={53.85} x={1400} y={350} size={56}><span style={{ color: MINT }}>平行四辺形</span>の面積</Cap>
      <Cap t={t} a={49.2} b={53.85} x={1400} y={470} size={70}><Fm s={`θ ＝ ${Math.round(th)}°`} /></Cap>
      <div style={{ position: 'absolute', left: 1180, top: 540, width: 440, height: 26, border: '3px solid #fff', borderRadius: 14, opacity: fadeIO(t, 49.2, 53.85) }}>
        <div style={{ width: `${area * 100}%`, height: '100%', borderRadius: 12, background: `linear-gradient(90deg, ${LAV}, ${MINT})` }} />
      </div>
    </>
  );
};

const SineGraph: React.FC<{ x: number; y: number; w: number; h: number; upto: number; dot?: number; op?: number; color?: string }> = ({ x, y, w, h, upto, dot, op = 1, color = MINT }) => {
  const pts: string[] = [];
  for (let d = 0; d <= upto; d += 3) pts.push(`${x + (d / 360) * w},${y - Math.sin(rad(d)) * h}`);
  const dx = dot !== undefined ? x + (dot / 360) * w : 0, dy = dot !== undefined ? y - Math.sin(rad(dot)) * h : 0;
  return (
    <S op={op}>
      <line x1={x - 10} y1={y} x2={x + w + 20} y2={y} stroke="rgba(255,255,255,0.7)" strokeWidth={3} />
      <line x1={x} y1={y + h + 10} x2={x} y2={y - h - 20} stroke="rgba(255,255,255,0.7)" strokeWidth={3} />
      {[90, 180, 270, 360].map((d) => <g key={d}><line x1={x + (d / 360) * w} y1={y - 8} x2={x + (d / 360) * w} y2={y + 8} stroke="#fff" strokeWidth={3} /><text x={x + (d / 360) * w} y={y + 42} fontFamily={SER} fontWeight={600} fontSize={30} fill="#fff" textAnchor="middle">{d}°</text></g>)}
      <line x1={x - 8} y1={y - h} x2={x + 8} y2={y - h} stroke="#fff" strokeWidth={3} />
      <text x={x - 18} y={y - h + 10} fontFamily={SER} fontWeight={600} fontSize={32} fill={GOLD} textAnchor="end">1</text>
      {pts.length > 1 && <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />}
      {dot !== undefined && <circle cx={dx} cy={dy} r={14} fill={GOLD} stroke={INK} strokeWidth={4} />}
    </S>
  );
};

const D5: React.FC<{ t: number; o: number }> = ({ t, o }) => { // post-chorus (o = offset so it works for both post-choruses)
  const tt = t - o;
  const th = tt < 62.4 ? 60 : lerp(60, 90, easeInOut((tt - 62.4) / 1.0));
  const dotDeg = clamp((tt - 59.9) / 2.2) * 90;
  const glow = tt > 62.1 && tt < 65.3 ? 0.5 + 0.5 * Math.sin(tt * 10) : 0;
  return (
    <>
      <AreaScene t={tt} t0={59.9} th={th} height ox={360} oy={680} la={500} lb={420} />
      <SineGraph x={1100} y={700} w={640} h={180} upto={360} dot={dotDeg} op={fadeIO(tt, 59.72, 65.2)} />
      {glow > 0 && <div style={{ position: 'absolute', left: 1230, top: 490, width: 60, height: 60, borderRadius: '50%', background: GOLD, filter: 'blur(14px)', opacity: glow }} />}
      <Cap t={tt} a={60.0} b={65.2} x={1420} y={300} size={64}><Fm s="sin90° ＝ 1" color={GOLD} /> → 最大！</Cap>
      <Cap t={tt} a={65.34} b={71.2} x={1360} y={330} size={80}><Fm s="|a×b| ＝ |a||b|sinθ" /></Cap>
      <Cap t={tt} a={65.9} b={71.2} x={1360} y={450} size={48}>底辺 <Fm s="|a|" color={LAV} /> × 高さ <Fm s="|b|sinθ" color={GOLD} /> ＝ 面積</Cap>
    </>
  );
};

const D6: React.FC<{ t: number }> = ({ t }) => { // split: cos (shadow, horizontal) vs sin (height, vertical)
  const th = lerp(0, 90, easeInOut((t - 89.0) / 3.0));
  const merge = clamp((t - 93.68) / 0.7);
  const lb = 330;
  const panel = (ox: number, kind: 'cos' | 'sin') => {
    const [bx, by] = pt(ox, 640, lb, th);
    const v = kind === 'cos' ? lb * Math.cos(rad(th)) : lb * Math.sin(rad(th));
    return (
      <React.Fragment key={kind}>
        <Vec x={ox} y={640} len={420} ang={0} color={LAV} w={11} R={40} />
        <Vec x={ox} y={640} len={lb} ang={th} color={MINT} w={11} R={40} />
        <S>
          {kind === 'cos' ? <line x1={ox} y1={664} x2={ox + Math.max(3, v)} y2={664} stroke={GOLD} strokeWidth={16} strokeLinecap="round" />
            : <line x1={bx} y1={640} x2={bx} y2={640 - Math.max(3, v)} stroke={GOLD} strokeWidth={16} strokeLinecap="round" />}
          <line x1={bx} y1={by} x2={kind === 'cos' ? bx : ox} y2={kind === 'cos' ? 640 : by} stroke="rgba(255,255,255,0.6)" strokeWidth={3} strokeDasharray="8 8" />
        </S>
        <Lbl x={ox + 210} y={250} s={kind === 'cos' ? '内積：横（影）' : '外積：縦（高さ）'} size={50} />
        <Lbl x={ox + 210} y={330} s={`${kind}θ ＝ ${(kind === 'cos' ? Math.cos(rad(th)) : Math.sin(rad(th))).toFixed(2)}`} color={GOLD} size={56} />
      </React.Fragment>
    );
  };
  if (merge <= 0) return (
    <div style={{ opacity: fadeIO(t, 88.6, 95.0) }}>
      <div style={{ position: 'absolute', left: 958, top: 180, width: 4, height: 560, background: 'rgba(255,255,255,0.5)' }} />
      {panel(300, 'cos')}{panel(1180, 'sin')}
    </div>
  );
  // merged right triangle
  const ox = 640, oy = 660, hyp = 560, a = 38;
  const [bx, by] = pt(ox, oy, hyp, a);
  return (
    <div style={{ opacity: fadeIO(t, 88.6, 95.0) * merge }}>
      <S>
        <polygon points={`${ox},${oy} ${bx},${oy} ${bx},${by}`} fill="rgba(255,255,255,0.07)" stroke="#fff" strokeWidth={4} />
        <path d={`M${bx - 26} ${oy} v-26 h26`} fill="none" stroke="#fff" strokeWidth={3} />
        <line x1={ox} y1={oy} x2={bx} y2={oy} stroke={GOLD} strokeWidth={10} />
        <line x1={bx} y1={oy} x2={bx} y2={by} stroke={MINT} strokeWidth={10} />
        <line x1={ox} y1={oy} x2={bx} y2={by} stroke={LAV} strokeWidth={6} />
      </S>
      <AngleArc ox={ox} oy={oy} r={90} th={a} />
      <Lbl x={(ox + bx) / 2} y={oy + 56} s="cos（横・影）" color={GOLD} size={50} />
      <Lbl x={bx + 170} y={(oy + by) / 2} s="sin（縦・高さ）" color={MINT} size={50} />
      <Cap t={t} a={93.9} b={95.0} x={900} y={260} size={56}>同じ三角形の、横が <Fm s="cos" color={GOLD} />・縦が <Fm s="sin" color={MINT} /></Cap>
    </div>
  );
};

const D7: React.FC<{ t: number }> = ({ t }) => { // heart sparkle (small, side)
  const heart = 0.5 + 0.5 * Math.sin(t * 9);
  return (
    <div style={{ opacity: fadeIO(t, 103.48, 106.9) }}>
      <div style={{ position: 'absolute', left: 0, top: 0, transform: 'translate(1150px, 260px) scale(0.45)', transformOrigin: '0 0', width: W, height: H }}>
        <AreaScene t={t} t0={0} th={90} heart={heart} ox={200} oy={700} la={520} lb={520} />
      </div>
      <Cap t={t} a={103.7} b={106.9} x={1420} y={300} size={44}>面積メーター、急上昇中</Cap>
    </div>
  );
};

// unit circle on the chalkboard (rap). drawn in board space, image 16 chalkboard ~ x 60..1330, y 90..760
const D8: React.FC<{ t: number }> = ({ t }) => {
  const cx = 790, cy = 460, R = 180;
  const chalk = 'rgba(255,255,255,0.92)';
  // angle timeline
  let ang = 35;
  if (t >= 128.9 && t < 130.62) ang = 35 + (t - 128.9) * 210;
  if (t >= 130.62 && t < 131.5) ang = lerp(395, 360, easeOut((t - 130.62) / 0.4));
  if (t >= 131.5 && t < 132.42) ang = lerp(0, 30, easeOut((t - 131.5) / 0.5));
  if (t >= 132.42 && t < 133.86) ang = lerp(30, 90, easeOut((t - 132.42) / 0.6));
  if (t >= 133.86 && t < 135.96) ang = lerp(90, 180, easeOut((t - 133.86) / 0.7));
  const trace = t >= 135.96 ? clamp((t - 135.96) / 1.7) * 360 : -1;
  if (trace >= 0) ang = 180 + trace; // keep spinning while the wave is drawn
  const a = ang % 360;
  const px = cx + Math.cos(rad(a)) * R, py = cy - Math.sin(rad(a)) * R;
  const circleP = clamp((t - 127.34) / 0.8);
  const triOp = t < 128.9 ? fadeIO(t, 125.54, 128.9, 0.3) : 0;
  const circleScene = t < 137.72;
  const val = (d: number) => (d === 30 ? '1/2' : String(Math.round(Math.sin(rad(d)))));
  const stops: [number, number, number][] = [[130.62, 131.5, 0], [131.5, 132.42, 30], [132.42, 133.86, 90], [133.86, 135.96, 180]];
  const board = { fontFamily: MIN, color: chalk, textShadow: '0 0 8px rgba(255,255,255,0.35)' } as React.CSSProperties;
  return (
    <div style={{ opacity: fadeIO(t, 124.1, 147.5, 0.4) }}>
      <div style={{ position: 'absolute', left: 120, top: 120, fontSize: 52, ...board }}><Fm s="sinθ ＝ 高さ ／ 斜辺" /></div>
      {circleScene && (
        <>
          <S>
            {circleP > 0 && <circle cx={cx} cy={cy} r={R} fill="none" stroke={chalk} strokeWidth={5} strokeDasharray={`${2 * Math.PI * R * circleP} 9999`} transform={`rotate(0 ${cx} ${cy})`} />}
            <line x1={cx - R - 40} y1={cy} x2={cx + R + 40} y2={cy} stroke="rgba(255,255,255,0.6)" strokeWidth={3} />
            <line x1={cx} y1={cy + R + 30} x2={cx} y2={cy - R - 30} stroke="rgba(255,255,255,0.6)" strokeWidth={3} />
            {(t >= 125.54) && (
              <g opacity={t < 128.9 ? triOp : 1}>
                <line x1={cx} y1={cy} x2={px} y2={py} stroke={LAV} strokeWidth={6} />
                <line x1={px} y1={py} x2={px} y2={cy} stroke={MINT} strokeWidth={9} />
                <line x1={cx} y1={cy} x2={px} y2={cy} stroke="rgba(255,255,255,0.5)" strokeWidth={4} />
                <circle cx={px} cy={py} r={13} fill={GOLD} stroke={INK} strokeWidth={4} />
              </g>
            )}
          </S>
          {t >= 125.54 && t < 128.9 && <><Lbl x={(cx + px) / 2 - 40} y={(cy + py) / 2 - 30} s="斜辺" color={LAV} size={40} op={triOp} /><Lbl x={px + 70} y={(py + cy) / 2} s="高さ" color={MINT} size={40} op={triOp} /></>}
          {circleP > 0.9 && t < 130.62 && <Lbl x={cx + R / 2} y={cy + 40} s="半径 1" size={40} />}
          {stops.map(([s0, s1, d]) => t >= s0 && t < s1 ? <div key={d} style={{ position: 'absolute', left: 620, top: 180, fontSize: 72, transform: `scale(${backOut((t - s0) / 0.3)})`, transformOrigin: 'left center', ...board, color: d === 90 ? GOLD : chalk }}><Fm s={`sin${d}° ＝ ${val(d)}`} /></div> : null)}
          {trace >= 0 && <SineGraph x={1030} y={cy} w={340} h={R * 0.8} upto={trace} dot={trace} />}
          {trace >= 0 && <div style={{ position: 'absolute', left: 560, top: 660, fontSize: 46, ...board }}>点の高さを記録すると…波</div>}
        </>
      )}
      {!circleScene && (() => {
        const ox = 560, oy = 620, la = 460, lb = 360, th = 60;
        const [bx, by] = pt(ox, oy, lb, th);
        const lab = clamp((t - 141.34) / 0.4);
        return (
          <>
            <S>
              <polygon points={`${ox},${oy} ${ox + la},${oy} ${ox + la + bx - ox},${by} ${bx},${by}`} fill="rgba(255,255,255,0.08)" stroke={chalk} strokeWidth={5} />
              {t >= 139.0 && <line x1={bx} y1={by} x2={bx} y2={oy} stroke={GOLD} strokeWidth={7} strokeDasharray="14 10" />}
            </S>
            <Vec x={ox} y={oy} len={la} ang={0} color={LAV} w={11} />
            <Vec x={ox} y={oy} len={lb} ang={th} color={MINT} w={11} />
            <AngleArc ox={ox} oy={oy} r={80} th={th} label={false} />
            <Lbl x={ox + la / 2} y={oy + 50} s={lab > 0 ? '|a| ＝ 文系度' : '底辺 a'} color={LAV} size={44} />
            {t >= 139.0 && <Lbl x={bx + 150} y={(by + oy) / 2 + 40} s="高さ ＝ |b|sinθ" color={GOLD} size={42} />}
            {lab > 0 && <Lbl x={bx + 30} y={by - 50} s="|b| ＝ 理系度" color={MINT} size={44} op={lab} />}
            {lab > 0 && <Lbl x={ox + 150} y={oy - 40} s="sinθ ＝ 真逆度" color={PINK} size={40} op={lab} />}
            {t >= 144.32 && <div style={{ position: 'absolute', left: 1060, top: 690, transform: `translate(-50%,-50%) rotate(-8deg) scale(${backOut((t - 144.32) / 0.35)})`, fontFamily: SER, fontWeight: 700, fontStyle: 'italic', fontSize: 170, color: chalk, textShadow: '0 0 12px rgba(255,255,255,0.4)' }}>Q.E.D.</div>}
          </>
        );
      })()}
    </div>
  );
};

// 3D cross product (bridge). oblique projection: x -> right-down, y -> left-down, z -> up
const D9: React.FC<{ t: number }> = ({ t }) => {
  const O = [960, 560];
  const U = 300;
  const P = (x: number, y: number, z: number) => [O[0] + (x * 0.95 - y * 0.75) * U, O[1] + (x * 0.3 + y * 0.32) * U - z * U];
  const grid: React.ReactNode[] = [];
  const gOp = fadeIO(t, 152.3, 166.5) * (t > 158.08 ? lerp(1, 0.35, clamp((t - 158.08) / 1)) : 1);
  for (let i = -3; i <= 3; i++) {
    const [x1, y1] = P(i * 0.5, -1.5, 0), [x2, y2] = P(i * 0.5, 1.5, 0);
    const [x3, y3] = P(-1.5, i * 0.5, 0), [x4, y4] = P(1.5, i * 0.5, 0);
    grid.push(<line key={`a${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={MINT} strokeOpacity={0.35} strokeWidth={2} />);
    grid.push(<line key={`b${i}`} x1={x3} y1={y3} x2={x4} y2={y4} stroke={LAV} strokeOpacity={0.35} strokeWidth={2} />);
  }
  const arrow3 = (to: number[], color: string, p: number, w = 12, who?: string) => {
    const [x0, y0] = O; const [x1, y1] = to;
    const len = Math.hypot(x1 - x0, y1 - y0); const ang = (Math.atan2(-(y1 - y0), x1 - x0) * 180) / Math.PI;
    return <Vec x={x0} y={y0} len={len} ang={ang} color={color} p={p} w={w} who={who} R={46} />;
  };
  const up = t < 154.58 ? 0 : easeOut((t - 154.58) / 0.9);
  let zEnd = 1.2 * up;
  if (t >= 158.08) zEnd = lerp(1.2, 1.55, easeOut((t - 158.08) / 0.8));
  const flip = clamp((t - 161.36) / 0.9);
  if (t >= 161.36) zEnd = lerp(1.55, -1.1, easeInOut(flip));
  const both = t >= 164.7;
  return (
    <div style={{ opacity: fadeIO(t, 152.3, 166.5) }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: gOp }}>{grid}</svg>
      {arrow3(P(1.25, 0, 0), LAV, easeOut((t - 152.3) / 0.6), 12, 'prince')}
      {arrow3(P(0, 1.1, 0), MINT, easeOut((t - 152.9) / 0.6), 12, 'rikei')}
      {up > 0 && !both && arrow3(P(0, 0, zEnd), '#ffffff', 1, 16)}
      {both && <>{arrow3(P(0, 0, 1.3), '#ffffff', 1, 16)}{arrow3(P(0, 0, -1.1), RED, 1, 16)}</>}
      <Cap t={t} a={155.0} b={161.2} x={1480} y={250} size={56}><Fm s="a×b" /> は <Fm s="a" color={LAV} /> にも <Fm s="b" color={MINT} /> にも垂直</Cap>
      <Cap t={t} a={158.4} b={161.2} x={1480} y={350} size={50}>→ 新しい次元（<Fm s="z" />軸）へ</Cap>
      <Cap t={t} a={161.9} b={166.5} x={1480} y={260} size={64}><Fm s="b×a ＝ −(a×b)" /></Cap>
      <Cap t={t} a={162.4} b={166.5} x={1480} y={360} size={46}>順番を入れかえると 向きが逆</Cap>
      {t > 155.0 && t < 161.2 && <Lbl x={P(0, 0, zEnd)[0] + 90} y={P(0, 0, zEnd)[1]} s="a×b" size={52} />}
      {both && <><Lbl x={P(0, 0, 1.3)[0] + 90} y={P(0, 0, 1.3)[1]} s="a×b" size={48} /><Lbl x={P(0, 0, -1.1)[0] + 90} y={P(0, 0, -1.1)[1]} s="b×a" color={RED} size={48} /></>}
    </div>
  );
};

const D10: React.FC<{ t: number }> = ({ t }) => { // final: new vector goes up
  const p = easeOut((t - 184.1) / 1.4);
  return (
    <div style={{ opacity: fadeIO(t, 184.0, 189.8) }}>
      <Vec x={960} y={900} len={820} ang={90} color="#ffffff" p={p} w={22} glow />
      <Cap t={t} a={184.6} b={189.8} x={1480} y={340} size={70}><Fm s="sin90° ＝ 1" color={GOLD} /></Cap>
      <Cap t={t} a={187.2} b={189.8} x={1480} y={440} size={50}>2人に垂直な <Fm s="a×b" /></Cap>
    </div>
  );
};

const Summary: React.FC<{ t: number }> = ({ t }) => {
  const op = fadeIO(t, 190.2, 196.6, 0.5);
  const row = (d: number) => ({ opacity: clamp((t - d) / 0.5), transform: `translateY(${(1 - easeOut((t - d) / 0.6)) * 20}px)` });
  return (
    <div style={{ position: 'absolute', left: 960, top: 420, transform: 'translate(-50%,-50%)', opacity: op, padding: '40px 70px 46px', background: 'rgba(10,14,40,0.72)', border: '2px solid rgba(255,255,255,0.55)', borderRadius: 6, boxShadow: '0 0 0 10px rgba(10,14,40,0.35)', fontFamily: MIN, color: '#fff', whiteSpace: 'nowrap' }}>
      <div style={{ fontSize: 44, letterSpacing: '0.3em', textAlign: 'center', color: GOLD, marginBottom: 26, ...row(190.4) }}>本日のまとめ</div>
      <div style={{ fontSize: 58, lineHeight: 1.6, ...row(191.0) }}>内積　<Fm s="a·b ＝ |a||b|cosθ" />　<span style={{ fontSize: 38, color: GOLD }}>（影・横）</span></div>
      <div style={{ fontSize: 58, lineHeight: 1.6, ...row(191.8) }}>外積　<Fm s="|a×b| ＝ |a||b|sinθ" />　<span style={{ fontSize: 38, color: MINT }}>（面積・縦）</span></div>
      <div style={{ fontSize: 40, lineHeight: 1.6, marginTop: 10, textAlign: 'center', opacity: 0.9, ...row(192.8) }}>似た者同士は内積、真逆どうしは外積で最大</div>
    </div>
  );
};

export const Diagrams: React.FC<{ t: number }> = ({ t }) => (
  <>
    {t >= 1.0 && t < 5.3 && <div style={{ opacity: fadeIO(t, 1.0, 5.2) }}><D1 t={t} /></div>}
    {t >= 23.9 && t < 29.8 && <div style={{ opacity: fadeIO(t, 23.9, 29.75) }}><D2 t={t} /></div>}
    {t >= 30.4 && t < 42.0 && <div style={{ opacity: fadeIO(t, 30.4, 41.95) }}><D3 t={t} /></div>}
    {t >= 47.88 && t < 53.9 && <div style={{ opacity: fadeIO(t, 47.88, 53.85) }}><D4 t={t} /></div>}
    {t >= 59.72 && t < 71.25 && <div style={{ opacity: fadeIO(t, 59.72, 71.2) }}><D5 t={t} o={0} /></div>}
    {t >= 88.56 && t < 95.05 && <D6 t={t} />}
    {t >= 103.48 && t < 107.0 && <D7 t={t} />}
    {t >= 112.68 && t < 123.95 && <div style={{ opacity: fadeIO(t, 112.68, 123.9) }}><D5 t={t} o={52.96} /></div>}
    {t >= 124.0 && t < 147.6 && <D8 t={t} />}
    {t >= 152.24 && t < 166.6 && <D9 t={t} />}
    {t >= 166.64 && t < 169.0 && <Cap t={t} a={166.8} b={169.0} x={960} y={200} size={78}><Fm s="a×b ＋ b×a ＝ 0" /> !?</Cap>}
    {t >= 169.0 && t < 172.3 && <Cap t={t} a={169.3} b={172.3} x={1500} y={170} size={50}>（だから <Fm s="a×b" />：僕が先）</Cap>}
    {t >= 183.96 && t < 189.9 && <D10 t={t} />}
    {t >= 190.2 && t < 196.7 && <Summary t={t} />}
  </>
);

// keep FaceBadge import used (for tree-shaking warnings)
export const _unused = FaceBadge;
