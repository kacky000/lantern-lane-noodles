// The screens around a shift: the title card with the menu and controls, the pause veil, and the
// closing tally with stars, the night's bowls and the best streak.
import { COLORS, VIEW, SCORE } from './config.js';
import { drawBowl } from './draw-food.js';
import { RECIPES } from './recipes.js';
import { starsFor } from './world.js';

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;
  }
}

function text(ctx, value, x, y, size, color, weight = 700, align = 'center') {
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(value, x, y);
}

function star(ctx, x, y, r, filled) {
  ctx.beginPath();
  for (let k = 0; k < 10; k += 1) {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const rr = k % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = filled ? '#ffd84a' : '#3b2c47';
  ctx.fill();
  ctx.strokeStyle = filled ? '#b8860b' : '#5a4866';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.lineWidth = 1;
}

function veil(ctx, alpha) {
  ctx.fillStyle = `rgba(16,10,24,${alpha})`;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

export function drawTitle(ctx, time) {
  veil(ctx, 0.72);
  roundRect(ctx, 290, 150, 700, 450, 22, '#231a2e', '#ff9e3d');
  text(ctx, 'LANTERN LANE NOODLES', 640, 222, 46, '#ffb347', 900);
  text(ctx, 'One night-market stall. One chef. Three minutes until the shutters drop.', 640, 256, 16, '#ffe6b8', 700);
  RECIPES.forEach((recipe, i) => {
    const x = 380 + i * 130;
    const bob = Math.sin(time * 2 + i) * 3;
    drawBowl(ctx, recipe.parts, x, 330 + bob, 40);
    text(ctx, recipe.name, x, 392, 13, '#fff6e4', 800);
  });
  const lines = [
    ['WASD / Arrows', 'walk the kitchen'],
    ['E', 'pick up · put down · fill a bowl · serve'],
    ['SPACE', 'chop on a board'],
    ['Click a counter', 'walk there and use it'],
  ];
  lines.forEach(([key, what], i) => {
    const y = 440 + i * 26;
    roundRect(ctx, 400, y - 17, 150, 22, 6, '#3b2c47');
    text(ctx, key, 475, y - 1, 14, '#ffd84a', 900);
    text(ctx, what, 566, y - 1, 15, '#fff6e4', 600, 'left');
  });
  const blink = 0.6 + Math.sin(time * 4) * 0.4;
  text(ctx, 'Press ENTER or click to open the stall', 640, 572, 22, `rgba(255,216,74,${blink})`, 900);
}

export function drawPause(ctx) {
  veil(ctx, 0.6);
  text(ctx, 'PAUSED', 640, 340, 56, '#ffb347', 900);
  text(ctx, 'Press P to keep cooking', 640, 384, 20, '#fff6e4', 700);
}

export function drawEnd(ctx, world, time) {
  veil(ctx, 0.78);
  roundRect(ctx, 300, 150, 680, 460, 22, '#231a2e', '#ff9e3d');
  text(ctx, 'SHUTTERS DOWN', 640, 214, 44, '#ffb347', 900);
  const stars = starsFor(world.coins);
  for (let k = 0; k < 3; k += 1) star(ctx, 560 + k * 80, 270 - (k === 1 ? 10 : 0), k === 1 ? 34 : 28, k < stars);
  text(ctx, `${world.coins} coins`, 640, 340, 34, '#fff6e4', 900);
  text(ctx, `Stars at ${SCORE.stars.join(' · ')}`, 640, 362, 13, '#bfaecf', 700);
  const rows = [
    ['Bowls served', world.served],
    ['Walk-outs', world.missed],
    ['Best streak', `x${world.bestCombo}`],
  ];
  rows.forEach(([name, value], i) => {
    const y = 404 + i * 30;
    text(ctx, name, 470, y, 18, '#ffe6b8', 700, 'left');
    text(ctx, `${value}`, 810, y, 18, '#fff6e4', 900, 'right');
  });
  RECIPES.forEach((recipe, i) => {
    const x = 410 + i * 115;
    drawBowl(ctx, recipe.parts, x, 520, 26);
    text(ctx, `x${world.servedBy[recipe.id] ?? 0}`, x, 562, 16, '#ffd84a', 900);
  });
  const blink = 0.6 + Math.sin(time * 4) * 0.4;
  text(ctx, 'ENTER for another night', 640, 596, 18, `rgba(255,216,74,${blink})`, 900);
  ctx.fillStyle = COLORS.lantern;
}
