// Food drawn in code: every ingredient in its raw, prepped and burnt look, and a bowl that shows
// its broth, its nest of noodles and each topping in its own place around the rim.

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function noodleNest(ctx, x, y, r, color, shine) {
  ctx.lineCap = 'round';
  for (let k = 0; k < 7; k += 1) {
    ctx.strokeStyle = k % 2 ? color : shine;
    ctx.lineWidth = Math.max(1.5, r * 0.13);
    ctx.beginPath();
    const rr = r * (0.25 + k * 0.1);
    ctx.ellipse(x + Math.sin(k * 2.1) * r * 0.12, y + Math.cos(k * 1.7) * r * 0.1, rr, rr * 0.8, k * 0.7, 0.3, Math.PI * 1.75);
    ctx.stroke();
  }
}

function scallionRings(ctx, x, y, r) {
  for (let k = 0; k < 6; k += 1) {
    const a = k * 1.05;
    const px = x + Math.cos(a) * r * 0.45;
    const py = y + Math.sin(a) * r * 0.4;
    ctx.strokeStyle = '#4fae3c';
    ctx.lineWidth = Math.max(1.5, r * 0.16);
    ctx.beginPath();
    ctx.arc(px, py, r * 0.22, 0, Math.PI * 2);
    ctx.stroke();
    circle(ctx, px, py, r * 0.1, '#d9f2b8');
  }
}

function mushroomSlices(ctx, x, y, r) {
  for (let k = 0; k < 4; k += 1) {
    const a = k * 1.6 + 0.4;
    const px = x + Math.cos(a) * r * 0.35;
    const py = y + Math.sin(a) * r * 0.3;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(a);
    ctx.fillStyle = '#e8d3b0';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.38, r * 0.2, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#7a4a2c';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.03, r * 0.38, r * 0.16, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#d9c09a';
    ctx.fillRect(-r * 0.06, -r * 0.02, r * 0.12, r * 0.22);
    ctx.restore();
  }
}

function tofuCubes(ctx, x, y, r) {
  const c = r * 0.32;
  for (const [dx, dy] of [[-0.4, -0.3], [0.25, -0.35], [-0.1, 0.25], [0.45, 0.2]]) {
    const px = x + dx * r;
    const py = y + dy * r;
    ctx.fillStyle = '#d8ccaa';
    ctx.fillRect(px - c / 2 + 2, py - c / 2 + 2, c, c);
    ctx.fillStyle = '#fbf6e6';
    ctx.fillRect(px - c / 2, py - c / 2, c, c);
  }
}

function shrimp(ctx, x, y, r, state) {
  const body = state === 'burnt' ? '#2f2622' : state === 'cooked' ? '#ff8a5c' : '#c9b5b0';
  const stripe = state === 'burnt' ? '#1b1512' : state === 'cooked' ? '#ffd3b8' : '#9d8c88';
  ctx.lineCap = 'round';
  ctx.strokeStyle = body;
  ctx.lineWidth = r * 0.5;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.5, Math.PI * 0.15, Math.PI * 1.55);
  ctx.stroke();
  ctx.strokeStyle = stripe;
  ctx.lineWidth = Math.max(1, r * 0.08);
  for (let k = 0; k < 4; k += 1) {
    const a = Math.PI * (0.35 + k * 0.3);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r * 0.28, y + Math.sin(a) * r * 0.28);
    ctx.lineTo(x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72);
    ctx.stroke();
  }
  ctx.fillStyle = state === 'burnt' ? '#1b1512' : state === 'cooked' ? '#ff6a3d' : '#b49c97';
  ctx.beginPath();
  const tx = x + Math.cos(Math.PI * 0.15) * r * 0.5;
  const ty = y + Math.sin(Math.PI * 0.15) * r * 0.5;
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx + r * 0.4, ty + r * 0.15);
  ctx.lineTo(tx + r * 0.2, ty + r * 0.4);
  ctx.fill();
}

