# v5.0.6 inline, side, and legacy Canvas browser validation

Status as of 2026-09-27 PDT: **27/27 automated tests pass; live v5.0.6 Chrome Beta inline export FAILS; Firefox is untested.** The user updated Tampermonkey and reloaded the signed-in flight-delay thread. The panel confirms `Export v5.0.6` but still reports three conversation segments, zero canvases, and `2 inline canvas previews could not yet be captured`. Do not claim that the HTTPS-shim fix worked in this browser.

## Observed evidence

- The user's signed-in Chrome Beta thread visibly renders two inline widgets and three conversation segments. Its v5.0.5 panel reported zero canvases and `2 inline canvas previews could not yet be captured`.
- The third Desktop HTML save has two `iframe.lQ27pc` candidates but no authored source in the parent DOM. Its 187-request HAR includes four 7,245-character HTTPS sandbox-shim responses. The shim receives a `body` and `mimeType` message, creates an HTML Blob, and navigates to it. The HAR does not itself include the authored Blob payload.
- Read-only inspection of the nested live blob document found the rendered React `#root`, an authored module, CSS, and widgetlibs imports. It did not prove whether the v5.0.5 userscript executed inside that blob document. Two errors from a *different* installed userscript (`MarkDown Cloud Cut Notes`) concern TrustedHTML and are not evidence of a Canvas Exporter exception.
- v5.0.6 now captures the trusted HTTPS-shim payload before navigation, with a live-frame/origin check at Google top, and accepts an initially empty authored React root. A random challenge can bind the response when an extension world supplies `MessageEvent.source === null`. Fixture tests cover these code paths, but not actual Tampermonkey frame-injection timing.
- The v5.0.6 live reload logged only `[GCE] v5.0.6 active on www.google.com` through the tab-level console. The panel still showed zero canvases. Read-only frame inspection confirmed an outer blob with an inner `https://*.scf.usercontent.goog/search-sandbox/shim.html?origin=https://<outer-host>` iframe and a rendered inner blob with an authored module. This proves that Google delivered and ran the widget, **not** that Tampermonkey injected the exporter into the short-lived HTTPS shim. The user's Tampermonkey Content Script API mode is being checked separately. Tampermonkey documents that its default mode does not guarantee true `document-start`, whereas UserScripts API Dynamic does; Dynamic also has a known broad-injection problem with regex `@include` patterns. Do not switch modes without accounting for that metadata caveat.

## Validation matrix

| Case | Chrome Beta v5.0.6 | Firefox v5.0.6 | Required observation |
|---|---|---|---|
| Ordinary Search and empty AI Mode home | Pending | Pending | No FAB, badge, green dot, panel, or export action. |
| Supplied three-segment flight thread | **FAIL: 0 canvases, 2 uncaptured previews** | Pending | Two **verified** HTML cards and FAB label `3 conversation segments and 2 canvases`; no uncaptured-preview warning. |
| HTTPS shim handoff | **Unproven; no frame log in tab-level capture** | Pending | Console contains `[GCE] v5.0.6 sandbox bridge: shim` for nested hosts and `Inline source forwarded`; Google page logs two inline registrations. |
| Mixed Markdown export | Pending | Pending | Three ordered prompts/responses, two ordered inline canvas placeholders, no Google UI noise. |
| Both inline HTML files | Pending | Pending | Distinct source and filenames; each opens with original layout, styling, module imports, dropdowns, sliders, and animation. |
| Canvas-only inline thread | Pending | Pending | One verified HTML card/download; badge 1 and no green conversation dot when no complete text turn. |
| Right-hand modern Canvas | Pending | Pending | Its existing hidden source produces a working HTML file; no duplicate record. |
| Legacy WidgetHelpers | Pending | Pending | Existing reconstruction preserves theme, fonts, CDN, viewport, and Ghost UI avoidance. |
| Route/virtualization/performance | Pending | Pending | Hydration retains all turns/canvases, restores scroll; route changes clear state; no freezing or repeated exporter exceptions. |

## Exact next steps

1. In Tampermonkey Beta, update the existing `Google AI Canvas Exporter` script from `C:\projects\canvas_exporter\userscript\Google_AI_Canvas_Exporter.user.js` to **v5.0.6**, save, and confirm that only one exporter copy is enabled. The prior Tampermonkey screenshot showed a Greasy Fork update URL; verify that an automatic update has not reverted the locally edited version during this test. Keep `@grant none` and Chrome security protections. Ensure `Run only in top frame` is not enabled and the script may run in `https://*.scf.usercontent.goog/search-sandbox/shim.html*` frames. The browser-control surface previously refused extension-management access; installation must be performed by the user unless that restriction changes.
2. Reload the signed-in flight-delay thread. The expected first signal is frame-bridge logging for the HTTPS shim. If there is no frame log, record the Tampermonkey version, Content Script API setting, and whether the manager actually injected the script into the **inner HTTPS shim**. Do not infer this from metadata or from the script appearing in the toolbar menu. If shim logs appear but source-forwarding does not, record timing and any script errors. Do not turn off site isolation, CSP, or other browser security protections.
3. Confirm both canvas cards and their names, the FAB count and dot, then choose **Export All** and **Canvases Only**. Record exact file counts/filenames and whether the Markdown contains both ordered canvas markers. An unverified frame must never produce a synthetic HTML download.
4. Open each exported HTML file with network available; exercise its controls and inspect Console/Network for module or CDN failures. Recheck offline separately: authored remote dependencies are preserved, so a standalone file is not guaranteed to function fully offline.
5. Repeat ordinary Search, AI Mode home, route transitions, a right-hand Canvas, and a legacy WidgetHelpers thread in Chrome Beta. Repeat the matrix independently in Firefox with its manager version. Capture screenshots and console evidence for each result before marking a browser PASS.

Do not claim live success until both widgets export and run in the actual browser. If nested HTTPS shim injection is unavailable in a particular userscript manager, the remaining limitation is environmental; v5.0.6 deliberately fails closed rather than exporting an empty shell.
