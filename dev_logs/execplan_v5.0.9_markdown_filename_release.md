# v5.0.9 Markdown formatting and thread filename release

## Purpose

Finish the September 2026 inline-canvas repair by addressing the remaining Markdown formatting defects reported on Greasy Fork and replacing unwieldy first-prompt thread filenames with concise, representative defaults. Preserve working inline, side, and legacy canvas export, then synchronize the reviewed code and validation record to the GitHub remote.

## Evidence read

- Greasy Fork discussion 339322, comment 669160: links clump at line ends, headings are missed, and code fences break.
- User-supplied Firefox Nightly v5.0.8 screenshots show two distinct inline canvas cards, three conversation segments, and Tampermonkey v5.0.8 enabled. The supplied Desktop export paths were not present at this checkpoint; prior read-only inspection recorded 34 heading lines, two canvas markers, and zero code fences in the flight-delay Markdown. Screenshots cannot establish opened-file interaction or console cleanliness.
- `userscript/Google_AI_Canvas_Exporter.user.js`: `makeMarkdownFilename`, `extractThreadTitle`, `aimDomToMarkdown`, `normalizeMarkdown`, and `renderMarkdownPreview`.
- `test/fixtures/conversation-formatting.html` and its golden Markdown; `test/exporter.test.mjs`; README, changelog, v5.0.8 validation log, and earlier ExecPlans.
- User-provided 16-turn v5.0.8 Markdown export for Apple Devices Wi-Fi Sync and the corresponding live signed-in share in Chrome: 57 current code-widget containers, 22 inside lists, language label outside `<pre>`, 57 caution labels, and `.otQkpb` heading wrappers. No private thread contents entered the repository.
- CommonMark's fenced-code and list-indentation rules: <https://spec.commonmark.org/spec>.

## Current behavior

- The active Google thread title can be the full first prompt. `makeMarkdownFilename` strips punctuation but retains that entire prompt, producing an overlong, awkward default.
- Citation markers concatenate directly with preceding prose when Google places a marker immediately after text or punctuation. The exported flight-delay Markdown still shows this pattern.
- Nested bold wrappers can produce adjacent `**` delimiters in list cards. Code blocks use fixed triple-backtick fences, so authored code containing its own triple-backtick line can prematurely close a block. The preview parser also assumes triple backticks.
- Current fixtures verify one simple code block and headings but do not exercise these edge cases. The flight-delay thread has no code block, so its Firefox export cannot verify code-fence correctness.
- The separate code-heavy v5.0.8 export confirms the defect in real output: 53 clumped citations, 57 caution labels, 34 bare `powershell` lines, 11 glued `:powershell` strings, and four sampled unmarked headings.

## Target behavior

- A long instruction-like first prompt yields a readable, bounded filename stem with the main subject and important acronyms; short user-authored titles remain unchanged. The full thread title and custom filename editing remain available.
- Citations read as distinct inline links with word boundaries; consecutive markers do not clump. Headings and list labels remain parseable Markdown without invalid nested emphasis.
- Code blocks choose a fence longer than any run of backticks in the code. Normalization and the safe preview recognize the matching delimiter and preserve literal code, including short backtick runs.
- Existing inline/side/legacy canvas and fail-closed URL behavior remain covered by the full suite.

## Implementation plan

1. Add focused test fixtures/assertions for long and short filename defaults, citation boundaries, nested list emphasis, and a code sample containing backticks. Verify tests fail on current code where applicable.
2. Implement bounded filename stems, citation-aware child joining, nested emphasis handling, variable-length code fences, and matching normalization/preview parsing. Keep API changes test-only and preserve editable names.
3. Update README, changelog, and Firefox/manual validation log with evidence-bounded results; bump script to v5.0.9.
4. Run syntax, unit, fixture, `git diff --check`, and read-only static export checks when artifacts are available. Review the diff. Commit only project files (not user Desktop evidence or the untracked v5.0.3 copy), push the focused branch, and merge/sync the GitHub remote only after checks pass.

## Validation plan

- `node --check userscript/Google_AI_Canvas_Exporter.user.js`
- `npm test`
- `npm run test:fixtures`
- `git diff --check`
- Signed-in Chrome Beta and Firefox Nightly manual matrix: current screenshots are v5.0.8 evidence; v5.0.9 installation/opened-file interaction requires a distinct confirmation. Do not claim live v5.0.9 success without it.

## Progress log

- 2026-09-27 PDT: Inspected linked report, existing code/tests, screenshots, and the v5.0.8 validation record. Desktop export attachments were not present at the listed paths at this checkpoint. Firefox Nightly is not exposed by the connected browser-control surface; only Chrome and the in-app browser appear.
- 2026-09-28 PDT: User supplied a separate code-heavy export and share. Read-only source inspection identified `.aiModeUiCodeBlock__Container` with `.GlO4G` language, `.iMHp6c` caution/copy UI, and `.otQkpb` headings. Added failing regression fixtures, then implemented and passed 31/31 unit tests plus three saved-page fixtures. Updated README, changelog, and manual validation logs. Live v5.0.9 retest and remote synchronization remain pending.
- 2026-09-28 PDT: The final preview assertion found that a list-contained fence rendered outside its list. Updated the safe preview to attach that code block to the list item, then reran all 31 tests, three fixture validations, syntax check, and whitespace check successfully. The linked long prompt itself has no line breaks or code elements in Google's accessible DOM, so its original code formatting cannot be inferred from that DOM alone. Live v5.0.9 browser evidence remains pending.
