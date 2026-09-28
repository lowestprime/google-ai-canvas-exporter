# v5.0.5 inline and side Canvas browser validation

Status as of 2026-09-27 PDT: v5.0.5 **failed live Chrome Beta inline-canvas validation**. Firefox remains untested. This is a historical record; use `manual_validation_v5.0.6.md` for the next release's checklist.

## Evidence actually observed

- In the user's signed-in Chrome Beta flight-delay thread, v5.0.4 showed three conversation segments and zero canvases even though two inline widgets visibly rendered. The parent DOM has two `.MngkG > .tgEq3b > iframe.lQ27pc` elements, no `TgQPHd` payload, and no `[data-xid="mnldjf"]` side source.
- Read-only browser inspection reached the first iframe's nested blob document. It has a complete HTML page, authored React module (~22 KB), CSS (~20 KB), widgetlibs CDN imports, and interactive controls. The second blob document has the same structural source path. Its exact bytes were not copied into the repository.
- Both supplied Desktop HTML captures were replayed with `node test/validate-inline-evidence.mjs`: each has three segments, two inline frame candidates, and zero top-level HTML sources. The supplied HARs do not contain widget response bodies. The existing Markdown files show three turns and zero canvases, as expected from v5.0.4.
- The repository's 22 automated tests pass, including two distinct inline sources, direct nested-frame handling, canvas-only and mixed mode, a late-arriving source updating the open panel, virtualized iframe remount deduplication, message-spoof rejection, sanitized HTML, and right-hand/legacy canvas regressions.
- Chrome Beta's browser-control surface refused extension-management pages and explicitly forbade an alternate route to the same action. The user approved installation, but the extension could not be changed by this agent through that surface. A manual installation/reload was requested; that request is not evidence of success.
- The user then installed v5.0.5 in Tampermonkey Beta v5.6.6239 and supplied a live panel screenshot. The thread exported three conversation segments but **zero canvases**, with the warning `2 inline canvas previews could not yet be captured`. The Tampermonkey screenshot confirms the script is enabled and its match/include metadata is present, but does not establish execution in the nested blob frame. This invalidates any implied Chrome success from the earlier fixture tests.
- A third saved HTML capture and 187-request HAR confirm that Google's HTTPS nested shim receives `body`/`mimeType`, constructs an HTML Blob, then calls `location.replace`. The original HTML can therefore be captured earlier by a script running in the nested HTTPS shim. v5.0.5 also rejects an initially empty React `#root` because it requires 30 body-text characters before the module runs.

## Chrome Beta and Firefox matrix

| Case | Expected v5.0.5 result | Chrome Beta | Firefox |
|---|---|---|---|
| Ordinary `/search?q=…`, then empty `/search?udm=50` | No FAB, badge, panel, or phantom green dot | Fixture pass; live pending | Pending |
| Supplied flight-delay thread | Three text segments, two verified inline canvases, FAB label `3 conversation segments and 2 canvases` | **FAIL:** three segments, zero canvases, two uncaptured previews | Pending |
| Panel and Markdown | Two named canvas cards, Canvases Only button, two ordered canvas placeholders, no AI-generated warning or `- ##` lines | **FAIL:** no canvas cards or placeholders; conversation export only | Pending |
| Canvas-only inline thread | Badge 1, no green conversation dot, one HTML card/download | Fixture pass; live pending | Pending |
| HTML export | Two distinct `.html` files open with controls, CSS, layout, and module imports functioning; sandbox transport/CSP absent | **BLOCKED by zero verified sources** | Pending |
| Right-hand Canvas UI | Hidden authored source still yields the correct HTML card/download | Fixture pass; live pending | Pending |
| Legacy WidgetHelpers | Existing reconstruction, Ghost UI avoidance, theme/viewport, fonts/CDN remain correct | Fixture pass; live pending | Pending |
| Virtualization and route changes | Scroll hydration retains records; thread → home → Search clears UI/cache | Fixture pass; live pending | Pending |
| Performance and console | Responsive streaming/scrolling, no repeated userscript errors | Pending | Pending |

## Historical manual/live steps (superseded by v5.0.6)

1. In each browser's userscript manager, install `C:\projects\canvas_exporter\userscript\Google_AI_Canvas_Exporter.user.js` (version 5.0.5), disable v5.0.4 and older copies, and allow the `https://*.scf.usercontent.goog/search-sandbox/shim.html*` and `blob:https://*.scf.usercontent.goog/*` frame patterns if the manager/browser exposes a site-access choice. Keep `@grant none`; do not disable browser security protections.
2. Reload the authenticated flight-delay AI Mode thread the user supplied. Scroll through the first and third responses. The FAB should eventually report three segments and two canvases; open it and verify two separate HTML cards. If it instead reports zero canvases, read the panel's inline-source warning and inspect whether the userscript manager injected into the **inner authored widget blob frame**. The outer frame is only a relay fallback. A manager that cannot inject into the authored blob frame is an environment limitation, not evidence that the top-level HTML contains the source.
3. Choose **Export All**: verify one Markdown file with three prompts/responses and two ordered placeholders, and two distinct HTML files. Then choose **Canvases Only** and verify that it downloads exactly the selected HTML files without Markdown. Test a canvas-only inline conversation separately.
4. Open both exported HTML files with network available. Exercise dropdowns, sliders, animations, and tabs; compare the visuals to the corresponding live widget. Inspect their console and Network panels for blocked CDN imports. Then test offline and document expected dependency failures separately; authored remote modules/fonts are not bundled.
5. Test a known right-hand Canvas and a legacy WidgetHelpers example, plus ordinary Search, AI Mode home, and SPA route transitions. In Firefox, repeat the same cases and record browser/userscript-manager versions, badges, filenames, screenshots, and console errors.

Do not install v5.0.5 for further validation: its Chrome Beta result is a known failure. Neither fixture HTML nor the enabled Tampermonkey state proves that a nested blob bridge executed. The exact next test is v5.0.6's HTTPS-shim capture in `manual_validation_v5.0.6.md`.
