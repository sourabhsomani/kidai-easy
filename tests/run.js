// KidAI Easy test suite. Run with: npm test
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const KidAI = require(process.env.KIDAI_SRC ? '../src' : '../kidai.js');
const KidBlocks = require('../blocks.js');

let passed = 0, failed = 0;
const fail = (name, msg) => { failed++; console.log('FAIL ' + name + '\n  ' + String(msg).split('\n').join('\n  ')); };

function host(out, answers, extra) {
  const mem = new Map();
  return Object.assign({
    say: t => out.push(t),
    ask: async () => (answers.length ? answers.shift() : ''),
    storage: { get: k => (mem.has(k) ? mem.get(k) : null), set: (k, v) => mem.set(k, v) }
  }, extra || {});
}

async function behaviour() {
  const cases = require('./behavior.js');
  for (const [src, want, answers] of cases) {
    const out = [];
    let err = null;
    const it = new KidAI.Interpreter(host(out, (answers || []).slice()));
    try { await it.run(src); } catch (e) { err = e; }
    it.halt();
    const name = JSON.stringify(src).slice(0, 70);
    if (Array.isArray(want)) {
      if (err) fail(name, 'unexpected error: ' + err.message);
      else if (JSON.stringify(out) !== JSON.stringify(want)) fail(name, 'got ' + JSON.stringify(out) + ' wanted ' + JSON.stringify(want));
      else passed++;
    } else {
      if (!err) fail(name, 'expected an error containing "' + want.error + '" but it ran: ' + JSON.stringify(out));
      else if (!(err instanceof KidAI.KidError)) fail(name, 'not a kid-friendly error: ' + err.stack);
      else if (!err.message.includes(want.error)) fail(name, 'message "' + err.message + '" lacks "' + want.error + '"');
      else if (want.line && err.kidLine !== want.line) fail(name, 'line ' + err.kidLine + ' wanted ' + want.line);
      else if (!err.hint && !/line|Saving|Only records|is not in|recipe called|tested|guessed/.test(err.message) && false) fail(name, 'no tip');
      else passed++;
    }
  }
}

// Old programs must keep giving exactly the same output (41 programs from the kids' guide).
async function golden() {
  const progs = require('./golden/programs.json'), expected = require('./golden/expected.json');
  for (let i = 0; i < progs.length; i++) {
    let seed = 7;
    const realRandom = Math.random;
    Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const log = [], answers = progs[i].answers.slice();
    const h = {
      say: t => log.push('say:' + t), ask: async q => { if (!answers.length) throw new Error('out of answers'); const a = answers.shift(); log.push('ask:' + q); return a; },
      line: (...a) => log.push('line:' + a.map(x => (typeof x === 'number' ? x.toFixed(2) : x)).join(',')),
      circle: (...a) => log.push('circle:' + a.map(x => (typeof x === 'number' ? x.toFixed(2) : x)).join(',')),
      ai: g => log.push('ai:' + g.label + g.sure), clear: () => log.push('clear'), button: l => log.push('button:' + l), taught: () => {}
    };
    try { await new KidAI.Interpreter(h).run(progs[i].src); } catch (e) { log.push('error:' + (e.kidLine || '') + ':' + e.message + '|' + e.hint); }
    Math.random = realRandom;
    if (JSON.stringify(log) !== JSON.stringify(expected[i])) fail('golden #' + i, 'output changed\n' + progs[i].src.slice(0, 200));
    else passed++;
  }
}

// Text -> tidy text -> same program, and text -> blocks -> text -> same program.
const strip = (n) => JSON.stringify(n, (k, v) => (k === 'line' || k === 'bare' || k.startsWith('_') ? undefined : v));
// blocks keep the program's meaning; little words like "seconds" or "is bigger than" may come back in a shorter form
const stripB = (n) => JSON.stringify(n, (k, v) => (k === 'line' || k === 'bare' || k === 'unit' || k === 'word' || k.startsWith('_') ? undefined : v));
function roundTrip(src, name) {
  let a;
  try { a = KidAI.parse(src); } catch (e) { return; }
  try {
    const f = KidAI.format(src);
    if (strip(KidAI.parse(f)) !== strip(a)) return fail('format ' + name, src + '\n---\n' + f);
    if (KidAI.format(f) !== f) return fail('format stable ' + name, f);
    const r = KidBlocks.jsonToProgram(JSON.parse(JSON.stringify(KidBlocks.programToJson(KidAI.parse(src, { keepComments: true })))));
    if (r.problems.length) return fail('blocks ' + name, r.problems.join('; '));
    if (stripB(KidAI.parse(KidAI.printProgram(r.ast))) !== stripB(a)) return fail('blocks ' + name, src);
    KidAI.toCore(src);
    passed++;
  } catch (e) { fail('round trip ' + name, e.stack); }
}

