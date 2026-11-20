// Forward Glow MV v2 — シーン構成（秒）
// mode:
//   panel … 右に絵・左に縦書き歌詞（Aメロ／Bメロ）
//   full  … 全画面＋ビートで脈打つ（サビ）
//   dark  … 色を落とした静かなパート（Cメロ）
export type Mode = 'panel' | 'full' | 'dark';

export type Shot = {
    start: number;
    file: string;
    mode: Mode;
    /** object-position */
    pos: string;
    /** Ken Burns: [開始スケール, 終了スケール] */
    zoom: [number, number];
    /** 横方向のパン（%）[開始, 終了] */
    panX?: [number, number];
    /** 縦方向のパン（%）[開始, 終了] */
    panY?: [number, number];
};

export const END_CARD_START = 166;
export const TOTAL_SECONDS = 180;

export const SHOTS: Shot[] = [
    // ── イントロ〜Aメロ
    { start: 0, file: 'forward-glow-01.png', mode: 'panel', pos: '50% 22%', zoom: [1.14, 1.0] },
    { start: 11.67, file: 'forward-glow-06.png', mode: 'panel', pos: '50% 20%', zoom: [1.0, 1.1], panX: [1.5, -1.5] },
    { start: 22.57, file: 'forward-glow-13.png', mode: 'panel', pos: '50% 45%', zoom: [1.04, 1.2] },
    // ── サビ1
    { start: 34.24, file: 'forward-glow-02.png', mode: 'full', pos: '50% 40%', zoom: [1.14, 1.02] },
    { start: 40.49, file: 'forward-glow-09.png', mode: 'full', pos: '62% 32%', zoom: [1.0, 1.1], panX: [-2, 2] },
    { start: 45.54, file: 'forward-glow-04.png', mode: 'full', pos: '50% 42%', zoom: [1.12, 1.0] },
    { start: 50.57, file: 'forward-glow-17.png', mode: 'full', pos: '50% 42%', zoom: [1.0, 1.1], panY: [1.5, -1.5] },
    { start: 54.0, file: 'forward-glow-03.png', mode: 'full', pos: '58% 30%', zoom: [1.08, 1.0] },
    // ── Aメロ2〜Bメロ2
    { start: 55.67, file: 'forward-glow-16.png', mode: 'panel', pos: '50% 50%', zoom: [1.0, 1.12] },
    { start: 66.64, file: 'forward-glow-05.png', mode: 'panel', pos: '50% 28%', zoom: [1.1, 1.0], panX: [-1.5, 1.5] },
    { start: 77.59, file: 'forward-glow-12.png', mode: 'panel', pos: '50% 50%', zoom: [1.0, 1.14] },
    // 間奏：サビ前のため（ぐーっと寄る）
    { start: 87.6, file: 'forward-glow-chorus-face.png', mode: 'full', pos: '50% 35%', zoom: [1.0, 1.28] },
    // ── サビ2
    { start: 92.42, file: 'forward-glow-17.png', mode: 'full', pos: '50% 42%', zoom: [1.14, 1.0] },
    { start: 97.79, file: 'forward-glow-02.png', mode: 'full', pos: '50% 40%', zoom: [1.0, 1.1], panX: [2, -2] },
    { start: 102.62, file: 'forward-glow-04.png', mode: 'full', pos: '50% 42%', zoom: [1.1, 1.0] },
    { start: 107.81, file: 'forward-glow-09.png', mode: 'full', pos: '62% 32%', zoom: [1.0, 1.1] },
    { start: 111.53, file: 'forward-glow-03.png', mode: 'full', pos: '58% 30%', zoom: [1.06, 1.0] },
    // ── Cメロ（暗転）
    { start: 113.79, file: 'forward-glow-16.png', mode: 'dark', pos: '50% 50%', zoom: [1.12, 1.0] },
    { start: 125.15, file: 'forward-glow-12.png', mode: 'dark', pos: '50% 50%', zoom: [1.0, 1.12] },
    { start: 131.46, file: 'forward-glow-13.png', mode: 'dark', pos: '50% 45%', zoom: [1.0, 1.15] },
    // ── ラスサビ
    { start: 136.9, file: 'forward-glow-04.png', mode: 'full', pos: '50% 42%', zoom: [1.16, 1.0] },
    { start: 142.43, file: 'forward-glow-02.png', mode: 'full', pos: '50% 40%', zoom: [1.0, 1.1] },
    { start: 148.02, file: 'forward-glow-17.png', mode: 'full', pos: '50% 42%', zoom: [1.1, 1.0], panX: [-2, 2] },
    { start: 153.43, file: 'forward-glow-09.png', mode: 'full', pos: '62% 32%', zoom: [1.0, 1.12] },
    // ── アウトロ：山へ歩いていく背中
    { start: 157.59, file: 'forward-glow-15.png', mode: 'full', pos: '72% 82%', zoom: [1.42, 1.3] },
];

/** 歌詞ブロックのモード（歌詞の見せ方を決める） */
export const modeAt = (t: number): Mode => {
    let current: Mode = SHOTS[0].mode;
    for (const s of SHOTS) {
        if (s.start <= t) current = s.mode;
        else break;
    }
    return current;
};

/** 暗転度 0〜1（Cメロでなめらかに色が落ちて、ラスサビで戻る） */
export const darknessAt = (t: number) => {
    const pts: [number, number][] = [
        [112.9, 0],
        [116.0, 1],
        [134.6, 1],
        [136.9, 0],
    ];
    if (t <= pts[0][0] || t >= pts[3][0]) return 0;
    if (t < pts[1][0]) return (t - pts[0][0]) / (pts[1][0] - pts[0][0]);
    if (t <= pts[2][0]) return 1;
    return 1 - (t - pts[2][0]) / (pts[3][0] - pts[2][0]);
};

/** t 以降で最初にモードが切り替わる時刻 */
export const nextModeChange = (t: number) => {
    const m = modeAt(t);
    const s = SHOTS.find((x) => x.start > t && x.mode !== m);
    return s ? s.start : END_CARD_START;
};
