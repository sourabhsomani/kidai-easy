// KidAI Easy: interpreter.js
// Step 3: runs the program tree. This file has the main loop, variables, events and safety checks.
// The statement and expression methods live in statements.js and expressions.js and are added to the class at the bottom.
'use strict';

const { EndProgram, GiveBack, Halted, KidError, SkipLoop, StopLoop } = require('./errors');
const { Picture, closest, describe, isRecord, toText } = require('./values');
const { parse } = require('./parser');
const { TinyBrain } = require('./brain');
const { BUILTINS, LOOPS, NEED_ASYNC, STEP_LIMIT, isFastStmt, isSyncExpr, loopSignal, num } = require('./runtime-helpers');

class Interpreter {
  constructor(host) {
    this.host = host || {};
    this.globals = new Map();
    this.recipes = new Map();
    this.events = [];
    this.brain = new TinyBrain();
    this.lastSure = null;
    this.steps = 0;
    this.sinceYield = 0;
    this.halted = false;
    this.depth = 0;
    this.turtle = { x: 0, y: 0, heading: 0, down: true, color: 'black', size: 3, visible: true };
    this.queue = Promise.resolve();
    this.sprites = new Map();
    this.keyEvents = [];
    this.timers = [];
    this.frames = [];
    this.lastAccuracy = null;
    this.raster = new Array(32 * 32).fill(0);
    this.wrapHost();
  }

