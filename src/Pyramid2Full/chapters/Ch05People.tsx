import React from "react";
import { PortMap } from "../pop/PortMap";
import { Stage } from "../Stage";
import { type ChapterProps } from "../lib";
import { Cards, Evidence, Heading, Icons } from "../parts";
export const Ch05People: React.FC<ChapterProps> = ({ chapter }) => (
  <Stage chapter={chapter}>
    {(n) => (
      <>
        {n === 2 || n === 3 ? (
          <>
            <Heading text="ヘミウヌ" />
            {n === 3 ? (
              <Heading
                text="クフの甥（と考えられる）／ 建設の監督"
                top={345}
                size={42}
              />
            ) : null}
          </>
        ) : null}
        {n === 4 ? (
          <Evidence kind="noEvidence" subject="一人で全部を設計" />
        ) : null}
        {n === 5 ? (
          <Evidence kind="likely" subject="建設の責任者の一人" />
        ) : null}
        {n >= 8 && n <= 9 ? (
          <Heading text="ヘミウヌの像はセルダブから" size={48} />
        ) : null}
        {n === 10 || n === 11 ? <Heading text="メレル" /> : null}
        {n === 12 ? <PortMap /> : null}
        {n === 15 ? (
          <Cards
            top={220}
            items={[
              { title: "ヒエログリフ", text: "刻む・飾る文字" },
              { title: "ヒエラティック", text: "筆で速く書く文字" },
            ]}
          />
        ) : null}
        {n === 16 ? (
          <Icons
            labels={["運ぶ", "受け取る", "記録する"]}
            glyphs={["運", "受", "記"]}
          />
        ) : null}
        {n >= 18 && n <= 22 ? (
          <Heading text="ヘテプヘレス1世（クフの母）" size={48} />
        ) : null}
        {n >= 20 && n <= 22 ? (
          <Evidence
            kind="reconstruction"
            subject="展示は記録をもとに復元"
            y={365}
          />
        ) : null}
        {n === 24 ? <Heading text="理由は不明" /> : null}
        {n >= 25 ? (
          <Icons
            labels={["監督", "運ぶ", "書き記す", "パンを焼く", "王の家族"]}
            glyphs={["監", "運", "記", "食", "家"]}
          />
        ) : null}
      </>
    )}
  </Stage>
);
