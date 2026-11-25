// The stall itself: tiled floor, wooden counters, every station with its label, what sits on each
// counter, cook and chop meters, the counter in reach outlined, and the chef with what it carries.
import { COLORS, GRID, TILE } from './config.js';
import { drawBowl, drawIngredient } from './draw-food.js';
import { heatProgress } from './cooking.js';
import { recipeOfParts } from './recipes.js';
import { tileCenter } from './layout.js';

const LABEL = { bin: null, board: 'CHOP', pot: 'BOIL', grill: 'GRILL', broth: 'BROTH', bowls: 'BOWLS', trash: 'TRASH', hatch: null };
const BIN_LABEL = { noodles: 'NOODLES', scallion: 'SCALLION', mushroom: 'SHIITAKE', tofu: 'TOFU', egg: 'EGGS', chili: 'CHILI', shrimp: 'SHRIMP' };

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

export function drawFloor(ctx, time) {
  for (let row = 1; row < GRID.rows - 1; row += 1) {
    for (let col = 1; col < GRID.cols - 1; col += 1) {
      const x = col * TILE;
      const y = GRID.top + row * TILE;
      rect(ctx, x, y, TILE, TILE, (col + row) % 2 ? COLORS.floorA : COLORS.floorB);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(x + 4, y + 4, TILE / 2 - 4, TILE / 2 - 4);
    }
  }
  drawRug(ctx, 4 * TILE + 20, GRID.top + 2 * TILE + 14, 7 * TILE - 40, 3 * TILE - 28);
  for (const [px, py] of [[200, 250], [500, 110], [840, 330], [720, 220]]) {
    const pool = ctx.createRadialGradient(px, py, 4, px, py, 130);
    pool.addColorStop(0, 'rgba(255,190,110,0.16)');
    pool.addColorStop(1, 'rgba(255,190,110,0)');
    ctx.fillStyle = pool;
    ctx.fillRect(px - 130, py - 130, 260, 260);
  }
  const glow = ctx.createRadialGradient(512, GRID.top + 224, 60, 512, GRID.top + 224, 600);
  glow.addColorStop(0, `rgba(255,170,80,${0.1 + Math.sin(time * 1.3) * 0.015})`);
  glow.addColorStop(1, 'rgba(10,5,20,0.35)');
  ctx.fillStyle = glow;
  ctx.fillRect(TILE, GRID.top + TILE, TILE * (GRID.cols - 2), TILE * (GRID.rows - 2));
}

