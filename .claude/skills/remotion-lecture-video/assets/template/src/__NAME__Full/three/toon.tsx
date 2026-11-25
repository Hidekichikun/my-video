// 3D共通部品：トゥーン陰影（MeshToonMaterial）＋輪郭線（裏面を少し拡大して ink で塗る）。
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { continueRender, delayRender, staticFile } from "remotion";
import { GACHA, POP } from "../theme";

/** 3段階のトゥーン陰影用グラデーション */
let gradient: THREE.DataTexture | null = null;
export const toonGradient = () => {
  if (!gradient) {
    gradient = new THREE.DataTexture(
      new Uint8Array([120, 190, 255]),
      3,
      1,
      THREE.RedFormat,
    );
    gradient.minFilter = THREE.NearestFilter;
    gradient.magFilter = THREE.NearestFilter;
    gradient.needsUpdate = true;
  }
  return gradient;
};

export const ToonMat: React.FC<{
  color: string;
  opacity?: number;
  emissive?: string;
  emissiveIntensity?: number;
  side?: THREE.Side;
}> = ({ color, opacity = 1, emissive, emissiveIntensity = 0, side }) => (
  <meshToonMaterial
    color={color}
    gradientMap={toonGradient()}
    transparent={opacity < 1}
    opacity={opacity}
    emissive={emissive ?? "#000000"}
    emissiveIntensity={emissiveIntensity}
    side={side ?? THREE.FrontSide}
  />
);

/** 輪郭線付きのメッシュ。geometry は呼び出し側で useMemo して渡す。 */
export const ToonPart: React.FC<{
  geometry: THREE.BufferGeometry;
  color: string;
  outline?: number;
  opacity?: number;
  emissive?: string;
  emissiveIntensity?: number;
  doubleSided?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}> = ({
  geometry,
  color,
  outline = 0.07,
  opacity = 1,
  emissive,
  emissiveIntensity,
  doubleSided,
  position,
  rotation,
  scale = 1,
}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh geometry={geometry}>
      <ToonMat
        color={color}
        opacity={opacity}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
      />
    </mesh>
    {outline > 0 ? (
      <mesh geometry={geometry} scale={1 + outline}>
        <meshBasicMaterial color={POP.ink} side={THREE.BackSide} transparent={opacity < 1} opacity={opacity} />
      </mesh>
    ) : null}
  </group>
);

/** 標準のライト（トゥーンの陰影が出る向き） */
export const ToonLights: React.FC = () => (
  <>
    <ambientLight intensity={1.15} />
    <directionalLight position={[4, 9, 7]} intensity={2.1} />
  </>
);

/* ------------------------------------------------------------------ */
/* 乱数（毎回同じ結果になるよう seed 固定）                             */
/* ------------------------------------------------------------------ */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/* ------------------------------------------------------------------ */
/* テクスチャ読み込み（レンダー前に完了させる）                         */
/* ------------------------------------------------------------------ */
const cache = new Map<string, THREE.Texture>();
export const useTextures = (files: Record<string, string>) => {
  const key = JSON.stringify(files);
  const [textures, setTextures] = useState<Record<string, THREE.Texture> | null>(null);
  useEffect(() => {
    const handle = delayRender(`textures ${key.slice(0, 60)}`);
    const loader = new THREE.TextureLoader();
    const entries = Object.entries(files);
    Promise.all(
      entries.map(
        ([name, path]) =>
          new Promise<[string, THREE.Texture]>((resolve, reject) => {
            const hit = cache.get(path);
            if (hit) return resolve([name, hit]);
            loader.load(
              staticFile(path),
              (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                tex.anisotropy = 4;
                cache.set(path, tex);
                resolve([name, tex]);
              },
              undefined,
              reject,
            );
          }),
      ),
    )
      .then((list) => {
        setTextures(Object.fromEntries(list));
        continueRender(handle);
      })
      .catch((e) => {
        console.error("texture load failed", e);
        continueRender(handle);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return textures;
};

/* ------------------------------------------------------------------ */
/* カプセル                                                            */
/* ------------------------------------------------------------------ */
const useHemispheres = (r: number) =>
  useMemo(() => {
    const top = new THREE.SphereGeometry(r, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);
    const bottom = new THREE.SphereGeometry(r, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const cap = new THREE.CircleGeometry(r * 0.985, 28);
    cap.rotateX(-Math.PI / 2);
    return { top, bottom, cap };
  }, [r]);

export type CapsuleKind = "blue" | "gold" | "miss";
const KIND_COLORS: Record<CapsuleKind, [string, string]> = {
  blue: [GACHA.capsuleTop, GACHA.capsuleBottom],
  gold: [GACHA.gold, "#FFF3C2"],
  miss: [GACHA.miss, "#E4E4EA"],
};

/**
 * カプセル1個。open: 0=閉じている → 1=ぱかっと開く。
 * 開くと上の半分が跳ね上がり、下の半分が傾く。
 */
export const Capsule: React.FC<{
  r?: number;
  kind?: CapsuleKind;
  open?: number;
  outline?: number;
  glow?: number;
}> = ({ r = 0.5, kind = "blue", open = 0, outline = 0.09, glow = 0 }) => {
  const { top, bottom, cap } = useHemispheres(r);
  const [c1, c2] = KIND_COLORS[kind];
  const o = Math.min(1, Math.max(0, open));
  return (
    <group>
      <group
        position={[-0.55 * r * o, 0.95 * r * o, 0]}
        rotation={[0, 0, 0.9 * o]}
      >
        <ToonPart
          geometry={top}
          color={c1}
          outline={outline}
          doubleSided
          emissive={c1}
          emissiveIntensity={glow}
        />
      </group>
      <group position={[0.3 * r * o, -0.25 * r * o, 0]} rotation={[0, 0, -0.45 * o]}>
        <ToonPart
          geometry={bottom}
          color={c2}
          outline={outline}
          doubleSided
          emissive={kind === "gold" ? c1 : undefined}
          emissiveIntensity={glow * 0.5}
        />
        <mesh geometry={cap}>
          <ToonMat color={kind === "miss" ? "#CFCFD6" : "#E4E9F1"} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};

/** 星形の光（金色の当たり演出）：放射状に飛ぶ小さなひし形 */
export const Burst: React.FC<{
  t: number; // 0〜1
  color?: string;
  radius?: number;
  count?: number;
  size?: number;
}> = ({ t, color = GACHA.gold, radius = 1.4, count = 8, size = 0.11 }) => {
  const geo = useMemo(() => new THREE.OctahedronGeometry(1, 0), []);
  if (t <= 0 || t >= 1) return null;
  const ease = 1 - Math.pow(1 - t, 3);
  const s = size * (1 - t * 0.7);
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return (
          <mesh
            key={i}
            geometry={geo}
            position={[Math.cos(a) * radius * ease, Math.sin(a) * radius * ease, 0.2]}
            rotation={[0, 0, a]}
            scale={[s * 1.6, s * 0.7, s]}
          >
            <meshBasicMaterial color={i % 2 ? POP.white : color} />
          </mesh>
        );
      })}
    </group>
  );
};
