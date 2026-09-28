# v5.0.5 Inline and Side Canvas Export Repair

This ExecPlan follows `.agent/PLANS.md`. It is an implementation record, not a claim that live browser validation has passed.

## Purpose and observable result

Restore export of traditional inline AI Mode interactive widgets without regressing v5.0.4 side Canvas HTML or legacy WidgetHelpers canvases. An inline widget counts and appears in the appropriate conversation segment only when its actual HTML/CSS/JS has been captured; unsupported or inaccessible frames must remain visibly unexportable rather than producing a fake HTML download. Two inline widgets in the supplied three-segment flight thread should produce two distinct HTML files and ordered Markdown references. Ordinary Search and empty AI Mode remain inactive.

## Evidence examined and current behavior

- Read `AGENTS.md`, `.agent/PLANS.md`, v5.0.4 userscript, test harness, README, changelog, and v5.0.4 ExecPlan. Preserve all existing uncommitted work and six supplied Desktop files.
- Two supplied DOM saves each contain three `.CKgc1d` turns and two `.MngkG > .tgEq3b > iframe.lQ27pc` widgets. Neither contains `TgQPHd`, `[data-xid="mnldjf"]`, a source `srcdoc`, or authored code in the top-level DOM. Their HARs contain only 2 and 9 requests, respectively, none with widget response bodies. The supplied Markdown and Chrome accessibility snapshot report three segments but zero canvases. Both screenshots show functioning inline widgets.
- Read-only inspection of the signed-in Chrome tab confirmed two matching iframes and zero side-panel source nodes. The first cross-origin shim frame contains a nested iframe; its current blob document contains a complete HTML page (~58 KB) with two sandbox scripts, an authored 22 KB React module, 20 KB CSS, external widgetlibs/fonts, and interactive controls. The second blob document is ~67 KB with the same structure. This source is not in the Google parent DOM.
- v5.0.4 `extractWidgetHTMLFromComment` recognizes only `TgQPHd`/WidgetHelpers; `extractModernCanvasHTML` recognizes only the hidden right-panel source; `registerCanvasIframe` returns null otherwise. This exactly explains badge 0 and no HTML cards despite visible inline iframes. The Markdown response cleanup also leaves Google's “AI-generated. Don't enter sensitive personal info.” notice and emits `##` headings inside list items.
- Official Google Search Help distinguishes AI Mode interactive visuals from right-hand Canvas projects. MDN documents the same-origin boundary and blob-origin behavior. Tampermonkey documents iframe matching; Chrome documents origin-fallback injection for blob frames, which may vary by manager/browser. Do not attempt cross-origin DOM access from the Google page or network scraping.

## Implementation strategy

1. Add a narrowly scoped same-userscript frame mode for `*.scf.usercontent.goog/search-sandbox/shim.html` and blob documents when the userscript manager supports them. Keep `@grant none`; use `@run-at document-start` so a shim can observe its own generated HTML Blob before navigation, and a blob document can serialize its own DOM as a fallback. No network requests or persistence.
2. Bridge source locally with `postMessage`: top Google frame sends a random challenge (plus a non-sensitive hashed route tag) only to observed inline `iframe.lQ27pc` and its indexed nested `WindowProxy`. A blob widget may answer Google directly; the outer sandbox may also verify and relay the response. The Google listener accepts only the expected outer or nested WindowProxy, a verified `scf.usercontent.goog` source origin, the current challenge/route, a matching inline element, and structurally valid HTML. Reject oversized, stale, unknown, or off-route messages. Do not trust arbitrary `message` events.
3. Store a route-scoped inline record keyed by its iframe and content fingerprint; avoid title/length deduplication that would collapse two distinct widgets. Sanitize only Google sandbox transport code/CSP and preserve authored module/style/CDNs. Derive a meaningful fallback title from nearby segment text when the widget's own title is generic. Handle detached/remounted frames during hydration; preserve cached snapshots but not stale registry across routes.
4. Include verified inline records in FAB count, panel cards, batch export, and ordered Markdown placeholders. Reconcile and refresh the open panel when a frame source arrives. Keep side modern source and legacy WidgetHelpers paths unchanged in behavior.
5. Remove the AI-generated warning from Markdown and prevent block heading syntax inside list items for this evidenced DOM shape without flattening legitimate nested lists.
6. Add portable fixture tests for the supplied top-level DOM shape, cross-origin bridge validation using simulated messages, two distinct inline records, canvas-only/mixed routes, output sanitization/interactions, off-target gating, side modern and legacy regressions, and relevant lifecycle/observer behavior.
7. Update README, changelog, browser-validation notes, and this plan with actual results. Attempt Chrome Beta live validation after the updated script is installed with any required action-time confirmation. Record Firefox as tested or blocked honestly.

