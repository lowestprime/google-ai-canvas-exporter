# Google AI Canvas Exporter v5.0.3

Export complete Google Search AI Mode conversations as clean Markdown and interactive canvas widgets as self-contained offline HTML. v5.0.3 adds ordered mixed-content segments for threads where later prompts, responses, and canvases are rendered outside the first `.CKgc1d`; it also provides a full raw Markdown preview beside a safely rendered preview. The established v4 canvas reconstruction pipeline remains intact.

The userscript is deliberately fail-closed. It may be installed on broad `google.com/search` URL patterns for userscript-manager compatibility, but it creates no FAB, badge, panel, styles, export action, or long-running observer on an ordinary Search page. Empty AI Mode home also remains inactive. UI appears only after the current route contains either a complete prompt/response turn or a successfully decoded WidgetHelpers canvas.

## Background and Motivation

Google's AI Search mode ("AI Overview" / Gemini-powered results) can generate interactive canvas widgets — live simulations, charts, 3D models, and physics demos — directly in search results. These widgets are rendered inside deeply nested, sandboxed `<iframe>` elements hosted on `*.scf.usercontent.goog` with strict Content Security Policy headers and sandbox restrictions that make them impossible to save or reuse offline through conventional means.

Manually exporting these widgets typically requires a tedious and manual multi-step process: navigating DevTools into nested iframes, decoding entity-encoded `srcdoc` attributes, identifying and removing sandbox-injected CSP `<meta>` tags and message-passing `<script>` blocks, stripping pre-rendered "Ghost UI" DOM elements that cause duplication when the app script rebuilds the interface on load, locating and preserving the correct CDN dependency URL, and manually reconstructing a clean HTML document with the right script ordering.

This userscript automates that entire process into a single click.

## How It Works

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

1. A strict runtime route/evidence gate distinguishes ordinary Search, empty AI Mode home, real conversation threads, and decoded canvases.
2. A route-scoped observer inspects only relevant added nodes and coalesces discovery into debounced idle work.
3. Ordered conversation segments are built from classic `.CKgc1d` turns and newer mixed-content roots such as `[data-xid="pJN44d"]` / `.Eltaeb`. Detached snapshots retain prompts, response blocks, references, and canvas positions when Google unmounts the DOM.
4. For each canvas iframe, a `TreeWalker` searches the surrounding DOM for `<!--TgQPHd|…-->` comments and recursively locates WidgetHelpers HTML.

### Conversation Markdown

- Prompts come from classic `.ilZyRc.R7mRQb` / `.tonYlb` structures and the mixed-content `.Ax52xb` structure. Responses are the deepest substantive `[data-xid="VpUvz"]` / `[jsname="KFl8ub"]` blocks, not a whole Google UI wrapper.
- Canvases are associated with the nearest ordered segment and appear in Markdown as `> [Interactive Canvas: TITLE]` at their real position between response blocks.
- Opening the panel starts a bounded top-to-bottom hydration pass. It advances by about 75% of the viewport, waits for DOM quiet, caches newly mounted turns, stops after two stable bottom passes or the 30-second/200-step cap, and restores the original scroll position.
- Google role headings, paragraph divs, nested lists, tables, fenced/inline code, blockquotes, thematic breaks, and hard breaks are converted to Markdown.
- `.WBgIic` citation UUIDs are resolved through hidden `TgQPHd` metadata. Saved pages with empty UUID markers use ordered, filtered source records from the same segment. Each cited response gets inline numbered links and one deduplicated `### References` block.
- Share/feedback controls, source carousels, policy UI, dialogs, sidebars, canvas DOM, favicons, thumbnails, and empty list sentinels are excluded.
- YAML string values are quoted, and frontmatter reports the actual hydrated turn count and exporter version.

### Extraction Pipeline

| Step | What | Why |
|------|------|-----|
| A | Extract `<link rel="stylesheet">` for Google Fonts, Material Icons, KaTeX CSS; inject defaults for any missing | Ensures fonts render offline or on first load |
| B | Extract `<style>` blocks matching widget CSS markers (`--on-surface`, `.widget`, `.viz-`, `.xxs-`, `@font-face`, etc.) | Preserves the complete widget design system |
| C | Extract `<script src="...">` for gstatic.com / cdn.jsdelivr CDN bundles; reject `data:` URIs and tailwindcss | Retains D3, Plot, Three.js, Matter.js, KaTeX, anime.js |
| D | Identify the WH (WidgetHelpers) definition script + simulation logic scripts using 6 API signatures | Separates framework from app code for correct `<head>`/`<body>` placement |
| E | Strip all `data-sandbox-injected` elements and CSP `<meta>` tags | Removes restrictions that block offline execution |
| F | Reconstruct body with only `#resize-target` + logic `<script>` — no pre-rendered DOM | Eliminates the Ghost UI duplication bug |

## Usage

1. Open a real Google AI Mode conversation or a Search result containing an AI-generated interactive canvas.
2. Wait for the bottom-right **FAB** to appear after exportable evidence is verified. No FAB on ordinary Search or empty AI Mode home is expected behavior.
3. Read the badge as the canvas count when canvases exist, otherwise as the cached conversation-segment count. The green dot means a complete text conversation snapshot exists.
4. Click the FAB. Conversation hydration starts automatically and the panel reports segment, prompt, text-response, canvas, character, and completion counts.
5. Review the complete raw Markdown and the safely rendered side-by-side preview, plus title, filename, dates/frontmatter settings, canvases, filenames, theme, viewport, and metadata settings. The preview switches to one column on narrow screens.
6. Choose **Export All**, **Conversation Only**, or **Canvases Only**. Conversation export waits for the active hydration pass; batch downloads remain staggered.

If the hydration safety cap is reached, every cached turn remains exportable and the panel/result is explicitly labeled partial.

The exported files work completely offline (fonts require initial internet for first load, or are embedded via `@font-face` if the widget included them). Open any export in a browser to interact with the simulation exactly as it appeared on Google.

## Export Options

| Option | Default | Description |
|--------|---------|-------------|
| Filename | `Canvas_Title_MMDDYYYY_HHMMSS_AMPM-TZ.html` | Auto-generated with underscores and timestamp; editable per canvas |
| Dark mode | On | When off, injects a complete light-mode CSS variable override (30+ tokens) |
| Full viewport height | On | Sets `#resize-target` to full viewport for standalone use |
| Embed metadata | On | Adds an HTML comment header with canvas title, source URL, and export date |
| Batch export | All selected | Checkbox per canvas; "Select All / Deselect All" toggle; staggered downloads |

Conversation filenames use `{Title}_{WEEKDAY}_{MMDDYYYY}_{HHMMSS}-{AM|PM}-{TZ}.md`.

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

## Development and Validation

The distributed userscript remains dependency-free. Repository tests use `jsdom` only as a development dependency:

```powershell
npm ci
npm test
node test/validate-markdown.mjs
node --check userscript/Google_AI_Canvas_Exporter.user.js
git diff --check
```

`test/validate-markdown.mjs` executes the production userscript's test API against both five-turn saved pages and the Formal Classification mixed-content fixture. `test/exporter.test.mjs` covers URL gates, empty-home behavior, virtualized replacement, scroll hydration/restoration, classic and mixed-content Markdown/citations, exact canvas placement, full untruncated raw/rendered preview state, FAB state, observer coalescing, and canvas reconstruction invariants.