/** The woven mat under the plating island, red with a gold lantern border. */
function drawRug(ctx, x, y, w, h) {
  roundRect(ctx, x, y, w, h, 14, '#7c2230');
  ctx.strokeStyle = '#e8b931';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x + 8, y + 8, w - 16, h - 16, 10);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.fillStyle = 'rgba(232,185,49,0.55)';
  for (let k = 0; k * 34 < w - 40; k += 1) {
    const px = x + 24 + k * 34;
    for (const py of [y + 20, y + h - 20]) {
      ctx.beginPath();
      ctx.ellipse(px, py, 5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function counterTop(ctx, x, y) {
  rect(ctx, x, y, TILE, TILE, COLORS.woodEdge);
  rect(ctx, x + 2, y + 2, TILE - 4, TILE - 8, COLORS.wood);
  rect(ctx, x + 4, y + 4, TILE - 8, TILE - 14, COLORS.woodTop);
  ctx.strokeStyle = 'rgba(94,58,34,0.35)';
  ctx.lineWidth = 1;
  for (let k = 1; k < 4; k += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 4 + k * 12);
    ctx.lineTo(x + TILE - 6, y + 4 + k * 12 + (k % 2 ? 2 : -2));
    ctx.stroke();
  }
}

function label(ctx, text, x, y) {
  ctx.font = '700 10px "Trebuchet MS", "Segoe UI", sans-serif';
  const w = ctx.measureText(text).width + 8;
  roundRect(ctx, x - w / 2, y - 7, w, 13, 4, 'rgba(25,15,30,0.82)');
  ctx.fillStyle = '#ffe6b8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.textBaseline = 'alphabetic';
}

function drawBin(ctx, station, x, y, cx, cy) {
  roundRect(ctx, x + 5, y + 6, TILE - 10, TILE - 16, 6, '#5a3a22');
  roundRect(ctx, x + 8, y + 9, TILE - 16, TILE - 22, 4, '#2d1d14');
  const raw = { id: station.ing, state: 'raw' };
  drawIngredient(ctx, raw, cx - 9, cy - 5, 13);
  drawIngredient(ctx, raw, cx + 9, cy - 2, 13);
  drawIngredient(ctx, raw, cx, cy + 4, 14);
}

function drawBoard(ctx, x, y, cx, cy) {
  roundRect(ctx, x + 7, y + 8, TILE - 14, TILE - 20, 6, '#e2c08e', '#b38b57');
  ctx.fillStyle = '#c8cfd6';
  ctx.fillRect(x + TILE - 18, y + 10, 5, 22);
  ctx.fillStyle = '#3a2a22';
  ctx.fillRect(x + TILE - 18, y + 32, 5, 10);
  ctx.strokeStyle = 'rgba(150,110,60,0.5)';
  ctx.beginPath();
  ctx.moveTo(cx - 18, cy + 8);
  ctx.lineTo(cx + 6, cy - 12);
  ctx.stroke();
}

function drawStove(ctx, station, x, y, cx, cy, time) {
  roundRect(ctx, x + 4, y + 4, TILE - 8, TILE - 12, 6, '#3d4652');
  const on = Boolean(station.item);
  for (let k = 0; k < 10; k += 1) {
    const a = (k / 10) * Math.PI * 2;
    const flick = on ? 3 + Math.sin(time * 18 + k) * 1.5 : 1.5;
    ctx.fillStyle = on ? '#4fb3ff' : '#55606c';
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * 22, cy - 2 + Math.sin(a) * 22, flick, 0, Math.PI * 2);
    ctx.fill();
  }
  if (station.type === 'pot') {
    ctx.fillStyle = '#7f8c99';
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 21, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5c6b78';
    ctx.fillRect(cx + 19, cy - 5, 10, 6);
    const water = ctx.createRadialGradient(cx - 6, cy - 8, 2, cx, cy - 2, 18);
    water.addColorStop(0, '#d6eef7');
    water.addColorStop(1, '#7fb2c7');
    ctx.fillStyle = water;
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 17, 0, Math.PI * 2);
    ctx.fill();
    if (on) {
      for (let k = 0; k < 5; k += 1) {
        const bob = (time * 2 + k * 0.37) % 1;
        ctx.strokeStyle = `rgba(255,255,255,${0.8 - bob * 0.6})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(k * 2.2) * 10, cy - 2 + Math.sin(k * 2.2) * 9, 2 + bob * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  } else {
    roundRect(ctx, x + 8, y + 9, TILE - 16, TILE - 22, 4, '#1d1f24');
    ctx.strokeStyle = '#5b5f68';
    ctx.lineWidth = 3;
    for (let k = 0; k < 5; k += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 13 + k * 7);
      ctx.lineTo(x + TILE - 12, y + 13 + k * 7);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
    if (on) {
      ctx.fillStyle = `rgba(255,120,40,${0.25 + Math.sin(time * 9) * 0.1})`;
      ctx.fillRect(x + 8, y + 9, TILE - 16, TILE - 22);
    }
  }
}

function drawBroth(ctx, x, y, cx, cy, time) {
  ctx.fillStyle = '#7a3e1d';
  ctx.beginPath();
  ctx.arc(cx, cy - 2, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c4712f';
  ctx.beginPath();
  ctx.arc(cx, cy - 2, 23, 0, Math.PI * 2);
  ctx.fill();
  const g = ctx.createRadialGradient(cx - 6, cy - 8, 2, cx, cy - 2, 20);
  g.addColorStop(0, '#f7c072');
  g.addColorStop(1, '#a95a1a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy - 2, 19, 0, Math.PI * 2);
  ctx.fill();
  for (let k = 0; k < 4; k += 1) {
    const r = 3 + ((time * 0.8 + k * 0.25) % 1) * 6;
    ctx.strokeStyle = 'rgba(255,225,160,0.5)';
    ctx.beginPath();
    ctx.arc(cx + Math.cos(k * 1.9) * 9, cy - 2 + Math.sin(k * 1.9) * 8, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = '#d7dde2';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx + 4, cy - 4);
  ctx.lineTo(cx + 24, cy - 22);
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawBowlStack(ctx, cx, cy) {
  for (let k = 3; k >= 0; k -= 1) drawBowl(ctx, [], cx - 4 + k * 2.5, cy - 2 - k * 3, 17);
}

function drawTrash(ctx, cx, cy) {
  ctx.fillStyle = '#4b5560';
  ctx.beginPath();
  ctx.arc(cx, cy - 2, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a3038';
  ctx.beginPath();
  ctx.arc(cx, cy - 2, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8a96a3';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 10);
  ctx.lineTo(cx + 8, cy + 6);
  ctx.moveTo(cx + 8, cy - 10);
  ctx.lineTo(cx - 8, cy + 6);
  ctx.stroke();
  ctx.lineWidth = 1;
}

/** The serving window on the right wall: a lit hatch with a bell and the night street beyond. */
export function drawHatch(ctx, time) {
  const x = (GRID.cols - 1) * TILE;
  const y = GRID.top + 2 * TILE;
  const h = TILE * 3;
  rect(ctx, x, y, TILE, h, '#3a2416');
  const street = ctx.createLinearGradient(x, y, x + TILE, y);
  street.addColorStop(0, '#ffcf7a');
  street.addColorStop(1, '#ff8f3d');
  roundRect(ctx, x + 8, y + 8, TILE - 14, h - 16, 6, street);
  ctx.fillStyle = 'rgba(60,20,40,0.35)';
  for (let k = 0; k < 4; k += 1) {
    ctx.beginPath();
    ctx.arc(x + 40, y + 30 + k * 44, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 30, y + 40 + k * 44, 20, 16);
  }
  rect(ctx, x + 2, y, 8, h, '#b07a4b');
  ctx.save();
  ctx.translate(x + 30, y - 6);
  ctx.rotate(-Math.PI / 2);
  ctx.restore();
  roundRect(ctx, x - 6, y - 26, 70, 22, 6, '#c0392b');
  ctx.fillStyle = '#fff4dc';
  ctx.font = '800 13px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PASS ▶', x + 29, y - 10);
  const swing = Math.sin(time * 2) * 0.15;
  ctx.save();
  ctx.translate(x + 18, y + h - 22);
  ctx.rotate(swing);
  ctx.fillStyle = '#e8b931';
  ctx.beginPath();
  ctx.arc(0, 0, 9, Math.PI, 0);
  ctx.lineTo(10, 4);
  ctx.lineTo(-10, 4);
  ctx.fill();
  ctx.restore();
}

/** Every counter and station with its contents, meters and labels. */
export function drawStations(ctx, world, time, target) {
  for (const station of world.stations) {
    if (station.type === 'hatch') continue;
    const x = station.col * TILE;
    const y = GRID.top + station.row * TILE;
    const { x: cx, y: cy } = tileCenter(station.col, station.row);
    counterTop(ctx, x, y);
    if (station.type === 'bin') drawBin(ctx, station, x, y, cx, cy);
    else if (station.type === 'board') drawBoard(ctx, x, y, cx, cy);
    else if (station.type === 'pot' || station.type === 'grill') drawStove(ctx, station, x, y, cx, cy, time);
    else if (station.type === 'broth') drawBroth(ctx, x, y, cx, cy, time);
    else if (station.type === 'bowls') drawBowlStack(ctx, cx, cy);
    else if (station.type === 'trash') drawTrash(ctx, cx, cy);
    if (station.item) drawCounterItem(ctx, station, cx, cy, time);
    const text = station.type === 'bin' ? BIN_LABEL[station.ing] : LABEL[station.type];
    if (text) {
      const ly = station.row === 0 ? y + TILE - 7 : station.row === GRID.rows - 1 ? y + 8 : y + TILE - 7;
      label(ctx, text, cx, ly);
    }
  }
  drawHatch(ctx, time);
  if (target) {
    const x = target.col * TILE;
    const y = GRID.top + target.row * TILE;
    ctx.strokeStyle = `rgba(255,236,150,${0.75 + Math.sin(time * 8) * 0.25})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 5]);
    ctx.strokeRect(x + 2, y + 2, TILE - 4, TILE - 4);
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
  }
}

