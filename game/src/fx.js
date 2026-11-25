// Juice: floating text over counters, knife chips, steam from the pots, sparks off the grill, coin
// bursts at the pass and a screen-wide banner for the rush.
import { COLORS, GRID } from './config.js';

export function createFx() {
  return { popups: [], bits: [], banner: null, shake: 0, flash: 0 };
}

const POP_COLOR = {
  serve: COLORS.good, nope: COLORS.bad, burnt: COLORS.bad, warn: COLORS.warn,
  cooked: COLORS.good, chopped: COLORS.good, add: '#ffffff', pickup: '#ffe9c4',
};

export function popup(fx, x, y, text, color = '#fff', size = 18) {
  if (!text) return;
  fx.popups.push({ x: Math.min(1180, Math.max(90, x)), y: Math.max(GRID.top + 40, y), text, color, size, life: 1.1, age: 0 });
}

function burst(fx, x, y, count, colors, speed, gravity, size) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const v = speed * (0.4 + Math.random() * 0.8);
    fx.bits.push({ x, y, vx: Math.cos(angle) * v, vy: Math.sin(angle) * v - speed * 0.4, g: gravity, life: 0.5 + Math.random() * 0.5, age: 0, color: colors[i % colors.length], size: size * (0.6 + Math.random() * 0.8) });
  }
}

const CHIP_COLORS = { scallion: ['#7ccf5a', '#e9f5d0'], mushroom: ['#8b5a3c', '#e0c9a6'], tofu: ['#f7f1e1', '#e3d7b9'] };

/** Turns one world event into its popups and particles. */
export function fxForEvent(fx, event) {
  if (event.x !== undefined) popup(fx, event.x, event.y - 18, event.text, POP_COLOR[event.type] ?? '#fff', event.type === 'serve' ? 30 : 17);
  if (event.type === 'chop') burst(fx, event.x, event.y, 6, CHIP_COLORS[event.ing] ?? ['#fff'], 140, 500, 4);
  if (event.type === 'serve') {
    burst(fx, event.x, event.y, 26, ['#ffd84a', '#ffb52e', '#fff4c4'], 260, 420, 6);
    fx.flash = 0.25;
  }
  if (event.type === 'burnt') burst(fx, event.x, event.y, 14, ['#3a3a3a', '#5b5b5b'], 80, -60, 9);
  if (event.type === 'miss') fx.shake = 0.35;
  if (event.type === 'rush') fx.banner = { text: 'RUSH HOUR', sub: 'Tickets come faster. Customers wait less.', life: 2.6, age: 0 };
  if (event.type === 'close') fx.banner = { text: 'SHUTTERS DOWN', sub: '', life: 1.6, age: 0 };
}

/** Steam and sparks that rise from busy pots, grills and the broth all the time. */
export function ambientFx(fx, world, dt, centerOf) {
  for (const station of world.stations) {
    const busy = (station.type === 'pot' || station.type === 'grill') && station.item;
    if (station.type === 'broth' || busy) {
      const rate = station.type === 'grill' ? 14 : 8;
      if (Math.random() < rate * dt) {
        const at = centerOf(station);
        const burnt = station.item && station.item.state === 'burnt';
        const sparks = station.type === 'grill' && !burnt;
        fx.bits.push({ x: at.x + (Math.random() - 0.5) * 30, y: at.y - 4, vx: (Math.random() - 0.5) * 20, vy: sparks ? -120 : -40, g: sparks ? 160 : -10, life: sparks ? 0.5 : 1.4, age: 0, color: burnt ? '#2e2e2e' : sparks ? '#ffb347' : 'rgba(255,255,255,0.22)', size: sparks ? 2.5 : 5, soft: !sparks });
      }
    }
  }
}

export function tickFx(fx, dt) {
  for (const p of fx.popups) {
    p.age += dt;
    p.y -= 34 * dt;
  }
  fx.popups = fx.popups.filter((p) => p.age < p.life);
  for (const b of fx.bits) {
    b.age += dt;
    b.vy += b.g * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }
  fx.bits = fx.bits.filter((b) => b.age < b.life);
  if (fx.banner) {
    fx.banner.age += dt;
    if (fx.banner.age > fx.banner.life) fx.banner = null;
  }
  fx.shake = Math.max(0, fx.shake - dt);
  fx.flash = Math.max(0, fx.flash - dt);
}

export function drawFx(ctx, fx) {
  for (const b of fx.bits) {
    const fade = 1 - b.age / b.life;
    ctx.globalAlpha = fade;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.soft ? b.size * (1 + b.age) : b.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  for (const p of fx.popups) {
    const fade = Math.min(1, (p.life - p.age) * 3);
    ctx.globalAlpha = fade;
    ctx.font = `800 ${p.size}px "Trebuchet MS", "Segoe UI", sans-serif`;
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(20,12,28,0.85)';
    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}
