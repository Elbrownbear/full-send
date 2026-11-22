# Full Send: notes for Claude

Read this first in every Full Send session. Keep it short: rules and the current handoff only.

## Where we left off (updated 2026-11-21)

- **Live:** https://elbrownbear.github.io/full-send/ (GitHub Pages, deploys on every push to `main`). Public repo, MIT. Placeholder art drawn in code.
- **M1 (Nov 19):** code split into `src/core.js` (tunables `FS.C`), `content.js` (people, zones, lines), `rules.js` (scoring, unit tested), `world.js`, `sprites.js`, `game.js`. Ski Patrol snowmobile (max heat calls it, outrun it to shake it; past `PATROL_BASE_M` it always comes), pass-clipped end screen, radar Slow Zones, rope ducks, Jerry/gaper/crew/ski school/park rat/dad/patrol/influencer/Moto Gunslinger.
- **Jordan's M1 playtest (Nov 20):** patrol too fast → slowed (190 start, +3/s, max 320); run length → 2,000 m; Slow Zones and ropes are good.
- **M2 built Nov 20:** rails and boxes (ollie on to grind, crash if you ride into them), lean back (Shift / right mouse / pull thumb down) for tail presses, butter 180s (lean + left/right or sideways flick) and floating in powder, a Powder zone (bogs you down unless leaning; sharks; tree wells you mash to dig out), flat catwalks where you unstrap and skate while skiers laugh, ice patches (no turning, no stopping). **Jordan hasn't played M2 yet.**
- **Jordan's M2 playtest (Nov 20):** lean back feels great. Patrol still too fast → slowed again (165 start, +2/s, max 295). Hadn't seen rails or catwalks → rails/boxes added to groomers, more in the park, park more common, catwalk odds up (now ~4–10 per 2,000 m). Trees and rocks cut 15%. Then catwalks eased twice (now 185 px, ~2.15 s to cross; full speed coasts across) and made 25% rarer (~5 per 2,000 m).
- **M3 built Nov 20 (content pass 1):** 8 pickups (hot wax, burrito, Epik/Ikahn pass, waffle, liquid courage, GoPro, bronze medal, Big Wave medal), 13 more people (drone guy + drone, speaker guy, tele, Euro, Gaper Day costumes, shotski line, lost kid, unstrapped hopper, sideslipper, splitboarder, Academy kids, lift-line podcast, snowcat with the tycoon), chairlifts (double trick points, heckles), snowguns, hot tub, $28 burger stand, palm tree, RV roof gap. About 55 catalog items in the game. **Jordan hasn't played M3 yet.**
- **Nov 21 tuning (Jordan):** half the trees before 500 m (`EARLY_TREE_*` in `core.js`; keep 0.35 measured as half), catwalks 25% weaker with 15% stronger pushes and an earlier unstrap (`SKATE_AT` 40): slow entries ~2.2 s instead of ~2.8 s. Also guarded against a 0-size window crashing the draw.
- **Trick system reverted (Nov 21):** flips/corks, directional grabs, real names, sketchy landings and a Full Send meter were built (commit d97a05d), then Jordan felt it broke the game and asked for a revert. **No flips or corks** (PRD §12 #10). Tricks are back to free spins + held grab. If any piece comes back (names, meter, sketchy landings), add it alone and get a playtest before the next.
- **Nov 21 tuning after the revert:** kickers 50% wider (34 px, launch window follows `STATICS.kicker.w`), rocks and stumps 35% rarer in every zone (measured over 30 mountains: rocks −35%, stumps −37%; sharks unchanged).
- Decided (PRD §12): Ski Patrol chaser; modern-retro palette; one rider with outfit unlocks (not built); skier jokes friendly; real crews and podcasts only as nods.
- Testing tip: the preview pane is often hidden, which stops the animation. `FS.game.step(n)` advances the game by hand; use a separate tab if Jordan is playing in the pane. Chunks far from the camera get pruned, so step a few frames after teleporting the rider before placing test objects.

## Exactly where to pick up

1. Ask Jordan whether the game feels right again after the revert, and how the wider jumps and fewer rocks/stumps play.
2. Ask Jordan how M3 plays: which new people and set pieces are funny, which nobody noticed, and is the hill too busy now? Write the answers in CONTENT.md's Playtest notes (that's the M3 crew playtest the PRD asks for).
3. Still open from M2: is patrol right now (`PATROL_*` in `core.js`), are rails easy to land on, do catwalks feel right?
4. Then ask what's next: M4 (Open Slop link + embed), real pixel art, or content pass 2 (the 💡 items left in CONTENT.md: gear snob, moguls, lift line, weather, I-70 intro, bomb hole, Johnny Tsunami race, etc.).

## Project rules

**Commands:** no build. Open `index.html`, or `npx --yes serve .` for a local server. Tests: `node --test`. Before committing, syntax-check every file (`node --check src/<file>.js`): a broken file silently kills the whole game, and the tests only load core, content and rules. New scripts go in `index.html` in load order (core, content, rules, world, sprites, game).

**Originality:** an original game in the SkiFree *genre*. Never use SkiFree's name, sprites, sounds or yeti. Brands only as parody names; no real people (PRD §9).

**Content:** new obstacles/people/pickups go in CONTENT.md first (with "why it's funny"), then into the content data file. Update each item's status emoji as it moves along.

**Docs to keep in sync** when a feature or system changes: SYSTEMS.md (🟢/🟡/⚪ markers), CONTENT.md statuses, README.md, PRD.md milestones, and `../PROJECTS-MASTER.md` (then commit and push the `Claude Stoof` repo).

**Public repo:** never commit anything personal (crew names, emails, Open Slop keys). Open Slop changes happen in the Open Slop repo, not here.

**Diagrams:** every Mermaid diagram starts with the shared high-contrast `%%{init}%%` line.
