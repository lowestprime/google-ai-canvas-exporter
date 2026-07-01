# Google AI Canvas Exporter

One-click export of Google AI Search mode interactive canvas widgets — simulations, data visualizations, 3D scenes, and physics sandboxes — as fully self-contained offline HTML files. The script automatically detects Widget Shell V2 content inside Google's sandboxed `scf.usercontent.goog` iframes, strips sandbox/CSP restrictions, extracts the WidgetHelpers framework and simulation logic along with CDN dependencies (D3, Observable Plot, Three.js, Matter.js, KaTeX, anime.js), eliminates the "Ghost UI" duplication bug, injects fallback fonts, and reconstructs a clean standalone document with dark/light mode toggle and full-viewport sizing.

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

1. `MutationObserver` + polling watches for `<iframe>` elements with `src` containing `scf.usercontent.goog`
2. For each canvas iframe, `TreeWalker` searches the surrounding DOM for `<!--TgQPHd|…-->` comment nodes
3. `JSON.parse()` decodes the comment's JSON payload (unicode escapes like `\u003c` → `<`)
4. `findHTMLString()` recursively locates the widget HTML string (identified by `WidgetHelpers` or WH API markers)

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

1. Open a Google Search result that contains an AI-generated interactive canvas widget (AI Mode / AI Overview)
2. The widget renders inside an iframe — the userscript runs on the google.com page itself
3. A **floating action button (FAB)** appears in the bottom-right corner with a badge showing the count of detected canvases
4. Click the FAB to open the **Export Panel**
5. Review all detected canvases — each shows its title, type badge, and an editable filename
6. Toggle checkboxes to select which canvases to export (default: all selected)
7. Configure settings: dark/light mode, full viewport, metadata embedding
8. Click **Export Selected** — all checked canvases are downloaded as self-contained `.html` files

The exported files work completely offline (fonts require initial internet for first load, or are embedded via `@font-face` if the widget included them). Open any export in a browser to interact with the simulation exactly as it appeared on Google.

## Export Options

| Option | Default | Description |
|--------|---------|-------------|
| Filename | `Canvas_Title_MMDDYYYY_HHMMSS_AMPM-TZ.html` | Auto-generated with underscores and timestamp; editable per canvas |
| Dark mode | On | When off, injects a complete light-mode CSS variable override (30+ tokens) |
| Full viewport height | On | Sets `#resize-target` to full viewport for standalone use |
| Embed metadata | On | Adds an HTML comment header with canvas title, source URL, and export date |
| Batch export | All selected | Checkbox per canvas; "Select All / Deselect All" toggle; staggered downloads |

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
- Works on Chrome, Firefox, Edge, Opera, Safari, Brave
- No `@grant` permissions required — runs with `@grant none`