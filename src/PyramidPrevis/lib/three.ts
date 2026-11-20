// 簡易3D：ポリゴンを透視投影してSVGで描く。フレームだけで決まるので、どこにシークしても同じ絵になる。
// 鎌倉プレビズ（src/KamakuraPrevis）と同じ考え方。

export type V = [number, number, number];
export type Face = { p: V[]; color: string; stroke?: string; opacity?: number };

export const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V, b: V): V => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const unit = (a: V): V => {
  const n = Math.sqrt(dot(a, a)) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};

/** 光の向き（左上手前から） */
const LIGHT = unit([-0.5, 0.8, 0.6]);

/** 16進の色に明るさを掛ける */
export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `rgb(${r},${g},${b})`;
};

export type Camera = {
  target: V;
  /** 水平の回転（度）。0で南から北を見る */
  azimuth: number;
  /** 見下ろす角度（度） */
  elevation: number;
  distance: number;
  /** 画面上の焦点距離（px） */
  focal?: number;
  center?: [number, number];
};

export type Projected = { x: number; y: number; depth: number };

export const projectFaces = (faces: Face[], cam: Camera) => {
  const az = (cam.azimuth * Math.PI) / 180;
  const el = (cam.elevation * Math.PI) / 180;
  const eye = add(cam.target, [
    Math.sin(az) * Math.cos(el) * cam.distance,
    Math.sin(el) * cam.distance,
    Math.cos(az) * Math.cos(el) * cam.distance,
  ]);
  const forward = unit(sub(cam.target, eye));
  const right = unit(cross(forward, [0, 1, 0]));
  const up = cross(right, forward);
  const focal = cam.focal ?? 1400;
  const [cx, cy] = cam.center ?? [960, 540];
  const project = (v: V): Projected => {
    const d = sub(v, eye);
    const depth = Math.max(0.01, dot(d, forward));
    return {
      x: cx + (dot(d, right) * focal) / depth,
      y: cy - (dot(d, up) * focal) / depth,
      depth,
    };
  };
  return faces
    .map((face) => {
      const normal = unit(
        cross(sub(face.p[1], face.p[0]), sub(face.p[2], face.p[0])),
      );
      const center = scale(
        face.p.reduce((s, v) => add(s, v), [0, 0, 0] as V),
        1 / face.p.length,
      );
      const facing = dot(normal, sub(eye, center));
      const light = 0.55 + 0.45 * Math.max(0, dot(normal, LIGHT));
      const screen = face.p.map(project);
      const depth = screen.reduce((s, p) => s + p.depth, 0) / screen.length;
      return { ...face, screen, depth, facing, fill: shade(face.color, light) };
    })
    .filter((f) => f.facing > 0)
    .sort((a, b) => b.depth - a.depth);
};

export const toPoints = (screen: Projected[]) =>
  screen.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

/**
 * 四角錐台（底面が正方形）。上面の大きさ0なら四角錐。
 * 面は外向きになる順で並べる（裏向きの面は描かない）。
 */
export const frustum = (
  y0: number,
  y1: number,
  half0: number,
  half1: number,
  color: string,
  opts: { top?: boolean; bottom?: boolean; opacity?: number } = {},
): Face[] => {
  const b: V[] = [
    [-half0, y0, -half0],
    [half0, y0, -half0],
    [half0, y0, half0],
    [-half0, y0, half0],
  ];
  const t: V[] = [
    [-half1, y1, -half1],
    [half1, y1, -half1],
    [half1, y1, half1],
    [-half1, y1, half1],
  ];
  const faces: Face[] = [];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    const p: V[] =
      half1 > 0.0001 ? [b[i], t[i], t[j], b[j]] : [b[i], t[i], b[j]];
    faces.push({ p, color, opacity: opts.opacity });
  }
  if (opts.top !== false && half1 > 0.0001)
    faces.push({ p: [t[0], t[3], t[2], t[1]], color, opacity: opts.opacity });
  if (opts.bottom)
    faces.push({ p: [b[0], b[1], b[2], b[3]], color, opacity: opts.opacity });
  return faces;
};
