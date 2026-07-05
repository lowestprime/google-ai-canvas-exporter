# Google AI Canvas Exporter v5.0.2 — AI Mode Export Repair

This ExecPlan follows `.agent/PLANS.md`. Keep it current while implementation and validation proceed.

## Purpose

Repair Google AI Mode conversation export without changing the established canvas HTML reconstruction behavior. v5.0.2 must show exporter UI only when the current Google Search route has a complete conversation turn or a successfully decoded canvas, preserve every mounted or hydratable virtualized turn, produce clean Markdown matching the repository evidence, and remove stale state during Google SPA navigation.

Observable success:

- Ordinary Google Search and the empty AI Mode home page have no FAB, badge, panel, or export action.
- The captured Chrome and Firefox fixtures each yield five ordered conversation turns rather than one wrapper root.
- Opening the export panel passively hydrates virtualized turns, updates progress, restores scroll position, and exports the cache rather than live DOM references.
- Exported Markdown contains prompts and responses only, with semantic headings/lists/tables/code, inline citations, one reference block per cited response, and no Google controls, share UI, source carousel, favicons, or canvas/sidebar noise.
- Existing canvas exports retain WidgetHelpers extraction, CSP/sandbox stripping, Ghost UI avoidance, CDN preservation, fallback fonts, light/dark flags, safe resize target, full viewport, and batch download.

## Evidence Read

- `AGENTS.md` and `.agent/PLANS.md`
- `userscript/Google_AI_Canvas_Exporter.user.js`
- `userscript/archive/Google_AI_Canvas_Exporter_V4.0.0.user.js`
- `README.md` and `dev_logs/CHANGELOG.md` (`CHANGELOG.md` at repository root is absent)
- `dev_logs/Google_AI_Canvas_Exporter_Greasy_Fork_Info_and_History_06302026.md`
- `dev_logs/cursor_google_ai_canvas_exporter_optimization_log_06302026_11.30_PM-PDT.md`
- Both failed v5.0.1 Chrome/Firefox Markdown exports
- Both V1/V2 incomplete Markdown examples
- `Fix_Chrome_Beta_Download_Location_Input_Example.html`
- `Fix_Chrome_Beta_Download_Location_Single_File_Export.html`
- Chrome and Firefox console logs
- All `screenshots/*.png`
- `test/validate-markdown.mjs`

Specific DOM evidence:

- Each real capture contains one `[data-xid="aim-mars-turn-root"]` that wraps five `.CKgc1d` turn containers.
- Each `.CKgc1d` contains one prompt region `.ilZyRc.R7mRQb` and one response body `[data-xid="VpUvz"]` / `[jsname="KFl8ub"]`.
- Google answer headings are `div.AdPoic[role="heading"]`; paragraphs are `div.n6owBd`.
- Citation markers are `.WBgIic` wrappers with `button[data-icl-uuid]`; matching source metadata is serialized in hidden `TgQPHd` comment payloads within the turn.
- `[data-xid="Gd7Hsc"]` contains share/feedback/legal UI and must not be converted.
- Source corroboration carousels are siblings of the response body, not response prose.

## Current Behavior and Root Causes

1. **Only the first turn is extracted.** `extractConversationTurns()` branches on the existence of any turn root, then calls `root.querySelector('.CKgc1d')`. The single wrapper root causes only the first of five `.CKgc1d` children to be used and prevents the sibling fallback.
2. **Prompt and response selectors are conflated.** `[data-xid="VpUvz"]` is an AI response body but is also used as a prompt fallback.
3. **Badge and green dot are stale.** `getCheapTurnCount()` counts wrapper roots; global counts and canvas registry are not scoped or reset on route changes; `udm=50` alone classifies empty AI Mode home as active.
4. **FAB is injected off target.** `ensureFAB()` runs unconditionally at initialization under broad Google Search matches, and no teardown removes it.
5. **Markdown converts the wrong root.** Passing `.CKgc1d` includes prompt controls, timestamps, source cards, share dialogs, feedback controls, and policy links. The converter does not understand Google role headings or paragraph divs and retains empty sentinel list items.
6. **Citations are sourced from noise.** The converter ignores `data-icl-uuid`/`TgQPHd` source records and instead sees unrelated source-card/share links.
7. **Observer work is still broad.** `MutationObserver(scan)` runs a full iframe query after every page mutation.
8. **Tests are non-portable and certify failure.** The validator hard-codes a Desktop path, imports undeclared `jsdom`, duplicates production algorithms, accepts `turns >= 1`, and has no gating, route, virtualization, observer, or canvas assertions.

