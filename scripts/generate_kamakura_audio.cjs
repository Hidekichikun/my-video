// Original deterministic placeholder footsteps, wind and bird calls.
const fs = require("node:fs"),
  path = require("node:path");
const full = process.argv.includes("--full");
const rate = 44100,
  samples = new Float32Array(rate * (full ? 60 : 15));
let seed = 4123;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return (seed / 4294967296) * 2 - 1;
};
for (let i = 0; i < samples.length; i++) samples[i] = random() * 0.002;
function step(time, gain) {
  let low = 0;
  for (let i = 0; i < rate * 0.15; i++) {
    const at = Math.floor(time * rate) + i;
    if (at >= samples.length) break;
    const t = i / rate;
    low = low * 0.7 + random() * 0.3;
    samples[at] +=
      gain *
      Math.exp(-t * 32) *
      (low * 0.8 + Math.sin(2 * Math.PI * 105 * t) * 0.3);
  }
}
for (let t = 0.25; t < (full ? 6.8 : 4.9); t += full ? 0.73 : 0.52)
  step(t, 0.23);
for (let t = 0.1; t < (full ? 34.8 : 14.8); t += 0.68) step(t, 0.04);
for (const start of full
  ? [1.2, 3.6, 7.2, 11.9, 15.5, 18.2, 23.5, 29.4, 32.6, 44, 49, 58.5]
  : [1.2, 3.6, 7.2, 11.9, 13.5])
  for (let i = 0; i < rate * 0.32; i++) {
    const t = i / rate,
      at = Math.floor(start * rate) + i;
    if (at < samples.length)
      samples[at] +=
        0.022 *
        Math.sin((Math.PI * t) / 0.32) ** 2 *
        Math.sin(2 * Math.PI * (1700 * t + 600 * t * t));
  }
if (full) {
  // Water and quiet cooking textures during the domestic scene.
  let water = 0;
  for (let i = 27 * rate; i < 35 * rate; i++) {
    water = water * 0.8 + random() * 0.2;
    const t = i / rate;
    samples[i] += 0.035 * water * (0.5 + 0.5 * Math.sin(t * 4) ** 2);
    if (random() > 0.998) samples[i] += 0.045;
  }
  // A restrained synthetic temple bell, with inharmonic partials.
  for (let i = 0; i < rate * 6; i++) {
    const t = i / rate,
      at = 43 * rate + i;
    samples[at] +=
      0.09 *
      Math.exp(-t * 0.85) *
      (Math.sin(2 * Math.PI * 220 * t) +
        0.35 * Math.sin(2 * Math.PI * 583 * t) +
        0.18 * Math.sin(2 * Math.PI * 1097 * t));
  }
  // Original comic stomach rumble, synchronized with the on-screen lettering.
  for (let i = 0; i < rate * 1.1; i++) {
    const t = i / rate,
      at = 55 * rate + i;
    samples[at] +=
      0.13 *
      Math.sin((Math.PI * t) / 1.1) ** 2 *
      (Math.sin(2 * Math.PI * (85 * t - 12 * t * t)) + 0.3 * random());
  }
}
const output = Buffer.alloc(44 + samples.length * 2);
output.write("RIFF");
output.writeUInt32LE(output.length - 8, 4);
output.write("WAVEfmt ", 8);
output.writeUInt32LE(16, 16);
output.writeUInt16LE(1, 20);
output.writeUInt16LE(1, 22);
output.writeUInt32LE(rate, 24);
output.writeUInt32LE(rate * 2, 28);
output.writeUInt16LE(2, 32);
output.writeUInt16LE(16, 34);
output.write("data", 36);
output.writeUInt32LE(samples.length * 2, 40);
for (let i = 0; i < samples.length; i++) {
  const fade = Math.min(
    1,
    i / (rate * 0.1),
    (samples.length - i) / (rate * 0.3),
  );
  output.writeInt16LE(
    Math.round(Math.max(-1, Math.min(1, samples[i] * fade)) * 32767),
    44 + i * 2,
  );
}
const destination = path.join(
  __dirname,
  full
    ? "../public/audio/kamakura-full.wav"
    : "../public/audio/kamakura-previs.wav",
);
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, output);
console.log(destination);
