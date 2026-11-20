import React from 'react';
import { random } from 'remotion';

// Background "chalk memo" captions explaining cos θ. Coordinates are 1920x1080.
const NAVYBG = 'rgba(14,34,26,0.66)';
const CH = 'rgba(255,255,255,0.95)';
const PINK = '#ff2e88', GOLD = '#ffc928', LAV = '#b08cff', CYAN = '#6ff6ff';
const FB = ", 'DejaVu Sans', sans-serif";
const POP = 'Nikumaru' + FB;
const MARK = 'Permanent Marker, Nikumaru' + FB;
const BANG = 'Bangers, Nikumaru' + FB;
const SYMST: React.CSSProperties = { fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 700 };
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// render a⃗ (combining arrow) and θ ⊥ ∥ with a font that has them
const M: React.FC<{ s: string; c?: string }> = ({ s, c }) => {
  const cs = [...s]; const out: React.ReactNode[] = [];
  for (let i = 0; i < cs.length; i++) {
    if (cs[i + 1] === '⃗') {
      out.push(<span key={i} style={{ position: 'relative', display: 'inline-block' }}>{cs[i]}<span style={{ position: 'absolute', left: '50%', top: '-0.45em', transform: 'translateX(-50%) scaleX(1.25)', fontSize: '0.62em', ...SYMST, lineHeight: 1 }}>→</span></span>);
      i++;
    } else if (/[θ⊥∥≦≤]/.test(cs[i])) out.push(<span key={i} style={SYMST}>{cs[i]}</span>);
    else out.push(<React.Fragment key={i}>{cs[i]}</React.Fragment>);
  }
  return <span style={{ color: c }}>{out}</span>;
};

