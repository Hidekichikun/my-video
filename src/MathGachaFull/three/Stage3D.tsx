// 3Dシーンの土台：カメラ位置・視野・画面上のずらし（offset）を props で渡す。
import React from "react";
import * as THREE from "three";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { ToonLights } from "./toon";

export type Cam = {
  fov: number;
  position: [number, number, number];
  lookAt: [number, number, number];
  /** 画面を右へずらす量(px)。正で右 */
  shiftX?: number;
  /** 画面を下へずらす量(px)。正で下 */
  shiftY?: number;
};

const applyCam = (camera: THREE.PerspectiveCamera, c: Cam) => {
  camera.position.set(...c.position);
  camera.lookAt(...c.lookAt);
  camera.fov = c.fov;
  camera.setViewOffset(1920, 1080, -(c.shiftX ?? 0), -(c.shiftY ?? 0), 1920, 1080);
  camera.updateProjectionMatrix();
};

const Rig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  applyCam(camera, cam);
  return null;
};

export const Stage3D: React.FC<{
  cam: Cam;
  opacity?: number;
  children: React.ReactNode;
}> = ({ cam, opacity = 1, children }) => (
  <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
    <ThreeCanvas
      width={1920}
      height={1080}
      flat
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      camera={{ fov: cam.fov, position: cam.position, near: 0.1, far: 100 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ToonLights />
      <Rig cam={cam} />
      {children}
    </ThreeCanvas>
  </AbsoluteFill>
);

/** ワールド座標 → 画面のピクセル（Stage3D と同じカメラで計算） */
export const project = (world: [number, number, number], c: Cam) => {
  const cam = new THREE.PerspectiveCamera(c.fov, 16 / 9, 0.1, 100);
  applyCam(cam, c);
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...world).project(cam);
  return { x: ((v.x + 1) / 2) * 1920, y: ((1 - v.y) / 2) * 1080 };
};
