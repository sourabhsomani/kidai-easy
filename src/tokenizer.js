// KidAI Easy: tokenizer.js
// Step 1: cuts one line of text into tokens (words, numbers, text, symbols).
'use strict';

const { KidError } = require('./errors');

const OPS2 = { '>=': '>=', '<=': '<=', '==': '=', '!=': '!=', '<>': '!=' };
// OPS1 also maps Unicode maths symbols (≥ ≤ ≠ × ÷ −) to their ASCII equivalents
// so kids using a tablet keyboard or copy-pasting from a textbook still get working code.
const OPS1 = { '{': '{', '}': '}', '.': '.', '+': '+', '-': '-', '*': '*', '/': '/', '%': 'mod', '(': '(', ')': ')',
  '[': '[', ']': ']', ',': ',', ':': ':', '>': '>', '<': '<', '=': '=',
  '\u2265': '>=', '\u2264': '<=', '\u2260': '!=', '\u00D7': '*', '\u00F7': '/', '\u2212': '-' }; // ≥ ≤ ≠ × ÷ −

function tokenizeLine(text, line) {
  const toks = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === ' ' || c === '\t' || c === '\r' || c === '\u00A0') { i++; continue; } // \u00A0 is a no-break space
    if (c === '#') { toks.comment = text.slice(i + 1).trim(); break; }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(text[i + 1] || ''))) {
      let j = i;
      while (j < text.length && /[0-9_]/.test(text[j])) j++;
      if (text[j] === '.' && /[0-9]/.test(text[j + 1] || '')) {
        j++;
        while (j < text.length && /[0-9]/.test(text[j])) j++;
      }
      toks.push({ t: 'num', v: parseFloat(text.slice(i, j).replace(/_/g, '')), line });
      i = j;
      continue;
    }
    // Text can start with a straight quote (" or ') or a curly one from a website or word processor
    // (\u201C \u201D \u2018 \u2019), so kids who copy code don't get a confusing error.
    // The curly ones are written as \u codes so that editors can't turn the straight quotes into curly ones.
    if ('"\u201C\u201D\'\u2018\u2019'.includes(c)) {
      const closers = '"\u201C\u201D'.includes(c) ? '"\u201C\u201D' : '\'\u2018\u2019';
      let j = i + 1, s = '';
      while (j < text.length && !closers.includes(text[j])) {
        if (text[j] === '\\' && j + 1 < text.length) {
          const n = text[j + 1];
          s += n === 'n' ? '\n' : n === 't' ? '\t' : n;
          j += 2;
          continue;
        }
        s += text[j];
        j++;
      }
      if (j >= text.length) {
        throw new KidError('This text is missing its closing quote mark.', line,
          'Put a " at the end of the words, like: say "Hello"');
      }
      toks.push({ t: 'str', v: s, line });
      i = j + 1;
      continue;
    }
    if (/[\p{L}_]/u.test(c)) {
      let j = i;
      while (j < text.length && /[\p{L}\p{N}_]/u.test(text[j])) j++;
      const raw = text.slice(i, j);
      toks.push({ t: 'word', v: raw.toLowerCase(), raw, line });
      i = j;
      continue;
    }
    const two = text.slice(i, i + 2);
    if (OPS2[two]) { toks.push({ t: 'op', v: OPS2[two], line }); i += 2; continue; }
    if (OPS1[c]) { toks.push({ t: 'op', v: OPS1[c], line }); i++; continue; }
    throw new KidError('I don\'t understand the symbol "' + c + '".', line,
      'Try removing it. Text with symbols needs quote marks around it, like "' + c + '".');
  }
  return toks;
}

module.exports = { tokenizeLine };
