// The stage window for the kidai command.
//
// A terminal can't show drawings, sprites or a drawing pad, play sounds, or tell which keys are held
// down. So when a program needs any of those, kidai starts a tiny web server on this computer only
// (127.0.0.1) and opens a page in the web browser. The program still runs in the terminal; this page
// is its stage:
//   - it draws what Sparky draws, and shows sprites, the background and text
//   - it plays notes and sound effects
//   - it sends key presses, button clicks, the Stop button and drawings back to the program
//   - it shows what the program says, too
// Nothing leaves the computer. The address has a random secret in it, so other web pages can't use it.
'use strict';
const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');

const PICTURE_SIZE = 32; // drawings are shrunk to 32 x 32 brightness numbers, like the playground

// ---------------------------------------------------------------- which programs need the stage?
const DRAW = new Set(['move', 'turn', 'turnto', 'circle', 'dot', 'rect', 'write', 'background', 'clear', 'home', 'goto',
  'visible', 'sprite', 'movesprite', 'spritevis', 'deletesprite', 'askpic']);
const SOUND = new Set(['note', 'beep', 'sound']);

function needs(ast) {
  const found = { stage: false, sound: false, keys: false, keyNames: [] };
  const keyName = (e) => { if (e && e.k === 'val' && typeof e.v === 'string') { const k = e.v === ' ' ? 'space' : e.v.toLowerCase(); if (!found.keyNames.includes(k)) found.keyNames.push(k); } };
  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (typeof node.type === 'string') {
      if (DRAW.has(node.type)) found.stage = true;
      if (SOUND.has(node.type)) found.sound = found.stage = true;
      if (node.type === 'whenkey') { found.keys = found.stage = true; keyName(node.key); }
      if (node.type === 'when') found.stage = true;
    }
    if (node.k === 'keydown') { found.keys = found.stage = true; keyName(node.key); }
    if (node.k === 'stagepic' || node.k === 'turtlepos') { /* work without a window */ }
    for (const key of Object.keys(node)) if (key !== 'line') visit(node[key]);
  };
  visit(ast.body);
  return found;
}

// ---------------------------------------------------------------- colours (so mistakes are caught like in the playground)
const COLOR_NAMES = new Set(('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood ' +
  'cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey ' +
  'darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey ' +
  'darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite ' +
  'gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon ' +
  'lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue ' +
  'lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid ' +
  'mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin ' +
  'navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff ' +
  'peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver ' +
  'skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato transparent turquoise violet wheat white ' +
  'whitesmoke yellow yellowgreen').split(' '));
function isColor(c) {
  const s = String(c).trim().toLowerCase();
  return COLOR_NAMES.has(s) || /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(s) ||
    /^(rgb|rgba|hsl|hsla)\(\s*[\d.%\s,/+-]+(deg)?[\d.%\s,/+-]*\)$/.test(s);
}

function openInBrowser(url) {
  if (process.env.KIDAI_NO_BROWSER) return;
  const [cmd, args] = process.platform === 'win32' ? ['explorer', [url]]
    : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  try {
    const child = spawn(cmd, args, { stdio: 'ignore', detached: true, windowsHide: true });
    child.on('error', () => {});
    child.unref();
  } catch (e) { /* the address is printed in the terminal too */ }
}

