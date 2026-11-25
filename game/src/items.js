// What the chef can carry: a single ingredient in some state of prep, or a bowl being assembled.
import { INGREDIENTS, PREP_BOIL, PREP_CHOP, PREP_GRILL, PREP_NONE } from './recipes.js';

export const RAW = 'raw';
export const CHOPPED = 'chopped';
export const COOKED = 'cooked';
export const BURNT = 'burnt';

export function makeIngredient(id) {
  return { kind: 'ing', id, state: RAW, cook: 0, chop: 0 };
}

export function makeBowl() {
  return { kind: 'bowl', parts: [] };
}

/** True when an ingredient has had the prep its recipe asks for and is fit to go in a bowl. */
export function isReady(item) {
  if (!item || item.kind !== 'ing') return false;
  const prep = INGREDIENTS[item.id].prep;
  if (prep === PREP_NONE) return true;
  if (prep === PREP_CHOP) return item.state === CHOPPED;
  if (prep === PREP_BOIL || prep === PREP_GRILL) return item.state === COOKED;
  return false;
}

/** Why an ingredient cannot go in a bowl yet, in a word for the floating hint. */
export function notReadyReason(item) {
  if (item.state === BURNT) return 'Burnt!';
  const prep = INGREDIENTS[item.id].prep;
  if (prep === PREP_CHOP) return 'Chop it first';
  if (prep === PREP_BOIL) return 'Boil it first';
  if (prep === PREP_GRILL) return 'Grill it first';
  return 'Not ready';
}

export function bowlHas(bowl, id) {
  return bowl.parts.includes(id);
}

export function itemLabel(item) {
  if (!item) return '';
  if (item.kind === 'bowl') return item.parts.length ? 'Bowl' : 'Empty bowl';
  const name = INGREDIENTS[item.id].name;
  if (item.state === RAW) return INGREDIENTS[item.id].prep === PREP_NONE ? name : `Raw ${name.toLowerCase()}`;
  return `${item.state[0].toUpperCase()}${item.state.slice(1)} ${name.toLowerCase()}`;
}
