# AGENTS.md — Google AI Canvas Exporter

## ExecPlans

For this repository, use `.agent/PLANS.md` for complex changes. For the Google AI Mode conversation-export repair, create and maintain `dev_logs/execplan_v5.0.2_ai_mode_export.md`.

## Project purpose

This repository contains a Greasy Fork userscript for exporting Google Search AI Mode conversations as clean Markdown and AI Mode canvas widgets as self-contained offline HTML.

The primary production file is:

- `userscript/Google_AI_Canvas_Exporter.user.js`

Important evidence and regression material lives in:

- `dev_artifacts/`
- `dev_logs/`
- `screenshots/`
- `test/`
- `userscript/archive/`
- `userscript/examples/`

Do not delete, rename, compress, or discard evidence files unless the user explicitly requests it.

## Work style

Act as a senior browser-extension/userscript engineer. Prefer root-cause fixes over superficial patches. Preserve existing working canvas HTML export behavior while fixing conversation detection, markdown formatting, badge state, and URL targeting.

Use compact, modern JavaScript. Keep the userscript dependency-free unless a new dependency is explicitly justified and accepted.

## Safety constraints

- Never add network exfiltration.
- Never persist full conversation contents to external services.
- Never require privileged userscript grants unless unavoidable.
- Prefer `@grant none` if functionality can remain equivalent.
- Treat Google DOM selectors as unstable: centralize selectors, add fallbacks, and fail closed.
- Do not freeze Google Search / AI Mode pages.
- Avoid `innerText` in hot paths; use targeted `textContent` unless layout-aware text is explicitly needed outside mutation/scroll hot paths.

## Target-page rules

The script must not inject visible UI on ordinary Google Search results pages such as:

- `https://www.google.com/search?q=*`

The script must not show a green conversation dot or `1 turn` on the AI Mode home/default page when no actual conversation thread is loaded.

The script may load on broad Google Search URL patterns for userscript-manager compatibility, but runtime behavior must be fail-closed:

- no FAB
- no badge
- no panel
- no export action
- no expensive observers

unless the current page has verified AI Mode conversation or canvas evidence.

## Expected fixes

Fix all of the following without regressing canvas export:

1. Detect and export all real AI Mode conversation turns, not only the first currently mounted DOM turn.
2. Correctly handle Google AI Mode virtualization by caching visible turn snapshots while scrolling/hydrating.
3. Make turn/canvas detection automatic on page load when possible, with minimal user interaction.
4. Ensure the FAB badge and green dot reflect true exportable state.
5. Hide/remove the FAB on off-target URLs and non-thread pages.
6. Make Markdown output match the target examples in `dev_artifacts/`.
7. Remove unwanted retained Google UI/source-card/sidebar/canvas/noise artifacts.
8. Preserve existing canvas HTML export behavior, including WidgetHelpers extraction, CSP/sandbox stripping, Ghost UI avoidance, CDN preservation, fallback fonts, dark/light mode, full viewport, and batch download.

## Validation

Before completion, run and document:

- `git diff --check`
- syntax check for `userscript/Google_AI_Canvas_Exporter.user.js`
- existing markdown validator if available
- any new fixture tests added for turn extraction/markdown output/URL gating
- manual Chrome and Firefox validation plan/results, or explicit blocker if live Google login/browser state is unavailable

Any final answer must include:

- files changed
- root causes fixed
- tests run
- manual validation status
- known limitations
- exact next manual verification steps if live Google AI Mode could not be fully exercised