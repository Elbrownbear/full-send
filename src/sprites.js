// Full Send: pixel drawing. Placeholder art made of rectangles until real sprite sheets arrive.
// Everything draws onto the small canvas (FS.gfx.g) at screen coordinates (sx, sy) = the thing's feet.
(function () {
  'use strict';
  const FS = window.FS, DEG = FS.DEG;
  FS.gfx = { g: null };
  const px = (x, y, w, h, c) => { const g = FS.gfx.g; g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const SKIN = '#f0c6a0';

  // ---------- Terrain ----------
  function tier(cx, top, rows, half, c1, c2) {
    for (let i = 0; i < rows; i++) {
      const w = Math.round(1 + (i / (rows - 1)) * half);
      px(cx - w, top + i, w, 1, c1);
      px(cx, top + i, w + 1, 1, c2);
    }
  }
  function tree(sx, sy) {
    px(sx - 1, sy - 5, 3, 5, '#6b4a2b');
    tier(sx, sy - 13, 9, 8, '#24703f', '#1b5631');
    tier(sx, sy - 19, 8, 6, '#24703f', '#1b5631');
    tier(sx, sy - 25, 7, 4, '#24703f', '#1b5631');
    px(sx - 1, sy - 25, 2, 1, '#fff'); px(sx - 3, sy - 19, 3, 1, '#fff'); px(sx - 5, sy - 13, 3, 1, '#fff');
  }
  function rock(sx, sy) {
    px(sx - 5, sy - 4, 10, 4, '#7d8590'); px(sx - 4, sy - 6, 8, 2, '#959ca6'); px(sx - 3, sy - 7, 5, 1, '#aeb4bc');
    px(sx - 2, sy - 7, 3, 1, '#fff'); px(sx + 2, sy - 4, 3, 4, '#666d77');
  }
  function stump(sx, sy) {
    px(sx - 3, sy - 4, 6, 4, '#7a5230'); px(sx - 3, sy - 5, 6, 1, '#c8a27a'); px(sx - 2, sy - 6, 4, 1, '#fff');
  }
  function kicker(sx, sy) {
    for (let i = 0; i < 12; i++) {
      const w = 13 + Math.round((i * 4) / 11); // 34 px wide at the lip (Nov 21: was 22)
      px(sx - w, sy - 12 + i, w * 2, 1, i < 2 ? '#f7fbff' : '#dce8f5');
      px(sx - w, sy - 12 + i, 1, 1, '#a9bdd6'); px(sx + w - 1, sy - 12 + i, 1, 1, '#a9bdd6');
    }
    px(sx - 17, sy - 1, 34, 2, '#6f8fb8');
    px(sx - 17, sy + 1, 34, 3, '#cfdcea');
    px(sx - 18, sy - 3, 2, 3, '#ff7a1a'); px(sx + 16, sy - 3, 2, 3, '#ff7a1a');
  }
  // A rail runs downhill from (sy - 48) to sy, on little legs; it casts a shadow to its right.
  function rail(sx, sy) {
    px(sx + 1, sy - 46, 2, 46, '#c9d6e6');
    for (const y of [sy - 44, sy - 24, sy - 4]) px(sx - 1, y, 2, 5, '#5a6270');
    px(sx - 1, sy - 49, 2, 46, '#8a94a3');
    px(sx - 1, sy - 49, 1, 46, '#d7dde6');
  }
  // A box: wider, with a yellow and black side.
  function box(sx, sy) {
    px(sx + 4, sy - 38, 2, 38, '#c9d6e6');
    px(sx - 4, sy - 41, 8, 38, '#2b2f3a');
    px(sx - 4, sy - 41, 8, 2, '#ffd23f');
    for (let y = sy - 37; y < sy - 4; y += 8) px(sx - 4, y, 8, 3, '#ffd23f');
    px(sx - 3, sy - 41, 6, 38, 'rgba(255,255,255,0.12)');
  }
  // Ice: a blue sheen with glints.
  function ice(sx, sy) {
    for (let i = 0; i < 14; i++) {
      const w = Math.round(15 * Math.sqrt(1 - ((i - 6.5) / 7) ** 2));
      px(sx - w, sy - 14 + i, w * 2, 1, i % 3 === 0 ? '#bcd6f2' : '#cfe2f7');
    }
    px(sx - 6, sy - 10, 3, 1, '#ffffff'); px(sx + 4, sy - 6, 2, 1, '#ffffff');
  }
  // A shark: just the tip of a rock poking out of fresh snow. Hard to see on purpose.
  function shark(sx, sy) {
    px(sx - 2, sy - 3, 4, 2, '#8a929c'); px(sx - 1, sy - 4, 2, 1, '#a5adb6');
    px(sx - 3, sy - 1, 6, 1, '#e3ebf4');
  }

  // ---------- M3 set pieces ----------
  function tower(sx, sy) {
    px(sx + 3, sy - 3, 14, 3, 'rgba(80,100,130,0.18)'); // shadow
    px(sx - 2, sy - 40, 4, 40, '#7d8590'); px(sx - 2, sy - 40, 1, 40, '#aeb4bc');
    px(sx - 8, sy - 42, 16, 3, '#5a6270');
    px(sx - 3, sy - 2, 6, 2, '#5a6270');
  }
  function snowgun(sx, sy, o) {
    const d = o ? o.dir : 1;
    px(sx - 4, sy - 2, 1, 2, '#444'); px(sx + 3, sy - 2, 1, 2, '#444'); px(sx, sy - 6, 1, 6, '#444'); // tripod
    px(sx - 4, sy - 11, 8, 6, '#e8eaed'); px(sx - 3, sy - 10, 6, 4, '#9aa0a8'); // fan housing
    px(sx + (d > 0 ? 4 : -7), sy - 9, 3, 2, '#5a6270'); // nozzle
  }
  function burger(sx, sy) {
    px(sx - 11, sy - 10, 22, 10, '#8a5a2b'); px(sx - 11, sy - 10, 22, 1, '#a8743f');
    px(sx - 13, sy - 14, 26, 4, '#c62828'); px(sx - 13, sy - 15, 26, 1, '#ffffff'); // red roof with snow
    px(sx - 9, sy - 8, 18, 4, '#3a2a1a'); // serving window
    // Sign: a burger icon (bun, patty, lettuce, bun) on a post.
    px(sx + 12, sy - 22, 1, 12, '#5a3a1a');
    px(sx + 8, sy - 26, 10, 2, '#e0a050'); px(sx + 8, sy - 24, 10, 1, '#3aa655'); px(sx + 8, sy - 23, 10, 2, '#5a3a1a'); px(sx + 8, sy - 21, 10, 1, '#e0a050');
  }
  function hottub(sx, sy, o, t) {
    px(sx - 13, sy - 12, 26, 12, '#8a5a2b'); px(sx - 11, sy - 11, 22, 8, '#5ad1ff'); px(sx - 11, sy - 11, 22, 1, '#b5ecff');
    const heads = ['#f0c6a0', '#c68b59', '#f0c6a0'];
    for (let i = 0; i < 3; i++) { px(sx - 8 + i * 7, sy - 13, 4, 4, heads[i]); px(sx - 8 + i * 7, sy - 14, 4, 1, ['#222', '#ffd400', '#ff3d7f'][i]); }
    const f = Math.floor((t || 0) * 3) % 3; // steam
    px(sx - 6 + f * 3, sy - 18 - f, 2, 2, 'rgba(255,255,255,0.8)'); px(sx + 4 - f * 2, sy - 20 + f, 2, 2, 'rgba(255,255,255,0.7)');
  }
  function palm(sx, sy) {
    for (let i = 0; i < 26; i++) px(sx - 1 + Math.round(Math.sin(i / 9) * 3), sy - i, 3, 1, i % 4 ? '#8a6a3a' : '#6b4a2b');
    const tx = sx + 2, ty = sy - 27;
    for (let i = 0; i < 10; i++) { px(tx - i, ty + Math.round(i * i / 14), 2, 2, '#2e9e4f'); px(tx + i, ty + Math.round(i * i / 14), 2, 2, '#2e9e4f'); px(tx - i / 2, ty - i / 2, 2, 2, '#3fbf62'); px(tx + i / 2, ty - i / 2, 2, 2, '#3fbf62'); }
    px(tx - 1, ty + 1, 3, 3, '#6b4a2b'); // coconuts
  }
  // Beyond Medals nod: a beat-up RV with a snow ramp up its back and a crew on the roof.
  function rv(sx, sy, o, t) {
    for (let i = 0; i < 16; i++) px(sx - 13 + i / 4, sy - 32 + i, 26 - i / 2, 1, '#f4f8fc'); // snow ramp (uphill side)
    px(sx - 17, sy - 16, 34, 13, '#efe6d2'); px(sx - 17, sy - 10, 34, 2, '#c0392b'); px(sx - 17, sy - 8, 34, 1, '#ff8a1f');
    for (let i = 0; i < 4; i++) px(sx - 14 + i * 8, sy - 14, 5, 3, '#6fa8d6');
    px(sx - 12, sy - 3, 5, 3, '#222'); px(sx + 7, sy - 3, 5, 3, '#222');
    px(sx - 17, sy - 17, 34, 1, '#ffffff');
    const f = Math.floor((t || 0) * 4) % 2; // the crew, cheering
    for (let i = 0; i < 3; i++) { const cx = sx - 9 + i * 8; px(cx, sy - 22, 3, 5, ['#ff3d7f', '#00c2a8', '#ffd400'][i]); px(cx, sy - 25, 3, 3, '#f0c6a0'); if ((i + f) % 2) px(cx - 1, sy - 27, 1, 3, '#f0c6a0'); }
  }
  function cord(sx, sy) {
    for (let i = 0; i < 10; i += 2) px(sx - 15, sy - 10 + i, 30, 1, '#d2deeb');
  }
  // Pickups bob and sparkle.
  const PICKUP_ART = {
    wax(x, y) { px(x - 4, y - 3, 8, 4, '#ff8a1f'); px(x - 4, y - 3, 8, 1, '#ffb27a'); },
    burrito(x, y) { px(x - 5, y - 3, 10, 4, '#c0c6cc'); px(x - 5, y - 3, 10, 1, '#eef1f4'); px(x + 3, y - 3, 2, 4, '#f2c230'); },
    pass(x, y) { px(x - 1, y - 9, 1, 5, '#2f6fe4'); px(x - 4, y - 5, 8, 6, '#ffffff'); px(x - 4, y - 5, 8, 2, '#ff3d7f'); px(x - 4, y - 5, 8, 6, 'rgba(0,0,0,0)'); },
    waffle(x, y) { px(x - 4, y - 4, 8, 6, '#e0a050'); px(x - 2, y - 4, 1, 6, '#b8782a'); px(x + 1, y - 4, 1, 6, '#b8782a'); px(x - 4, y - 2, 8, 1, '#b8782a'); },
    can(x, y) { px(x - 2, y - 6, 5, 7, '#c0c6cc'); px(x - 2, y - 4, 5, 2, '#2f6fe4'); px(x - 2, y - 6, 5, 1, '#eef1f4'); },
    gopro(x, y) { px(x - 3, y - 4, 6, 5, '#1d1d1f'); px(x - 1, y - 3, 3, 3, '#5ad1ff'); },
    bronze(x, y) { px(x - 2, y - 9, 1, 4, '#c62828'); px(x + 1, y - 9, 1, 4, '#2f6fe4'); px(x - 3, y - 5, 6, 6, '#b8732f'); px(x - 2, y - 4, 4, 4, '#d9944d'); },
    wavemedal(x, y) { px(x - 2, y - 9, 4, 4, '#00c2a8'); px(x - 3, y - 5, 6, 6, '#e0b84a'); px(x - 2, y - 3, 4, 1, '#2f6fe4'); },
  };
  function pickup(sx, sy, o, t) {
    if (!o || o.taken) return;
    const bob = Math.round(Math.sin((t || 0) * 4 + o.x) * 1.5);
    px(sx - 4, sy - 1, 8, 2, 'rgba(60,80,110,0.2)');
    (PICKUP_ART[o.kind] || PICKUP_ART.wax)(sx, sy - 4 + bob);
    if (Math.floor((t || 0) * 5 + o.y) % 4 === 0) px(sx + 4, sy - 12 + bob, 1, 1, '#ffffff');
  }

  // Radar Slow Zone: two orange posts and a banner over the run, radar sign on the right.
  function slowzone(sx, sy, done) {
    px(sx - 33, sy - 16, 2, 16, '#ff7a1a'); px(sx + 31, sy - 16, 2, 16, '#ff7a1a');
    px(sx - 33, sy - 19, 66, 6, '#ff7a1a');
    for (let i = 0; i < 8; i++) px(sx - 29 + i * 8, sy - 18, 4, 4, '#ffffff');
    px(sx + 37, sy - 14, 1, 14, '#41557a');
    px(sx + 34, sy - 24, 14, 10, '#111');
    px(sx + 35, sy - 23, 12, 8, done ? '#222' : '#1a1a1a');
    px(sx - 31, sy + 1, 62, 1, '#ffb27a'); // a painted line on the snow
  }
  // A rope line with poles every 24 px and a CLOSED sign every 128 px.
  // Rope stripes are anchored to the world so they don't crawl as the camera moves.
  const stripe = (n) => (((Math.floor(n / 3) % 2) + 2) % 2 ? '#ffd400' : '#111');
  function rope(rp, camX, camY, W, H) {
    const sx = rp.x - camX;
    const top = Math.max(rp.y0, camY - 20), bot = Math.min(rp.y1, camY + H + 20);
    if (bot <= top) return;
    for (let y = top; y < bot; y++) px(sx, y - camY - 6, 1, 1, stripe(y));
    for (let y = Math.ceil(rp.y0 / 24) * 24; y < bot; y += 24) if (y >= top) px(sx - 1, y - camY - 8, 2, 9, '#3a3a3a');
    for (let y = rp.y0 + 40; y < bot; y += 128) {
      if (y < top) continue;
      const ty = y - camY - 16;
      px(sx - 5, ty, 11, 8, '#ff7a1a');
      for (let i = 0; i < 5; i++) { px(sx - 3 + i * 1.5, ty + 1 + i * 1.3, 2, 1, '#111'); px(sx + 3 - i * 1.5, ty + 1 + i * 1.3, 2, 1, '#111'); }
    }
    // The top rope runs across the stash side.
    const ty = rp.y0 - camY - 6;
    if (ty > -10 && ty < H + 10) {
      const a = rp.side > 0 ? sx : 0, b = rp.side > 0 ? W : sx;
      for (let x = Math.max(0, a); x < Math.min(W, b); x++) px(x, ty, 1, 1, stripe(x + camX));
    }
  }

  // ---------- People ----------
  function skis(sx, sy, len = 10, c = '#222') { px(sx - 2, sy - 6, 1, len, c); px(sx + 1, sy - 6, 1, len, c); }
  function poles(sx, sy) { px(sx - 5, sy - 14, 1, 10, '#9aa0a8'); px(sx + 4, sy - 14, 1, 10, '#9aa0a8'); }
  function skierBody(sx, sy, jacket, pants, helmet = '#eeeeee', goggles = '#ffd400') {
    skis(sx, sy);
    px(sx - 2, sy - 9, 4, 4, pants);
    px(sx - 3, sy - 15, 6, 6, jacket);
    px(sx - 2, sy - 19, 4, 4, SKIN); px(sx - 2, sy - 19, 4, 2, helmet); px(sx - 2, sy - 17, 4, 1, goggles);
  }
  function boarderBody(sx, sy, n, hoodW = 8) {
    px(sx - 6, sy - 2, 12, 3, n.board);
    px(sx - 3, sy - 8, 6, 6, '#3a3f4b');
    px(sx - hoodW / 2, sy - 15, hoodW, 7, n.color);
    px(sx - 2, sy - 19, 4, 4, SKIN); px(sx - 2, sy - 20, 4, 2, '#222');
  }
  function fallen(n, sx, sy) {
    px(sx - 6, sy - 5, 10, 4, n.color); px(sx + 4, sy - 6, 4, 4, SKIN);
    if (n.rides === 'ski') { px(sx - 9, sy - 1, 7, 1, '#333'); px(sx + 1, sy + 1, 7, 1, '#333'); }
    else if (n.rides === 'board') px(sx - 7, sy, 12, 2, n.board);
    else px(sx - 8, sy - 7, 5, 3, '#ffd400'); // the gunslinger's helmet rolled off
  }

  const LOOKS = {
    skier(n, sx, sy) { skierBody(sx, sy, n.color, '#2b2f3a'); poles(sx, sy); },
    // Jeans, a bright jacket, and the gaper gap: forehead showing between helmet and goggles.
    gaper(n, sx, sy) {
      skis(sx, sy);
      px(sx - 3, sy - 9, 6, 4, '#3b5b8f');
      px(sx - 3, sy - 15, 6, 6, '#c6ff00');
      px(sx - 2, sy - 21, 4, 2, '#eeeeee'); px(sx - 2, sy - 19, 4, 2, SKIN); px(sx - 2, sy - 17, 4, 1, '#ff3d7f'); px(sx - 2, sy - 16, 4, 1, SKIN);
      poles(sx, sy);
    },
    // Out of control: arms windmilling, poles everywhere.
    jerry(n, sx, sy, t) {
      skierBody(sx, sy, n.color, '#2b2f3a');
      const f = Math.floor(t * 10 + n.phase) % 2;
      px(sx - 6, sy - (f ? 20 : 12), 2, 5, n.color); px(sx + 4, sy - (f ? 12 : 20), 2, 5, n.color);
      px(sx - 8, sy - (f ? 24 : 10), 1, 6, '#9aa0a8'); px(sx + 7, sy - (f ? 10 : 24), 1, 6, '#9aa0a8');
    },
    kid(n, sx, sy) {
      skis(sx, sy + 2, 6);
      px(sx - 2, sy - 6, 4, 4, n.color);
      px(sx - 1, sy - 9, 3, 3, SKIN); px(sx - 1, sy - 10, 3, 2, n.color);
      px(sx - 3, sy - 1, 7, 1, '#bbbbbb'); // pizza!
    },
    instructor(n, sx, sy) {
      skierBody(sx, sy, '#d32f2f', '#1d1d1f');
      px(sx - 2, sy - 14, 4, 4, '#ffffff'); // the SKI SCHOOL bib
      poles(sx, sy);
    },
    dad(n, sx, sy) {
      skierBody(sx, sy, '#22314d', '#b8a27a');
      px(sx - 1, sy - 16, 3, 1, '#5a3a1a'); // mustache
      if (n.yellT > 0) { px(sx - 5, sy - 20, 2, 6, '#22314d'); px(sx + 3, sy - 20, 2, 6, '#22314d'); } // hands cupped, yelling
      else poles(sx, sy);
    },
    patrol(n, sx, sy) {
      skierBody(sx, sy, '#c62828', '#1d1d1f', '#ffffff', '#3ce0ff');
      px(sx - 1, sy - 14, 2, 4, '#ffffff'); px(sx - 2, sy - 13, 4, 2, '#ffffff'); // the cross
      poles(sx, sy);
    },
    boarder(n, sx, sy) { boarderBody(sx, sy, n); },
    parkrat(n, sx, sy) {
      boarderBody(sx, sy, n, 10);
      px(sx - 5, sy - 9, 10, 2, n.color); // the hoodie goes to his knees
      px(sx + 5, sy - 12, 2, 3, '#c0c6cc'); // energy drink
    },
    sitter(n, sx, sy) {
      px(sx - 6, sy - 1, 12, 3, n.board);
      px(sx - 4, sy - 8, 8, 7, n.color);
      px(sx - 2, sy - 12, 4, 4, SKIN); px(sx - 2, sy - 13, 4, 2, '#222');
    },
    influencer(n, sx, sy) {
      if (n.rides === 'ski') skierBody(sx, sy, '#f4f4f4', '#d9b8ff'); else boarderBody(sx, sy, n);
      px(sx + 3, sy - 26, 1, 12, '#555'); px(sx + 2, sy - 29, 3, 4, '#111'); // selfie stick and phone
      px(sx + 3, sy - 28, 1, 1, '#ff3d7f'); // recording light
    },
    // The Moto Gunslinger: cowboy with a six-shooter, in full motocross armor for no reason.
    gunslinger(n, sx, sy) {
      px(sx - 3, sy - 2, 2, 2, '#3a2a1a'); px(sx + 1, sy - 2, 2, 2, '#3a2a1a'); // boots
      px(sx - 3, sy - 7, 2, 5, '#f4f4f4'); px(sx + 1, sy - 7, 2, 5, '#f4f4f4'); // knee braces
      px(sx - 3, sy - 9, 6, 2, '#5a4a3a'); // chaps
      px(sx - 5, sy - 16, 10, 7, '#f4f4f4'); // roost guard
      px(sx - 4, sy - 14, 8, 1, '#e53935'); px(sx - 4, sy - 12, 8, 1, '#e53935');
      px(sx - 3, sy - 22, 6, 6, '#ffd400'); px(sx + 2, sy - 20, 3, 1, '#ffd400'); // MX helmet with peak
      px(sx - 2, sy - 19, 4, 2, '#ff7a1a'); // goggles
      if (n.aggroT > 0) { px(sx + 5, sy - 14, 5, 1, '#f4f4f4'); px(sx + 9, sy - 15, 3, 2, '#444'); } // arm out, six-shooter
      else px(sx + 4, sy - 10, 2, 3, '#444'); // holstered
    },
  };

  // ---------- M3 people ----------
  Object.assign(LOOKS, {
    droneguy(n, sx, sy) {
      skierBody(sx, sy, '#3a3f4b', '#2b2f3a');
      px(sx - 3, sy - 12, 6, 2, '#111'); px(sx + 2, sy - 16, 1, 4, '#9aa0a8'); // controller and antenna
    },
    // The drone flies at n.alt pixels up, with a shadow on the snow.
    drone(n, sx, sy, t) {
      if (n.state === 'down') { px(sx - 3, sy - 2, 6, 2, '#5a6270'); px(sx - 5, sy - 1, 2, 1, '#111'); px(sx + 4, sy - 3, 2, 1, '#111'); return; }
      const ay = sy - Math.round(n.alt) - 4;
      if (n.alt > 1) px(sx - 3, sy - 1, 6, 1, 'rgba(60,80,110,0.25)');
      const f = Math.floor(t * 20) % 2;
      px(sx - 2, ay, 4, 3, '#5a6270');
      px(sx - 5, ay - 1, 3, 1, f ? '#111' : '#777'); px(sx + 3, ay - 1, 3, 1, f ? '#777' : '#111');
      px(sx - 5, ay + 3, 3, 1, f ? '#777' : '#111'); px(sx + 3, ay + 3, 3, 1, f ? '#111' : '#777');
      px(sx, ay + 1, 1, 1, f ? '#ff1744' : '#5a6270');
    },
    speaker(n, sx, sy, t) {
      if (n.rides === 'ski') { skierBody(sx, sy, n.color, '#2b2f3a'); poles(sx, sy); } else boarderBody(sx, sy, n);
      px(sx + 3, sy - 15, 4, 5, '#111'); px(sx + 4, sy - 13, 2, 2, '#777'); // speaker on the backpack
      const k = (t * 14 + n.phase * 10) % 12; // a music note floating up
      px(sx + 7, sy - 22 - k, 2, 2, '#6a1b9a'); px(sx + 8, sy - 26 - k, 1, 4, '#6a1b9a');
    },
    // Telemark: one knee dropped, alternating every turn; wool hat with a pom.
    tele(n, sx, sy, t) {
      const f = Math.floor(t * 2 + n.phase) % 2;
      px(sx - 2 - f, sy - 6 + (f ? 3 : 0), 1, 10, '#6b4a2b'); px(sx + 1 + (1 - f), sy - 6 + (f ? 0 : 3), 1, 10, '#6b4a2b'); // wood skis, staggered
      px(sx - 2, sy - 9 + (f ? 1 : 0), 2, 4, '#5a4a3a'); px(sx + 1, sy - 8 - (f ? 1 : 0), 2, 3, '#5a4a3a');
      px(sx - 3, sy - 15, 6, 6, '#7a4fe0'); px(sx - 3, sy - 13, 6, 1, '#1fa3a3');
      px(sx - 2, sy - 19, 4, 4, SKIN); px(sx - 2, sy - 20, 4, 2, '#c62828'); px(sx - 1, sy - 22, 2, 2, '#ffffff');
      poles(sx, sy);
    },
    // The Euro: neon one-piece, perfect carves.
    euro(n, sx, sy) {
      skis(sx, sy, 11, '#ff3d7f');
      px(sx - 2, sy - 15, 5, 10, '#ff3d7f'); px(sx - 2, sy - 13, 5, 2, '#00e5ff'); px(sx - 2, sy - 9, 5, 1, '#ffd400');
      px(sx - 2, sy - 19, 4, 4, SKIN); px(sx - 2, sy - 19, 4, 2, '#ffffff'); px(sx - 2, sy - 17, 4, 1, '#111');
      poles(sx, sy);
    },
    // Gaper Day costumes: banana, tutu, dino onesie, speedo.
    costume(n, sx, sy) {
      const c = (n.idx || 0) % 4;
      if (n.rides === 'ski') skis(sx, sy); else px(sx - 6, sy - 2, 12, 3, n.board);
      if (c === 0) { px(sx - 3, sy - 20, 6, 15, '#ffe14d'); px(sx - 1, sy - 22, 2, 2, '#6b4a2b'); px(sx - 1, sy - 16, 2, 1, '#111'); }
      else if (c === 1) { px(sx - 2, sy - 9, 4, 4, '#2b2f3a'); px(sx - 5, sy - 10, 10, 2, '#ff6fb5'); px(sx - 3, sy - 16, 6, 6, '#ff6fb5'); px(sx - 2, sy - 20, 4, 4, SKIN); }
      else if (c === 2) { px(sx - 3, sy - 16, 6, 11, '#3aa655'); px(sx - 2, sy - 20, 4, 4, '#3aa655'); px(sx + 3, sy - 18, 1, 1, '#ffd400'); px(sx + 3, sy - 14, 1, 1, '#ffd400'); px(sx - 1, sy - 18, 1, 1, '#111'); }
      else { px(sx - 3, sy - 15, 6, 10, SKIN); px(sx - 3, sy - 9, 6, 2, '#2f6fe4'); px(sx - 2, sy - 19, 4, 4, SKIN); px(sx - 2, sy - 20, 4, 1, '#ffd400'); }
    },
    // The shotski: six people in a row sharing one ski with shots on it.
    shotski(n, sx, sy) {
      for (let i = 0; i < 6; i++) { const x = sx - 30 + i * 12; skierBody(x, sy, FS.COLORS.ski[i % 5], '#2b2f3a'); }
      px(sx - 34, sy - 12, 68, 2, '#8a5a2b');
      for (let i = 0; i < 6; i++) px(sx - 31 + i * 12, sy - 14, 2, 2, '#ffffff');
    },
    lostkid(n, sx, sy) {
      skis(sx, sy + 2, 6);
      px(sx - 2, sy - 6, 4, 4, n.color);
      px(sx - 1, sy - 9, 3, 3, SKIN); px(sx - 1, sy - 10, 3, 2, n.color);
      px(sx + 3, sy - 7, 1, 8, '#9aa0a8'); // just the one pole
    },
    // One foot out of the binding, hopping across the run.
    hopper(n, sx, sy) {
      const up = Math.round(n.alt || 0);
      px(sx - 6, sy - 2 - up, 12, 3, n.board);
      px(sx - 3, sy - 8 - up, 2, 6, '#3a3f4b'); px(sx + 2, sy - 7, 2, 5, '#3a3f4b'); // one leg on the board, one on the snow
      px(sx - 4, sy - 15 - up, 8, 7, n.color);
      px(sx - 2, sy - 19 - up, 4, 4, SKIN); px(sx - 2, sy - 20 - up, 4, 2, '#222');
    },
    // Heelside sideslip down the pitch, arms out, scraping.
    sideslipper(n, sx, sy, t) {
      px(sx - 7, sy - 2, 14, 3, n.board);
      px(sx - 3, sy - 8, 6, 6, '#3a3f4b');
      px(sx - 3, sy - 14, 6, 6, n.color); px(sx - 7, sy - 13, 4, 1, n.color); px(sx + 3, sy - 13, 4, 1, n.color);
      px(sx - 2, sy - 18, 4, 4, SKIN); px(sx - 2, sy - 19, 4, 2, '#eeeeee');
      if (Math.floor(t * 8) % 2) px(sx - 6 + Math.floor(t * 30) % 12, sy + 1, 2, 1, '#cfe2f7');
    },
    // Splitboarder: the board split into two skis with red skins, big pack with a shovel handle.
    splitboarder(n, sx, sy) {
      px(sx - 3, sy - 6, 2, 10, n.board); px(sx + 1, sy - 6, 2, 10, n.board); px(sx - 3, sy - 4, 2, 6, '#c62828'); px(sx + 1, sy - 4, 2, 6, '#c62828');
      px(sx - 2, sy - 9, 4, 4, '#3a3f4b');
      px(sx - 3, sy - 15, 6, 6, n.color);
      px(sx - 5, sy - 17, 4, 8, '#ff7a1a'); px(sx - 4, sy - 20, 1, 3, '#9aa0a8'); // pack and shovel handle
      px(sx - 2, sy - 19, 4, 4, SKIN); px(sx - 2, sy - 19, 4, 2, '#ffd400');
      poles(sx, sy);
    },
    // Johnny Tsunami nod: prep-school ski team, navy jackets with a gold crest.
    academy(n, sx, sy) {
      skierBody(sx, sy, '#1b2a4a', '#1b2a4a', '#1b2a4a', '#e0b84a');
      px(sx - 1, sy - 13, 2, 2, '#e0b84a'); px(sx - 2, sy - 15, 4, 1, '#ffffff');
      poles(sx, sy);
    },
    // The Bomb Hole nod: camp chair, mic, headphones.
    podcast(n, sx, sy) {
      px(sx - 5, sy - 2, 1, 3, '#2f6fe4'); px(sx + 4, sy - 2, 1, 3, '#2f6fe4'); px(sx - 5, sy - 6, 10, 4, '#2f6fe4');
      px(sx - 3, sy - 11, 6, 6, n.color);
      px(sx - 2, sy - 15, 4, 4, SKIN); px(sx - 3, sy - 15, 1, 3, '#111'); px(sx + 2, sy - 15, 1, 3, '#111'); px(sx - 2, sy - 16, 4, 1, '#111');
      const m = n.idx ? -1 : 1; // mics face each other
      px(sx + m * 6, sy - 12, 1, 12, '#555'); px(sx + m * 6 - 1, sy - 14, 3, 3, '#111');
    },
    // A groomer: big orange snowcat with a blade; sometimes the tycoon rides the back with his condo sign.
    snowcat(n, sx, sy, t) {
      const d = n.dir || 1;
      px(sx - 15, sy - 4, 30, 4, '#2a2a2a'); for (let i = 0; i < 6; i++) px(sx - 14 + i * 5 + (Math.floor(t * 10) % 2), sy - 4, 2, 4, '#555');
      px(sx - 13, sy - 12, 26, 8, '#ff7a1a'); px(sx - 13, sy - 12, 26, 1, '#ffb27a');
      px(sx + (d > 0 ? 0 : -10), sy - 19, 10, 7, '#ff7a1a'); px(sx + (d > 0 ? 2 : -8), sy - 18, 6, 4, '#9fd8ff'); // cab
      px(sx + d * 15 - (d > 0 ? 0 : 3), sy - 10, 3, 9, '#c0c6cc'); // blade
      px(sx + (d > 0 ? 1 : -5), sy - 23, 4, 2, Math.floor(t * 3) % 2 ? '#ffd400' : '#ff7a1a'); // beacon
      if (n.tycoon) {
        const bx = sx - d * 9;
        px(bx - 2, sy - 22, 5, 9, '#d9c7a8'); px(bx - 3, sy - 20, 7, 2, '#ffffff'); // fur coat
        px(bx - 1, sy - 25, 3, 3, SKIN); px(bx - 1, sy - 26, 3, 1, '#ffffff');
        px(bx - d * 6, sy - 32, 1, 14, '#5a3a1a'); px(bx - d * 6 - 6, sy - 36, 13, 6, '#ffd400'); // CONDOS COMING SOON sign
        for (let i = 0; i < 3; i++) px(bx - d * 6 - 5, sy - 35 + i * 2, 11 - i * 3, 1, '#111');
      }
    },
  });

  function person(n, sx, sy, t) {
    if (n.fallenT > 0) { fallen(n, sx, sy); return; }
    (LOOKS[n.look] || LOOKS.skier)(n, sx, sy, t);
    if (n.flashT > 0 && Math.floor(n.flashT * 20) % 2 === 0) px(sx - 5, sy - 20, 10, 16, '#ffffff');
    else if (n.sprayed) { px(sx - 2, sy - 14, 1, 1, '#fff'); px(sx + 1, sy - 11, 1, 1, '#fff'); px(sx - 1, sy - 17, 2, 1, '#fff'); px(sx + 2, sy - 8, 1, 1, '#fff'); }
  }

  // ---------- Rider and Ski Patrol ----------
  function board(cx, cy, deg, color) {
    const a = deg * DEG, ux = Math.sin(a), uy = Math.cos(a) * 0.7;
    for (let t = -7; t <= 7; t++) px(cx + ux * t - 1, cy + uy * t - 1, 3, 2, Math.abs(t) >= 6 ? '#b8860b' : color);
  }

  // The patrol snowmobile: red, white cross, light bar flashing red and blue.
  function snowmobile(sx, sy, t, dirX) {
    const lean = Math.round(dirX * 2);
    px(sx - 6, sy + 2, 2, 5, '#111'); px(sx + 4, sy + 2, 2, 5, '#111'); // skis out front
    px(sx - 6, sy - 10, 12, 4, '#2a2a2a'); // track
    px(sx - 7 + lean, sy - 7, 14, 9, '#d32f2f');
    px(sx - 1 + lean, sy - 6, 2, 6, '#ffffff'); px(sx - 3 + lean, sy - 4, 6, 2, '#ffffff');
    px(sx - 5 + lean, sy - 1, 10, 2, '#9fd8ff'); // windshield
    px(sx - 3 + lean, sy - 15, 6, 6, '#c62828'); // driver
    px(sx - 2 + lean, sy - 19, 4, 4, '#ffffff');
    const f = Math.floor(t * 8) % 2;
    px(sx - 4 + lean, sy - 21, 4, 2, f ? '#ff1744' : '#2979ff'); px(sx + lean, sy - 21, 4, 2, f ? '#2979ff' : '#ff1744');
  }

  FS.draw = { px, tree, rock, stump, kicker, rail, box, ice, shark, tower, snowgun, burger, hottub, palm, rv, cord, pickup, slowzone, rope, person, board, snowmobile };
})();
