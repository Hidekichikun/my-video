import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { illustrationPath } from "../Pyramid2/data/scenes";
import {
  POP,
  POP_BODY,
  POP_HEADING,
  popScale,
  type PopLabelKind,
} from "./pop-theme";
import {
  PopArrow,
  PopBadge,
  PopCard,
  PopEvidence,
  PopIcons,
  PopLatePeriod,
  PopMeaning,
  PopQuestion,
} from "./pop/Parts";

export const Panel: React.FC<{
  children: React.ReactNode;
  top?: number;
  dark?: boolean;
  width?: number;
  center?: number;
  mincho?: boolean;
  size?: number;
}> = ({
  children,
  top = 180,
  width = 1260,
  center = 960,
  mincho = false,
  size = 48,
}) => {
  if (
    mincho &&
    typeof children === "string" &&
    (size >= 76 || children.includes("何を") || children.includes("なぜここ"))
  )
    return (
      <PopQuestion
        text={children}
        top={top}
        size={children.length > 16 ? 96 : 110}
      />
    );
  return (
    <PopCard
      style={{
        position: "absolute",
        top,
        left: center - width / 2,
        width,
        fontSize: size,
        lineHeight: 1.5,
        padding: "22px 30px",
        textAlign: "center",
        fontFamily: mincho ? POP_HEADING : POP_BODY,
        fontWeight: mincho ? 400 : 800,
      }}
    >
      {children}
    </PopCard>
  );
};
export const Note: React.FC<{ text: string; top?: number }> = ({
  text,
  top = 230,
}) => (
  <div
    style={{
      position: "absolute",
      left: 310,
      top,
      width: 1300,
      textAlign: "center",
    }}
  >
    <PopBadge tone="note" size={36} angle={1} style={{ maxWidth: 1300 }}>
      {text}
    </PopBadge>
  </div>
);
export const Heading: React.FC<{
  text: string;
  top?: number;
  size?: number;
}> = ({ text, top = 225, size = 56 }) => {
  const parts = text.split(/＝| → /);
  if (parts.length === 2 && parts[0].length > 0)
    return <PopMeaning term={parts[0]} meaning={parts[1]} top={top} />;
  return (
    <div
      style={{
        position: "absolute",
        left: 310,
        top,
        width: 1300,
        textAlign: "center",
      }}
    >
      <PopBadge
        size={Math.max(48, size)}
        tone={
          text.includes("不明")
            ? "note"
            : text.startsWith("＝")
              ? "meaning"
              : "term"
        }
        style={{ maxWidth: 1260, whiteSpace: "normal" }}
      >
        {text}
      </PopBadge>
    </div>
  );
};
export const Evidence: React.FC<{
  kind: PopLabelKind;
  subject: string;
  y?: number;
}> = ({ kind, subject, y = 255 }) => (
  <PopEvidence kind={kind} subject={subject} top={y} />
);
const INTRO_FILES = ["01-nile-fields", "01-king-gods", "03-ka-offering"];
const PEOPLE_FILES = [
  "05-hemiunu",
  "05-boat-stone",
  "05-scribe",
  "01-bakery-brewery",
  "05-hetepheres-furniture",
];
export const Icons: React.FC<{
  labels: string[];
  dark?: boolean;
  glyphs?: string[];
  glow?: boolean;
  visibleCount?: number;
}> = ({ labels, glyphs, glow = false, visibleCount = labels.length }) => (
  <PopIcons
    items={labels.map((label, i) => ({
      label,
      file:
        labels.length === 5
          ? PEOPLE_FILES[i]
          : labels[0] === "ナイルの暮らし"
            ? INTRO_FILES[i]
            : undefined,
      word:
        labels.length === 3
          ? ({
              太陽が昇る: "太陽",
              川が増水する: "増水",
              社会が乱れない: "秩序",
              受け取る: "受取",
              記録する: "記録",
              呼吸する: "呼吸",
            }[label] ?? label)
          : glyphs?.[i],
    }))}
    revealAt={
      labels[0] !== "ナイルの暮らし"
        ? undefined
        : labels.map((_, i) =>
            i < visibleCount
              ? i === visibleCount - 1 && !glow
                ? 0
                : -30
              : 100000,
          )
    }
    glowAt={glow ? 0 : undefined}
  />
);
const CARD_MEANING_ROWS: Record<string, string[]> = {
  生命を支える力: ["生命を", "支える力"],
  "その人らしさ・動く力": ["その人らしさ", "・動く力"],
  儀式を経た死後の姿: ["儀式を経た", "死後の姿"],
};
export const Cards: React.FC<{
  items: { title: string; text?: string; file?: string }[];
  active?: number;
  top?: number;
  dark?: boolean;
  columns?: number;
}> = ({ items, active = items.length, top, columns }) => {
  const four = items.length === 4;
  const photos = items.every((item) => !!item.file);
  const count = columns ?? (four ? 2 : items.length);
  return (
    <div
      style={{
        position: "absolute",
        left: 300,
        top: top ?? (four ? (photos ? 230 : 240) : 300),
        width: 1320,
        display: "grid",
        gridTemplateColumns: `repeat(${count},minmax(0,1fr))`,
        gap: 24,
      }}
    >
      {items.map((item, i) => (
        <PopCard
          key={item.title + i}
          style={{
            padding: four ? 14 : 24,
            textAlign: "center",
            opacity: i < active ? 1 : 0.3,
            height: four ? (photos ? 280 : 210) : 390,
            display: "flex",
            flexDirection: photos ? "row" : "column",
            alignItems: "center",
            justifyContent: "center",
            gap: four ? 14 : 24,
          }}
        >
          {item.file ? (
            <Img
              src={staticFile(illustrationPath(item.file))}
              style={{
                width: 232,
                height: 232,
                flexShrink: 0,
                objectFit: "cover",
                borderRadius: 18,
                border: `6px solid ${POP.ink}`,
                boxSizing: "border-box",
              }}
            />
          ) : null}
          <PopBadge
            size={photos ? 56 : four ? 48 : 64}
            angle={i % 2 ? 2 : -2}
            delay={i * 6}
            style={{
              padding: four ? "6px 12px" : "12px 16px",
              lineHeight: 1.12,
              maxWidth: "100%",
              flexShrink: 0,
            }}
          >
            {item.title}
          </PopBadge>
          {item.text ? (
            <PopBadge
              tone="meaning"
              size={four ? 44 : 48}
              angle={0}
              delay={i * 6 + 6}
              style={{
                display: "flex",
                padding: four ? "6px 12px" : "12px 14px",
                lineHeight: four ? 1.2 : 1.5,
                maxWidth: "100%",
                alignSelf: "stretch",
                flex: four ? undefined : 1,
              }}
            >
              <span>
                {(CARD_MEANING_ROWS[item.text] ?? [item.text]).map((row, j) => (
                  <React.Fragment key={row}>
                    {j ? <br /> : null}
                    {row}
                  </React.Fragment>
                ))}
              </span>
            </PopBadge>
          ) : null}
        </PopCard>
      ))}
    </div>
  );
};
export const Gods: React.FC = () => (
  <Cards
    items={[
      { title: "ラー", file: "07-ra" },
      { title: "ホルス", file: "07-horus" },
      { title: "アヌビス", file: "07-anubis" },
      { title: "バステト", file: "07-bastet" },
    ]}
  />
);
export const FloodScale: React.FC = () => (
  <PopCard
    style={{
      position: "absolute",
      left: 600,
      top: 235,
      width: 720,
      padding: 28,
    }}
  >
    {[
      { label: "多すぎ", color: POP.pink },
      { label: "ちょうどいい", color: POP.green },
      { label: "少なすぎ", color: POP.cyan },
    ].map(({ label, color }) => (
      <div
        key={label}
        style={{
          display: "flex",
          alignItems: "center",
          height: 115,
          gap: 35,
          fontFamily: POP_HEADING,
          fontWeight: 400,
          fontSize: 48,
        }}
      >
        <div
          style={{
            width: 80,
            height: 110,
            background: color,
            border: `6px solid ${POP.ink}`,
            boxSizing: "border-box",
          }}
        />
        {label}
      </div>
    ))}
  </PopCard>
);
export const KingTriangle: React.FC = () => (
  <svg
    data-pyramid2-overlay
    width={1920}
    height={1080}
    style={{ position: "absolute" }}
  >
    <path
      d="M 960 225 L 600 670 L 1320 670 Z"
      fill={POP.cream}
      stroke={POP.ink}
      strokeWidth={6}
    />
    <path d="M 960 310 L 960 590" stroke={POP.ink} strokeWidth={6} />
    {[
      { t: "神々", y: 290, c: POP.yellow },
      { t: "王", y: 465, c: POP.cyan },
      { t: "人々", y: 640, c: POP.pink },
    ].map(({ t, y, c }) => (
      <g key={t}>
        <rect
          x={840}
          y={y - 62}
          width={240}
          height={90}
          rx={22}
          fill={c}
          stroke={POP.ink}
          strokeWidth={6}
        />
        <text
          x={960}
          y={y}
          fill={POP.ink}
          fontFamily={POP_HEADING}
          fontSize={56}
          textAnchor="middle"
        >
          {t}
        </text>
      </g>
    ))}
  </svg>
);
export const TombCards: React.FC<{ reveal?: boolean }> = ({
  reveal = false,
}) => (
  <Cards
    items={
      reveal
        ? [
            { title: "供物", text: "養う" },
            { title: "偽扉", text: "つなぐ" },
            { title: "像とセルダブ", text: "存在を保つ" },
            { title: "供物リスト", text: "永遠に届ける" },
          ]
        : Array.from({ length: 4 }, (_, i) => ({
            title: "？",
            text: ["①", "②", "③", "④"][i],
          }))
    }
  />
);
export const TemplePlan: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 330,
      top: 330,
      width: 1260,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    }}
  >
    {["河岸神殿", "参道", "葬祭殿", "ピラミッド"].map((t, i) => (
      <React.Fragment key={t}>
        {i > 0 ? <PopArrow width={65} height={65} /> : null}
        <PopBadge size={42} delay={i * 6} style={{ padding: "18px 15px" }}>
          {t}
        </PopBadge>
      </React.Fragment>
    ))}
  </div>
);
export const LatePeriod: React.FC<{ strike?: boolean }> = ({
  strike = false,
}) => (
  <>
    <PopLatePeriod />
    {strike ? (
      <Heading text="クフの時代にそのまま当てはめない" top={650} size={56} />
    ) : null}
  </>
);
export const SummaryChecklist: React.FC<{ count: number }> = ({ count }) => {
  const frame = useCurrentFrame();
  const items = [
    "ナイルが暮らしと国を支えた",
    "王は神と人をつなぎ、秩序を守る",
    "死後も生きるには、食べ物と儀式が必要",
    "ピラミッド＝死後の生を支える装置",
  ];
  const width = count === 1 ? 1100 : count === 2 ? 1260 : 1380;
  return (
    <PopCard
      style={{
        position: "absolute",
        left: (1920 - width) / 2,
        top: count === 4 ? 235 : 285,
        width,
        padding: 28,
      }}
    >
      <div
        style={{
          fontFamily: POP_HEADING,
          fontWeight: 400,
          fontSize: 56,
          marginBottom: 24,
        }}
      >
        ここまでのまとめ
      </div>
      {items.slice(0, count).map((item, i) => (
        <div
          key={item}
          style={{
            fontSize: 56,
            lineHeight: 1.3,
            marginTop: i ? 20 : 0,
            display: "flex",
            alignItems: "center",
            gap: 20,
            opacity: i === count - 1 ? Math.min(1, (frame + 1) / 4) : 1,
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              flexShrink: 0,
              borderRadius: "50%",
              border: `4px solid ${POP.ink}`,
              boxShadow: `4px 4px 0 ${POP.ink}`,
              background: POP.green,
              color: POP.white,
              fontSize: 44,
              transform:
                i === count - 1 ? `scale(${popScale(frame)})` : undefined,
            }}
          >
            ✔
          </span>
          <span>{item}</span>
        </div>
      ))}
    </PopCard>
  );
};
export const PreviousVideo: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        left: 310,
        top: 250,
        width: 1300,
        textAlign: "center",
      }}
    >
      <PopBadge tone="note" size={48}>
        前回の動画
      </PopBadge>
    </div>
    <PopCard
      style={{
        position: "absolute",
        left: 310,
        top: 410,
        width: 1300,
        padding: 32,
        textAlign: "center",
        fontFamily: POP_HEADING,
        fontWeight: 400,
        fontSize: 64,
        lineHeight: 1.45,
      }}
    >
      <div>【予習】クフの大ピラミッドは</div>
      <div>何がすごい？</div>
    </PopCard>
  </>
);
