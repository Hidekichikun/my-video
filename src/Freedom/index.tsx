import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile } from "remotion";
import { parseLrc, LyricLine } from "../utils/lrc-parser";
import { normalizeLrcText } from "../resources/lyrics";
import { FreedomImages } from "./FreedomImages";
import { FreedomText } from "./FreedomText";

const LRC_FILE = "lyrics/ふりーだむ.lrc";
const AUDIO_FILE = "music/ふりーだむ.mp3";

export const Freedom: React.FC = () => {
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [handle] = useState(() => delayRender());

  useEffect(() => {
    fetch(staticFile(LRC_FILE))
      .then(res => res.text())
      .then(text => {
        const normalized = normalizeLrcText(text);
        const parsed = parseLrc(normalized);
        setLines(parsed);
        continueRender(handle);
      })
      .catch(err => {
        console.error("Error loading lyrics:", err);
        continueRender(handle);
      });
  }, [handle]);

  useEffect(() => {
    const fonts = [
      new FontFace("GenkaiMincho", `url(${staticFile("fonts/GenkaiMincho.ttf")}) format('truetype')`),
      new FontFace("ToroNoGlitchMinchoH3", `url(${staticFile("fonts/ToroNoGlitchMinchoH3.otf")}) format('opentype')`),
    ];

    Promise.all(
      fonts.map(font => font.load().then(loaded => document.fonts.add(loaded)).catch(err => console.warn(err)))
    ).then(() => {
      // Fonts loaded
    });
  }, []);

  return (
    <AbsoluteFill>
      <Audio src={staticFile(AUDIO_FILE)} />
      <FreedomImages />
      <FreedomText lines={lines} />
    </AbsoluteFill>
  );
};
