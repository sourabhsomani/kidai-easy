# KidAI Easy language specification

Version 1.2 · 28 October 2026

This document is the rulebook for KidAI Easy. When the interpreter (the files in `src/`, built into `kidai.js`) and this document disagree, that is a bug in one of them: fix it and add a test to `tests/behavior.js`.

KidAI Easy is the beginner level of the KidAI language described in the KidAI PRD (KIDAI-PRD-001). It keeps the PRD's foundations (blocks open with `:` and close with `end`, `#` comments, `.kid` files, safe and offline-first) and removes what beginners find hard (types, async code, symbol-heavy syntax).

## 1. Source text

- A program is UTF-8 text. Lines end with LF or CRLF.
- **One statement per line.** A statement never continues onto the next line.
- `#` starts a comment that runs to the end of the line (unless it is inside quotes).
- Blank lines and indentation are ignored. Indentation of two spaces is the recommended style, and `kidai fmt` produces it.
- Keywords and names are **not case-sensitive**: `Say`, `SAY` and `say` are the same; `Score` and `score` are the same variable.

### 1.1 Tokens

| Token | Rule | Examples |
| --- | --- | --- |
| Number | digits, optional `_` separators, optional `.` and digits | `7`, `3.5`, `.5`, `1_000` |
| Text | between `"…"`, `“…”` or `'…'`; escapes `\n`, `\t`, `\"`, `\\` | `"Hello"`, `“smart”` |
| Word | a letter or `_`, then letters, digits or `_` (any alphabet) | `score`, `my_pet`, `नाम` |
| Symbol | `+ - * / % ( ) [ ] { } , : . > < = >= <= == != <>` and `≥ ≤ ≠ × ÷ −` | |

`%` means `mod`. `==` means `=`. `<>` means `!=`.

### 1.2 Reserved words

These words can never be variable or recipe names:

`and or not is yes no true false nothing random item length how guess contains mod of to by into with times from end else if repeat while until forever for each in say show print set change ask define give return stop skip add remove wait forward turn pen color colour circle clear teach when go every play beep write background dot rectangle touches make move delete learn predict forget use chat split replace save load`

`item`, `length` and `key` are *soft*: they can still be used as names when they are not followed by a value (`for each item in list` works).

## 2. Grammar

The grammar below uses EBNF. `{ x }` means zero or more, `[ x ]` means optional, and quoted words are matched without caring about case. `NEWLINE` ends every statement. A `:` before `NEWLINE` is optional on block lines.

