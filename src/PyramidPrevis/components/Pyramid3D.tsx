import React from "react";
import { useCurrentFrame } from "remotion";
import { BENT_SHAPE } from "../../Pyramid/data/facts";
import { type Face, frustum, projectFaces, toPoints } from "../lib/three";
import { COLORS } from "../theme";

export type Pyramid3DShape = "mastaba" | "step" | "meidum" | "bent" | "true";

export type Pyramid3DProps = {
  shape: Pyramid3DShape;
  /** 高さ（m）。比較のため実寸で渡す。既定はクフ */
  heightM?: number;
  /** 底辺の一辺（m） */
  baseM?: number;
  /** 表面："now" は茶色い段々、"then" は白くなめらかな完成時 */
  surface?: "now" | "then";
  /** 0〜1：下から積み上がる途中を見せる（1で完成） */
  build?: number;
  /** step：見せる段の数（1〜6）。mastaba → step の積み上げに使う */
  steps?: number;
  /** meidum：外側の石が足される途中（0〜1） */
  casing?: number;
  /** 頂上の欠けた高さ（m）。クフの現在の姿なら 146.5 - 138 = 8.5 */
  missingTopM?: number;
  /** 頂上付近だけ白い外装が残る（カフラー） */
  whiteCapM?: number;
  /** 下の部分が花崗岩（メンカウラー） */
  graniteLowerM?: number;
  /** カメラ：水平の角度（度）。spin を足すと毎秒その分だけ回る */
  azimuth?: number;
  spin?: number;
  /** カメラ：見下ろす角度（度）。2〜5で地面に近い目線、30以上で空から */
  elevation?: number;
  /** カメラの距離（底辺の何倍か） */
  distance?: number;
  /** 描く中心（画面の座標） */
  center?: [number, number];
  /** 背景を描くか。false なら透明 */
  background?: boolean;
};

const STEP_TIERS = 6;

/** 表面が "now" のとき、水平の段の線を描く */
const bands = (
  heightM: number,
  half0: number,
  topY: number,
  count: number,
): Face[] => {
  const faces: Face[] = [];
  for (let i = 1; i < count; i++) {
    const y = (heightM * i) / count;
    if (y >= topY) break;
    const h = half0 * (1 - y / heightM);
    faces.push(
      ...frustum(y, y + heightM * 0.006, h + 0.4, h + 0.1, "#8E6A43", {
        top: false,
      }),
    );
  }
  return faces;
};

