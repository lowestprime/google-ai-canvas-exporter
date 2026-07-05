# Google AI Canvas Exporter v5.0.3 — Mixed-Content Export Repair

This ExecPlan follows `.agent/PLANS.md`. Keep it current through implementation, fixture validation, browser smoke testing, documentation, and the final completion audit.

## Purpose

Repair mixed-content Google AI Mode threads where later prompts, text responses, canvases, and citations are rendered outside the first `.CKgc1d`. v5.0.3 must export every conversation segment in DOM order, place canvas placeholders at the correct point in Markdown, show the full raw Markdown plus a safe rendered side-by-side preview, preserve all v4/v5.0.2 canvas HTML behavior, and remain fail-closed on ordinary Search and empty AI Mode home.

Observable success for the Formal Classification fixture:

- Two prompts are exported in order: the initial furniture-classification request and `simulate the physics of splayed legs vs straight legs for stability`.
- The first furniture-classification answer and the later stability-mechanics answer are both present.
- `Stability Physics: Splay Angle Simulator` is registered as a canvas and represented in Markdown at its DOM position.
- Source URLs are retained as compact references without source-card, policy, sharing, or feedback UI.
- Frontmatter no longer reports `turns: 1`.
- The export panel reports the real prompt/response/canvas composition and displays untruncated raw Markdown next to a sanitized rendered preview.

## Worktree and Safety State

- Required initial `git status --short --branch` showed a clean `main` branch.
- Required initial `git diff --stat` was empty.
- Created and switched to `codex/v5.0.3-mixed-content-export` before edits.
- `dev_artifacts/cursor_google_ai_canvas_exporter_optimization_log.md` was neither tracked nor reported deleted, so `git restore -- ...` correctly reported no matching tracked path. The similarly named existing file under `dev_logs/` remains untouched.
- No commit, push, or PR is authorized.
- Existing `dev_artifacts/`, `dev_logs/`, `screenshots/`, archive files, examples, and user-owned files will be preserved.
- No runtime dependency or privileged userscript grant will be added.

## Evidence Read

- `AGENTS.md`, `.agent/PLANS.md`, current `README.md`, `dev_logs/CHANGELOG.md`, v5.0.2 ExecPlan/manual notes, package/test configuration, and current production userscript.
- Current v5.0.2 fixture tests and both existing Fix Chrome Beta Download real-page fixtures.
- `Single_File_Export_Formal_Classification_of_Fine_Hardwood_Furniture_Google_Search_07042026_114124_AM-PST.html` (14,971,418 bytes).
- `Failed_Export_Example_Formal_Classification_of_Fine_Hardwood_Furniture_SAT_07042026_113458-AM-PDT.md`.
- Formal Classification full-page screenshot and v5.0.2 preview-panel screenshot (also supplied as attachment images).
- `codex_google_ai_mode_search_exporter_development_SUN_07052026_021930_PM-PDT_14350lines_315203tokens.md`, especially its v5.0.2 implementation/validation record.

Exact fixture counts:

| Evidence | Count |
|---|---:|
| `[data-xid="aim-mars-turn-root"]` | 1 |
| `.CKgc1d` | 1 |
| `[data-xid="VpUvz"]` | 2 |
| `[jsname="KFl8ub"].mZJni` | 1 |
| `.Eltaeb` | 1 |
| `.tonYlb` | 2 |
| `.ilZyRc.R7mRQb` | 2 |
| `.AsFDjf.Vaqf8d` | 1 |
| `[data-xid="pJN44d"]` | 1 |
| `iframe[src*="scf.usercontent.goog"], iframe.lQ27pc` | 1 |
| `.emqXtf` | 0 |
| `TgQPHd|` comments | 415 |
| WidgetHelpers-bearing `TgQPHd|` comments | 1 |

## Exact Current Root Causes

1. **`.CKgc1d` is incorrectly treated as the complete conversation unit.** `getMountedTurnElements()` returns only `.CKgc1d`; `captureMountedTurns()` and hydration therefore never visit the later `[data-xid="pJN44d"]` / `.AsFDjf.Vaqf8d` mixed-content segment.
2. **The second response is outside `.CKgc1d`.** The first answer is `[data-xid="VpUvz"][jsname="KFl8ub"].mZJni` inside the sole `.CKgc1d`. The second answer is `.Eltaeb[data-xid="VpUvz"]` under `[data-xid="pJN44d"] > .AsFDjf.Vaqf8d`; it contains no nested `.CKgc1d`.
3. **The follow-up prompt uses an unrecognized mixed-content structure.** It is `.Ax52xb` inside the first content group of `.Eltaeb`, followed by `.L6HOGc` for the date. It is not a nearby `.tonYlb` or `.ilZyRc.R7mRQb` prompt.
4. **The mixed response is internally segmented.** `.Eltaeb` contains, in DOM order: follow-up prompt/date, a short stability introduction, a canvas block, the full `The Mechanics of Stability` answer, and Google share/feedback/legal UI. Treating the whole element as prose would retain noise and put the canvas in the wrong place.
5. **Canvas registration rejects the fixture payload.** The widget comment begins `TgQPHd||[[...]]`; `extractWidgetHTMLFromComment()` blindly slices seven characters and tries to parse a leading `|`, so the one iframe is never registered. The actual widget title embedded in the payload is `Stability Physics: Splay Angle Simulator`.
6. **Source material is a sibling of `.Eltaeb`.** Corroboration/source-card anchors live under `[data-xid="aim-aside-initial-corroboration-container"]` and `.N6Axvb` within the surrounding `.AsFDjf.Vaqf8d`, not inside the prose response. Empty `data-icl-uuid` values in the saved page require an ordered source-link fallback without exporting the cards themselves.
7. **The preview is intentionally truncated and raw-only.** `previewEl.value = md.slice(0, 3000)` discards most of the first answer and all later content. The panel has only one 120px textarea and no rendered view or composition/character status.
8. **Panel counts inherit the extractor defect.** The UI labels `turnCache.size` as turns, so one cached `.CKgc1d` becomes `1 TURN` even though the page visibly contains two prompts, two text responses, and one canvas.