// Random programs ("fuzzing") to check the printer, the parser and blocks agree.
function fuzz(count) {
  let seed = 12345;
  const rnd = (n) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  const pick = (a) => a[rnd(a.length)];
  const names = ['score', 'x', 'pet', 'item', 'my_list'];
  function ex(d) {
    if (d > 3) return pick(['1', '2.5', '"hi"', 'yes', 'nothing', 'score', 'x']);
    switch (rnd(22)) {
      case 0: return ex(d + 1) + ' + ' + ex(d + 1);
      case 1: return ex(d + 1) + ' * ' + ex(d + 1);
      case 2: return '(' + ex(d + 1) + ' - ' + ex(d + 1) + ')';
      case 3: return ex(d + 1) + ' is ' + ex(d + 1);
      case 4: return 'not ' + ex(d + 1);
      case 5: return ex(d + 1) + ' and ' + ex(d + 1);
      case 6: return 'random ' + ex(d + 1) + ' to ' + ex(d + 1);
      case 7: return 'item ' + ex(d + 1) + ' of ' + ex(d + 1);
      case 8: return 'length of ' + ex(d + 1);
      case 9: return '[' + ex(d + 1) + ', ' + ex(d + 1) + ']';
      case 10: return '{a: ' + ex(d + 1) + '}';
      case 11: return 'guess ' + ex(d + 1);
      case 12: return '-' + ex(d + 1);
      case 13: return ex(d + 1) + ' contains ' + ex(d + 1);
      case 14: return 'split ' + ex(d + 1) + ' by ' + ex(d + 1);
      case 15: return pick(names) + '.name';
      case 16: return 'f(' + ex(d + 1) + ')';
      case 17: return ex(d + 1) + ' mod ' + ex(d + 1);
      case 18: return ex(d + 1) + ' starts with ' + ex(d + 1);
      case 19: return 'x of sprite ' + ex(d + 1);
      case 20: return ex(d + 1) + ' or ' + ex(d + 1);
      default: return pick(['1', '"text"', 'score', 'how sure', 'x position', 'stage picture']);
    }
  }
  function st(d) {
    const pad = '  '.repeat(d);
    switch (rnd(d > 1 ? 9 : 13)) {
      case 0: return pad + 'say ' + ex(0);
      case 1: return pad + 'set ' + pick(names) + ' to ' + ex(0);
      case 2: return pad + 'change score by ' + ex(0);
      case 3: return pad + 'add ' + ex(0) + ' to my_list';
      case 4: return pad + 'forward ' + ex(0);
      case 5: return pad + 'move sprite ' + ex(0) + ' by ' + ex(0) + ', ' + ex(0);
      case 6: return pad + 'teach ' + ex(0) + ' with ' + ex(0);
      case 7: return pad + 'ask ' + ex(0) + ' into x';
      case 8: return pad + 'play note ' + ex(0) + ' for ' + ex(0);
      case 9: return pad + 'if ' + ex(0) + ':\n' + st(d + 1) + '\n' + pad + 'else if ' + ex(0) + ':\n' + st(d + 1) + '\n' + pad + 'else:\n' + st(d + 1) + '\n' + pad + 'end';
      case 10: return pad + 'repeat ' + ex(0) + ' times:\n' + st(d + 1) + '\n' + st(d + 1) + '\n' + pad + 'end';
      case 11: return pad + 'for each x in ' + ex(0) + ':\n' + st(d + 1) + '\n' + pad + 'end';
      default: return pad + 'repeat until ' + ex(0) + ':\n' + st(d + 1) + '\n' + pad + 'end';
    }
  }
  for (let i = 0; i < count; i++) {
    const lines = [];
    for (let j = 0; j < 1 + rnd(5); j++) lines.push(st(0));
    if (rnd(3) === 0) lines.unshift('define f(a):\n  give back a\nend');
    if (rnd(4) === 0) lines.push('# a note');
    roundTrip(lines.join('\n'), 'fuzz #' + i);
  }
}

