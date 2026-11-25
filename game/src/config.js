// Every tunable number of Lantern Lane Noodles in one place: screen, kitchen grid, timings, scoring.

export const VIEW = { width: 1280, height: 720 };

/** The kitchen grid: 20 x 9 tiles of 64 px under the order board. */
export const TILE = 64;
export const GRID = { cols: 20, rows: 9, top: 136 };

export const CHEF = {
  speed: 300,
  half: 20,
  reach: TILE * 1.15,
};

export const SHIFT_SECONDS = 180;
export const RUSH_AT = 0.55;

export const COOK = {
  boilSeconds: 5,
  boilBurnSeconds: 13,
  grillSeconds: 4,
  grillBurnSeconds: 11,
  chopHits: 5,
};

export const ORDERS = {
  max: 5,
  firstAt: 1,
  secondAt: 7,
  gapStart: 17,
  gapEnd: 8,
  patienceBase: 32,
  patiencePerPart: 9,
  rushPatience: 0.88,
};

export const SCORE = {
  basePerDish: 10,
  perPart: 6,
  tipShare: 0.6,
  comboStep: 4,
  comboCap: 5,
  missPenalty: 10,
  stars: [200, 400, 600],
};

export const COLORS = {
  night: '#16111f',
  header: '#231a2e',
  floorA: '#2f5f63',
  floorB: '#2a5559',
  wood: '#8a5a36',
  woodTop: '#b07a4b',
  woodEdge: '#5e3a22',
  steel: '#9fb1bd',
  paper: '#fbf1dc',
  ink: '#2b2033',
  lantern: '#ff9e3d',
  good: '#5fd07a',
  warn: '#ffc845',
  bad: '#ff5b5b',
  broth: '#d9913f',
};
