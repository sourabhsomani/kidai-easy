// KidAI Easy: expressions.js
// How every expression gets its value (maths, comparisons, guess, item 1 of, recipe calls). Added to Interpreter.
'use strict';

const { EndProgram, GiveBack, Halted, KidError, StopLoop } = require('./errors');
const { STATEMENT_WORDS } = require('./words');
const { Picture, closest, describe, fmtNumber, isRecord, looksNumeric, same, toText } = require('./values');
const { normalizePicture } = require('./brain');
const { BUILTINS, DEPTH_LIMIT, NEED_ASYNC, isSyncExpr, num } = require('./runtime-helpers');

class ExpressionMethods {
  evalSync(e, scope) {
    const E = (x) => this.evalSync(x, scope);
    switch (e.k) {
      case 'val': return e.v;
      case 'list': return e.items.map(E);
      case 'name': {
        if (scope && scope.has(e.key)) return scope.get(e.key);
        if (this.globals.has(e.key)) return this.globals.get(e.key);
        if (this.recipes.has(e.key)) throw NEED_ASYNC;
        return this.lookup(e.key, scope, e.raw, e.line);
      }
      case 'and': return this.checkBool(E(e.a), e.a, 'and') ? this.checkBool(E(e.b), e.b, 'and') : false;
      case 'or': return this.checkBool(E(e.a), e.a, 'or') ? true : this.checkBool(E(e.b), e.b, 'or');
      case 'not': return !this.checkBool(E(e.a), e.a, 'not');
      case 'neg': return -num(E(e.a), 'minus');
      case 'bin': return this.binary(e, E(e.a), E(e.b));
      case 'contains': {
        const a = E(e.a), b = E(e.b);
        if (Array.isArray(a)) return a.some(x => same(x, b));
        if (isRecord(a)) return a.has(toText(b).toLowerCase());
        if (typeof a === 'string') return a.toLowerCase().includes(toText(b).toLowerCase());
        throw new KidError('"contains" works with lists and text, but got ' + describe(a) + '.', e.line, '');
      }
      case 'random': {
        let lo = num(E(e.lo), 'random'), hi = num(E(e.hi), 'random');
        if (lo > hi) { const t = lo; lo = hi; hi = t; }
        if (Number.isInteger(lo) && Number.isInteger(hi)) return lo + Math.floor(Math.random() * (hi - lo + 1));
        return lo + Math.random() * (hi - lo);
      }
      case 'randitem': {
        const l = E(e.list);
        if (!Array.isArray(l) || !l.length) throw new KidError('"random item from" needs a list with something in it.', e.line, '');
        return l[Math.floor(Math.random() * l.length)];
      }
      case 'item': {
        const idx = E(e.idx), l = E(e.list);
        if (typeof l === 'string') return Array.from(l)[this.index(idx, Array.from(l), e.line)];
        if (!Array.isArray(l)) throw new KidError('"item" needs a list or text, but got ' + describe(l) + '.', e.line, '');
        return l[this.index(idx, l, e.line)];
      }
      case 'length': {
        const v = E(e.a);
        if (Array.isArray(v)) return v.length;
        if (isRecord(v)) return v.size;
        if (typeof v === 'string') return Array.from(v).length;
        if (typeof v === 'number') return Array.from(fmtNumber(v)).length;
        throw new KidError('"length of" needs a list or text, but got ' + describe(v) + '.', e.line, '');
      }
      case 'record': { const m = new Map(); for (const f of e.fields) m.set(f.key, E(f.e)); return m; }
      case 'field': {
        const v = E(e.a);
        if (!isRecord(v)) throw new KidError('Only records have fields, but this is ' + describe(v) + '.', e.line, 'Records look like {name: "Tom", age: 3}');
        if (!v.has(e.key)) {
          const near = closest(e.key, Array.from(v.keys()));
          throw new KidError('This record has no field called "' + e.raw + '".', e.line,
            near ? 'Did you mean "' + near + '"?' : 'Its fields are: ' + (Array.from(v.keys()).join(', ') || 'none yet'));
        }
        return v.get(e.key);
      }
      case 'touches': {
        const a = this.getSprite(E(e.a), e.line), b = this.getSprite(E(e.b), e.line);
        if (!a.visible || !b.visible || a === b) return false;
        return Math.hypot(a.x - b.x, a.y - b.y) < (a.size + b.size) / 2 * 0.8;
      }
      case 'touchedge': {
        const a = this.getSprite(E(e.a), e.line), r = a.size / 2;
        return Math.abs(a.x) + r >= 200 || Math.abs(a.y) + r >= 200;
      }
      case 'keydown': {
        let k = toText(E(e.key)).toLowerCase();
        if (k === ' ') k = 'space';
        return !!(this.host.isKeyDown && this.host.isKeyDown(k));
      }
      case 'turtlepos': return Math.round((e.axis === 'x' ? this.turtle.x : this.turtle.y) * 1000) / 1000;
      case 'spritepos': { const sp = this.getSprite(E(e.name), e.line); return e.axis === 'x' ? sp.x : sp.y; }
      case 'howsure':
        if (this.lastSure === null) throw new KidError('The AI hasn\'t guessed anything yet.', e.line, 'Use guess "some words" first.');
        return this.lastSure;
      case 'howaccurate':
        if (this.lastAccuracy === null) throw new KidError('You haven\'t tested the AI yet.', e.line, 'Use test "label" with [...] first.');
        return this.lastAccuracy;
      case 'keys': {
        const v = E(e.a);
        if (!isRecord(v)) throw new KidError('"keys of" needs a record, but got ' + describe(v) + '.', e.line, '');
        return Array.from(v.keys());
      }
      case 'split': {
        const a = toText(E(e.a)), b = toText(E(e.b));
        return (b === '' ? Array.from(a) : a.split(b)).map(x => (looksNumeric(x) ? parseFloat(x) : x));
      }
      case 'join': {
        const a = E(e.a), b = toText(E(e.b));
        if (!Array.isArray(a)) throw new KidError('"join" needs a list, but got ' + describe(a) + '.', e.line, 'Like: join ["a", "b"] with ", "');
        return a.map(toText).join(b);
      }
      case 'replace': {
        const a = toText(E(e.a)), b = toText(E(e.b)), c = toText(E(e.c));
        return a ? c.split(a).join(b) : c;
      }
      case 'starts': case 'ends': {
        const a = toText(E(e.a)).toLowerCase(), b = toText(E(e.b)).toLowerCase();
        return e.k === 'starts' ? a.startsWith(b) : a.endsWith(b);
      }
      case 'stagepic': return new Picture(normalizePicture(this.raster, 32));
    }
    throw NEED_ASYNC;
  }

