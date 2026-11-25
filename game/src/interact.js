// The one-button verb: what pressing E (or clicking a counter) does with whatever the chef holds
// and whatever sits on the counter in reach. Picking up, putting down, filling and serving bowls.
import { acceptsOnStation, chopOnce } from './cooking.js';
import { bowlHas, isReady, makeBowl, makeIngredient, notReadyReason, BURNT } from './items.js';
import { couldStillMake, INGREDIENTS, PREP_NONE } from './recipes.js';
import { tileCenter } from './layout.js';
import { serveBowl } from './orders.js';

function say(world, station, type, text) {
  const at = tileCenter(station.col, station.row);
  world.events.push({ type, x: at.x, y: at.y - 10, text });
}

/** Puts ingredient `id` into `bowl` when it fits a recipe; reports why not otherwise. */
export function addToBowl(world, station, bowl, item) {
  if (item.state === BURNT || !isReady(item)) {
    say(world, station, 'nope', notReadyReason(item));
    return false;
  }
  if (bowlHas(bowl, item.id)) {
    say(world, station, 'nope', `Already has ${INGREDIENTS[item.id].name.toLowerCase()}`);
    return false;
  }
  if (!couldStillMake(bowl.parts, item.id)) {
    say(world, station, 'nope', 'No dish uses that mix');
    return false;
  }
  bowl.parts.push(item.id);
  say(world, station, 'add', `+ ${INGREDIENTS[item.id].name}`);
  return true;
}

function useBin(world, station) {
  const chef = world.chef;
  if (!chef.hold) {
    chef.hold = makeIngredient(station.ing);
    say(world, station, 'pickup', INGREDIENTS[station.ing].name);
    return;
  }
  if (chef.hold.kind === 'bowl' && INGREDIENTS[station.ing].prep === PREP_NONE) {
    addToBowl(world, station, chef.hold, makeIngredient(station.ing));
    return;
  }
  say(world, station, 'nope', 'Hands full');
}

function useBroth(world, station) {
  const hold = world.chef.hold;
  if (!hold || hold.kind !== 'bowl') {
    say(world, station, 'nope', 'Bring a bowl');
    return;
  }
  addToBowl(world, station, hold, makeIngredient('broth'));
}

function useSurface(world, station) {
  const chef = world.chef;
  const hold = chef.hold;
  const there = station.item;
  if (!hold && there) {
    chef.hold = there;
    station.item = null;
    say(world, station, 'pickup', '');
    return;
  }
  if (hold && !there) {
    if (acceptsOnStation(station, hold)) {
      station.item = hold;
      chef.hold = null;
      say(world, station, 'place', '');
    } else {
      say(world, station, 'nope', station.type === 'board' ? 'Only raw veg here' : 'Wrong station');
    }
    return;
  }
  if (hold && there) {
    if (hold.kind === 'bowl' && there.kind === 'ing') {
      if (addToBowl(world, station, hold, there)) station.item = null;
      return;
    }
    if (hold.kind === 'ing' && there.kind === 'bowl') {
      if (addToBowl(world, station, there, hold)) chef.hold = null;
      return;
    }
    say(world, station, 'nope', 'Counter is full');
  }
}

/** Uses `station` with whatever the chef holds. */
export function interact(world, station) {
  if (!station) return;
  const chef = world.chef;
  switch (station.type) {
    case 'bin':
      useBin(world, station);
      break;
    case 'bowls':
      if (!chef.hold) {
        chef.hold = makeBowl();
        say(world, station, 'pickup', 'Bowl');
      } else say(world, station, 'nope', 'Hands full');
      break;
    case 'broth':
      useBroth(world, station);
      break;
    case 'trash':
      if (chef.hold) {
        chef.hold = null;
        say(world, station, 'trash', 'Tossed');
      }
      break;
    case 'hatch':
      if (chef.hold && chef.hold.kind === 'bowl') {
        if (serveBowl(world, chef.hold, station)) chef.hold = null;
      } else say(world, station, 'nope', 'Serve bowls here');
      break;
    default:
      useSurface(world, station);
  }
}

/** The knife key: chops whatever raw vegetable sits on the board in reach. */
export function chop(world, station) {
  if (!station || !chopOnce(world, station)) return false;
  world.chef.chopAnim = 1;
  return true;
}
