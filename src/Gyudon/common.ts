export const FPS = 30;
export const SONG = 158.78;
export const TOTAL = 171.0;
export const DURATION = Math.round(TOTAL * FPS);
export const W = 1920, H = 1080;
export const POP = "Nikumaru, 'DejaVu Sans', sans-serif";
export const MIN = "Genkai, 'DejaVu Serif', serif";
export const ORANGE = '#ffb347', TSUYU = '#c8822e', PINK = '#ff7fa8', CREAM = '#fff4e2', INK = '#1a0f08', NAVY = '#0c1430';

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const easeOut = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
export const easeInOut = (p: number) => { p = clamp(p); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
export const backOut = (p: number) => { p = clamp(p); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
export const bounce = (p: number) => {
  p = clamp(p); const n1 = 7.5625, d1 = 2.75;
  if (p < 1 / d1) return n1 * p * p;
  if (p < 2 / d1) return n1 * (p -= 1.5 / d1) * p + 0.75;
  if (p < 2.5 / d1) return n1 * (p -= 2.25 / d1) * p + 0.9375;
  return n1 * (p -= 2.625 / d1) * p + 0.984375;
};
export const fadeIO = (t: number, a: number, b: number, d = 0.3) => clamp(Math.min((t - a) / d, (b - t) / d));
