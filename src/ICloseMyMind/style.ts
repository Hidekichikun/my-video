import { Easing } from 'remotion';

export const FONT = "'Genkai Mincho', 'Noto Serif JP', serif";
export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
