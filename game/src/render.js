// Draws one frame: the stall, the chef, the effects, the order board and whichever screen is up.
import { VIEW, STAGE } from './config.js';
import { drawFloor, drawStations, drawChef } from './draw-kitchen.js';
import { drawHud, drawHoldingTag } from './hud.js';
import { drawFx } from './fx.js';
import { drawTitle, drawEnd, drawPause } from './screens.js';
import { stationInReach } from './chef.js';
import { SCREEN_END, SCREEN_PLAY, SCREEN_TITLE } from './world.js';

/** Fits the 1280x720 stage into the canvas, letterboxed. */
export function fitView(canvas, view) {
  const dpr = globalThis.devicePixelRatio || 1;
  const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  view.scale = Math.min(w / VIEW.width, h / VIEW.height);
  view.offsetX = (w - VIEW.width * view.scale) / 2;
  view.offsetY = (h - VIEW.height * view.scale) / 2;
}

/** A point on the 1280x720 stage to kitchen world coordinates. */
export function screenToWorld(x, y) {
  return { x: x / STAGE.scale, y: (y - STAGE.top) / STAGE.scale };
}

function drawBanner(ctx, banner) {
  if (!banner) return;
  const t = banner.age / banner.life;
  const slide = t < 0.15 ? (1 - t / 0.15) * -400 : t > 0.85 ? ((t - 0.85) / 0.15) * 400 : 0;
  ctx.save();
  ctx.translate(slide, 0);
  ctx.fillStyle = 'rgba(200,40,40,0.9)';
  ctx.fillRect(0, 360, VIEW.width, 86);
  ctx.fillStyle = '#ffd84a';
  ctx.fillRect(0, 360, VIEW.width, 5);
  ctx.fillRect(0, 441, VIEW.width, 5);
  ctx.font = '900 46px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff6e4';
  ctx.fillText(banner.text, 640, 408);
  ctx.font = '700 16px "Trebuchet MS", sans-serif';
  ctx.fillText(banner.sub, 640, 432);
  ctx.restore();
}

export function renderFrame(ctx, canvas, view, world, fx, time, paused) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0d0912';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const shake = fx.shake > 0 ? (Math.random() - 0.5) * 10 * fx.shake : 0;
  ctx.setTransform(view.scale, 0, 0, view.scale, view.offsetX + shake, view.offsetY);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, VIEW.width, VIEW.height);
  ctx.clip();
  ctx.save();
  ctx.translate(0, STAGE.top);
  ctx.scale(STAGE.scale, STAGE.scale);
  drawFloor(ctx, time);
  const target = world.screen === SCREEN_PLAY ? stationInReach(world) : null;
  drawStations(ctx, world, time, target);
  drawChef(ctx, world.chef, time);
  drawHoldingTag(ctx, world);
  drawFx(ctx, fx);
  ctx.restore();
  drawHud(ctx, world, time);
  if (fx.flash > 0) {
    ctx.fillStyle = `rgba(255,240,180,${fx.flash * 0.5})`;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }
  drawBanner(ctx, fx.banner);
  if (world.screen === SCREEN_TITLE) drawTitle(ctx, time);
  if (world.screen === SCREEN_END) drawEnd(ctx, world, time);
  if (paused && world.screen === SCREEN_PLAY) drawPause(ctx);
  ctx.restore();
}
