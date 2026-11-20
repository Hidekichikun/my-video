import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
type V = [number, number, number];
type Face = { p: V[]; c: string };
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V, b: V): V => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const unit = (a: V): V => {
  const n = Math.sqrt(dot(a, a));
  return [a[0] / n, a[1] / n, a[2] / n];
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

// Perspective projection of a shared 3D world; deterministic for frame seeking.
function world(frame: number, scene = "town") {
  const faces: Face[] = [];
  const poly = (p: V[], c: string) => faces.push({ p, c });
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    c: string[],
  ) => {
    const a: V = [x - w / 2, y, z - d / 2],
      b: V = [x + w / 2, y, z - d / 2],
      e: V = [x + w / 2, y, z + d / 2],
      f: V = [x - w / 2, y, z + d / 2];
    const up = (v: V): V => add(v, [0, h, 0]);
    poly([a, b, up(b), up(a)], c[1]);
    poly([b, e, up(e), up(b)], c[2]);
    poly([e, f, up(f), up(e)], c[0]);
    poly([f, a, up(a), up(f)], c[1]);
    poly([up(a), up(b), up(e), up(f)], c[3] || c[0]);
  };
  const roof = (x: number, y: number, z: number, w: number, d: number) => {
    const a: V = [x - w / 2, y, z - d / 2],
      b: V = [x + w / 2, y, z - d / 2],
      c: V = [x + w / 2, y, z + d / 2],
      e: V = [x - w / 2, y, z + d / 2],
      p: V = [x, y + 1.1, z - d / 2],
      q: V = [x, y + 1.1, z + d / 2];
    poly([a, e, q, p], "#7a7770");
    poly([b, p, q, c], "#a19b8d");
    poly([e, c, q], "#c4baa6");
    poly([a, p, b], "#b5ab97");
  };
  const stick = (a: V, b: V, r: number, color: string) => {
    const dir = unit(sub(b, a)),
      side = unit(cross(dir, Math.abs(dir[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0])),
      other = cross(dir, side);
    const ring = (p: V, i: number): V =>
      add(
        p,
        add(
          side.map((v) => v * r * Math.cos((i * Math.PI) / 3)) as V,
          other.map((v) => v * r * Math.sin((i * Math.PI) / 3)) as V,
        ),
      );
    for (let i = 0; i < 6; i++)
      poly([ring(a, i), ring(a, i + 1), ring(b, i + 1), ring(b, i)], color);
  };
  const sphere = (p: V, r: number, color: string) => {
    const point = (i: number, j: number): V =>
      add(p, [
        r * Math.sin((i * Math.PI) / 6) * Math.cos((j * Math.PI) / 6),
        r * Math.cos((i * Math.PI) / 6),
        r * Math.sin((i * Math.PI) / 6) * Math.sin((j * Math.PI) / 6),
      ]);
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 12; j++)
        poly(
          [point(i, j), point(i + 1, j), point(i + 1, j + 1), point(i, j + 1)],
          color,
        );
  };
  const person = (
    x: number,
    z: number,
    color: string,
    phase: number,
    role: string,
    walking: boolean,
  ) => {
    const swing = walking ? Math.sin(phase) * 0.36 : 0,
      bob = walking ? Math.abs(Math.sin(phase)) * 0.06 : 0;
    const v = (a: number, b: number, c: number): V => [x + a, b + bob, z + c];
    poly(
      Array.from(
        { length: 16 },
        (_, i): V => [
          x + Math.cos((i * Math.PI) / 8) * 0.46,
          0.018,
          z + Math.sin((i * Math.PI) / 8) * 0.28,
        ],
      ),
      "#b1aa94",
    );
    stick(v(0, 0.88, 0), v(0, 1.65, 0), 0.065, color);
    stick(v(0, 1.48, 0), v(-0.33, 1.13, swing), 0.055, color);
    stick(v(0, 1.48, 0), v(0.37, 1.15, -swing), 0.055, color);
    stick(v(0, 0.9, 0), v(-0.19, 0.46, swing), 0.065, color);
    stick(v(-0.19, 0.46, swing), v(-0.23, 0.06, swing * 0.8), 0.065, color);
    stick(v(0, 0.9, 0), v(0.19, 0.46, -swing), 0.065, color);
    stick(v(0.19, 0.46, -swing), v(0.23, 0.06, -swing * 0.8), 0.065, color);
    sphere(v(0, 1.94, 0), 0.27, "#f7f2df");
    if (role === "traveler") {
      for (let i = 0; i < 12; i++)
        poly(
          [
            v(0, 2.4, 0),
            v(
              Math.cos((i * Math.PI) / 6) * 0.48,
              2.12,
              Math.sin((i * Math.PI) / 6) * 0.48,
            ),
            v(
              Math.cos(((i + 1) * Math.PI) / 6) * 0.48,
              2.12,
              Math.sin(((i + 1) * Math.PI) / 6) * 0.48,
            ),
          ],
          i < 6 ? "#caa772" : "#ddc491",
        );
      box(x, 1, z + 0.22, 0.5, 0.5, 0.32, ["#bc784e", "#966141", "#a36a46"]);
      stick(v(0.38, 0.03, -0.1), v(0.38, 1.65, -0.1), 0.027, "#725b3f");
    }
    if (role === "merchant")
      box(x, 2.16, z, 0.4, 0.12, 0.34, ["#688d88", "#436b67", "#527772"]);
    if (role === "farmer") {
      stick(v(-0.8, 1.48, 0), v(0.8, 1.48, 0), 0.035, "#75664a");
      box(x - 0.75, 0.65, z, 0.48, 0.5, 0.45, [
        "#a8926c",
        "#86765c",
        "#c0aa80",
      ]);
    }
    if (role === "warrior")
      stick(v(0.25, 0.55, 0.1), v(0.3, 1.3, 0.1), 0.045, "#5e6265");
  };
  poly(
    [
      [-45, 0, -55],
      [45, 0, -55],
      [45, 0, 35],
      [-45, 0, 35],
    ],
    "#c7c7ad",
  );
  poly(
    [
      [-3, 0.008, -38],
      [3, 0.008, -38],
      [3, 0.008, 28],
      [-3, 0.008, 28],
    ],
    "#e2d6ba",
  );
  poly(
    [
      [-18, 0.01, -1.6],
      [18, 0.01, -1.6],
      [18, 0.01, 1.6],
      [-18, 0.01, 1.6],
    ],
    "#dfd2b6",
  );
  for (let i = 0; i < 11; i++) {
    const x = -38 + i * 8,
      z = -36 - Math.abs(i - 5) * 1.1,
      h = 7 + (i % 3) * 2;
    poly(
      [
        [x - 9, 0, z + 8],
        [x, h, z],
        [x + 9, 0, z + 8],
      ],
      i % 2 ? "#a6b49b" : "#98aa92",
    );
    poly(
      [
        [x, h, z],
        [x + 9, 0, z + 8],
        [x + 5, 0, z - 9],
      ],
      "#889c85",
    );
  }
  if (scene === "temple") {
    box(0, 0, -7, 12, 0.7, 6, ["#b7b09b", "#aaa28d", "#c9c1ad"]);
    box(0, 0.7, -7, 10, 3.5, 4.5, ["#b9a181", "#957e65", "#cdb495"]);
    roof(0, 4.2, -7, 12, 6);
    for (const x of [-3.8, -1.9, 0, 1.9, 3.8])
      box(x, 0.7, -4.7, 0.18, 3.3, 0.2, ["#756b59", "#756b59", "#756b59"]);
    box(0, 0, -3.7, 5, 0.25, 1.2, ["#b5ad97", "#a29b86", "#c8bea9"]);
    for (const x of [-9, 9]) {
      box(x, 0, -7, 3, 2.3, 7, ["#bfae90", "#ac997e", "#c9b699"]);
      roof(x, 2.3, -7, 3.8, 8);
    }
    const seated = (x: number, color: string, traveler: boolean) => {
      box(x, 0.02, 1, 1.35, 0.07, 1.1, ["#aab29a", "#9da58f", "#b9bfa8"]);
      stick([x, 0.45, 1], [x, 1.35, 1], 0.075, color);
      stick([x, 1.2, 1], [x - 0.4, 0.75, 1.1], 0.065, color);
      stick([x, 1.2, 1], [x + 0.4, 0.75, 1.1], 0.065, color);
      stick([x - 0.4, 0.75, 1.1], [x, 0.64, 1.3], 0.055, color);
      stick([x + 0.4, 0.75, 1.1], [x, 0.64, 1.3], 0.055, color);
      stick([x, 0.5, 1], [x - 0.5, 0.17, 1.2], 0.075, color);
      stick([x - 0.5, 0.17, 1.2], [x + 0.3, 0.16, 1.35], 0.075, color);
      stick([x, 0.5, 1], [x + 0.5, 0.17, 1.2], 0.075, color);
      stick([x + 0.5, 0.17, 1.2], [x - 0.3, 0.16, 1.35], 0.075, color);
      const lean =
        traveler && frame > 390
          ? Math.sin((Math.min(1, (frame - 390) / 30) * Math.PI) / 2) * 0.14
          : 0;
      sphere([x + lean, 1.65, 1], 0.27, "#f7f2df");
      if (!traveler)
        poly(
          [
            [x - 0.18, 1.3, 1.02],
            [x + 0.22, 1.2, 1.02],
            [x + 0.22, 0.53, 1.02],
            [x - 0.18, 0.53, 1.02],
          ],
          "#8f8873",
        );
      if (traveler) {
        box(x + 1, 0.05, 1.25, 0.5, 0.48, 0.4, [
          "#bc784e",
          "#966141",
          "#a36a46",
        ]);
        for (let i = 0; i < 12; i++)
          poly(
            [
              [x + 1, 0.8, 1.25],
              [
                x + 1 + Math.cos((i * Math.PI) / 6) * 0.48,
                0.53,
                1.25 + Math.sin((i * Math.PI) / 6) * 0.48,
              ],
              [
                x + 1 + Math.cos(((i + 1) * Math.PI) / 6) * 0.48,
                0.53,
                1.25 + Math.sin(((i + 1) * Math.PI) / 6) * 0.48,
              ],
            ],
            "#caa772",
          );
      }
    };
    seated(-1.4, "#6c7268", false);
    seated(1.3, "#9b583e", true);
    return faces;
  }
  if (scene === "warrior") {
    box(0, 0, -5, 15, 2.2, 0.35, ["#b4aa90", "#a39780", "#c5baa0"]);
    box(0, 0, -5, 3, 2.4, 0.45, ["#756b59", "#6e6151", "#837664"]);
    roof(0, 2.4, -5, 4.3, 2);
    box(0, 0, -10, 9, 3, 5, ["#c5b597", "#b09e82", "#c9ba9d"]);
    roof(0, 3, -10, 10, 6);
    person(-1.4, 1, "#9b583e", 0, "traveler", false);
    person(1.2, -0.3, "#616f7b", 0, "warrior", false);
    person(5, -3, "#576579", 0, "warrior", false);
    // A second attendant and load establish everyday service around the gate.
    person(-5, -2, "#78734c", frame * 0.1, "farmer", false);
    return faces;
  }
  if (scene === "life") {
    for (const x of [-6, 6]) {
      box(x, 0, -4, 4, 2.2, 5, ["#c8bd9f", "#b0a58a", "#bbae90"]);
      roof(x, 2.2, -4, 4.6, 5.6);
    }
    box(-3.3, 0, -1, 1.5, 0.65, 1.5, ["#979888", "#838577", "#b0b19d"]);
    box(-3.3, 0.65, -1, 1.05, 0.04, 1.05, ["#647d7d", "#647d7d", "#647d7d"]);
    person(-2, -0.6, "#416f6b", 0, "merchant", false);
    box(3, 0, -2, 1, 0.5, 1, ["#8d806c", "#756b5b", "#a39781"]);
    sphere([3, 0.75, -2], 0.45, "#565c57");
    for (let i = 0; i < 3; i++)
      sphere(
        [
          3 + Math.sin(frame * 0.035 + i) * 0.12,
          1.4 + ((frame * 0.015 + i * 0.5) % 1.6),
          -2,
        ],
        0.12 + i * 0.03,
        "#e0dfcf",
      );
    person(2.7, -0.4, "#78734c", 0, "merchant", false);
    const stepAside = Math.sin(ease(frame / 150) * Math.PI) * 0.7;
    person(-0.7 - stepAside, 1.5, "#9b583e", 0, "traveler", false);
    person(0.7, 4 - frame * 0.025, "#78734c", frame * 0.17, "farmer", true);
    return faces;
  }
  for (const side of [-1, 1])
    for (let i = 0; i < 7; i++) {
      if (side === -1 && i === 2) continue;
      const x = side * (6.5 + (i % 2) * 0.5),
        z = 12 - i * 6;
      box(x, 0, z, 4, 2.15, 4.2, ["#c8bd9f", "#b0a58a", "#bbae90", "#d2c8ad"]);
      roof(x, 2.15, z, 4.6, 4.8);
      box(x - side * 2.02, 0.03, z, 0.04, 1.55, 0.7, [
        "#746f60",
        "#746f60",
        "#746f60",
      ]);
    }
  box(0, 0, -32, 9, 1, 5, ["#aaa58c", "#938f79", "#b6b097"]);
  box(0, 1, -32, 5, 2.5, 3, ["#b9977a", "#aa856b", "#c4a687"]);
  roof(0, 3.5, -32, 6.5, 4.2);
  for (const x of [-2, 2])
    box(x, 0, -26, 0.24, 3, 0.24, ["#916e59", "#805e4a", "#a38269"]);
  box(0, 2.7, -26, 5, 0.22, 0.3, ["#95725c", "#805e4a", "#a38269"]);
  box(-3.7, 0, 0.3, 2, 0.82, 0.85, ["#b18c60", "#98784f", "#c5a375"]);
  for (let i = 0; i < 5; i++)
    box(-4.4 + i * 0.32, 0.83, 0.3, 0.13, 0.055, 0.48, [
      "#697d80",
      "#617376",
      "#8b9895",
    ]);
  box(-4.9, 0, 1.5, 0.7, 0.45, 0.65, ["#a79264", "#8c7b55", "#c6b17b"]);
  person(-4.1, -0.7, "#416f6b", 0, "merchant", false);
  person(2, 6 - frame * 0.022, "#78734c", frame * 0.17, "farmer", true);
  person(1.6, -10, "#616f7b", 0, "warrior", false);
  const approach = ease(frame / 150);
  person(
    mix(0.5, -1.9, approach),
    mix(8, 1.1, approach),
    "#9b583e",
    frame * 0.19,
    "traveler",
    frame < 150,
  );
  return faces;
}