```ebnf
program     = { statement } ;
block       = { statement } ;
statement   = say | set | change | add | remove | ask | askpic | if | repeat | foreach
            | define | giveback | when | whenkey | every | use | "stop" [ "everything" | "all" | "program" ]
            | "skip" | wait | draw | sprite | sound | ai | data | call ;

say         = ( "say" | "show" | "print" ) expr ;
set         = "set" name ( "to" | "=" ) expr
            | "set" name "." name { "." name } ( "to" | "=" ) expr
            | "set" "item" additive "of" name ( "to" | "=" ) expr ;
change      = "change" name "by" expr ;
add         = "add" expr "to" name ;
remove      = "remove" expr "from" name ;
ask         = "ask" expr [ ( "into" | "as" ) name ] ;
askpic      = "ask" "picture" expr [ ( "into" | "as" ) name ] ;
if          = "if" expr [":"] block { "else" "if" expr [":"] block } [ "else" [":"] block ] "end" ;
repeat      = "repeat" ( expr ( "times" | "time" ) | "while" expr | "until" expr | "forever" ) [":"] block "end" ;
foreach     = "for" [ "each" ] name "in" expr [":"] block "end" ;
define      = "define" name [ "(" [ name { "," name } ] ")" ] [":"] block "end" ;
giveback    = ( "give" "back" | "return" ) [ expr ] ;
when        = "when" ( "clicked" expr | [ "button" ] additive "clicked" ) [":"] block "end" ;
whenkey     = "when" "key" additive "pressed" [":"] block "end" ;
every       = "every" additive [ "second" | "seconds" ] [":"] block "end" ;
use         = "use" expr ;
wait        = "wait" expr [ "second" | "seconds" ] ;
draw        = ( "forward" | "back" | "backward" ) expr [ "steps" ]
            | "turn" ( "left" | "right" ) expr [ "degrees" ] | "turn" "to" expr
            | "pen" ( "up" | "down" ) | "pen" "size" expr | ( "pen" "color" | "color" | "colour" ) expr
            | "circle" expr | "dot" expr | "rectangle" additive "," additive | "write" expr | "background" expr
            | "clear" | "go" "home" | "go" "to" additive "," additive | "hide" | "unhide" ;
sprite      = "make" "sprite" additive "as" additive { "at" additive "," additive | "size" additive }
            | "move" "sprite" additive ( "by" | "to" ) additive "," additive
            | ( "hide" | "show" ) "sprite" expr | "delete" "sprite" expr ;
sound       = "play" "note" additive [ "for" additive [ "seconds" ] ] | "play" "sound" expr | "beep" ;
ai          = "teach" additive "with" expr | "test" additive "with" expr | "learn" additive "from" expr
            | "save" "ai" "as" expr | "load" "ai" expr | "forget" "ai" ;
data        = "save" expr "as" expr | "load" additive "into" name ;
call        = name [ "(" [ expr { "," expr } ] ")" ] ;

expr        = or ;
or          = and { "or" and } ;
and         = not { "and" not } ;
not         = "not" not | compare ;
compare     = contains [ cmpop contains | "is" [ "not" | bigger "than" | smaller "than" ] contains
            | ( "touches" | "touching" ) ( "edge" | contains ) | ( "starts" | "ends" ) "with" contains ] ;
cmpop       = ">" | "<" | ">=" | "<=" | "=" | "!=" ;
bigger      = "bigger" | "greater" | "more" | "larger" | "taller" | "older" ;
smaller     = "smaller" | "less" | "fewer" | "shorter" | "younger" ;
contains    = additive [ "contains" additive ] ;
additive    = product { ( "+" | "-" ) product } ;
product     = unary { ( "*" | "/" | "mod" ) unary } ;
unary       = "-" unary | atom { "." name } ;
atom        = NUMBER | TEXT | "yes" | "no" | "true" | "false" | "nothing"
            | "(" expr ")" | "[" [ expr { "," expr } ] "]" | "{" [ field { "," field } ] "}"
            | "random" additive "to" additive | "random" "item" "from" unary
            | "item" additive "of" unary | "length" [ "of" ] unary
            | "how" ( "sure" | "accurate" ) | "guess" additive | "predict" additive "for" additive
            | "key" additive "is" ( "pressed" | "down" ) | ( "x" | "y" ) "position" | ( "x" | "y" ) "of" "sprite" unary
            | "split" additive "by" additive | "join" additive "with" additive
            | "replace" additive "with" additive "in" unary | "keys" "of" unary
            | "stage" "picture" | "load" unary | "chat" additive
            | name "(" [ expr { "," expr } ] ")" | name ;
field       = ( name | TEXT ) ":" expr ;
```

Rules the grammar does not show:

- `define`, `when`, `every` and `use` may only appear at the top level, not inside another block.
- An `if` has at most one plain `else`, and it must come last.
- Keyword expressions such as `guess x` and `random 1 to 6` read as far to the right as they can, so `guess x + "!"` means `guess (x + "!")`. Use brackets for `(guess x) + "!"`. `kidai fmt` adds these brackets for you.
- A line that is only a name runs the recipe with that name (`greet` is the same as `greet()`).

## 3. Values

| Kind | Written as | Shown by `say` as |
| --- | --- | --- |
| number | `42`, `3.5` | `42`, `3.5` (at most 6 decimals, so `0.1 + 0.2` shows `0.3`) |
| text | `"hi"` | `hi` |
| yes/no | `yes`, `no`, `true`, `false` | `yes`, `no` |
| nothing | `nothing` | `nothing` |
| list | `[1, "a"]` | `[1, a]` |
| record | `{name: "Tom", age: 3}` | `{name: Tom, age: 3}` |
| picture | from `ask picture` or `stage picture` | `a picture` |

