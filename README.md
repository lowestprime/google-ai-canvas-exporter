# Google AI Canvas Exporter

Export Google Search AI Mode conversations as Markdown and verified inline, side-panel, or legacy canvases as HTML. Version 5.0.11 remembers general export checkboxes across sessions when site storage is available, keeps canvas selections specific to each thread, and numbers unnamed inline canvases by page order when available. Conversation exports retain headings, citations, and balanced code fences; long first-prompt filenames are shortened automatically.

The userscript is deliberately fail-closed. It may be installed on broad `google.com/search` URL patterns for userscript-manager compatibility, but it creates no FAB, badge, panel, styles, export action, or long-running observer on an ordinary Search page. Empty AI Mode home also remains inactive. UI appears only on an AI Mode route after a complete prompt/response turn or a successfully extracted canvas is verified. A visible sandbox iframe alone is not counted as an exportable canvas.

## Background and Motivation

Google AI Mode can generate interactive widgets — live simulations, charts, 3D models, and physics demos — inline in a response or in a right-hand Canvas panel. Their previews render inside sandboxed `*.scf.usercontent.goog` iframes, which parent-page JavaScript cannot read directly under the same-origin policy. The right-hand Canvas source is sometimes exposed in the parent page; as of September 2026, some inline Canvases are not. If the userscript manager injects early into Google's nested HTTPS sandbox shim, the script forwards authored HTML to the Google tab before the shim navigates to a `blob:` document.

Manually exporting these widgets typically requires a tedious and manual multi-step process: navigating DevTools into nested iframes, decoding entity-encoded `srcdoc` attributes, identifying and removing sandbox-injected CSP `<meta>` tags and message-passing `<script>` blocks, stripping pre-rendered "Ghost UI" DOM elements that can cause duplication when the app script rebuilds the interface on load, locating and preserving the correct CDN dependency URL, and manually reconstructing a clean HTML document with the right script ordering.

The userscript exports both older widget-shell representations and the newer authored-HTML code surfaces without requiring privileged userscript grants.

## Architecture

Older WidgetHelpers canvases nest content across multiple layers:

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

For older canvases, the parent-page branch extracts WidgetHelpers HTML from adjacent `TgQPHd` comments. In the newer right-hand Canvas UI, the verified source is hidden under `[data-xid="mnldjf"]` beside `[aria-label="Canvas preview"]`. Some inline widgets have neither source in the parent DOM. Their nested HTTPS shim receives the original authored HTML/CSS/module as a trusted parent message before navigating to a blob page. The userscript forwards that bounded source to Google in the same tab. The top page accepts it only from the expected nested/outer frame WindowProxy, an `scf.usercontent.goog` origin, and the active route, then validates its authored module. A nonce-bound request to the blob document is retained as a fallback. No iframe is counted merely because it is visible. Google selectors and userscript-manager frame injection can change; inaccessible previews fail closed.

### Detection

1. A strict runtime route/evidence gate distinguishes ordinary Search, empty AI Mode home, real conversation threads, and decoded canvases.
2. A route-scoped observer inspects only relevant added nodes and coalesces discovery into debounced idle work.
3. Ordered conversation segments are built from classic `.CKgc1d` turns and newer mixed-content roots such as `[data-xid="pJN44d"]` / `.Eltaeb`. Detached snapshots retain prompts, response blocks, references, and canvas positions when Google unmounts the DOM.
4. Legacy canvas iframes use the adjacent `TgQPHd`/WidgetHelpers route. Right-hand Canvas panels use the hidden authored-HTML source. Inline widgets use the nested `scf.usercontent.goog/search-sandbox/shim.html` source handoff; blob-frame injection is an optional fallback, not a requirement. A separate lightweight observer covers the right-hand panel while conversation observation stays scoped to the thread; source edits refresh the in-memory record.

### Conversation Markdown

