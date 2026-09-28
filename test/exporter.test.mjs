import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { loadUserscript, readRepoFile } from './load-userscript.mjs';

const formattingFixture = readRepoFile('test/fixtures/conversation-formatting.html');
const codeWidgetFixture = readRepoFile('test/fixtures/code-widget-headings-dates.html');
const virtualOne = readRepoFile('test/fixtures/virtual-turn-1.html');
const virtualTwo = readRepoFile('test/fixtures/virtual-turn-2.html');
const formalFixture = readRepoFile('dev_artifacts/Single_File_Export_Formal_Classification_of_Fine_Hardwood_Furniture_Google_Search_07042026_114124_AM-PST.html');
const modernCanvasOnly = readRepoFile('test/fixtures/modern-canvas-only.html');
const modernCanvasMixed = readRepoFile('test/fixtures/modern-canvas-mixed.html');
const inlineCanvasMixed = readRepoFile('test/fixtures/inline-canvas-mixed.html');
const inlineCanvasOnly = readRepoFile('test/fixtures/inline-canvas-only.html');
const plain = value => JSON.parse(JSON.stringify(value));

test('userscript metadata targets HTTPS shims without a broad blob regex include', () => {
    const source = readRepoFile('userscript/Google_AI_Canvas_Exporter.user.js');
    assert.match(source, /@version\s+5\.0\.10/);
    assert.match(source, /@match\s+https:\/\/\*\.scf\.usercontent\.goog\/search-sandbox\/shim\.html\*/);
    assert.doesNotMatch(source, /@include\s+\/\^blob:/);
    assert.match(source, /@grant\s+none/);
    assert.match(source, /@run-at\s+document-start/);
});

function inlineHTML(label) {
    return `<!DOCTYPE html><html><head><title>Generated Interactive Widget</title>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto">
<style>:root{--surface:#111} body{background:var(--surface)} button{color:white}</style>
<script data-sandbox-injected="true">window.SandboxTransport=true;</script>
<script>(function(){window.open=function(){};window.dispatchEvent(new CustomEvent('request_window_open'));})();</script>
</head><body><div id="root"><h1>${label}</h1><button id="switch">Switch ${label}</button></div>
<script type="module">import { createRoot } from 'https://widgetlibs.static.usercontent.goog/react/client.js';
document.querySelector('#switch').addEventListener('click',()=>document.body.dataset.active='yes');
window.WidgetLabel=${JSON.stringify(label)};void createRoot;</script></body></html>`;
}

function emptyMountHTML() {
    return `<!DOCTYPE html><html><head><title>Generated Interactive Widget</title>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'">
<style>body{background:#101827;color:white}#root{min-height:100vh}</style></head>
<body><div id="root"></div><script type="module">import { createRoot } from 'https://widgetlibs.static.usercontent.goog/react/client.js';
const root=document.querySelector('#root');root.textContent='Interactive source generated after module execution';
root.dataset.ready='true';void createRoot;</script></body></html>`;
}

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
    assert.match(frontmatter, /\nturns: 1\nexporter: Google AI Canvas Exporter v5\.0\.10\n---/);
    dom.window.close();
});

test('long first-prompt filenames stay representative and bounded without changing short titles', () => {
    const { dom, api } = loadUserscript(formattingFixture);
    const when = new Date('2026-09-28T05:40:08Z');
    const prompt = 'rigorously compare and generate the absolute optimal interactive aimode canvas depicting the specific recent historical prevalence/incidence/frequency of domestic holiday- and weather-associated flight delays associated with cross-country flight layovers specifically occurring in Charlotte Douglas International Airport (CLT) vs. chicago ohare (ORD) vs. Phoenix Sky Harbor International Airport (PHX) respectively as accurately and comprehensively as possible as of today.';
    const longName = api.makeMarkdownFilename(prompt, when);
    assert.match(longName, /^Holiday_Weather_Flight_Delays_Layovers_CLT_ORD_PHX_[A-Z]{3}_\d{8}_\d{6}-(?:AM|PM)-[^.]+\.md$/);
    assert.ok(longName.length <= 100, 'the complete default should remain well below common filename limits');
    assert.match(api.makeMarkdownFilename('AI Model Comparison Matrix', when), /^AI_Model_Comparison_Matrix_/);
    assert.match(api.makeMarkdownFilename('', when), /^AI_Mode_Thread_/);
    dom.window.close();
});

