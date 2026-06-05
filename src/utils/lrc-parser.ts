import { normalizeLrcText } from '../resources/lyrics';

export interface LyricLine {
  time: number; // Time in seconds
  text: string;
  isChorus?: boolean;
}

export const parseLrc = (lrc: string): LyricLine[] => {
  const normalized = normalizeLrcText(lrc);
  const lines = normalized.split('\n');
  const lyrics: LyricLine[] = [];

  // Supports:
  // [mm:ss.xx] or [mm:ss.xxx]
  // [hh:mm:ss.xx]
  // [mm:ss]
  const timeRegex = /\[(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\.(\d{1,3}))?\]/g;

  const parseTime = (match: RegExpMatchArray) => {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let milliseconds = 0;

    const part1 = parseInt(match[1], 10);
    const part2 = parseInt(match[2], 10);
    const part3 = match[3] ? parseInt(match[3], 10) : undefined;
    const part4 = match[4] ? parseInt(match[4], 10) : 0;

    if (part3 !== undefined) {
      // Format: hh:mm:ss
      hours = part1;
      minutes = part2;
      seconds = part3;
    } else {
      // Format: mm:ss
      minutes = part1;
      seconds = part2;
    }

    // Handle milliseconds (2 or 3 digits). Standard LRC usually uses centiseconds.
    if (match[4]) {
      milliseconds = match[4].length === 3 ? part4 / 1000 : part4 / 100;
    }

    return hours * 3600 + minutes * 60 + seconds + milliseconds;
  };

  for (const line of lines) {
    const matches = Array.from(line.matchAll(timeRegex));
    for (let index = 0; index < matches.length; index++) {
      const match = matches[index];
      const nextMatch = matches[index + 1];
      const time = parseTime(match);
      let text = line.slice((match.index ?? 0) + match[0].length, nextMatch?.index).trim();

      // Optional inline tag to flag chorus lines: e.g. "{chorus}繝ｩ繝ｩ繝ｩ"
      let isChorus = false;
      const tagMatch = text.match(/^\{([a-zA-Z]+)\}\s*/);
      if (tagMatch) {
        const tag = tagMatch[1].toLowerCase();
        if (tag === 'chorus' || tag === 'sabi') {
          isChorus = true;
        }
        text = text.slice(tagMatch[0].length).trim();
      }

      if (text) {
        lyrics.push({ time, text, isChorus });
      }
    }
  }

  return lyrics;
};
