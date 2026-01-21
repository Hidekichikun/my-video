export const FIRE_IN_MY_SENSES_LRC_FILE = 'fire-in-my-senses.lrc';

/**
 * Normalize LRC text before parsing.
 * - Inserts a newline when timestamps are stuck together ( ...][... )
 * - Normalizes line endings
 */
export const normalizeLrcText = (lrc: string) =>
    lrc.replace(/](?=\[)/g, ']\n').replace(/\r\n?/g, '\n');
