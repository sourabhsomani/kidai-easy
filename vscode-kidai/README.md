# KidAI Easy for Visual Studio Code

Colours, automatic indentation and snippets for KidAI Easy programs (`.kid` files).

- Instructions, drawing, game and AI words each get their own colour.
- After a line ending in `:` the next line is indented; `end` and `else` move back out.
- Type `repeat`, `if`, `define`, `foreach`, `sprite` or `teach` and press Tab for a ready-made block.

## Install from this folder

1. `npm install -g @vscode/vsce`
2. In this folder: `vsce package`
3. In VS Code: Extensions → … → Install from VSIX, and pick the `.vsix` file.

Run programs with the `kidai` command in the terminal: `kidai my_program.kid`.
