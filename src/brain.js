// KidAI Easy: brain.js
// The tiny offline AI: words (naive Bayes), pictures (nearest neighbours) and numbers (straight-line fit).
'use strict';

const { toText } = require('./values');

// Split any value into an array of lowercase words/numbers for the text classifier.
function words(text) {
  return toText(text).toLowerCase().match(/[\p{L}\p{N}']+/gu) || [];
}
// Turn any ink grid (size x size, 0..1) into a 16 x 16 picture centred on the ink.
// Steps: (1) find the bounding box of all inked pixels, (2) crop + scale to a square 16×16 grid
// using area-averaging, (3) apply a light blur so small drawing differences don't hurt accuracy.
function normalizePicture(data, size) {
  let x0 = size, y0 = size, x1 = -1, y1 = -1;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (data[y * size + x] > 0.15) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  const out = new Array(256).fill(0);
  if (x1 < 0) return out; // blank canvas
  const w = x1 - x0 + 1, h = y1 - y0 + 1, side = Math.max(w, h);
  const ox = x0 - (side - w) / 2, oy = y0 - (side - h) / 2;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    let sum = 0, n = 0;
    const sx0 = ox + (x / 16) * side, sx1 = ox + ((x + 1) / 16) * side, sy0 = oy + (y / 16) * side, sy1 = oy + ((y + 1) / 16) * side;
    for (let sy = Math.floor(sy0); sy < Math.max(Math.floor(sy0) + 1, Math.ceil(sy1)); sy++) {
      for (let sx = Math.floor(sx0); sx < Math.max(Math.floor(sx0) + 1, Math.ceil(sx1)); sx++) {
        if (sx >= 0 && sy >= 0 && sx < size && sy < size) sum += data[sy * size + sx];
        n++;
      }
    }
    out[y * 16 + x] = n ? Math.min(1, sum / n) : 0;
  }
  // a little blur so nearly-the-same drawings look alike
  const blur = out.slice();
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    let s = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const yy = y + dy, xx = x + dx;
      if (yy >= 0 && xx >= 0 && yy < 16 && xx < 16) { s += out[yy * 16 + xx] * (dx || dy ? 0.5 : 1); n += dx || dy ? 0.5 : 1; }
    }
    blur[y * 16 + x] = s / n;
  }
  return blur;
}
// Cosine similarity between two pixel vectors: 1 = identical, 0 = nothing in common.
// Used by guessPicture to rank how closely a drawn picture matches each stored example.
function cosine(a, b) {
  let ab = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i++) { ab += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; }
  return aa && bb ? ab / Math.sqrt(aa * bb) : 0;
}

