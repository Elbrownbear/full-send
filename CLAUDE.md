# Full Send: notes for Claude

Read this first in every Full Send session. Keep it short: rules and the current handoff only.

## Where we left off (updated 2026-11-19)

- **Live:** the M0 feel prototype at https://elbrownbear.github.io/full-send/ (GitHub Pages, deploys on every push to `main`). Public repo, MIT. Placeholder art drawn in code; everything is in `src/game.js` (tunables in `C` at the top, zone mixes in `ZONES`).
- **In the prototype:** steering (keys, drag, mouse), ollie, kickers with spins and grabs, switch, hard stop + spray (skiers + clout/heat, snowboarders − clout), plow at 50+ mph (same rule), carve lock at speed, crashes, zones (Groomers / Terrain park / Glades), heat bar (no chaser yet), best distance saved.
- **Jordan's first playtest (Nov 19):** too crowded and hard to get going. Done: ~25% fewer people (80% skiers), half the trees, open park sections with jump lines, tree-heavy glades, a start boost, more momentum, less twitchy steering at speed, plow-through. Not yet re-tested by Jordan.
- Decided Nov 19 (PRD §12): Ski Patrol snowmobile chaser (pass clipped); modern-retro palette; one rider with cosmetic outfit unlocks; skier jokes plenty but friendly; MIT.
- Content: CONTENT.md has ~65 items incl. nods to Johnny Tsunami, Out Cold, Beyond Medals and The Bomb Hole (written without real names, PRD §9) and a Heat sources table.
- Testing tip: the preview pane is often hidden, which stops the animation. `window.FullSend.step(n)` advances the game by hand; use a separate tab if Jordan is playing in the pane.

## Exactly where to pick up

1. Ask Jordan how the retuned prototype feels on the phone (crowding, getting going, momentum, carve lock, plow).
2. Then M1 (PRD §10): split `src/game.js` into modules, move content to a data file, Ski Patrol chaser driven by heat, end screen + Again, the first real people from CONTENT.md, and the two new heat sources Jordan picked Nov 19: the **radar Slow Zone** and the **rope duck** (designs in CONTENT.md's Heat sources table).
3. Decided Nov 19: real crews and podcasts stay as nods, no names.

## Project rules

**Commands:** no build. Open `index.html`, or `npx --yes serve .` for a local server. Tests (when added) run with `node --test`.

**Originality:** an original game in the SkiFree *genre*. Never use SkiFree's name, sprites, sounds or yeti. Brands only as parody names; no real people (PRD §9).

**Content:** new obstacles/people/pickups go in CONTENT.md first (with "why it's funny"), then into the content data file. Update each item's status emoji as it moves along.

**Docs to keep in sync** when a feature or system changes: SYSTEMS.md (🟢/🟡/⚪ markers), CONTENT.md statuses, README.md, PRD.md milestones, and `../PROJECTS-MASTER.md` (then commit and push the `Claude Stoof` repo).

**Public repo:** never commit anything personal (crew names, emails, Open Slop keys). Open Slop changes happen in the Open Slop repo, not here.

**Diagrams:** every Mermaid diagram starts with the shared high-contrast `%%{init}%%` line.
