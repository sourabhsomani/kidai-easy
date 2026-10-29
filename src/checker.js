// KidAI Easy: checker.js
// "kidai check": finds likely mistakes without running the program.
'use strict';

const { HI_HINT, HI_MSG, translateText } = require('./messages');
const { KidError } = require('./errors');
const { closest } = require('./values');
const { parse } = require('./parser');
const { BUILTINS } = require('./runtime-helpers');

// Finds likely mistakes without running the program.
function check(source, options) {
  const problems = [];
  let ast;
  try { ast = parse(source); } catch (e) {
    if (e instanceof KidError) return [{ line: e.kidLine, level: 'error', message: e.message, hint: e.hint }];
    throw e;
  }
  const add = (line, level, message, hint) => problems.push({ line, level, message: translateText(message, HI_MSG), hint: translateText(hint || '', HI_HINT) });
  const recipes = new Map(Object.entries((options && options.recipes) || {}));
  const globalsSet = new Set(['answer']);
  const each = (body, fn) => { for (const s of body) { fn(s); for (const b of [s.body, s.otherwise]) if (b) each(b, fn); if (s.branches) s.branches.forEach(br => each(br.body, fn)); } };
  for (const s of ast.body) if (s.type === 'define') recipes.set(s.name.key, s.params.length);
  const setsIn = (body, set) => each(body, (s) => {
    if (['set', 'ask', 'askpic', 'loadinto', 'foreach'].includes(s.type)) set.add(s.name.key);
    if (s.type === 'ask' || s.type === 'askpic') set.add(s.name.key);
  });
  setsIn(ast.body.filter(s => s.type !== 'define'), globalsSet);
  for (const s of ast.body) if (s.type !== 'define') { /* events count as global too */ }
  const exprs = (e, fn) => {
    if (!e || typeof e !== 'object') return;
    if (typeof e.k === 'string') fn(e);
    for (const k of Object.keys(e)) {
      const v = e[k];
      if (Array.isArray(v)) v.forEach(x => exprs(x && x.e && !x.k ? x.e : x, fn));
      else if (v && typeof v === 'object' && k !== 'name' && k !== 'path') exprs(v, fn);
    }
  };
  const stmtExprs = (s) => Object.keys(s).filter(k => !['body', 'otherwise', 'branches', 'name', 'params', 'path', 'type', 'line'].includes(k)).map(k => s[k]).concat(s.branches ? s.branches.map(b => b.cond) : []);
  // scan walks the AST tree and reports problems without running the program.
  // locals tracks variables set inside the current recipe; inRecipe/inLoop control which checks apply.
  function scan(body, locals, inRecipe, inLoop) {
    for (const s of body) {
      for (const e of stmtExprs(s)) exprs(e, (x) => {
        if (x.k === 'name' && !locals.has(x.key) && !globalsSet.has(x.key) && !recipes.has(x.key) && x.key !== 'direction' && x.key !== 'timer') {
          const near = closest(x.key, [...globalsSet, ...locals]);
          add(x.line || s.line, 'warning', '"' + x.raw + '" is used but never set.', near ? 'Did you mean "' + near + '"?' : 'Make it first with: set ' + x.raw + ' to ...');
        }
        if (x.k === 'call' && !BUILTINS[x.key]) {
          if (!recipes.has(x.key)) add(x.line || s.line, 'error', 'I don\'t know a recipe called "' + x.raw + '".', 'Make it first with: define ' + x.raw + '(): ... end');
          else if (recipes.get(x.key) !== x.args.length) add(x.line || s.line, 'error', '"' + x.raw + '" needs ' + recipes.get(x.key) + ' input' + (recipes.get(x.key) === 1 ? '' : 's') + ', but gets ' + x.args.length + '.', '');
        }
      });
      if (s.type === 'callstmt' && s.e.bare && !recipes.has(s.e.key)) add(s.line, 'error', 'I don\'t know how to "' + s.e.raw + '".', '');
      if (s.type === 'giveback' && !inRecipe) add(s.line, 'error', '"give back" only works inside a recipe (define ... end).', '');
      if (s.type === 'forever') {
        let waits = false, stops = false;
        each(s.body, (t) => { if (['wait', 'ask', 'askpic', 'note', 'beep'].includes(t.type)) waits = true; if (t.type === 'stop' || t.type === 'stopall') stops = true; });
        if (!waits && !stops) add(s.line, 'warning', 'This "repeat forever" never waits, so it will be stopped after a moment.', 'Add "wait 0.05" inside it.');
      }
      if (s.type === 'define') {
        const own = new Set(s.params.map(p => p.key));
        setsIn(s.body, own);
        scan(s.body, own, true, false);
        continue;
      }
      const loop = ['repeat', 'while', 'until', 'forever', 'foreach'].includes(s.type);
      if (s.body) scan(s.body, locals, inRecipe, inLoop || loop);
      if (s.branches) s.branches.forEach(b => scan(b.body, locals, inRecipe, inLoop));
      if (s.otherwise) scan(s.otherwise, locals, inRecipe, inLoop);
    }
  }
  scan(ast.body, new Set(), false, false);
  problems.sort((a, b) => a.line - b.line);
  return problems;
}

module.exports = { check };
