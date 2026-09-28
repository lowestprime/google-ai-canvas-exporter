# v5.0.8 browser validation — inline labels and batch filenames

Status (updated 2026-09-28 PDT): **v5.0.8 inline naming/export state passes in signed-in Chrome Beta; the user reports both HTML widgets render and respond interactively. Firefox Nightly screenshots show one enabled v5.0.8 exporter and an export panel with three segments, two distinct inline canvas cards, and distinct default filenames.** Firefox opened-file interaction and console status are not evidenced. The prior v5.0.7 run captured both inline widgets but used Google's `AI Mode replied:` wrapper as both titles and proposed identical filenames. The browser-control surface prohibits `file:` navigation; that restriction was not bypassed.

## Environment and observed baseline

- Signed-in Chrome Beta, Tampermonkey Beta, **Content Script API = UserScripts API**. Exact browser and manager version numbers were not recorded.
- Flight-delay thread: 3 conversation segments, 2 inline widget frames, 2 verified v5.0.7 canvas cards, FAB badge 2.
- Two HTML files: 44,943 and 50,744 bytes, different SHA-256 hashes recorded in `manual_validation_v5.0.7.md`. Both include a module and root mount; neither retains CSP or sandbox-injected marker. This is static evidence, not an interaction pass.
- The prior Markdown had two inline canvas markers in their respective turns but both were generically titled.

## v5.0.8 observed Chrome Beta result

- User confirmed the updated installation. Read-only inspection of the live panel showed `Export v5.0.8`, FAB label `Export 3 conversation segments and 2 canvases`, canvas count 2, and the uncaptured-inline warning hidden.
- The cards are `Interactive Canvas 1` and `The Holiday Reliability Canvas (Dec 15–31)` with distinct default filenames. User screenshots: `C:\projects\scrnsht\scrnsht_Sun_27092026_102120PM.png` and `C:\projects\scrnsht\scrnsht_Sun_27092026_102131PM.png`.
- New HTML downloads are distinct: `Interactive_Canvas_1_09272026_102106_PM-PDT.html` (44,947 bytes; SHA-256 `F8F23CA568D9F391620D4B83C82F9CF7E8CC705DF308F17E2DDEF36A593739AE`) and `The_Holiday_Reliability_Canvas_Dec_1531_09272026_102106_PM-PDT.html` (50,772 bytes; SHA-256 `B1DED614E2AE33512227734D18370B7E1CD21B8C7AFA102AF5522442AADBCB1D`). Each contains one module and a React root, retains authored dependency references, and lacks CSP or sandbox-injected markers. Both preserve Google's authored `Generated Interactive Widget` HTML tab title; the exporter card and filename labels are distinct.
- The new Markdown reports exporter v5.0.8, 3 turns, 3 prompts, and 2 canvas markers at lines 61 and 221 with the respective new labels. It has no `# Shared`, `0 files`, AI-generated notice, or stale `AI Mode replied:` marker. This verifies the supplied file structure, not every rendered Markdown detail.
- The user separately confirmed that both new HTML downloads render and their controls respond in Chrome Beta. Supplied screenshots `C:\Users\Cooper\AppData\Local\Temp\codex-clipboard-c3ab541f-15a3-4f99-a174-f02309a2e57a.png` and `C:\Users\Cooper\AppData\Local\Temp\codex-clipboard-3d23f348-fac5-468f-aebc-24a1b8e5d84d.png` show the exported widgets rendered; the second shows a changed PHX selection and slider values. This is **user-provided** interaction evidence; no opened-file console log was supplied, and the browser controller could not independently inspect `file:` pages.
- Duplicate *user-edited* filename behavior in a real browser, canvas-only state, right-hand/legacy manual regressions, and opened-file Firefox interaction remain unobserved. The computer/browser inventory showed no Firefox app or browser connection available to this session.

## Firefox Nightly evidence supplied after the Chrome run

- The user reported manual v5.0.8 testing in Firefox Nightly. `C:\projects\scrnsht\scrnsht_Sun_27092026_103927PM.png` shows Tampermonkey 5.5.0 with one enabled `Google AI Canvas Exporter` v5.0.8 entry. `C:\projects\scrnsht\scrnsht_Sun_27092026_104054PM.png` shows the export panel with three conversation segments, two differently named HTML canvas cards and distinct default filenames.
- The user listed two new HTML exports and a Markdown export at 10:40 PM PDT. Those Desktop paths were not present when checked in the 2026-09-28 continuation, so the HTML bytes, scripts, CDN calls, runtime controls, and console could not be independently inspected. Do not infer Firefox interactive success from the panel alone.
- The Greasy Fork Markdown formatting report is **not** fully resolved by v5.0.8. The separate 16-turn code-heavy export shows clumped citations, missed current headings, and malformed code-widget fences/caution text; these are addressed in v5.0.9 and documented in `manual_validation_v5.0.9.md`.

## v5.0.8 checks to complete

| Case | Chrome Beta | Firefox | Pass condition |
|---|---|---|---|
| Install and reload | Pass: panel says v5.0.8; duplicate-install state not independently inspected | User screenshot: one enabled v5.0.8 entry and panel label | One enabled exporter; panel says v5.0.8; no stale v5.0.7 script. |
| Flight-delay mixed thread | Pass: 3 segments, 2 verified canvases, FAB 2, warning hidden; dot not independently recorded | User screenshot: 3 segments and 2 canvas cards; badge/dot not independently recorded | 3 ordered segments, 2 verified inline canvases, badge 2, green conversation dot, no uncaptured warning. |
| Mixed Markdown | Pass for 3 prompts, 2 correctly placed and named markers, and checked noise classes; full formatting review pending | Pending | Ordered conversation and inline markers with no Google UI noise. |
| Canvas labels | Pass | User screenshot pass for two distinct cards | No card or Markdown marker says `AI Mode replied:`; first has a distinct numbered fallback and second uses the nearby `The Holiday Reliability Canvas (Dec 15–31)` heading if present. |
| Canvas filenames | Partial pass: distinct defaults/downloads; manual collision edit untested | User screenshot: distinct defaults; downloads listed but unavailable for inspection | Two different default names; editing both to the same name still yields two distinct downloaded `.html` files. |
| Open both HTML files | User-reported interactive pass; console not independently inspected | Pending | Both render, sliders/dropdowns/animation respond, and console has no exporter-caused errors with authored CDN dependencies reachable. |
| Canvas-only inline | Pending | Pending | Verified HTML card/download without a phantom conversation segment or green dot. |
| Right-hand modern Canvas | Pending | Pending | Correct authored source and unique download; theme and interaction preserved. |
| Legacy WidgetHelpers Canvas | Pending | Pending | Reconstruction, fonts, viewport, CDN, theme and Ghost UI exclusion preserved. |
| Ordinary Search / empty AI Mode home / SPA route change | Pending | Pending | No off-target UI; route cache and count reset. |
| Hydration / responsiveness | Pending | Pending | No missing turns, duplicate markers, repeated exceptions, or page freeze. |

Use the locally edited `C:\projects\canvas_exporter\userscript\Google_AI_Canvas_Exporter.user.js` for the update. Do not change the manager-wide Content Script API mode merely to reproduce the known Chrome capture: v5.0.7 succeeded in `UserScripts API` mode. Record exact versions, screenshots, filenames, opened-file interaction, and any module/CDN errors for each browser separately. Do not treat fixture passes or static HTML inspection as a live browser pass. Modern exports can retain authored network dependencies and are not guaranteed fully offline.
