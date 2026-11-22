// Full Send: content as data. People, zones, terrain and lines live here, not in the engine.
// CONTENT.md is the design catalog; this file is what's actually in the game.
(function () {
  'use strict';
  const FS = window.FS;

  // Real grab names; one is picked each time you leave the ground. Tindy (the half-tail, half-Indy grab everyone does by accident) is the joke one.
  FS.GRABS = ['Indy', 'Melon', 'Method', 'Stalefish', 'Mute', 'Nose grab', 'Tail grab', 'Japan', 'Roast Beef', 'Crail', 'Seatbelt', 'Lien', 'Truck Driver', 'Canadian Bacon', 'Tindy'];
  FS.SKETCHY = ['Sketchy!', 'Saved it', 'Butt check', 'Hand drag', 'Barely']; // landed, but not pretty

  FS.CRASH_LINES = {
    tree: ['Tree: 1, you: 0', 'Hugged a tree', 'Jerry of the Day nominee', 'Sent it. Did not land it.'],
    rock: ['Core shot!', 'Found a rock', 'That one is going in the group chat'],
    stump: ['Stumped', 'Caught an edge'],
    person: ['Yard sale!', 'Yard sale!', 'Jerry of the Day nominee'],
    bullet: ['Got smoked by a cowboy', 'Shot by a guy in roost guards'],
    spin: ['Over-rotated!', 'Caught an edge', 'Under-rotated!', 'Landed sideways'],
    shark: ['Core shot!', 'Shark attack', 'There was a rock under there'],
    rail: ['Racked on the rail', 'Ollie ONTO it', 'Rail: 1, you: 0'],
    box: ['Ate the box', 'Ollie ONTO it'],
    tower: ['Lift tower: undefeated', 'Hugged a lift tower'],
    snowgun: ['Snowgun to the face'],
    burger: ['$28 BURGER', 'Ordered the $28 burger'],
    hottub: ['HOT TUB TIME', 'Cannonball!'],
    palm: ['A palm tree?!', 'Bahamas vibes'],
    rv: ['Hit the RV', 'Into the RV'],
    snowcat: ['Flattened by a groomer', 'Snowcat: 1, you: 0'],
  };
  FS.LAUGHS = ['LOL SNOWBOARDERS', 'NEED A PUSH?', 'SKIS DON\'T DO THAT', 'SEE YOU AT THE BOTTOM'];

  FS.SAYS = {
    skiSprayed: ['HEY!!', 'MY GOGGLES!', 'NOT COOL, BRO', 'I PAID $300 FOR THIS'],
    boardSprayed: ['BRO, WHY', "WE'RE ON THE SAME TEAM", 'NOT THE HOMIES'],
    plowed: ['MY KNEES!', 'YARD SALE!', 'I KNOW A LAWYER', 'WHERE ARE MY POLES'],
    hit: { ski: 'WATCH IT!', board: 'BRO!', none: 'HEY!' },
  };

  FS.COLORS = {
    ski: ['#2f6fe4', '#e23b3b', '#f2c230', '#1fa3a3', '#7a4fe0'],
    board: ['#ff8a1f', '#3aa655', '#8e44ad', '#2b2b2b', '#8a5a2b'],
    boardTops: ['#ffd23f', '#00c2a8', '#ff5a5f', '#ffffff', '#6c8cff'],
    kids: ['#ff6fb5', '#5ad1ff', '#ffe14d', '#8cff66', '#ff9d3d'],
  };

  // People. rides decides spray and plow scoring (PRD §5): ski = clout + heat, board = lose clout, none = special.
  // beh is how they move, look is how they're drawn (sprites.js).
  FS.PEOPLE = {
    skier: { rides: 'ski', beh: 'cruise', look: 'skier', speed: [28, 62], standChance: 0.3 },
    boarder: { rides: 'board', beh: 'cruise', look: 'boarder', speed: [28, 62] },
    crew: { rides: 'board', beh: 'sit', look: 'sitter', group: [2, 4], spacing: 13 },
    jerry: { rides: 'ski', beh: 'zigzag', look: 'jerry', speed: [70, 100], says: ['WOOOOO', "I CAN'T STOP", 'SORRY!!'] },
    gaper: { rides: 'ski', beh: 'cruise', look: 'gaper', speed: [18, 30], says: ['HUH?', 'NICE DAY FOR IT'] },
    school: { rides: 'ski', beh: 'snake', look: 'kid', group: [4, 6], speed: [22, 30], heatMult: 2, says: ['PIZZA!', 'MOMMY!', 'FRENCH FRIES!'] },
    parkrat: { rides: 'board', beh: 'stand', look: 'parkrat', says: ['MY BAD, BRO', 'SICK', 'WHAT WAS THAT'] },
    dad: { rides: 'ski', beh: 'stand', look: 'dad', yell: 'SKI PATROL!', says: ['I AM CALLING PATROL', 'UNBELIEVABLE'] },
    patrol: { rides: 'ski', beh: 'stand', look: 'patrol', patrol: true, says: ['HEY! STOP!', 'PASS. NOW.'] },
    influencer: { rides: 'either', beh: 'stand', look: 'influencer', says: ["YOU'RE IN MY SHOT", '+10K VIEWS', 'LIKE AND SUBSCRIBE'] },
    gunslinger: { rides: 'none', beh: 'gunslinger', look: 'gunslinger', says: ['YEEHAW', 'DRAW!', "THIS TOWN AIN'T BIG ENOUGH"] },

    // ---- M3 content pass 1 (Nov 20) ----
    droneguy: { rides: 'ski', beh: 'stand', look: 'droneguy', says: ['MY DRONE!', 'GOT THE SHOT'], withDrone: true },
    drone: { rides: 'none', beh: 'drone', look: 'drone', flying: true },
    speaker: { rides: 'either', beh: 'cruise', look: 'speaker', speed: [25, 40], says: ['TURN IT UP', 'THIS IS MY SONG'] },
    tele: { rides: 'ski', beh: 'cruise', look: 'tele', speed: [35, 55], says: ['FREE THE HEEL', 'NICE PARALLEL TURNS, NERD'] },
    euro: { rides: 'ski', beh: 'carve', look: 'euro', speed: [110, 150], says: ['CIAO!', 'WUNDERBAR'] },
    gaperday: { rides: 'either', beh: 'cruise', look: 'costume', group: [3, 4], spacing: 14, speed: [30, 45], says: ['HAPPY GAPER DAY', 'WOOOO'], confetti: true },
    shotski: { rides: 'ski', beh: 'stand', look: 'shotski', wide: 72, mult: 3, says: ['THE SHOTSKI!', 'CHEERS'] },
    lostkid: { rides: 'ski', beh: 'wander', look: 'lostkid', heatMult: 2, says: ['MOMMY?', 'I LOST MY POLE'] },
    hopper: { rides: 'board', beh: 'hop', look: 'hopper', says: ['JUST STRAP IN', 'ALMOST THERE'] },
    sideslipper: { rides: 'board', beh: 'sideslip', look: 'sideslipper', speed: [12, 18], says: ['SORRY SORRY', 'IS THIS A BLUE?'] },
    splitboarder: { rides: 'board', beh: 'uphill', look: 'splitboarder', speed: [18, 26], says: ['GOT YOUR BEACON?', 'EARN YOUR TURNS'] },
    // Johnny Tsunami nod: prep-school skiers who think the mountain is theirs.
    academy: { rides: 'ski', beh: 'cruise', look: 'academy', group: [3, 4], spacing: 12, speed: [40, 55], yell: 'URCHIN!', says: ['URCHIN!', 'THIS IS OUR MOUNTAIN'] },
    // The Bomb Hole nod: two riders recording a podcast in camp chairs.
    podcast: { rides: 'board', beh: 'sit', look: 'podcast', group: [2, 2], spacing: 16, pod: true, says: ["YOU'RE ON THE POD", 'SMASH THAT SUBSCRIBE'] },
    // A groomer crossing the run, sometimes carrying the Colorado tycoon (Out Cold nod).
    snowcat: { rides: 'none', beh: 'snowcat', look: 'snowcat', wide: 30, solid: true, says: ['HEY!'] },
  };

  // Pickups: ride over them. Effects live in game.js (pickUp).
  FS.PICKUPS = {
    wax: { name: 'HOT WAX', say: 'FASTER!' },
    burrito: { name: 'BREAKFAST BURRITO', say: 'SAVES ONE CRASH' },
    pass: { name: 'EPIK PASS', alt: 'IKAHN PASS', say: 'HEAT -40' },
    waffle: { name: 'WAFFLE', say: '+50' },
    can: { name: 'LIQUID COURAGE', say: 'BIGGER AIRS' },
    gopro: { name: 'LOST GOPRO', say: 'FOUND IT +100', collect: 100 },
    bronze: { name: 'BRONZE MEDAL', say: 'WHO NEEDS THE OLYMPICS +150', collect: 150 }, // Beyond Medals nod
    wavemedal: { name: 'BIG WAVE MEDAL', say: 'SHARE THE MOUNTAIN +150', collect: 150 }, // Johnny Tsunami nod
  };

  // Terrain sizes: w × h collision box at the base, ht = how high you must be to clear it.
  FS.STATICS = {
    tree: { w: 10, h: 6, ht: 26 },
    rock: { w: 10, h: 5, ht: 7 },
    stump: { w: 6, h: 4, ht: 6 },
    kicker: { w: 34, h: 12, ht: 0 },  // Nov 21: 50% wider (was 22)
    slowzone: { w: 64, h: 4, ht: 0 },
    rail: { w: 4, h: 48, ht: 5 },   // ollie on to grind; ride into it on the ground and you crash
    box: { w: 8, h: 40, ht: 4 },    // a wider, friendlier rail
    ice: { w: 30, h: 14, ht: 0 },   // no turning, no hard stop
    shark: { w: 8, h: 4, ht: 6 },   // a rock hiding under fresh snow
    // M3
    tower: { w: 6, h: 6, ht: 40 },  // chairlift tower
    snowgun: { w: 8, h: 6, ht: 14 }, // snowmaking gun: blasts you sideways
    burger: { w: 22, h: 10, ht: 16 },// the $28 burger stand
    hottub: { w: 26, h: 12, ht: 8 }, // Out Cold nod: ollie it for points, crash in for a splash
    palm: { w: 8, h: 6, ht: 30 },    // Beyond Medals' Bahamas nod
    rv: { w: 34, h: 16, ht: 18 },    // Beyond Medals' RV: ride up the snow ramp and off the roof
    cord: { w: 30, h: 10, ht: 0 },   // fresh corduroy behind a snowcat: fast
    pickup: { w: 10, h: 8, ht: 0 },
  };
  // Drawn flat on the snow (under people and the rider).
  FS.GROUND = { kicker: true, ice: true, cord: true };
  // You can grind these.
  FS.GRINDABLE = { rail: true, box: true };

  // Zones: 64 m bands of mountain, each with its own mix. Weights are relative chances per roll.
  // slowZone = chance of a radar Slow Zone per chunk; rope = chance a band has a roped-off stash.
  // catwalk = chance a band has a flat catwalk across it. pow = deep snow everywhere (lean back).
  FS.ZONES = {
    // Nov 20: trees and rocks cut 15% everywhere (the difference went to empty snow), rails added to groomers.
  // Catwalk odds raised, then cut 25% the same day (groomers 0.45 → 0.34, glades 0.3 → 0.23).
    // M3 (Nov 20): pickups, set pieces and new people added; their weight came out of empty snow.
    // lift = chance a band has a chairlift running down it.
    // Nov 21: rocks and stumps cut 35% everywhere (the difference went to empty snow).
    // Nov 21: trees cut 40% everywhere (weights ×0.58, measured as 40% fewer trees over 30 mountains; the difference went to empty snow).
    groomer: {
      name: 'GROOMERS', count: 7, grow: 8, cluster: 0.15, jumpLine: 0.15, slowZone: 0.3, rope: 0.2, catwalk: 0.34, lift: 0.35,
      weights: { tree: 11.3, rock: 5, stump: 3.9, kicker: 7, ice: 4, rail: 2, box: 2, snowgun: 1, burger: 0.6, hottub: 0.5, pickup: 3, person: 20, empty: 43.8 },
      people: {
        skier: 10, boarder: 2.5, crew: 0.8, jerry: 2, gaper: 2, school: 1, dad: 1, influencer: 1, patrol: 0.4,
        speaker: 1, tele: 1, euro: 0.6, gaperday: 0.4, shotski: 0.4, lostkid: 0.5, hopper: 1, sideslipper: 0.8, academy: 0.6, podcast: 0.4, droneguy: 0.5, snowcat: 0.5,
      },
      pickups: { wax: 3, burrito: 3, pass: 2, waffle: 3, can: 1, gopro: 1, wavemedal: 0.3 },
    },
    park: {
      name: 'TERRAIN PARK', count: 8, grow: 4, cluster: 0, jumpLine: 0.7, slowZone: 0, rope: 0, catwalk: 0, lift: 0.2,
      weights: { tree: 1.5, rock: 0.52, kicker: 26, rail: 14, box: 12, rv: 0.6, pickup: 3, person: 12, empty: 39.38 },
      people: { parkrat: 4, boarder: 3, skier: 4, crew: 0.8, influencer: 1, jerry: 1, speaker: 1, hopper: 1, podcast: 0.6, droneguy: 0.6, gaperday: 0.4 },
      pickups: { can: 3, wax: 2, waffle: 2, gopro: 1, bronze: 1 },
    },
    glades: {
      name: 'GLADES', count: 11, grow: 10, cluster: 0.45, jumpLine: 0, slowZone: 0, rope: 0.5, catwalk: 0.23, lift: 0.2,
      weights: { tree: 29.6, rock: 3.3, stump: 5.2, kicker: 2, palm: 0.15, pickup: 2, person: 6, empty: 51.75 },
      people: { skier: 4, boarder: 1, jerry: 1.5, gaper: 0.5, gunslinger: 0.6, tele: 1, euro: 0.5, sideslipper: 0.6, lostkid: 0.3 },
      pickups: { burrito: 2, wax: 2, gopro: 1, wavemedal: 0.5 },
    },
    pow: {
      name: 'POWDER · LEAN BACK', count: 8, grow: 8, cluster: 0.3, jumpLine: 0, slowZone: 0, rope: 0, catwalk: 0, lift: 0.2, pow: true,
      weights: { tree: 13.8, shark: 6.8, stump: 2.6, kicker: 3, pickup: 2, person: 5, empty: 66.8 },
      people: { boarder: 3, skier: 2, jerry: 1, splitboarder: 1.5, tele: 0.5 },
      pickups: { wax: 2, burrito: 2, bronze: 0.5, wavemedal: 0.5 },
    },
  };
  FS.HECKLES = ['SEND IT!', 'HUCK IT!', 'DO A FLIP!', 'JERRY!', 'NICE, BRO', 'SHOW US A 1080'];
  // How often each zone comes up (the first band is always groomers).
  FS.ZONE_ODDS = { groomer: 38, park: 24, glades: 19, pow: 19 };

  // The group chat on the end screen (a nod to The Bomb Hole's group-chat episodes).
  FS.CHAT_HANDLES = ['@shredhead', '@parkrat99', '@pow_or_bust', '@i70survivor', '@jerrywatch'];
  FS.CHAT_GENERIC = ['bro is cooked', 'patrol was NOT playing', 'send it to Jerry of the Day', 'first chair tmrw?', 'that pass was $1,400 btw'];
})();
