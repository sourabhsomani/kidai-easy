#!/usr/bin/env node
// The "kidai" command. Run "kidai --help" to see everything it can do.
const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const KidAI = require('./kidai.js');
const { createStage, needs: stageNeeds, isColor } = require('./cli-stage.js');
const { askClaude } = require('./gateway/safety.js');
const CHAT_LIMIT = Number(process.env.KIDAI_PER_HOUR || 30); // questions per run when using ANTHROPIC_API_KEY directly
let chats = 0;

const argv = process.argv.slice(2);
const flags = new Set(argv.filter(a => a.startsWith('--')));
const flagValue = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
const args = argv.filter((a, i) => !a.startsWith('--') && !['--lang', '--out', '-o'].includes(argv[i - 1]) && a !== '-o');
const LANG = flagValue('--lang') || process.env.KIDAI_LANG || 'en';
KidAI.setLanguage(LANG);
const hi = LANG === 'hi';
const say = (en, hindi) => (hi && hindi ? hindi : en);

const HELP = `KidAI Easy ${KidAI.version} - code in plain English

  kidai my_program.kid          run a program
  kidai new my_program          make a new starter program (my_program.kid)
  kidai check my_program.kid    find mistakes without running the program
  kidai fmt my_program.kid      tidy the spacing (add --check to only look)
  kidai svg my_program.kid      save the drawing as my_program.svg (or --out picture.svg)
  kidai core my_program.kid     show the grown-up KidAI Core version
  kidai test [folder]           run every .kid file in a folder and report problems
  kidai --version | --help

Options: --lang hi (messages in Hindi)
  chat: KIDAI_CHAT_URL=... (a chat gateway) or ANTHROPIC_API_KEY=... (set by a grown-up)
Drawing, sprites, sound, keys, buttons and "ask picture" open a stage window in your web browser.
  --no-window keeps everything in the terminal. KIDAI_NO_BROWSER=1 only prints the window's address.`;

function oops(e) {
  if (e instanceof KidAI.KidError) {
    console.log('\n' + say(`Oops on line ${e.kidLine}: `, `उफ़! लाइन ${e.kidLine}: `) + e.message);
    if (e.hint) console.log(say('Tip: ', 'सुझाव: ') + e.hint);
  } else console.log(e);
  process.exitCode = 1;
}
function readSource(file) {
  if (!file || !fs.existsSync(file)) {
    console.log(say(`I can't find the file "${file || ''}". Check the name and try again.`, `मुझे "${file || ''}" फ़ाइल नहीं मिली। नाम जाँचकर फिर कोशिश कीजिए।`));
    process.exit(1);
  }
  return fs.readFileSync(file, 'utf8');
}

