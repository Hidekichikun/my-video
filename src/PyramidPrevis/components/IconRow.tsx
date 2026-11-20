import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, GOTHIC, MINCHO } from "../theme";

export type IconItem = {
  /** 丸の中に出す1〜2文字（例：「石」「船」） */
  glyph: string;
  label: string;
  /** 班分けの番号。groupAt 以降、同じ番号どうしが寄る */
  group?: number;
};

export type IconRowProps = {
  items: IconItem[];
  /** 1つずつ出す間隔（フレーム） */
  stagger?: number;
  /** このフレームから group ごとに寄せる。指定なしなら寄せない */
  groupAt?: number;
  /** 縦の位置（アイコンの中心） */
  y?: number;
  dark?: boolean;
};

/** アイコンを横に1つずつ並べる。職業、カーとバー、配給の流れなどに使う */
export const IconRow: React.FC<IconRowProps> = ({
  items,
  stagger = 8,
  groupAt,
  y = 470,
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gap = Math.min(300, 1600 / Math.max(1, items.length));
  const groups = [...new Set(items.map((i) => i.group ?? 0))];
  const g =
    groupAt === undefined
      ? 0
      : spring({ frame: frame - groupAt, fps, config: { damping: 200 } });
  const text = dark ? COLORS.limestone : COLORS.ink;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {items.map((item, i) => {
        const appear = spring({
          frame: frame - i * stagger,
          fps,
          config: { damping: 14 },
        });
        const baseX = 960 + (i - (items.length - 1) / 2) * gap;
        const groupIndex = groups.indexOf(item.group ?? 0);
        const members = items.filter(
          (it) => (it.group ?? 0) === (item.group ?? 0),
        );
        const k = members.indexOf(item);
        const groupX =
          960 +
          (groupIndex - (groups.length - 1) / 2) * 560 +
          (k - (members.length - 1) / 2) * 150;
        const x = baseX + (groupX - baseX) * g;
        return (
          <div
            key={item.label}
            style={{
              position: "absolute",
              left: x - 110,
              top: y - 110,
              width: 220,
              textAlign: "center",
              opacity: interpolate(appear, [0, 1], [0, 1]),
              transform: `translateY(${(1 - appear) * 30}px)`,
            }}
          >
            <div
              style={{
                width: 150,
                height: 150,
                margin: "0 auto",
                borderRadius: "50%",
                background: dark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.75)",
                border: `4px solid ${COLORS.gold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: MINCHO,
                fontWeight: 800,
                fontSize: item.glyph.length > 1 ? 52 : 72,
                color: text,
              }}
            >
              {item.glyph}
            </div>
            <div
              style={{
                marginTop: 14,
                fontFamily: GOTHIC,
                fontWeight: 700,
                fontSize: 34,
                color: text,
              }}
            >
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