// ---------------------------------------------------------------- the server
function createStage(options) {
  options = options || {};
  const lang = options.lang === 'hi' ? 'hi' : 'en';
  const token = crypto.randomBytes(12).toString('hex');
  const clients = new Set();
  const sockets = new Set();
  let server = null, url = null, nextId = 0, closed = false;
  let readyResolve, answer = null;
  const ready = new Promise((r) => { readyResolve = r; });

  // Everything the page needs to draw itself again if it is reloaded.
  const state = { ops: [], bg: null, sprites: [], turtle: null, buttons: [], keys: [], talk: [], question: null, end: null, title: options.title || '' };
  const keysDown = new Set();
  const handlers = { key: () => {}, click: () => {}, stop: () => {} };

  // Messages are sent in small batches (about 60 a second). Only the newest sprite and robot positions are kept.
  let queue = [], timer = null;
  function flush() {
    timer = null;
    if (!queue.length) return;
    const data = 'data: ' + JSON.stringify(queue) + '\n\n';
    queue = [];
    for (const c of clients) c.write(data);
  }
  function send(msg) {
    if (msg.t === 'sprites' || msg.t === 'turtle') queue = queue.filter(m => m.t !== msg.t);
    queue.push(msg);
    if (!timer) timer = setTimeout(flush, 16);
  }
  function talk(entry) {
    state.talk.push(entry);
    if (state.talk.length > 300) state.talk.shift();
    send(Object.assign({ t: 'talk' }, entry));
  }

  function reply(res, code, type, body) {
    res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
    res.end(body);
  }

  function input(msg) {
    switch (msg.t) {
      case 'ready': readyResolve(); break;
      case 'key': {
        const k = String(msg.k || '').toLowerCase().slice(0, 20);
        if (!k) break;
        if (msg.down) { const fresh = !keysDown.has(k); keysDown.add(k); if (fresh) handlers.key(k); } else keysDown.delete(k);
        break;
      }
      case 'keysup': keysDown.clear(); break;
      case 'click': if (state.buttons.includes(msg.label)) handlers.click(msg.label); break;
      case 'stop': handlers.stop(); break;
      case 'picture': {
        if (!state.question || msg.id !== state.question.id || !answer) return false;
        const ok = Array.isArray(msg.data) && msg.data.length === PICTURE_SIZE * PICTURE_SIZE && msg.data.every(v => typeof v === 'number' && isFinite(v));
        if (!ok) return false;
        const thumb = typeof msg.thumb === 'string' && msg.thumb.startsWith('data:image/') && msg.thumb.length < 1.5e6 ? msg.thumb : null;
        const q = state.question, done = answer;
        answer = null; state.question = null;
        talk({ kind: 'picture', text: q.text, thumb });
        send({ t: 'asked' });
        done({ size: PICTURE_SIZE, data: msg.data.map(v => Math.max(0, Math.min(1, v))), thumb });
        break;
      }
    }
    return true;
  }

  function handle(req, res) {
    const u = new URL(req.url, 'http://127.0.0.1');
    const base = '/' + token + '/';
    if (!u.pathname.startsWith(base)) return reply(res, 404, 'text/plain', 'Not found');
    const route = u.pathname.slice(base.length);
    if (req.method === 'GET' && route === '') return reply(res, 200, 'text/html; charset=utf-8', page(lang, options));
    if (req.method === 'GET' && route === 'events') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
      res.write('retry: 1000\n\n');
      res.write('data: ' + JSON.stringify([Object.assign({ t: 'snapshot' }, state)]) + '\n\n');
      clients.add(res);
      const beat = setInterval(() => res.write(': still here\n\n'), 15000);
      req.on('close', () => { clearInterval(beat); clients.delete(res); });
      return;
    }
    if (req.method === 'POST' && route === 'input') {
      let body = '';
      req.on('data', (c) => { body += c; if (body.length > 2e6) req.destroy(); });
      req.on('end', () => {
        let msg;
        try { msg = JSON.parse(body); } catch (e) { return reply(res, 400, 'text/plain', 'Bad message'); }
        const ok = input(msg || {});
        reply(res, ok ? 200 : 400, 'application/json', JSON.stringify({ ok }));
      });
      return;
    }
    reply(res, 404, 'text/plain', 'Not found');
  }

  const stage = {
    keysDown,
    ready,
    get url() { return url; },
    on(name, fn) { handlers[name] = fn; },
    // Start the server and open the browser. Resolves with the address.
    open() {
      if (server) return Promise.resolve(url);
      return new Promise((resolve, reject) => {
        server = http.createServer(handle);
        server.on('connection', (s) => { sockets.add(s); s.on('close', () => sockets.delete(s)); });
        server.on('error', reject);
        server.listen(0, '127.0.0.1', () => {
          url = 'http://127.0.0.1:' + server.address().port + '/' + token + '/';
          openInBrowser(url);
          resolve(url);
        });
      });
    },
    // ---- what the program does (called by the kidai host)
    line(x1, y1, x2, y2, color, size) { const op = { k: 'line', x1, y1, x2, y2, color, size }; state.ops.push(op); send({ t: 'op', op }); },
    circle(x, y, r, color, size, down) { const op = { k: 'circle', x, y, r, color, size, down }; state.ops.push(op); send({ t: 'op', op }); },
    rect(x, y, w, h, color) { const op = { k: 'rect', x, y, w, h, color }; state.ops.push(op); send({ t: 'op', op }); },
    write(text, x, y, color, px) { const op = { k: 'write', text: String(text), x, y, color, px }; state.ops.push(op); send({ t: 'op', op }); },
    clear() { state.ops = []; send({ t: 'clear' }); },
    background(c) { state.bg = c; send({ t: 'bg', c }); },
    sprites(list) { state.sprites = list.map(s => ({ name: s.name, look: s.look, x: s.x, y: s.y, size: s.size, visible: s.visible })); send({ t: 'sprites', list: state.sprites }); },
    turtle(t) { state.turtle = { x: t.x, y: t.y, heading: t.heading, visible: t.visible }; send({ t: 'turtle', turtle: state.turtle }); },
    note(freq, secs, name) { send({ t: 'note', freq, secs, name }); },
    sound(name) { send({ t: 'sound', name }); },
    say(text) { talk({ kind: 'say', text: String(text) }); },
    asked(text) { talk({ kind: 'ask', text: String(text) }); },
    button(label) { if (!state.buttons.includes(label)) state.buttons.push(label); send({ t: 'buttons', list: state.buttons }); },
    keys(list) { state.keys = list; send({ t: 'keys', list }); },
    error(e) { talk({ kind: 'error', text: e.message, line: e.kidLine, hint: e.hint }); },
    askPicture(text) {
      state.question = { id: ++nextId, text: String(text) };
      send(Object.assign({ t: 'ask' }, state.question));
      return new Promise((resolve) => { answer = resolve; });
    },
    // The program has ended ("finished", "stopped" or "error"). The page keeps the last picture.
    finish(how) {
      if (closed) return;
      closed = true;
      state.end = how;
      send({ t: 'end', how });
      if (!server) return;
      setTimeout(() => {
        flush();
        for (const c of clients) c.end();
        server.close();
        setTimeout(() => { for (const s of sockets) s.destroy(); }, 300).unref();
      }, 400);
    }
  };
  return stage;
}

