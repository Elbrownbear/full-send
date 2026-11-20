// Full Send: the endless mountain. Chunks, zones, rope-line stashes, and the people on the hill.
(function () {
  'use strict';
  const FS = window.FS, C = FS.C, S = FS.S;

  const inStartArea = (x, y) => y < 240 && Math.abs(x) < 200;

  // ---------- Zones and rope lines ----------
  function zoneAt(cy) {
    const band = Math.floor(cy / C.ZONE_ROWS);
    if (band <= 0) return 'groomer';
    return FS.roll(FS.ZONE_ODDS, FS.mulberry32(FS.hash3(S.seed, 7777, band))());
  }
  const bandOf = (y) => Math.floor(Math.floor(y / C.CHUNK) / C.ZONE_ROWS);

  // Some bands have a flat catwalk across the whole run (about 23 m), where snowboarders end up skating.
  function catwalkFor(band) {
    let cw = S.catwalks.get(band);
    if (!cw) {
      const rnd = FS.mulberry32(FS.hash3(S.seed, 5151, band));
      const zone = FS.ZONES[zoneAt(band * C.ZONE_ROWS)];
      const y0 = band * C.ZONE_ROWS * C.CHUNK + 96;
      cw = { has: band >= 2 && rnd() < zone.catwalk, y0, y1: y0 + 185 };
      S.catwalks.set(band, cw);
    }
    return cw;
  }
  function inFlat(y) {
    if (y < 0) return false;
    const cw = catwalkFor(bandOf(y));
    return cw.has && y >= cw.y0 && y < cw.y1;
  }
  // Some bands have a chairlift running straight down them, beside wherever the rider was when it was built.
  // Riding under it doubles your trick points, and the chairs heckle you.
  function liftFor(band) {
    let lf = S.lifts.get(band);
    if (!lf) {
      const rnd = FS.mulberry32(FS.hash3(S.seed, 3131, band));
      const zone = FS.ZONES[zoneAt(band * C.ZONE_ROWS)];
      const has = band >= 2 && rnd() < (zone.lift || 0);
      const side = rnd() < 0.5 ? -1 : 1;
      const y0 = band * C.ZONE_ROWS * C.CHUNK;
      lf = { has, x: Math.round(S.rider.x + side * (30 + rnd() * 90)), y0, y1: y0 + C.ZONE_ROWS * C.CHUNK };
      S.lifts.set(band, lf);
    }
    return lf;
  }
  function underLift(x, y) {
    if (y < 0) return false;
    const lf = liftFor(bandOf(y));
    return lf.has && Math.abs(x - lf.x) < 16;
  }

  // Deep snow: the whole powder zone, and any roped-off stash.
  function inPow(x, y) {
    if (y < 0) return false;
    return !!FS.ZONES[zoneAt(Math.floor(y / C.CHUNK))].pow || inStash(x, y);
  }

  // Some bands have a rope line down one side, with a closed stash of fresh pow beyond it.
  // The rope is placed beside wherever the rider is when the band is first built.
  function ropeFor(band) {
    let rp = S.ropes.get(band);
    if (!rp) {
      const rnd = FS.mulberry32(FS.hash3(S.seed, 9191, band));
      const zone = FS.ZONES[zoneAt(band * C.ZONE_ROWS)];
      const has = band >= 2 && rnd() < zone.rope;
      const side = rnd() < 0.5 ? -1 : 1;
      const x = Math.round(S.rider.x + side * (110 + rnd() * 60));
      const y0 = band * C.ZONE_ROWS * C.CHUNK;
      rp = { has, side, x, y0, y1: y0 + C.ZONE_ROWS * C.CHUNK };
      S.ropes.set(band, rp);
    }
    return rp;
  }
  function inStash(x, y) {
    if (y < 0) return false;
    const rp = ropeFor(bandOf(y));
    return rp.has && (rp.side > 0 ? x > rp.x : x < rp.x);
  }

  // ---------- Chunks ----------
  function makeStatic(type, x, y) {
    const d = FS.STATICS[type];
    const o = { type, x: Math.round(x), y: Math.round(y), w: d.w, h: d.h, ht: d.ht };
    if (type === 'snowgun') o.dir = (o.x + o.y) & 1 ? 1 : -1; // which way it blasts
    return o;
  }
  // Statics added while playing (ice behind a sideslipper, corduroy behind a snowcat).
  function addStatic(type, x, y) {
    const ch = getChunk(Math.floor(x / C.CHUNK), Math.floor(y / C.CHUNK));
    if (ch.statics.length < 80) ch.statics.push(makeStatic(type, x, y));
  }

  function getChunk(cx, cy) {
    const key = cx + ',' + cy;
    let ch = S.chunks.get(key);
    if (!ch) {
      ch = genChunk(cx, cy, !S.spawned.has(key));
      S.spawned.add(key);
      S.chunks.set(key, ch);
    }
    return ch;
  }

  function genChunk(cx, cy, spawnPeople) {
    // Two random streams so the terrain comes out the same whether or not people spawn.
    const rnd = FS.mulberry32(FS.hash3(S.seed, cx, cy));
    const prnd = FS.mulberry32(FS.hash3(S.seed ^ 0x9e3779b9, cx, cy));
    const SZ = C.CHUNK, x0 = cx * SZ, y0 = cy * SZ;
    const speckles = [];
    for (let i = 0; i < 36; i++) speckles.push({ x: x0 + rnd() * SZ, y: y0 + rnd() * SZ, c: rnd() < 0.5 ? '#d3e0ee' : '#dde7f2' });
    const statics = [];
    if (cy < 0) return { statics, speckles };

    const zone = FS.ZONES[zoneAt(cy)];
    const distM = (y0 + SZ / 2) / C.PX_PER_M;
    const count = Math.round(zone.count + Math.min(zone.grow, distM / 60)); // busier the further you go

    const place = (type, x, y) => {
      if (inStartArea(x, y)) return false;
      // Stashes are open pow: no jumps or rocks, and only every other tree.
      if (inStash(x, y) && (type !== 'tree' || (Math.round(x) * 7 + Math.round(y) * 13) & 1)) return false;
      const d = FS.STATICS[type];
      if (inFlat(y) || inFlat(y - d.h)) return false; // catwalks are groomed and clear
      // Keep things apart by their sizes (boxes centered on each one's footprint).
      for (const s of statics) {
        if (Math.abs(s.x - x) < (s.w + d.w) / 2 + 8 && Math.abs((s.y - s.h / 2) - (y - d.h / 2)) < (s.h + d.h) / 2 + 10) return false;
      }
      statics.push(makeStatic(type, x, y));
      return true;
    };
    const spawn = (kind, x, y) => {
      if (!spawnPeople || inStartArea(x, y) || inStash(x, y)) return;
      spawnPerson(kind, x, y, prnd);
    };

    // Chairlift towers every 140 px down the lift line.
    const lf = liftFor(Math.floor(cy / C.ZONE_ROWS));
    if (lf.has && lf.x >= x0 && lf.x < x0 + SZ) {
      for (let ty = Math.ceil(y0 / 140) * 140; ty < y0 + SZ; ty += 140) if (ty >= lf.y0 + 40 && ty < lf.y1 - 20) place('tower', lf.x, ty);
    }

    // A radar Slow Zone, often with patrol standing beside it.
    const sz = rnd(), szx = x0 + 50 + rnd() * (SZ - 100), szy = y0 + 40 + rnd() * (SZ - 80), szPatrol = rnd();
    if (sz < zone.slowZone && place('slowzone', szx, szy) && szPatrol < 0.5) spawn('patrol', szx + 44, szy + 6);

    for (let i = 0; i < count; i++) {
      const x = x0 + rnd() * SZ, y = y0 + rnd() * SZ, type = FS.roll(zone.weights, rnd());
      if (type === 'tree') {
        place('tree', x, y);
        if (rnd() < zone.cluster) for (let k = 0; k < 4; k++) place('tree', x + (rnd() - 0.5) * 56, y + (rnd() - 0.5) * 44);
      } else if (type === 'kicker') {
        place('kicker', x, y);
        if (rnd() < zone.jumpLine) { place('kicker', x, y + 70); place('kicker', x, y + 140); } // a jump line
      } else if (type === 'person') {
        spawn(FS.roll(zone.people, prnd()), x, y);
      } else if (type === 'pickup') {
        const kind = FS.roll(zone.pickups, rnd());
        if (place('pickup', x, y)) statics[statics.length - 1].kind = kind;
      } else if (type !== 'empty') place(type, x, y);
    }
    return { statics, speckles };
  }

  function forNearbyStatics(x, y, fn) {
    const cx = Math.floor(x / C.CHUNK), cy = Math.floor(y / C.CHUNK);
    for (let i = cx - 1; i <= cx + 1; i++) for (let j = cy - 1; j <= cy + 1; j++) {
      for (const o of getChunk(i, j).statics) if (fn(o) === false) return;
    }
  }

  function prune() {
    const cyMin = Math.floor(S.camY / C.CHUNK) - 2, cxMid = Math.floor(S.camX / C.CHUNK);
    for (const k of S.chunks.keys()) {
      const [cx, cy] = k.split(',').map(Number);
      if (cy < cyMin || Math.abs(cx - cxMid) > 5) S.chunks.delete(k);
    }
    const bMin = bandOf(S.camY) - 2;
    for (const b of S.ropes.keys()) if (b < bMin) S.ropes.delete(b);
    for (const b of S.catwalks.keys()) if (b < bMin) S.catwalks.delete(b);
    for (const b of S.lifts.keys()) if (b < bMin) S.lifts.delete(b);
  }

  // ---------- People ----------
  function makePerson(kind, x, y, rnd, extra) {
    const def = FS.PEOPLE[kind];
    let rides = def.rides;
    if (rides === 'either') rides = rnd() < 0.5 ? 'ski' : 'board';
    let beh = def.beh;
    if (beh === 'cruise' && def.standChance && rnd() < def.standChance) beh = 'stand';
    const moving = beh === 'cruise' || beh === 'zigzag' || beh === 'snake' || beh === 'carve' || beh === 'sideslip' || beh === 'uphill';
    return Object.assign({
      kind, rides, beh, look: def.look, x, y, w: def.wide || 8, h: 6,
      dir: rnd() < 0.5 ? -1 : 1, tmr: 0, done: false, alt: 0, state: 'idle',
      vy: moving && def.speed ? FS.range(rnd, def.speed) : 0,
      phase: rnd() * 6.28, wob: 10 + rnd() * 20,
      color: FS.pick(kind === 'school' ? FS.COLORS.kids : rides === 'board' ? FS.COLORS.board : FS.COLORS.ski, rnd),
      board: FS.pick(FS.COLORS.boardTops, rnd),
      fallenT: 0, sprayed: false, flashT: 0, yellT: 0, yelled: false, aggroT: 0, coolT: 0, fireT: 0,
    }, extra);
  }

  function spawnPerson(kind, x, y, rnd) {
    const def = FS.PEOPLE[kind];
    if (def.beh === 'snake') {
      // Ski school: an instructor with a wiggly line of kids behind.
      const n = FS.rint(rnd, def.group[0], def.group[1]);
      const lead = makePerson(kind, x, y, rnd, { look: 'instructor', role: 'lead', color: '#d32f2f' });
      S.npcs.push(lead);
      for (let k = 1; k <= n; k++) S.npcs.push(makePerson(kind, x, y - k * 10, rnd, { leader: lead, idx: k }));
      return;
    }
    if (def.group) {
      const n = FS.rint(rnd, def.group[0], def.group[1]);
      for (let k = 0; k < n; k++) S.npcs.push(makePerson(kind, x + k * def.spacing, y, rnd, { idx: k, lead: k === 0 }));
      return;
    }
    const p = makePerson(kind, x, y, rnd);
    S.npcs.push(p);
    // The drone guy's drone, parked beside him until you come past.
    if (def.withDrone) S.npcs.push(makePerson('drone', x + 8, y - 2, rnd, { owner: p, alt: 0 }));
    // Snowcats drive across the run; a third of them carry the tycoon and his condo sign.
    if (kind === 'snowcat') { p.vx = p.dir * 35; p.tycoon = rnd() < 0.35; }
  }

  function aggro(n) {
    if (n.aggroT > 0) return;
    n.aggroT = C.GUN_AGGRO_T;
    n.fireT = 0.2;
    FS.popup(n.x, n.y - 28, FS.pick(FS.PEOPLE.gunslinger.says), 'bad');
  }

  function updateGunslinger(n, dt) {
    const r = S.rider, dx = r.x - n.x, dy = r.y - n.y, d = Math.hypot(dx, dy);
    if (n.coolT > 0) n.coolT -= dt;
    if (n.aggroT <= 0 && n.coolT <= 0 && d < C.GUN_RANGE && r.mode !== 'crash') aggro(n);
    if (n.aggroT <= 0) return;
    n.aggroT -= dt;
    if (d > 34) { n.x += (dx / d) * C.GUN_CHASE * dt; n.y += (dy / d) * C.GUN_CHASE * dt; } // chases, but keeps a gunfight distance
    n.fireT -= dt;
    if (n.fireT <= 0 && d < 220) {
      n.fireT = C.GUN_FIRE_EVERY;
      S.bullets.push({ x: n.x + 5, y: n.y - 1, vx: (dx / d) * C.BULLET_SPEED, vy: (dy / d) * C.BULLET_SPEED, life: 2 });
      FS.popup(n.x + 8, n.y - 20, 'BANG', 'bad');
    }
    if (n.aggroT <= 0) n.coolT = C.GUN_COOLDOWN;
  }

  // The drone: parked until you come past, then it films you (clout while it's on you), then flies into a tree.
  function updateDrone(n, dt) {
    const r = S.rider;
    if (n.state === 'idle') {
      if (Math.hypot(r.x - n.x, r.y - n.y) < 120) { n.state = 'follow'; n.tmr = 6; FS.popup(n.x, n.y - 30, 'GETTING THE SHOT', 'say'); }
      return;
    }
    if (n.state === 'follow') {
      n.alt = Math.min(30, n.alt + 40 * dt);
      const tx = r.x + 18, ty = r.y - 6;
      n.x += (tx - n.x) * Math.min(1, dt * 3); n.y += (ty - n.y) * Math.min(1, dt * 3);
      if (Math.hypot(r.x - n.x, r.y - n.y) < 60) FS.addClout(10 * dt, true);
      if ((n.tmr -= dt) <= 0) {
        n.state = 'crashing';
        let best = null, bd = 260; // find a tree to fly into
        forNearbyStatics(n.x, n.y, (o) => { if (o.type === 'tree') { const d = Math.hypot(o.x - n.x, o.y - n.y); if (d < bd) { bd = d; best = o; } } });
        n.target = best ? { x: best.x, y: best.y - 2 } : { x: n.x + 80 * n.dir, y: n.y + 40 };
      }
      return;
    }
    if (n.state === 'crashing') {
      const dx = n.target.x - n.x, dy = n.target.y - n.y, d = Math.hypot(dx, dy);
      if (d < 4) { n.state = 'down'; n.alt = 0; FS.popup(n.x, n.y - 24, 'DRONE DOWN', 'bad'); return; }
      n.x += (dx / d) * 150 * dt; n.y += (dy / d) * 150 * dt; n.alt = Math.max(2, n.alt - 10 * dt);
    }
  }

  function updatePeople(dt) {
    const r = S.rider, t = S.simT;
    for (let i = S.npcs.length - 1; i >= 0; i--) {
      const n = S.npcs[i];
      if (n.flashT > 0) n.flashT -= dt;
      if (n.yellT > 0) n.yellT -= dt;
      if (n.fallenT > 0) n.fallenT -= dt;
      else if (n.beh === 'cruise') { n.y += n.vy * dt; n.x += Math.sin(t * 1.4 + n.phase) * n.wob * dt; }
      else if (n.beh === 'zigzag') { n.y += n.vy * dt; n.x += Math.sin(t * 3 + n.phase) * 90 * dt; }
      else if (n.beh === 'snake') {
        if (n.role === 'lead') { n.y += n.vy * dt; n.x += Math.sin(t * 1.2 + n.phase) * 24 * dt; }
        else if (n.leader && n.leader.fallenT <= 0) {
          const L = n.leader; // follow the instructor's wiggle, a step behind
          n.y = L.y - n.idx * 10;
          n.x = L.x + Math.sin(t * 1.2 + L.phase - n.idx * 0.8) * 12 - Math.sin(t * 1.2 + L.phase) * 12;
        }
      } else if (n.beh === 'gunslinger') updateGunslinger(n, dt);
      else if (n.beh === 'carve') { n.y += n.vy * dt; n.x += Math.sin(t * 2.2 + n.phase) * 80 * dt; } // the Euro: fast, perfect S-turns
      else if (n.beh === 'wander') { // the lost kid: drifts wherever
        if ((n.tmr -= dt) <= 0) { n.tmr = 0.8 + Math.random() * 1.2; n.ang = Math.random() * Math.PI * 2; }
        n.x += Math.cos(n.ang || 0) * 18 * dt; n.y += (Math.sin(n.ang || 0) * 18 + 8) * dt;
      } else if (n.beh === 'hop') { n.x += n.dir * 42 * dt; n.alt = Math.abs(Math.sin(t * 9 + n.phase)) * 3; } // one foot out, hopping across the run
      else if (n.beh === 'sideslip') {
        n.y += n.vy * dt; n.x += Math.sin(t * 1.3 + n.phase) * 28 * dt;
        // Scrapes the pitch to ice behind them.
        if ((n.tmr -= dt) <= 0) { n.tmr = 2.2; addStatic('ice', n.x, n.y + 2); }
      } else if (n.beh === 'uphill') n.y -= n.vy * dt; // splitboarder skinning up
      else if (n.beh === 'snowcat') {
        n.x += n.vx * dt;
        if ((n.tmr -= dt) <= 0) { n.tmr = 0.75; addStatic('cord', n.x - n.dir * 18, n.y + 4); } // fresh corduroy behind it
      } else if (n.beh === 'drone') updateDrone(n, dt);

      const near = Math.hypot(r.x - n.x, r.y - n.y);
      // Prep-school skiers yell at you (the first of each group). No heat: they're not patrol.
      if (n.kind === 'academy' && n.lead && !n.yelled && near < 40) { n.yelled = true; FS.popup(n.x, n.y - 28, 'URCHIN!', 'bad'); }
      // Ride past the podcast and you're on the pod.
      if (n.kind === 'podcast' && n.lead && !n.done && near < 36) { n.done = true; FS.addClout(100); FS.popup(n.x + 8, n.y - 28, "YOU'RE ON THE POD +100", 'good'); }
      // The speaker guy: good vibes, once.
      if (n.kind === 'speaker' && !n.done && near < 50) { n.done = true; FS.addClout(20); FS.popup(n.x, n.y - 28, 'VIBES +20', 'good'); }

      // The dad who yells "SKI PATROL!" (he is not ski patrol).
      if (n.kind === 'dad' && !n.yelled && n.fallenT <= 0 && Math.hypot(r.x - n.x, r.y - n.y) < C.DAD_YELL_PX) {
        n.yelled = true; n.yellT = 1.2;
        FS.popup(n.x, n.y - 28, FS.PEOPLE.dad.yell, 'bad');
        FS.addHeat(C.DAD_HEAT);
      }
      if (n.y < r.y - 700 || n.y > r.y + 1400 || Math.abs(n.x - r.x) > 900) S.npcs.splice(i, 1);
    }
  }

  FS.world = { zoneAt, bandOf, ropeFor, inStash, catwalkFor, inFlat, inPow, liftFor, underLift, getChunk, forNearbyStatics, prune, updatePeople, aggro, makePerson };
})();
