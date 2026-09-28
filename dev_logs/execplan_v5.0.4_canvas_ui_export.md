# v5.0.4 AI Mode Canvas UI Export Repair

This is the active ExecPlan under `.agent/PLANS.md`. Update it as fixture and live-browser evidence resolves the remaining implementation choices.

## Purpose

Restore export of canvas-only and mixed chat/canvas threads in Google's current right-hand Canvas UI. A verified canvas must appear as an exportable item, use its real title, and produce an independently usable HTML file when source is available. Chat Markdown must exclude Google attachment chrome and not claim that an unexportable placeholder is an exported canvas. Ordinary Search and empty AI Mode home remain inactive.

## Evidence read and workspace safety

- `AGENTS.md`, `.agent/PLANS.md`, `README.md`, `package.json`, prior v5.0.2/v5.0.3 plans and tests, and the named `userscript/Google_AI_Canvas_Exporter_v5.0.3.user.js`.
- The supplied 5,702-character failed Markdown, 542,215-byte expanded DOM capture, 25,010,450-byte SingleFile capture, 32,607-byte manually exported dashboard HTML, two screenshots, and Chrome accessibility snapshot.
- Initial Git state: `main` at `dc96e92` with canonical `userscript/Google_AI_Canvas_Exporter.user.js` deleted and an untracked versioned v5.0.3 file. The named file's 2,275 lines match the tracked v5.0.3 file line-for-line. Created branch `codex/v5.0.4-canvas-export`; do not delete or overwrite the named file.
- Both supplied `share.google/aimode` links are inaccessible through web retrieval. Google Search Help confirms current Canvas uses a right-hand editable, auto-saved panel; MDN confirms `iframe.srcdoc` reflects inline markup and documents sandbox/cross-origin limits. Saved DOM and browser evidence govern selector behavior.

## Proven current behavior and initial root causes

- The new expanded page has two `.CKgc1d` chat turns and one `iframe.lQ27pc` under `.tgEq3b > .MngkG` in a right-hand `[aria-label="Canvas preview"]` panel. It has **zero** `.emqXtf` containers and **zero** `TgQPHd` comment nodes. v5.0.3 `extractWidgetHTMLFromComment()` can therefore never register that iframe; `registry.length` remains zero, the FAB reports `2 conversation segments and 0 canvases`, and the panel has no canvas cards or HTML export action.
- The SingleFile capture has 592 `TgQPHd` comments, none with WidgetHelpers content. It preserves an `iframe.lQ27pc` with nested `srcdoc`, but the live expanded DOM has an empty `srcdoc`; reading the cross-origin preview is not a viable live extraction path. The real full HTML is in a hidden `[data-xid="mnldjf"]` subtree beside the iframe under `[aria-label="Canvas preview"]`. The 25 text chunks contain the authored `<!DOCTYPE html>…</html>` dashboard, including Tailwind and interaction code. The separate 32 KB standalone HTML agrees in structure and text, with line-ending/chunk-whitespace differences.
- `findCanvasBlocks()` counts the iframe as a canvas before it is exportable, then `snapshotConversationSegment()` invents `Interactive Canvas 1` when registration returns `null`. This produces `1 canvas` in composition, a false Markdown placeholder, and a misleading panel while `registry.length` is zero.
- The Markdown includes `# Shared` and `0 files` from `.srOP7c` attachment UI and appends 17 citation links directly to the first sentence because one related-results marker maps to a whole source group. The screenshots and failed export confirm this output defect.
- v5.0.3 HTML reconstruction is specialized for WidgetHelpers and would reject a generic stand-alone dashboard even if its source were recovered. Preserve this path for legacy widgets and add a separate validated modern-canvas path.

## Target behavior and implementation strategy

1. Identify current Canvas panel and its corresponding source by evidence, not the iframe alone. Read only the parent-page `[data-xid="mnldjf"]` full-HTML surface; do not fetch or exfiltrate account data or attempt cross-origin iframe access. A visible iframe with no obtainable source is **not** an exportable canvas.
2. Introduce typed canvas records (legacy WidgetHelpers vs modern source). Legacy `TgQPHd` extraction and `buildExportHTML()` remain compatible. Modern source validation and export must preserve full HTML/CSS/JS, remove only known Google transport/sandbox artifacts, and produce a usable document without fabricated code. Use only local in-memory state.
3. Discover the right-hand panel's title and source automatically when the page provides them. Route-scope, deduplicate, and refresh records after canvas edits/revisions. Preserve canvas-only FAB/panel behavior when source is verified.
4. Make segment placeholders and composition counts depend on verified records. Inline canvases retain their ordered placement; side-panel canvases appear as separate export cards even when no segment association is proven. Never emit generic `Interactive Canvas 1` as a confirmed export.
5. Strip `.srOP7c` attachment sharing UI (`Shared`, `0 files`). For a related-results marker, cite its primary result inline and retain the complete group in the response's References block.
6. Add fixture tests from the new captures, a modern standalone HTML export test, legacy canvas regression tests, canvas-only/mixed/ordinary/empty route gates, revision/dedup/unknown-source cases, and a browser smoke. Keep dependencies test-only and `@grant none`.
7. Update README, changelog, this plan, and Chrome/Firefox manual validation notes with results and limitations.

## Validation and done criteria

