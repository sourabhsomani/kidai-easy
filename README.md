# KidAI Easy

A programming language for kids aged 8 and up. It reads like English and runs offline. Kids can draw with a robot, make games, and teach their own AI with words, pictures and numbers.

**[Try the playground →](https://kidai-easy.vercel.app)**

```kidai
say "Hello! I am Sparky."
ask "What is your name?" into name

repeat 3 times:
  say "Hip hip hooray for " + name + "!"
end

teach "happy" with ["I love this", "yay so fun"]
teach "sad" with ["I feel bad", "this is awful"]
say guess "today was so fun"
say how sure + "% sure"
```

## VS Code Extension

Install the extension for `.kid` file syntax highlighting, snippets and bracket matching.

**From the VS Code Extensions tab (easiest):**

1. Open VS Code
2. Press `Ctrl+Shift+X` (or click the Extensions icon in the sidebar)
3. Search for **KidAI Easy**
4. Click **Install**

Or install directly from the marketplace:
[KidAI Easy — VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=SourabhSomani.kidai-easy-extension)

Or install from the command line:
```bash
code --install-extension SourabhSomani.kidai-easy-extension
```

## Install

You need [Node.js](https://nodejs.org) 18 or newer.

```
npm install -g kidai-easy
kidai new hello
kidai hello.kid
```

For drawing, games, blocks and the picture AI, open the playground: `playground.html` (or `docs/index.html` on GitHub Pages).

## What's in this folder

| Path | What it is |
| --- | --- |
| `src/` | **The language source**, split into 16 small files (tokenizer, parser, interpreter, AI, formatter…). Start with `src/README.md`. |
| `kidai.js` | All of `src/` joined into one file by `node build.js`. No dependencies; works in browsers and Node.js. Don't edit it by hand. |
| `blocks.js` | Blocks mode: turns programs into Blockly blocks and back without changing what they do. |
| `kidai-cli.js` | The `kidai` command (see below). |
| `cli-stage.js` | The stage window for the `kidai` command: shows drawings and sprites, plays sound, sends keys and button clicks, and has the drawing pad. It runs only on this computer. |
| `playground.src.html` | Playground source. |
| `build.js` | Makes `kidai.js` from `src/`, and `playground.html` from `playground.src.html`. |
| `examples/` | 19 example programs, from "hello" to games and AI. |
| `gateway/server.js` | A safe chat gateway, so `chat` can use a cloud AI without kids ever seeing an API key. |
| `vscode-kidai/` | VS Code extension: colours, indentation and snippets for `.kid` files (packaged `.vsix` included). |
| `tests/` | `npm test`: 424 checks. |
| `docs/` | The kids' guide in English and Hindi (PDF), and a copy of the playground for GitHub Pages. |
| `SPEC.md` | The language rules: grammar, meaning of every statement, limits and the host interface. |

## The `kidai` command

| Command | What it does |
| --- | --- |
| `kidai my_program.kid` | Run a program. Programs that draw, play sound, use keys or buttons, or ask for pictures open a stage window in your web browser (`--no-window` keeps everything in the terminal) |
| `kidai new my_program` | Make a starter program |
| `kidai check my_program.kid` | Find likely mistakes without running |
| `kidai fmt my_program.kid` | Tidy the spacing (`--check` only looks) |
| `kidai svg my_program.kid` | Save the drawing as an SVG picture |
| `kidai core my_program.kid` | Show the grown-up KidAI Core version |
| `kidai test examples` | Run every `.kid` file in a folder and report problems |
| `--lang hi` | Messages and tips in Hindi (or set `KIDAI_LANG=hi`) |

## The language on one page

| Idea | KidAI Easy |
| --- | --- |
| Show something | `say "Hi"` (`show` and `print` work too) |
| Variables | `set score to 0`, `change score by 1` |
| Ask the user | `ask "Your name?" into name` (number answers become numbers) |
| Decide | `if score > 5:` … `else if score is 5:` … `else:` … `end` |
| Compare | `is`, `is not`, `is bigger than`, `is smaller than`, `>`, `<`, `>=`, `<=`, `contains`, `starts with`, `ends with` |
| Logic | `and`, `or`, `not`, `yes`, `no` |
| Loops | `repeat 3 times:`, `repeat until …:`, `repeat while …:`, `repeat forever:`, `for each pet in pets:`, `stop`, `skip` |
| Lists (start at 1) | `["a", "b"]`, `add`, `remove`, `item 1 of pets`, `length of pets`, `set item 2 of pets to "owl"` |
| Records | `set pet to {name: "Tom", age: 3}`, `pet.name`, `set pet.age to 4`, `keys of pet` |
| Text tools | `split "a,b" by ","`, `join pets with ", "`, `replace "a" with "o" in word` |
| Random | `random 1 to 6`, `random item from pets` |
| Recipes (functions) | `define greet(name):` … `give back answer` … `end`, then `greet("Mira")` |
| Use other files | `use "my helpers"` borrows recipes from another project or `.kid` file |
| Drawing robot | `forward 100`, `back 50`, `turn right 90`, `turn to 90`, `pen up`, `pen size 5`, `color "red"`, `circle 30`, `dot 10`, `rectangle 80, 40`, `write "Hi"`, `background "skyblue"`, `go to 50, 100`, `go home`, `clear`, `hide`, `x position`, `direction` |
| Sprites | `make sprite "cat" as "🐱" at 0, -100 size 60`, `move sprite "cat" by 10, 0`, `hide sprite`, `delete sprite`, `"cat" touches "fish"`, `"cat" touches edge`, `x of sprite "cat"` |
| Keyboard | `when key "space" pressed:` … `end`, `if key "left" is pressed:` |
| Sound | `play note "C" for 0.5`, `beep`, `play sound "coin"` |
| Buttons and timers | `when clicked "Jump":`, `every 1 second:`, `wait 1`, `stop everything` |
| Text AI | `teach "label" with [...]`, `guess "words"`, `how sure`, `test "label" with [...]`, `how accurate` |
| Picture AI | `ask picture "Draw a cat" into cat1` (drawing pad or photo), `stage picture`, then `teach` and `guess` as usual |
| Number AI | `learn "plant" from [[1, 2], [2, 4]]`, `predict "plant" for 10` |
| Big AI | `chat "Why is the sky blue?"` (needs a gateway or a Claude account) |
| Save | `save score as "best"`, `load "best" into best`, `save ai as "moods"`, `load ai "moods"`, `forget ai` |

`SPEC.md` has the exact rules.

## Running programs from the terminal

`kidai my_program.kid` runs any program. Programs that only use words stay in the terminal. Programs that draw, use sprites, play notes or sounds, use keys or buttons, or `ask picture` also open a **stage window** in your web browser:

- the stage shows Sparky's drawing, sprites, the background and text, just like the playground
- notes and sound effects play in the window
- arrow keys, other keys and `when clicked` buttons in the window go to the program
- `ask picture` shows a drawing pad (or pick a photo)
- what the program says appears in both places; `ask` questions are answered in the terminal

For programs with sound or keys, press **▶ Start** in the window first (browsers only allow sound and keys after a click). Games that wait for keys, buttons or timers keep running until you press **Stop** in the window or Ctrl+C in the terminal. The window runs only on your computer; nothing is sent anywhere. If it doesn't open by itself, open the address printed in the terminal.

## The playground

Open the playground at **[https://kidai-easy.vercel.app](https://kidai-easy.vercel.app)** — no install needed, works in any browser.

- **Run**, **Step** (one line at a time) and a speed menu; the running line glows.
- **Sparky's memory** shows every variable, live.
- **Code**, **Blocks** and **Grown-up code** tabs show the same program three ways.
- **My projects** saves many projects in the browser. **Share** gives a share code (`KID1…`) that friends can open as a remix.
- **Class challenges**: a teacher turns a program into a challenge; students press **Check my work** and **Hand it in**; **Check students' work** marks a whole class from their hand-in codes. No accounts or server needed.
- **Settings**: हिन्दी (Hindi), bigger text, typing keys for phones and tablets, and the chat gateway address.
- AI cards show confidence for every label, which words or pictures drove the guess, and a chart for number predictions.

## Changes from the PRD design

The PRD's Core 1.0 syntax suits learners aged 13 to 16. KidAI Easy keeps its foundations (`:` and `end` blocks, `#` comments, `.kid` files, offline-first, a safe runtime with step limits, at least two labels before guessing, and AI that shows how sure it is) and makes the rest easier:

| PRD Core 1.0 | KidAI Easy | Why |
| --- | --- | --- |
| `let` / `var` / `set` with types | `set x to 0`, `change x by 1` | One word to learn; no types |
| `==`, `!=` | `is`, `is not`, `is bigger than` (symbols still work) | Kids mix up `=` and `==` |
| `function` / `task` / `await` | `define` and `give back`; `wait` just works | No async to explain |
| 0-based `[ ]` indexing | `item 1 of list` | Matches how kids count |
| Case-sensitive keywords | Case and curly quotes don't matter | Tablets capitalise and change quotes |
| `ui.button` + `on ui.click(...)` | `when clicked "Jump":` | One line, no imports |
| Dataset assets + training jobs | `teach`, `test`, `learn`, `ask picture`, `stage picture` | Train and test an AI in a few lines, offline |
| (not in PRD) | Drawing robot, sprites, sound | Quick, visible results |

Every Easy program can be shown in Core style with the **Grown-up code** tab or `kidai core`.

## Chat gateway (optional)

`chat` sends a question to a cloud AI. Kids never see an API key. For a class, run the gateway on one computer:

```
ANTHROPIC_API_KEY=sk-... node gateway/server.js
KIDAI_CHAT_URL=http://localhost:8787/chat kidai my_program.kid
```

At home, a grown-up can instead set `ANTHROPIC_API_KEY` before running `kidai`; the command then asks Claude directly, with the same safety rules (`gateway/safety.js`).

In the playground, put the gateway address in **Settings**. The gateway adds a kid-safe instruction, removes email addresses and phone numbers, limits length and questions per hour, and filters answers. Review it before using it with a class. When the playground is opened as a Claude artifact, `chat` uses the viewer's own Claude account instead.

## Safety

- No internet, files, camera or microphone from programs. `chat` is the only way out, and it is off unless set up.
- 1,000,000 steps between waits (endless loops are stopped and the loop line is shown), 400 nested recipe calls, waits of at most 60 seconds.
- Pictures for the picture AI stay on the device. Projects and saved data stay in the browser (or `~/.kidai/saved.json` for the command).

## Develop

Edit the files in `src/` (language), `blocks.js` (blocks mode) or `playground.src.html` (playground). Then:

```
npm test                       # builds kidai.js and playground.html, then runs 424 checks
node kidai-cli.js test examples
```

`src/README.md` explains each source file and how to add a new statement.

GitHub Actions runs the tests on Node 18, 20 and 22 (`.github/workflows/test.yml`).

## Publish

| What | Where |
| --- | --- |
| npm package | [kidai-easy on npm](https://www.npmjs.com/package/kidai-easy) |
| Playground | [kidai-easy.vercel.app](https://kidai-easy.vercel.app) |
| VS Code extension | [SourabhSomani.kidai-easy-extension](https://marketplace.visualstudio.com/items?itemName=SourabhSomani.kidai-easy-extension) |
| Source | [github.com/sourabhsomani/kidai-easy](https://github.com/sourabhsomani/kidai-easy) |

To publish a new version:
```bash
npm version patch
npm publish
vercel --prod
```