export const WorldView: React.FC<{ frame: number; scene: string }> = ({
  frame,
  scene,
}) => {
  const wide = scene === "town" && frame < 150;
  const u = ease(frame / (scene === "temple" ? 510 : 300));
  let target: V = [0, 1, 0],
    radius = 12,
    angle = mix(0.45, -0.2, u),
    height = 5;
  if (scene === "town") {
    const q = ease(wide ? frame / 149 : (frame - 150) / 299);
    target = wide ? [0, 0.7, mix(-5, 0, q)] : [-2.9, 1.05, 0.3];
    radius = wide ? mix(27, 18, q) : 9.8;
    angle = wide ? mix(0.42, 0.23, q) : mix(0.85, -0.2, q);
    height = wide ? mix(15, 9, q) : 4.4;
  } else if (scene === "temple") {
    const arrival = ease(frame / 80),
      ending = ease((frame - 420) / 90);
    target = [0, 1, mix(-3, 0, arrival)];
    radius = mix(19, 10, arrival) + ending * 9;
    angle = mix(0.5, 0.12, u);
    height = mix(8, 4, arrival) + ending * 5;
  } else if (scene === "life") {
    target = [0, 0.8, -0.5];
    radius = 13;
    angle = mix(0.6, 0.2, u);
    height = 6;
  }
  const eye = add(target, [
    Math.sin(angle) * radius,
    height,
    Math.cos(angle) * radius,
  ]);
  const forward = unit(sub(target, eye)),
    right = unit(cross(forward, [0, 1, 0])),
    up = cross(right, forward);
  const project = (v: V) => {
    const d = sub(v, eye),
      depth = dot(d, forward);
    return {
      x: 960 + (dot(d, right) * 1250) / depth,
      y: 505 - (dot(d, up) * 1250) / depth,
      depth,
    };
  };
  const clip = (points: V[]) => {
    const result: V[] = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i],
        b = points[(i + 1) % points.length],
        da = dot(sub(a, eye), forward),
        db = dot(sub(b, eye), forward);
      if (da >= 0.4) result.push(a);
      if (da >= 0.4 !== db >= 0.4) {
        const q = (0.4 - da) / (db - da);
        result.push([
          mix(a[0], b[0], q),
          mix(a[1], b[1], q),
          mix(a[2], b[2], q),
        ]);
      }
    }
    return result;
  };
  const faces = world(frame, scene)
    .map((face, index) => ({
      ...face,
      index,
      screen: clip(face.p).map(project),
    }))
    .filter((f) => f.screen.length >= 3)
    .sort((a, b) => {
      if (a.index < 25 || b.index < 25)
        return a.index < 25 && b.index < 25
          ? a.index - b.index
          : a.index < 25
            ? -1
            : 1;
      return (
        b.screen.reduce((s, p) => s + p.depth, 0) / b.screen.length -
        a.screen.reduce((s, p) => s + p.depth, 0) / a.screen.length
      );
    });
  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{ position: "absolute" }}
    >
      <rect width="1920" height="1080" fill="#e0e8df" />
      {faces.map((face, i) => (
        <polygon
          key={i}
          points={face.screen
            .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
            .join(" ")}
          fill={face.c}
          stroke={face.c}
          strokeWidth=".6"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
};

export const KamakuraPrevis: React.FC = () => {
  const frame = useCurrentFrame(),
    t = frame / 30,
    wide = frame < 150,
    u = ease(wide ? frame / 149 : (frame - 150) / 299);
  const target: V = wide ? [0, 0.7, mix(-5, 0, u)] : [-2.9, 1.05, 0.3];
  const angle = wide ? mix(0.42, 0.23, u) : mix(0.85, -0.2, u),
    radius = wide ? mix(27, 18, u) : 9.8;
  const eye: V = add(target, [
    Math.sin(angle) * radius,
    wide ? mix(15, 9, u) : 4.4,
    Math.cos(angle) * radius,
  ]);
  const forward = unit(sub(target, eye)),
    right = unit(cross(forward, [0, 1, 0])),
    up = cross(right, forward);
  const project = (v: V) => {
    const d = sub(v, eye),
      depth = dot(d, forward);
    return {
      x: 960 + (dot(d, right) * 1250) / depth,
      y: 510 - (dot(d, up) * 1250) / depth,
      depth,
    };
  };
  const clip = (points: V[]) => {
    const result: V[] = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i],
        b = points[(i + 1) % points.length],
        da = dot(sub(a, eye), forward),
        db = dot(sub(b, eye), forward);
      if (da >= 0.4) result.push(a);
      if (da >= 0.4 !== db >= 0.4) {
        const q = (0.4 - da) / (db - da);
        result.push([
          mix(a[0], b[0], q),
          mix(a[1], b[1], q),
          mix(a[2], b[2], q),
        ]);
      }
    }
    return result;
  };
  const faces = world(frame)
    .map((face, index) => ({
      ...face,
      index,
      screen: clip(face.p).map(project),
    }))
    .filter((face) => face.screen.length >= 3)
    .sort((a, b) => {
      if (a.index < 25 || b.index < 25)
        return a.index < 25 && b.index < 25
          ? a.index - b.index
          : a.index < 25
            ? -1
            : 1;
      return (
        b.screen.reduce((s, p) => s + p.depth, 0) / b.screen.length -
        a.screen.reduce((s, p) => s + p.depth, 0) / a.screen.length
      );
    });
  const dialogue =
    t < 1.3
      ? ""
      : t < 4.7
        ? "ここが、武士の都かあ。"
        : t < 5.8
          ? ""
          : t < 8.6
            ? "これは、何ですか？"
            : t < 12
              ? "干した魚。旅のお供にどうだい？"
              : "じゃあ……ひとつ！";
  const speaker = t < 8.6 || t >= 12 ? "旅人" : "商人";
  return (
    <AbsoluteFill
      style={{
        background: "#e7ece3",
        fontFamily: '"Yu Gothic", "Meiryo", sans-serif',
        color: "#33463e",
      }}
    >
      <Audio src={staticFile("audio/kamakura-previs.wav")} />
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute" }}
      >
        <defs>
          <linearGradient id="sky" x2="0" y2="1">
            <stop stopColor="#d8e5df" />
            <stop offset="1" stopColor="#f3efdb" />
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#sky)" />
        {faces.map((face, i) => (
          <polygon
            key={i}
            points={face.screen
              .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
              .join(" ")}
            fill={face.c}
            stroke={face.c}
            strokeWidth=".6"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 45,
          background: "#f8f4e8ed",
          padding: "18px 26px",
          borderLeft: "5px solid #a05e43",
        }}
      >
        <div style={{ fontSize: 18, letterSpacing: 4, color: "#797d6d" }}>
          KAMAKURA / PREVIS 01
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, marginTop: 4 }}>
          棒人間、鎌倉を歩く。
        </div>
        <div style={{ fontSize: 22, marginTop: 5 }}>
          1260年代 ｜ {wide ? "若宮大路を歩く" : "道沿いの商い"}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 64,
          top: 54,
          fontSize: 20,
          background: "#f8f4e8df",
          padding: "12px 18px",
        }}
      >
        街・建物は仮配置
      </div>
      {dialogue && (
        <div
          style={{
            position: "absolute",
            bottom: 116,
            left: "50%",
            transform: "translateX(-50%)",
            minWidth: 850,
            textAlign: "center",
            background: "#fcf8ecef",
            border: "2px solid #bfb79f",
            borderRadius: 18,
            padding: "18px 36px 22px",
            boxShadow: "0 8px 24px #35413718",
          }}
        >
          <div
            style={{
              fontSize: 21,
              fontWeight: 700,
              color: speaker === "旅人" ? "#9b583e" : "#416f6b",
              marginBottom: 6,
            }}
          >
            {speaker}
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, whiteSpace: "nowrap" }}>
            {dialogue}
          </div>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 35,
          left: 64,
          right: 64,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 20,
          color: "#4f5b50",
        }}
      >
        <span>15秒試作 ／ 人物・カメラ・会話の確認</span>
        <span>
          {wide ? "01  街への導入" : "02  商人との出会い"}{" "}
          {String(Math.floor(t)).padStart(2, "0")} :{" "}
          {String(frame % 30).padStart(2, "0")} / 15s
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          height: 5,
          width: `${(frame / 449) * 100}%`,
          background: "#a05e43",
        }}
      />
    </AbsoluteFill>
  );
};