function egg(ctx, x, y, r) {
  ctx.fillStyle = '#c98f4f';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.62, r * 0.5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fffaf0';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.54, r * 0.42, -0.3, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, x + r * 0.04, y, r * 0.27, '#ff9f1c');
  circle(ctx, x - r * 0.04, y - r * 0.06, r * 0.08, '#ffd27a');
}

function chili(ctx, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.6);
  const grad = ctx.createLinearGradient(0, -r * 0.3, 0, r * 0.3);
  grad.addColorStop(0, '#ff5a4a');
  grad.addColorStop(1, '#b3121b');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-r * 0.55, -r * 0.18);
  ctx.quadraticCurveTo(r * 0.3, -r * 0.35, r * 0.75, r * 0.1);
  ctx.quadraticCurveTo(r * 0.2, r * 0.05, -r * 0.55, r * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3f9c35';
  ctx.fillRect(-r * 0.75, -r * 0.1, r * 0.25, r * 0.2);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillRect(-r * 0.3, -r * 0.16, r * 0.5, r * 0.06);
  ctx.restore();
}

function chiliFlakes(ctx, x, y, r) {
  for (let k = 0; k < 7; k += 1) circle(ctx, x + Math.cos(k * 2.3) * r * 0.4, y + Math.sin(k * 2.3) * r * 0.35, r * 0.09, k % 2 ? '#e0301e' : '#ff6b3d');
}

/** One ingredient as it looks on a counter or in the chef's hands; `r` is its radius in px. */
export function drawIngredient(ctx, item, x, y, r) {
  const { id, state } = item;
  ctx.save();
  if (id === 'noodles') {
    if (state === 'raw') {
      ctx.fillStyle = '#f1dfa4';
      ctx.fillRect(x - r * 0.8, y - r * 0.45, r * 1.6, r * 0.9);
      ctx.strokeStyle = '#d6bd75';
      ctx.lineWidth = 1.5;
      for (let k = -3; k <= 3; k += 1) {
        ctx.beginPath();
        ctx.moveTo(x - r * 0.8, y + k * r * 0.12);
        ctx.lineTo(x + r * 0.8, y + k * r * 0.12);
        ctx.stroke();
      }
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(x - r * 0.12, y - r * 0.46, r * 0.24, r * 0.92);
    } else noodleNest(ctx, x, y, r, state === 'burnt' ? '#3b2a1c' : '#f2c14e', state === 'burnt' ? '#22170f' : '#ffe08a');
  } else if (id === 'scallion') {
    if (state === 'raw') {
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#47a23a';
      ctx.lineWidth = r * 0.28;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.8, y + r * 0.3);
      ctx.lineTo(x + r * 0.4, y - r * 0.4);
      ctx.stroke();
      ctx.strokeStyle = '#eef6d8';
      ctx.beginPath();
      ctx.moveTo(x + r * 0.4, y - r * 0.4);
      ctx.lineTo(x + r * 0.8, y - r * 0.62);
      ctx.stroke();
    } else scallionRings(ctx, x, y, r);
  } else if (id === 'mushroom') {
    if (state === 'raw') {
      circle(ctx, x, y, r * 0.7, '#7a4a2c');
      circle(ctx, x - r * 0.15, y - r * 0.15, r * 0.45, '#8f5b39');
      ctx.strokeStyle = '#f1e2c6';
      ctx.lineWidth = r * 0.1;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.35, y - r * 0.35);
      ctx.lineTo(x + r * 0.35, y + r * 0.35);
      ctx.moveTo(x + r * 0.35, y - r * 0.35);
      ctx.lineTo(x - r * 0.35, y + r * 0.35);
      ctx.stroke();
    } else mushroomSlices(ctx, x, y, r);
  } else if (id === 'tofu') {
    if (state === 'raw') {
      ctx.fillStyle = '#d8ccaa';
      ctx.fillRect(x - r * 0.62, y - r * 0.42, r * 1.3, r * 0.95);
      ctx.fillStyle = '#fbf6e6';
      ctx.fillRect(x - r * 0.7, y - r * 0.5, r * 1.3, r * 0.92);
    } else tofuCubes(ctx, x, y, r);
  } else if (id === 'shrimp') shrimp(ctx, x, y, r, state);
  else if (id === 'egg') egg(ctx, x, y, r);
  else if (id === 'chili') chili(ctx, x, y, r);
  ctx.restore();
}

