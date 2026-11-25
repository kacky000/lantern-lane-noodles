// Every sound is synthesised on the spot with Web Audio: knife taps, the sizzle of the grill, the
// pass bell, a sour buzz for a walk-out and a ticking clock in the last ten seconds. No sound files.

let ctx = null;
let master = null;
let muted = false;

function ready() {
  if (muted) return null;
  if (!ctx) {
    const Ctor = globalThis.AudioContext ?? globalThis.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.35;
  return muted;
}

function tone(freq, start, length, type = 'sine', volume = 0.4, slide = 0) {
  const audio = ready();
  if (!audio) return;
  const t = audio.currentTime + start;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + length);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + length);
  osc.connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + length + 0.02);
}

function noise(start, length, volume, filterFreq) {
  const audio = ready();
  if (!audio) return;
  const frames = Math.floor(audio.sampleRate * length);
  const buffer = audio.createBuffer(1, frames, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  gain.gain.value = volume;
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(master);
  source.start(audio.currentTime + start);
}

export const sfx = {
  chop: () => { noise(0, 0.05, 0.9, 2600); tone(180, 0, 0.06, 'triangle', 0.3); },
  chopped: () => { tone(660, 0, 0.08, 'triangle', 0.3); tone(990, 0.07, 0.1, 'triangle', 0.25); },
  pickup: () => tone(520, 0, 0.07, 'sine', 0.25, 160),
  place: () => tone(300, 0, 0.08, 'triangle', 0.25, -60),
  add: () => { tone(700, 0, 0.06, 'sine', 0.25); tone(880, 0.05, 0.08, 'sine', 0.2); },
  nope: () => tone(160, 0, 0.14, 'square', 0.12, -40),
  cooked: () => { tone(880, 0, 0.12, 'sine', 0.3); tone(1320, 0.1, 0.18, 'sine', 0.25); },
  warn: () => { tone(740, 0, 0.08, 'square', 0.12); tone(740, 0.14, 0.08, 'square', 0.12); },
  burnt: () => noise(0, 0.4, 0.5, 600),
  sizzle: () => noise(0, 0.12, 0.12, 5200),
  serve: () => { tone(1046, 0, 0.5, 'sine', 0.35); tone(1568, 0.02, 0.6, 'sine', 0.2); tone(784, 0.12, 0.4, 'triangle', 0.18); },
  miss: () => { tone(220, 0, 0.3, 'sawtooth', 0.15, -80); tone(165, 0.18, 0.4, 'sawtooth', 0.15, -60); },
  order: () => { tone(1200, 0, 0.05, 'square', 0.08); tone(1500, 0.06, 0.05, 'square', 0.08); },
  tick: () => tone(1800, 0, 0.03, 'square', 0.08),
  rush: () => [0, 0.12, 0.24].forEach((at, i) => tone(523 * (1 + i * 0.26), at, 0.18, 'square', 0.12)),
  close: () => [784, 659, 523, 392].forEach((f, i) => tone(f, i * 0.16, 0.3, 'triangle', 0.25)),
  trash: () => noise(0, 0.15, 0.4, 900),
};

/** Plays the sound for one world event. */
export function playEvent(event) {
  const play = sfx[event.type];
  if (play) play();
}
