// The order rail: tickets arrive faster as the night goes on, each with its own patience; a bowl
// served at the pass fills the most urgent matching ticket, pays a tip for speed and builds a streak.
import { ORDERS, RUSH_AT, SCORE, SHIFT_SECONDS } from './config.js';
import { menuAt, recipeOfParts } from './recipes.js';
import { pick } from './rng.js';
import { tileCenter } from './layout.js';

let nextTicket = 1;

export function makeOrder(recipe, patience) {
  return { id: nextTicket++, recipe, patience, left: patience, born: 0, flash: 0 };
}

/** Seconds between tickets at this point in the shift: slow at opening, quick at the rush. */
export function orderGap(elapsed) {
  const t = Math.min(1, elapsed / SHIFT_SECONDS);
  return ORDERS.gapStart + (ORDERS.gapEnd - ORDERS.gapStart) * t;
}

export function isRush(elapsed) {
  return elapsed >= SHIFT_SECONDS * RUSH_AT;
}

export function spawnOrder(world, recipe = null) {
  if (world.orders.length >= ORDERS.max) return null;
  const menu = menuAt(world.elapsed);
  const chosen = recipe ?? pick(world.rng, menu);
  const rush = isRush(world.elapsed) ? ORDERS.rushPatience : 1;
  const patience = (ORDERS.patienceBase + ORDERS.patiencePerPart * chosen.parts.length) * rush;
  const order = makeOrder(chosen, patience);
  world.orders.push(order);
  world.events.push({ type: 'order', text: chosen.name });
  return order;
}

/** Counts down patience, drops tickets that ran out, and deals new ones on schedule. */
export function tickOrders(world, dt) {
  for (const order of world.orders) {
    order.left -= dt;
    order.born += dt;
    order.flash = Math.max(0, order.flash - dt);
  }
  const missed = world.orders.filter((order) => order.left <= 0);
  for (const order of missed) {
    world.missed += 1;
    world.combo = 0;
    world.coins = Math.max(0, world.coins - SCORE.missPenalty);
    world.events.push({ type: 'miss', text: `${order.recipe.name} walked out  -${SCORE.missPenalty}` });
  }
  world.orders = world.orders.filter((order) => order.left > 0);
  world.nextOrderIn -= dt;
  if (world.nextOrderIn <= 0 || world.orders.length === 0 && world.nextOrderIn > 2) {
    spawnOrder(world);
    world.nextOrderIn = orderGap(world.elapsed);
  }
}

/** Coins for serving `order` now: base by size, a tip by patience left, a streak bonus. */
export function payFor(world, order) {
  const base = SCORE.basePerDish + SCORE.perPart * order.recipe.parts.length;
  const tip = Math.round(base * SCORE.tipShare * Math.max(0, order.left / order.patience));
  const streak = SCORE.comboStep * Math.min(world.combo, SCORE.comboCap);
  return { base, tip, streak, total: base + tip + streak };
}

/** Serves a bowl at the pass; true when a ticket took it. */
export function serveBowl(world, bowl, station) {
  const at = tileCenter(station.col, station.row);
  const recipe = recipeOfParts(bowl.parts);
  if (!recipe) {
    world.events.push({ type: 'nope', x: at.x - 40, y: at.y, text: 'Not a dish yet' });
    return false;
  }
  const matching = world.orders.filter((order) => order.recipe.id === recipe.id).sort((a, b) => a.left - b.left);
  if (matching.length === 0) {
    world.events.push({ type: 'nope', x: at.x - 40, y: at.y, text: 'Nobody ordered that' });
    return false;
  }
  const order = matching[0];
  const pay = payFor(world, order);
  world.coins += pay.total;
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  world.served += 1;
  world.servedBy[recipe.id] = (world.servedBy[recipe.id] ?? 0) + 1;
  world.orders = world.orders.filter((other) => other !== order);
  world.events.push({ type: 'serve', x: at.x - 40, y: at.y, text: `+${pay.total}`, tip: pay.tip, recipe: recipe.name });
  return true;
}
