import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const userscript = readFileSync(resolve(root, 'userscript/Google_AI_Canvas_Exporter.user.js'), 'utf8');

export function loadUserscript(
    html,
    url = 'https://www.google.com/search?udm=50&q=fixture',
    { testMode = true } = {}
) {
    const virtualConsole = new VirtualConsole();
    const dom = new JSDOM(html, {
        url,
        runScripts: 'outside-only',
        pretendToBeVisual: true,
        virtualConsole
    });
    if (testMode) dom.window.__GCE_TEST_MODE__ = true;
    dom.window.eval(userscript);
    return { dom, window: dom.window, document: dom.window.document, api: dom.window.__GCE_TEST_API__ };
}

export function readRepoFile(relativePath) {
    return readFileSync(resolve(root, relativePath), 'utf8');
}

export { root };
