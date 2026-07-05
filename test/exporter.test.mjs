import test from 'node:test';
import assert from 'node:assert/strict';
import { loadUserscript, readRepoFile } from './load-userscript.mjs';

const formattingFixture = readRepoFile('test/fixtures/conversation-formatting.html');
const virtualOne = readRepoFile('test/fixtures/virtual-turn-1.html');
const virtualTwo = readRepoFile('test/fixtures/virtual-turn-2.html');
const formalFixture = readRepoFile('dev_artifacts/Single_File_Export_Formal_Classification_of_Fine_Hardwood_Furniture_Google_Search_07042026_114124_AM-PST.html');
const plain = value => JSON.parse(JSON.stringify(value));

const widgetHTML = `<!doctype html>
<html><head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto">
<style>:root { --surface: #111; --on-surface: #eee; } .widget { display: block; min-height: 100px; }</style>
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<script data-sandbox-injected>window.GhostMarker = true;</script>
<script>window.WH   = window.WidgetHelpers = { createApp(){}, initCanvas(){}, initD3(){}, initPlot(){}, initThree(){}, initPhysics(){} };</script>
</head><body>
<script>
WH.createApp({ title: "Fixture Canvas" });
WH.initCanvas({}); WH.initD3({}); WH.initPlot({}); WH.initThree({}); WH.initPhysics({});
</script>
</body></html>`;

function addCanvas(document) {
    const shell = document.createElement('div');
    shell.className = 'emqXtf';
    shell.append(document.createComment(`TgQPHd|${JSON.stringify([widgetHTML])}`));
    const iframe = document.createElement('iframe');
    iframe.className = 'lQ27pc';
    shell.append(iframe);
    document.body.append(shell);
    return shell;
}

test('runtime gate fails closed on ordinary Search and empty AI Mode home', () => {
    for (const url of [
        'https://www.google.com/search?q=ordinary',
        'https://www.google.com/search?udm=50'
    ]) {
        const { dom, api, document } = loadUserscript('<!doctype html><body><main>Search</main></body>', url);
        assert.equal(api.isPotentialAIModeURL(), url.includes('udm=50'));
        assert.equal(api.reconcileTargetState(), false);
        assert.equal(document.querySelector('.gce-fab'), null);
        assert.equal(document.querySelector('#gce-styles'), null);
        assert.equal(document.querySelector('#gce-overlay'), null);
        dom.window.close();
    }

    const { dom, api, document } = loadUserscript(
        '<!doctype html><body><main jsname="coFSxe"></main></body>',
        'https://www.google.com/search?udm=50'
    );
    document.querySelector('main').innerHTML = virtualOne;
    assert.equal(api.isConversationRouteCandidate(), false);
    assert.equal(api.captureMountedTurns().added, 0, 'stale thread DOM cannot activate the empty AI home');
    assert.equal(api.reconcileTargetState(), false);
    dom.window.close();

    const incomplete = loadUserscript(
        '<!doctype html><body><main jsname="coFSxe"><div class="CKgc1d"><div class="ilZyRc R7mRQb"><div role="heading">You said: still streaming</div></div></div></main></body>',
        'https://www.google.com/search?udm=50&q=still-streaming'
    );
    assert.equal(incomplete.api.captureMountedTurns().added, 0, 'a prompt without a response is not exportable evidence');
    assert.equal(incomplete.api.reconcileTargetState(), false);
    assert.equal(incomplete.document.querySelector('.gce-fab'), null);
    incomplete.dom.window.close();

    const production = loadUserscript(
        '<!doctype html><body><main>ordinary</main></body>',
        'https://www.google.com/search?q=ordinary',
        { testMode: false }
    );
    assert.equal(production.window.__GCE_TEST_API__, undefined, 'test internals are not exposed in production');
    production.dom.window.close();
});

