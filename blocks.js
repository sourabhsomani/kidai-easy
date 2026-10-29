/*
 * KidAI Easy blocks mode.
 * Blocks and text are the same program: text -> program tree -> blocks, and blocks -> program tree -> text.
 * The conversion works on Blockly's saved-workspace JSON, so it can be tested without a browser.
 * In the browser, KidBlocks.mount() creates the Blockly editor (Blockly must already be loaded).
 */
(function (root) {
  'use strict';
  const KidAI = root.KidAI || (typeof require === 'function' ? require('./kidai.js') : null);

  const C = { talk: '#2f6df6', decide: '#7a4fd6', loop: '#5b3fc4', vars: '#e09a00', lists: '#c27c00', recipe: '#12a26a', draw: '#0f8a8a', game: '#e5484d', sound: '#b8457a', ai: '#d6338a', data: '#55608a', value: '#3d4a7a' };

  // ---------------------------------------------------------------- block shapes
  const V = (name, check) => ({ type: 'input_value', name, check: check || null });
  const S = (name) => ({ type: 'input_statement', name });
  const T = (name, text) => ({ type: 'field_input', name, text: text === undefined ? '' : text });
  const D = (name, options) => ({ type: 'field_dropdown', name, options });
  const stmt = (type, colour, message0, args0, extra) => Object.assign({ type, message0, args0: args0 || [], previousStatement: null, nextStatement: null, colour, inputsInline: true }, extra || {});
  const expr = (type, colour, message0, args0, extra) => Object.assign({ type, message0, args0: args0 || [], output: null, colour, inputsInline: true }, extra || {});
  const hat = (type, colour, message0, args0) => ({ type, message0, args0, colour, inputsInline: true });

  const DEFS = [
    // talking and remembering
    stmt('kid_say', C.talk, 'say %1', [V('E')]),
    stmt('kid_ask', C.talk, 'ask %1 into %2', [V('E'), T('NAME', 'answer')]),
    stmt('kid_wait', C.talk, 'wait %1 seconds', [V('E')]),
    stmt('kid_set', C.vars, 'set %1 to %2', [T('NAME', 'score'), V('E')]),
    stmt('kid_change', C.vars, 'change %1 by %2', [T('NAME', 'score'), V('E')]),
    stmt('kid_setfield', C.vars, 'set %1 to %2', [T('PATH', 'pet.name'), V('E')]),
    stmt('kid_comment', '#8a94b0', '# %1', [T('TEXT', 'note')]),
    // decisions and loops
    stmt('kid_if', C.decide, 'if %1 %2 %3', [V('COND'), { type: 'input_dummy' }, S('DO')], { inputsInline: false }),
    stmt('kid_ifelse', C.decide, 'if %1 %2 %3 else %4 %5', [V('COND'), { type: 'input_dummy' }, S('DO'), { type: 'input_dummy' }, S('ELSE')], { inputsInline: false }),
    stmt('kid_repeat', C.loop, 'repeat %1 times %2 %3', [V('E'), { type: 'input_dummy' }, S('DO')], { inputsInline: false }),
    stmt('kid_until', C.loop, 'repeat until %1 %2 %3', [V('COND'), { type: 'input_dummy' }, S('DO')], { inputsInline: false }),
    stmt('kid_while', C.loop, 'repeat while %1 %2 %3', [V('COND'), { type: 'input_dummy' }, S('DO')], { inputsInline: false }),
    stmt('kid_forever', C.loop, 'repeat forever %1 %2', [{ type: 'input_dummy' }, S('DO')], { inputsInline: false }),
    stmt('kid_foreach', C.loop, 'for each %1 in %2 %3 %4', [T('NAME', 'thing'), V('E'), { type: 'input_dummy' }, S('DO')], { inputsInline: false }),
    stmt('kid_stop', C.loop, '%1', [D('WHAT', [['stop (leave the loop)', 'stop'], ['skip (next round)', 'skip'], ['stop everything', 'stopall']])]),
    // recipes and events
    hat('kid_define', C.recipe, 'define %1 ( %2 ) %3 %4', [T('NAME', 'my_recipe'), T('PARAMS', ''), { type: 'input_dummy' }, S('DO')]),
    stmt('kid_giveback', C.recipe, 'give back %1', [V('E')]),
    stmt('kid_return', C.recipe, 'give back (nothing)', []),
    stmt('kid_callstmt', C.recipe, 'do %1 ( %2 )', [T('NAME', 'my_recipe'), T('ARGS', '')]),
    hat('kid_when', C.recipe, 'when clicked %1 %2 %3', [V('E'), { type: 'input_dummy' }, S('DO')]),
    hat('kid_whenkey', C.game, 'when key %1 pressed %2 %3', [V('E'), { type: 'input_dummy' }, S('DO')]),
    hat('kid_every', C.game, 'every %1 seconds %2 %3', [V('E'), { type: 'input_dummy' }, S('DO')]),
    hat('kid_use', C.recipe, 'use recipes from %1', [V('E')]),
    // lists
    stmt('kid_add', C.lists, 'add %1 to %2', [V('E'), T('NAME', 'my_list')]),
    stmt('kid_remove', C.lists, 'remove %1 from %2', [V('E'), T('NAME', 'my_list')]),
    stmt('kid_setitem', C.lists, 'set item %1 of %2 to %3', [V('I'), T('NAME', 'my_list'), V('E')]),
    // drawing
    stmt('kid_move', C.draw, '%1 %2', [D('DIR', [['forward', '1'], ['back', '-1']]), V('E')]),
    stmt('kid_turn', C.draw, 'turn %1 %2', [D('DIR', [['right', '1'], ['left', '-1']]), V('E')]),
    stmt('kid_turnto', C.draw, 'turn to %1', [V('E')]),
    stmt('kid_pen', C.draw, 'pen %1', [D('DOWN', [['down', 'down'], ['up', 'up']])]),
    stmt('kid_pensize', C.draw, 'pen size %1', [V('E')]),
    stmt('kid_color', C.draw, 'color %1', [V('E')]),
    stmt('kid_shape', C.draw, '%1 %2', [D('SHAPE', [['circle', 'circle'], ['dot', 'dot']]), V('E')]),
    stmt('kid_rect', C.draw, 'rectangle %1 , %2', [V('W'), V('H')]),
    stmt('kid_write', C.draw, 'write %1', [V('E')]),
    stmt('kid_background', C.draw, 'background %1', [V('E')]),
    stmt('kid_goto', C.draw, 'go to %1 , %2', [V('X'), V('Y')]),
    stmt('kid_simple_draw', C.draw, '%1', [D('WHAT', [['clear', 'clear'], ['go home', 'home'], ['hide Sparky', 'hide'], ['show Sparky', 'unhide']])]),
    // games
    stmt('kid_sprite', C.game, 'make sprite %1 as %2 at %3 , %4 size %5', [V('NAME'), V('LOOK'), V('X'), V('Y'), V('SIZE')]),
    stmt('kid_movesprite', C.game, 'move sprite %1 %2 %3 , %4', [V('NAME'), D('HOW', [['by', 'by'], ['to', 'to']]), V('X'), V('Y')]),
    stmt('kid_spritevis', C.game, '%1 sprite %2', [D('WHAT', [['hide', 'hide'], ['show', 'show'], ['delete', 'delete']]), V('NAME')]),
    // sound
    stmt('kid_note', C.sound, 'play note %1 for %2 seconds', [V('E'), V('DUR')]),
    stmt('kid_sound', C.sound, 'play sound %1', [V('E')]),
    stmt('kid_beep', C.sound, 'beep', []),
    // AI
    stmt('kid_teach', C.ai, 'teach %1 with %2', [V('LABEL'), V('E')]),
    stmt('kid_test', C.ai, 'test %1 with %2', [V('LABEL'), V('E')]),
    stmt('kid_learn', C.ai, 'learn %1 from %2', [V('NAME'), V('E')]),
    stmt('kid_askpic', C.ai, 'ask picture %1 into %2', [V('E'), T('NAME', 'picture')]),
    stmt('kid_saveai', C.ai, '%1 ai %2', [D('HOW', [['save', 'save'], ['load', 'load']]), V('KEY')]),
    stmt('kid_forgetai', C.ai, 'forget ai', []),
    // saving data
    stmt('kid_save', C.data, 'save %1 as %2', [V('E'), V('KEY')]),
    stmt('kid_loadinto', C.data, 'load %1 into %2', [V('KEY'), T('NAME', 'best')]),

    // values
    expr('kid_num', C.value, '%1', [T('V', '0')]),
    expr('kid_text', C.value, '" %1 "', [T('V', 'hello')]),
    expr('kid_bool', C.value, '%1', [D('V', [['yes', 'yes'], ['no', 'no'], ['nothing', 'nothing']])]),
    expr('kid_var', C.vars, '%1', [T('NAME', 'score')]),
    expr('kid_field', C.vars, '%1 . %2', [V('E'), T('KEY', 'name')]),
    expr('kid_list', C.lists, '[ %1 ]', [T('ITEMS', '"apple", "kiwi"')]),
    expr('kid_code', C.value, '( %1 )', [T('CODE', '1 + 2')]),
    expr('kid_call', C.recipe, '%1 ( %2 )', [T('NAME', 'my_recipe'), T('ARGS', '')]),
    expr('kid_arith', C.value, '%1 %2 %3', [V('A'), D('OP', [['+', '+'], ['-', '-'], ['\u00D7', '*'], ['\u00F7', '/'], ['mod', 'mod']]), V('B')]),
    expr('kid_compare', C.decide, '%1 %2 %3', [V('A'), D('OP', [['is', '='], ['is not', '!='], ['>', '>'], ['<', '<'], ['>=', '>='], ['<=', '<='], ['is bigger than', 'bigger'], ['is smaller than', 'smaller']]), V('B')]),
    expr('kid_logic', C.decide, '%1 %2 %3', [V('A'), D('OP', [['and', 'and'], ['or', 'or']]), V('B')]),
    expr('kid_not', C.decide, 'not %1', [V('A')]),
    expr('kid_neg', C.value, '- %1', [V('A')]),
    expr('kid_contains', C.lists, '%1 contains %2', [V('A'), V('B')]),
    expr('kid_startsends', C.lists, '%1 %2 %3', [V('A'), D('OP', [['starts with', 'starts'], ['ends with', 'ends']]), V('B')]),
    expr('kid_random', C.lists, 'random %1 to %2', [V('A'), V('B')]),
    expr('kid_randitem', C.lists, 'random item from %1', [V('A')]),
    expr('kid_item', C.lists, 'item %1 of %2', [V('A'), V('B')]),
    expr('kid_length', C.lists, 'length of %1', [V('A')]),
    expr('kid_split', C.lists, 'split %1 by %2', [V('A'), V('B')]),
    expr('kid_join', C.lists, 'join %1 with %2', [V('A'), V('B')]),
    expr('kid_replace', C.lists, 'replace %1 with %2 in %3', [V('A'), V('B'), V('C')]),
    expr('kid_keys', C.lists, 'keys of %1', [V('A')]),
    expr('kid_guess', C.ai, 'guess %1', [V('A')]),
    expr('kid_ainum', C.ai, '%1', [D('WHAT', [['how sure', 'howsure'], ['how accurate', 'howaccurate']])]),
    expr('kid_predict', C.ai, 'predict %1 for %2', [V('A'), V('B')]),
    expr('kid_chat', C.ai, 'chat %1', [V('A')]),
    expr('kid_stagepic', C.ai, 'stage picture', []),
    expr('kid_load', C.data, 'load %1', [V('A')]),
    expr('kid_keydown', C.game, 'key %1 is pressed', [V('A')]),
    expr('kid_pos', C.draw, '%1 position', [D('AXIS', [['x', 'x'], ['y', 'y']])]),
    expr('kid_spritepos', C.game, '%1 of sprite %2', [D('AXIS', [['x', 'x'], ['y', 'y']]), V('A')]),
    expr('kid_touches', C.game, '%1 touches %2', [V('A'), V('B')]),
    expr('kid_touchedge', C.game, '%1 touches edge', [V('A')])
  ];

  // ---------------------------------------------------------------- program tree -> blocks
  const n = (v) => ({ k: 'val', v });
  function exprBlock(e) {
    const b = (type, fields, inputs) => {
      const o = { type };
      if (fields) o.fields = fields;
      if (inputs) {
        o.inputs = {};
        for (const k of Object.keys(inputs)) if (inputs[k]) o.inputs[k] = { block: exprBlock(inputs[k]) };
      }
      return o;
    };
    switch (e.k) {
      case 'val':
        if (typeof e.v === 'number') return b('kid_num', { V: KidAI.printExpr(e) });
        if (typeof e.v === 'string') return b('kid_text', { V: e.v });
        return b('kid_bool', { V: e.v === null ? 'nothing' : e.v ? 'yes' : 'no' });
      case 'name': return b('kid_var', { NAME: e.raw });
      case 'field': return b('kid_field', { KEY: e.raw }, { E: e.a });
      case 'list':
        if (e.items.every(x => x.k === 'val')) return b('kid_list', { ITEMS: e.items.map(x => KidAI.printExpr(x)).join(', ') });
        return b('kid_code', { CODE: KidAI.printExpr(e) });
      case 'call':
        return b('kid_call', { NAME: e.raw, ARGS: e.args.map(x => KidAI.printExpr(x)).join(', ') });
      case 'bin':
        if (['+', '-', '*', '/', 'mod'].includes(e.op)) return b('kid_arith', { OP: e.op }, { A: e.a, B: e.b });
        return b('kid_compare', { OP: e.word === 'bigger' || e.word === 'smaller' ? e.word : e.op }, { A: e.a, B: e.b });
      case 'and': case 'or': return b('kid_logic', { OP: e.k }, { A: e.a, B: e.b });
      case 'not': return b('kid_not', null, { A: e.a });
      case 'neg': return b('kid_neg', null, { A: e.a });
      case 'contains': return b('kid_contains', null, { A: e.a, B: e.b });
      case 'starts': case 'ends': return b('kid_startsends', { OP: e.k }, { A: e.a, B: e.b });
      case 'random': return b('kid_random', null, { A: e.lo, B: e.hi });
      case 'randitem': return b('kid_randitem', null, { A: e.list });
      case 'item': return b('kid_item', null, { A: e.idx, B: e.list });
      case 'length': return b('kid_length', null, { A: e.a });
      case 'split': return b('kid_split', null, { A: e.a, B: e.b });
      case 'join': return b('kid_join', null, { A: e.a, B: e.b });
      case 'replace': return b('kid_replace', null, { A: e.a, B: e.b, C: e.c });
      case 'keys': return b('kid_keys', null, { A: e.a });
      case 'guess': return b('kid_guess', null, { A: e.a });
      case 'howsure': case 'howaccurate': return b('kid_ainum', { WHAT: e.k });
      case 'predict': return b('kid_predict', null, { A: e.name, B: e.x });
      case 'chat': return b('kid_chat', null, { A: e.a });
      case 'stagepic': return b('kid_stagepic');
      case 'load': return b('kid_load', null, { A: e.a });
      case 'keydown': return b('kid_keydown', null, { A: e.key });
      case 'turtlepos': return b('kid_pos', { AXIS: e.axis });
      case 'spritepos': return b('kid_spritepos', { AXIS: e.axis }, { A: e.name });
      case 'touches': return b('kid_touches', null, { A: e.a, B: e.b });
      case 'touchedge': return b('kid_touchedge', null, { A: e.a });
    }
    return b('kid_code', { CODE: KidAI.printExpr(e) });
  }
  function chain(list) {
    let first = null, last = null;
    for (const s of list) {
      const blk = stmtBlock(s);
      if (!blk) continue;
      if (!first) first = blk; else last.next = { block: blk };
      last = blk;
    }
    return first;
  }
  function stmtBlock(s) {
    const b = (type, fields, inputs, bodies) => {
      const o = { type };
      if (fields) o.fields = fields;
      o.inputs = {};
      if (inputs) for (const k of Object.keys(inputs)) if (inputs[k]) o.inputs[k] = { block: exprBlock(inputs[k]) };
      if (bodies) for (const k of Object.keys(bodies)) { const c = chain(bodies[k]); if (c) o.inputs[k] = { block: c }; }
      return o;
    };
    switch (s.type) {
      case 'blank': return null;
      case 'comment': return b('kid_comment', { TEXT: s.text });
      case 'say': return b('kid_say', null, { E: s.e });
      case 'ask': return b('kid_ask', { NAME: s.name.raw }, { E: s.e });
      case 'askpic': return b('kid_askpic', { NAME: s.name.raw }, { E: s.e });
      case 'wait': return b('kid_wait', null, { E: s.e });
      case 'set': return b('kid_set', { NAME: s.name.raw }, { E: s.e });
      case 'setfield': return b('kid_setfield', { PATH: s.name.raw + s.path.map(p => '.' + p.raw).join('') }, { E: s.e });
      case 'change': return b('kid_change', { NAME: s.name.raw }, { E: s.e });
      case 'add': return b('kid_add', { NAME: s.name.raw }, { E: s.e });
      case 'remove': return b('kid_remove', { NAME: s.name.raw }, { E: s.e });
      case 'setitem': return b('kid_setitem', { NAME: s.name.raw }, { I: s.idx, E: s.e });
      case 'if': {
        // if / else if / else become nested if-else blocks
        const build = (i) => {
          const br = s.branches[i];
          const rest = i + 1 < s.branches.length ? [{ type: 'if', branches: s.branches.slice(i + 1), otherwise: s.otherwise }] : s.otherwise;
          return rest ? b('kid_ifelse', null, { COND: br.cond }, { DO: br.body, ELSE: rest }) : b('kid_if', null, { COND: br.cond }, { DO: br.body });
        };
        return build(0);
      }
      case 'repeat': return b('kid_repeat', null, { E: s.count }, { DO: s.body });
      case 'until': return b('kid_until', null, { COND: s.cond }, { DO: s.body });
      case 'while': return b('kid_while', null, { COND: s.cond }, { DO: s.body });
      case 'forever': return b('kid_forever', null, null, { DO: s.body });
      case 'foreach': return b('kid_foreach', { NAME: s.name.raw }, { E: s.list }, { DO: s.body });
      case 'stop': case 'skip': case 'stopall': return b('kid_stop', { WHAT: s.type });
      case 'define': return b('kid_define', { NAME: s.name.raw, PARAMS: s.params.map(p => p.raw).join(', ') }, null, { DO: s.body });
      case 'giveback': return s.e ? b('kid_giveback', null, { E: s.e }) : b('kid_return');
      case 'callstmt': return b('kid_callstmt', { NAME: s.e.raw, ARGS: s.e.args.map(x => KidAI.printExpr(x)).join(', ') });
      case 'when': return b('kid_when', null, { E: s.label }, { DO: s.body });
      case 'whenkey': return b('kid_whenkey', null, { E: s.key }, { DO: s.body });
      case 'every': return b('kid_every', null, { E: s.e }, { DO: s.body });
      case 'use': return b('kid_use', null, { E: s.e });
      case 'move': return b('kid_move', { DIR: String(s.dir) }, { E: s.e });
      case 'turn': return b('kid_turn', { DIR: String(s.dir) }, { E: s.e });
      case 'turnto': return b('kid_turnto', null, { E: s.e });
      case 'pen': return b('kid_pen', { DOWN: s.down ? 'down' : 'up' });
      case 'pensize': return b('kid_pensize', null, { E: s.e });
      case 'color': return b('kid_color', null, { E: s.e });
      case 'circle': case 'dot': return b('kid_shape', { SHAPE: s.type }, { E: s.e });
      case 'rect': return b('kid_rect', null, { W: s.w, H: s.h });
      case 'write': return b('kid_write', null, { E: s.e });
      case 'background': return b('kid_background', null, { E: s.e });
      case 'goto': return b('kid_goto', null, { X: s.x, Y: s.y });
      case 'clear': case 'home': return b('kid_simple_draw', { WHAT: s.type });
      case 'visible': return b('kid_simple_draw', { WHAT: s.show ? 'unhide' : 'hide' });
      case 'sprite': return b('kid_sprite', null, { NAME: s.name, LOOK: s.look, X: s.x, Y: s.y, SIZE: s.size });
      case 'movesprite': return b('kid_movesprite', { HOW: s.by ? 'by' : 'to' }, { NAME: s.name, X: s.x, Y: s.y });
      case 'spritevis': return b('kid_spritevis', { WHAT: s.show ? 'show' : 'hide' }, { NAME: s.name });
      case 'deletesprite': return b('kid_spritevis', { WHAT: 'delete' }, { NAME: s.name });
      case 'note': return b('kid_note', null, { E: s.e, DUR: s.dur });
      case 'sound': return b('kid_sound', null, { E: s.e });
      case 'beep': return b('kid_beep');
      case 'teach': return b('kid_teach', null, { LABEL: s.label, E: s.e });
      case 'test': return b('kid_test', null, { LABEL: s.label, E: s.e });
      case 'learn': return b('kid_learn', null, { NAME: s.name, E: s.e });
      case 'saveai': return b('kid_saveai', { HOW: 'save' }, { KEY: s.key });
      case 'loadai': return b('kid_saveai', { HOW: 'load' }, { KEY: s.key });
      case 'forgetai': return b('kid_forgetai');
      case 'save': return b('kid_save', null, { E: s.e, KEY: s.key });
      case 'loadinto': return b('kid_loadinto', { NAME: s.name.raw }, { KEY: s.key });
    }
    throw new Error('No block for "' + s.type + '" yet');
  }
  // Lay the program out as stacks: consecutive normal lines form one stack; each define/when/every/use is its own stack.
  function programToJson(ast) {
    const stacks = [];
    let run = [];
    const flush = () => { if (run.length) { stacks.push(run); run = []; } };
    for (const s of ast.body) {
      if (['define', 'when', 'whenkey', 'every', 'use'].includes(s.type)) { flush(); stacks.push([s]); }
      else if (s.type === 'blank') flush();
      else run.push(s);
    }
    flush();
    const blocks = [];
    let y = 20;
    for (const st of stacks) {
      const c = chain(st);
      if (!c) continue;
      c.x = 20; c.y = y;
      blocks.push(c);
      y += 40 + 34 * countLines(st);
    }
    return { blocks: { languageVersion: 0, blocks } };
  }
  function countLines(list) {
    let k = 0;
    for (const s of list) {
      k++;
      if (s.body) k += countLines(s.body) + 1;
      if (s.branches) s.branches.forEach(b2 => { k += countLines(b2.body) + 1; });
      if (s.otherwise) k += countLines(s.otherwise) + 1;
    }
    return k;
  }

  // ---------------------------------------------------------------- blocks -> program tree
  const NAME_RE = /^[\p{L}_][\p{L}\p{N}_]*$/u;
  function jsonToProgram(json) {
    const problems = [];
    const top = ((json && json.blocks && json.blocks.blocks) || []).slice().sort((a, b) => (a.y || 0) - (b.y || 0) || (a.x || 0) - (b.x || 0));
    const nameOf = (raw, what) => {
      const t = String(raw || '').trim();
      if (!NAME_RE.test(t)) { problems.push('The name "' + t + '" in a ' + what + ' block needs to be one word, like my_score.'); return { key: 'x', raw: 'x' }; }
      return { key: t.toLowerCase(), raw: t };
    };
    const parseExpr = (code, where) => {
      try {
        const p = KidAI.parse('say ' + code);
        if (p.body.length === 1 && p.body[0].type === 'say') return p.body[0].e;
      } catch (e) { /* fall through */ }
      problems.push('I can\'t read "' + code + '" in a ' + where + ' block.');
      return n(0);
    };
    const parseArgs = (text, where) => {
      if (!String(text).trim()) return [];
      try {
        const p = KidAI.parse('say f(' + text + ')');
        return p.body[0].e.args;
      } catch (e) { problems.push('I can\'t read the inputs "' + text + '" in a ' + where + ' block.'); return []; }
    };
    const field = (blk, k) => (blk.fields && blk.fields[k] !== undefined ? blk.fields[k] : '');
    function E(blk, k, what, optional) {
      const inp = blk.inputs && blk.inputs[k] && blk.inputs[k].block;
      if (!inp) { if (!optional) problems.push('A "' + what + '" block has an empty slot. Drop a value into it.'); return optional ? null : n(0); }
      return ex(inp);
    }
    function ex(blk) {
      const A = (what) => E(blk, 'A', what), B = (what) => E(blk, 'B', what);
      switch (blk.type) {
        case 'kid_num': {
          const t = String(field(blk, 'V')).trim();
          if (!/^-?\d+(\.\d+)?$/.test(t)) { problems.push('"' + t + '" is not a number. Use a text block for words.'); return n(0); }
          const v = parseFloat(t);
          return v < 0 ? { k: 'neg', a: n(-v) } : n(v);
        }
        case 'kid_text': return n(String(field(blk, 'V')));
        case 'kid_bool': { const v = field(blk, 'V'); return n(v === 'nothing' ? null : v === 'yes'); }
        case 'kid_var': { const nm = nameOf(field(blk, 'NAME'), 'variable'); return { k: 'name', key: nm.key, raw: nm.raw }; }
        case 'kid_field': { const key = String(field(blk, 'KEY')).trim(); return { k: 'field', a: E(blk, 'E', 'field'), key: key.toLowerCase(), raw: key }; }
        case 'kid_list': return parseExpr('[' + field(blk, 'ITEMS') + ']', 'list');
        case 'kid_code': return parseExpr(field(blk, 'CODE'), 'code');
        case 'kid_call': { const nm = nameOf(field(blk, 'NAME'), 'recipe'); return { k: 'call', key: nm.key, raw: nm.raw, args: parseArgs(field(blk, 'ARGS'), 'recipe') }; }
        case 'kid_arith': return { k: 'bin', op: field(blk, 'OP'), a: A('maths'), b: B('maths') };
        case 'kid_compare': {
          const op = field(blk, 'OP');
          if (op === 'bigger' || op === 'smaller') return { k: 'bin', op: op === 'bigger' ? '>' : '<', word: op, a: A('compare'), b: B('compare') };
          return { k: 'bin', op, a: A('compare'), b: B('compare') };
        }
        case 'kid_logic': return { k: field(blk, 'OP'), a: A('and/or'), b: B('and/or') };
        case 'kid_not': return { k: 'not', a: A('not') };
        case 'kid_neg': return { k: 'neg', a: A('minus') };
        case 'kid_contains': return { k: 'contains', a: A('contains'), b: B('contains') };
        case 'kid_startsends': return { k: field(blk, 'OP'), a: A('starts with'), b: B('starts with') };
        case 'kid_random': return { k: 'random', lo: A('random'), hi: B('random') };
        case 'kid_randitem': return { k: 'randitem', list: A('random item') };
        case 'kid_item': return { k: 'item', idx: A('item'), list: B('item') };
        case 'kid_length': return { k: 'length', a: A('length') };
        case 'kid_split': return { k: 'split', a: A('split'), b: B('split') };
        case 'kid_join': return { k: 'join', a: A('join'), b: B('join') };
        case 'kid_replace': return { k: 'replace', a: A('replace'), b: B('replace'), c: E(blk, 'C', 'replace') };
        case 'kid_keys': return { k: 'keys', a: A('keys') };
        case 'kid_guess': return { k: 'guess', a: A('guess') };
        case 'kid_ainum': return { k: field(blk, 'WHAT') };
        case 'kid_predict': return { k: 'predict', name: A('predict'), x: B('predict') };
        case 'kid_chat': return { k: 'chat', a: A('chat') };
        case 'kid_stagepic': return { k: 'stagepic' };
        case 'kid_load': return { k: 'load', a: A('load') };
        case 'kid_keydown': return { k: 'keydown', key: A('key pressed') };
        case 'kid_pos': return { k: 'turtlepos', axis: field(blk, 'AXIS') };
        case 'kid_spritepos': return { k: 'spritepos', axis: field(blk, 'AXIS'), name: A('sprite position') };
        case 'kid_touches': return { k: 'touches', a: A('touches'), b: B('touches') };
        case 'kid_touchedge': return { k: 'touchedge', a: A('touches edge') };
      }
      problems.push('This block can\'t be used as a value: ' + blk.type.replace('kid_', ''));
      return n(0);
    }
    function body(blk, k) {
      const first = blk.inputs && blk.inputs[k] && blk.inputs[k].block;
      return seq(first, false);
    }
    function seq(first, topLevel) {
      const out = [];
      for (let blk = first; blk; blk = blk.next && blk.next.block) {
        const s = st(blk, topLevel);
        if (s) { if (blk.id) s._bid = blk.id; out.push(s); }
      }
      return out;
    }
    function st(blk, topLevel) {
      const N = (k, what) => nameOf(field(blk, k), what);
      const e = (k, what, opt) => E(blk, k, what, opt);
      switch (blk.type) {
        case 'kid_comment': return { type: 'comment', text: String(field(blk, 'TEXT')) };
        case 'kid_say': return { type: 'say', e: e('E', 'say') };
        case 'kid_ask': return { type: 'ask', e: e('E', 'ask'), name: N('NAME', 'ask') };
        case 'kid_askpic': return { type: 'askpic', e: e('E', 'ask picture'), name: N('NAME', 'ask picture') };
        case 'kid_wait': return { type: 'wait', e: e('E', 'wait') };
        case 'kid_set': return { type: 'set', name: N('NAME', 'set'), e: e('E', 'set') };
        case 'kid_setfield': {
          const parts = String(field(blk, 'PATH')).split('.').map(x => x.trim());
          if (parts.length < 2 || !parts.every(p => NAME_RE.test(p))) { problems.push('Write the field like pet.name in the "set" block.'); return null; }
          return { type: 'setfield', name: { key: parts[0].toLowerCase(), raw: parts[0] }, path: parts.slice(1).map(p => ({ key: p.toLowerCase(), raw: p })), e: e('E', 'set') };
        }
        case 'kid_change': return { type: 'change', name: N('NAME', 'change'), e: e('E', 'change') };
        case 'kid_add': return { type: 'add', e: e('E', 'add'), name: N('NAME', 'add') };
        case 'kid_remove': return { type: 'remove', e: e('E', 'remove'), name: N('NAME', 'remove') };
        case 'kid_setitem': return { type: 'setitem', idx: e('I', 'set item'), name: N('NAME', 'set item'), e: e('E', 'set item') };
        case 'kid_if': case 'kid_ifelse': {
          const branches = [{ cond: e('COND', 'if'), body: body(blk, 'DO') }];
          let otherwise = null;
          if (blk.type === 'kid_ifelse') {
            const els = body(blk, 'ELSE');
            if (els.length === 1 && els[0].type === 'if') { branches.push(...els[0].branches); otherwise = els[0].otherwise; }
            else otherwise = els;
          }
          return { type: 'if', branches, otherwise };
        }
        case 'kid_repeat': return { type: 'repeat', count: e('E', 'repeat'), body: body(blk, 'DO') };
        case 'kid_until': return { type: 'until', cond: e('COND', 'repeat until'), body: body(blk, 'DO') };
        case 'kid_while': return { type: 'while', cond: e('COND', 'repeat while'), body: body(blk, 'DO') };
        case 'kid_forever': return { type: 'forever', body: body(blk, 'DO') };
        case 'kid_foreach': return { type: 'foreach', name: N('NAME', 'for each'), list: e('E', 'for each'), body: body(blk, 'DO') };
        case 'kid_stop': return { type: field(blk, 'WHAT') };
        case 'kid_define': {
          if (!topLevel) { problems.push('A "define" block must sit on its own, not inside another block.'); return null; }
          const params = String(field(blk, 'PARAMS')).split(',').map(x => x.trim()).filter(Boolean).map(p => nameOf(p, 'define'));
          return { type: 'define', name: N('NAME', 'define'), params, body: body(blk, 'DO') };
        }
        case 'kid_giveback': return { type: 'giveback', e: e('E', 'give back') };
        case 'kid_return': return { type: 'giveback', e: null };
        case 'kid_callstmt': { const nm = N('NAME', 'do'); return { type: 'callstmt', e: { k: 'call', key: nm.key, raw: nm.raw, args: parseArgs(field(blk, 'ARGS'), 'do') } }; }
        case 'kid_when': return { type: 'when', label: e('E', 'when clicked'), body: body(blk, 'DO') };
        case 'kid_whenkey': return { type: 'whenkey', key: e('E', 'when key'), body: body(blk, 'DO') };
        case 'kid_every': return { type: 'every', e: e('E', 'every'), body: body(blk, 'DO') };
        case 'kid_use': return { type: 'use', e: e('E', 'use') };
        case 'kid_move': return { type: 'move', e: e('E', 'forward'), dir: Number(field(blk, 'DIR')) };
        case 'kid_turn': return { type: 'turn', e: e('E', 'turn'), dir: Number(field(blk, 'DIR')) };
        case 'kid_turnto': return { type: 'turnto', e: e('E', 'turn to') };
        case 'kid_pen': return { type: 'pen', down: field(blk, 'DOWN') === 'down' };
        case 'kid_pensize': return { type: 'pensize', e: e('E', 'pen size') };
        case 'kid_color': return { type: 'color', e: e('E', 'color') };
        case 'kid_shape': return { type: field(blk, 'SHAPE'), e: e('E', field(blk, 'SHAPE')) };
        case 'kid_rect': return { type: 'rect', w: e('W', 'rectangle'), h: e('H', 'rectangle') };
        case 'kid_write': return { type: 'write', e: e('E', 'write') };
        case 'kid_background': return { type: 'background', e: e('E', 'background') };
        case 'kid_goto': return { type: 'goto', x: e('X', 'go to'), y: e('Y', 'go to') };
        case 'kid_simple_draw': {
          const w = field(blk, 'WHAT');
          return w === 'hide' || w === 'unhide' ? { type: 'visible', show: w === 'unhide' } : { type: w };
        }
        case 'kid_sprite': {
          const x = e('X', 'make sprite', true), y = e('Y', 'make sprite', true);
          if (!!x !== !!y) problems.push('A "make sprite" block needs both numbers after "at", or neither.');
          return { type: 'sprite', name: e('NAME', 'make sprite'), look: e('LOOK', 'make sprite'), x: x && y ? x : null, y: x && y ? y : null, size: e('SIZE', 'make sprite', true) };
        }
        case 'kid_movesprite': return { type: 'movesprite', name: e('NAME', 'move sprite'), by: field(blk, 'HOW') === 'by', x: e('X', 'move sprite'), y: e('Y', 'move sprite') };
        case 'kid_spritevis': {
          const w = field(blk, 'WHAT');
          return w === 'delete' ? { type: 'deletesprite', name: e('NAME', 'delete sprite') } : { type: 'spritevis', show: w === 'show', name: e('NAME', 'sprite') };
        }
        case 'kid_note': return { type: 'note', e: e('E', 'play note'), dur: e('DUR', 'play note', true) };
        case 'kid_sound': return { type: 'sound', e: e('E', 'play sound') };
        case 'kid_beep': return { type: 'beep' };
        case 'kid_teach': return { type: 'teach', label: e('LABEL', 'teach'), e: e('E', 'teach') };
        case 'kid_test': return { type: 'test', label: e('LABEL', 'test'), e: e('E', 'test') };
        case 'kid_learn': return { type: 'learn', name: e('NAME', 'learn'), e: e('E', 'learn') };
        case 'kid_saveai': return { type: field(blk, 'HOW') === 'save' ? 'saveai' : 'loadai', key: e('KEY', 'ai') };
        case 'kid_forgetai': return { type: 'forgetai' };
        case 'kid_save': return { type: 'save', e: e('E', 'save'), key: e('KEY', 'save') };
        case 'kid_loadinto': return { type: 'loadinto', key: e('KEY', 'load'), name: N('NAME', 'load') };
      }
      // A loose value block on its own: ignore it, but say so.
      problems.push('A loose "' + blk.type.replace('kid_', '') + '" block isn\'t connected to anything, so it was left out.');
      return null;
    }
    const body0 = [];
    top.forEach((blk, i) => {
      if (i > 0 && body0.length) body0.push({ type: 'blank' });
      body0.push(...seq(blk, true));
    });
    return { ast: { body: body0 }, problems: Array.from(new Set(problems)) };
  }

  // ---------------------------------------------------------------- toolbox
  function sample(src) { return programToJson(KidAI.parse(src, { keepComments: true })).blocks.blocks[0]; }
  let TR = (x) => x;
  function cat(name, colour, srcs) {
    return { kind: 'category', name: TR(name), colour, contents: srcs.map(src => ({ kind: 'block', blockxml: undefined, ...asToolbox(src) })) };
  }
  function asToolbox(src) {
    if (typeof src === 'object') return src;
    const blk = sample(src);
    delete blk.x; delete blk.y;
    const strip = (b) => { if (b.next) delete b.next; return b; };
    return Object.assign({ type: blk.type }, strip(blk));
  }
  function toolbox(tr) {
    if (tr) TR = tr;
    const expr1 = (code) => ({ type: 'kid_code', fields: { CODE: code } });
    return {
      kind: 'categoryToolbox',
      contents: [
        cat('Talk', C.talk, ['say "Hello!"', 'ask "What is your name?" into name', 'wait 1', '# a note for humans']),
        cat('Values', C.value, [{ type: 'kid_num', fields: { V: '10' } }, { type: 'kid_text', fields: { V: 'hello' } }, { type: 'kid_bool' }, { type: 'kid_var', fields: { NAME: 'score' } },
          'say 1 + 2', 'say -x', { type: 'kid_code', fields: { CODE: '(1 + 2) * 3' } }]),
        cat('Variables', C.vars, ['set score to 0', 'change score by 1', 'set pet.name to "Rex"', { type: 'kid_field', fields: { KEY: 'name' } }]),
        cat('Decide', C.decide, ['if score > 5:\n  say "Big!"\nend', 'if score > 5:\n  say "Big!"\nelse:\n  say "Small"\nend', 'say a is b', 'say a and b', 'say not a']),
        cat('Loops', C.loop, ['repeat 3 times:\n  say "hi"\nend', 'repeat until n is 5:\n  change n by 1\nend', 'repeat while n < 5:\n  change n by 1\nend',
          'repeat forever:\n  wait 0.1\nend', 'for each pet in pets:\n  say pet\nend', 'stop']),
        cat('Lists & text', C.lists, ['say ["apple", "kiwi"]', 'add "mango" to fruits', 'remove "kiwi" from fruits', 'set item 1 of fruits to "fig"', 'say item 1 of fruits',
          'say length of fruits', 'say fruits contains "kiwi"', 'say random 1 to 6', 'say random item from fruits', 'say split "a,b" by ","', 'say join fruits with ", "',
          'say replace "cat" with "dog" in words', 'say words starts with "I"', 'say keys of pet']),
        cat('Recipes', C.recipe, ['define greet(name):\n  say "Hi " + name\nend', 'define double(n):\n  give back n * 2\nend', 'greet("Mira")', 'say double(4)',
          'when clicked "Jump":\n  say "Boing!"\nend', 'use "my helpers"']),
        cat('Drawing', C.draw, ['forward 100', 'turn right 90', 'turn to 90', 'pen up', 'pen size 5', 'color "red"', 'circle 40', 'rectangle 80, 40', 'write "Hi!"',
          'background "skyblue"', 'go to 0, 0', 'clear', 'say x position']),
        cat('Games', C.game, ['make sprite "cat" as "🐱" at 0, 0 size 50', 'move sprite "cat" by 10, 0', 'hide sprite "cat"', 'say "cat" touches "fish"',
          'say "cat" touches edge', 'say x of sprite "cat"', 'when key "space" pressed:\n  beep\nend', 'say key "left" is pressed', 'every 1 second:\n  beep\nend',
          'stop everything']),
        cat('Sound', C.sound, ['play note "C" for 0.5', 'play sound "coin"', 'beep']),
        cat('AI', C.ai, ['teach "happy" with ["yay", "so fun"]', 'say guess "what fun"', 'say how sure', 'test "happy" with ["fun day"]', 'say how accurate',
          'ask picture "Draw a cat" into cat1', 'say stage picture', 'learn "plant" from [[1, 2], [2, 4]]', 'say predict "plant" for 5', 'say chat "Why is the sky blue?"',
          'save ai as "moods"', 'forget ai']),
        cat('Saving', C.data, ['save score as "best"', 'load "best" into best', 'say load "best"']),
        { kind: 'category', name: TR('Code'), colour: C.value, contents: [{ kind: 'block', type: 'kid_code', fields: { CODE: '1 + 2' } }, expr1('[1, 2, 3]')].map(x => (x.kind ? x : { kind: 'block', ...x })) }
      ].map(c => ({ ...c, contents: c.contents.map(x => (x.kind === 'block' ? x : { kind: 'block', ...x })) }))
    };
  }
  // In toolbox samples, "say X" stands for the value block X alone.
  function unwrapSay(item) {
    if (item.type === 'kid_say' && item.inputs && item.inputs.E) {
      const inner = item.inputs.E.block;
      return Object.assign({ kind: 'block' }, inner);
    }
    return item;
  }

  // ---------------------------------------------------------------- browser editor
  let ws = null, mounted = false;
  function readyToolbox(tr) {
    const tb = toolbox(tr);
    tb.contents.forEach(c => { c.contents = c.contents.map(unwrapSay).map(x => { const y = Object.assign({}, x); delete y.blockxml; return y; }); });
    return tb;
  }
  function mount(el, tr) {
    const Blockly = root.Blockly;
    if (!Blockly) throw new Error('Blockly is not loaded');
    if (!mounted) { Blockly.common.defineBlocksWithJsonArray(DEFS); mounted = true; }
    const tb = readyToolbox(tr);
    ws = Blockly.inject(el, {
      toolbox: tb, trashcan: false, scrollbars: true, sounds: false,
      zoom: { controls: false, wheel: true, startScale: 0.9, maxScale: 2, minScale: 0.4 },
      grid: { spacing: 24, length: 2, colour: '#d3dcec', snap: true },
      renderer: 'zelos', theme: Blockly.Themes.Classic
    });
    return ws;
  }
  function show(source) {
    const json = programToJson(KidAI.parse(source, { keepComments: true }));
    root.Blockly.serialization.workspaces.load(json, ws);
  }
  function read() {
    const json = root.Blockly.serialization.workspaces.save(ws);
    const r = jsonToProgram(json);
    return { text: KidAI.printProgram(r.ast), problems: r.problems };
  }

  const KidBlocks = { DEFS, programToJson, jsonToProgram, toolbox: readyToolbox, mount, show, read, workspace: () => ws };
  if (typeof module !== 'undefined' && module.exports) module.exports = KidBlocks;
  else root.KidBlocks = KidBlocks;
})(typeof window !== 'undefined' ? window : globalThis);
