// Full Send: content as data. People, zones, terrain and lines live here, not in the engine.
// CONTENT.md is the design catalog; this file is what's actually in the game.
(function () {
  'use strict';
  const FS = window.FS;

  FS.GRABS = ['Indy', 'Melon', 'Method', 'Stalefish', 'Mute', 'Nose grab', 'Tail grab'];

  FS.CRASH_LINES = {
    tree: ['Tree: 1, you: 0', 'Hugged a tree', 'Jerry of the Day nominee', 'Sent it. Did not land it.'],
    rock: ['Core shot!', 'Found a rock', 'That one is going in the group chat'],
    stump: ['Stumped', 'Caught an edge'],
    person: ['Yard sale!', 'Yard sale!', 'Jerry of the Day nominee'],
    bullet: ['Got smoked by a cowboy', 'Shot by a guy in roost guards'],
    spin: ['Over-rotated!', 'Caught an edge'],
    shark: ['Core shot!', 'Shark attack', 'There was a rock under there'],
    rail: ['Racked on the rail', 'Ollie ONTO it', 'Rail: 1, you: 0'],
    box: ['Ate the box', 'Ollie ONTO it'],
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
  };

  // Terrain sizes: w × h collision box at the base, ht = how high you must be to clear it.
  FS.STATICS = {
    tree: { w: 10, h: 6, ht: 26 },
    rock: { w: 10, h: 5, ht: 7 },
    stump: { w: 6, h: 4, ht: 6 },
    kicker: { w: 22, h: 12, ht: 0 },
    slowzone: { w: 64, h: 4, ht: 0 },
    rail: { w: 4, h: 48, ht: 5 },   // ollie on to grind; ride into it on the ground and you crash
    box: { w: 8, h: 40, ht: 4 },    // a wider, friendlier rail
    ice: { w: 30, h: 14, ht: 0 },   // no turning, no hard stop
    shark: { w: 8, h: 4, ht: 6 },   // a rock hiding under fresh snow
  };
  // Drawn flat on the snow (under people and the rider).
  FS.GROUND = { kicker: true, ice: true };
  // You can grind these.
  FS.GRINDABLE = { rail: true, box: true };

  // Zones: 64 m bands of mountain, each with its own mix. Weights are relative chances per roll.
  // slowZone = chance of a radar Slow Zone per chunk; rope = chance a band has a roped-off stash.
  // catwalk = chance a band has a flat catwalk across it. pow = deep snow everywhere (lean back).
  FS.ZONES = {
    // Nov 20: trees and rocks cut 15% everywhere (the difference went to empty snow), rails added to groomers, more catwalks.
    groomer: {
      name: 'GROOMERS', count: 7, grow: 8, cluster: 0.15, jumpLine: 0.15, slowZone: 0.3, rope: 0.2, catwalk: 0.45,
      weights: { tree: 19.5, rock: 7.7, stump: 6, kicker: 7, ice: 4, rail: 2, box: 2, person: 20, empty: 35.8 },
      people: { skier: 10, boarder: 2.5, crew: 0.8, jerry: 2, gaper: 2, school: 1, dad: 1, influencer: 1, patrol: 0.4 },
    },
    park: {
      name: 'TERRAIN PARK', count: 8, grow: 4, cluster: 0, jumpLine: 0.7, slowZone: 0, rope: 0, catwalk: 0,
      weights: { tree: 2.6, rock: 0.8, kicker: 26, rail: 14, box: 12, person: 12, empty: 41.6 },
      people: { parkrat: 4, boarder: 3, skier: 4, crew: 0.8, influencer: 1, jerry: 1 },
    },
    glades: {
      name: 'GLADES', count: 11, grow: 10, cluster: 0.45, jumpLine: 0, slowZone: 0, rope: 0.5, catwalk: 0.3,
      weights: { tree: 51, rock: 5.1, stump: 8, kicker: 2, person: 6, empty: 27.9 },
      people: { skier: 4, boarder: 1, jerry: 1.5, gaper: 0.5, gunslinger: 0.6 },
    },
    pow: {
      name: 'POWDER · LEAN BACK', count: 8, grow: 8, cluster: 0.3, jumpLine: 0, slowZone: 0, rope: 0, catwalk: 0, pow: true,
      weights: { tree: 23.8, shark: 6.8, stump: 4, kicker: 3, person: 5, empty: 57.4 },
      people: { boarder: 3, skier: 2, jerry: 1 },
    },
  };
  // How often each zone comes up (the first band is always groomers).
  FS.ZONE_ODDS = { groomer: 38, park: 24, glades: 19, pow: 19 };

  // The group chat on the end screen (a nod to The Bomb Hole's group-chat episodes).
  FS.CHAT_HANDLES = ['@shredhead', '@parkrat99', '@pow_or_bust', '@i70survivor', '@jerrywatch'];
  FS.CHAT_GENERIC = ['bro is cooked', 'patrol was NOT playing', 'send it to Jerry of the Day', 'first chair tmrw?', 'that pass was $1,400 btw'];
})();