  async eval(e, scope) {
    if (e._s === undefined) e._s = isSyncExpr(e);
    if (e._s) {
      try { return this.evalSync(e, scope); } catch (x) { if (x !== NEED_ASYNC) throw x; }
    }
    switch (e.k) {
      case 'val': return e.v;
      case 'list': {
        const out = [];
        for (const x of e.items) out.push(await this.eval(x, scope));
        return out;
      }
      case 'name': {
        if (!this.has(e.key, scope) && this.recipes.has(e.key)) {
          return this.call({ k: 'call', key: e.key, raw: e.raw, args: [], line: e.line }, scope);
        }
        return this.lookup(e.key, scope, e.raw, e.line);
      }
      case 'call': return this.call(e, scope);
      case 'and': {
        const a = await this.condition(e.a, scope, 'and');
        return a ? this.condition(e.b, scope, 'and') : false;
      }
      case 'or': {
        const a = await this.condition(e.a, scope, 'or');
        return a ? true : this.condition(e.b, scope, 'or');
      }
      case 'not': return !(await this.condition(e.a, scope, 'not'));
      case 'neg': return -num(await this.eval(e.a, scope), 'minus');
      case 'contains': {
        const a = await this.eval(e.a, scope), b = await this.eval(e.b, scope);
        if (Array.isArray(a)) return a.some(x => same(x, b));
        if (isRecord(a)) return a.has(toText(b).toLowerCase());
        if (typeof a === 'string') return a.toLowerCase().includes(toText(b).toLowerCase());
        throw new KidError('"contains" works with lists and text, but got ' + describe(a) + '.', e.line, '');
      }
      case 'bin': return this.binary(e, await this.eval(e.a, scope), await this.eval(e.b, scope));
      case 'random': {
        let lo = num(await this.eval(e.lo, scope), 'random'), hi = num(await this.eval(e.hi, scope), 'random');
        if (lo > hi) { const t = lo; lo = hi; hi = t; }
        if (Number.isInteger(lo) && Number.isInteger(hi)) return lo + Math.floor(Math.random() * (hi - lo + 1));
        return lo + Math.random() * (hi - lo);
      }
      case 'randitem': {
        const l = await this.eval(e.list, scope);
        if (!Array.isArray(l) || !l.length) throw new KidError('"random item from" needs a list with something in it.', e.line, '');
        return l[Math.floor(Math.random() * l.length)];
      }
      case 'item': {
        const idx = await this.eval(e.idx, scope);
        let l = await this.eval(e.list, scope);
        if (typeof l === 'string') return Array.from(l)[this.index(idx, Array.from(l), e.line)];
        if (!Array.isArray(l)) throw new KidError('"item" needs a list or text, but got ' + describe(l) + '.', e.line, '');
        return l[this.index(idx, l, e.line)];
      }
      case 'length': {
        const v = await this.eval(e.a, scope);
        if (Array.isArray(v)) return v.length;
        if (isRecord(v)) return v.size;
        if (typeof v === 'string') return Array.from(v).length;
        if (typeof v === 'number') return Array.from(fmtNumber(v)).length;
        throw new KidError('"length of" needs a list or text, but got ' + describe(v) + '.', e.line, '');
      }
      case 'touches': {
        const a = this.getSprite(await this.eval(e.a, scope), e.line), b = this.getSprite(await this.eval(e.b, scope), e.line);
        if (!a.visible || !b.visible || a === b) return false;
        return Math.hypot(a.x - b.x, a.y - b.y) < (a.size + b.size) / 2 * 0.8;
      }
      case 'touchedge': {
        const a = this.getSprite(await this.eval(e.a, scope), e.line), r = a.size / 2;
        return Math.abs(a.x) + r >= 200 || Math.abs(a.y) + r >= 200;
      }
      case 'keydown': {
        let k = toText(await this.eval(e.key, scope)).toLowerCase();
        if (k === ' ') k = 'space';
        return !!(this.host.isKeyDown && this.host.isKeyDown(k));
      }
      case 'turtlepos':
        return Math.round((e.axis === 'x' ? this.turtle.x : this.turtle.y) * 1000) / 1000;
      case 'spritepos': {
        const sp = this.getSprite(await this.eval(e.name, scope), e.line);
        return e.axis === 'x' ? sp.x : sp.y;
      }
      case 'howsure':
        if (this.lastSure === null) throw new KidError('The AI hasn\'t guessed anything yet.', e.line, 'Use guess "some words" first.');
        return this.lastSure;
      case 'guess': {
        const x = await this.eval(e.a, scope);
        const g = this.aiGuess(x, e.line);
        this.lastSure = g.sure;
        if (this.host.ai) this.host.ai(Object.assign({ input: x instanceof Picture ? 'your picture' : toText(x), thumb: x instanceof Picture ? x.thumb : null, pixels: x instanceof Picture ? x.pixels : null }, g));
        return g.label;
      }
      case 'howaccurate':
        if (this.lastAccuracy === null) throw new KidError('You haven\'t tested the AI yet.', e.line, 'Use test "label" with [...] first.');
        return this.lastAccuracy;
      case 'predict': {
        const name = toText(await this.eval(e.name, scope));
        const x = num(await this.eval(e.x, scope), 'predict');
        const r = this.brain.predict(name, x);
        if (!r) throw new KidError('The AI hasn\'t learned anything called "' + name + '" yet.', e.line, 'Teach it first: learn "' + name + '" from [[1, 2], [2, 4]]');
        if (r.points.length < 2 || r.flat) throw new KidError('The AI needs at least two examples with different inputs to find a pattern.', e.line, 'Add more pairs, like [1, 2] and [2, 4].');
        this.lastSure = Math.round(r.r2 * 100);
        const out = Math.round(r.output * 100) / 100;
        if (this.host.aiPredict) this.host.aiPredict(Object.assign({ name, sure: this.lastSure }, r, { output: out }));
        return out;
      }
      case 'record': {
        const m = new Map();
        for (const f of e.fields) m.set(f.key, await this.eval(f.e, scope));
        return m;
      }
      case 'field': {
        const v = await this.eval(e.a, scope);
        if (!isRecord(v)) throw new KidError('Only records have fields, but this is ' + describe(v) + '.', e.line, 'Records look like {name: "Tom", age: 3}');
        if (!v.has(e.key)) {
          const near = closest(e.key, Array.from(v.keys()));
          throw new KidError('This record has no field called "' + e.raw + '".', e.line,
            near ? 'Did you mean "' + near + '"?' : 'Its fields are: ' + (Array.from(v.keys()).join(', ') || 'none yet'));
        }
        return v.get(e.key);
      }
      case 'keys': {
        const v = await this.eval(e.a, scope);
        if (!isRecord(v)) throw new KidError('"keys of" needs a record, but got ' + describe(v) + '.', e.line, '');
        return Array.from(v.keys());
      }
      case 'split': {
        const a = toText(await this.eval(e.a, scope)), b = toText(await this.eval(e.b, scope));
        return (b === '' ? Array.from(a) : a.split(b)).map(x => (looksNumeric(x) ? parseFloat(x) : x));
      }
      case 'join': {
        const a = await this.eval(e.a, scope), b = toText(await this.eval(e.b, scope));
        if (!Array.isArray(a)) throw new KidError('"join" needs a list, but got ' + describe(a) + '.', e.line, 'Like: join ["a", "b"] with ", "');
        return a.map(toText).join(b);
      }
      case 'replace': {
        const a = toText(await this.eval(e.a, scope)), b = toText(await this.eval(e.b, scope)), c = toText(await this.eval(e.c, scope));
        if (!a) return c;
        return c.split(a).join(b);
      }
      case 'starts': case 'ends': {
        const a = toText(await this.eval(e.a, scope)).toLowerCase(), b = toText(await this.eval(e.b, scope)).toLowerCase();
        return e.k === 'starts' ? a.startsWith(b) : a.endsWith(b);
      }
      case 'stagepic': return new Picture(normalizePicture(this.raster, 32));
      case 'load': {
        const key = toText(await this.eval(e.a, scope));
        const raw = await this.storage().get('data:' + key);
        return raw === null || raw === undefined ? null : this.constructor.fromStored(JSON.parse(raw));
      }
      case 'chat': {
        const q = toText(await this.eval(e.a, scope));
        if (!this.host.chat) {
          throw new KidError('chat needs a connection to a cloud AI, and there isn\'t one here.', e.line,
            'Ask a grown-up to set up the KidAI chat gateway, or try chat in the online playground.');
        }
        const reply = await this.host.chat(q);
        if (this.halted) throw new Halted();
        this.steps = 0;
        return toText(reply);
      }
    }
    throw new KidError('Something went wrong reading this line.', e.line, '');
  }