function meterRing(ctx, cx, cy, r, fraction, color, back = 'rgba(0,0,0,0.55)') {
  ctx.lineWidth = 5;
  ctx.strokeStyle = back;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, fraction));
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawCounterItem(ctx, station, cx, cy, time) {
  const item = station.item;
  if (item.kind === 'bowl') {
    const ready = recipeOfParts(item.parts);
    drawBowl(ctx, item.parts, cx, cy - 2, 27, ready ? 0.7 + Math.sin(time * 5) * 0.3 : 0);
    if (ready) {
      roundRect(ctx, cx - 26, cy - 34, 52, 15, 7, COLORS.good);
      ctx.fillStyle = '#0d2a14';
      ctx.font = '800 10px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('READY ✓', cx, cy - 23);
    }
    return;
  }
  if (station.type === 'pot' || station.type === 'grill') {
    drawIngredient(ctx, item, cx, cy - 2, station.type === 'pot' ? 13 : 16);
    const p = heatProgress(station);
    if (p < 1) meterRing(ctx, cx, cy - 2, 28, p, COLORS.good);
    else if (item.state === 'cooked') {
      const danger = p - 1;
      const blink = danger > 0.55 && Math.sin(time * 16) > 0;
      meterRing(ctx, cx, cy - 2, 28, danger, blink ? '#ffffff' : danger > 0.55 ? COLORS.bad : COLORS.warn, 'rgba(95,208,122,0.9)');
      if (danger > 0.55) {
        ctx.fillStyle = blink ? COLORS.bad : '#fff';
        ctx.font = '900 20px "Trebuchet MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', cx + 24, cy - 22);
      }
    }
    return;
  }
  drawIngredient(ctx, item, cx, cy - 2, 21);
  if (station.type === 'board' && item.state === 'raw' && item.chop > 0) {
    roundRect(ctx, cx - 22, cy + 16, 44, 7, 3, 'rgba(0,0,0,0.6)');
    roundRect(ctx, cx - 21, cy + 17, 42 * (item.chop / 5), 5, 2, COLORS.warn);
  }
}

