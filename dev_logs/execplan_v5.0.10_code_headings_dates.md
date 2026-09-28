# v5.0.10 code-widget, heading, and turn-date refinement

## Purpose

Address the follow-up Greasy Fork report that v5.0.8 leaves code languages outside fences, emits Google's caution footer, misses generic response headings, and may let code fences disrupt the optional turn-date display. Preserve v5.0.9 inline/side/legacy canvas behavior.

## Evidence read

- Greasy Fork discussion 339322, comments 669234 and 669235, including the user's obfuscated Markdown sample: <https://greasyfork.org/en/scripts/572688-google-ai-canvas-exporter/discussions/339322>.
- v5.0.9 `aimDomToMarkdown`, `fencedCode`, `normalizeMarkdown`, `renderMarkdownPreview`, `extractTurnDate`, and `buildConversationMarkdown` in the production userscript; `test/exporter.test.mjs` and `test/fixtures/conversation-formatting.html`.
- CommonMark 0.31.2 fenced-code and list-item rules: <https://spec.commonmark.org/0.31.2/>.

## Current behavior and risks

- v5.0.9 already recognizes `.aiModeUiCodeBlock__Container`, moves `.GlO4G` into the fence info string, and skips `.iMHp6c`. The user's quoted output is from v5.0.8, so it does not prove a remaining v5.0.9 failure.
- v5.0.9 recognizes some specific heading classes and generic `[role="heading"][aria-level]`, but a response heading with only `role="heading"` is still plain text.
- `fencedCode` retains surplus trailing newlines in the code source, which can produce an extra blank line before the closing fence. Its fences are balanced, but the turn-date toggle has no code-widget-specific regression test.
- The safe preview parser handles only a single list-contained fenced block after an item. More than one continuation block needs explicit coverage before claiming parity with exported Markdown.

## Target behavior

- Generic response `role="heading"` nodes become Markdown headings, while prompt chrome remains outside the response converter.
- Code-widget source appears once with a valid language-labelled fence, no accidental blank line before the closing marker, and no caution/copy chrome. List nesting and citation boundaries remain valid.
- Turn dates appear exactly once when enabled and nowhere when disabled; date-like text inside code remains literal code; both modes preserve matching fences and subsequent turns.
- Canvas capture, download, URL gating, and dependency policy remain unchanged.

## Implementation plan

1. Add a sanitized multi-turn current-widget fixture that reproduces bare role headings, code inside a list, trailing code newlines, multiple code blocks, a citation, and timestamps. Write focused assertions for date on/off, code content, and preview.
2. Run the focused tests against v5.0.9 to confirm which gaps are real; then adjust only the Markdown converter and safe preview as needed.
3. Bump version, update README/changelog/manual validation notes with evidence-bounded behavior. Run syntax, unit, fixture, and whitespace checks; seek live Chrome/Firefox replay if available.
4. Review and commit on a focused branch. Publish a GitHub PR; do not post to Greasy Fork or claim live v5.0.10 success without a distinct browser test.

## Validation plan

- `node --check userscript/Google_AI_Canvas_Exporter.user.js`
- `npm test`
- `npm run test:fixtures`
- `git diff --check`
- Manual: signed-in code-heavy thread with Turn dates on/off in Chrome Beta and Firefox Nightly; verify Markdown and opened HTML canvas exports where present.

## Progress log

- 2026-09-28 PDT: Confirmed follow-up comments and compared them with merged v5.0.9. Created focused branch. The published sample is v5.0.8 evidence, so v5.0.10 must be validated on its own merits.
- 2026-09-28 PDT: Added a sanitized two-turn code-widget fixture. It failed against v5.0.9 on bare response headings and surplus code newlines, then passed after the narrowly scoped converter fix. Covered whitespace-only trailing lines, date toggle, citation, list-contained fences, and rendered preview.
- 2026-09-28 PDT: Read-only live inspection of the signed-in long share confirmed the widget's separate language/caution nodes and trailing whitespace shape. Full automated suite passed (32 unit tests, three fixture checks, syntax, and diff whitespace). Distinct live v5.0.10 browser replay remains outstanding because the updated userscript is not installed in the connected Chrome profile and Firefox Nightly is unavailable to the browser-control surface.
