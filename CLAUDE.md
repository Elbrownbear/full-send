# Full Send: notes for Claude

Read this first in every Full Send session. Keep it short: rules and the current handoff only.

## Where we left off (updated 2026-11-19)

- **Live:** https://elbrownbear.github.io/full-send/ (GitHub Pages, deploys on every push to `main`). Public repo, MIT. Placeholder art drawn in code.
- **M1 built Nov 19:** code split into `src/core.js` (tunables `FS.C`), `content.js` (people, zones, lines), `rules.js` (scoring, unit tested), `world.js`, `sprites.js`, `game.js`. Ski Patrol snowmobile: max heat calls it (outrun it by 650 px to shake it, +250 clout), past 1,200 m it always comes and can't be shaken; caught = "Pass clipped" end screen with stats and a group chat. Heat sources: spray, plow, hits, radar Slow Zones (25 mph limit, slowing cools heat), rope-duck stashes, the dad yelling. People: Jerry, gaper, crew sitting, ski school snake, park rat, dad, patrol on foot, influencer, Moto Gunslinger (shoots), plus generic skiers and boarders.
- Jordan's first playtest notes (crowding, getting going, momentum) were applied before M1; **M1 itself hasn't been played by Jordan yet.**
- Decided (PRD §12): Ski Patrol chaser; modern-retro palette; one rider with outfit unlocks (not built); skier jokes friendly; real crews and podcasts only as nods.
- Testing tip: the preview pane is often hidden, which stops the animation. `FS.game.step(n)` advances the game by hand; use a separate tab if Jordan is playing in the pane.

## Exactly where to pick up

1. Ask Jordan how M1 plays on the phone: is patrol too fast or too slow (`PATROL_*` in `src/core.js`), is 1,200 m the right length, do the heat sources feel worth the risk?
2. Ask Jordan: "Next, M2 (snowboard feel: rails, butters, flats and skating, powder, tree wells, ice) or M4 (link the game from Open Slop)?"
3. Not built yet from earlier plans: outfit unlocks, the I-70 intro, weather events, most of CONTENT.md (M3 content pass).

## Project rules

**Commands:** no build. Open `index.html`, or `npx --yes serve .` for a local server. Tests: `node --test`. New scripts go in `index.html` in load order (core, content, rules, world, sprites, game).

**Originality:** an original game in the SkiFree *genre*. Never use SkiFree's name, sprites, sounds or yeti. Brands only as parody names; no real people (PRD §9).

**Content:** new obstacles/people/pickups go in CONTENT.md first (with "why it's funny"), then into the content data file. Update each item's status emoji as it moves along.

**Docs to keep in sync** when a feature or system changes: SYSTEMS.md (🟢/🟡/⚪ markers), CONTENT.md statuses, README.md, PRD.md milestones, and `../PROJECTS-MASTER.md` (then commit and push the `Claude Stoof` repo).

**Public repo:** never commit anything personal (crew names, emails, Open Slop keys). Open Slop changes happen in the Open Slop repo, not here.

**Diagrams:** every Mermaid diagram starts with the shared high-contrast `%%{init}%%` line.
