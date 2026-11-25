// 01章：カプセル100個が10×10に並ぶ → 1個だけ金に光る → 1個コロンと出て全体がシャッフル
import React, { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { GACHA, clamp } from "../theme";
import { Burst, Capsule, mulberry32 } from "./toon";
import { Stage3D, type Cam } from "./Stage3D";

export const WALL_CAM: Cam = {
  fov: 34,
  position: [0, 0.4, 15],
  lookAt: [0, 0, 0],
  shiftX: 200,
  shiftY: -40,
};
const SP = 0.6;
const GOLD = 37;
const ROLL = 62;

export type WallTimes = {
  appear: number;
  gold: number;
  /** 2回目の登場（01-05） */
  again: number;
  roll: number;
  shuffle: number;
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const Wall: React.FC<{ t: WallTimes }> = ({ t }) => {
  const frame = useCurrentFrame();
  const perm = useMemo(() => {
    const rng = mulberry32(99);
    const a = Array.from({ length: 100 }, (_, i) => i);
    for (let i = 99; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, []);
  const pos = (i: number): [number, number] => [
    ((i % 10) - 4.5) * SP,
    (4.5 - Math.floor(i / 10)) * SP,
  ];
  const second = frame >= t.again - 30;
  const start = second ? t.again : t.appear;
  const sh = easeOut(interpolate(frame, [t.shuffle, t.shuffle + 36], [0, 1], clamp));
  const goldT = frame - t.gold;
  return (
    <>
      {Array.from({ length: 100 }, (_, i) => {
        const col = i % 10;
        const row = Math.floor(i / 10);
        const delay = start + (col + (9 - row)) * 1.3;
        const s = interpolate(frame - delay, [0, 6, 10], [0, 1.15, 1], clamp);
        if (s <= 0) return null;
        let [x, y] = pos(i);
        let z = 0;
        let rotZ = 0;
        let rotY = 0;
        let kind: "blue" | "gold" = "blue";
        let glow = 0;
        let scale = s;
        if (!second && i === GOLD && goldT >= 0) {
          kind = "gold";
          glow = 0.7;
          z = interpolate(goldT, [0, 8, 16, 24], [0, 1.4, 1.0, 1.1], clamp);
          scale *= 1 + 0.25 * Math.max(0, 1 - goldT / 20);
          rotZ = Math.sin(goldT * 0.5) * 0.15 * Math.max(0, 1 - goldT / 40);
        }
        if (second) {
          // 1個コロンと出ていく
          if (i === ROLL) {
            const u = interpolate(frame, [t.roll, t.roll + 40], [0, 1], clamp);
            x += u * 1.6;
            y -= u * 5.2 + Math.sin(Math.min(1, u * 3) * Math.PI) * 0.4;
            z = u * 2.2;
            rotZ = -u * 9;
            rotY = u * 5;
          }
          // 全体がシャッフル：場所を入れ替えながらくるっと回る
          if (i !== ROLL) {
            const [tx, ty] = pos(perm[i]);
            x += (tx - x) * sh;
            y += (ty - y) * sh;
            rotY = sh * Math.PI * 2;
            z = Math.sin(sh * Math.PI) * 0.8;
          }
        }
        return (
          <group key={i} position={[x, y, z]} scale={scale} rotation={[0, rotY, rotZ]}>
            <group rotation={[0.35, 0, 0.5]}>
              <Capsule r={SP * 0.42} kind={kind} glow={glow} outline={0.1} />
            </group>
            {kind === "gold" && goldT >= 0 && goldT < 30 ? (
              <Burst t={goldT / 30} radius={0.9} size={0.09} />
            ) : null}
          </group>
        );
      })}
      {/* 金の後ろの光 */}
      {!second && goldT >= 0 ? (
        <mesh position={[...pos(GOLD), -0.3] as [number, number, number]} scale={1.1 + Math.sin(goldT / 4) * 0.08}>
          <circleGeometry args={[0.75, 32]} />
          <meshBasicMaterial color={GACHA.gold} transparent opacity={0.35} />
        </mesh>
      ) : null}
    </>
  );
};

export const WallScene: React.FC<{ t: WallTimes; opacity?: number }> = ({ t, opacity = 1 }) => (
  <Stage3D cam={WALL_CAM} opacity={opacity}>
    <Wall t={t} />
  </Stage3D>
);
