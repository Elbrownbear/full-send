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
      const w = 8 + Math.round((i * 3) / 11);
      px(sx - w, sy - 12 + i, w * 2, 1, i < 2 ? '#f7fbff' : '#dce8f5');
      px(sx - w, sy - 12 + i, 1, 1, '#a9bdd6'); px(sx + w - 1, sy - 12 + i, 1, 1, '#a9bdd6');
    }
    px(sx - 11, sy - 1, 22, 2, '#6f8fb8');
    px(sx - 11, sy + 1, 22, 3, '#cfdcea');
    px(sx - 12, sy - 3, 2, 3, '#ff7a1a'); px(sx + 10, sy - 3, 2, 3, '#ff7a1a');
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

  FS.draw = { px, tree, rock, stump, kicker, slowzone, rope, person, board, snowmobile };
})();
