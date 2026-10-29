// KidAI Easy: statements.js
// What every statement does (say, set, repeat, forward, teach, make sprite...). Added to Interpreter.
'use strict';

const { GiveBack, Halted, KidError, SkipLoop, StopLoop } = require('./errors');
const { Picture, describe, isRecord, looksNumeric, same, toText } = require('./values');
const { TinyBrain, normalizePicture } = require('./brain');
const { SOUNDS, noteFreq, num } = require('./runtime-helpers');

class StatementMethods {
  async execAsync(s, scope) {
    const T = this.turtle;
    switch (s.type) {
      case 'say': {
        const v = await this.eval(s.e, scope);
        if (this.host.say) this.host.say(toText(v));
        return;
      }
      case 'set':
        this.assign(s.name.key, await this.eval(s.e, scope), scope);
        return;
      case 'setitem': {
        const list = this.lookup(s.name.key, scope, s.name.raw, s.line);
        if (!Array.isArray(list)) throw new KidError('"' + s.name.raw + '" is not a list.', s.line, '');
        const i = this.index(await this.eval(s.idx, scope), list, s.line);
        list[i] = await this.eval(s.e, scope);
        return;
      }
      case 'change': {
        const cur = this.lookup(s.name.key, scope, s.name.raw, s.line);
        const by = await this.eval(s.e, scope);
        if (typeof cur !== 'number') {
          throw new KidError('I can only change numbers, but "' + s.name.raw + '" is ' + describe(cur) + '.', s.line,
            'Use set ' + s.name.raw + ' to ... instead.');
        }
        this.assign(s.name.key, cur + num(by, 'change'), scope);
        return;
      }
      case 'add': {
        const v = await this.eval(s.e, scope);
        if (!this.has(s.name.key, scope)) {
          throw new KidError('I don\'t know anything called "' + s.name.raw + '" yet.', s.line,
            'Make an empty list first: set ' + s.name.raw + ' to []');
        }
        const target = this.lookup(s.name.key, scope, s.name.raw, s.line);
        if (Array.isArray(target)) target.push(v);
        else if (typeof target === 'number') this.assign(s.name.key, target + num(v, 'add'), scope);
        else throw new KidError('I can only add to a list or a number, but "' + s.name.raw + '" is ' + describe(target) + '.', s.line, '');
        return;
      }
      case 'remove': {
        const v = await this.eval(s.e, scope);
        const list = this.lookup(s.name.key, scope, s.name.raw, s.line);
        if (!Array.isArray(list)) throw new KidError('"' + s.name.raw + '" is not a list.', s.line, '');
        const i = list.findIndex(x => same(x, v));
        if (i < 0) throw new KidError(toText(v) + ' is not in ' + s.name.raw + '.', s.line, 'Check with: if ' + s.name.raw + ' contains ...');
        list.splice(i, 1);
        return;
      }
      case 'ask': {
        const q = toText(await this.eval(s.e, scope));
        if (!this.host.ask) throw new KidError('This place can\'t ask questions.', s.line, '');
        let a = await this.host.ask(q);
        if (this.halted) throw new Halted();
        if (a === null || a === undefined) a = '';
        if (looksNumeric(a)) a = parseFloat(a);
        this.assign(s.name.key, a, scope);
        this.steps = 0;
        return;
      }
      case 'if': {
        for (const b of s.branches) {
          if (await this.condition(b.cond, scope, 'if')) { await this.block(b.body, scope); return; }
        }
        if (s.otherwise) await this.block(s.otherwise, scope);
        return;
      }
      case 'repeat': {
        const n = await this.eval(s.count, scope);
        if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) {
          throw new KidError('repeat needs a whole number of times, but got ' + describe(n) + '.', s.line,
            'Use a number like 3 or 10.');
        }
        for (let i = 0; i < n; i++) {
          let r = this.loopBody(s.body, scope);
          if (r instanceof Promise) r = await r;
          if (r === 'stop') break;
        }
        return;
      }
      case 'while': case 'until': case 'forever':
        for (;;) {
          if (s.type !== 'forever') {
            let c = this.cond(s.cond, scope, s.type === 'while' ? 'repeat while' : 'repeat until');
            if (c instanceof Promise) c = await c;
            if (s.type === 'while' ? !c : c) break;
          }
          let r = this.loopBody(s.body, scope);
          if (r instanceof Promise) r = await r;
          if (r === 'stop') break;
          const w = this.tick(s.line);
          if (w) await w;
        }
        return;
      case 'foreach': {
        let list = await this.eval(s.list, scope);
        if (typeof list === 'string') list = Array.from(list);
        if (isRecord(list)) list = Array.from(list.keys());
        if (!Array.isArray(list)) {
          throw new KidError('"for each" needs a list, but got ' + describe(list) + '.', s.line,
            'Lists look like ["red", "green", "blue"]');
        }
        for (const item of list.slice()) {
          this.assign(s.name.key, item, scope);
          let r = this.loopBody(s.body, scope);
          if (r instanceof Promise) r = await r;
          if (r === 'stop') break;
        }
        return;
      }
      case 'giveback':
        if (!scope) throw new KidError('"give back" only works inside a recipe (define ... end).', s.line, '');
        throw new GiveBack(s.e ? await this.eval(s.e, scope) : null);
      case 'stop': throw new StopLoop();
      case 'stopall':
        this.halted = true;
        this.stoppedAll = true;
        if (this.host.stopped) this.host.stopped();
        throw new Halted();
      case 'note': {
        const nv = await this.eval(s.e, scope);
        const f = noteFreq(nv, s.line);
        const d = s.dur ? num(await this.eval(s.dur, scope), 'play note') : 0.4;
        if (d < 0 || d > 10) throw new KidError('A note can last from 0 to 10 seconds.', s.line, 'Try: play note "C" for 0.5 seconds');
        if (this.host.note) this.host.note(f, d, toText(nv));
        await this.sleep(d);
        return;
      }
      case 'beep':
        if (this.host.note) this.host.note(880, 0.15, 'beep');
        await this.sleep(0.15);
        return;
      case 'sound': {
        const name = toText(await this.eval(s.e, scope)).toLowerCase();
        if (!SOUNDS.includes(name)) {
          throw new KidError('I don\'t know the sound "' + name + '".', s.line, 'Try one of: ' + SOUNDS.join(', '));
        }
        if (this.host.sound) this.host.sound(name);
        return;
      }
      case 'write':
        if (this.host.write) this.host.write(toText(await this.eval(s.e, scope)), T.x, T.y, T.color, Math.max(8, T.size * 6), T.heading);
        return;
      case 'background': {
        const c = toText(await this.eval(s.e, scope));
        if (this.host.checkColor && !this.host.checkColor(c)) {
          throw new KidError('I don\'t know the color "' + c + '".', s.line, 'Try "skyblue", "black", "lightgreen" or "#223344".');
        }
        if (this.host.background) this.host.background(c);
        return;
      }
      case 'dot': {
        const r = Math.abs(num(await this.eval(s.e, scope), 'dot'));
        if (this.host.circle) this.host.circle(T.x, T.y, r, T.color, T.size, false);
        return;
      }
      case 'rect': {
        const w = num(await this.eval(s.w, scope), 'rectangle'), h = num(await this.eval(s.h, scope), 'rectangle');
        if (this.host.rect) this.host.rect(T.x, T.y, Math.abs(w), Math.abs(h), T.color);
        return;
      }
      case 'turnto':
        T.heading = num(await this.eval(s.e, scope), 'turn to') % 360;
        this.drawTurtle();
        return;
      case 'sprite': {
        const name = toText(await this.eval(s.name, scope));
        const look = toText(await this.eval(s.look, scope));
        let sp = this.sprites.get(name);
        if (!sp) { sp = { name, look, x: 0, y: 0, size: 50, visible: true }; this.sprites.set(name, sp); }
        sp.look = look;
        if (s.x) { sp.x = num(await this.eval(s.x, scope), 'make sprite'); sp.y = num(await this.eval(s.y, scope), 'make sprite'); }
        if (s.size) sp.size = Math.max(5, Math.min(400, num(await this.eval(s.size, scope), 'size')));
        this.showSprites();
        return;
      }
      case 'movesprite': {
        const sp = this.getSprite(await this.eval(s.name, scope), s.line);
        const x = num(await this.eval(s.x, scope), 'move sprite'), y = num(await this.eval(s.y, scope), 'move sprite');
        if (s.by) { sp.x += x; sp.y += y; } else { sp.x = x; sp.y = y; }
        this.showSprites();
        return;
      }
      case 'spritevis': {
        const sp = this.getSprite(await this.eval(s.name, scope), s.line);
        sp.visible = s.show;
        this.showSprites();
        return;
      }
      case 'deletesprite': {
        const sp = this.getSprite(await this.eval(s.name, scope), s.line);
        this.sprites.delete(sp.name);
        this.showSprites();
        return;
      }
      case 'skip': throw new SkipLoop();
      case 'wait': {
        const secs = num(await this.eval(s.e, scope), 'wait');
        const ms = Math.max(0, Math.min(secs, 60)) * 1000;
        if (this.host.flush) this.host.flush();
        await this.sleep(ms / 1000);
        return;
      }
      case 'move': {
        const d = num(await this.eval(s.e, scope), 'forward') * s.dir;
        const rad = T.heading * Math.PI / 180;
        const nx = T.x + d * Math.sin(rad), ny = T.y + d * Math.cos(rad);
        if (T.down && this.host.line) this.host.line(T.x, T.y, nx, ny, T.color, T.size);
        T.x = nx; T.y = ny;
        this.drawTurtle();
        await this.slow();
        return;
      }
      case 'turn':
        T.heading = (T.heading + s.dir * num(await this.eval(s.e, scope), 'turn')) % 360;
        this.drawTurtle();
        return;
      case 'pen': T.down = s.down; return;
      case 'pensize': T.size = Math.max(0.5, Math.min(100, num(await this.eval(s.e, scope), 'pen size'))); return;
      case 'color': {
        const c = toText(await this.eval(s.e, scope));
        if (this.host.checkColor && !this.host.checkColor(c)) {
          throw new KidError('I don\'t know the color "' + c + '".', s.line, 'Try "red", "blue", "gold", "hotpink" or "#33aa77".');
        }
        T.color = c;
        return;
      }
      case 'circle': {
        const r = num(await this.eval(s.e, scope), 'circle');
        if (this.host.circle) this.host.circle(T.x, T.y, Math.abs(r), T.color, T.size, T.down);
        await this.slow();
        return;
      }
      case 'clear': if (this.host.clear) this.host.clear(); return;
      case 'home': T.x = 0; T.y = 0; T.heading = 0; this.drawTurtle(); return;
      case 'goto': {
        const x = num(await this.eval(s.x, scope), 'go to'), y = num(await this.eval(s.y, scope), 'go to');
        if (T.down && this.host.line) this.host.line(T.x, T.y, x, y, T.color, T.size);
        T.x = x; T.y = y; this.drawTurtle();
        return;
      }
      case 'visible': T.visible = s.show; this.drawTurtle(); return;
      case 'teach': {
        const label = toText(await this.eval(s.label, scope));
        let ex = await this.eval(s.e, scope);
        if (!Array.isArray(ex)) ex = [ex];
        if (!ex.length) throw new KidError('The AI needs at least one example to learn from.', s.line, 'Like: teach "happy" with ["yay", "I love it"]');
        const pics = ex.filter(x => x instanceof Picture), texts = ex.filter(x => !(x instanceof Picture));
        if (pics.length) this.brain.teachPictures(label, pics);
        if (texts.length) this.brain.teach(label, texts);
        if (this.host.taught) this.host.taught(label, ex.length, this.brain.exampleCount() + this.brain.pictureCount(), pics.length > 0);
        return;
      }
      case 'test': {
        const label = toText(await this.eval(s.label, scope));
        let ex = await this.eval(s.e, scope);
        if (!Array.isArray(ex)) ex = [ex];
        if (!ex.length) throw new KidError('"test" needs at least one example.', s.line, 'Like: test "happy" with ["so fun", "yay"]');
        const wrong = [];
        let correct = 0;
        for (const x of ex) {
          const g = this.aiGuess(x, s.line);
          if (same(g.label, label)) correct++; else wrong.push({ input: x instanceof Picture ? 'a picture' : toText(x), guessed: g.label });
        }
        this.lastAccuracy = Math.round(correct / ex.length * 100);
        if (this.host.aiTest) this.host.aiTest({ label, total: ex.length, correct, percent: this.lastAccuracy, wrong });
        return;
      }
      case 'learn': {
        const name = toText(await this.eval(s.name, scope));
        const pairs = await this.eval(s.e, scope);
        const ok = Array.isArray(pairs) && pairs.length && pairs.every(p => Array.isArray(p) && p.length === 2 && typeof p[0] === 'number' && typeof p[1] === 'number');
        if (!ok) throw new KidError('"learn" needs a list of number pairs.', s.line, 'Like: learn "plant" from [[1, 2], [2, 4], [3, 6]]   (each pair is [input, answer])');
        this.brain.learn(name, pairs);
        if (this.host.taught) this.host.taught(name, pairs.length, this.brain.numbers.get(name).length, false, true);
        return;
      }
      case 'askpic': {
        const q = toText(await this.eval(s.e, scope));
        if (!this.host.askPicture) throw new KidError('"ask picture" only works in the playground.', s.line, 'Open your program in the KidAI playground to draw or pick pictures.');
        const r = await this.host.askPicture(q);
        if (this.halted) throw new Halted();
        const pic = r ? new Picture(normalizePicture(r.data, r.size), r.thumb) : new Picture(new Array(256).fill(0));
        this.assign(s.name.key, pic, scope);
        this.steps = 0;
        return;
      }
      case 'save': {
        const v = await this.eval(s.e, scope), key = toText(await this.eval(s.key, scope));
        await this.storage().set('data:' + key, JSON.stringify(this.constructor.toStored(v)));
        return;
      }
      case 'loadinto': {
        const key = toText(await this.eval(s.key, scope));
        const raw = await this.storage().get('data:' + key);
        this.assign(s.name.key, raw === null || raw === undefined ? null : this.constructor.fromStored(JSON.parse(raw)), scope);
        return;
      }
      case 'saveai': {
        const key = toText(await this.eval(s.key, scope));
        await this.storage().set('ai:' + key, JSON.stringify(this.brain.toJSON()));
        if (this.host.say) this.host.say('(Saved the AI as "' + key + '")');
        return;
      }
      case 'loadai': {
        const key = toText(await this.eval(s.key, scope));
        const raw = await this.storage().get('ai:' + key);
        if (raw === null || raw === undefined) throw new KidError('There is no saved AI called "' + key + '".', s.line, 'Save one first with: save ai as "' + key + '"');
        this.brain = TinyBrain.fromJSON(JSON.parse(raw));
        if (this.host.say) this.host.say('(Loaded the AI "' + key + '")');
        return;
      }
      case 'forgetai': this.brain = new TinyBrain(); this.lastSure = null; this.lastAccuracy = null; return;
      case 'setfield': {
        let target = this.lookup(s.name.key, scope, s.name.raw, s.line);
        for (let i = 0; i < s.path.length - 1; i++) {
          if (!isRecord(target)) throw new KidError('"' + s.name.raw + '" is not a record.', s.line, 'Records look like {name: "Tom", age: 3}');
          if (!isRecord(target.get(s.path[i].key))) target.set(s.path[i].key, new Map());
          target = target.get(s.path[i].key);
        }
        if (!isRecord(target)) throw new KidError('"' + s.name.raw + '" is not a record, so it has no fields.', s.line, 'Make it a record first: set ' + s.name.raw + ' to {}');
        target.set(s.path[s.path.length - 1].key, await this.eval(s.e, scope));
        return;
      }
      case 'use': case 'comment': case 'blank': return;
      case 'callstmt':
        await this.eval(s.e, scope);
        return;
    }
    throw new KidError('I don\'t know how to do "' + s.type + '".', s.line, '');
  }
}

module.exports = { StatementMethods };
