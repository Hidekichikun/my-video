// I close my mind MV — シーン構成（秒）
// mode:
//   photo … 過去。「君」が使い捨てカメラで撮った写真（フィルムの粒・日付つき・あったかい色）
//   live  … 今。ライブのステージ（ビートで脈打つ・カットはフラッシュ）
//   night … 今の静かな夜（Verse 3 / Bridge）
//   outro … 歩道橋でふり返る。最後まで
export type Mode = 'photo' | 'live' | 'night' | 'outro';

export type Shot = {
    start: number;
    file: string;
    mode: Mode;
    /** object-position */
    pos: string;
    /** [開始スケール, 終了スケール] */
    zoom: [number, number];
    panX?: [number, number];
    panY?: [number, number];
    /** 前のショットからのクロスフェード秒（省略時はモードで自動） */
    fade?: number;
};

export const DIR = 'i-close-my-mind/';
export const TOTAL_SECONDS = 241.5;
export const INTRO_END = 14.6;
export const END_TITLE_START = 236.6;

/** 写真ごとの日付（使い捨てカメラの焼き込み） */
export const DATES: Record<string, string> = {
    'A_classroom.jpg': "'09  6 12",
    'N1_bbq.jpg': "'09  8  3",
    'N2_jihanki.jpg': "'09  7 21",
    'B_shokushitsu.jpg': "'09  9 27",
    'C_hanabi.jpg': "'09  8 15",
    'N6b_corner_past.jpg': "'09 10  2",
};

const A = 'A_classroom.jpg';
const B = 'B_shokushitsu.jpg';
const C = 'C_hanabi.jpg';
const D = 'D_hodokyo.jpg';
const L1 = 'L1_live1.jpg';
const L2 = 'L2_live2.jpg';
const N1 = 'N1_bbq.jpg';
const N2 = 'N2_jihanki.jpg';
const N3 = 'N3_fes.jpg';
const N4 = 'N4_now.jpg';
const N5 = 'N5_sento.jpg';
const N6 = 'N6_corner.jpg';
const N6b = 'N6b_corner_past.jpg';

const live = (start: number, file: string, i: number): Shot => ({
    start,
    file,
    mode: 'live',
    pos: file === L1 ? '45% 40%' : '42% 40%',
    zoom: i % 2 === 0 ? [1.12, 1.02] : [1.02, 1.1],
    panX: i % 2 === 0 ? [-1.2, 1.2] : [1.2, -1.2],
});
const photo = (start: number, file: string, i: number, pos = '50% 40%'): Shot => ({
    start,
    file,
    mode: 'photo',
    pos,
    zoom: i % 2 === 0 ? [1.04, 1.12] : [1.12, 1.04],
    panX: i % 2 === 0 ? [1, -1] : [-1, 1],
});

export const SHOTS: Shot[] = [
    // ── イントロ：フェス会場にゆっくり寄る → 曲名
    { start: 0, file: N3, mode: 'live', pos: '50% 55%', zoom: [1.0, 1.22], fade: 0.001 },

    // ── Verse 1（過去の写真）
    photo(14.6, A, 0, '40% 40%'),
    photo(21.3, N1, 1),
    // ── Pre-Chorus
    photo(35.8, N2, 0, '45% 35%'),

    // ── Chorus 1：ライブを拍で切り替え。間に過去がチラッ
    live(50.05, L1, 0),
    live(52.5, L2, 1),
    live(54.45, L1, 2),
    photo(56.4, A, 1, '40% 40%'),
    live(58.0, L2, 3),
    live(59.35, L1, 4),
    photo(61.3, N1, 0),
    live(63.25, L2, 5),

    // ── Post-Chorus：過去の写真をパッパッと
    photo(68.4, A, 0, '40% 40%'),
    photo(71.7, N1, 1),
    photo(74.4, N2, 0, '45% 35%'),
    photo(76.6, A, 1, '40% 40%'),

    // ── Verse 2
    photo(78.3, B, 0, '50% 35%'),
    // ── Pre-Chorus 2
    photo(91.9, C, 1, '45% 45%'),

    // ── Chorus 2
    live(105.8, L2, 0),
    live(108.35, L1, 1),
    photo(110.0, C, 0, '45% 45%'),
    live(112.1, L2, 2),
    live(113.8, L1, 3),
    photo(115.1, C, 1, '45% 45%'),
    live(117.15, L2, 4),
    live(119.0, L1, 5),

    // ── Verse 3：今の静かな夜へ
    { start: 125.6, file: N4, mode: 'night', pos: '35% 40%', zoom: [1.02, 1.1], panX: [1, -1], fade: 2.2 },
    { start: 135.0, file: N5, mode: 'night', pos: '50% 50%', zoom: [1.1, 1.0], fade: 1.3 },
    { start: 141.9, file: N4, mode: 'night', pos: '25% 30%', zoom: [1.35, 1.55], fade: 1.3 },

    // ── Bridge：誰もいない曲がり角 → 過去の彼女が浮かぶ
    { start: 149.5, file: N6, mode: 'night', pos: '50% 60%', zoom: [1.0, 1.08], fade: 1.6 },
    { start: 158.0, file: N6b, mode: 'night', pos: '50% 60%', zoom: [1.08, 1.13], fade: 4.5 },
    // 過去の写真を全部、早いカットで
    photo(171.2, A, 0, '40% 40%'),
    photo(172.95, N1, 1),
    photo(174.7, N2, 0, '45% 35%'),
    photo(176.45, B, 1, '50% 35%'),
    photo(178.2, C, 0, '45% 45%'),
    photo(179.5, N6b, 1, '60% 55%'),

    // ── Final Chorus：いちばん派手に
    live(180.8, L1, 0),
    live(182.85, L2, 1),
    live(184.55, L1, 2),
    live(186.7, L2, 3),
    live(188.3, L1, 4),
    live(190.3, L2, 5),
    live(192.0, L1, 6),
    live(193.75, L2, 7),
    live(196.5, L1, 8),
    // 「それぞれの道を歩いてる」＝今の彼女
    { start: 199.8, file: N4, mode: 'live', pos: '35% 40%', zoom: [1.06, 1.14] },
    live(202.55, L2, 9),
    live(205.25, L1, 10),

    // ── Outro：歩道橋でふり返る。ゆっくりズームのまま最後まで
    { start: 209.3, file: D, mode: 'outro', pos: '50% 40%', zoom: [1.0, 1.18], panX: [-1.5, 1.5], fade: 1.6 },
];

export const modeAt = (t: number): Mode => {
    let m: Mode = SHOTS[0].mode;
    for (const s of SHOTS) {
        if (s.start <= t) m = s.mode;
        else break;
    }
    return m;
};

/** t 以降で最初にモードが切り替わる時刻 */
export const nextModeChange = (t: number) => {
    const m = modeAt(t);
    const s = SHOTS.find((x) => x.start > t && x.mode !== m);
    return s ? s.start : TOTAL_SECONDS;
};

/** 夜の度合い 0〜1（Chorus 2 の後の間奏で落ちて、ラスサビ前の早いカットで戻る） */
export const nightAt = (t: number) => {
    const pts: [number, number][] = [
        [121.0, 0],
        [127.5, 1],
        [170.6, 1],
        [171.2, 0],
    ];
    if (t <= pts[0][0] || t >= pts[3][0]) return 0;
    if (t < pts[1][0]) return (t - pts[0][0]) / (pts[1][0] - pts[0][0]);
    if (t <= pts[2][0]) return 1;
    return 1 - (t - pts[2][0]) / (pts[3][0] - pts[2][0]);
};
