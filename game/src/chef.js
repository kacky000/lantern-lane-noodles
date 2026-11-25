// The chef: walks the floor without passing through counters, faces where it last moved, and
// always knows which counter is in reach, so one key both picks up and puts down.
import { CHEF, TILE } from './config.js';
import { isSolid, stationAt, tileCenter, tileOf } from './layout.js';

export function makeChef(col, row) {
  const at = tileCenter(col, row);
  return { x: at.x, y: at.y, faceX: 0, faceY: -1, hold: null, walk: 0, path: null, onArrive: null, bump: 0, chopAnim: 0 };
}

function blocked(world, x, y) {
  const h = CHEF.half;
  const corners = [[x - h, y - h], [x + h, y - h], [x - h, y + h], [x + h, y + h]];
  return corners.some(([cx, cy]) => {
    const tile = tileOf(cx, cy);
    return isSolid(world, tile.col, tile.row);
  });
}

/** Moves the chef by (dx, dy) normalised to its speed, sliding along counters. */
export function walkChef(world, dx, dy, dt) {
  const chef = world.chef;
  const len = Math.hypot(dx, dy);
  if (len < 0.01) return false;
  const vx = (dx / len) * CHEF.speed * dt;
  const vy = (dy / len) * CHEF.speed * dt;
  if (!blocked(world, chef.x + vx, chef.y)) chef.x += vx;
  if (!blocked(world, chef.x, chef.y + vy)) chef.y += vy;
  chef.faceX = dx / len;
  chef.faceY = dy / len;
  chef.walk += dt * 10;
  return true;
}

/** Follows a click-to-walk path one step; calls the arrival action at the end. */
export function followPath(world, dt) {
  const chef = world.chef;
  if (!chef.path || chef.path.length === 0) return false;
  const next = tileCenter(chef.path[0].col, chef.path[0].row);
  const dx = next.x - chef.x;
  const dy = next.y - chef.y;
  if (Math.hypot(dx, dy) < 6) {
    chef.path.shift();
    if (chef.path.length === 0) {
      chef.path = null;
      const arrive = chef.onArrive;
      chef.onArrive = null;
      if (arrive) arrive();
    }
    return true;
  }
  const step = Math.min(1, Math.hypot(dx, dy) / (CHEF.speed * dt));
  const before = { x: chef.x, y: chef.y };
  walkChef(world, dx * step, dy * step, dt);
  if (Math.abs(before.x - chef.x) + Math.abs(before.y - chef.y) < 0.01) {
    chef.x = next.x;
    chef.y = next.y;
  }
  return true;
}

/** Turns the chef to face a counter tile. */
export function faceTile(world, col, row) {
  const at = tileCenter(col, row);
  const dx = at.x - world.chef.x;
  const dy = at.y - world.chef.y;
  const len = Math.hypot(dx, dy) || 1;
  world.chef.faceX = dx / len;
  world.chef.faceY = dy / len;
}

/** The counter the chef would use now: the solid tile nearest a point just ahead of it, within reach. */
export function stationInReach(world) {
  const chef = world.chef;
  const aheadX = chef.x + chef.faceX * TILE * 0.55;
  const aheadY = chef.y + chef.faceY * TILE * 0.55;
  const home = tileOf(chef.x, chef.y);
  let best = null;
  let bestScore = Infinity;
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      const station = stationAt(world, home.col + dc, home.row + dr);
      if (!station) continue;
      const at = tileCenter(station.col, station.row);
      if (Math.hypot(at.x - chef.x, at.y - chef.y) > CHEF.reach) continue;
      const score = Math.hypot(at.x - aheadX, at.y - aheadY);
      if (score < bestScore) {
        bestScore = score;
        best = station;
      }
    }
  }
  return best;
}
