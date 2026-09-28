# v5.0.7 inline, side, and legacy Canvas browser validation

Status (2026-09-27 PDT): **28/28 automated tests passed for v5.0.7. Signed-in Chrome Beta captured both inline canvases with Tampermonkey Beta set to `UserScripts API`; Firefox is untested.** The preceding v5.0.6 run showed three segments, zero canvases, and two uncaptured previews. The v5.0.7 capture is real but had a naming defect, addressed in v5.0.8.

## Observed Chrome Beta result

- The user-installed v5.0.7 panel displayed three conversation segments and two verified HTML canvas cards; the FAB displayed the canvas count of two. The supplied Markdown has three prompts and two correctly placed inline canvas markers.
- Both cards and markers were labeled `AI Mode replied:` because the title fallback selected Google's wrapper heading. Both cards proposed `AI_Mode_replied_09272026_100642_PM-PDT`; Chrome saved the second with `(1)`. v5.0.8 addresses both issues.
- The two downloaded files are distinct: 44,943 bytes / SHA-256 `8D4E217745E65024644633EB299A2B66279891FCAC15CFA4D287316689333274`, and 50,744 bytes / SHA-256 `F955B0F16C0CF4F16212E6FD8FE25E4E5527C6DE935011F90E6F63FF6F95216C`. Static inspection found one authored module and a React mount in each, with no CSP or sandbox-injected marker. Interactive execution after opening the files was not observed.
- The manager mode was **UserScripts API**, not Dynamic. The capture does not establish why earlier v5.0.6 injection failed or guarantee every reload/browser; changing the manager-wide mode is not indicated by this result. Chrome Beta exact version, source-free console diagnostics, and Firefox behavior were not recorded.

## What the supplied evidence proves

- Three saved Desktop Google-page captures each have three conversation segments and two inline `.MngkG iframe.lQ27pc` frames, but no parent-DOM authored source. The `(2).har` shows Google's short-lived HTTPS shim accepts `body`/`mimeType`, creates a Blob, and navigates to it. It does not include the authored Blob payload.
- Read-only live Chrome Beta inspection reached the outer Blob's nested HTTPS shim iframe and the inner Blob's 57 KB authored/rendered document. The Chrome tab-level console showed only v5.0.6's top-page activation, not frame bridge logs. The latter is **not conclusive proof** that the frame script never ran; the tab log may omit child-frame logs.
- v5.0.7 emits a source-free `Inline bridge reached Google` signal from a running HTTPS shim and a source-free `Inline preload received` signal from its handoff. If neither appears, frame injection or delivery is suspect; if preload appears but no canvas registers, inspect the already-bounded origin/source/HTML validation. Do not print or upload full source during diagnosis.

## Manager setup for the live test

1. Update the existing enabled Tampermonkey Beta `Google AI Canvas Exporter` userscript from `C:\projects\canvas_exporter\userscript\Google_AI_Canvas_Exporter.user.js`; confirm the panel reads **v5.0.7** and no earlier exporter copy is enabled. Confirm its automatic Greasy Fork update has not overwritten this local version.
2. Record Tampermonkey Beta version and **Settings → Content Script API** value. Its default Chrome `Content Script` mode does not guarantee true `document-start`. `UserScripts API Dynamic` does, but it is manager-wide and may change other scripts' execution timing. v5.0.7 removes the regex include that Tampermonkey says may otherwise inject into every frame in that mode. Do not disable site isolation, CSP, or other security protections. Ensure this script is not restricted to the top frame and that `https://*.scf.usercontent.goog/search-sandbox/shim.html*` is allowed.
3. If the user chooses Dynamic mode, change it only after installing v5.0.7; reload the signed-in flight-delay thread. The browser-control surface refused extension-management access, so this manager configuration is user-operated. The exporter itself retains `@grant none`.

## Browser matrix (record separately for Chrome Beta and Firefox)

| Case | Chrome Beta v5.0.7 | Firefox v5.0.7 | Pass condition |
|---|---|---|---|
| Ordinary Search, empty AI Mode home | Pending | Pending | No FAB, badge, green dot, panel, or export action. |
| Flight-delay thread bridge | Capture succeeded; diagnostic logs not recorded | Pending | Source-free `bridge-ready` and `preload` diagnostics for both widgets, or a recorded exact missing stage. |
| Flight-delay thread state | Partial pass: 3 segments, 2 canvases; stale generic titles | Pending | Three segments, two verified canvases, no uncaptured-preview warning; FAB and green dot reflect the route. |
| Mixed Markdown | Partial pass: 3 prompts and 2 markers; generic marker labels | Pending | Three ordered prompts/responses and two ordered inline canvas markers; no Google UI noise. |
| Both inline HTML exports | Partial pass: distinct static HTML; opened-file behavior unverified | Pending | Two distinct files with authored module/CSS; both open and run their sliders, dropdowns, and animation with network available. |
| Canvas-only inline | Pending | Pending | One verified HTML card and download without a phantom conversation dot. |
| Right-hand modern Canvas | Pending | Pending | Hidden authored source exports once and opens correctly. |
| Legacy WidgetHelpers | Pending | Pending | HTML reconstruction preserves helper behavior, theme, fonts, CDN, viewport, and Ghost UI exclusion. |
| Route changes and hydration | Pending | Pending | Route-scoped counts and cached turns clear/recover; no repeated script exceptions or page freezes. |

Before marking any browser PASS, record its exact browser/manager versions, Content Script API mode, UI screenshot, source-free console diagnostics, download filenames and counts, opened-file behavior, and any module/CDN errors. Standalone HTML may still require authored external dependencies online. If a manager cannot inject into the short-lived HTTPS shim, inline source is unavailable to a parent userscript under the same-origin policy; preserve the fail-closed zero-canvas state and report that environmental limitation rather than generating a fake HTML file.
