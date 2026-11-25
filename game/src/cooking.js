// Heat and knives: noodles boil in the pots, shrimp sear on the grills, and both burn if left;
// chopping boards turn a raw vegetable into a bowl-ready one in a few quick strokes.
import { COOK } from './config.js';
import { BURNT, CHOPPED, COOKED, RAW } from './items.js';
import { INGREDIENTS, PREP_CHOP } from './recipes.js';
import { tileCenter } from './layout.js';

/** What a heat station accepts, and its cook and burn times. */
const HEAT = {
  pot: { accepts: 'noodles', done: COOK.boilSeconds, burn: COOK.boilBurnSeconds },
  grill: { accepts: 'shrimp', done: COOK.grillSeconds, burn: COOK.grillBurnSeconds },
};

export function heatRule(type) {
  return HEAT[type] ?? null;
}

export function acceptsOnStation(station, item) {
  if (station.type === 'counter') return true;
  if (item.kind !== 'ing') return false;
  if (station.type === 'board') return INGREDIENTS[item.id].prep === PREP_CHOP && item.state === RAW;
  const rule = heatRule(station.type);
  return Boolean(rule && rule.accepts === item.id && item.state === RAW);
}

/** Advances every pot and grill by `dt` seconds, emitting done, warning and burnt events. */
export function tickHeat(world, dt) {
  for (const station of world.stations) {
    const rule = heatRule(station.type);
    const item = station.item;
    if (!rule || !item || item.kind !== 'ing' || item.state === BURNT) continue;
    const before = item.cook;
    item.cook += dt;
    const at = tileCenter(station.col, station.row);
    if (before < rule.done && item.cook >= rule.done) {
      item.state = COOKED;
      world.events.push({ type: 'cooked', x: at.x, y: at.y, text: 'Ready!' });
    }
    const warnAt = rule.done + (rule.burn - rule.done) * 0.55;
    if (before < warnAt && item.cook >= warnAt) world.events.push({ type: 'warn', x: at.x, y: at.y, text: 'Take it off!' });
    if (before < rule.burn && item.cook >= rule.burn) {
      item.state = BURNT;
      world.events.push({ type: 'burnt', x: at.x, y: at.y, text: 'Burnt!' });
    }
  }
}

/** 0..1 for a cooking item's progress to done, then 1..2 on toward burning. */
export function heatProgress(station) {
  const rule = heatRule(station.type);
  const item = station.item;
  if (!rule || !item) return 0;
  if (item.cook < rule.done) return item.cook / rule.done;
  return 1 + Math.min(1, (item.cook - rule.done) / (rule.burn - rule.done));
}

/** One knife stroke on a board; true when it did something. */
export function chopOnce(world, station) {
  const item = station.item;
  if (station.type !== 'board' || !item || item.kind !== 'ing' || item.state !== RAW) return false;
  item.chop += 1;
  const at = tileCenter(station.col, station.row);
  world.events.push({ type: 'chop', x: at.x, y: at.y, ing: item.id });
  if (item.chop >= COOK.chopHits) {
    item.state = CHOPPED;
    world.events.push({ type: 'chopped', x: at.x, y: at.y, text: 'Chopped!' });
  }
  return true;
}
