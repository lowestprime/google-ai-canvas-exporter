# v5.0.3 Chrome and Firefox Manual Validation

Date: 2026-07-05 (America/Los_Angeles)

## Status

Deterministic automated fixtures and the local in-app Chromium smoke pass. Live authenticated Chrome/Tampermonkey and Firefox/Violentmonkey or Greasemonkey validation is blocked because those signed-in userscript-manager sessions are not available in this workspace; no live Google or Firefox result is claimed.

## Deterministic evidence

- Both existing saved real pages export exactly five ordered prompts and five response bodies.
- The Formal Classification SingleFile exports two ordered prompts, two text responses, one registered canvas named `Stability Physics: Splay Angle Simulator`, a canvas placeholder between the short introduction and `The Mechanics of Stability`, and four filtered references.
- The full raw preview exceeds 3,000 characters, ends with the final reference rather than a truncation boundary, and has the same character count reported by the panel. The rendered preview includes the second response and canvas title.
- Ordinary Search and empty `udm=50` fixtures create no FAB, panel, styles, export action, or target state.
- Existing virtualized caching/hydration, route teardown, observer coalescing, FAB state, citation/Markdown, and canvas reconstruction regressions remain covered.

Final command results:

| Command | Result |
|---|---|
| `npm ci` | PASS — 39 packages installed, 0 vulnerabilities; `jsdom` remains test-only. |
| `npm test` | PASS — 11/11 tests. |
| `node test/validate-markdown.mjs` | PASS — both five-turn fixtures plus Formal Classification. |
| `node --check userscript/Google_AI_Canvas_Exporter.user.js` | PASS. |
| `node --check test/browser-fixture-server.mjs` | PASS. |
| `git diff --check` | PASS; Git reports only an informational CRLF-to-LF warning for the pre-existing Greasy Fork history file. |

## In-app Chromium fixture smoke

PASS — `npm run test:browser-server` served three deterministic documents to the app's Chromium browser.

- `/search?q=ordinary`: zero FABs, overlays, or exporter style elements; production test internals were not exposed.
- `/search?udm=50`: zero FABs, overlays, or exporter style elements.
- `/search?udm=50&q=Formal+Classification+of+Fine+Hardwood+Furniture&fixture=formal`: exactly one FAB, badge `1`, green dot on, and accessible label `Export 2 conversation segments and 1 canvas`.
- Opening the panel completed hydration with `2 segments`, `2 prompts · 2 text responses · 1 canvas`, and a `6,953 characters` full-preview status in the final run.
- The final-run raw Markdown was 6,953 characters, included the second prompt, exact canvas title, `The Mechanics of Stability`, and ended with `[4] [youtube](https://www.youtube.com/watch?v=fBTFTU30gmo&t=68)`. The exact character count is recomputed from current title/source/timestamp metadata and displayed from the same full string held by the raw pane.
- The rendered preview included the canvas title and later mechanics response and contained no executable `<script>` element.
- At the default 1280-pixel viewport, computed preview columns were `495.8px 495.8px`. At a 700-pixel viewport, the media query produced one `588.35px` column while both panes remained present. The temporary viewport override was reset.
- The fixture-page console contained zero warnings or errors.

The saved SingleFile contains archived Google scripts plus stale v5.0.2 exporter UI. The fixture server disables archived scripts and removes only stale UI from the served response before injecting v5.0.3; the repository evidence file is not modified. This browser smoke verifies production runtime UI against the saved DOM but does not replace authenticated live-service or Firefox validation.

## Required live matrix

Run every row in both current Chrome (Tampermonkey) and current Firefox (Violentmonkey/Greasemonkey) with v5.0.3 installed.

| Case | Chrome | Firefox | Required observation |
|---|---|---|---|
| Ordinary `https://www.google.com/search?q=canvas+exporter` | BLOCKED | BLOCKED | No FAB, badge, panel, styles, export action, or persistent target observer. |
| Empty `https://www.google.com/search?udm=50` | BLOCKED | BLOCKED | No FAB, green dot, or phantom segment. |
| Formal Classification or equivalent mixed thread | BLOCKED | BLOCKED | FAB appears after evidence; label reports 2 segments and 1 canvas; badge is `1`; green dot is on. |
| Open panel near thread bottom | BLOCKED | BLOCKED | Hydration starts automatically, finds older/classic and mixed segments, updates progress/counts, and restores scroll. |
| Full preview | BLOCKED | BLOCKED | Raw and rendered panes are side-by-side on desktop, one-column on narrow viewports, untruncated, and include the later prompt/response/canvas. |
| Markdown download | BLOCKED | BLOCKED | Two prompts/responses are ordered; canvas placeholder is correctly placed; references are compact; Google UI/source-card/legal noise is absent. |
| Thread → AI home → ordinary Search → another thread | BLOCKED | BLOCKED | FAB/panel/dot/cache/registry tear down and rebuild without stale state. |
| Combined conversation/canvas download | BLOCKED | BLOCKED | Markdown and selected canvas HTML both download; badge/counts remain accurate. |
| Open exported canvas HTML | BLOCKED | BLOCKED | Interaction, layout, fonts, theme, viewport, and console match the live canvas; no Ghost UI or CSP failure. |
| Streaming and repeated scrolling | BLOCKED | BLOCKED | Page remains responsive; no repeated userscript exceptions or page-unresponsive dialog. |

## Exact live completion steps

1. Install `userscript/Google_AI_Canvas_Exporter.user.js` v5.0.3 in Chrome and Firefox userscript managers.
2. Sign into the same Google account with AI Mode history and open the Formal Classification mixed-content thread, or a thread with the same two-prompt/text-canvas-text structure.
3. Execute the matrix without a full reload during the SPA-navigation row.
4. Save one Markdown and one canvas HTML export per browser. Confirm the Markdown includes the second prompt, stability canvas placeholder, `The Mechanics of Stability`, and final references; open the HTML offline and exercise the simulator.
5. Record browser/userscript-manager versions, pass/fail per row, segment/prompt/response/canvas counts, restored scroll position, console errors, filenames, and any new selector evidence in this file.
