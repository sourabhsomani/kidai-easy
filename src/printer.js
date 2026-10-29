// KidAI Easy: printer.js
// The formatter: turns a program tree back into tidy KidAI text ("kidai fmt", blocks mode).
'use strict';

const { fmtNumber } = require('./values');
const { parse } = require('./parser');

// Turns a program tree back into tidy KidAI text. Used by "kidai fmt" and by blocks mode.
// PREC numbers mirror the parser's precedence levels: higher = tighter binding.
// printExpr(e, min) wraps e in parentheses if its precedence drops below min.
const PREC = { or: 1, and: 2, not: 3, cmp: 4, contains: 5, add: 6, mul: 7, neg: 8, atom: 9 };
// These read as far right as they can (their last part is a whole sum), so they need brackets before + - * / mod.
const GREEDY = new Set(['random', 'guess', 'split', 'join', 'chat', 'predict']);
function quote(s) {
  return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t') + '"';
}
function printExpr(e, min, tail) {
  if (min === undefined) min = 0;
  if (tail === undefined) tail = true;
  const [text, prec] = exprText(e, tail);
  const wrapGreedy = GREEDY.has(e.k) && !tail;
  return prec < min || wrapGreedy ? '(' + exprText(e, true)[0] + ')' : text;
}
function exprText(e, tail) {
  const P = PREC;
  switch (e.k) {
    case 'val':
      if (e.v === null) return ['nothing', P.atom];
      if (typeof e.v === 'boolean') return [e.v ? 'yes' : 'no', P.atom];
      if (typeof e.v === 'number') return e.v < 0 ? ['(' + fmtNumber(e.v) + ')', P.atom] : [fmtNumber(e.v), P.atom];
      return [quote(e.v), P.atom];
    case 'list': return ['[' + e.items.map(x => printExpr(x)).join(', ') + ']', P.atom];
    case 'record': return ['{' + e.fields.map(f => (/^[\p{L}_][\p{L}\p{N}_]*$/u.test(f.raw) ? f.raw : quote(f.raw)) + ': ' + printExpr(f.e)).join(', ') + '}', P.atom];
    case 'name': return [e.raw, P.atom];
    case 'call': return [e.raw + '(' + e.args.map(x => printExpr(x)).join(', ') + ')', P.atom];
    case 'field': return [printExpr(e.a, P.atom, false) + '.' + e.raw, P.atom];
    case 'or': return [printExpr(e.a, P.or, true) + ' or ' + printExpr(e.b, P.and, tail), P.or];
    case 'and': return [printExpr(e.a, P.and, true) + ' and ' + printExpr(e.b, P.not, tail), P.and];
    case 'not': return ['not ' + printExpr(e.a, P.not, tail), P.not];
    case 'neg': return ['-' + printExpr(e.a, P.neg, tail), P.neg];
    case 'contains': return [printExpr(e.a, P.add, true) + ' contains ' + printExpr(e.b, P.add, tail), P.contains];
    case 'starts': case 'ends':
      return [printExpr(e.a, P.contains, true) + (e.k === 'starts' ? ' starts with ' : ' ends with ') + printExpr(e.b, P.contains, tail), P.cmp];
    case 'touches': return [printExpr(e.a, P.contains, true) + ' touches ' + printExpr(e.b, P.contains, tail), P.cmp];
    case 'touchedge': return [printExpr(e.a, P.contains, true) + ' touches edge', P.cmp];
    case 'bin': {
      const op = e.op;
      if (op === '+' || op === '-') return [printExpr(e.a, P.add, false) + ' ' + op + ' ' + printExpr(e.b, P.mul, tail), P.add];
      if (op === '*' || op === '/' || op === 'mod') return [printExpr(e.a, P.mul, false) + ' ' + op + ' ' + printExpr(e.b, P.neg, tail), P.mul];
      const word = e.word ? 'is ' + e.word + ' than' : { '=': 'is', '!=': 'is not', '>': '>', '<': '<', '>=': '>=', '<=': '<=' }[op];
      return [printExpr(e.a, P.contains, true) + ' ' + word + ' ' + printExpr(e.b, P.contains, tail), P.cmp];
    }
    case 'random': return ['random ' + printExpr(e.lo, P.add, false) + ' to ' + printExpr(e.hi, P.add, tail), P.atom];
    case 'randitem': return ['random item from ' + printExpr(e.list, P.neg, tail), P.atom];
    case 'item': return ['item ' + printExpr(e.idx, P.add, false) + ' of ' + printExpr(e.list, P.neg, tail), P.atom];
    case 'length': return ['length of ' + printExpr(e.a, P.neg, tail), P.atom];
    case 'howsure': return ['how sure', P.atom];
    case 'howaccurate': return ['how accurate', P.atom];
    case 'guess': return ['guess ' + printExpr(e.a, P.add, tail), P.atom];
    case 'keydown': return ['key ' + printExpr(e.key, P.add, false) + ' is pressed', P.atom];
    case 'turtlepos': return [e.axis + ' position', P.atom];
    case 'spritepos': return [e.axis + ' of sprite ' + printExpr(e.name, P.neg, tail), P.atom];
    case 'split': return ['split ' + printExpr(e.a, P.add, false) + ' by ' + printExpr(e.b, P.add, tail), P.atom];
    case 'join': return ['join ' + printExpr(e.a, P.add, false) + ' with ' + printExpr(e.b, P.add, tail), P.atom];
    case 'replace': return ['replace ' + printExpr(e.a, P.add, false) + ' with ' + printExpr(e.b, P.add, false) + ' in ' + printExpr(e.c, P.neg, tail), P.atom];
    case 'keys': return ['keys of ' + printExpr(e.a, P.neg, tail), P.atom];
    case 'stagepic': return ['stage picture', P.atom];
    case 'load': return ['load ' + printExpr(e.a, P.neg, tail), P.atom];
    case 'chat': return ['chat ' + printExpr(e.a, P.add, tail), P.atom];
    case 'predict': return ['predict ' + printExpr(e.name, P.add, false) + ' for ' + printExpr(e.x, P.add, tail), P.atom];
  }
  throw new Error('printer: unknown expression ' + e.k);
}
function printStatements(body, depth) {
  const pad = '  '.repeat(depth), out = [];
  const E = (x, min) => printExpr(x, min || 0, true);
  const H = (x) => printExpr(x, PREC.add, true); // an expression followed by more words (they stop a sum)
  const blockOf = (head, b) => { out.push(pad + head + ':'); out.push(...printStatements(b, depth + 1)); out.push(pad + 'end'); };
  for (const s of body) {
    switch (s.type) {
      case 'comment': out.push(pad + '#' + (s.text ? ' ' + s.text : '')); break;
      case 'blank': out.push(''); break;
      case 'say': out.push(pad + 'say ' + E(s.e)); break;
      case 'set': out.push(pad + 'set ' + s.name.raw + ' to ' + E(s.e)); break;
      case 'setitem': out.push(pad + 'set item ' + H(s.idx) + ' of ' + s.name.raw + ' to ' + E(s.e)); break;
      case 'setfield': out.push(pad + 'set ' + s.name.raw + s.path.map(p => '.' + p.raw).join('') + ' to ' + E(s.e)); break;
      case 'change': out.push(pad + 'change ' + s.name.raw + ' by ' + E(s.e)); break;
      case 'add': out.push(pad + 'add ' + H(s.e) + ' to ' + s.name.raw); break;
      case 'remove': out.push(pad + 'remove ' + H(s.e) + ' from ' + s.name.raw); break;
      case 'ask': out.push(pad + 'ask ' + H(s.e) + (s.name.key === 'answer' ? '' : ' into ' + s.name.raw)); break;
      case 'askpic': out.push(pad + 'ask picture ' + H(s.e) + (s.name.key === 'answer' ? '' : ' into ' + s.name.raw)); break;
      case 'if': {
        s.branches.forEach((b, i) => {
          out.push(pad + (i ? 'else if ' : 'if ') + E(b.cond) + ':');
          out.push(...printStatements(b.body, depth + 1));
        });
        if (s.otherwise) { out.push(pad + 'else:'); out.push(...printStatements(s.otherwise, depth + 1)); }
        out.push(pad + 'end');
        break;
      }
      case 'repeat': blockOf('repeat ' + H(s.count) + ' times', s.body); break;
      case 'while': blockOf('repeat while ' + E(s.cond), s.body); break;
      case 'until': blockOf('repeat until ' + E(s.cond), s.body); break;
      case 'forever': blockOf('repeat forever', s.body); break;
      case 'foreach': blockOf('for each ' + s.name.raw + ' in ' + E(s.list), s.body); break;
      case 'define': blockOf('define ' + s.name.raw + (s.params.length ? '(' + s.params.map(p => p.raw).join(', ') + ')' : '()'), s.body); break;
      case 'when': blockOf('when clicked ' + E(s.label), s.body); break;
      case 'whenkey': blockOf('when key ' + H(s.key) + ' pressed', s.body); break;
      case 'every': {
        const one = s.e.k === 'val' && s.e.v === 1;
        blockOf('every ' + H(s.e) + (one ? ' second' : ' seconds'), s.body); break;
      }
      case 'giveback': out.push(pad + 'give back' + (s.e ? ' ' + E(s.e) : '')); break;
      case 'stop': out.push(pad + 'stop'); break;
      case 'stopall': out.push(pad + 'stop everything'); break;
      case 'skip': out.push(pad + 'skip'); break;
      case 'wait': out.push(pad + 'wait ' + E(s.e) + (s.unit ? ' ' + s.unit : '')); break;
      case 'move': out.push(pad + (s.dir > 0 ? 'forward ' : 'back ') + E(s.e) + (s.unit ? ' ' + s.unit : '')); break;
      case 'turn': out.push(pad + 'turn ' + (s.dir > 0 ? 'right ' : 'left ') + E(s.e) + (s.unit ? ' ' + s.unit : '')); break;
      case 'turnto': out.push(pad + 'turn to ' + E(s.e) + (s.unit ? ' ' + s.unit : '')); break;
      case 'pen': out.push(pad + 'pen ' + (s.down ? 'down' : 'up')); break;
      case 'pensize': out.push(pad + 'pen size ' + E(s.e)); break;
      case 'color': out.push(pad + 'color ' + E(s.e)); break;
      case 'circle': out.push(pad + 'circle ' + E(s.e)); break;
      case 'dot': out.push(pad + 'dot ' + E(s.e)); break;
      case 'rect': out.push(pad + 'rectangle ' + H(s.w) + ', ' + E(s.h)); break;
      case 'write': out.push(pad + 'write ' + E(s.e)); break;
      case 'background': out.push(pad + 'background ' + E(s.e)); break;
      case 'clear': out.push(pad + 'clear'); break;
      case 'home': out.push(pad + 'go home'); break;
      case 'goto': out.push(pad + 'go to ' + H(s.x) + ', ' + E(s.y)); break;
      case 'visible': out.push(pad + (s.show ? 'unhide' : 'hide')); break;
      case 'sprite': {
        let t = 'make sprite ' + H(s.name) + ' as ' + H(s.look);
        if (s.x) t += ' at ' + H(s.x) + ', ' + H(s.y);
        if (s.size) t += ' size ' + H(s.size);
        out.push(pad + t); break;
      }
      case 'movesprite': out.push(pad + 'move sprite ' + H(s.name) + (s.by ? ' by ' : ' to ') + H(s.x) + ', ' + E(s.y)); break;
      case 'spritevis': out.push(pad + (s.show ? 'show sprite ' : 'hide sprite ') + E(s.name)); break;
      case 'deletesprite': out.push(pad + 'delete sprite ' + E(s.name)); break;
      case 'note': out.push(pad + 'play note ' + H(s.e) + (s.dur ? ' for ' + H(s.dur) + (s.unit ? ' ' + s.unit : '') : '')); break;
      case 'sound': out.push(pad + 'play sound ' + E(s.e)); break;
      case 'beep': out.push(pad + 'beep'); break;
      case 'teach': out.push(pad + 'teach ' + H(s.label) + ' with ' + E(s.e)); break;
      case 'test': out.push(pad + 'test ' + H(s.label) + ' with ' + E(s.e)); break;
      case 'learn': out.push(pad + 'learn ' + H(s.name) + ' from ' + E(s.e)); break;
      case 'save': out.push(pad + 'save ' + H(s.e) + ' as ' + E(s.key)); break;
      case 'saveai': out.push(pad + 'save ai as ' + E(s.key)); break;
      case 'loadai': out.push(pad + 'load ai ' + E(s.key)); break;
      case 'loadinto': out.push(pad + 'load ' + H(s.key) + ' into ' + s.name.raw); break;
      case 'forgetai': out.push(pad + 'forget ai'); break;
      case 'use': out.push(pad + 'use ' + E(s.e)); break;
      case 'callstmt': out.push(pad + (s.e.bare ? s.e.raw : printExpr(s.e))); break;
      default: throw new Error('printer: unknown statement ' + s.type);
    }
  }
  return out;
}
function printProgram(ast) {
  const lines = printStatements(ast.body, 0);
  while (lines.length && lines[0] === '') lines.shift();
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  return lines.join('\n') + '\n';
}
function format(source) { return printProgram(parse(source, { keepComments: true })); }

module.exports = { format, printProgram, printExpr, quote };
