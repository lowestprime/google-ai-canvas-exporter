# v5.0.11 manual validation — remembered exporter settings

Status (2026-09-28 PDT): automated checks pass; the supplied ZIP contains v5.0.10 exports, not a v5.0.11 restart replay. Signed-in Chrome Beta v5.0.11 installation/restart results are awaiting user confirmation. Firefox is no longer a live-test target for this change, per the user. The available browser-control surface blocks the Tampermonkey extension page, so it cannot install or inspect the script there.

## Automated evidence

| Check | Result |
|---|---|
| `npm test` | 40/40 pass, including fresh page instance with shared storage, another open tab, separate thread, blocked/malformed storage, late canvas arrival, selective canvas-only download, and out-of-order anonymous canvas source. |
| `npm run test:fixtures` | Three existing fixtures pass. |
| `node --check userscript/Google_AI_Canvas_Exporter.user.js` | Pass. |
| `git diff --check` | Pass. |
| Supplied v5.0.10 ZIP | Ten entries assessed in `archive_validation_v5.0.10_2026-09-28.md`; no entry tests preference retention. |

## Exact live replay

In the signed-in Chrome Beta profile:

1. Install only v5.0.11, disable older copies, reload a code-heavy AI Mode conversation, and open Export.
2. Turn off Turn dates and YAML frontmatter. Close and reopen the panel: both remain off and the preview omits their output. Navigate to a different thread: both remain off. Fully close and restart the browser; revisit AI Mode and verify both remain off.
3. In a mixed thread with two verified canvases, deselect one card. Close/reopen the panel, reload the thread, and restart the browser: that card remains deselected. Check a different thread: its canvases start selected. Canvases Only must download only the checked card.
4. Click Deselect Canvases, then allow a late inline canvas to appear. The new card should be unchecked. Click Select Canvases and verify all are checked again.
5. For a generic-title inline canvas, verify its default ordinal and filename are stable when re-exporting the same fully mounted thread. Check the resulting HTML still renders and responds to its authored controls.

Settings are local to each browser profile and Google origin. Private browsing, clearing site data, and policies blocking local storage prevent cross-restart persistence; a blocked write should yield a one-time warning but leave the current page usable. Modern authored canvases can still require their original CDN dependencies.
