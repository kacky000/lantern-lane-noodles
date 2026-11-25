// The order board and the shift clock: paper tickets on a rail, each with its bowl, its parts and
// how they are prepped, and a patience bar; the coin purse, the streak and a ring clock that
// reddens and ticks as closing time comes.
import { COLORS, VIEW, STAGE } from './config.js';
import { drawBowl, drawIngredientIcon } from './draw-food.js';
import { INGREDIENTS, PREP_BOIL, PREP_CHOP, PREP_GRILL } from './recipes.js';
import { isRush, payFor } from './orders.js';
import { timeLeft } from './world.js';
import { itemLabel } from './items.js';

const TICKET = { x: 236, y: 14, w: 170, h: 134, gap: 6 };

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function text(ctx, value, x, y, size, color, weight = 700, align = 'left') {
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(value, x, y);
}

function lanternString(ctx, time) {
  ctx.strokeStyle = '#3c2d44';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.quadraticCurveTo(640, 26, 1280, 6);
  ctx.stroke();
  for (let k = 0; k < 14; k += 1) {
    const x = 46 + k * 92;
    const y = 6 + 20 * (1 - ((x - 640) / 640) ** 2) * 0.9;
    const glow = 0.55 + Math.sin(time * 2 + k) * 0.12;
    const g = ctx.createRadialGradient(x, y + 8, 1, x, y + 8, 26);
    g.addColorStop(0, `rgba(255,170,70,${glow})`);
    g.addColorStop(1, 'rgba(255,170,70,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 26, y - 18, 52, 52);
    roundRect(ctx, x - 6, y + 2, 12, 13, 5, k % 3 === 0 ? '#e0473a' : '#ff9e3d');
  }
  ctx.lineWidth = 1;
}

function prepMark(ctx, prep, x, y) {
  if (prep === PREP_CHOP) {
    ctx.fillStyle = '#7e8a96';
    ctx.fillRect(x - 1, y - 5, 3, 7);
    ctx.fillStyle = '#3a2a22';
    ctx.fillRect(x - 1, y + 2, 3, 3);
  } else if (prep === PREP_BOIL || prep === PREP_GRILL) {
    ctx.fillStyle = prep === PREP_BOIL ? '#3fa2ff' : '#ff6a2c';
    ctx.beginPath();
    ctx.moveTo(x, y - 6);
    ctx.quadraticCurveTo(x + 5, y, x, y + 4);
    ctx.quadraticCurveTo(x - 5, y, x, y - 6);
    ctx.fill();
  }
}

function drawTicket(ctx, world, order, x, y, time) {
  const frac = Math.max(0, order.left / order.patience);
  const urgent = frac < 0.3;
  const shake = urgent ? Math.sin(time * 30) * 1.5 : 0;
  const drop = Math.max(0, 1 - order.born * 4) * -40;
  ctx.save();
  ctx.translate(shake, drop);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x + 4, y + 5, TICKET.w, TICKET.h);
  roundRect(ctx, x, y, TICKET.w, TICKET.h, 6, COLORS.paper);
  const band = frac > 0.6 ? COLORS.good : frac > 0.3 ? COLORS.warn : COLORS.bad;
  roundRect(ctx, x, y, TICKET.w, 22, 6, band);
  ctx.fillRect(x, y + 14, TICKET.w, 8);
  text(ctx, order.recipe.name, x + 8, y + 16, 13, '#1d1424', 800);
  drawBowl(ctx, order.recipe.parts, x + 38, y + 64, 31);
  const parts = order.recipe.parts;
  parts.forEach((id, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const ix = x + 87 + col * 29;
    const iy = y + 47 + row * 33;
    roundRect(ctx, ix - 13, iy - 14, 27, 28, 6, '#efe0c2');
    drawIngredientIcon(ctx, id, ix, iy, 11);
    prepMark(ctx, INGREDIENTS[id].prep, ix + 10, iy + 10);
  });
  roundRect(ctx, x + 8, y + TICKET.h - 16, TICKET.w - 16, 9, 4, '#d8c9ab');
  roundRect(ctx, x + 8, y + TICKET.h - 16, (TICKET.w - 16) * frac, 9, 4, band);
  const pay = payFor(world, order);
  text(ctx, `${Math.ceil(order.left)}s`, x + TICKET.w - 10, y + TICKET.h - 21, 11, '#5a4a3a', 800, 'right');
  text(ctx, `◉ ${pay.base}+`, x + 8, y + TICKET.h - 21, 11, '#9a6b12', 800);
  ctx.restore();
}