// Static checker
function checker() {
  const cases = [
    ['say scroe', 'never set'],
    ['define f(a):\n  say a\nend\nf(1, 2)', 'needs 1 input'],
    ['nope(1)', 'recipe called'],
    ['give back 1', 'only works inside a recipe'],
    ['repeat forever:\n  forward 1\nend', 'never waits'],
    ['say "hi', 'closing quote']
  ];
  for (const [src, want] of cases) {
    const probs = KidAI.check(src);
    if (!probs.some(p => p.message.includes(want))) fail('check ' + JSON.stringify(src), 'no problem mentioning "' + want + '": ' + JSON.stringify(probs));
    else passed++;
  }
  if (KidAI.check('set x to 1\nsay x\ndefine f(a):\n  give back a\nend\nsay f(1)').length) fail('check clean', JSON.stringify(KidAI.check('set x to 1\nsay x')));
  else passed++;
}

// Hindi messages
async function hindi() {
  KidAI.setLanguage('hi');
  try { await new KidAI.Interpreter({}).run('say scroe'); fail('hindi', 'no error'); } catch (e) {
    if (!/नहीं पता/.test(e.message)) fail('hindi message', e.message); else passed++;
  } finally { KidAI.setLanguage('en'); }
}

// The stage window used by the kidai command (cli-stage.js), tested without a browser.
async function stageWindow() {
  process.env.KIDAI_NO_BROWSER = '1';
  const { createStage, needs, isColor } = require('../cli-stage.js');
  const ex = (f) => needs(KidAI.parse(fs.readFileSync(path.join(__dirname, '..', 'examples', f), 'utf8')));
  const check = (name, ok) => { if (ok) passed++; else fail('stage window: ' + name, 'not true'); };
  const game = ex('08_catch_the_stars_game.kid'), music = ex('09_twinkle_music.kid'), text = ex('03_times_table.kid');
  check('game needs the stage and keys', game.stage && game.keys && game.keyNames.join() === 'left,right');
  check('music needs sound', music.stage && music.sound);
  check('text programs stay in the terminal', !text.stage);
  check('colour names', isColor('midnightblue') && isColor('#33aa77') && isColor('rgb(1, 2, 3)') && !isColor('blurple'));
  const stage = createStage({ needsClick: true });
  const url = await stage.open();
  const get = (u) => fetch(u).then(r => r.status);
  const post = (msg) => fetch(url + 'input', { method: 'POST', body: JSON.stringify(msg) }).then(r => r.status);
  check('page loads', await get(url) === 200);
  check('wrong secret is refused', await get(url.replace(/\/\w+\/$/, '/nope/')) === 404);
  stage.line(0, 0, 10, 10, 'red', 3);
  const events = await fetch(url + 'events');
  const reader = events.body.getReader();
  const first = new TextDecoder().decode((await reader.read()).value) + new TextDecoder().decode((await reader.read()).value);
  check('a new window gets the drawing so far', /"t":"snapshot"/.test(first) && /"k":"line"/.test(first));
  await post({ t: 'ready' });
  await stage.ready;
  check('Start button lets the program begin', true);
  let pressed = null; stage.on('key', (k) => { pressed = k; });
  await post({ t: 'key', k: 'left', down: true });
  check('keys reach the program', pressed === 'left' && stage.keysDown.has('left'));
  await post({ t: 'key', k: 'left', down: false });
  check('released keys are let go', !stage.keysDown.has('left'));
  const pic = stage.askPicture('Draw a cat');
  check('a bad picture is refused', await post({ t: 'picture', id: 1, data: [1, 2] }) === 400);
  await post({ t: 'picture', id: 1, data: new Array(1024).fill(0.5) });
  const got = await pic;
  check('a drawing comes back as a picture', got.size === 32 && got.data.length === 1024);
  reader.cancel();
  stage.finish('finished');
}

(async () => {
  await stageWindow();
  await behaviour();
  await golden();
  const corpus = require('./golden/programs.json').map(p => p.src);
  for (const f of fs.readdirSync(path.join(__dirname, '..', 'examples'))) corpus.push(fs.readFileSync(path.join(__dirname, '..', 'examples', f), 'utf8'));
  corpus.forEach((src, i) => roundTrip(src, 'corpus #' + i));
  fuzz(800);
  checker();
  await hindi();
  // every example still parses
  for (const f of fs.readdirSync(path.join(__dirname, '..', 'examples'))) {
    try { KidAI.parse(fs.readFileSync(path.join(__dirname, '..', 'examples', f), 'utf8')); passed++; } catch (e) { fail('example ' + f, e.message); }
  }
  console.log((failed ? 'FAILED ' : 'All tests passed: ') + passed + ' passed, ' + failed + ' failed');
  process.exitCode = failed ? 1 : 0;
})();
