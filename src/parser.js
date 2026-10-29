// KidAI Easy: parser.js
// Step 2b: reads the whole program line by line into a tree of statements (blocks end with "end").
'use strict';

const { KidError } = require('./errors');
const { STATEMENT_WORDS } = require('./words');
const { closest, describeToken } = require('./values');
const { tokenizeLine } = require('./tokenizer');
const { Line, additive, blockOpen, expectName, expectWord, expr, finishLine } = require('./parse-expressions');

function parse(source, options) {
  const keep = !!(options && options.keepComments);
  const raw = String(source).replace(/\r\n?/g, '\n').split('\n');
  const lines = [];
  raw.forEach((text, idx) => {
    const toks = tokenizeLine(text, idx + 1);
    if (keep && toks.comment !== undefined) lines.push(new Line([{ t: 'comment', v: toks.comment, line: idx + 1 }], idx + 1));
    else if (keep && !toks.length) {
      const last = lines[lines.length - 1];
      if (last && last.toks[0].t !== 'blank') lines.push(new Line([{ t: 'blank', line: idx + 1 }], idx + 1));
    }
    if (toks.length) lines.push(new Line(toks, idx + 1));
  });
  let li = 0;

  // ---- blocks and statements
  function block(enders, opener) {
    const body = [];
    for (;;) {
      if (li >= lines.length) {
        if (!enders) return body;
        throw new KidError('This "' + opener.word + '" needs an "end" to finish it.', opener.line,
          'Add a line that says end after the instructions inside it.');
      }
      const L = lines[li];
      const first = L.peek();
      if (first.t === 'word' && (first.v === 'end' || first.v === 'else')) {
        if (enders && enders.includes(first.v)) return body;
        if (first.v === 'else') {
          throw new KidError('This "else" isn\'t inside an "if".', L.line,
            'else only works between if ... and end.');
        }
        throw new KidError('This "end" doesn\'t match anything.', L.line,
          'Every end needs something to close, like repeat, if, define or when. Delete the extra end.');
      }
      li++;
      body.push(statement(L, !enders));
    }
  }
  function expectEnd(opener) {
    const L = lines[li];
    li++;
    L.next(); // end
    L.acceptWord(opener.word === 'define' ? 'define' : opener.word);
    finishLine(L);
  }

  function statement(L, topLevel) {
    const first = L.next();
    const line = L.line;
    if (first.t === 'comment') return { type: 'comment', text: first.v, line };
    if (first.t === 'blank') return { type: 'blank', line };
    if (first.t !== 'word') {
      L.pos = 0;
      throw new KidError('A line should start with an instruction, like say or set.', line,
        'To show something, write: say ' + describeToken(first));
    }
    switch (first.v) {
      case 'say': case 'show': case 'print': {
        if (first.v === 'show' && L.isWord('sprite')) {
          L.next();
          const name = expr(L); finishLine(L);
          return { type: 'spritevis', name, show: true, line };
        }
        if (L.atEnd()) throw new KidError('Say what? I need something after "' + first.raw + '".', line, 'Try: say "Hello!"');
        const e = expr(L); finishLine(L);
        return { type: 'say', e, line };
      }
      case 'set': {
        if (L.isWord('item') && !L.isWord('to', 1) && !L.isOp('=', 1)) {
          L.next();
          const idx = additive(L);
          expectWord(L, 'of', 'Use it like: set item 1 of fruits to "kiwi"');
          const name = expectName(L, 'the list');
          if (!L.acceptWord('to') && !L.acceptOp('=')) expectWord(L, 'to');
          const e = expr(L); finishLine(L);
          return { type: 'setitem', idx, name, e, line };
        }
        const name = expectName(L, 'the variable');
        if (L.isOp('.')) {
          const path = [];
          while (L.acceptOp('.')) { const f = L.next(); if (!f || f.t !== 'word') throw new KidError('I expected a field name after ".".', line, 'Like: set pet.name to "Rex"'); path.push({ key: f.v, raw: f.raw }); }
          if (!L.acceptWord('to') && !L.acceptOp('=')) expectWord(L, 'to', 'Use it like: set pet.name to "Rex"');
          const e = expr(L); finishLine(L);
          return { type: 'setfield', name, path, e, line };
        }
        if (!L.acceptWord('to') && !L.acceptOp('=')) {
          expectWord(L, 'to', 'Use it like: set ' + name.raw + ' to 10');
        }
        const e = expr(L); finishLine(L);
        return { type: 'set', name, e, line };
      }
      case 'change': {
        const name = expectName(L, 'the variable');
        expectWord(L, 'by', 'Use it like: change ' + name.raw + ' by 1');
        const e = expr(L); finishLine(L);
        return { type: 'change', name, e, line };
      }
      case 'add': {
        const e = expr(L);
        expectWord(L, 'to', 'Use it like: add "apple" to fruits   or   add 5 to score');
        const name = expectName(L, 'the list or number');
        finishLine(L);
        return { type: 'add', e, name, line };
      }
      case 'remove': {
        const e = expr(L);
        expectWord(L, 'from', 'Use it like: remove "apple" from fruits');
        const name = expectName(L, 'the list');
        finishLine(L);
        return { type: 'remove', e, name, line };
      }
      case 'ask': {
        if (L.acceptWord('picture')) {
          const e = expr(L);
          let name = { key: 'answer', raw: 'answer' };
          if (L.acceptWord('into', 'as')) name = expectName(L, 'the picture');
          finishLine(L);
          return { type: 'askpic', e, name, line };
        }
        const e = expr(L);
        let name = { key: 'answer', raw: 'answer' };
        if (L.acceptWord('into', 'as')) name = expectName(L, 'the answer');
        finishLine(L);
        return { type: 'ask', e, name, line };
      }
      case 'if': {
        const branches = [];
        let cond = expr(L); blockOpen(L);
        let body = block(['end', 'else'], { word: 'if', line });
        branches.push({ cond, body });
        let otherwise = null;
        for (;;) {
          const E = lines[li];
          if (E.isWord('end')) { expectEnd({ word: 'if' }); break; }
          li++;
          E.next(); // else
          if (E.acceptWord('if')) {
            if (otherwise) throw new KidError('"else if" must come before the last "else".', E.line, '');
            cond = expr(E); blockOpen(E);
            body = block(['end', 'else'], { word: 'if', line });
            branches.push({ cond, body });
          } else {
            if (otherwise) throw new KidError('This "if" already has an "else".', E.line, 'An if can only have one plain else.');
            blockOpen(E);
            otherwise = block(['end', 'else'], { word: 'if', line });
          }
        }
        return { type: 'if', branches, otherwise, line };
      }
      case 'repeat': {
        let node;
        if (L.acceptWord('while')) node = { type: 'while', cond: expr(L), line };
        else if (L.acceptWord('until')) node = { type: 'until', cond: expr(L), line };
        else if (L.acceptWord('forever')) node = { type: 'forever', line };
        else {
          if (L.atEnd() || L.isOp(':')) {
            throw new KidError('Repeat how many times?', line, 'Try: repeat 3 times:   or   repeat forever:');
          }
          const count = expr(L);
          if (!L.acceptWord('times', 'time')) {
            throw new KidError('I expected the word "times" here, but found ' + describeToken(L.peek()) + '.',
              line, 'Use it like: repeat 4 times:');
          }
          node = { type: 'repeat', count, line };
        }
        blockOpen(L);
        node.body = block(['end'], { word: 'repeat', line });
        expectEnd({ word: 'repeat' });
        return node;
      }
      case 'for': {
        L.acceptWord('each');
        const name = expectName(L, 'each thing');
        expectWord(L, 'in', 'Use it like: for each fruit in fruits:');
        const list = expr(L); blockOpen(L);
        const body = block(['end'], { word: 'for', line });
        expectEnd({ word: 'for' });
        return { type: 'foreach', name, list, body, line };
      }
      case 'define': {
        if (!topLevel) {
          throw new KidError('Recipes (define) must be made at the top of your program, not inside another block.',
            line, 'Move this define ... end out of the block it is in.');
        }
        const name = expectName(L, 'the recipe');
        const params = [];
        if (L.acceptOp('(')) {
          if (!L.acceptOp(')')) {
            for (;;) {
              params.push(expectName(L, 'an input'));
              if (L.acceptOp(')')) break;
              if (!L.acceptOp(',')) throw new KidError('I expected a "," or ")" here.', line, 'Like: define greet(name, age):');
            }
          }
        }
        blockOpen(L);
        const body = block(['end'], { word: 'define', line });
        expectEnd({ word: 'define' });
        return { type: 'define', name, params, body, line };
      }
      case 'when': {
        if (!topLevel) {
          throw new KidError('"when" must be at the top of your program, not inside another block.', line,
            'Move this when ... end out of the block it is in.');
        }
        let label;
        if (L.acceptWord('key')) {
          const key = additive(L);
          expectWord(L, 'pressed', 'Use it like: when key "space" pressed:');
          blockOpen(L);
          const kbody = block(['end'], { word: 'when', line });
          expectEnd({ word: 'when' });
          return { type: 'whenkey', key, body: kbody, line };
        }
        if (L.acceptWord('clicked')) {
          label = expr(L);
        } else {
          L.acceptWord('button');
          label = additive(L);
          expectWord(L, 'clicked', 'Use it like: when clicked "Jump":');
        }
        blockOpen(L);
        const body = block(['end'], { word: 'when', line });
        expectEnd({ word: 'when' });
        return { type: 'when', label, body, line };
      }
      case 'give': case 'return': {
        if (first.v === 'give') expectWord(L, 'back', 'Use it like: give back answer');
        const e = L.atEnd() ? null : expr(L);
        finishLine(L);
        return { type: 'giveback', e, line };
      }
      case 'stop':
        if (L.acceptWord('everything', 'all', 'program')) { finishLine(L); return { type: 'stopall', line }; }
        finishLine(L); return { type: 'stop', line };
      case 'every': {
        if (!topLevel) {
          throw new KidError('"every" must be at the top of your program, not inside another block.', line,
            'Move this every ... end out of the block it is in.');
        }
        const e = additive(L);
        L.acceptWord('second', 'seconds', 'sec', 'secs');
        blockOpen(L);
        const body = block(['end'], { word: 'every', line });
        expectEnd({ word: 'every' });
        return { type: 'every', e, body, line };
      }
      case 'play': {
        if (L.acceptWord('note')) {
          const e = additive(L);
          let dur = null;
          let unit;
          if (L.acceptWord('for')) { dur = additive(L); const u = L.acceptWord('second', 'seconds', 'sec', 'secs'); if (u) unit = u.raw; }
          finishLine(L);
          return { type: 'note', e, dur, unit, line };
        }
        if (L.acceptWord('sound')) { const e = expr(L); finishLine(L); return { type: 'sound', e, line }; }
        throw new KidError('Play what?', line, 'Use: play note "C"   or   play sound "coin"');
      }
      case 'beep': finishLine(L); return { type: 'beep', line };
      case 'test': {
        if (L.isOp('(')) break;
        const label = additive(L);
        expectWord(L, 'with', 'Use it like: test "happy" with ["so fun", "yay"]');
        const e = expr(L); finishLine(L);
        return { type: 'test', label, e, line };
      }
      case 'learn': {
        const name = additive(L);
        expectWord(L, 'from', 'Use it like: learn "plant" from [[1, 2], [2, 4]]');
        const e = expr(L); finishLine(L);
        return { type: 'learn', name, e, line };
      }
      case 'save': {
        if (L.acceptWord('ai')) {
          expectWord(L, 'as', 'Use it like: save ai as "moods"');
          const key = expr(L); finishLine(L);
          return { type: 'saveai', key, line };
        }
        const e = expr(L);
        expectWord(L, 'as', 'Use it like: save score as "best"');
        const key = expr(L); finishLine(L);
        return { type: 'save', e, key, line };
      }
      case 'load': {
        if (L.acceptWord('ai')) { const key = expr(L); finishLine(L); return { type: 'loadai', key, line }; }
        const key = additive(L);
        expectWord(L, 'into', 'Use it like: load "best" into best_score');
        const name = expectName(L, 'the variable'); finishLine(L);
        return { type: 'loadinto', key, name, line };
      }
      case 'forget': {
        if (!L.acceptWord('ai')) throw new KidError('Forget what?', line, 'Use: forget ai   (the AI forgets everything it learned)');
        finishLine(L); return { type: 'forgetai', line };
      }
      case 'use': {
        if (!topLevel) throw new KidError('"use" must be at the top of your program.', line, 'Move it to the first lines.');
        const e = expr(L); finishLine(L);
        return { type: 'use', e, line };
      }
      case 'write': {
        const e = expr(L); finishLine(L);
        return { type: 'write', e, line };
      }
      case 'background': {
        const e = expr(L); finishLine(L);
        return { type: 'background', e, line };
      }
      case 'dot': {
        const e = expr(L); finishLine(L);
        return { type: 'dot', e, line };
      }
      case 'rectangle': {
        const w = additive(L);
        if (!L.acceptOp(',')) throw new KidError('I expected a "," between the width and the height.', line, 'Like: rectangle 80, 40');
        const h = additive(L); finishLine(L);
        return { type: 'rect', w, h, line };
      }
      case 'make': {
        expectWord(L, 'sprite', 'Use it like: make sprite "cat" as "🐱"');
        const name = additive(L);
        expectWord(L, 'as', 'Use it like: make sprite "cat" as "🐱"');
        const look = additive(L);
        let x = null, y = null, size = null;
        for (;;) {
          if (L.acceptWord('at')) {
            x = additive(L);
            if (!L.acceptOp(',')) throw new KidError('I expected a "," between the two numbers.', line, 'Like: at 0, -150');
            y = additive(L);
          } else if (L.acceptWord('size')) size = additive(L);
          else break;
        }
        finishLine(L);
        return { type: 'sprite', name, look, x, y, size, line };
      }
      case 'move': {
        expectWord(L, 'sprite', 'Use it like: move sprite "cat" by 10, 0');
        const name = additive(L);
        const how = L.acceptWord('by', 'to');
        if (!how) throw new KidError('Move it by how much, or to where?', line, 'Use: move sprite "cat" by 10, 0   or   move sprite "cat" to 0, 0');
        const x = additive(L);
        if (!L.acceptOp(',')) throw new KidError('I expected a "," between the two numbers.', line, 'Like: move sprite "cat" by 10, 0');
        const y = additive(L); finishLine(L);
        return { type: 'movesprite', name, by: how.v === 'by', x, y, line };
      }
      case 'delete': {
        expectWord(L, 'sprite', 'Use it like: delete sprite "cat"');
        const name = expr(L); finishLine(L);
        return { type: 'deletesprite', name, line };
      }
      case 'skip': finishLine(L); return { type: 'skip', line };
      case 'wait': {
        const e = expr(L);
        const u = L.acceptWord('second', 'seconds', 'sec', 'secs');
        finishLine(L);
        return { type: 'wait', e, unit: u ? u.raw : undefined, line };
      }
      case 'forward': case 'back': case 'backward': case 'backwards': {
        const e = expr(L); const u = L.acceptWord('steps', 'step'); finishLine(L);
        return { type: 'move', e, dir: first.v === 'forward' ? 1 : -1, unit: u ? u.raw : undefined, line };
      }
      case 'turn': {
        if (L.acceptWord('to')) {
          const e = expr(L); const u = L.acceptWord('degrees', 'degree'); finishLine(L);
          return { type: 'turnto', e, unit: u ? u.raw : undefined, line };
        }
        const side = L.acceptWord('left', 'right');
        if (!side) throw new KidError('Turn which way?', line, 'Use: turn left 90   or   turn right 90');
        const e = expr(L); const u = L.acceptWord('degrees', 'degree'); finishLine(L);
        return { type: 'turn', e, dir: side.v === 'right' ? 1 : -1, unit: u ? u.raw : undefined, line };
      }
      case 'pen': {
        const w = L.acceptWord('up', 'down', 'size', 'color', 'colour');
        if (!w) throw new KidError('What should the pen do?', line, 'Use: pen up, pen down, pen size 5 or pen color "red"');
        if (w.v === 'up' || w.v === 'down') { finishLine(L); return { type: 'pen', down: w.v === 'down', line }; }
        const e = expr(L); finishLine(L);
        return w.v === 'size' ? { type: 'pensize', e, line } : { type: 'color', e, line };
      }
      case 'color': case 'colour': {
        const e = expr(L); finishLine(L);
        return { type: 'color', e, line };
      }
      case 'circle': {
        const e = expr(L); finishLine(L);
        return { type: 'circle', e, line };
      }
      case 'clear': finishLine(L); return { type: 'clear', line };
      case 'go': {
        if (L.acceptWord('home')) { finishLine(L); return { type: 'home', line }; }
        expectWord(L, 'to', 'Use: go home   or   go to 50, 100');
        const x = additive(L);
        if (!L.acceptOp(',')) throw new KidError('I expected a "," between the two numbers.', line, 'Like: go to 50, 100');
        const y = additive(L); finishLine(L);
        return { type: 'goto', x, y, line };
      }
      case 'hide':
        if (L.acceptWord('sprite')) { const name = expr(L); finishLine(L); return { type: 'spritevis', name, show: false, line }; }
        finishLine(L); return { type: 'visible', show: false, line };
      case 'unhide': finishLine(L); return { type: 'visible', show: true, line };
      case 'teach': {
        const label = additive(L);
        expectWord(L, 'with', 'Use it like: teach "happy" with ["I love it", "yay"]');
        const e = expr(L); finishLine(L);
        return { type: 'teach', label, e, line };
      }
    }
    // Something else: a recipe call like greet("Mira") or just greet
    const after = L.peek();
    if (after && !(after.t === 'op')) {
      const near = closest(first.v, STATEMENT_WORDS.concat(['show', 'print']));
      throw new KidError('I don\'t know the instruction "' + first.raw + '".', line,
        near ? 'Did you mean "' + near + '"?' : 'Instructions start a line, like say, set, repeat or if.');
    }
    L.pos = 0;
    const e = expr(L);
    finishLine(L);
    if (e.k === 'name') {
      return { type: 'callstmt', e: { k: 'call', key: e.key, raw: e.raw, args: [], line, bare: true }, line };
    }
    if (e.k === 'call') return { type: 'callstmt', e, line };
    throw new KidError('I don\'t know what to do with this line.', line,
      'Start the line with an instruction like say, set or repeat.');
  }

  const body = block(null, null);
  return { body };
}

module.exports = { parse };
