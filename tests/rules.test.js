// Tests for the scoring rules. Run with: node --test
// The game files are plain browser scripts, so we load them into this context with a stand-in `window`.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

globalThis.window = globalThis;
for (const f of ['core.js', 'content.js', 'rules.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8'), { filename: f });
}
const { rules, C, PEOPLE, ZONES, mulberry32, roll } = window.FS;
const fixed = () => 0; // a "random" that always picks the first option

test('spraying a skier earns clout and heat, more when closer', () => {
  const far = rules.spray({ kind: 'skier', rides: 'ski' }, 200, 40, 46, fixed);
  const close = rules.spray({ kind: 'skier', rides: 'ski' }, 200, 2, 46, fixed);
  assert.ok(far.clout > 0 && far.heat === 15);
  assert.ok(close.clout > far.clout);
});

test('spraying a snowboarder costs clout and adds no heat', () => {
  const r = rules.spray({ kind: 'boarder', rides: 'board' }, 200, 10, 46, fixed);
  assert.strictEqual(r.clout, -75);
  assert.strictEqual(r.heat, 0);
  assert.ok(r.homie);
});

test('spraying ski school kids doubles the heat; spraying patrol maxes it', () => {
  assert.strictEqual(rules.spray({ kind: 'school', rides: 'ski' }, 200, 10, 46, fixed).heat, 30);
  assert.strictEqual(rules.spray({ kind: 'patrol', rides: 'ski' }, 200, 10, 46, fixed).heat, 100);
});

test('spraying the gunslinger sets him off', () => {
  assert.ok(rules.spray({ kind: 'gunslinger', rides: 'none' }, 200, 10, 46, fixed).aggro);
});

test('plowing: skiers pay out more the faster you go, snowboarders cost 150', () => {
  const slow = rules.plow({ kind: 'skier', rides: 'ski' }, C.PLOW_SPEED, fixed);
  const fast = rules.plow({ kind: 'skier', rides: 'ski' }, C.PLOW_SPEED + 80, fixed);
  assert.strictEqual(slow.clout, 100);
  assert.ok(fast.clout > slow.clout);
  assert.strictEqual(rules.plow({ kind: 'boarder', rides: 'board' }, 260, fixed).clout, -150);
});

test('radar Slow Zone: under the limit cools heat, over the limit pays clout and heat', () => {
  const under = rules.radar(20);
  assert.strictEqual(under.heat, -10);
  assert.strictEqual(under.clout, 0);
  const over = rules.radar(47);
  assert.strictEqual(over.over, 22);
  assert.strictEqual(over.clout, 110);
  assert.strictEqual(over.heat, 21);
  assert.match(over.text, /47 IN A 25/);
});

test('tricks: a clean switch 360 with a grab scores; over-rotation crashes', () => {
  const t = rules.trick({ spin: 350, grabT: 0.4, grabName: 'Indy', airT: 1, wasSwitch: true });
  assert.ok(t.ok);
  assert.strictEqual(t.half, 2);
  assert.strictEqual(t.name, 'Switch 360 Indy');
  assert.ok(t.pts > 0 && t.pts % 5 === 0);
  assert.strictEqual(rules.trick({ spin: 270, grabT: 0, grabName: '', airT: 1, wasSwitch: false }).ok, false);
});

test('grinds pay more the longer you slide, and switch pays more', () => {
  const short = rules.grind(0.2, 'Boardslide', false);
  const long = rules.grind(1, 'Boardslide', false);
  const sw = rules.grind(1, 'Boardslide', true);
  assert.ok(long.pts > short.pts && sw.pts > long.pts);
  assert.strictEqual(sw.name, 'Switch Boardslide');
});

test('butters: a quick lean scores nothing, a held tail press scores', () => {
  assert.strictEqual(rules.butter(0.2).pts, 0);
  assert.ok(rules.butter(1).pts > 0);
});

test('every zone and person used in content has the data it needs', () => {
  const { STATICS, ZONE_ODDS } = window.FS;
  for (const z of Object.keys(ZONE_ODDS)) assert.ok(ZONES[z], z);
  for (const z of Object.values(ZONES)) for (const t of Object.keys(z.weights)) if (t !== 'person' && t !== 'empty') assert.ok(STATICS[t], t);
});

test('spraying the Colorado tycoon pays big with no heat', () => {
  const r = rules.spray({ kind: 'snowcat', rides: 'none', tycoon: true }, 200, 10, 46, fixed);
  assert.strictEqual(r.clout, 500);
  assert.strictEqual(r.heat, 0);
});

test('plowing the whole shotski line pays triple', () => {
  const one = rules.plow({ kind: 'skier', rides: 'ski' }, 230, fixed);
  const line = rules.plow({ kind: 'shotski', rides: 'ski' }, 230, fixed);
  assert.strictEqual(line.clout, one.clout * 3);
});

test('liquid courage tightens the landing window', () => {
  const t = { spin: 225, grabT: 0, grabName: '', airT: 1, wasSwitch: false };
  assert.strictEqual(rules.trick(t, 55).ok, true);
  assert.strictEqual(rules.trick(t, 35).ok, false);
});

test('every pickup in a zone exists in PICKUPS', () => {
  const { PICKUPS } = window.FS;
  for (const z of Object.values(ZONES)) for (const k of Object.keys(z.pickups || {})) assert.ok(PICKUPS[k], k);
});

test('group chat roasts what you actually did first', () => {
  const lines = rules.chat({ homies: 2, plowed: 4, worstMph: 52, stashM: 0, shot: false }, 900, fixed);
  assert.strictEqual(lines.length, 3);
  assert.match(lines[0], /2 homies sprayed/);
  assert.match(lines[1], /4 skiers bowled/);
  assert.match(lines[2], /52 in a 25/);
});

test('the seeded random repeats for the same seed', () => {
  const a = mulberry32(42), b = mulberry32(42);
  for (let i = 0; i < 5; i++) assert.strictEqual(a(), b());
});

test('every person in a zone mix exists in PEOPLE', () => {
  for (const z of Object.values(ZONES)) for (const kind of Object.keys(z.people)) assert.ok(PEOPLE[kind], kind);
  assert.strictEqual(roll({ a: 1, b: 0 }, 0.5), 'a');
});
