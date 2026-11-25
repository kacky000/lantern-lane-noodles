// The plating guide: a small card over the bowl the chef is working on (carried, or on the counter
// in reach) naming the order it is turning into and ticking off each part, so a half-built bowl
// says at a glance what it still needs and where to fetch it.
import { RECIPES, INGREDIENTS, PREP_BOIL, PREP_CHOP, PREP_GRILL } from './recipes.js';
import { drawIngredientIcon } from './draw-food.js';
import { stationInReach } from './chef.js';
import { tileCenter } from './layout.js';

const WHERE = { [PREP_BOIL]: 'boil', [PREP_CHOP]: 'chop', [PREP_GRILL]: 'grill' };

/** The bowl in focus and where to draw its card, or null. */
function focusBowl(world) {
  const held = world.chef.hold;
  if (held && held.kind === 'bowl') return { bowl: held, x: world.chef.x, y: world.chef.y - 34 };
  const station = stationInReach(world);
  if (station && station.item && station.item.kind === 'bowl') {
    const at = tileCenter(station.col, station.row);
    return { bowl: station.item, x: at.x, y: at.y - 40 };
  }
  return null;
}

/** The recipe a bowl is heading for: an ordered one it still fits first, the most urgent of those. */
export function targetRecipe(world, parts) {
  const fits = (recipe) => parts.every((part) => recipe.parts.includes(part));
  const ordered = [...world.orders].sort((a, b) => a.left - b.left).map((order) => order.recipe).find(fits);
  return ordered ?? RECIPES.find(fits) ?? null;
}

export function drawPlatingGuide(ctx, world) {
  const focus = focusBowl(world);
  if (!focus || focus.bowl.parts.length === 0) return;
  const recipe = targetRecipe(world, focus.bowl.parts);
  if (!recipe) return;
  const done = recipe.parts.filter((part) => focus.bowl.parts.includes(part)).length;
  const w = 26 + recipe.parts.length * 30;
  const h = 58;
  const x = Math.max(6, Math.min(16 * 64 - w - 6, focus.x - w / 2));
  const y = Math.max(4, focus.y - h);
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.roundRect(x + 3, y + 4, w, h, 9);
  ctx.fill();
  ctx.fillStyle = '#fbf1dc';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 9);
  ctx.fill();
  ctx.font = '800 11px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1d1424';
  ctx.fillText(`${recipe.name}  ${done}/${recipe.parts.length}`, x + 9, y + 15);
  recipe.parts.forEach((part, i) => {
    const ix = x + 26 + i * 30;
    const iy = y + 36;
    const has = focus.bowl.parts.includes(part);
    ctx.globalAlpha = has ? 1 : 0.45;
    drawIngredientIcon(ctx, part, ix, iy, 10);
    ctx.globalAlpha = 1;
    ctx.fillStyle = has ? '#2f9e4a' : '#c0392b';
    ctx.beginPath();
    ctx.arc(ix + 10, iy - 10, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '900 9px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(has ? '✓' : '+', ix + 10, iy - 7);
    if (!has && WHERE[INGREDIENTS[part].prep]) {
      ctx.fillStyle = '#7a4a2c';
      ctx.font = '700 8px "Trebuchet MS", sans-serif';
      ctx.fillText(WHERE[INGREDIENTS[part].prep], ix, iy + 17);
    }
  });
  ctx.restore();
}
