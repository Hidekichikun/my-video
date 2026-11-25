// 07章：100連の演出（ハズレ景品が高速で流れる→最後の1個が金に光りかけて灰色）と、
// ちび先生37人の「おかえり」。
import React, { useMemo } from "react";
import * as THREE from "three";
import { interpolate, useCurrentFrame } from "remotion";
import { POP, clamp } from "../theme";
import { Burst, Capsule, mulberry32, useTextures } from "./toon";
import { Stage3D, type Cam } from "./Stage3D";
import { PEOPLE } from "./hundred";

const PULL_CAM: Cam = {
  fov: 34,
  position: [0, 0, 12],
  lookAt: [0, 0, 0],
  shiftX: 210,
  shiftY: 30,
};
const PRIZES = ["miss-stick", "miss-onigiri", "miss-pebble"] as const;

/** 100連の演出の長さ（フレーム）。07-04 のあとの4秒＝120f に収める */
export const PULL_LEN = 118;
/** 最後の1個が出てくる（これより前は景品が流れる） */
const FINAL = PULL_LEN - 36;
/** その時点の「何連目」 */
export const pullCount = (u: number) =>
  Math.max(0, Math.min(100, Math.floor(Math.pow(Math.max(0, u) / FINAL, 1.25) * 99) + (u >= FINAL ? 1 : 0)));

const PERIOD = 3;
const PullShow: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const u = frame - start;
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
  if (!tex || u < 0) return null;
  // 景品：3フレームごとに1個、左右に弧を描いて飛ぶ
  const shots: number[] = [];
  for (let k = 0; k * PERIOD < FINAL - 4; k++) shots.push(k * 2, k * 2 + 1);
  const gT = u - FINAL;
  const grey = gT > 22;
  return (
    <>
      {shots.map((k) => {
        const age = u - Math.floor(k / 2) * PERIOD;
        if (age < 0 || age > 30) return null;
        const rng = mulberry32(k * 17 + 3);
        const dir = k % 2 === 0 ? -1 : 1;
        const vx = dir * (1.6 + rng() * 2.6);
        const vy = 1.2 + rng() * 2.4;
        const t = age / 30;
        const x = vx * t * 3.4;
        const y = vy * t * 3 - 5.5 * t * t * 3;
        const prize = PRIZES[Math.floor(rng() * 3)];
        return (
          <sprite
            key={k}
            position={[x, y, 0.5]}
            scale={[1.7 * (1 - t * 0.3), 1.7 * (1 - t * 0.3), 1]}
          >
            <spriteMaterial
              map={tex[prize]}
              transparent
              opacity={1 - t * t}
              depthWrite={false}
              toneMapped={false}
              rotation={t * 6 * dir}
            />
          </sprite>
        );
      })}
      {/* ガチャの本体カプセル：次々開く → 最後の1個が金に光りかけて灰色 */}
      <group position={[0, -0.4, 0]} scale={1.5}>
        {gT < 0 ? (
          <Capsule
            r={0.9}
            kind="blue"
            open={Math.abs(Math.sin((u / PERIOD) * Math.PI)) * 0.9}
            outline={0.07}
          />
        ) : (
          <>
            <group rotation={[0, 0, Math.sin(gT * 1.4) * 0.12 * (grey ? 0 : 1)]}>
              <Capsule
                r={0.9}
                kind={grey ? "miss" : "gold"}
                open={grey ? 0.9 : interpolate(gT, [0, 12], [0, 0.25], clamp)}
                glow={grey ? 0 : interpolate(gT, [0, 16, 22], [0, 1, 0.1], clamp)}
                outline={0.07}
              />
            </group>
            {!grey && gT < 22 ? <Burst t={gT / 22} radius={1.8} size={0.1} count={10} /> : null}
          </>
        )}
      </group>
    </>
  );
};

export const PullScene: React.FC<{ start: number; opacity?: number }> = ({
  start,
  opacity = 1,
}) => (
  <Stage3D cam={PULL_CAM} opacity={opacity}>
    <PullShow start={start} />
  </Stage3D>
);

/* ------------------------------------------------------------------ */
const CROWD_CAM: Cam = {
  fov: 34,
  position: [0, 8.4, 9.8],
  lookAt: [0, 0.5, 0.3],
  shiftX: 215,
  shiftY: -10,
};
const LOSERS = PEOPLE.filter((p) => !p.win);

const CrowdShow: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const tex = useTextures(useMemo(() => ({ wave: "photo/math-guide/chibi-wave.png" }), []));
  if (!tex) return null;
  return (
    <>
      {LOSERS.map((p) => {
        const c = p.cluster!;
        const appear = interpolate(frame - (start + p.rank * 0.6), [0, 7, 11], [0, 1.15, 1], clamp);
        if (appear <= 0) return null;
        const t = frame - start;
        const sway = Math.sin(t / 5 + p.phase) * 0.1;
        const hop = Math.max(0, Math.sin(t / 6 + p.phase)) * 0.12;
        return (
          <group key={p.index} position={[c.x, 0, c.z]} scale={appear}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
              <circleGeometry args={[0.4, 28]} />
              <meshBasicMaterial color={POP.ink} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
              <circleGeometry args={[0.34, 28]} />
              <meshBasicMaterial color="#C9C9D1" />
            </mesh>
            <sprite
              position={[0, hop, 0]}
              scale={[1.5, 1.5, 1]}
              center={new THREE.Vector2(0.5, 54 / 768)}
            >
              <spriteMaterial
                map={tex.wave}
                transparent
                depthWrite={false}
                toneMapped={false}
                rotation={sway}
              />
            </sprite>
          </group>
        );
      })}
    </>
  );
};

export const CrowdScene: React.FC<{ start: number; opacity?: number }> = ({
  start,
  opacity = 1,
}) => (
  <Stage3D cam={CROWD_CAM} opacity={opacity}>
    <CrowdShow start={start} />
  </Stage3D>
);
