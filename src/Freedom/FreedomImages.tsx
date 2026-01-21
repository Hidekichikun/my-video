import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";

const imagePaths = [
  "photo/freedom/ChatGPT Image 2025”N12ŒŽ28“ú 05_27_23.png",
  "photo/freedom/ChatGPT Image 2025”N12ŒŽ28“ú 05_19_57.png",
  "photo/freedom/ChatGPT Image 2025”N12ŒŽ28“ú 05_30_14.png",
  "photo/freedom/neon.png",
  "photo/freedom/soft.png",
  "photo/freedom/u2944115231_Anime-style_illustration_of_a_mischievous_energet_8d8009b2-08fa-45f5-a7c4-52d882ce9004_1.png",
  "photo/freedom/u2944115231_Anime-style_illustration_of_a_playful_energetic_g_73209bc3-3a51-41a3-bfe3-0f3102499a0c_0.png",
  "photo/freedom/u2944115231_Anime-style_illustration_of_a_playful_energetic_g_73209bc3-3a51-41a3-bfe3-0f3102499a0c_1.png",
  "photo/freedom/u2944115231_a_cute_pastel_goth_anime_girl_with_messy_twin_tai_34c85225-275d-4438-8014-600fd5f3cbb7_0.png",
  "photo/freedom/u2944115231_a_cute_pastel_goth_anime_girl_with_messy_twin_tai_34c85225-275d-4438-8014-600fd5f3cbb7_2.png",
  "photo/freedom/u2944115231_a_cute_pastel_goth_anime_girl_with_messy_twin_tai_743c615e-b59c-4220-9519-1135a9b41663_0.png",
  "photo/freedom/u2944115231_a_cute_pastel_goth_anime_girl_with_pigtails_smili_420fdb37-3af7-43b0-96df-94c6c605c0bd_1.png",
  "photo/freedom/u2944115231_a_cute_pastel_goth_anime_girl_with_pigtails_smili_9a8df4f9-b617-46eb-88c1-14c400972e91_0.png",
  "photo/freedom/u2944115231_a_cute_pastel_goth_anime_girl_with_pigtails_smili_9a8df4f9-b617-46eb-88c1-14c400972e91_3.png",
  "photo/freedom/u2944115231_a_cute_pastel_goth_anime_girl_with_pigtails_smili_a7635260-938a-4846-8add-8cf5e9b42b35_0.png",
  "photo/freedom/u2944115231_a_cute_pastel_goth_anime_girl_with_pigtails_smili_f3b8fafd-e7f1-4dfa-a90d-7f76734afde9_3.png",
  "photo/freedom/u2944115231_A_punkish_girl_with_blonde_hair_tied_in_a_high_po_5a5078b9-60aa-435a-800b-1722f058ab7c_2.png",
  "photo/freedom/u2944115231_A_punkish_girl_with_blonde_hair_tied_in_a_high_po_fd20d0cb-f8ca-41ef-a8a7-ea978758dc0e_1.png",
  "photo/freedom/u2944115231_A_punkish_girl_with_blonde_hair_tied_in_a_high_po_fd20d0cb-f8ca-41ef-a8a7-ea978758dc0e_2.png",
  "photo/freedom/u2944115231_A_punkish_girl_with_piercings_on_her_lip_and_ears_9a9ffbd8-4777-4823-8334-7445fed8e508_1.png",
  "photo/freedom/u2944115231_A_punkish_girl_with_piercings_on_her_lip_and_ears_9a9ffbd8-4777-4823-8334-7445fed8e508_3.png",
  "photo/freedom/u2944115231_httpss.mj.run0pFroQDyVsw_stand_up_--ar_43_--sref__7892aed6-263d-4411-974f-39de8a605392_0.png",
  "photo/freedom/u2944115231_httpss.mj.runLEl1tkIqklk_stand_up_--ar_43_--sref__f43c9deb-6b51-44ad-8f04-5ddd8904873d_3.png",
  "photo/freedom/u2944115231_httpss.mj.runWLHk3lcHhqk_a_cute_pastel_goth_anime_08a7eb92-bc7f-4744-a7bf-2c1b40523a64_3.png",
  "photo/freedom/u2944115231_httpss.mj.runWLHk3lcHhqk_a_cute_pastel_goth_anime_63399ce4-1a73-46d1-acb3-3c9957852171_0.png",
  "photo/freedom/u2944115231_httpss.mj.runWLHk3lcHhqk_a_cute_pastel_goth_anime_cd546cfd-6af5-440f-9851-bcb8c4748351_3.png",
  "photo/freedom/u2944115231_httpss.mj.runWLHk3lcHhqk_a_cute_pastel_goth_anime_ebc59523-afe3-48e1-9160-a4c706c6f908_0.png",
  "photo/freedom/u2944115231_stand_up_--ar_43_--profile_zqryvo4_--cref_httpss._ce804020-8661-4c75-92e4-0e24b405fcae_1.png",
  "photo/freedom/u2944115231_Stand_up_--ar_43_--sref_httpss.mj.runKq2jVdvIMOw__80b2f214-6ced-48bd-ac44-89e8da080924_0 (1).png",
  "photo/freedom/u2944115231_Stand_up_--ar_43_--sref_httpss.mj.runKq2jVdvIMOw__80b2f214-6ced-48bd-ac44-89e8da080924_0.png",
  "photo/freedom/u2944115231_Stand_up_--ar_43_--sref_httpss.mj.runKq2jVdvIMOw__80b2f214-6ced-48bd-ac44-89e8da080924_1.png",
];

