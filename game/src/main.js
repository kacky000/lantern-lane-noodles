// Boots Lantern Lane Noodles: sizes the canvas, runs the frame loop (input → rules → sounds and
// effects → drawing), and switches between title, shift, pause and the closing tally.
// With ?shot=<name>&seed=<n> it draws one scripted scene and marks the page ready for a screenshot.
import { createInput } from './input.js';
import { createWorld, startShift, stepWorld, timeLeft, SCREEN_END, SCREEN_PLAY, SCREEN_TITLE } from './world.js';
import { createFx, fxForEvent, tickFx, ambientFx } from './fx.js';
import { renderFrame, fitView } from './render.js';
import { playEvent, sfx, toggleMute } from './audio.js';
import { buildShot } from './shots.js';
import { tileCenter, tileOf } from './layout.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const view = { scale: 1, offsetX: 0, offsetY: 0 };
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') ?? Date.now() % 100000) || 1;

function runShot(name) {
  const { world, fx } = buildShot(name, seed);
  canvas.style.width = '1280px';
  canvas.style.height = '720px';
  const draw = () => {
    fitView(canvas, view);
    renderFrame(ctx, canvas, view, world, fx, 4.2, false);
  };
  draw();
  requestAnimationFrame(() => {
    draw();
    document.title = 'shot-ready';
  });
}

function runGame() {
  const input = createInput(canvas, view);
  let world = createWorld(seed);
  let fx = createFx();
  let paused = false;
  let last = performance.now();
  let clock = 0;
  let lastTick = 0;
  let sizzleIn = 0;

  const announce = (message) => {
    status.textContent = message;
  };

  function begin() {
    startShift(world);
    fx = createFx();
    paused = false;
    announce('The stall is open. Orders are coming in.');
  }

  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    clock += dt;
    const controls = input.take();
    if (controls.mute) toggleMute();
    if (world.screen === SCREEN_TITLE || world.screen === SCREEN_END) {
      if (controls.start || controls.use || (world.screen === SCREEN_TITLE && controls.clicks.length)) begin();
    } else if (world.screen === SCREEN_PLAY) {
      if (controls.pause) paused = !paused;
      if (!paused) {
        const click = controls.clicks.length ? controls.clicks[controls.clicks.length - 1] : null;
        const tile = click ? tileOf(click.x, click.y) : null;
        stepWorld(world, dt, { moveX: controls.moveX, moveY: controls.moveY, use: controls.use, chop: controls.chop, click: tile });
        const left = Math.ceil(timeLeft(world));
        if (left <= 10 && left !== lastTick && world.screen === SCREEN_PLAY) {
          lastTick = left;
          sfx.tick();
        }
        sizzleIn -= dt;
        if (sizzleIn <= 0 && world.stations.some((s) => s.type === 'grill' && s.item)) {
          sfx.sizzle();
          sizzleIn = 0.35;
        }
      }
    }
    for (const event of world.events) {
      playEvent(event);
      fxForEvent(fx, event);
      if (event.type === 'serve') announce(`Served ${event.recipe}. ${event.text} coins.`);
      if (event.type === 'miss') announce(event.text);
      if (event.type === 'order') announce(`New order: ${event.text}`);
      if (event.type === 'close') announce(`Shutters down. ${world.coins} coins.`);
    }
    world.events.length = 0;
    if (!paused) {
      ambientFx(fx, world, dt, (s) => tileCenter(s.col, s.row));
      tickFx(fx, dt);
    }
    fitView(canvas, view);
    renderFrame(ctx, canvas, view, world, fx, clock, paused);
    requestAnimationFrame(frame);
  }

  addEventListener('resize', () => fitView(canvas, view));
  requestAnimationFrame((now) => {
    last = now;
    frame(now);
  });
  return world;
}

if (shot) runShot(shot);
else runGame();