## Target Model and Implementation Strategy

### Conversation segments

Replace `.CKgc1d`-only enumeration with an ordered segment model:

```text
ConversationSegmentSnapshot {
  id,
  prompt,
  timestamp,
  bodyMarkdown,
  references,
  canvasTitles,
  hasTextResponse,
  order
}
```

Add clear helpers:

- `getConversationSegments()` — enumerate `.CKgc1d`, `[data-xid="pJN44d"]`, standalone `.AsFDjf.Vaqf8d`, `.Eltaeb`, and standalone response blocks in document order without nested duplicates.
- `findResponseBlocks()` — prefer deepest substantive response blocks; split mixed `.Eltaeb` direct content groups and exclude prompt, canvas-only, and Google UI groups.
- `findPromptForResponseBlock()` — support `.ilZyRc.R7mRQb`, clean `.tonYlb`, and mixed `.Ax52xb`, then nearest preceding unused prompt.
- `findCanvasBlocks()` — locate iframe/canvas containers both inside and adjacent to mixed segments.
- `associateCanvasesWithSegments()` — attach contained canvases first, then nearest segment by DOM order; retain truly unassociated canvases for a final section.
- `snapshotConversationSegment()` and `buildSegmentOrderKey()` — convert ordered text/canvas parts to detached snapshots and stable cache identities.

Keep `getCachedTurns()` and existing export interfaces as compatibility aliases where useful, but make their contents segment snapshots. Hydration and mutation discovery must call segment enumeration, so virtualization behavior remains route-scoped.

### Canvas and citations

- Make `TgQPHd` parsing tolerant of one or more separators by parsing from the first JSON bracket after `TgQPHd|`.
- Centralize iframe registration so segment snapshots can obtain the exact canvas title without duplicating registry entries.
- Insert `> [Interactive Canvas: TITLE]` between text blocks according to DOM order.
- Parse normal UUID citation records when available.
- When a saved mixed fixture has empty citation UUIDs, map inline markers to ordered, filtered source-card URLs from the surrounding segment and emit one deduplicated references block. Never convert the source cards themselves.

### Preview and counts

- Expand the panel to a desktop-width layout with a responsive single-column breakpoint.
- Replace the clipped textarea with a full raw Markdown textarea and sanitized rendered preview side-by-side.
- Add a dependency-free renderer for the exporter’s headings, paragraphs, lists, blockquotes, code fences, inline code, links, tables, horizontal rules, and reference blocks. Escape source Markdown before introducing only known-safe HTML.
- Render after hydration completes or after an explicit refresh/settings change, not from mutation callbacks.
- Show full character count, conversation-segment count, prompt count, text-response count, canvas count, and complete/partial hydration status.

### Compatibility boundary

- Do not alter `buildExportHTML()` except version metadata/test exposure required by v5.0.3.
- Preserve all six WidgetHelpers signatures, CSP/sandbox stripping, Ghost UI exclusion, CDN/font behavior, theme flags, resize target, full viewport, and staggered downloads.
- Keep broad `@match` and `@grant none`; ordinary Search and empty AI Mode home remain fail-closed.

## Proposed File Changes

- `userscript/Google_AI_Canvas_Exporter.user.js` — v5.0.3 segment extraction, mixed prompts/responses/canvas association, robust TgQPHd parsing, fallback sources, composition counts, and full raw/rendered preview.
- `dev_artifacts/Single_File_Export_Formal_Classification_of_Fine_Hardwood_Furniture_Google_Search_07042026_114124_AM-PST.html` — preserved repository-local regression evidence.
- `dev_artifacts/Failed_Export_Example_Formal_Classification_of_Fine_Hardwood_Furniture_SAT_07042026_113458-AM-PDT.md` — preserved failed-output evidence.
- `screenshots/Formal_Classification_of_Fine_Hardwood_Furniture_Google_Search_07042026_114124_AM-PST.PNG` and `screenshots/Userscript_Preview_Panel_Export_Sun_05072026_012953PM.png` — visual evidence.
- `test/exporter.test.mjs`, `test/validate-markdown.mjs`, and a Formal Classification golden Markdown fixture — production-backed mixed-content, preview, gating, virtualization, and canvas assertions.
- `test/browser-fixture-server.mjs` — serve the Formal fixture for deterministic Chromium panel smoke validation.
- `README.md`, `dev_logs/CHANGELOG.md`, `dev_logs/manual_validation_v5.0.3.md`, and this ExecPlan — release behavior, root causes, validation, and exact live-browser remainder.