/** body：本体。overlay：本体の上に重ねて描く段の線 */
export const buildPyramidFaces = (
  props: Pyramid3DProps,
): { body: Face[]; overlay: Face[] } => {
  const {
    shape,
    heightM = 146.5,
    baseM = 230.3,
    surface = "then",
    build = 1,
    steps = STEP_TIERS,
    casing = 1,
    missingTopM = 0,
    whiteCapM = 0,
    graniteLowerM = 0,
  } = props;
  const half = baseM / 2;
  const color = surface === "now" ? COLORS.core : COLORS.limestone;
  const topCut = Math.min(
    heightM - missingTopM,
    heightM * Math.max(0.02, build),
  );
  const at = (y: number) => half * (1 - y / heightM);
  const faces: Face[] = [];

  if (shape === "mastaba") {
    const h = heightM * 0.18;
    faces.push(
      ...frustum(0, h, half * 0.95, half * 0.85, COLORS.sand, { top: true }),
    );
    return { body: faces, overlay: [] };
  }

  if (shape === "step" || shape === "meidum") {
    const tiers =
      shape === "step" ? Math.max(1, Math.min(STEP_TIERS, steps)) : 7;
    const tierH = heightM / (shape === "step" ? STEP_TIERS : 7);
    for (let i = 0; i < tiers; i++) {
      const y0 = i * tierH;
      if (y0 >= topCut) break;
      const y1 = Math.min(topCut, y0 + tierH);
      const w0 = half * (1 - i / (shape === "step" ? STEP_TIERS : 7)) * 0.98;
      faces.push(
        ...frustum(
          y0,
          y1,
          w0,
          w0 * 0.96,
          shape === "step" ? COLORS.sand : COLORS.core,
        ),
      );
    }
    if (shape === "meidum" && casing > 0) {
      const y1 = heightM * casing;
      faces.push(
        ...frustum(0, y1, half * 1.02, at(y1) * 1.02, COLORS.limestone, {
          opacity: 0.35 + 0.6 * casing,
        }),
      );
    }
    return { body: faces, overlay: [] };
  }

  if (shape === "bent") {
    const lowerH = (BENT_SHAPE.lowerHeightM / 105) * heightM;
    const lowerTan = Math.tan((BENT_SHAPE.lowerAngleDeg * Math.PI) / 180);
    const midHalf = half - lowerH / lowerTan;
    const y1 = Math.min(topCut, lowerH);
    faces.push(
      ...frustum(0, y1, half, half - y1 / lowerTan, color, {
        top: topCut <= lowerH,
      }),
    );
    if (topCut > lowerH) {
      const upperH = heightM - lowerH;
      const y2 = Math.min(topCut, heightM);
      const h2 = midHalf * (1 - (y2 - lowerH) / upperH);
      faces.push(...frustum(lowerH, y2, midHalf, h2, color));
    }
    return { body: faces, overlay: [] };
  }

  // 真正ピラミッド
  if (graniteLowerM > 0) {
    const g = Math.min(graniteLowerM, topCut);
    faces.push(...frustum(0, g, half, at(g), COLORS.granite, { top: false }));
    faces.push(...frustum(g, topCut, at(g), at(topCut), color));
  } else if (whiteCapM > 0 && surface === "now") {
    const capStart = heightM - whiteCapM;
    faces.push(
      ...frustum(
        0,
        Math.min(capStart, topCut),
        half,
        at(Math.min(capStart, topCut)),
        color,
        { top: false },
      ),
    );
    if (topCut > capStart)
      faces.push(
        ...frustum(
          capStart,
          topCut,
          at(capStart),
          at(topCut),
          COLORS.limestone,
        ),
      );
  } else {
    faces.push(...frustum(0, topCut, half, at(topCut), color));
  }
  const overlay =
    surface === "now"
      ? bands(heightM, half, Math.min(topCut, heightM - whiteCapM), 24)
      : [];
  return { body: faces, overlay };
};

/**
 * 簡易3Dのピラミッド。形・表面・カメラを引数で変える。
 * 例：<Pyramid3D shape="true" surface="now" missingTopM={8.5} elevation={-8} />
 */
export const Pyramid3D: React.FC<Pyramid3DProps> = (props) => {
  const frame = useCurrentFrame();
  const {
    baseM = 230.3,
    heightM = 146.5,
    azimuth = 35,
    spin = 0,
    elevation = 18,
    distance = 2.4,
    center,
    background = true,
  } = props;
  const { body, overlay } = buildPyramidFaces(props);
  const camera = {
    target: [0, heightM * 0.38, 0] as [number, number, number],
    azimuth: azimuth + (spin * frame) / 30,
    elevation,
    distance: baseM * distance,
    focal: 1300,
    center: center ?? ([960, 520] as [number, number]),
  };
  const projected = [
    ...projectFaces(body, camera),
    ...projectFaces(overlay, camera),
  ];
  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0 }}
    >
      {background ? (
        <>
          <rect width={1920} height={1080} fill="#D9C9A3" />
          <rect width={1920} height={560} fill="#EFE4CB" />
        </>
      ) : null}
      {projected.map((f, i) => (
        <polygon
          key={i}
          points={toPoints(f.screen)}
          fill={f.fill}
          fillOpacity={f.opacity ?? 1}
          stroke={f.fill}
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
};
