[Google AI Canvas Exporter INFO](https://greasyfork.org/en/scripts/572688-google-ai-canvas-exporter)
-------------------------------------

Export Google AI Search mode conversations as clean Markdown and interactive canvas widgets as self-contained offline HTML. Conversation export captures all user/AI turns with inline citations, compact reference blocks, YAML frontmatter, and smart filenames. Canvas export detects Widget Shell V2 in sandboxed scf.usercontent.goog iframes, strips CSP/sandbox artifacts, extracts WidgetHelpers + CDN deps, and supports batch download via a unified floating export panel.

[Reinstall version 5.0.1](https://update.greasyfork.org/scripts/572688/Google%20AI%20Canvas%20Exporter.user.js)[?](/en/help/installing-user-scripts "How to install")
Author

[lowestprime](/en/users/823161-lowestprime)

Daily installs

0

Total installs

13

Ratings

0 0 0

Version

5.0.1

Created

2026-04-05

Updated

2026-06-30

Size

53.2 KB

License

[MIT](https://spdx.org/licenses/MIT.html "MIT License")

Applies to

*   [google.com](/en/scripts/by-site/google.com "See 2649 other scripts for google.com")

Google AI Canvas Exporter
=========================

One-click export of Google AI Search mode interactive canvas widgets — simulations, data visualizations, 3D scenes, and physics sandboxes — as fully self-contained offline HTML files. The script automatically detects Widget Shell V2 content inside Google's sandboxed `scf.usercontent.goog` iframes, strips sandbox/CSP restrictions, extracts the WidgetHelpers framework and simulation logic along with CDN dependencies (D3, Observable Plot, Three.js, Matter.js, KaTeX, anime.js), eliminates the "Ghost UI" duplication bug, injects fallback fonts, and reconstructs a clean standalone document with dark/light mode toggle and full-viewport sizing.

Background and Motivation
-------------------------

Google's AI Search mode ("AI Overview" / Gemini-powered results) can generate interactive canvas widgets — live simulations, charts, 3D models, and physics demos — directly in search results. These widgets are rendered inside deeply nested, sandboxed `<iframe>` elements hosted on `*.scf.usercontent.goog` with strict Content Security Policy headers and sandbox restrictions that make them impossible to save or reuse offline through conventional means.

Manually exporting these widgets typically requires a tedious and manual multi-step process: navigating DevTools into nested iframes, decoding entity-encoded `srcdoc` attributes, identifying and removing sandbox-injected CSP `<meta>` tags and message-passing `<script>` blocks, stripping pre-rendered "Ghost UI" DOM elements that cause duplication when the app script rebuilds the interface on load, locating and preserving the correct CDN dependency URL, and manually reconstructing a clean HTML document with the right script ordering.

This userscript automates that entire process into a single click.

How It Works
------------

Google's canvas widget architecture nests content across multiple layers:

```
google.com/search (parent page — user sees the canvas here)
├── <div class="emqXtf">              Google's widget container
│   ├── <div class="MngkG">           Canvas sizing wrapper
│   │   └── <div class="tgEq3b">      iframe host
│   │       └── <iframe src="A.scf.usercontent.goog/search-sandbox/shim.html">
│   │           └── Shim A creates another iframe → B.scf.usercontent.goog
│   │               └── Shim B does document.write(widgetHTML)
│   └── <!--TgQPHd|[["<!DOCTYPE html>...WidgetHelpers...",...]]-->
│                    ↑ Google embeds the full widget HTML source here
└── (more widgets...)
```

**Key insight (v3.0.0):** The userscript runs on **google.com** (not inside the sandbox iframes). Google embeds the complete widget HTML source in `<!--TgQPHd|[…]-->` HTML comment nodes adjacent to each canvas iframe in the search results DOM. The script extracts widget HTML directly from these comments — no cross-origin iframe access needed.

### Detection

1.  `MutationObserver` + polling watches for `<iframe>` elements with `src` containing `scf.usercontent.goog`
2.  For each canvas iframe, `TreeWalker` searches the surrounding DOM for `<!--TgQPHd|…-->` comment nodes
3.  `JSON.parse()` decodes the comment's JSON payload (unicode escapes like `\u003c` → `<`)
4.  `findHTMLString()` recursively locates the widget HTML string (identified by `WidgetHelpers` or WH API markers)

### Extraction Pipeline

| Step | What | Why |
| --- | --- | --- |
| A | Extract `<link rel="stylesheet">` for Google Fonts, Material Icons, KaTeX CSS; inject defaults for any missing | Ensures fonts render offline or on first load |
| B | Extract `<style>` blocks matching widget CSS markers (`--on-surface`, `.widget`, `.viz-`, `.xxs-`, `@font-face`, etc.) | Preserves the complete widget design system |
| C | Extract `<script src="...">` for gstatic.com / cdn.jsdelivr CDN bundles; reject `data:` URIs and tailwindcss | Retains D3, Plot, Three.js, Matter.js, KaTeX, anime.js |
| D | Identify the WH (WidgetHelpers) definition script + simulation logic scripts using 6 API signatures | Separates framework from app code for correct `<head>`/`<body>` placement |
| E | Strip all `data-sandbox-injected` elements and CSP `<meta>` tags | Removes restrictions that block offline execution |
| F | Reconstruct body with only `#resize-target` + logic `<script>` — no pre-rendered DOM | Eliminates the Ghost UI duplication bug |

Usage
-----

1.  Open a Google Search result that contains an AI-generated interactive canvas widget (AI Mode / AI Overview)
2.  The widget renders inside an iframe — the userscript runs on the google.com page itself
3.  A **floating action button (FAB)** appears in the bottom-right corner with a badge showing the count of detected canvases
4.  Click the FAB to open the **Export Panel**
5.  Review all detected canvases — each shows its title, type badge, and an editable filename
6.  Toggle checkboxes to select which canvases to export (default: all selected)
7.  Configure settings: dark/light mode, full viewport, metadata embedding
8.  Click **Export Selected** — all checked canvases are downloaded as self-contained `.html` files

The exported files work completely offline (fonts require initial internet for first load, or are embedded via `@font-face` if the widget included them). Open any export in a browser to interact with the simulation exactly as it appeared on Google.

Export Options
--------------

| Option | Default | Description |
| --- | --- | --- |
| Filename | `Canvas_Title_MMDDYYYY_HHMMSS_AMPM-TZ.html` | Auto-generated with underscores and timestamp; editable per canvas |
| Dark mode | On | When off, injects a complete light-mode CSS variable override (30+ tokens) |
| Full viewport height | On | Sets `#resize-target` to full viewport for standalone use |
| Embed metadata | On | Adds an HTML comment header with canvas title, source URL, and export date |
| Batch export | All selected | Checkbox per canvas; "Select All / Deselect All" toggle; staggered downloads |

Supported Widget APIs
---------------------

The script detects and correctly handles all six WidgetHelpers entry points:

| API | Use Case |
| --- | --- |
| `WH.createApp` | Standard widget with controls, dashboard, and visualization container |
| `WH.initCanvas` | 2D canvas-based simulations and animations |
| `WH.initD3` | D3.js-powered SVG visualizations |
| `WH.initPlot` | Observable Plot charts |
| `WH.initThree` | Three.js 3D scenes with OrbitControls |
| `WH.initPhysics` | Matter.js physics simulations |

Requirements
------------

*   [Tampermonkey](https://www.tampermonkey.net/) or compatible userscript manager (Violentmonkey, Greasemonkey)
*   Works on Chrome, Firefox, Edge, Opera, Safari, Brave
*   No `@grant` permissions required — runs with `@grant none`

[Google AI Canvas Exporter HISTORY](https://greasyfork.org/en/scripts/572688-google-ai-canvas-exporter/versions)
----------------------------------------

Export Google AI Search mode conversations as clean Markdown and interactive canvas widgets as self-contained offline HTML. Conversation export captures all user/AI turns with inline citations, compact reference blocks, YAML frontmatter, and smart filenames. Canvas export detects Widget Shell V2 in sandboxed scf.usercontent.goog iframes, strips CSP/sandbox artifacts, extracts WidgetHelpers + CDN deps, and supports batch download via a unified floating export panel.

These are versions of this script where the code was updated. [Show all versions.](/en/scripts/572688-google-ai-canvas-exporter/versions?show_all_versions=1)

*    [v5.0.1](/en/scripts/572688-google-ai-canvas-exporter?version=1864440) 2026-06-30
    
    Version 5.0.1
    -------------
    
    2026-06-30
    
    Critical performance hotfix. v5.0.0 froze Google AI Mode pages in Chrome and Firefox and prevented the export FAB from appearing.
    
    ### Root Cause
    
    `updateFABBadge()` called full `extractConversationTurns()` on every DOM mutation via `MutationObserver`, plus on the 2s poll interval. AI Mode pages mutate continuously during streaming, triggering thousands of full DOM walks, `innerText` layout reflows, and forced `offsetWidth` repaints per second.
    
    ### Fixes
    
    | Change | Detail |
    | --- | --- |
    | **Observer restored to v4 pattern** | `MutationObserver(scan)` only — no badge work on mutations |
    | **Cheap badge state** | `getCheapTurnCount()` counts turn roots only; full extraction on panel open / export |
    | **Debounced badge refresh** | `scheduleBadgeUpdate()` at 400ms, called from canvas discovery and AI Mode poll only |
    | **AI Mode gate** | `isAIModePage()` + removed `document.body` fallback from `getConversationHost()` |
    | **No innerText in hot paths** | `textContent` on targeted elements only in `extractUserText`, `extractTurnDate`, `findCanvasPlaceholder` |
    | **Deferred preview** | `buildConversationMarkdown()` runs in `requestIdleCallback` after panel opens |
    | **Animation on change only** | `gce-pop` reflow restart only when canvas or turn count actually changes |
    | **Safe FAB init** | FAB appends immediately with badge `0`; no sync extraction at startup |
    
*    [v5.0.0](/en/scripts/572688-google-ai-canvas-exporter?version=1864430) 2026-06-30
    
    Version 5.0.0
    -------------
    
    2026-06-30
    
    Unified export panel with full Google AI Mode conversation markdown export alongside the existing canvas HTML batch export.
    
    ### New Feature: Conversation Markdown Export
    
    | Feature | Description |
    | --- | --- |
    | **Turn extraction** | Scans `[data-xid="aim-mars-turn-root"]` for user prompts (`.tonYlb` / `[data-xid="VpUvz"]`) and AI responses (`.CKgc1d`), with sibling fallback when turn roots are absent |
    | **Clean markdown** | Inline Trusted-Types-safe tree walker converts AI blocks to markdown — no Turndown/marked dependencies |
    | **Citation handling** | Numbered inline `[n](url)` refs plus one compact `### References` block per AI turn; favicon/thumbnail images and source-card bullet noise stripped |
    | **YAML frontmatter** | Optional metadata: title, source URL, export timestamp, turn count, exporter version |
    | **Smart filenames** | \`{Title}_{WEEKDAY}_{MMDDYYYY}\_{HHMMSS}-{AM\\ |
    | **Partial history warning** | UI shows turn count and warns when fewer than 2 turns are loaded (Google virtualizes older turns until scrolled) |
    
    ### New Feature: Unified Export Panel
    
    Replaces the canvas-only modal with a single panel for both export types:
    
    | Section | Description |
    | --- | --- |
    | **Conversation** | Thread title (editable), turn count badge, live preview (~3,000 chars), markdown filename, frontmatter/dates toggles |
    | **Canvases** | Existing multi-canvas cards with type badges, checkboxes, and HTML export settings |
    | **Actions** | **Export All** (`.md` + selected `.html`, 500ms stagger), **Conversation Only**, **Canvases Only** |
    
    ### FAB Updates
    
    *   Always visible on Google Search pages (not only when canvases are detected)
    *   Green dot indicator when a conversation is exportable
    *   Badge shows canvas count, or turn count when no canvases are present
    
    ### Defects Fixed (vs. incomplete V1/V2 markdown exports)
    
    | Defect | Fix |
    | --- | --- |
    | Favicon / thumbnail `![](…)` blocks | Stripped in DOM walker and `normalizeMarkdown()` post-process |
    | Duplicate citation blocks (numbered refs + source-card bullets) | Citation bar DOM removed before conversion; single References block per turn |
    | `+1` artifacts | Removed via regex in `normalizeMarkdown()` |
    | Empty `[](url)` links | Resolved to `[domain](url)` |
    | Excessive blank lines | Collapsed to max one blank line between blocks |
    
*    [v4.0.0](/en/scripts/572688-google-ai-canvas-exporter?version=1791415) 2026-04-06
    
    Version 4.0.0
    -------------
    
    2026-04-05
    
    Critical rendering fix and complete UX redesign. v3.0.1 exported HTML files that rendered blank for some canvases (e.g., PAM vs Agonist Simulator, Pharmacodynamic Tuner) while others worked (Adenosine-Dopamine Receptor Interaction).
    
    ### Root Cause: Blank Exports
    
    Two bugs caused exported canvases to render as empty dark pages:
    
    | # | Bug | Impact | Fix |
    | --- | --- | --- | --- |
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
    
    *   Fixed position bottom-right corner, visible while scrolling any section of the page
    *   Gradient background matching the widget design system
    *   Badge showing count of detected canvases
    *   Pulse animation when new canvases are discovered
    *   Single click opens the full export panel
    
    ### New Feature: Multi-Canvas Export Panel
    
    Modal panel replacing the simple filename dialog:
    
    | Feature | Description |
    | --- | --- |
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
    
    *   Spaces in canvas title replaced with underscores
    *   Timestamp appended with date, time, AM/PM indicator, and timezone abbreviation
    *   Examples: `PAM_vs_Agonist_Simulator_04052026_091523_PM-EDT.html`
    *   Timezone detected via `Intl.DateTimeFormat` with `short` timezone name
    
    ### New Feature: Export Metadata
    
    When "Embed metadata" is checked, exports include an HTML comment header:
    
    ```
    <!--
      Exported by Google AI Canvas Exporter v4.0.0
      Canvas: PAM vs Agonist Simulator
      Source: https://www.google.com/search?...
      Date:   Saturday, April 5, 2026 at 9:15:23 PM EDT
    -->
    ```
    
    ### Architecture Changes
    
    | Aspect | v3.0.1 | v4.0.0 |
    | --- | --- | --- |
    | **UI pattern** | Per-canvas "Export Canvas" button below each iframe | Single floating FAB + multi-canvas modal panel |
    | **Export flow** | Click button → filename modal → single download | Click FAB → canvas list with checkboxes → batch download |
    | **Canvas tracking** | Ephemeral (button + widgetHTML per iframe) | Centralized registry with title, type, and deduplication |
    | **Filename** | User-typed, no timestamp | Auto-generated with underscores + timestamp, editable |
    | **resize-target** | Inline `min-height:100vh;height:100vh` (breaks some canvases) | Inline `position:absolute;width:0` (safe for all canvases) |
    | **Helper detection** | Exact string match (fails on prettified code) | Regex with `\s*` whitespace tolerance |
    
*    [v3.0.1](/en/scripts/572688-google-ai-canvas-exporter?version=1791395) 2026-04-05Version 3.0.1
    -------------
    
    2026-04-05
    
    ### Fix: HTML entity decoding in comment extraction
    
    The `<!--TgQPHd|…-->` comments contain HTML entities (`"`, `&`, `'`) that are **not** decoded by the browser inside comment nodes (unlike element content). v3.0.0 passed the raw `comment.textContent` directly to `JSON.parse`, which choked on literal `"` characters.
    
    Fix: added `decodeEntities()` using a `<textarea>.innerHTML` round-trip to decode all HTML entities before JSON parsing.
    
    **Console error that triggered this fix:**
    
    ```
    [GCE] Comment JSON parse failed: Unexpected token '&', "[["\u00"... is not valid JSON
    ```
    
*    [v3.0.0](/en/scripts/572688-google-ai-canvas-exporter?version=1791388) 2026-04-05
    
    Version 3.0.0
    -------------
    
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
    | --- | --- | --- |
    | **@match** | `*://*.scf.usercontent.goog/*` | `*://www.google.com/search*`, `*://*.google.com/search*` |
    | **Runs on** | Inside sandboxed shim iframes (gets destroyed) | The google.com search page itself (stable, persistent) |
    | **Widget HTML source** | Tried to read srcdoc attributes and contentDocument from inside iframes | Extracts from ``\`<!--TgQPHd\\`` |
    | **Button placement** | Floating fixed-position button inside (destroyed) iframe | Button appended below each canvas widget on the google.com page |
    | **Cross-origin issues** | Script ran in opaque-origin sandboxed frames, couldn't access parent or siblings | No cross-origin issues — everything is on google.com's DOM |
    
    ### How TgQPHd Comment Extraction Works
    
    Google embeds the full widget HTML source in an HTML comment node adjacent to each canvas iframe in the search results DOM:
    
    ```
    <div class="tgEq3b">
        <iframe class="lQ27pc" src="…scf.usercontent.goog/…"></iframe>
    </div>
    <!--TgQPHd|[["<!DOCTYPE html>\n<html…WidgetHelpers…","500px",…]]-->
    ```
    
    The comment text uses HTML entity encoding (`"` → `"`) and JSON unicode escapes (`\u003c` → `<`). The extraction pipeline:
    
    1.  `TreeWalker(container, NodeFilter.SHOW_COMMENT)` finds all comment nodes near each canvas iframe
    2.  Filter for `TgQPHd|` prefix, skip empty `TgQPHd|[]` markers
    3.  `JSON.parse()` decodes the unicode escapes, producing the raw widget HTML
    4.  Recursive `findHTMLString()` traverses the parsed array to find the string containing `WidgetHelpers` or WH API calls
    
    ### Other Changes
    
    | Change | Detail |
    | --- | --- |
    | **z-index** | Modal overlay uses `2147483647` (max int) to appear above Google's UI |
    | **Toast positioning** | Centered at bottom of viewport instead of fixed right-side |
    | **Diagnostic logging** | `console.log('[GCE]', …)` messages trace detection, extraction, and export for debugging |
    | **60-second timeout** | Polling extended from 30s to 60s to handle slow-loading AI mode canvases |
    | **Click propagation** | Export button uses `stopPropagation()` + `preventDefault()` to prevent Google's event handlers from intercepting clicks |
    | **WeakSet tagging** | Prevents re-scanning the same iframe, supporting pages with multiple canvases |
    
*    [v2.0.3](/en/scripts/572688-google-ai-canvas-exporter?version=1791366) 2026-04-05
    
    Minor syntax revision
    
*    [v2.0.2](/en/scripts/572688-google-ai-canvas-exporter?version=1791365) 2026-04-05
    
    \## Additional icon optimizations  
      
    \* The \*\*left widget panel is bigger\*\* and occupies more of the square, so it still reads as a screen/canvas at 16×16.  
    \* The \*\*export arrow is thicker and shorter\*\*, so it survives downscaling instead of dissolving.  
    \* The \*\*file shape is larger and simpler\*\*, with enough fold/detail to read as a document.  
    \* The \*\*background-to-object ratio is tighter\*\*, so less space is wasted on non-semantic padding.  
    \* The \*\*dark-left / white-right contrast\*\* makes the “export to standalone file” story legible almost instantly.
    
*    [v2.0.1](/en/scripts/572688-google-ai-canvas-exporter?version=1791357) 2026-04-05
    
    updated @icon
    
*    [v2.0.0](/en/scripts/572688-google-ai-canvas-exporter?version=1791348) 2026-04-05