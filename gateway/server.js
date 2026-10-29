#!/usr/bin/env node
// KidAI chat gateway: lets kids' programs use `chat` without ever seeing an API key.
//
//   ANTHROPIC_API_KEY=sk-... node gateway/server.js
//   then run programs with:  KIDAI_CHAT_URL=http://localhost:8787/chat kidai my_program.kid
//
// What it does for safety:
//   - keeps the API key on this server only
//   - adds a kid-safe instruction to every question
//   - removes email addresses and phone numbers before sending
//   - limits question length, answer length and how many questions each computer can ask per hour
//   - refuses answers that trip a simple word filter
// The safety rules live in safety.js. It is a starting point, not a full moderation system. Review it before using it with a class.
const http = require('http');
const { MODEL, askClaude } = require('./safety.js');

const PORT = Number(process.env.PORT || 8787);
const KEY = process.env.ANTHROPIC_API_KEY;
const PER_HOUR = Number(process.env.KIDAI_PER_HOUR || 30);
const ALLOW_ORIGIN = process.env.KIDAI_ALLOW_ORIGIN || '*';
if (!KEY) { console.error('Set ANTHROPIC_API_KEY first.'); process.exit(1); }

const hits = new Map();
function allowed(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter(t => now - t < 3600e3);
  if (list.length >= PER_HOUR) { hits.set(ip, list); return false; }
  list.push(now); hits.set(ip, list); return true;
}
function send(res, code, obj) {
  res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': ALLOW_ORIGIN, 'access-control-allow-headers': 'content-type' });
  res.end(JSON.stringify(obj));
}

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method !== 'POST' || !req.url.startsWith('/chat')) return send(res, 404, { error: 'Not here. POST to /chat.' });
  const ip = req.socket.remoteAddress || 'unknown';
  if (!allowed(ip)) return send(res, 429, { error: 'That is a lot of questions! Take a break and try again later.' });
  let body = '';
  for await (const chunk of req) { body += chunk; if (body.length > 4000) return send(res, 413, { error: 'That question is too long.' }); }
  let question;
  try { question = JSON.parse(body).message; } catch (e) { return send(res, 400, { error: 'I could not read that question.' }); }
  const r = await askClaude(question, KEY);
  if (r.error) return send(res, r.error === 'Ask a question first.' ? 400 : 502, { error: r.error });
  send(res, 200, r);
}).listen(PORT, () => console.log(`KidAI chat gateway on http://localhost:${PORT}/chat (model ${MODEL}, ${PER_HOUR} questions per hour per computer)`));