Lists and records are shared, not copied: `set b to a` makes `b` and `a` the same list.

## 4. Meaning of expressions

- **`+`**: two numbers add; two lists join; if either side is text, both are turned into text and joined. Anything else is an error.
- **`-`, `*`, `/`, `mod`**: numbers only (text that looks like a number is accepted). `text * whole number` (0 to 1000) repeats the text. Dividing by zero is an error. `mod` always gives a result with the sign of the right side (`-7 mod 3` is `2`).
- **`is`, `=`**: numbers compare by value (a text that looks like a number equals that number); texts compare **ignoring case and spaces at either end**; lists and records compare item by item.
- **`<`, `>`, `<=`, `>=`**: numbers by value; two texts alphabetically, ignoring case. Mixing is an error.
- **`and`, `or`, `not`**, and the questions in `if`, `repeat while` and `repeat until`, must be yes/no values. `and`/`or` stop early (`no and …` never looks at the right side).
- **`contains`**: list → has an equal item; text → has the text inside (ignoring case); record → has a field with that name.
- **`item n of x`**: lists and text count from **1**. `n` must be a whole number from 1 to the length.
- **`length of x`**: items in a list, letters in a text, fields in a record, or digits in a number.
- **`random a to b`**: a whole number from `a` to `b` (both included) when both are whole; otherwise any number between them. The two ends may be in either order.
- **`split t by s`** gives a list; parts that look like numbers become numbers; `by ""` splits into letters. **`join list with s`** gives text. **`replace a with b in t`** replaces every `a`. **`starts with` / `ends with`** ignore case.
- **Fields**: `pet.name` reads a field; reading a missing field is an error that suggests the closest name.

## 5. Statements

- **Variables.** `set` makes or changes a variable. At the top level, variables are global. Inside a recipe, `set` changes a global if one with that name exists; otherwise it makes a variable that belongs to that call of the recipe. Recipe inputs always belong to the call.
- **`change x by n`** needs `x` to be a number. **`add v to x`** appends to a list or adds to a number. **`remove v from list`** removes the first equal item (error if none).
- **`ask`** waits for an answer. An answer that looks like a number is stored as a number. Without `into`, the answer goes into `answer`.
- **Loops.** `repeat n times` needs a whole number of at least 0, worked out once. `for each` works through a copy of the list (changing the list inside the loop does not change the loop); text gives letters and records give field names. `stop` leaves the innermost loop; `skip` jumps to its next round. `stop` outside a loop ends the program (inside a recipe, it ends the whole program).
- **Recipes.** `define` blocks are collected before the program starts, so a recipe can be used above where it is defined. `give back` ends the recipe with a value; a recipe that ends without one gives `nothing`. The number of inputs must match.
- **Events.** `when clicked`, `when key … pressed` and `every` blocks are collected before the program starts. Their blocks run one at a time, in the order they happen. `every` timers start after the main program finishes. `stop everything` ends the main program, events and timers.
- **`wait n`** pauses for `n` seconds (at most 60).
- **`use "name"`** brings in the recipes (only the `define` blocks) from another project or `.kid` file. Files can use other files; each file is read once.

## 6. Drawing, sprites and sound

- The stage is 400 × 400 steps with `0, 0` in the middle; up is positive `y`. Sparky starts at `0, 0` facing up (direction 0); `turn right` adds to the direction.
- `circle r` draws an outline around Sparky (or a filled circle when the pen is up); `dot r` is always filled; `rectangle w, h` is filled and centred on Sparky.
- Colours are any CSS colour name or code. The playground rejects unknown colours.
- Sprites are emoji or words with a name, position, size (5 to 400, default 50) and visibility. Making a sprite that already exists changes its look (and position or size, if given). Two visible sprites touch when their centres are closer than 0.8 × the average of their sizes. A sprite touches the edge when any part reaches the stage edge.
- Notes are `A` to `G`, optionally with `#` or `b` and an octave (`C4` is middle C, and `C` means `C4`), or a MIDI note number from 1 to 127 (60 is middle C). Notes last 0 to 10 seconds (default 0.4) and the program waits for them. Sound effects: `pop`, `coin`, `jump`, `boom`, `laser`, `win`, `lose`.