The Chrome/Firefox logs contain no GCE exception beyond activation; these are deterministic selector/lifecycle defects. The screenshots confirm the empty-home FAB, false green dot/`1` badge, one-turn panel warning, and prior page freeze.

## Target Behavior and Design

### Runtime lifecycle

- Keep broad `@match` and `@grant none`, but treat `udm=50` only as a candidate route.
- Compute a semantic route key from active sidebar `data-thread-id`, then `mstk`/`mtid`, then `udm` plus `q`.
- A verified target requires a complete turn snapshot or successfully decoded WidgetHelpers canvas.
- Create the FAB lazily. Remove FAB, overlay, timers, hydration, snapshots, and canvas registry when the semantic route changes or verified state disappears.
- Watch `pushState`, `replaceState`, `popstate`, and a low-cost location-string fallback.

### Safe observation

- Centralize selectors.
- Mutation callbacks inspect only added nodes for conversation/canvas probes and coalesce relevant work into a debounced idle task.
- Never perform Markdown conversion, broad text extraction, forced animation reflow, or document-wide canvas scans directly in a mutation callback.
- Use passive debounced scrolling only while a verified thread is active.
- Use a bounded discovery observer on ordinary Search and a route-scoped host observer on AI Mode candidates.

### Turn snapshots and hydration

- Treat `.CKgc1d` as the canonical turn container.
- Extract prompt from the prompt heading content, then copy-button `aria-label`, then legacy `.tonYlb`.
- Extract response only from `[data-xid="VpUvz"]` / `[jsname="KFl8ub"]`.
- Prefer available stable attributes for IDs and otherwise hash normalized prompt, response prefix, and timestamp.
- Cache detached Markdown/reference snapshots during idle time so unmounted DOM is not required later.
- Before conversation export, save scroll state, scroll top-to-bottom in 75% viewport steps, wait for mutation quiet, capture each mounted batch, stop after two stable bottom passes or 30 seconds/200 steps, then restore scroll.
- Show hydration progress in the panel and clearly report partial status if the safety cap is reached.

### Markdown and citations

- Convert only the response clone and remove share/feedback UI, corroboration/source-aside containers, forms/nav/buttons/SVG/images, canvases, sidebars, and iframes.
- Parse hidden `TgQPHd` JSON for each citation UUID, reject image/internal asset URLs, prefer article URLs, preserve source order, and render inline `[n](URL)` tokens.
- Emit one deduplicated `### References` block per cited response.
- Convert Google role headings to level two, paragraph divs to paragraphs, nested lists with indentation, tables with escaped cells, code/blockquote/hr/hard breaks correctly, and skip empty list sentinels.
- Quote YAML string fields and use the hydrated turn count/version 5.0.2.

### Canvas compatibility

- Keep `buildExportHTML()` behavior intact except version metadata and conditional test exposure.
- Scope canvas registry to the route.
- Add explicit regression tests before accepting the change.

## Implementation Milestones

1. Create branch and ExecPlan.
2. Refactor userscript state, selectors, target gate, route watcher, and safe observer.
3. Add turn extraction, citation parsing, snapshot cache, hydration, Markdown converter, and panel progress.
4. Add conditional test API without exposing production globals by default.
5. Add package manifest/lock and repository-relative real/synthetic fixture tests.
6. Update README, changelog, and Chrome/Firefox manual-validation record.
7. Run all automated/static checks, perform available browser validation, fix failures, and record actual outcomes here.

## Validation Plan

Automated cases:

- Ordinary Search and empty AI Mode home remain inactive.
- Both saved real fixtures return exactly five ordered turns.
- One wrapper containing five `.CKgc1d` nodes still returns five turns.
- Sequential DOM replacement preserves virtualized turn snapshots and clears them on route change.
- Golden Markdown covers role headings, paragraphs, hard breaks, nested lists, tables, code, blockquotes, citations, references, and all identified noise exclusions.
- FAB state is correct for conversation-only, canvas-only, combined, empty, and route-transition cases.
- Canvas output preserves WidgetHelpers/logic/CDN/CSP/Ghost UI/font/theme/resize invariants.
- Irrelevant mutation bursts do not cause repeated full scans or conversion.

