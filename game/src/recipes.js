// The pantry and the menu: what each ingredient needs before it goes in a bowl, and the five bowls
// the night market orders. Recipes share ingredients, so one pot of noodles can go to any of them.

export const PREP_NONE = 'none';
export const PREP_CHOP = 'chop';
export const PREP_BOIL = 'boil';
export const PREP_GRILL = 'grill';

export const INGREDIENTS = {
  noodles: { name: 'Noodles', prep: PREP_BOIL },
  scallion: { name: 'Scallion', prep: PREP_CHOP },
  mushroom: { name: 'Shiitake', prep: PREP_CHOP },
  tofu: { name: 'Tofu', prep: PREP_CHOP },
  shrimp: { name: 'Shrimp', prep: PREP_GRILL },
  egg: { name: 'Soft egg', prep: PREP_NONE },
  chili: { name: 'Chili', prep: PREP_NONE },
  broth: { name: 'Broth', prep: PREP_NONE },
};

export const RECIPES = [
  { id: 'moon', name: 'Moonlight Shoyu', parts: ['broth', 'noodles', 'scallion'], unlock: 0 },
  { id: 'cold', name: 'Cold Sesame Tangle', parts: ['noodles', 'tofu', 'scallion', 'chili'], unlock: 0 },
  { id: 'forest', name: 'Forest Miso', parts: ['broth', 'noodles', 'mushroom', 'tofu'], unlock: 35 },
  { id: 'ember', name: 'Ember Shrimp', parts: ['broth', 'noodles', 'shrimp', 'chili'], unlock: 55 },
  { id: 'lantern', name: 'Lantern Special', parts: ['broth', 'noodles', 'egg', 'shrimp', 'scallion'], unlock: 95 },
];

export function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id) ?? null;
}

/** The recipes on the menu once `elapsed` seconds of the shift have passed. */
export function menuAt(elapsed) {
  return RECIPES.filter((recipe) => recipe.unlock <= elapsed);
}

/** The recipe a bowl holding exactly `parts` makes, or null. */
export function recipeOfParts(parts) {
  for (const recipe of RECIPES) {
    if (recipe.parts.length !== parts.length) continue;
    if (recipe.parts.every((part) => parts.includes(part))) return recipe;
  }
  return null;
}

/** True when some recipe still fits a bowl holding `parts` plus `extra`. */
export function couldStillMake(parts, extra) {
  const next = [...parts, extra];
  return RECIPES.some((recipe) => next.every((part) => recipe.parts.includes(part)));
}