- Prompts come from classic `.ilZyRc.R7mRQb` / `.tonYlb` structures and the mixed-content `.Ax52xb` structure. Responses are the deepest substantive `[data-xid="VpUvz"]` / `[jsname="KFl8ub"]` blocks, not a whole Google UI wrapper.
- Only verified canvases are associated with segments and appear in Markdown as `> [Interactive Canvas: TITLE]` when inline. An unknown iframe never creates an invented `Interactive Canvas 1` placeholder.
- Opening the panel starts a bounded top-to-bottom hydration pass. It advances by about 75% of the viewport, waits for DOM quiet, caches newly mounted turns, stops after two stable bottom passes or the 30-second/200-step cap, and restores the original scroll position.
- Google role headings (including newer `[role="heading"][aria-level]` wrappers), paragraph divs, nested lists, tables, fenced/inline code, blockquotes, thematic breaks, and hard breaks are converted to Markdown. Citation markers are separated from preceding prose. Google's code-widget language label becomes the fence info string; its caution/copy UI is omitted. Code containing backticks receives a longer matching fence.
- `.WBgIic` citation UUIDs are resolved through hidden `TgQPHd` metadata. Saved pages with empty UUID markers use ordered, filtered source records from the same segment. Each cited response gets inline numbered links and one deduplicated `### References` block.
- Share/feedback controls, the `Shared / 0 files` attachment card, source carousels, policy UI, the inline-widget AI-generated notice, dialogs, sidebars, canvas DOM, favicons, thumbnails, and empty list sentinels are excluded. Google heading cards inside lists become valid list text rather than `- ##` lines. Related-result groups use one primary inline citation while retaining the other source URLs in that turn's References block.
- YAML string values are quoted, and frontmatter reports the actual hydrated turn count and exporter version.

### Legacy WidgetHelpers Extraction Pipeline

| Step | What | Why |
|------|------|-----|
| A | Extract `<link rel="stylesheet">` for Google Fonts, Material Icons, KaTeX CSS; inject defaults for any missing | Ensures fonts render offline or on first load |
| B | Extract `<style>` blocks matching widget CSS markers (`--on-surface`, `.widget`, `.viz-`, `.xxs-`, `@font-face`, etc.) | Preserves the complete widget design system |
| C | Extract `<script src="...">` for gstatic.com / cdn.jsdelivr CDN bundles; reject `data:` URIs and tailwindcss | Retains D3, Plot, Three.js, Matter.js, KaTeX, anime.js |
| D | Identify the WH (WidgetHelpers) definition script + simulation logic scripts using 6 API signatures | Separates framework from app code for correct `<head>`/`<body>` placement |
| E | Strip all `data-sandbox-injected` elements and CSP `<meta>` tags | Removes restrictions that block offline execution |
| F | Reconstruct body with only `#resize-target` + logic `<script>` — no pre-rendered DOM | Eliminates the Ghost UI duplication bug |

## Usage

1. Install only v5.0.11 of the userscript and disable earlier versions. Allow the userscript manager to run it in nested `https://*.scf.usercontent.goog/search-sandbox/shim.html*` frames. A Chrome Beta capture succeeded with Tampermonkey's **UserScripts API** setting; changing the manager-wide mode to Dynamic is **not** required by that observation and may affect other scripts. The older Blob regex `@include` remains removed. Open a real Google AI Mode conversation or canvas page (`udm=50`). Ordinary Google Search pages remain inactive even if they contain an iframe.
2. Wait for the bottom-right **FAB** to appear after exportable evidence is verified. No FAB on ordinary Search or empty AI Mode home is expected behavior.
3. Read the badge as the canvas count when canvases exist, otherwise as the cached conversation-segment count. The green dot means a complete text conversation snapshot exists.
4. Click the FAB. Conversation hydration starts automatically and the panel reports segment, prompt, text-response, canvas, character, and completion counts.
5. Review the complete raw Markdown and safely rendered side-by-side preview, plus the verified canvas cards and editable filenames. Authored inline titles are preferred; when Google's source has only a generic title, a canvas-specific nearby heading or distinct `Interactive Canvas N` label is used, never `AI Mode replied:`. Long prompt-derived thread filenames are compacted to topic words plus parenthesized acronyms; the full thread title and custom filename editing remain intact. Canvas default names and batch downloads are collision-safe. A warning identifies any visible inline preview whose source could not be captured; it is not silently counted. The preview switches to one column on narrow screens.
6. Choose **Export All**, **Conversation Only**, or **Canvases Only**. Conversation export waits for the active hydration pass; batch downloads remain staggered.

