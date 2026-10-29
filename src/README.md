# How the KidAI Easy source is organised

All of the language lives in this folder. Each file does one job.

- At the top, each file says what it does and which other files it uses (`require`).
- At the bottom, `module.exports` lists what it gives to other files.

`node build.js` joins all of them into one file, `../kidai.js`. The playground, the `kidai` command and npm all use that file. **Edit the files here, not `kidai.js`**, then run `node build.js`.

## How a program runs

```
"say 1 + 2"
   │
   ▼  tokenizer.js          cuts each line into tokens: [say] [1] [+] [2]
   ▼  parser.js             builds a tree of statements, using
   │  parse-expressions.js  for the parts like 1 + 2
   ▼  interpreter.js        walks the tree, using
      statements.js         for what each statement does ("say" shows text)
      expressions.js        for working out values (1 + 2 → 3)
```

## Reading order

Start at the top of this list. Each file only uses the files above it, except `interpreter.js`, which adds the methods from `statements.js` and `expressions.js`.

| File | Lines | What it does |
| --- | ---: | --- |
| `messages.js` | 120 | Hindi versions of error messages and tips (`setLanguage`). Keywords stay English. |
| `errors.js` | 21 | `KidError`, the friendly error kids see, plus the signals used for `stop`, `skip` and `give back`. |
| `words.js` | 30 | Reserved words and soft keywords (like `item`, which can still be a variable name). |
| `values.js` | 84 | Helpers for values: turning them into text, comparing, "did you mean …?" spelling help, `Picture`. |
| `tokenizer.js` | 68 | **Step 1.** One line of text → tokens. Handles smart quotes, `≥`, comments. |
| `parse-expressions.js` | 276 | **Step 2a.** Reads expressions: `or` → `and` → `not` → comparisons → `contains` → `+ -` → `* /` → atoms (numbers, text, lists, records, `item 1 of`, `guess`, recipe calls…). |
| `parser.js` | 440 | **Step 2b.** `parse(source)`: reads the whole program into a tree. `block()` reads lines until `end`; `statement()` handles each statement word. |
| `brain.js` | 158 | The tiny offline AI (`TinyBrain`): words (naive Bayes), pictures (nearest neighbours on 16×16 pictures), numbers (straight-line fit). |
| `runtime-helpers.js` | 78 | Built-in recipes (`round`, `sqrt`…), number checks, musical notes, safety limits (`STEP_LIMIT`, `DEPTH_LIMIT`), and the tests that pick the fast path. |
| `interpreter.js` | 417 | **Step 3.** `Interpreter`: `run()`, variables and scope, safety ticks, events (`when clicked`, `when key`, `every`), saving data, `use`. |
| `statements.js` | 344 | `execAsync`: one `case` for every statement (`say`, `set`, `repeat`, `forward`, `teach`, `make sprite`, …). |
| `expressions.js` | 373 | `evalSync` (the fast path), `eval` (the path that can wait for `ask` or `chat`), maths and comparisons (`binary`), recipe calls (`call`). |
| `printer.js` | 166 | The formatter: program tree → tidy text (`kidai fmt`, blocks mode). |
| `core-view.js` | 178 | The "Grown-up code" view: `toCore()` shows a program in KidAI Core 1.0 style. |
| `checker.js` | 76 | `kidai check`: finds likely mistakes without running the program. |
| `index.js` | 33 | The public API: everything `require('kidai.js')` gives you. |

## The tree the parser makes

- **Statements** look like `{ type: 'say', line: 3, e: <expression> }`. Blocks have `body: [...]`; `if` has `branches` and `otherwise`.
- **Expressions** look like `{ k: 'bin', op: '+', a: <expr>, b: <expr> }`. Other kinds include `val`, `name`, `list`, `record`, `call`, `item` and `guess`.

`SPEC.md` in the main folder has the full grammar.

## Adding a new statement

For example, `shake sprite "cat"`:

1. **`parser.js`**: in `statement()`, read the words and return something like `{ type: 'shake', line, name }`.
2. **`statements.js`**: add `case 'shake':` in `execAsync` to do it. Call a host method (such as `this.host.shake`) so that the playground decides how it looks.
3. **`printer.js`**: print it back as text, so that `kidai fmt` and blocks mode keep it.
4. **`core-view.js`**: show it in grown-up code.
5. **`words.js`**: add the first word to `STATEMENT_WORDS`, so that "did you mean" can suggest it.
6. **`../blocks.js`**: add a block for it, if it should be in blocks mode.
7. **`../tests/behavior.js`**: add a test. Then run `npm test`, which builds `kidai.js` first.