test('one wrapper containing multiple .CKgc1d nodes exports every real turn', () => {
    const fixture = readRepoFile('dev_artifacts/Fix_Chrome_Beta_Download_Location_Input_Example.html');
    const { dom, api, document } = loadUserscript(fixture);
    assert.equal(document.querySelectorAll('[data-xid="aim-mars-turn-root"]').length, 1);
    assert.equal(document.querySelectorAll('.CKgc1d').length, 5);
    const turns = api.extractConversationTurns();
    assert.equal(turns.length, 5);
    assert.equal(new Set(turns.map(turn => turn.id)).size, 5);
    assert.ok(turns.every(turn => turn.prompt && turn.bodyMarkdown));
    const conversions = api.debugStats.markdownConversions;
    api.extractConversationTurns();
    assert.equal(api.debugStats.markdownConversions, conversions, 'unchanged mounted turns reuse cached Markdown');
    dom.window.close();
});

test('virtualized replacement accumulates detached snapshots and route reset clears them', () => {
    const { dom, api, document } = loadUserscript('<!doctype html><body><main jsname="coFSxe"></main></body>');
    const host = document.querySelector('main');
    host.innerHTML = virtualOne;
    api.captureMountedTurns();
    host.innerHTML = virtualTwo;
    api.captureMountedTurns();
    host.innerHTML = virtualOne;
    api.captureMountedTurns();

    assert.deepEqual(plain(api.getCachedTurns().map(turn => turn.prompt)), [
        'First virtual prompt',
        'Second virtual prompt'
    ]);
    api.reconcileTargetState();
    assert.deepEqual(plain(api.getUIState()), {
        fab: true,
        badge: '2',
        dot: true,
        title: 'Export 2 conversation segments and 0 canvases'
    });

    api.resetRouteState('thread:replacement');
    assert.equal(api.getCachedTurns().length, 0);
    assert.equal(api.getUIState().fab, false);
    dom.window.close();
});

test('semantic route transitions remove stale UI and scope subsequent snapshots', () => {
    const { dom, api, window } = loadUserscript(formattingFixture);
    api.resetRouteState(api.deriveRouteKey());
    api.captureMountedTurns();
    api.reconcileTargetState();
    assert.equal(api.getUIState().fab, true);

    window.history.pushState({}, '', '/search?q=ordinary');
    api.reconcileRoute();
    assert.equal(api.getUIState().fab, false);
    assert.equal(api.getCachedTurns().length, 0);

    window.history.pushState({}, '', '/search?udm=50');
    api.reconcileRoute();
    assert.equal(api.getUIState().fab, false);
    assert.equal(api.getCachedTurns().length, 0);

    window.history.pushState({}, '', '/search?udm=50&q=next-thread');
    api.reconcileRoute();
    api.reconcileRoute();
    assert.equal(api.getUIState().fab, true);
    assert.equal(api.getCachedTurns().length, 1);
    assert.match(api.deriveRouteKey(), /next-thread/);
    api.stopObserver();
    dom.window.close();
});

test('bounded hydration walks a virtualized scroll container and restores its position', async () => {
    const html = '<!doctype html><body><div id="scroller" style="overflow-y:auto"><main jsname="coFSxe"></main></div></body>';
    const { dom, api, document } = loadUserscript(html);
    const scroller = document.querySelector('#scroller');
    const host = document.querySelector('main');
    let top = 400;
    Object.defineProperties(scroller, {
        clientHeight: { value: 400 },
        scrollHeight: { value: 800 },
        scrollTop: {
            get: () => top,
            set: value => {
                top = value;
                host.innerHTML = value < 200 ? virtualOne : virtualTwo;
            }
        }
    });
    host.innerHTML = virtualTwo;

    const progress = [];
    const result = await api.hydrateConversation(state => progress.push(state.turns));
    assert.equal(result.partial, false);
    assert.equal(result.turns, 2);
    assert.equal(top, 400, 'the original scroll position must be restored');
    assert.deepEqual(plain(api.getCachedTurns().map(turn => turn.prompt)), [
        'First virtual prompt',
        'Second virtual prompt'
    ]);
    assert.ok(progress.includes(2));
    dom.window.close();
});