// ---------------------------------------------------------------- a host for the terminal
function terminalHost(file, opts) {
  opts = opts || {};
  const rl = opts.quiet ? null : readline.createInterface({ input: process.stdin, output: process.stdout });
  const lines = [];
  if (rl) rl.on('line', l => { const w = lines.waiter; lines.waiter = null; w ? w(l) : lines.push(l); });
  if (rl) rl.on('close', () => { lines.closed = true; const w = lines.waiter; lines.waiter = null; if (w) { console.log(); w(''); } }); // input ended: answer with nothing
  if (rl) rl.on('SIGINT', () => process.emit('SIGINT')); // Ctrl+C still stops the program while it waits for an answer
  let drewNote = false;
  const note = () => { if (!drewNote && !opts.quiet && !opts.svg) { drewNote = true; console.log(say('(Drawings and sprites don\'t show with --no-window. To save the drawing, try: kidai svg ' + path.basename(file) + ')', '(--no-window के साथ चित्र और sprites नहीं दिखते। चित्र सेव करने के लिए आज़माइए: kidai svg ' + path.basename(file) + ')')); } };
  const log = opts.quiet ? () => {} : (t) => console.log(t);
  // The stage window (cli-stage.js) shows drawings, sprites and the drawing pad, plays sounds and sends keys.
  const stage = opts.stage || null;
  const host = {
    rl,
    stage,
    askPicture: stage ? async q => {
      log('🎨 ' + q);
      log(say('   (Draw it on the stage window in your web browser.)', '   (वेब ब्राउज़र की स्टेज विंडो में बनाइए।)'));
      const pic = await stage.askPicture(q);
      log(say('   Got your picture!', '   आपकी तस्वीर मिल गई!'));
      return pic;
    } : undefined,
    say: stage ? t => { log(t); stage.say(t); } : log,
    ask: q => new Promise(res => {
      if (opts.quiet) return res(opts.answer || '');
      if (stage) stage.asked(q);
      process.stdout.write(q + ' ');
      if (lines.length) { const l = lines.shift(); console.log(l); res(l); } else if (lines.closed) { console.log(); res(''); } else lines.waiter = res;
    }),
    line: note, circle: note, write: note, rect: note, background: note, sprites: note,
    note: (f, d, name) => log('♪ ' + name),
    sound: name => log('♪ ' + name + '!'),
    listenKeys: () => log(say('(Keyboard controls need the stage window. Run without --no-window.)', '(कीबोर्ड वाले खेलों के लिए स्टेज विंडो चाहिए। --no-window के बिना चलाइए।)')),
    button: label => log(say(`(Button "${label}" needs the stage window. Run without --no-window.)`, `(बटन "${label}" के लिए स्टेज विंडो चाहिए। --no-window के बिना चलाइए।)`)),
    checkColor: isColor,
    ai: g => {
      log(say(`  [AI guess: ${g.label}, ${g.sure}% sure, learned from ${g.examples} examples on this computer. AI can be wrong!]`,
        `  [AI का अंदाज़ा: ${g.label}, ${g.sure}% पक्का, इस कंप्यूटर पर ${g.examples} उदाहरणों से सीखा। AI गलत भी हो सकता है!]`));
      if (g.picture && g.closest && g.closest.length) log(say(`  [Closest pictures it learned: ${g.closest.map(c => c.label + ' (' + c.alike + '% alike)').join(', ')}]`, `  [सबसे मिलती-जुलती सीखी हुई तस्वीरें: ${g.closest.map(c => c.label + ' (' + c.alike + '% मिलती)').join(', ')}]`));
      if (g.reasons && g.reasons.length) log(say(`  [Why: the words ${g.reasons.map(r => '"' + r.word + '"').join(', ')} made it think "${g.label}".]`, `  [क्यों: शब्द ${g.reasons.map(r => '"' + r.word + '"').join(', ')} की वजह से इसने "${g.label}" सोचा।]`));
    },
    aiTest: r => {
      log(say(`  [AI test: ${r.correct} of ${r.total} "${r.label}" examples right (${r.percent}%).]`, `  [AI जाँच: "${r.label}" के ${r.total} में से ${r.correct} सही (${r.percent}%)।]`));
      r.wrong.forEach(w => log(say(`    - "${w.input}" was guessed as "${w.guessed}"`, `    - "${w.input}" को "${w.guessed}" समझा गया`)));
    },
    aiPredict: r => log(say(`  [AI prediction for "${r.name}": about ${r.output} (pattern: answer = ${Math.round(r.slope * 100) / 100} x input + ${Math.round(r.intercept * 100) / 100}, ${r.sure}% sure)]`,
      `  [AI का अनुमान "${r.name}": लगभग ${r.output} (पैटर्न: जवाब = ${Math.round(r.slope * 100) / 100} x इनपुट + ${Math.round(r.intercept * 100) / 100}, ${r.sure}% पक्का)]`)),
    storage: (() => {
      const dir = path.join(os.homedir(), '.kidai'), f = path.join(dir, 'saved.json');
      const read = () => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return {}; } };
      return {
        get: k => { const d = read(); return Object.prototype.hasOwnProperty.call(d, k) ? d[k] : null; },
        set: (k, v) => { const d = read(); d[k] = v; fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 1)); }
      };
    })(),
    readFile: name => {
      const f = path.resolve(path.dirname(file), name.endsWith('.kid') ? name : name + '.kid');
      return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
    },
    // chat: through a gateway (KIDAI_CHAT_URL), or straight to Claude when a grown-up sets ANTHROPIC_API_KEY.
    // Both use the same kid-safety rules (gateway/safety.js).
    chat: async q => {
      const noChat = () => new KidAI.KidError('chat needs a connection to a cloud AI, and there isn\'t one here.', null,
        'Ask a grown-up to set up the KidAI chat gateway, or to set ANTHROPIC_API_KEY before running kidai.');
      let reply;
      if (process.env.KIDAI_CHAT_URL) {
        const r = await fetch(process.env.KIDAI_CHAT_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: q }) }).catch(() => null);
        if (!r) throw noChat();
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new KidAI.KidError(j.error || 'The chat gateway said no.', null, 'Ask the grown-up who runs the gateway.');
        reply = j.reply;
      } else if (process.env.ANTHROPIC_API_KEY) {
        if (++chats > CHAT_LIMIT) throw new KidAI.KidError('That is a lot of questions! Take a break and try again later.', null, '');
        const r = await askClaude(q, process.env.ANTHROPIC_API_KEY);
        if (r.error) throw new KidAI.KidError(r.error, null, 'Check the internet connection, or ask a grown-up to check the API key.');
        reply = r.reply;
      } else throw noChat();
      log(say('  [Answer from a cloud AI. It can be wrong, so check it!]', '  [क्लाउड AI का जवाब। यह गलत हो सकता है, इसलिए जाँचिए!]'));
      return reply;
    }
  };
  if (stage) {
    const buttons = new Map();
    Object.assign(host, {
      line: (...a) => stage.line(...a), circle: (...a) => stage.circle(...a), rect: (...a) => stage.rect(...a),
      write: (...a) => stage.write(...a), background: c => stage.background(c), clear: () => stage.clear(),
      sprites: list => stage.sprites(list), turtle: t => stage.turtle(t),
      note: (f, d, name) => { stage.note(f, d, name); log('♪ ' + name); },
      sound: name => { stage.sound(name); log('♪ ' + name + '!'); },
      isKeyDown: k => stage.keysDown.has(k),
      listenKeys: keys => stage.keys(keys),
      button: (label, fire) => { buttons.set(label, fire); stage.button(label); },
      fireButton: label => { const f = buttons.get(label); if (f) f(); }
    });
  }
  return host;
}

