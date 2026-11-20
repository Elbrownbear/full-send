// Full Send: M0 feel prototype.
// One file on purpose for now: loop, input, world, physics and drawing.
// It gets split into modules (and content moves to a data file) in M1.
(() => {
  'use strict';

  // ---------- Tunables: the "feel" lives here ----------
  const C = {
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
    TOUCH_SPIN: 1.6,     // degrees per pixel of swipe in the air
    TOUCH_STEP_PX: 18,   // pixels of drag per steering step
    FLICK_PX: 30,        // upward flick distance (in ~150 ms) for a hard stop
    CRASH_T: 1.1,
    INVULN_T: 1.2,
    HEAT_DECAY: 1.5,     // patrol heat lost per second
    PX_PER_M: 8,
    CHUNK: 256,
  };
  const HEADINGS = [-90, -60, -30, 0, 30, 60, 90]; // degrees from straight downhill
  const MID = 3;
  const STEP = 1 / 60;
  const DEG = Math.PI / 180;
  const GRABS = ['Indy', 'Melon', 'Method', 'Stalefish', 'Mute', 'Nose grab', 'Tail grab'];
  const SKI_COLORS = ['#2f6fe4', '#e23b3b', '#f2c230', '#1fa3a3', '#7a4fe0'];
  const BOARD_COLORS = ['#ff8a1f', '#3aa655', '#8e44ad', '#2b2b2b', '#8a5a2b'];
  const BOARD_TOPS = ['#ffd23f', '#00c2a8', '#ff5a5f', '#ffffff', '#6c8cff'];
  const SKI_SAYS = ['HEY!!', 'MY GOGGLES!', 'NOT COOL, BRO', 'I PAID $300 FOR THIS'];
  const BOARD_SAYS = ['BRO, WHY', "WE'RE ON THE SAME TEAM", 'NOT THE HOMIES'];
  const PLOW_SAYS = ['MY KNEES!', 'YARD SALE!', 'I KNOW A LAWYER', 'WHERE ARE MY POLES'];

  const params = new URLSearchParams(location.search);
  const DEBUG = params.has('debug');
  const URL_SEED = params.has('seed') ? (parseInt(params.get('seed'), 10) || 1) : null;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const pick = (arr, rnd = Math.random) => arr[Math.floor(rnd() * arr.length)];

  // ---------- Saved settings (a private window may block storage) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('fullsend.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('fullsend.' + k, JSON.stringify(v)); } catch { /* ignore */ } },
  };

  // ---------- Seeded random: same seed, same mountain ----------
  function mulberry32(a) {
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash3(s, x, y) {
    let h = s ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  }

  // ---------- Canvas: draw the world small, scale it up crisp ----------
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const low = document.createElement('canvas');
  const g = low.getContext('2d');
  const satEl = document.getElementById('sat');
  let W = 320, H = 480, scale = 1, offX = 0, offY = 0, dpr = 1, safeTop = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    const vw = window.innerWidth, vh = window.innerHeight;
    scale = Math.max(1, Math.min(vw / 320, vh / 420));
    W = Math.min(480, Math.floor(vw / scale));
    H = Math.min(720, Math.floor(vh / scale));
    low.width = W; low.height = H;
    canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
    canvas.style.width = vw + 'px'; canvas.style.height = vh + 'px';
    offX = Math.round((vw - W * scale) / 2);
    offY = Math.round((vh - H * scale) / 2);
    safeTop = satEl.getBoundingClientRect().height;
  }

  // ---------- Run state ----------
  let state = 'title';
  let seed = 1, chunks = new Map(), spawned = new Set();
  let npcs = [], particles = [], popups = [], trail = [];
  let rider, clout = 0, heat = 0, dist = 0, caption = null, hintT = 0, simT = 0;
  let camX = 0, camY = 0, pruneT = 0, lastZone = null, zoneToast = null;
  let stance = store.get('stance', 'regular');
  let best = store.get('best', 0);

  function newRun() {
    seed = URL_SEED ?? ((Math.random() * 2 ** 31) | 0);
    chunks = new Map(); spawned = new Set();
    npcs = []; particles = []; popups = []; trail = [];
    rider = {
      x: 0, y: 0, z: 0, vz: 0, h: MID, speed: 0, mode: 'ride',
      stopping: false, stopDir: 0, stopSide: 1, stopSpeed: 0, sprayT: 0,
      airVX: 0, airVY: 0, spin: 0, grabT: 0, grabName: '', airT: 0, wasSwitch: false,
      sw: false, invuln: 0, crashT: 0, crashObj: null, turnT: 0,
    };
    clout = 0; heat = 0; dist = 0; caption = null; simT = 0; lastZone = null; zoneToast = null;
  }

  // ---------- World: endless chunks, generated on demand ----------
  const STATIC = {
    tree: { w: 10, h: 6, ht: 26 },
    rock: { w: 10, h: 5, ht: 7 },
    stump: { w: 6, h: 4, ht: 6 },
    kicker: { w: 22, h: 12, ht: 0 },
  };
  const inStartArea = (x, y) => y < 240 && Math.abs(x) < 200;

  function makeStatic(type, x, y) {
    const d = STATIC[type];
    return { type, x: Math.round(x), y: Math.round(y), w: d.w, h: d.h, ht: d.ht };
  }
  function makeNpc(rides, beh, x, y, rnd) {
    return {
      rides, beh, x, y, w: 8, h: 6,
      vy: beh === 'cruise' ? 28 + rnd() * 34 : 0,
      phase: rnd() * 6.28, wob: 10 + rnd() * 20,
      color: pick(rides === 'ski' ? SKI_COLORS : BOARD_COLORS, rnd),
      board: pick(BOARD_TOPS, rnd),
      fallenT: 0, sprayed: false, flashT: 0,
    };
  }

  function getChunk(cx, cy) {
    const key = cx + ',' + cy;
    let ch = chunks.get(key);
    if (!ch) {
      ch = genChunk(cx, cy, !spawned.has(key));
      spawned.add(key);
      chunks.set(key, ch);
    }
    return ch;
  }

  function genChunk(cx, cy, spawnPeople) {
    // Two random streams so the trees come out the same whether or not people spawn.
    const rnd = mulberry32(hash3(seed, cx, cy));
    const prnd = mulberry32(hash3(seed ^ 0x9e3779b9, cx, cy));
    const S = C.CHUNK, x0 = cx * S, y0 = cy * S;
    const speckles = [];
    for (let i = 0; i < 36; i++) speckles.push({ x: x0 + rnd() * S, y: y0 + rnd() * S, c: rnd() < 0.5 ? '#d3e0ee' : '#dde7f2' });
    const statics = [];
    if (cy < 0) return { statics, speckles };

    const distM = (y0 + S / 2) / C.PX_PER_M;
    const z = ZONES[zoneAt(cy)];
    const count = Math.round(z.count + Math.min(z.grow, distM / 60)); // busier the further you go
    const place = (type, x, y) => {
      if (inStartArea(x, y)) return;
      for (const s of statics) if (Math.abs(s.x - x) < 16 && Math.abs(s.y - y) < 14) return;
      statics.push(makeStatic(type, x, y));
    };

    for (let i = 0; i < count; i++) {
      const x = x0 + rnd() * S, y = y0 + rnd() * S, type = rollType(z.weights, rnd());
      if (type === 'tree') {
        place('tree', x, y);
        if (rnd() < z.cluster) for (let k = 0; k < 4; k++) place('tree', x + (rnd() - 0.5) * 56, y + (rnd() - 0.5) * 44);
      } else if (type === 'kicker') {
        place('kicker', x, y);
        if (rnd() < z.jumpLine) { place('kicker', x, y + 70); place('kicker', x, y + 140); } // a jump line
      } else if (type === 'person') {
        if (!spawnPeople || inStartArea(x, y)) continue;
        const p = prnd();
        if (p < z.skiers) npcs.push(makeNpc('ski', prnd() < 0.7 ? 'cruise' : 'stand', x, y, prnd));
        else if (p < 0.94) npcs.push(makeNpc('board', 'cruise', x, y, prnd));
        else {
          // The crew sitting in the middle of the run
          const n = 2 + Math.floor(prnd() * 3);
          for (let k = 0; k < n; k++) npcs.push(makeNpc('board', 'sit', x + k * 13, y, prnd));
        }
      } else if (type !== 'empty') place(type, x, y);
    }
    return { statics, speckles };
  }

  // ---------- Zones: bands of mountain with their own mix ----------
  // Weights are relative chances per roll. "empty" leaves open snow.
  const ZONES = {
    groomer: { name: 'GROOMERS', count: 7, grow: 8, cluster: 0.15, jumpLine: 0.15, skiers: 0.8,
      weights: { tree: 23, rock: 9, stump: 6, kicker: 7, person: 20, empty: 35 } },
    park: { name: 'TERRAIN PARK', count: 7, grow: 4, cluster: 0, jumpLine: 0.7, skiers: 0.5,
      weights: { tree: 3, rock: 1, kicker: 30, person: 12, empty: 54 } },
    glades: { name: 'GLADES', count: 11, grow: 10, cluster: 0.45, jumpLine: 0, skiers: 0.75,
      weights: { tree: 60, rock: 6, stump: 8, kicker: 2, person: 6, empty: 18 } },
  };
  const ZONE_ROWS = 2; // chunks per zone band (2 × 256 px = 64 m)
  function zoneAt(cy) {
    const band = Math.floor(cy / ZONE_ROWS);
    if (band <= 0) return 'groomer';
    const r = mulberry32(hash3(seed, 7777, band))();
    return r < 0.5 ? 'groomer' : r < 0.72 ? 'park' : 'glades';
  }
  function rollType(weights, r) {
    let total = 0;
    for (const k in weights) total += weights[k];
    let t = r * total;
    for (const k in weights) { t -= weights[k]; if (t < 0) return k; }
    return 'empty';
  }

  function forNearbyStatics(x, y, fn) {
    const cx = Math.floor(x / C.CHUNK), cy = Math.floor(y / C.CHUNK);
    for (let i = cx - 1; i <= cx + 1; i++) for (let j = cy - 1; j <= cy + 1; j++) {
      for (const o of getChunk(i, j).statics) if (fn(o) === false) return;
    }
  }

  function prune() {
    const cyMin = Math.floor(camY / C.CHUNK) - 2, cxMid = Math.floor(camX / C.CHUNK);
    for (const k of chunks.keys()) {
      const [cx, cy] = k.split(',').map(Number);
      if (cy < cyMin || Math.abs(cx - cxMid) > 5) chunks.delete(k);
    }
  }

  // ---------- Input ----------
  const input = { left: false, right: false, stopHeld: false, jumpHeld: false, jumpQueued: false, turnPulse: 0, downPulse: false, spinDir: 0 };
  const pointer = { mode: 'keys', mouse: null, touch: null };
  const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  function resetInput() {
    Object.assign(input, { left: false, right: false, stopHeld: false, jumpHeld: false, jumpQueued: false, turnPulse: 0, downPulse: false, spinDir: 0 });
    pointer.touch = null;
  }
  const grabHeld = () => input.jumpHeld || (pointer.mode === 'touch' && pointer.touch !== null);
  // After a landing, stop or crash, steering by drag starts fresh from where the thumb is now.
  function rebaseTouch() {
    const tp = pointer.touch;
    if (tp) { tp.baseH = rider.h; tp.sx = tp.lx; tp.flicked = false; }
  }

  function handleInput(dt) {
    const r = rider;
    input.spinDir = 0;
    if (input.jumpQueued) { input.jumpQueued = false; if (r.mode === 'ride' && !r.stopping) takeoff(C.OLLIE_V); }
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (r.mode === 'crash') { input.turnPulse = 0; input.downPulse = false; return; }
    if (r.mode === 'air') { input.spinDir = dir; input.turnPulse = 0; return; }
    if (input.stopHeld) requestStop();
    if (input.downPulse) { input.downPulse = false; if (!r.stopping) r.h = MID; }
    if (dir !== 0 && !r.stopping) {
      if (!input.turnPulse) { r.turnT -= dt; if (r.turnT <= 0) { steer(dir); r.turnT = C.TURN_REPEAT * (1 + r.speed / 250); } }
    }
    // A key tap counts even if it was released before this step ran.
    if (input.turnPulse && !r.stopping) { steer(input.turnPulse); r.turnT = C.TURN_DELAY; }
    input.turnPulse = 0;
    if (pointer.mode === 'mouse' && pointer.mouse) mouseSteer();
  }

  function steer(dir) {
    const r = rider;
    // Stopped and already pointing sideways: take a little skating step instead.
    if (r.speed < 15 && ((dir < 0 && r.h === 0) || (dir > 0 && r.h === 6))) { r.x += dir * 6; return; }
    r.h = limitHeading(r.h + dir);
  }
  // Fast riders carve; only slower riders can swing fully sideways.
  function limitHeading(h) {
    const m = rider.speed > C.CARVE_LOCK ? 2 : 3;
    return clamp(h, MID - m, MID + m);
  }

  function mouseSteer() {
    const r = rider;
    if (r.mode !== 'ride' || r.stopping) return;
    const sp = toScreen(r.x, r.y);
    const dx = pointer.mouse.x - sp.x, dy = pointer.mouse.y - sp.y;
    if (dy < -10 * scale) {
      if (r.speed >= C.STOP_MIN) requestStop(); else r.h = dx < 0 ? 0 : 6;
      return;
    }
    const ang = Math.atan2(dx, Math.max(dy, 1)) / DEG;
    r.h = limitHeading(Math.round(ang / 30) + MID);
  }

  const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', Space: 'jump' };
  addEventListener('keydown', (e) => {
    const k = KEYMAP[e.code];
    if (k) e.preventDefault();
    if (state === 'title') { if (!e.repeat && (e.code === 'Space' || e.code === 'Enter')) start(); return; }
    if (e.code === 'Escape' || e.code === 'KeyP') { if (state === 'play') pause(); else if (state === 'paused') resume(); return; }
    if (e.code === 'KeyR') { restart(); return; }
    if (state !== 'play' || !k) return;
    pointer.mode = 'keys';
    if (e.repeat) return;
    if (k === 'left') { input.left = true; input.turnPulse = -1; }
    else if (k === 'right') { input.right = true; input.turnPulse = 1; }
    else if (k === 'up') input.stopHeld = true;
    else if (k === 'down') input.downPulse = true;
    else if (k === 'jump') { input.jumpHeld = true; input.jumpQueued = true; }
  });
  addEventListener('keyup', (e) => {
    const k = KEYMAP[e.code];
    if (k === 'left') input.left = false;
    else if (k === 'right') input.right = false;
    else if (k === 'up') input.stopHeld = false;
    else if (k === 'jump') input.jumpHeld = false;
  });
  addEventListener('blur', resetInput);

  canvas.addEventListener('mousemove', (e) => {
    if (state !== 'play') return;
    pointer.mode = 'mouse';
    pointer.mouse = { x: e.clientX, y: e.clientY };
    if (rider.mode === 'air') rider.spin += e.movementX * 1.5;
  });
  canvas.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || state !== 'play') return;
    pointer.mode = 'mouse';
    input.jumpHeld = true; input.jumpQueued = true;
  });
  addEventListener('mouseup', () => { if (pointer.mode === 'mouse') input.jumpHeld = false; });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (state !== 'play') return;
    pointer.mode = 'touch';
    for (const t of e.changedTouches) {
      if (!pointer.touch) {
        const now = performance.now();
        pointer.touch = { id: t.identifier, sx: t.clientX, sy: t.clientY, lx: t.clientX, t0: now, baseH: rider.h, moved: false, flicked: false, hist: [{ y: t.clientY, t: now }] };
      } else {
        input.jumpQueued = true; // a second finger is an instant ollie
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const tp = pointer.touch;
    if (!tp || state !== 'play') return;
    for (const t of e.changedTouches) {
      if (t.identifier !== tp.id) continue;
      const now = performance.now();
      const dx = t.clientX - tp.sx, dy = t.clientY - tp.sy;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) tp.moved = true;
      tp.hist.push({ y: t.clientY, t: now });
      while (tp.hist.length > 1 && now - tp.hist[0].t > 150) tp.hist.shift();
      const flickDy = t.clientY - tp.hist[0].y;
      const r = rider;
      if (r.mode === 'air') r.spin += (t.clientX - tp.lx) * C.TOUCH_SPIN;
      else if (!tp.flicked && flickDy < -C.FLICK_PX && Math.abs(t.clientX - tp.lx) < 20) { tp.flicked = true; requestStop(); }
      else if (!tp.flicked && r.mode === 'ride' && !r.stopping) r.h = limitHeading(tp.baseH + Math.round(dx / (C.TOUCH_STEP_PX * (1 + r.speed / 300))));
      tp.lx = t.clientX;
    }
  }, { passive: false });

  const endTouch = (e) => {
    e.preventDefault();
    const tp = pointer.touch;
    if (!tp) return;
    for (const t of e.changedTouches) {
      if (t.identifier !== tp.id) continue;
      if (!tp.moved && performance.now() - tp.t0 < 250 && state === 'play') input.jumpQueued = true; // tap = ollie
      pointer.touch = null;
    }
  };
  canvas.addEventListener('touchend', endTouch, { passive: false });
  canvas.addEventListener('touchcancel', endTouch, { passive: false });

  // ---------- Rider physics ----------
  function update(dt) {
    simT += dt;
    handleInput(dt);
    const r = rider;
    if (r.invuln > 0) r.invuln -= dt;
    if (r.mode === 'crash') { r.crashT -= dt; if (r.crashT <= 0) getUp(); }
    else if (r.mode === 'air') updateAir(dt);
    else updateGround(dt);
    if (r.mode !== 'crash') collide();
    updateNpcs(dt);
    updateParticles(dt);
    for (let i = popups.length - 1; i >= 0; i--) if ((popups[i].t -= dt) <= 0) popups.splice(i, 1);
    heat = Math.max(0, heat - C.HEAT_DECAY * dt);
    dist = Math.max(dist, r.y / C.PX_PER_M);
    if (dist > best) best = dist;
    if (caption && (caption.t -= dt) <= 0) caption = null;
    const zk = zoneAt(Math.floor(r.y / C.CHUNK));
    if (zk !== lastZone) { if (lastZone) zoneToast = { text: ZONES[zk].name, t: 2.2 }; lastZone = zk; }
    if (zoneToast && (zoneToast.t -= dt) <= 0) zoneToast = null;
    if (hintT > 0) hintT -= dt;
    if ((pruneT -= dt) <= 0) { prune(); pruneT = 1; }
  }

  function updateGround(dt) {
    const r = rider;
    let deg;
    if (r.stopping) {
      deg = r.stopDir;
      r.speed -= C.STOP_DECEL * dt;
      if (r.sprayT > 0) { r.sprayT -= dt; checkSpray(); }
      emitSpray(3);
      if (r.speed <= 5) { r.speed = 0; r.stopping = false; r.h = r.stopSide > 0 ? 6 : 0; rebaseTouch(); }
    } else {
      deg = HEADINGS[r.h];
      const pull = Math.cos(deg * DEG);
      let acc = C.G * pull - C.DRAG * r.speed;
      if (r.speed < C.START_SPEED && pull > 0.3) acc += C.START_BOOST * pull;
      if (Math.abs(deg) === 90) acc -= C.SIDE_BRAKE;
      r.speed = clamp(r.speed + acc * dt, 0, C.MAX);
    }
    const a = deg * DEG, prevY = r.y;
    r.x += Math.sin(a) * r.speed * dt;
    r.y += Math.cos(a) * r.speed * dt;
    addTrail(r.stopping ? 4 : 2);
    if (!r.stopping && r.speed > 40) {
      forNearbyStatics(r.x, r.y, (o) => {
        if (o.type === 'kicker' && Math.abs(r.x - o.x) < 11 && prevY < o.y - 1 && r.y >= o.y - 1) {
          takeoff(C.KICK_V + r.speed * C.KICK_GAIN);
          return false;
        }
      });
    }
  }

  function takeoff(vz) {
    const r = rider, a = HEADINGS[r.h] * DEG;
    r.mode = 'air'; r.vz = vz; r.z = 0.01;
    r.airVX = Math.sin(a) * r.speed; r.airVY = Math.cos(a) * r.speed;
    r.spin = 0; r.grabT = 0; r.airT = 0; r.wasSwitch = r.sw; r.grabName = pick(GRABS);
    trail.push(null);
  }

  function updateAir(dt) {
    const r = rider;
    r.airT += dt;
    r.x += r.airVX * dt; r.y += r.airVY * dt;
    r.vz -= C.GZ * dt; r.z += r.vz * dt;
    if (input.spinDir) r.spin += input.spinDir * C.SPIN_RATE * dt;
    if (grabHeld()) r.grabT += dt;
    if (r.z <= 0) land();
  }

  function land() {
    const r = rider;
    r.z = 0; r.vz = 0;
    const n = Math.round(r.spin / 180);
    if (Math.abs(r.spin - n * 180) > 55) { r.spin = 0; crash('Over-rotated!', null); return; }
    r.mode = 'ride';
    const half = Math.abs(n);
    if (half % 2 === 1) r.sw = !r.sw;
    let pts = 0;
    const names = [];
    if (half > 0) { pts += half * 90; names.push(String(half * 180)); }
    if (r.grabT > 0.12) { pts += Math.round(40 + r.grabT * 150); names.push(r.grabName); }
    if (r.airT > 0.8) pts += Math.round((r.airT - 0.8) * 100);
    if (pts > 0) {
      if (r.wasSwitch) { pts *= 1.25; names.unshift('Switch'); }
      pts = Math.round(pts / 5) * 5;
      clout += pts;
      popup(r.x, r.y - 26, `${names.join(' ') || 'Big air'} +${pts}`, 'trick');
    }
    r.spin = 0;
    trail.push(null);
    rebaseTouch();
  }

  function requestStop() {
    const r = rider;
    if (r.mode !== 'ride' || r.stopping || r.speed < C.STOP_MIN) return;
    r.stopping = true;
    r.stopDir = HEADINGS[r.h];
    r.stopSpeed = r.speed;
    r.sprayT = C.SPRAY_WINDOW;
    // Straight down, stop heelside (facing downhill), which depends on stance.
    const heelSide = ((stance === 'goofy') !== r.sw) ? -1 : 1;
    r.stopSide = r.h > MID ? 1 : r.h < MID ? -1 : heelSide;
    emitSpray(14);
  }

  function crash(text, obj) {
    const r = rider;
    if (r.mode === 'crash') return;
    r.mode = 'crash'; r.crashT = C.CRASH_T; r.speed = 0; r.z = 0; r.vz = 0;
    r.stopping = false; r.spin = 0; r.crashObj = obj;
    caption = { text, t: 1.6, life: 1.6 };
    burst(r.x, r.y, 18);
    trail.push(null);
  }

  function getUp() {
    const r = rider;
    r.mode = 'ride'; r.invuln = C.INVULN_T;
    const o = r.crashObj;
    if (o && o.ht !== undefined) r.y = Math.max(r.y, o.y + 6); // pop out below the tree or rock
    r.crashObj = null;
    rebaseTouch();
  }

  const overlap = (a, b) => Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs((a.y - a.h / 2) - (b.y - b.h / 2)) < (a.h + b.h) / 2;
  const CRASH_LINES = {
    tree: ['Tree: 1, you: 0', 'Hugged a tree', 'Jerry of the Day nominee', 'Sent it. Did not land it.'],
    rock: ['Core shot!', 'Found a rock', 'That one is going in the group chat'],
    stump: ['Stumped', 'Caught an edge'],
  };

  function collide() {
    const r = rider;
    if (r.invuln > 0) return;
    const rb = { x: r.x, y: r.y, w: 6, h: 4 };
    let hit = null;
    forNearbyStatics(r.x, r.y, (o) => {
      if (o.type === 'kicker' || r.z >= o.ht) return;
      if (overlap(rb, o)) { hit = o; return false; }
    });
    if (hit) { crash(pick(CRASH_LINES[hit.type]), hit); return; }
    if (r.z >= 16 || r.stopping) return; // sliding to a stop sprays people instead of hitting them
    for (const n of npcs) {
      if (n.fallenT > 0 || !overlap(rb, n)) continue;
      if (r.speed >= C.PLOW_SPEED) { plow(n); continue; }
      n.fallenT = 2.5;
      heat = Math.min(100, heat + 20);
      popup(n.x, n.y - 22, n.rides === 'ski' ? 'WATCH IT!' : 'BRO!', 'say');
      crash('Yard sale!', n);
      return;
    }
  }

  // Fast enough and you go straight through people instead of crashing.
  function plowResult(npc, speed) {
    if (npc.rides === 'board') return { clout: -150, heat: 10, text: '-150 FRIENDLY FIRE', say: pick(BOARD_SAYS) };
    const pts = Math.round((100 + (speed - C.PLOW_SPEED) * 1.5) / 5) * 5;
    return { clout: pts, heat: 25, text: `+${pts} BOWLED OVER`, say: pick(PLOW_SAYS) };
  }
  function plow(n) {
    const r = rider;
    const res = plowResult(n, r.speed);
    n.fallenT = 3;
    r.speed *= 0.8;
    clout += res.clout;
    heat = Math.min(100, heat + res.heat);
    burst(n.x, n.y, 14);
    popup(n.x, n.y - 30, res.text, res.clout >= 0 ? 'good' : 'bad');
    popup(n.x, n.y - 18, res.say, 'say');
  }

  // ---------- Spray: the hard stop that scores ----------
  function sprayResult(npc, speed, d, reach) {
    if (npc.rides === 'board') return { clout: -75, heat: 0, text: '-75 SPRAYED A HOMIE', say: pick(BOARD_SAYS) };
    const close = 1 + Math.max(0, 1 - d / reach); // closer stop = up to double
    const pts = Math.round(((30 + speed * 0.6) * close) / 5) * 5;
    return { clout: pts, heat: 15, text: `+${pts} SPRAYED`, say: pick(SKI_SAYS) };
  }

  function checkSpray() {
    const r = rider;
    if (r.stopSpeed < C.SPRAY_MIN) return;
    const a = r.stopDir * DEG, ux = Math.sin(a), uy = Math.cos(a);
    const reach = 18 + r.stopSpeed * 0.14;
    for (const n of npcs) {
      if (n.sprayed || n.fallenT > 0) continue;
      const dx = n.x - r.x, dy = (n.y - 3) - r.y, d = Math.hypot(dx, dy);
      if (d > reach) continue;
      if (d > 10 && (dx * ux + dy * uy) / d < 0.45) continue; // must be in front of the spray
      n.sprayed = true; n.flashT = 0.6;
      const res = sprayResult(n, r.stopSpeed, d, reach);
      clout += res.clout;
      heat = Math.min(100, heat + res.heat);
      popup(n.x, n.y - 30, res.text, res.clout >= 0 ? 'good' : 'bad');
      popup(n.x, n.y - 18, res.say, 'say');
    }
  }

  // ---------- People, particles, popups, trail ----------
  function updateNpcs(dt) {
    for (let i = npcs.length - 1; i >= 0; i--) {
      const n = npcs[i];
      if (n.fallenT > 0) n.fallenT -= dt;
      else if (n.beh === 'cruise') { n.y += n.vy * dt; n.x += Math.sin(simT * 1.4 + n.phase) * n.wob * dt; }
      if (n.flashT > 0) n.flashT -= dt;
      if (n.y < rider.y - 700 || n.y > rider.y + 1400 || Math.abs(n.x - rider.x) > 900) npcs.splice(i, 1);
    }
  }

  const SNOW = ['#ffffff', '#ffffff', '#ffffff', '#b9cde6', '#9fb8d8'];
  function emitSpray(n) {
    const r = rider, a = r.stopDir * DEG;
    for (let i = 0; i < n; i++) {
      const ang = a + (Math.random() - 0.5) * 1.3;
      const v = 50 + Math.random() * 90 + r.speed * 0.45;
      particles.push({ x: r.x + (Math.random() - 0.5) * 6, y: r.y, z: 2, vx: Math.sin(ang) * v, vy: Math.cos(ang) * v, vz: 30 + Math.random() * 80, life: 0.45 + Math.random() * 0.4, c: pick(SNOW) });
    }
  }
  function burst(x, y, n) {
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2, v = 30 + Math.random() * 80;
      particles.push({ x, y, z: 4, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, vz: 40 + Math.random() * 90, life: 0.5 + Math.random() * 0.5, c: pick(SNOW) });
    }
  }
  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if ((p.life -= dt) <= 0) { particles.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vz -= C.GZ * dt; p.z = Math.max(0, p.z + p.vz * dt);
      p.vx *= 0.94; p.vy *= 0.94;
    }
  }
  function popup(x, y, text, kind) { popups.push({ x, y, text, kind, t: 1.3, life: 1.3 }); }

  function addTrail(w) {
    const r = rider, last = trail[trail.length - 1];
    if (!last || Math.hypot(last.x - r.x, last.y - r.y) > 3) trail.push({ x: r.x, y: r.y, w });
    if (trail.length > 450) trail.splice(0, 50);
  }

  // ---------- Drawing (low-res canvas) ----------
  function px(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); }
  const toScreen = (wx, wy) => ({ x: offX + (wx - camX) * scale, y: offY + (wy - camY) * scale });

  function tier(cx, top, rows, half, c1, c2) {
    for (let i = 0; i < rows; i++) {
      const w = Math.round(1 + (i / (rows - 1)) * half);
      px(cx - w, top + i, w, 1, c1);
      px(cx, top + i, w + 1, 1, c2);
    }
  }
  function drawTree(sx, sy) {
    px(sx - 1, sy - 5, 3, 5, '#6b4a2b');
    tier(sx, sy - 13, 9, 8, '#24703f', '#1b5631');
    tier(sx, sy - 19, 8, 6, '#24703f', '#1b5631');
    tier(sx, sy - 25, 7, 4, '#24703f', '#1b5631');
    px(sx - 1, sy - 25, 2, 1, '#fff'); px(sx - 3, sy - 19, 3, 1, '#fff'); px(sx - 5, sy - 13, 3, 1, '#fff');
  }
  function drawRock(sx, sy) {
    px(sx - 5, sy - 4, 10, 4, '#7d8590'); px(sx - 4, sy - 6, 8, 2, '#959ca6'); px(sx - 3, sy - 7, 5, 1, '#aeb4bc');
    px(sx - 2, sy - 7, 3, 1, '#fff'); px(sx + 2, sy - 4, 3, 4, '#666d77');
  }
  function drawStump(sx, sy) {
    px(sx - 3, sy - 4, 6, 4, '#7a5230'); px(sx - 3, sy - 5, 6, 1, '#c8a27a'); px(sx - 2, sy - 6, 4, 1, '#fff');
  }
  function drawKicker(sx, sy) {
    for (let i = 0; i < 12; i++) {
      const w = 8 + Math.round((i * 3) / 11);
      px(sx - w, sy - 12 + i, w * 2, 1, i < 2 ? '#f7fbff' : '#dce8f5');
      px(sx - w, sy - 12 + i, 1, 1, '#a9bdd6'); px(sx + w - 1, sy - 12 + i, 1, 1, '#a9bdd6');
    }
    px(sx - 11, sy - 1, 22, 2, '#6f8fb8');
    px(sx - 11, sy + 1, 22, 3, '#cfdcea');
    px(sx - 12, sy - 3, 2, 3, '#ff7a1a'); px(sx + 10, sy - 3, 2, 3, '#ff7a1a');
  }
  function drawStatic(o) {
    const sx = o.x - camX, sy = o.y - camY;
    if (o.type === 'tree') drawTree(sx, sy);
    else if (o.type === 'rock') drawRock(sx, sy);
    else if (o.type === 'stump') drawStump(sx, sy);
  }
  function drawStartGate() {
    const sx = -camX, sy = -camY - 8;
    if (sy < -40 || sy > H + 10) return;
    px(sx - 34, sy - 22, 2, 22, '#41557a'); px(sx + 32, sy - 22, 2, 22, '#41557a');
    px(sx - 34, sy - 24, 68, 7, '#ff3d7f');
    for (let i = 0; i < 8; i++) px(sx - 30 + i * 8, sy - 22, 4, 3, '#ffffff');
  }

  function drawPerson(n) {
    const sx = Math.round(n.x - camX), sy = Math.round(n.y - camY);
    const skin = '#f0c6a0';
    if (n.fallenT > 0) {
      px(sx - 6, sy - 5, 10, 4, n.color); px(sx + 4, sy - 6, 4, 4, skin);
      if (n.rides === 'ski') { px(sx - 9, sy - 1, 7, 1, '#333'); px(sx + 1, sy + 1, 7, 1, '#333'); }
      else px(sx - 7, sy, 12, 2, n.board);
      return;
    }
    if (n.rides === 'ski') {
      px(sx - 2, sy - 6, 1, 10, '#222'); px(sx + 1, sy - 6, 1, 10, '#222');
      px(sx - 2, sy - 9, 4, 4, '#2b2f3a');
      px(sx - 3, sy - 15, 6, 6, n.color);
      px(sx - 2, sy - 19, 4, 4, skin); px(sx - 2, sy - 19, 4, 2, '#eeeeee'); px(sx - 2, sy - 17, 4, 1, '#ffd400');
      px(sx - 5, sy - 14, 1, 10, '#9aa0a8'); px(sx + 4, sy - 14, 1, 10, '#9aa0a8');
    } else if (n.beh === 'sit') {
      px(sx - 6, sy - 1, 12, 3, n.board);
      px(sx - 4, sy - 8, 8, 7, n.color);
      px(sx - 2, sy - 12, 4, 4, skin); px(sx - 2, sy - 13, 4, 2, '#222');
    } else {
      px(sx - 6, sy - 2, 12, 3, n.board);
      px(sx - 3, sy - 8, 6, 6, '#3a3f4b');
      px(sx - 4, sy - 15, 8, 7, n.color);
      px(sx - 2, sy - 19, 4, 4, skin); px(sx - 2, sy - 20, 4, 2, '#222');
    }
    if (n.flashT > 0 && Math.floor(n.flashT * 20) % 2 === 0) px(sx - 5, sy - 20, 10, 16, '#ffffff');
    else if (n.sprayed) { px(sx - 2, sy - 14, 1, 1, '#fff'); px(sx + 1, sy - 11, 1, 1, '#fff'); px(sx - 1, sy - 17, 2, 1, '#fff'); px(sx + 2, sy - 8, 1, 1, '#fff'); }
  }

  function drawBoard(cx, cy, deg, color) {
    const a = deg * DEG, ux = Math.sin(a), uy = Math.cos(a) * 0.7;
    for (let t = -7; t <= 7; t++) px(cx + ux * t - 1, cy + uy * t - 1, 3, 2, Math.abs(t) >= 6 ? '#b8860b' : color);
  }

  function drawRider() {
    const r = rider;
    if (r.invuln > 0 && Math.floor(simT * 12) % 2 === 1) return;
    const sx = Math.round(r.x - camX), sy = Math.round(r.y - camY), by = sy - Math.round(r.z);
    const jacket = '#ff3d7f', helmet = '#1d1d1f';
    if (r.mode === 'crash') {
      drawBoard(sx, sy, simT * 500, '#ffd23f');
      px(sx - 6, sy - 5, 11, 4, jacket); px(sx + 5, sy - 6, 4, 4, helmet);
      return;
    }
    let deg = HEADINGS[r.h];
    if (r.stopping) deg = r.stopDir + 90;
    if (r.mode === 'air') deg += r.spin;
    drawBoard(sx, by, deg, '#ffd23f');
    // Facing downhill (heelside) shows the goggles; toeside shows the back of the helmet.
    const travel = r.stopping ? r.stopSide : Math.sin(HEADINGS[r.h] * DEG);
    let heel = travel >= 0;
    if (stance === 'goofy') heel = !heel;
    if (r.sw) heel = !heel;
    const crouch = (r.mode === 'air' && grabHeld()) || r.stopping ? 2 : 0;
    px(sx - 2, by - 6, 4, 5, '#22314d');
    px(sx - 3, by - 12 + crouch, 6, 6, jacket);
    if (r.mode === 'air' && grabHeld()) px(sx + 3, by - 8, 1, 6, jacket);
    px(sx - 2, by - 16 + crouch, 4, 4, helmet);
    if (heel) px(sx - 2, by - 14 + crouch, 4, 1, '#3ce0ff');
  }

  function render() {
    camX = Math.round(rider.x - W / 2);
    camY = Math.round(rider.y - H * 0.3);
    g.fillStyle = '#eaf1f8';
    g.fillRect(0, 0, W, H);

    const cx0 = Math.floor(camX / C.CHUNK) - 1, cx1 = Math.floor((camX + W) / C.CHUNK) + 1;
    const cy0 = Math.floor((camY - 40) / C.CHUNK), cy1 = Math.floor((camY + H + 40) / C.CHUNK) + 1;
    const ground = [], ups = [];
    for (let i = cx0; i <= cx1; i++) for (let j = cy0; j <= cy1; j++) {
      const ch = getChunk(i, j);
      for (const s of ch.speckles) {
        const x = s.x - camX, y = s.y - camY;
        if (x >= 0 && x < W && y >= 0 && y < H) { g.fillStyle = s.c; g.fillRect(x | 0, y | 0, 1, 1); }
      }
      for (const o of ch.statics) {
        const x = o.x - camX, y = o.y - camY;
        if (x < -20 || x > W + 20 || y < -10 || y > H + 40) continue;
        (o.type === 'kicker' ? ground : ups).push(o);
      }
    }
    for (const o of ground) drawKicker(o.x - camX, o.y - camY);
    drawStartGate();

    g.lineCap = 'square';
    let prev = null;
    for (const p of trail) {
      if (!p) { prev = null; continue; }
      if (prev) {
        g.strokeStyle = p.w > 2 ? '#c3d3e6' : '#d0dceb';
        g.lineWidth = p.w;
        g.beginPath(); g.moveTo(prev.x - camX, prev.y - camY); g.lineTo(p.x - camX, p.y - camY); g.stroke();
      }
      prev = p;
    }

    for (const n of npcs) {
      const x = n.x - camX, y = n.y - camY;
      if (x > -20 && x < W + 20 && y > -10 && y < H + 30) ups.push(n);
    }
    ups.push(rider);
    const key = (o) => (o === rider ? rider.y + (rider.z > 6 ? 60 : 0) : o.y);
    ups.sort((a, b) => key(a) - key(b));
    if (rider.mode === 'air') px(rider.x - camX - 6, rider.y - camY - 1, 12, 3, 'rgba(60,80,110,0.25)');
    for (const o of ups) {
      if (o === rider) drawRider();
      else if (o.rides) drawPerson(o);
      else drawStatic(o);
    }
    for (const p of particles) px(p.x - camX, p.y - camY - p.z, 2, 2, p.c);

    if (DEBUG) {
      g.strokeStyle = 'rgba(255,0,0,0.8)'; g.lineWidth = 1;
      for (const o of ups) {
        const w = o === rider ? 6 : o.w, h = o === rider ? 4 : o.h;
        g.strokeRect(Math.round(o.x - camX - w / 2) + 0.5, Math.round(o.y - camY - h) + 0.5, w, h);
      }
    }

    // Blit the small canvas up to the screen with crisp pixels.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0f1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(low, offX, offY, W * scale, H * scale);
    drawHud();
  }

  // ---------- HUD (drawn sharp, at screen resolution) ----------
  function text(str, x, y, size, color, align = 'left') {
    ctx.font = `${size}px "Press Start 2P", ui-monospace, monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.strokeText(str, x, y);
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  }
  const POP_COLORS = { good: '#1a7f37', bad: '#c62828', say: '#41557a', trick: '#6a1b9a' };

  let fps = 60, fpsT = 0, fpsN = 0;
  function drawHud() {
    if (state === 'title') return;
    const gw = W * scale, L = offX + 12, T = offY + 12 + safeTop;
    text(`${Math.floor(dist).toLocaleString()} m`, L, T, 16, '#0f1a2e');
    text(`CLOUT ${clout.toLocaleString()}`, L, T + 24, 10, clout < 0 ? '#c62828' : '#0f1a2e');
    text(`${Math.round(rider.speed * 0.25)} MPH${rider.sw ? '  SWITCH' : ''}`, L, T + 40, 8, '#41557a');

    const bw = 84, bx = offX + gw - 12 - 50 - bw;
    text('PATROL HEAT', bx, T, 7, '#41557a');
    ctx.fillStyle = '#0f1a2e'; ctx.fillRect(bx, T + 12, bw, 10);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(bx + 2, T + 14, bw - 4, 6);
    ctx.fillStyle = heat > 70 ? '#e53935' : heat > 35 ? '#ff9800' : '#ffc107';
    ctx.fillRect(bx + 2, T + 14, ((bw - 4) * heat) / 100, 6);

    for (const p of popups) {
      const s = toScreen(p.x, p.y), k = 1 - p.t / p.life;
      ctx.globalAlpha = Math.min(1, p.t * 2.5);
      text(p.text, s.x, s.y - k * 24, p.kind === 'say' ? 8 : 9, POP_COLORS[p.kind], 'center');
    }
    ctx.globalAlpha = 1;

    if (caption) {
      ctx.globalAlpha = Math.min(1, caption.t * 2);
      text(caption.text, offX + gw / 2, offY + H * scale * 0.42, caption.text.length > 18 ? 11 : 14, '#0f1a2e', 'center');
      ctx.globalAlpha = 1;
    }

    if (zoneToast) {
      ctx.globalAlpha = Math.min(1, zoneToast.t * 2);
      text(zoneToast.text, offX + gw / 2, T + 64, 12, '#ff3d7f', 'center');
      ctx.globalAlpha = 1;
    }

    if (hintT > 0) {
      ctx.globalAlpha = Math.min(1, hintT);
      const lines = isTouch ? ['DRAG TO STEER · TAP TO OLLIE', 'FLICK UP TO STOP + SPRAY'] : ['ARROWS STEER · SPACE OLLIE', 'UP = HARD STOP + SPRAY'];
      const yb = offY + H * scale - 46;
      text(lines[0], offX + gw / 2, yb, 8, '#41557a', 'center');
      text(lines[1], offX + gw / 2, yb + 16, 8, '#41557a', 'center');
      ctx.globalAlpha = 1;
    }

    if (DEBUG) text(`${fps} fps · ${Math.round(rider.speed)} px/s · h${rider.h} · seed ${seed}`, L, offY + H * scale - 20, 7, '#c62828');
  }

  // ---------- Screens ----------
  const titleEl = document.getElementById('title');
  const pauseEl = document.getElementById('pause');
  const pauseBtn = document.getElementById('pauseBtn');
  const bestEl = document.getElementById('best');
  const stanceBtns = document.querySelectorAll('[data-stance]');

  function showStance() { stanceBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.stance === stance))); }
  function showBest() { bestEl.textContent = best > 0 ? `Your best: ${Math.floor(best).toLocaleString()} m` : ''; }
  function saveBest() { store.set('best', Math.floor(best)); }

  function start() {
    if (state === 'play') return;
    newRun(); resetInput();
    state = 'play'; hintT = 7;
    titleEl.hidden = true; pauseEl.hidden = true; pauseBtn.hidden = false;
  }
  function pause() {
    if (state !== 'play') return;
    state = 'paused'; saveBest(); resetInput();
    pauseEl.hidden = false;
  }
  function resume() {
    if (state !== 'paused') return;
    state = 'play'; resetInput(); last = performance.now(); acc = 0;
    pauseEl.hidden = true;
  }
  function restart() { saveBest(); state = 'title'; start(); }
  function toTitle() {
    saveBest(); newRun(); state = 'title';
    pauseEl.hidden = true; pauseBtn.hidden = true; titleEl.hidden = false;
    showBest();
  }

  stanceBtns.forEach((b) => b.addEventListener('click', () => { stance = b.dataset.stance; store.set('stance', stance); showStance(); }));
  document.getElementById('startBtn').addEventListener('click', start);
  document.getElementById('resumeBtn').addEventListener('click', resume);
  document.getElementById('restartBtn').addEventListener('click', restart);
  document.getElementById('menuBtn').addEventListener('click', toTitle);
  pauseBtn.addEventListener('click', pause);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  addEventListener('resize', resize);

  // ---------- Main loop: fixed 60 steps a second, draw every frame ----------
  let last = performance.now(), acc = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    fpsN++; fpsT += dt; if (fpsT >= 0.5) { fps = Math.round(fpsN / fpsT); fpsN = 0; fpsT = 0; }
    if (state === 'play') {
      acc += dt;
      let n = 0;
      while (acc >= STEP && n < 6) { update(STEP); acc -= STEP; n++; }
      if (n === 6) acc = 0;
    }
    render();
  }

  resize();
  newRun();
  showStance();
  showBest();
  requestAnimationFrame(frame);

  // Handy for tuning from the browser console: FullSend.C.G = 300
  // step(n) advances the game n fixed steps by hand (for testing in a background tab).
  window.FullSend = {
    C, start,
    get rider() { return rider; }, get npcs() { return npcs; }, get clout() { return clout; }, get heat() { return heat; }, get state() { return state; }, get zone() { return lastZone; },
    step(n = 1) { for (let i = 0; i < n; i++) update(STEP); render(); },
  };
})();