/** Where each topping sits in a bowl, as an angle around the rim. */
const TOPPING_ANGLE = { scallion: -2.3, mushroom: 2.4, tofu: 0.9, shrimp: -0.6, egg: -1.5, chili: 1.8 };

/** A bowl from above with whatever it holds; `glow` rings it when it is ready to serve. */
export function drawBowl(ctx, parts, x, y, r, glow = 0) {
  ctx.save();
  if (glow > 0) {
    ctx.shadowColor = `rgba(110,255,150,${0.9 * glow})`;
    ctx.shadowBlur = 22;
  }
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(x + 3, y + 5, r * 1.02, r * 0.98, 0, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, x, y, r, '#f6efe3');
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#2f5d8a';
  ctx.lineWidth = Math.max(1.5, r * 0.07);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
  ctx.stroke();
  for (let k = 0; k < 12; k += 1) {
    const a = (k / 12) * Math.PI * 2;
    circle(ctx, x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95, r * 0.035, '#2f5d8a');
  }
  const inner = r * 0.82;
  const hasBroth = parts.includes('broth');
  const fill = ctx.createRadialGradient(x - inner * 0.3, y - inner * 0.3, inner * 0.1, x, y, inner);
  if (hasBroth) {
    fill.addColorStop(0, '#f4b866');
    fill.addColorStop(1, '#b8651f');
  } else {
    fill.addColorStop(0, '#efe5d4');
    fill.addColorStop(1, '#cdbfa6');
  }
  circle(ctx, x, y, inner, fill);
  if (hasBroth) {
    for (let k = 0; k < 5; k += 1) circle(ctx, x + Math.cos(k * 2.6) * inner * 0.6, y + Math.sin(k * 2.6) * inner * 0.55, inner * 0.06, 'rgba(255,230,160,0.7)');
  }
  if (parts.includes('noodles')) noodleNest(ctx, x, y, inner * 0.62, '#f2c14e', '#ffe08a');
  for (const part of parts) {
    const angle = TOPPING_ANGLE[part];
    if (angle === undefined) continue;
    const tx = x + Math.cos(angle) * inner * 0.55;
    const ty = y + Math.sin(angle) * inner * 0.55;
    const tr = inner * 0.42;
    if (part === 'scallion') scallionRings(ctx, tx, ty, tr);
    else if (part === 'mushroom') mushroomSlices(ctx, tx, ty, tr);
    else if (part === 'tofu') tofuCubes(ctx, tx, ty, tr);
    else if (part === 'shrimp') shrimp(ctx, tx, ty, tr, 'cooked');
    else if (part === 'egg') egg(ctx, tx, ty, tr * 1.1);
    else if (part === 'chili') chiliFlakes(ctx, tx, ty, tr);
  }
  ctx.restore();
}

/** A small round icon of one ingredient for tickets and labels. */
export function drawIngredientIcon(ctx, id, x, y, r) {
  if (id === 'broth') {
    circle(ctx, x, y, r, '#f6efe3');
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r * 0.8);
    g.addColorStop(0, '#f4b866');
    g.addColorStop(1, '#b8651f');
    circle(ctx, x, y, r * 0.78, g);
    return;
  }
  const prepped = { id, state: id === 'noodles' || id === 'shrimp' ? 'cooked' : id === 'egg' || id === 'chili' ? 'raw' : 'chopped' };
  drawIngredient(ctx, prepped, x, y, r);
}
