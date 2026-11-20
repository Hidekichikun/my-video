import React from "react";
import { useCurrentFrame } from "remotion";

const riverFiles = new Set(["01-nile-fields.png", "05-boat-stone.png", "09-solar-boat.png"]);
const dustFiles = new Set(["06-grand-gallery.png", "06-kings-chamber.png", "08-tomb-light.png"]);
const dawnFiles = new Set(["00-dawn-giza.png", "04-horizon-sunrise.png", "10-horizon.png"]);

/** Small illustrated light/water accents; buildings, people and historical objects stay still. */
export const Atmosphere: React.FC<{ file: string }> = ({ file }) => {
  const frame = useCurrentFrame();
  if (!riverFiles.has(file) && !dustFiles.has(file) && !dawnFiles.has(file)) return null;
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {dawnFiles.has(file) ? <ellipse cx={360 + Math.sin(frame / 150) * 100} cy={170}
        rx={460} ry={145} fill="#FFDEAA" opacity={0.025 + (Math.sin(frame / 40) + 1) * 0.014} /> : null}
      {riverFiles.has(file) ? Array.from({ length: 9 }, (_, i) => {
        const cargo = file === "05-boat-stone.png";
        const solar = file === "09-solar-boat.png";
        const y = cargo || solar ? 855 + i * 16 : 407 + i * 9;
        const x = cargo || solar ? 120 + i * 185 : 1120 + i * 80;
        return <path key={i} d={`M ${x + Math.sin(frame / 38 + i) * 12} ${y} q 20 -3 40 0 t 40 0`}
          stroke="#FFF4C9" strokeWidth={2.5} strokeLinecap="round" fill="none"
          opacity={0.05 + (Math.sin(frame / 18 + i * 1.7) + 1) * 0.06} />;
      }) : null}
      {dustFiles.has(file) ? Array.from({ length: 12 }, (_, i) => {
        const x = 270 + ((i * 127) % 1300) + Math.sin(frame / 70 + i) * 13;
        const y = 180 + ((i * 53 + frame * 0.25) % 510);
        return <circle key={i} cx={x} cy={y} r={1.5 + (i % 3) * 0.6} fill="#FFECC9"
          opacity={0.08 + (Math.sin(frame / 30 + i) + 1) * 0.09} />;
      }) : null}
    </svg>
  );
};
