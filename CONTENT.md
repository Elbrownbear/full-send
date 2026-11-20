# Full Send: content catalog

The living list of everything that can show up on the mountain. **Content is the game** ([PRD §6](PRD.md#6-content-is-the-game-budget-the-time)): this file is where most of the design time goes.

**How to use it**
- Every item gets a row: what it is, what it does in the game, and *why riders will laugh*. If there's no good "why it's funny", cut it.
- **Status:** 💡 idea · ✏️ designed (behavior + collision decided) · 🎨 sprite drawn · 🟢 in the game
- **Zone:** where it first appears (Groomer → Park → Glades → Pow → Catwalk → Bowl), see PRD §7.4.
- **Rarity:** common / uncommon / rare / legendary.
- Parody names only for brands. No real people.

**Review log**
- **Nov 19, 2026:** Jordan reviewed the first 45. **43 kept**, none to tweak, **2 cut** (see [Cut](#cut)). Then added the Moto Gunslinger, the spray rule (the Rides and Spray columns), the unstrapped hopper, sideslipper, gear snob, three weather events and the I-70 intro: **51 items** in all. Roast level: plenty of skier jokes, but friendly.

## People

**Rides** decides what a **spray** does ([PRD §5](PRD.md#5-snowboard-mechanics)): spraying a skier earns clout and heat, spraying a snowboarder costs clout. "Either" means each one that spawns is randomly a skier or a snowboarder, and the sprite shows which, so you have to look before you spray.

| Item | Rides | Behavior | Collision | Spray | Why it's funny | Zone | Rarity | Status |
|---|---|---|---|---|---|---|---|---|
| **The Jerry** | skier | Zigzags fast, arms windmilling, ignores you | Both crash; +heat | + clout, + heat | Jerry of the Day is the most-shared ski content on the internet | Groomer | common | 💡 |
| **Gaper** | skier | Slow, straight, wearing jeans, visible forehead gap between helmet and goggles | Crash, he doesn't notice | + clout, + heat | The gaper gap is the oldest joke on the hill | Groomer | common | 💡 |
| **The Crew Sitting Mid-Run** | snowboarder | 3–4 snowboarders sitting in a row right below a roller, invisible until you crest it | Crash; caption "WHY ARE YOU SITTING THERE" | − clout ("not the homies") | The number-one skier complaint about snowboarders. We own it | Groomer | common | 💡 |
| **Ski school snake** | skier | A line of tiny kids in pizza wedge following an instructor, swaying side to side | Crash; big heat | + clout, big heat (it's kids) | "Pizza! French fries!" Everyone has nearly taken one out | Groomer | common | 💡 |
| **Park rat** | snowboarder | Hangs near kickers in an oversized hoodie, energy drink in hand, occasionally hucks a jump in front of you | Crash; he says "my bad, bro" | − clout | Every park has them | Park | common | 💡 |
| **The influencer** | either | Stopped, filming herself on a selfie stick or 360 cam | Crash; caption "you're in my shot" / "+10k views" | Skier: + clout and "you're famous now". Snowboarder: − clout | Lift-line TikTok is a whole genre now | Groomer | uncommon | 💡 |
| **Drone guy** | none | A drone hovers over you for a while, then crashes into a tree | Pass under it for bonus clout | n/a | Every resort has a "no drones" sign for a reason | Bowl | uncommon | 💡 |
| **Bluetooth speaker guy** | either | Rides slow with music notes floating behind him | Crash | By who's riding | You hear him before you see him | Groomer | uncommon | 💡 |
| **Dad yelling "SKI PATROL!"** | skier | Stands still, yells at you as you pass | No crash; +heat if you pass close | + clout, + heat (and he yells louder) | He is not ski patrol | Groomer | common | 💡 |
| **Splitboarder** | snowboarder | Skinning up with a board split in half | Crash; he gives a lecture about avalanche gear | − clout | The backcountry snowboarder stereotype | Pow | rare | 💡 |
| **Tele skier** | skier | Drops a knee every turn; "free the heel" caption | Crash | + clout, + heat | Telemark is a beloved cult | Glades | uncommon | 💡 |
| **Euro in a one-piece** | skier | Fast, perfect carves, neon one-piece suit | Crash; he's unbothered | + clout, + heat | Retro one-pieces are back | Bowl | uncommon | 💡 |
| **Gaper Day costume crew** | either | Group in onesies, tutus, a banana suit, a Speedo | Crash; confetti | Per person in the group | April 1 tradition at mountain towns | any | rare | 💡 |
| **Shotski line** | skier | Six people across the run sharing one ski of shots | Ollie it for huge bonus, or crash | Spray the whole line: big clout, big heat | A classic après set piece | Groomer | rare | 💡 |
| **Lost kid with one pole** | skier | Wanders | Crash; big heat | Small clout, big heat | Everyone has seen this kid | Groomer | uncommon | 💡 |
| **Ski patrol** (on foot) | skier | Stands by Slow Zone signs, waves arms | Crash = instant max heat | Huge clout, instant max heat | Foreshadows the chaser | any | common | 💡 |
| **Unstrapped hopper** (added Nov 19) | snowboarder | One foot out of the binding, hopping and skating across the run, sometimes falling over | Crash; caption "just strap in, man" | − clout | Everyone has been this guy getting off the lift | Groomer | common | 💡 |
| **Sideslipper** (added Nov 19) | snowboarder | Scraping down the steep pitch on their heel edge, side to side, blocking most of the run and scraping it to ice behind them | Crash; leaves an ice strip | − clout | The beginner snowboarder on every steep pitch | Bowl | common | 💡 |
| **Gear snob** (added Nov 19) | snowboarder | Waves you down to talk about his board's camber profile (a parody brand). Get close and a speech bubble slows you | Crash; caption "it's a directional twin, bro" | − clout | The lift-line gear lecture | Park | uncommon | 💡 |
| **The Moto Gunslinger** (added Nov 19) | none (on foot) | A cowboy with a six-shooter, dressed head to toe in motocross armor (roost guard, MX helmet and goggles, knee braces) for no reason anyone knows. Pass too close and he draws, fires a few slow, dodgeable shots, and chases you on foot for a few seconds before giving up | Hit by a shot or by him: crash | Spraying him sets him off, even from farther away | Pure absurdity; the armor makes him readable at a glance | Glades | rare | 💡 |

## Terrain and objects

| Item | Behavior | Collision | Why it's funny | Zone | Rarity | Status |
|---|---|---|---|---|---|---|
| **Pine tree** | Still | Crash | The genre staple | all | common | 💡 |
| **Aspen grove** | Still, thin trunks in tight clusters | Crash | Very Colorado | Glades | common | 💡 |
| **Tree well** | Hidden ring at the base of a pine in deep snow | Stuck for ~3 s, mash to dig out; caption "never ride trees alone" | Real hazard, safety wink | Glades/Pow | common | 💡 |
| **Rock** | Still | Crash | Staple | all | common | 💡 |
| **Shark** | A rock barely hidden under fresh snow, only a shimmer shows | Crash; caption "core shot" | Every early-season rider knows this pain | Pow | common | 💡 |
| **Stump** | Still, low | Ollie over it for bonus | Staple, but ollie-able | Glades | common | 💡 |
| **Moguls** | A field of bumps | Rider bounces, can't turn well | Snowboarders hate moguls | Bowl | uncommon | 💡 |
| **Ice patch** | Blue sheen | Can't turn or stop briefly; caption "East Coast powder" | The East Coast "ice coast" joke | any | common | 💡 |
| **Catwalk / flats** | Near-flat traverse | Speed bleeds; at zero you unstrap and skate while skiers pole past | The universal snowboarder pain | Catwalk | common | 💡 |
| **Slow Zone sign** | Still; blasting past raises heat | +heat | Resorts are covered in them | Groomer | common | 💡 |
| **Rope line / closed sign** | Edge of the course | Duck it for a secret stash, +big heat | "Ducking ropes" gets passes pulled | Pow | uncommon | 💡 |
| **Snowmaking gun** | Blasts a cone of snow sideways | Pushes you; blinds the screen briefly | Early-season resorts are all snow guns | Groomer | uncommon | 💡 |
| **Snowcat / groomer** | Moves slowly across the run | Crash; leaves corduroy (speed bonus) behind it | First-chair corduroy is sacred | Groomer | uncommon | 💡 |
| **Lift tower** | Still, in a line | Crash | Staple | all | common | 💡 |
| **Chairlift overhead** | Chairs pass over; riders heckle ("SEND IT!", "huck it!") | Doing a trick under it earns double clout | The lift-line peanut gallery | any | common | 💡 |
| **Kicker** | Ramp | Launch; spins/grabs scored | Freestyle core | Park | common | 💡 |
| **Rail / box** | Ollie on to slide | Slide points; miss = crash | Park core | Park | common | 💡 |
| **Jerry gap jump** | A sketchy homemade jump built by kids | Huge air, sketchy landing | Backyard-built booters | Glades | rare | 💡 |
| **Lodge burger stand** | Still, with a "$28 BURGER" sign | Crash: lose 28 clout | Resort food prices | Groomer | uncommon | 💡 |
| **Lift line** | A wall of people across the run with a "WAIT 45 MIN" sign | Slows you to a crawl; Epik/Ikahn pass item skips it | Lift lines are the #1 complaint | Bowl | rare | 💡 |

## Pickups

| Item | Effect | Why it's funny | Zone | Rarity | Status |
|---|---|---|---|---|---|
| **Hot wax** | Speed up for a while | Wax nerds; Open Slop's Purl wax picks | any | uncommon | 💡 |
| **Breakfast burrito** | Absorbs one crash | The Colorado lift-line meal | Groomer | uncommon | 💡 |
| **Hand warmers** | Removes the "frozen" slowdown in the Bowl | Everyone has a pocket full | Bowl | uncommon | 💡 |
| **Lost GoPro** | Collectible; shows at the end screen | You always find one in spring | any | rare | 💡 |
| **Epik Pass / Ikahn Pass** | Cools patrol heat; skips lift lines. Pick a side on the title screen | The Epic vs Ikon tribal war, and record pass prices | any | uncommon | 💡 |
| **Waffle** | Small speed boost and a heart animation | Mountain waffles are a love language | Groomer | uncommon | 💡 |
| **Coors-ish banquet can** | "Liquid courage": bigger jumps, wobblier landings | Après culture | Park | rare | 💡 |

## Weather and events (added Nov 19)

Things that happen to the whole mountain for a stretch, not single objects.

| Event | What happens | Why it's funny | Zone | Rarity | Status |
|---|---|---|---|---|---|
| **Whiteout** | The screen fades to white for a stretch; only nearby things show, and the rider's goggles fog | Flat light is every rider's nemesis | any | uncommon | 💡 |
| **Wind hold** | A gust shoves you sideways, and the chairlift overhead stops with people swinging and complaining | Wind holds kill powder days | Bowl | uncommon | 💡 |
| **Pow-morning rush** | A wave of riders and skiers floods in from the top of the screen, all racing to the same stash | Powder panic: nobody went to work today | Pow | rare | 💡 |
| **I-70 intro** | Before the run starts, a short gag of your car stuck in Floyd Hill traffic ("2 hr 15 min to go"), skippable with a tap | The Front Range drive, and an Open Slop crossover | before the run | every run (skippable) | 💡 |

## Movie, crew and podcast nods (added Nov 19)

Jordan asked for references to *Johnny Tsunami*, *Out Cold*, the Beyond Medals crew and The Bomb Hole podcast. Per PRD §9 these are **nods fans will catch**: no character names, real riders' or hosts' names, logos or likenesses. Jordan confirmed Nov 19: keep them as nods.

| Item | Nod to | What it is / does | Why it's funny | Zone | Rarity | Status |
|---|---|---|---|---|---|---|
| **Academy kids** | *Johnny Tsunami* (1999): private-school skiers vs. public-school snowboarders | A pack of prep-school skiers in matching team jackets riding in tight formation. They yell "URCHIN!" when you pass. Spray or plow them: clout + heat | The original skiers-vs-snowboarders movie feud | Groomer | uncommon | 💡 |
| **Skiers-only clubhouse** | *Johnny Tsunami* | A roped-off "MEMBERS ONLY" lane with a velvet rope. Ride through it anyway: clout + heat | Keeping the mountain from the urchins | Groomer | rare | 💡 |
| **Race to the bottom** | *Johnny Tsunami*'s final race | The Academy captain pulls up beside you: "Race you to the flags." Beat him to a finish banner ~300 m down for big clout; lose and he gloats | Winner shares the mountain | any | rare | 💡 |
| **Surfer kid** | *Johnny Tsunami* | A kid in board shorts and a Hawaiian shirt surfing the snow, carving huge slow turns | "It's just frozen waves, brah" | Groomer | uncommon | 💡 |
| **Big Wave medal** | *Johnny Tsunami*'s medal | Collectible pickup shown on the end screen | The prize the whole race is about | any | rare | 💡 |
| **The Colorado tycoon** | *Out Cold* (2001): the resort mogul from Colorado buying the party mountain | A suit in a fur coat riding a snowcat with a "LUXURY CONDOS COMING SOON" sign. Spray or plow him: huge clout and **no** heat (patrol hates him too) | Mega-resort buyouts, and a dig at the Epik-style conglomerates | Bowl | rare | 💡 |
| **Hot tub party** | *Out Cold* | A steaming hot tub beside a lodge, full of partiers. Crash in: splash and a long caption. Ollie over it: bonus | The movie's hot tub chaos | Groomer | rare | 💡 |
| **Dive-bar mountain sign** | *Out Cold*'s down-market Alaska hill | A hand-painted sign at a zone start: "THE LAST REAL MOUNTAIN · NO CONDOS" | Every crew has a favorite cheap local hill | any | uncommon | 💡 |
| **The Euro RV** | Beyond Medals (the crew's RV tour films) | A beat-up RV parked on the slope with a crew in matching outfits hucking off the roof. Ollie off the roof for the biggest air in the game | Their RV trips are legend | Park | rare | 💡 |
| **Bronze medal** | Beyond Medals (named for missing the Olympics) | Pickup: "Who needs the Olympics?" Bronze, never gold | The crew's name is the joke | any | rare | 💡 |
| **Palm tree** | Beyond Medals' *Bahamas* film | A single palm tree in the glades | Snowboarding in the Bahamas | Glades | legendary | 💡 |
| **Bomb hole** | The Bomb Hole podcast (and the snowboard term for a deep landing crater) | A cliff drop with a crater landing in deep snow. Land in the crater: huge bonus | Named for the feature the show is named for | Pow | uncommon | 💡 |
| **Lift-line podcast** | The Bomb Hole | Two riders in camp chairs with mics recording on the slope. Pass close: "You're on the pod!" + clout. Crash into them: heat | Everyone has a snowboard podcast now | Groomer | uncommon | 💡 |
| **Group chat end card** | The Bomb Hole's group-chat episodes | End screen: "Sent to the group chat" with fake replies | How every crash gets shared | End screen | every run | 💡 |

## Heat sources (added Nov 19)

Heat is what brings Ski Patrol (PRD §4). Built ones are in the prototype; the rest are ideas to talk through.

| Source | Heat | Clout | Status |
|---|---|---|---|
| Crash into a person (below plow speed) | +20 | 0 (you crash) | 🟢 |
| Spray a skier (hard stop) | +15 | + (speed, closeness) | 🟢 |
| **Plow through a skier** at 50+ mph (no crash) | +25 | +100 and up | 🟢 |
| Plow through a snowboarder | +10 | −150 | 🟢 |
| **Radar Slow Zone** (M1, picked Nov 19): a pair of orange SLOW ZONE fences with a radar sign that flashes your mph as you approach. Limit 25 mph. Blow through it faster and the sign reads "47 IN A 25": heat +10 plus more for every mph over, and +5 clout per mph over. Ride through under the limit and the sign shows a smiley and cools your heat by 10. Patrol on foot often stands beside it | + (more the faster) | + per mph over | ✏️ |
| **Rope duck** (M1, picked Nov 19): rope lines with CLOSED signs run along the edge of some zones. Ride under the rope (or ollie it) into a closed stash: untouched pow, no people, bonus clout for every meter you ride in there, +30 heat the moment you duck in and more the longer you stay. Ride back out through a gap in the rope | +30, then more over time | stash bonus | ✏️ |
| Cut the lift line | + | + | 💡 |
| Jump over people (ski school, patrol on foot) | + | big | 💡 |
| Buzz patrol on foot (pass within a few px) | + | + | 💡 |
| Ride through the skiers-only clubhouse | + | + | 💡 |
| Ollie off the snowcat / hit the drone | + | + | 💡 |
| Crash into the hot tub | + | caption | 💡 |

## Chasers

The thing that ends every run (PRD §4). **Ski Patrol is the v1 chaser** (decided Nov 19); the others can be modes or easter eggs.

| Chaser | How it works | Game over screen | Why it's funny | Status |
|---|---|---|---|---|
| **Ski Patrol on a snowmobile** (chosen for v1) | Heat from Slow Zones, people you hit and ropes you duck brings it sooner; past a distance it always comes | Your pass with a hole punched in it: "PASS CLIPPED" | Getting your pass pulled is every rider's fear | 💡 |
| **The Liftie** | Runs after you yelling "TICKET CHECK!" | Your ticket gets scanned red | Ticket checks | 💡 |
| **Avalanche** | A rolling white wall from above you | You're buried; beacon beeps | Pure physics dread | 💡 |
| **Jerry swarm** | A growing crowd of Jerries closes in | You become a Jerry (sprite swap) | Gaper Day energy | 💡 |
| **Powder panic** | On pow days, the whole mountain chases the last stash | "Tracked out" | Everyone races for the same stash | 💡 |

## UI and meta jokes

| Item | Where | Why it's funny | Status |
|---|---|---|---|
| Score is **clout**, with likes ticking up on tricks | HUD | Everything is content now | 💡 |
| Crash captions: "Yard sale!", "Sent it. Did not land it.", "Jerry of the Day nominee", "That's a core shot", "Pizza, not french fries" | Crashes | Ski-forum and comment-section voice | 💡 |
| End screen is a fake post of your worst crash with comments ("bro is cooked", "send it to Jerry") | End screen | Shareable screenshot | 💡 |
| Title screen pass price ticker that goes up every visit | Title | Pass prices climb every year | 💡 |
| "Chiller Score" of the run on the end screen | End screen | Open Slop crossover | 💡 |
| Unstrap/skate prompt: "skiers are laughing at you" | Catwalk | Snowboarder truth | 💡 |

## Cut

Kept here so they don't get re-pitched.

| Item | Cut | Notes |
|---|---|---|
| Uphill skinner | Nov 19, 2026 | Overlaps the splitboarder, who also skins uphill |
| Energy drink pickup | Nov 19, 2026 | The park rat still holds one as a prop (no pickup) |

## Playtest notes

After each content pass, write down what got a laugh and what nobody noticed.

- *(none yet)*
