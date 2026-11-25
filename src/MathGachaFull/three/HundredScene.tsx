// 02章：ちび先生100人（3D）。ビルボードのスプライト＋トゥーンのカプセル。
import React, { useMemo } from "react";
import * as THREE from "three";
import { interpolate, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { GACHA, POP, clamp } from "../theme";
import { Burst, Capsule, ToonLights, useTextures } from "./toon";
import {
  CYCLE,
  PEOPLE,
  loseStopFrame,
  sadFrame,
  winFrame,
  type HundredTimes,
  type Person,
} from "./hundred";

const SIZE = 1.5; // スプライト1枚の大きさ（ワールド単位）
const FEET = 54 / 768; // 立ち絵の足元（下端からの割合）
const HEAD = ((714 - 55) / 768) * SIZE; // 頭のてっぺんの高さ
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** 金のにじみ（加算合成）用のやわらかい丸 */
let glowTexture: THREE.CanvasTexture | null = null;
const getGlow = () => {
  if (!glowTexture) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,226,120,1)");
    grad.addColorStop(0.45, "rgba(255,200,60,0.55)");
    grad.addColorStop(1, "rgba(255,200,60,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    glowTexture = new THREE.CanvasTexture(c);
    glowTexture.colorSpace = THREE.SRGBColorSpace;
  }
  return glowTexture;
};

type Tex = Record<string, THREE.Texture>;

const CameraRig: React.FC<{ t: HundredTimes }> = ({ t }) => {
  const frame = useCurrentFrame();
  const camera = useThreeCamera();
  const k = easeInOut(interpolate(frame, [t.focus, t.focus + 40], [0, 1], clamp));
  const lerp = (a: number, b: number) => a + (b - a) * k;
  camera.position.set(0, lerp(11.8, 8.4), lerp(14.6, 9.8));
  camera.lookAt(0, lerp(0.3, 0.5), lerp(0.6, 0.3));
  camera.fov = lerp(35, 34);
  camera.setViewOffset(1920, 1080, -215, lerp(-45, -10), 1920, 1080);
  camera.updateProjectionMatrix();
  return null;
};

function useThreeCamera() {
  return useThree((s) => s.camera) as THREE.PerspectiveCamera;
}

