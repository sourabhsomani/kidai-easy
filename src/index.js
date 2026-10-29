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
