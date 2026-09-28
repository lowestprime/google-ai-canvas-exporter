# v5.0.11 export-option persistence and archive assessment

## Purpose

Remember exporter-panel checkbox preferences after closing the panel, navigating to another AI Mode thread, and restarting the browser. Keep per-thread canvas selections separate from global export options. Assess all ten supplied v5.0.10 archive entries and preserve canvas export behavior.

## Evidence read

- User-supplied `canvas_exporter_09282026_tests.zip`: ten export files across date on/off, Chrome/Firefox, a three-turn mixed canvas thread, and a 16-turn code-heavy thread.
- `userscript/Google_AI_Canvas_Exporter.user.js`: `openExportPanel`, `canvasCardHTML`, `refreshOpenCanvasPanel`, `inlineCanvasTitle`, `deriveRouteKey`, and route reset logic.
- `test/exporter.test.mjs` and `test/load-userscript.mjs`.
- [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage): origin-scoped persistence across sessions; reads/writes can throw when storage is blocked; private windows discard data at close.

## Archive findings before changes

- All ten entries identify v5.0.10 and could be decompressed. The four long-thread Markdown files contain 16 prompts, 104 headings, 57 balanced language-labelled code blocks, and no Google caution footer. Chrome and Firefox bodies match exactly within each date setting. Date-on has 16 turn-date lines; date-off has none.
- The two flight-thread Markdown files contain three prompts and two canvas references. Date-on has three time lines; date-off has none. Both canvas HTML pairs have matching authored bodies, one module each, no CSP meta, and retained remote dependencies.
- The identical first canvas body is labelled `Interactive Canvas 1` in one run and `Interactive Canvas 2` in another. Its current generic fallback depends on registration order.
- None of the panel's checkboxes is persisted. Each panel rebuild hard-codes `checked` and `canvasAllOn = true`.

## Target behavior

- Global booleans for conversation inclusion, YAML frontmatter, turn dates, dark mode, full viewport, and metadata persist immediately on change and restore in subsequent threads/restarts. Defaults remain on for a new profile.
- Canvas-card inclusion and select-all state persist for the same thread only, without leaking choices to unrelated threads. Newly discovered cards respect a saved deselect-all setting.
- Thread title, filenames, source URL, and export date remain per-export content, not global preferences. No conversation or canvas HTML is stored.
- Storage errors degrade to in-memory state with a one-time nonblocking warning; no new privileged grant or external transmission.
- Anonymous inline canvas numbering follows stable thread/DOM order rather than asynchronous source-registration order when that order is available.

## Implementation plan

1. Add a small versioned, validated preference store on the top Google page only. Use `localStorage` with exception handling; cap route-scoped canvas selection history.
2. Restore and save every global checkbox; bind per-thread card changes and select-all; retain selections when late cards appear.
3. Stabilize generic inline numbering from the document's observed canvas order, retaining a fallback for virtualized cases.
4. Add tests for defaults, mutation, panel reopen, new thread, new userscript instance with shared storage, blocked storage, late canvas arrival, and naming stability. Audit ZIP findings in a validation log.
5. Run syntax, unit, fixture, whitespace, and proportional browser checks; review/merge through a PR if green.

## Validation plan

- `node --check userscript/Google_AI_Canvas_Exporter.user.js`
- `npm test`
- `npm run test:fixtures`
- `git diff --check`
- Manual signed-in Chrome Beta only: modify settings, close panel, reload, navigate thread, restart browser; verify restored states and export outputs. The supplied archive validates v5.0.10 outputs, not v5.0.11 persistence.

## Progress log

- 2026-09-28 PDT: Inspected archive and code; created focused branch. Archive proves date toggle behavior and cross-browser parity for supplied outputs, but cannot prove settings survive restart.
- 2026-09-28 PDT: Implemented a small validated Google-origin preference record with six global booleans and bounded route-scoped canvas selections. Fixed Canvases Only to honor card choices and stabilized generic inline labels from page order. Focused tests pass for panel reopen, fresh page instance, separate thread, late canvas, blocked storage, selective download, and out-of-order registration.
- 2026-09-28 PDT: Full automated validation passes: 40 unit tests, three existing fixture validations, JavaScript syntax, and diff whitespace. Another-open-tab refresh and malformed-storage cases are covered. User narrowed live testing to Chrome Beta only; its v5.0.11 restart replay is not yet confirmed.
