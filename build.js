// Builds the two files people actually use:
//   kidai.js         all of src/ joined into one file (browser and Node, no dependencies)
//   playground.html  playground.src.html with kidai.js and blocks.js put inside it
// Run: node build.js
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');

// Collect src/index.js and everything it requires, in the order they are first needed.
function collect() {
  const order = [];
  const seen = new Set();
  (function visit(name) {
    if (seen.has(name)) return;
    seen.add(name);
    const text = fs.readFileSync(path.join(SRC, name + '.js'), 'utf8');
    for (const m of text.matchAll(/require\('\.\/([\w-]+)'\)/g)) visit(m[1]);
    order.push({ name, text });
  })('index');
  return order;
}

function bundle() {
  const files = collect();
  const indent = (t) => t.replace(/\n$/, '').split('\n').map(l => (l ? '      ' + l : l)).join('\n');
  const out = [
    '/*',
    ' * KidAI Easy: a friendly programming language for kids (ages 8+).',
    ' * Works in the browser (window.KidAI) and in Node.js (require(\'./kidai.js\')).',
    ' *',
    ' * THIS FILE IS MADE BY "node build.js". Do not edit it: edit the files in src/ instead.',
    ' * src/README.md explains which file does what.',
    ' */',
    '(function (root) {',
    "  'use strict';",
    '  const sources = {',
    files.map(f => "    './" + f.name + "': function (module, exports, require) {\n" + indent(f.text) + '\n    }').join(',\n'),
    '  };',
    '  const loaded = {};',
    '  function load(name) {',
    '    if (!loaded[name]) {',
    '      const module = { exports: {} };',
    '      loaded[name] = module;',
    '      sources[name](module, module.exports, load);',
    '    }',
    '    return loaded[name].exports;',
    '  }',
    "  const KidAI = load('./index');",
    "  if (typeof module !== 'undefined' && module.exports) module.exports = KidAI;",
    '  else root.KidAI = KidAI;',
    "})(typeof window !== 'undefined' ? window : globalThis);",
    '',
  ].join('\n');
  fs.writeFileSync(path.join(__dirname, 'kidai.js'), out);
  console.log('built kidai.js from ' + files.length + ' files in src/');
  return out;
}

const js = bundle();
const page = fs.readFileSync(path.join(__dirname, 'playground.src.html'), 'utf8');
const blocks = fs.readFileSync(path.join(__dirname, 'blocks.js'), 'utf8');
fs.writeFileSync(path.join(__dirname, 'playground.html'), page.replace('/*KIDAI_JS*/', () => js).replace('/*BLOCKS_JS*/', () => blocks));
console.log('built playground.html');
