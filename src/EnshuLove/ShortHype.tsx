import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {timeline} from './timeline';
import {CIRCLES} from './circles';
import {PINK, CYAN, WHITE, clamp, asset, useChalkFont, phaseAt, Kimi, Dust, ChalkLine, TERMS, Equation, eqFlash, bigFeel, BigFeel, Cue} from './index';

/* A livelier vertical short for YouTube: chorus 1, cut by lyric line, framed on her. */
export const HYPE_START = timeline.sections[3].start;
export const HYPE_END = timeline.sections[3].end;
const cues = timeline.cues as unknown as Cue[];
const at = (text: string, from = HYPE_START) => cues.find((c) => c.text === text && c.start >= from - .01)?.start ?? from;
const eq0 = at(TERMS[0]), eq1 = at(TERMS[1]), eq2 = at(TERMS[2]);
const feel2 = at('Feel my love! 三つの数字で'), maaru = at('まあるく 世界を描く'), feel3 = at('Feel my love! ノートの端まで'), kimi = at('君でいっぱい');

/* focus = x of the picture (1920-wide composition px) the vertical frame follows, from -> to */
type Cut = {start: number; image: string; from: number; to: number; zoom: [number, number]; spin?: number; fit?: boolean};
const CUTS: Cut[] = [
  {start: HYPE_START, image: 'short_01.png', from: 540, to: 540, zoom: [1.06, 1.0]},
  {start: eq0, image: '10_chorus_explosion.png', from: 520, to: 600, zoom: [1.0, 1.05]},
  {start: eq1, image: '11_chorus_world.png', from: 960, to: 960, zoom: [1.0, 1.08], fit: true},
  {start: eq2, image: 'short_01.png', from: 540, to: 540, zoom: [1.0, 1.05]},
  {start: feel2, image: '11_chorus_world.png', from: 960, to: 960, zoom: [1.1, 1.0], fit: true},
  {start: maaru, image: '13_post_round.png', from: 1120, to: 1040, zoom: [1.0, 1.06], spin: 14},
  {start: feel3, image: '07_verse1_notebook.png', from: 900, to: 980, zoom: [1.05, 1.0]},
  {start: kimi, image: 'thumb_main.png', from: 500, to: 440, zoom: [1.04, 1.0]},
];

export const EnshuLoveShortHype: React.FC = () => {
  useChalkFont();
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = HYPE_START + f / fps;
  const ci = CUTS.reduce((k, c, i) => (t >= c.start ? i : k), 0);
  const cut = CUTS[ci];
  const end = CUTS[ci + 1]?.start ?? HYPE_END;
  const p = Math.min(1, (t - cut.start) / (end - cut.start));
  const age = t - cut.start;
  const zoom = interpolate(p, [0, 1], cut.zoom, {easing: Easing.inOut(Easing.sin)});
  const vertical = cut.image.startsWith('short');
  const ell = CIRCLES[cut.image] ?? null;
  const cue = cues.find((c) => t >= c.start && t < c.end);
  const isEq = !!cue && TERMS.includes(cue.text);
  const flash = Math.min(1, eqFlash(t));
  const fade = Math.min(interpolate(f, [0, 6], [0, 1], clamp), interpolate(t, [HYPE_END - .35, HYPE_END], [1, 0], clamp));
  /* horizontal art sits in a 1920x1080 box scaled to the frame height, slid to the focus point */
  const s = cut.fit ? width / 1920 : height / 1080;
  const focus = interpolate(p, [0, 1], [cut.from, cut.to], {easing: Easing.inOut(Easing.sin)});
  const left = cut.fit ? 0 : width / 2 - focus * s, top = cut.fit ? (height - 1080 * s) / 2 + 40 : 0;
  const box = (child: React.ReactNode) => vertical
    ? <AbsoluteFill>{child}</AbsoluteFill>
    : <div style={{position: 'absolute', left, top, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: '0 0'}}>{child}</div>;
  const art = (img: string, style?: React.CSSProperties) => <Img src={asset(img)} style={{width: '100%', height: '100%', objectFit: 'cover', ...style}}/>;
  const cutGlitch = age < .14;
  const kw = vertical ? width : 1920, kh = vertical ? height : 1080;
  return <AbsoluteFill style={{backgroundColor: '#04130f', overflow: 'hidden'}}>
    <Audio src={asset('song.mp3')} trimBefore={Math.round(HYPE_START * fps)}/>
    <AbsoluteFill style={{opacity: fade}}>
      {cut.fit ? <AbsoluteFill style={{transform: 'scale(1.25)', filter: 'blur(28px) brightness(.55) saturate(1.2)'}}><Img src={asset(cut.image)} style={{width: '100%', height: '100%', objectFit: 'cover'}}/></AbsoluteFill> : null}
      <AbsoluteFill style={{transform: `scale(${zoom}) rotate(${(cut.spin ?? 0) * (p - .5)}deg)`}}>
        {box(<>
          {art(cut.image)}
          {ell ? <Kimi e={ell} w={kw} h={kh} phase={phaseAt(t)} draw={1} flash={flash} hot/> : null}
        </>)}
        {cutGlitch ? [0, 1, 2, 3].map((i) => <AbsoluteFill key={i} style={{clipPath: `inset(${8 + i * 23}% 0 ${78 - i * 23}% 0)`, transform: `translateX(${(i % 2 ? 1 : -1) * (40 - age * 250)}px)`, mixBlendMode: 'screen', opacity: .75}}>
          {box(art(cut.image, {filter: i % 2 ? 'hue-rotate(100deg) saturate(2)' : 'hue-rotate(300deg) saturate(2)'}))}
        </AbsoluteFill>) : null}
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,12,10,.85), transparent 35%, transparent 80%, rgba(0,12,10,.55))'}}/>
      <Dust frame={f} intense/>
      <AbsoluteFill style={{background: WHITE, opacity: cutGlitch ? interpolate(age, [0, .14], [.45, 0], clamp) : 0, mixBlendMode: 'screen'}}/>
      <Equation t={t} e={CIRCLES['short_01.png']} w={width} h={height} vertical/>
      {cue && bigFeel(cue) ? <BigFeel cue={cue} t={t} w={width} h={height} image={cut.image} vertical/> : null}
      {cue && !isEq && !bigFeel(cue) ? <ChalkLine cue={cue} t={t} vertical frame={f} width={width}/> : null}
      <div style={{position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', fontFamily: 'EnshuChalk', color: WHITE,
        textShadow: `4px 0 ${PINK}, -3px 0 ${CYAN}, 0 4px 18px #001813`}}>
        <div style={{fontSize: 96, letterSpacing: 8}}>円周ラブ</div>
        <div style={{fontSize: 34, letterSpacing: 6, opacity: .85}}>数式に恋しました。</div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>;
};
