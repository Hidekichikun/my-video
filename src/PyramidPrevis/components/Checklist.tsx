import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, GOTHIC, MINCHO } from "../theme";

export type ChecklistProps = {
  title?: string;
  items: string[];
  /** 何番目までチェックを入れるか */
  checkedCount: number;
  /** checkedCount 番目のチェックを入れたフレーム。これ以前のチェックは最初から入っている */
  checkedAt?: number;
};

/** VRで見るポイントのチェックリスト */
export const Checklist: React.FC<ChecklistProps> = ({
  title = "VRで見るポイント",
  items,
  checkedCount,
  checkedAt = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: COLORS.night,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 1200,
          display: "flex",
          flexDirection: "column",
          gap: 26,
          marginTop: -60,
        }}
      >
        <div
          style={{
            fontFamily: MINCHO,
            fontWeight: 800,
            fontSize: 64,
            color: COLORS.gold,
            marginBottom: 12,
          }}
        >
          {title}
        </div>
        {items.map((item, i) => {
          const checked = i < checkedCount;
          const isNew = i === checkedCount - 1;
          const s = checked
            ? isNew
              ? spring({
                  frame: frame - checkedAt,
                  fps,
                  config: { damping: 12 },
                })
              : 1
            : 0;
          return (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                fontFamily: GOTHIC,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  border: `4px solid ${COLORS.limestone}`,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    color: COLORS.gold,
                    fontSize: 52,
                    fontWeight: 700,
                    transform: `scale(${s})`,
                    lineHeight: 1,
                  }}
                >
                  ✓
                </span>
              </div>
              <div
                style={{
                  fontSize: 46,
                  fontWeight: 700,
                  color: checked ? COLORS.limestone : "#8A8F9A",
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
