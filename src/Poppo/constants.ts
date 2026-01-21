import { staticFile } from "remotion";

export const POPPO_LRC = staticFile("/lyrics/poppo1.lrc");
export const POPPO_AUDIO = staticFile("/music/poppo1.mp3");

export const HIRAGANA_FONT = "klsmaru";
export const KANJI_FONT = "ZenInShugoPop";

const POPPO_FIXED_IMAGE_FILES = [
  "u2944115231_anime_style_energetic_young_woman_rushing_in_the__9e7a7934-f716-470d-91f4-c62febc76108_3.png",
  "u2944115231_anime_style_energetic_cheerful_girl_sitting_on_a__f0fc664f-780c-4ca2-bed3-97be4ad1ac01_0.png",
  "u2944115231_A_cute_whimsical_illustration_of_a_meeting_inside_6b773535-86b9-4311-af0d-1871675ecb32_1.png",
  "u2944115231_A_gentle_and_humorous_fantasy_railway_with_soft_c_25a5daca-b892-467e-8861-6279ccafd354_3.png",
  "u2944115231_A_warm_gentle_train_running_while_releasing_dream_9bbcd898-f312-45de-8b6a-e3bf8e812bef_2.png",
  "u2944115231_anime_style_soft_warm_atmosphere_distant_steam_lo_4bd2b897-7541-4b6b-a152-58e8710503d5_0.png",
  "u2944115231_A_humorous_scene_where_a_sunny_gentle_train_encou_d0ec9ee2-cc38-40f2-bfa2-f793f76c5911_1.png",
  "u2944115231_A_slightly_funny_but_heartwarming_train_station_c_b6cebabe-ecba-4216-9b5d-c3f24fa07e95_3.png",
  "u2944115231_A_gentle_whimsical_scene_where_a_friendly_train_r_370f3ff4-0862-4898-b359-48cc4e609aa7_3.png",
];

const POPPO_IMAGE_FILES = [
  "u2944115231_anime_style_energetic_cheerful_girl_sitting_on_a__e5e220a5-d195-43a4-9b2f-f0f290f483c3_3.png",
  "u2944115231_anime_style_energetic_cheerful_girl_sitting_on_a__f0fc664f-780c-4ca2-bed3-97be4ad1ac01_0.png",
  "u2944115231_anime_style_energetic_cheerful_girl_sitting_on_a__f0fc664f-780c-4ca2-bed3-97be4ad1ac01_2.png",
  "u2944115231_anime_style_energetic_girl_in_a_hoodie_fully_clot_311ca119-10a8-4e52-9b90-ef58702ac53f_0.png",
  "u2944115231_anime_style_soft_warm_atmosphere_distant_steam_lo_4bd2b897-7541-4b6b-a152-58e8710503d5_1 (1).png",
  "u2944115231_anime_style_soft_warm_atmosphere_distant_steam_lo_4bd2b897-7541-4b6b-a152-58e8710503d5_2.png",
  "u2944115231_anime_style_soft_warm_atmosphere_distant_steam_lo_4bd2b897-7541-4b6b-a152-58e8710503d5_3.png",
  "u2944115231_A_cute_whimsical_illustration_of_a_meeting_inside_6b773535-86b9-4311-af0d-1871675ecb32_2.png",
  "u2944115231_cinematic_anime_style_dynamic_composition_energet_0b100131-371c-4743-9644-1d997c3a030a_2.png",
  "u2944115231_cute_anime_style_happy_energetic_girl_jumping_joy_b9ffd86e-cadb-4d1a-af0a-6c4a6e6d4dca_0.png",
  "u2944115231_cute_anime_style_happy_energetic_girl_wearing_a_h_93f7b816-63f0-4de5-8015-af2e4847c80c_2.png",
];

const POPPO_IMAGE_MAP = new Map(
  POPPO_IMAGE_FILES.concat(POPPO_FIXED_IMAGE_FILES).map((name) => [
    name,
    staticFile(`/photo/poppo/${name}`),
  ])
);

const getImage = (name: string) =>
  POPPO_IMAGE_MAP.get(name) ?? staticFile(`/photo/poppo/${name}`);

export const POPPO_IMAGES = POPPO_IMAGE_FILES.map((name) => getImage(name));

