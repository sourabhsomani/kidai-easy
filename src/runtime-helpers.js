// KidAI Easy: runtime-helpers.js
// Built-in recipes (round, sqrt...), number checks, notes, safety limits and the "fast path" tests used by the interpreter.
'use strict';

const { KidError, SkipLoop, StopLoop } = require('./errors');
const { describe, looksNumeric, toText } = require('./values');

const BUILTINS = {
  round: (a) => { need(a, 1, 2, 'round'); const d = a[1] === undefined ? 0 : num(a[1], 'round'); const f = Math.pow(10, d); return Math.round(num(a[0], 'round') * f) / f; },
  number: (a) => { need(a, 1, 1, 'number'); const v = a[0]; if (typeof v === 'number') return v; if (looksNumeric(v)) return parseFloat(v); throw new KidError('I can\'t turn ' + describe(v) + ' into a number.', null, 'Only text like "42" can become a number.'); },
  text: (a) => { need(a, 1, 1, 'text'); return toText(a[0]); },
  uppercase: (a) => { need(a, 1, 1, 'uppercase'); return toText(a[0]).toUpperCase(); },
  lowercase: (a) => { need(a, 1, 1, 'lowercase'); return toText(a[0]).toLowerCase(); },
  sqrt: (a) => { need(a, 1, 1, 'sqrt'); return Math.sqrt(num(a[0], 'sqrt')); },
  abs: (a) => { need(a, 1, 1, 'abs'); return Math.abs(num(a[0], 'abs')); },
  join: (a) => a.map(toText).join('')
};
function need(a, min, max, name) {
  if (a.length < min || a.length > max) {
    throw new KidError(name + ' needs ' + (min === max ? min : min + ' or ' + max) + ' thing' + (max > 1 ? 's' : '') + ' inside the ( ), but got ' + a.length + '.', null, '');
  }
}
function num(v, what) {
  if (typeof v === 'number') return v;
  if (looksNumeric(v)) return parseFloat(v);
  throw new KidError(what + ' needs a number, but got ' + describe(v) + '.', null,
    'Use a number here, like 5.');
}

// "C", "C#", "Db", "C5", "a4" -> frequency in Hz (middle C is "C4")
function noteFreq(v, line) {
  if (typeof v === 'number') {
    if (v > 0 && v < 128 && Number.isInteger(v)) return 440 * Math.pow(2, (v - 69) / 12);
    throw new KidError('Notes are letters like "C", "D#" or "G5".', line, 'Try: play note "C"');
  }
  const m = /^\s*([a-gA-G])\s*([#b\u266F\u266D]?)\s*(-?\d)?\s*$/.exec(String(v));
  if (!m) throw new KidError('I don\'t know the note "' + v + '".', line, 'Notes are A B C D E F G, like "C", "F#" or "C5".');
  const base = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[m[1].toLowerCase()];
  const acc = m[2] === '#' || m[2] === '\u266F' ? 1 : (m[2] === 'b' || m[2] === '\u266D' ? -1 : 0);
  const oct = m[3] === undefined ? 4 : parseInt(m[3], 10);
  return 440 * Math.pow(2, ((oct + 1) * 12 + base + acc - 69) / 12);
}
const SOUNDS = ['pop', 'coin', 'jump', 'boom', 'laser', 'win', 'lose'];

// ---- speed helpers: most expressions and simple statements run without waiting
const NEED_ASYNC = { needAsync: true };
const LOOPS = new Set(['repeat', 'while', 'until', 'forever', 'foreach']);
const SYNC_KINDS = new Set(['val', 'list', 'name', 'and', 'or', 'not', 'neg', 'bin', 'contains', 'random', 'randitem', 'item', 'length',
  'record', 'field', 'touches', 'touchedge', 'keydown', 'turtlepos', 'spritepos', 'howsure', 'howaccurate', 'keys', 'split', 'join',
  'replace', 'starts', 'ends', 'stagepic']);
function isSyncExpr(e) {
  if (!e || !SYNC_KINDS.has(e.k)) return false;
  for (const key of Object.keys(e)) {
    const v = e[key];
    if (key === 'items') { if (!v.every(isSyncExpr)) return false; }
    else if (key === 'fields') { if (!v.every(f => isSyncExpr(f.e))) return false; }
    else if (v && typeof v === 'object' && typeof v.k === 'string' && !isSyncExpr(v)) return false;
  }
  return true;
}
function isFastStmt(s) {
  switch (s.type) {
    case 'say': case 'set': case 'change': return isSyncExpr(s.e);
    case 'if': return s.branches.every(b => isSyncExpr(b.cond));
    case 'stop': case 'skip': case 'comment': case 'blank': case 'use': return true;
  }
  return false;
}
function loopSignal(e) {
  if (e instanceof SkipLoop) return 'go';
  if (e instanceof StopLoop) return 'stop';
  throw e;
}

const STEP_LIMIT = 1000000;   // steps allowed without a "wait" — catches infinite loops
const DEPTH_LIMIT = 400;      // maximum recipe call depth — prevents infinite recursion

module.exports = { BUILTINS, num, NEED_ASYNC, LOOPS, isSyncExpr, isFastStmt, loopSignal, STEP_LIMIT, noteFreq, SOUNDS, DEPTH_LIMIT };
