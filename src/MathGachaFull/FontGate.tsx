import React, { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { waitForPopFonts } from "./theme";

/** 描画・文字幅の測定を始める前に、2書体の読込完了を待つ。 */
export const PopFontGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [handle] = useState(() => delayRender("Load MathGacha pop fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    waitForPopFonts().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (ready) continueRender(handle);
  }, [ready, handle]);
  return ready ? <>{children}</> : null;
};
