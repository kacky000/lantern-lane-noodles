// The screenshot scenes behind ?shot=rush|title|serve|end. Each plays the real rules from a fresh
// shift: a scripted chef walks to counters and presses the same use and chop verbs a player does,
// and the clock runs through stepWorld, so pots really boil and tickets really lose patience.
import { createFx, fxForEvent, tickFx, ambientFx } from './fx.js';
import { createWorld, stepWorld, SCREEN_PLAY, SCREEN_END, SCREEN_TITLE } from './world.js';
import { interact, chop } from './interact.js';
import { faceTile } from './chef.js';
import { spawnOrder } from './orders.js';
import { recipeById } from './recipes.js';
import { isSolid, tileCenter, stationAt } from './layout.js';

const BESIDE = [[0, 1], [0, -1], [1, 0], [-1, 0]];

/** Stands the chef on the floor tile beside counter (col,row), facing it. */
function standBy(world, col, row) {
  for (const [dc, dr] of BESIDE) {
    if (!isSolid(world, col + dc, row + dr)) {
      const at = tileCenter(col + dc, row + dr);
      world.chef.x = at.x;
      world.chef.y = at.y;
      faceTile(world, col, row);
      return;
    }
  }
}

function use(world, col, row) {
  standBy(world, col, row);
  interact(world, stationAt(world, col, row));
}

function chopAll(world, col, row, hits) {
  standBy(world, col, row);
  for (let k = 0; k < hits; k += 1) chop(world, stationAt(world, col, row));
}

function wait(world, seconds) {
  for (let t = 0; t < seconds; t += 0.05) stepWorld(world, 0.05);
}

function order(world, id) {
  spawnOrder(world, recipeById(id));
}

/** The opening of a shift: quiet tickets on the rail. */
function openShift(seed) {
  const world = createWorld(seed);
  world.screen = SCREEN_PLAY;
  world.nextOrderIn = 1e9;
  return world;
}

/** Mid-rush: five tickets, a bowl being built, one ready at the pass, pots and grills going. */
function rushScene(world) {
  world.elapsed = 100;
  world.coins = 214;
  world.combo = 3;
  world.served = 9;
  order(world, 'ember');
  wait(world, 24);
  order(world, 'moon');
  use(world, 1, 0); use(world, 15, 0); use(world, 9, 4);
  use(world, 2, 0); use(world, 7, 0);
  use(world, 5, 8); use(world, 11, 0);
  wait(world, 5.2);
  use(world, 7, 0); use(world, 9, 4);
  use(world, 11, 0); use(world, 9, 4);
  order(world, 'lantern');
  use(world, 17, 8); use(world, 15, 8); use(world, 10, 4);
  use(world, 3, 0); use(world, 0, 2); chopAll(world, 0, 2, 5); use(world, 0, 2); use(world, 10, 4);
  use(world, 2, 0); use(world, 7, 0);
  wait(world, 6);
  use(world, 7, 0); use(world, 10, 4);
  use(world, 5, 8); use(world, 12, 0);
  order(world, 'forest');
  wait(world, 5);
  use(world, 2, 0); use(world, 8, 0);
  use(world, 4, 0); use(world, 0, 4); chopAll(world, 0, 4, 3);
  use(world, 5, 0); use(world, 10, 8); chopAll(world, 10, 8, 5); use(world, 10, 8); use(world, 11, 4);
  use(world, 3, 8); use(world, 12, 4);
  order(world, 'cold');
  wait(world, 3.2);
  use(world, 4, 8);
  standBy(world, 9, 4);
  world.chef.y += 6;
  world.chef.walk = 1.2;
}

/** A bowl going out at the pass early in the night, with the bell and the coins. */
function serveScene(world) {
  world.elapsed = 52;
  world.coins = 118;
  world.combo = 3;
  world.served = 5;
  order(world, 'moon');
  order(world, 'cold');
  wait(world, 6);
  order(world, 'forest');
  use(world, 1, 0); use(world, 8, 4);
  use(world, 2, 0); use(world, 7, 0);
  use(world, 5, 0); use(world, 14, 2); chopAll(world, 14, 2, 5); use(world, 14, 2); use(world, 8, 4);
  use(world, 3, 0); use(world, 0, 2); chopAll(world, 0, 2, 5); use(world, 0, 2); use(world, 8, 4);
  use(world, 1, 0); use(world, 15, 0); use(world, 10, 4);
  use(world, 2, 0); use(world, 8, 0);
  wait(world, 5.2);
  use(world, 7, 0); use(world, 10, 4);
  use(world, 3, 0); use(world, 0, 2); chopAll(world, 0, 2, 5); use(world, 0, 2); use(world, 10, 4);
  use(world, 4, 0); use(world, 0, 4); chopAll(world, 0, 4, 2);
  use(world, 5, 8); use(world, 11, 0);
  order(world, 'ember');
  wait(world, 1.5);
  use(world, 10, 4);
  world.events.length = 0;
  use(world, 19, 4);
}

/** A whole shift played out to the shutters for the tally screen. */
function endScene(world) {
  world.coins = 0;
  const served = ['moon', 'cold', 'moon', 'forest', 'ember', 'cold', 'lantern', 'forest', 'ember', 'moon', 'lantern', 'ember', 'forest', 'moon'];
  for (const id of served) {
    order(world, id);
    wait(world, 6);
    world.chef.hold = { kind: 'bowl', parts: [...recipeById(id).parts] };
    use(world, 19, 4);
  }
  const earned = world.coins;
  world.orders = [];
  world.elapsed = world.length - 0.05;
  wait(world, 0.1);
  world.orders = [];
  world.missed = 2;
  world.bestCombo = 7;
  world.coins = earned - 20;
}

export const SHOTS = {
  rush: rushScene,
  title: rushScene,
  serve: serveScene,
  end: endScene,
};

/** Builds the scene named `name` and the effects it left on screen. */
export function buildShot(name, seed) {
  const world = openShift(seed);
  const fx = createFx();
  (SHOTS[name] ?? rushScene)(world);
  const recent = world.events.slice(-4);
  for (const event of recent) fxForEvent(fx, event);
  for (let k = 0; k < 40; k += 1) ambientFx(fx, world, 0.05, (s) => tileCenter(s.col, s.row));
  tickFx(fx, 0.25);
  fx.banner = null;
  fx.shake = 0;
  if (name === 'title') world.screen = SCREEN_TITLE;
  if (name === 'end') world.screen = SCREEN_END;
  return { world, fx };
}