const PersonView: React.FC<{ p: Person; t: HundredTimes; tex: Tex }> = ({ p, t, tex }) => {
  const frame = useCurrentFrame();
  const appearAt = t.appear + p.appear * 34;
  const appear = interpolate(frame - appearAt, [0, 7, 11], [0, 1.18, 1], clamp);
  if (appear <= 0) return null;

  const wf = winFrame(p, t);
  const sf = sadFrame(p, t);
  const endFrame = p.win ? wf : loseStopFrame(p, t);
  const won = p.win && frame >= wf;
  const sad = !p.win && frame >= sf;

  // 100人→ハズレ37人に寄る
  const k = easeInOut(interpolate(frame, [t.focus + 6, t.focus + 40], [0, 1], clamp));
  const leave = p.win ? easeOut(interpolate(frame, [t.focus, t.focus + 16], [0, 1], clamp)) : 0;
  let x = p.x;
  let z = p.z;
  if (!p.win && p.cluster) {
    x = p.x + (p.cluster.x - p.x) * k;
    z = p.z + (p.cluster.z - p.z) * k;
  }
  const scale = appear * (1 - leave);
  if (scale <= 0.001) return null;

  // 当たった人のジャンプ
  const since = frame - wf;
  const hop = won ? Math.abs(Math.sin(since * 0.26 + p.phase * 0.2)) * (since < 60 ? 0.42 : 0.2) : 0;
  const sadSince = frame - sf;
  const sadDrop = sad ? interpolate(sadSince, [0, 6, 12], [0.18, -0.03, 0], clamp) : 0;
  const idle = !won && !sad ? Math.sin(frame / 9 + p.phase) * 0.03 : 0;

  const spriteTex = won ? tex.jump : sad ? tex.sad : tex.stand;
  const padColor = won ? GACHA.gold : sad ? "#C9C9D1" : "#EFE3C4";
  const padPulse = won ? 1 + 0.35 * Math.max(0, 1 - since / 14) : 1;

  // カプセル（頭の上でポンポン開く）
  const capsule = capsuleState(frame, p, t, endFrame);
  const glowOpacity = won ? 0.42 * Math.max(0.3, 1 - since / 30) : 0;

  return (
    <group position={[x, 0, z]} scale={scale}>
      {/* 床の丸（ink縁＋色） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} scale={[padPulse, padPulse, 1]}>
        <circleGeometry args={[0.4, 28]} />
        <meshBasicMaterial color={POP.ink} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} scale={[padPulse, padPulse, 1]}>
        <circleGeometry args={[0.34, 28]} />
        <meshBasicMaterial color={padColor} />
      </mesh>
      {won ? (
        <sprite position={[0, 0.6 + hop, -0.2]} scale={[1.9, 1.9, 1]}>
          <spriteMaterial map={getGlow()} blending={THREE.AdditiveBlending} transparent opacity={glowOpacity} depthWrite={false} toneMapped={false} />
        </sprite>
      ) : null}
      <sprite position={[0, hop + sadDrop + idle, 0]} scale={[SIZE, SIZE, 1]} center={new THREE.Vector2(0.5, FEET)}>
        <spriteMaterial map={spriteTex} transparent depthWrite={false} toneMapped={false} />
      </sprite>
      {capsule ? (
        <group position={[0.0, HEAD + 0.36 + capsule.rise, 0.2]} scale={capsule.scale} rotation={[0, 0, capsule.wobble]}>
          <Capsule r={0.22} kind={capsule.kind} open={capsule.open} glow={capsule.kind === "gold" ? 0.6 : 0} />
          {capsule.prize > 0 ? (
            <mesh position={[0, 0.2 + capsule.prize * 0.55, 0]} scale={0.2 * (1 - capsule.prize * 0.5)}>
              <sphereGeometry args={[1, 12, 8]} />
              <meshBasicMaterial color={capsule.kind === "gold" ? GACHA.gold : GACHA.miss} transparent opacity={1 - capsule.prize * 0.9} />
            </mesh>
          ) : null}
          {capsule.burst > 0 ? <Burst t={capsule.burst} radius={0.8} size={0.08} /> : null}
        </group>
      ) : null}
    </group>
  );
};

type CapsuleState = {
  kind: "blue" | "gold";
  scale: number;
  open: number;
  rise: number;
  wobble: number;
  prize: number;
  burst: number;
};

/** その人の頭の上のカプセルの状態。最後の1個が endFrame に開くよう、後ろから周期を数える。 */
const capsuleState = (
  frame: number,
  p: Person,
  t: HundredTimes,
  endFrame: number,
): CapsuleState | null => {
  if (frame < t.start) return null;
  const x = (endFrame - frame) / CYCLE;
  const j = Math.ceil(x - 0.6);
  const openFrame = endFrame - j * CYCLE;
  // 最初の周期は「よーい、スタート！」のあとに始まる（人ごとに少しずつずらす）
  const firstStart = t.start + 4 + Math.floor(p.rand * CYCLE);
  const final = j <= 0 && p.win;
  if (j < 0 && !final) return null;
  if (openFrame - 0.6 * CYCLE < firstStart && j > 0) return null;
  const u = (frame - openFrame) / CYCLE; // -0.6〜0.4（最後の当たりは 〜1.0 まで）
  const last = final ? 0.7 : 0.4;
  if (u >= last) return null;
  const gold = final;
  const scale = interpolate(u, [-0.6, -0.4, last - 0.15, last], [0, 1, 1, final ? 1 : 0], clamp);
  const open = interpolate(u, [-0.05, 0.22], [0, 1], clamp);
  const wobble = u > -0.4 && u < -0.05 ? Math.sin(u * 90) * 0.28 * (1 - Math.abs(u + 0.22) * 3) : 0;
  return {
    kind: gold ? "gold" : "blue",
    scale: Math.max(0.001, scale) * (gold && u > 0 ? 1 + Math.sin(Math.min(1, u * 3) * Math.PI) * 0.18 : 1),
    open,
    rise: interpolate(u, [-0.6, -0.4], [-0.4, 0], clamp) + (gold ? interpolate(u, [0, 0.4], [0, 0.35], clamp) : 0),
    wobble,
    prize: interpolate(u, [0, 0.4], [0, 1], clamp) * (u >= 0 ? 1 : 0),
    burst: gold ? interpolate(u, [0, 0.5], [0, 1], clamp) * (u > 0 ? 1 : 0) : 0,
  };
};

export const HundredScene: React.FC<{ times: HundredTimes }> = ({ times }) => {
  const tex = useTextures(
    useMemo(
      () => ({
        stand: "photo/math-guide/chibi-stand.png",
        jump: "photo/math-guide/chibi-jump.png",
        sad: "photo/math-guide/chibi-sit-sad.png",
      }),
      [],
    ),
  );
  return (
    <ThreeCanvas
      width={1920}
      height={1080}
      flat
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      camera={{ fov: 35, position: [0, 11.8, 14.6], near: 0.1, far: 80 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ToonLights />
      <CameraRig t={times} />
      {tex
        ? PEOPLE.map((p) => <PersonView key={p.index} p={p} t={times} tex={tex} />)
        : null}
    </ThreeCanvas>
  );
};