// ---------------------------------------------------------------- svg export
function svgHost(base) {
  const parts = [];
  let bg = null, sprites = [], turtle = { x: 0, y: 0, heading: 0, visible: true };
  const X = (x) => (x + 200).toFixed(1), Y = (y) => (200 - y).toFixed(1);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  return Object.assign(base, {
    line: (x1, y1, x2, y2, c, s) => parts.push(`<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="${esc(c)}" stroke-width="${s}" stroke-linecap="round"/>`),
    circle: (x, y, r, c, s, down) => parts.push(down ? `<circle cx="${X(x)}" cy="${Y(y)}" r="${r}" fill="none" stroke="${esc(c)}" stroke-width="${s}"/>` : `<circle cx="${X(x)}" cy="${Y(y)}" r="${r}" fill="${esc(c)}"/>`),
    rect: (x, y, w, h, c) => parts.push(`<rect x="${X(x - w / 2)}" y="${Y(y + h / 2)}" width="${w}" height="${h}" fill="${esc(c)}"/>`),
    write: (t, x, y, c, px) => parts.push(`<text x="${X(x)}" y="${Y(y)}" fill="${esc(c)}" font-size="${px}" font-family="sans-serif" font-weight="700" text-anchor="middle" dominant-baseline="middle">${esc(t)}</text>`),
    background: (c) => { bg = c; },
    clear: () => { parts.length = 0; },
    sprites: (list) => { sprites = list.map(s => Object.assign({}, s)); },
    turtle: (t) => { turtle = Object.assign({}, t); },
    toSvg() {
      const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">`, `<rect width="400" height="400" fill="${esc(bg || '#ffffff')}"/>`, ...parts];
      for (const s of sprites) if (s.visible) out.push(`<text x="${X(s.x)}" y="${Y(s.y)}" font-size="${Array.from(s.look).length <= 2 ? s.size : s.size * 0.42}" text-anchor="middle" dominant-baseline="central" font-family="sans-serif">${esc(s.look)}</text>`);
      if (turtle.visible) out.push(`<g transform="translate(${X(turtle.x)} ${Y(turtle.y)}) rotate(${turtle.heading})"><path d="M0 -11 L7 7 L0 3.5 L-7 7 Z" fill="#ffb703" stroke="#17224a" stroke-width="1.5"/></g>`);
      out.push('</svg>');
      return out.join('\n') + '\n';
    }
  });
}

