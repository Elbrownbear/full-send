// Full Send: scoring rules as plain functions (no drawing, no state), so they can be unit tested.
(function () {
  'use strict';
  const FS = window.FS;
  const r5 = (n) => Math.round(n / 5) * 5;

  FS.rules = {
    // Hard stop next to someone (PRD §5). person = { kind, rides }.
    spray(person, speed, d, reach, rnd = Math.random) {
      const def = FS.PEOPLE[person.kind] || {};
      // Out Cold nod: the Colorado tycoon. Everyone hates him, patrol included.
      if (person.tycoon) return { clout: 500, heat: 0, text: '+500 NO CONDOS!', say: 'MY FUR COAT!' };
      if (person.kind === 'snowcat') return { clout: 25, heat: 5, text: '+25 SPRAYED THE CAT', say: 'HEY!' };
      if (person.rides === 'none') return { clout: 0, heat: 0, text: 'UH OH', say: FS.pick(def.says || ['HEY!'], rnd), aggro: true };
      if (person.rides === 'board') return { clout: -75, heat: 0, text: '-75 SPRAYED A HOMIE', say: FS.pick(FS.SAYS.boardSprayed, rnd), homie: true };
      const close = 1 + Math.max(0, 1 - d / reach); // closer stop = up to double
      let pts = r5((30 + speed * 0.6) * close * (def.mult || 1));
      let heat = 15 * (def.heatMult || 1);
      if (def.patrol) { pts = r5(pts * 2); heat = 100; }
      return { clout: pts, heat, text: `+${pts} SPRAYED`, say: FS.pick(def.says || FS.SAYS.skiSprayed, rnd) };
    },

    // Going through someone at PLOW_SPEED or faster.
    plow(person, speed, rnd = Math.random) {
      const def = FS.PEOPLE[person.kind] || {};
      if (person.rides === 'none') return { clout: 50, heat: 0, text: '+50 DISARMED', say: 'MY HAT!' };
      if (person.rides === 'board') return { clout: -150, heat: 10, text: '-150 FRIENDLY FIRE', say: FS.pick(FS.SAYS.boardSprayed, rnd), homie: true };
      let pts = r5((100 + Math.max(0, speed - FS.C.PLOW_SPEED) * 1.5) * (def.mult || 1)); // mult: a whole shotski line
      let heat = 25 * (def.heatMult || 1) * (def.mult ? 1.5 : 1);
      if (def.patrol) { pts *= 2; heat = 100; }
      return { clout: pts, heat, text: `+${pts} BOWLED OVER`, say: FS.pick(def.says || FS.SAYS.plowed, rnd) };
    },

    // Riding through a radar Slow Zone at this many mph.
    radar(mph) {
      const lim = FS.C.RADAR_LIMIT_MPH;
      if (mph <= lim) return { heat: -10, clout: 0, text: `${mph} IN A ${lim}. THANKS!`, over: 0 };
      const over = mph - lim;
      return { heat: Math.round(10 + over * 0.5), clout: over * 5, text: `${mph} IN A ${lim}! +${over * 5}`, over };
    },

    // Landing. spin = yaw degrees (+ = clockwise from above), flip = pitch degrees (+ = backflip).
    // Spins must end near a multiple of 180 and flips near a multiple of 360:
    // within CLEAN_DEG = clean (×1.2), within `tolerance` = sketchy (×0.6), worse = crash.
    // goofy and wasSwitch decide frontside/backside and Cab (switch frontside).
    trick({ spin = 0, flip = 0, grabT = 0, grabName = '', airT = 0, wasSwitch = false, goofy = false }, tolerance = FS.C.LAND_TOL) {
      const n = Math.round(spin / 180), m = Math.round(flip / 360);
      const err = Math.max(Math.abs(spin - n * 180), Math.abs(flip - m * 360));
      if (err > tolerance) return { ok: false, err };
      const quality = err <= FS.C.CLEAN_DEG ? 'clean' : 'sketchy';
      const half = Math.abs(n), flips = Math.abs(m);
      let pts = half * 90 + flips * 250;
      if (grabT > 0.12) pts += Math.round(40 + grabT * 150);
      if (airT > 0.8) pts += Math.round((airT - 0.8) * 100);
      if (pts > 0 && wasSwitch) pts *= 1.25;
      if (pts > 0) pts *= quality === 'clean' ? 1.2 : 0.6;
      return { ok: true, half, flips, quality, err, pts: r5(pts), name: FS.rules.trickName({ half, n, flips, m, grabT, grabName, wasSwitch, goofy }) };
    },

    // Real-ish trick names. Regular riders spinning counterclockwise (seen from above) are frontside; goofy is the mirror.
    trickName({ half, n, flips, m, grabT, grabName, wasSwitch, goofy }) {
      const deg = half * 180;
      const front = half > 0 && ((n < 0) !== goofy);
      const parts = [];
      if (flips > 0) {
        const times = flips === 1 ? '' : flips === 2 ? 'Double ' : flips === 3 ? 'Triple ' : `${flips}x `;
        const back = m > 0;
        let move;
        if (half === 0) move = back ? 'Backflip' : 'Frontflip';
        else if (back && !front) move = `Rodeo ${deg}`;          // backside + backflip
        else if (!back && front) move = `Misty ${deg}`;          // frontside + frontflip
        else move = `Cork ${deg}`;                                 // the other two: off-axis corks
        let prefix = wasSwitch ? 'Switch ' : '';
        if (move.startsWith('Rodeo')) prefix += 'Back ';           // "Back Rodeo 720", "Back Double Rodeo 1080"
        parts.push(prefix + times + move);
      } else if (half > 0) {
        if (wasSwitch) parts.push(front ? (deg === 180 ? 'Half Cab' : `Cab ${deg}`) : `Switch Back ${deg}`);
        else parts.push(`${front ? 'Front' : 'Back'} ${deg}`);
      }
      if (grabT > 0.12) parts.push(grabName || 'Mute');
      return parts.join(' ') || 'Big air';
    },

    // Sliding a rail or box for `secs` seconds. style: '50-50', 'Boardslide', 'Box 50-50', 'Box slide'.
    grind(secs, style, sw) {
      const pts = r5((60 + secs * 160) * (sw ? 1.25 : 1));
      return { pts, name: (sw ? 'Switch ' : '') + style };
    },

    // Leaning back on the snow. Short presses don't count.
    butter(secs) {
      if (secs < 0.4) return { pts: 0 };
      return { pts: r5(20 + secs * 70), name: 'Tail press' };
    },
    BUTTER_180: 90,

    // End-screen group chat: specific roasts first, then generic ones.
    chat(stats, dist, rnd = Math.random) {
      const lines = [];
      if (stats.homies > 0) lines.push(`${stats.homies} homie${stats.homies > 1 ? 's' : ''} sprayed. we saw that.`);
      if (stats.plowed >= 3) lines.push(`${stats.plowed} skiers bowled over, legend`);
      if (stats.worstMph > 0) lines.push(`${stats.worstMph} in a ${FS.C.RADAR_LIMIT_MPH} is crazy`);
      if (stats.stashM > 0) lines.push('ducking ropes again?');
      if (stats.shot) lines.push('wait who had a GUN');
      if (stats.wells > 0) lines.push('tree well?? never ride trees alone');
      if (stats.skated >= 2) lines.push(`unstrapped ${stats.skated} times lmao`);
      if (stats.tycoon) lines.push('YOU SPRAYED THE CONDO GUY');
      if (stats.found && stats.found.length) lines.push(`found a ${stats.found[0].toLowerCase()}??`);
      if (dist < 300) lines.push('short day huh');
      const pool = FS.CHAT_GENERIC.slice();
      while (lines.length < 3 && pool.length) lines.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
      return lines.slice(0, 3);
    },
  };
})();