test('Markdown conversion matches the golden structure and strips Google UI noise', () => {
    const { dom, api } = loadUserscript(formattingFixture);
    const turns = api.extractConversationTurns();
    const markdown = api.buildConversationMarkdown({
        turns,
        title: 'Fixture',
        frontmatter: false,
        turnDates: true
    });
    assert.equal(markdown, readRepoFile('test/fixtures/conversation-formatting.golden.md').trim());
    assert.doesNotMatch(markdown, /Copied|Copy Edit|Share|Feedback|Privacy Policy|Show all|\+1/);
    assert.equal((markdown.match(/### References/g) || []).length, 1);
    assert.match(markdown, /citations \[1\]\(https:\/\/example\.com\/articles\/source\) and \[2\]\(https:\/\/other\.example\.net\/report\)/);
    assert.doesNotMatch(markdown, /https:\/\/example\.com\/\)/, 'bare origin loses to article URL');

    const frontmatter = api.buildConversationMarkdown({
        turns,
        title: 'Fixture: "quoted"',
        frontmatter: true,
        turnDates: false,
        srcURL: 'https://example.com/a:b'
    });
    assert.match(frontmatter, /^---\ntitle: "Fixture: \\"quoted\\""\nsource: "https:\/\/example\.com\/a:b"/);
    assert.match(frontmatter, /\nturns: 1\nexporter: Google AI Canvas Exporter v5\.0\.3\n---/);
    dom.window.close();
});

test('FAB badge and green-dot semantics distinguish conversation and canvas state', () => {
    const { dom, api, document } = loadUserscript(formattingFixture);
    api.captureMountedTurns();
    api.reconcileTargetState();
    assert.equal(api.getUIState().badge, '1');
    assert.equal(api.getUIState().dot, true);

    addCanvas(document);
    assert.equal(api.scanCanvases(document), 1);
    api.reconcileTargetState();
    assert.deepEqual(plain(api.getUIState()), {
        fab: true,
        badge: '1',
        dot: true,
        title: 'Export 1 conversation segment and 1 canvas'
    });

    api.resetRouteState('canvas-only');
    addCanvas(document);
    assert.equal(api.scanCanvases(document), 1);
    api.reconcileTargetState();
    assert.deepEqual(plain(api.getUIState()), {
        fab: true,
        badge: '1',
        dot: false,
        title: 'Export 0 conversation segments and 1 canvas'
    });
    dom.window.close();

    const canvasOnly = loadUserscript(
        '<!doctype html><body><main>ordinary results with a canvas</main></body>',
        'https://www.google.com/search?q=canvas-only'
    );
    const canvasShell = addCanvas(canvasOnly.document);
    assert.equal(canvasOnly.api.scanCanvases(canvasOnly.document), 1);
    assert.equal(canvasOnly.api.reconcileTargetState(), true);
    assert.equal(canvasOnly.api.getUIState().dot, false);
    canvasShell.remove();
    assert.equal(canvasOnly.api.reconcileTargetState(), false, 'detached canvas-only evidence must tear down the UI');
    assert.equal(canvasOnly.api.getRegistry().length, 0);
    canvasOnly.dom.window.close();
});

test('canvas reconstruction preserves v4 compatibility invariants', () => {
    const { dom, api } = loadUserscript('<!doctype html><body></body>');
    const output = api.buildExportHTML(widgetHTML, {
        title: 'Fixture Canvas',
        isDark: false,
        fullVP: true,
        meta: true,
        srcURL: 'https://www.google.com/search?q=canvas'
    });
    assert.match(output, /Google AI Canvas Exporter v5\.0\.3/);
    assert.match(output, /window\.WidgetHelpers/);
    for (const signature of ['WH.createApp', 'WH.initCanvas', 'WH.initD3', 'WH.initPlot', 'WH.initThree', 'WH.initPhysics']) {
        assert.match(output, new RegExp(signature.replace('.', '\\.')));
    }
    assert.match(output, /cdn\.jsdelivr\.net\/npm\/d3@7/);
    assert.match(output, /fonts\.googleapis\.com/);
    assert.match(output, /window\.isDarkMode = false/);
    assert.match(output, /id="resize-target" style="position:absolute;top:0;left:0;width:0;height:calc\(100vh \+ 1px\)"/);
    assert.doesNotMatch(output, /Content-Security-Policy|data-sandbox-injected|GhostMarker|tailwindcss/);
    dom.window.close();
});

test('canvas discovery retries when the TgQPHd payload arrives after the iframe', async () => {
    const { dom, api, document } = loadUserscript(
        '<!doctype html><body></body>',
        'https://www.google.com/search?q=canvas'
    );
    api.startObserver(document.documentElement);
    const shell = document.createElement('div');
    shell.className = 'emqXtf';
    const iframe = document.createElement('iframe');
    iframe.className = 'lQ27pc';
    shell.append(iframe);
    document.body.append(shell);
    await new Promise(resolve => setTimeout(resolve, 500));
    assert.equal(api.getRegistry().length, 0);

    shell.prepend(document.createComment(`TgQPHd|${JSON.stringify([widgetHTML])}`));
    await new Promise(resolve => setTimeout(resolve, 500));
    assert.equal(api.getRegistry().length, 1);
    api.stopObserver();
    dom.window.close();
});

test('observer ignores irrelevant mutations and coalesces relevant additions', async () => {
    const { dom, api, document } = loadUserscript('<!doctype html><body><main jsname="coFSxe"></main></body>');
    api.startObserver(document.documentElement);
    for (let i = 0; i < 20; i++) document.body.append(document.createElement('div'));
    await new Promise(resolve => setTimeout(resolve, 200));
    assert.equal(api.debugStats.scheduledWork, 0);

    const host = document.querySelector('main');
    host.insertAdjacentHTML('beforeend', virtualOne);
    host.insertAdjacentHTML('beforeend', virtualTwo);
    await new Promise(resolve => setTimeout(resolve, 500));
    assert.equal(api.debugStats.scheduledWork, 1);
    assert.ok(api.debugStats.canvasScans <= 2, 'relevant additions are scanned directly, not via repeated document scans');
    assert.equal(api.getCachedTurns().length, 2);

    const conversions = api.debugStats.markdownConversions;
    const streamed = document.createElement('div');
    streamed.className = 'n6owBd';
    streamed.textContent = 'Streamed tail.';
    host.querySelector('[data-xid="VpUvz"]').append(streamed);
    await new Promise(resolve => setTimeout(resolve, 350));
    assert.equal(api.debugStats.scheduledWork, 2);
    assert.equal(api.debugStats.markdownConversions, conversions + 1, 'only the changed turn is reconverted');
    assert.match(api.getCachedTurns()[0].bodyMarkdown, /Streamed tail\./);

    const characterConversions = api.debugStats.markdownConversions;
    host.querySelector('.n6owBd').firstChild.nodeValue += ' Character update.';
    await new Promise(resolve => setTimeout(resolve, 500));
    assert.equal(api.debugStats.scheduledWork, 3);
    assert.equal(api.debugStats.markdownConversions, characterConversions + 1);
    assert.match(api.getCachedTurns()[0].bodyMarkdown, /Character update\./);
    api.stopObserver();
    dom.window.close();
});

test('Formal Classification mixed-content fixture exports all segments, canvas, references, and full preview', async () => {
    const url = 'https://www.google.com/search?udm=50&q=Formal+Classification+of+Fine+Hardwood+Furniture';
    const { dom, api, document } = loadUserscript(formalFixture, url);
    const segments = api.getConversationSegments();
    assert.equal(segments.length, 2);
    assert.equal(segments[0].root.matches('.CKgc1d'), true);
    assert.equal(segments[1].root.matches('[data-xid="pJN44d"]'), true);
    assert.equal(segments[1].responseBlocks.length, 2);
    assert.equal(segments[1].canvasBlocks.length, 1);

    const turns = api.extractConversationTurns();
    const summary = plain(api.summarizeConversation(turns));
    assert.deepEqual(summary, {
        segmentCount: 2,
        promptCount: 2,
        responseCount: 2,
        canvasCount: 1
    });
    assert.match(turns[0].prompt, /^Rigorously justify and describe the absolute optimal formal precise category/);
    assert.equal(turns[1].prompt, 'simulate the physics of splayed legs vs straight legs for stability');
    assert.match(turns[0].bodyMarkdown, /Contemporary Studio-Style Splayed-Leg Step Stool/);
    assert.match(turns[1].bodyMarkdown, /The Mechanics of Stability/);
    assert.match(turns[1].bodyMarkdown, /> \[Interactive Canvas: Stability Physics: Splay Angle Simulator\]/);
    assert.deepEqual(plain(turns[1].references.map(reference => reference.href)), [
        'https://braceworks.ca/wp-content/uploads/2016/05/hof-condition-for-dynamic-stability.pdf',
        'https://medium.com/@khansolo96/the-science-of-tipping-over-350cdf115f46',
        'https://blog.lostartpress.com/2025/09/18/introduction-to-leg-angles/',
        'https://www.youtube.com/watch?v=fBTFTU30gmo&t=68'
    ]);
    assert.equal(api.getRegistry()[0].title, 'Stability Physics: Splay Angle Simulator');

    const markdown = api.buildConversationMarkdown({
        turns,
        title: 'Formal Classification of Fine Hardwood Furniture',
        frontmatter: true,
        turnDates: true,
        srcURL: url
    });
    assert.match(markdown, /\nturns: 2\nexporter: Google AI Canvas Exporter v5\.0\.3\n---/);
    assert.equal((markdown.match(/You said:/g) || []).length, 2);
    assert.match(markdown, /Splaying the legs mechanically expands the Base of Support/);
    assert.match(markdown, /The stability of your walnut stool is governed by the relationship/);
    assert.match(markdown, /> \[Interactive Canvas: Stability Physics: Splay Angle Simulator\]/);
    assert.doesNotMatch(markdown, /Copied|Copy Edit|Share public link|AI-generated, may include mistakes|AI responses may include mistakes|Privacy Policy|Terms of Service|Show all/);

    let cursor = 0;
    for (const line of readRepoFile('test/fixtures/formal-classification.golden.md').split('\n').filter(Boolean)) {
        const index = markdown.indexOf(line, cursor);
        assert.notEqual(index, -1, `missing ordered golden line: ${line}`);
        cursor = index + line.length;
    }

    const overlay = api.openExportPanel();
    assert.ok(overlay);
    await new Promise(resolve => setTimeout(resolve, 900));
    const raw = document.querySelector('#gce-md-preview')?.value || '';
    const rendered = document.querySelector('#gce-rendered-preview');
    const previewMeta = document.querySelector('#gce-preview-meta')?.textContent || '';
    assert.ok(raw.length > 3000, `raw preview must be complete, got ${raw.length} characters`);
    assert.match(raw, /simulate the physics of splayed legs vs straight legs for stability/);
    assert.match(raw, /Stability Physics: Splay Angle Simulator/);
    assert.match(raw, /\[4\] \[youtube\]\(https:\/\/www\.youtube\.com\/watch\?v=fBTFTU30gmo&t=68\)\s*$/);
    assert.ok(rendered);
    assert.match(rendered.textContent, /The Mechanics of Stability/);
    assert.match(rendered.textContent, /Interactive Canvas: Stability Physics: Splay Angle Simulator/);
    assert.match(previewMeta, /[\d,]+ characters/);
    assert.match(previewMeta, new RegExp(`${raw.length.toLocaleString()} characters`));
    assert.match(previewMeta, /2 segments/);
    assert.match(previewMeta, /1 canvas/);
    assert.match(previewMeta, /hydration complete/);
    assert.equal(document.querySelectorAll('.gce-preview-grid').length, 1);
    const escapedPreview = api.renderMarkdownPreview('<img src=x onerror=alert(1)>');
    assert.doesNotMatch(escapedPreview, /<img/i);
    assert.match(escapedPreview, /&lt;img src=x onerror=alert\(1\)&gt;/);
    const underscoredURL = api.renderMarkdownPreview('[source](https://example.com/with_under_score)');
    assert.match(underscoredURL, /href="https:\/\/example\.com\/with_under_score"/);
    assert.doesNotMatch(underscoredURL, /href="[^"]*<em>/);
    document.querySelector('.gce-x')?.click();
    dom.window.close();
});
