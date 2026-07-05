# v5.0.2 Chrome and Firefox Manual Validation

Date: 2026-07-02 (America/Los_Angeles)

## Status

Live authenticated Google AI Mode validation is **blocked by environment**: the in-app browser had no open user tabs or authenticated Google session, and this workspace does not expose a Firefox userscript-manager session. No live Chrome or Firefox result is claimed.

Automated fixture coverage is complete and passes in the local Node/jsdom harness. A Chromium fixture smoke check, if available in the current app session, is recorded below separately; it does not substitute for Tampermonkey/Greasemonkey validation against Google's live DOM.

## In-app Chromium fixture smoke — PASS

The production userscript was loaded by `test/browser-fixture-server.mjs` in the app's Chromium browser against three real browser documents:

- `/search?q=ordinary`: zero FABs, overlays, and injected style elements; `window.__GCE_TEST_API__` was undefined.
- `/search?udm=50`: zero FABs, overlays, and injected style elements.
- `/search?udm=50&q=fixture`: one FAB, badge `1`, green dot on, and accessible label `Export 1 conversation turn and 0 canvases`.
- Clicking the unique FAB opened the v5.0.2 panel. Hydration reached `Hydration complete: 1 turn ready.`; the preview contained both independently mapped citation URLs and `### References`, excluded `Copied`, `Copy Edit`, and `Privacy Policy`, and the browser console contained no warnings or errors.

This proves the runtime UI gate and panel flow in Chromium against deterministic fixtures. It does not prove selector stability, virtualization timing, download permissions, or canvas behavior on the authenticated live Google service, and it is not a Firefox run.

## Automated evidence completed

- Both saved real-page fixtures return exactly five ordered `.CKgc1d` snapshots, five prompts, and five response bodies.
- Synthetic virtualization replacement retains detached turns once and clears them on route reset.
- Simulated scroll hydration finds both virtualized turns and restores the saved scroll position.
- Ordinary Search, empty `udm=50`, and empty AI home containing stale turn DOM remain inactive.
- Golden Markdown validates role headings, paragraphs, hard breaks, nested lists, fenced/inline code, blockquotes, tables, UUID citations, one references block, YAML quoting, and noise exclusion.
- FAB state validates conversation-only, canvas-only, combined, empty, and route-reset cases.
- Canvas reconstruction validates WidgetHelpers APIs, helper/logic ordering, CDN and fallback fonts, CSP/sandbox/Ghost UI removal, theme flags, and the absolute zero-width full-viewport resize target.
- Observer instrumentation validates irrelevant-mutation rejection, relevant-burst coalescing, and changed-turn-only reconversion.

## Required live matrix

Run every row in both current Chrome (Tampermonkey) and current Firefox (Violentmonkey/Greasemonkey) with v5.0.2 installed.

| Case | Chrome | Firefox | Required observation |
|---|---|---|---|
| Ordinary `https://www.google.com/search?q=canvas+exporter` | BLOCKED | BLOCKED | No FAB, badge, panel, styles, export action, or persistent target observer. |
| Empty `https://www.google.com/search?udm=50` | BLOCKED | BLOCKED | No FAB, green dot, or phantom turn. |
| Multi-turn sidebar thread | BLOCKED | BLOCKED | FAB appears only after a complete prompt/response; badge and accessible label match current route. |
| Open panel near thread bottom | BLOCKED | BLOCKED | Hydration starts automatically, finds older turns, updates progress/count, and restores scroll. |
| Markdown download | BLOCKED | BLOCKED | All turns are ordered; prompts appear once; formatting/citations/references match; Google UI noise is absent; filename/frontmatter are correct. |
| Thread → AI home → ordinary Search → another thread | BLOCKED | BLOCKED | FAB/panel/dot/cache/registry tear down and rebuild without stale state. |
| Conversation with one or more canvases | BLOCKED | BLOCKED | Badge uses canvas count, dot indicates conversation, and combined/batch downloads work. |
| Open exported HTML | BLOCKED | BLOCKED | Interaction, layout, fonts, theme, viewport, and console match the live canvas; no Ghost UI or CSP failure. |
| Streaming and repeated scrolling | BLOCKED | BLOCKED | Page remains responsive; no repeated userscript exceptions or page-unresponsive dialog. |

## Exact completion steps

1. Install `userscript/Google_AI_Canvas_Exporter.user.js` v5.0.2 in Chrome and Firefox userscript managers.
2. Sign into the same Google account with AI Mode conversation history and at least one canvas-producing thread.
3. Execute the matrix above without reloading between the SPA-navigation row's transitions.
4. Save one Markdown export and one canvas HTML export per browser; compare Markdown to `test/fixtures/conversation-formatting.golden.md` structurally and inspect each HTML export offline.
5. Record browser/user-script-manager versions, pass/fail per row, turn/canvas counts, console errors, downloaded filenames, and any new DOM selector evidence here.