## 7. AI

- **Text AI.** `teach label with examples` adds examples (a text or a list of texts) for a label. `guess text` returns the most likely label using naive Bayes over lowercase words, with add-one smoothing. It needs at least two labels. `how sure` is the winning label's probability as a whole percent. The AI card shows the words that pushed the guess most.
- **Picture AI.** A picture is 16 × 16 numbers from 0 to 1, cropped to the ink, scaled to fit, and lightly blurred. `teach` accepts pictures; `guess picture` compares with every taught picture (cosine similarity) and lets the 5 closest vote, with closer pictures counting far more. Pictures and texts can share labels but are guessed separately.
- **`test label with examples`** guesses each example and stores the percent correct in `how accurate`.
- **Number AI.** `learn name from [[input, answer], …]` stores pairs. `predict name for x` fits a straight line (least squares) and returns its value at `x`, rounded to 2 decimals. `how sure` becomes R² as a percent. It needs two pairs with different inputs.
- **`chat text`** asks a cloud AI through the host and returns its answer as text. Without a host connection it is an error.
- **`save ai as k` / `load ai k` / `forget ai`** store, restore and reset everything the AI has learned (text, pictures and numbers).

## 8. Saving data

`save value as key` stores lists, records, pictures, numbers, texts and yes/no values. `load key` gives the value back, or `nothing` if nothing was saved. The playground keeps data in the browser; the `kidai` command keeps it in `~/.kidai/saved.json`.

## 9. Limits and safety

| Limit | Value |
| --- | --- |
| Steps between waits | 1,000,000; then "too many steps", pointing at the innermost loop |
| Recipe calls inside each other | 400 |
| `wait` | 0 to 60 seconds |
| `every` | at least 0.05 seconds |
| Output lines kept in the playground | 600 |

A program has no access to the internet, files, the camera or the microphone, and cannot run other code. Everything outside pure computation goes through the host (section 11).

## 10. Errors

Every error is a `KidError` with a message, a line number and usually a tip. Errors are written for children: they say what went wrong in plain words and suggest a fix, often with "Did you mean …?" for misspelt names. `KidAI.setLanguage('hi')` shows messages and tips in Hindi. Keywords always stay in English.

## 11. Host interface

The interpreter calls these optional host functions. A missing function means the feature is ignored (drawing in the terminal) or reported as unavailable (`ask picture`, `chat`).

`say(text)`, `ask(question) → answer`, `askPicture(question) → {size, data, thumb}`, `line(x1, y1, x2, y2, colour, size)`, `circle(x, y, r, colour, size, outline)`, `rect(x, y, w, h, colour)`, `write(text, x, y, colour, px, heading)`, `background(colour)`, `clear()`, `turtle(state)`, `sprites(list)`, `note(freq, seconds, name)`, `sound(name)`, `button(label, fire)`, `listenKeys(keys)`, `isKeyDown(key)`, `checkColor(colour)`, `moveDelay() → ms`, `ai(guess)`, `aiTest(result)`, `aiPredict(result)`, `taught(...)`, `chat(text) → reply`, `storage.get(key)`, `storage.set(key, value)`, `readFile(name) → source`, `beforeStep(line, interpreter) → promise or nothing`, `error(e)`, `stopped()`.

## 12. Tools

- `KidAI.parse(source, {keepComments})` → program tree. `KidAI.format(source)` → tidy text (the formatter never changes what a program does). `KidAI.check(source)` → likely mistakes without running. `KidAI.toCore(source)` → the grown-up Core 1.0 version, for reading.
- `blocks.js` converts between the program tree and Blockly blocks in both directions without changing what the program does.
- `npm test` runs behaviour tests, the 41-program comparison, formatter and blocks round trips, about 800 random programs, the checker and Hindi messages.

## 13. Versions

KidAI Easy follows semantic versioning. A patch release never changes what a working program does. A minor release can add words and features. The only planned exception so far: version 1.2 points "too many steps" at the loop line rather than a line inside the loop.
