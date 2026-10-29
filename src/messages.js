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