export const POPPO_FIXED_IMAGES = [
  {
    time: 0,
    endTime: 18.52,
    src: getImage(POPPO_FIXED_IMAGE_FILES[1]),
  },
  {
    time: 18.52,
    endTime: 22.56,
    src: getImage("u2944115231_anime_style_energetic_cheerful_girl_sitting_on_a__f0fc664f-780c-4ca2-bed3-97be4ad1ac01_2.png"),
  },
  {
    time: 22.56,
    endTime: 27.42,
    src: getImage(POPPO_FIXED_IMAGE_FILES[2]),
  },
  {
    time: 27.42,
    endTime: 36.19,
    src: getImage(POPPO_FIXED_IMAGE_FILES[4]),
  },
  {
    time: 36.19,
    endTime: 44.9,
    src: getImage(POPPO_FIXED_IMAGE_FILES[0]),
  },
  {
    time: 44.9,
    endTime: 55.51,
    src: getImage(
      "u2944115231_soft_warm_anime_illustration_peaceful_bright_room_09511f85-e6d5-4b70-9934-33a769c7df9b_1.png"
    ),
  },
  {
    time: 55.51,
    endTime: 73.2,
    src: getImage(POPPO_FIXED_IMAGE_FILES[3]),
  },
  {
    time: 73.2,
    endTime: 78.57,
    src: getImage(
      "u2944115231_warm_gentle_atmosphere_cozy_inside_view_of_a_stea_f6187cff-0ba8-4df7-b308-246ab00d0062_1.png"
    ),
  },
  {
    time: 78.57,
    endTime: 87.87,
    src: getImage(
      "u2944115231_anime_style_soft_warm_atmosphere_distant_steam_lo_4bd2b897-7541-4b6b-a152-58e8710503d5_2.png"
    ),
  },
  {
    time: 87.87,
    endTime: 96.16,
    src: getImage(
      "u2944115231_soft_dreamy_sky_turning_into_floating_dreams_fluf_c160991e-9fad-4c13-9794-424214a628a1_1.png"
    ),
  },
  {
    time: 96.16,
    endTime: 105.38,
    src: getImage(
      "u2944115231_A_cute_character_working_on_a_handmade_project_bu_39058f55-fc63-4bbc-8e27-aa11444a19e9_2.png"
    ),
  },
  {
    time: 105.38,
    endTime: 114.49,
    src: getImage("u2944115231_anime_style_energetic_cheerful_girl_sitting_on_a__e5e220a5-d195-43a4-9b2f-f0f290f483c3_3.png"),
  },
  {
    time: 114.49,
    endTime: 125.32,
    src: getImage(
      "u2944115231_a_gentle_relaxing_anime_style_woman_sitting_comfo_23fa8689-cc18-4478-81a6-88f24a8d6370_2.png"
    ),
  },
  {
    time: 125.32,
    endTime: 131.49,
    src: getImage(POPPO_FIXED_IMAGE_FILES[6]),
  },
  {
    time: 131.49,
    endTime: 136.66,
    src: getImage(
      "u2944115231_cute_anime_style_happy_energetic_girl_wearing_a_h_93f7b816-63f0-4de5-8015-af2e4847c80c_2.png"
    ),
  },
  {
    time: 136.66,
    endTime: 141.13,
    src: getImage(
      "u2944115231_gentle_warm_atmosphere_a_nostalgic_steam_locomoti_22e668ee-17ce-4539-9a61-8b2ec9e2904b_3.png"
    ),
  },
  {
    time: 141.13,
    endTime: 147.05,
    src: getImage(POPPO_FIXED_IMAGE_FILES[7]),
  },
  {
    time: 147.05,
    endTime: 167.45,
    src: getImage(POPPO_FIXED_IMAGE_FILES[4]),
  },
  {
    time: 167.45,
    endTime: 176.96,
    src: getImage(
      "u2944115231_cinematic_anime_style_dynamic_composition_energet_0b100131-371c-4743-9644-1d997c3a030a_2.png"
    ),
  },
  {
    time: 176.96,
    endTime: 202,
    src: getImage(
      "u2944115231_soft_warm_anime_illustration_of_a_gentle_winter_s_1d3465b3-182b-4b4e-a5bd-650388a014ad_2.png"
    ),
  },
];
