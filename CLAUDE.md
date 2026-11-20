# Full Send: notes for Claude

Read this first in every Full Send session. Keep it short: rules and the current handoff only.

## Where we left off (updated 2026-11-20)

- **Live:** https://elbrownbear.github.io/full-send/ (GitHub Pages, deploys on every push to `main`). Public repo, MIT. Placeholder art drawn in code.
- **M1 (Nov 19):** code split into `src/core.js` (tunables `FS.C`), `content.js` (people, zones, lines), `rules.js` (scoring, unit tested), `world.js`, `sprites.js`, `game.js`. Ski Patrol snowmobile (max heat calls it, outrun it to shake it; past `PATROL_BASE_M` it always comes), pass-clipped end screen, radar Slow Zones, rope ducks, Jerry/gaper/crew/ski school/park rat/dad/patrol/influencer/Moto Gunslinger.
- **Jordan's M1 playtest (Nov 20):** patrol too fast → slowed (190 start, +3/s, max 320); run length → 2,000 m; Slow Zones and ropes are good.
- **M2 built Nov 20:** rails and boxes (ollie on to grind, crash if you ride into them), lean back (Shift / right mouse / pull thumb down) for tail presses, butter 180s (lean + left/right or sideways flick) and floating in powder, a Powder zone (bogs you down unless leaning; sharks; tree wells you mash to dig out), flat catwalks where you unstrap and skate while skiers laugh, ice patches (no turning, no stopping). **Jordan hasn't played M2 yet.**
- **Jordan's M2 playtest (Nov 20):** lean back feels great. Patrol still too fast → slowed again (165 start, +2/s, max 295). Hadn't seen rails or catwalks → rails/boxes added to groomers, more in the park, park more common, catwalk odds up (now ~4–10 per 2,000 m). Trees and rocks cut 15%. Not re-tested yet.
- Decided (PRD §12): Ski Patrol chaser; modern-retro palette; one rider with outfit unlocks (not built); skier jokes friendly; real crews and podcasts only as nods.
- Testing tip: the preview pane is often hidden, which stops the animation. `FS.game.step(n)` advances the game by hand; use a separate tab if Jordan is playing in the pane. Chunks far from the camera get pruned, so step a few frames after teleporting the rider before placing test objects.

## Exactly where to pick up

1. Ask Jordan: is patrol right now, are rails easy to land on, do catwalks feel right after easing them Nov 20 (35% less punishing: 220 px long, `FLAT_FRICTION` 40, `SKATE_PUSH` 28, `SKATE_MAX` 95)? Patrol knobs: `PATROL_*` in `src/core.js`.
2. Ask Jordan what's next: M3 (content pass 1: 30+ catalog items with real behaviors), M4 (Open Slop link + embed), or real pixel art.
3. Not built yet: outfit unlocks, the I-70 intro, weather events, most of CONTENT.md.

## Project rules

**Commands:** no build. Open `index.html`, or `npx --yes serve .` for a local server. Tests: `node --test`. New scripts go in `index.html` in load order (core, content, rules, world, sprites, game).

**Originality:** an original game in the SkiFree *genre*. Never use SkiFree's name, sprites, sounds or yeti. Brands only as parody names; no real people (PRD §9).

**Content:** new obstacles/people/pickups go in CONTENT.md first (with "why it's funny"), then into the content data file. Update each item's status emoji as it moves along.

**Docs to keep in sync** when a feature or system changes: SYSTEMS.md (🟢/🟡/⚪ markers), CONTENT.md statuses, README.md, PRD.md milestones, and `../PROJECTS-MASTER.md` (then commit and push the `Claude Stoof` repo).

**Public repo:** never commit anything personal (crew names, emails, Open Slop keys). Open Slop changes happen in the Open Slop repo, not here.

**Diagrams:** every Mermaid diagram starts with the shared high-contrast `%%{init}%%` line.
