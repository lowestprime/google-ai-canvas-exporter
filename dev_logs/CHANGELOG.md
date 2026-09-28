---
title: "Google AI Canvas Exporter – Changelog and Version History v1.0.0–5.0.11"
date: 2026-09-28
source: https://greasyfork.org/en/scripts/google-ai-canvas-exporter
---

# Changelog

## Version 5.0.11
2026-09-28

The supplied ten-file v5.0.10 archive confirms date on/off output and matching Chrome/Firefox long-thread Markdown, but shows that an unnamed inline canvas can change from `Interactive Canvas 1` to `Interactive Canvas 2` between exports. Panel checkboxes also reset whenever the panel is rebuilt.

| Change | Why it matters |
|---|---|
| Remember general export options | Conversation inclusion, YAML, Turn dates, theme, viewport, and metadata restore after panel reopen or browser restart when site storage is available. |
| Scope canvas selections to a thread | A deselected canvas stays deselected in that thread, including after reload; unrelated threads start fully selected. Late-discovered canvases honor a saved Deselect All choice, and Canvases Only now respects unchecked cards. |
| Stabilize unnamed inline labels | Number anonymous inline canvases from their page order when available, independent of source-message arrival order. |
| Handle blocked storage | Keep current-page choices in memory and show one warning instead of breaking the exporter. No conversation or canvas source is persisted. |

See `dev_logs/archive_validation_v5.0.10_2026-09-28.md` for the entry-by-entry archive assessment. Live v5.0.11 browser-restart validation remains outstanding.

---

## Version 5.0.10
2026-09-28

