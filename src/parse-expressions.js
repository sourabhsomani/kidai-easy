// KidAI Easy: parse-expressions.js
// Step 2a: reads expressions (sums, comparisons, lists, records, recipe calls) from one line of tokens.
'use strict';

const { KidError } = require('./errors');
const { RESERVED, SOFT, softKeyword } = require('./words');
const { describeToken } = require('./values');

// Line wraps the token array from the tokenizer and provides a simple cursor API
// (peek/next/acceptWord/acceptOp) so the parser can consume tokens without index arithmetic.
class Line {
  constructor(toks, line) { this.toks = toks; this.pos = 0; this.line = line; }
  peek(o) { return this.toks[this.pos + (o || 0)]; }
  next() { return this.toks[this.pos++]; }
  atEnd() { return this.pos >= this.toks.length; }
  isWord(w, o) { const t = this.peek(o); return !!t && t.t === 'word' && t.v === w; }
  isOp(op, o) { const t = this.peek(o); return !!t && t.t === 'op' && t.v === op; }
  acceptWord() {
    const t = this.peek();
    if (t && t.t === 'word' && Array.prototype.includes.call(arguments, t.v)) { this.pos++; return t; }
    return null;
  }
  acceptOp(op) { if (this.isOp(op)) { this.pos++; return true; } return false; }
}
function expectWord(L, w, hint) {
  if (!L.acceptWord(w)) {
    throw new KidError('I expected the word "' + w + '" here, but found ' + describeToken(L.peek()) + '.',
      L.line, hint);
  }
}
function expectName(L, what) {
  const t = L.next();
  if (!t || t.t !== 'word') {
    throw new KidError('I expected a name for ' + what + ' here, but found ' + describeToken(t) + '.',
      L.line, 'Names are made of letters, like score or my_pet.');
  }
  if (RESERVED.has(t.v) && !SOFT.has(t.v)) {
    throw new KidError('"' + t.raw + '" is a special word in KidAI, so it can\'t be used as a name.',
      L.line, 'Pick another name, like my_' + t.v + '.');
  }
  return { key: t.v, raw: t.raw };
}
function finishLine(L) {
  L.acceptOp(':');
  if (!L.atEnd()) {
    throw new KidError('I didn\'t expect ' + describeToken(L.peek()) + ' here.', L.line,
      'Each instruction goes on its own line.');
  }
}
function blockOpen(L) {
  L.acceptOp(':');
  if (!L.atEnd()) {
    throw new KidError('I didn\'t expect ' + describeToken(L.peek()) + ' after the ":".', L.line,
      'Put the instructions on the next lines, then finish with end.');
  }
}

