// KidAI Easy: values.js
// Small helpers for values: turning them into text, comparing them, and "did you mean" spelling help.
'use strict';

// Damerau-Levenshtein distance: counts single-character edits plus adjacent transpositions.
// Used by closest() to power "did you mean?" suggestions for mistyped variable/recipe names.
function distance(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      // allow one transposition (e.g. "fro" → "for")
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[m][n];
}
// Returns the best match from options within edit-distance 1 (short words) or 2 (longer words), or null.
function closest(word, options) {
  let best = null, bestD = Infinity;
  for (const o of options) {
    const dd = distance(word, o);
    if (dd < bestD) { bestD = dd; best = o; }
  }
  const limit = word.length <= 3 ? 1 : 2;
  return bestD <= limit ? best : null;
}

// A picture value: 16 x 16 brightness numbers (0 = blank, 1 = ink) plus an optional preview image.
class Picture {
  constructor(pixels, thumb) { this.pixels = Array.from(pixels); this.thumb = thumb || null; }
}
const isRecord = (v) => v instanceof Map;

function fmtNumber(n) {
  if (!isFinite(n)) return n > 0 ? 'infinity' : (n < 0 ? '-infinity' : 'not a number');
  if (Number.isInteger(n)) return String(n);
  return String(parseFloat(n.toFixed(6)));
}
// toText: what "say x" prints — the value itself as a string (e.g. 3 → "3", yes → "yes").
function toText(v) {
  if (v === null || v === undefined) return 'nothing';
  if (typeof v === 'number') return fmtNumber(v);
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  if (Array.isArray(v)) return '[' + v.map(toText).join(', ') + ']';
  if (isRecord(v)) return '{' + Array.from(v.entries()).map(([k, x]) => k + ': ' + toText(x)).join(', ') + '}';
  if (v instanceof Picture) return 'a picture';
  if (typeof v === 'object' && v.kind === 'recipe') return 'recipe ' + v.raw;
  return String(v);
}
// describe: what appears in an error message — adds type context (e.g. 3 → "the number 3", "hi" → 'the text "hi"').
function describe(v) {
  if (typeof v === 'string') return 'the text "' + v + '"';
  if (typeof v === 'number') return 'the number ' + fmtNumber(v);
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  if (Array.isArray(v)) return 'a list';
  if (isRecord(v)) return 'a record';
  if (v instanceof Picture) return 'a picture';
  if (v === null || v === undefined) return 'nothing';
  return toText(v);
}
function looksNumeric(s) {
  return typeof s === 'string' && /^\s*-?\d+(\.\d+)?\s*$/.test(s);
}
// same: the equality check used by "is", "contains", and "remove". Case-insensitive for text;
// tolerates tiny floating-point errors for numbers; compares lists and records recursively.
function same(a, b) {
  if (typeof a === 'number' && looksNumeric(b)) b = parseFloat(b);
  if (typeof b === 'number' && looksNumeric(a)) a = parseFloat(a);
  if (typeof a === 'string' && typeof b === 'string') {
    return a.trim().toLowerCase() === b.trim().toLowerCase();
  }
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-9;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((x, i) => same(x, b[i]));
  }
  if (isRecord(a) && isRecord(b)) {
    return a.size === b.size && Array.from(a.keys()).every(k => b.has(k) && same(a.get(k), b.get(k)));
  }
  return a === b;
}
function describeToken(t) {
  if (!t) return 'the end of the line';
  if (t.t === 'str') return '"' + t.v + '"';
  if (t.t === 'num') return fmtNumber(t.v);
  return '"' + (t.raw || t.v) + '"';
}

module.exports = { toText, Picture, describeToken, closest, describe, looksNumeric, isRecord, same, fmtNumber };