// ---------------------------------------------------------------- the page
function page(lang, options) {
  const T = lang === 'hi' ? {
    title: 'KidAI स्टेज', start: '▶ शुरू करें', startHelp: 'आवाज़ और कीबोर्ड चालू करने के लिए क्लिक कीजिए।', stop: 'रोकें',
    running: 'चल रहा है', finished: 'खत्म! आप यह टैब बंद कर सकते हैं।', stopped: 'रोक दिया गया।', errored: 'गड़बड़ी हुई — टर्मिनल देखिए।',
    lost: 'प्रोग्राम से जुड़ नहीं पा रहे। क्या वह अभी चल रहा है?', done: 'हो गया', clear: 'साफ़ करें', photo: 'फ़ोटो चुनें',
    padHelp: 'माउस या उँगली से बनाइए। फिर "हो गया" दबाइए।', ask: 'टर्मिनल में जवाब दीजिए:', line: 'लाइन', tip: 'सुझाव:',
    stage: 'स्टेज', talk: 'प्रोग्राम ने कहा'
  } : {
    title: 'KidAI stage', start: '▶ Start', startHelp: 'Click to turn on sound and the keyboard.', stop: 'Stop',
    running: 'Running', finished: 'Finished! You can close this tab.', stopped: 'Stopped.', errored: 'Something went wrong. Look at the terminal.',
    lost: 'Can\'t reach the program. Is it still running?', done: 'Done', clear: 'Clear', photo: 'Use a photo',
    padHelp: 'Draw with your mouse or finger, then press Done.', ask: 'Answer in the terminal:', line: 'Line', tip: 'Tip:',
    stage: 'Stage', talk: 'What the program said'
  };
  const cfg = { needsClick: !!options.needsClick, title: options.title || '' };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(cfg.title ? cfg.title + ' - ' + T.title : T.title)}</title>