- `npm ci`, `npm test`, `node test/validate-markdown.mjs`, `node --check userscript/Google_AI_Canvas_Exporter.user.js`, `git diff --check` pass.
- New captured DOM proves actual canvas source detection and registration when the external capture is available; portable fixture tests prove the new path and execute an authored interaction in jsdom. Legacy WidgetHelpers HTML reconstruction tests remain green. A true browser-rendered dashboard check remains manual.
- Canvas-only and mixed threads have accurate FAB badge, green dot, canvas cards, Markdown placeholders, and export buttons; unknown-source frames are not counted as exportable.
- Ordinary Search and empty AI Mode home create no exporter UI. Route/revision changes do not retain stale canvas state.
- Chrome and Firefox manual matrix is executed if authenticated userscript-manager sessions are available, otherwise exact blocked rows and next steps are documented. All provided files and user-owned Git changes remain preserved.

## Progress log

- **2026-09-25 22:17 PDT (retrospective checkpoint)** — Read repository state, supplied files, userscript architecture, screenshot/accessibility evidence, and official Google/MDN guidance. Confirmed current right-panel iframe differs from historical comment-based widget layout; created focused branch. The pre-existing untracked v5.0.3 file was preserved; its contents were mechanically restored to the canonical tracked userscript before editing.
- **2026-09-25 22:17 PDT (retrospective checkpoint)** — The read-only inspector located the hidden modern source in `[data-xid="mnldjf"]` and distinguished it from archived nested iframe `srcdoc`. Implemented source validation, modern HTML export dispatch, verified-only counts/placeholders, AI Mode gate, side-panel/source observers, source revision handling, and attachment/citation cleanup. Ran the narrow syntax check and tests after the first batch; corrected test expectations for version and strict route gating.
- **2026-09-25 22:17 PDT** — Portable suite initially 16/16 passing, including canvas-only, mixed, unknown iframe, source revision/withdrawal, citation group, and legacy regression cases. Added README/changelog/browser notes and read-only direct-evidence replay command. The supplied Desktop evidence files disappeared after inspection, so the exact capture replay command currently fails with `ENOENT`; authenticated Chrome Beta and Firefox sessions are not available to this task. These remain explicit validation blockers, not passed checks.
- **2026-09-25 22:21 PDT** — Final review tightened empty-home gating even with stale Canvas DOM, fixed source ownership on remount, and added a regression for that state. Suite is now 17/17 passing. `npm ci`, Markdown validator, syntax check, and `git diff --check` passed before the last review edits and are rerun below.
- **2026-09-25 22:23 PDT** — A supplied share link opened in the available in-app browser, but its signed-out page contained only an AI Mode conversation shell and no turns/canvas. This confirms that public-share navigation cannot substitute for authenticated Chrome/Firefox validation here; the temporary tab was closed.
- **2026-09-25 22:23 PDT** — Final checks passed: `npm ci` (0 vulnerabilities reported), `npm test` (17/17), `node test/validate-markdown.mjs` (all three repository captures), `node --check userscript/Google_AI_Canvas_Exporter.user.js`, and `git diff --check`. The direct September-capture replay remains blocked by missing supplied Desktop files; neither Chrome Beta nor Firefox live verification has been claimed.

## Files changed and decisions

- `userscript/Google_AI_Canvas_Exporter.user.js`: v5.0.4 production implementation. The user's untracked `userscript/Google_AI_Canvas_Exporter_v5.0.3.user.js` is untouched.
- `test/exporter.test.mjs`, `test/fixtures/modern-canvas-only.html`, `test/fixtures/modern-canvas-mixed.html`: portable automated coverage using production test hooks.
- `test/inspect-canvas-evidence.mjs`, `test/validate-modern-evidence.mjs`: read-only inspection and optional direct replay of supplied captures, with no hard-coded external path.
- `README.md`, `dev_logs/CHANGELOG.md`, `dev_logs/manual_validation_v5.0.4.md`, this ExecPlan: behavior, validation, and limitations.
- Modern source is exported as authored. Legacy theme/full-viewport controls are intentionally not imposed on it; CDN/API use means "standalone HTML" does not guarantee network-independent rendering. No privileged grant or runtime dependency was added.

## Current completion ledger (2026-09-25 22:25 PDT)

| Status | Item |
|---|---|
| DONE | v5.0.4 implementation, strict route/source verification, modern canvas-only and mixed export cards/download dispatch, source revision/remount handling, verified-only counts/placeholders, legacy reconstruction compatibility, attachment/citation cleanup, README/changelog/notes. |
| DONE | `npm ci`, `npm test` (17/17), repository Markdown validator (three captures), userscript syntax check, and `git diff --check`. Test-only `jsdom` remains the sole declared dependency. |
| BLOCKED | Direct replay against the separately supplied September expanded DOM + standalone dashboard: those Desktop paths returned `ENOENT` after their evidence had been inspected. `test/validate-modern-evidence.mjs` is ready when restored. |
| BLOCKED | Authenticated Chrome Beta and Firefox hands-on export/render/performance checks: neither was available to the control session; the supplied public share showed an empty signed-out shell. Exact matrix and next steps are in `dev_logs/manual_validation_v5.0.4.md`. |

The release's live-browser done criterion is therefore **not claimed passed**. The smallest next step is to restore/re-attach the two Desktop HTML captures and open the v5.0.4 userscript in an authenticated Chrome Beta or Firefox AI Mode thread for the recorded manual matrix.
