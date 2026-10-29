#!/usr/bin/env bash
# create-prs.sh
#
# Creates 9 feature branches (one per commit after the init commit) and
# opens stacked GitHub PRs so each PR shows exactly one feature's diff.
#
# Prerequisites:
#   1. git remote "origin" must point to your GitHub repo
#        git remote add origin https://github.com/<you>/kidai-easy.git
#   2. gh CLI must be logged in
#        gh auth login
#
# Usage:
#   bash create-prs.sh
#
# WARNING: this force-pushes "main" back to the initial commit so the
# stacked PRs show clean per-feature diffs.  Only run this on a fresh repo.

set -euo pipefail

# ── branch names (index 0 = main, 1-9 = feature branches) ───────────────────

BRANCHES=(
  "main"
  "feature/02-core-primitives"
  "feature/03-parser-printer"
  "feature/04-tinybrain-ai"
  "feature/05-interpreter-runtime"
  "feature/06-checker-api"
  "feature/07-build-cli-gateway"
  "feature/08-playground-blocks"
  "feature/09-vscode-extension"
  "feature/10-docs-examples-tests"
)

PR_TITLES=(
  ""
  "feat: core language primitives — tokenizer, values, errors, messages"
  "feat: expression and statement parser with pretty-printer"
  "feat: TinyBrain offline AI — text, picture and number models"
  "feat: interpreter, runtime helpers and two-speed execution engine"
  "feat: static checker, core-view transpiler and public API"
  "feat: build system, CLI and gateway server"
  "feat: browser playground and blocks UI"
  "feat: VS Code extension with syntax highlighting and snippets"
  "feat: docs, example programs and test suite"
)

PR_BODIES=(
  ""
  "Adds the four foundational modules:
- **tokenizer.js** – splits source into tokens; accepts smart/curly quotes so kids who copy from a word processor don't get errors
- **values.js** – \`toText\`, \`describe\`, \`same\`; Damerau-Levenshtein distance powers \"did you mean?\" hints
- **errors.js** – \`KidError\` (friendly child-facing errors) and control-flow signals (\`StopLoop\`, \`SkipLoop\`, \`GiveBack\`, …)
- **messages.js** – English/Hindi translation helpers"

  "Recursive-descent expression parser with explicit precedence levels:

\`\`\`
expr → or → and → not → compare → contains → additive → mult → unary → atom
\`\`\`

\`printer.js\` can round-trip any AST back to tidy source, used by \`kidai fmt\`."

  "Three fully offline AI models bundled in one \`TinyBrain\` class:
- **Text** – naive Bayes classifier with Laplace smoothing
- **Pictures** – k-NN on normalised 16 × 16 pixel grids using cosine similarity
- **Numbers** – ordinary least-squares linear regression

No server or internet connection required."

  "Two-speed execution engine:
- **\`execFast\` / \`evalSync\`** – runs simple statements without creating Promises, keeping tight loops fast
- **\`execAsync\` / \`eval\`** – falls back to Promises when \`wait\`, \`play\`, \`draw\`, etc. are needed

\`STEP_LIMIT\` (1 000 000) and \`DEPTH_LIMIT\` (400) guard against infinite loops and runaway recursion."

  "\`checker.js\` walks the AST and emits warnings/errors before the program runs (undefined variables, misplaced \`give back\`, etc.).

\`core-view.js\` transpiles KidAI Easy to KidAI Core 1.0 style for learners ready to move on.

\`index.js\` is the single public entry point for both Node.js (\`require('kidai-easy')\`) and the browser bundle."

  "- **\`build.js\`** – bundles all \`src/\` files into a single \`kidai.js\` for browser use
- **\`kidai-cli.js\`** – provides the \`kidai\` command: \`run\`, \`fmt\`, \`check\`, \`core\`
- **\`gateway/\`** – optional HTTP server for classroom deployments where saving and sharing programs is needed"

  "**\`playground.html\`** is the self-contained single-file web app kids open in any browser — no install needed.

**\`blocks.js\`** powers the drag-and-drop blocks mode for younger children who aren't ready to type code."

  "VS Code extension for \`.kid\` files:
- Syntax highlighting via TextMate grammar
- Bracket matching and comment toggling
- Code snippets for all KidAI Easy keywords
- Published as \`kidai-easy-1.2.0.vsix\`"

  "- **\`docs/\`** – PDF guides in English and Hindi (Code with Sparky)
- **\`examples/\`** – 19 sample programs: hello world → AI chat → records
- **\`tests/\`** – golden-output behaviour test runner for regression testing"
)

# ── helper: SHA of the n-th commit (0-indexed, oldest first) ─────────────────
commit_at() {
  git rev-list --reverse HEAD | awk "NR==$((${1}+1)){print;exit}"
}

# ── 1. check prerequisites ────────────────────────────────────────────────────
if ! git remote get-url origin &>/dev/null; then
  echo "ERROR: no remote 'origin' found."
  echo "  Add one first:  git remote add origin https://github.com/<you>/kidai-easy.git"
  exit 1
fi

if ! gh auth status &>/dev/null; then
  echo "ERROR: gh CLI is not authenticated.  Run:  gh auth login"
  exit 1
fi

echo "Remote: $(git remote get-url origin)"
echo ""

# ── 2. push main at the initial commit ───────────────────────────────────────
echo "→ [0/9] setting main → commit 0 ($(commit_at 0 | cut -c1-7))"
git checkout -B main "$(commit_at 0)"
git push -u origin main --force

# ── 3. create & push each feature branch ─────────────────────────────────────
for i in 1 2 3 4 5 6 7 8 9; do
  BRANCH="${BRANCHES[$i]}"
  COMMIT="$(commit_at $i)"
  echo "→ [$i/9] branch $BRANCH @ ${COMMIT:0:7}"
  git checkout -B "$BRANCH" "$COMMIT"
  git push -u origin "$BRANCH" --force
done

echo ""

# ── 4. open PRs (stacked: each PR targets the previous branch) ───────────────
for i in 1 2 3 4 5 6 7 8 9; do
  HEAD="${BRANCHES[$i]}"
  BASE="${BRANCHES[$((i-1))]}"
  TITLE="${PR_TITLES[$i]}"
  BODY="${PR_BODIES[$i]}"
  echo "→ PR $i/9:  $HEAD  →  $BASE"
  gh pr create \
    --head "$HEAD" \
    --base "$BASE" \
    --title "$TITLE" \
    --body "$BODY" \
  || echo "  (skipped — PR may already exist for $HEAD)"
done

echo ""
echo "Done!  View your PRs:"
gh repo view --json url -q '.url + "/pulls"'