  binary(e, a, b) {
    const op = e.op;
    if (op === '=') return same(a, b);
    if (op === '!=') return !same(a, b);
    if (op === '+') {
      if (typeof a === 'number' && typeof b === 'number') return a + b;
      if (Array.isArray(a) && Array.isArray(b)) return a.concat(b);
      if (typeof a === 'string' || typeof b === 'string') return toText(a) + toText(b);
      throw new KidError('I can\'t add ' + describe(a) + ' and ' + describe(b) + '.', e.line, '');
    }
    if (op === '*' && typeof a === 'string' && typeof b === 'number' && Number.isInteger(b) && b >= 0 && b <= 1000) {
      return a.repeat(b);
    }
    if (['>', '<', '>=', '<='].includes(op)) {
      let x = a, y = b;
      if (typeof x === 'string' && typeof y === 'string' && !(looksNumeric(x) && looksNumeric(y))) {
        x = x.toLowerCase(); y = y.toLowerCase();
      } else {
        const sym = { '>': 'bigger than', '<': 'smaller than', '>=': 'at least', '<=': 'at most' }[op];
        if (!(typeof x === 'number' || looksNumeric(x)) || !(typeof y === 'number' || looksNumeric(y))) {
          throw new KidError('I can\'t tell if ' + describe(a) + ' is ' + sym + ' ' + describe(b) + '.', e.line,
            'Compare numbers with numbers, or text with text.');
        }
        x = num(x); y = num(y);
      }
      if (op === '>') return x > y;
      if (op === '<') return x < y;
      if (op === '>=') return x >= y;
      return x <= y;
    }
    const name = { '-': 'take away', '*': 'multiply', '/': 'divide', mod: 'mod' }[op];
    if (!(typeof a === 'number' || looksNumeric(a)) || !(typeof b === 'number' || looksNumeric(b))) {
      throw new KidError('I can only ' + name + ' numbers, but got ' + describe(typeof a === 'number' ? b : a) + '.', e.line,
        'Make sure both sides are numbers.');
    }
    const x = num(a), y = num(b);
    if (op === '-') return x - y;
    if (op === '*') return x * y;
    if (y === 0) throw new KidError('You can\'t divide by zero. Not even a computer can!', e.line, 'Use a number other than 0.');
    if (op === '/') return x / y;
    return ((x % y) + y) % y;
  }

