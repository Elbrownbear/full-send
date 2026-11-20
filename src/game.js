// Full Send: the game itself. State, input, rider physics, heat and Ski Patrol, drawing, screens and the loop.
(function () {
  'use strict';
  const FS = window.FS, C = FS.C, S = FS.S;
  const { HEADINGS, MID, STEP, DEG, clamp, pick } = FS;
  const WORLD = FS.world, DRAW = FS.draw, RULES = FS.rules;

  const params = new URLSearchParams(location.search);
  const DEBUG = params.has('debug');
  const URL_SEED = params.has('seed') ? (parseInt(params.get('seed'), 10) || 1) : null;

  // ---------- Canvas: draw the world small, scale it up crisp ----------
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const low = document.createElement('canvas');
  const g = low.getContext('2d');
  FS.gfx.g = g;
  const px = DRAW.px;
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
  let state = 'title'; // title | play | paused | caught | over
  let stance = FS.store.get('stance', 'regular');
  let best = FS.store.get('best', 0);
  let bestClout = FS.store.get('bestClout', 0);

  function newRun() {
    Object.assign(S, {
      seed: URL_SEED ?? ((Math.random() * 2 ** 31) | 0),
      chunks: new Map(), spawned: new Set(), ropes: new Map(), catwalks: new Map(), lifts: new Map(),
      buffs: { wax: 0, can: 0, burrito: false }, cloutBank: 0, heckleT: 0, whiteT: 0, cordWarned: false, palmSeen: false,
      npcs: [], particles: [], popups: [], trail: [], bullets: [],
      rider: {
        x: 0, y: 0, z: 0, vz: 0, h: MID, speed: 0, mode: 'ride',
        stopping: false, stopDir: 0, stopSide: 1, stopSpeed: 0, sprayT: 0,
        airVX: 0, airVY: 0, spin: 0, grabT: 0, grabName: '', airT: 0, wasSwitch: false,
        sw: false, invuln: 0, crashT: 0, crashObj: null, turnT: 0,
        rail: null, grindT: 0, grindStyle: '', butterT: 0, butterSpin: 0, stuckT: 0, skateAnim: 0, pushT: 0,
      },
      onIce: false, iceWarned: false, flatIn: false, powIn: false, powTipped: false,
      patrol: null, patrolLevel: 0, warned: false,
      clout: 0, heat: 0, dist: 0, caption: null, zoneToast: null, lastZone: null,
      hintT: 0, simT: 0, camX: 0, camY: 0, pruneT: 0, caughtT: 0,
      stash: { in: false, lastY: 0, bank: 0, earned: 0 },
      stats: { sprayed: 0, homies: 0, plowed: 0, crashes: 0, speedTraps: 0, worstMph: 0, stashM: 0, bestTrick: null, topMph: 0, shaken: 0, shot: false, wells: 0, skated: 0, grinds: 0, found: [], tycoon: false, pickups: 0, liftTricks: 0 },
    });
  }

  const addHeat = (n) => { S.heat = clamp(S.heat + n, 0, 100); };
  // frac = a trickle (like the drone filming you): bank fractions and pay out in fives.
  function addClout(n, frac) {
    if (!frac) { S.clout += n; return; }
    S.cloutBank += n;
    if (S.cloutBank >= 5) { const k = Math.floor(S.cloutBank / 5) * 5; S.cloutBank -= k; S.clout += k; }
  }
  function popup(x, y, text, kind) { S.popups.push({ x, y, text, kind, t: 1.3, life: 1.3 }); }
  function say(text, t = 1.6) { S.caption = { text, t, life: t }; }
  FS.popup = popup;
  FS.addHeat = addHeat;
  FS.addClout = addClout;

  // ---------- Input ----------
  const input = { left: false, right: false, stopHeld: false, jumpHeld: false, jumpQueued: false, turnPulse: 0, downPulse: false, spinDir: 0, leanKey: false, mouseLean: false, butterFlick: 0 };
  const pointer = { mode: 'keys', mouse: null, touch: null };
  const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  function resetInput() {
    Object.assign(input, { left: false, right: false, stopHeld: false, jumpHeld: false, jumpQueued: false, turnPulse: 0, downPulse: false, spinDir: 0, leanKey: false, mouseLean: false, butterFlick: 0 });
    pointer.touch = null;
  }
  const grabHeld = () => input.jumpHeld || (pointer.mode === 'touch' && pointer.touch !== null && !pointer.touch.lean);
  // Lean back: Shift, right mouse button, or pull your thumb down.
  const leanHeld = () => input.leanKey || input.mouseLean || !!(pointer.touch && pointer.touch.lean);
  // After a landing, stop or crash, steering by drag starts fresh from where the thumb is now.
  function rebaseTouch() {
    const tp = pointer.touch;
    if (tp) { tp.baseH = S.rider.h; tp.sx = tp.lx; tp.flicked = false; }
  }

  function handleInput(dt) {
    const r = S.rider;
    input.spinDir = 0;
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    // Skating a catwalk or digging out of a tree well: every press is a push or a dig.
    if (r.mode === 'skate' || r.mode === 'stuck') {
      if (input.jumpQueued || input.downPulse || input.turnPulse) mash();
      input.jumpQueued = false; input.downPulse = false; input.turnPulse = 0; input.butterFlick = 0;
      return;
    }
    if (input.jumpQueued) {
      input.jumpQueued = false;
      if (r.mode === 'ride' && !r.stopping) takeoff(C.OLLIE_V);
      else if (r.mode === 'grind') leaveRail(0, C.OLLIE_V);
    }
    if (r.mode === 'crash') { input.turnPulse = 0; input.downPulse = false; return; }
    if (r.mode === 'grind') { if (input.turnPulse) leaveRail(input.turnPulse, 50); input.turnPulse = 0; return; }
    if (r.mode === 'air') { input.spinDir = dir; input.turnPulse = 0; return; }
    if (input.stopHeld) requestStop();
    if (input.downPulse) { input.downPulse = false; if (!r.stopping) r.h = MID; }
    // Leaning back + a tap left or right = butter 180 on the snow.
    const flick = input.turnPulse || input.butterFlick;
    input.butterFlick = 0;
    if (flick && leanHeld() && canButter()) { butter180(); input.turnPulse = 0; return; }
    if (dir !== 0 && !r.stopping && !input.turnPulse) {
      r.turnT -= dt;
      if (r.turnT <= 0) { steer(dir); r.turnT = C.TURN_REPEAT * (1 + r.speed / 250); }
    }
    // A key tap counts even if it was released before this step ran.
    if (input.turnPulse && !r.stopping) { steer(input.turnPulse); r.turnT = C.TURN_DELAY; }
    input.turnPulse = 0;
    if (pointer.mode === 'mouse' && pointer.mouse) mouseSteer();
  }

  function steer(dir) {
    const r = S.rider;
    if (S.onIce) return; // no edge on ice
    // Stopped and already pointing sideways: take a little skating step instead.
    if (r.speed < 15 && ((dir < 0 && r.h === 0) || (dir > 0 && r.h === 6))) { r.x += dir * 6; return; }
    r.h = limitHeading(r.h + dir);
  }
  // Fast riders carve; only slower riders can swing fully sideways.
  function limitHeading(h) {
    const m = S.rider.speed > C.CARVE_LOCK ? 2 : 3;
    return clamp(h, MID - m, MID + m);
  }

  function mouseSteer() {
    const r = S.rider;
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
    if (state === 'over') { if (!e.repeat && (e.code === 'Space' || e.code === 'Enter') && S.caughtT <= 0) start(); return; }
    if (state === 'caught') return;
    if (e.code === 'Escape' || e.code === 'KeyP') { if (state === 'play') pause(); else if (state === 'paused') resume(); return; }
    if (e.code === 'KeyR') { start(); return; }
    if (state !== 'play' || !k) return;
    pointer.mode = 'keys';
    if (e.repeat) return;
    if (k === 'left') { input.left = true; input.turnPulse = -1; }
    else if (k === 'right') { input.right = true; input.turnPulse = 1; }
    else if (k === 'up') input.stopHeld = true;
    else if (k === 'down') input.downPulse = true;
    else if (k === 'jump') { input.jumpHeld = true; input.jumpQueued = true; }
  });
  addEventListener('keydown', (e) => { if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') input.leanKey = true; });
  addEventListener('keyup', (e) => {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') input.leanKey = false;
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
    if (S.rider.mode === 'air') S.rider.spin += e.movementX * 1.5;
  });
  canvas.addEventListener('mousedown', (e) => {
    if (state !== 'play') return;
    pointer.mode = 'mouse';
    if (e.button === 2) { input.mouseLean = true; return; }
    if (e.button !== 0) return;
    input.jumpHeld = true; input.jumpQueued = true;
  });
  addEventListener('mouseup', (e) => {
    if (e.button === 2) input.mouseLean = false;
    else if (pointer.mode === 'mouse') input.jumpHeld = false;
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (state !== 'play') return;
    pointer.mode = 'touch';
    for (const t of e.changedTouches) {
      if (!pointer.touch) {
        const now = performance.now();
        pointer.touch = { id: t.identifier, sx: t.clientX, sy: t.clientY, lx: t.clientX, t0: now, baseH: S.rider.h, moved: false, flicked: false, lean: false, buttered: false, hist: [{ x: t.clientX, y: t.clientY, t: now }] };
        if (S.rider.mode === 'skate' || S.rider.mode === 'stuck') input.jumpQueued = true; // every tap is a push or a dig
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
      tp.hist.push({ x: t.clientX, y: t.clientY, t: now });
      while (tp.hist.length > 1 && now - tp.hist[0].t > 150) tp.hist.shift();
      const flickDy = t.clientY - tp.hist[0].y, flickDx = t.clientX - tp.hist[0].x;
      const r = S.rider;
      // Thumb pulled down past LEAN_PX = leaning back. A quick sideways flick while leaning = butter 180.
      tp.lean = !tp.flicked && dy > C.LEAN_PX;
      if (!tp.lean) tp.buttered = false;
      else if (!tp.buttered && Math.abs(flickDx) > 40) { tp.buttered = true; input.butterFlick = Math.sign(flickDx); }
      if (r.mode === 'air') r.spin += (t.clientX - tp.lx) * C.TOUCH_SPIN;
      else if (!tp.flicked && flickDy < -C.FLICK_PX && dy < 0 && Math.abs(t.clientX - tp.lx) < 20) { tp.flicked = true; requestStop(); }
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
      const r = S.rider;
      if (!tp.moved && performance.now() - tp.t0 < 250 && state === 'play' && r.mode !== 'skate' && r.mode !== 'stuck') input.jumpQueued = true; // tap = ollie
      pointer.touch = null;
    }
  };
  canvas.addEventListener('touchend', endTouch, { passive: false });
  canvas.addEventListener('touchcancel', endTouch, { passive: false });

  // ---------- Update ----------
  function update(dt) {
    S.simT += dt;
    const r = S.rider;
    if (state === 'caught') {
      updateParticles(dt); updatePopups(dt);
      if ((S.caughtT -= dt) <= 0) showOver();
      return;
    }
    handleInput(dt);
    if (r.invuln > 0) r.invuln -= dt;
    if (r.mode === 'crash') { r.crashT -= dt; if (r.crashT <= 0) getUp(); }
    else if (r.mode === 'stuck') { r.stuckT -= dt; if (r.stuckT <= 0) { popup(r.x, r.y - 26, 'DUG OUT', 'good'); getUp(); } }
    else if (r.mode === 'air') updateAir(dt);
    else if (r.mode === 'grind') updateGrind(dt);
    else if (r.mode === 'skate') updateSkate(dt);
    else updateGround(dt);
    if (r.mode !== 'crash' && r.mode !== 'stuck') collide();
    if (r.butterSpin > 0) r.butterSpin = Math.max(0, r.butterSpin - C.BUTTER_SPIN * dt);
    terrainToasts();
    if (r.mode !== 'crash' && r.mode !== 'stuck') { checkPickups(); setPieces(dt); }
    if (S.buffs.wax > 0) S.buffs.wax -= dt;
    if (S.buffs.can > 0) S.buffs.can -= dt;
    if (S.whiteT > 0) S.whiteT -= dt;
    if (S.heckleT > 0) S.heckleT -= dt;
    updateStash(dt);
    WORLD.updatePeople(dt);
    updateBullets(dt);
    updateParticles(dt);
    updatePopups(dt);
    S.heat = Math.max(0, S.heat - C.HEAT_DECAY * dt);
    S.dist = Math.max(S.dist, r.y / C.PX_PER_M);
    S.stats.topMph = Math.max(S.stats.topMph, Math.round(r.speed * C.MPH));
    if (S.dist > best) best = S.dist;
    updatePatrol(dt);
    if (S.caption && (S.caption.t -= dt) <= 0) S.caption = null;
    const zk = WORLD.zoneAt(Math.floor(r.y / C.CHUNK));
    if (zk !== S.lastZone) { if (S.lastZone) S.zoneToast = { text: FS.ZONES[zk].name, t: 2.2 }; S.lastZone = zk; }
    if (S.zoneToast && (S.zoneToast.t -= dt) <= 0) S.zoneToast = null;
    if (S.hintT > 0) S.hintT -= dt;
    if ((S.pruneT -= dt) <= 0) { WORLD.prune(); S.pruneT = 1; }
  }

  function updateGround(dt) {
    const r = S.rider;
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
      const flat = WORLD.inFlat(r.y), pow = WORLD.inPow(r.x, r.y);
      let acc;
      if (flat) acc = -C.DRAG * r.speed - C.FLAT_FRICTION; // catwalk: no pull at all
      else {
        acc = C.G * pull - C.DRAG * r.speed;
        if (r.speed < C.START_SPEED && pull > 0.3) acc += C.START_BOOST * pull;
      }
      if (Math.abs(deg) === 90) acc -= C.SIDE_BRAKE;
      if (pow) acc -= (leanHeld() ? C.POW_DRAG_LEAN : C.POW_DRAG) * r.speed; // sink unless you lean back
      if (S.onIce) acc += C.ICE_GRIP * C.DRAG * r.speed; // ice is fast
      if (S.onCord) acc += 0.4 * C.DRAG * r.speed;       // so is fresh corduroy
      if (S.buffs.wax > 0) acc += 0.25 * C.DRAG * r.speed; // hot wax
      r.speed = clamp(r.speed + acc * dt, 0, C.MAX + (S.buffs.wax > 0 ? 30 : 0));
      // Out of speed on a catwalk: unstrap and skate.
      if (flat && r.speed < C.SKATE_AT) { startSkate(); return; }
      updateButter(dt, flat || pow);
    }
    const a = deg * DEG, prevY = r.y;
    r.x += Math.sin(a) * r.speed * dt;
    r.y += Math.cos(a) * r.speed * dt;
    S.onIce = onIce();
    addTrail(r.stopping ? 4 : WORLD.inPow(r.x, r.y) && !leanHeld() ? 4 : S.stash.in ? 3 : 2);
    let launched = false, roof = null;
    WORLD.forNearbyStatics(r.x, r.y, (o) => {
      if (o.type === 'kicker' && !r.stopping && !launched && r.speed > 40 && Math.abs(r.x - o.x) < 11 && prevY < o.y - 1 && r.y >= o.y - 1) {
        launched = true;
      }
      // The RV has a snow ramp up its back: ride up it and launch off the roof.
      if (o.type === 'rv' && !r.stopping && !roof && r.speed > 60 && Math.abs(r.x - o.x) < 14 && prevY < o.y - 16 && r.y >= o.y - 16) roof = o;
      if (o.type === 'slowzone') checkRadar(o, prevY);
    });
    if (roof) {
      takeoff((C.KICK_V + r.speed * C.KICK_GAIN) * 1.35);
      r.z = roof.ht + 1; // you're on the roof
      popup(r.x, r.y - 40, 'ROOF GAP!', 'trick');
    } else if (launched) takeoff(C.KICK_V + r.speed * C.KICK_GAIN);
  }

  // What's under the board: ice (returned) and fresh corduroy (S.onCord).
  function onIce() {
    const r = S.rider;
    let hit = false, cord = false;
    WORLD.forNearbyStatics(r.x, r.y, (o) => {
      if (o.type === 'ice' && Math.abs(r.x - o.x) < 14 && Math.abs(r.y - (o.y - 7)) < 7) hit = true;
      if (o.type === 'cord' && Math.abs(r.x - o.x) < 15 && Math.abs(r.y - (o.y - 5)) < 6) cord = true;
    });
    if (hit && !S.iceWarned) { S.iceWarned = true; popup(r.x, r.y - 26, 'EAST COAST POWDER', 'say'); }
    if (cord && !S.cordWarned) { S.cordWarned = true; popup(r.x, r.y - 26, 'FRESH CORDUROY', 'good'); }
    S.onCord = cord;
    return hit;
  }

  // ---------- Pickups ----------
  function checkPickups() {
    const r = S.rider;
    if (r.z > 20) return;
    WORLD.forNearbyStatics(r.x, r.y, (o) => {
      if (o.type !== 'pickup' || o.taken || Math.abs(r.x - o.x) > 9 || Math.abs(r.y - (o.y - 4)) > 8) return;
      o.taken = true;
      pickUp(o.kind);
    });
  }
  function pickUp(kind) {
    const r = S.rider, p = FS.PICKUPS[kind], b = S.buffs;
    S.stats.pickups++;
    let name = p.name;
    if (kind === 'wax') b.wax = 8;
    else if (kind === 'burrito') b.burrito = true;
    else if (kind === 'can') b.can = 10;
    else if (kind === 'waffle') { addClout(50); r.speed = Math.min(C.MAX, r.speed + 40); for (let i = 0; i < 6; i++) S.particles.push({ x: r.x, y: r.y, z: 10, vx: (Math.random() - 0.5) * 60, vy: -30, vz: 60, life: 0.7, c: '#ff3d7f' }); }
    else if (kind === 'pass') {
      if (Math.random() < 0.5) name = p.alt;
      addHeat(-40);
      if (S.patrol && S.patrol.mode === 'heat') { S.patrol = null; S.warned = false; say('PASS CHECKS OUT', 1.6); } // waves you through
    } else if (p.collect) { addClout(p.collect); S.stats.found.push(p.name); }
    popup(r.x, r.y - 34, name, 'trick');
    popup(r.x, r.y - 22, p.say, 'good');
  }

  // ---------- Set pieces ----------
  function setPieces(dt) {
    const r = S.rider;
    WORLD.forNearbyStatics(r.x, r.y, (o) => {
      // Snowmaking gun: blasts you sideways and whites out the screen.
      if (o.type === 'snowgun') {
        const along = (r.x - o.x) * o.dir;
        if (along > 4 && along < 80 && Math.abs(r.y - (o.y - 6)) < 10 + along * 0.3 && r.z < 20) {
          r.x += o.dir * 70 * dt; S.whiteT = Math.max(S.whiteT, 0.35);
          if (!o.hit) { o.hit = true; popup(r.x, r.y - 26, "CAN'T SEE!", 'say'); }
        }
      }
      if (o.type === 'snowgun' && Math.random() < 0.7) {
        const ang = (o.dir > 0 ? 90 : -90) + (Math.random() - 0.5) * 50;
        S.particles.push({ x: o.x + o.dir * 6, y: o.y - 2, z: 10, vx: Math.sin(ang * DEG) * 120, vy: Math.cos(ang * DEG) * 40, vz: 10, life: 0.6, c: '#ffffff' });
      }
      // The palm tree in the glades: once per run.
      if (o.type === 'palm' && !S.palmSeen && Math.hypot(r.x - o.x, r.y - o.y) < 40) { S.palmSeen = true; addClout(100); popup(o.x, o.y - 40, 'BAHAMAS?! +100', 'good'); }
    });
    // Riding under the chairlift: the chairs heckle you when you're in the air.
    if (r.mode === 'air' && S.heckleT <= 0 && WORLD.underLift(r.x, r.y)) { S.heckleT = 1.4; popup(r.x + 10, r.y - 46, pick(FS.HECKLES), 'say'); }
  }

  // ---------- Butters: lean back on the snow ----------
  function canButter() {
    const r = S.rider;
    return r.mode === 'ride' && !r.stopping && r.speed >= 30 && r.speed <= 240 && !WORLD.inFlat(r.y) && !WORLD.inPow(r.x, r.y);
  }
  function updateButter(dt, noButter) {
    const r = S.rider;
    if (!noButter && leanHeld() && canButter()) { r.butterT += dt; return; }
    if (r.butterT > 0) {
      const res = RULES.butter(r.butterT);
      if (res.pts > 0) { addClout(res.pts); popup(r.x, r.y - 26, `${res.name} +${res.pts}`, 'trick'); }
      r.butterT = 0;
    }
  }
  function butter180() {
    const r = S.rider;
    r.sw = !r.sw;
    r.butterSpin = 180;
    addClout(RULES.BUTTER_180);
    popup(r.x, r.y - 26, `${r.sw ? 'Butter 180 to switch' : 'Butter 180'} +${RULES.BUTTER_180}`, 'trick');
  }

  // ---------- Catwalks: unstrap and skate ----------
  function startSkate() {
    const r = S.rider;
    r.mode = 'skate'; r.speed = Math.max(r.speed, 8); r.h = MID; r.butterT = 0;
    S.stats.skated++;
    say('UNSTRAP AND SKATE', 1.4);
    // A couple of skiers pole past, laughing.
    for (let k = 0; k < 2; k++) {
      const n = WORLD.makePerson('skier', r.x + (k ? 26 : -24), r.y - 50 - k * 30, Math.random, { beh: 'cruise', vy: 95 + k * 15, wob: 4 });
      S.npcs.push(n);
    }
    popup(r.x, r.y - 40, pick(FS.LAUGHS), 'say');
  }
  function updateSkate(dt) {
    const r = S.rider;
    r.speed = Math.max(0, r.speed - (C.DRAG * r.speed + C.FLAT_FRICTION * 0.5) * dt);
    r.y += r.speed * dt;
    r.skateAnim += dt;
    if (r.pushT > 0) r.pushT -= dt;
    if (!WORLD.inFlat(r.y)) { r.mode = 'ride'; popup(r.x, r.y - 26, 'STRAPPED BACK IN', 'good'); rebaseTouch(); }
  }
  function mash() {
    const r = S.rider;
    if (r.mode === 'skate') { r.speed = Math.min(C.SKATE_MAX, r.speed + C.SKATE_PUSH); r.pushT = 0.2; }
    else if (r.mode === 'stuck') { r.stuckT -= C.WELL_DIG; burst(r.x, r.y - 4, 4); }
  }

  // Zone-style banners for catwalks and the first powder.
  function terrainToasts() {
    const r = S.rider;
    const flat = WORLD.inFlat(r.y);
    if (flat && !S.flatIn) S.zoneToast = { text: 'CATWALK · KEEP YOUR SPEED', t: 2 };
    S.flatIn = flat;
    const pow = WORLD.inPow(r.x, r.y);
    if (pow && !S.powIn && !S.powTipped) {
      S.powTipped = true;
      S.zoneToast = { text: isTouch ? 'POW · PULL THUMB DOWN TO LEAN BACK' : 'POW · HOLD SHIFT TO LEAN BACK', t: 2.6 };
    }
    S.powIn = pow;
  }

  // ---------- Rails and boxes ----------
  function railUnder() {
    const r = S.rider;
    let found = null;
    WORLD.forNearbyStatics(r.x, r.y, (o) => {
      if (FS.GRINDABLE[o.type] && Math.abs(r.x - o.x) <= o.w / 2 + 5 && r.y >= o.y - o.h && r.y <= o.y - 6 && r.z <= o.ht + 2) { found = o; return false; }
    });
    return found;
  }
  function startGrind(o) {
    const r = S.rider;
    const res = RULES.trick(r, S.buffs.can > 0 ? 35 : 55);
    if (!res.ok) { r.spin = 0; crash(pick(FS.CRASH_LINES.spin), o); return; }
    if (res.half % 2 === 1) r.sw = !r.sw;
    if (res.pts > 0) { addClout(res.pts); popup(r.x, r.y - 30, `${res.name} +${res.pts}`, 'trick'); }
    r.speed = Math.max(90, Math.hypot(r.airVX, r.airVY));
    r.mode = 'grind'; r.rail = o; r.z = o.ht; r.vz = 0; r.x = o.x; r.grindT = 0; r.spin = 0;
    const straight = r.h === MID;
    r.grindStyle = o.type === 'box' ? (straight ? 'Box 50-50' : 'Box slide') : (straight ? '50-50' : 'Boardslide');
    r.wasSwitch = r.sw;
  }
  function updateGrind(dt) {
    const r = S.rider;
    r.grindT += dt;
    r.speed = Math.max(80, r.speed - 20 * dt);
    r.y += r.speed * dt;
    if (Math.random() < 0.5) S.particles.push({ x: r.x, y: r.y, z: r.z, vx: (Math.random() - 0.5) * 40, vy: -10, vz: 30, life: 0.25, c: '#ffe082' });
    if (r.y >= r.rail.y) leaveRail(0, 50);
  }
  // Off the end, off the side (dir ±1) or ollie off (vz).
  function leaveRail(dir, vz) {
    const r = S.rider;
    const res = RULES.grind(r.grindT, r.grindStyle, r.wasSwitch);
    addClout(res.pts);
    S.stats.grinds++;
    popup(r.x, r.y - 30, `${res.name} +${res.pts}`, 'trick');
    if (!S.stats.bestTrick || res.pts > S.stats.bestTrick.pts) S.stats.bestTrick = { name: res.name, pts: res.pts };
    r.mode = 'air'; r.vz = vz; r.z = r.rail.ht + 0.5; r.h = MID;
    r.airVX = dir * 70; r.airVY = r.speed;
    r.spin = 0; r.grabT = 0; r.airT = 0; r.wasSwitch = r.sw;
    r.invuln = Math.max(r.invuln, 0.15); // don't instantly re-hit the rail you just left
    r.rail = null;
  }

  function takeoff(vz) {
    const r = S.rider, a = HEADINGS[r.h] * DEG;
    if (S.buffs.can > 0) vz *= 1.3; // liquid courage: bigger airs
    r.liftAir = WORLD.underLift(r.x, r.y);
    r.mode = 'air'; r.vz = vz; r.z = 0.01;
    r.airVX = Math.sin(a) * r.speed; r.airVY = Math.cos(a) * r.speed;
    r.spin = 0; r.grabT = 0; r.airT = 0; r.wasSwitch = r.sw; r.grabName = pick(FS.GRABS);
    S.trail.push(null);
  }

  function updateAir(dt) {
    const r = S.rider, prevY = r.y;
    r.airT += dt;
    r.x += r.airVX * dt; r.y += r.airVY * dt;
    r.vz -= C.GZ * dt; r.z += r.vz * dt;
    if (input.spinDir) r.spin += input.spinDir * C.SPIN_RATE * dt;
    if (grabHeld()) r.grabT += dt;
    WORLD.forNearbyStatics(r.x, r.y, (o) => {
      if (o.type === 'slowzone') checkRadar(o, prevY); // radar still clocks you in the air
      // Out Cold nod: clear the hot tub.
      if (o.type === 'hottub' && !o.cleared && r.z > o.ht && Math.abs(r.x - o.x) < 14 && prevY < o.y - 6 && r.y >= o.y - 6) {
        o.cleared = true; addClout(150); popup(o.x, o.y - 30, 'HOT TUB HOP +150', 'trick');
      }
    });
    // Ollie the whole shotski line.
    for (const n of S.npcs) {
      if (n.kind === 'shotski' && !n.done && n.fallenT <= 0 && r.z > 8 && Math.abs(r.x - n.x) < 36 && prevY < n.y && r.y >= n.y) {
        n.done = true; addClout(300); popup(n.x, n.y - 32, 'SHOTSKI CLEARED +300', 'trick'); popup(n.x, n.y - 20, 'CHEERS!', 'say');
      }
    }
    if (r.vz < 0) { const o = railUnder(); if (o) { startGrind(o); return; } } // coming down onto a rail or box
    if (r.z <= 0) land();
  }

  function land() {
    const r = S.rider;
    r.z = 0; r.vz = 0;
    const res = RULES.trick(r, S.buffs.can > 0 ? 35 : 55); // liquid courage: wobblier landings
    if (!res.ok) { r.spin = 0; crash(pick(FS.CRASH_LINES.spin), null); return; }
    r.mode = 'ride';
    if (res.half % 2 === 1) r.sw = !r.sw;
    if (res.pts > 0 && (r.liftAir || WORLD.underLift(r.x, r.y))) { // the chairlift saw it: double points
      res.pts *= 2; res.name = 'UNDER THE LIFT: ' + res.name; S.stats.liftTricks++;
    }
    if (res.pts > 0) {
      addClout(res.pts);
      popup(r.x, r.y - 26, `${res.name} +${res.pts}`, 'trick');
      if (!S.stats.bestTrick || res.pts > S.stats.bestTrick.pts) S.stats.bestTrick = { name: res.name, pts: res.pts };
    }
    r.spin = 0;
    S.trail.push(null);
    rebaseTouch();
  }

  function requestStop() {
    const r = S.rider;
    if (r.mode !== 'ride' || r.stopping || r.speed < C.STOP_MIN) return;
    if (S.onIce) { // no edge to dig in
      if (S.simT - (S.noEdgeAt || -9) > 1) { S.noEdgeAt = S.simT; popup(r.x, r.y - 26, 'NO EDGE!', 'bad'); }
      return;
    }
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
    const r = S.rider;
    if (r.mode === 'crash') return;
    // A breakfast burrito in your pocket absorbs one crash.
    if (S.buffs.burrito && state === 'play') {
      S.buffs.burrito = false;
      r.invuln = 1; r.spin = 0; r.z = 0; r.vz = 0; r.rail = null;
      if (r.mode === 'air' || r.mode === 'grind') r.mode = 'ride';
      if (obj && obj.ht !== undefined) r.y = Math.max(r.y, obj.y + 6);
      r.speed *= 0.5;
      popup(r.x, r.y - 30, 'BURRITO SAVED YOU', 'good');
      return;
    }
    if (obj && obj.type === 'burger') { addClout(-28); popup(obj.x, obj.y - 30, '-28', 'bad'); }
    if (obj && obj.type === 'hottub') { addHeat(10); popup(obj.x, obj.y - 30, 'SPLASH', 'say'); }
    r.mode = 'crash'; r.crashT = C.CRASH_T; r.speed = 0; r.z = 0; r.vz = 0;
    r.stopping = false; r.spin = 0; r.crashObj = obj; r.rail = null; r.butterT = 0;
    S.stats.crashes++;
    say(text);
    burst(r.x, r.y, 18);
    S.trail.push(null);
  }

  // Deep snow at the base of a tree: stuck until you dig out (or patrol finds you).
  function treeWell(o) {
    const r = S.rider;
    r.mode = 'stuck'; r.stuckT = C.WELL_T; r.speed = 0; r.z = 0; r.vz = 0; r.stopping = false; r.spin = 0; r.crashObj = o;
    S.stats.wells++;
    say('TREE WELL!', 1.6);
    popup(r.x, r.y - 30, isTouch ? 'TAP TO DIG OUT' : 'MASH TO DIG OUT', 'bad');
    burst(r.x, r.y, 12);
    S.trail.push(null);
  }

  function getUp() {
    const r = S.rider;
    r.mode = 'ride'; r.invuln = C.INVULN_T;
    const o = r.crashObj;
    if (o && o.ht !== undefined) r.y = Math.max(r.y, o.y + 6); // pop out below the tree or rock
    r.crashObj = null;
    rebaseTouch();
  }

  const overlap = (a, b) => Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs((a.y - a.h / 2) - (b.y - b.h / 2)) < (a.h + b.h) / 2;

  function collide() {
    const r = S.rider;
    if (r.invuln > 0) return;
    const rb = { x: r.x, y: r.y, w: 6, h: 4 };
    let hit = null;
    WORLD.forNearbyStatics(r.x, r.y, (o) => {
      if (o.ht === 0 || r.z >= o.ht || o === r.rail) return; // kickers, ice and Slow Zones aren't obstacles
      if (overlap(rb, o)) { hit = o; return false; }
    });
    if (hit && hit.type === 'tree' && WORLD.inPow(hit.x, hit.y)) { treeWell(hit); return; }
    if (hit) { crash(pick(FS.CRASH_LINES[hit.type]), hit); return; }
    if (r.z >= 16 || r.stopping) return; // sliding to a stop sprays people instead of hitting them
    for (const n of S.npcs) {
      if (n.fallenT > 0 || !overlap(rb, n)) continue;
      const def = FS.PEOPLE[n.kind];
      if (def.flying) continue; // the drone is up in the air
      if (def.solid) { crash(pick(FS.CRASH_LINES[n.kind] || FS.CRASH_LINES.person), n); return; } // you can't plow a snowcat
      if (r.speed >= C.PLOW_SPEED) { plow(n); continue; }
      n.fallenT = 2.5;
      addHeat(def.patrol ? 100 : 20 * (def.heatMult || 1));
      popup(n.x, n.y - 22, FS.SAYS.hit[n.rides], 'say');
      crash(pick(FS.CRASH_LINES.person), n);
      return;
    }
  }

  // ---------- Heat sources ----------
  function scorePerson(n, res) {
    addClout(res.clout);
    addHeat(res.heat);
    if (res.homie) S.stats.homies++;
    popup(n.x, n.y - 30, res.text, res.clout >= 0 ? 'good' : 'bad');
    popup(n.x, n.y - 18, res.say, 'say');
  }

  function plow(n) {
    const r = S.rider;
    const res = RULES.plow(n, r.speed);
    n.fallenT = 3; n.aggroT = 0;
    r.speed *= 0.8;
    if (n.rides === 'ski') S.stats.plowed++;
    burst(n.x, n.y, 14);
    if (FS.PEOPLE[n.kind].confetti) confetti(n.x, n.y);
    scorePerson(n, res);
  }

  function checkSpray() {
    const r = S.rider;
    if (r.stopSpeed < C.SPRAY_MIN) return;
    const a = r.stopDir * DEG, ux = Math.sin(a), uy = Math.cos(a);
    const reach = 18 + r.stopSpeed * 0.14;
    for (const n of S.npcs) {
      if (n.sprayed || n.fallenT > 0 || FS.PEOPLE[n.kind].flying) continue;
      const dx = n.x - r.x, dy = (n.y - 3) - r.y, d = Math.hypot(dx, dy);
      if (d > reach) continue;
      if (d > 10 && (dx * ux + dy * uy) / d < 0.45) continue; // must be in front of the spray
      n.sprayed = true; n.flashT = 0.6;
      const res = RULES.spray(n, r.stopSpeed, d, reach);
      if (res.aggro) WORLD.aggro(n);
      if (n.tycoon) S.stats.tycoon = true;
      if (FS.PEOPLE[n.kind].confetti) confetti(n.x, n.y);
      if (n.rides === 'ski') S.stats.sprayed++;
      scorePerson(n, res);
    }
  }

  // Radar Slow Zone: crossing its line clocks your speed.
  function checkRadar(o, prevY) {
    const r = S.rider;
    if (o.done || Math.abs(r.x - o.x) > 33 || !(prevY < o.y && r.y >= o.y)) return;
    o.done = true;
    const mph = Math.round(r.speed * C.MPH);
    const res = RULES.radar(mph);
    addHeat(res.heat);
    addClout(res.clout);
    if (res.over > 0) { S.stats.speedTraps++; S.stats.worstMph = Math.max(S.stats.worstMph, mph); }
    o.shown = mph;
    popup(o.x, o.y - 32, res.text, res.over > 0 ? 'bad' : 'good');
  }

  // Rope duck: the closed stash beyond a rope line.
  function updateStash(dt) {
    const r = S.rider, st = S.stash;
    const inside = WORLD.inStash(r.x, r.y);
    if (inside && !st.in) {
      st.in = true; st.lastY = r.y; st.earned = 0;
      addHeat(C.STASH_ENTRY_HEAT);
      say('DUCKED THE ROPE', 1.4);
      popup(r.x, r.y - 26, `+${C.STASH_ENTRY_HEAT} HEAT`, 'bad');
    } else if (!inside && st.in) {
      st.in = false;
      popup(r.x, r.y - 26, `BACK IN BOUNDS +${st.earned}`, 'good');
    }
    if (!st.in) return;
    addHeat(C.STASH_HEAT_PER_S * dt);
    const m = Math.max(0, r.y - st.lastY) / C.PX_PER_M;
    st.lastY = Math.max(st.lastY, r.y);
    S.stats.stashM += m;
    st.bank += m * C.STASH_CLOUT_PER_M;
    if (st.bank >= 5) { const n = Math.floor(st.bank / 5) * 5; st.bank -= n; st.earned += n; addClout(n); }
  }

  function updateBullets(dt) {
    const r = S.rider;
    for (let i = S.bullets.length - 1; i >= 0; i--) {
      const b = S.bullets[i];
      b.x += b.vx * dt; b.y += b.vy * dt;
      if ((b.life -= dt) <= 0) { S.bullets.splice(i, 1); continue; }
      if (r.mode !== 'crash' && r.invuln <= 0 && r.z < 12 && Math.abs(b.x - r.x) < 5 && Math.abs(b.y - (r.y - 4)) < 7) {
        S.bullets.splice(i, 1);
        S.stats.shot = true;
        crash(pick(FS.CRASH_LINES.bullet), null);
      }
    }
  }

  // ---------- Ski Patrol ----------
  function updatePatrol(dt) {
    const r = S.rider;
    if (!S.patrol) {
      // 99, not 100: heat cools a hair every step, including the one where it maxed out.
      const due = S.heat >= 99 ? 'heat' : S.dist >= C.PATROL_BASE_M ? 'dist' : null;
      if (due) dispatchPatrol(due);
      else if (!S.warned && (S.heat >= 70 || S.dist >= C.PATROL_BASE_M - 150)) {
        S.warned = true;
        say('RADIO: "PINK JACKET, HEADED DOWN"', 2.2);
      }
      return;
    }
    const p = S.patrol;
    if (p.mode === 'heat' && S.dist >= C.PATROL_BASE_M) p.mode = 'dist'; // past the line, no more escapes
    p.speed = Math.min(C.PATROL_MAX, p.speed + C.PATROL_ACCEL * dt);
    const dx = r.x - p.x, dy = (r.y - 2) - p.y, d = Math.hypot(dx, dy);
    if (d > 0.5) { p.x += (dx / d) * p.speed * dt; p.y += (dy / d) * p.speed * dt; p.dirX = dx / d; }
    if (Math.random() < 0.6) S.particles.push({ x: p.x + (Math.random() - 0.5) * 8, y: p.y - 10, z: 1, vx: (Math.random() - 0.5) * 30, vy: -20, vz: 20, life: 0.4, c: '#ffffff' });
    if (d < C.PATROL_CATCH_PX && r.z < 10) caught();
    else if (p.mode === 'heat' && d > C.PATROL_LOSE_PX) {
      S.patrol = null; S.patrolLevel++; S.stats.shaken++;
      S.heat = 50; S.warned = false;
      addClout(250);
      say("LOST 'EM! +250", 1.8);
    }
  }

  function dispatchPatrol(mode) {
    const r = S.rider;
    S.patrol = {
      mode, x: r.x + (Math.random() - 0.5) * 120, y: S.camY - 30, dirX: 0,
      speed: C.PATROL_SPEED + S.patrolLevel * C.PATROL_LEVEL_UP,
    };
    say(mode === 'heat' ? 'SKI PATROL! SHAKE THEM!' : 'SKI PATROL!', 2);
  }

  function caught() {
    const r = S.rider;
    state = 'caught';
    S.caughtT = 1.4;
    r.speed = 0; r.stopping = false; r.z = 0; r.rail = null;
    if (r.mode === 'air' || r.mode === 'grind' || r.mode === 'skate') r.mode = 'ride';
    say('PASS CLIPPED', 2);
    burst(r.x, r.y, 20);
    resetInput();
  }

  // ---------- Particles, popups, trail ----------
  const SNOW = ['#ffffff', '#ffffff', '#ffffff', '#b9cde6', '#9fb8d8'];
  function emitSpray(n) {
    const r = S.rider, a = r.stopDir * DEG;
    for (let i = 0; i < n; i++) {
      const ang = a + (Math.random() - 0.5) * 1.3;
      const v = 50 + Math.random() * 90 + r.speed * 0.45;
      S.particles.push({ x: r.x + (Math.random() - 0.5) * 6, y: r.y, z: 2, vx: Math.sin(ang) * v, vy: Math.cos(ang) * v, vz: 30 + Math.random() * 80, life: 0.45 + Math.random() * 0.4, c: pick(SNOW) });
    }
  }
  function burst(x, y, n) {
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2, v = 30 + Math.random() * 80;
      S.particles.push({ x, y, z: 4, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, vz: 40 + Math.random() * 90, life: 0.5 + Math.random() * 0.5, c: pick(SNOW) });
    }
  }
  // Gaper Day: costumes come with confetti.
  function confetti(x, y) {
    const cs = ['#ff3d7f', '#ffd400', '#00c2a8', '#6c8cff', '#ff7a1a'];
    for (let i = 0; i < 16; i++) {
      const ang = Math.random() * Math.PI * 2, v = 30 + Math.random() * 70;
      S.particles.push({ x, y, z: 12, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, vz: 60 + Math.random() * 60, life: 0.9, c: pick(cs) });
    }
  }
  function updateParticles(dt) {
    for (let i = S.particles.length - 1; i >= 0; i--) {
      const p = S.particles[i];
      if ((p.life -= dt) <= 0) { S.particles.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vz -= C.GZ * dt; p.z = Math.max(0, p.z + p.vz * dt);
      p.vx *= 0.94; p.vy *= 0.94;
    }
  }
  function updatePopups(dt) {
    for (let i = S.popups.length - 1; i >= 0; i--) if ((S.popups[i].t -= dt) <= 0) S.popups.splice(i, 1);
  }
  function addTrail(w) {
    const r = S.rider, last = S.trail[S.trail.length - 1];
    if (!last || Math.hypot(last.x - r.x, last.y - r.y) > 3) S.trail.push({ x: r.x, y: r.y, w });
    if (S.trail.length > 450) S.trail.splice(0, 50);
  }

  // ---------- Drawing ----------
  const toScreen = (wx, wy) => ({ x: offX + (wx - S.camX) * scale, y: offY + (wy - S.camY) * scale });

  function drawStartGate() {
    const sx = -S.camX, sy = -S.camY - 8;
    if (sy < -40 || sy > H + 10) return;
    px(sx - 34, sy - 22, 2, 22, '#41557a'); px(sx + 32, sy - 22, 2, 22, '#41557a');
    px(sx - 34, sy - 24, 68, 7, '#ff3d7f');
    for (let i = 0; i < 8; i++) px(sx - 30 + i * 8, sy - 22, 4, 3, '#ffffff');
  }

  function drawRider() {
    const r = S.rider;
    if (r.invuln > 0 && Math.floor(S.simT * 12) % 2 === 1) return;
    const sx = Math.round(r.x - S.camX), sy = Math.round(r.y - S.camY), by = sy - Math.round(r.z);
    const jacket = '#ff3d7f', helmet = '#1d1d1f';
    if (r.mode === 'crash') {
      DRAW.board(sx, sy, S.simT * 500, '#ffd23f');
      px(sx - 6, sy - 5, 11, 4, jacket); px(sx + 5, sy - 6, 4, 4, helmet);
      return;
    }
    if (r.mode === 'stuck') {
      // Buried to the chest in a tree well, arms flailing.
      const f = Math.floor(S.simT * 8) % 2;
      px(sx - 3, sy - 9, 6, 5, jacket); px(sx - 2, sy - 13, 4, 4, helmet);
      px(sx - 6, sy - (f ? 14 : 10), 2, 4, jacket); px(sx + 4, sy - (f ? 10 : 14), 2, 4, jacket);
      px(sx - 7, sy - 5, 14, 5, '#ffffff'); px(sx - 5, sy - 6, 10, 1, '#ffffff');
      return;
    }
    if (r.mode === 'skate') {
      // One foot out of the binding, pushing.
      const push = Math.floor(r.skateAnim * 6) % 2;
      DRAW.board(sx, sy, 0, '#ffd23f');
      px(sx - 2, sy - 6, 2, 5, '#22314d');
      px(sx + 1 + (push ? 3 : 1), sy - 6 + (push ? 3 : 0), 2, 5, '#22314d'); // the free leg
      px(sx - 3, sy - 12, 6, 6, jacket); px(sx - 2, sy - 16, 4, 4, helmet); px(sx - 2, sy - 14, 4, 1, '#3ce0ff');
      return;
    }
    const sunk = r.mode === 'ride' && !leanHeld() && WORLD.inPow(r.x, r.y) && r.speed > 5; // board hidden in deep snow
    let deg = HEADINGS[r.h];
    if (r.stopping) deg = r.stopDir + 90;
    if (r.mode === 'air') deg += r.spin;
    if (r.mode === 'grind') deg = r.grindStyle.includes('50-50') ? 0 : 90;
    deg += r.butterSpin;
    if (!sunk) DRAW.board(sx, by, deg, '#ffd23f');
    else px(sx - 7, sy - 3, 14, 3, '#ffffff');
    // Facing downhill (heelside) shows the goggles; toeside shows the back of the helmet.
    const travel = r.stopping ? r.stopSide : Math.sin(HEADINGS[r.h] * DEG);
    let heel = travel >= 0;
    if (stance === 'goofy') heel = !heel;
    if (r.sw) heel = !heel;
    const grabbing = r.mode === 'air' && grabHeld();
    const crouch = grabbing || r.stopping ? 2 : 0;
    const lean = r.mode === 'ride' && leanHeld() ? -1 : 0; // leaning back shifts the body up the board
    if (!sunk) px(sx - 2, by - 6, 4, 5, '#22314d');
    px(sx - 3 + lean, by - 12 + crouch, 6, 6, jacket);
    if (grabbing) px(sx + 3, by - 8, 1, 6, jacket);
    if (r.mode === 'grind') { px(sx - 7, by - 11, 3, 1, jacket); px(sx + 4, by - 11, 3, 1, jacket); } // arms out for balance
    px(sx - 2 + lean, by - 16 + crouch, 4, 4, helmet);
    if (heel) px(sx - 2 + lean, by - 14 + crouch, 4, 1, '#3ce0ff');
  }

  // Chairlifts: two cables down the band, chairs going up one side and down the other, with a shadow on the snow.
  function drawLifts() {
    const camX = S.camX, camY = S.camY;
    const b0 = WORLD.bandOf(Math.max(0, camY)), b1 = WORLD.bandOf(Math.max(0, camY + H));
    for (let b = b0; b <= b1; b++) {
      const lf = WORLD.liftFor(b);
      if (!lf.has) continue;
      const top = Math.max(lf.y0, camY - 10), bot = Math.min(lf.y1, camY + H + 10);
      if (bot <= top) continue;
      const sx = lf.x - camX;
      g.fillStyle = 'rgba(80,100,130,0.18)'; g.fillRect(sx + 10, top - camY, 1, bot - top); g.fillRect(sx + 22, top - camY, 1, bot - top);
      g.fillStyle = '#2b2f3a'; g.fillRect(sx - 6, top - camY - 40, 1, bot - top); g.fillRect(sx + 6, top - camY - 40, 1, bot - top);
      const len = lf.y1 - lf.y0;
      for (const [side, dir] of [[-6, -1], [6, 1]]) {
        for (let k = 0; k < len; k += 56) {
          const wy = lf.y0 + ((k + dir * S.simT * 40) % len + len) % len;
          if (wy < top || wy > bot) continue;
          const cy = wy - camY - 40;
          px(sx + side - 1, cy, 1, 5, '#2b2f3a');
          px(sx + side - 4, cy + 5, 8, 2, '#41557a');
          if (dir < 0) { px(sx + side - 3, cy + 1, 2, 4, '#ff8a1f'); px(sx + side + 1, cy + 1, 2, 4, '#2f6fe4'); } // riders going up
        }
      }
    }
  }

  function render() {
    const r = S.rider;
    S.camX = Math.round(r.x - W / 2);
    S.camY = Math.round(r.y - H * 0.3);
    const camX = S.camX, camY = S.camY;
    g.fillStyle = '#eaf1f8';
    g.fillRect(0, 0, W, H);

    // Roped-off stashes: brighter, untouched snow.
    const b0 = WORLD.bandOf(Math.max(0, camY)), b1 = WORLD.bandOf(Math.max(0, camY + H));
    const ropes = [];
    for (let b = b0; b <= b1; b++) {
      const by0 = b * C.ZONE_ROWS * C.CHUNK;
      // Powder zones: brighter, deeper snow.
      if (FS.ZONES[WORLD.zoneAt(b * C.ZONE_ROWS)].pow) {
        const y0 = Math.max(0, by0 - camY), y1 = Math.min(H, by0 + C.ZONE_ROWS * C.CHUNK - camY);
        if (y1 > y0) { g.fillStyle = '#f7faff'; g.fillRect(0, y0, W, y1 - y0); }
      }
      // Catwalks: flat, groomed corduroy across the whole run.
      const cw = WORLD.catwalkFor(b);
      if (cw.has) {
        const y0 = Math.max(0, cw.y0 - camY), y1 = Math.min(H, cw.y1 - camY);
        if (y1 > y0) {
          g.fillStyle = '#e1e9f2'; g.fillRect(0, y0, W, y1 - y0);
          g.fillStyle = '#d6e0ec';
          for (let y = Math.ceil((camY + y0) / 4) * 4; y < camY + y1; y += 4) g.fillRect(0, y - camY, W, 1);
        }
      }
      const rp = WORLD.ropeFor(b);
      if (!rp.has) continue;
      ropes.push(rp);
      const x0 = rp.side > 0 ? rp.x - camX : 0, x1 = rp.side > 0 ? W : rp.x - camX;
      const y0 = Math.max(0, rp.y0 - camY), y1 = Math.min(H, rp.y1 - camY);
      if (x1 > x0 && y1 > y0) { g.fillStyle = '#fbfdff'; g.fillRect(Math.max(0, x0), y0, Math.min(W, x1) - Math.max(0, x0), y1 - y0); }
    }

    const cx0 = Math.floor(camX / C.CHUNK) - 1, cx1 = Math.floor((camX + W) / C.CHUNK) + 1;
    const cy0 = Math.floor((camY - 40) / C.CHUNK), cy1 = Math.floor((camY + H + 40) / C.CHUNK) + 1;
    const ground = [], ups = [];
    for (let i = cx0; i <= cx1; i++) for (let j = cy0; j <= cy1; j++) {
      const ch = WORLD.getChunk(i, j);
      for (const s of ch.speckles) {
        const x = s.x - camX, y = s.y - camY;
        if (x >= 0 && x < W && y >= 0 && y < H && !WORLD.inStash(s.x, s.y)) { g.fillStyle = s.c; g.fillRect(x | 0, y | 0, 1, 1); }
      }
      for (const o of ch.statics) {
        const x = o.x - camX, y = o.y - camY;
        if (x < -60 || x > W + 60 || y < -10 || y > H + 40) continue;
        (FS.GROUND[o.type] ? ground : ups).push(o);
      }
    }
    for (const o of ground) DRAW[o.type](o.x - camX, o.y - camY);
    drawStartGate();

    g.lineCap = 'square';
    let prev = null;
    for (const p of S.trail) {
      if (!p) { prev = null; continue; }
      if (prev) {
        g.strokeStyle = p.w > 2 ? '#c3d3e6' : '#d0dceb';
        g.lineWidth = p.w;
        g.beginPath(); g.moveTo(prev.x - camX, prev.y - camY); g.lineTo(p.x - camX, p.y - camY); g.stroke();
      }
      prev = p;
    }
    for (const rp of ropes) DRAW.rope(rp, camX, camY, W, H);

    for (const n of S.npcs) {
      const x = n.x - camX, y = n.y - camY;
      if (x > -20 && x < W + 20 && y > -10 && y < H + 30) ups.push(n);
    }
    ups.push(r);
    if (S.patrol) ups.push(S.patrol);
    const key = (o) => (o === r ? (r.rail ? r.rail.y + 1 : r.y + (r.z > 6 ? 60 : 0)) : o.y);
    ups.sort((a, b) => key(a) - key(b));
    if (r.mode === 'air') px(r.x - camX - 6, r.y - camY - 1, 12, 3, 'rgba(60,80,110,0.25)');
    for (const o of ups) {
      const sx = Math.round(o.x - camX), sy = Math.round(o.y - camY);
      if (o === r) drawRider();
      else if (o === S.patrol) DRAW.snowmobile(sx, sy, S.simT, o.dirX);
      else if (!o.type) DRAW.person(o, sx, sy, S.simT); // people have no type (pickups have a kind too)
      else if (o.type === 'slowzone') DRAW.slowzone(sx, sy, o.done);
      else DRAW[o.type](sx, sy, o, S.simT);
    }
    drawLifts();
    for (const b of S.bullets) { px(b.x - camX - 1, b.y - camY - 6, 3, 2, '#ffb300'); px(b.x - camX - 1 - b.vx * 0.02, b.y - camY - 6 - b.vy * 0.02, 2, 1, '#ffe082'); }
    for (const p of S.particles) px(p.x - camX, p.y - camY - p.z, 2, 2, p.c);
    if (S.whiteT > 0) { g.fillStyle = `rgba(255,255,255,${Math.min(0.85, S.whiteT * 2.5)})`; g.fillRect(0, 0, W, H); } // snowgun whiteout

    if (DEBUG) {
      g.strokeStyle = 'rgba(255,0,0,0.8)'; g.lineWidth = 1;
      for (const o of ups) {
        const w = o === r ? 6 : o.w || 8, h = o === r ? 4 : o.h || 6;
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
    drawHud(ups);
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
  function drawHud(ups) {
    if (state === 'title') return;
    const r = S.rider, gw = W * scale, L = offX + 12, T = offY + 12 + safeTop;

    // Radar signs show your live speed as you come in.
    for (const o of ups) {
      if (o.type !== 'slowzone') continue;
      const s = toScreen(o.x + 41, o.y - 23);
      const near = !o.done && o.y - r.y < 260 && o.y > r.y;
      const mph = o.done ? o.shown : Math.round(r.speed * C.MPH);
      if (!near && !o.done) { text(`${C.RADAR_LIMIT_MPH}`, s.x, s.y, 8, '#ffd400', 'center'); continue; }
      text(String(mph ?? ''), s.x, s.y, 8, mph > C.RADAR_LIMIT_MPH ? '#ff1744' : '#00e676', 'center');
    }

    text(`${Math.floor(S.dist).toLocaleString()} m`, L, T, 16, '#0f1a2e');
    text(`CLOUT ${S.clout.toLocaleString()}`, L, T + 24, 10, S.clout < 0 ? '#c62828' : '#0f1a2e');
    text(`${Math.round(r.speed * C.MPH)} MPH${r.sw ? '  SWITCH' : ''}`, L, T + 40, 8, '#41557a');
    const b = S.buffs, buffs = [];
    if (b.wax > 0) buffs.push(`WAX ${Math.ceil(b.wax)}`);
    if (b.can > 0) buffs.push(`COURAGE ${Math.ceil(b.can)}`);
    if (b.burrito) buffs.push('BURRITO');
    if (buffs.length) text(buffs.join(' · '), L, T + 54, 7, '#6a1b9a');

    const bw = 84, bx = offX + gw - 12 - 50 - bw;
    const hot = S.patrol && Math.floor(S.simT * 6) % 2 === 0;
    text(S.patrol ? 'PATROL!' : 'PATROL HEAT', bx, T, 7, hot ? '#c62828' : '#41557a');
    ctx.fillStyle = '#0f1a2e'; ctx.fillRect(bx, T + 12, bw, 10);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(bx + 2, T + 14, bw - 4, 6);
    ctx.fillStyle = S.heat > 70 ? '#e53935' : S.heat > 35 ? '#ff9800' : '#ffc107';
    ctx.fillRect(bx + 2, T + 14, ((bw - 4) * S.heat) / 100, 6);

    // Patrol coming from behind: an arrow at the top edge.
    if (S.patrol) {
      const s = toScreen(S.patrol.x, S.patrol.y);
      if (s.y < offY + 30) {
        const ax = clamp(s.x, offX + 30, offX + gw - 30);
        text('▲ PATROL', ax, offY + 64 + safeTop, 9, Math.floor(S.simT * 6) % 2 ? '#c62828' : '#2979ff', 'center');
      }
    }

    for (const p of S.popups) {
      const s = toScreen(p.x, p.y), k = 1 - p.t / p.life;
      ctx.globalAlpha = Math.min(1, p.t * 2.5);
      text(p.text, s.x, s.y - k * 24, p.kind === 'say' ? 8 : 9, POP_COLORS[p.kind], 'center');
    }
    ctx.globalAlpha = 1;

    if (S.caption) {
      ctx.globalAlpha = Math.min(1, S.caption.t * 2);
      text(S.caption.text, offX + gw / 2, offY + H * scale * 0.42, S.caption.text.length > 18 ? 10 : 14, '#0f1a2e', 'center');
      ctx.globalAlpha = 1;
    }
    if (S.zoneToast) {
      ctx.globalAlpha = Math.min(1, S.zoneToast.t * 2);
      text(S.zoneToast.text, offX + gw / 2, T + 64, 12, '#ff3d7f', 'center');
      ctx.globalAlpha = 1;
    }
    if (S.hintT > 0) {
      ctx.globalAlpha = Math.min(1, S.hintT);
      const lines = isTouch ? ['DRAG TO STEER · TAP TO OLLIE', 'FLICK UP TO STOP + SPRAY'] : ['ARROWS STEER · SPACE OLLIE', 'UP = HARD STOP + SPRAY'];
      const yb = offY + H * scale - 46;
      text(lines[0], offX + gw / 2, yb, 8, '#41557a', 'center');
      text(lines[1], offX + gw / 2, yb + 16, 8, '#41557a', 'center');
      ctx.globalAlpha = 1;
    }
    if (DEBUG) text(`${fps} fps · ${Math.round(r.speed)} px/s · h${r.h} · heat ${Math.round(S.heat)} · seed ${S.seed}`, L, offY + H * scale - 20, 7, '#c62828');
  }

  // ---------- Screens ----------
  const $ = (id) => document.getElementById(id);
  const titleEl = $('title'), pauseEl = $('pause'), overEl = $('over'), pauseBtn = $('pauseBtn'), bestEl = $('best');
  const stanceBtns = document.querySelectorAll('[data-stance]');

  function showStance() { stanceBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.stance === stance))); }
  function showBest() {
    bestEl.textContent = best > 0 ? `Best: ${Math.floor(best).toLocaleString()} m · ${bestClout.toLocaleString()} clout` : '';
  }
  function saveBest() { FS.store.set('best', Math.floor(best)); FS.store.set('bestClout', bestClout); }

  function start() {
    newRun(); resetInput();
    state = 'play'; S.hintT = 7;
    titleEl.hidden = true; pauseEl.hidden = true; overEl.hidden = true; pauseBtn.hidden = false;
    last = performance.now(); acc = 0;
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
  function toTitle() {
    saveBest(); newRun(); state = 'title';
    pauseEl.hidden = true; overEl.hidden = true; pauseBtn.hidden = true; titleEl.hidden = false;
    showBest();
  }

  function showOver() {
    state = 'over';
    S.caughtT = 0.6; // brief pause before Space/Enter can restart
    const st = S.stats, dist = Math.floor(S.dist);
    const prevBest = FS.store.get('best', 0), prevClout = FS.store.get('bestClout', 0);
    const newBest = dist > prevBest, newClout = S.clout > prevClout;
    if (S.clout > bestClout) bestClout = S.clout;
    saveBest();
    $('overLine').textContent = `Ski Patrol caught you at ${dist.toLocaleString()} m`;
    $('passInfo').textContent = `${new Date().toLocaleDateString()} · ${dist.toLocaleString()} m`;
    $('overBest').textContent = newBest && newClout ? 'New best distance and clout!' : newBest ? 'New best distance!' : newClout ? 'New best clout!' : '';
    const rows = [
      ['Distance', `${dist.toLocaleString()} m`],
      ['Clout', S.clout.toLocaleString()],
      ['Top speed', `${st.topMph} mph`],
      ['Best trick', st.bestTrick ? `${st.bestTrick.name} (+${st.bestTrick.pts})` : 'none'],
      ['Skiers sprayed', st.sprayed],
      ['Skiers bowled', st.plowed],
      ['Homies sprayed', st.homies],
      ['Speed traps', st.speedTraps],
      ['Stash meters', Math.round(st.stashM)],
      ['Rails and boxes', st.grinds],
      ['Under-the-lift tricks', st.liftTricks],
      ['Pickups', st.pickups],
      ['Found', st.found.length ? st.found.join(', ') : 'nothing'],
      ['Patrol shaken', st.shaken],
      ['Tree wells', st.wells],
      ['Unstrapped', st.skated],
      ['Crashes', st.crashes],
    ];
    const dl = $('overStats');
    dl.replaceChildren(...rows.flatMap(([k, v]) => { const dt = document.createElement('dt'); dt.textContent = k; const dd = document.createElement('dd'); dd.textContent = String(v); return [dt, dd]; }));
    const chat = $('overChat');
    const lines = RULES.chat(st, dist);
    const handles = FS.CHAT_HANDLES.slice();
    chat.replaceChildren(...lines.map((l) => {
      const p = document.createElement('p');
      const b = document.createElement('b'); b.textContent = handles.splice(Math.floor(Math.random() * handles.length), 1)[0] + ' ';
      p.append(b, l);
      return p;
    }));
    pauseBtn.hidden = true;
    overEl.hidden = false;
    $('againBtn').focus({ preventScroll: true });
  }

  stanceBtns.forEach((b) => b.addEventListener('click', () => { stance = b.dataset.stance; FS.store.set('stance', stance); showStance(); }));
  $('startBtn').addEventListener('click', start);
  $('resumeBtn').addEventListener('click', resume);
  $('restartBtn').addEventListener('click', start);
  $('menuBtn').addEventListener('click', toTitle);
  $('againBtn').addEventListener('click', start);
  $('overMenuBtn').addEventListener('click', toTitle);
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
    if (state === 'over' && S.caughtT > 0) S.caughtT -= dt;
    if (state === 'play' || state === 'caught') {
      acc += dt;
      let n = 0;
      while (acc >= STEP && n < 6 && (state === 'play' || state === 'caught')) { update(STEP); acc -= STEP; n++; }
      if (n === 6) acc = 0;
    }
    render();
  }

  resize();
  newRun();
  showStance();
  showBest();
  requestAnimationFrame(frame);

  // Handy for tuning and testing from the browser console: FS.C.G = 300, FS.game.step(60)
  FS.game = {
    start,
    get state() { return state; },
    step(n = 1) { for (let i = 0; i < n; i++) { if (state === 'play' || state === 'caught') update(STEP); } render(); },
  };
})();