// ---- expressions
// Classic recursive-descent parser with explicit operator precedence levels:
//   expr → or → and → not → compare → contains → additive → mult → unary → atom
// Each level calls the next, so tighter-binding operators are parsed deeper in the call stack.
function expr(L) { return orExpr(L); }
function orExpr(L) {
  let a = andExpr(L);
  while (L.acceptWord('or')) a = { k: 'or', a, b: andExpr(L), line: L.line };
  return a;
}
function andExpr(L) {
  let a = notExpr(L);
  while (L.acceptWord('and')) a = { k: 'and', a, b: notExpr(L), line: L.line };
  return a;
}
function notExpr(L) {
  if (L.acceptWord('not')) return { k: 'not', a: notExpr(L), line: L.line };
  return compare(L);
}
function compare(L) {
  const a = containsExpr(L);
  const t = L.peek();
  if (t && t.t === 'op' && ['>', '<', '>=', '<=', '=', '!='].includes(t.v)) {
    L.next();
    return { k: 'bin', op: t.v, a, b: containsExpr(L), line: L.line };
  }
  if ((L.isWord('starts') || L.isWord('ends')) && L.isWord('with', 1)) {
    const which = L.next().v; L.next();
    return { k: which === 'starts' ? 'starts' : 'ends', a, b: containsExpr(L), line: L.line };
  }
  if (L.acceptWord('touches', 'touching')) {
    if (L.acceptWord('edge')) return { k: 'touchedge', a, line: L.line };
    return { k: 'touches', a, b: containsExpr(L), line: L.line };
  }
  if (L.acceptWord('is')) {
    let op = '=', word;
    if (L.acceptWord('not')) op = '!=';
    else if ((word = L.acceptWord('bigger', 'greater', 'more', 'larger', 'taller', 'older'))) {
      expectWord(L, 'than'); op = '>';
    } else if ((word = L.acceptWord('smaller', 'less', 'fewer', 'shorter', 'younger'))) {
      expectWord(L, 'than'); op = '<';
    }
    return { k: 'bin', op, a, b: containsExpr(L), line: L.line, word: word ? word.raw.toLowerCase() : undefined };
  }
  return a;
}
function containsExpr(L) {
  const a = additive(L);
  if (L.acceptWord('contains')) return { k: 'contains', a, b: additive(L), line: L.line };
  return a;
}
function additive(L) {
  let a = mult(L);
  for (;;) {
    if (L.acceptOp('+')) a = { k: 'bin', op: '+', a, b: mult(L), line: L.line };
    else if (L.acceptOp('-')) a = { k: 'bin', op: '-', a, b: mult(L), line: L.line };
    else return a;
  }
}
function mult(L) {
  let a = unary(L);
  for (;;) {
    if (L.acceptOp('*')) a = { k: 'bin', op: '*', a, b: unary(L), line: L.line };
    else if (L.acceptOp('/')) a = { k: 'bin', op: '/', a, b: unary(L), line: L.line };
    else if (L.acceptOp('mod') || L.acceptWord('mod')) a = { k: 'bin', op: 'mod', a, b: unary(L), line: L.line };
    else return a;
  }
}
function unary(L) {
  if (L.acceptOp('-')) return { k: 'neg', a: unary(L), line: L.line };
  let e = atom(L);
  while (L.isOp('.') && L.peek(1) && L.peek(1).t === 'word') {
    L.next();
    const f = L.next();
    e = { k: 'field', a: e, key: f.v, raw: f.raw, line: L.line };
  }
  return e;
}
function recordLit(L, line) {
  const fields = [];
  if (L.acceptOp('}')) return { k: 'record', fields, line };
  for (;;) {
    const t = L.next();
    if (!t || (t.t !== 'word' && t.t !== 'str')) {
      throw new KidError('I expected a field name here, but found ' + describeToken(t) + '.', line,
        'Records look like {name: "Tom", age: 3}');
    }
    if (!L.acceptOp(':')) throw new KidError('I expected a ":" after "' + (t.raw || t.v) + '".', line, 'Records look like {name: "Tom", age: 3}');
    fields.push({ key: String(t.t === 'word' ? t.v : t.v.toLowerCase()), raw: t.raw || t.v, e: expr(L) });
    if (L.acceptOp('}')) return { k: 'record', fields, line };
    if (!L.acceptOp(',')) throw new KidError('I expected a "," or "}" in this record, but found ' + describeToken(L.peek()) + '.', line, 'Records look like {name: "Tom", age: 3}');
  }
}
function args(L) {
  const list = [];
  if (L.acceptOp(')')) return list;
  for (;;) {
    list.push(expr(L));
    if (L.acceptOp(')')) return list;
    if (!L.acceptOp(',')) {
      throw new KidError('I expected a "," or ")" here, but found ' + describeToken(L.peek()) + '.',
        L.line, 'Separate things with commas and close with ), like greet("Mira", 10)');
    }
  }
}
function atom(L) {
  const t = L.next();
  const line = L.line;
  if (!t) {
    throw new KidError('This line stopped too early. I expected a value at the end.', line,
      'Add a number, some "text", or a variable name.');
  }
  if (t.t === 'num') return { k: 'val', v: t.v };
  if (t.t === 'str') return { k: 'val', v: t.v };
  if (t.t === 'op' && t.v === '{') return recordLit(L, line);
  if (t.t === 'word') {
    if (t.v === 'split') {
      const a = additive(L);
      expectWord(L, 'by', 'Use it like: split "a,b,c" by ","');
      return { k: 'split', a, b: additive(L), line };
    }
    let joinKeyword = t.v === 'join' && !L.isOp('(');
    if (t.v === 'join' && L.isOp('(')) {
      // join(a, b) is the helper; join (list) with ", " is the keyword form
      const save = L.pos;
      try { L.next(); args(L); joinKeyword = L.isWord('with'); } catch (err) { joinKeyword = false; }
      L.pos = save;
    }
    if (joinKeyword) {
      const a = additive(L);
      expectWord(L, 'with', 'Use it like: join fruits with ", "');
      return { k: 'join', a, b: additive(L), line };
    }
    if (t.v === 'replace') {
      const a = additive(L);
      expectWord(L, 'with', 'Use it like: replace "cat" with "dog" in sentence');
      const b = additive(L);
      expectWord(L, 'in', 'Use it like: replace "cat" with "dog" in sentence');
      return { k: 'replace', a, b, c: unary(L), line };
    }
    if (t.v === 'keys' && L.isWord('of')) { L.next(); return { k: 'keys', a: unary(L), line }; }
    if (t.v === 'stage' && L.isWord('picture')) { L.next(); return { k: 'stagepic', line }; }
    if (t.v === 'load') return { k: 'load', a: unary(L), line };
    if (t.v === 'chat') return { k: 'chat', a: additive(L), line };
    if (t.v === 'predict') {
      const name = additive(L);
      expectWord(L, 'for', 'Use it like: predict "plant" for 10');
      return { k: 'predict', name, x: additive(L), line };
    }
    if (t.v === 'how' && L.isWord('accurate')) { L.next(); return { k: 'howaccurate', line }; }
  }
  if (t.t === 'op' && t.v === '(') {
    const e = expr(L);
    if (!L.acceptOp(')')) throw new KidError('I expected a ")" to close the "(".', line, 'Add a ) at the right place.');
    return e;
  }
  if (t.t === 'op' && t.v === '[') {
    const items = [];
    if (!L.acceptOp(']')) {
      for (;;) {
        items.push(expr(L));
        if (L.acceptOp(']')) break;
        if (!L.acceptOp(',')) {
          throw new KidError('I expected a "," or "]" in this list, but found ' + describeToken(L.peek()) + '.',
            line, 'Lists look like ["apple", "banana", "mango"]');
        }
      }
    }
    return { k: 'list', items, line };
  }
  if (t.t === 'word') {
    switch (t.v) {
      case 'yes': case 'true': return { k: 'val', v: true };
      case 'no': case 'false': return { k: 'val', v: false };
      case 'nothing': return { k: 'val', v: null };
      case 'random':
        if (L.isWord('item') && L.isWord('from', 1)) {
          L.next(); L.next();
          return { k: 'randitem', list: unary(L), line };
        }
        {
          const lo = additive(L);
          expectWord(L, 'to', 'Random numbers look like: random 1 to 10');
          return { k: 'random', lo, hi: additive(L), line };
        }
      case 'item': {
        if (!softKeyword(L)) return { k: 'name', key: t.v, raw: t.raw, line };
        const idx = additive(L);
        expectWord(L, 'of', 'Use it like: item 1 of fruits');
        return { k: 'item', idx, list: unary(L), line };
      }
      case 'length':
        if (!softKeyword(L)) return { k: 'name', key: t.v, raw: t.raw, line };
        L.acceptWord('of');
        return { k: 'length', a: unary(L), line };
      case 'key': {
        if (!softKeyword(L)) return { k: 'name', key: t.v, raw: t.raw, line };
        const key = additive(L);
        expectWord(L, 'is', 'Use it like: if key "left" is pressed:');
        if (!L.acceptWord('pressed', 'down')) expectWord(L, 'pressed', 'Use it like: if key "left" is pressed:');
        return { k: 'keydown', key, line };
      }
      case 'x': case 'y':
        if (L.isWord('position')) { L.next(); return { k: 'turtlepos', axis: t.v, line }; }
        if (L.isWord('of') && L.isWord('sprite', 1)) { L.next(); L.next(); return { k: 'spritepos', axis: t.v, name: unary(L), line }; }
        break;
      case 'how':
        expectWord(L, 'sure', 'Use: how sure');
        return { k: 'howsure', line };
      case 'guess':
        return { k: 'guess', a: additive(L), line };
    }
    if (RESERVED.has(t.v)) {
      throw new KidError('I didn\'t expect the word "' + t.raw + '" here.', line,
        '"' + t.raw + '" is a special word. Check the order of words on this line.');
    }
    if (L.acceptOp('(')) return { k: 'call', key: t.v, raw: t.raw, args: args(L), line };
    return { k: 'name', key: t.v, raw: t.raw, line };
  }
  throw new KidError('I didn\'t expect ' + describeToken(t) + ' here.', line,
    'Check this line for a missing value or an extra symbol.');
}

module.exports = { Line, expectWord, expectName, finishLine, blockOpen, expr, additive };
