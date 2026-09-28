# v5.0.10 validation — generic headings, code fences, and turn dates

Status (2026-09-28 PDT): **automated checks pass; signed-in v5.0.10 Chrome Beta and Firefox Nightly replay not yet confirmed.** Greasy Fork comments 669234 and 669235 describe v5.0.8, while the code-widget language/footer repair was already present in v5.0.9.

## Reproduction and automated coverage

- A sanitized two-turn fixture, `test/fixtures/code-widget-headings-dates.html`, mirrors the reported structure: response headings with only `role="heading"`, two `.aiModeUiCodeBlock__Container` widgets inside ordered list items, separate `.GlO4G` language labels, `.iMHp6c` caution/copy chrome, extra trailing source newlines and whitespace-only lines, a citation, and distinct turn timestamps.
- Before the v5.0.10 fix, the fixture exported those generic headings as plain lines and left a blank line before each code fence closer. A date-enabled export already placed its timestamps before each response; the new assertions lock down that behavior and verify the off state.
- Expected v5.0.10 output: `## Solution …` headings; `toml` and `bash` on fence openers; no caution/copy text or language labels outside fences; no extra blank before a closer; one timestamp per turn when enabled, none when disabled, while a date-like string inside code stays literal.

| Check | Outcome |
|---|---|
| Focused fixture before fix | Fails on generic headings and surplus code newlines, as expected. |
| Focused fixture after fix | Pass. |
| `npm test` | 32/32 pass. |
| `npm run test:fixtures` | 3/3 pass. |
| `node --check userscript/Google_AI_Canvas_Exporter.user.js` | Pass. |
| `git diff --check` | Pass. |

## Live-browser retest

A read-only inspection of the signed-in long code-heavy share in connected Chrome found 57 current `.aiModeUiCodeBlock__Container` nodes; the first eight inspected each had a `<pre>`, a separate language label, a caution element, and trailing whitespace in the code source. This corroborates the fixture shape but **does not** validate v5.0.10 output. The connected browser is Chrome, not the user's distinct Chrome Beta profile, and the new script was not installed through this inspection. Firefox Nightly is not exposed by the connected browser-control surface.

1. Update the single enabled userscript to v5.0.10 in signed-in Chrome Beta and Firefox Nightly; reload the long code-heavy AI Mode thread.
2. Export with **Turn dates** enabled and disabled. Confirm the correct number of timestamps, headings, list-contained language-labelled fences, citation spacing, and absence of Google's caution/copy controls. Compare the rendered preview with the downloaded Markdown.
3. Recheck the known mixed flight-delay thread: three segments, two distinct inline canvas names/files, and interactive HTML when opened. Recheck one side or legacy canvas if available.

Known limits: Firefox Nightly is not exposed by the connected browser-control surface, and changing the user's Tampermonkey script in Chrome Beta is not available through that surface. The quoted Greasy Fork sample is obfuscated and predates this release. The userscript cannot reconstruct original prompt formatting when Google's prompt DOM is flattened, and inaccessible sandbox frames remain non-exportable. Modern authored HTML may require its original CDN dependencies.
