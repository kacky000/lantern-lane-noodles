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
  [11, 0, 'grill'],
  [12, 0, 'grill'],
  [15, 0, 'broth'],
  [0, 2, 'board'],
  [0, 4, 'board'],
  [0, 6, 'trash'],
  [3, 8, 'bin', 'egg'],
  [4, 8, 'bin', 'chili'],
  [5, 8, 'bin', 'shrimp'],
  [10, 8, 'board'],
  [14, 2, 'board'],
  [15, 8, 'broth'],
  [17, 8, 'bowls'],
  [19, 3, 'hatch'],
  [19, 4, 'hatch'],
  [19, 5, 'hatch'],
];

/** The plating island in the middle of the floor and the prep island nearer the pass: counters you walk around. */
export const ISLANDS = [{ row: 4, from: 7, to: 12 }, { row: 2, from: 13, to: 15 }, { row: 6, from: 14, to: 15 }];

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
