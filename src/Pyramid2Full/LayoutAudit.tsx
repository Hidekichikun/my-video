import React, { useEffect, useState } from "react";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
import { TIMELINE } from "../Pyramid2/data/timeline";
import { POP_BODY, POP_HEADING } from "./pop-theme";

/** 確認用レンダーだけで実行。実際のDOMで字幕・文字の安全域・重なりを検証する。 */
export const LayoutAudit: React.FC = () => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("Pyramid2 DOM layout audit"));
  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const issues: string[] = [];
      const subtitle = document.querySelector("[data-pyramid2-subtitle]");
      const subtitleId = subtitle?.getAttribute("data-pyramid2-subtitle");
      const line = TIMELINE.chapters
        .flatMap((c) => c.lines)
        .find((l) => l.id === subtitleId);
      if (line && subtitle?.textContent !== line.subtitle)
        issues.push("subtitle-mismatch");
      const guide = document
        .querySelector("[data-pyramid2-guide]")
        ?.getBoundingClientRect();
      const overlap = (a: DOMRect, b: DOMRect) =>
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top;
      const subtitleRects: DOMRect[] = [];
      if (subtitle) {
        const walker = document.createTreeWalker(
          subtitle,
          NodeFilter.SHOW_TEXT,
        );
        while (walker.nextNode()) {
          const range = document.createRange();
          range.selectNodeContents(walker.currentNode);
          subtitleRects.push(...Array.from(range.getClientRects()));
        }
      }
      if (guide && subtitleRects.some((r) => overlap(r, guide)))
        issues.push("guide-subtitle-overlap");
      const textRects: { node: Node; rect: DOMRect }[] = [];
      const seen = new Set<Node>();
      document.querySelectorAll("[data-pyramid2-overlay]").forEach((el) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (
            seen.has(node) ||
            !node.textContent?.trim() ||
            node.parentElement?.tagName === "STYLE"
          )
            continue;
          seen.add(node);
          const style = getComputedStyle(node.parentElement!);
          let visible = style.visibility !== "hidden";
          for (
            let parent = node.parentElement;
            parent;
            parent = parent.parentElement
          ) {
            if (Number(getComputedStyle(parent).opacity) === 0) visible = false;
          }
          if (!visible) continue;
          if (/Shippori|Mincho/.test(style.fontFamily))
            issues.push("serif-font");
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const r of Array.from(range.getClientRects())) {
            if (r.width < 1 || r.height < 1) continue;
            textRects.push({ node, rect: r });
            const text = node.textContent.slice(0, 35);
            if (r.left < 80 || r.right > 1840 || r.top < 80 || r.bottom > 1000)
              issues.push(`unsafe-text:${text}`);
            if (guide && overlap(r, guide))
              issues.push(`guide-text-overlap:${text}`);
            if (subtitleRects.some((s) => overlap(r, s)))
              issues.push(`subtitle-text-overlap:${text}`);
          }
        }
      });
      for (let i = 0; i < textRects.length; i++)
        for (let j = i + 1; j < textRects.length; j++) {
          const a = textRects[i],
            b = textRects[j];
          if (a.node !== b.node && overlap(a.rect, b.rect))
            issues.push(
              `overlay-text-overlap:${a.node.textContent?.slice(0, 20)} / ${b.node.textContent?.slice(0, 20)}`,
            );
        }
      const sub = document.querySelector<HTMLElement>(
        "[data-pop-subtitle-lines]",
      );
      const rows = Number(sub?.dataset.popSubtitleLines ?? 0);
      if (rows > 2) issues.push("subtitle-more-than-two-rows");
      const fontsReady =
        document.fonts.check(`400 64px "${POP_HEADING}"`) &&
        document.fonts.check(`800 52px "${POP_BODY}"`);
      if (!fontsReady) issues.push("pop-font-not-ready");
      console.log(
        "PYRAMID2_AUDIT " +
          JSON.stringify({
            frame,
            line: subtitleId,
            subtitle: subtitle?.textContent,
            issues: [...new Set(issues)],
            subtitleRows: rows,
            subtitleBreaks: sub
              ? Array.from(sub.children).map((e) => e.textContent)
              : [],
            credit:
              frame >= TIMELINE.creditsFrom
                ? document.body.textContent?.includes("VOICEVOX:暁記ミタマ")
                : undefined,
            subtitleScale: Number(sub?.dataset.popSubtitleScale ?? 1),
            fontsReady,
          }),
      );
      continueRender(handle);
    });
    return () => {
      cancelled = true;
    };
  }, [frame, handle]);
  return null;
};