The follow-up [Greasy Fork report](https://greasyfork.org/en/scripts/572688-google-ai-canvas-exporter/discussions/339322#comment-669234) provided a concrete v5.0.8 example of plain response headings, code languages outside fences, caution footers, and extra blank lines inside fences. v5.0.9 had already addressed the language/footer behavior; a new two-turn regression fixture isolated the remaining heading and trailing-newline defects.

| Change | Why it matters |
|---|---|
| Generic response headings | Treat `role="heading"` as a heading even without an `aria-level` or current Google class; prompt chrome is not part of the response converter. |
| Clean code fence endings | Drop surplus trailing newlines from Google's `<pre><code>` source before writing the matching closing fence. Authored interior blank lines remain intact. |
| Turn-date and code regression | Verify two code-containing turns with Turn dates on and off, including date-like text inside a code block, citations, and list-contained language-labelled fences. |

The quoted report is v5.0.8 evidence, not proof that v5.0.10 has passed live replay. Inline/side/legacy canvas paths, grants, and network behavior are unchanged. See `dev_logs/manual_validation_v5.0.10.md`.

---

## Version 5.0.9
2026-09-28

The user-supplied 16-turn, code-heavy v5.0.8 export exposed the outstanding [Greasy Fork formatting report](https://greasyfork.org/en/scripts/572688-google-ai-canvas-exporter/discussions/339322#comment-669160): all 53 inline numeric citations were attached to preceding text, Google's caution label appeared 57 times, code languages were outside their fences, and some current heading wrappers were plain text. A separate flight-delay thread inherited an excessively long first-prompt filename.

| Change | Why it matters |
|---|---|
| Readable long-thread filenames | Condense instruction-like titles to bounded topic words and parenthesized acronyms, retaining the timestamp and editable full title. Short user titles are unchanged. |
| Citation and emphasis boundaries | Separate adjacent citation links from prose and each other; avoid invalid nested bold/italic delimiters in response cards. |
| Current Google headings and code widgets | Convert `[role="heading"][aria-level]` wrappers; place the code widget's language on its fence and omit Google's caution/copy controls. Use a longer fence when code contains backticks, and recognize matching fences in both normalization and the safe preview, including list-contained code. |
| Regression coverage | 31 automated tests pass, including a source-structure fixture for a code block inside a list and literal backticks, alongside existing inline/side/legacy canvas and route-gating checks. |

v5.0.8 Firefox Nightly screenshots show two distinct inline canvas cards and downloaded HTML/Markdown files, but the file paths were unavailable during this checkpoint; opened-file interaction was not independently verified in Firefox. v5.0.9 live-browser retests are pending. No grant, network transmission, or production dependency was added. See `dev_logs/manual_validation_v5.0.9.md`.

---

## Version 5.0.8
2026-09-27

Signed-in Chrome Beta with Tampermonkey Beta in `UserScripts API` mode confirmed that v5.0.7 captured two inline canvases and three conversation segments, but the two canvas cards and Markdown markers were both titled `AI Mode replied:`. The two different HTML files also received the same proposed filename, causing Chrome to append `(1)`.

| Change | Why it matters |
|---|---|
| Context-aware inline labels | Prefer an authored HTML title/heading, then a canvas-specific heading after the widget, then a distinct numbered fallback. Google conversation chrome no longer becomes the canvas card title or Markdown marker. The authored HTML document title is preserved. |
| Collision-safe filenames | Equal titles receive different default card names; a final case-insensitive batch pass also distinguishes user-edited duplicate names without altering already unique choices. |
| Regression coverage | 29/29 automated tests pass, reproducing generic empty React mounts and duplicate names while retaining mixed, side, legacy, security, and route checks. v5.0.8 live interaction/Firefox results remain pending. |

The source bridge and canvas HTML reconstruction paths are unchanged. Signed-in Chrome Beta showed two correctly named cards and distinct HTML downloads; the user reports both HTML widgets work interactively. Firefox remains unverified. No new grant, network transmission, or production dependency was added. See `dev_logs/manual_validation_v5.0.8.md`.

---

## Version 5.0.7
2026-09-27

The v5.0.6 HTTPS-shim bridge still captured zero of two visible inline widgets in a signed-in Chrome Beta thread. The exact userscript-manager frame injection state remains to be verified; this release makes that diagnosis observable without exposing widget or conversation source.

| Change | Why it matters |
|---|---|
| Narrower frame metadata | Removed the Blob regex `@include` while retaining the exact HTTPS shim `@match`. Tampermonkey documents that regex includes can inject into every frame in UserScripts API Dynamic mode; the shim path needs early HTTPS injection, not a broad Blob match. |
| Source-free diagnostics | A frame bridge announces startup to the Google page, which also logs the arrival length and source availability of a preload. These distinguish absent/late injection from a rejected source without printing HTML. |
| Regression coverage | 28 automated tests passed, including metadata scope and existing conversation, inline, right-hand Canvas, legacy, and security checks. Live Chrome Beta later captured two inline canvases; their labels/filenames were defective and opened-file interaction remains unverified. Firefox is untested. |

Tampermonkey's default Chrome mode does not guarantee true `document-start`; its UserScripts API Dynamic mode does. That setting is manager-wide and should be reviewed before changing it. See `dev_logs/manual_validation_v5.0.7.md`. No privileged grant or external persistence was added.

---

## Version 5.0.6
2026-09-27

Chrome Beta proved that v5.0.5 still reported two visible inline widgets as zero exportable canvases. This release adds a path to capture authored HTML at Google's nested HTTPS shim handoff before its blob navigation, provided the userscript manager injects into that short-lived HTTPS frame early enough. Successful blob-frame injection is no longer required for that path.

| Change | Why it matters |
|---|---|
| Pre-navigation inline capture | The shim receives the complete `text/html` body from its trusted parent before `location.replace(blobURL)`. The userscript forwards a bounded, complete authored module document directly to the Google tab. |
| Verified source association | The Google page accepts an unsolicited source only from a live matching inline frame's outer or indexed nested WindowProxy and an HTTPS `scf.usercontent.goog` origin. A 192-bit nonce-bound challenge also supports extension contexts that report a null message source; unverified previews still do not count. |
| Empty React mount support | A complete inline document with a substantive module may initially contain an empty `#root`. Inline validation/export now accepts that source; the right-hand Canvas reconstruction path is unchanged. |
| Actionable diagnostics | The warning identifies nested HTTPS shim access; frame-mode logs distinguish successful shim execution and source forwarding. |
| Regression coverage | 27 automated tests pass, including trusted shim handoff, spoofed sender/MIME rejection, nested source mapping, nonce-bound null-source replies, pre-DOMContentLoaded receipt, empty-mount HTML export, and side/legacy compatibility. **Live v5.0.6 Chrome Beta still reported zero of two inline canvases after installation and reload**; Firefox is untested. Frame injection timing remains under investigation. |

The script retains `@grant none`, does not upload or externally persist source, and keeps authored CDN dependencies. See `dev_logs/manual_validation_v5.0.6.md` for the actual browser status.

---

## Version 5.0.5
2026-09-27

Restores a source-capture path for inline AI Mode interactive widgets without changing the right-hand Canvas or legacy WidgetHelpers export paths.

| Change | Why it matters |
|---|---|
| Inline sandbox bridge | The supplied flight-delay thread has two rendered `.MngkG` widgets but no top-level `TgQPHd` or hidden side Canvas source. A nonce-, origin-, iframe-, and route-checked tab-local handoff can retrieve authored HTML from the nested blob widget when the userscript manager injects there, directly or through the outer sandbox relay. |
| Accurate canvas state | An unverified frame still counts as zero exportable canvases; the panel explains inaccessible inline previews. Verified sources appear as distinct cards and update FAB/Markdown even if they arrive after the panel opens. Virtualized remounts reuse their canvas record. |
| Clean inline HTML | Inline output retains authored module/CSS/CDN dependencies while removing Google's injected sandbox scripts and CSP. Modern side HTML and legacy reconstruction remain on their existing paths. |
| Cleaner conversation Markdown | Late canvas discovery no longer duplicates a cached turn. The inline-widget AI-generated notice is omitted, and Google heading cards inside lists no longer produce `- ##` syntax. |
| Regression coverage | 22 automated tests pass, including inline canvas-only/mixed source messages, direct nested-frame handling, two-widget ordering, spoof rejection, remounts, and side/legacy compatibility. Both supplied Desktop DOM captures replay as three segments/two inline frames with no parent-page source. Live Chrome Beta/Firefox export is not yet verified. |

Live Chrome Beta testing subsequently showed that v5.0.5 still failed to capture either inline widget (three conversation segments, zero canvases). The automated bridge tests did not exercise the manager's actual blob-frame injection or the initially empty authored React root. See `dev_logs/manual_validation_v5.0.5.md` for the failure evidence. v5.0.6 adds an HTTPS-shim path and empty-root handling, but the initial live Chrome Beta retest still failed to capture the two widgets.

---

## Version 5.0.4
2026-09-25

Restores canvas-only and mixed chat/canvas export for the current right-hand AI Mode Canvas UI.

- The new live DOM has an `iframe.lQ27pc` preview but no legacy WidgetHelpers `TgQPHd` comment. The authored HTML is in a hidden `[data-xid="mnldjf"]` code surface beside the preview. Verified modern HTML now registers as a canvas and exports through a separate source-preserving path; legacy WidgetHelpers reconstruction is unchanged.
- A sandbox iframe without retrievable source no longer creates a fake `Interactive Canvas 1` placeholder or a phantom canvas count. FAB, composition, and export cards use verified registry records, and ordinary Search remains off-target.
- A targeted observer discovers the side panel without broad Markdown work; source revisions update in-memory HTML and an invalid revision withdraws canvas exportability. Route changes clear canvas state.
- Markdown removes the current `Shared / 0 files` attachment card. A related-results citation group uses its primary result inline while retaining all collected URLs in that turn's References block.
- Added portable canvas-only/mixed/empty-home/unknown-source/revision fixtures, a read-only evidence inspector, and a direct capture replay script. Seventeen automated tests pass; authenticated Chrome/Firefox live validation remains pending. See `dev_logs/manual_validation_v5.0.4.md`.

Modern authored HTML may require its original CDN or API dependencies when opened offline. No runtime dependency, privileged grant, or external conversation persistence was added.

One-click export of Google AI Mode conversations and interactive canvases. Legacy Widget Shell V2 content is reconstructed with WidgetHelpers, Ghost UI exclusion, CDN/font preservation, and theme/viewport controls. Modern authored HTML is preserved without forcing the legacy reconstruction model; externally hosted resources may still need network access.

---

## Version 5.0.3
2026-07-05

Mixed-content conversation export repair. This release treats a Google AI Mode thread as ordered conversation segments instead of assuming every later prompt, response, and canvas remains inside `.CKgc1d`.

### Root causes fixed

| Failure | Root cause and correction |
|---|---|
| Formal Classification exported only the first exchange | The saved page has one `.CKgc1d` but two response bodies. The follow-up prompt and response live under `[data-xid="pJN44d"] > .AsFDjf.Vaqf8d > .Eltaeb`. Ordered segment discovery now covers both classic and mixed-content roots without duplicating nested blocks. |
| Follow-up prompt was missing | The mixed prompt uses `.Ax52xb` and date `.L6HOGc`, neither of which v5.0.2 recognized. Prompt pairing now supports both structures and nearest preceding prompt fallback. |
| Embedded canvas was absent | The widget payload starts `TgQPHd||`; slicing a fixed seven-character prefix left an invalid leading pipe. Parsing now begins at the first JSON bracket and registers `Stability Physics: Splay Angle Simulator`. |
| Canvas placement and source order were lost | The mixed `.Eltaeb` contains prose, canvas, then more prose, while source cards are sibling asides. Snapshots now preserve response/canvas DOM order and use filtered sibling source URLs only as citation fallback. |
| Panel reported `1 turn` and clipped the export | Counts were tied to `.CKgc1d` cache size and the textarea explicitly used `md.slice(0, 3000)`. The panel now reports segments/prompts/text responses/canvases/full characters and shows complete raw Markdown beside an escaped rendered preview. |

### Compatibility and validation

- Runtime activation remains fail-closed on ordinary Search and empty AI Mode home, with route-scoped observer/cache teardown.
- Canvas HTML reconstruction remains unchanged apart from version metadata/test exposure: all six WidgetHelpers signatures, CSP/sandbox stripping, Ghost UI exclusion, CDN/fonts, dark/light flags, full viewport, zero-width resize target, and staggered downloads remain covered.
- The Formal Classification regression requires two prompts, two text responses, one exact canvas placeholder/title, the stability-mechanics answer, clean references, and an untruncated preview. Both existing five-turn fixtures, virtualization, URL gating, observer, FAB, and canvas tests remain in the suite.
- Detailed evidence and current browser status are in `dev_logs/execplan_v5.0.3_mixed_content_export.md` and `dev_logs/manual_validation_v5.0.3.md`.

## Version 5.0.2
2026-07-02

Conversation export and activation repair. This release replaces wrapper-root counting and global UI state with strict runtime evidence gates, route-scoped caches, virtualized turn hydration, and production-backed fixture tests.

### Root causes fixed

| Failure | Root cause and correction |
|---|---|
| Only one turn exported | One `[data-xid="aim-mars-turn-root"]` wrapped five `.CKgc1d` turns, but v5.0.1 queried only its first `.CKgc1d`. Each `.CKgc1d` is now extracted independently. |
| Prompt/response conflation | `[data-xid="VpUvz"]` was incorrectly used as a prompt fallback. Prompts and responses now use separate evidenced selectors. |
| False green dot / `1 turn` | The badge counted wrapper roots and retained global state across SPA navigation. It now reflects complete snapshots in the active semantic route. |
| FAB on ordinary Search / AI home | Startup called `ensureFAB()` unconditionally and `udm=50` alone was accepted. UI now requires a complete turn or decoded WidgetHelpers canvas and is removed on route teardown. |
| Missing virtualized history | Export depended on currently mounted DOM. Idle snapshot caching plus bounded top-to-bottom hydration retains turns through unmount/remount cycles and restores scroll. |
| Markdown noise and flattening | The full turn container was converted. v5.0.2 converts only the response body, handles Google's role headings/paragraphs/lists/tables/code/hard breaks, and strips controls, dialogs, source asides, canvases, images, and sentinel items. |
| Incorrect citations | Generic source-card links were treated as citations. `.WBgIic` UUIDs now resolve through per-turn `TgQPHd` payloads, with normalized inline links and one references block per cited response. |
| Broad observer work | Every mutation triggered a document-wide canvas scan. Added-node probes now coalesce into idle work, scope to the conversation host, and reuse content fingerprints for unchanged turns. |
| Non-portable validator | The test copied production algorithms, pointed outside the repo, allowed one turn, and had no declared dependency. Tests now call a conditional production API, use repository fixtures, declare locked `jsdom`, and require five turns. |

### Compatibility

- Canvas HTML reconstruction retains all six WidgetHelpers signatures, whitespace-tolerant helper detection, CDN/font preservation, CSP/sandbox removal, Ghost UI exclusion, dark/light configuration, absolute zero-width resize target, full viewport, and staggered batch download.
- The distributed userscript remains dependency-free with `@grant none` and no conversation persistence or external transmission.
- Automated fixture/static validation is recorded in `dev_logs/execplan_v5.0.2_ai_mode_export.md`; Chrome/Firefox live-account status is recorded in `dev_logs/manual_validation_v5.0.2.md`.

## Version 5.0.1
2026-06-30

Critical performance hotfix. v5.0.0 froze Google AI Mode pages in Chrome and Firefox and prevented the export FAB from appearing.

### Root Cause

`updateFABBadge()` called full `extractConversationTurns()` on every DOM mutation via `MutationObserver`, plus on the 2s poll interval. AI Mode pages mutate continuously during streaming, triggering thousands of full DOM walks, `innerText` layout reflows, and forced `offsetWidth` repaints per second.

### Fixes

| Change | Detail |
|--------|--------|
| **Observer restored to v4 pattern** | `MutationObserver(scan)` only — no badge work on mutations |
| **Cheap badge state** | `getCheapTurnCount()` counts turn roots only; full extraction on panel open / export |
| **Debounced badge refresh** | `scheduleBadgeUpdate()` at 400ms, called from canvas discovery and AI Mode poll only |
| **AI Mode gate** | `isAIModePage()` + removed `document.body` fallback from `getConversationHost()` |
| **No innerText in hot paths** | `textContent` on targeted elements only in `extractUserText`, `extractTurnDate`, `findCanvasPlaceholder` |
| **Deferred preview** | `buildConversationMarkdown()` runs in `requestIdleCallback` after panel opens |
| **Animation on change only** | `gce-pop` reflow restart only when canvas or turn count actually changes |
| **Safe FAB init** | FAB appends immediately with badge `0`; no sync extraction at startup |

---

## Version 5.0.0
2026-06-30

Unified export panel with full Google AI Mode conversation markdown export alongside the existing canvas HTML batch export.

### New Feature: Conversation Markdown Export

| Feature | Description |
|---------|-------------|
| **Turn extraction** | Scans `[data-xid="aim-mars-turn-root"]` for user prompts (`.tonYlb` / `[data-xid="VpUvz"]`) and AI responses (`.CKgc1d`), with sibling fallback when turn roots are absent |
| **Clean markdown** | Inline Trusted-Types-safe tree walker converts AI blocks to markdown — no Turndown/marked dependencies |
| **Citation handling** | Numbered inline `[n](url)` refs plus one compact `### References` block per AI turn; favicon/thumbnail images and source-card bullet noise stripped |
| **YAML frontmatter** | Optional metadata: title, source URL, export timestamp, turn count, exporter version |
| **Smart filenames** | `{Title}_{WEEKDAY}_{MMDDYYYY}_{HHMMSS}-{AM\|PM}-{TZ}.md` (e.g. `Fix_Chrome_Beta_Download_Location_TUE_06302026_102709-AM-PDT.md`) |
| **Partial history warning** | UI shows turn count and warns when fewer than 2 turns are loaded (Google virtualizes older turns until scrolled) |

### New Feature: Unified Export Panel

Replaces the canvas-only modal with a single panel for both export types:

| Section | Description |
|---------|-------------|
| **Conversation** | Thread title (editable), turn count badge, live preview (~3,000 chars), markdown filename, frontmatter/dates toggles |
| **Canvases** | Existing multi-canvas cards with type badges, checkboxes, and HTML export settings |
| **Actions** | **Export All** (`.md` + selected `.html`, 500ms stagger), **Conversation Only**, **Canvases Only** |

### FAB Updates

- Always visible on Google Search pages (not only when canvases are detected)
- Green dot indicator when a conversation is exportable
- Badge shows canvas count, or turn count when no canvases are present

### Defects Fixed (vs. incomplete V1/V2 markdown exports)

| Defect | Fix |
|--------|-----|
| Favicon / thumbnail `![](…)` blocks | Stripped in DOM walker and `normalizeMarkdown()` post-process |
| Duplicate citation blocks (numbered refs + source-card bullets) | Citation bar DOM removed before conversion; single References block per turn |
| `+1` artifacts | Removed via regex in `normalizeMarkdown()` |
| Empty `[](url)` links | Resolved to `[domain](url)` |
| Excessive blank lines | Collapsed to max one blank line between blocks |

---

## Version 4.0.0
2026-04-05

Critical rendering fix and complete UX redesign. v3.0.1 exported HTML files that rendered blank for some canvases (e.g., PAM vs Agonist Simulator, Pharmacodynamic Tuner) while others worked (Adenosine-Dopamine Receptor Interaction).

### Root Cause: Blank Exports

Two bugs caused exported canvases to render as empty dark pages:

| # | Bug | Impact | Fix |
|---|-----|--------|-----|
| 1 | **`#resize-target` layout breakage** | The export pipeline injected `<div id="resize-target" style="min-height:100vh;height:100vh">` into a `display:flex;flex-direction:column;overflow:hidden` body. Canvases whose widget CSS included a `#resize-target { position: absolute; width: 0; }` override (like the adenosine canvas) worked fine. Canvases that lacked this CSS rule (like both kratom canvases) had the div consume the entire viewport, pushing all dynamically-created widget DOM below the fold — hidden by `overflow:hidden`. | Changed resize-target inline style to `position:absolute;top:0;left:0;width:0;height:calc(100vh + 1px)` — always out of flow regardless of widget CSS |
| 2 | **`helperScript` detection whitespace mismatch** | Detection checked for exact strings `window.WH=`, `WidgetHelpers=`, `WidgetHelpers={`. Prettified widget code uses spaces: `window.WH = window.WidgetHelpers = {`. The exact match failed, causing the WH helper script to be misclassified. | Replaced string matching with regex: `/window\.WH\s*=/`, `/WidgetHelpers\s*[={]/` — tolerant of any whitespace around operators |

**Evidence from console logs (v3.0.1):**
```
Adenosine (works):  {cdnScripts: 1, helper: true,  logic: 1}  ← helper detected
Kratom PAM (blank): {cdnScripts: 6, helper: false, logic: 2}  ← helper NOT detected
Kratom Tuner (blank): {cdnScripts: 6, helper: false, logic: 2}  ← helper NOT detected
```

### New Feature: Floating Action Button (FAB)

Replaced per-canvas "Export Canvas" buttons with a single persistent floating button:

- Fixed position bottom-right corner, visible while scrolling any section of the page
- Gradient background matching the widget design system
- Badge showing count of detected canvases
- Pulse animation when new canvases are discovered
- Single click opens the full export panel

### New Feature: Multi-Canvas Export Panel

Modal panel replacing the simple filename dialog:

| Feature | Description |
|---------|-------------|
| **Canvas list** | Shows all detected canvases with checkboxes (default: all checked), title, type badge (Canvas 2D / D3/Plot / 3D Scene / Physics / Widget), and editable filename |
| **Type detection** | Auto-detects canvas type from WH API usage (`initCanvas`, `initD3`, `initPlot`, `initThree`, `initPhysics`) with color-coded badges |
| **Batch export** | Exports all selected canvases with a single click, staggered 500ms apart to avoid browser download blocking |
| **Select all / deselect all** | Toggle button to quickly select or deselect all canvases |
| **Dynamic count** | Export button shows live count of selected canvases, disabled when none selected |
| **Settings** | Dark mode toggle, full viewport toggle, embed metadata toggle |
| **Metadata fields** | Source URL (auto-filled from `location.href`, read-only), export date (auto-filled) |
| **Deduplication** | Registry prevents the same canvas from being listed twice (title + size comparison) |

### New Feature: Smart Filenames

Default filenames now follow the format: `Canvas_Title_MMDDYYYY_HHMMSS_AM/PM-TZ.html`

- Spaces in canvas title replaced with underscores
- Timestamp appended with date, time, AM/PM indicator, and timezone abbreviation
- Examples: `PAM_vs_Agonist_Simulator_04052026_091523_PM-EDT.html`
- Timezone detected via `Intl.DateTimeFormat` with `short` timezone name

### New Feature: Export Metadata

When "Embed metadata" is checked, exports include an HTML comment header:

```html
<!--
  Exported by Google AI Canvas Exporter v4.0.0
  Canvas: PAM vs Agonist Simulator
  Source: https://www.google.com/search?...
  Date:   Saturday, April 5, 2026 at 9:15:23 PM EDT
-->
```

### Architecture Changes

| Aspect | v3.0.1 | v4.0.0 |
|--------|--------|--------|
| **UI pattern** | Per-canvas "Export Canvas" button below each iframe | Single floating FAB + multi-canvas modal panel |
| **Export flow** | Click button → filename modal → single download | Click FAB → canvas list with checkboxes → batch download |
| **Canvas tracking** | Ephemeral (button + widgetHTML per iframe) | Centralized registry with title, type, and deduplication |
| **Filename** | User-typed, no timestamp | Auto-generated with underscores + timestamp, editable |
| **resize-target** | Inline `min-height:100vh;height:100vh` (breaks some canvases) | Inline `position:absolute;width:0` (safe for all canvases) |
| **Helper detection** | Exact string match (fails on prettified code) | Regex with `\s*` whitespace tolerance |

---

## Version 3.0.1
2026-04-05

### Fix: HTML entity decoding in comment extraction

The `<!--TgQPHd|…-->` comments contain HTML entities (`&quot;`, `&amp;`, `&#39;`) that are **not** decoded by the browser inside comment nodes (unlike element content). v3.0.0 passed the raw `comment.textContent` directly to `JSON.parse`, which choked on literal `&quot;` characters.

Fix: added `decodeEntities()` using a `<textarea>.innerHTML` round-trip to decode all HTML entities before JSON parsing.

**Console error that triggered this fix:**
```
[GCE] Comment JSON parse failed: Unexpected token '&', "[[&quot;\u00"... is not valid JSON
```

---

## Version 3.0.0
2026-04-05

Critical architecture redesign. v2.0.0 completely failed to detect any canvas widgets despite being loaded by Tampermonkey. Root cause: Google's sandbox infrastructure uses `document.open()` + `document.write()` inside the innermost shim iframe, which **destroys** the Tampermonkey-injected userscript, its MutationObserver, and all state before the widget HTML ever renders.

### Root Cause Analysis

Detailed investigation of live error data (console logs from `google.com`, raw HTML from three nested iframe layers, and three screenshot captures) revealed the true runtime architecture:

```
google.com/search (parent page — user sees the canvas here)
└── <iframe src="A.scf.usercontent.goog/search-sandbox/shim.html">
    └── Shim A creates <iframe src="B.scf.usercontent.goog/shim.html">
        └── Shim B receives widget HTML via postMessage
            → document.open() + document.write(widgetHTML)
            → ENTIRE document replaced — userscript obliterated
```

v2.0.0 matched `*://*.scf.usercontent.goog/*` and ran inside the shim iframes. The script loaded, scanned the initial empty shim document, found nothing, set up observers — then the shim infrastructure replaced the entire document with the widget HTML, destroying the script before it could ever detect the widget.

### Architecture Change

| Aspect | v2.0.0 | v3.0.0 |
|--------|--------|--------|
| **@match** | `*://*.scf.usercontent.goog/*` | `*://www.google.com/search*`, `*://*.google.com/search*` |
| **Runs on** | Inside sandboxed shim iframes (gets destroyed) | The google.com search page itself (stable, persistent) |
| **Widget HTML source** | Tried to read srcdoc attributes and contentDocument from inside iframes | Extracts from `<!--TgQPHd\|[…]-->` HTML comments embedded by Google adjacent to each canvas iframe |
| **Button placement** | Floating fixed-position button inside (destroyed) iframe | Button appended below each canvas widget on the google.com page |
| **Cross-origin issues** | Script ran in opaque-origin sandboxed frames, couldn't access parent or siblings | No cross-origin issues — everything is on google.com's DOM |

### How TgQPHd Comment Extraction Works

Google embeds the full widget HTML source in an HTML comment node adjacent to each canvas iframe in the search results DOM:

```html
<div class="tgEq3b">
    <iframe class="lQ27pc" src="…scf.usercontent.goog/…"></iframe>
</div>
<!--TgQPHd|[["<!DOCTYPE html>\n<html…WidgetHelpers…","500px",…]]-->
```

The comment text uses HTML entity encoding (`&quot;` → `"`) and JSON unicode escapes (`\u003c` → `<`). The extraction pipeline:

1. `TreeWalker(container, NodeFilter.SHOW_COMMENT)` finds all comment nodes near each canvas iframe
2. Filter for `TgQPHd|` prefix, skip empty `TgQPHd|[]` markers
3. `JSON.parse()` decodes the unicode escapes, producing the raw widget HTML
4. Recursive `findHTMLString()` traverses the parsed array to find the string containing `WidgetHelpers` or WH API calls

### Other Changes

| Change | Detail |
|--------|--------|
| **z-index** | Modal overlay uses `2147483647` (max int) to appear above Google's UI |
| **Toast positioning** | Centered at bottom of viewport instead of fixed right-side |
| **Diagnostic logging** | `console.log('[GCE]', …)` messages trace detection, extraction, and export for debugging |
| **60-second timeout** | Polling extended from 30s to 60s to handle slow-loading AI mode canvases |
| **Click propagation** | Export button uses `stopPropagation()` + `preventDefault()` to prevent Google's event handlers from intercepting clicks |
| **WeakSet tagging** | Prevents re-scanning the same iframe, supporting pages with multiple canvases |

---

## Version 2.0.0
2026-04-05

Complete rewrite addressing 10 critical defects in v1.0.0 discovered through rigorous analysis of the live Google AI Search canvas architecture, the manual export reference (`Adenosine-Dopamine_A2AR-DRD2_Interaction_Exported_Canvas.html`), raw saved Google Search pages (`kratom_pharmacology.html`, `genetic_pharmacological_precision_medicine.html`), and the detailed process walkthrough (`Gemini_Thinking_with_3.1_Pro_Exporting_Interactive_Google_Widget_Offline.md`).

**Note:** This version was validated against saved HTML files but failed against the live runtime architecture. See v3.0.0 for the fix.

### Architecture Fixes

| # | Issue | v1.0.0 Behavior | v2.0.0 Fix |
|---|-------|-----------------|------------|
| 1 | **Context blindness** | `MutationObserver` watched for `.widget-header` in the shim page's own DOM — but that element lives inside a child sandboxed srcdoc iframe and is never found | Three-strategy detection: (A) direct DOM elements, (B) `iframe.getAttribute('srcdoc')` parsing via `DOMParser`, (C) `contentDocument` access for same-origin srcdoc iframes |
| 2 | **Sandbox artifacts preserved** | Only filtered `data-sandbox-injected` on inline `<script>` elements | `isSandboxArtifact()` now also strips `<meta http-equiv="Content-Security-Policy">` headers and any sandbox-injected `<link>`/`<meta>` elements — the CSP blocked all script execution offline |
| 3 | **Ghost UI duplication** | Relied on not copying `<body>` innerHTML, but had no srcdoc extraction path | Body is reconstructed from scratch: only `#resize-target` + extracted logic `<script>` elements go into `<body>`. All pre-rendered DOM (`.widget-header`, `#viz`, `.viz-container`, `.control-grid`, `.widget-dashboard`) is explicitly excluded |
| 4 | **Script detection too narrow** | Only matched `window.WidgetHelpers` and `WH.createApp` | Now matches all 6 WH API entry points: `createApp`, `initCanvas`, `initD3`, `initPlot`, `initThree`, `initPhysics`. Helper detection also checks `window.WH=`, `WidgetHelpers=`, and `WidgetHelpers={` |

### Robustness Improvements

| # | Issue | v1.0.0 | v2.0.0 |
|---|-------|--------|--------|
| 5 | **`</script>` injection** | Used `.outerHTML` without escaping | `escapeScriptClose()` replaces `</script` with `<\/script` in all extracted content — HTML parser cannot prematurely close the tag; JavaScript interprets `\/` identically to `/` |
| 6 | **CDN false positives** | Excluded only `tailwindcss`, allowed `data:text/javascript` sandbox scripts through | Explicitly requires `gstatic.com`, `cdn.`, or `jsdelivr` in src; rejects `data:` URIs (Google's base64-encoded sandbox infrastructure scripts) |
| 7 | **Combined helper+logic scripts** | Assumed helper and logic are always in separate `<script>` blocks | Detects `helperHasLogic` case — if combined, the entire block is placed in `<body>` so `document.body` exists when `WH.createApp()` runs |
| 8 | **Missing fonts** | Extracted only what was found; no fallbacks | `DEFAULT_FONTS` array ensures Material Icons, Google Sans/Roboto, and KaTeX CSS are always present even when the widget embedded fonts as base64 `@font-face` |
| 9 | **Widget style detection** | Extracted ALL `<style>` elements indiscriminately, including unrelated page styles | `isWidgetStyle()` checks for 13 CSS markers (`--on-surface`, `.widget`, `.viz-`, `.xxs-`, `@font-face`, `:root`, `.control-grid`, `--chart-`, `--surface`, `--stroke`, `--ff-sans`, `.dash-pill`) to include only widget-relevant style blocks |
| 10 | **`WIDGET_INIT_DATA` not handled** | Missing entirely | Extracted and placed in `<head>` before the WH helpers, so widgets that depend on initial data load correctly |

### New Features

| Feature | Description |
|---------|-------------|
| **Light mode CSS override** | When dark mode is unchecked, injects a complete `:root` CSS override with 30+ light-mode color tokens covering all widget design system variables |
| **Full viewport height toggle** | Checkbox to set `#resize-target` to `100vh` for standalone use, or original `612.8px` for embedded-size display |
| **Toast notifications** | Success (green) and error (red) toast messages provide feedback after export |
| **Modal backdrop dismiss** | Click outside the modal or press the backdrop to close |
| **Proper element ID namespacing** | All injected elements use `gce-` prefix to avoid collisions with widget DOM |
| **30-second detection timeout** | Combined `MutationObserver` + polling with automatic cleanup instead of indefinite observation |

### Output Structure

The exported HTML precisely matches the structure of the manually-created reference export (`Adenosine-Dopamine_A2AR-DRD2_Interaction_Exported_Canvas.html`):

```
<head>
  ├── charset + viewport <meta>
  ├── <title>
  ├── Font <link> elements (with fallback defaults)
  ├── Widget <style> blocks (sandbox artifacts stripped)
  ├── Light-mode CSS <style> override (if enabled)
  ├── Config flags <script> (enableDynamicBorders, isDarkMode, etc.)
  ├── CDN dependency <script src="gstatic.com/...">
  ├── WIDGET_INIT_DATA <script> (if present)
  └── WH WidgetHelpers definition <script>
<body>
  ├── <div id="resize-target">
  └── Simulation logic <script> (WH.createApp + rendering)
```

### Metadata

- Updated `@description` to comprehensively describe all capabilities for Greasy Fork discoverability
- Added `@license MIT`
- Added `@compatible` declarations for all major browsers
- Added `@icon` SVG data URI
- Added `@homepageURL` and `@supportURL`
- Changed `@version` format from `2.0` to semver `2.0.0`
- Added `@run-at document-idle` (explicit)
- Added `@namespace` with Greasy Fork user URL

---

## Version 1.0.0
2026-04-04

Initial release. Basic proof-of-concept exporter for Google AI Search canvas widgets.

### Capabilities

- Matched `*://*.scf.usercontent.goog/*` to run inside the widget sandbox iframe
- `MutationObserver` watched for `.widget-header` to detect widget readiness
- Floating "Export Canvas" button injected into the page
- Modal dialog with filename input and dark mode toggle
- Extracted `<style>`, `<link rel="stylesheet">`, and `<script>` elements from the current document
- Filtered out `data-sandbox-injected` inline scripts and `tailwindcss` CDN scripts
- Identified the WidgetHelpers script via `window.WidgetHelpers` marker
- Identified the simulation logic script via `WH.createApp` marker
- Reconstructed standalone HTML with `#resize-target` div and clean body
- Blob URL download with `.html` extension

### Known Limitations (addressed in v2.0.0)

1. Detection only worked when widget rendered directly in the shim page's DOM; did not handle the nested srcdoc iframe architecture
2. No filtering of `<meta>` CSP sandbox artifacts
3. Only detected `WH.createApp` — missed `initCanvas`, `initD3`, `initPlot`, `initThree`, `initPhysics`
4. No `</script>` escaping in extracted content
5. No font fallback injection
6. No light mode CSS support (checkbox existed but was non-functional)
7. Hardcoded `resize-target` height at `612.8px`
8. No user feedback on export success or failure
9. No `WIDGET_INIT_DATA` extraction
10. Indiscriminate style extraction without widget CSS validation
