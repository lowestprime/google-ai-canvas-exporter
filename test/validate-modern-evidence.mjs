import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { loadUserscript } from './load-userscript.mjs';

const [pagePath, sourcePath] = process.argv.slice(2);
if (!pagePath || !sourcePath) {
    console.error('Usage: node test/validate-modern-evidence.mjs <expanded-dom.html> <canvas-source.html>');
    process.exit(2);
}

const page = readFileSync(pagePath, 'utf8');
const original = readFileSync(sourcePath, 'utf8');
const { dom, api, document } = loadUserscript(page);
const counts = {
    turns: document.querySelectorAll('.CKgc1d').length,
    sources: document.querySelectorAll('[data-xid="mnldjf"]').length,
    previews: document.querySelectorAll('iframe.lQ27pc').length
};
assert.equal(counts.turns, 2);
assert.equal(counts.sources, 1);
assert.equal(counts.previews, 1);
assert.equal(api.scanCanvases(document), 1);
const [record] = api.getRegistry();
assert.equal(record.format, 'modern');
assert.equal(record.title, 'Frontier AI Intelligence & Pareto Matrix');
assert.match(record.widgetHTML, /Frontier AI Cross-Model Analytics/);
assert.match(record.widgetHTML, /function switchTab/);
assert.match(record.widgetHTML, /cdn\.tailwindcss\.com/);
const clean = value => value.replace(/\s+/g, '');
assert.equal(clean(record.widgetHTML), clean(original), 'hidden source must match the supplied standalone canvas except whitespace');
const output = api.buildCanvasExportHTML(record, {
    title: record.title, srcURL: 'https://www.google.com/search?udm=50&q=fixture',
    meta: true, isDark: true, fullVP: true
});
const exported = new dom.window.DOMParser().parseFromString(output, 'text/html');
assert.equal(exported.title, 'Frontier AI Intelligence & Pareto Matrix');
assert.equal(exported.querySelectorAll('button[id^="tab-"]').length, 4);
for (const script of exported.querySelectorAll('script:not([src])')) {
    if (script.textContent.trim()) new vm.Script(script.textContent);
}
const turns = api.extractConversationTurns();
assert.equal(turns.length, 2);
const markdown = api.buildConversationMarkdown({ turns, frontmatter: false });
assert.doesNotMatch(markdown, /(?:^|\n)# Shared|(?:^|\n)0 files/);
assert.doesNotMatch(markdown, /Interactive Canvas 1/);
console.log(JSON.stringify({ counts, registeredCanvases: 1, title: record.title,
    sourceCharacters: record.widgetHTML.length, exportedCharacters: output.length,
    conversationSegments: turns.length, scriptsSyntaxChecked: exported.querySelectorAll('script:not([src])').length }, null, 2));
api.stopCanvasObserver();
dom.window.close();
