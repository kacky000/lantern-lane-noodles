// Click-to-walk: a breadth-first search over floor tiles to the nearest spot beside a clicked counter.
import { GRID } from './config.js';
import { isSolid } from './layout.js';

const STEPS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** Floor tiles from `from` to a floor tile next to `target`, or null when none is reachable. */
export function pathToCounter(world, from, target) {
  const goal = new Set();
  for (const [dc, dr] of STEPS) {
    const col = target.col + dc;
    const row = target.row + dr;
    if (!isSolid(world, col, row)) goal.add(`${col},${row}`);
  }
  if (goal.size === 0) return null;
  const startKey = `${from.col},${from.row}`;
  const cameFrom = new Map([[startKey, null]]);
  const queue = [from];
  while (queue.length) {
    const node = queue.shift();
    const key = `${node.col},${node.row}`;
    if (goal.has(key)) {
      const path = [];
      let cursor = key;
      while (cursor) {
        const [col, row] = cursor.split(',').map(Number);
        path.unshift({ col, row });
        cursor = cameFrom.get(cursor);
      }
      return path;
    }
    for (const [dc, dr] of STEPS) {
      const col = node.col + dc;
      const row = node.row + dr;
      const next = `${col},${row}`;
      if (col < 0 || row < 0 || col >= GRID.cols || row >= GRID.rows) continue;
      if (cameFrom.has(next) || isSolid(world, col, row)) continue;
      cameFrom.set(next, key);
      queue.push({ col, row });
    }
  }
  return null;
}