## Validation Plan and Done Criteria

Automated evidence must prove:

- Formal Classification yields two prompts, two text responses, the exact stability canvas title/placeholder, the stability-mechanics answer, and clean source references.
- Formal Markdown frontmatter count is greater than one and excludes `Copied`, `Copy Edit`, `Share`, AI-mistake notices, policy/legal text, source-card clutter, and Google controls.
- Raw preview length equals the full Markdown length and exceeds 3,000 characters; rendered preview includes the second response and canvas title; preview status reports characters and canvases.
- Both existing Fix Chrome Beta Download fixtures still yield five ordered prompts/responses.
- Existing virtualization/cache, URL gating, observer, FAB, and canvas reconstruction tests remain green.
- Canvas registration succeeds for `TgQPHd||` and exported HTML preserves all compatibility assertions.

Required commands:

```text
git status --short --branch
git diff --stat
npm ci
npm test
node test/validate-markdown.mjs
node --check userscript/Google_AI_Canvas_Exporter.user.js
git diff --check
```

Run the deterministic in-app Chromium fixture smoke via `test/browser-fixture-server.mjs`. Live authenticated Chrome/Firefox rows may be marked blocked only after all fixture/static checks pass, with exact steps recorded in `dev_logs/manual_validation_v5.0.3.md`.

Release is done only when all implementation, fixture, docs, and available browser checks pass; evidence files are preserved; no runtime dependency/grant is added; and no commit, push, or PR is performed.

## Progress Log

- **2026-07-05 14:51 PDT** — Read the attached objective, confirmed a clean `main`, created `codex/v5.0.3-mixed-content-export`, and verified there was no tracked deleted artifact at the requested `dev_artifacts/...` path to restore.
- **2026-07-05 14:51 PDT** — Read both screenshots, failed Markdown, 14.9 MB SingleFile DOM, current production/tests/docs, and relevant prior thread export. Proved the exact selector counts, mixed segment hierarchy, `TgQPHd||` canvas parse failure, sibling source-card structure, and 3,000-character preview truncation documented above.
- **2026-07-05 15:34 PDT** — Implemented v5.0.3 ordered segment discovery, mixed prompt/response splitting, robust `TgQPHd|` parsing, canvas association/placeholders, ordered source fallback, route-scoped snapshot caching, accurate composition state, and the full raw/safe rendered preview. Kept `buildExportHTML()` behavior unchanged apart from version metadata/test exposure.
- **2026-07-05 15:42 PDT** — Added the Formal Classification production-backed fixture assertions and golden ordering checks. `npm test` passes 11/11, including the two saved five-turn pages, virtualized replacement/hydration, route teardown, Markdown/citations/noise, FAB semantics, observer coalescing, canvas compatibility, delayed payload discovery, and mixed content/full preview.
- **2026-07-05 15:55 PDT** — Completed deterministic in-app Chromium smoke and reran it after the final target-state audit. Ordinary Search and empty AI Mode home produced no UI. Formal Classification produced one FAB (`1` badge, green dot, `Export 2 conversation segments and 1 canvas`), 2 prompts, 2 text responses, 1 canvas, a final-run 6,953-character untruncated raw preview, later content in the rendered preview, two desktop columns/one narrow column, and no console warnings/errors. The fixture server makes archived scripts/stale v5.0.2 UI inert only in the served response; evidence remains untouched.
- **2026-07-05 16:04 PDT** — Final validation passed: `npm ci` (0 vulnerabilities), `npm test` (11/11), production-backed Markdown validator (5/5/2 segments across the three saved pages), production and fixture-server syntax checks, and `git diff --check`. SHA-256 comparisons prove all four copied evidence files match their LocalSend sources byte-for-byte; no tracked file is deleted. No commit, push, PR, runtime dependency, privileged grant, or external conversation persistence was introduced.

## Actual Result

All implementation and deterministic validation criteria pass. The Formal Classification export now contains both exchanges and the exact stability canvas in DOM order, followed by the later mechanics response and clean four-source references. The FAB and panel report current-route state rather than `.CKgc1d` wrapper count. Full raw Markdown is no longer sliced, and its safely rendered peer remains non-executable and responsive.

Live authenticated Chrome/Tampermonkey and Firefox/Violentmonkey or Greasemonkey execution remains blocked by unavailable signed-in browser sessions. `dev_logs/manual_validation_v5.0.3.md` records the exact remaining matrix without claiming those rows passed.
