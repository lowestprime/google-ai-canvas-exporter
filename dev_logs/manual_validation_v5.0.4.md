# v5.0.4 Chrome and Firefox validation

Status: automated fixtures passed; authenticated live Google AI Mode validation is **not yet complete**. The supplied Chrome Beta screenshots and accessibility snapshot show v5.0.3's failure, not v5.0.4 success. No Chrome Beta or Firefox session was available in the accessible browser inventory. The first supplied share link opened in the in-app browser but its signed-out view showed only the AI Mode conversation shell, without the turns or Canvas; this is not a valid live export test. The separately supplied Desktop HTML/Markdown files were readable during diagnosis but disappeared before the final direct replay command; the replay script remains ready for them.

## Evidence actually inspected

- Chrome Beta screenshot: 2 conversation segments, `1 canvas` in the preview composition, but FAB accessibility label `0 canvases`, no canvas card, and no Canvases Only button.
- Expanded DOM capture: 2 `.CKgc1d` turns, 1 `iframe.lQ27pc` under `[aria-label="Canvas preview"]`, 0 `TgQPHd` comments, and 1 hidden `[data-xid="mnldjf"]` source of about 32 KB. The source begins with `<!DOCTYPE html>` and ends with `</html>`, and contains the dashboard's Tailwind CDN reference and interactive `switchTab` logic.
- SingleFile archive: the modern preview's nested `srcdoc` contains the rendered dashboard, but no WidgetHelpers script. This is archival evidence only; the live iframe's `srcdoc` is empty.
- v5.0.3 Markdown: spurious `# Shared` / `0 files`, a generic canvas placeholder, and a 17-link citation run after the first sentence.
- Repository fixture test: modern canvas-only and mixed routes show accurate cards/counts, exported HTML retains authored script/CSS, an inline interaction runs, unknown iframes do not count, and source revisions update or withdraw exportability. Legacy WidgetHelpers regression stays green.

## Manual matrix — run in both Chrome Beta and Firefox

| Case | Expected v5.0.4 observation | Chrome Beta | Firefox |
|---|---|---|---|
| Ordinary `/search?q=…` | No exporter FAB/panel/observer | Pending | Pending |
| Empty `/search?udm=50` | No FAB, green dot, or phantom canvas | Pending | Pending |
| Canvas-only AI Mode page | FAB badge 1, no green dot; panel has named HTML canvas and Canvases Only | Pending | Pending |
| Supplied mixed two-turn thread | FAB label reports 2 segments and 1 canvas; panel has a canvas card and both export modes | Pending | Pending |
| Conversation Markdown | Two prompts/responses; no `Shared`, `0 files`, or generic `Interactive Canvas 1`; primary inline citation and complete References | Pending | Pending |
| Modern HTML export | One `.html` opens, tabs/buttons work, visual layout matches live preview, CDN-dependent assets documented | Pending | Pending |
| Legacy WidgetHelpers canvas | Existing HTML reconstruction still opens, no Ghost UI, theme/viewport options still apply | Pending | Pending |
| Canvas revision | Edit/revise code, reopen panel; title/source refresh without duplicate card | Pending | Pending |
| SPA navigation | Thread → home → ordinary Search → another thread clears and rebuilds UI/counts | Pending | Pending |
| Performance | Streaming and scrolling remain responsive; no repeated exporter errors | Pending | Pending |

## Exact next steps

1. Install [the v5.0.4 userscript](../userscript/Google_AI_Canvas_Exporter.user.js) in the Chrome Beta and Firefox userscript managers; disable v5.0.3 to avoid duplicate UI.
2. Open the user's supplied AI Mode shares, then the authenticated editable thread if the share view lacks the code surface: `https://share.google/aimode/CPr2bQF8Y700RRHl4` and `https://share.google/aimode/5FfSGPQQGt5mk5XZs`.
3. Run the matrix above. Save the HTML/Markdown downloads and a console log from each browser. Inspect the exported HTML with network enabled and then disabled to distinguish source CDN dependencies from exporter breakage.
4. If the Desktop captures are restored, rerun `node test/validate-modern-evidence.mjs <expanded-dom.html> <canvas-source.html>` and record the result. The diagnostic `node test/inspect-canvas-evidence.mjs <expanded-dom.html>` is read-only.

Do not mark live Chrome/Firefox validation passed based on fixture tests or the v5.0.3 screenshots.
