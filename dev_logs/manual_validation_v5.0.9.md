# v5.0.9 validation — formatting and filename follow-up

Status (2026-09-28 PDT): **automated regression suite and saved-page fixture validator pass; v5.0.9 has not yet been installed and retested in signed-in Chrome Beta or Firefox Nightly at this checkpoint.** The supplied v5.0.8 exports are baseline evidence, not proof of v5.0.9 live behavior.

## Baseline evidence and root causes

- The user-supplied v5.0.8 16-turn Apple Devices Wi-Fi Sync Markdown export is 123,638 bytes and 1,484 lines. Read-only inspection found 53 inline numeric citations, all directly attached to preceding text/punctuation; 57 occurrences of Google's `Use code with caution.`; 34 bare `powershell` lines; 11 `:powershell` collisions; zero language-labelled `powershell` fences; and 114 fence lines (two per code block). Four sampled headings appeared as plain lines rather than Markdown headings.
- A read-only inspection of the linked, signed-in Chrome share showed 57 `.aiModeUiCodeBlock__Container` widgets (22 inside list items), all with a separate `.GlO4G` language label and `.iMHp6c` caution/copy chrome. It also showed current response headings using both `.AdPoic` and `.otQkpb` with `role="heading"` / `aria-level`. Only aggregate counts and a sanitized structural fixture entered the repository; no private thread content or device details were committed.
- The earlier Firefox Nightly v5.0.8 flight-delay screenshot shows three segments and two distinct canvas cards; opened HTML files and console behavior are not independently verified in Firefox. Its attached Desktop HTML/Markdown paths were unavailable when checked in this continuation.
- The public Greasy Fork report identifies clumped hyperlinks, missed headings, and broken code fences: <https://greasyfork.org/en/scripts/572688-google-ai-canvas-exporter/discussions/339322#comment-669160>.

## Automated verification

| Check | Outcome |
|---|---|
| Focused pre-fix tests | Filename helper absent; citation/link adjacency, nested emphasis, and literal-backtick fence fixture failed as expected. |
| `npm test` | 31/31 pass after v5.0.9 implementation, including current code-widget language/caution handling and prior inline/side/legacy/route/security regressions. |
| `npm run test:fixtures` | Three saved-page cases pass, including five-turn and mixed canvas/chat fixtures. |
| `node --check userscript/Google_AI_Canvas_Exporter.user.js` | Pass. |
| `git diff --check` | Pass. |

## Live-browser retest matrix

| Case | Chrome Beta | Firefox Nightly | Pass condition |
|---|---|---|---|
| v5.0.9 install/reload | Pending | Pending | One enabled v5.0.9 script; no stale v5.0.8 instance. |
| Flight-delay mixed thread | Pending | Pending | Three segments; two distinct verified inline canvases; separate filenames; exported HTML widgets remain interactive. |
| Code-heavy 16-turn thread | Pending | Pending | Full 16 segments after hydration; no clumped citation markers, plain `.otQkpb` headings, bare `powershell`, or `Use code with caution.` in Markdown; code contents and list nesting intact. |
| Long first-prompt filename | Pending | Pending | Flight-delay Markdown basename is concise and topic-specific, while full title remains editable and a custom filename is respected. |
| Side/legacy/canvas-only and route gates | Pending | Pending | Previous working export paths and fail-closed off-target behavior remain unchanged. |

The userscript cannot guarantee injection into Google's short-lived sandbox frames in every browser/manager configuration; an inaccessible inline preview must remain non-exportable. Modern authored HTML can retain CDN dependencies and need network access. In the linked code-heavy thread, Google's rendered first prompt contains no line breaks or code elements in its accessible DOM, so original prompt-code formatting cannot be reconstructed from that DOM alone. No live v5.0.9 pass should be claimed until an actual browser export and opened-file interaction are observed or explicitly reported.