// ---------------------------------------------------------------- commands
async function main() {
  const cmd = args[0];
  if (!cmd || flags.has('--help') || cmd === 'help' || cmd === '-h') { console.log(HELP); return; }
  if (flags.has('--version') || cmd === '-v') { console.log(KidAI.version); return; }

  if (cmd === 'new') {
    const name = (args[1] || 'hello').replace(/\.kid$/, '') + '.kid';
    if (fs.existsSync(name)) { console.log(say(`${name} already exists, so I left it alone.`, `${name} पहले से है, इसलिए मैंने उसे नहीं छुआ।`)); process.exitCode = 1; return; }
    fs.writeFileSync(name, '# My first KidAI program\nsay "Hello! I am Sparky."\nask "What is your name?" into name\nsay "Nice to meet you, " + name + "!"\n');
    console.log(say(`Made ${name}. Run it with: kidai ${name}`, `${name} बन गई। चलाने के लिए: kidai ${name}`));
    return;
  }

  if (cmd === 'check') {
    const file = args[1], src = readSource(file);
    const probs = KidAI.check(src);
    if (!probs.length) { console.log(say(`${file}: no problems found.`, `${file}: कोई दिक्कत नहीं मिली।`)); return; }
    for (const p of probs) {
      console.log(`${file}:${p.line}: ${p.level === 'error' ? say('error', 'गलती') : say('warning', 'चेतावनी')}: ${p.message}${p.hint ? '\n    ' + say('Tip: ', 'सुझाव: ') + p.hint : ''}`);
    }
    if (probs.some(p => p.level === 'error')) process.exitCode = 1;
    return;
  }

  if (cmd === 'fmt') {
    const files = args.slice(1);
    if (!files.length) { console.log('Usage: kidai fmt file.kid [more.kid] [--check]'); process.exitCode = 1; return; }
    let changed = 0;
    for (const file of files) {
      const src = readSource(file);
      let out;
      try { out = KidAI.format(src); } catch (e) { console.log(file + ':'); oops(e); continue; }
      if (out !== src) {
        changed++;
        if (flags.has('--check')) console.log(say(`${file} needs tidying.`, `${file} को साफ़-सुथरा करना है।`));
        else { fs.writeFileSync(file, out); console.log(say(`Tidied ${file}`, `${file} साफ़-सुथरी कर दी`)); }
      }
    }
    if (!changed) console.log(say('Everything is already tidy.', 'सब पहले से साफ़-सुथरा है।'));
    if (changed && flags.has('--check')) process.exitCode = 1;
    return;
  }

  if (cmd === 'core') { const src = readSource(args[1]); try { process.stdout.write(KidAI.toCore(src)); } catch (e) { oops(e); } return; }

  if (cmd === 'svg') {
    const file = args[1], src = readSource(file);
    const out = flagValue('--out') || flagValue('-o') || file.replace(/\.kid$/, '') + '.svg';
    const host = svgHost(terminalHost(file, { quiet: !process.stdin.isTTY, svg: true }));
    const it = new KidAI.Interpreter(host);
    try { await it.run(src); } catch (e) { oops(e); }
    it.halt();
    if (host.rl) host.rl.close();
    fs.writeFileSync(out, host.toSvg());
    console.log(say(`Saved the drawing to ${out}`, `चित्र ${out} में सेव हो गया`));
    return;
  }

  if (cmd === 'test') {
    const dir = args[1] || '.';
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.kid')).sort();
    let bad = 0;
    for (const f of files) {
      const full = path.join(dir, f), src = fs.readFileSync(full, 'utf8');
      const host = terminalHost(full, { quiet: true, answer: '1' });
      const it = new KidAI.Interpreter(host);
      const timer = setTimeout(() => it.halt(), 3000);
      let note = 'ok';
      try {
        await it.run(src);
      } catch (e) {
        if (e instanceof KidAI.KidError && /only works in the playground|cloud AI|ask questions/.test(e.english || '')) note = /ask picture/.test(e.english || '') ? 'skipped (needs someone to draw)' : 'skipped (needs the playground)';
        else if (e instanceof KidAI.Halted) note = 'ok (stopped after 3 seconds)';
        else { note = 'FAILED: line ' + e.kidLine + ': ' + e.message; bad++; }
      }
      clearTimeout(timer); it.halt();
      console.log((note.startsWith('FAILED') ? '✗ ' : '✓ ') + f + ' - ' + note);
    }
    console.log(`\n${files.length - bad} of ${files.length} programs ran without errors.`);
    if (bad) process.exitCode = 1;
    return;
  }

  // run
  const file = cmd === 'run' ? args[1] : cmd;
  const src = readSource(file);
  if (path.extname(file) !== '.kid') console.log(say('(Tip: KidAI programs usually end in .kid)', '(सुझाव: KidAI प्रोग्राम आमतौर पर .kid पर खत्म होते हैं)'));
  return runProgram(file, src);
}