## Proposed files

- `userscript/Google_AI_Canvas_Exporter.user.js`: v5.0.5 frame bridge, source verification/registration, panel/Markdown handling, noise cleanup.
- `test/exporter.test.mjs`, small `test/fixtures/inline-canvas-*.html` as needed: portable production-code regression tests. Avoid copying the large, private Desktop captures into Git.
- `test/validate-inline-evidence.mjs`: read-only CLI assertions against optional Desktop captures.
- `README.md`, `dev_logs/CHANGELOG.md`, `dev_logs/manual_validation_v5.0.5.md`, this plan: behavior, limitations, validation.

## Validation and done criteria

- `npm test`, `node test/validate-markdown.mjs`, direct optional evidence replay, `node --check userscript/Google_AI_Canvas_Exporter.user.js`, and `git diff --check` pass.
- The supplied DOM shape yields three segments and identifies two inline frame candidates; verified source messages register two canvases exactly once, preserve their distinct order, and export functioning HTML. Side and legacy fixture regressions stay green.
- Unknown frame content does not count as exportable. Off-target/empty routes show no UI. Route changes clear bridge state. Message spoofing and oversized HTML fail closed.
- Live Chrome Beta verifies both inline canvases, card titles, downloads, interaction, Markdown, and route behavior if the manager injects into sandbox/blob frames. If manager permissions or injection prevent that, document the exact blocker and minimal next step; never mark full success from fixtures alone. Firefox status is separate.

## Progress log

- **2026-09-27 19:43 PDT** — Created `codex/v5.0.5-inline-canvas` from the dirty v5.0.4 branch without discarding user-owned changes. Inspected both supplied DOM/HAR sets, current userscript, Chrome's live top document and nested widget documents, screenshots, and official Google/MDN/Tampermonkey/Chrome guidance. Confirmed source exists only inside cross-origin sandbox/blob frame in this case; plan targets a source bridge, not an iframe-counting shortcut.
- **2026-09-27 20:03 PDT** — Implemented frame-mode matching, a tab-local nonce/origin/route/WindowProxy-checked source bridge, inline source validation, sanitized HTML output, route-scoped canvas identities, late panel updates, bounded probe attempts, and an explicit warning for visible but uncaptured inline previews. Fixed late canvas discovery changing snapshot IDs, inline AI-generated notice retention, and list-card `- ##` formatting. Preserved right-hand and legacy export functions.
- **2026-09-27 20:08 PDT** — Verified from the HTML Standard/MDN that a cross-origin parent may address a nested frame's indexed `WindowProxy` for `postMessage` without reading its DOM. Added a direct inner-frame probe and retained the outer-frame relay fallback; the wire probe contains only a random nonce and hashed route tag. This reduces the injection requirement to the authored blob frame. Added a direct-frame source/spoof fixture test.
- **2026-09-27 20:09 PDT** — Reinstalled locked test dependencies with `npm ci` (0 vulnerabilities) and reran `npm test`: 22/22 pass. The existing Markdown fixture validator, syntax check, saved-capture replay, and whitespace check also pass. Live browser export still awaits manual userscript-manager installation because extension-management navigation is blocked by the browser-control surface.
- **2026-09-27 20:03 PDT** — Added two small inline fixtures, source-message/canvas-only/mixed/remount/spoof/Markdown tests, and a read-only replay script. `npm test`: 21/21 pass. `node test/validate-markdown.mjs`: all three repository fixture validations pass. Both supplied Desktop HTML captures replay as three segments and two inline iframes with no parent source. `node --check` and `git diff --check` pass. README, changelog, and browser matrix updated.
- **2026-09-27 20:03 PDT** — Live Chrome read-only inspection confirmed an authored module/style/CDN page inside each nested blob frame and v5.0.4's zero-canvas state. The user approved v5.0.5 installation, but browser control refused extension-management URLs and forbade alternate access. Requested manual installation/reload; Chrome v5.0.5 and Firefox live export remain unverified pending that external step.

## Decision and residual risk

- The strict top-page gate remains unchanged. Inline HTML is never inferred from a visible frame; a challenge response is required. Only the expected iframe and origin can satisfy that challenge, and its source must be a complete HTML document with an authored module.
- The supplied inline widgets import `widgetlibs.static.usercontent.goog`; preserving those authored dependencies is more faithful than attempting an unverified offline bundle. A standalone HTML file may still need network access and permissive CDN CORS to run.
- Userscript managers differ in whether they inject on nested `blob:` documents, especially on Manifest V3. A failed injection produces the explicit panel warning and no fake canvas file. Full release completion remains pending actual Chrome/Firefox installation, downloads, and interaction checks; fixture success is not a substitute.