/** The chef from above: toque, shoulders, apron, and its hands held toward where it faces. */
export function drawChef(ctx, chef, time) {
  const bob = Math.sin(chef.walk) * 2.5;
  const { x, faceX, faceY } = chef;
  const y = chef.y + bob * 0.3;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x + 2, chef.y + 18, 22, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  const angle = Math.atan2(faceY, faceX);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const chopSwing = chef.chopAnim * 0.6;
  ctx.fillStyle = '#f0c9a0';
  ctx.beginPath();
  ctx.arc(20 + bob, -12 - chopSwing * 10, 6, 0, Math.PI * 2);
  ctx.arc(20 - bob, 12, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e94f37';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 21, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(4, 0, 10, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#f0c9a0';
  ctx.beginPath();
  ctx.arc(x, y - 2, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - 5, y - 6, 8, 0, Math.PI * 2);
  ctx.arc(x + 5, y - 6, 8, 0, Math.PI * 2);
  ctx.arc(x, y - 11, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d9d2c5';
  ctx.stroke();
  if (chef.hold) {
    const hx = x + faceX * 30;
    const hy = y + faceY * 26 - 4;
    if (chef.hold.kind === 'bowl') {
      const ready = recipeOfParts(chef.hold.parts);
      drawBowl(ctx, chef.hold.parts, hx, hy, 23, ready ? 0.6 + Math.sin(time * 5) * 0.3 : 0);
    } else drawIngredient(ctx, chef.hold, hx, hy, 18);
  }
}