// Runs a program in the terminal. Drawing, sprites, sound, keys, buttons and "ask picture" open the stage window.
async function runProgram(file, src) {
  let need = { stage: false };
  try { need = stageNeeds(KidAI.parse(src)); } catch (e) { /* the run below reports the mistake */ }
  let stage = null;
  if (need.stage && !flags.has('--no-window')) {
    stage = createStage({ lang: LANG, needsClick: need.sound || need.keys, title: path.basename(file) });
    const url = await stage.open();
    console.log(say('🖥  This program uses the stage window. It opens in your web browser. If it did not open, open this address:',
      '🖥  यह प्रोग्राम स्टेज विंडो इस्तेमाल करता है। वह आपके वेब ब्राउज़र में खुलती है। अगर नहीं खुली, तो यह पता खोलिए:'));
    console.log('   ' + url);
    if (need.sound || need.keys) console.log(say('   Press ▶ Start in the window to begin.', '   शुरू करने के लिए विंडो में ▶ शुरू करें दबाइए।'));
    if (need.keyNames.length) stage.keys(need.keyNames); // on-screen keys for touch screens
    await stage.ready;
  }
  const host = terminalHost(file, { stage });
  let finishedHow = null, wake = null;
  const end = (how) => { if (!finishedHow) finishedHow = how; if (wake) wake(); };
  host.error = (e) => { oops(e); if (stage) stage.error(e); end('error'); };
  host.stopped = () => end('stopped');
  const it = new KidAI.Interpreter(host);
  if (stage) {
    stage.on('key', k => it.pressKey(k));
    stage.on('click', label => { if (!it.halted) host.fireButton(label); });
    stage.on('stop', () => { it.halt(); end('stopped'); });
  }
  const onCtrlC = () => { it.halt(); end('stopped'); if (!stage) process.exit(130); };
  process.on('SIGINT', onCtrlC);
  let r = null;
  try {
    r = await it.run(src);
  } catch (e) {
    if (e instanceof KidAI.Halted) end('stopped');
    else { oops(e); if (stage && e instanceof KidAI.KidError) stage.error(e); end('error'); }
  }
  if (host.rl) host.rl.close();
  // Games keep going after the last line: they wait for keys, buttons and timers until Stop.
  if (r && r.listening && !finishedHow) {
    console.log(say('(The program is still listening for keys, buttons or timers. Press Stop in the window, or Ctrl+C here, to end it.)',
      '(प्रोग्राम अभी भी कीबोर्ड, बटन या टाइमर का इंतज़ार कर रहा है। खत्म करने के लिए विंडो में रोकें दबाइए, या यहाँ Ctrl+C।)'));
    await new Promise(res => { wake = res; if (finishedHow) res(); });
  }
  it.halt();
  process.removeListener('SIGINT', onCtrlC);
  if (stage) stage.finish(finishedHow || 'finished');
  if (finishedHow === 'stopped') console.log(say('(Stopped.)', '(रोक दिया गया।)'));
  return r;
}

main();