  async call(e, scope) {
    const argv = [];
    for (const a of e.args) argv.push(await this.eval(a, scope));
    const r = this.recipes.get(e.key);
    if (!r) {
      if (BUILTINS[e.key]) {
        try { return BUILTINS[e.key](argv); } catch (err) { if (err instanceof KidError && !err.kidLine) err.kidLine = e.line; throw err; }
      }
      const near = closest(e.key, [...this.recipes.keys(), ...Object.keys(BUILTINS), ...STATEMENT_WORDS]);
      if (e.bare) {
        throw new KidError('I don\'t know how to "' + e.raw + '".', e.line,
          near ? 'Did you mean "' + near + '"?' : 'Start the line with an instruction like say, set or repeat.');
      }
      throw new KidError('I don\'t know a recipe called "' + e.raw + '".', e.line,
        near ? 'Did you mean "' + near + '"?' : 'Make it first with: define ' + e.raw + '(): ... end');
    }
    if (argv.length !== r.params.length) {
      const names = r.params.map(p => p.raw).join(', ');
      throw new KidError('"' + r.name.raw + '" needs ' + r.params.length + ' input' + (r.params.length === 1 ? '' : 's') +
        (names ? ' (' + names + ')' : '') + ', but got ' + argv.length + '.', e.line,
        'Like: ' + r.name.raw + '(' + r.params.map(p => p.raw).join(', ') + ')');
    }
    if (++this.depth > DEPTH_LIMIT) {
      this.depth = 0;
      throw new KidError('Your recipes called each other too many times.', e.line,
        'Check that a recipe that calls itself has a way to stop.');
    }
    const local = new Map();
    r.params.forEach((p, i) => local.set(p.key, argv[i]));
    this.frames.push({ name: r.name.raw, vars: local });
    try {
      await this.block(r.body, local);
      return null;
    } catch (err) {
      if (err instanceof GiveBack) return err.value;
      if (err instanceof StopLoop) throw new EndProgram();
      throw err;
    } finally {
      this.depth--;
      this.frames.pop();
    }
  }
}

module.exports = { ExpressionMethods };
