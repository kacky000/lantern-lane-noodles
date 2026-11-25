// The stall's floor plan: which tile is floor, which is counter, and which counter is a station
// (bins, chopping boards, noodle pots, grills, the broth cauldron, bowl stacks, trash and the pass).
import { GRID, TILE } from './config.js';

export const STATION_TYPES = ['counter', 'bin', 'board', 'pot', 'grill', 'broth', 'bowls', 'trash', 'hatch'];

/** [col, row, type, ingredient] for every counter tile that is more than a bare counter. */
const PLAN = [
  [1, 0, 'bowls'],
  [2, 0, 'bin', 'noodles'],
  [3, 0, 'bin', 'scallion'],
  [4, 0, 'bin', 'mushroom'],
  [5, 0, 'bin', 'tofu'],
  [7, 0, 'pot'],
  [8, 0, 'pot'],
  [10, 0, 'grill'],
  [11, 0, 'grill'],
  [13, 0, 'broth'],
  [0, 2, 'board'],
  [0, 4, 'board'],
  [0, 5, 'trash'],
  [2, 6, 'bin', 'egg'],
  [3, 6, 'bin', 'chili'],
  [4, 6, 'bin', 'shrimp'],
  [7, 6, 'board'],
  [11, 6, 'broth'],
  [13, 6, 'bowls'],
  [15, 2, 'hatch'],
  [15, 3, 'hatch'],
  [15, 4, 'hatch'],
];

/** The plating island in the middle of the floor and a staging block nearer the pass: counters you walk around. */
export const ISLANDS = [{ row: 3, from: 5, to: 9 }, { row: 3, from: 12, to: 12 }];

function isBorder(col, row) {
  return row === 0 || row === GRID.rows - 1 || col === 0 || col === GRID.cols - 1;
}

export function buildStations() {
  const stations = [];
  const byKey = new Map();
  let nextId = 1;
  const add = (col, row, type, ing = null) => {
    const station = { id: nextId++, col, row, type, ing, item: null };
    stations.push(station);
    byKey.set(`${col},${row}`, station);
  };
  for (const [col, row, type, ing] of PLAN) add(col, row, type, ing);
  for (let row = 0; row < GRID.rows; row += 1) {
    for (let col = 0; col < GRID.cols; col += 1) {
      const island = ISLANDS.some((isle) => row === isle.row && col >= isle.from && col <= isle.to);
      if ((isBorder(col, row) || island) && !byKey.has(`${col},${row}`)) add(col, row, 'counter');
    }
  }
  return { stations, byKey };
}

export function stationAt(world, col, row) {
  return world.stationMap.get(`${col},${row}`) ?? null;
}

export function isSolid(world, col, row) {
  if (col < 0 || row < 0 || col >= GRID.cols || row >= GRID.rows) return true;
  return world.stationMap.has(`${col},${row}`);
}

export function tileCenter(col, row) {
  return { x: col * TILE + TILE / 2, y: GRID.top + row * TILE + TILE / 2 };
}

export function tileOf(x, y) {
  return { col: Math.floor(x / TILE), row: Math.floor((y - GRID.top) / TILE) };
}

export function findStation(world, type, ing = null, nth = 0) {
  return world.stations.filter((s) => s.type === type && (ing === null || s.ing === ing))[nth] ?? null;
}
