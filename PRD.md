# Full Send: Product Requirements

**Status:** Draft 1, Nov 19, 2026 · **Owner:** Jordan · **Repo:** [Elbrownbear/full-send](https://github.com/Elbrownbear/full-send) (public)

## 1. The pitch

A retro, top-down "ride down an endless mountain and try not to eat it" game, in the genre the 1991 Windows classic SkiFree made famous, rebuilt around **snowboarding** and stuffed with **today's ski and snowboard culture**: Jerries, gapers, park rats, Gaper Day costumes, $300 lift tickets, Ikon-vs-Epic tribalism, the crew sitting in the middle of the run, the dad yelling "SKI PATROL!", the catwalk where every snowboarder has to unstrap.

It's a time killer for the crew: open it on a phone in the lift line, get one more run in, compare scores. Long term it lives inside (or one tap from) Open Slop, the crew's mountain app.

## 2. Goals and non-goals

**Goals**
- **G1: Feels like the classic.** Instant start, one-thumb or arrow-key steering, crash-and-get-up comedy, a chaser that ends every run eventually, early-90s pixel look.
- **G2: Feels like snowboarding, not skiing.** Edges, stance (regular/goofy), riding switch, ollies, spins and grabs, getting stuck on the flats, sinking in deep pow.
- **G3: Is funny to people who ride.** Every few seconds something on screen should be a reference the crew recognizes. This is the product; see §6.
- **G4: Plays great on a phone.** Touch controls, portrait layout, loads in about a second, no install.
- **G5: Fits Open Slop.** Linkable first, embeddable second, with a crew leaderboard last.

**Non-goals (for now)**
- Not a 3D game or a realistic physics sim.
- No accounts, ads, payments or app-store builds.
- No real brand logos, real pro riders, or copied SkiFree assets (§9).
- No multiplayer in real time. "Multiplayer" means a shared daily seed and a leaderboard.

## 3. Who it's for

- **The crew** (Open Slop's riders): snowboarders and a few skiers from Colorado who get every joke about I-70, lift lines and pass prices.
- **Anyone with the link**: the repo and game are public, so it should still be fun without Open Slop or an account.

## 4. Core loop

1. Tap **Drop in**. Pick stance (regular or goofy) once; it's remembered.
2. Ride down an endless, procedurally generated slope. The camera keeps the rider near the top third of the screen so you see what's coming.
3. Steer around obstacles and people, hit jumps and rails for points, grab pickups.
4. Crash into things: the rider tumbles, a caption pops ("Yard sale!"), you get up and keep going (with a speed penalty).
5. Past a distance threshold, **the chaser** shows up and eventually catches you. That's the end of the run.
6. End screen: distance, score, best trick, a "Jerry of the Day nominee" fail card, and **Again**.

### The chaser: Ski Patrol on a snowmobile (decided Nov 19)
SkiFree's run ends when a monster eats you. Ours is original: **Ski Patrol on a snowmobile**. Every Slow Zone you blast through, every person you clip and every skier you spray raises your **heat**, and more heat brings patrol sooner. Past a set distance they come for you no matter what. If they catch you, **your pass gets clipped** (game over screen: a pass with a hole punched in it). The other chaser ideas in [CONTENT.md](CONTENT.md#chasers) can become modes or easter eggs.

### The rider (decided Nov 19)
One rider with the same stats for everyone, so leaderboards are fair. Outfits are cosmetic unlocks (for example a gaper suit with jeans, a banana suit, a neon one-piece) earned by distance, clout or finding things like the lost GoPro.

## 5. Snowboard mechanics

| Mechanic | What it does | Why it matters |
|---|---|---|
| **Heading** | The rider points in one of ~8 headings from hard-left traverse to straight down to hard-right traverse, like the classic. Straight down is fastest; traversing slows you | Keeps the classic's simple, readable steering |
| **Edges** | Turning shows heelside (facing downhill) or toeside (facing uphill) sprites, and a carve leaves a line in the snow | The first thing that makes it read as a snowboard |
| **Stance + switch** | Regular or goofy. Landing backwards means riding switch until you turn around; switch tricks score more | Real snowboard culture; a small skill ceiling |
| **Stop / scrub** | Hold back (or both thumbs) to sideslip and dump speed | Lets you survive a tight tree section |
| **Spray (hard stop)** | Slam a hard stop at speed right next to someone and you spray them with a wall of snow. **Skiers:** + clout (more for more speed and a closer stop) and + patrol heat. **Snowboarders:** − clout (you don't spray the homies). Each person in CONTENT.md says whether they ride skis or a board | The most snowboard-culture move there is, and a risk-reward choice: points now, patrol sooner |
| **Plow** | At 50+ mph you go straight through people instead of crashing (losing a fifth of your speed). **Skiers:** + clout, + heat. **Snowboarders:** − clout. Below that speed, hitting someone is a crash | Rewards keeping your speed, and gives heat a second big source (Jordan, Nov 19) |
| **Carve lock** | Above a set speed you can't swing fully sideways, and keyboard and drag steering get less twitchy the faster you go. To slow down at speed you have to hard stop | Keeps momentum and makes the hard stop matter (Jordan, Nov 19) |
| **Ollie** | Jump button pops you off the ground anywhere: small hop, clears small things | Snowboards ollie; skis in the classic needed a ramp |
| **Jumps (kickers)** | Ramps launch you high. While in the air: spin (left/right) and grab (a button or swipe) | The freestyle score engine |
| **Spins and grabs** | 180s up to 1080+, plus grabs (indy, melon, method, stalefish, nose, tail). Land facing a clean direction or crash | Trick names are part of the joke ("Send it! 1080 Mute") |
| **Rails and boxes** | Ollie onto them to slide; points per frame of slide | Park laps |
| **Butters** | A press on the flats for small points | A modern style trick everyone tries |
| **Flats and catwalks** | Speed bleeds away; at zero you have to **unstrap and skate** (slow waddle, mash a button) while skiers pole past laughing | The most universal snowboarder pain, and very funny |
| **Powder** | Deep snow slows you unless you lean back (hold a key or tilt). Fresh pow also hides rocks | Pow days are the dream and the trap |
| **Tree wells** | Hitting the base of a tree in deep snow gets you stuck for a few seconds | A real hazard, played for laughs (and a safety wink) |
| **Ice** | Blue patches: you can't turn or stop on them for a moment | "Colorado hardpack" / "East Coast ice" captions |

**Controls**
- **Keyboard:** Left/Right or A/D steer. Down/S points downhill. Up/W scrubs speed. Space ollies (hold in the air to grab). Left/Right in the air spins. Shift leans back in pow. P or Esc pauses.
- **Phone:** drag a thumb left/right to steer (the rider turns toward your thumb), tap anywhere to ollie, swipe in the air to spin, hold in the air to grab. Optional tilt steering.
- **Mouse:** the rider points toward the cursor, click to ollie (closest to the classic).

## 6. Content is the game (budget the time)

**This is the most important section of the PRD.** The engine (steering, collisions, scrolling) is a few sessions of work. What makes the game worth playing, and worth sharing with the crew, is the **variety and quality of obstacles, people, pickups and jokes**. A version with 6 obstacles is a tech demo. Plan for it:

- **Every content item is a small design task**, not a sprite drop. Each needs: a pixel sprite (often 2–4 frames), a behavior (still, wanders, follows a line, reacts to you), a collision result (crash, stuck, bounce, bonus, heat), a caption or sound, and a rarity and the distance where it starts showing up.
- **Dedicated content passes are milestones of their own** (M3 and M7 in §10), with nothing else in them. Don't let content get squeezed into the end of an engine milestone.
- **Targets:** at least **30 distinct items for v1** across people, terrain, pickups and set pieces (§7), rising to **60+** in content pass 2. At least **3 rare "did you see that?!" moments** in v1.
- **Variety over the run:** a new item type should appear about every 15–20 seconds of riding in the first few minutes, so a long run keeps revealing things. Distance unlocks (zones, §7.4) do this.
- **The joke has to land for riders.** Each item gets a one-line "why it's funny" in [CONTENT.md](CONTENT.md). If nobody on the crew would laugh, cut it.
- **Playtest with the crew** after each content pass and keep a "what got a laugh / what nobody noticed" list in CONTENT.md.
- **Keep the catalog living.** New memes happen every season. Adding an item should be a data entry plus a sprite, not engine work (§8: content as data).

The full idea backlog is in [CONTENT.md](CONTENT.md). The categories below set the shape.

## 7. Content categories

### 7.1 People (moving obstacles)
Jerries out of control, gapers in jeans with the gaper gap, Gaper Day costumes, park rats in oversized hoodies, the crew sitting in the middle of the run below a roller, ski school "pizza!" snake lines, the influencer filming a TikTok, uphill skinners, the Bluetooth-speaker guy, the tele skier, the dad yelling "SKI PATROL!", ski patrol themselves, and the Moto Gunslinger (a six-shooter cowboy in motocross armor who shoots at and briefly chases anyone who passes too close). Hitting people raises patrol heat. Spraying them is scored by whether they're a skier or a snowboarder (§5).

### 7.2 Terrain and objects (still or slow obstacles)
Trees (pine, aspen), tree wells, rocks and hidden "sharks" under thin cover, stumps, moguls (a snowboarder's nightmare), ice, cat tracks and flats, Slow Zone signs, rope lines and closed areas, snowmaking guns, snowcats and groomers, lift towers, the chairlift overhead with hecklers, the $28 lodge burger stand.

### 7.3 Pickups (good stuff)
Hot wax (speed), breakfast burrito (shrug off one crash), energy drink (short speed boost), hand warmers, a lost GoPro (collectible), a powder stash entrance, a season pass (cools patrol heat).

### 7.4 Zones and set pieces (variety by distance)
**Built in the prototype (Nov 19):** the mountain comes in 64 m bands of **Groomers** (the default mix), **Terrain park** (wide-open snow with lines of kickers, a short reprieve) and **Glades** (heavy trees), with a banner as you enter each. After the first playtest Jordan asked for about 25% fewer people (more of them skiers), half the trees, open jump sections and some really tree-heavy sections.

The fuller plan, so it doesn't look the same at 3,000 ft as at 300: **Groomer** (start, beginners and ski school) → **Terrain park** (kickers, rails, park rats) → **Glades** (trees and tree wells) → **Pow stash** (deep snow, hidden rocks) → **Catwalk of doom** (flats, skate out) → **Bowl** (open, fast, patrol arrives). Rare set pieces: a Gaper Day parade, a "shotski" line across the run, an avalanche-control boom, the lift line spilling onto the slope.

### 7.5 UI and meta jokes
Score is **clout**. Crash captions ("Yard sale!", "Jerry of the Day nominee", "Sent it. Did not land it."). The end screen is a fake social post of your worst crash. "Days this season" counter. Pass-price gags on the title screen. Open Slop crossovers (I-70 / Floyd Hill traffic, the Chiller Score, Purl wax picks) once it's linked.

### 7.6 Modes
- **Free ride** (v1): endless run, the chaser, score by distance + tricks.
- **Daily send** (v1.5): everyone gets the same mountain seed for the day, so scores are comparable. Pairs with the leaderboard.
- **Park session**: a fixed-length park with judges scoring tricks.
- **Boardercross**: race gates against a few AI riders who bump you.
- **Pow day**: everything is deep, the crowd is the enemy, find the stashes before they're tracked out.

## 8. Technical approach

- **Plain HTML + JavaScript + `<canvas>`**, no framework and no build step. The game is one folder of static files: open `index.html` and it runs. This keeps it fast on phones and trivially embeddable.
- **Fixed-timestep game loop** on `requestAnimationFrame` (update at 60 steps a second, draw whenever the screen refreshes), so speed is the same on a fast PC and a slow phone.
- **Low-resolution pixel canvas** (for example 320×480 in portrait), scaled up with crisp, unblurred pixels. Small sprite sheets (PNG) in a **modern-retro palette** (decided Nov 19): chunky early-90s pixels, but with enough colors that neon one-pieces, roost guards and parody passes read clearly on a phone.
- **Seeded random generator** for the slope, so a "seed" recreates the same mountain (needed for Daily send and fair leaderboards).
- **Content as data:** obstacles, people and pickups are entries in a `content` file (sprite, behavior, collision result, caption, rarity, zone). The engine reads it. Adding a joke never needs engine changes.
- **Saved locally:** best score and stance in `localStorage` (wrapped so a private browser still works).
- **Sound (later):** small Web Audio bleeps and an optional chiptune loop, muted by default on phones.
- **Hosting:** GitHub Pages from the public repo (free, deploys on every push). Vercel is the fallback if Pages gets in the way of embedding.

## 9. Originality and IP

Full Send is an original game **in the genre** SkiFree defined (endless downhill, dodge things, something chases you). To keep it clearly its own:
- No SkiFree name, sprites, sounds or its yeti. The chaser, rider, every obstacle and the art are designed fresh.
- Real brands and passes appear only as **parody names** (an "Epik Pass", an "Ikahn Pass", "Celcius"-style drinks), never real logos.
- No real people (pros, influencers). Types of people ("the influencer"), yes.
- References to public slang and traditions (Jerry, gaper, Gaper Day, send it) are fair game.

## 10. Milestones

| # | Milestone | Done when |
|---|---|---|
| M0 | **Feel prototype** 🟢 built Nov 19, being tuned | A rough playable build with placeholder shapes, tested on Jordan's phone: steering, ollie, spray and crashing feel right (decided Nov 19: prototype before any mock) |
| M1 | **Core loop** 🟢 built Nov 19 | A rider steers down an endless slope on phone and desktop, trees/rocks/people cause crashes, distance counts, the chaser ends the run, end screen + Again. Live on GitHub Pages |
| M2 | **Snowboarding** 🟢 built Nov 20 | Edges, stance and switch, ollie, kickers with spins and grabs, rails, flats and skating, powder, tree wells, ice |
| M3 | **Content pass 1** 🟢 built Nov 20 (crew playtest still to do) | 30+ items from CONTENT.md with sprites, behaviors and captions; zones by distance; crew playtest notes recorded |
| M4 | **Open Slop link + embed** | Open Slop has a way into the game (a link first, then an `/arcade` page that embeds it) |
| M5 | **Daily send + crew leaderboard** | Seeded daily mountain; scores from inside Open Slop save to its database and show a crew board |
| M6 | **Modes** | Park session and Boardercross (Pow day if time) |
| M7 | **Content pass 2 + polish** | 60+ items, rare set pieces, sound, crash replays, second crew playtest |

## 11. Open Slop integration

Three steps, each useful on its own:

1. **Link.** A card or button in Open Slop (on the Watch tab, the dashboard footer or Settings) opens the game's public URL. No code in the game changes.
2. **Embed.** An Open Slop page (`/arcade`) shows the game in a frame, so it feels built in and works from the installed phone app. The game hides its own header when it's loaded with `?embed=openslop`.
3. **Crew leaderboard.** When a run ends inside Open Slop, the game sends the score to the Open Slop page around it (a browser message between the frame and the page). Open Slop saves it under the signed-in rider (a new table, a migration and a requirement in Open Slop's own PRD) and shows a crew board. Outside Open Slop the game keeps local best scores only, so the public game needs no accounts or database.

Optional crossover: Open Slop passes today's conditions (did it snow?) so the game's Daily send is a pow day when the real mountains got pow.

## 12. Decisions (Nov 19, 2026)

1. **Chaser:** Ski Patrol on a snowmobile; caught = pass clipped (§4).
2. **Look:** modern-retro pixel palette, not strict 16-color (§8).
3. **First build:** a rough playable prototype to test on the phone, before any art mock (M0).
4. **Rider:** one rider, same stats for everyone, cosmetic outfit unlocks (§4).
5. **License:** MIT (anyone can reuse the code with credit). See `LICENSE`.
6. **Skier jokes:** plenty, but friendly. Skiers are the main target, snowboarders get roasted too, and every joke should still land with the skiers in the crew.
7. **New content:** the Moto Gunslinger, the spray mechanic, the unstrapped hopper, the sideslipper, the gear snob, weather events and an I-70 intro (CONTENT.md).

8. **Real crews and podcasts stay as nods** (Nov 19): Beyond Medals and The Bomb Hole are referenced through jokes fans will catch, never by name, logo or likeness (§9).

9. **M1 heat sources** (Nov 19): the **radar Slow Zone** (blow through over 25 mph for clout and heat, or slow down to cool off) and the **rope duck** (closed stash with bonus clout and heavy heat). Designs in CONTENT.md's Heat sources table. They join spraying, plowing and hitting people.

10. **Tricks stay simple** (Nov 21): a trick update (flips and corks, directional grabs, real trick names, clean/sketchy landings, a Full Send meter) was built, felt like it broke the game, and was reverted. **No flips or corks.** Tricks stay as M0 built them: free spins and a held grab. Any later trick change comes back one piece at a time.
    - **Back the same day (Nov 21):** clean/sketchy/crash landings, the Full Send meter, and real names: Front/Back by spin direction and stance, Half Cab / Cab / Switch Back, 15 grab names (Japan, Roast Beef, Crail, Canadian Bacon, Tindy…) and "Tweaked" for a long grab. Still no flips, and the grab is still picked at random (no directional grab controls).

## 12b. Open questions

None right now. New ones go here.

## 13. Success

- The crew plays it without being asked, and someone sends a screenshot of a crash card to the group chat.
- A typical first run lasts 45–90 seconds; good riders can push past 3 minutes.
- After content pass 1, playtesters can name at least 5 references they noticed on their own.
