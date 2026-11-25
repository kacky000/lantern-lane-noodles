// Keyboard and mouse: WASD or arrows walk, E or J uses a counter, Space or K chops, a left click
// walks to a counter and uses it. Presses are buffered so a quick tap is never lost between frames.
import { VIEW } from './config.js';

const MOVE = {
  KeyW: [0, -1], ArrowUp: [0, -1],
  KeyS: [0, 1], ArrowDown: [0, 1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0],
  KeyD: [1, 0], ArrowRight: [1, 0],
};
const USE = new Set(['KeyE', 'KeyJ']);
const CHOP = new Set(['Space', 'KeyK']);
const START = new Set(['Enter', 'NumpadEnter']);

export function createInput(canvas, view) {
  const held = new Set();
  const state = { use: 0, chop: 0, start: 0, mute: 0, pause: 0, clicks: [], anyKey: 0 };

  addEventListener('keydown', (event) => {
    if (MOVE[event.code] || CHOP.has(event.code)) event.preventDefault();
    if (event.repeat) return;
    held.add(event.code);
    state.anyKey += 1;
    if (USE.has(event.code)) state.use += 1;
    if (CHOP.has(event.code)) state.chop += 1;
    if (START.has(event.code)) state.start += 1;
    if (event.code === 'KeyM') state.mute += 1;
    if (event.code === 'KeyP' || event.code === 'Escape') state.pause += 1;
  });
  addEventListener('keyup', (event) => held.delete(event.code));
  addEventListener('blur', () => held.clear());

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) * (canvas.width / rect.width) - view.offsetX) / view.scale;
    const y = ((event.clientY - rect.top) * (canvas.height / rect.height) - view.offsetY) / view.scale;
    if (x >= 0 && y >= 0 && x <= VIEW.width && y <= VIEW.height) state.clicks.push({ x, y, button: event.button });
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  return {
    /** This frame's controls, then clears the one-shot presses. */
    take() {
      let moveX = 0;
      let moveY = 0;
      for (const code of held) {
        const dir = MOVE[code];
        if (dir) {
          moveX += dir[0];
          moveY += dir[1];
        }
      }
      const frame = { moveX, moveY, use: state.use > 0, chop: state.chop > 0, start: state.start > 0, mute: state.mute > 0, pause: state.pause > 0, clicks: state.clicks.splice(0) };
      state.use = 0;
      state.chop = 0;
      state.start = 0;
      state.mute = 0;
      state.pause = 0;
      return frame;
    },
  };
}
