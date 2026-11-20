import React from "react";
import { POP } from "../pop-theme";
import { Stage } from "../Stage";
import { type ChapterProps } from "../lib";
import { Cards, Heading, LatePeriod, Note, Panel } from "../parts";
export const Ch03Afterlife: React.FC<ChapterProps> = ({ chapter }) => (
  <Stage chapter={chapter}>
    {(n) => (
      <>
        {n <= 2 ? (
          <Panel mincho size={76} top={350} width={1440}>
            死んだあとも、存在は続く
          </Panel>
        ) : null}
        {n >= 3 && n <= 5 ? (
          <Heading text={n === 3 ? "カー" : "カー＝生命を支える力"} />
        ) : null}
        {n === 8 ? <Heading text="食べ物 → 生命の力" top={230} /> : null}
        {n >= 9 && n <= 12 ? (
          <>
            <Cards
              active={Math.min(3, n - 8)}
              items={[
                { title: "カー", text: "生命を支える力" },
                {
                  title: "バー",
                  text: n >= 10 ? "その人らしさ・動く力" : undefined,
                },
                {
                  title: "アク",
                  text: n >= 11 ? "儀式を経た死後の姿" : undefined,
                },
              ]}
            />
            {n === 12 ? (
              <Note text="※細かい意味は時代で変わる" top={720} />
            ) : null}
          </>
        ) : null}
        {n === 15 ? (
          <>
            <Panel top={205} width={1100} center={1100} size={42}>
              内臓を保存した箱（クフの母の墓）
            </Panel>
            <svg width={1920} height={1080} style={{ position: "absolute" }}>
              <path
                d="M 1520 335 L 1630 630 L 1608 607 M 1630 630 L 1634 598"
                fill="none"
                stroke={POP.pink}
                strokeWidth={6}
              />
            </svg>
          </>
        ) : null}
        {n >= 16 ? <LatePeriod strike={n === 17} /> : null}
      </>
    )}
  </Stage>
);
