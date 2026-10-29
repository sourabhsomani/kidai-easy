// The kid-safety rules for "chat", shared by the chat gateway (server.js) and the kidai command.
//   - a kid-safe instruction goes with every question
//   - email addresses and phone numbers are removed before sending
//   - questions and answers are kept short
//   - questions and answers that trip a simple word filter are refused
// It is a starting point, not a full moderation system. Review it before using it with a class.
'use strict';

const MODEL = process.env.KIDAI_MODEL || 'claude-haiku-5-5';
const SYSTEM = [
  'You are Sparky, a friendly helper inside a coding app for children aged 8 to 14.',
  'Answer in 1 to 4 short, simple sentences a child can read.',
  'Be kind, accurate and encouraging. If you are not sure, say so.',
  'Never ask for or repeat personal details such as names of schools, addresses, phone numbers or passwords.',
  'If a question is unsafe, scary or for grown-ups only, gently say it is a question for a trusted grown-up and suggest a fun coding idea instead.'
].join(' ');
const BLOCK = /\b(kill yourself|suicide|porn|sex|nude|gun to|how to make a bomb)\b/i;

function clean(text) {
  return String(text)
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email removed]')
    .replace(/\+?\d[\d\s().-]{7,}\d/g, '[number removed]')
    .slice(0, 500);
}

// Asks Claude one question. Returns { reply } or { error } (an error a child can read).
async function askClaude(question, key) {
  const message = clean(question || '');
  if (!message.trim()) return { error: 'Ask a question first.' };
  if (BLOCK.test(message)) return { reply: 'That is a question for a trusted grown-up. Want to build a game instead?' };
  try {
    const r = await fetch(process.env.KIDAI_API_URL || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 300, system: SYSTEM, messages: [{ role: 'user', content: message }] })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { error: 'The cloud AI is not answering right now.' };
    let reply = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('').trim();
    if (BLOCK.test(reply)) reply = 'Let\'s talk about something else. What are you building today?';
    return { reply, model: MODEL };
  } catch (e) {
    return { error: 'The cloud AI is not answering right now.' };
  }
}

module.exports = { MODEL, SYSTEM, BLOCK, clean, askClaude };