const SLICE_COUNT = 12;

export const FreedomImages: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cycleDuration = fps * 4;
  const transitionFrames = Math.round(fps * 0.7);
  const localFrame = frame % cycleDuration;

  const index = Math.floor(frame / cycleDuration) % imagePaths.length;
  const nextIndex = (index + 1) % imagePaths.length;

  const transitionProgress = interpolate(
    localFrame,
    [cycleDuration - transitionFrames, cycleDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    }
  );

  const isTransition = localFrame >= cycleDuration - transitionFrames;

  const driftX = 0;
  const driftY = 0;
  const scale = 1.0;

  const flash = interpolate(transitionProgress, [0, 0.25, 1], [0, 0.35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const vignetteOpacity = 0.35 + Math.sin(frame * 0.01) * 0.1;

  return (
    <AbsoluteFill style={{ backgroundColor: "#05060a" }}>
      <Img
        src={staticFile(imagePaths[index])}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: `translate(${driftX}px, ${driftY}px) scale(${scale})`,
        }}
      />

      {isTransition && (
        <>
          {Array.from({ length: SLICE_COUNT }).map((_, sliceIndex) => {
            const sliceWidth = 100 / SLICE_COUNT;
            const left = sliceIndex * sliceWidth;
            const right = left + sliceWidth;
            const stagger = (sliceIndex / SLICE_COUNT) * 0.3;
            const sliceProgress = interpolate(transitionProgress, [stagger, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            const offset = (1 - sliceProgress) * (sliceIndex % 2 === 0 ? -90 : 90);
            const skew = (1 - sliceProgress) * (sliceIndex % 2 === 0 ? -10 : 10);

            return (
              <div
                key={sliceIndex}
                style={{
                  position: "absolute",
                  inset: 0,
                  clipPath: `polygon(${left}% 0, ${right}% 0, ${right}% 100%, ${left}% 100%)`,
                  transform: `translateX(${offset}px) skewX(${skew}deg)`,
                  opacity: sliceProgress,
                }}
              >
                <Img
                  src={staticFile(imagePaths[nextIndex])}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    transform: `translate(${driftX}px, ${driftY}px) scale(${scale})`,
                  }}
                />
              </div>
            );
          })}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(120deg, rgba(255,255,255,0.08), rgba(0,0,0,0))",
              opacity: flash,
              mixBlendMode: "screen",
            }}
          />
        </>
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 45%)," +
            "radial-gradient(circle at 80% 30%, rgba(255,255,255,0.06), transparent 50%)," +
            "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.6))",
          opacity: 0.85,
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px)",
          opacity: 0.25,
          mixBlendMode: "soft-light",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 200px rgba(0,0,0,${vignetteOpacity})`,
        }}
      />
    </AbsoluteFill>
  );
};