// TinyBrain holds three independent AI models in one object:
//   labels  → naive Bayes text classifier (teach / guess)
//   pics    → k-nearest-neighbour picture classifier (teachPictures / guessPicture)
//   numbers → simple linear regression (learn / predict)
class TinyBrain {
  constructor() { this.labels = new Map(); this.pics = new Map(); this.numbers = new Map(); }
  teachPictures(label, pics) {
    const key = toText(label);
    if (!this.pics.has(key)) this.pics.set(key, []);
    for (const p of pics) this.pics.get(key).push(p.pixels);
  }
  pictureCount() { let n = 0; for (const v of this.pics.values()) n += v.length; return n; }
  // k-NN picture classifier: finds the 5 closest stored examples by cosine similarity,
  // then converts their distances to soft votes via exp() so the result is a probability.
  guessPicture(pic) {
    const all = [];
    for (const [label, list] of this.pics) for (const v of list) all.push({ label, sim: cosine(pic.pixels, v) });
    all.sort((a, b) => b.sim - a.sim);
    const k = Math.min(5, all.length);
    const votes = new Map();
    for (const label of this.pics.keys()) votes.set(label, 0.0001);
    for (let i = 0; i < k; i++) votes.set(all[i].label, votes.get(all[i].label) + Math.exp(12 * (all[i].sim - 1)));
    let total = 0; for (const v of votes.values()) total += v;
    const scores = Array.from(votes.entries()).map(([label, v]) => ({ label, p: v / total })).sort((a, b) => b.p - a.p);
    return {
      label: scores[0].label, sure: Math.round(scores[0].p * 100),
      scores: scores.map(x => ({ label: x.label, sure: Math.round(x.p * 100) })),
      knownWords: ['picture'], examples: this.pictureCount(), labelCount: this.pics.size, picture: true,
      closest: all.slice(0, 3).map(x => ({ label: x.label, alike: Math.round(Math.max(0, x.sim) * 100) })),
      reasons: []
    };
  }
  learn(name, pairs) {
    const key = toText(name);
    if (!this.numbers.has(key)) this.numbers.set(key, []);
    for (const p of pairs) this.numbers.get(key).push(p);
  }
  // Ordinary-least-squares linear regression on the stored [input, output] pairs.
  // Returns slope, intercept, r² (how well a straight line fits), and the predicted output for x.
  predict(name, x) {
    const pts = this.numbers.get(toText(name));
    if (!pts) return null;
    const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
    let sxx = 0, sxy = 0, syy = 0;
    for (const [px, py] of pts) { sxx += (px - mx) * (px - mx); sxy += (px - mx) * (py - my); syy += (py - my) * (py - my); }
    const slope = sxx ? sxy / sxx : 0, intercept = my - slope * mx;
    let res = 0; for (const [px, py] of pts) res += Math.pow(py - (slope * px + intercept), 2);
    const r2 = syy ? Math.max(0, 1 - res / syy) : 1;
    return { slope, intercept, r2, points: pts.slice(), input: x, output: slope * x + intercept, flat: !sxx };
  }
  toJSON() {
    return {
      labels: Array.from(this.labels.entries()).map(([k, L]) => [k, { examples: L.examples, total: L.total, counts: Array.from(L.counts.entries()) }]),
      pics: Array.from(this.pics.entries()),
      numbers: Array.from(this.numbers.entries())
    };
  }
  static fromJSON(o) {
    const b = new TinyBrain();
    for (const [k, L] of o.labels || []) b.labels.set(k, { examples: L.examples, total: L.total, counts: new Map(L.counts) });
    for (const [k, v] of o.pics || []) b.pics.set(k, v);
    for (const [k, v] of o.numbers || []) b.numbers.set(k, v);
    return b;
  }
  teach(label, examples) {
    const key = toText(label);
    if (!this.labels.has(key)) this.labels.set(key, { examples: 0, counts: new Map(), total: 0 });
    const L = this.labels.get(key);
    for (const ex of examples) {
      L.examples++;
      for (const w of words(ex)) {
        L.counts.set(w, (L.counts.get(w) || 0) + 1);
        L.total++;
      }
    }
  }
  exampleCount() { let n = 0; for (const L of this.labels.values()) n += L.examples; return n; }
  // Naive Bayes text classifier with Laplace (add-1) smoothing.
  // Scores each label by log(prior) + sum of log(P(word|label)) for words seen in training,
  // then converts log-scores to probabilities with softmax.
  guess(text) {
    const ws = words(text);
    const vocab = new Set();
    for (const L of this.labels.values()) for (const w of L.counts.keys()) vocab.add(w);
    const V = vocab.size + 1; // +1 for Laplace smoothing denominator
    const totalEx = this.exampleCount();
    const known = ws.filter(w => vocab.has(w));
    const scores = [];
    for (const [label, L] of this.labels) {
      let s = Math.log(L.examples / totalEx); // log prior
      for (const w of known) s += Math.log(((L.counts.get(w) || 0) + 1) / (L.total + V)); // log likelihood
      scores.push({ label, s });
    }
    const max = Math.max.apply(null, scores.map(x => x.s));
    let sum = 0;
    for (const x of scores) { x.p = Math.exp(x.s - max); sum += x.p; }
    for (const x of scores) x.p /= sum;
    scores.sort((a, b) => b.p - a.p);
    const winner = this.labels.get(scores[0].label);
    const reasons = [];
    for (const w of Array.from(new Set(known))) {
      const pw = ((winner.counts.get(w) || 0) + 1) / (winner.total + V);
      let best = 0;
      for (const [lab, L] of this.labels) if (lab !== scores[0].label) best = Math.max(best, ((L.counts.get(w) || 0) + 1) / (L.total + V));
      const push = Math.log(pw / best);
      if (push > 0.05) reasons.push({ word: w, push: Math.round(push * 10) / 10 });
    }
    reasons.sort((a, b) => b.push - a.push);
    return {
      reasons: reasons.slice(0, 4),
      label: scores[0].label,
      sure: Math.round(scores[0].p * 100),
      scores: scores.map(x => ({ label: x.label, sure: Math.round(x.p * 100) })),
      knownWords: known,
      examples: totalEx,
      labelCount: this.labels.size
    };
  }
}

module.exports = { normalizePicture, TinyBrain };
