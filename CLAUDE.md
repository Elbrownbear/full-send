# Full Send: notes for Claude

Read this first in every Full Send session. Keep it short: rules and the current handoff only.

## Where we left off (updated 2026-11-19)

- Project created Nov 19, 2026 as a **public** repo (Jordan asked for public). Only docs exist: [PRD.md](PRD.md) (draft 1), [CONTENT.md](CONTENT.md) (Jordan reviewed the 45 starter ideas Nov 19: 43 kept, 2 cut, all still 💡 ideas), SYSTEMS.md, README. No game code yet.
- Decided: name **Full Send**; plain HTML + JS + canvas, no build step; GitHub Pages hosting; Open Slop gets a link, then an `/arcade` embed, then a crew leaderboard (PRD §11).
- Decided: content (obstacles, people, references) gets its own milestones (M3, M7) and real design time. PRD §6 is the rule.
- Not built: everything else. GitHub Pages isn't switched on yet (nothing to serve).

## Exactly where to pick up

1. Open [PRD.md](PRD.md) §12 (open questions).
2. Ask Jordan:
   - "Should the chaser be Ski Patrol on a snowmobile (your pass gets clipped), or one of the others in CONTENT.md's Chasers table?"
   - "Do you want an interactive claude.ai mock of the look (title screen, rider, a few obstacles) before I build the engine, or a rough playable prototype to test on your phone?"
   - "Strict 16-color early-90s palette, or a slightly richer modern-retro palette?"
   - "Add an MIT license (anyone can reuse the code) or keep it all-rights-reserved?"
   - "Want these in the catalog: the unstrapped hopper, the sideslipper, the gear snob (parody brand), weather events (whiteout, wind hold, pow-morning rush), and an I-70 / Floyd Hill intro?" (pitched Nov 19, no answer yet)
3. Build M1 (PRD §10): `index.html` + `src/` with the loop, steering, trees/rocks/people, crash, distance, chaser, end screen. Then switch on GitHub Pages (Settings → Pages → deploy from `main`, root) and test on a phone.

## Project rules

**Commands:** no build. Open `index.html`, or `npx --yes serve .` for a local server. Tests (when added) run with `node --test`.

**Originality:** an original game in the SkiFree *genre*. Never use SkiFree's name, sprites, sounds or yeti. Brands only as parody names; no real people (PRD §9).

**Content:** new obstacles/people/pickups go in CONTENT.md first (with "why it's funny"), then into the content data file. Update each item's status emoji as it moves along.

**Docs to keep in sync** when a feature or system changes: SYSTEMS.md (🟢/🟡/⚪ markers), CONTENT.md statuses, README.md, PRD.md milestones, and `../PROJECTS-MASTER.md` (then commit and push the `Claude Stoof` repo).

**Public repo:** never commit anything personal (crew names, emails, Open Slop keys). Open Slop changes happen in the Open Slop repo, not here.

**Diagrams:** every Mermaid diagram starts with the shared high-contrast `%%{init}%%` line.
