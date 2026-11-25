// 架空のガチャマシン（3D）。実在のゲーム・筐体には似せない、丸いドームとピンクの本体。
import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { GACHA, POP } from "../theme";
import { Capsule, ToonMat, ToonPart, mulberry32 } from "./toon";

const PALETTE = [GACHA.capsuleTop, GACHA.capsuleBottom, POP.cyan, POP.pink, POP.green];

export const GachaMachine: React.FC<{
  /** マシン全体のゆっくりした回転の止め（true なら固定） */
  frozen?: boolean;
  /** ハンドルを回す量（ラジアン） */
  crank?: number;
  /** 追加の y 回転 */
  yaw?: number;
}> = ({ frozen = false, crank = 0, yaw = 0 }) => {
  const frame = useCurrentFrame();
  const t = frozen ? 0 : frame;
  const geos = useMemo(
    () => ({
      dome: new THREE.SphereGeometry(1.45, 36, 24),
      body: new THREE.CylinderGeometry(1.3, 1.5, 1.7, 40),
      rim: new THREE.TorusGeometry(1.42, 0.12, 12, 40),
      foot: new THREE.CylinderGeometry(1.7, 1.8, 0.28, 40),
      knob: new THREE.CylinderGeometry(0.42, 0.42, 0.16, 28),
      slot: new THREE.BoxGeometry(0.9, 0.5, 0.2),
      handle: new THREE.BoxGeometry(0.16, 0.7, 0.14),
      door: new THREE.BoxGeometry(0.85, 0.5, 0.12),
    }),
    [],
  );
  const inside = useMemo(() => {
    const rng = mulberry32(7);
    return Array.from({ length: 15 }, (_, i) => {
      const a = rng() * Math.PI * 2;
      const rr = Math.sqrt(rng()) * 0.9;
      return {
        x: Math.cos(a) * rr,
        z: Math.sin(a) * rr * 0.8,
        y: -0.3 + rng() * 0.95 - rr * 0.25,
        tilt: rng() * 3,
        kind: i === 3 ? ("gold" as const) : ("blue" as const),
        phase: rng() * 6,
        color: PALETTE[i % PALETTE.length],
      };
    });
  }, []);
  return (
    <group rotation={[0, yaw + Math.sin(t / 55) * 0.35, 0]}>
      {/* 足と本体 */}
      <ToonPart geometry={geos.foot} color={POP.yellow} position={[0, -1.55, 0]} outline={0.04} />
      <ToonPart geometry={geos.body} color={POP.pink} position={[0, -0.6, 0]} outline={0.035} />
      {/* ハンドル */}
      <group position={[0, -0.55, 1.42]} rotation={[0, 0, crank]}>
        <ToonPart geometry={geos.knob} color={POP.yellow} rotation={[Math.PI / 2, 0, 0]} outline={0.1} />
        <ToonPart geometry={geos.handle} color={POP.white} position={[0, 0, 0.14]} outline={0.25} />
      </group>
      {/* 取り出し口 */}
      <ToonPart geometry={geos.slot} color={POP.ink} position={[0, -1.15, 1.4]} outline={0} />
      {/* ドーム（半透明）とふち */}
      <mesh geometry={geos.dome} position={[0, 0.78, 0]}>
        <ToonMat color="#DFF5FF" opacity={0.28} />
      </mesh>
      <ToonPart
        geometry={geos.rim}
        color={POP.yellow}
        position={[0, 0.3, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        outline={0.12}
      />
      {/* 中のカプセル */}
      {inside.map((c, i) => (
        <group
          key={i}
          position={[c.x, 0.8 + c.y + Math.abs(Math.sin(t / 14 + c.phase)) * 0.07, c.z]}
          rotation={[c.tilt, c.tilt * 1.7, c.tilt * 0.6]}
        >
          <Capsule r={0.3} kind={c.kind} outline={0.1} glow={c.kind === "gold" ? 0.5 : 0} />
        </group>
      ))}
    </group>
  );
};