  // Keep a small 32 x 32 copy of the drawing so "stage picture" works everywhere (even in the terminal).
  wrapHost() {
    const h = this.host, R = this.raster;
    const cell = (x, y) => [Math.floor((x + 200) / 12.5), Math.floor((200 - y) / 12.5)];
    const stamp = (x, y, r) => {
      const [cx, cy] = cell(x, y), rc = Math.max(0.5, r / 12.5);
      for (let yy = Math.floor(cy - rc); yy <= Math.ceil(cy + rc); yy++) for (let xx = Math.floor(cx - rc); xx <= Math.ceil(cx + rc); xx++) {
        if (xx >= 0 && yy >= 0 && xx < 32 && yy < 32 && (xx - cx) * (xx - cx) + (yy - cy) * (yy - cy) <= rc * rc + 0.5) R[yy * 32 + xx] = 1;
      }
    };
    const line = (x1, y1, x2, y2, size) => {
      const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 4));
      for (let i = 0; i <= n; i++) stamp(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, Math.max(4, size / 2));
    };
    this.host = Object.assign(Object.create(h), {
      line: (x1, y1, x2, y2, color, size) => { line(x1, y1, x2, y2, size); if (h.line) h.line(x1, y1, x2, y2, color, size); },
      circle: (x, y, r, color, size, down) => {
        if (down) { for (let a = 0; a < 64; a++) stamp(x + r * Math.cos(a * Math.PI / 32), y + r * Math.sin(a * Math.PI / 32), Math.max(4, size / 2)); }
        else stamp(x, y, r);
        if (h.circle) h.circle(x, y, r, color, size, down);
      },
      rect: (x, y, w, hh, color) => {
        for (let yy = y - hh / 2; yy <= y + hh / 2; yy += 6) line(x - w / 2, yy, x + w / 2, yy, 6);
        if (h.rect) h.rect(x, y, w, hh, color);
      },
      clear: () => { R.fill(0); if (h.clear) h.clear(); }
    });
  }

  async readUses(program, seen) {
    for (const s of program.body) {
      if (s.type !== 'use') continue;
      const name = toText(await this.eval(s.e, null)).replace(/\.kid$/i, '');
      if (seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      const src = this.host.readFile ? await this.host.readFile(name) : null;
      if (src === null || src === undefined) {
        throw new KidError('I can\'t find the file "' + name + '".', s.line,
          'In the playground, make a project called ' + name + '. On a computer, put ' + name + '.kid next to this program.');
      }
      let other;
      try { other = parse(src); } catch (err) {
        if (err instanceof KidError) throw new KidError('There is a problem in "' + name + '" on line ' + err.kidLine + ': ' + err.message, s.line, err.hint);
        throw err;
      }
      await this.readUses(other, seen);
      for (const d of other.body) if (d.type === 'define') this.recipes.set(d.name.key, d);
    }
  }

  storage() {
    if (!this.host.storage) throw new KidError('Saving only works in the playground or the kidai command.', this.currentLine, '');
    return this.host.storage;
  }
  static toStored(v) {
    if (Array.isArray(v)) return v.map(Interpreter.toStored);
    if (isRecord(v)) return { $record: Array.from(v.entries()).map(([k, x]) => [k, Interpreter.toStored(x)]) };
    if (v instanceof Picture) return { $picture: v.pixels };
    return v;
  }
  static fromStored(v) {
    if (Array.isArray(v)) return v.map(Interpreter.fromStored);
    if (v && typeof v === 'object' && v.$record) return new Map(v.$record.map(([k, x]) => [k, Interpreter.fromStored(x)]));
    if (v && typeof v === 'object' && v.$picture) return new Picture(v.$picture);
    return v === undefined ? null : v;
  }

  // A picture of everything the program remembers right now (for the variables panel).
  snapshot() {
    const show = (v) => {
      if (typeof v === 'string') return '"' + v + '"';
      if (Array.isArray(v)) return '[' + v.map(show).join(', ') + ']';
      if (isRecord(v)) return '{' + Array.from(v.entries()).map(([k, x]) => k + ': ' + show(x)).join(', ') + '}';
      return toText(v);
    };
    const kind = (v) => (Array.isArray(v) ? 'list' : isRecord(v) ? 'record' : v instanceof Picture ? 'picture' : v === null || v === undefined ? 'nothing' : typeof v === 'string' ? 'text' : typeof v === 'number' ? 'number' : typeof v === 'boolean' ? 'yes/no' : 'thing');
    const rows = (m) => Array.from(m.entries()).map(([k, v]) => ({ name: k, value: show(v), kind: kind(v) }));
    return {
      globals: rows(this.globals),
      frames: this.frames.map(f => ({ name: f.name, vars: rows(f.vars) })),
      line: this.currentLine
    };
  }

  halt() { this.halted = true; }

  spriteList() { return Array.from(this.sprites.values()); }
  showSprites() { if (this.host.sprites) this.host.sprites(this.spriteList()); }
  getSprite(name, line) {
    const key = toText(name);
    const sp = this.sprites.get(key);
    if (!sp) {
      const near = closest(key.toLowerCase(), Array.from(this.sprites.keys()).map(k => k.toLowerCase()));
      throw new KidError('There is no sprite called "' + key + '" yet.', line,
        near ? 'Did you mean "' + near + '"?' : 'Make it first with: make sprite "' + key + '" as "⭐"');
    }
    return sp;
  }
  async sleep(secs) {
    const until = Date.now() + Math.max(0, Math.min(secs, 60)) * 1000;
    do {
      await new Promise(r => setTimeout(r, Math.max(0, Math.min(50, until - Date.now()))));
      if (this.halted) throw new Halted();
    } while (Date.now() < until);
    this.steps = 0;
  }

  pressKey(name) {
    const key = String(name).toLowerCase();
    const handlers = this.keyEvents.filter(ev => ev.key === key || ev.key === 'any');
    if (handlers.length) this.runHandlers(handlers);
    return handlers.length > 0;
  }

  startTimers() {
    for (const t of this.timers) {
      const tick = () => {
        if (this.halted) return;
        this.runHandlers([t]);
        setTimeout(tick, t.ms);
      };
      setTimeout(tick, t.ms);
    }
  }

  async run(source) {
    const program = parse(source);
    await this.readUses(program, new Set());
    for (const s of program.body) {
      if (s.type === 'define') {
        if (BUILTINS[s.name.key]) {
          throw new KidError('"' + s.name.raw + '" is already a built-in recipe.', s.line, 'Pick a different name for your recipe.');
        }
        this.recipes.set(s.name.key, s);
      }
    }
    this.drawTurtle();
    for (const s of program.body) {
      if (s.type === 'when') {
        const label = toText(await this.eval(s.label, null));
        this.events.push({ label, body: s.body });
        if (this.host.button) this.host.button(label, () => this.fire(label));
      }
    }
    for (const s of program.body) {
      if (s.type === 'whenkey') {
        let key = toText(await this.eval(s.key, null)).toLowerCase();
        if (key === ' ') key = 'space';
        this.keyEvents.push({ key, body: s.body });
      }
      if (s.type === 'every') {
        const secs = num(await this.eval(s.e, null), 'every');
        if (secs < 0.05) throw new KidError('"every" needs at least 0.05 seconds between turns.', s.line, 'Try: every 1 second:');
        this.timers.push({ ms: secs * 1000, body: s.body });
      }
    }
    if (this.keyEvents.length && this.host.listenKeys) this.host.listenKeys(this.keyEvents.map(k => k.key));
    try {
      await this.block(program.body.filter(s => !['define', 'when', 'whenkey', 'every', 'use'].includes(s.type)), null);
    } catch (e) {
      if (e instanceof Halted && this.stoppedAll) return { listening: false, stopped: true };
      if (!(e instanceof EndProgram || e instanceof StopLoop || e instanceof SkipLoop)) throw this.wrap(e);
    }
    if (!this.halted) this.startTimers();
    return { listening: this.events.length > 0 || this.keyEvents.length > 0 || this.timers.length > 0 };
  }

  fire(label) {
    return this.runHandlers(this.events.filter(ev => ev.label === label));
  }

  runHandlers(handlers) {
    this.queue = this.queue.then(async () => {
      for (const h of handlers) {
        if (this.halted) return;
        this.steps = 0;
        try {
          await this.block(h.body, null);
        } catch (e) {
          if (e instanceof EndProgram || e instanceof StopLoop) continue;
          if (e instanceof Halted) return;
          const err = this.wrap(e);
          if (this.host.error) this.host.error(err);
          this.halted = true;
          return;
        }
      }
    });
    return this.queue;
  }

  wrap(e) {
    if (e instanceof KidError) {
      if (!e.kidLine) e.kidLine = this.currentLine;
      return e;
    }
    if (e instanceof Halted || e instanceof GiveBack) return e;
    if (e instanceof RangeError) {
      return new KidError('Your recipes called each other too many times.', this.currentLine,
        'Check that a recipe that calls itself has a way to stop.');
    }
    return e;
  }

  // Runs before every step. Returns nothing normally, or a promise when the program should pause for a moment.
  tick(line) {
    this.currentLine = line;
    if (this.halted) throw new Halted();
    if (++this.steps > STEP_LIMIT) {
      const err = new KidError('This program used too many steps, so I stopped it safely.', line,
        'Look for a loop that never ends. If it should run forever, add "wait 0.1" inside it.');
      err.stepLimit = true;
      throw err;
    }
    let p = null;
    if (++this.sinceYield >= 400) {
      this.sinceYield = 0;
      p = new Promise(r => (typeof setImmediate === 'function' ? setImmediate(r) : setTimeout(r, 0)))
        .then(() => { if (this.halted) throw new Halted(); });
    }
    if (this.host.beforeStep) {
      const step = () => {
        const w = this.host.beforeStep(line, this);
        return w ? Promise.resolve(w).then(() => { if (this.halted) throw new Halted(); }) : null;
      };
      return p ? p.then(step) : step();
    }
    return p;
  }

  // Variable lookup: recipe-local scope first, then globals.
  // "direction" is a built-in read-only variable for the turtle's current heading.
  lookup(key, scope, raw, line) {
    if (scope && scope.has(key)) return scope.get(key);
    if (this.globals.has(key)) return this.globals.get(key);
    if (key === 'direction') return ((this.turtle.heading % 360) + 360) % 360;
    const known = [...this.globals.keys(), ...(scope ? scope.keys() : [])];
    const near = closest(key, known);
    throw new KidError('I don\'t know anything called "' + raw + '" yet.', line,
      near ? 'Did you mean "' + near + '"?' : 'Make it first with: set ' + raw + ' to ...');
  }
  // Variable assignment: if a local scope exists and already has the name, update it there;
  // if the name is new inside a recipe, create it locally; otherwise it belongs to globals.
  assign(key, value, scope) {
    if (scope && scope.has(key)) scope.set(key, value);
    else if (scope && !this.globals.has(key)) scope.set(key, value);
    else this.globals.set(key, value);
  }
  has(key, scope) { return (scope && scope.has(key)) || this.globals.has(key); }

  // Runs a list of statements. Stays synchronous (fast) until a statement needs to wait.
  block(stmts, scope, from) {
    for (let i = from || 0; i < stmts.length; i++) {
      const r = this.exec(stmts[i], scope);
      if (r) return r.then(() => this.block(stmts, scope, i + 1));
    }
    return null;
  }

  loopBody(body, scope) {
    let r;
    try { r = this.block(body, scope); } catch (e) { return loopSignal(e); }
    return r ? r.then(() => 'go', loopSignal) : 'go';
  }

  checkBool(v, e, word) {
    if (typeof v !== 'boolean') {
      throw new KidError('"' + word + '" needs a yes/no question, but got ' + describe(v) + '.', e.line || this.currentLine,
        'Ask a question like: score > 5   or   name is "Mira"');
    }
    return v;
  }
  cond(e, scope, word) {
    const v = this.ev(e, scope);
    return v instanceof Promise ? v.then(x => this.checkBool(x, e, word)) : this.checkBool(v, e, word);
  }
  // Evaluates fast when it can, otherwise returns a promise.
  ev(e, scope) {
    if (e._s === undefined) e._s = isSyncExpr(e);
    if (e._s) {
      try { return this.evalSync(e, scope); } catch (x) { if (x !== NEED_ASYNC) throw x; }
    }
    return this.eval(e, scope);
  }

  async condition(e, scope, word) {
    const v = await this.eval(e, scope);
    if (typeof v !== 'boolean') {
      throw new KidError('"' + word + '" needs a yes/no question, but got ' + describe(v) + '.', e.line || this.currentLine,
        'Ask a question like: score > 5   or   name is "Mira"');
    }
    return v;
  }

  exec(s, scope) {
    const w = this.tick(s.line);
    return w ? w.then(() => this.execBody(s, scope)) : this.execBody(s, scope);
  }
  // Two-speed execution: execFast runs simple statements (say, set, if with sync conditions)
  // without creating a Promise, keeping tight loops fast. If it turns out a statement needs
  // async work (e.g. ask, wait), it throws NEED_ASYNC and we fall back to execAsync.
  execBody(s, scope) {
    if (s._fast === undefined) s._fast = isFastStmt(s);
    if (s._fast) {
      try { return this.execFast(s, scope); } catch (x) {
        if (x !== NEED_ASYNC) throw x;
        s._fast = false; // permanently disable the fast path for this node
      }
    }
    if (LOOPS.has(s.type)) {
      // "too many steps" points at the innermost loop, which is where the problem usually is
      return this.execAsync(s, scope).catch((e) => { if (e && e.stepLimit && !e.atLoop) { e.kidLine = s.line; e.atLoop = true; } throw e; });
    }
    return this.execAsync(s, scope);
  }
  execFast(s, scope) {
    switch (s.type) {
      case 'say': { const v = this.evalSync(s.e, scope); if (this.host.say) this.host.say(toText(v)); return null; }
      case 'set': this.assign(s.name.key, this.evalSync(s.e, scope), scope); return null;
      case 'change': {
        const cur = this.lookup(s.name.key, scope, s.name.raw, s.line);
        const by = this.evalSync(s.e, scope);
        if (typeof cur !== 'number') {
          throw new KidError('I can only change numbers, but "' + s.name.raw + '" is ' + describe(cur) + '.', s.line,
            'Use set ' + s.name.raw + ' to ... instead.');
        }
        this.assign(s.name.key, cur + num(by, 'change'), scope);
        return null;
      }
      case 'if': {
        for (const b of s.branches) {
          if (this.checkBool(this.evalSync(b.cond, scope), b.cond, 'if')) return this.block(b.body, scope);
        }
        return s.otherwise ? this.block(s.otherwise, scope) : null;
      }
      case 'stop': throw new StopLoop();
      case 'skip': throw new SkipLoop();
      default: return null; // comment, blank, use
    }
  }

  aiGuess(x, line) {
    if (x instanceof Picture) {
      if (this.brain.pics.size < 2) {
        throw new KidError('The AI needs pictures for at least two different labels before it can guess a picture.', line,
          'Teach it two groups of pictures, like: teach "cat" with [cat1, cat2]  and  teach "dog" with [dog1, dog2]');
      }
      return this.brain.guessPicture(x);
    }
    if (this.brain.labels.size < 2) {
      throw new KidError('The AI needs examples for at least two different labels before it can guess.', line,
        'Teach it two groups, like: teach "happy" with [...]  and  teach "sad" with [...]');
    }
    return this.brain.guess(x);
  }

  index(v, list, line) {
    if (typeof v !== 'number' || !Number.isInteger(v)) {
      throw new KidError('Item numbers must be whole numbers, but got ' + describe(v) + '.', line, 'Like: item 1 of fruits');
    }
    if (v < 1 || v > list.length) {
      throw new KidError('There is no item ' + v + '. The list only has ' + list.length + ' item' + (list.length === 1 ? '' : 's') + '.', line,
        list.length > 1 ? 'Use a number from 1 to ' + list.length + '.' : list.length ? 'Use item 1.' : 'The list is empty. Add something first.');
    }
    return v - 1;
  }

  async slow() {
    const ms = this.host.moveDelay ? this.host.moveDelay() : 0;
    if (ms > 0) {
      await new Promise(r => setTimeout(r, ms));
      this.sinceYield = 0;
      if (this.halted) throw new Halted();
    }
  }

  drawTurtle() {
    if (this.host.turtle) this.host.turtle(this.turtle);
  }
}

// Add the statement and expression methods to the Interpreter class.
for (const methods of [require('./statements').StatementMethods, require('./expressions').ExpressionMethods]) {
  for (const name of Object.getOwnPropertyNames(methods.prototype)) {
    if (name !== 'constructor') Object.defineProperty(Interpreter.prototype, name, Object.getOwnPropertyDescriptor(methods.prototype, name));
  }
}

module.exports = { Interpreter };
