# Full Send: notes for Claude

Read this first in every Full Send session. Keep it short: rules and the current handoff only.

## Where we left off (updated 2026-11-19)

- Project created Nov 19, 2026 as a **public** repo (Jordan asked for public), MIT licensed. Only docs exist: [PRD.md](PRD.md), [CONTENT.md](CONTENT.md) (51 items, all still 💡 ideas), SYSTEMS.md, README. No game code yet.
- Decided: name **Full Send**; plain HTML + JS + canvas, no build step; GitHub Pages hosting; Open Slop gets a link, then an `/arcade` embed, then a crew leaderboard (PRD §11).
- Decided Nov 19 (PRD §12): Ski Patrol snowmobile chaser (pass clipped); modern-retro palette; one rider with cosmetic outfit unlocks; skier jokes plenty but friendly; **rough playable prototype first, no art mock**.
- New mechanic: **spray** (hard stop next to someone). Skiers: + clout, + heat. Snowboarders: − clout. Each person in CONTENT.md has a Rides column for this.
- New content Nov 19: the Moto Gunslinger (six-shooter, motocross armor, shoots and briefly chases you), unstrapped hopper, sideslipper, gear snob, whiteout, wind hold, pow-morning rush, I-70 intro. Cut: uphill skinner, energy drink pickup.
- Content gets its own milestones (M3, M7) and real design time. PRD §6 is the rule.
- Not built: everything else. GitHub Pages isn't switched on yet (nothing to serve).

## Exactly where to pick up

1. Open [PRD.md](PRD.md) §5 (mechanics) and §10 (M0).
2. Build the **M0 feel prototype**: `index.html` + `src/` with the fixed-timestep loop, placeholder shapes, steering (keys, touch, mouse), ollie, hard stop + spray on a test skier and a test snowboarder, trees/rocks, crashing, distance counter.
3. Switch on GitHub Pages (Settings → Pages → deploy from `main`, root) so Jordan can play it on the phone, and ask how steering, ollie and spray feel.
4. Then M1 (PRD §10): people, Ski Patrol chaser with heat, end screen.

## Project rules

**Commands:** no build. Open `index.html`, or `npx --yes serve .` for a local server. Tests (when added) run with `node --test`.

**Originality:** an original game in the SkiFree *genre*. Never use SkiFree's name, sprites, sounds or yeti. Brands only as parody names; no real people (PRD §9).

**Content:** new obstacles/people/pickups go in CONTENT.md first (with "why it's funny"), then into the content data file. Update each item's status emoji as it moves along.

**Docs to keep in sync** when a feature or system changes: SYSTEMS.md (🟢/🟡/⚪ markers), CONTENT.md statuses, README.md, PRD.md milestones, and `../PROJECTS-MASTER.md` (then commit and push the `Claude Stoof` repo).

**Public repo:** never commit anything personal (crew names, emails, Open Slop keys). Open Slop changes happen in the Open Slop repo, not here.

**Diagrams:** every Mermaid diagram starts with the shared high-contrast `%%{init}%%` line.
