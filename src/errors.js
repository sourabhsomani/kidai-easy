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