const Note: React.FC<{ t: number; a: number; b: number; x: number; y: number; w: number; tag?: string; rot?: number; children: React.ReactNode }> = ({ t, a, b, x, y, w, tag = 'MEMO', rot = -2, children }) => {
  if (t < a - 0.1 || t > b + 0.1) return null;
  const op = clamp(Math.min((t - a) / 0.45, (b - t) / 0.45));
  const fl = Math.sin(t * 1.3 + x) * 4;
  const wipe = clamp((t - a) / 0.6);
  return (
    <div style={{ position: 'absolute', left: x, top: y + fl, minWidth: w * 0.8, width: 'max-content', whiteSpace: 'nowrap', transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${0.94 + 0.06 * op})`, opacity: op * 0.96 }}>
      <div style={{ background: NAVYBG, border: '3px dashed rgba(255,255,255,0.55)', borderRadius: 16, padding: '18px 24px 16px', boxShadow: '0 6px 24px rgba(0,0,0,0.35)', clipPath: `inset(0 ${100 - wipe * 100}% 0 0)` }}>
        <div style={{ fontFamily: BANG, fontSize: 26, letterSpacing: 4, color: GOLD, marginBottom: 6 }}>✎ {tag}</div>
        <div style={{ fontFamily: POP, fontSize: 38, color: CH, lineHeight: 1.45 }}>{children}</div>
      </div>
    </div>
  );
};
const Big: React.FC<{ children: React.ReactNode; c?: string; s?: number }> = ({ children, c = CH, s = 50 }) => <div style={{ fontFamily: MARK, fontSize: s, color: c, lineHeight: 1.3 }}>{children}</div>;

// --- small diagrams ---
const Tri: React.FC<{ w?: number; deg?: number; show?: 'cos' | 'all' }> = ({ w = 360, deg = 35, show = 'all' }) => {
  const h = Math.tan((deg * Math.PI) / 180) * (w - 60);
  const H = h + 70;
  const x0 = 30, y0 = H - 30, x1 = w - 30, y1 = y0 - h;
  return (
    <svg width={w} height={H} style={{ display: 'block', margin: '6px auto 0' }}>
      <path d={`M${x0} ${y0} L${x1} ${y0} L${x1} ${y1} Z`} fill="rgba(255,255,255,0.06)" stroke={CH} strokeWidth={4} />
      <path d={`M${x1 - 22} ${y0} v-22 h22`} fill="none" stroke={CH} strokeWidth={3} />
      <path d={`M${x0 + 56} ${y0} A56 56 0 0 0 ${x0 + 56 * Math.cos((deg * Math.PI) / 180)} ${y0 - 56 * Math.sin((deg * Math.PI) / 180)}`} fill="none" stroke={PINK} strokeWidth={4} />
      <text x={x0 + 78} y={y0 - 12} fontFamily="DejaVu Sans" fontWeight={700} fontSize={26} fill={PINK}>θ</text>
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={GOLD} strokeWidth={7} />
      <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={PINK} strokeWidth={show === 'cos' ? 7 : 4} />
      <text x={(x0 + x1) / 2} y={y0 + 28} fontFamily="Nikumaru" fontSize={24} fill={GOLD} textAnchor="middle">底辺</text>
      <text x={(x0 + x1) / 2 - 30} y={(y0 + y1) / 2 - 12} fontFamily="Nikumaru" fontSize={24} fill={PINK} textAnchor="middle">斜辺</text>
      {show === 'all' && <text x={x1 + 4} y={(y0 + y1) / 2} fontFamily="Nikumaru" fontSize={24} fill={CYAN} textAnchor="start" transform={`translate(-60 0)`}>高さ</text>}
    </svg>
  );
};

const UnitCircle: React.FC<{ th: number; size?: number; unknown?: boolean }> = ({ th, size = 300, unknown }) => {
  const r = size * 0.36, cx = size / 2, cy = size / 2;
  const a = (th * Math.PI) / 180;
  const px = cx + Math.cos(a) * r, py = cy - Math.sin(a) * r;
  return (
    <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
      <line x1={10} y1={cy} x2={size - 10} y2={cy} stroke="rgba(255,255,255,0.6)" strokeWidth={2} />
      <line x1={cx} y1={10} x2={cx} y2={size - 10} stroke="rgba(255,255,255,0.6)" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={CH} strokeWidth={3} />
      <line x1={px} y1={py} x2={px} y2={cy} stroke={CYAN} strokeWidth={3} strokeDasharray="8 6" />
      <line x1={cx} y1={cy} x2={px} y2={cy} stroke={GOLD} strokeWidth={8} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={px} y2={py} stroke={PINK} strokeWidth={5} strokeLinecap="round" />
      <circle cx={px} cy={py} r={8} fill={PINK} />
      <text x={size - 14} y={cy + 26} fontFamily="Nikumaru" fontSize={20} fill="#fff" textAnchor="end">1</text>
      <text x={cx + (px - cx) / 2} y={cy + (Math.sin(a) >= 0 ? 30 : -14)} fontFamily="DejaVu Sans" fontWeight={700} fontSize={22} fill={GOLD} textAnchor="middle">{unknown ? '?' : Math.cos(a).toFixed(2)}</text>
    </svg>
  );
};

const Projection: React.FC<{ p: number }> = ({ p }) => {
  const w = 380, h = 200, x0 = 30, y0 = 160, L = 320, deg = 40;
  const a = (deg * Math.PI) / 180;
  const ex = x0 + Math.cos(a) * 250, ey = y0 - Math.sin(a) * 250;
  return (
    <svg width={w} height={h} style={{ display: 'block', margin: '4px auto 0' }}>
      <line x1={x0} y1={y0} x2={x0 + L} y2={y0} stroke={GOLD} strokeWidth={6} />
      <polygon points={`${x0 + L},${y0} ${x0 + L - 18},${y0 - 9} ${x0 + L - 18},${y0 + 9}`} fill={GOLD} />
      <line x1={x0} y1={y0} x2={ex} y2={ey} stroke={PINK} strokeWidth={6} />
      <line x1={ex} y1={ey} x2={ex} y2={y0} stroke={CYAN} strokeWidth={3} strokeDasharray="7 6" opacity={clamp(p * 2)} />
      <line x1={x0} y1={y0 + 14} x2={x0 + (ex - x0) * clamp(p * 1.5 - 0.3)} y2={y0 + 14} stroke={CYAN} strokeWidth={8} strokeLinecap="round" />
      <text x={ex - 10} y={ey - 10} fontFamily="Nikumaru" fontSize={24} fill={PINK} textAnchor="end">私</text>
      <text x={x0 + L - 4} y={y0 - 16} fontFamily="Nikumaru" fontSize={24} fill={GOLD} textAnchor="end">君</text>
      <text x={x0 + (ex - x0) / 2} y={y0 + 44} fontFamily="Nikumaru" fontSize={22} fill={CYAN} textAnchor="middle">影 ＝ |私|cosθ</text>
    </svg>
  );
};

const CosWave: React.FC<{ p: number }> = ({ p }) => {
  const w = 440, h = 200, x0 = 30, x1 = w - 20, cy = 96, A = 66;
  const pts: string[] = [];
  const n = Math.round(120 * clamp(p));
  for (let i = 0; i <= n; i++) { const d = (i / 120) * 360; pts.push(`${x0 + (x1 - x0) * (d / 360)},${cy - Math.cos((d * Math.PI) / 180) * A}`); }
  const tick = (d: number, lab: string) => <text key={lab} x={x0 + (x1 - x0) * (d / 360)} y={h - 8} fontFamily="DejaVu Sans" fontSize={18} fill="#fff" textAnchor="middle">{lab}</text>;
  return (
    <svg width={w} height={h} style={{ display: 'block', margin: '4px auto 0' }}>
      <line x1={x0} y1={cy} x2={x1} y2={cy} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
      <line x1={x0} y1={cy - A} x2={x1} y2={cy - A} stroke={GOLD} strokeWidth={1.5} strokeDasharray="5 6" />
      <line x1={x0} y1={cy + A} x2={x1} y2={cy + A} stroke={PINK} strokeWidth={1.5} strokeDasharray="5 6" />
      <text x={x1} y={cy - A - 6} fontFamily="DejaVu Sans" fontSize={18} fill={GOLD} textAnchor="end">1</text>
      <text x={x1} y={cy + A + 20} fontFamily="DejaVu Sans" fontSize={18} fill={PINK} textAnchor="end">−1</text>
      <polyline points={pts.join(' ')} fill="none" stroke={CH} strokeWidth={4} />
      {[tick(0, '0°'), tick(90, '90°'), tick(180, '180°'), tick(270, '270°'), tick(360, '360°')]}
    </svg>
  );
};

const Row: React.FC<{ l: React.ReactNode; r: React.ReactNode; c?: string }> = ({ l, r, c = CH }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, fontFamily: MARK, fontSize: 40, color: c, lineHeight: 1.35 }}><span>{l}</span><span>{r}</span></div>
);

export const MathNotes: React.FC<{ t: number; th: number; unknown: boolean }> = ({ t, th, unknown }) => {
  const n: React.ReactNode[] = [];
  const add = (k: string, el: React.ReactNode) => n.push(<React.Fragment key={k}>{el}</React.Fragment>);

  // intro: definition
  add('def', <Note t={t} a={2.6} b={12.4} x={330} y={470} w={440} tag="cos θ って？">
    <Big><M s="cos θ ＝ " /><span style={{ color: GOLD }}>底辺</span> ÷ <span style={{ color: PINK }}>斜辺</span></Big>
    <Tri w={380} deg={32} show="cos" />
  </Note>);
  // verse 1: three ratios
  add('trig', <Note t={t} a={23.4} b={34.6} x={330} y={560} w={460} tag="三角関数 ＝ 辺の比">
    <Row l={<M s="cos θ" c={GOLD} />} r="底辺 ÷ 斜辺" c={GOLD} />
    <Row l={<M s="sin θ" />} r="高さ ÷ 斜辺" />
    <Row l={<M s="tan θ" />} r="高さ ÷ 底辺" />
    <div style={{ fontSize: 28, color: '#cfe9dc', marginTop: 6 }}>※ sin・tan は次の講義で</div>
  </Note>);
  // parallel
  add('par', <Note t={t} a={35.4} b={46.2} x={400} y={760} w={500} tag="平行 ∥">
    <Big s={44}><M s="向きが同じ ⇒ θ ＝ 0°" /></Big>
    <div>（線としては一生交わらない）</div>
  </Note>);
  // vector
  add('vec', <Note t={t} a={47.4} b={56.6} x={1560} y={650} w={470} tag="ベクトル">
    <div>矢印 ＝ <span style={{ color: PINK }}>向き</span> ＋ <span style={{ color: GOLD }}>大きさ</span></div>
    <Big s={44}><M s="|a⃗| ＝ 矢印の長さ" /></Big>
  </Note>);
  // chorus 1: unit circle (live)
  add('uc', <Note t={t} a={57.2} b={73.9} x={250} y={600} w={360} tag="単位円" rot={2}>
    <UnitCircle th={th} size={290} unknown={unknown} />
    <div style={{ fontSize: 30, textAlign: 'center' }}><M s="cos θ ＝ 影の x 座標" /></div>
  </Note>);
  // rap: value table
  add('tbl', <Note t={t} a={74.6} b={85.6} x={330} y={560} w={430} tag="cos の値">
    <Row l="cos 0°" r="＝ 1" c={GOLD} />
    <Row l="cos 60°" r="＝ 1/2" />
    <Row l="cos 90°" r="＝ 0" c={CYAN} />
    <Row l="cos 120°" r="＝ −1/2" />
    <Row l="cos 180°" r="＝ −1" c={PINK} />
  </Note>);
  // verse 2: meaning + projection
  add('mean', <Note t={t} a={86.2} b={92.2} x={1560} y={660} w={470} tag="cos は「そろい具合」">
    <Big s={44}>−1 ≦ <M s="cos θ" /> ≦ 1</Big>
    <div>そろうほど 1 に近づく</div>
  </Note>);
  add('proj', <Note t={t} a={92.5} b={107.2} x={330} y={640} w={440} tag="内積 ＝ 影 × 長さ">
    <Projection p={clamp((t - 93) / 2.5)} />
    <div style={{ fontSize: 32 }}><M s="a⃗・b⃗ ＝ (影の長さ) × |b⃗|" /></div>
  </Note>);
  // pre 2: 30-60-90
  add('306090', <Note t={t} a={108.2} b={118.8} x={330} y={600} w={460} tag="30°・60°・90°">
    <Big s={44}>1 : 2 : √3</Big>
    <Row l="cos 60°" r="＝ 1/2" />
    <Row l="cos 30°" r="＝ √3/2" />
  </Note>);
  // chorus 2: components
  add('comp', <Note t={t} a={124.6} b={135.8} x={360} y={640} w={500} tag="成分">
    <Big s={42}><M s="x成分 ＝ |a⃗| cos θ" /></Big>
    <Big s={42}><M s="y成分 ＝ |a⃗| sin θ" /></Big>
  </Note>);
  // female rap: reverse
  add('rev', <Note t={t} a={144.2} b={153.2} x={330} y={700} w={460} tag="×(−1) ＝ 逆向き" rot={2}>
    <Big s={42}><M s="θ → 180° − θ" /></Big>
    <Big s={42}><M s="cos(180°−θ) ＝ −cos θ" /></Big>
  </Note>);
  // breakdown: orthogonal
  add('orth', <Note t={t} a={153.8} b={162.2} x={1560} y={560} w={470} tag="直交 ⊥">
    <Big s={44}>cos 90° ＝ 0</Big>
    <Big s={42}><M s="⇒ a⃗・b⃗ ＝ 0" /></Big>
    <div>大きさに関係なく ゼロ！</div>
  </Note>);
  // bridge: cos wave + only at 0
  add('wave', <Note t={t} a={164.2} b={178.8} x={1530} y={600} w={500} tag="y ＝ cos θ のグラフ">
    <CosWave p={clamp((t - 164.6) / 6)} />
    <div style={{ fontSize: 32 }}>1 になるのは θ ＝ 0° のときだけ</div>
  </Note>);
  // final chorus: Cauchy-Schwarz, 45 deg
  add('cs', <Note t={t} a={196.2} b={202.5} x={360} y={640} w={480} tag="だから「最大値」">
    <Big s={42}><M s="a⃗・b⃗ ≦ |a⃗||b⃗|" /></Big>
    <div>等号は 同じ向き（θ＝0°）のとき</div>
  </Note>);
  add('45', <Note t={t} a={202.8} b={208.4} x={360} y={640} w={460} tag="45° の三角形">
    <Big s={44}>1 : 1 : √2</Big>
    <Row l="cos 45°" r="＝ 1/√2" />
  </Note>);
  // outro: summary
  add('sum', <Note t={t} a={220.3} b={230.6} x={1540} y={600} w={520} tag="本日のまとめ">
    <Big s={40}><M s="a⃗・b⃗ ＝ |a⃗||b⃗| cos θ" /></Big>
    <div><span style={{ color: GOLD }}>同じ向き</span> → 最大 ／ <span style={{ color: CYAN }}>直交</span> → 0</div>
    <div><span style={{ color: PINK }}>逆向き</span> → マイナス</div>
  </Note>);
  void random; void LAV;
  return <>{n}</>;
};
