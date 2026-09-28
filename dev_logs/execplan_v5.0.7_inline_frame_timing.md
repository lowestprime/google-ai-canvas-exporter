# v5.0.7 inline sandbox injection timing and diagnostics

## Purpose and observable result

The signed-in Chrome Beta flight-delay thread renders two inline widgets, but v5.0.6 still reports zero exportable canvases after installation and reload. v5.0.7 narrows the userscript's frame match to Google's HTTPS shim, removes a regex `@include` that Tampermonkey documents can inject into every frame in Dynamic mode, and provides source-free top-page diagnostics. The intended result is two verified inline HTML exports and two ordered Markdown markers without changing side or legacy Canvas behavior. This result remains **unverified live** until the browser matrix passes.

## Evidence, current behavior, and cause boundary

- Reviewed `AGENTS.md`, `.agent/PLANS.md`, the production userscript, tests, README, changelog, all three supplied saved flight-thread HTML captures, the latest HAR and Markdown, screenshots, and the signed-in live Chrome Beta thread.
- The live v5.0.6 panel showed three segments, zero canvases, and two uncaptured previews. Its top-page log showed only `[GCE] v5.0.6 active on www.google.com`. Read-only inspection found the outer blob, nested HTTPS shim URL, and loaded inner authored module. The captures have no top-page authored source; the HAR contains the HTTPS shim transport code, not the Blob body.
- Google delivers the inner HTML to its HTTPS shim as a `body`/`mimeType` message before navigating to a Blob URL. v5.0.6 can capture it only if Tampermonkey executes the userscript in that short-lived shim before the message. A missing frame injection or delayed injection is **plausible but not proved**; null-source rejection and structural validation are also possible. The prior tab-level logging could not distinguish these cases.
- Tampermonkey's official documentation says its default Chrome Content Script API mode has no guaranteed true `document-start`; UserScripts API Dynamic does. It also warns that a regex `@include` may inject into every frame in Dynamic mode. Chrome's content-script documentation requires extension-level origin fallback for reliable Blob injections; the userscript cannot force that. These are constraints, not a reason to bypass site isolation or cross-origin access.

## Implementation and compatibility

1. Keep the existing route-scoped, origin-checked source bridge and fail-closed registry. Remove only the Blob regex `@include`; retain HTTPS shim `@match`, `@grant none`, and `@run-at document-start`. The bridge's Blob branch can still run in managers that independently provide a related-frame injection, but v5.0.7 does not claim Blob matching.
2. On frame startup, send a source-free `bridge-ready` diagnostic to Google top. Top logs a source-free `preload` arrival (length and source-present/null only). This separates no frame execution, no source handoff, and a rejected source without logging the conversation or widget code.
3. Update metadata/version, regression tests, README, changelog, ExecPlan, and manual matrix. Do not change the side Canvas and WidgetHelpers reconstruction pipelines or existing user evidence.
4. Ask the user for the actual Tampermonkey Content Script API mode. Because browser-control refused extension-management access, the user must perform any manager configuration or update. Do not silently change the global mode for their other scripts. If the user elects to use Dynamic, install the narrower v5.0.7 metadata first, then reload and inspect diagnostics.

## Validation and done criteria

- `npm test`, `node test/validate-markdown.mjs`, `node test/validate-inline-evidence.mjs` against all three Desktop HTML captures, syntax check, and `git diff --check` must pass.
- Chrome Beta must show at least two `bridge-ready` signals from the nested shims, two accepted source records, two HTML cards, correct FAB count, two local HTML downloads that execute, and ordered Markdown markers. A source-free diagnostic alone is not success.
- Repeat ordinary Search, AI Mode home, canvas-only inline, right-hand Canvas, legacy WidgetHelpers, route changes, and responsiveness in Chrome Beta. Repeat independently in Firefox. Record pass/fail/blocked, never infer success from fixtures or a toolbar match.
- No evidence files, grants, secrets, external conversation persistence, or broad all-frame injection may be added. If manager injection still fails, preserve fail-closed behavior and report the exact browser/manager blocker and manual next step.

## Progress log

- **2026-09-27 21:37 PDT** — User confirmed v5.0.6 installed/reloaded. Live Chrome Beta still showed zero of two inline canvases. Frame DOM inspection confirmed the widget module exists behind nested cross-origin sandboxes. Corrected the browser matrix and changelog rather than calling the fixture pass a release success.
- **2026-09-27 21:46 PDT** — Removed regex Blob `@include` so Dynamic mode will not inherit Tampermonkey's documented all-frame regex behavior. Added source-free bridge-ready/preload diagnostics and metadata regression assertion. `npm test` passes 28/28. Asked for the current Tampermonkey Content Script API setting; live v5.0.7 validation is pending user installation/configuration.
- **2026-09-27 22:06 PDT** — User confirmed Tampermonkey `UserScripts API` mode and provided a v5.0.7 panel screenshot plus two distinct downloaded HTML files. The live thread now registers two inline canvases and its Markdown contains two associated markers; Dynamic mode was not required for this observation. Both canvas labels/filenames were incorrectly derived from Google's `AI Mode replied:` wrapper, and opened-file interaction was not observed. The focused v5.0.8 follow-up is documented in `execplan_v5.0.8_inline_canvas_names.md`.
