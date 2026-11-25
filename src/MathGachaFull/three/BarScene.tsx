// 05章：回数ごとの棒グラフがせり上がる（69回→50%、100回→63%、230回→90%、459回→99%）
import React, { useMemo } from "react";
import * as THREE from "three";
import { interpolate, useCurrentFrame } from "remotion";
import { POP, clamp } from "../theme";
import { ToonPart } from "./toon";
import { Stage3D, project, type Cam } from "./Stage3D";

export const BAR_CAM: Cam = {
  fov: 32,
  position: [0.6, 4.0, 17],
  lookAt: [0.2, 3.3, 0],
  shiftX: 90,
  shiftY: 0,
};
export const BARS = [
  { times: 69, pct: 50, color: POP.cyan },
  { times: 100, pct: 63, color: POP.yellow },
  { times: 230, pct: 90, color: POP.pink },
  { times: 459, pct: 99, color: POP.green },
] as const;
export const BAR_X = [-3.6, -1.2, 1.2, 3.6];
export const BAR_UNIT = 0.06; // 1% あたりの高さ
const BAR_W = 1.5;

/** 棒の上端の画面位置（札を置く場所） */
export const barTop = (i: number, pct: number) => project([BAR_X[i], pct * BAR_UNIT, 0], BAR_CAM);
/** 100% の線の端の画面位置 */
export const ceilingPoint = (x: number) => project([x, 100 * BAR_UNIT, 0], BAR_CAM);

const easeOutBack = (t: number) => {
  const c1 = 1.5;
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const BarScene: React.FC<{
  rise: number[];
  ceiling: number;
  opacity?: number;
}> = ({ rise, ceiling, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const geos = useMemo(
    () => ({
      slab: new THREE.BoxGeometry(11, 0.3, 2.4),
      bar: new THREE.BoxGeometry(BAR_W, 1, BAR_W),
      dash: new THREE.BoxGeometry(0.5, 0.07, 0.07),
    }),
    [],
  );
  const c = interpolate(frame, [ceiling, ceiling + 18], [0, 1], clamp);
  return (
    <Stage3D cam={BAR_CAM} opacity={opacity}>
      <ToonPart geometry={geos.slab} color="#FFFFFF" position={[0, -0.15, 0]} outline={0.025} />
      {BARS.map((b, i) => {
        const t = interpolate(frame, [rise[i], rise[i] + 22], [0, 1], clamp);
        if (t <= 0) return null;
        const h = Math.max(0.001, b.pct * BAR_UNIT * easeOutBack(t));
        return (
          <ToonPart
            key={i}
            geometry={geos.bar}
            color={b.color}
            position={[BAR_X[i], h / 2, 0]}
            scale={[1, h, 1]}
            outline={0.045}
          />
        );
      })}
      {/* 100% の点線 */}
      {c > 0
        ? Array.from({ length: 19 }, (_, k) => (
            <mesh
              key={k}
              geometry={geos.dash}
              position={[-4.7 + k * 0.52, 100 * BAR_UNIT, 1.3]}
              scale={[c, 1, 1]}
            >
              <meshBasicMaterial color={POP.ink} />
            </mesh>
          ))
        : null}
    </Stage3D>
  );
};
