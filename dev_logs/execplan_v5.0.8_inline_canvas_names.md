# v5.0.8 inline canvas labels and download names

## Evidence and scope

Live signed-in Chrome Beta with Tampermonkey Beta set to **UserScripts API** and v5.0.7 showed three conversation segments and two verified inline canvases. Two distinct HTML files were downloaded and the Markdown placed a canvas marker in each canvas-bearing segment. Both cards and markers were nevertheless named `AI Mode replied:`, and the two default filenames were identical; Chrome saved the second with `(1)`. The source HTML has a generic `Generated Interactive Widget` title and an initially empty React root. In the live Google DOM, `.AdPoic[role="heading"]` within each segment says `AI Mode replied:`. This is UI chrome, not an authored canvas title.

## Implementation

1. Keep the verified source bridge, route/origin/iframe validation, side Canvas path, and legacy reconstruction unchanged.
2. Accept an authored HTML title or heading only when it is non-generic. For inline source with no authored title, consider a specific nearby canvas heading; otherwise use a numbered inline-canvas fallback based on conversation DOM position. Do not use Google's `AI Mode replied:` wrapper or unrelated response headings as a canvas title.
3. Generate unique default card filenames for equal titles and ensure every job in a batch has a unique case-insensitive filename, including user-edited collisions. Preserve the chosen name when it is already unique; add a numeric suffix only on collision.
4. Add regression fixtures/tests for two generic empty-root inline sources, separate Markdown markers, unique cards and export jobs, and retained side/legacy behavior.
5. Record the observed Chrome result separately from unverified opened-file interaction and Firefox. Update README, changelog, and browser matrix without claiming that the manager mode alone caused capture success.

## Validation

- `npm test`, Markdown and inline evidence validators, userscript syntax, and `git diff --check`.
- Check the two user-supplied HTML exports are distinct and contain authored modules; inspect opened-file behavior in Chrome where possible.
- After v5.0.8 is installed, confirm two accurate labels, unique downloads, both widgets work, and repeat Firefox/side/legacy checks. Unavailable live checks remain explicitly blocked.

## Progress

- 2026-09-27 PDT: Confirmed two distinct v5.0.7 HTML exports (44,943 and 50,744 bytes), two Markdown markers, and the live DOM `AI Mode replied:` title collision. User confirmed Tampermonkey `UserScripts API` mode.
- 2026-09-27 PDT: Implemented authored/nearby-canvas/numbered title priority, duplicate-title defaults, and case-insensitive batch filename deduplication. The targeted empty-root regression and all prior tests pass (29/29). Markdown validator passes three saved fixtures; inline evidence replay passes all three saved Google pages (three segments and two frames each, but no parent-DOM source). Syntax and diff checks pass.
- 2026-09-27 PDT: Inspected both v5.0.7 HTML files statically: distinct hashes, one module and root mount each, authored dependency references retained, no CSP or sandbox marker. Browser-control policy prohibits `file:` navigation, so opened-file interaction was not verified or bypassed. v5.0.8 installation, Chrome/Firefox live UI, side/legacy manual retests, and opened-file behavior remain pending in `manual_validation_v5.0.8.md`.
- 2026-09-27 PDT: User installed/reloaded v5.0.8 in signed-in Chrome Beta. The live panel shows three segments, two verified inline canvases, distinct labels/default names, and hidden uncaptured warning. Two distinct new HTML files and a three-prompt/two-marker Markdown file were inspected. Kept the authored HTML `<title>` unchanged to match the observed export; an uninstalled local-only title rewrite was removed. Opened-file interaction, manual side/legacy and Firefox remain pending.
- 2026-09-27 PDT: User confirmed both new HTML files render and respond interactively in Chrome Beta. This is user-reported, not agent-observed console or visual validation. No Firefox browser/app is connected in the computer-use inventory; Firefox and other manual matrix cases remain pending.