function drawClock(ctx, world, time) {
  const left = timeLeft(world);
  const cx = 1196;
  const cy = 74;
  const frac = left / world.length;
  const late = left <= 30;
  const pulse = late ? 1 + Math.max(0, Math.sin(time * 6.3)) * 0.06 : 1;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = '#1a1222';
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 9;
  ctx.strokeStyle = '#3b2c47';
  ctx.beginPath();
  ctx.arc(0, 0, 44, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = late ? COLORS.bad : frac < 0.45 ? COLORS.warn : COLORS.good;
  ctx.beginPath();
  ctx.arc(0, 0, 44, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
  ctx.stroke();
  ctx.lineWidth = 1;
  const m = Math.floor(left / 60);
  const s = Math.floor(left % 60).toString().padStart(2, '0');
  text(ctx, `${m}:${s}`, 0, 9, 28, late ? '#ffb3b3' : '#fff6e4', 900, 'center');
  text(ctx, 'TO CLOSE', 0, 28, 10, '#bfaecf', 800, 'center');
  ctx.restore();
}

/** The whole top band: lanterns, title, purse, tickets and clock. */
export function drawHud(ctx, world, time) {
  ctx.fillStyle = COLORS.header;
  ctx.fillRect(0, 0, VIEW.width, STAGE.top);
  ctx.fillStyle = '#5e3a22';
  ctx.fillRect(0, STAGE.top - 8, VIEW.width, 8);
  lanternString(ctx, time);
  text(ctx, 'LANTERN LANE', 16, 52, 24, '#ffb347', 900);
  text(ctx, 'NOODLES', 18, 74, 15, '#ffe6b8', 800);
  roundRect(ctx, 14, 88, 100, 32, 16, '#3b2c47');
  ctx.fillStyle = '#ffd84a';
  ctx.beginPath();
  ctx.arc(31, 104, 10, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, `${world.coins}`, 48, 112, 21, '#fff6e4', 900);
  if (world.combo > 1) {
    roundRect(ctx, 120, 88, 104, 32, 16, '#e0473a');
    text(ctx, `STREAK x${world.combo}`, 172, 109, 14, '#fff6e4', 900, 'center');
  } else text(ctx, `${world.served} served`, 124, 109, 13, '#bfaecf', 700);
  text(ctx, `${world.served} bowls · ${world.missed} walk-outs`, 16, 142, 12, '#bfaecf', 700);
  for (let i = 0; i < 5; i += 1) {
    const x = TICKET.x + i * (TICKET.w + TICKET.gap);
    if (!world.orders[i]) {
      ctx.strokeStyle = 'rgba(255,230,190,0.18)';
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(x, TICKET.y, TICKET.w, TICKET.h);
      ctx.setLineDash([]);
      continue;
    }
    drawTicket(ctx, world, world.orders[i], x, TICKET.y, time);
  }
  drawClock(ctx, world, time);
  if (isRush(world.elapsed)) {
    roundRect(ctx, 1146, 132, 100, 20, 10, COLORS.bad);
    text(ctx, 'RUSH HOUR', 1196, 146, 12, '#fff', 900, 'center');
  }
}

/** A tag under the chef's feet naming what it carries, and a hint line along the bottom. */
export function drawHoldingTag(ctx, world) {
  const hold = world.chef.hold;
  if (!hold) return;
  ctx.font = '700 12px "Trebuchet MS", sans-serif';
  const msg = `Holding: ${itemLabel(hold)}`;
  const w = ctx.measureText(msg).width + 20;
  const x = world.chef.x;
  const y = world.chef.y + 40;
  roundRect(ctx, x - w / 2, y - 13, w, 19, 9, 'rgba(20,12,28,0.78)');
  ctx.fillStyle = '#ffe6b8';
  ctx.textAlign = 'center';
  ctx.fillText(msg, x, y + 1);
}