<style>
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }
  body { margin: 0; font-family: system-ui, sans-serif; background: #eef3fb; color: #17224a; }
  header { display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: #17224a; color: #fff; }
  header h1 { font-size: 18px; margin: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  #status { font-size: 14px; opacity: .9; }
  button, label.btn { font: inherit; font-weight: 700; padding: 8px 16px; border-radius: 10px; border: 2px solid #2f6fe4; background: #2f6fe4; color: #fff; cursor: pointer; }
  button.ghost, label.btn { background: #fff; color: #2f6fe4; }
  #stopB { background: #e5484d; border-color: #e5484d; }
  button:disabled { opacity: .45; cursor: default; }
  button:focus-visible, label.btn:focus-within, #stage:focus-visible { outline: 3px solid #f2a93b; outline-offset: 2px; }
  main { display: flex; flex-wrap: wrap; gap: 18px; padding: 16px; justify-content: center; }
  .col { width: min(520px, 100%); }
  #stage { position: relative; width: 100%; aspect-ratio: 1; background: #fff; border: 3px solid #c9d5ea; border-radius: 16px; overflow: hidden; }
  #stage > canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
  #startBox, #padBox { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; background: rgba(238,243,251,.94); text-align: center; padding: 16px; }
  #startBox button { font-size: 26px; padding: 14px 34px; border-radius: 16px; }
  #padBox { background: #fff; justify-content: flex-start; }
  #padQ { font-weight: 800; font-size: 20px; }
  #padBox { gap: 6px; padding: 10px; }
  #pad { height: 62%; width: auto; aspect-ratio: 1; border: 3px solid #c9d5ea; border-radius: 14px; touch-action: none; cursor: crosshair; }
  #padBox .row { margin-top: 2px; }
  .row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 10px; }
  #keys button { min-width: 64px; font-size: 20px; }
  #keys button.on { background: #f2a93b; border-color: #f2a93b; }
  #talk { background: #fff; border: 2px solid #c9d5ea; border-radius: 14px; padding: 10px 14px; height: min(520px, 70vh); overflow: auto; }
  #talk h2 { font-size: 15px; margin: 0 0 8px; color: #4b5a78; }
  #talk div { padding: 4px 0; border-bottom: 1px solid #eef1f7; white-space: pre-wrap; word-break: break-word; }
  #talk .ask { color: #6a4bd1; }
  #talk .error { color: #b42318; }
  #talk .tip { color: #4b5a78; font-size: 14px; }
  #talk img { width: 48px; height: 48px; border: 1px solid #c9d5ea; border-radius: 6px; vertical-align: middle; margin-left: 6px; }
  .end { font-weight: 700; }
</style>
</head>
<body>
<header>
  <h1>🤖 ${esc(cfg.title || T.title)}</h1>
  <span id="status" role="status">${T.running}</span>
  <button id="stopB" type="button">${T.stop}</button>
</header>
<main>
  <div class="col">
    <div id="stage" tabindex="0" aria-label="${T.stage}">
      <canvas id="bg" width="800" height="800"></canvas>
      <canvas id="draw" width="800" height="800"></canvas>
      <canvas id="spr" width="800" height="800"></canvas>
      <canvas id="bot" width="800" height="800"></canvas>
      <div id="startBox" hidden><button id="startB" type="button">${T.start}</button><div>${T.startHelp}</div></div>
      <div id="padBox" hidden>
        <div id="padQ" aria-live="polite"></div>
        <canvas id="pad" width="400" height="400" aria-label="${T.padHelp}"></canvas>
        <div>${T.padHelp}</div>
        <div class="row">
          <button id="padDone" type="button">${T.done}</button>
          <button id="padClear" type="button" class="ghost">${T.clear}</button>
          <label class="btn">${T.photo}<input id="photo" type="file" accept="image/*" hidden></label>
        </div>
      </div>
    </div>
    <div id="keys" class="row"></div>
    <div id="buttons" class="row"></div>
  </div>
  <div class="col"><div id="talk" aria-live="polite"><h2>${T.talk}</h2></div></div>
</main>
<script>
(() => {
  const T = ${JSON.stringify(T)}, CFG = ${JSON.stringify(cfg)};
  const $ = (id) => document.getElementById(id);
  const post = (msg) => fetch('input', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(msg) }).catch(() => {});
  let ended = false;

  // ---- stage drawing (the same as the playground: 400 steps across, 0,0 in the middle, y goes up)
  const S = 2, X = (x) => (x + 200) * S, Y = (y) => (200 - y) * S;
  const bg = $('bg').getContext('2d'), d = $('draw').getContext('2d'), sp = $('spr').getContext('2d'), bot = $('bot').getContext('2d');
  function background(c) { bg.clearRect(0, 0, 800, 800); if (c) { bg.fillStyle = c; bg.fillRect(0, 0, 800, 800); } }
  function op(o) {
    if (o.k === 'line') { d.strokeStyle = o.color; d.lineWidth = o.size * S; d.lineCap = 'round'; d.beginPath(); d.moveTo(X(o.x1), Y(o.y1)); d.lineTo(X(o.x2), Y(o.y2)); d.stroke(); }
    else if (o.k === 'circle') { d.beginPath(); d.arc(X(o.x), Y(o.y), o.r * S, 0, Math.PI * 2); if (o.down) { d.strokeStyle = o.color; d.lineWidth = o.size * S; d.stroke(); } else { d.fillStyle = o.color; d.fill(); } }
    else if (o.k === 'rect') { d.fillStyle = o.color; d.fillRect(X(o.x - o.w / 2), Y(o.y + o.h / 2), o.w * S, o.h * S); }
    else if (o.k === 'write') { d.save(); d.fillStyle = o.color; d.font = '700 ' + (o.px * S) + 'px system-ui, sans-serif'; d.textAlign = 'center'; d.textBaseline = 'middle'; d.fillText(o.text, X(o.x), Y(o.y)); d.restore(); }
  }
  function sprites(list) {
    sp.clearRect(0, 0, 800, 800); sp.textAlign = 'center'; sp.textBaseline = 'middle';
    for (const s of list) {
      if (!s.visible) continue;
      const emoji = /\\p{Extended_Pictographic}/u.test(s.look), short = Array.from(s.look).length <= 2;
      const px = (short ? s.size : s.size * 0.42) * S;
      sp.font = emoji ? px + 'px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' : '800 ' + px + 'px system-ui, sans-serif';
      if (!emoji) { sp.lineWidth = px / 6; sp.strokeStyle = '#17224a'; sp.lineJoin = 'round'; sp.strokeText(s.look, X(s.x), Y(s.y)); sp.fillStyle = '#fff'; }
      else sp.fillStyle = '#17224a';
      sp.fillText(s.look, X(s.x), Y(s.y));
    }
  }
  function robot(t) {
    bot.clearRect(0, 0, 800, 800);
    if (!t || !t.visible) return;
    bot.save(); bot.translate(X(t.x), Y(t.y)); bot.rotate(t.heading * Math.PI / 180);
    bot.beginPath(); bot.moveTo(0, -22); bot.lineTo(14, 14); bot.lineTo(0, 7); bot.lineTo(-14, 14); bot.closePath();
    bot.fillStyle = '#ffb703'; bot.fill(); bot.lineWidth = 3; bot.strokeStyle = '#17224a'; bot.stroke();
    bot.beginPath(); bot.arc(0, -4, 3.5, 0, Math.PI * 2); bot.fillStyle = '#17224a'; bot.fill(); bot.restore();
  }

  // ---- sound (Web Audio, nothing is downloaded)
  let audio = null;
  function ctx() { try { if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch (e) { audio = null; } return audio; }
  function tone(freq, secs, type, when, vol, slideTo) {
    const a = ctx(); if (!a) return;
    const t0 = a.currentTime + (when || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || 'triangle'; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + secs);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.25, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(0.05, secs));
    o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + secs + 0.05);
  }
  function noise(secs, vol) {
    const a = ctx(); if (!a) return;
    const buf = a.createBuffer(1, Math.floor(a.sampleRate * secs), a.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
    const src = a.createBufferSource(), g = a.createGain(); g.gain.value = vol || 0.3; src.buffer = buf; src.connect(g); g.connect(a.destination); src.start();
  }
  const SFX = {
    pop: () => tone(600, 0.08, 'sine', 0, 0.3, 200),
    coin: () => { tone(988, 0.08, 'square', 0, 0.12); tone(1319, 0.25, 'square', 0.08, 0.12); },
    jump: () => tone(300, 0.25, 'square', 0, 0.12, 900),
    boom: () => { noise(0.6, 0.4); tone(120, 0.5, 'sine', 0, 0.4, 40); },
    laser: () => tone(1400, 0.25, 'sawtooth', 0, 0.1, 200),
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', i * 0.12, 0.25)),
    lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.3, 'triangle', i * 0.22, 0.25))
  };

  // ---- what the program said
  const talkBox = $('talk');
  function talk(e) {
    const div = document.createElement('div');
    if (e.kind === 'ask') { div.className = 'ask'; div.textContent = '❓ ' + T.ask + ' ' + e.text; }
    else if (e.kind === 'picture') { div.textContent = '🎨 ' + e.text; if (e.thumb) { const im = document.createElement('img'); im.src = e.thumb; im.alt = e.text; div.appendChild(im); } }
    else if (e.kind === 'error') {
      div.className = 'error'; div.textContent = '⚠ ' + (e.line ? T.line + ' ' + e.line + ': ' : '') + e.text;
      if (e.hint) { const tip = document.createElement('div'); tip.className = 'tip'; tip.textContent = T.tip + ' ' + e.hint; div.appendChild(tip); }
    } else div.textContent = e.text;
    talkBox.appendChild(div);
    while (talkBox.childElementCount > 301) talkBox.removeChild(talkBox.children[1]);
    talkBox.scrollTop = talkBox.scrollHeight;
  }

  // ---- buttons and keys
  function buttons(list) {
    const box = $('buttons'); box.innerHTML = '';
    for (const label of list) { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', () => post({ t: 'click', label })); box.appendChild(b); }
  }
  const NAMES = { ' ': 'space', arrowleft: 'left', arrowright: 'right', arrowup: 'up', arrowdown: 'down', enter: 'enter' };
  const keyName = (e) => { const k = e.key.toLowerCase(); return NAMES[k] || k; };
  const held = new Set();
  const typing = (e) => e.target && (e.target.tagName === 'INPUT');
  document.addEventListener('keydown', (e) => {
    if (ended || typing(e) || !$('padBox').hidden) return;
    const k = keyName(e);
    if (['space', 'left', 'right', 'up', 'down'].includes(k)) e.preventDefault();
    if (held.has(k)) return;
    held.add(k); post({ t: 'key', k, down: true });
  });
  document.addEventListener('keyup', (e) => { const k = keyName(e); if (held.delete(k)) post({ t: 'key', k, down: false }); });
  window.addEventListener('blur', () => { held.clear(); post({ t: 'keysup' }); });
  const PAD = { left: '◀', right: '▶', up: '▲', down: '▼', space: 'space' };
  function keypad(list) {
    const box = $('keys'); box.innerHTML = '';
    for (const k of list.filter(k => k !== 'any')) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = PAD[k] || k; b.setAttribute('aria-label', k + ' key');
      const press = (ev) => { ev.preventDefault(); b.classList.add('on'); post({ t: 'key', k, down: true }); };
      const release = () => { if (b.classList.contains('on')) { b.classList.remove('on'); post({ t: 'key', k, down: false }); } };
      b.addEventListener('pointerdown', press); b.addEventListener('pointerup', release); b.addEventListener('pointerleave', release);
      box.appendChild(b);
    }
  }

  // ---- drawing pad for "ask picture"
  const pad = $('pad'), px = pad.getContext('2d');
  let question = null, down = false, last = null;
  const blank = () => { px.fillStyle = '#fff'; px.fillRect(0, 0, 400, 400); };
  blank(); px.lineCap = 'round'; px.lineJoin = 'round'; px.lineWidth = 22; px.strokeStyle = '#000';
  const pos = (e) => { const r = pad.getBoundingClientRect(); return [(e.clientX - r.left) * 400 / r.width, (e.clientY - r.top) * 400 / r.height]; };
  pad.addEventListener('pointerdown', (e) => { down = true; last = pos(e); pad.setPointerCapture(e.pointerId); px.beginPath(); px.arc(last[0], last[1], 11, 0, 7); px.fillStyle = '#000'; px.fill(); });
  pad.addEventListener('pointermove', (e) => { if (!down) return; const p = pos(e); px.beginPath(); px.moveTo(last[0], last[1]); px.lineTo(p[0], p[1]); px.stroke(); last = p; });
  pad.addEventListener('pointerup', () => { down = false; });
  $('padClear').addEventListener('click', blank);
  $('photo').addEventListener('change', () => {
    const f = $('photo').files && $('photo').files[0]; if (!f) return;
    const img = new Image();
    img.onload = () => { blank(); const k = Math.min(400 / img.width, 400 / img.height); px.drawImage(img, (400 - img.width * k) / 2, (400 - img.height * k) / 2, img.width * k, img.height * k); URL.revokeObjectURL(img.src); };
    img.src = URL.createObjectURL(f); $('photo').value = '';
  });
  function ask(q) { question = q; blank(); $('padQ').textContent = q.text; $('padBox').hidden = false; }
  $('padDone').addEventListener('click', () => {
    if (!question) return;
    const small = document.createElement('canvas'); small.width = 32; small.height = 32;
    const sx = small.getContext('2d'); sx.drawImage(pad, 0, 0, 32, 32);
    const p = sx.getImageData(0, 0, 32, 32).data, data = [];
    for (let i = 0; i < 1024; i++) data.push(1 - (0.299 * p[i * 4] + 0.587 * p[i * 4 + 1] + 0.114 * p[i * 4 + 2]) / 255);
    post({ t: 'picture', id: question.id, data, thumb: pad.toDataURL('image/png') });
    question = null; $('padBox').hidden = true;
  });

  // ---- start, stop and messages from the program
  function setStatus(text) { $('status').textContent = text; }
  function finish(how) {
    ended = true; $('stopB').disabled = true; $('padBox').hidden = true; $('startBox').hidden = true;
    setStatus(how === 'stopped' ? T.stopped : how === 'error' ? T.errored : T.finished);
    const div = document.createElement('div'); div.className = 'end'; div.textContent = $('status').textContent; talkBox.appendChild(div); talkBox.scrollTop = talkBox.scrollHeight;
  }
  $('stopB').addEventListener('click', () => post({ t: 'stop' }));
  let started = false;
  function start() { if (started) return; started = true; ctx(); $('startBox').hidden = true; $('stage').focus(); post({ t: 'ready' }); }
  $('startB').addEventListener('click', start);
  $('stage').addEventListener('pointerdown', () => { ctx(); $('stage').focus(); });

  function apply(m) {
    switch (m.t) {
      case 'snapshot':
        d.clearRect(0, 0, 800, 800); background(m.bg); m.ops.forEach(op); sprites(m.sprites); robot(m.turtle);
        buttons(m.buttons); keypad(m.keys);
        talkBox.querySelectorAll('div').forEach(x => x.remove()); m.talk.forEach(talk);
        if (m.question) ask(m.question);
        if (m.end) { finish(m.end); return; }
        if (CFG.needsClick && !started) $('startBox').hidden = false; else start();
        break;
      case 'op': op(m.op); break;
      case 'clear': d.clearRect(0, 0, 800, 800); break;
      case 'bg': background(m.c); break;
      case 'sprites': sprites(m.list); break;
      case 'turtle': robot(m.turtle); break;
      case 'note': tone(m.freq, m.secs, 'triangle', 0, 0.3); break;
      case 'sound': if (SFX[m.name]) SFX[m.name](); break;
      case 'talk': talk(m); break;
      case 'buttons': buttons(m.list); break;
      case 'keys': keypad(m.list); break;
      case 'ask': ask(m); break;
      case 'asked': $('padBox').hidden = true; break;
      case 'end': finish(m.how); break;
    }
  }
  const es = new EventSource('events');
  es.onmessage = (ev) => { JSON.parse(ev.data).forEach(apply); };
  es.onerror = () => { if (ended) es.close(); else setStatus(T.lost); };
  es.onopen = () => { if (!ended) setStatus(T.running); };
})();
</script>
</body>
</html>`;
}

module.exports = { createStage, needs, isColor };
