// 04章：10連の演出（カプセル10個が開いてハズレ景品が出る）と、コイン10回連続で表。
import React, { useMemo } from "react";
import * as THREE from "three";
import { interpolate, useCurrentFrame } from "remotion";
import { GACHA, POP, POP_BODY, clamp } from "../theme";
import { Capsule, mulberry32, useTextures } from "./toon";
import { Stage3D, type Cam } from "./Stage3D";

export const PULLS_CAM: Cam = {
  fov: 34,
  position: [0, 0, 12.5],
  lookAt: [0, 0, 0],
  shiftX: 240,
  shiftY: 20,
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/* ------------------------------------------------------------------ */
/* 10連 ×5                                                              */
/* ------------------------------------------------------------------ */
const PRIZES = ["miss-stick", "miss-onigiri", "miss-pebble"] as const;

const PullSet: React.FC<{
  start: number;
  end: number;
  seed: number;
  tex: Record<string, THREE.Texture>;
}> = ({ start, end, seed, tex }) => {
  const frame = useCurrentFrame();
  const u = frame - start;
  if (u < -1) return null;
  const rng = mulberry32(seed * 101 + 7);
  const exit = interpolate(frame, [end - 6, end], [1, 0], clamp);
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const prize = PRIZES[Math.floor(rng() * 3)];
        const x = (col - 2) * 1.75;
        const y = (0.5 - row) * 2.0 + 0.2;
        const appear = interpolate(u - col * 1.2, [0, 5, 8], [0, 1.15, 1], clamp);
        const open = easeOut(interpolate(u - col * 1.5, [11, 19], [0, 1], clamp));
        const prizeT = interpolate(u - col * 1.5, [14, 22], [0, 1], clamp);
        const capsuleScale =
          appear * exit * (1 - interpolate(u - col * 1.5, [20, 26], [0, 0.9], clamp));
        return (
          <group key={i} position={[x, y, 0]}>
            {capsuleScale > 0.01 ? (
              <group scale={capsuleScale} rotation={[0.3, 0, 0.35]}>
                <Capsule r={0.55} kind="blue" open={open} outline={0.09} />
              </group>
            ) : null}
            {prizeT > 0 && exit > 0.01 ? (
              <sprite
                position={[0, 0.05 + prizeT * 0.15, 0.3]}
                scale={[1.45 * prizeT * exit, 1.45 * prizeT * exit, 1]}
              >
                <spriteMaterial map={tex[prize]} transparent depthWrite={false} toneMapped={false} />
              </sprite>
            ) : null}
          </group>
        );
      })}
    </>
  );
};

export const TenPullsScene: React.FC<{
  starts: number[];
  end: number;
  opacity?: number;
}> = ({ starts, end, opacity = 1 }) => {
  const tex = useTextures(
    useMemo(
      () => ({
        "miss-stick": "photo/math-gacha/miss-stick.png",
        "miss-onigiri": "photo/math-gacha/miss-onigiri.png",
        "miss-pebble": "photo/math-gacha/miss-pebble.png",
      }),
      [],
    ),
  );
  return (
    <Stage3D cam={PULLS_CAM} opacity={opacity}>
      {tex
        ? starts.map((s, k) => (
            <PullSet
              key={k}
              start={s}
              end={k + 1 < starts.length ? starts[k + 1] + 3 : end}
              seed={k}
              tex={tex}
            />
          ))
        : null}
    </Stage3D>
  );
};

/* ------------------------------------------------------------------ */
/* コイン                                                               */
/* ------------------------------------------------------------------ */
let coinTex: { head: THREE.CanvasTexture; tail: THREE.CanvasTexture } | null = null;
const getCoinTex = () => {
  if (!coinTex) {
    const make = (text: string, base: string, rot: number) => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const g = c.getContext("2d")!;
      g.fillStyle = base;
      g.fillRect(0, 0, 256, 256);
      g.strokeStyle = POP.ink;
      g.lineWidth = 14;
      g.beginPath();
      g.arc(128, 128, 104, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = POP.ink;
      g.font = `800 150px "${POP_BODY}"`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(text, 128, 138);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.center.set(0.5, 0.5);
      t.rotation = rot;
      return t;
    };
    coinTex = {
      head: make("表", GACHA.gold, Math.PI / 2),
      tail: make("裏", "#E9D58A", -Math.PI / 2),
    };
  }
  return coinTex;
};

const Coin: React.FC<{ flip: number; lift: number; scale?: number }> = ({
  flip,
  lift,
  scale = 1,
}) => {
  const tex = getCoinTex();
  const geo = useMemo(() => new THREE.CylinderGeometry(0.62, 0.62, 0.14, 40), []);
  return (
    <group position={[0, lift, 0]} scale={scale}>
      <group rotation={[flip, 0, 0]}>
        <mesh geometry={geo} rotation={[Math.PI / 2, 0, 0]}>
          <meshToonMaterial attach="material-0" color="#E8C547" />
          <meshToonMaterial attach="material-1" map={tex.head} />
          <meshToonMaterial attach="material-2" map={tex.tail} />
        </mesh>
        <mesh geometry={geo} rotation={[Math.PI / 2, 0, 0]} scale={1.07}>
          <meshBasicMaterial color={POP.ink} side={THREE.BackSide} />
        </mesh>
      </group>
    </group>
  );
};

export const CoinsScene: React.FC<{
  start: number;
  /** 10枚が表で並び終わるフレーム */
  end: number;
  /** 11枚目が回り始めるフレーム */
  next: number;
  opacity?: number;
}> = ({ start, end, next, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const span = (end - start) / 10;
  return (
    <Stage3D cam={PULLS_CAM} opacity={opacity}>
      {Array.from({ length: 10 }, (_, i) => {
        const t0 = start + i * span * 0.92;
        const k = interpolate(frame, [t0, t0 + span * 1.1], [0, 1], clamp);
        const appear = interpolate(frame, [start - 8 + i, start + i], [0, 1], clamp);
        const flip = 4 * Math.PI * easeOut(k);
        const lift = Math.sin(Math.min(1, k) * Math.PI) * 1.1;
        const x = ((i % 5) - 2) * 1.5 - 1.3;
        const y = (0.5 - Math.floor(i / 5)) * 1.9 + 0.2;
        return (
          <group key={i} position={[x, y, 0]}>
            <Coin flip={flip} lift={lift} scale={appear} />
          </group>
        );
      })}
      {frame >= next - 10 ? (
        <group position={[3.7, 0, 0.5]}>
          {(() => {
            const k = Math.max(0, frame - next);
            const pop = interpolate(frame, [next - 10, next], [0, 1], clamp);
            return (
              <Coin
                flip={k * 0.32}
                lift={Math.abs(Math.sin(k * 0.1)) * 0.7}
                scale={1.15 * pop}
              />
            );
          })()}
        </group>
      ) : null}
    </Stage3D>
  );
};
