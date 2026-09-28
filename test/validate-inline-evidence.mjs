import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadUserscript } from './load-userscript.mjs';

const files = process.argv.slice(2);
if (!files.length) {
    console.error('Usage: node test/validate-inline-evidence.mjs <saved-google-page.html> [...]');
    process.exit(2);
}

for (const file of files) {
    const { dom, api, document } = loadUserscript(readFileSync(file, 'utf8'));
    const iframes = [...document.querySelectorAll('.MngkG iframe.lQ27pc')];
    const segments = api.getConversationSegments();
    const sources = document.querySelectorAll('[data-xid="mnldjf"]');
    assert.equal(segments.length, 3, `${file}: three conversation segments`);
    assert.equal(iframes.length, 2, `${file}: two inline widget frames`);
    assert.equal(sources.length, 0, `${file}: no side-panel HTML source`);
    assert.ok(iframes.every(iframe => api.isInlineCanvasIframe(iframe)));
    assert.equal(api.scanCanvases(document), 0, `${file}: no unverified canvas counts`);
    assert.equal(api.getRegistry().length, 0);
    assert.equal(api.extractConversationTurns().length, 3);
    console.log(JSON.stringify({ file, segments: segments.length, inlineFrames: iframes.length,
        topLevelSources: sources.length, verifiedCanvases: api.getRegistry().length }));
    dom.window.close();
}
