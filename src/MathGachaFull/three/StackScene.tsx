// 03章：灰色のカプセルが1個ずつ積み上がる（8段：16・15・…・9個＝100個）
import React, { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../theme";
import { Capsule } from "./toon";
import { Stage3D, type Cam } from "./Stage3D";

export const STACK_CAM: Cam = {
  fov: 34,
  position: [0, 3.2, 13],
  lookAt: [0, 2.0, 0],
  shiftX: 250,
  shiftY: 60,
};
const SX = 0.6;
const SY = 0.54;

/** 積む位置（下の段から、左から右へ） */
export const stackSlots = (): [number, number][] => {
  const out: [number, number][] = [];
  for (let r = 0; r < 8; r++) {
    const count = 16 - r;
    // 真ん中から外側へ（1個目は中央、2個目はそのとなり…）
    const cols = Array.from({ length: count }, (_, c) => c).sort(
      (a, b) => Math.abs(a - (count - 1) / 2) - Math.abs(b - (count - 1) / 2) || a - b,
    );
    for (const c of cols) out.push([(c - (count - 1) / 2) * SX, r * SY]);
  }
  return out;
};

export const StackScene: React.FC<{ appearFrames: number[]; opacity?: number }> = ({
  appearFrames,
  opacity = 1,
}) => {
  const slots = useMemo(stackSlots, []);
  const frame = useCurrentFrame();
  return (
    <Stage3D cam={STACK_CAM} opacity={opacity}>
      {slots.map(([x, y], i) => {
        const d = frame - appearFrames[i];
        if (d < 0) return null;
        const drop = interpolate(d, [0, 8, 12, 15], [3.2, 0, 0.18, 0], clamp);
        const s = interpolate(d, [0, 3], [0.6, 1], clamp);
        return (
          <group key={i} position={[x, y + drop + 0.3, 0]} scale={s} rotation={[0.3, 0, ((i * 37) % 7) * 0.04 - 0.12]}>
            <Capsule r={0.26} kind="miss" outline={0.1} />
          </group>
        );
      })}
    </Stage3D>
  );
};
