import React from 'react';
import { Fm, W, clamp } from './common';

// Mincho formulas drifting slowly in the background (calm, "lecture notes" feel)
const SETS: [number, string[][]][] = [
  [0, [['a·b ＝ |a||b|cosθ', 'sinθ ＝ 高さ／斜辺'], ['sin0° ＝ 0', '平行 ⇔ θ ＝ 0°'], ['|a×b| ＝ |a||b|sinθ', 'cos90° ＝ 0']]],
  [42.0, [['|a×b| ＝ |a||b|sinθ', '面積 ＝ 底辺 × 高さ'], ['高さ ＝ |b|sinθ', 'sin90° ＝ 1'], ['0 ≦ sinθ ≦ 1　(0° ≦ θ ≦ 180°)', 'sin(180°−θ) ＝ sinθ']]],
  [71.3, [['内積 ＝ 影の長さ', '外積 ＝ 高さ × 底辺'], ['sin²θ ＋ cos²θ ＝ 1', 'cos ＝ 横、sin ＝ 縦'], ['a·b ＝ |a||b|cosθ', '|a×b| ＝ |a||b|sinθ']]],
  [124.0, [['sin0° ＝ 0', 'sin30° ＝ 1/2', 'sin90° ＝ 1'], ['sin180° ＝ 0', 'y ＝ sinθ'], ['単位円：半径 1', 'sinθ ＝ 点の高さ']]],
  [147.6, [['a×b ⊥ a', 'a×b ⊥ b'], ['b×a ＝ −(a×b)', 'a×b ＋ b×a ＝ 0'], ['右手の法則', '|a×b| ＝ |a||b|sinθ']]],
  [172.4, [['|僕×君| ＝ |僕||君|sin90°', 'sin90° ＝ 1'], ['a·b ＝ |a||b|cosθ', '|a×b| ＝ |a||b|sinθ'], ['違うからこそ最大', 'Q.E.D.']]],
];
const ROWS = [{ y: 120, size: 74, sp: 70, dir: 1 }, { y: 430, size: 92, sp: 55, dir: -1 }, { y: 735, size: 66, sp: 82, dir: 1 }];

export const MinchoDrift: React.FC<{ t: number; strength: number; dark: boolean }> = ({ t, strength, dark }) => {
  let si = 0; for (let k = 0; k < SETS.length; k++) if (SETS[k][0] <= t) si = k;
  const render = (idx: number, op: number) => SETS[idx][1].map((items, r) => {
    const R = ROWS[r];
    const text = items.join('　　　　');
    const span = 2600; // px per repeat
    const off = ((t * R.sp * R.dir) % span + span) % span;
    return (
      <div key={`${idx}-${r}`} style={{ position: 'absolute', top: R.y, left: R.dir > 0 ? off - span : -off, display: 'flex', gap: 0, opacity: op, whiteSpace: 'nowrap' }}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ width: span, fontSize: R.size, color: dark ? 'rgba(255,255,255,0.9)' : 'rgba(20,26,70,0.85)', letterSpacing: '0.06em' }}><Fm s={text} /></div>
        ))}
      </div>
    );
  });
  const t0 = SETS[si][0];
  const fadeIn = si === 0 ? 1 : clamp((t - t0) / 1.2);
  const base = 0.16 * strength;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: W, filter: 'blur(0.6px)' }}>
      {si > 0 && fadeIn < 1 && render(si - 1, base * (1 - fadeIn))}
      {render(si, base * fadeIn)}
    </div>
  );
};
