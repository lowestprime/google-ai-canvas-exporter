import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const referencePath = process.argv.indexOf('--compare');
const inputPaths = referencePath < 0 ? process.argv.slice(2) : process.argv.slice(2, referencePath);
const reference = referencePath < 0 ? null : readFileSync(process.argv[referencePath + 1], 'utf8');
for (const path of inputPaths) {
    const html = readFileSync(path, 'utf8');
    const dom = new JSDOM(html, { virtualConsole: new VirtualConsole() });
    const { document } = dom.window;
    const iframes = [...document.querySelectorAll('iframe')].map(iframe => {
        const srcdoc = iframe.getAttribute('srcdoc') || '';
        const ancestors = [];
        for (let node = iframe.parentElement; node && node !== document.body; node = node.parentElement) {
            ancestors.push({ tag: node.tagName, class: String(node.className).slice(0, 100),
                aria: node.getAttribute('aria-label'), role: node.getAttribute('role') });
            if (ancestors.length === 12) break;
        }
        return {
            class: iframe.className,
            title: iframe.getAttribute('title'),
            src: (iframe.getAttribute('src') || '').slice(0, 120),
            srcdocLength: srcdoc.length,
            srcdocMarkers: Object.fromEntries(['WidgetHelpers', 'WH.createApp', '<!DOCTYPE html>',
                'Frontier AI Cross-Model Analytics', 'srcdoc=', 'document.write', 'blob:']
                .map(marker => [marker, srcdoc.indexOf(marker)])),
            ancestors
        };
    });

    let comments = 0, tgComments = 0, widgetComments = 0;
    const walker = document.createTreeWalker(document, 128);
    while (walker.nextNode()) {
        comments++;
        const value = walker.currentNode.textContent || '';
        if (!value.includes('TgQPHd')) continue;
        tgComments++;
        if (value.includes('WidgetHelpers')) widgetComments++;
    }

    const canvasPanel = document.querySelector('[aria-label="Canvas preview"]')?.closest('.uC8dJb');
    const candidateCode = [...document.querySelectorAll('textarea,pre,code,[contenteditable]')]
        .map(element => ({ tag: element.tagName, class: String(element.className).slice(0, 70),
            length: (element.value || element.textContent || '').length,
            prefix: (element.value || element.textContent || '').slice(0, 80) }))
        .filter(item => item.length > 100).slice(0, 12);
    const panelControls = canvasPanel ? [...canvasPanel.querySelectorAll('button,[role="tab"],[aria-label],[data-xid]')]
        .map(item => ({ tag: item.tagName, role: item.getAttribute('role'), xid: item.getAttribute('data-xid'),
            aria: item.getAttribute('aria-label'), title: item.getAttribute('title'),
            text: (item.textContent || '').trim().slice(0, 100) }))
        .filter(item => item.aria || item.role === 'tab' || /code|copy|download|canvas|preview/i.test(item.text))
        .slice(0, 65) : [];
    const monaco = canvasPanel?.querySelector('.monaco-editor');
    const editor = monaco && { chars: monaco.outerHTML.length,
        lines: monaco.querySelectorAll('.view-line').length,
        textLength: (monaco.textContent || '').length,
        textPrefix: (monaco.textContent || '').slice(0, 180) };
    const sourceNeedles = Object.fromEntries([
        '<!DOCTYPE html>', 'switchTab(', 'function switchTab', 'Frontier AI Cross-Model Analytics',
        'cdn.tailwindcss.com', 'VIEW 1: MODEL PROFILES', 'Pareto Crossover Explorer',
        'html code editor', 'data-icl-uuid'
    ].map(needle => [needle, { html: html.indexOf(needle), panel: canvasPanel?.outerHTML.indexOf(needle) ?? -1 }]));
    const panelButtons = canvasPanel ? [...canvasPanel.querySelectorAll('button,[role="button"],[role="tab"]')]
        .map(item => ({ tag: item.tagName, role: item.getAttribute('role'),
            aria: item.getAttribute('aria-label'), title: item.getAttribute('title'),
            text: (item.textContent || '').trim().slice(0, 100) })).slice(0, 40) : [];
    const sourceNodes = [];
    const sourceContainers = canvasPanel ? [...canvasPanel.querySelectorAll('.ZAjsj')]
        .map(item => ({ length: (item.textContent || '').length, htmlLength: item.outerHTML.length,
            children: item.children.length, prefix: (item.textContent || '').slice(0, 90),
            suffix: (item.textContent || '').slice(-90) }))
        .filter(item => item.length > 100).slice(0, 12) : [];
    const sourceElement = canvasPanel && [...canvasPanel.querySelectorAll('.ZAjsj')]
        .find(item => (item.textContent || '').includes('<!DOCTYPE html>') &&
            (item.textContent || '').includes('function switchTab'));
    const sourceText = sourceElement?.textContent.slice(sourceElement.textContent.indexOf('<!DOCTYPE html>')) || '';
    let matchingPrefix = 0;
    if (reference) while (matchingPrefix < sourceText.length && matchingPrefix < reference.length &&
        sourceText[matchingPrefix] === reference[matchingPrefix]) matchingPrefix++;
    const normalizedReference = reference?.replace(/\r\n/g, '\n');
    let normalizedMatch = 0;
    if (normalizedReference) while (normalizedMatch < sourceText.length && normalizedMatch < normalizedReference.length &&
        sourceText[normalizedMatch] === normalizedReference[normalizedMatch]) normalizedMatch++;
    const sourceComparison = reference && { extractedLength: sourceText.length, referenceLength: reference.length,
        matchingPrefix, extractedAtDiff: sourceText.slice(matchingPrefix, matchingPrefix + 100),
        referenceAtDiff: reference.slice(matchingPrefix, matchingPrefix + 100),
        extractedEnd: sourceText.slice(-130),
        equalAfterLineEndingNormalization: sourceText.replace(/\r\n/g, '\n') === normalizedReference,
        normalizedMatch, normalizedExtractedAtDiff: sourceText.slice(normalizedMatch, normalizedMatch + 100),
        normalizedReferenceAtDiff: normalizedReference.slice(normalizedMatch, normalizedMatch + 100) };
    const sourceStructure = sourceElement && { outerPrefix: sourceElement.outerHTML.slice(0, 650),
        child: [...sourceElement.children].map(item => ({ tag: item.tagName, class: item.className,
            children: item.children.length, outerPrefix: item.outerHTML.slice(0, 350),
            grandchildren: [...item.children].map(kid => ({ class: kid.className,
                textLength: (kid.textContent || '').length, htmlLength: kid.outerHTML.length,
                htmlPrefix: kid.outerHTML.slice(0, 250) })) })) };
    const sourceSurface = canvasPanel?.querySelector('[data-xid="mnldjf"]');
    const sourceSurfaceInfo = sourceSurface && { textLength: sourceSurface.textContent.length,
        children: sourceSurface.children.length, childClasses: [...sourceSurface.children]
            .map(item => ({ class: item.className, textLength: item.textContent.length,
                htmlPrefix: item.outerHTML.slice(0, 180), children: item.children.length })).slice(0, 5),
        leafSamples: [...sourceSurface.querySelectorAll('.ZAjsj')].filter(item => item.children.length === 0)
            .slice(0, 4).map(item => ({ text: item.textContent.slice(0, 100), html: item.outerHTML.slice(0, 300) })) };
    const canvasHeadings = canvasPanel ? [...canvasPanel.querySelectorAll('h1,h2,h3,[role="heading"]')]
        .map(item => ({ tag: item.tagName, class: item.className,
            text: (item.textContent || '').trim().slice(0, 180) })).slice(0, 15) : [];
    const noiseNodes = [...document.querySelectorAll('[data-xid="VpUvz"] *')]
        .filter(item => item.children.length === 0 && /^(Shared|0 files)$/i.test((item.textContent || '').trim()))
        .slice(0, 10).map(item => ({ text: item.textContent, outer: item.parentElement?.outerHTML.slice(0, 500) }));
    if (canvasPanel) {
        const textWalker = document.createTreeWalker(canvasPanel, 4);
        while (textWalker.nextNode()) {
            const value = textWalker.currentNode.textContent || '';
            if (!/function switchTab|cdn.tailwindcss.com|Frontier AI Cross-Model Analytics/.test(value)) continue;
            sourceNodes.push({ text: value.slice(0, 180), length: value.length,
                ancestors: [...(function* (el) { while (el && el !== canvasPanel) {
                    yield { tag: el.tagName, class: String(el.className).slice(0, 90),
                        role: el.getAttribute('role') }; el = el.parentElement;
                } })(textWalker.currentNode.parentElement)].slice(0, 6) });
            if (sourceNodes.length >= 12) break;
        }
    }

    const nested = [];
    for (const iframe of document.querySelectorAll('iframe[srcdoc]')) {
        const source = iframe.getAttribute('srcdoc') || '';
        if (!source) continue;
        const child = new JSDOM(source, { virtualConsole: new VirtualConsole() });
        const childDoc = child.window.document;
        nested.push({
            title: childDoc.title,
            bytes: source.length,
            iframes: [...childDoc.querySelectorAll('iframe')].map(item => ({
                title: item.title, srcdocLength: (item.getAttribute('srcdoc') || '').length,
                src: (item.getAttribute('src') || '').slice(0, 120)
            })),
            scripts: [...childDoc.querySelectorAll('script')].map(item => ({
                src: (item.getAttribute('src') || '').slice(0, 120),
                length: (item.textContent || '').length,
                hasDashboard: (item.textContent || '').includes('switchTab(')
            })).filter(item => item.length > 100 || item.hasDashboard).slice(0, 20),
            markerOffsets: Object.fromEntries(['switchTab(', 'Frontier AI Intelligence',
                'cdn.tailwindcss.com', 'scf.usercontent.goog', 'iframe', 'blob:']
                .map(marker => [marker, source.indexOf(marker)])),
            childFrames: [...childDoc.querySelectorAll('iframe[srcdoc]')].map(frame => {
                const grandSource = frame.getAttribute('srcdoc') || '';
                const grand = new JSDOM(grandSource, { virtualConsole: new VirtualConsole() });
                const info = {
                    title: grand.window.document.title,
                    bytes: grandSource.length,
                    bodyChars: (grand.window.document.body?.textContent || '').length,
                    iframes: [...grand.window.document.querySelectorAll('iframe')]
                        .map(item => ({ title: item.title, srcdocLength: (item.getAttribute('srcdoc') || '').length })),
                    scripts: [...grand.window.document.querySelectorAll('script')].map(item => ({
                        src: (item.getAttribute('src') || '').slice(0, 100),
                        length: (item.textContent || '').length,
                        hasDashboard: (item.textContent || '').includes('switchTab(')
                    })).filter(item => item.length > 100 || item.hasDashboard).slice(0, 20),
                    markerOffsets: Object.fromEntries(['switchTab(', 'Frontier AI Cross-Model Analytics',
                        'cdn.tailwindcss.com', 'blob:', 'getModels(', 'tailwind'].map(marker =>
                        [marker, grandSource.indexOf(marker)]))
                };
                grand.window.close();
                return info;
            })
        });
        child.window.close();
    }

    console.log(JSON.stringify({ path, bytes: html.length, title: document.title,
        counts: { turns: document.querySelectorAll('.CKgc1d').length,
            responses: document.querySelectorAll('[data-xid="VpUvz"]').length,
            iframes: iframes.length, comments, tgComments, widgetComments },
        iframes, canvasPanelLength: canvasPanel?.outerHTML.length || 0,
        candidateCode, panelControls, panelButtons, editor, sourceNeedles, sourceNodes,
        sourceContainers, sourceComparison, sourceStructure, sourceSurfaceInfo,
        canvasHeadings, noiseNodes, nested }, null, 2));
    dom.window.close();
}
