// KidAI Easy: words.js
// Reserved words, soft keywords and the list of words that can start a statement.
'use strict';

// Words that can never be used as names (they are part of expressions).
const RESERVED = new Set([
  'and', 'or', 'not', 'is', 'yes', 'no', 'true', 'false', 'nothing', 'random', 'item',
  'length', 'how', 'guess', 'contains', 'mod', 'of', 'to', 'by', 'into', 'with', 'times',
  'from', 'end', 'else', 'if', 'repeat', 'while', 'until', 'forever', 'for', 'each', 'in',
  'say', 'show', 'print', 'set', 'change', 'ask', 'define', 'give', 'return', 'stop', 'skip',
  'add', 'remove', 'wait', 'forward', 'turn', 'pen', 'color', 'colour', 'circle', 'clear',
  'teach', 'when', 'go', 'every', 'play', 'beep', 'write', 'background', 'dot', 'rectangle',
  'touches', 'make', 'move', 'delete', 'learn', 'predict', 'forget', 'use', 'chat', 'split',
  'replace', 'save', 'load'
]);
// Special words that can still be used as names when they are used alone (e.g. "for each item in list").
const SOFT = new Set(['item', 'length', 'key']);
function softKeyword(L) {
  const n = L.peek();
  if (!n) return false;
  if (n.t === 'num' || n.t === 'str') return true;
  if (n.t === 'op') return n.v === '(' || n.v === '[' || n.v === '-';
  return n.t === 'word' && (!RESERVED.has(n.v) || ['of', 'random', 'item', 'length', 'how', 'guess', 'yes', 'no', 'true', 'false', 'nothing', 'not', 'split', 'join', 'replace', 'load', 'chat', 'predict', 'keys', 'key'].includes(n.v));
}
const STATEMENT_WORDS = ['say', 'set', 'change', 'ask', 'if', 'repeat', 'for', 'define', 'give',
  'stop', 'skip', 'add', 'remove', 'wait', 'forward', 'back', 'turn', 'pen', 'color', 'circle',
  'clear', 'go', 'teach', 'when', 'end', 'else', 'every', 'play', 'beep', 'write', 'background',
  'dot', 'rectangle', 'make', 'move', 'delete', 'hide', 'test', 'learn', 'save', 'load', 'forget', 'use'];

module.exports = { RESERVED, SOFT, softKeyword, STATEMENT_WORDS };
