# lantern-lane-noodles

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/kacky000/lantern-lane-noodles/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/kacky000/lantern-lane-noodles/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Lantern Lane Noodles** is a top-down cooking game about one night-market noodle stall. You have
three minutes until the shutters drop. Tickets slide onto the order board, each with its own
patience bar; you boil noodles, sear shrimp, chop scallion, shiitake and tofu, ladle broth and
build bowls on the plating island, then ring them out at the pass.

- Five bowls that share ingredients (Moonlight Shoyu, Cold Sesame Tangle, Forest Miso, Ember
  Shrimp, Lantern Special), unlocked as the night goes on.
- Pots and grills keep cooking while you are elsewhere, and burn if you forget them, so every order
  is a route: start the heat first, chop while it cooks, plate on the way to the pass.
- Tips for speed, a streak bonus, walk-outs that cost you, and a rush hour that brings tickets
  faster with less patience.
- Everything is drawn and voiced in code: canvas food art, Web Audio sounds, no asset files.

Controls: WASD / arrows walk · E picks up, puts down, fills a bowl and serves · Space chops ·
click any counter to walk there and use it · P pauses · M mutes.

Code layout (game/src): `world.js` runs a shift, `interact.js` is the one-button verb,
`cooking.js` the pots, grills and boards, `orders.js` the ticket rail and pay, `recipes.js` the
menu, `layout.js` the floor plan, `chef.js` and `pathing.js` movement, `draw-*.js`, `hud.js`,
`screens.js` and `fx.js` the look, `audio.js` the sound, `shots.js` the screenshot scenes.

## Run it

```sh
node serve.ts 8131   # then open http://localhost:8131
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots are real renders of `?shot=rush|serve|title|end` (see `tools/shoot.sh`).

---

<sub>Entered on [make.fun](https://make.fun/?ref=9ykrm1qx&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
