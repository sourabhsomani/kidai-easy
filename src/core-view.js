// KidAI Easy: core-view.js
// The "Grown-up code" view: shows a program in KidAI Core 1.0 style.
'use strict';

const { fmtNumber } = require('./values');
const { parse } = require('./parser');
const { quote } = require('./printer');

// Shows a KidAI Easy program in the style of the full KidAI Core 1.0 language (from the PRD), for learning.
function toCore(source) {
  const ast = parse(source, { keepComments: true });
  const used = new Set();
  const U = (m, t) => { used.add(m); return t; };
  let usesBrain = false;
  const CP = { or: 1, and: 2, not: 3, cmp: 4, inn: 5, add: 6, mul: 7, neg: 8, atom: 9 };
  const wrap = (pair, min) => (pair[1] < min ? '(' + pair[0] + ')' : pair[0]);
  const X = (e, min) => wrap(cx(e), min || 0);
  const args = (...xs) => xs.map(x => X(x)).join(', ');
  function cx(e) {
    switch (e.k) {
      case 'val':
        if (e.v === null) return ['nothing', CP.atom];
        if (typeof e.v === 'boolean') return [e.v ? 'true' : 'false', CP.atom];
        if (typeof e.v === 'number') return [fmtNumber(e.v), e.v < 0 ? CP.neg : CP.atom];
        return [quote(e.v), CP.atom];
      case 'list': return ['[' + e.items.map(x => X(x)).join(', ') + ']', CP.atom];
      case 'record': return ['{' + e.fields.map(f => quote(f.key) + ': ' + X(f.e)).join(', ') + '}', CP.atom];
      case 'name': return [e.raw, CP.atom];
      case 'call': return [e.raw + '(' + e.args.map(x => X(x)).join(', ') + ')', CP.atom];
      case 'field': return [X(e.a, CP.atom) + '[' + quote(e.key) + ']', CP.atom];
      case 'or': return [X(e.a, CP.or) + ' or ' + X(e.b, CP.and), CP.or];
      case 'and': return [X(e.a, CP.and) + ' and ' + X(e.b, CP.not), CP.and];
      case 'not': return ['not ' + X(e.a, CP.not), CP.not];
      case 'neg': return ['-' + X(e.a, CP.neg), CP.neg];
      case 'contains': return [X(e.b, CP.add) + ' in ' + X(e.a, CP.add), CP.inn];
      case 'bin': {
        const op = { '=': '==', '!=': '!=', '>': '>', '<': '<', '>=': '>=', '<=': '<=', '+': '+', '-': '-', '*': '*', '/': '/', mod: '%' }[e.op];
        if (op === '+') {
          const texty = (n) => (n.k === 'val' && typeof n.v === 'string') || (n.k === 'bin' && n.op === '+' && (texty(n.a) || texty(n.b)));
          const ta = texty(e.a), tb = texty(e.b);
          const A = tb && !ta ? 'to_text(' + X(e.a) + ')' : X(e.a, CP.add), B = ta && !tb ? 'to_text(' + X(e.b) + ')' : X(e.b, CP.mul);
          return [A + ' + ' + B, CP.add];
        }
        if (op === '-') return [X(e.a, CP.add) + ' - ' + X(e.b, CP.mul), CP.add];
        if (op === '*' || op === '/' || op === '%') return [X(e.a, CP.mul) + ' ' + op + ' ' + X(e.b, CP.neg), CP.mul];
        return [X(e.a, CP.inn) + ' ' + op + ' ' + X(e.b, CP.inn), CP.cmp];
      }
      case 'starts': return [U('text', 'text.starts_with(' + args(e.a, e.b) + ')'), CP.atom];
      case 'ends': return [U('text', 'text.ends_with(' + args(e.a, e.b) + ')'), CP.atom];
      case 'touches': return [U('sprites', 'sprites.touching(' + args(e.a, e.b) + ')'), CP.atom];
      case 'touchedge': return [U('sprites', 'sprites.touching_edge(' + args(e.a) + ')'), CP.atom];
      case 'random': return [U('math', 'math.random_int(' + args(e.lo, e.hi) + ')'), CP.atom];
      case 'randitem': return [U('list', 'list.pick_random(' + args(e.list) + ')'), CP.atom];
      case 'item': return [X(e.list, CP.atom) + '[' + (e.idx.k === 'val' && typeof e.idx.v === 'number' ? fmtNumber(e.idx.v - 1) : X(e.idx, CP.add) + ' - 1') + ']', CP.atom];
      case 'length': return [U('list', 'list.length(' + args(e.a) + ')'), CP.atom];
      case 'guess': usesBrain = true; return [U('ai', 'ai.guess(brain, ' + args(e.a) + ')'), CP.atom];
      case 'howsure': usesBrain = true; return [U('ai', 'ai.confidence(brain)'), CP.atom];
      case 'howaccurate': usesBrain = true; return [U('ai', 'ai.accuracy(brain)'), CP.atom];
      case 'predict': usesBrain = true; return [U('ai', 'ai.predict(brain, ' + args(e.name, e.x) + ')'), CP.atom];
      case 'keydown': return [U('keyboard', 'keyboard.is_down(' + args(e.key) + ')'), CP.atom];
      case 'turtlepos': return [U('turtle', 'turtle.' + e.axis + '()'), CP.atom];
      case 'spritepos': return [U('sprites', 'sprites.' + e.axis + '(' + args(e.name) + ')'), CP.atom];
      case 'split': return [U('text', 'text.split(' + args(e.a, e.b) + ')'), CP.atom];
      case 'join': return [U('text', 'text.join(' + args(e.a, e.b) + ')'), CP.atom];
      case 'replace': return [U('text', 'text.replace(' + args(e.c, e.a, e.b) + ')'), CP.atom];
      case 'keys': return [U('map', 'map.keys(' + args(e.a) + ')'), CP.atom];
      case 'stagepic': return [U('turtle', 'turtle.snapshot()'), CP.atom];
      case 'load': return [U('storage', 'await storage.get(' + args(e.a) + ')'), CP.atom];
      case 'chat': return [U('chat', 'await chat.reply(' + args(e.a) + ')'), CP.atom];
    }
    return ['?', CP.atom];
  }
  function hasReturnValue(body) {
    return body.some(s => (s.type === 'giveback' && s.e) || ['if', 'repeat', 'while', 'until', 'forever', 'foreach'].some(t => s.type === t &&
      (t === 'if' ? s.branches.some(b => hasReturnValue(b.body)) || (s.otherwise && hasReturnValue(s.otherwise)) : hasReturnValue(s.body))));
  }
  function stmts(body, depth, declared) {
    const pad = '    '.repeat(depth), out = [];
    const decl = (name, value) => {
      if (declared.has(name.key)) return pad + 'set ' + name.raw + ' = ' + value;
      declared.add(name.key); return pad + 'var ' + name.raw + ' = ' + value;
    };
    const block = (head, b, d2) => { out.push(pad + head + ':'); out.push(...stmts(b, depth + 1, d2 || declared)); out.push(pad + 'end'); };
    for (const s of body) {
      switch (s.type) {
        case 'comment': out.push(pad + '#' + (s.text ? ' ' + s.text : '')); break;
        case 'blank': out.push(''); break;
        case 'say': out.push(pad + 'show ' + X(s.e)); break;
        case 'set': out.push(decl(s.name, X(s.e))); break;
        case 'setitem': out.push(pad + 'set ' + s.name.raw + '[' + X(s.idx, CP.add) + ' - 1] = ' + X(s.e)); break;
        case 'setfield': out.push(pad + 'set ' + s.name.raw + s.path.map(p => '[' + quote(p.key) + ']').join('') + ' = ' + X(s.e)); break;
        case 'change': out.push(pad + 'set ' + s.name.raw + ' = ' + s.name.raw + ' + ' + X(s.e, CP.mul)); break;
        case 'add': out.push(pad + 'set ' + s.name.raw + ' = ' + U('list', 'list.append(' + s.name.raw + ', ' + X(s.e) + ')')); break;
        case 'remove': out.push(pad + 'set ' + s.name.raw + ' = ' + U('list', 'list.remove(' + s.name.raw + ', ' + X(s.e) + ')')); break;
        case 'ask': out.push(decl(s.name, 'input(' + X(s.e) + ')')); break;
        case 'askpic': out.push(decl(s.name, U('drawing', 'await drawing.ask_picture(' + X(s.e) + ')'))); break;
        case 'if': {
          const chain = (i, d) => {
            const p = '    '.repeat(d), b = s.branches[i];
            out.push(p + 'if ' + X(b.cond) + ':');
            out.push(...stmts(b.body, d + 1, declared));
            if (i + 1 < s.branches.length) { out.push(p + 'else:'); chain(i + 1, d + 1); }
            else if (s.otherwise) { out.push(p + 'else:'); out.push(...stmts(s.otherwise, d + 1, declared)); }
            out.push(p + 'end');
          };
          chain(0, depth); break;
        }
        case 'repeat': block('repeat ' + X(s.count) + ' times', s.body); break;
        case 'while': block('while ' + X(s.cond), s.body); break;
        case 'until': block('while not (' + X(s.cond) + ')', s.body); break;
        case 'forever': block('while true', s.body); break;
        case 'foreach': declared.add(s.name.key); block('for ' + s.name.raw + ' in ' + X(s.list), s.body); break;
        case 'define': {
          const local = new Set(s.params.map(p => p.key));
          block('function ' + s.name.raw + '(' + s.params.map(p => p.raw + ': Any').join(', ') + ') -> ' + (hasReturnValue(s.body) ? 'Any' : 'Nothing'), s.body, local);
          break;
        }
        case 'when': block('on ' + U('ui', 'ui.click(' + X(s.label) + ')'), s.body, new Set()); break;
        case 'whenkey': block('on ' + U('keyboard', 'keyboard.press(' + X(s.key) + ')'), s.body, new Set()); break;
        case 'every': block('on ' + U('time', 'time.every(seconds(' + X(s.e) + '))'), s.body, new Set()); break;
        case 'giveback': out.push(pad + 'return' + (s.e ? ' ' + X(s.e) : '')); break;
        case 'stop': out.push(pad + 'break'); break;
        case 'skip': out.push(pad + 'continue'); break;
        case 'stopall': out.push(pad + U('app', 'app.stop()')); break;
        case 'wait': out.push(pad + U('time', 'await time.wait(seconds(' + X(s.e) + '))')); break;
        case 'move': out.push(pad + U('turtle', 'turtle.' + (s.dir > 0 ? 'forward(' : 'back(') + X(s.e) + ')')); break;
        case 'turn': out.push(pad + U('turtle', 'turtle.turn_' + (s.dir > 0 ? 'right(' : 'left(') + X(s.e) + ')')); break;
        case 'turnto': out.push(pad + U('turtle', 'turtle.turn_to(' + X(s.e) + ')')); break;
        case 'pen': out.push(pad + U('turtle', 'turtle.pen_' + (s.down ? 'down()' : 'up()'))); break;
        case 'pensize': out.push(pad + U('turtle', 'turtle.pen_size(' + X(s.e) + ')')); break;
        case 'color': out.push(pad + U('turtle', 'turtle.color(' + X(s.e) + ')')); break;
        case 'circle': out.push(pad + U('turtle', 'turtle.circle(' + X(s.e) + ')')); break;
        case 'dot': out.push(pad + U('turtle', 'turtle.dot(' + X(s.e) + ')')); break;
        case 'rect': out.push(pad + U('turtle', 'turtle.rectangle(' + args(s.w, s.h) + ')')); break;
        case 'write': out.push(pad + U('turtle', 'turtle.write(' + X(s.e) + ')')); break;
        case 'background': out.push(pad + U('stage', 'stage.background(' + X(s.e) + ')')); break;
        case 'clear': out.push(pad + U('turtle', 'turtle.clear()')); break;
        case 'home': out.push(pad + U('turtle', 'turtle.home()')); break;
        case 'goto': out.push(pad + U('turtle', 'turtle.go_to(' + args(s.x, s.y) + ')')); break;
        case 'visible': out.push(pad + U('turtle', 'turtle.' + (s.show ? 'show()' : 'hide()'))); break;
        case 'sprite': {
          out.push(pad + U('sprites', 'sprites.make(' + args(s.name, s.look) + ')'));
          if (s.x) out.push(pad + 'sprites.move_to(' + args(s.name, s.x, s.y) + ')');
          if (s.size) out.push(pad + 'sprites.size(' + args(s.name, s.size) + ')');
          break;
        }
        case 'movesprite': out.push(pad + U('sprites', 'sprites.move_' + (s.by ? 'by(' : 'to(') + args(s.name, s.x, s.y) + ')')); break;
        case 'spritevis': out.push(pad + U('sprites', 'sprites.' + (s.show ? 'show(' : 'hide(') + args(s.name) + ')')); break;
        case 'deletesprite': out.push(pad + U('sprites', 'sprites.delete(' + args(s.name) + ')')); break;
        case 'note': out.push(pad + U('sound', 'await sound.note(' + X(s.e) + ', seconds(' + (s.dur ? X(s.dur) : '0.4') + '))')); break;
        case 'sound': out.push(pad + U('sound', 'sound.effect(' + X(s.e) + ')')); break;
        case 'beep': out.push(pad + U('sound', 'sound.beep()')); break;
        case 'teach': usesBrain = true; out.push(pad + U('ai', 'ai.teach(brain, ' + args(s.label, s.e) + ')')); break;
        case 'test': usesBrain = true; out.push(pad + U('ai', 'ai.test(brain, ' + args(s.label, s.e) + ')')); break;
        case 'learn': usesBrain = true; out.push(pad + U('ai', 'ai.learn_numbers(brain, ' + args(s.name, s.e) + ')')); break;
        case 'save': out.push(pad + U('storage', 'await storage.put(' + args(s.key, s.e) + ')')); break;
        case 'loadinto': out.push(decl(s.name, U('storage', 'await storage.get(' + args(s.key) + ')'))); break;
        case 'saveai': usesBrain = true; out.push(pad + U('storage', 'await storage.put_model(' + X(s.key) + ', brain)')); break;
        case 'loadai': usesBrain = true; out.push(pad + U('storage', 'set brain = await storage.get_model(' + X(s.key) + ')')); break;
        case 'forgetai': usesBrain = true; out.push(pad + U('ai', 'set brain = ai.new_brain()')); break;
        case 'use': out.push(pad + 'use ' + (s.e.k === 'val' ? String(s.e.v).replace(/[^\p{L}\p{N}_]+/gu, '_') : X(s.e))); break;
        case 'callstmt': out.push(pad + (s.e.bare ? s.e.raw + '()' : X(s.e))); break;
        default: out.push(pad + '# (no grown-up version of "' + s.type + '" yet)');
      }
    }
    return out;
  }
  const body = stmts(ast.body, 0, new Set());
  const MODS = { ui: 'app.ui', keyboard: 'app.keyboard', time: 'app.time', app: 'app', turtle: 'draw.turtle', stage: 'draw.stage', sprites: 'draw.sprites',
    sound: 'media.sound', storage: 'storage', ai: 'ai.kidbrain as ai', text: 'text', list: 'list', map: 'map', math: 'math', chat: 'ai.chat', drawing: 'media.drawing' };
  const head = ['# Your program in grown-up KidAI Core 1.0 style.', '# It shows the same ideas the way a bigger language writes them.', '# Some library names here are examples, so this version is for reading, not running.', ''];
  const uses = Array.from(used).sort().map(m => 'use ' + MODS[m]);
  if (uses.length) head.push(...uses, '');
  if (usesBrain) head.push('var brain = ai.new_brain()', '');
  return head.concat(body).join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

module.exports = { toCore };