Required commands:

```text
npm ci
npm test
node test/validate-markdown.mjs
node --check userscript/Google_AI_Canvas_Exporter.user.js
git diff --check
```

Manual Chrome and Firefox cases are recorded in `dev_logs/manual_validation_v5.0.2.md`: ordinary Search, empty AI home, multi-turn hydration, Markdown inspection, SPA route transitions, mixed conversation/canvas batch export, offline canvas rendering, and responsiveness/console health. If authenticated Google state is unavailable, record the exact blocker and remaining steps rather than claiming a pass.

## Compatibility and Rollback

- No production dependency or privileged grant is added.
- Conversation contents remain only in memory and downloaded files; no external persistence or network exfiltration is introduced.
- The broad userscript matches remain for manager compatibility, but visible behavior fails closed.
- Rollback is a single-file userscript revert plus removal of test/documentation additions; evidence artifacts remain untouched.

## Progress Log

- **2026-07-02 00:25 PDT** — Created `codex/v5.0.2-ai-mode-export`. Reconfirmed the pre-existing deleted artifact and untracked `.agent/`/`AGENTS.md`; these remain user-owned and out of scope.
- **2026-07-02 00:25 PDT** — Created this ExecPlan as the first tracked work item. Implementation started; no blocker requires user input.
- **2026-07-02 00:34 PDT** — Replaced wrapper-root extraction with `.CKgc1d` snapshots, strict prompt/response separation, per-route caches, semantic route teardown, fail-closed UI reconciliation, added-node observation, and bounded hydration with abort/scroll restoration.
- **2026-07-02 00:37 PDT** — Reworked Markdown conversion around response-only clones and per-turn UUID/TgQPHd citation maps. Added Google role headings/paragraphs, nested list/table/code/blockquote/hard-break handling, YAML quoting, and the identified UI/noise removals.
- **2026-07-02 00:40 PDT** — Added locked `jsdom` test tooling and a conditional production test API. Both real saved pages now return exactly five prompts, responses, and snapshots. Added golden Markdown, virtualized replacement, simulated hydration, route/FAB, observer, and canvas compatibility fixtures.
- **2026-07-02 00:43 PDT** — Self-review found streaming in-turn mutations and redundant conversion as a remaining edge. The observer now schedules changed enclosing turns, and response fingerprints prevent reconverting unchanged snapshots during scroll/mutation bursts.
- **2026-07-02 00:46 PDT** — In-app Chromium fixture smoke passed: ordinary Search and empty AI home injected no UI/styles; the complete-turn fixture produced the correct FAB/dot/label, completed panel hydration, produced a clean cited preview, and logged no warnings/errors. No authenticated Chrome or Firefox user tab was available, so live-service matrix rows remain explicitly blocked in `manual_validation_v5.0.2.md`.
- **2026-07-02 00:54 PDT** — Final review corrected citation-record scoping so UUIDs collect only their own smallest serialized record, rejected internal Google-origin records, added delayed-comment canvas retry and character-data streaming coverage, and confirmed test internals are absent in production mode. Re-ran the complete required command set and the latest-script Chromium smoke; all available checks pass.

## Actual Validation Results

- `npm ci` — PASS; 39 packages installed, 0 vulnerabilities. Dependencies are test-only.
- `npm test` — PASS; 10/10 tests covering strict gates, five-turn wrapper extraction, semantic route transitions, route-scoped virtualized caching, scroll hydration/restoration, golden Markdown/citations/YAML, FAB semantics, delayed canvas metadata, canvas reconstruction, and observer coalescing/stream updates.
- `node test/validate-markdown.mjs` — PASS; both repository real-page fixtures returned exactly five ordered complete turns and clean Markdown.
- `node --check userscript/Google_AI_Canvas_Exporter.user.js` — PASS.
- In-app Chromium deterministic fixture smoke — PASS as described above.
- Live authenticated Chrome AI Mode matrix — BLOCKED by unavailable authenticated browser state.
- Live Firefox userscript matrix — BLOCKED because no Firefox userscript-manager session is exposed in this environment.
- `git diff --check` — PASS after final documentation and test updates.
