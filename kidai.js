/*
 * KidAI Easy: a friendly programming language for kids (ages 8+).
 * Works in the browser (window.KidAI) and in Node.js (require('./kidai.js')).
 *
 * THIS FILE IS MADE BY "node build.js". Do not edit it: edit the files in src/ instead.
 * src/README.md explains which file does what.
 */
(function (root) {
  'use strict';
  const sources = {
    './messages': function (module, exports, require) {
      // KidAI Easy: messages.js
      // Hindi translations of error messages and tips. Keywords always stay English.
      'use strict';

      // Keywords stay English everywhere (as the PRD recommends). Messages and tips can be shown in Hindi.
      let LANG = 'en';
      // frag translates short value-description fragments (like "the number 3") that appear inside longer messages.
      // Used inside the translation functions in HI_MSG so error messages read naturally in Hindi.
      const frag = (s) => (LANG !== 'hi' || s === undefined ? s : String(s)
        .replace(/^the text "([\s\S]*)"$/, 'टेक्स्ट "$1"')
        .replace(/^the number (.+)$/, 'संख्या $1')
        .replace(/^a list$/, 'एक सूची').replace(/^a record$/, 'एक रिकॉर्ड').replace(/^a picture$/, 'एक तस्वीर')
        .replace(/^nothing$/, 'कुछ नहीं').replace(/^the end of the line$/, 'लाइन का अंत'));
      const HI_MSG = [
        [/^"(.+)" is used but never set\.$/, (a) => `"${a}" इस्तेमाल हुआ है, पर कहीं set नहीं हुआ।`],
        [/^"(.+)" needs (\d+) inputs?, but gets (\d+)\.$/, (a, b, c) => `"${a}" को ${b} इनपुट चाहिए, लेकिन ${c} मिल रहे हैं।`],
        [/^This "repeat forever" never waits, so it will be stopped after a moment\.$/, () => 'यह "repeat forever" कभी रुकता नहीं, इसलिए थोड़ी देर में इसे रोक दिया जाएगा।'],
        [/^I don't know anything called "(.+)" yet\.$/, (a) => `मुझे अभी तक "${a}" नाम की कोई चीज़ नहीं पता।`],
        [/^This "(.+)" needs an "end" to finish it\.$/, (a) => `इस "${a}" को खत्म करने के लिए "end" चाहिए।`],
        [/^This "end" doesn't match anything\.$/, () => 'यह "end" किसी चीज़ से मेल नहीं खाता।'],
        [/^This "else" isn't inside an "if"\.$/, () => 'यह "else" किसी "if" के अंदर नहीं है।'],
        [/^This text is missing its closing quote mark\.$/, () => 'इस टेक्स्ट का आख़िरी कोटेशन चिह्न (") नहीं है।'],
        [/^This program used too many steps, so I stopped it safely\.$/, () => 'इस प्रोग्राम ने बहुत ज़्यादा कदम लिए, इसलिए मैंने इसे सुरक्षित रूप से रोक दिया।'],
        [/^You can't divide by zero\. Not even a computer can!$/, () => 'शून्य से भाग नहीं दे सकते। कंप्यूटर भी नहीं!'],
        [/^There is no item (.+)\. The list only has (\d+) items?\.$/, (a, b) => `आइटम ${a} नहीं है। इस सूची में सिर्फ़ ${b} आइटम हैं।`],
        [/^I can only (take away|multiply|divide|mod) numbers, but got (.+)\.$/, (a, b) => `मैं सिर्फ़ संख्याओं को ${{ 'take away': 'घटा', multiply: 'गुणा कर', divide: 'भाग दे', mod: 'mod कर' }[a]} सकता हूँ, लेकिन मिला ${frag(b)}।`],
        [/^"(.+)" needs a yes\/no question, but got (.+)\.$/, (a, b) => `"${a}" को हाँ/ना वाला सवाल चाहिए, लेकिन मिला ${frag(b)}।`],
        [/^I don't know the instruction "(.+)"\.$/, (a) => `मुझे "${a}" निर्देश नहीं पता।`],
        [/^I don't know how to "(.+)"\.$/, (a) => `मुझे "${a}" करना नहीं आता।`],
        [/^I didn't expect (.+) after the ":"\.$/, (a) => `":" के बाद मुझे ${frag(a)} की उम्मीद नहीं थी।`],
        [/^I didn't expect the word "(.+)" here\.$/, (a) => `मुझे यहाँ "${a}" शब्द की उम्मीद नहीं थी।`],
        [/^I didn't expect (.+) here\.$/, (a) => `मुझे यहाँ ${frag(a)} की उम्मीद नहीं थी।`],
        [/^I expected the word "(.+)" here, but found (.+)\.$/, (a, b) => `यहाँ मुझे "${a}" शब्द चाहिए था, लेकिन मिला ${frag(b)}।`],
        [/^I expected a name for (.+) here, but found (.+)\.$/, (a, b) => `यहाँ एक नाम चाहिए था, लेकिन मिला ${frag(b)}।`],
        [/^I expected a "," between the two numbers\.$/, () => 'दोनों संख्याओं के बीच "," चाहिए।'],
        [/^I expected a "," or "\)" here, but found (.+)\.$/, (a) => `यहाँ "," या ")" चाहिए था, लेकिन मिला ${frag(a)}।`],
        [/^I expected a "," or "\]" in this list, but found (.+)\.$/, (a) => `इस सूची में "," या "]" चाहिए था, लेकिन मिला ${frag(a)}।`],
        [/^I expected a "\)" to close the "\("\.$/, () => '"(" को बंद करने के लिए ")" चाहिए।'],
        [/^I don't know a recipe called "(.+)"\.$/, (a) => `मुझे "${a}" नाम की कोई रेसिपी नहीं पता।`],
        [/^"(.+)" needs (\d+) inputs?(?: \((.*)\))?, but got (\d+)\.$/, (a, b, c, d) => `"${a}" को ${b} इनपुट${c ? ' (' + c + ')' : ''} चाहिए, लेकिन मिले ${d}।`],
        [/^The AI needs examples for at least two different labels before it can guess\.$/, () => 'अंदाज़ा लगाने से पहले AI को कम से कम दो अलग लेबल के उदाहरण चाहिए।'],
        [/^The AI needs pictures for at least two different labels before it can guess a picture\.$/, () => 'तस्वीर का अंदाज़ा लगाने से पहले AI को कम से कम दो अलग लेबल की तस्वीरें चाहिए।'],
        [/^The AI needs at least one example to learn from\.$/, () => 'सीखने के लिए AI को कम से कम एक उदाहरण चाहिए।'],
        [/^The AI hasn't guessed anything yet\.$/, () => 'AI ने अभी तक कोई अंदाज़ा नहीं लगाया है।'],
        [/^You haven't tested the AI yet\.$/, () => 'आपने अभी तक AI की जाँच नहीं की है।'],
        [/^The AI hasn't learned anything called "(.+)" yet\.$/, (a) => `AI ने अभी तक "${a}" नाम की कोई चीज़ नहीं सीखी है।`],
        [/^The AI needs at least two examples with different inputs to find a pattern\.$/, () => 'पैटर्न ढूँढने के लिए AI को अलग-अलग इनपुट वाले कम से कम दो उदाहरण चाहिए।'],
        [/^"ask picture" only works in the playground\.$/, () => '"ask picture" सिर्फ़ प्लेग्राउंड में काम करता है।'],
        [/^I don't know the colou?r "(.+)"\.$/, (a) => `मुझे "${a}" रंग नहीं पता।`],
        [/^I don't know the note "(.+)"\.$/, (a) => `मुझे "${a}" सुर नहीं पता।`],
        [/^I don't know the sound "(.+)"\.$/, (a) => `मुझे "${a}" आवाज़ नहीं पता।`],
        [/^Say what\? I need something after "(.+)"\.$/, (a) => `क्या बोलूँ? "${a}" के बाद कुछ चाहिए।`],
        [/^Repeat how many times\?$/, () => 'कितनी बार दोहराऊँ?'],
        [/^repeat needs a whole number of times, but got (.+)\.$/, (a) => `repeat को पूरी संख्या चाहिए, लेकिन मिला ${frag(a)}।`],
        [/^"(.+)" is a special word in KidAI, so it can't be used as a name\.$/, (a) => `"${a}" KidAI का खास शब्द है, इसलिए इसे नाम नहीं बना सकते।`],
        [/^I don't understand the symbol "(.+)"\.$/, (a) => `मुझे "${a}" चिह्न समझ नहीं आया।`],
        [/^There is no sprite called "(.+)" yet\.$/, (a) => `अभी तक "${a}" नाम का कोई sprite नहीं है।`],
        [/^Your recipes called each other too many times\.$/, () => 'आपकी रेसिपियों ने एक-दूसरे को बहुत बार बुलाया।'],
        [/^This record has no field called "(.+)"\.$/, (a) => `इस रिकॉर्ड में "${a}" नाम का कोई फ़ील्ड नहीं है।`],
        [/^chat needs a connection to a cloud AI, and there isn't one here\.$/, () => 'chat के लिए क्लाउड AI से कनेक्शन चाहिए, जो यहाँ नहीं है।'],
        [/^I can't find the file "(.+)"\.$/, (a) => `मुझे "${a}" फ़ाइल नहीं मिली।`],
        [/^(.+) needs a number, but got (.+)\.$/, (a, b) => `${a} को संख्या चाहिए, लेकिन मिला ${frag(b)}।`],
        [/^This line stopped too early\. I expected a value at the end\.$/, () => 'यह लाइन जल्दी खत्म हो गई। अंत में कोई मान चाहिए था।'],
        [/^A line should start with an instruction, like say or set\.$/, () => 'लाइन किसी निर्देश से शुरू होनी चाहिए, जैसे say या set।'],
        [/^I don't know what to do with this line\.$/, () => 'मुझे समझ नहीं आया कि इस लाइन का क्या करूँ।'],
        [/^Turn which way\?$/, () => 'किस तरफ़ मुड़ूँ?'],
        [/^What should the pen do\?$/, () => 'पेन क्या करे?'],
        [/^Play what\?$/, () => 'क्या बजाऊँ?'],
        [/^Forget what\?$/, () => 'क्या भूल जाऊँ?'],
        [/^"(.+)" is not a list\.$/, (a) => `"${a}" एक सूची नहीं है।`],
        [/^(.+) is not in (.+)\.$/, (a, b) => `${a}, ${b} में नहीं है।`],
        [/^Item numbers must be whole numbers, but got (.+)\.$/, (a) => `आइटम नंबर पूरी संख्या होनी चाहिए, लेकिन मिला ${frag(a)}।`],
        [/^"(.+)" needs a list, but got (.+)\.$/, (a, b) => `"${a}" को एक सूची चाहिए, लेकिन मिला ${frag(b)}।`],
        [/^I can only change numbers, but "(.+)" is (.+)\.$/, (a, b) => `मैं सिर्फ़ संख्याएँ बदल सकता हूँ, लेकिन "${a}" ${frag(b)} है।`],
        [/^Saving only works in the playground or the kidai command\.$/, () => 'सेव करना सिर्फ़ प्लेग्राउंड या kidai कमांड में काम करता है।'],
        [/^There is no saved AI called "(.+)"\.$/, (a) => `"${a}" नाम का कोई सेव किया हुआ AI नहीं है।`],
        [/^Recipes \(define\) must be made at the top of your program, not inside another block\.$/, () => 'रेसिपी (define) प्रोग्राम में सबसे बाहर बनाइए, किसी दूसरे ब्लॉक के अंदर नहीं।'],
        [/^"(when|every|use)" must be at the top of your program(?:, not inside another block)?\.$/, (a) => `"${a}" प्रोग्राम में सबसे बाहर होना चाहिए, किसी दूसरे ब्लॉक के अंदर नहीं।`]
      ];
      const HI_HINT = [
        [/^Add "wait 0\.05" inside it\.$/, () => 'इसके अंदर "wait 0.05" जोड़िए।'],
        [/^Did you mean "(.+)"\?$/, (a) => `क्या आपका मतलब "${a}" था?`],
        [/^Make it first with: (.+)$/, (a) => `पहले इसे बनाइए: ${a}`],
        [/^Add a line that says end after the instructions inside it\.$/, () => 'अंदर के निर्देशों के बाद end वाली एक लाइन जोड़िए।'],
        [/^Every end needs something to close, like repeat, if, define or when\. Delete the extra end\.$/, () => 'हर end को कुछ बंद करना होता है, जैसे repeat, if, define या when। फालतू end हटा दीजिए।'],
        [/^Put a " at the end of the words, like: (.+)$/, (a) => `शब्दों के अंत में " लगाइए, जैसे: ${a}`],
        [/^Look for a loop that never ends\. If it should run forever, add "wait 0\.1" inside it\.$/, () => 'ऐसा loop ढूँढिए जो कभी खत्म नहीं होता। अगर उसे हमेशा चलना है, तो उसके अंदर "wait 0.1" जोड़िए।'],
        [/^Use a number other than 0\.$/, () => '0 के अलावा कोई और संख्या लीजिए।'],
        [/^Use a number from 1 to (\d+)\.$/, (a) => `1 से ${a} तक की कोई संख्या लीजिए।`],
        [/^Use item 1\.$/, () => 'item 1 लीजिए।'],
        [/^The list is empty\. Add something first\.$/, () => 'सूची खाली है। पहले कुछ जोड़िए।'],
        [/^Make sure both sides are numbers\.$/, () => 'पक्का कीजिए कि दोनों तरफ़ संख्याएँ हों।'],
        [/^Ask a question like: (.+)   or   (.+)$/, (a, b) => `ऐसा सवाल पूछिए: ${a}   या   ${b}`],
        [/^Instructions start a line, like say, set, repeat or if\.$/, () => 'हर लाइन किसी निर्देश से शुरू होती है, जैसे say, set, repeat या if।'],
        [/^Start the line with an instruction like say, set or repeat\.$/, () => 'लाइन को say, set या repeat जैसे किसी निर्देश से शुरू कीजिए।'],
        [/^Each instruction goes on its own line\.$/, () => 'हर निर्देश अपनी अलग लाइन में लिखिए।'],
        [/^Put the instructions on the next lines, then finish with end\.$/, () => 'निर्देश अगली लाइनों में लिखिए, फिर end से खत्म कीजिए।'],
        [/^Pick another name, like (.+)\.$/, (a) => `कोई और नाम चुनिए, जैसे ${a}।`],
        [/^Teach it two groups, like: (.+)$/, (a) => `इसे दो समूह सिखाइए, जैसे: ${a}`],
        [/^Teach it two groups of pictures, like: (.+)$/, (a) => `इसे तस्वीरों के दो समूह सिखाइए, जैसे: ${a}`],
        [/^Open your program in the KidAI playground to draw or pick pictures\.$/, () => 'तस्वीर बनाने या चुनने के लिए अपना प्रोग्राम KidAI प्लेग्राउंड में खोलिए।'],
        [/^Check that a recipe that calls itself has a way to stop\.$/, () => 'देखिए कि खुद को बुलाने वाली रेसिपी के रुकने का कोई रास्ता हो।'],
        [/^Ask a grown-up to set up the KidAI chat gateway(.*)$/, () => 'किसी बड़े से KidAI chat gateway सेट करने को कहिए।'],
        [/^Names are made of letters, like score or my_pet\.$/, () => 'नाम अक्षरों से बनते हैं, जैसे score या my_pet।'],
        [/^Add a number, some "text", or a variable name\.$/, () => 'कोई संख्या, कुछ "text" या किसी variable का नाम जोड़िए।'],
        [/^Compare numbers with numbers, or text with text\.$/, () => 'संख्याओं की तुलना संख्याओं से, और टेक्स्ट की टेक्स्ट से कीजिए।'],
        [/^Try removing it\. (.*)$/, () => 'इसे हटाकर देखिए। चिह्न वाले टेक्स्ट को कोटेशन चिह्नों के अंदर लिखिए।'],
        [/^This is not your fault\. Try running again\.$/, () => 'यह आपकी गलती नहीं है। फिर से चलाकर देखिए।'],
        [/^(Use it like|Like|Try|Use|Lists look like|Records look like): (.+)$/, (a, b) => ({ 'Use it like': 'ऐसे लिखिए', Like: 'जैसे', Try: 'आज़माइए', Use: 'ऐसे लिखिए', 'Lists look like': 'सूचियाँ ऐसी दिखती हैं', 'Records look like': 'रिकॉर्ड ऐसे दिखते हैं' }[a] + ': ' + b)],
        [/^Try (.+)\.$/, (a) => `आज़माइए ${a}।`],
        [/^Use a number here, like 5\.$/, () => 'यहाँ कोई संख्या लिखिए, जैसे 5।'],
        [/^Use a number like 3 or 10\.$/, () => '3 या 10 जैसी कोई संख्या लीजिए।'],
        [/^Move this (.+) out of the block it is in\.$/, (a) => `इस ${a} को उस ब्लॉक से बाहर निकालिए जिसमें यह है।`]
      ];
      // Scans `table` (HI_MSG or HI_HINT) for the first regex that matches `text` and runs its translator.
      function translateText(text, table) {
        if (LANG !== 'hi' || !text) return text;
        for (const [re, f] of table) { const m = String(text).match(re); if (m) return f(...m.slice(1)); }
        return text;
      }
      function setLanguage(lang) { LANG = lang === 'hi' ? 'hi' : 'en'; }

      module.exports = { setLanguage, translateText, HI_MSG, HI_HINT };
    },
    './errors': function (module, exports, require) {
      // KidAI Easy: errors.js
      // KidError (the friendly error kids see) and the signals used for stop, skip and give back.
      'use strict';

      const { HI_HINT, HI_MSG, translateText } = require('./messages');

      // Friendly error shown to the child with a translated message and an optional "hint" line.
      class KidError extends Error {
        constructor(message, line, hint) {
          super(translateText(message, HI_MSG));
          this.english = message;   // original English, useful for logging
          this.kidLine = line;      // source line number shown in the UI
          this.hint = translateText(hint || '', HI_HINT);
        }
      }
      // Control-flow signals — thrown like exceptions to unwind the call stack, not real errors.
      class StopLoop {}    // thrown by "stop" to break out of the nearest loop
      class SkipLoop {}    // thrown by "skip" to jump to the next loop iteration
      class EndProgram {}  // thrown by "stop everything" to end the whole program
      class Halted {}      // thrown when the interpreter is halted from outside (e.g. Stop button)
      class GiveBack { constructor(v) { this.value = v; } } // thrown by "give back" to return a value from a recipe

      module.exports = { KidError, Halted, StopLoop, SkipLoop, EndProgram, GiveBack };
    },
    './values': function (module, exports, require) {
      // KidAI Easy: values.js
      // Small helpers for values: turning them into text, comparing them, and "did you mean" spelling help.
      'use strict';

      // Damerau-Levenshtein distance: counts single-character edits plus adjacent transpositions.
      // Used by closest() to power "did you mean?" suggestions for mistyped variable/recipe names.
      function distance(a, b) {
        const m = a.length, n = b.length;
        const d = Array.from({ length: m + 1 }, (_, i) => [i]);
        for (let j = 1; j <= n; j++) d[0][j] = j;
        for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1,
              d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
            // allow one transposition (e.g. "fro" → "for")
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
          }
        }
        return d[m][n];
      }
      // Returns the best match from options within edit-distance 1 (short words) or 2 (longer words), or null.
      function closest(word, options) {
        let best = null, bestD = Infinity;
        for (const o of options) {
          const dd = distance(word, o);
          if (dd < bestD) { bestD = dd; best = o; }
        }
        const limit = word.length <= 3 ? 1 : 2;
        return bestD <= limit ? best : null;
      }

      // A picture value: 16 x 16 brightness numbers (0 = blank, 1 = ink) plus an optional preview image.
      class Picture {
        constructor(pixels, thumb) { this.pixels = Array.from(pixels); this.thumb = thumb || null; }
      }
      const isRecord = (v) => v instanceof Map;

      function fmtNumber(n) {
        if (!isFinite(n)) return n > 0 ? 'infinity' : (n < 0 ? '-infinity' : 'not a number');
        if (Number.isInteger(n)) return String(n);
        return String(parseFloat(n.toFixed(6)));
      }
      // toText: what "say x" prints — the value itself as a string (e.g. 3 → "3", yes → "yes").
      function toText(v) {
        if (v === null || v === undefined) return 'nothing';
        if (typeof v === 'number') return fmtNumber(v);
        if (typeof v === 'boolean') return v ? 'yes' : 'no';
        if (Array.isArray(v)) return '[' + v.map(toText).join(', ') + ']';
        if (isRecord(v)) return '{' + Array.from(v.entries()).map(([k, x]) => k + ': ' + toText(x)).join(', ') + '}';
        if (v instanceof Picture) return 'a picture';
        if (typeof v === 'object' && v.kind === 'recipe') return 'recipe ' + v.raw;
        return String(v);
      }
      // describe: what appears in an error message — adds type context (e.g. 3 → "the number 3", "hi" → 'the text "hi"').
      function describe(v) {
        if (typeof v === 'string') return 'the text "' + v + '"';
        if (typeof v === 'number') return 'the number ' + fmtNumber(v);
        if (typeof v === 'boolean') return v ? 'yes' : 'no';
        if (Array.isArray(v)) return 'a list';
        if (isRecord(v)) return 'a record';
        if (v instanceof Picture) return 'a picture';
        if (v === null || v === undefined) return 'nothing';
        return toText(v);
      }
      function looksNumeric(s) {
        return typeof s === 'string' && /^\s*-?\d+(\.\d+)?\s*$/.test(s);
      }
      // same: the equality check used by "is", "contains", and "remove". Case-insensitive for text;
      // tolerates tiny floating-point errors for numbers; compares lists and records recursively.
      function same(a, b) {
        if (typeof a === 'number' && looksNumeric(b)) b = parseFloat(b);
        if (typeof b === 'number' && looksNumeric(a)) a = parseFloat(a);
        if (typeof a === 'string' && typeof b === 'string') {
          return a.trim().toLowerCase() === b.trim().toLowerCase();
        }
        if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-9;
        if (Array.isArray(a) && Array.isArray(b)) {
          return a.length === b.length && a.every((x, i) => same(x, b[i]));
        }
        if (isRecord(a) && isRecord(b)) {
          return a.size === b.size && Array.from(a.keys()).every(k => b.has(k) && same(a.get(k), b.get(k)));
        }
        return a === b;
      }
      function describeToken(t) {
        if (!t) return 'the end of the line';
        if (t.t === 'str') return '"' + t.v + '"';
        if (t.t === 'num') return fmtNumber(t.v);
        return '"' + (t.raw || t.v) + '"';
      }

      module.exports = { toText, Picture, describeToken, closest, describe, looksNumeric, isRecord, same, fmtNumber };
    },
    './brain': function (module, exports, require) {
      // KidAI Easy: brain.js
      // The tiny offline AI: words (naive Bayes), pictures (nearest neighbours) and numbers (straight-line fit).
      'use strict';

      const { toText } = require('./values');

      // Split any value into an array of lowercase words/numbers for the text classifier.
      function words(text) {
        return toText(text).toLowerCase().match(/[\p{L}\p{N}']+/gu) || [];
      }
      // Turn any ink grid (size x size, 0..1) into a 16 x 16 picture centred on the ink.
      // Steps: (1) find the bounding box of all inked pixels, (2) crop + scale to a square 16×16 grid
      // using area-averaging, (3) apply a light blur so small drawing differences don't hurt accuracy.
      function normalizePicture(data, size) {
        let x0 = size, y0 = size, x1 = -1, y1 = -1;
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
          if (data[y * size + x] > 0.15) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        }
        const out = new Array(256).fill(0);
        if (x1 < 0) return out; // blank canvas
        const w = x1 - x0 + 1, h = y1 - y0 + 1, side = Math.max(w, h);
        const ox = x0 - (side - w) / 2, oy = y0 - (side - h) / 2;
        for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
          let sum = 0, n = 0;
          const sx0 = ox + (x / 16) * side, sx1 = ox + ((x + 1) / 16) * side, sy0 = oy + (y / 16) * side, sy1 = oy + ((y + 1) / 16) * side;
          for (let sy = Math.floor(sy0); sy < Math.max(Math.floor(sy0) + 1, Math.ceil(sy1)); sy++) {
            for (let sx = Math.floor(sx0); sx < Math.max(Math.floor(sx0) + 1, Math.ceil(sx1)); sx++) {
              if (sx >= 0 && sy >= 0 && sx < size && sy < size) sum += data[sy * size + sx];
              n++;
            }
          }
          out[y * 16 + x] = n ? Math.min(1, sum / n) : 0;
        }
        // a little blur so nearly-the-same drawings look alike
        const blur = out.slice();
        for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
          let s = 0, n = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const yy = y + dy, xx = x + dx;
            if (yy >= 0 && xx >= 0 && yy < 16 && xx < 16) { s += out[yy * 16 + xx] * (dx || dy ? 0.5 : 1); n += dx || dy ? 0.5 : 1; }
          }
          blur[y * 16 + x] = s / n;
        }
        return blur;
      }
      // Cosine similarity between two pixel vectors: 1 = identical, 0 = nothing in common.
      // Used by guessPicture to rank how closely a drawn picture matches each stored example.
      function cosine(a, b) {
        let ab = 0, aa = 0, bb = 0;
        for (let i = 0; i < a.length; i++) { ab += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; }
        return aa && bb ? ab / Math.sqrt(aa * bb) : 0;
      }

      // TinyBrain holds three independent AI models in one object:
      //   labels  → naive Bayes text classifier (teach / guess)
      //   pics    → k-nearest-neighbour picture classifier (teachPictures / guessPicture)
      //   numbers → simple linear regression (learn / predict)
      class TinyBrain {
        constructor() { this.labels = new Map(); this.pics = new Map(); this.numbers = new Map(); }
        teachPictures(label, pics) {
          const key = toText(label);
          if (!this.pics.has(key)) this.pics.set(key, []);
          for (const p of pics) this.pics.get(key).push(p.pixels);
        }
        pictureCount() { let n = 0; for (const v of this.pics.values()) n += v.length; return n; }
        // k-NN picture classifier: finds the 5 closest stored examples by cosine similarity,
        // then converts their distances to soft votes via exp() so the result is a probability.
        guessPicture(pic) {
          const all = [];
          for (const [label, list] of this.pics) for (const v of list) all.push({ label, sim: cosine(pic.pixels, v) });
          all.sort((a, b) => b.sim - a.sim);
          const k = Math.min(5, all.length);
          const votes = new Map();
          for (const label of this.pics.keys()) votes.set(label, 0.0001);
          for (let i = 0; i < k; i++) votes.set(all[i].label, votes.get(all[i].label) + Math.exp(12 * (all[i].sim - 1)));
          let total = 0; for (const v of votes.values()) total += v;
          const scores = Array.from(votes.entries()).map(([label, v]) => ({ label, p: v / total })).sort((a, b) => b.p - a.p);
          return {
            label: scores[0].label, sure: Math.round(scores[0].p * 100),
            scores: scores.map(x => ({ label: x.label, sure: Math.round(x.p * 100) })),
            knownWords: ['picture'], examples: this.pictureCount(), labelCount: this.pics.size, picture: true,
            closest: all.slice(0, 3).map(x => ({ label: x.label, alike: Math.round(Math.max(0, x.sim) * 100) })),
            reasons: []
          };
        }
        learn(name, pairs) {
          const key = toText(name);
          if (!this.numbers.has(key)) this.numbers.set(key, []);
          for (const p of pairs) this.numbers.get(key).push(p);
        }
        // Ordinary-least-squares linear regression on the stored [input, output] pairs.
        // Returns slope, intercept, r² (how well a straight line fits), and the predicted output for x.
        predict(name, x) {
          const pts = this.numbers.get(toText(name));
          if (!pts) return null;
          const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
          let sxx = 0, sxy = 0, syy = 0;
          for (const [px, py] of pts) { sxx += (px - mx) * (px - mx); sxy += (px - mx) * (py - my); syy += (py - my) * (py - my); }
          const slope = sxx ? sxy / sxx : 0, intercept = my - slope * mx;
          let res = 0; for (const [px, py] of pts) res += Math.pow(py - (slope * px + intercept), 2);
          const r2 = syy ? Math.max(0, 1 - res / syy) : 1;
          return { slope, intercept, r2, points: pts.slice(), input: x, output: slope * x + intercept, flat: !sxx };
        }
        toJSON() {
          return {
            labels: Array.from(this.labels.entries()).map(([k, L]) => [k, { examples: L.examples, total: L.total, counts: Array.from(L.counts.entries()) }]),
            pics: Array.from(this.pics.entries()),
            numbers: Array.from(this.numbers.entries())
          };
        }
        static fromJSON(o) {
          const b = new TinyBrain();
          for (const [k, L] of o.labels || []) b.labels.set(k, { examples: L.examples, total: L.total, counts: new Map(L.counts) });
          for (const [k, v] of o.pics || []) b.pics.set(k, v);
          for (const [k, v] of o.numbers || []) b.numbers.set(k, v);
          return b;
        }
        teach(label, examples) {
          const key = toText(label);
          if (!this.labels.has(key)) this.labels.set(key, { examples: 0, counts: new Map(), total: 0 });
          const L = this.labels.get(key);
          for (const ex of examples) {
            L.examples++;
            for (const w of words(ex)) {
              L.counts.set(w, (L.counts.get(w) || 0) + 1);
              L.total++;
            }
          }
        }
        exampleCount() { let n = 0; for (const L of this.labels.values()) n += L.examples; return n; }
        // Naive Bayes text classifier with Laplace (add-1) smoothing.
        // Scores each label by log(prior) + sum of log(P(word|label)) for words seen in training,
        // then converts log-scores to probabilities with softmax.
        guess(text) {
          const ws = words(text);
          const vocab = new Set();
          for (const L of this.labels.values()) for (const w of L.counts.keys()) vocab.add(w);
          const V = vocab.size + 1; // +1 for Laplace smoothing denominator
          const totalEx = this.exampleCount();
          const known = ws.filter(w => vocab.has(w));
          const scores = [];
          for (const [label, L] of this.labels) {
            let s = Math.log(L.examples / totalEx); // log prior
            for (const w of known) s += Math.log(((L.counts.get(w) || 0) + 1) / (L.total + V)); // log likelihood
            scores.push({ label, s });
          }
          const max = Math.max.apply(null, scores.map(x => x.s));
          let sum = 0;
          for (const x of scores) { x.p = Math.exp(x.s - max); sum += x.p; }
          for (const x of scores) x.p /= sum;
          scores.sort((a, b) => b.p - a.p);
          const winner = this.labels.get(scores[0].label);
          const reasons = [];
          for (const w of Array.from(new Set(known))) {
            const pw = ((winner.counts.get(w) || 0) + 1) / (winner.total + V);
            let best = 0;
            for (const [lab, L] of this.labels) if (lab !== scores[0].label) best = Math.max(best, ((L.counts.get(w) || 0) + 1) / (L.total + V));
            const push = Math.log(pw / best);
            if (push > 0.05) reasons.push({ word: w, push: Math.round(push * 10) / 10 });
          }
          reasons.sort((a, b) => b.push - a.push);
          return {
            reasons: reasons.slice(0, 4),
            label: scores[0].label,
            sure: Math.round(scores[0].p * 100),
            scores: scores.map(x => ({ label: x.label, sure: Math.round(x.p * 100) })),
            knownWords: known,
            examples: totalEx,
            labelCount: this.labels.size
          };
        }
      }

      module.exports = { normalizePicture, TinyBrain };
    },
    './words': function (module, exports, require) {
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
    },
    './tokenizer': function (module, exports, require) {
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
    },
    './parse-expressions': function (module, exports, require) {
      // KidAI Easy: parse-expressions.js
      // Step 2a: reads expressions (sums, comparisons, lists, records, recipe calls) from one line of tokens.
      'use strict';

      const { KidError } = require('./errors');
      const { RESERVED, SOFT, softKeyword } = require('./words');
      const { describeToken } = require('./values');

      // Line wraps the token array from the tokenizer and provides a simple cursor API
      // (peek/next/acceptWord/acceptOp) so the parser can consume tokens without index arithmetic.
      class Line {
        constructor(toks, line) { this.toks = toks; this.pos = 0; this.line = line; }
        peek(o) { return this.toks[this.pos + (o || 0)]; }
        next() { return this.toks[this.pos++]; }
        atEnd() { return this.pos >= this.toks.length; }
        isWord(w, o) { const t = this.peek(o); return !!t && t.t === 'word' && t.v === w; }
        isOp(op, o) { const t = this.peek(o); return !!t && t.t === 'op' && t.v === op; }
        acceptWord() {
          const t = this.peek();
          if (t && t.t === 'word' && Array.prototype.includes.call(arguments, t.v)) { this.pos++; return t; }
          return null;
        }
        acceptOp(op) { if (this.isOp(op)) { this.pos++; return true; } return false; }
      }
      function expectWord(L, w, hint) {
        if (!L.acceptWord(w)) {
          throw new KidError('I expected the word "' + w + '" here, but found ' + describeToken(L.peek()) + '.',
            L.line, hint);
        }
      }
      function expectName(L, what) {
        const t = L.next();
        if (!t || t.t !== 'word') {
          throw new KidError('I expected a name for ' + what + ' here, but found ' + describeToken(t) + '.',
            L.line, 'Names are made of letters, like score or my_pet.');
        }
        if (RESERVED.has(t.v) && !SOFT.has(t.v)) {
          throw new KidError('"' + t.raw + '" is a special word in KidAI, so it can\'t be used as a name.',
            L.line, 'Pick another name, like my_' + t.v + '.');
        }
        return { key: t.v, raw: t.raw };
      }
      function finishLine(L) {
        L.acceptOp(':');
        if (!L.atEnd()) {
          throw new KidError('I didn\'t expect ' + describeToken(L.peek()) + ' here.', L.line,
            'Each instruction goes on its own line.');
        }
      }
      function blockOpen(L) {
        L.acceptOp(':');
        if (!L.atEnd()) {
          throw new KidError('I didn\'t expect ' + describeToken(L.peek()) + ' after the ":".', L.line,
            'Put the instructions on the next lines, then finish with end.');
        }
      }

      // ---- expressions
      // Classic recursive-descent parser with explicit operator precedence levels:
      //   expr → or → and → not → compare → contains → additive → mult → unary → atom
      // Each level calls the next, so tighter-binding operators are parsed deeper in the call stack.
      function expr(L) { return orExpr(L); }
      function orExpr(L) {
        let a = andExpr(L);
        while (L.acceptWord('or')) a = { k: 'or', a, b: andExpr(L), line: L.line };
        return a;
      }
      function andExpr(L) {
        let a = notExpr(L);
        while (L.acceptWord('and')) a = { k: 'and', a, b: notExpr(L), line: L.line };
        return a;
      }
      function notExpr(L) {
        if (L.acceptWord('not')) return { k: 'not', a: notExpr(L), line: L.line };
        return compare(L);
      }
      function compare(L) {
        const a = containsExpr(L);
        const t = L.peek();
        if (t && t.t === 'op' && ['>', '<', '>=', '<=', '=', '!='].includes(t.v)) {
          L.next();
          return { k: 'bin', op: t.v, a, b: containsExpr(L), line: L.line };
        }
        if ((L.isWord('starts') || L.isWord('ends')) && L.isWord('with', 1)) {
          const which = L.next().v; L.next();
          return { k: which === 'starts' ? 'starts' : 'ends', a, b: containsExpr(L), line: L.line };
        }
        if (L.acceptWord('touches', 'touching')) {
          if (L.acceptWord('edge')) return { k: 'touchedge', a, line: L.line };
          return { k: 'touches', a, b: containsExpr(L), line: L.line };
        }
        if (L.acceptWord('is')) {
          let op = '=', word;
          if (L.acceptWord('not')) op = '!=';
          else if ((word = L.acceptWord('bigger', 'greater', 'more', 'larger', 'taller', 'older'))) {
            expectWord(L, 'than'); op = '>';
          } else if ((word = L.acceptWord('smaller', 'less', 'fewer', 'shorter', 'younger'))) {
            expectWord(L, 'than'); op = '<';
          }
          return { k: 'bin', op, a, b: containsExpr(L), line: L.line, word: word ? word.raw.toLowerCase() : undefined };
        }
        return a;
      }
      function containsExpr(L) {
        const a = additive(L);
        if (L.acceptWord('contains')) return { k: 'contains', a, b: additive(L), line: L.line };
        return a;
      }
      function additive(L) {
        let a = mult(L);
        for (;;) {
          if (L.acceptOp('+')) a = { k: 'bin', op: '+', a, b: mult(L), line: L.line };
          else if (L.acceptOp('-')) a = { k: 'bin', op: '-', a, b: mult(L), line: L.line };
          else return a;
        }
      }
      function mult(L) {
        let a = unary(L);
        for (;;) {
          if (L.acceptOp('*')) a = { k: 'bin', op: '*', a, b: unary(L), line: L.line };
          else if (L.acceptOp('/')) a = { k: 'bin', op: '/', a, b: unary(L), line: L.line };
          else if (L.acceptOp('mod') || L.acceptWord('mod')) a = { k: 'bin', op: 'mod', a, b: unary(L), line: L.line };
          else return a;
        }
      }
      function unary(L) {
        if (L.acceptOp('-')) return { k: 'neg', a: unary(L), line: L.line };
        let e = atom(L);
        while (L.isOp('.') && L.peek(1) && L.peek(1).t === 'word') {
          L.next();
          const f = L.next();
          e = { k: 'field', a: e, key: f.v, raw: f.raw, line: L.line };
        }
        return e;
      }
      function recordLit(L, line) {
        const fields = [];
        if (L.acceptOp('}')) return { k: 'record', fields, line };
        for (;;) {
          const t = L.next();
          if (!t || (t.t !== 'word' && t.t !== 'str')) {
            throw new KidError('I expected a field name here, but found ' + describeToken(t) + '.', line,
              'Records look like {name: "Tom", age: 3}');
          }
          if (!L.acceptOp(':')) throw new KidError('I expected a ":" after "' + (t.raw || t.v) + '".', line, 'Records look like {name: "Tom", age: 3}');
          fields.push({ key: String(t.t === 'word' ? t.v : t.v.toLowerCase()), raw: t.raw || t.v, e: expr(L) });
          if (L.acceptOp('}')) return { k: 'record', fields, line };
          if (!L.acceptOp(',')) throw new KidError('I expected a "," or "}" in this record, but found ' + describeToken(L.peek()) + '.', line, 'Records look like {name: "Tom", age: 3}');
        }
      }
      function args(L) {
        const list = [];
        if (L.acceptOp(')')) return list;
        for (;;) {
          list.push(expr(L));
          if (L.acceptOp(')')) return list;
          if (!L.acceptOp(',')) {
            throw new KidError('I expected a "," or ")" here, but found ' + describeToken(L.peek()) + '.',
              L.line, 'Separate things with commas and close with ), like greet("Mira", 10)');
          }
        }
      }
      function atom(L) {
        const t = L.next();
        const line = L.line;
        if (!t) {
          throw new KidError('This line stopped too early. I expected a value at the end.', line,
            'Add a number, some "text", or a variable name.');
        }
        if (t.t === 'num') return { k: 'val', v: t.v };
        if (t.t === 'str') return { k: 'val', v: t.v };
        if (t.t === 'op' && t.v === '{') return recordLit(L, line);
        if (t.t === 'word') {
          if (t.v === 'split') {
            const a = additive(L);
            expectWord(L, 'by', 'Use it like: split "a,b,c" by ","');
            return { k: 'split', a, b: additive(L), line };
          }
          let joinKeyword = t.v === 'join' && !L.isOp('(');
          if (t.v === 'join' && L.isOp('(')) {
            // join(a, b) is the helper; join (list) with ", " is the keyword form
            const save = L.pos;
            try { L.next(); args(L); joinKeyword = L.isWord('with'); } catch (err) { joinKeyword = false; }
            L.pos = save;
          }
          if (joinKeyword) {
            const a = additive(L);
            expectWord(L, 'with', 'Use it like: join fruits with ", "');
            return { k: 'join', a, b: additive(L), line };
          }
          if (t.v === 'replace') {
            const a = additive(L);
            expectWord(L, 'with', 'Use it like: replace "cat" with "dog" in sentence');
            const b = additive(L);
            expectWord(L, 'in', 'Use it like: replace "cat" with "dog" in sentence');
            return { k: 'replace', a, b, c: unary(L), line };
          }
          if (t.v === 'keys' && L.isWord('of')) { L.next(); return { k: 'keys', a: unary(L), line }; }
          if (t.v === 'stage' && L.isWord('picture')) { L.next(); return { k: 'stagepic', line }; }
          if (t.v === 'load') return { k: 'load', a: unary(L), line };
          if (t.v === 'chat') return { k: 'chat', a: additive(L), line };
          if (t.v === 'predict') {
            const name = additive(L);
            expectWord(L, 'for', 'Use it like: predict "plant" for 10');
            return { k: 'predict', name, x: additive(L), line };
          }
          if (t.v === 'how' && L.isWord('accurate')) { L.next(); return { k: 'howaccurate', line }; }
        }
        if (t.t === 'op' && t.v === '(') {
          const e = expr(L);
          if (!L.acceptOp(')')) throw new KidError('I expected a ")" to close the "(".', line, 'Add a ) at the right place.');
          return e;
        }
        if (t.t === 'op' && t.v === '[') {
          const items = [];
          if (!L.acceptOp(']')) {
            for (;;) {
              items.push(expr(L));
              if (L.acceptOp(']')) break;
              if (!L.acceptOp(',')) {
                throw new KidError('I expected a "," or "]" in this list, but found ' + describeToken(L.peek()) + '.',
                  line, 'Lists look like ["apple", "banana", "mango"]');
              }
            }
          }
          return { k: 'list', items, line };
        }
        if (t.t === 'word') {
          switch (t.v) {
            case 'yes': case 'true': return { k: 'val', v: true };
            case 'no': case 'false': return { k: 'val', v: false };
            case 'nothing': return { k: 'val', v: null };
            case 'random':
              if (L.isWord('item') && L.isWord('from', 1)) {
                L.next(); L.next();
                return { k: 'randitem', list: unary(L), line };
              }
              {
                const lo = additive(L);
                expectWord(L, 'to', 'Random numbers look like: random 1 to 10');
                return { k: 'random', lo, hi: additive(L), line };
              }
            case 'item': {
              if (!softKeyword(L)) return { k: 'name', key: t.v, raw: t.raw, line };
              const idx = additive(L);
              expectWord(L, 'of', 'Use it like: item 1 of fruits');
              return { k: 'item', idx, list: unary(L), line };
            }
            case 'length':
              if (!softKeyword(L)) return { k: 'name', key: t.v, raw: t.raw, line };
              L.acceptWord('of');
              return { k: 'length', a: unary(L), line };
            case 'key': {
              if (!softKeyword(L)) return { k: 'name', key: t.v, raw: t.raw, line };
              const key = additive(L);
              expectWord(L, 'is', 'Use it like: if key "left" is pressed:');
              if (!L.acceptWord('pressed', 'down')) expectWord(L, 'pressed', 'Use it like: if key "left" is pressed:');
              return { k: 'keydown', key, line };
            }
            case 'x': case 'y':
              if (L.isWord('position')) { L.next(); return { k: 'turtlepos', axis: t.v, line }; }
              if (L.isWord('of') && L.isWord('sprite', 1)) { L.next(); L.next(); return { k: 'spritepos', axis: t.v, name: unary(L), line }; }
              break;
            case 'how':
              expectWord(L, 'sure', 'Use: how sure');
              return { k: 'howsure', line };
            case 'guess':
              return { k: 'guess', a: additive(L), line };
          }
          if (RESERVED.has(t.v)) {
            throw new KidError('I didn\'t expect the word "' + t.raw + '" here.', line,
              '"' + t.raw + '" is a special word. Check the order of words on this line.');
          }
          if (L.acceptOp('(')) return { k: 'call', key: t.v, raw: t.raw, args: args(L), line };
          return { k: 'name', key: t.v, raw: t.raw, line };
        }
        throw new KidError('I didn\'t expect ' + describeToken(t) + ' here.', line,
          'Check this line for a missing value or an extra symbol.');
      }

      module.exports = { Line, expectWord, expectName, finishLine, blockOpen, expr, additive };
    },
    './parser': function (module, exports, require) {
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
    },
    './runtime-helpers': function (module, exports, require) {
      // KidAI Easy: runtime-helpers.js
      // Built-in recipes (round, sqrt...), number checks, notes, safety limits and the "fast path" tests used by the interpreter.
      'use strict';

      const { KidError, SkipLoop, StopLoop } = require('./errors');
      const { describe, looksNumeric, toText } = require('./values');

      const BUILTINS = {
        round: (a) => { need(a, 1, 2, 'round'); const d = a[1] === undefined ? 0 : num(a[1], 'round'); const f = Math.pow(10, d); return Math.round(num(a[0], 'round') * f) / f; },
        number: (a) => { need(a, 1, 1, 'number'); const v = a[0]; if (typeof v === 'number') return v; if (looksNumeric(v)) return parseFloat(v); throw new KidError('I can\'t turn ' + describe(v) + ' into a number.', null, 'Only text like "42" can become a number.'); },
        text: (a) => { need(a, 1, 1, 'text'); return toText(a[0]); },
        uppercase: (a) => { need(a, 1, 1, 'uppercase'); return toText(a[0]).toUpperCase(); },
        lowercase: (a) => { need(a, 1, 1, 'lowercase'); return toText(a[0]).toLowerCase(); },
        sqrt: (a) => { need(a, 1, 1, 'sqrt'); return Math.sqrt(num(a[0], 'sqrt')); },
        abs: (a) => { need(a, 1, 1, 'abs'); return Math.abs(num(a[0], 'abs')); },
        join: (a) => a.map(toText).join('')
      };
      function need(a, min, max, name) {
        if (a.length < min || a.length > max) {
          throw new KidError(name + ' needs ' + (min === max ? min : min + ' or ' + max) + ' thing' + (max > 1 ? 's' : '') + ' inside the ( ), but got ' + a.length + '.', null, '');
        }
      }
      function num(v, what) {
        if (typeof v === 'number') return v;
        if (looksNumeric(v)) return parseFloat(v);
        throw new KidError(what + ' needs a number, but got ' + describe(v) + '.', null,
          'Use a number here, like 5.');
      }

      // "C", "C#", "Db", "C5", "a4" -> frequency in Hz (middle C is "C4")
      function noteFreq(v, line) {
        if (typeof v === 'number') {
          if (v > 0 && v < 128 && Number.isInteger(v)) return 440 * Math.pow(2, (v - 69) / 12);
          throw new KidError('Notes are letters like "C", "D#" or "G5".', line, 'Try: play note "C"');
        }
        const m = /^\s*([a-gA-G])\s*([#b\u266F\u266D]?)\s*(-?\d)?\s*$/.exec(String(v));
        if (!m) throw new KidError('I don\'t know the note "' + v + '".', line, 'Notes are A B C D E F G, like "C", "F#" or "C5".');
        const base = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[m[1].toLowerCase()];
        const acc = m[2] === '#' || m[2] === '\u266F' ? 1 : (m[2] === 'b' || m[2] === '\u266D' ? -1 : 0);
        const oct = m[3] === undefined ? 4 : parseInt(m[3], 10);
        return 440 * Math.pow(2, ((oct + 1) * 12 + base + acc - 69) / 12);
      }
      const SOUNDS = ['pop', 'coin', 'jump', 'boom', 'laser', 'win', 'lose'];

      // ---- speed helpers: most expressions and simple statements run without waiting
      const NEED_ASYNC = { needAsync: true };
      const LOOPS = new Set(['repeat', 'while', 'until', 'forever', 'foreach']);
      const SYNC_KINDS = new Set(['val', 'list', 'name', 'and', 'or', 'not', 'neg', 'bin', 'contains', 'random', 'randitem', 'item', 'length',
        'record', 'field', 'touches', 'touchedge', 'keydown', 'turtlepos', 'spritepos', 'howsure', 'howaccurate', 'keys', 'split', 'join',
        'replace', 'starts', 'ends', 'stagepic']);
      function isSyncExpr(e) {
        if (!e || !SYNC_KINDS.has(e.k)) return false;
        for (const key of Object.keys(e)) {
          const v = e[key];
          if (key === 'items') { if (!v.every(isSyncExpr)) return false; }
          else if (key === 'fields') { if (!v.every(f => isSyncExpr(f.e))) return false; }
          else if (v && typeof v === 'object' && typeof v.k === 'string' && !isSyncExpr(v)) return false;
        }
        return true;
      }
      function isFastStmt(s) {
        switch (s.type) {
          case 'say': case 'set': case 'change': return isSyncExpr(s.e);
          case 'if': return s.branches.every(b => isSyncExpr(b.cond));
          case 'stop': case 'skip': case 'comment': case 'blank': case 'use': return true;
        }
        return false;
      }
      function loopSignal(e) {
        if (e instanceof SkipLoop) return 'go';
        if (e instanceof StopLoop) return 'stop';
        throw e;
      }

      const STEP_LIMIT = 1000000;   // steps allowed without a "wait" — catches infinite loops
      const DEPTH_LIMIT = 400;      // maximum recipe call depth — prevents infinite recursion

      module.exports = { BUILTINS, num, NEED_ASYNC, LOOPS, isSyncExpr, isFastStmt, loopSignal, STEP_LIMIT, noteFreq, SOUNDS, DEPTH_LIMIT };
    },
    './statements': function (module, exports, require) {
      // KidAI Easy: statements.js
      // What every statement does (say, set, repeat, forward, teach, make sprite...). Added to Interpreter.
      'use strict';

      const { GiveBack, Halted, KidError, SkipLoop, StopLoop } = require('./errors');
      const { Picture, describe, isRecord, looksNumeric, same, toText } = require('./values');
      const { TinyBrain, normalizePicture } = require('./brain');
      const { SOUNDS, noteFreq, num } = require('./runtime-helpers');

      class StatementMethods {
        async execAsync(s, scope) {
          const T = this.turtle;
          switch (s.type) {
            case 'say': {
              const v = await this.eval(s.e, scope);
              if (this.host.say) this.host.say(toText(v));
              return;
            }
            case 'set':
              this.assign(s.name.key, await this.eval(s.e, scope), scope);
              return;
            case 'setitem': {
              const list = this.lookup(s.name.key, scope, s.name.raw, s.line);
              if (!Array.isArray(list)) throw new KidError('"' + s.name.raw + '" is not a list.', s.line, '');
              const i = this.index(await this.eval(s.idx, scope), list, s.line);
              list[i] = await this.eval(s.e, scope);
              return;
            }
            case 'change': {
              const cur = this.lookup(s.name.key, scope, s.name.raw, s.line);
              const by = await this.eval(s.e, scope);
              if (typeof cur !== 'number') {
                throw new KidError('I can only change numbers, but "' + s.name.raw + '" is ' + describe(cur) + '.', s.line,
                  'Use set ' + s.name.raw + ' to ... instead.');
              }
              this.assign(s.name.key, cur + num(by, 'change'), scope);
              return;
            }
            case 'add': {
              const v = await this.eval(s.e, scope);
              if (!this.has(s.name.key, scope)) {
                throw new KidError('I don\'t know anything called "' + s.name.raw + '" yet.', s.line,
                  'Make an empty list first: set ' + s.name.raw + ' to []');
              }
              const target = this.lookup(s.name.key, scope, s.name.raw, s.line);
              if (Array.isArray(target)) target.push(v);
              else if (typeof target === 'number') this.assign(s.name.key, target + num(v, 'add'), scope);
              else throw new KidError('I can only add to a list or a number, but "' + s.name.raw + '" is ' + describe(target) + '.', s.line, '');
              return;
            }
            case 'remove': {
              const v = await this.eval(s.e, scope);
              const list = this.lookup(s.name.key, scope, s.name.raw, s.line);
              if (!Array.isArray(list)) throw new KidError('"' + s.name.raw + '" is not a list.', s.line, '');
              const i = list.findIndex(x => same(x, v));
              if (i < 0) throw new KidError(toText(v) + ' is not in ' + s.name.raw + '.', s.line, 'Check with: if ' + s.name.raw + ' contains ...');
              list.splice(i, 1);
              return;
            }
            case 'ask': {
              const q = toText(await this.eval(s.e, scope));
              if (!this.host.ask) throw new KidError('This place can\'t ask questions.', s.line, '');
              let a = await this.host.ask(q);
              if (this.halted) throw new Halted();
              if (a === null || a === undefined) a = '';
              if (looksNumeric(a)) a = parseFloat(a);
              this.assign(s.name.key, a, scope);
              this.steps = 0;
              return;
            }
            case 'if': {
              for (const b of s.branches) {
                if (await this.condition(b.cond, scope, 'if')) { await this.block(b.body, scope); return; }
              }
              if (s.otherwise) await this.block(s.otherwise, scope);
              return;
            }
            case 'repeat': {
              const n = await this.eval(s.count, scope);
              if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) {
                throw new KidError('repeat needs a whole number of times, but got ' + describe(n) + '.', s.line,
                  'Use a number like 3 or 10.');
              }
              for (let i = 0; i < n; i++) {
                let r = this.loopBody(s.body, scope);
                if (r instanceof Promise) r = await r;
                if (r === 'stop') break;
              }
              return;
            }
            case 'while': case 'until': case 'forever':
              for (;;) {
                if (s.type !== 'forever') {
                  let c = this.cond(s.cond, scope, s.type === 'while' ? 'repeat while' : 'repeat until');
                  if (c instanceof Promise) c = await c;
                  if (s.type === 'while' ? !c : c) break;
                }
                let r = this.loopBody(s.body, scope);
                if (r instanceof Promise) r = await r;
                if (r === 'stop') break;
                const w = this.tick(s.line);
                if (w) await w;
              }
              return;
            case 'foreach': {
              let list = await this.eval(s.list, scope);
              if (typeof list === 'string') list = Array.from(list);
              if (isRecord(list)) list = Array.from(list.keys());
              if (!Array.isArray(list)) {
                throw new KidError('"for each" needs a list, but got ' + describe(list) + '.', s.line,
                  'Lists look like ["red", "green", "blue"]');
              }
              for (const item of list.slice()) {
                this.assign(s.name.key, item, scope);
                let r = this.loopBody(s.body, scope);
                if (r instanceof Promise) r = await r;
                if (r === 'stop') break;
              }
              return;
            }
            case 'giveback':
              if (!scope) throw new KidError('"give back" only works inside a recipe (define ... end).', s.line, '');
              throw new GiveBack(s.e ? await this.eval(s.e, scope) : null);
            case 'stop': throw new StopLoop();
            case 'stopall':
              this.halted = true;
              this.stoppedAll = true;
              if (this.host.stopped) this.host.stopped();
              throw new Halted();
            case 'note': {
              const nv = await this.eval(s.e, scope);
              const f = noteFreq(nv, s.line);
              const d = s.dur ? num(await this.eval(s.dur, scope), 'play note') : 0.4;
              if (d < 0 || d > 10) throw new KidError('A note can last from 0 to 10 seconds.', s.line, 'Try: play note "C" for 0.5 seconds');
              if (this.host.note) this.host.note(f, d, toText(nv));
              await this.sleep(d);
              return;
            }
            case 'beep':
              if (this.host.note) this.host.note(880, 0.15, 'beep');
              await this.sleep(0.15);
              return;
            case 'sound': {
              const name = toText(await this.eval(s.e, scope)).toLowerCase();
              if (!SOUNDS.includes(name)) {
                throw new KidError('I don\'t know the sound "' + name + '".', s.line, 'Try one of: ' + SOUNDS.join(', '));
              }
              if (this.host.sound) this.host.sound(name);
              return;
            }
            case 'write':
              if (this.host.write) this.host.write(toText(await this.eval(s.e, scope)), T.x, T.y, T.color, Math.max(8, T.size * 6), T.heading);
              return;
            case 'background': {
              const c = toText(await this.eval(s.e, scope));
              if (this.host.checkColor && !this.host.checkColor(c)) {
                throw new KidError('I don\'t know the color "' + c + '".', s.line, 'Try "skyblue", "black", "lightgreen" or "#223344".');
              }
              if (this.host.background) this.host.background(c);
              return;
            }
            case 'dot': {
              const r = Math.abs(num(await this.eval(s.e, scope), 'dot'));
              if (this.host.circle) this.host.circle(T.x, T.y, r, T.color, T.size, false);
              return;
            }
            case 'rect': {
              const w = num(await this.eval(s.w, scope), 'rectangle'), h = num(await this.eval(s.h, scope), 'rectangle');
              if (this.host.rect) this.host.rect(T.x, T.y, Math.abs(w), Math.abs(h), T.color);
              return;
            }
            case 'turnto':
              T.heading = num(await this.eval(s.e, scope), 'turn to') % 360;
              this.drawTurtle();
              return;
            case 'sprite': {
              const name = toText(await this.eval(s.name, scope));
              const look = toText(await this.eval(s.look, scope));
              let sp = this.sprites.get(name);
              if (!sp) { sp = { name, look, x: 0, y: 0, size: 50, visible: true }; this.sprites.set(name, sp); }
              sp.look = look;
              if (s.x) { sp.x = num(await this.eval(s.x, scope), 'make sprite'); sp.y = num(await this.eval(s.y, scope), 'make sprite'); }
              if (s.size) sp.size = Math.max(5, Math.min(400, num(await this.eval(s.size, scope), 'size')));
              this.showSprites();
              return;
            }
            case 'movesprite': {
              const sp = this.getSprite(await this.eval(s.name, scope), s.line);
              const x = num(await this.eval(s.x, scope), 'move sprite'), y = num(await this.eval(s.y, scope), 'move sprite');
              if (s.by) { sp.x += x; sp.y += y; } else { sp.x = x; sp.y = y; }
              this.showSprites();
              return;
            }
            case 'spritevis': {
              const sp = this.getSprite(await this.eval(s.name, scope), s.line);
              sp.visible = s.show;
              this.showSprites();
              return;
            }
            case 'deletesprite': {
              const sp = this.getSprite(await this.eval(s.name, scope), s.line);
              this.sprites.delete(sp.name);
              this.showSprites();
              return;
            }
            case 'skip': throw new SkipLoop();
            case 'wait': {
              const secs = num(await this.eval(s.e, scope), 'wait');
              const ms = Math.max(0, Math.min(secs, 60)) * 1000;
              if (this.host.flush) this.host.flush();
              await this.sleep(ms / 1000);
              return;
            }
            case 'move': {
              const d = num(await this.eval(s.e, scope), 'forward') * s.dir;
              const rad = T.heading * Math.PI / 180;
              const nx = T.x + d * Math.sin(rad), ny = T.y + d * Math.cos(rad);
              if (T.down && this.host.line) this.host.line(T.x, T.y, nx, ny, T.color, T.size);
              T.x = nx; T.y = ny;
              this.drawTurtle();
              await this.slow();
              return;
            }
            case 'turn':
              T.heading = (T.heading + s.dir * num(await this.eval(s.e, scope), 'turn')) % 360;
              this.drawTurtle();
              return;
            case 'pen': T.down = s.down; return;
            case 'pensize': T.size = Math.max(0.5, Math.min(100, num(await this.eval(s.e, scope), 'pen size'))); return;
            case 'color': {
              const c = toText(await this.eval(s.e, scope));
              if (this.host.checkColor && !this.host.checkColor(c)) {
                throw new KidError('I don\'t know the color "' + c + '".', s.line, 'Try "red", "blue", "gold", "hotpink" or "#33aa77".');
              }
              T.color = c;
              return;
            }
            case 'circle': {
              const r = num(await this.eval(s.e, scope), 'circle');
              if (this.host.circle) this.host.circle(T.x, T.y, Math.abs(r), T.color, T.size, T.down);
              await this.slow();
              return;
            }
            case 'clear': if (this.host.clear) this.host.clear(); return;
            case 'home': T.x = 0; T.y = 0; T.heading = 0; this.drawTurtle(); return;
            case 'goto': {
              const x = num(await this.eval(s.x, scope), 'go to'), y = num(await this.eval(s.y, scope), 'go to');
              if (T.down && this.host.line) this.host.line(T.x, T.y, x, y, T.color, T.size);
              T.x = x; T.y = y; this.drawTurtle();
              return;
            }
            case 'visible': T.visible = s.show; this.drawTurtle(); return;
            case 'teach': {
              const label = toText(await this.eval(s.label, scope));
              let ex = await this.eval(s.e, scope);
              if (!Array.isArray(ex)) ex = [ex];
              if (!ex.length) throw new KidError('The AI needs at least one example to learn from.', s.line, 'Like: teach "happy" with ["yay", "I love it"]');
              const pics = ex.filter(x => x instanceof Picture), texts = ex.filter(x => !(x instanceof Picture));
              if (pics.length) this.brain.teachPictures(label, pics);
              if (texts.length) this.brain.teach(label, texts);
              if (this.host.taught) this.host.taught(label, ex.length, this.brain.exampleCount() + this.brain.pictureCount(), pics.length > 0);
              return;
            }
            case 'test': {
              const label = toText(await this.eval(s.label, scope));
              let ex = await this.eval(s.e, scope);
              if (!Array.isArray(ex)) ex = [ex];
              if (!ex.length) throw new KidError('"test" needs at least one example.', s.line, 'Like: test "happy" with ["so fun", "yay"]');
              const wrong = [];
              let correct = 0;
              for (const x of ex) {
                const g = this.aiGuess(x, s.line);
                if (same(g.label, label)) correct++; else wrong.push({ input: x instanceof Picture ? 'a picture' : toText(x), guessed: g.label });
              }
              this.lastAccuracy = Math.round(correct / ex.length * 100);
              if (this.host.aiTest) this.host.aiTest({ label, total: ex.length, correct, percent: this.lastAccuracy, wrong });
              return;
            }
            case 'learn': {
              const name = toText(await this.eval(s.name, scope));
              const pairs = await this.eval(s.e, scope);
              const ok = Array.isArray(pairs) && pairs.length && pairs.every(p => Array.isArray(p) && p.length === 2 && typeof p[0] === 'number' && typeof p[1] === 'number');
              if (!ok) throw new KidError('"learn" needs a list of number pairs.', s.line, 'Like: learn "plant" from [[1, 2], [2, 4], [3, 6]]   (each pair is [input, answer])');
              this.brain.learn(name, pairs);
              if (this.host.taught) this.host.taught(name, pairs.length, this.brain.numbers.get(name).length, false, true);
              return;
            }
            case 'askpic': {
              const q = toText(await this.eval(s.e, scope));
              if (!this.host.askPicture) throw new KidError('"ask picture" only works in the playground.', s.line, 'Open your program in the KidAI playground to draw or pick pictures.');
              const r = await this.host.askPicture(q);
              if (this.halted) throw new Halted();
              const pic = r ? new Picture(normalizePicture(r.data, r.size), r.thumb) : new Picture(new Array(256).fill(0));
              this.assign(s.name.key, pic, scope);
              this.steps = 0;
              return;
            }
            case 'save': {
              const v = await this.eval(s.e, scope), key = toText(await this.eval(s.key, scope));
              await this.storage().set('data:' + key, JSON.stringify(this.constructor.toStored(v)));
              return;
            }
            case 'loadinto': {
              const key = toText(await this.eval(s.key, scope));
              const raw = await this.storage().get('data:' + key);
              this.assign(s.name.key, raw === null || raw === undefined ? null : this.constructor.fromStored(JSON.parse(raw)), scope);
              return;
            }
            case 'saveai': {
              const key = toText(await this.eval(s.key, scope));
              await this.storage().set('ai:' + key, JSON.stringify(this.brain.toJSON()));
              if (this.host.say) this.host.say('(Saved the AI as "' + key + '")');
              return;
            }
            case 'loadai': {
              const key = toText(await this.eval(s.key, scope));
              const raw = await this.storage().get('ai:' + key);
              if (raw === null || raw === undefined) throw new KidError('There is no saved AI called "' + key + '".', s.line, 'Save one first with: save ai as "' + key + '"');
              this.brain = TinyBrain.fromJSON(JSON.parse(raw));
              if (this.host.say) this.host.say('(Loaded the AI "' + key + '")');
              return;
            }
            case 'forgetai': this.brain = new TinyBrain(); this.lastSure = null; this.lastAccuracy = null; return;
            case 'setfield': {
              let target = this.lookup(s.name.key, scope, s.name.raw, s.line);
              for (let i = 0; i < s.path.length - 1; i++) {
                if (!isRecord(target)) throw new KidError('"' + s.name.raw + '" is not a record.', s.line, 'Records look like {name: "Tom", age: 3}');
                if (!isRecord(target.get(s.path[i].key))) target.set(s.path[i].key, new Map());
                target = target.get(s.path[i].key);
              }
              if (!isRecord(target)) throw new KidError('"' + s.name.raw + '" is not a record, so it has no fields.', s.line, 'Make it a record first: set ' + s.name.raw + ' to {}');
              target.set(s.path[s.path.length - 1].key, await this.eval(s.e, scope));
              return;
            }
            case 'use': case 'comment': case 'blank': return;
            case 'callstmt':
              await this.eval(s.e, scope);
              return;
          }
          throw new KidError('I don\'t know how to do "' + s.type + '".', s.line, '');
        }
      }

      module.exports = { StatementMethods };
    },
    './expressions': function (module, exports, require) {
      // KidAI Easy: expressions.js
      // How every expression gets its value (maths, comparisons, guess, item 1 of, recipe calls). Added to Interpreter.
      'use strict';

      const { EndProgram, GiveBack, Halted, KidError, StopLoop } = require('./errors');
      const { STATEMENT_WORDS } = require('./words');
      const { Picture, closest, describe, fmtNumber, isRecord, looksNumeric, same, toText } = require('./values');
      const { normalizePicture } = require('./brain');
      const { BUILTINS, DEPTH_LIMIT, NEED_ASYNC, isSyncExpr, num } = require('./runtime-helpers');

      class ExpressionMethods {
        evalSync(e, scope) {
          const E = (x) => this.evalSync(x, scope);
          switch (e.k) {
            case 'val': return e.v;
            case 'list': return e.items.map(E);
            case 'name': {
              if (scope && scope.has(e.key)) return scope.get(e.key);
              if (this.globals.has(e.key)) return this.globals.get(e.key);
              if (this.recipes.has(e.key)) throw NEED_ASYNC;
              return this.lookup(e.key, scope, e.raw, e.line);
            }
            case 'and': return this.checkBool(E(e.a), e.a, 'and') ? this.checkBool(E(e.b), e.b, 'and') : false;
            case 'or': return this.checkBool(E(e.a), e.a, 'or') ? true : this.checkBool(E(e.b), e.b, 'or');
            case 'not': return !this.checkBool(E(e.a), e.a, 'not');
            case 'neg': return -num(E(e.a), 'minus');
            case 'bin': return this.binary(e, E(e.a), E(e.b));
            case 'contains': {
              const a = E(e.a), b = E(e.b);
              if (Array.isArray(a)) return a.some(x => same(x, b));
              if (isRecord(a)) return a.has(toText(b).toLowerCase());
              if (typeof a === 'string') return a.toLowerCase().includes(toText(b).toLowerCase());
              throw new KidError('"contains" works with lists and text, but got ' + describe(a) + '.', e.line, '');
            }
            case 'random': {
              let lo = num(E(e.lo), 'random'), hi = num(E(e.hi), 'random');
              if (lo > hi) { const t = lo; lo = hi; hi = t; }
              if (Number.isInteger(lo) && Number.isInteger(hi)) return lo + Math.floor(Math.random() * (hi - lo + 1));
              return lo + Math.random() * (hi - lo);
            }
            case 'randitem': {
              const l = E(e.list);
              if (!Array.isArray(l) || !l.length) throw new KidError('"random item from" needs a list with something in it.', e.line, '');
              return l[Math.floor(Math.random() * l.length)];
            }
            case 'item': {
              const idx = E(e.idx), l = E(e.list);
              if (typeof l === 'string') return Array.from(l)[this.index(idx, Array.from(l), e.line)];
              if (!Array.isArray(l)) throw new KidError('"item" needs a list or text, but got ' + describe(l) + '.', e.line, '');
              return l[this.index(idx, l, e.line)];
            }
            case 'length': {
              const v = E(e.a);
              if (Array.isArray(v)) return v.length;
              if (isRecord(v)) return v.size;
              if (typeof v === 'string') return Array.from(v).length;
              if (typeof v === 'number') return Array.from(fmtNumber(v)).length;
              throw new KidError('"length of" needs a list or text, but got ' + describe(v) + '.', e.line, '');
            }
            case 'record': { const m = new Map(); for (const f of e.fields) m.set(f.key, E(f.e)); return m; }
            case 'field': {
              const v = E(e.a);
              if (!isRecord(v)) throw new KidError('Only records have fields, but this is ' + describe(v) + '.', e.line, 'Records look like {name: "Tom", age: 3}');
              if (!v.has(e.key)) {
                const near = closest(e.key, Array.from(v.keys()));
                throw new KidError('This record has no field called "' + e.raw + '".', e.line,
                  near ? 'Did you mean "' + near + '"?' : 'Its fields are: ' + (Array.from(v.keys()).join(', ') || 'none yet'));
              }
              return v.get(e.key);
            }
            case 'touches': {
              const a = this.getSprite(E(e.a), e.line), b = this.getSprite(E(e.b), e.line);
              if (!a.visible || !b.visible || a === b) return false;
              return Math.hypot(a.x - b.x, a.y - b.y) < (a.size + b.size) / 2 * 0.8;
            }
            case 'touchedge': {
              const a = this.getSprite(E(e.a), e.line), r = a.size / 2;
              return Math.abs(a.x) + r >= 200 || Math.abs(a.y) + r >= 200;
            }
            case 'keydown': {
              let k = toText(E(e.key)).toLowerCase();
              if (k === ' ') k = 'space';
              return !!(this.host.isKeyDown && this.host.isKeyDown(k));
            }
            case 'turtlepos': return Math.round((e.axis === 'x' ? this.turtle.x : this.turtle.y) * 1000) / 1000;
            case 'spritepos': { const sp = this.getSprite(E(e.name), e.line); return e.axis === 'x' ? sp.x : sp.y; }
            case 'howsure':
              if (this.lastSure === null) throw new KidError('The AI hasn\'t guessed anything yet.', e.line, 'Use guess "some words" first.');
              return this.lastSure;
            case 'howaccurate':
              if (this.lastAccuracy === null) throw new KidError('You haven\'t tested the AI yet.', e.line, 'Use test "label" with [...] first.');
              return this.lastAccuracy;
            case 'keys': {
              const v = E(e.a);
              if (!isRecord(v)) throw new KidError('"keys of" needs a record, but got ' + describe(v) + '.', e.line, '');
              return Array.from(v.keys());
            }
            case 'split': {
              const a = toText(E(e.a)), b = toText(E(e.b));
              return (b === '' ? Array.from(a) : a.split(b)).map(x => (looksNumeric(x) ? parseFloat(x) : x));
            }
            case 'join': {
              const a = E(e.a), b = toText(E(e.b));
              if (!Array.isArray(a)) throw new KidError('"join" needs a list, but got ' + describe(a) + '.', e.line, 'Like: join ["a", "b"] with ", "');
              return a.map(toText).join(b);
            }
            case 'replace': {
              const a = toText(E(e.a)), b = toText(E(e.b)), c = toText(E(e.c));
              return a ? c.split(a).join(b) : c;
            }
            case 'starts': case 'ends': {
              const a = toText(E(e.a)).toLowerCase(), b = toText(E(e.b)).toLowerCase();
              return e.k === 'starts' ? a.startsWith(b) : a.endsWith(b);
            }
            case 'stagepic': return new Picture(normalizePicture(this.raster, 32));
          }
          throw NEED_ASYNC;
        }

        async eval(e, scope) {
          if (e._s === undefined) e._s = isSyncExpr(e);
          if (e._s) {
            try { return this.evalSync(e, scope); } catch (x) { if (x !== NEED_ASYNC) throw x; }
          }
          switch (e.k) {
            case 'val': return e.v;
            case 'list': {
              const out = [];
              for (const x of e.items) out.push(await this.eval(x, scope));
              return out;
            }
            case 'name': {
              if (!this.has(e.key, scope) && this.recipes.has(e.key)) {
                return this.call({ k: 'call', key: e.key, raw: e.raw, args: [], line: e.line }, scope);
              }
              return this.lookup(e.key, scope, e.raw, e.line);
            }
            case 'call': return this.call(e, scope);
            case 'and': {
              const a = await this.condition(e.a, scope, 'and');
              return a ? this.condition(e.b, scope, 'and') : false;
            }
            case 'or': {
              const a = await this.condition(e.a, scope, 'or');
              return a ? true : this.condition(e.b, scope, 'or');
            }
            case 'not': return !(await this.condition(e.a, scope, 'not'));
            case 'neg': return -num(await this.eval(e.a, scope), 'minus');
            case 'contains': {
              const a = await this.eval(e.a, scope), b = await this.eval(e.b, scope);
              if (Array.isArray(a)) return a.some(x => same(x, b));
              if (isRecord(a)) return a.has(toText(b).toLowerCase());
              if (typeof a === 'string') return a.toLowerCase().includes(toText(b).toLowerCase());
              throw new KidError('"contains" works with lists and text, but got ' + describe(a) + '.', e.line, '');
            }
            case 'bin': return this.binary(e, await this.eval(e.a, scope), await this.eval(e.b, scope));
            case 'random': {
              let lo = num(await this.eval(e.lo, scope), 'random'), hi = num(await this.eval(e.hi, scope), 'random');
              if (lo > hi) { const t = lo; lo = hi; hi = t; }
              if (Number.isInteger(lo) && Number.isInteger(hi)) return lo + Math.floor(Math.random() * (hi - lo + 1));
              return lo + Math.random() * (hi - lo);
            }
            case 'randitem': {
              const l = await this.eval(e.list, scope);
              if (!Array.isArray(l) || !l.length) throw new KidError('"random item from" needs a list with something in it.', e.line, '');
              return l[Math.floor(Math.random() * l.length)];
            }
            case 'item': {
              const idx = await this.eval(e.idx, scope);
              let l = await this.eval(e.list, scope);
              if (typeof l === 'string') return Array.from(l)[this.index(idx, Array.from(l), e.line)];
              if (!Array.isArray(l)) throw new KidError('"item" needs a list or text, but got ' + describe(l) + '.', e.line, '');
              return l[this.index(idx, l, e.line)];
            }
            case 'length': {
              const v = await this.eval(e.a, scope);
              if (Array.isArray(v)) return v.length;
              if (isRecord(v)) return v.size;
              if (typeof v === 'string') return Array.from(v).length;
              if (typeof v === 'number') return Array.from(fmtNumber(v)).length;
              throw new KidError('"length of" needs a list or text, but got ' + describe(v) + '.', e.line, '');
            }
            case 'touches': {
              const a = this.getSprite(await this.eval(e.a, scope), e.line), b = this.getSprite(await this.eval(e.b, scope), e.line);
              if (!a.visible || !b.visible || a === b) return false;
              return Math.hypot(a.x - b.x, a.y - b.y) < (a.size + b.size) / 2 * 0.8;
            }
            case 'touchedge': {
              const a = this.getSprite(await this.eval(e.a, scope), e.line), r = a.size / 2;
              return Math.abs(a.x) + r >= 200 || Math.abs(a.y) + r >= 200;
            }
            case 'keydown': {
              let k = toText(await this.eval(e.key, scope)).toLowerCase();
              if (k === ' ') k = 'space';
              return !!(this.host.isKeyDown && this.host.isKeyDown(k));
            }
            case 'turtlepos':
              return Math.round((e.axis === 'x' ? this.turtle.x : this.turtle.y) * 1000) / 1000;
            case 'spritepos': {
              const sp = this.getSprite(await this.eval(e.name, scope), e.line);
              return e.axis === 'x' ? sp.x : sp.y;
            }
            case 'howsure':
              if (this.lastSure === null) throw new KidError('The AI hasn\'t guessed anything yet.', e.line, 'Use guess "some words" first.');
              return this.lastSure;
            case 'guess': {
              const x = await this.eval(e.a, scope);
              const g = this.aiGuess(x, e.line);
              this.lastSure = g.sure;
              if (this.host.ai) this.host.ai(Object.assign({ input: x instanceof Picture ? 'your picture' : toText(x), thumb: x instanceof Picture ? x.thumb : null, pixels: x instanceof Picture ? x.pixels : null }, g));
              return g.label;
            }
            case 'howaccurate':
              if (this.lastAccuracy === null) throw new KidError('You haven\'t tested the AI yet.', e.line, 'Use test "label" with [...] first.');
              return this.lastAccuracy;
            case 'predict': {
              const name = toText(await this.eval(e.name, scope));
              const x = num(await this.eval(e.x, scope), 'predict');
              const r = this.brain.predict(name, x);
              if (!r) throw new KidError('The AI hasn\'t learned anything called "' + name + '" yet.', e.line, 'Teach it first: learn "' + name + '" from [[1, 2], [2, 4]]');
              if (r.points.length < 2 || r.flat) throw new KidError('The AI needs at least two examples with different inputs to find a pattern.', e.line, 'Add more pairs, like [1, 2] and [2, 4].');
              this.lastSure = Math.round(r.r2 * 100);
              const out = Math.round(r.output * 100) / 100;
              if (this.host.aiPredict) this.host.aiPredict(Object.assign({ name, sure: this.lastSure }, r, { output: out }));
              return out;
            }
            case 'record': {
              const m = new Map();
              for (const f of e.fields) m.set(f.key, await this.eval(f.e, scope));
              return m;
            }
            case 'field': {
              const v = await this.eval(e.a, scope);
              if (!isRecord(v)) throw new KidError('Only records have fields, but this is ' + describe(v) + '.', e.line, 'Records look like {name: "Tom", age: 3}');
              if (!v.has(e.key)) {
                const near = closest(e.key, Array.from(v.keys()));
                throw new KidError('This record has no field called "' + e.raw + '".', e.line,
                  near ? 'Did you mean "' + near + '"?' : 'Its fields are: ' + (Array.from(v.keys()).join(', ') || 'none yet'));
              }
              return v.get(e.key);
            }
            case 'keys': {
              const v = await this.eval(e.a, scope);
              if (!isRecord(v)) throw new KidError('"keys of" needs a record, but got ' + describe(v) + '.', e.line, '');
              return Array.from(v.keys());
            }
            case 'split': {
              const a = toText(await this.eval(e.a, scope)), b = toText(await this.eval(e.b, scope));
              return (b === '' ? Array.from(a) : a.split(b)).map(x => (looksNumeric(x) ? parseFloat(x) : x));
            }
            case 'join': {
              const a = await this.eval(e.a, scope), b = toText(await this.eval(e.b, scope));
              if (!Array.isArray(a)) throw new KidError('"join" needs a list, but got ' + describe(a) + '.', e.line, 'Like: join ["a", "b"] with ", "');
              return a.map(toText).join(b);
            }
            case 'replace': {
              const a = toText(await this.eval(e.a, scope)), b = toText(await this.eval(e.b, scope)), c = toText(await this.eval(e.c, scope));
              if (!a) return c;
              return c.split(a).join(b);
            }
            case 'starts': case 'ends': {
              const a = toText(await this.eval(e.a, scope)).toLowerCase(), b = toText(await this.eval(e.b, scope)).toLowerCase();
              return e.k === 'starts' ? a.startsWith(b) : a.endsWith(b);
            }
            case 'stagepic': return new Picture(normalizePicture(this.raster, 32));
            case 'load': {
              const key = toText(await this.eval(e.a, scope));
              const raw = await this.storage().get('data:' + key);
              return raw === null || raw === undefined ? null : this.constructor.fromStored(JSON.parse(raw));
            }
            case 'chat': {
              const q = toText(await this.eval(e.a, scope));
              if (!this.host.chat) {
                throw new KidError('chat needs a connection to a cloud AI, and there isn\'t one here.', e.line,
                  'Ask a grown-up to set up the KidAI chat gateway, or try chat in the online playground.');
              }
              const reply = await this.host.chat(q);
              if (this.halted) throw new Halted();
              this.steps = 0;
              return toText(reply);
            }
          }
          throw new KidError('Something went wrong reading this line.', e.line, '');
        }

        binary(e, a, b) {
          const op = e.op;
          if (op === '=') return same(a, b);
          if (op === '!=') return !same(a, b);
          if (op === '+') {
            if (typeof a === 'number' && typeof b === 'number') return a + b;
            if (Array.isArray(a) && Array.isArray(b)) return a.concat(b);
            if (typeof a === 'string' || typeof b === 'string') return toText(a) + toText(b);
            throw new KidError('I can\'t add ' + describe(a) + ' and ' + describe(b) + '.', e.line, '');
          }
          if (op === '*' && typeof a === 'string' && typeof b === 'number' && Number.isInteger(b) && b >= 0 && b <= 1000) {
            return a.repeat(b);
          }
          if (['>', '<', '>=', '<='].includes(op)) {
            let x = a, y = b;
            if (typeof x === 'string' && typeof y === 'string' && !(looksNumeric(x) && looksNumeric(y))) {
              x = x.toLowerCase(); y = y.toLowerCase();
            } else {
              const sym = { '>': 'bigger than', '<': 'smaller than', '>=': 'at least', '<=': 'at most' }[op];
              if (!(typeof x === 'number' || looksNumeric(x)) || !(typeof y === 'number' || looksNumeric(y))) {
                throw new KidError('I can\'t tell if ' + describe(a) + ' is ' + sym + ' ' + describe(b) + '.', e.line,
                  'Compare numbers with numbers, or text with text.');
              }
              x = num(x); y = num(y);
            }
            if (op === '>') return x > y;
            if (op === '<') return x < y;
            if (op === '>=') return x >= y;
            return x <= y;
          }
          const name = { '-': 'take away', '*': 'multiply', '/': 'divide', mod: 'mod' }[op];
          if (!(typeof a === 'number' || looksNumeric(a)) || !(typeof b === 'number' || looksNumeric(b))) {
            throw new KidError('I can only ' + name + ' numbers, but got ' + describe(typeof a === 'number' ? b : a) + '.', e.line,
              'Make sure both sides are numbers.');
          }
          const x = num(a), y = num(b);
          if (op === '-') return x - y;
          if (op === '*') return x * y;
          if (y === 0) throw new KidError('You can\'t divide by zero. Not even a computer can!', e.line, 'Use a number other than 0.');
          if (op === '/') return x / y;
          return ((x % y) + y) % y;
        }

        async call(e, scope) {
          const argv = [];
          for (const a of e.args) argv.push(await this.eval(a, scope));
          const r = this.recipes.get(e.key);
          if (!r) {
            if (BUILTINS[e.key]) {
              try { return BUILTINS[e.key](argv); } catch (err) { if (err instanceof KidError && !err.kidLine) err.kidLine = e.line; throw err; }
            }
            const near = closest(e.key, [...this.recipes.keys(), ...Object.keys(BUILTINS), ...STATEMENT_WORDS]);
            if (e.bare) {
              throw new KidError('I don\'t know how to "' + e.raw + '".', e.line,
                near ? 'Did you mean "' + near + '"?' : 'Start the line with an instruction like say, set or repeat.');
            }
            throw new KidError('I don\'t know a recipe called "' + e.raw + '".', e.line,
              near ? 'Did you mean "' + near + '"?' : 'Make it first with: define ' + e.raw + '(): ... end');
          }
          if (argv.length !== r.params.length) {
            const names = r.params.map(p => p.raw).join(', ');
            throw new KidError('"' + r.name.raw + '" needs ' + r.params.length + ' input' + (r.params.length === 1 ? '' : 's') +
              (names ? ' (' + names + ')' : '') + ', but got ' + argv.length + '.', e.line,
              'Like: ' + r.name.raw + '(' + r.params.map(p => p.raw).join(', ') + ')');
          }
          if (++this.depth > DEPTH_LIMIT) {
            this.depth = 0;
            throw new KidError('Your recipes called each other too many times.', e.line,
              'Check that a recipe that calls itself has a way to stop.');
          }
          const local = new Map();
          r.params.forEach((p, i) => local.set(p.key, argv[i]));
          this.frames.push({ name: r.name.raw, vars: local });
          try {
            await this.block(r.body, local);
            return null;
          } catch (err) {
            if (err instanceof GiveBack) return err.value;
            if (err instanceof StopLoop) throw new EndProgram();
            throw err;
          } finally {
            this.depth--;
            this.frames.pop();
          }
        }
      }

      module.exports = { ExpressionMethods };
    },
    './interpreter': function (module, exports, require) {
      // KidAI Easy: interpreter.js
      // Step 3: runs the program tree. This file has the main loop, variables, events and safety checks.
      // The statement and expression methods live in statements.js and expressions.js and are added to the class at the bottom.
      'use strict';

      const { EndProgram, GiveBack, Halted, KidError, SkipLoop, StopLoop } = require('./errors');
      const { Picture, closest, describe, isRecord, toText } = require('./values');
      const { parse } = require('./parser');
      const { TinyBrain } = require('./brain');
      const { BUILTINS, LOOPS, NEED_ASYNC, STEP_LIMIT, isFastStmt, isSyncExpr, loopSignal, num } = require('./runtime-helpers');

      class Interpreter {
        constructor(host) {
          this.host = host || {};
          this.globals = new Map();
          this.recipes = new Map();
          this.events = [];
          this.brain = new TinyBrain();
          this.lastSure = null;
          this.steps = 0;
          this.sinceYield = 0;
          this.halted = false;
          this.depth = 0;
          this.turtle = { x: 0, y: 0, heading: 0, down: true, color: 'black', size: 3, visible: true };
          this.queue = Promise.resolve();
          this.sprites = new Map();
          this.keyEvents = [];
          this.timers = [];
          this.frames = [];
          this.lastAccuracy = null;
          this.raster = new Array(32 * 32).fill(0);
          this.wrapHost();
        }

        // Keep a small 32 x 32 copy of the drawing so "stage picture" works everywhere (even in the terminal).
        wrapHost() {
          const h = this.host, R = this.raster;
          const cell = (x, y) => [Math.floor((x + 200) / 12.5), Math.floor((200 - y) / 12.5)];
          const stamp = (x, y, r) => {
            const [cx, cy] = cell(x, y), rc = Math.max(0.5, r / 12.5);
            for (let yy = Math.floor(cy - rc); yy <= Math.ceil(cy + rc); yy++) for (let xx = Math.floor(cx - rc); xx <= Math.ceil(cx + rc); xx++) {
              if (xx >= 0 && yy >= 0 && xx < 32 && yy < 32 && (xx - cx) * (xx - cx) + (yy - cy) * (yy - cy) <= rc * rc + 0.5) R[yy * 32 + xx] = 1;
            }
          };
          const line = (x1, y1, x2, y2, size) => {
            const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 4));
            for (let i = 0; i <= n; i++) stamp(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, Math.max(4, size / 2));
          };
          this.host = Object.assign(Object.create(h), {
            line: (x1, y1, x2, y2, color, size) => { line(x1, y1, x2, y2, size); if (h.line) h.line(x1, y1, x2, y2, color, size); },
            circle: (x, y, r, color, size, down) => {
              if (down) { for (let a = 0; a < 64; a++) stamp(x + r * Math.cos(a * Math.PI / 32), y + r * Math.sin(a * Math.PI / 32), Math.max(4, size / 2)); }
              else stamp(x, y, r);
              if (h.circle) h.circle(x, y, r, color, size, down);
            },
            rect: (x, y, w, hh, color) => {
              for (let yy = y - hh / 2; yy <= y + hh / 2; yy += 6) line(x - w / 2, yy, x + w / 2, yy, 6);
              if (h.rect) h.rect(x, y, w, hh, color);
            },
            clear: () => { R.fill(0); if (h.clear) h.clear(); }
          });
        }

        async readUses(program, seen) {
          for (const s of program.body) {
            if (s.type !== 'use') continue;
            const name = toText(await this.eval(s.e, null)).replace(/\.kid$/i, '');
            if (seen.has(name.toLowerCase())) continue;
            seen.add(name.toLowerCase());
            const src = this.host.readFile ? await this.host.readFile(name) : null;
            if (src === null || src === undefined) {
              throw new KidError('I can\'t find the file "' + name + '".', s.line,
                'In the playground, make a project called ' + name + '. On a computer, put ' + name + '.kid next to this program.');
            }
            let other;
            try { other = parse(src); } catch (err) {
              if (err instanceof KidError) throw new KidError('There is a problem in "' + name + '" on line ' + err.kidLine + ': ' + err.message, s.line, err.hint);
              throw err;
            }
            await this.readUses(other, seen);
            for (const d of other.body) if (d.type === 'define') this.recipes.set(d.name.key, d);
          }
        }

        storage() {
          if (!this.host.storage) throw new KidError('Saving only works in the playground or the kidai command.', this.currentLine, '');
          return this.host.storage;
        }
        static toStored(v) {
          if (Array.isArray(v)) return v.map(Interpreter.toStored);
          if (isRecord(v)) return { $record: Array.from(v.entries()).map(([k, x]) => [k, Interpreter.toStored(x)]) };
          if (v instanceof Picture) return { $picture: v.pixels };
          return v;
        }
        static fromStored(v) {
          if (Array.isArray(v)) return v.map(Interpreter.fromStored);
          if (v && typeof v === 'object' && v.$record) return new Map(v.$record.map(([k, x]) => [k, Interpreter.fromStored(x)]));
          if (v && typeof v === 'object' && v.$picture) return new Picture(v.$picture);
          return v === undefined ? null : v;
        }

        // A picture of everything the program remembers right now (for the variables panel).
        snapshot() {
          const show = (v) => {
            if (typeof v === 'string') return '"' + v + '"';
            if (Array.isArray(v)) return '[' + v.map(show).join(', ') + ']';
            if (isRecord(v)) return '{' + Array.from(v.entries()).map(([k, x]) => k + ': ' + show(x)).join(', ') + '}';
            return toText(v);
          };
          const kind = (v) => (Array.isArray(v) ? 'list' : isRecord(v) ? 'record' : v instanceof Picture ? 'picture' : v === null || v === undefined ? 'nothing' : typeof v === 'string' ? 'text' : typeof v === 'number' ? 'number' : typeof v === 'boolean' ? 'yes/no' : 'thing');
          const rows = (m) => Array.from(m.entries()).map(([k, v]) => ({ name: k, value: show(v), kind: kind(v) }));
          return {
            globals: rows(this.globals),
            frames: this.frames.map(f => ({ name: f.name, vars: rows(f.vars) })),
            line: this.currentLine
          };
        }

        halt() { this.halted = true; }

        spriteList() { return Array.from(this.sprites.values()); }
        showSprites() { if (this.host.sprites) this.host.sprites(this.spriteList()); }
        getSprite(name, line) {
          const key = toText(name);
          const sp = this.sprites.get(key);
          if (!sp) {
            const near = closest(key.toLowerCase(), Array.from(this.sprites.keys()).map(k => k.toLowerCase()));
            throw new KidError('There is no sprite called "' + key + '" yet.', line,
              near ? 'Did you mean "' + near + '"?' : 'Make it first with: make sprite "' + key + '" as "⭐"');
          }
          return sp;
        }
        async sleep(secs) {
          const until = Date.now() + Math.max(0, Math.min(secs, 60)) * 1000;
          do {
            await new Promise(r => setTimeout(r, Math.max(0, Math.min(50, until - Date.now()))));
            if (this.halted) throw new Halted();
          } while (Date.now() < until);
          this.steps = 0;
        }

        pressKey(name) {
          const key = String(name).toLowerCase();
          const handlers = this.keyEvents.filter(ev => ev.key === key || ev.key === 'any');
          if (handlers.length) this.runHandlers(handlers);
          return handlers.length > 0;
        }

        startTimers() {
          for (const t of this.timers) {
            const tick = () => {
              if (this.halted) return;
              this.runHandlers([t]);
              setTimeout(tick, t.ms);
            };
            setTimeout(tick, t.ms);
          }
        }

        async run(source) {
          const program = parse(source);
          await this.readUses(program, new Set());
          for (const s of program.body) {
            if (s.type === 'define') {
              if (BUILTINS[s.name.key]) {
                throw new KidError('"' + s.name.raw + '" is already a built-in recipe.', s.line, 'Pick a different name for your recipe.');
              }
              this.recipes.set(s.name.key, s);
            }
          }
          this.drawTurtle();
          for (const s of program.body) {
            if (s.type === 'when') {
              const label = toText(await this.eval(s.label, null));
              this.events.push({ label, body: s.body });
              if (this.host.button) this.host.button(label, () => this.fire(label));
            }
          }
          for (const s of program.body) {
            if (s.type === 'whenkey') {
              let key = toText(await this.eval(s.key, null)).toLowerCase();
              if (key === ' ') key = 'space';
              this.keyEvents.push({ key, body: s.body });
            }
            if (s.type === 'every') {
              const secs = num(await this.eval(s.e, null), 'every');
              if (secs < 0.05) throw new KidError('"every" needs at least 0.05 seconds between turns.', s.line, 'Try: every 1 second:');
              this.timers.push({ ms: secs * 1000, body: s.body });
            }
          }
          if (this.keyEvents.length && this.host.listenKeys) this.host.listenKeys(this.keyEvents.map(k => k.key));
          try {
            await this.block(program.body.filter(s => !['define', 'when', 'whenkey', 'every', 'use'].includes(s.type)), null);
          } catch (e) {
            if (e instanceof Halted && this.stoppedAll) return { listening: false, stopped: true };
            if (!(e instanceof EndProgram || e instanceof StopLoop || e instanceof SkipLoop)) throw this.wrap(e);
          }
          if (!this.halted) this.startTimers();
          return { listening: this.events.length > 0 || this.keyEvents.length > 0 || this.timers.length > 0 };
        }

        fire(label) {
          return this.runHandlers(this.events.filter(ev => ev.label === label));
        }

        runHandlers(handlers) {
          this.queue = this.queue.then(async () => {
            for (const h of handlers) {
              if (this.halted) return;
              this.steps = 0;
              try {
                await this.block(h.body, null);
              } catch (e) {
                if (e instanceof EndProgram || e instanceof StopLoop) continue;
                if (e instanceof Halted) return;
                const err = this.wrap(e);
                if (this.host.error) this.host.error(err);
                this.halted = true;
                return;
              }
            }
          });
          return this.queue;
        }

        wrap(e) {
          if (e instanceof KidError) {
            if (!e.kidLine) e.kidLine = this.currentLine;
            return e;
          }
          if (e instanceof Halted || e instanceof GiveBack) return e;
          if (e instanceof RangeError) {
            return new KidError('Your recipes called each other too many times.', this.currentLine,
              'Check that a recipe that calls itself has a way to stop.');
          }
          return e;
        }

        // Runs before every step. Returns nothing normally, or a promise when the program should pause for a moment.
        tick(line) {
          this.currentLine = line;
          if (this.halted) throw new Halted();
          if (++this.steps > STEP_LIMIT) {
            const err = new KidError('This program used too many steps, so I stopped it safely.', line,
              'Look for a loop that never ends. If it should run forever, add "wait 0.1" inside it.');
            err.stepLimit = true;
            throw err;
          }
          let p = null;
          if (++this.sinceYield >= 400) {
            this.sinceYield = 0;
            p = new Promise(r => (typeof setImmediate === 'function' ? setImmediate(r) : setTimeout(r, 0)))
              .then(() => { if (this.halted) throw new Halted(); });
          }
          if (this.host.beforeStep) {
            const step = () => {
              const w = this.host.beforeStep(line, this);
              return w ? Promise.resolve(w).then(() => { if (this.halted) throw new Halted(); }) : null;
            };
            return p ? p.then(step) : step();
          }
          return p;
        }

        // Variable lookup: recipe-local scope first, then globals.
        // "direction" is a built-in read-only variable for the turtle's current heading.
        lookup(key, scope, raw, line) {
          if (scope && scope.has(key)) return scope.get(key);
          if (this.globals.has(key)) return this.globals.get(key);
          if (key === 'direction') return ((this.turtle.heading % 360) + 360) % 360;
          const known = [...this.globals.keys(), ...(scope ? scope.keys() : [])];
          const near = closest(key, known);
          throw new KidError('I don\'t know anything called "' + raw + '" yet.', line,
            near ? 'Did you mean "' + near + '"?' : 'Make it first with: set ' + raw + ' to ...');
        }
        // Variable assignment: if a local scope exists and already has the name, update it there;
        // if the name is new inside a recipe, create it locally; otherwise it belongs to globals.
        assign(key, value, scope) {
          if (scope && scope.has(key)) scope.set(key, value);
          else if (scope && !this.globals.has(key)) scope.set(key, value);
          else this.globals.set(key, value);
        }
        has(key, scope) { return (scope && scope.has(key)) || this.globals.has(key); }

        // Runs a list of statements. Stays synchronous (fast) until a statement needs to wait.
        block(stmts, scope, from) {
          for (let i = from || 0; i < stmts.length; i++) {
            const r = this.exec(stmts[i], scope);
            if (r) return r.then(() => this.block(stmts, scope, i + 1));
          }
          return null;
        }

        loopBody(body, scope) {
          let r;
          try { r = this.block(body, scope); } catch (e) { return loopSignal(e); }
          return r ? r.then(() => 'go', loopSignal) : 'go';
        }

        checkBool(v, e, word) {
          if (typeof v !== 'boolean') {
            throw new KidError('"' + word + '" needs a yes/no question, but got ' + describe(v) + '.', e.line || this.currentLine,
              'Ask a question like: score > 5   or   name is "Mira"');
          }
          return v;
        }
        cond(e, scope, word) {
          const v = this.ev(e, scope);
          return v instanceof Promise ? v.then(x => this.checkBool(x, e, word)) : this.checkBool(v, e, word);
        }
        // Evaluates fast when it can, otherwise returns a promise.
        ev(e, scope) {
          if (e._s === undefined) e._s = isSyncExpr(e);
          if (e._s) {
            try { return this.evalSync(e, scope); } catch (x) { if (x !== NEED_ASYNC) throw x; }
          }
          return this.eval(e, scope);
        }

        async condition(e, scope, word) {
          const v = await this.eval(e, scope);
          if (typeof v !== 'boolean') {
            throw new KidError('"' + word + '" needs a yes/no question, but got ' + describe(v) + '.', e.line || this.currentLine,
              'Ask a question like: score > 5   or   name is "Mira"');
          }
          return v;
        }

        exec(s, scope) {
          const w = this.tick(s.line);
          return w ? w.then(() => this.execBody(s, scope)) : this.execBody(s, scope);
        }
        // Two-speed execution: execFast runs simple statements (say, set, if with sync conditions)
        // without creating a Promise, keeping tight loops fast. If it turns out a statement needs
        // async work (e.g. ask, wait), it throws NEED_ASYNC and we fall back to execAsync.
        execBody(s, scope) {
          if (s._fast === undefined) s._fast = isFastStmt(s);
          if (s._fast) {
            try { return this.execFast(s, scope); } catch (x) {
              if (x !== NEED_ASYNC) throw x;
              s._fast = false; // permanently disable the fast path for this node
            }
          }
          if (LOOPS.has(s.type)) {
            // "too many steps" points at the innermost loop, which is where the problem usually is
            return this.execAsync(s, scope).catch((e) => { if (e && e.stepLimit && !e.atLoop) { e.kidLine = s.line; e.atLoop = true; } throw e; });
          }
          return this.execAsync(s, scope);
        }
        execFast(s, scope) {
          switch (s.type) {
            case 'say': { const v = this.evalSync(s.e, scope); if (this.host.say) this.host.say(toText(v)); return null; }
            case 'set': this.assign(s.name.key, this.evalSync(s.e, scope), scope); return null;
            case 'change': {
              const cur = this.lookup(s.name.key, scope, s.name.raw, s.line);
              const by = this.evalSync(s.e, scope);
              if (typeof cur !== 'number') {
                throw new KidError('I can only change numbers, but "' + s.name.raw + '" is ' + describe(cur) + '.', s.line,
                  'Use set ' + s.name.raw + ' to ... instead.');
              }
              this.assign(s.name.key, cur + num(by, 'change'), scope);
              return null;
            }
            case 'if': {
              for (const b of s.branches) {
                if (this.checkBool(this.evalSync(b.cond, scope), b.cond, 'if')) return this.block(b.body, scope);
              }
              return s.otherwise ? this.block(s.otherwise, scope) : null;
            }
            case 'stop': throw new StopLoop();
            case 'skip': throw new SkipLoop();
            default: return null; // comment, blank, use
          }
        }

        aiGuess(x, line) {
          if (x instanceof Picture) {
            if (this.brain.pics.size < 2) {
              throw new KidError('The AI needs pictures for at least two different labels before it can guess a picture.', line,
                'Teach it two groups of pictures, like: teach "cat" with [cat1, cat2]  and  teach "dog" with [dog1, dog2]');
            }
            return this.brain.guessPicture(x);
          }
          if (this.brain.labels.size < 2) {
            throw new KidError('The AI needs examples for at least two different labels before it can guess.', line,
              'Teach it two groups, like: teach "happy" with [...]  and  teach "sad" with [...]');
          }
          return this.brain.guess(x);
        }

        index(v, list, line) {
          if (typeof v !== 'number' || !Number.isInteger(v)) {
            throw new KidError('Item numbers must be whole numbers, but got ' + describe(v) + '.', line, 'Like: item 1 of fruits');
          }
          if (v < 1 || v > list.length) {
            throw new KidError('There is no item ' + v + '. The list only has ' + list.length + ' item' + (list.length === 1 ? '' : 's') + '.', line,
              list.length > 1 ? 'Use a number from 1 to ' + list.length + '.' : list.length ? 'Use item 1.' : 'The list is empty. Add something first.');
          }
          return v - 1;
        }

        async slow() {
          const ms = this.host.moveDelay ? this.host.moveDelay() : 0;
          if (ms > 0) {
            await new Promise(r => setTimeout(r, ms));
            this.sinceYield = 0;
            if (this.halted) throw new Halted();
          }
        }

        drawTurtle() {
          if (this.host.turtle) this.host.turtle(this.turtle);
        }
      }

      // Add the statement and expression methods to the Interpreter class.
      for (const methods of [require('./statements').StatementMethods, require('./expressions').ExpressionMethods]) {
        for (const name of Object.getOwnPropertyNames(methods.prototype)) {
          if (name !== 'constructor') Object.defineProperty(Interpreter.prototype, name, Object.getOwnPropertyDescriptor(methods.prototype, name));
        }
      }

      module.exports = { Interpreter };
    },
    './printer': function (module, exports, require) {
      // KidAI Easy: printer.js
      // The formatter: turns a program tree back into tidy KidAI text ("kidai fmt", blocks mode).
      'use strict';

      const { fmtNumber } = require('./values');
      const { parse } = require('./parser');

      // Turns a program tree back into tidy KidAI text. Used by "kidai fmt" and by blocks mode.
      // PREC numbers mirror the parser's precedence levels: higher = tighter binding.
      // printExpr(e, min) wraps e in parentheses if its precedence drops below min.
      const PREC = { or: 1, and: 2, not: 3, cmp: 4, contains: 5, add: 6, mul: 7, neg: 8, atom: 9 };
      // These read as far right as they can (their last part is a whole sum), so they need brackets before + - * / mod.
      const GREEDY = new Set(['random', 'guess', 'split', 'join', 'chat', 'predict']);
      function quote(s) {
        return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t') + '"';
      }
      function printExpr(e, min, tail) {
        if (min === undefined) min = 0;
        if (tail === undefined) tail = true;
        const [text, prec] = exprText(e, tail);
        const wrapGreedy = GREEDY.has(e.k) && !tail;
        return prec < min || wrapGreedy ? '(' + exprText(e, true)[0] + ')' : text;
      }
      function exprText(e, tail) {
        const P = PREC;
        switch (e.k) {
          case 'val':
            if (e.v === null) return ['nothing', P.atom];
            if (typeof e.v === 'boolean') return [e.v ? 'yes' : 'no', P.atom];
            if (typeof e.v === 'number') return e.v < 0 ? ['(' + fmtNumber(e.v) + ')', P.atom] : [fmtNumber(e.v), P.atom];
            return [quote(e.v), P.atom];
          case 'list': return ['[' + e.items.map(x => printExpr(x)).join(', ') + ']', P.atom];
          case 'record': return ['{' + e.fields.map(f => (/^[\p{L}_][\p{L}\p{N}_]*$/u.test(f.raw) ? f.raw : quote(f.raw)) + ': ' + printExpr(f.e)).join(', ') + '}', P.atom];
          case 'name': return [e.raw, P.atom];
          case 'call': return [e.raw + '(' + e.args.map(x => printExpr(x)).join(', ') + ')', P.atom];
          case 'field': return [printExpr(e.a, P.atom, false) + '.' + e.raw, P.atom];
          case 'or': return [printExpr(e.a, P.or, true) + ' or ' + printExpr(e.b, P.and, tail), P.or];
          case 'and': return [printExpr(e.a, P.and, true) + ' and ' + printExpr(e.b, P.not, tail), P.and];
          case 'not': return ['not ' + printExpr(e.a, P.not, tail), P.not];
          case 'neg': return ['-' + printExpr(e.a, P.neg, tail), P.neg];
          case 'contains': return [printExpr(e.a, P.add, true) + ' contains ' + printExpr(e.b, P.add, tail), P.contains];
          case 'starts': case 'ends':
            return [printExpr(e.a, P.contains, true) + (e.k === 'starts' ? ' starts with ' : ' ends with ') + printExpr(e.b, P.contains, tail), P.cmp];
          case 'touches': return [printExpr(e.a, P.contains, true) + ' touches ' + printExpr(e.b, P.contains, tail), P.cmp];
          case 'touchedge': return [printExpr(e.a, P.contains, true) + ' touches edge', P.cmp];
          case 'bin': {
            const op = e.op;
            if (op === '+' || op === '-') return [printExpr(e.a, P.add, false) + ' ' + op + ' ' + printExpr(e.b, P.mul, tail), P.add];
            if (op === '*' || op === '/' || op === 'mod') return [printExpr(e.a, P.mul, false) + ' ' + op + ' ' + printExpr(e.b, P.neg, tail), P.mul];
            const word = e.word ? 'is ' + e.word + ' than' : { '=': 'is', '!=': 'is not', '>': '>', '<': '<', '>=': '>=', '<=': '<=' }[op];
            return [printExpr(e.a, P.contains, true) + ' ' + word + ' ' + printExpr(e.b, P.contains, tail), P.cmp];
          }
          case 'random': return ['random ' + printExpr(e.lo, P.add, false) + ' to ' + printExpr(e.hi, P.add, tail), P.atom];
          case 'randitem': return ['random item from ' + printExpr(e.list, P.neg, tail), P.atom];
          case 'item': return ['item ' + printExpr(e.idx, P.add, false) + ' of ' + printExpr(e.list, P.neg, tail), P.atom];
          case 'length': return ['length of ' + printExpr(e.a, P.neg, tail), P.atom];
          case 'howsure': return ['how sure', P.atom];
          case 'howaccurate': return ['how accurate', P.atom];
          case 'guess': return ['guess ' + printExpr(e.a, P.add, tail), P.atom];
          case 'keydown': return ['key ' + printExpr(e.key, P.add, false) + ' is pressed', P.atom];
          case 'turtlepos': return [e.axis + ' position', P.atom];
          case 'spritepos': return [e.axis + ' of sprite ' + printExpr(e.name, P.neg, tail), P.atom];
          case 'split': return ['split ' + printExpr(e.a, P.add, false) + ' by ' + printExpr(e.b, P.add, tail), P.atom];
          case 'join': return ['join ' + printExpr(e.a, P.add, false) + ' with ' + printExpr(e.b, P.add, tail), P.atom];
          case 'replace': return ['replace ' + printExpr(e.a, P.add, false) + ' with ' + printExpr(e.b, P.add, false) + ' in ' + printExpr(e.c, P.neg, tail), P.atom];
          case 'keys': return ['keys of ' + printExpr(e.a, P.neg, tail), P.atom];
          case 'stagepic': return ['stage picture', P.atom];
          case 'load': return ['load ' + printExpr(e.a, P.neg, tail), P.atom];
          case 'chat': return ['chat ' + printExpr(e.a, P.add, tail), P.atom];
          case 'predict': return ['predict ' + printExpr(e.name, P.add, false) + ' for ' + printExpr(e.x, P.add, tail), P.atom];
        }
        throw new Error('printer: unknown expression ' + e.k);
      }
      function printStatements(body, depth) {
        const pad = '  '.repeat(depth), out = [];
        const E = (x, min) => printExpr(x, min || 0, true);
        const H = (x) => printExpr(x, PREC.add, true); // an expression followed by more words (they stop a sum)
        const blockOf = (head, b) => { out.push(pad + head + ':'); out.push(...printStatements(b, depth + 1)); out.push(pad + 'end'); };
        for (const s of body) {
          switch (s.type) {
            case 'comment': out.push(pad + '#' + (s.text ? ' ' + s.text : '')); break;
            case 'blank': out.push(''); break;
            case 'say': out.push(pad + 'say ' + E(s.e)); break;
            case 'set': out.push(pad + 'set ' + s.name.raw + ' to ' + E(s.e)); break;
            case 'setitem': out.push(pad + 'set item ' + H(s.idx) + ' of ' + s.name.raw + ' to ' + E(s.e)); break;
            case 'setfield': out.push(pad + 'set ' + s.name.raw + s.path.map(p => '.' + p.raw).join('') + ' to ' + E(s.e)); break;
            case 'change': out.push(pad + 'change ' + s.name.raw + ' by ' + E(s.e)); break;
            case 'add': out.push(pad + 'add ' + H(s.e) + ' to ' + s.name.raw); break;
            case 'remove': out.push(pad + 'remove ' + H(s.e) + ' from ' + s.name.raw); break;
            case 'ask': out.push(pad + 'ask ' + H(s.e) + (s.name.key === 'answer' ? '' : ' into ' + s.name.raw)); break;
            case 'askpic': out.push(pad + 'ask picture ' + H(s.e) + (s.name.key === 'answer' ? '' : ' into ' + s.name.raw)); break;
            case 'if': {
              s.branches.forEach((b, i) => {
                out.push(pad + (i ? 'else if ' : 'if ') + E(b.cond) + ':');
                out.push(...printStatements(b.body, depth + 1));
              });
              if (s.otherwise) { out.push(pad + 'else:'); out.push(...printStatements(s.otherwise, depth + 1)); }
              out.push(pad + 'end');
              break;
            }
            case 'repeat': blockOf('repeat ' + H(s.count) + ' times', s.body); break;
            case 'while': blockOf('repeat while ' + E(s.cond), s.body); break;
            case 'until': blockOf('repeat until ' + E(s.cond), s.body); break;
            case 'forever': blockOf('repeat forever', s.body); break;
            case 'foreach': blockOf('for each ' + s.name.raw + ' in ' + E(s.list), s.body); break;
            case 'define': blockOf('define ' + s.name.raw + (s.params.length ? '(' + s.params.map(p => p.raw).join(', ') + ')' : '()'), s.body); break;
            case 'when': blockOf('when clicked ' + E(s.label), s.body); break;
            case 'whenkey': blockOf('when key ' + H(s.key) + ' pressed', s.body); break;
            case 'every': {
              const one = s.e.k === 'val' && s.e.v === 1;
              blockOf('every ' + H(s.e) + (one ? ' second' : ' seconds'), s.body); break;
            }
            case 'giveback': out.push(pad + 'give back' + (s.e ? ' ' + E(s.e) : '')); break;
            case 'stop': out.push(pad + 'stop'); break;
            case 'stopall': out.push(pad + 'stop everything'); break;
            case 'skip': out.push(pad + 'skip'); break;
            case 'wait': out.push(pad + 'wait ' + E(s.e) + (s.unit ? ' ' + s.unit : '')); break;
            case 'move': out.push(pad + (s.dir > 0 ? 'forward ' : 'back ') + E(s.e) + (s.unit ? ' ' + s.unit : '')); break;
            case 'turn': out.push(pad + 'turn ' + (s.dir > 0 ? 'right ' : 'left ') + E(s.e) + (s.unit ? ' ' + s.unit : '')); break;
            case 'turnto': out.push(pad + 'turn to ' + E(s.e) + (s.unit ? ' ' + s.unit : '')); break;
            case 'pen': out.push(pad + 'pen ' + (s.down ? 'down' : 'up')); break;
            case 'pensize': out.push(pad + 'pen size ' + E(s.e)); break;
            case 'color': out.push(pad + 'color ' + E(s.e)); break;
            case 'circle': out.push(pad + 'circle ' + E(s.e)); break;
            case 'dot': out.push(pad + 'dot ' + E(s.e)); break;
            case 'rect': out.push(pad + 'rectangle ' + H(s.w) + ', ' + E(s.h)); break;
            case 'write': out.push(pad + 'write ' + E(s.e)); break;
            case 'background': out.push(pad + 'background ' + E(s.e)); break;
            case 'clear': out.push(pad + 'clear'); break;
            case 'home': out.push(pad + 'go home'); break;
            case 'goto': out.push(pad + 'go to ' + H(s.x) + ', ' + E(s.y)); break;
            case 'visible': out.push(pad + (s.show ? 'unhide' : 'hide')); break;
            case 'sprite': {
              let t = 'make sprite ' + H(s.name) + ' as ' + H(s.look);
              if (s.x) t += ' at ' + H(s.x) + ', ' + H(s.y);
              if (s.size) t += ' size ' + H(s.size);
              out.push(pad + t); break;
            }
            case 'movesprite': out.push(pad + 'move sprite ' + H(s.name) + (s.by ? ' by ' : ' to ') + H(s.x) + ', ' + E(s.y)); break;
            case 'spritevis': out.push(pad + (s.show ? 'show sprite ' : 'hide sprite ') + E(s.name)); break;
            case 'deletesprite': out.push(pad + 'delete sprite ' + E(s.name)); break;
            case 'note': out.push(pad + 'play note ' + H(s.e) + (s.dur ? ' for ' + H(s.dur) + (s.unit ? ' ' + s.unit : '') : '')); break;
            case 'sound': out.push(pad + 'play sound ' + E(s.e)); break;
            case 'beep': out.push(pad + 'beep'); break;
            case 'teach': out.push(pad + 'teach ' + H(s.label) + ' with ' + E(s.e)); break;
            case 'test': out.push(pad + 'test ' + H(s.label) + ' with ' + E(s.e)); break;
            case 'learn': out.push(pad + 'learn ' + H(s.name) + ' from ' + E(s.e)); break;
            case 'save': out.push(pad + 'save ' + H(s.e) + ' as ' + E(s.key)); break;
            case 'saveai': out.push(pad + 'save ai as ' + E(s.key)); break;
            case 'loadai': out.push(pad + 'load ai ' + E(s.key)); break;
            case 'loadinto': out.push(pad + 'load ' + H(s.key) + ' into ' + s.name.raw); break;
            case 'forgetai': out.push(pad + 'forget ai'); break;
            case 'use': out.push(pad + 'use ' + E(s.e)); break;
            case 'callstmt': out.push(pad + (s.e.bare ? s.e.raw : printExpr(s.e))); break;
            default: throw new Error('printer: unknown statement ' + s.type);
          }
        }
        return out;
      }
      function printProgram(ast) {
        const lines = printStatements(ast.body, 0);
        while (lines.length && lines[0] === '') lines.shift();
        while (lines.length && lines[lines.length - 1] === '') lines.pop();
        return lines.join('\n') + '\n';
      }
      function format(source) { return printProgram(parse(source, { keepComments: true })); }

      module.exports = { format, printProgram, printExpr, quote };
    },
    './core-view': function (module, exports, require) {
      // KidAI Easy: core-view.js
      // The "Grown-up code" view: shows a program in KidAI Core 1.0 style.
      'use strict';

      const { fmtNumber } = require('./values');
      const { parse } = require('./parser');
      const { quote } = require('./printer');

      // Shows a KidAI Easy program in the style of the full KidAI Core 1.0 language (from the PRD), for learning.
      function toCore(source) {
        const ast = parse(source, { keepComments: true });
        const used = new Set();
        const U = (m, t) => { used.add(m); return t; };
        let usesBrain = false;
        const CP = { or: 1, and: 2, not: 3, cmp: 4, inn: 5, add: 6, mul: 7, neg: 8, atom: 9 };
        const wrap = (pair, min) => (pair[1] < min ? '(' + pair[0] + ')' : pair[0]);
        const X = (e, min) => wrap(cx(e), min || 0);
        const args = (...xs) => xs.map(x => X(x)).join(', ');
        function cx(e) {
          switch (e.k) {
            case 'val':
              if (e.v === null) return ['nothing', CP.atom];
              if (typeof e.v === 'boolean') return [e.v ? 'true' : 'false', CP.atom];
              if (typeof e.v === 'number') return [fmtNumber(e.v), e.v < 0 ? CP.neg : CP.atom];
              return [quote(e.v), CP.atom];
            case 'list': return ['[' + e.items.map(x => X(x)).join(', ') + ']', CP.atom];
            case 'record': return ['{' + e.fields.map(f => quote(f.key) + ': ' + X(f.e)).join(', ') + '}', CP.atom];
            case 'name': return [e.raw, CP.atom];
            case 'call': return [e.raw + '(' + e.args.map(x => X(x)).join(', ') + ')', CP.atom];
            case 'field': return [X(e.a, CP.atom) + '[' + quote(e.key) + ']', CP.atom];
            case 'or': return [X(e.a, CP.or) + ' or ' + X(e.b, CP.and), CP.or];
            case 'and': return [X(e.a, CP.and) + ' and ' + X(e.b, CP.not), CP.and];
            case 'not': return ['not ' + X(e.a, CP.not), CP.not];
            case 'neg': return ['-' + X(e.a, CP.neg), CP.neg];
            case 'contains': return [X(e.b, CP.add) + ' in ' + X(e.a, CP.add), CP.inn];
            case 'bin': {
              const op = { '=': '==', '!=': '!=', '>': '>', '<': '<', '>=': '>=', '<=': '<=', '+': '+', '-': '-', '*': '*', '/': '/', mod: '%' }[e.op];
              if (op === '+') {
                const texty = (n) => (n.k === 'val' && typeof n.v === 'string') || (n.k === 'bin' && n.op === '+' && (texty(n.a) || texty(n.b)));
                const ta = texty(e.a), tb = texty(e.b);
                const A = tb && !ta ? 'to_text(' + X(e.a) + ')' : X(e.a, CP.add), B = ta && !tb ? 'to_text(' + X(e.b) + ')' : X(e.b, CP.mul);
                return [A + ' + ' + B, CP.add];
              }
              if (op === '-') return [X(e.a, CP.add) + ' - ' + X(e.b, CP.mul), CP.add];
              if (op === '*' || op === '/' || op === '%') return [X(e.a, CP.mul) + ' ' + op + ' ' + X(e.b, CP.neg), CP.mul];
              return [X(e.a, CP.inn) + ' ' + op + ' ' + X(e.b, CP.inn), CP.cmp];
            }
            case 'starts': return [U('text', 'text.starts_with(' + args(e.a, e.b) + ')'), CP.atom];
            case 'ends': return [U('text', 'text.ends_with(' + args(e.a, e.b) + ')'), CP.atom];
            case 'touches': return [U('sprites', 'sprites.touching(' + args(e.a, e.b) + ')'), CP.atom];
            case 'touchedge': return [U('sprites', 'sprites.touching_edge(' + args(e.a) + ')'), CP.atom];
            case 'random': return [U('math', 'math.random_int(' + args(e.lo, e.hi) + ')'), CP.atom];
            case 'randitem': return [U('list', 'list.pick_random(' + args(e.list) + ')'), CP.atom];
            case 'item': return [X(e.list, CP.atom) + '[' + (e.idx.k === 'val' && typeof e.idx.v === 'number' ? fmtNumber(e.idx.v - 1) : X(e.idx, CP.add) + ' - 1') + ']', CP.atom];
            case 'length': return [U('list', 'list.length(' + args(e.a) + ')'), CP.atom];
            case 'guess': usesBrain = true; return [U('ai', 'ai.guess(brain, ' + args(e.a) + ')'), CP.atom];
            case 'howsure': usesBrain = true; return [U('ai', 'ai.confidence(brain)'), CP.atom];
            case 'howaccurate': usesBrain = true; return [U('ai', 'ai.accuracy(brain)'), CP.atom];
            case 'predict': usesBrain = true; return [U('ai', 'ai.predict(brain, ' + args(e.name, e.x) + ')'), CP.atom];
            case 'keydown': return [U('keyboard', 'keyboard.is_down(' + args(e.key) + ')'), CP.atom];
            case 'turtlepos': return [U('turtle', 'turtle.' + e.axis + '()'), CP.atom];
            case 'spritepos': return [U('sprites', 'sprites.' + e.axis + '(' + args(e.name) + ')'), CP.atom];
            case 'split': return [U('text', 'text.split(' + args(e.a, e.b) + ')'), CP.atom];
            case 'join': return [U('text', 'text.join(' + args(e.a, e.b) + ')'), CP.atom];
            case 'replace': return [U('text', 'text.replace(' + args(e.c, e.a, e.b) + ')'), CP.atom];
            case 'keys': return [U('map', 'map.keys(' + args(e.a) + ')'), CP.atom];
            case 'stagepic': return [U('turtle', 'turtle.snapshot()'), CP.atom];
            case 'load': return [U('storage', 'await storage.get(' + args(e.a) + ')'), CP.atom];
            case 'chat': return [U('chat', 'await chat.reply(' + args(e.a) + ')'), CP.atom];
          }
          return ['?', CP.atom];
        }
        function hasReturnValue(body) {
          return body.some(s => (s.type === 'giveback' && s.e) || ['if', 'repeat', 'while', 'until', 'forever', 'foreach'].some(t => s.type === t &&
            (t === 'if' ? s.branches.some(b => hasReturnValue(b.body)) || (s.otherwise && hasReturnValue(s.otherwise)) : hasReturnValue(s.body))));
        }
        function stmts(body, depth, declared) {
          const pad = '    '.repeat(depth), out = [];
          const decl = (name, value) => {
            if (declared.has(name.key)) return pad + 'set ' + name.raw + ' = ' + value;
            declared.add(name.key); return pad + 'var ' + name.raw + ' = ' + value;
          };
          const block = (head, b, d2) => { out.push(pad + head + ':'); out.push(...stmts(b, depth + 1, d2 || declared)); out.push(pad + 'end'); };
          for (const s of body) {
            switch (s.type) {
              case 'comment': out.push(pad + '#' + (s.text ? ' ' + s.text : '')); break;
              case 'blank': out.push(''); break;
              case 'say': out.push(pad + 'show ' + X(s.e)); break;
              case 'set': out.push(decl(s.name, X(s.e))); break;
              case 'setitem': out.push(pad + 'set ' + s.name.raw + '[' + X(s.idx, CP.add) + ' - 1] = ' + X(s.e)); break;
              case 'setfield': out.push(pad + 'set ' + s.name.raw + s.path.map(p => '[' + quote(p.key) + ']').join('') + ' = ' + X(s.e)); break;
              case 'change': out.push(pad + 'set ' + s.name.raw + ' = ' + s.name.raw + ' + ' + X(s.e, CP.mul)); break;
              case 'add': out.push(pad + 'set ' + s.name.raw + ' = ' + U('list', 'list.append(' + s.name.raw + ', ' + X(s.e) + ')')); break;
              case 'remove': out.push(pad + 'set ' + s.name.raw + ' = ' + U('list', 'list.remove(' + s.name.raw + ', ' + X(s.e) + ')')); break;
              case 'ask': out.push(decl(s.name, 'input(' + X(s.e) + ')')); break;
              case 'askpic': out.push(decl(s.name, U('drawing', 'await drawing.ask_picture(' + X(s.e) + ')'))); break;
              case 'if': {
                const chain = (i, d) => {
                  const p = '    '.repeat(d), b = s.branches[i];
                  out.push(p + 'if ' + X(b.cond) + ':');
                  out.push(...stmts(b.body, d + 1, declared));
                  if (i + 1 < s.branches.length) { out.push(p + 'else:'); chain(i + 1, d + 1); }
                  else if (s.otherwise) { out.push(p + 'else:'); out.push(...stmts(s.otherwise, d + 1, declared)); }
                  out.push(p + 'end');
                };
                chain(0, depth); break;
              }
              case 'repeat': block('repeat ' + X(s.count) + ' times', s.body); break;
              case 'while': block('while ' + X(s.cond), s.body); break;
              case 'until': block('while not (' + X(s.cond) + ')', s.body); break;
              case 'forever': block('while true', s.body); break;
              case 'foreach': declared.add(s.name.key); block('for ' + s.name.raw + ' in ' + X(s.list), s.body); break;
              case 'define': {
                const local = new Set(s.params.map(p => p.key));
                block('function ' + s.name.raw + '(' + s.params.map(p => p.raw + ': Any').join(', ') + ') -> ' + (hasReturnValue(s.body) ? 'Any' : 'Nothing'), s.body, local);
                break;
              }
              case 'when': block('on ' + U('ui', 'ui.click(' + X(s.label) + ')'), s.body, new Set()); break;
              case 'whenkey': block('on ' + U('keyboard', 'keyboard.press(' + X(s.key) + ')'), s.body, new Set()); break;
              case 'every': block('on ' + U('time', 'time.every(seconds(' + X(s.e) + '))'), s.body, new Set()); break;
              case 'giveback': out.push(pad + 'return' + (s.e ? ' ' + X(s.e) : '')); break;
              case 'stop': out.push(pad + 'break'); break;
              case 'skip': out.push(pad + 'continue'); break;
              case 'stopall': out.push(pad + U('app', 'app.stop()')); break;
              case 'wait': out.push(pad + U('time', 'await time.wait(seconds(' + X(s.e) + '))')); break;
              case 'move': out.push(pad + U('turtle', 'turtle.' + (s.dir > 0 ? 'forward(' : 'back(') + X(s.e) + ')')); break;
              case 'turn': out.push(pad + U('turtle', 'turtle.turn_' + (s.dir > 0 ? 'right(' : 'left(') + X(s.e) + ')')); break;
              case 'turnto': out.push(pad + U('turtle', 'turtle.turn_to(' + X(s.e) + ')')); break;
              case 'pen': out.push(pad + U('turtle', 'turtle.pen_' + (s.down ? 'down()' : 'up()'))); break;
              case 'pensize': out.push(pad + U('turtle', 'turtle.pen_size(' + X(s.e) + ')')); break;
              case 'color': out.push(pad + U('turtle', 'turtle.color(' + X(s.e) + ')')); break;
              case 'circle': out.push(pad + U('turtle', 'turtle.circle(' + X(s.e) + ')')); break;
              case 'dot': out.push(pad + U('turtle', 'turtle.dot(' + X(s.e) + ')')); break;
              case 'rect': out.push(pad + U('turtle', 'turtle.rectangle(' + args(s.w, s.h) + ')')); break;
              case 'write': out.push(pad + U('turtle', 'turtle.write(' + X(s.e) + ')')); break;
              case 'background': out.push(pad + U('stage', 'stage.background(' + X(s.e) + ')')); break;
              case 'clear': out.push(pad + U('turtle', 'turtle.clear()')); break;
              case 'home': out.push(pad + U('turtle', 'turtle.home()')); break;
              case 'goto': out.push(pad + U('turtle', 'turtle.go_to(' + args(s.x, s.y) + ')')); break;
              case 'visible': out.push(pad + U('turtle', 'turtle.' + (s.show ? 'show()' : 'hide()'))); break;
              case 'sprite': {
                out.push(pad + U('sprites', 'sprites.make(' + args(s.name, s.look) + ')'));
                if (s.x) out.push(pad + 'sprites.move_to(' + args(s.name, s.x, s.y) + ')');
                if (s.size) out.push(pad + 'sprites.size(' + args(s.name, s.size) + ')');
                break;
              }
              case 'movesprite': out.push(pad + U('sprites', 'sprites.move_' + (s.by ? 'by(' : 'to(') + args(s.name, s.x, s.y) + ')')); break;
              case 'spritevis': out.push(pad + U('sprites', 'sprites.' + (s.show ? 'show(' : 'hide(') + args(s.name) + ')')); break;
              case 'deletesprite': out.push(pad + U('sprites', 'sprites.delete(' + args(s.name) + ')')); break;
              case 'note': out.push(pad + U('sound', 'await sound.note(' + X(s.e) + ', seconds(' + (s.dur ? X(s.dur) : '0.4') + '))')); break;
              case 'sound': out.push(pad + U('sound', 'sound.effect(' + X(s.e) + ')')); break;
              case 'beep': out.push(pad + U('sound', 'sound.beep()')); break;
              case 'teach': usesBrain = true; out.push(pad + U('ai', 'ai.teach(brain, ' + args(s.label, s.e) + ')')); break;
              case 'test': usesBrain = true; out.push(pad + U('ai', 'ai.test(brain, ' + args(s.label, s.e) + ')')); break;
              case 'learn': usesBrain = true; out.push(pad + U('ai', 'ai.learn_numbers(brain, ' + args(s.name, s.e) + ')')); break;
              case 'save': out.push(pad + U('storage', 'await storage.put(' + args(s.key, s.e) + ')')); break;
              case 'loadinto': out.push(decl(s.name, U('storage', 'await storage.get(' + args(s.key) + ')'))); break;
              case 'saveai': usesBrain = true; out.push(pad + U('storage', 'await storage.put_model(' + X(s.key) + ', brain)')); break;
              case 'loadai': usesBrain = true; out.push(pad + U('storage', 'set brain = await storage.get_model(' + X(s.key) + ')')); break;
              case 'forgetai': usesBrain = true; out.push(pad + U('ai', 'set brain = ai.new_brain()')); break;
              case 'use': out.push(pad + 'use ' + (s.e.k === 'val' ? String(s.e.v).replace(/[^\p{L}\p{N}_]+/gu, '_') : X(s.e))); break;
              case 'callstmt': out.push(pad + (s.e.bare ? s.e.raw + '()' : X(s.e))); break;
              default: out.push(pad + '# (no grown-up version of "' + s.type + '" yet)');
            }
          }
          return out;
        }
        const body = stmts(ast.body, 0, new Set());
        const MODS = { ui: 'app.ui', keyboard: 'app.keyboard', time: 'app.time', app: 'app', turtle: 'draw.turtle', stage: 'draw.stage', sprites: 'draw.sprites',
          sound: 'media.sound', storage: 'storage', ai: 'ai.kidbrain as ai', text: 'text', list: 'list', map: 'map', math: 'math', chat: 'ai.chat', drawing: 'media.drawing' };
        const head = ['# Your program in grown-up KidAI Core 1.0 style.', '# It shows the same ideas the way a bigger language writes them.', '# Some library names here are examples, so this version is for reading, not running.', ''];
        const uses = Array.from(used).sort().map(m => 'use ' + MODS[m]);
        if (uses.length) head.push(...uses, '');
        if (usesBrain) head.push('var brain = ai.new_brain()', '');
        return head.concat(body).join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
      }

      module.exports = { toCore };
    },
    './checker': function (module, exports, require) {
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
    },
    './index': function (module, exports, require) {
      // KidAI Easy: index.js
      // The public API. "node build.js" joins every file in src/ into ../kidai.js, which is what the
      // playground, the kidai command and npm use. In Node you can also load the src folder directly.
      'use strict';

      const { setLanguage, translateText, HI_MSG, HI_HINT } = require('./messages');
      const { KidError, Halted } = require('./errors');
      const { toText, Picture } = require('./values');
      const { normalizePicture } = require('./brain');
      const { parse } = require('./parser');
      const { Interpreter } = require('./interpreter');
      const { format, printProgram, printExpr } = require('./printer');
      const { toCore } = require('./core-view');
      const { check } = require('./checker');

      module.exports = {
        check,             // static analysis: returns [{line, level, message, hint}] without running
        setLanguage,       // setLanguage('hi') switches error messages to Hindi
        translateMessage: (t) => translateText(t, HI_MSG),
        translateHint: (t) => translateText(t, HI_HINT),
        parse,             // parse(source) → AST used by Interpreter, format, toCore, check
        format,            // format(source) → tidy re-printed source (used by "kidai fmt")
        toCore,            // toCore(source) → grown-up KidAI Core 1.0 style code (for learning)
        printProgram,      // printProgram(ast) → source string (used internally by format)
        printExpr,         // printExpr(expr) → expression string (used by blocks mode UI)
        Interpreter,       // main class: new Interpreter(host).run(source) executes a program
        KidError,          // friendly error class shown to children
        Halted,            // signal thrown when the interpreter is stopped from outside
        toText,            // converts any KidAI value to its string representation
        Picture,           // class for 16×16 pixel picture values
        normalizePicture,  // normalizes a raw pixel grid to the standard 16×16 format
        version: '1.2.0',
      };
    }
  };
  const loaded = {};
  function load(name) {
    if (!loaded[name]) {
      const module = { exports: {} };
      loaded[name] = module;
      sources[name](module, module.exports, load);
    }
    return loaded[name].exports;
  }
  const KidAI = load('./index');
  if (typeof module !== 'undefined' && module.exports) module.exports = KidAI;
  else root.KidAI = KidAI;
})(typeof window !== 'undefined' ? window : globalThis);
