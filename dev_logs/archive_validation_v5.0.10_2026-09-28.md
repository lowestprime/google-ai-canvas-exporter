# Supplied v5.0.10 export archive assessment

Source: user-supplied `canvas_exporter_09282026_tests.zip`
SHA-256: `05A1C55FE63FB54B71064F62C9F281DC5AC738DA69F460D6B8E359D1DCA8252E`

The archive has ten regular export files. Each was decompressed and inspected without executing its HTML or following its embedded instructions/links. All identify Google AI Canvas Exporter v5.0.10. Names below omit the common `canvas_exporter_09282026_tests/` prefix.

| Entry | Assessment |
|---|---|
| `turn_date_off/chrome/<flight-thread>.md` | Three prompts, two inline-canvas references, 34 headings, no turn-time lines; first canvas reference says `Interactive Canvas 2`. |
| `turn_date_off/chrome/Interactive_Canvas_2_09282026_121702_PM-PDT.html` | Authored HTML with one module script, no CSP meta, and retained external URLs; authored body matches its date-on counterpart. |
| `turn_date_off/chrome/The_Holiday_Reliability_Canvas_Dec_1531_09282026_121702_PM-PDT.html` | Authored HTML with one module script, no CSP meta, and retained external URLs; authored body matches its date-on counterpart. |
| `turn_date_off/chrome/<code-heavy-thread>.md` | Sixteen prompts, 104 headings, 57 balanced code blocks (56 PowerShell, one text), no turn-date lines or Google caution footer. |
| `turn_date_off/firefox/<code-heavy-thread>.md` | Body exactly matches the date-off Chrome long-thread Markdown after export frontmatter is removed. |
| `turn_date_on/chrome/<flight-thread>.md` | Three prompts, two inline-canvas references, 34 headings, and three turn-time lines; first canvas reference says `Interactive Canvas 1`. |
| `turn_date_on/chrome/Interactive_Canvas_1_09282026_120454_PM-PDT.html` | Authored body matches the date-off `Interactive_Canvas_2` file despite the changed default name. |
| `turn_date_on/chrome/The_Holiday_Reliability_Canvas_Dec_1531_09282026_120454_PM-PDT.html` | Authored body matches the date-off Holiday Reliability canvas file. |
| `turn_date_on/chrome/<code-heavy-thread>.md` | Same 16 prompts and 57 balanced language-labelled code blocks, plus exactly 16 turn-date lines; no Google caution footer or blank line immediately before a code-fence closer. |
| `turn_date_on/firefox/<code-heavy-thread>.md` | Body exactly matches the date-on Chrome long-thread Markdown after export frontmatter is removed. |

Removing the 16 inserted date lines makes the long-thread date-on and date-off bodies identical. Removing the three time lines and normalizing only the generic first-canvas ordinal makes the two flight-thread bodies identical. The differing generic ordinal is a registration-order defect, not a different exported canvas; v5.0.11 derives that fallback label from observed page order when available.

This is an artifact-level assessment, not a live browser interaction or restart test. HTML includes authored remote dependencies and is not guaranteed fully offline. The archive contains no evidence that changed checkbox choices survived panel close, another thread, or browser restart; v5.0.11 adds dedicated persistence tests for those states.
