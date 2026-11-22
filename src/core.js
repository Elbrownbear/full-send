// Full Send: shared namespace, tunables and small helpers. Loaded first.
// Every file adds itself to window.FS (plain scripts, so index.html also works opened straight from disk).
(function () {
  'use strict';
  const FS = (window.FS = window.FS || {});

  // ---------- Tunables: the "feel" lives here ----------
  FS.C = {
    G: 210,              // downhill pull (px/s²) when pointed straight down
    DRAG: 0.75,          // speed bleed; top speed is about G / DRAG. Lower = momentum carries through turns
    START_BOOST: 140,    // extra push below START_SPEED so getting going is quick
    START_SPEED: 90,
    SIDE_BRAKE: 90,      // extra slowdown when traversing fully sideways
    MAX: 290,            // hard speed cap (px/s)
    CARVE_LOCK: 170,     // above this speed you can't turn fully sideways: hard stop to slow down
    TURN_DELAY: 0.22,    // hold-to-repeat delay for keyboard steering
    TURN_REPEAT: 0.11,   // gets slower as speed rises
    PLOW_SPEED: 200,     // at or above this speed you plow through people instead of crashing
    STOP_MIN: 40,        // slowest speed a hard stop can start from
    STOP_DECEL: 560,     // how hard a hard stop scrubs speed
    SPRAY_MIN: 70,       // slowest stop that throws a scoring spray
    SPRAY_WINDOW: 0.22,  // seconds at the start of a stop that can hit people
    OLLIE_V: 95,         // ollie pop (up speed)
    KICK_V: 110,         // kicker pop, plus KICK_GAIN × speed
    KICK_GAIN: 0.45,
    GZ: 320,             // gravity in the air
    SPIN_RATE: 600,      // degrees per second while holding a spin key
    FLIP_RATE: 450,      // degrees per second while holding Up/Down in the air (too slow to finish a flip off a plain ollie)
    TOUCH_FLIP: 1.6,     // degrees per pixel of vertical swipe in the air
    CLEAN_DEG: 20,       // land within this many degrees of square: clean (×1.2)
    LAND_TOL: 55,        // ...within this: sketchy (×0.6). Worse: crash. Liquid courage tightens it to 35.
    SEND_PER_PT: 0.1,    // Full Send meter: fill per trick point
    SEND_CLEAN: 5,       // extra fill for a clean landing
    SEND_DECAY: 1.5,     // meter lost per second
    SEND_T: 8,           // FULL SEND mode length (s): double clout, faster, no new heat
    SEND_SPEED: 40,      // extra top speed in FULL SEND mode
    TOUCH_SPIN: 1.6,     // degrees per pixel of swipe in the air
    TOUCH_STEP_PX: 18,   // pixels of drag per steering step
    FLICK_PX: 30,        // upward flick distance (in ~150 ms) for a hard stop
    CRASH_T: 1.1,
    INVULN_T: 1.2,
    MPH: 0.25,           // px/s to the mph shown on screen
    PX_PER_M: 8,
    CHUNK: 256,
    EARLY_TREE_M: 500,     // before this distance...
    EARLY_TREE_KEEP: 0.35, // ...only this share of tree spots are used. Measured: 0.35 gives half the trees (171 → 83),
                           // because skipped spots free up room that other trees then fill. (Jordan, Nov 21: "50% less trees before 500 m")
    ZONE_ROWS: 2,        // chunks per zone band (2 × 256 px = 64 m)

    // Heat and Ski Patrol (PRD §4)
    HEAT_DECAY: 1.5,       // heat lost per second
    PATROL_BASE_M: 2000,   // past this distance patrol comes no matter what, and can't be shaken (Jordan, Nov 19)
    PATROL_SPEED: 165,     // snowmobile starting speed (px/s); you top out around 280. Slowed twice (Nov 19, Nov 20): "too fast"
    PATROL_ACCEL: 2,       // it keeps getting faster
    PATROL_MAX: 295,       // only just faster than your top speed, so clean riding holds them off a long time
    PATROL_LEVEL_UP: 15,   // each time you shake them, the next one starts this much faster
    PATROL_LOSE_PX: 650,   // gap that shakes a patrol called by heat
    PATROL_CATCH_PX: 10,

    // Heat sources (CONTENT.md, Heat sources)
    RADAR_LIMIT_MPH: 25,
    STASH_ENTRY_HEAT: 30,
    STASH_HEAT_PER_S: 4,
    STASH_CLOUT_PER_M: 2,
    DAD_YELL_PX: 40,
    DAD_HEAT: 5,

    // M2: snowboard feel
    LEAN_PX: 28,           // pull your thumb this far down to lean back
    // Catwalks eased twice Nov 20: first 35% (3.9–5.1 s → 2.5–3.3 s), then about 25% more (average ~2.9 s → ~2.15 s).
    // Nov 21: catwalk drag cut 25% (32 → 24), skating pushes 15% stronger (push 32 → 37, top skate speed 110 → 126),
    // and you unstrap sooner (SKATE_AT 40). Slow entries now take ~2.2 s instead of ~2.8 s.
    // Hit one at full speed and you coast across; come in slow and you still skate.
    FLAT_FRICTION: 24,     // catwalks: no pull, extra drag
    SKATE_AT: 40,          // below this speed on a catwalk you unstrap and skate (was 14; raised Nov 21 so you stop crawling and start pushing sooner)
    SKATE_PUSH: 37,        // each push adds this much speed
    SKATE_MAX: 126,
    POW_DRAG: 0.9,         // deep snow bogs you down...
    POW_DRAG_LEAN: 0.05,   // ...unless you lean back and float
    WELL_T: 2.4,           // stuck in a tree well this long, minus digging
    WELL_DIG: 0.3,         // each mash digs you out this much faster
    ICE_GRIP: 0.5,         // ice: less drag, no turning, no hard stop
    BUTTER_SPIN: 900,      // how fast a butter 180 animates (deg/s)

    // The Moto Gunslinger
    GUN_RANGE: 70,
    GUN_AGGRO_T: 3,
    GUN_COOLDOWN: 6,
    GUN_FIRE_EVERY: 0.55,
    BULLET_SPEED: 150,
    GUN_CHASE: 140,
  };

  FS.HEADINGS = [-90, -60, -30, 0, 30, 60, 90]; // degrees from straight downhill
  FS.MID = 3;
  FS.STEP = 1 / 60;
  FS.DEG = Math.PI / 180;

  FS.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  FS.pick = (arr, rnd = Math.random) => arr[Math.floor(rnd() * arr.length)];
  FS.rint = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));
  FS.range = (rnd, [a, b]) => a + rnd() * (b - a);
  // Weighted pick: { tree: 23, rock: 9 } -> 'tree' about 72% of the time.
  FS.roll = (weights, r) => {
    let total = 0;
    for (const k in weights) total += weights[k];
    let t = r * total;
    for (const k in weights) { t -= weights[k]; if (t < 0) return k; }
    return Object.keys(weights).pop();
  };

  // Seeded random: same seed, same mountain.
  FS.mulberry32 = (a) => () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  FS.hash3 = (s, x, y) => {
    let h = s ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  };

  // Saved settings. A private window may block storage, so every call is wrapped.
  FS.store = {
    get(k, d) { try { const v = localStorage.getItem('fullsend.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('fullsend.' + k, JSON.stringify(v)); } catch { /* ignore */ } },
  };

  // The current run's state. game.js fills it in on every new run; other files read it.
  FS.S = {};
})();