If the hydration safety cap is reached, every cached turn remains exportable and the panel/result is explicitly labeled partial.

Modern side canvases are exported as authored. Inline exports preserve the authored module, CSS, font/CDN references, and responsive layout while removing Google sandbox transport scripts and CSP. The initial React `#root` may be empty; its authored module populates it when the export opens. Legacy canvases use the existing reconstruction pipeline. Exports are standalone files, but CDN-hosted scripts, fonts, images, and API calls in the authored canvas still require network access unless already cached or embedded. Open exported HTML only if you trust the canvas code; local HTML retains its JavaScript behavior. If the manager cannot inject into the nested HTTPS shim early enough, inline export remains unavailable; the panel reports that limitation and does not create a fake download. The script logs source-free `bridge-ready` and `preload` signals on the Google page to distinguish injection from capture failures.

## Export Options

| Option | Default | Description |
|--------|---------|-------------|
| Filename | `Canvas_Title_MMDDYYYY_HHMMSS_AMPM-TZ.html` | Auto-generated with underscores and timestamp; editable per canvas |
| Dark mode | On | Legacy WidgetHelpers only: optional light-mode CSS variable override; modern HTML keeps its authored theme |
| Full viewport height | On | Legacy WidgetHelpers only: sizes `#resize-target`; modern HTML keeps its authored layout |
| Embed metadata | On | Adds an HTML comment header with canvas title, source URL, and export date |
| Batch export | All selected | Checkbox per canvas; "Select All / Deselect All" toggle; both Export All and Canvases Only honor unchecked cards; staggered downloads |

Conversation filenames use `{Short_Title}_{WEEKDAY}_{MMDDYYYY}_{HHMMSS}-{AM|PM}-{TZ}.md`. Short titles remain as entered; long instruction-like titles use up to five topic words, preserve up to four parenthesized acronyms, and cap the descriptive stem at 60 characters. Filenames remain editable.

The six general checkboxes—conversation inclusion, YAML frontmatter, Turn dates, Dark mode, Full viewport, and Embed metadata—are saved immediately when changed and reused for later threads. Another already-open tab picks up a change the next time its panel opens. Canvas-card selections and Select/Deselect Canvases are remembered for the same thread, for up to 20 recently changed threads; a new thread starts with every canvas selected. Thread titles, filenames, source URL, and export date remain per-export and are not stored. The script stores only booleans and short hashed route/canvas identifiers in Google-origin `localStorage`; it never stores conversation or canvas source there. Browser profiles do not share these settings. Private browsing or blocked/cleared site storage cannot preserve them across restarts; when a write is blocked, a warning appears and settings remain in memory only until the page closes.

## Supported Widget APIs

The script detects and correctly handles all six WidgetHelpers entry points:

| API | Use Case |
|-----|----------|
| `WH.createApp` | Standard widget with controls, dashboard, and visualization container |
| `WH.initCanvas` | 2D canvas-based simulations and animations |
| `WH.initD3` | D3.js-powered SVG visualizations |
| `WH.initPlot` | Observable Plot charts |
| `WH.initThree` | Three.js 3D scenes with OrbitControls |
| `WH.initPhysics` | Matter.js physics simulations |

## Requirements

- [Tampermonkey](https://www.tampermonkey.net/) or compatible userscript manager (Violentmonkey, Greasemonkey)
- Intended for current Chrome/Chromium and Firefox userscript managers. Fixture automation is browser-independent; live validation still depends on an authenticated Google AI Mode account and the current Google DOM.
- No `@grant` permissions required — runs with `@grant none`

## Development and Changelog

- [Install on Greasy Fork](https://greasyfork.org/en/scripts/572688-google-ai-canvas-exporter)
- [Browse the source on GitHub](https://github.com/lowestprime/google-ai-canvas-exporter)
- [Read the changelog](https://github.com/lowestprime/google-ai-canvas-exporter/blob/main/dev_logs/CHANGELOG.md)