test('adjacent citations, nested emphasis, and literal code fences remain valid Markdown and preview HTML', () => {
    const html = '<!doctype html><body><main jsname="coFSxe"><div class="CKgc1d">' +
        '<div class="ilZyRc R7mRQb"><div role="heading">You said: Format edge cases</div></div>' +
        '<section data-xid="VpUvz"><div class="otQkpb" role="heading" aria-level="3">Important heading</div>' +
        '<div class="n6owBd">Sentence.<span class="WBgIic"><button data-icl-uuid="cite-1">1</button></span>' +
        '<span class="WBgIic"><button data-icl-uuid="cite-2">2</button></span> Next sentence.</div>' +
        '<ul><li><strong>Outer <strong>inner</strong> continuation</strong></li>' +
        '<li>Run the command:<div class="aiModeUiCodeBlock__Container"><div class="rq1a2">' +
        '<div class="a2TNg"><div class="GlO4G">powershell</div></div>' +
        '<div class="PGvq2d"><pre><code>Get-Service Bonjour\nRestart-Service Bonjour\n</code></pre></div>' +
        '</div><div class="iMHp6c">Use code with caution.<button>Copy code</button></div></div></li></ul>' +
        '<pre><code class="language-js">const fence = "&#96;&#96;&#96;";\n&#96;&#96;&#96;\nconst answer = 42;</code></pre>' +
        '</section><!--TgQPHd|[["cite-1",["https://example.com/one"]],["cite-2",["https://example.com/two"]]]-->' +
        '</div></main></body>';
    const { dom, api } = loadUserscript(html);
    const markdown = api.buildConversationMarkdown({ turns: api.extractConversationTurns(), frontmatter: false });
    assert.match(markdown, /## Important heading/);
    assert.match(markdown, /Sentence\. \[1\]\(https:\/\/example\.com\/one\) \[2\]\(https:\/\/example\.com\/two\) Next sentence\./);
    assert.match(markdown, /- \*\*Outer inner continuation\*\*/);
    assert.match(markdown, /- Run the command:\n\s+```powershell\n\s+Get-Service Bonjour\n\s+Restart-Service Bonjour\n\s+```/);
    assert.doesNotMatch(markdown, /Use code with caution|Run the command:powershell/);
    assert.match(markdown, /````js\nconst fence = "```";\n```\nconst answer = 42;\n````/);
    const preview = api.renderMarkdownPreview(markdown);
    assert.match(preview, /<h2>Important heading<\/h2>/);
    assert.match(preview, /<li>Run the command:<pre><code data-language="powershell">Get-Service Bonjour\nRestart-Service Bonjour<\/code><\/pre><\/li>/);
    assert.doesNotMatch(preview, /Use code with caution|Copy code/);
    assert.match(preview, /<pre><code data-language="js">const fence = &quot;```&quot;;\n```\nconst answer = 42;<\/code><\/pre>/);
    dom.window.close();
});

test('generic response headings and code widgets keep turn dates outside balanced list fences', () => {
    const { dom, api } = loadUserscript(codeWidgetFixture);
    const turns = api.extractConversationTurns();
    assert.equal(turns.length, 2);
    const withDates = api.buildConversationMarkdown({ turns, frontmatter: false, turnDates: true });
    const withoutDates = api.buildConversationMarkdown({ turns, frontmatter: false, turnDates: false });

    assert.match(withDates, /You said: Show two solutions\n\n2026-09-28T10:00:00-07:00\n\n## Solution 1: Configuration/);
    assert.match(withDates, /## Solution 2: Verification/);
    assert.match(withDates, /## Next steps/);
    assert.match(withDates, /Use this setting\. \[1\]\(https:\/\/example\.com\/guide\)/);
    assert.match(withDates, /1\. Save the configuration:\n\s+```toml\n\s+\[settings\]\n\s+date = "2026-09-28"\n\s+```/);
    assert.match(withDates, /2\. Run the command:\n\s+```bash\n\s+echo ready\n\s+```/);
    assert.doesNotMatch(withDates, /date = "2026-09-28"\n\s*\n\s+```|Use code with caution|Copy code|\ntoml\n|\nbash\n/);
    assert.equal((withDates.match(/2026-09-28T10:00:00-07:00/g) || []).length, 1);
    assert.equal((withDates.match(/2026-09-28T10:05:00-07:00/g) || []).length, 1);
    assert.doesNotMatch(withoutDates, /2026-09-28T10:00:00-07:00|2026-09-28T10:05:00-07:00/);
    assert.match(withoutDates, /date = "2026-09-28"/);
    assert.equal((withoutDates.match(/```(?:toml|bash)?/g) || []).length, 4);

    const preview = api.renderMarkdownPreview(withDates);
    assert.ok(preview.indexOf('2026-09-28T10:00:00-07:00') < preview.indexOf('<h2>Solution 1: Configuration</h2>'));
    assert.match(preview, /<h2>Solution 1: Configuration<\/h2>/);
    assert.match(preview, /<li>Save the configuration:<pre><code data-language="toml">\[settings\]\ndate = &quot;2026-09-28&quot;<\/code><\/pre><\/li>/);
    assert.match(preview, /<h2>Next steps<\/h2>/);
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
    assert.equal(canvasOnly.api.scanCanvases(canvasOnly.document), 0);
    assert.equal(canvasOnly.api.reconcileTargetState(), false);
    assert.equal(canvasOnly.api.getUIState().fab, false);
    canvasOnly.window.history.replaceState({}, '', '/search?udm=50&q=canvas-only');
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
    assert.match(output, /Google AI Canvas Exporter v5\.0\.10/);
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
        'https://www.google.com/search?udm=50&q=canvas'
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
    assert.match(markdown, /\nturns: 2\nexporter: Google AI Canvas Exporter v5\.0\.10\n---/);
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

test('new Canvas UI exports authored HTML on a canvas-only AI Mode page', () => {
    const url = 'https://www.google.com/search?udm=50&q=canvas-only';
    const { dom, api, document } = loadUserscript(modernCanvasOnly, url);
    assert.equal(api.scanCanvases(document), 1);
    const [canvas] = api.getRegistry();
    assert.equal(canvas.format, 'modern');
    assert.equal(canvas.title, 'Modern Fixture Dashboard');
    assert.match(canvas.widgetHTML, /function switchTab\(\)/);
    assert.equal(api.reconcileTargetState(), true);
    assert.deepEqual(plain(api.getUIState()), {
        fab: true, badge: '1', dot: false,
        title: 'Export 0 conversation segments and 1 canvas'
    });
    const panel = api.openExportPanel();
    assert.ok(panel);
    assert.equal(panel.querySelectorAll('.gce-canvas-card').length, 1);
    assert.ok(panel.querySelector('#gce-canvas-only'));
    assert.equal(panel.querySelector('#gce-conv-only'), null);
    const html = api.buildCanvasExportHTML(canvas, {
        title: canvas.title, srcURL: url, meta: true, isDark: false, fullVP: false
    });
    assert.match(html, /Google AI Canvas Exporter v5\.0\.10/);
    assert.match(html, /cdn\.tailwindcss\.com/);
    assert.match(html, /function switchTab\(\)/);
    assert.match(html, /bg-slate-950/);
    assert.doesNotMatch(html, /Content-Security-Policy|resize-target|window\.WH/);
    assert.match(api.buildCanvasExportHTML(canvas, { meta: false }), /^<!DOCTYPE html>/);
    const exported = new JSDOM(html, { runScripts: 'dangerously' });
    exported.window.document.querySelector('#switch').click();
    assert.equal(exported.window.document.querySelector('main').dataset.active, 'yes');
    exported.window.close();
    api.stopCanvasObserver();
    dom.window.close();
});

test('AI Mode home ignores stale modern canvas DOM without a thread route', () => {
    const { dom, api, document } = loadUserscript(modernCanvasOnly,
        'https://www.google.com/search?udm=50');
    assert.equal(api.scanCanvases(document), 0);
    assert.equal(api.reconcileTargetState(), false);
    assert.equal(api.getRegistry().length, 0);
    assert.equal(api.getUIState().fab, false);
    dom.window.close();
});

test('mixed modern canvas and chat count only exportable evidence and clear on navigation', async () => {
    const { dom, api, document, window } = loadUserscript(modernCanvasMixed);
    api.captureMountedTurns();
    assert.equal(api.scanCanvases(document), 1);
    const turns = api.getCachedTurns();
    assert.equal(turns.length, 1);
    assert.deepEqual(plain(api.summarizeConversation(turns)), {
        segmentCount: 1, promptCount: 1, responseCount: 1, canvasCount: 1
    });
    const markdown = api.buildConversationMarkdown({ turns, frontmatter: false });
    assert.match(markdown, /You said: Build a dashboard/);
    assert.match(markdown, /The dashboard is ready/);
    assert.doesNotMatch(markdown, /Shared|0 files|Interactive Canvas 1/);
    api.reconcileTargetState();
    assert.equal(api.getUIState().dot, true);
    assert.equal(api.getUIState().title, 'Export 1 conversation segment and 1 canvas');
    assert.equal(api.openExportPanel().querySelectorAll('.gce-canvas-card').length, 1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    document.querySelector('.gce-x').click();

    window.history.pushState({}, '', '/search?q=ordinary');
    api.reconcileRoute();
    assert.equal(api.getRegistry().length, 0);
    assert.equal(api.getUIState().fab, false);
    api.stopCanvasObserver();
    dom.window.close();
});

test('unknown sandbox iframe never creates a fake canvas or placeholder', () => {
    const html = '<!doctype html><body><main jsname="coFSxe"><div class="CKgc1d">' +
        '<div class="ilZyRc R7mRQb"><div role="heading">You said: Draw a chart</div></div>' +
        '<div data-xid="VpUvz"><p>The interactive chart is ready for export.</p></div>' +
        '<div class="MngkG"><iframe class="lQ27pc" src="https://example.scf.usercontent.goog/shim.html"></iframe></div>' +
        '</div></main></body>';
    const { dom, api, document } = loadUserscript(html);
    assert.equal(api.scanCanvases(document), 0);
    const unrelated = document.createElement('div');
    unrelated.setAttribute('data-xid', 'mnldjf');
    unrelated.textContent = '<!DOCTYPE html><html><head><title>Unrelated HTML</title></head><body>' +
        '<main><h1>This is not inside a Canvas preview</h1><p>Long unrelated content should never' +
        ' activate the exporter or create a false canvas record on this route.</p></main>' +
        '</body></html>';
    document.body.append(unrelated);
    assert.equal(api.scanCanvases(document), 0);
    const turns = api.extractConversationTurns();
    const markdown = api.buildConversationMarkdown({ turns, frontmatter: false });
    assert.doesNotMatch(markdown, /Interactive Canvas/);
    assert.equal(api.getRegistry().length, 0);
    dom.window.close();
});

test('related-result citation groups use one inline marker and retain all references', () => {
    const html = '<!doctype html><body><main jsname="coFSxe"><div class="CKgc1d">' +
        '<div class="ilZyRc R7mRQb"><div role="heading">You said: Explain the sources</div></div>' +
        '<div data-xid="VpUvz"><div class="n6owBd">Here are the verified sources' +
        '<span class="WBgIic"><button data-icl-uuid="group-one">Source group</button></span>.</div></div>' +
        '<!--TgQPHd|["group-one","https://example.com/article","https://other.example.org/report"]-->' +
        '</div></main></body>';
    const { dom, api } = loadUserscript(html);
    const markdown = api.buildConversationMarkdown({ turns: api.extractConversationTurns(), frontmatter: false });
    assert.match(markdown, /sources \[1\]\(https:\/\/example\.com\/article\)\./);
    assert.doesNotMatch(markdown.split('### References')[0], /\[2\]/);
    assert.match(markdown, /\[2\] \[example\]\(https:\/\/other\.example\.org\/report\)/);
    dom.window.close();
});

test('modern canvas edits refresh the cached source and invalid revisions withdraw exportability', async () => {
    const { dom, api, document } = loadUserscript(modernCanvasOnly);
    api.scanCanvases(document);
    let source = document.querySelector('[data-xid="mnldjf"]');
    source.textContent = source.textContent.replace('Modern Fixture Dashboard', 'Updated Fixture Dashboard');
    await new Promise(resolve => setTimeout(resolve, 450));
    assert.equal(api.getRegistry().length, 1);
    assert.equal(api.getRegistry()[0].title, 'Updated Fixture Dashboard');
    assert.match(api.getRegistry()[0].widgetHTML, /Updated Fixture Dashboard/);
    const panel = document.querySelector('section.uC8dJb');
    panel.replaceWith(panel.cloneNode(true));
    assert.equal(api.scanCanvases(document), 0, 'a remount must not duplicate the same canvas');
    source = document.querySelector('[data-xid="mnldjf"]');
    source.textContent = source.textContent.replace('Updated Fixture Dashboard', 'Remounted Fixture Dashboard');
    await new Promise(resolve => setTimeout(resolve, 450));
    assert.equal(api.getRegistry().length, 1);
    assert.equal(api.getRegistry()[0].title, 'Remounted Fixture Dashboard');
    source.textContent = 'Canvas is temporarily unavailable';
    await new Promise(resolve => setTimeout(resolve, 450));
    assert.equal(api.getRegistry().length, 0);
    assert.equal(api.reconcileTargetState(), false);
    assert.equal(api.getUIState().fab, false);
    api.stopCanvasObserver();
    dom.window.close();
});

test('inline sandbox messages register two distinct canvases and refresh a mixed export panel', async () => {
    const { dom, api, document } = loadUserscript(inlineCanvasMixed);
    api.resetRouteState(api.deriveRouteKey());
    assert.equal(api.scanCanvases(document), 0, 'an unknown frame is not an exportable canvas');
    const mounted = api.extractConversationTurns();
    assert.equal(mounted.length, 3);
    assert.equal(api.getRegistry().length, 0);
    assert.doesNotMatch(api.buildConversationMarkdown({ turns: mounted, frontmatter: false }),
        /Interactive Canvas|AI-generated\. Don/);
    api.reconcileTargetState();
    const panel = api.openExportPanel();
    assert.equal(panel.querySelectorAll('.gce-canvas-card').length, 0);
    assert.match(panel.querySelector('#gce-inline-warning').textContent, /2 inline canvas previews could not yet be captured/);
    const pending = api.getPendingInlineChallenges();
    assert.equal(pending.length, 2);
    for (const [index, challenge] of pending.entries()) {
        assert.equal(api.receiveInlineCanvasMessage({
            source: challenge.iframe.contentWindow,
            origin: challenge.origin,
            data: { channel: 'gce-inline-canvas-v1', kind: 'source', nonce: challenge.nonce,
                route: challenge.route, html: inlineHTML(index === 0 ? 'Airport risk' : 'Holiday risk') }
        }), true);
    }
    assert.equal(api.getRegistry().length, 2);
    assert.equal(panel.querySelectorAll('.gce-canvas-card').length, 2);
    assert.equal(panel.querySelector('#gce-inline-warning').hidden, true);
    assert.equal(panel.querySelector('#gce-canvas-only').hidden, false);
    assert.equal(api.getUIState().title, 'Export 3 conversation segments and 2 canvases');
    const turns = api.getCachedTurns();
    assert.equal(turns.length, 3, 'late canvas discovery must not duplicate cached turns');
    const markdown = api.buildConversationMarkdown({ turns, frontmatter: false });
    assert.equal((markdown.match(/Interactive Canvas:/g) || []).length, 2);
    assert.ok(markdown.indexOf('Airport risk') < markdown.indexOf('You said: Focus on holiday travel'));
    assert.ok(markdown.indexOf('Holiday risk') > markdown.indexOf('You said: Revise the visualization'));
    const [first, second] = api.getRegistry();
    assert.notEqual(first.widgetHTML, second.widgetHTML);
    const output = api.buildCanvasExportHTML(first, { title: first.title, meta: true });
    assert.match(output, /widgetlibs\.static\.usercontent\.goog/);
    assert.match(output, /--surface:#111/);
    assert.match(output, /button id="switch"/);
    assert.doesNotMatch(output, /SandboxTransport|request_window_open|Content-Security-Policy/);
    const oldFrame = document.querySelector('.MngkG iframe.lQ27pc');
    const remounted = oldFrame.cloneNode(true);
    oldFrame.replaceWith(remounted);
    api.scanCanvases(remounted);
    const [remountProbe] = api.getPendingInlineChallenges();
    assert.ok(remountProbe);
    assert.equal(api.receiveInlineCanvasMessage({ source: remounted.contentWindow,
        origin: remountProbe.origin,
        data: { channel: 'gce-inline-canvas-v1', kind: 'source', nonce: remountProbe.nonce,
            route: remountProbe.route, html: inlineHTML('Airport risk') } }), true);
    assert.equal(api.getRegistry().length, 2, 'virtualized remount must reuse its canvas record');
    await api.hydrateConversation();
    panel.querySelector('.gce-x').click();
    api.stopCanvasObserver();
    dom.window.close();
});

test('generic inline React mounts ignore AI Mode chrome and receive unique labels and filenames', async () => {
    const { dom, api, document } = loadUserscript(inlineCanvasMixed);
    api.resetRouteState(api.deriveRouteKey());
    const frames = [...document.querySelectorAll('.MngkG iframe.lQ27pc')];
    for (const frame of frames) {
        const chrome = document.createElement('div');
        chrome.className = 'AdPoic';
        chrome.setAttribute('role', 'heading');
        chrome.textContent = 'AI Mode replied:';
        frame.parentElement.before(chrome);
    }
    const named = document.createElement('h2');
    named.textContent = 'The Holiday Reliability Canvas (Dec 15–31)';
    frames[1].closest('.MngkG').after(named);
    for (const frame of frames) assert.ok(api.registerInlineCanvasSource(frame, emptyMountHTML()));
    const [first, second] = api.getRegistry();
    assert.equal(first.title, 'Interactive Canvas 1');
    assert.equal(second.title, 'The Holiday Reliability Canvas (Dec 15–31)');
    assert.notEqual(api.defaultCanvasFilename(first, 0), api.defaultCanvasFilename(second, 1));
    api.captureMountedTurns();
    const md = api.buildConversationMarkdown({ turns: api.getCachedTurns(), frontmatter: false });
    assert.match(md, /\[Interactive Canvas: Interactive Canvas 1\]/);
    assert.match(md, /\[Interactive Canvas: The Holiday Reliability Canvas \(Dec 15–31\)\]/);
    const panel = api.openExportPanel();
    const names = [...panel.querySelectorAll('.gce-canvas-name')].map(el => el.value.toLowerCase());
    assert.equal(new Set(names).size, 2);
    api.registerInlineCanvasSource(frames[0], inlineHTML('Shared widget name'));
    api.registerInlineCanvasSource(frames[1], inlineHTML('Shared widget name'));
    const [sameA, sameB] = api.getRegistry();
    assert.equal(sameA.title, sameB.title);
    assert.notEqual(api.defaultCanvasFilename(sameA, 0), api.defaultCanvasFilename(sameB, 1),
        'same-titled canvases need unique default download names');
    const jobs = [
        { filename: 'Same.html' }, { filename: 'same.HTML' },
        { filename: 'Same_2.html' }, { filename: 'thread.md' }
    ];
    api.dedupeExportFilenames(jobs);
    assert.deepEqual(jobs.map(job => job.filename),
        ['Same.html', 'same_2.HTML', 'Same_2_2.html', 'thread.md']);
    await api.hydrateConversation();
    panel.querySelector('.gce-x').click();
    dom.window.close();
});

test('inline canvas-only export is fail-closed until source is verified', () => {
    const { dom, api, document } = loadUserscript(inlineCanvasOnly);
    api.resetRouteState(api.deriveRouteKey());
    api.scanCanvases(document);
    assert.equal(api.reconcileTargetState(), false);
    assert.equal(api.getUIState().fab, false);
    const [challenge] = api.getPendingInlineChallenges();
    assert.ok(challenge);
    assert.equal(api.receiveInlineCanvasMessage({ source: challenge.iframe.contentWindow,
        origin: challenge.origin, data: { channel: 'gce-inline-canvas-v1', kind: 'source',
            nonce: challenge.nonce, route: challenge.route, html: inlineHTML('Map controls') } }), true);
    assert.equal(api.getRegistry().length, 1);
    assert.equal(api.getUIState().title, 'Export 0 conversation segments and 1 canvas');
    assert.equal(api.getUIState().dot, false);
    assert.equal(api.openExportPanel().querySelectorAll('.gce-canvas-card').length, 1);
    document.querySelector('.gce-x').click();
    dom.window.close();
});

test('inline source bridge rejects spoofed origin, window, route, nonce, and oversized HTML', () => {
    const { dom, api, document, window } = loadUserscript(inlineCanvasOnly);
    api.resetRouteState(api.deriveRouteKey());
    api.scanCanvases(document);
    const [challenge] = api.getPendingInlineChallenges();
    const data = { channel: 'gce-inline-canvas-v1', kind: 'source', nonce: challenge.nonce,
        route: challenge.route, html: inlineHTML('Safe widget') };
    assert.equal(api.receiveInlineCanvasMessage({ source: window, origin: challenge.origin, data }), false);
    assert.equal(api.receiveInlineCanvasMessage({ source: challenge.iframe.contentWindow,
        origin: 'https://attacker.example', data }), false);
    assert.equal(api.receiveInlineCanvasMessage({ source: challenge.iframe.contentWindow,
        origin: challenge.origin, data: { ...data, nonce: 'wrong' } }), false);
    assert.equal(api.receiveInlineCanvasMessage({ source: challenge.iframe.contentWindow,
        origin: challenge.origin, data: { ...data, route: 'another-thread' } }), false);
    assert.equal(api.receiveInlineCanvasMessage({ source: challenge.iframe.contentWindow,
        origin: challenge.origin, data: { ...data, html: 'x'.repeat(5_000_001) } }), false);
    assert.equal(api.getRegistry().length, 0);
    api.resetRouteState('new-thread');
    assert.equal(api.receiveInlineCanvasMessage({ source: challenge.iframe.contentWindow,
        origin: challenge.origin, data }), false);
    dom.window.close();
});

test('direct nested WindowProxy source path works without an outer-frame relay', () => {
    const { dom, api, document } = loadUserscript(inlineCanvasOnly);
    const outer = document.querySelector('.MngkG iframe.lQ27pc');
    outer.contentDocument.write('<!doctype html><html><body></body></html>');
    const nested = outer.contentDocument.createElement('iframe');
    nested.src = 'https://nested.scf.usercontent.goog/search-sandbox/shim.html';
    outer.contentDocument.body.append(nested);
    api.resetRouteState(api.deriveRouteKey());
    api.scanCanvases(document);
    const [challenge] = api.getPendingInlineChallenges();
    assert.ok(challenge.innerWindow);
    assert.equal(api.receiveInlineCanvasMessage({ source: challenge.innerWindow,
        origin: 'https://attacker.example',
        data: { channel: 'gce-inline-canvas-v1', kind: 'source', nonce: challenge.nonce,
            route: challenge.route, html: inlineHTML('Nested map') } }), false);
    assert.equal(api.receiveInlineCanvasMessage({ source: challenge.innerWindow,
        origin: 'https://nested.scf.usercontent.goog',
        data: { channel: 'gce-inline-canvas-v1', kind: 'source', nonce: challenge.nonce,
            route: challenge.route, html: inlineHTML('Nested map') } }), true);
    assert.equal(api.getRegistry().length, 1);
    dom.window.close();
});

test('HTTPS shim forwards original module HTML before blob navigation', () => {
    const dom = new JSDOM('<!doctype html><iframe></iframe>', {
        url: 'https://www.google.com/search?udm=50&q=inline', runScripts: 'outside-only'
    });
    const iframe = dom.window.document.querySelector('iframe');
    iframe.src = 'https://inner.scf.usercontent.goog/search-sandbox/shim.html?origin=https%3A%2F%2Fwww.google.com';
    const sent = [];
    dom.window.postMessage = (data, targetOrigin) => sent.push({ data, targetOrigin });
    iframe.contentWindow.eval(readRepoFile('userscript/Google_AI_Canvas_Exporter.user.js'));
    const deliver = (data, origin = 'https://www.google.com') =>
        iframe.contentWindow.dispatchEvent(new iframe.contentWindow.MessageEvent('message', {
            data, origin, source: dom.window
        }));
    assert.equal(sent[0].data.kind, 'bridge-ready');
    deliver({ mimeType: 'text/html', body: emptyMountHTML() });
    assert.equal(sent.length, 2);
    assert.equal(sent[1].data.kind, 'preload');
    assert.equal(sent[1].data.html, emptyMountHTML());
    assert.equal(sent[1].targetOrigin, 'https://www.google.com');
    iframe.contentWindow.TextDecoder = TextDecoder;
    const withoutDoctype = emptyMountHTML().replace('<!DOCTYPE html>', '');
    const bytes = new iframe.contentWindow.Uint8Array(Buffer.from(withoutDoctype));
    deliver({ mimeType: 'text/html; charset=utf-8', body: bytes.buffer });
    assert.equal(sent.length, 3);
    assert.match(sent[2].data.html, /^<!DOCTYPE html>/);
    deliver({ mimeType: 'text/html', body: emptyMountHTML() }, 'https://attacker.example');
    deliver({ mimeType: 'application/javascript', body: emptyMountHTML() });
    assert.equal(sent.length, 3, 'wrong sender or MIME type is rejected');
    dom.window.close();
});

test('HTTPS shim binds a late source to a null-source extension-world challenge', () => {
    const dom = new JSDOM('<!doctype html><iframe></iframe>', {
        url: 'https://www.google.com/search?udm=50&q=inline', runScripts: 'outside-only'
    });
    const frame = dom.window.document.querySelector('iframe');
    frame.src = 'https://inner.scf.usercontent.goog/search-sandbox/shim.html?origin=https%3A%2F%2Fwww.google.com';
    const sent = [];
    dom.window.postMessage = (data, targetOrigin) => sent.push({ data, targetOrigin });
    frame.contentWindow.eval(readRepoFile('userscript/Google_AI_Canvas_Exporter.user.js'));
    const nonce = 'a'.repeat(48);
    frame.contentWindow.dispatchEvent(new frame.contentWindow.MessageEvent('message', {
        source: null, origin: 'https://www.google.com',
        data: { channel: 'gce-inline-canvas-v1', kind: 'probe', nonce, route: 'route-tag' }
    }));
    frame.contentWindow.dispatchEvent(new frame.contentWindow.MessageEvent('message', {
        source: dom.window, origin: 'https://www.google.com',
        data: { mimeType: 'text/html', body: emptyMountHTML() }
    }));
    assert.equal(sent.length, 3);
    assert.equal(sent[0].data.kind, 'bridge-ready');
    assert.equal(sent[1].data.kind, 'preload');
    assert.deepEqual({ kind: sent[2].data.kind, nonce: sent[2].data.nonce,
        route: sent[2].data.route, origin: sent[2].targetOrigin },
    { kind: 'source', nonce, route: 'route-tag', origin: 'https://www.google.com' });
    dom.window.close();
});

test('inline preload accepts only a current nested frame and exports an empty React mount', () => {
    const { dom, api, document, window } = loadUserscript(inlineCanvasOnly);
    const outer = document.querySelector('.MngkG iframe.lQ27pc');
    outer.contentDocument.write('<!doctype html><html><body></body></html>');
    const nested = outer.contentDocument.createElement('iframe');
    nested.src = 'https://nested.scf.usercontent.goog/search-sandbox/shim.html';
    outer.contentDocument.body.append(nested);
    api.resetRouteState(api.deriveRouteKey());
    const data = { channel: 'gce-inline-canvas-v1', kind: 'preload', html: emptyMountHTML() };
    assert.equal(api.receiveInlineCanvasMessage({ source: window,
        origin: 'https://nested.scf.usercontent.goog', data }), false);
    assert.equal(api.receiveInlineCanvasMessage({ source: nested.contentWindow,
        origin: 'https://attacker.example', data }), false);
    assert.equal(api.receiveInlineCanvasMessage({ source: nested.contentWindow,
        origin: 'https://nested.scf.usercontent.goog', data }), true);
    assert.equal(api.getRegistry().length, 1);
    const exported = api.buildCanvasExportHTML(api.getRegistry()[0], { title: 'Airport widget' });
    assert.match(exported, /id="root"/);
    assert.match(exported, /Interactive source generated after module execution/);
    assert.doesNotMatch(exported, /Content-Security-Policy/);
    assert.match(api.buildModernExportHTML(emptyMountHTML()), /id="root"/,
        'right-hand Canvas reconstruction remains compatible with module-driven mounts');
    api.resetRouteState('other-thread');
    assert.equal(api.receiveInlineCanvasMessage({ source: nested.contentWindow,
        origin: 'https://nested.scf.usercontent.goog', data }), false,
    'stale route source is rejected');
    dom.window.close();
});

test('nonce-bound source accepts null MessageEvent.source but never an unknown nonce', () => {
    const { dom, api, document } = loadUserscript(inlineCanvasOnly);
    api.resetRouteState(api.deriveRouteKey());
    api.scanCanvases(document);
    const [challenge] = api.getPendingInlineChallenges();
    assert.ok(challenge);
    const data = { channel: 'gce-inline-canvas-v1', kind: 'source', nonce: challenge.nonce,
        route: challenge.route, html: emptyMountHTML() };
    assert.equal(api.receiveInlineCanvasMessage({ source: null,
        origin: 'https://nested.scf.usercontent.goog',
        data: { ...data, nonce: 'b'.repeat(48) } }), false);
    assert.equal(api.receiveInlineCanvasMessage({ source: null,
        origin: 'https://attacker.example', data }), false);
    assert.equal(api.receiveInlineCanvasMessage({ source: null,
        origin: 'https://nested.scf.usercontent.goog', data }), true);
    assert.equal(api.getRegistry().length, 1);
    dom.window.close();
});

test('production top receiver accepts a verified shim preload before DOMContentLoaded', () => {
    const { dom, document, window } = loadUserscript(inlineCanvasOnly,
        'https://www.google.com/search?udm=50&q=inline', { testMode: false });
    const outer = document.querySelector('.MngkG iframe.lQ27pc');
    outer.contentDocument.write('<!doctype html><html><body></body></html>');
    const nested = outer.contentDocument.createElement('iframe');
    nested.src = 'https://nested.scf.usercontent.goog/search-sandbox/shim.html';
    outer.contentDocument.body.append(nested);
    window.dispatchEvent(new window.MessageEvent('message', {
        source: nested.contentWindow,
        origin: 'https://nested.scf.usercontent.goog',
        data: { channel: 'gce-inline-canvas-v1', kind: 'preload', html: emptyMountHTML() }
    }));
    assert.equal(document.querySelector('.gce-fab')?.getAttribute('aria-label'),
        'Export 0 conversation segments and 1 canvas');
    dom.window.close();
});

test('Google list-card headings render as valid nested Markdown and omit AI warning', () => {
    const html = '<!doctype html><body><main jsname="coFSxe"><div class="CKgc1d">' +
        '<div class="ilZyRc R7mRQb"><div role="heading">You said: Explain risks</div></div>' +
        '<div data-xid="VpUvz"><ul><li><div class="AdPoic" role="heading">The Blue Sky Fallacy</div>' +
        '<div class="n6owBd">Clear skies do not eliminate congestion.</div></li></ul>' +
        '<div class="Rpz2Dd" data-sfc-root="ep"><span>AI-generated. Don\'t enter sensitive personal info.</span></div>' +
        '</div></div></main></body>';
    const { dom, api } = loadUserscript(html);
    const markdown = api.buildConversationMarkdown({ turns: api.extractConversationTurns(), frontmatter: false });
    assert.match(markdown, /- \*\*The Blue Sky Fallacy\*\*/);
    assert.match(markdown, /  Clear skies do not eliminate congestion\./);
    assert.doesNotMatch(markdown, /- ##|AI-generated\. Don/);
    dom.window.close();
});
