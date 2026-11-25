// One shift at the stall: builds the kitchen, runs a step of play from the player's controls,
// and closes the shutters when the clock runs out.
import { SCORE, SHIFT_SECONDS, ORDERS } from './config.js';
import { buildStations, stationAt, tileOf } from './layout.js';
import { makeChef, walkChef, followPath, stationInReach, faceTile } from './chef.js';
import { tickHeat } from './cooking.js';
import { tickOrders, isRush } from './orders.js';
import { interact, chop } from './interact.js';
import { pathToCounter } from './pathing.js';
import { makeRng } from './rng.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_END = 'end';

export function createWorld(seed = 1) {
  const { stations, byKey } = buildStations();
  return {
    seed,
    rng: makeRng(seed),
    screen: SCREEN_TITLE,
    elapsed: 0,
    length: SHIFT_SECONDS,
    stations,
    stationMap: byKey,
    chef: makeChef(9, 6),
    orders: [],
    nextOrderIn: ORDERS.firstAt,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    missed: 0,
    servedBy: {},
    events: [],
    rushAnnounced: false,
  };
}

export function startShift(world) {
  const fresh = createWorld(world.seed + 1);
  Object.assign(world, fresh, { screen: SCREEN_PLAY });
  return world;
}

export function timeLeft(world) {
  return Math.max(0, world.length - world.elapsed);
}

export function starsFor(coins) {
  return SCORE.stars.filter((need) => coins >= need).length;
}

/** Click on a counter tile: walk beside it, face it, then use it (or chop, if it is a loaded board). */
export function clickTile(world, col, row) {
  const station = stationAt(world, col, row);
  if (!station) return;
  const act = () => {
    faceTile(world, col, row);
    if (!chop(world, station)) interact(world, station);
  };
  const here = tileOf(world.chef.x, world.chef.y);
  const near = Math.abs(here.col - col) + Math.abs(here.row - row) === 1;
  if (near && !world.chef.path) {
    act();
    return;
  }
  const path = pathToCounter(world, here, { col, row });
  if (!path) return;
  world.chef.path = path;
  world.chef.onArrive = act;
}

/** Advances play by `dt` seconds with this frame's controls. */
export function stepWorld(world, dt, controls = {}) {
  if (world.screen !== SCREEN_PLAY) return;
  world.elapsed += dt;
  const chef = world.chef;
  chef.chopAnim = Math.max(0, chef.chopAnim - dt * 6);
  chef.bump = Math.max(0, chef.bump - dt * 4);
  const moveX = controls.moveX ?? 0;
  const moveY = controls.moveY ?? 0;
  if (moveX || moveY) {
    chef.path = null;
    chef.onArrive = null;
    walkChef(world, moveX, moveY, dt);
  } else if (!followPath(world, dt)) {
    chef.walk = 0;
  }
  if (controls.use) interact(world, stationInReach(world));
  if (controls.chop) chop(world, stationInReach(world));
  if (controls.click) clickTile(world, controls.click.col, controls.click.row);
  tickHeat(world, dt);
  tickOrders(world, dt);
  if (!world.rushAnnounced && isRush(world.elapsed)) {
    world.rushAnnounced = true;
    world.events.push({ type: 'rush', text: 'RUSH HOUR' });
  }
  if (world.elapsed >= world.length) {
    world.screen = SCREEN_END;
    world.events.push({ type: 'close' });
  }
}
