// ==UserScript==
// @name              Google AI Canvas Exporter
// @description       Export Google AI Search mode conversations as clean Markdown and interactive canvas widgets as self-contained offline HTML. Conversation export captures all user/AI turns with inline citations, compact reference blocks, YAML frontmatter, and smart filenames. Canvas export detects Widget Shell V2 in sandboxed scf.usercontent.goog iframes, strips CSP/sandbox artifacts, extracts WidgetHelpers + CDN deps, and supports batch download via a unified floating export panel.
// @author            lowestprime x Claude Opus 4.6 Max Agent
// @namespace         https://greasyfork.org/en/users/823161-lowestprime
// @license           MIT
// @version           5.0.3
// @match             *://www.google.com/search*
// @match             *://*.google.com/search*
// @grant             none
// @run-at            document-idle
// @icon              data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22bg%22%20x1%3D%226%22%20y1%3D%224%22%20x2%3D%2258%22%20y2%3D%2260%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%235BA3FF%22%2F%3E%3Cstop%20offset%3D%220.55%22%20stop-color%3D%22%235292F9%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%237C4DFF%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22panel%22%20x1%3D%2212%22%20y1%3D%2215%22%20x2%3D%2238%22%20y2%3D%2239%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23182742%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%230A1220%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2215%22%20fill%3D%22url%28%23bg%29%22%2F%3E%3Crect%20x%3D%225%22%20y%3D%2210%22%20width%3D%2228%22%20height%3D%2224%22%20rx%3D%226%22%20fill%3D%22%23091221%22%20fill-opacity%3D%22.24%22%20stroke%3D%22%23FFF%22%20stroke-opacity%3D%22.12%22%20stroke-width%3D%221.4%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2215%22%20width%3D%2228%22%20height%3D%2224%22%20rx%3D%226%22%20fill%3D%22url%28%23panel%29%22%20stroke%3D%22%23FFF%22%20stroke-opacity%3D%22.22%22%20stroke-width%3D%221.6%22%2F%3E%3Crect%20x%3D%2214%22%20y%3D%2219%22%20width%3D%2218%22%20height%3D%223%22%20rx%3D%221.5%22%20fill%3D%22%23FFF%22%20fill-opacity%3D%22.14%22%2F%3E%3Cpath%20d%3D%22M15%2033.5%2020.2%2028.8%2024.7%2031.7%2030.3%2024.8%2034%2027.2%22%20fill%3D%22none%22%20stroke%3D%22%2374F3D6%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M36%2031.5h7.5%22%20fill%3D%22none%22%20stroke%3D%22%23FFF%22%20stroke-width%3D%223.2%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22m40.7%2027.2%205.8%204.3-5.8%204.3%22%20fill%3D%22none%22%20stroke%3D%22%23FFF%22%20stroke-width%3D%223.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M44%2014h11c2.2%200%204%201.8%204%204v24c0%202.2-1.8%204-4%204H44c-2.2%200-4-1.8-4-4V18c0-2.2%201.8-4%204-4Z%22%20fill%3D%22%23FFF%22%2F%3E%3Cpath%20d%3D%22M52%2014v6c0%201.7%201.3%203%203%203h4%22%20fill%3D%22none%22%20stroke%3D%22%23D8E6FF%22%20stroke-width%3D%222.2%22%2F%3E%3Cpath%20d%3D%22M45.8%2028.2h8m-8%205h8m-8%205h4.8%22%20fill%3D%22none%22%20stroke%3D%22%235292F9%22%20stroke-width%3D%222.3%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E
// ==/UserScript==

(function () {
    'use strict';

    const TAG = '[GCE]';
    const VERSION = '5.0.3';
    const WH_APIS = [
        'WH.createApp', 'WH.initCanvas', 'WH.initD3',
        'WH.initPlot', 'WH.initThree', 'WH.initPhysics'
    ];
    const DEFAULT_FONTS = [
        'https://fonts.googleapis.com/css2?family=Material+Icons',
        'https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap',
        'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
    ];
    const DROP_TAGS = new Set([
        'script', 'style', 'svg', 'noscript', 'button', 'nav', 'iframe',
        'input', 'select', 'textarea', 'form'
    ]);
    const SELECTORS = Object.freeze({
        conversationHost: '[jsname="coFSxe"], [jsname="guest_container_"]',
        turn: '.CKgc1d',
        segmentRoot: '.CKgc1d, [data-xid="pJN44d"], .AsFDjf.Vaqf8d, .Eltaeb',
        turnRoot: '[data-xid="aim-mars-turn-root"]',
        prompt: '.ilZyRc.R7mRQb, .Ax52xb',
        mixedPrompt: '.Ax52xb',
        legacyPrompt: '.tonYlb',
        response: '[data-xid="VpUvz"], [jsname="KFl8ub"].mZJni',
        citation: '.WBgIic',
        canvasIframe: 'iframe[src*="scf.usercontent.goog"], iframe.lQ27pc',
        sourceAside: '[data-xid="aim-aside-initial-corroboration-container"], .N6Axvb',
        probe: '[jsname="coFSxe"], [jsname="guest_container_"], .CKgc1d, ' +
            '[data-xid="pJN44d"], .AsFDjf.Vaqf8d, .Eltaeb, ' +
            'iframe[src*="scf.usercontent.goog"], iframe.lQ27pc'
    });
    const TEST_MODE = globalThis.__GCE_TEST_MODE__ === true;
    let taggedIframes = new WeakSet();
    let canvasByIframe = new WeakMap();
    const registry = [];
    const turnCache = new Map();
    const snapshotFingerprints = new Map();
    const debugStats = {
        mutationCallbacks: 0,
        scheduledWork: 0,
        canvasScans: 0,
        turnCaptures: 0,
        markdownConversions: 0
    };
    let fabEl = null;
    let lastBadgeCanvas = -1;
    let lastBadgeTurn = -1;
    let currentRouteKey = '';
    let nextTurnOrder = 0;
    let workTimer = null;
    let observer = null;
    let observerRoot = null;
    let discoveryDeadline = 0;
    let routeTimer = null;
    let lastLocationHref = location.href;
    let hydrationPromise = null;
    let hydrationController = null;
    let hydrationRestore = null;
    let hydratedRouteKey = '';
    let hydratedTurnCount = -1;
    let lastHydrationResult = null;
    const pendingProbeRoots = new Set();
    let scrollListening = false;

    console.log(TAG, `v${VERSION} active on`, location.hostname);

    // ═══════════════════════════════════════════════════════════
    //  UTILITIES
    // ═══════════════════════════════════════════════════════════

    function decodeEntities(text) {
        const el = document.createElement('textarea');
        el.innerHTML = text;
        return el.value;
    }

    function parseTgPayload(raw) {
        const marker = String(raw || '').indexOf('TgQPHd|');
        if (marker < 0) return null;
        const bracket = String(raw).indexOf('[', marker + 7);
        if (bracket < 0) return null;
        try {
            return JSON.parse(decodeEntities(String(raw).slice(bracket)));
        } catch (_) {
            return null;
        }
    }

    function escapeHTML(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function textCompact(s) {
        return String(s || '').replace(/\s+/g, ' ').trim();
    }

    function stripUtm(href) {
        if (!href) return href;
        try {
            const u = new URL(href, location.href);
            u.hash = '';
            u.searchParams.delete('utm_source');
            u.searchParams.delete('utm_medium');
            u.searchParams.delete('utm_campaign');
            return u.toString();
        } catch (_) {
            return href.split('#')[0];
        }
    }

    function normUrl(u) {
        if (!u || !/^https?:\/\//i.test(u)) return null;
        return stripUtm(u);
    }

    function getDomain(u) {
        if (!u) return 'source';
        try {
            let d = new URL(u).hostname.toLowerCase().replace(/^www\./, '');
            const p = d.split('.');
            if (p.length >= 2 && p[p.length - 2].length <= 3)
                return p[p.length - 3] || p[p.length - 2];
            return p[p.length - 2] || p[0];
        } catch (_) {
            return 'source';
        }
    }

    function generateTimestamp() {
        const now = new Date();
        const p = (n) => String(n).padStart(2, '0');
        const h = now.getHours();
        const tz = Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
            .formatToParts(now).find(x => x.type === 'timeZoneName')?.value || 'UTC';
        return `${p(now.getMonth() + 1)}${p(now.getDate())}${now.getFullYear()}_` +
               `${p(h % 12 || 12)}${p(now.getMinutes())}${p(now.getSeconds())}_` +
               `${h >= 12 ? 'PM' : 'AM'}-${tz}`;
    }

    function makeFilename(title) {
        const safe = title.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'Simulation';
        return safe.replace(/ /g, '_') + '_' + generateTimestamp();
    }

    function makeMarkdownFilename(title, when = new Date()) {
        const safe = String(title || 'AI_Mode_Thread')
            .replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'AI_Mode_Thread';
        const underscored = safe.replace(/ /g, '_');
        const p = (n) => String(n).padStart(2, '0');
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const weekday = days[when.getDay()];
        const date = `${p(when.getMonth() + 1)}${p(when.getDate())}${when.getFullYear()}`;
        const h = when.getHours();
        const time = `${p(h % 12 || 12)}${p(when.getMinutes())}${p(when.getSeconds())}`;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const tz = Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
            .formatToParts(when).find(x => x.type === 'timeZoneName')?.value || 'UTC';
        return `${underscored}_${weekday}_${date}_${time}-${ampm}-${tz}.md`;
    }

    function detectType(html) {
        if (/WH\.initPhysics|initPhysics\s*\(/.test(html)) return 'Physics';
        if (/WH\.initThree|initThree\s*\(/.test(html)) return '3D Scene';
        if (/WH\.initD3|initD3\s*\(|WH\.initPlot|initPlot\s*\(/.test(html)) return 'D3/Plot';
        if (/WH\.initCanvas|initCanvas\s*\(/.test(html)) return 'Canvas 2D';
        return 'Widget';
    }

    const TYPE_COLORS = {
        'Canvas 2D': '#5292F9', 'D3/Plot': '#90E58C', '3D Scene': '#A56EFF',
        'Physics': '#FFB787', 'Widget': '#ADAFB8'
    };

    // ═══════════════════════════════════════════════════════════
    //  CONVERSATION — thread title, turn extraction, markdown
    // ═══════════════════════════════════════════════════════════

    function isPotentialAIModeURL(href = location.href) {
        try {
            const url = new URL(href, location.href);
            return url.pathname === '/search' && url.searchParams.get('udm') === '50';
        } catch (_) {
            return false;
        }
    }

    function isConversationRouteCandidate(href = location.href) {
        if (!isPotentialAIModeURL(href)) return false;
        const url = new URL(href, location.href);
        return !!(getActiveThreadId() || url.searchParams.get('mstk') || url.searchParams.get('mtid')
            || textCompact(url.searchParams.get('q') || ''));
    }

    function getActiveThreadId() {
        const active = document.querySelector(
            'button[data-thread-id][aria-current="page"], ' +
            'button[data-thread-id][aria-selected="true"], ' +
            'button.qqMZif.gkM3Zc[data-thread-id], button.qqMZif.MwdR7[data-thread-id]'
        );
        return active?.getAttribute('data-thread-id') || '';
    }

    function deriveRouteKey(href = location.href) {
        const url = new URL(href, location.href);
        const threadId = getActiveThreadId();
        if (threadId) return `thread:${threadId}`;
        const stateId = url.searchParams.get('mstk') || url.searchParams.get('mtid');
        if (stateId) return `state:${stateId}`;
        const mode = url.searchParams.get('udm') || 'search';
        const query = textCompact(url.searchParams.get('q') || '');
        return `${url.pathname}|${mode}|${query}`;
    }

    function getConversationHost() {
        if (!isConversationRouteCandidate()) return null;
        return document.querySelector(SELECTORS.conversationHost)
            || document.querySelector(SELECTORS.turnRoot)?.parentElement
            || document.querySelector(SELECTORS.segmentRoot)?.parentElement
            || null;
    }

    function compareDOMOrder(a, b) {
        if (a === b) return 0;
        const position = a.compareDocumentPosition(b);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
    }

    function buildSegmentOrderKey(segment) {
        return segment.root || segment.promptElement || segment.responseBlocks?.[0] || segment.canvasBlocks?.[0]?.iframe;
    }

    function isExcludedConversationNode(el) {
        return !!el?.closest('[data-xid="aim-mars-input-plate"], [data-xid="m3fCN"]');
    }

    function isSubstantiveResponseBlock(el) {
        if (!el || isExcludedConversationNode(el)) return false;
        const text = textCompact(el.textContent);
        if (text.length < 20) return false;
        if (/^(?:AI-generated, may include mistakes|AI responses may include mistakes\.?|Share public link)/i.test(text))
            return false;
        if (el.matches('.JslKxc, [data-xid="Gd7Hsc"]')) return false;
        return !!el.querySelector('p, .n6owBd, .AdPoic, .ncoeY, [role="heading"], ul, ol, table, pre, blockquote, strong, b')
            || el.matches('p, .n6owBd, .AdPoic, .ncoeY, [role="heading"]');
    }

    function findResponseBlocks(segmentRoot) {
        if (!segmentRoot) return [];
        const mixed = segmentRoot.matches?.('.Eltaeb')
            ? segmentRoot
            : segmentRoot.querySelector?.('.Eltaeb');
        if (mixed) {
            const contentRoot = mixed.firstElementChild || mixed;
            const direct = [...contentRoot.children].filter(child => {
                if (child.querySelector(SELECTORS.mixedPrompt)) return false;
                if (child.querySelector(SELECTORS.canvasIframe) && !isSubstantiveResponseBlock(child)) return false;
                return isSubstantiveResponseBlock(child);
            });
            if (direct.length) return direct;
            if (isSubstantiveResponseBlock(mixed)) return [mixed];
        }

        const candidates = [];
        if (segmentRoot.matches?.(SELECTORS.response)) candidates.push(segmentRoot);
        segmentRoot.querySelectorAll?.(SELECTORS.response).forEach(el => candidates.push(el));
        const unique = [...new Set(candidates)].filter(isSubstantiveResponseBlock);
        return unique.filter(candidate => !unique.some(other =>
            other !== candidate && candidate.contains(other) && isSubstantiveResponseBlock(other)
        ));
    }

    function findCanvasBlocks(root) {
        if (!root) return [];
        const iframes = [];
        if (root.matches?.(SELECTORS.canvasIframe)) iframes.push(root);
        root.querySelectorAll?.(SELECTORS.canvasIframe).forEach(iframe => iframes.push(iframe));
        return [...new Set(iframes)].map(iframe => ({
            iframe,
            root: iframe.closest('.MngkG, .emqXtf, [data-inline-canvas]') || iframe
        }));
    }

    function getPromptCandidates(root) {
        if (!root) return [];
        const candidates = [];
        if (root.matches?.(SELECTORS.prompt)) candidates.push(root);
        root.querySelectorAll?.(SELECTORS.prompt).forEach(el => candidates.push(el));
        root.querySelectorAll?.(SELECTORS.legacyPrompt).forEach(el => {
            if (!el.querySelector(SELECTORS.prompt)) candidates.push(el);
        });
        return [...new Set(candidates)].filter(el => !!extractUserText(el));
    }

    function findPromptForResponseBlock(segmentRoot, host = getConversationHost()) {
        if (!segmentRoot) return null;
        if (segmentRoot.matches?.(SELECTORS.prompt) && extractUserText(segmentRoot)) return segmentRoot;
        const contained = [...segmentRoot.querySelectorAll?.(SELECTORS.prompt) || []]
            .find(el => extractUserText(el));
        if (contained) return contained;

        const candidates = getPromptCandidates(host);
        let nearest = null;
        for (const candidate of candidates) {
            if (candidate.contains(segmentRoot)) return candidate;
            const position = candidate.compareDocumentPosition(segmentRoot);
            if (position & Node.DOCUMENT_POSITION_FOLLOWING) nearest = candidate;
        }
        return nearest;
    }

    function associateCanvasesWithSegments(segments, canvasBlocks) {
        const unassociated = [];
        for (const canvas of canvasBlocks) {
            let owner = segments.find(segment => segment.root?.contains(canvas.iframe));
            if (!owner) {
                const preceding = segments.filter(segment => {
                    const key = buildSegmentOrderKey(segment);
                    return key && (key.compareDocumentPosition(canvas.iframe) & Node.DOCUMENT_POSITION_FOLLOWING);
                });
                owner = preceding[preceding.length - 1] || null;
            }
            if (owner) owner.canvasBlocks.push(canvas);
            else unassociated.push(canvas);
        }
        return unassociated;
    }

    function getConversationSegments(root = getConversationHost()) {
        if (!root) return [];
        const candidates = [];
        if (root.matches?.(SELECTORS.segmentRoot)) candidates.push(root);
        root.querySelectorAll?.(`${SELECTORS.segmentRoot}, ${SELECTORS.response}`).forEach(el => candidates.push(el));

        const roots = [...new Set(candidates)].filter(el => {
            if (isExcludedConversationNode(el)) return false;
            if (el.matches('.CKgc1d, [data-xid="pJN44d"]')) return true;
            if (el.matches('.AsFDjf.Vaqf8d')) return !el.closest('[data-xid="pJN44d"]');
            if (el.matches('.Eltaeb')) return !el.closest('.CKgc1d, [data-xid="pJN44d"], .AsFDjf.Vaqf8d');
            if (el.matches(SELECTORS.response))
                return !el.closest('.CKgc1d, [data-xid="pJN44d"], .AsFDjf.Vaqf8d, .Eltaeb');
            return false;
        });

        const segments = roots.map(segmentRoot => ({
            root: segmentRoot,
            promptElement: findPromptForResponseBlock(segmentRoot, root),
            responseBlocks: findResponseBlocks(segmentRoot),
            canvasBlocks: []
        })).filter(segment => segment.promptElement || segment.responseBlocks.length || findCanvasBlocks(segment.root).length);

        const usedPrompts = new Set(segments.map(segment => segment.promptElement).filter(Boolean));
        for (const promptElement of getPromptCandidates(root)) {
            const prompt = extractUserText(promptElement);
            if (!prompt || usedPrompts.has(promptElement)) continue;
            segments.push({ root: promptElement, promptElement, responseBlocks: [], canvasBlocks: [] });
            usedPrompts.add(promptElement);
        }

        segments.sort((a, b) => compareDOMOrder(buildSegmentOrderKey(a), buildSegmentOrderKey(b)));
        const allCanvasBlocks = findCanvasBlocks(root);
        const unassociated = associateCanvasesWithSegments(segments, allCanvasBlocks);
        for (const canvas of unassociated) {
            segments.push({ root: canvas.root, promptElement: null, responseBlocks: [], canvasBlocks: [canvas] });
        }
        segments.sort((a, b) => compareDOMOrder(buildSegmentOrderKey(a), buildSegmentOrderKey(b)));
        return segments;
    }

    function getMountedTurnElements(root = getConversationHost()) {
        return getConversationSegments(root).map(segment => segment.root);
    }

    function extractThreadTitle(turns) {
        const active = document.querySelector(
            'button.qqMZif[aria-current="page"] .ik7Yc span, ' +
            'button.qqMZif[aria-selected="true"] .ik7Yc span, ' +
            'button.qqMZif.gkM3Zc .ik7Yc span, ' +
            'button.qqMZif.MwdR7 .ik7Yc span'
        );
        if (active?.textContent.trim()) return textCompact(active.textContent);

        const anyThread = document.querySelector('button.qqMZif[data-thread-id] .ik7Yc span');
        if (anyThread?.textContent.trim()) return textCompact(anyThread.textContent);

        const t = document.title.replace(/\s*-\s*Google Search\s*$/i, '').trim();
        if (t && t.length > 3) return t;

        if (turns?.[0]?.prompt || turns?.[0]?.user) {
            const u = turns[0].prompt || turns[0].user;
            return u.length > 80 ? u.slice(0, 77) + '...' : u;
        }
        return 'AI_Mode_Thread';
    }

    function cleanPromptText(value) {
        return textCompact(value)
            .replace(/^You said:\s*/i, '')
            .replace(/^You sent:\s*\d+\s+images?\s+and said:\s*/i, '');
    }

    function extractUserText(turnEl) {
        if (!turnEl) return '';
        const prompt = turnEl.matches?.(SELECTORS.prompt) ? turnEl : turnEl.querySelector?.(SELECTORS.prompt);
        if (prompt) {
            if (prompt.matches(SELECTORS.mixedPrompt)) {
                const mixedText = prompt.querySelector('.sJvql, .TPpW9')?.textContent || prompt.textContent;
                const clean = cleanPromptText(mixedText);
                if (clean) return clean;
            }
            const heading = prompt.querySelector('[role="heading"]');
            if (heading) {
                const clone = heading.cloneNode(true);
                clone.querySelectorAll('button, [role="button"], .iMqumd, [aria-hidden="true"]')
                    .forEach(el => el.remove());
                const clean = cleanPromptText(clone.textContent);
                if (clean) return clean;
            }
            const copy = prompt.querySelector('button[aria-label^="Copy "]')?.getAttribute('aria-label');
            if (copy) return cleanPromptText(copy.replace(/^Copy\s+/i, ''));
        }
        const legacy = turnEl.matches?.(SELECTORS.legacyPrompt) ? turnEl : turnEl.querySelector?.(SELECTORS.legacyPrompt);
        if (!legacy) return '';
        const clone = legacy.cloneNode(true);
        clone.querySelectorAll(
            'button, [role="button"], .iMqumd, time, .kwdzO, .L6HOGc, ' +
            '.CKgc1d, [data-xid="pJN44d"], .AsFDjf.Vaqf8d, .Eltaeb'
        ).forEach(el => el.remove());
        return cleanPromptText(clone.textContent);
    }

    function extractTurnDate(turnEl) {
        const dateEl = turnEl?.querySelector('.L6HOGc, time, .kwdzO, [data-xid="DChuCc"]');
        if (!dateEl) return '';
        const datetime = dateEl.getAttribute('datetime');
        return textCompact(datetime || dateEl.textContent || '');
    }

    function isNoiseLink(href, label) {
        if (!href) return true;
        if (/^javascript:/i.test(href)) return true;
        if (/google\.com\/search/i.test(href) && !label) return true;
        return false;
    }

    function shouldDropImage(el) {
        const src = (el.getAttribute('src') || '').toLowerCase();
        if (!src) return true;
        if (src.includes('faviconv2') || src.includes('encrypted-tbn') || src.startsWith('data:image'))
            return true;
        const parent = el.closest('li, [data-tpcrb-host], .kWjn6e');
        if (parent && /^\d{1,2}:\d{2}$/.test(textCompact(el.nextElementSibling?.textContent || '')))
            return true;
        return false;
    }

    function isSourceURL(url) {
        if (!url || !/^https?:\/\//i.test(url)) return false;
        try {
            const host = new URL(url).hostname.toLowerCase();
            if (host === 'google.com' || host === 'www.google.com') return false;
        } catch (_) { return false; }
        return !/(?:favicon|encrypted-tbn|gstatic\.com\/images|googleusercontent\.com\/proxy|google\.com\/logos|\.svg(?:\?|$)|\.png(?:\?|$)|\.jpe?g(?:\?|$)|\.webp(?:\?|$))/i.test(url);
    }

    function collectHTTPStrings(value, output) {
        if (typeof value === 'string') {
            if (isSourceURL(value)) output.push(value);
            return;
        }
        if (Array.isArray(value)) value.forEach(item => collectHTTPStrings(item, output));
        else if (value && typeof value === 'object') Object.values(value).forEach(item => collectHTTPStrings(item, output));
    }

    function collectUUIDRecords(value, uuid, output) {
        if (!value || (typeof value !== 'object')) return;
        const children = Array.isArray(value) ? value : Object.values(value);
        if (children.some(item => item === uuid)) {
            collectHTTPStrings(value, output);
            return;
        }
        children.forEach(item => collectUUIDRecords(item, uuid, output));
    }

    function preferArticleURLs(urls) {
        const normalized = [];
        const seen = new Set();
        for (const raw of urls) {
            const url = normUrl(raw);
            if (!url || !isSourceURL(url) || seen.has(url)) continue;
            seen.add(url);
            normalized.push(url);
        }
        const articleHosts = new Set(normalized.filter(url => {
            try {
                const parsed = new URL(url);
                return parsed.pathname !== '/' || parsed.search;
            } catch (_) { return false; }
        }).map(url => new URL(url).host));
        return normalized.filter(url => {
            const parsed = new URL(url);
            return parsed.pathname !== '/' || parsed.search || !articleHosts.has(parsed.host);
        });
    }

    function extractCitationMap(turnEl) {
        const uuids = [...turnEl.querySelectorAll(`${SELECTORS.citation} button[data-icl-uuid]`)]
            .map(button => button.getAttribute('data-icl-uuid')).filter(Boolean);
        const uniqueUUIDs = [...new Set(uuids)];
        const parsedPayloads = [];
        const walker = document.createTreeWalker(turnEl, NodeFilter.SHOW_COMMENT);
        while (walker.nextNode()) {
            const raw = String(walker.currentNode.textContent || '');
            if (!raw.includes('TgQPHd|')) continue;
            const parsed = parseTgPayload(raw);
            if (parsed) parsedPayloads.push(parsed);
        }
        const result = new Map();
        for (const uuid of uniqueUUIDs) {
            const urls = [];
            parsedPayloads.forEach(payload => collectUUIDRecords(payload, uuid, urls));
            const markerButton = [...turnEl.querySelectorAll(`${SELECTORS.citation} button[data-icl-uuid]`)]
                .find(button => button.getAttribute('data-icl-uuid') === uuid);
            const marker = markerButton?.closest(SELECTORS.citation);
            marker?.querySelectorAll('a[href]').forEach(a => urls.push(a.href));
            result.set(uuid, preferArticleURLs(urls));
        }
        return result;
    }

    function extractFallbackSourceURLs(segmentRoot) {
        if (!segmentRoot) return [];
        const urls = [];
        segmentRoot.querySelectorAll(`${SELECTORS.sourceAside} a[href]`).forEach(anchor => {
            const normalized = normUrl(anchor.href);
            if (normalized && isSourceURL(normalized)) urls.push(normalized);
        });
        return urls;
    }

    function createCitationTracker(citationMap = new Map(), fallbackURLs = []) {
        const map = new Map();
        const refs = new Map();
        let n = 1;
        let fallbackIndex = 0;
        return {
            add(url) {
                const k = normUrl(url);
                if (!k) return null;
                if (!map.has(k)) {
                    map.set(k, n);
                    refs.set(n, { href: url, name: getDomain(k), k });
                    n++;
                }
                return map.get(k);
            },
            addUUID(uuid) {
                return (citationMap.get(uuid) || []).map(url => ({ num: this.add(url), url })).filter(x => x.num);
            },
            addMarker(marker) {
                const tokens = [...marker.querySelectorAll('button[data-icl-uuid]')]
                    .flatMap(button => this.addUUID(button.getAttribute('data-icl-uuid')));
                if (!tokens.length && fallbackIndex < fallbackURLs.length) {
                    const url = fallbackURLs[fallbackIndex++];
                    const num = this.add(url);
                    if (num) tokens.push({ num, url });
                }
                return tokens;
            },
            addRemainingFallbacks() {
                fallbackURLs.forEach(url => this.add(url));
            },
            refs
        };
    }

    function inlineCite(num, href) {
        return `[${num}](${href})`;
    }

    function prepareCloneForMarkdown(root) {
        const clone = root.cloneNode(true);
        clone.querySelectorAll(
            '[data-xid="Gd7Hsc"], [data-xid="aim-aside-initial-corroboration-container"], ' +
            '.N6Axvb, .JslKxc, .Z99Mic, [data-tpcrb-host], .kWjn6e, ' +
            '[data-xid="m3fCN"], .ofHStc, .qmNpEc, ' +
            '.emqXtf, iframe, [data-inline-canvas], .Lucn7c, .ZAjsj, ' +
            '[role="dialog"], [aria-modal="true"], aside, nav, form'
        ).forEach(n => n.remove());
        clone.querySelectorAll('button:not([data-icl-uuid]), input, select, textarea, img, picture, source').forEach(n => n.remove());
        clone.querySelectorAll('svg').forEach(s => s.remove());
        return clone;
    }

    function aimDomToMarkdown(root, citeTracker) {
        if (!root) return '';

        function escInline(s) {
            return String(s ?? '').replace(/[`*_[\]]/g, m => '\\' + m);
        }

        function walk(node, ctx = { inPre: false, inTable: false, listDepth: 0 }) {
            if (!node) return '';
            if (node.nodeType === Node.TEXT_NODE) {
                const t = node.nodeValue || '';
                if (ctx.inPre) return t;
                return escInline(t.replace(/\s+/g, ' '));
            }
            if (node.nodeType !== Node.ELEMENT_NODE) return '';

            const el = node;
            const tag = el.tagName.toLowerCase();
            if (el.matches(SELECTORS.citation)) {
                const tokens = citeTracker.addMarker(el)
                    .map(({ num, url }) => inlineCite(num, url));
                return [...new Set(tokens)].join('');
            }
            if (DROP_TAGS.has(tag)) return '';
            if (el.closest('[data-tpcrb-host], .kWjn6e')) return '';
            if (tag === 'img') return shouldDropImage(el) ? '' : '';

            const children = () => Array.from(el.childNodes).map(c => walk(c, ctx)).join('');

            if (tag === 'a') {
                const href = normUrl(el.getAttribute('href') || '');
                if (!href || isNoiseLink(href, textCompact(el.textContent))) return children();
                const label = textCompact(el.textContent);
                if (!label || /^\d+$/.test(label)) {
                    const num = citeTracker.add(href);
                    if (num) return inlineCite(num, href);
                }
                if (!label) return `[${getDomain(href)}](${href})`;
                return `[${escInline(label)}](${href})`;
            }

            if (/^h[1-6]$/.test(tag) || el.matches('div.AdPoic[role="heading"], div.ncoeY, div.xM049c.BAlmad')) {
                const lvl = /^h[1-6]$/.test(tag) ? Number(tag[1]) : 2;
                const t = textCompact(children()).replace(/^#{1,6}\s+/, '');
                return t ? `\n${'#'.repeat(lvl)} ${t}\n\n` : '';
            }
            if (tag === 'p' || el.matches('div.n6owBd')) {
                const t = children().trim();
                return t ? `\n${t}\n\n` : '';
            }
            if (tag === 'br') return '  \n';
            if (tag === 'hr') return '\n---\n\n';
            if (tag === 'strong' || tag === 'b') {
                const t = children();
                return t ? `**${t}**` : '';
            }
            if (tag === 'em' || tag === 'i') {
                const t = children();
                return t ? `*${t}*` : '';
            }
            if (tag === 'code') {
                if (ctx.inPre) return el.textContent || '';
                const c = (el.textContent || '').replace(/`/g, '\\`');
                return '`' + c + '`';
            }
            if (tag === 'pre') {
                const code = el.querySelector('code');
                const lang = code ? [...code.classList].find(c => c.startsWith('language-'))?.slice(9) || '' : '';
                const body = (code || el).textContent || '';
                return `\n\`\`\`${lang}\n${body}\n\`\`\`\n\n`;
            }
            if (tag === 'blockquote') {
                const inner = children().trim().split('\n').map(l => l.trim() ? `> ${l.trim()}` : '>').join('\n');
                return inner ? `\n${inner}\n\n` : '';
            }
            if (tag === 'ul' || tag === 'ol') {
                const items = [...el.children].filter(c => c.tagName?.toLowerCase() === 'li');
                if (!items.length) return children();
                const indent = '  '.repeat(ctx.listDepth);
                let out = ctx.listDepth ? '' : '\n';
                items.forEach((li, i) => {
                    const bullet = tag === 'ol' ? `${i + 1}. ` : '- ';
                    const direct = [...li.childNodes]
                        .filter(child => !(child.nodeType === Node.ELEMENT_NODE && /^(ul|ol)$/i.test(child.tagName)))
                        .map(child => walk(child, { ...ctx, inTable: false, listDepth: ctx.listDepth + 1 }))
                        .join('').trim();
                    const nested = [...li.children]
                        .filter(child => /^(ul|ol)$/i.test(child.tagName))
                        .map(child => walk(child, { ...ctx, listDepth: ctx.listDepth + 1 })).join('');
                    if (!direct && !nested.trim()) return;
                    if (direct) out += `${indent}${bullet}${direct}\n`;
                    out += nested;
                });
                return out + (ctx.listDepth ? '' : '\n');
            }
            if (tag === 'li') return children();
            if (tag === 'table') {
                const rows = [];
                for (const tr of el.querySelectorAll('tr')) {
                    const cells = [...tr.querySelectorAll('th,td')].map(td =>
                        textCompact(walk(td, { ...ctx, inTable: true })).replace(/\|/g, '\\|').replace(/\n/g, '<br>')
                    );
                    if (cells.length) rows.push('| ' + cells.join(' | ') + ' |');
                }
                if (rows.length >= 2) {
                    const sep = '| ' + rows[0].split('|').slice(1, -1).map(() => '---').join(' | ') + ' |';
                    return '\n' + rows[0] + '\n' + sep + '\n' + rows.slice(1).join('\n') + '\n\n';
                }
                return children();
            }
            if (tag === 'thead' || tag === 'tbody' || tag === 'tr' || tag === 'th' || tag === 'td')
                return children();

            return children();
        }

        const clone = prepareCloneForMarkdown(root);
        return walk(clone);
    }

    function normalizeMarkdown(md) {
        const lines = String(md || '').replace(/\r\n/g, '\n').split('\n');
        const out = [];
        let inFence = false;
        let blank = false;
        for (let line of lines) {
            if (/^\s*```/.test(line)) inFence = !inFence;
            if (!inFence) {
                const hardBreak = / {2}$/.test(line);
                line = line.replace(/[ \t]+$/g, hardBreak ? '  ' : '');
                line = line.replace(/ \+1\b/g, '').replace(/\\_/g, '_');
                if (/^\s*(?:-|\d+\.)\s*$/.test(line)) line = '';
            }
            if (!inFence && !line.trim()) {
                if (!blank && out.length) out.push('');
                blank = true;
                continue;
            }
            out.push(line);
            blank = false;
        }
        return out.join('\n').trim();
    }

    function formatReferences(source) {
        const refs = source?.refs || source;
        if (!refs || (Array.isArray(refs) ? refs.length === 0 : refs.size === 0)) return '';
        const lines = ['### References', ''];
        const entries = Array.isArray(refs) ? refs.map((ref, i) => [ref.num || i + 1, ref]) : [...refs.entries()];
        for (const [num, ref] of entries.sort((a, b) => a[0] - b[0])) {
            lines.push(`[${num}] [${ref.name}](${ref.href})`);
        }
        return lines.join('\n');
    }

    function canvasPlaceholder(title) {
        return `> [Interactive Canvas: ${title}]`;
    }

    function getResponseFingerprintText(block) {
        const parts = [...block.querySelectorAll(
            '.n6owBd, .AdPoic, .ncoeY, .xM049c.BAlmad, p, li, pre, blockquote, th, td'
        )].map(el => textCompact(el.textContent)).filter(Boolean);
        return (parts.length ? parts.join('\u241e') : textCompact(block.textContent)).slice(0, 20000);
    }

    function stringHash(value) {
        let hash = 2166136261;
        for (let i = 0; i < value.length; i++) {
            hash ^= value.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(36);
    }

    function snapshotConversationSegment(segment, order) {
        const segmentRoot = segment.root;
        const prompt = extractUserText(segment.promptElement || segmentRoot);
        const timestamp = extractTurnDate(segment.promptElement?.parentElement || segmentRoot);
        const responseText = segment.responseBlocks.map(getResponseFingerprintText).join('\u241f');
        const canvasRecords = segment.canvasBlocks.map((canvas, index) => {
            const record = getCanvasRecordForIframe(canvas.iframe);
            return record || { title: `Interactive Canvas ${index + 1}`, type: 'Widget' };
        });
        if (!prompt && !responseText && !canvasRecords.length) return null;
        const stable = segmentRoot?.id || segmentRoot?.getAttribute?.('data-ved')
            || segmentRoot?.querySelector?.('[data-ved]')?.getAttribute('data-ved');
        const id = stable ? `dom:${stable}` : `content:${stringHash(`${prompt}\u241f${timestamp}\u241f${responseText}\u241f${canvasRecords.map(c => c.title).join('|')}`)}`;
        const fingerprint = stringHash(`${responseText}\u241f${segmentRoot?.querySelectorAll?.('[data-icl-uuid]').length || 0}\u241f${canvasRecords.map(c => c.title).join('|')}`);
        const prior = turnCache.get(id);
        if (prior && snapshotFingerprints.get(id) === fingerprint) return { ...prior, order };
        const citationMap = extractCitationMap(segmentRoot);
        const fallbackSources = extractFallbackSourceURLs(segmentRoot);
        const tracker = createCitationTracker(citationMap, fallbackSources);
        debugStats.markdownConversions++;

        const orderedParts = [
            ...segment.responseBlocks.map(block => ({ type: 'text', key: block, block })),
            ...segment.canvasBlocks.map((canvas, index) => ({
                type: 'canvas',
                key: canvas.iframe,
                record: canvasRecords[index]
            }))
        ].sort((a, b) => compareDOMOrder(a.key, b.key));
        const markdownParts = [];
        let hasTextResponse = false;
        for (const part of orderedParts) {
            if (part.type === 'canvas') {
                markdownParts.push(canvasPlaceholder(part.record.title));
                continue;
            }
            const markdown = normalizeMarkdown(aimDomToMarkdown(part.block, tracker));
            if (!markdown) continue;
            markdownParts.push(markdown);
            hasTextResponse = true;
        }
        tracker.addRemainingFallbacks();
        const bodyMarkdown = normalizeMarkdown(markdownParts.join('\n\n'));
        if (!bodyMarkdown) return null;
        snapshotFingerprints.set(id, fingerprint);
        return {
            id,
            prompt,
            user: prompt,
            timestamp,
            date: timestamp,
            bodyMarkdown,
            references: [...tracker.refs.entries()].map(([num, ref]) => ({ num, ...ref })),
            canvasTitles: canvasRecords.map(record => record.title),
            canvasTitle: canvasRecords[0]?.title || '',
            canvasPlaceholdersEmbedded: true,
            hasTextResponse,
            order
        };
    }

    function snapshotTurn(turnEl, order) {
        const segment = getConversationSegments(turnEl.parentElement || getConversationHost())
            .find(candidate => candidate.root === turnEl)
            || {
                root: turnEl,
                promptElement: findPromptForResponseBlock(turnEl),
                responseBlocks: findResponseBlocks(turnEl),
                canvasBlocks: findCanvasBlocks(turnEl)
            };
        return snapshotConversationSegment(segment, order);
    }

    function captureMountedTurns({ reindex = false, orderStart = 0 } = {}) {
        const mounted = getConversationSegments();
        let order = reindex ? orderStart : nextTurnOrder;
        let added = 0;
        for (const segment of mounted) {
            const snapshot = snapshotConversationSegment(segment, order);
            if (!snapshot) continue;
            const prior = turnCache.get(snapshot.id);
            if (prior) {
                snapshot.order = reindex ? order : prior.order;
                turnCache.set(snapshot.id, { ...prior, ...snapshot });
            } else {
                turnCache.set(snapshot.id, snapshot);
                added++;
            }
            order++;
        }
        if (reindex) nextTurnOrder = Math.max(nextTurnOrder, order);
        else nextTurnOrder = order;
        debugStats.turnCaptures += mounted.length;
        return { added, nextOrder: order };
    }

    function getCachedTurns() {
        return [...turnCache.values()].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
    }

    function extractConversationTurns() {
        captureMountedTurns();
        return getCachedTurns();
    }

    function summarizeConversation(turns = getCachedTurns()) {
        return {
            segmentCount: turns.length,
            promptCount: turns.filter(turn => !!(turn.prompt || turn.user)).length,
            responseCount: turns.filter(turn => turn.hasTextResponse !== false && !!turn.bodyMarkdown).length,
            canvasCount: turns.reduce((count, turn) => count + (turn.canvasTitles?.length || 0), 0)
        };
    }

    function yamlString(value) {
        return JSON.stringify(String(value ?? ''));
    }

    function buildConversationMarkdown(opts) {
        const turns = opts.turns || extractConversationTurns();
        if (!turns.length) return null;

        const title = opts.title || extractThreadTitle(turns);
        const parts = [];

        if (opts.frontmatter !== false) {
            const exported = new Date().toLocaleString('en-US', {
                dateStyle: 'full', timeStyle: 'long'
            });
            parts.push(
                '---',
                `title: ${yamlString(title)}`,
                `source: ${yamlString(opts.srcURL || location.href)}`,
                `exported: ${yamlString(exported)}`,
                `turns: ${turns.length}`,
                `exporter: Google AI Canvas Exporter v${VERSION}`,
                '---',
                ''
            );
        }

        turns.forEach((turn, idx) => {
            const prompt = turn.prompt || turn.user;
            const timestamp = turn.timestamp || turn.date;
            if (prompt) parts.push(`You said: ${prompt}`, '');
            if (opts.turnDates !== false && timestamp) {
                parts.push(timestamp, '');
            }

            if (turn.bodyMarkdown) {
                let body = turn.bodyMarkdown;
                if (!turn.canvasPlaceholdersEmbedded) {
                    const titles = turn.canvasTitles?.length
                        ? turn.canvasTitles
                        : (turn.canvasTitle ? [turn.canvasTitle] : []);
                    for (const title of titles) body += (body ? '\n\n' : '') + canvasPlaceholder(title);
                }
                if (body) parts.push(body, '');
                const refs = formatReferences(turn.references);
                if (refs) parts.push(refs, '');
            } else if (turn.aiEl) {
                const citeTracker = createCitationTracker();
                let body = normalizeMarkdown(aimDomToMarkdown(turn.aiEl, citeTracker));
                if (turn.canvasTitle) {
                    body += (body ? '\n\n' : '') + `> [Interactive Canvas: ${turn.canvasTitle}]`;
                }
                if (body) parts.push(body, '');
                const refs = formatReferences(citeTracker);
                if (refs) parts.push(refs, '');
            }

            if (idx < turns.length - 1) parts.push('---', '');
        });

        return normalizeMarkdown(parts.join('\n'));
    }

    function hasExportableConversation() {
        return [...turnCache.values()].some(turn =>
            !!(turn.prompt || turn.user) && turn.hasTextResponse === true && !!turn.bodyMarkdown
        );
    }

    // ═══════════════════════════════════════════════════════════
    //  CANVAS DETECTION
    // ═══════════════════════════════════════════════════════════

    function findCanvasIframes(root = document) {
        const found = [];
        if (root.matches?.(SELECTORS.canvasIframe)) found.push(root);
        root.querySelectorAll?.(SELECTORS.canvasIframe).forEach(iframe => found.push(iframe));
        return found.filter(iframe => !taggedIframes.has(iframe));
    }

    function extractWidgetHTMLFromComment(iframe) {
        let container = iframe.closest('.emqXtf')
                     || iframe.closest('.Q9iar')
                     || iframe.closest('.MngkG');
        if (!container) {
            container = iframe;
            for (let i = 0; i < 5 && container.parentElement; i++)
                container = container.parentElement;
        }

        const walker = document.createTreeWalker(container, NodeFilter.SHOW_COMMENT);
        while (walker.nextNode()) {
            const raw = String(walker.currentNode.textContent || '');
            if (!raw.includes('TgQPHd|')) continue;
            const parsed = parseTgPayload(raw);
            if (!Array.isArray(parsed)) continue;
            const htmlStr = findHTMLString(parsed);
            if (htmlStr) {
                console.log(TAG, 'Extracted widget HTML from TgQPHd comment (' + htmlStr.length + ' chars)');
                return htmlStr;
            }
        }
        return null;
    }

    function findHTMLString(arr) {
        for (const item of arr) {
            if (typeof item === 'string' && item.length > 200) {
                if (item.includes('WidgetHelpers') || WH_APIS.some(a => item.includes(a)))
                    return item;
            }
            if (Array.isArray(item)) {
                const found = findHTMLString(item);
                if (found) return found;
            }
        }
        return null;
    }

    function extractTitle(doc) {
        const h = doc.querySelector('.widget-title');
        if (h?.textContent.trim()) return h.textContent.trim();
        for (const s of doc.querySelectorAll('script:not([src])')) {
            const m = s.textContent.match(/createApp\s*\(\s*\{[^]*?title\s*:\s*["']([^"']+)["']/);
            if (m) return m[1];
        }
        const t = doc.querySelector('title');
        if (t?.textContent.trim() && !/Widget Shell/i.test(t.textContent)) return t.textContent.trim();
        return 'Interactive_Simulation';
    }

    function registerCanvasIframe(iframe) {
        const known = canvasByIframe.get(iframe);
        if (known) return { record: known, added: false };
        const widgetHTML = extractWidgetHTMLFromComment(iframe);
        if (!widgetHTML) return { record: null, added: false };

        taggedIframes.add(iframe);
        const doc = new DOMParser().parseFromString(widgetHTML, 'text/html');
        const title = extractTitle(doc);
        const duplicate = registry.find(canvas =>
            canvas.title === title && Math.abs(canvas.widgetHTML.length - widgetHTML.length) < 100
        );
        if (duplicate) {
            canvasByIframe.set(iframe, duplicate);
            return { record: duplicate, added: false };
        }

        const record = {
            id: registry.length,
            widgetHTML,
            title,
            type: detectType(widgetHTML),
            iframe
        };
        registry.push(record);
        canvasByIframe.set(iframe, record);
        console.log(TAG, `Canvas registered: "${title}" [${record.type}]`);
        return { record, added: true };
    }

    function getCanvasRecordForIframe(iframe) {
        return canvasByIframe.get(iframe) || registerCanvasIframe(iframe).record;
    }

    function scanCanvases(root = document) {
        debugStats.canvasScans++;
        let added = 0;
        for (const iframe of findCanvasIframes(root)) {
            if (registerCanvasIframe(iframe).added) added++;
        }
        return added;
    }

    function removeExporterUI() {
        document.getElementById('gce-overlay')?.remove();
        fabEl?.remove();
        fabEl = null;
        document.getElementById('gce-styles')?.remove();
        lastBadgeCanvas = -1;
        lastBadgeTurn = -1;
    }

    function abortHydration() {
        hydrationController?.abort();
        hydrationController = null;
        hydrationPromise = null;
        if (hydrationRestore) {
            hydrationRestore();
            hydrationRestore = null;
        }
    }

    function stopObserver() {
        observer?.disconnect();
        observer = null;
        observerRoot = null;
        clearTimeout(workTimer);
        workTimer = null;
        pendingProbeRoots.clear();
    }

    function resetRouteState(routeKey = deriveRouteKey()) {
        abortHydration();
        stopObserver();
        turnCache.clear();
        snapshotFingerprints.clear();
        registry.length = 0;
        taggedIframes = new WeakSet();
        canvasByIframe = new WeakMap();
        nextTurnOrder = 0;
        hydratedRouteKey = '';
        hydratedTurnCount = -1;
        lastHydrationResult = null;
        currentRouteKey = routeKey;
        removeExporterUI();
    }

    function updateFABBadge() {
        if (!fabEl) return;
        const canvases = registry.length;
        const turnCount = [...turnCache.values()].filter(turn =>
            !!(turn.prompt || turn.user) && turn.hasTextResponse === true && !!turn.bodyMarkdown
        ).length;
        const conv = turnCount > 0;
        const badge = fabEl.querySelector('.gce-fab-badge');
        badge.textContent = String(canvases || turnCount);
        fabEl.querySelector('.gce-fab-dot').classList.toggle('on', conv);
        const turnLabel = `${turnCount} conversation segment${turnCount === 1 ? '' : 's'}`;
        const canvasLabel = `${canvases} canvas${canvases === 1 ? '' : 'es'}`;
        const label = `Export ${turnLabel} and ${canvasLabel}`;
        fabEl.title = label;
        fabEl.setAttribute('aria-label', label);
        if (canvases !== lastBadgeCanvas || turnCount !== lastBadgeTurn) {
            lastBadgeCanvas = canvases;
            lastBadgeTurn = turnCount;
            fabEl.classList.remove('gce-pop');
            void fabEl.offsetWidth;
            fabEl.classList.add('gce-pop');
        }
    }

    function reconcileTargetState() {
        const host = getConversationHost();
        if (!host) {
            turnCache.clear();
            snapshotFingerprints.clear();
            if (!document.querySelector(SELECTORS.canvasIframe)) {
                registry.length = 0;
                taggedIframes = new WeakSet();
                canvasByIframe = new WeakMap();
            }
        }
        const verified = hasExportableConversation() || registry.length > 0;
        if (!verified) {
            abortHydration();
            document.getElementById('gce-overlay')?.remove();
            fabEl?.remove();
            fabEl = null;
            document.getElementById('gce-styles')?.remove();
            return false;
        }
        ensureFAB();
        updateFABBadge();
        return true;
    }

    function nodeContainsProbe(node) {
        return node?.nodeType === Node.ELEMENT_NODE &&
            (node.matches?.(SELECTORS.probe) || node.querySelector?.(SELECTORS.probe));
    }

    function runScheduledDiscovery() {
        workTimer = null;
        debugStats.scheduledWork++;
        const roots = [...pendingProbeRoots];
        pendingProbeRoots.clear();
        for (const root of roots) scanCanvases(root);
        if (roots.some(root => root.matches?.(SELECTORS.segmentRoot) || root.querySelector?.(SELECTORS.segmentRoot))) {
            captureMountedTurns();
        }
        const host = getConversationHost();
        if (host && observerRoot !== host) startObserver(host);
        reconcileTargetState();
    }

    function scheduleDiscovery(root = document.documentElement) {
        if (root) pendingProbeRoots.add(root);
        clearTimeout(workTimer);
        workTimer = setTimeout(() => {
            const idle = window.requestIdleCallback || (callback => setTimeout(callback, 0));
            idle(runScheduledDiscovery, { timeout: 500 });
        }, 250);
    }

    function startObserver(root) {
        if (!root || observerRoot === root) return;
        stopObserver();
        observerRoot = root;
        observer = new MutationObserver(mutations => {
            debugStats.mutationCallbacks++;
            let relevant = false;
            for (const mutation of mutations) {
                const targetElement = mutation.target.nodeType === Node.ELEMENT_NODE
                    ? mutation.target : mutation.target.parentElement;
                const enclosingTurn = targetElement?.closest?.(SELECTORS.segmentRoot);
                const hasNearbyCanvas = mutation.addedNodes.length > 0 &&
                    (targetElement?.matches?.(SELECTORS.canvasIframe) || targetElement?.querySelector?.(SELECTORS.canvasIframe));
                if (mutation.type === 'characterData' && enclosingTurn) {
                    pendingProbeRoots.add(enclosingTurn);
                    relevant = true;
                    continue;
                }
                for (const node of mutation.addedNodes) {
                    if (nodeContainsProbe(node)) {
                        pendingProbeRoots.add(node);
                        relevant = true;
                    } else if (enclosingTurn) {
                        pendingProbeRoots.add(enclosingTurn);
                        relevant = true;
                    } else if (hasNearbyCanvas) {
                        pendingProbeRoots.add(targetElement);
                        relevant = true;
                    }
                }
            }
            if (relevant) scheduleDiscovery(null);
        });
        observer.observe(root, {
            childList: true,
            subtree: true,
            characterData: root !== document.documentElement
        });
    }

    function onPassiveScroll() {
        if (hasExportableConversation()) scheduleDiscovery(getConversationHost() || document.documentElement);
    }

    function installScrollListener() {
        if (scrollListening) return;
        window.addEventListener('scroll', onPassiveScroll, { passive: true, capture: true });
        scrollListening = true;
    }

    function reconcileRoute() {
        const hrefChanged = lastLocationHref !== location.href;
        const routeKey = deriveRouteKey();
        if (routeKey !== currentRouteKey) {
            resetRouteState(routeKey);
            lastLocationHref = location.href;
            discoveryDeadline = isPotentialAIModeURL() ? Number.POSITIVE_INFINITY : Date.now() + 10000;
            startObserver(document.documentElement);
            if (isConversationRouteCandidate()) setTimeout(() => scheduleDiscovery(document.documentElement), 300);
            return;
        }
        lastLocationHref = location.href;

        scanCanvases(document);
        if (getConversationHost()) captureMountedTurns();
        reconcileTargetState();

        const host = getConversationHost();
        if (host) startObserver(host);
        else if (isPotentialAIModeURL() || registry.length || Date.now() < discoveryDeadline) {
            startObserver(document.documentElement);
        } else if (hrefChanged || Date.now() >= discoveryDeadline) {
            stopObserver();
        }
    }

    function getScrollContainer() {
        const host = getConversationHost();
        for (let node = host; node && node !== document.body; node = node.parentElement) {
            const style = getComputedStyle(node);
            if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 20) return node;
        }
        return document.scrollingElement || document.documentElement;
    }

    function setScrollPosition(container, top) {
        if (container === document.scrollingElement || container === document.documentElement || container === document.body) {
            container.scrollTop = top;
        } else {
            container.scrollTop = top;
        }
    }

    function getScrollPosition(container) {
        return container === document.scrollingElement || container === document.documentElement || container === document.body
            ? window.scrollY : container.scrollTop;
    }

    function waitForMutationQuiet(root, signal, quietMs = 180, maxMs = 900) {
        return new Promise(resolve => {
            if (signal.aborted) return resolve();
            let quietTimer;
            const finish = () => {
                clearTimeout(quietTimer);
                clearTimeout(maxTimer);
                quietObserver.disconnect();
                resolve();
            };
            const reset = () => {
                clearTimeout(quietTimer);
                quietTimer = setTimeout(finish, quietMs);
            };
            const quietObserver = new MutationObserver(reset);
            quietObserver.observe(root || document.documentElement, { childList: true, subtree: true });
            const maxTimer = setTimeout(finish, maxMs);
            signal.addEventListener('abort', finish, { once: true });
            reset();
        });
    }

    function captureHydrationBatch(seen, orderRef) {
        let added = 0;
        for (const segment of getConversationSegments()) {
            const provisional = snapshotConversationSegment(segment, orderRef.value);
            if (!provisional) continue;
            if (!seen.has(provisional.id)) {
                seen.add(provisional.id);
                provisional.order = orderRef.value++;
            } else {
                provisional.order = turnCache.get(provisional.id)?.order ?? provisional.order;
            }
            if (!turnCache.has(provisional.id)) added++;
            turnCache.set(provisional.id, provisional);
        }
        nextTurnOrder = Math.max(nextTurnOrder, orderRef.value);
        return added;
    }

    async function hydrateConversation(onProgress) {
        if (hydrationPromise) return hydrationPromise;
        if (hydratedRouteKey === currentRouteKey && hydratedTurnCount === turnCache.size && lastHydrationResult) {
            onProgress?.({ turns: turnCache.size, steps: 0, added: 0 });
            return lastHydrationResult;
        }
        const host = getConversationHost();
        if (!host || !getConversationSegments(host).length) return { partial: false, turns: turnCache.size };

        const controller = new AbortController();
        hydrationController = controller;
        const { signal } = controller;
        hydrationPromise = (async () => {
            const container = getScrollContainer();
            const savedTop = getScrollPosition(container);
            let restored = false;
            hydrationRestore = () => {
                if (restored) return;
                restored = true;
                setScrollPosition(container, savedTop);
            };
            const started = Date.now();
            const seen = new Set();
            const orderRef = { value: 0 };
            let stableBottom = 0;
            let lastCount = -1;
            let steps = 0;
            let partial = false;
            try {
                setScrollPosition(container, 0);
                await waitForMutationQuiet(host, signal);
                while (!signal.aborted) {
                    const added = captureHydrationBatch(seen, orderRef);
                    reconcileTargetState();
                    onProgress?.({ turns: turnCache.size, steps, added });
                    const viewport = Math.max(container.clientHeight || window.innerHeight || 600, 200);
                    const maxTop = Math.max(0, container.scrollHeight - viewport);
                    const top = getScrollPosition(container);
                    const atBottom = top >= maxTop - 4;
                    if (atBottom && turnCache.size === lastCount && added === 0) stableBottom++;
                    else if (atBottom) stableBottom = 1;
                    else stableBottom = 0;
                    lastCount = turnCache.size;
                    if (stableBottom >= 2) break;
                    if (++steps >= 200 || Date.now() - started >= 30000) {
                        partial = true;
                        break;
                    }
                    setScrollPosition(container, Math.min(maxTop, top + Math.max(1, Math.floor(viewport * 0.75))));
                    await waitForMutationQuiet(host, signal);
                }
            } finally {
                hydrationRestore?.();
                hydrationRestore = null;
            }
            const result = { partial: partial || signal.aborted, turns: turnCache.size };
            if (!signal.aborted) {
                hydratedRouteKey = currentRouteKey;
                hydratedTurnCount = turnCache.size;
                lastHydrationResult = result;
            }
            return result;
        })().finally(() => {
            if (hydrationController === controller) {
                hydrationPromise = null;
                hydrationController = null;
            }
        });
        return hydrationPromise;
    }

    // ═══════════════════════════════════════════════════════════
    //  UI STYLES
    // ═══════════════════════════════════════════════════════════

    function injectStyles() {
        if (document.getElementById('gce-styles')) return;
        const s = document.createElement('style');
        s.id = 'gce-styles';
        s.textContent = `
.gce-fab{position:fixed;bottom:28px;right:28px;width:54px;height:54px;border-radius:50%;
  background:linear-gradient(135deg,#5BA3FF,#5292F9,#7C4DFF);border:none;cursor:pointer;
  box-shadow:0 4px 16px rgba(82,146,249,.4),0 2px 8px rgba(0,0,0,.3);z-index:2147483646;
  display:flex;align-items:center;justify-content:center;transition:all .2s cubic-bezier(.2,0,0,1);
  color:#fff;padding:0}
.gce-fab:hover{transform:scale(1.08);box-shadow:0 6px 24px rgba(82,146,249,.5),0 4px 12px rgba(0,0,0,.4)}
.gce-fab:active{transform:scale(.95)}
.gce-fab svg{width:26px;height:26px;pointer-events:none}
.gce-fab-badge{position:absolute;top:-3px;right:-3px;min-width:20px;height:20px;border-radius:10px;
  background:#FF878F;color:#0A0A0A;font:700 11px/20px 'Google Sans',sans-serif;text-align:center;
  padding:0 5px;border:2px solid #fff;pointer-events:none}
.gce-fab-dot{position:absolute;bottom:2px;left:2px;width:10px;height:10px;border-radius:50%;
  background:#90E58C;border:2px solid #fff;pointer-events:none;display:none}
.gce-fab-dot.on{display:block}
@keyframes gce-pop{0%,100%{box-shadow:0 4px 16px rgba(82,146,249,.4)}
  50%{box-shadow:0 4px 24px rgba(82,146,249,.7),0 0 0 8px rgba(82,146,249,.12)}}
.gce-fab.gce-pop{animation:gce-pop 1.5s ease-in-out 3}
.gce-ov{position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.6);display:flex;
  align-items:center;justify-content:center;backdrop-filter:blur(4px);
  font-family:'Google Sans',Roboto,sans-serif}
.gce-panel{background:#1A1C24;border:1px solid #3a3f50;border-radius:20px;
  box-shadow:0 24px 64px rgba(0,0,0,.6);color:#E6E8F0;width:1080px;max-width:95vw;
  max-height:88vh;display:flex;flex-direction:column;overflow:hidden}
.gce-ph{padding:18px 22px 14px;display:flex;align-items:center;justify-content:space-between;
  border-bottom:1px solid #2D2F38;flex-shrink:0}
.gce-ph h3{font-size:17px;font-weight:700;margin:0}
.gce-ph small{font-size:11px;color:#ADAFB8;margin-left:8px;font-weight:400}
.gce-x{background:#2D2F38;border:none;color:#ADAFB8;width:30px;height:30px;border-radius:50%;
  cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;
  transition:all .15s;flex-shrink:0}
.gce-x:hover{background:#3a3f50;color:#E6E8F0}
.gce-body{overflow-y:auto;flex:1;padding:14px 22px}
.gce-body::-webkit-scrollbar{width:5px}
.gce-body::-webkit-scrollbar-thumb{background:#3a3f50;border-radius:3px}
.gce-sl{font:700 10px/1 'Google Sans',sans-serif;text-transform:uppercase;color:#ADAFB8;
  letter-spacing:.6px;margin-bottom:10px;display:flex;align-items:center;gap:8px}
.gce-pill{font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:#223A94;color:#99C3FF}
.gce-warn{font-size:11px;color:#FFB787;margin:-6px 0 10px;line-height:1.4}
.gce-ci{background:#22232B;border:1px solid #2D2F38;border-radius:12px;padding:12px 14px;
  margin-bottom:8px;transition:border-color .15s,opacity .15s}
.gce-ci:hover{border-color:#3a3f50}
.gce-ci.off{opacity:.4}
.gce-cr{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.gce-cr input[type=checkbox]{width:17px;height:17px;accent-color:#5292F9;cursor:pointer;flex-shrink:0}
.gce-ct{font-size:13px;font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gce-badge{font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;white-space:nowrap}
.gce-fi{width:100%;padding:7px 10px;border-radius:7px;border:1px solid #3a3f50;background:#101218;
  color:#E6E8F0;font:11.5px/1.4 'SF Mono','Roboto Mono',monospace;outline:none;box-sizing:border-box}
.gce-fi:focus{border-color:#5292F9}
.gce-preview-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px}
.gce-preview-meta{font-size:11px;color:#ADAFB8;margin:5px 0 8px;line-height:1.45}
.gce-preview-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}
.gce-preview-pane{min-width:0}
.gce-prev,.gce-rendered{width:100%;height:420px;padding:12px;border-radius:8px;border:1px solid #2D2F38;
  background:#101218;color:#D7D9E0;box-sizing:border-box;margin:0}
.gce-prev{font:11px/1.5 'SF Mono','Roboto Mono',monospace;resize:vertical;white-space:pre;overflow:auto}
.gce-rendered{font:13px/1.55 'Google Sans',Roboto,sans-serif;overflow:auto;overflow-wrap:anywhere}
.gce-rendered h1,.gce-rendered h2,.gce-rendered h3,.gce-rendered h4,.gce-rendered h5,.gce-rendered h6{color:#F1F3F8;line-height:1.25;margin:18px 0 8px}
.gce-rendered h1{font-size:21px}.gce-rendered h2{font-size:18px}.gce-rendered h3{font-size:16px}
.gce-rendered p{margin:0 0 10px}.gce-rendered ul,.gce-rendered ol{padding-left:24px;margin:6px 0 12px}
.gce-rendered li{margin:4px 0}.gce-rendered blockquote{border-left:3px solid #5292F9;margin:10px 0;padding:8px 12px;background:#182033;color:#C9D9F5}
.gce-rendered pre{background:#090B10;border:1px solid #2D2F38;border-radius:7px;padding:10px;overflow:auto}
.gce-rendered code{font-family:'SF Mono','Roboto Mono',monospace;background:#292B34;border-radius:4px;padding:1px 4px}
.gce-rendered pre code{background:none;padding:0}.gce-rendered a{color:#99C3FF}.gce-rendered hr{border:0;border-top:1px solid #3A3F50;margin:16px 0}
.gce-rendered table{border-collapse:collapse;width:100%;margin:10px 0;font-size:12px}.gce-rendered th,.gce-rendered td{border:1px solid #3A3F50;padding:6px 8px;text-align:left;vertical-align:top}
.gce-rendered th{background:#292B34}.gce-md-frontmatter{white-space:pre-wrap;color:#ADAFB8;background:#090B10;border:1px solid #2D2F38;border-radius:7px;padding:10px}
.gce-sg{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.gce-tg{display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer;user-select:none}
.gce-tg input[type=checkbox]{width:15px;height:15px;accent-color:#5292F9}
.gce-mf{margin-top:10px}
.gce-ml{font-size:10.5px;color:#ADAFB8;margin-bottom:3px;display:block;font-weight:500}
.gce-mi{width:100%;padding:7px 10px;border-radius:7px;border:1px solid #2D2F38;background:#101218;
  color:#ADAFB8;font:11.5px 'Google Sans',sans-serif;outline:none;box-sizing:border-box}
.gce-mi:focus{border-color:#5292F9;color:#E6E8F0}
.gce-pf{padding:14px 22px;border-top:1px solid #2D2F38;display:flex;align-items:center;
  justify-content:space-between;gap:8px;flex-shrink:0;flex-wrap:wrap}
.gce-pf-left{display:flex;gap:8px;flex-wrap:wrap}
.gce-sa,.gce-sb{font:600 12px 'Google Sans',sans-serif;background:none;border:none;cursor:pointer;padding:4px 0}
.gce-sa{color:#5292F9}.gce-sb{color:#ADAFB8}
.gce-sa:hover,.gce-sb:hover{text-decoration:underline}
.gce-eb{background:linear-gradient(135deg,#5BA3FF,#5292F9);color:#0A0A0A;border:none;
  padding:9px 18px;border-radius:10px;font:700 13px 'Google Sans',sans-serif;cursor:pointer;
  box-shadow:0 2px 8px rgba(82,146,249,.3)}
.gce-eb:hover{transform:translateY(-1px)}
.gce-eb:disabled{opacity:.5;cursor:not-allowed;transform:none}
.gce-toast{position:fixed;bottom:96px;left:50%;transform:translateX(-50%);z-index:2147483647;
  padding:11px 22px;border-radius:12px;font:600 13px 'Google Sans',sans-serif;
  box-shadow:0 4px 20px rgba(0,0,0,.35);transition:opacity .3s;pointer-events:none}
@media(max-width:800px){
  .gce-panel{width:96vw;max-height:94vh}.gce-preview-grid{grid-template-columns:1fr}
  .gce-prev,.gce-rendered{height:300px}.gce-body{padding:12px 14px}.gce-pf{padding:12px 14px}
}
`;
        document.head.appendChild(s);
    }

    // ═══════════════════════════════════════════════════════════
    //  FAB
    // ═══════════════════════════════════════════════════════════

    function ensureFAB() {
        if (fabEl) return;
        injectStyles();
        fabEl = document.createElement('button');
        fabEl.className = 'gce-fab';
        fabEl.title = 'Google AI Canvas Exporter';
        fabEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span class="gce-fab-badge">0</span><span class="gce-fab-dot"></span>`;
        fabEl.addEventListener('click', e => { e.stopPropagation(); openExportPanel(); });
        document.body.appendChild(fabEl);
    }

    function renderInlineMarkdown(value) {
        const tokens = [];
        const stash = html => {
            const marker = `\u0000${tokens.length}\u0000`;
            tokens.push(html);
            return marker;
        };
        let html = escapeHTML(value);
        html = html.replace(/`([^`]+)`/g, (_, code) => stash(`<code>${code}</code>`));
        html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
            (_, label, href) => stash(`<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`));
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
        html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
        html = html.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)] || '');
        return html;
    }

    function splitMarkdownTableRow(line) {
        const cells = [];
        let cell = '';
        let escaped = false;
        for (const char of line.replace(/^\s*\|/, '').replace(/\|\s*$/, '')) {
            if (escaped) {
                cell += char;
                escaped = false;
            } else if (char === '\\') {
                escaped = true;
                cell += char;
            } else if (char === '|') {
                cells.push(cell.trim());
                cell = '';
            } else {
                cell += char;
            }
        }
        cells.push(cell.trim());
        return cells;
    }

    function renderListItems(items) {
        const root = { children: [] };
        const stack = [{ depth: -1, item: root }];
        for (const item of items) {
            while (stack.length > 1 && stack[stack.length - 1].depth >= item.depth) stack.pop();
            const node = { ...item, children: [] };
            stack[stack.length - 1].item.children.push(node);
            stack.push({ depth: item.depth, item: node });
        }
        const renderChildren = children => {
            let html = '';
            for (let i = 0; i < children.length;) {
                const ordered = children[i].ordered;
                const tag = ordered ? 'ol' : 'ul';
                let group = '';
                while (i < children.length && children[i].ordered === ordered) {
                    const child = children[i++];
                    group += `<li>${renderInlineMarkdown(child.text)}${renderChildren(child.children)}</li>`;
                }
                html += `<${tag}>${group}</${tag}>`;
            }
            return html;
        };
        return renderChildren(root.children);
    }

    function renderMarkdownPreview(markdown) {
        const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
        const output = [];
        let i = 0;
        if (lines[0] === '---') {
            const end = lines.indexOf('---', 1);
            if (end > 0) {
                output.push(`<pre class="gce-md-frontmatter">${escapeHTML(lines.slice(1, end).join('\n'))}</pre>`);
                i = end + 1;
            }
        }
        const isSpecial = (line, next) => !line.trim()
            || /^\s*```/.test(line) || /^#{1,6}\s+/.test(line) || /^\s*>/.test(line)
            || /^\s*(?:[-*]|\d+\.)\s+/.test(line) || /^\s*(?:---|\*\*\*)\s*$/.test(line)
            || (line.includes('|') && /^\s*\|?\s*:?-{3,}/.test(next || ''));

        while (i < lines.length) {
            const line = lines[i];
            if (!line.trim()) { i++; continue; }
            const fence = line.match(/^\s*```([^\s]*)/);
            if (fence) {
                const code = [];
                i++;
                while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
                if (i < lines.length) i++;
                output.push(`<pre><code data-language="${escapeHTML(fence[1] || '')}">${escapeHTML(code.join('\n'))}</code></pre>`);
                continue;
            }
            const heading = line.match(/^(#{1,6})\s+(.+)$/);
            if (heading) {
                const level = heading[1].length;
                output.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
                i++;
                continue;
            }
            if (/^\s*(?:---|\*\*\*)\s*$/.test(line)) {
                output.push('<hr>');
                i++;
                continue;
            }
            if (/^\s*>/.test(line)) {
                const quote = [];
                while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ''));
                output.push(`<blockquote>${quote.map(renderInlineMarkdown).join('<br>')}</blockquote>`);
                continue;
            }
            if (/^\s*(?:[-*]|\d+\.)\s+/.test(line)) {
                const items = [];
                while (i < lines.length) {
                    const item = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
                    if (!item) break;
                    items.push({
                        depth: Math.floor(item[1].replace(/\t/g, '  ').length / 2),
                        ordered: /\d+\./.test(item[2]),
                        text: item[3]
                    });
                    i++;
                }
                output.push(renderListItems(items));
                continue;
            }
            if (line.includes('|') && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1] || '')) {
                const header = splitMarkdownTableRow(line);
                i += 2;
                const rows = [];
                while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
                    rows.push(splitMarkdownTableRow(lines[i++]));
                }
                output.push(`<table><thead><tr>${header.map(cell => `<th>${renderInlineMarkdown(cell)}</th>`).join('')}</tr></thead>` +
                    `<tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${renderInlineMarkdown(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
                continue;
            }

            const paragraph = [];
            while (i < lines.length && !isSpecial(lines[i], lines[i + 1])) paragraph.push(lines[i++]);
            if (!paragraph.length) {
                paragraph.push(lines[i++]);
            }
            const html = paragraph.map(text => {
                const hardBreak = / {2}$/.test(text);
                return renderInlineMarkdown(text.replace(/ {2}$/, '')) + (hardBreak ? '<br>' : ' ');
            }).join('').trim();
            if (html) output.push(`<p>${html}</p>`);
        }
        return output.join('');
    }

    function formatConversationComposition(summary) {
        return `${summary.promptCount} prompt${summary.promptCount === 1 ? '' : 's'} · ` +
            `${summary.responseCount} text response${summary.responseCount === 1 ? '' : 's'} · ` +
            `${summary.canvasCount} canvas${summary.canvasCount === 1 ? '' : 'es'}`;
    }

    // ═══════════════════════════════════════════════════════════
    //  UNIFIED EXPORT PANEL
    // ═══════════════════════════════════════════════════════════

    function openExportPanel() {
        document.getElementById('gce-overlay')?.remove();

        captureMountedTurns();
        const hasConv = hasExportableConversation();
        const hasCanvas = registry.length > 0;

        if (!hasConv && !hasCanvas) {
            showToast('Nothing to export yet. Open an AI Mode thread or scroll to load canvases.', true);
            return;
        }

        const threadTitle = extractThreadTitle(getCachedTurns());
        const mdFilename = makeMarkdownFilename(threadTitle);
        const initialSummary = summarizeConversation();

        const ov = document.createElement('div');
        ov.id = 'gce-overlay';
        ov.className = 'gce-ov';

        const now = new Date();
        const exportDate = now.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        }) + ' ' + now.toLocaleTimeString('en-US');

        const convSection = hasConv ? `
            <div class="gce-sl">CONVERSATION <span class="gce-pill" id="gce-turn-count">${initialSummary.segmentCount} segment${initialSummary.segmentCount !== 1 ? 's' : ''}</span></div>
            <div class="gce-preview-meta" id="gce-composition">${escapeHTML(formatConversationComposition(initialSummary))}</div>
            <div class="gce-warn" id="gce-hydration-status">Hydrating the thread to find virtualized segments…</div>
            <div class="gce-ci">
                <div class="gce-cr">
                    <input type="checkbox" id="gce-inc-conv" checked>
                    <span class="gce-ct">Export conversation as Markdown</span>
                </div>
                <div class="gce-mf">
                    <span class="gce-ml">Thread title</span>
                    <input class="gce-fi" id="gce-thread-title" value="${escapeHTML(threadTitle)}">
                </div>
                <div class="gce-mf">
                    <span class="gce-ml">Markdown filename</span>
                    <input class="gce-fi" id="gce-md-name" value="${escapeHTML(mdFilename)}">
                </div>
                <div class="gce-sg">
                    <label class="gce-tg"><input type="checkbox" id="gce-md-fm" checked> YAML frontmatter</label>
                    <label class="gce-tg"><input type="checkbox" id="gce-md-dates" checked> Turn dates</label>
                </div>
                <div class="gce-preview-head">
                    <span class="gce-sl" style="margin:0">PREVIEW</span>
                    <button class="gce-sa" id="gce-refresh-preview" type="button">Refresh preview</button>
                </div>
                <div class="gce-preview-meta" id="gce-preview-meta">Full preview will render after hydration.</div>
                <div class="gce-preview-grid">
                    <div class="gce-preview-pane">
                        <span class="gce-ml">Raw Markdown</span>
                        <textarea class="gce-prev" id="gce-md-preview" readonly>Hydrating conversation…</textarea>
                    </div>
                    <div class="gce-preview-pane">
                        <span class="gce-ml">Rendered Preview</span>
                        <div class="gce-rendered" id="gce-rendered-preview" role="document" aria-label="Rendered Markdown preview">Hydrating conversation…</div>
                    </div>
                </div>
            </div>` : '';

        const canvasCards = hasCanvas ? registry.map((c, i) => {
            const col = TYPE_COLORS[c.type] || '#ADAFB8';
            return `<div class="gce-ci gce-canvas-card" data-idx="${i}">
                <div class="gce-cr">
                    <input type="checkbox" class="gce-canvas-cb" checked data-idx="${i}">
                    <span class="gce-ct" title="${escapeHTML(c.title)}">${escapeHTML(c.title)}</span>
                    <span class="gce-badge" style="background:${col}22;color:${col};border:1px solid ${col}44">${c.type}</span>
                </div>
                <input class="gce-fi gce-canvas-name" data-idx="${i}" value="${escapeHTML(makeFilename(c.title))}">
            </div>`;
        }).join('') : '';

        const canvasSection = hasCanvas ? `
            <div class="gce-sl" style="margin-top:16px">CANVASES <span class="gce-pill">${registry.length}</span></div>
            ${canvasCards}
            <div class="gce-sg">
                <label class="gce-tg"><input type="checkbox" id="gce-dark" checked> Dark mode</label>
                <label class="gce-tg"><input type="checkbox" id="gce-full" checked> Full viewport</label>
                <label class="gce-tg"><input type="checkbox" id="gce-html-meta" checked> Embed metadata</label>
            </div>` : '';

        ov.innerHTML = `<div class="gce-panel">
            <div class="gce-ph">
                <h3>Export<small>v${VERSION}</small></h3>
                <button class="gce-x">\u00D7</button>
            </div>
            <div class="gce-body">
                ${convSection}
                ${canvasSection}
                <div class="gce-mf" style="margin-top:14px">
                    <span class="gce-ml">Source URL</span>
                    <input class="gce-mi" id="gce-url" value="${escapeHTML(location.href)}" readonly>
                </div>
                <div class="gce-mf">
                    <span class="gce-ml">Export Date</span>
                    <input class="gce-mi" value="${escapeHTML(exportDate)}" readonly>
                </div>
            </div>
            <div class="gce-pf">
                <div class="gce-pf-left">
                    ${hasCanvas ? '<button class="gce-sa gce-canvas-toggle">Deselect Canvases</button>' : ''}
                </div>
                <div class="gce-pf-left">
                    ${hasConv ? '<button class="gce-sb" id="gce-conv-only">Conversation Only</button>' : ''}
                    ${hasCanvas ? '<button class="gce-sb" id="gce-canvas-only">Canvases Only</button>' : ''}
                    <button class="gce-eb" id="gce-export-all">Export All</button>
                </div>
            </div>
        </div>`;

        document.body.appendChild(ov);
        const closePanel = () => {
            abortHydration();
            ov.remove();
        };
        ov.addEventListener('click', e => { if (e.target === ov) closePanel(); });
        ov.querySelector('.gce-x').onclick = closePanel;

        let hydrationResult = { partial: false, turns: turnCache.size };
        const updateConversationPanel = (status, { renderPreview = false } = {}) => {
            const currentTurns = getCachedTurns();
            const summary = summarizeConversation(currentTurns);
            const pill = ov.querySelector('#gce-turn-count');
            if (pill) pill.textContent = `${summary.segmentCount} segment${summary.segmentCount === 1 ? '' : 's'}`;
            const compositionEl = ov.querySelector('#gce-composition');
            if (compositionEl) compositionEl.textContent = formatConversationComposition(summary);
            const statusEl = ov.querySelector('#gce-hydration-status');
            if (statusEl && status) statusEl.textContent = status;
            if (!renderPreview) return;
            const previewEl = ov.querySelector('#gce-md-preview');
            const renderedEl = ov.querySelector('#gce-rendered-preview');
            if (!previewEl || !renderedEl) return;
            const title = ov.querySelector('#gce-thread-title')?.value.trim() || threadTitle;
            const md = buildConversationMarkdown({
                turns: currentTurns,
                title,
                frontmatter: ov.querySelector('#gce-md-fm')?.checked !== false,
                turnDates: ov.querySelector('#gce-md-dates')?.checked !== false,
                srcURL: location.href
            }) || '';
            previewEl.value = md;
            renderedEl.innerHTML = renderMarkdownPreview(md);
            const previewMeta = ov.querySelector('#gce-preview-meta');
            if (previewMeta) {
                const hydrationLabel = hydrationResult.partial ? 'partial hydration' : 'hydration complete';
                previewMeta.textContent = `${md.length.toLocaleString()} characters · ` +
                    `${summary.segmentCount} segment${summary.segmentCount === 1 ? '' : 's'} · ` +
                    `${summary.promptCount} prompt${summary.promptCount === 1 ? '' : 's'} · ` +
                    `${summary.responseCount} text response${summary.responseCount === 1 ? '' : 's'} · ` +
                    `${summary.canvasCount} canvas${summary.canvasCount === 1 ? '' : 'es'} · ${hydrationLabel}`;
            }
        };

        if (hasConv) {
            const idle = window.requestIdleCallback || (cb => setTimeout(cb, 0));
            idle(() => updateConversationPanel('Hydrating the thread to find virtualized segments…'));
            hydrateConversation(progress => {
                if (document.body.contains(ov)) {
                    updateConversationPanel(`Hydrating… ${progress.turns} segment${progress.turns === 1 ? '' : 's'} cached`);
                }
            }).then(result => {
                hydrationResult = result;
                if (!document.body.contains(ov)) return;
                updateConversationPanel(result.partial
                    ? `Hydration reached its safety limit; ${result.turns} cached segments will be exported as a partial result.`
                    : `Hydration complete: ${result.turns} segment${result.turns === 1 ? '' : 's'} ready.`,
                { renderPreview: true });
            });
        }

        const titleInput = ov.querySelector('#gce-thread-title');
        const mdNameInput = ov.querySelector('#gce-md-name');
        let previewRefreshTimer = null;
        const schedulePreviewRefresh = () => {
            clearTimeout(previewRefreshTimer);
            previewRefreshTimer = setTimeout(() => {
                const idle = window.requestIdleCallback || (cb => setTimeout(cb, 0));
                idle(() => updateConversationPanel(null, { renderPreview: true }), { timeout: 500 });
            }, 180);
        };
        if (titleInput && mdNameInput) {
            titleInput.addEventListener('input', () => {
                mdNameInput.value = makeMarkdownFilename(titleInput.value.trim());
                schedulePreviewRefresh();
            });
        }
        ov.querySelector('#gce-md-fm')?.addEventListener('change', schedulePreviewRefresh);
        ov.querySelector('#gce-md-dates')?.addEventListener('change', schedulePreviewRefresh);
        ov.querySelector('#gce-refresh-preview')?.addEventListener('click', () =>
            updateConversationPanel(null, { renderPreview: true })
        );

        let canvasAllOn = true;
        const canvasToggle = ov.querySelector('.gce-canvas-toggle');
        if (canvasToggle) {
            canvasToggle.onclick = () => {
                canvasAllOn = !canvasAllOn;
                canvasToggle.textContent = canvasAllOn ? 'Deselect Canvases' : 'Select Canvases';
                ov.querySelectorAll('.gce-canvas-cb').forEach(cb => {
                    cb.checked = canvasAllOn;
                    cb.closest('.gce-ci').classList.toggle('off', !canvasAllOn);
                });
            };
        }

        async function runExport(mode) {
            const exportButton = ov.querySelector('#gce-export-all');
            if (exportButton) exportButton.disabled = true;
            const srcURL = ov.querySelector('#gce-url')?.value || location.href;
            const jobs = [];

            const wantConv = (mode === 'all' || mode === 'conv') && hasExportableConversation() &&
                (mode !== 'all' || ov.querySelector('#gce-inc-conv')?.checked !== false);
            if (wantConv) {
                hydrationResult = await hydrateConversation(progress => {
                    if (document.body.contains(ov)) {
                        updateConversationPanel(`Hydrating… ${progress.turns} segment${progress.turns === 1 ? '' : 's'} cached`);
                    }
                });
                const title = ov.querySelector('#gce-thread-title')?.value.trim() || threadTitle;
                const md = buildConversationMarkdown({
                    turns: getCachedTurns(),
                    title,
                    frontmatter: ov.querySelector('#gce-md-fm')?.checked !== false,
                    turnDates: ov.querySelector('#gce-md-dates')?.checked !== false,
                    srcURL
                });
                if (md) {
                    let fname = ov.querySelector('#gce-md-name')?.value.trim() || makeMarkdownFilename(title);
                    if (!fname.endsWith('.md')) fname += '.md';
                    jobs.push({ type: 'md', content: md, filename: fname });
                }
            }

            const wantCanvas = (mode === 'all' || mode === 'canvas') && hasCanvas;
            if (wantCanvas) {
                const isDark = ov.querySelector('#gce-dark')?.checked !== false;
                const fullVP = ov.querySelector('#gce-full')?.checked !== false;
                const meta = ov.querySelector('#gce-html-meta')?.checked !== false;
                ov.querySelectorAll('.gce-canvas-card').forEach(card => {
                    const cb = card.querySelector('.gce-canvas-cb');
                    if (mode === 'all' && cb && !cb.checked) return;
                    const idx = parseInt(card.dataset.idx);
                    const fname = card.querySelector('.gce-canvas-name')?.value.trim() || 'export';
                    jobs.push({
                        type: 'html',
                        canvas: registry[idx],
                        filename: fname.endsWith('.html') ? fname : fname + '.html',
                        opts: { title: registry[idx].title, isDark, fullVP, meta, srcURL }
                    });
                });
            }

            if (!jobs.length) {
                if (exportButton) exportButton.disabled = false;
                showToast('Nothing selected to export.', true);
                return;
            }

            abortHydration();
            ov.remove();
            let mdCount = 0, htmlCount = 0;
            for (let i = 0; i < jobs.length; i++) {
                const job = jobs[i];
                if (job.type === 'md') {
                    downloadBlob(job.content, job.filename, 'text/markdown');
                    mdCount++;
                } else {
                    const html = buildExportHTML(job.canvas.widgetHTML, job.opts);
                    if (html) { downloadBlob(html, job.filename, 'text/html'); htmlCount++; }
                }
                if (i < jobs.length - 1) await new Promise(r => setTimeout(r, 500));
            }

            const parts = [];
            if (mdCount) parts.push('conversation');
            if (htmlCount) parts.push(`${htmlCount} canvas${htmlCount !== 1 ? 'es' : ''}`);
            const partial = mdCount && hydrationResult.partial ? ' (partial hydration)' : '';
            showToast(`Exported ${parts.join(' + ')} successfully${partial}.`);
        }

        ov.querySelector('#gce-export-all')?.addEventListener('click', () => runExport('all'));
        ov.querySelector('#gce-conv-only')?.addEventListener('click', () => runExport('conv'));
        ov.querySelector('#gce-canvas-only')?.addEventListener('click', () => runExport('canvas'));
        return ov;
    }

    // ═══════════════════════════════════════════════════════════
    //  CANVAS HTML EXPORT PIPELINE
    // ═══════════════════════════════════════════════════════════

    function isSandboxArtifact(el) {
        if (el.hasAttribute('data-sandbox-injected')) return true;
        if (el.tagName === 'META') {
            const he = (el.getAttribute('http-equiv') || '').toLowerCase();
            if (he === 'content-security-policy') return true;
        }
        return false;
    }

    function isWidgetStyle(text) {
        if (!text || text.length < 40) return false;
        const markers = [
            '--on-surface', '.widget', '.viz-', '.xxs-', '--primary',
            '@font-face', ':root', '.control-grid', '--chart-',
            '--surface', '--stroke', '--ff-sans', '.dash-pill'
        ];
        return markers.some(m => text.includes(m));
    }

    function escapeScriptClose(src) {
        return src.replace(/<\/script/gi, '<\\/script');
    }

    function buildExportHTML(widgetHTML, opts) {
        const doc = new DOMParser().parseFromString(widgetHTML, 'text/html');
        const esc = escapeScriptClose;

        const fontLinks = [...doc.querySelectorAll('link[rel="stylesheet"]')]
            .filter(l => !isSandboxArtifact(l))
            .filter(l => {
                const href = l.getAttribute('href') || '';
                return href.includes('fonts.googleapis') || href.includes('katex') || href.includes('jsdelivr');
            })
            .map(l => l.getAttribute('href'));

        const fontHrefs = new Set(fontLinks);
        DEFAULT_FONTS.forEach(url => {
            if (!fontLinks.some(h => h.includes(url.split('?')[0])))
                fontHrefs.add(url);
        });
        const fontHTML = [...fontHrefs].map(h => `    <link rel="stylesheet" href="${h}">`).join('\n');

        const styleHTML = [...doc.querySelectorAll('style')]
            .filter(s => !isSandboxArtifact(s))
            .filter(s => isWidgetStyle(s.textContent))
            .map(s => `    <style>\n${s.textContent}\n    </style>`)
            .join('\n');

        const cdnScripts = [...doc.querySelectorAll('script[src]')]
            .filter(s => !isSandboxArtifact(s))
            .filter(s => {
                const src = s.getAttribute('src') || '';
                return !src.includes('tailwindcss') && !src.startsWith('data:') &&
                       (src.includes('gstatic.com') || src.includes('cdn.') || src.includes('jsdelivr'));
            });
        const cdnHTML = cdnScripts
            .map(s => `    <script src="${s.getAttribute('src')}"><\/script>`)
            .join('\n');

        const inlines = [...doc.querySelectorAll('script:not([src])')]
            .filter(s => !isSandboxArtifact(s))
            .filter(s => s.textContent.trim().length > 10);

        const helperScript = inlines.find(s => {
            const t = s.textContent;
            return /window\.WH\s*=/.test(t) || /WidgetHelpers\s*[={]/.test(t);
        });

        const logicScripts = inlines.filter(s =>
            s !== helperScript && WH_APIS.some(api => s.textContent.includes(api))
        );

        const initDataScript = inlines.find(s =>
            s !== helperScript && !logicScripts.includes(s) &&
            s.textContent.includes('WIDGET_INIT_DATA')
        );

        if (!helperScript && logicScripts.length === 0) {
            showToast('Export failed: no widget scripts found in extracted HTML.', true);
            return null;
        }

        const helperHasLogic = helperScript &&
            WH_APIS.some(api => helperScript.textContent.includes(api));
        const headHelper = helperHasLogic ? null : helperScript;
        const bodyScripts = helperHasLogic
            ? [helperScript, ...logicScripts]
            : logicScripts;

        const lightCSS = !opts.isDark ? `
    <style>
      :root {
        --color-scheme: light !important;
        --on-surface-default: #1A1B1E !important;
        --on-surface-de-emphasis: #6C6E7A !important;
        --on-surface-primary: #0053C4 !important;
        --on-primary: #FFF !important;
        --surface: #FFF !important;
        --surface-container: #F2F3F7 !important;
        --surface-container-high: #E8E9EF !important;
        --surface-container-lowest: #FFF !important;
        --surface-container-low: #F2F3F7 !important;
        --surface-container-highest: #DCDEE6 !important;
        --outline: #D0D2DA !important;
        --primary: #2772DB !important;
        --primary-hover: #1A5DBB !important;
        --highlight: #D8E5FA !important;
        --stroke-default: #D0D2DA !important;
        --stroke-emphasis: #6C6E7A !important;
        --positive: #198038 !important;
        --positive-surface: #E6F4EA !important;
        --negative: #C5221F !important;
        --negative-surface: #FCE8E6 !important;
        --blue: #2772DB !important;
        --green: #198038 !important;
        --yellow: #E37400 !important;
        --red: #C5221F !important;
        --purple: #7B1FA2 !important;
        --orange: #E37400 !important;
        --glass-surface: rgba(255,255,255,.65) !important;
        --badge-bg: rgba(255,255,255,.8) !important;
        --badge-border: rgba(0,0,0,.1) !important;
      }
    </style>` : '';

        const metaComment = opts.meta ? `<!--
  Exported by Google AI Canvas Exporter v${VERSION}
  Canvas: ${opts.title}
  Source: ${opts.srcURL}
  Date:   ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}
-->\n` : '';

        const parts = [
            metaComment + '<!DOCTYPE html>',
            '<html lang="en">',
            '<head>',
            '    <meta charset="UTF-8">',
            '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            `    <title>${escapeHTML(opts.title)}</title>`,
            '', fontHTML, '', styleHTML, lightCSS, '',
            '    <script>',
            '        window.enableDynamicBorders = false;',
            '        window.enableWidgetV3Styling = false;',
            '        window.printComments = false;',
            `        window.isDarkMode = ${opts.isDark};`,
            '    <\/script>',
            '', cdnHTML
        ];

        if (initDataScript) {
            parts.push('', `    <script>\n${esc(initDataScript.textContent)}\n    <\/script>`);
        }
        if (headHelper) {
            parts.push('', `    <script>\n${esc(headHelper.textContent)}\n    <\/script>`);
        }

        const rtHeight = opts.fullVP ? 'calc(100vh + 1px)' : '613px';
        parts.push(
            '</head>',
            `<body style="height:${opts.fullVP ? '100%' : '612px'};display:flex;flex-direction:column;overflow:hidden;background:var(--surface);margin:0;width:calc(100% - 1px)">`,
            '',
            `    <div id="resize-target" style="position:absolute;top:0;left:0;width:0;height:${rtHeight}"></div>`,
            ''
        );

        for (const s of bodyScripts) {
            parts.push(`    <script>\n${esc(s.textContent)}\n    <\/script>`, '');
        }

        parts.push('</body>', '</html>');
        const html = parts.join('\n');
        console.log(TAG, `Export assembled: "${opts.title}" (${html.length} bytes)`);
        return html;
    }

    function downloadBlob(content, filename, mime) {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: filename });
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    function showToast(msg, isError) {
        injectStyles();
        const t = document.createElement('div');
        t.className = 'gce-toast';
        t.textContent = msg;
        Object.assign(t.style, {
            background: isError ? '#381A21' : '#1F3025',
            color: isError ? '#FF878F' : '#90E58C',
            border: `1px solid ${isError ? '#FF878F44' : '#90E58C44'}`,
            opacity: '1'
        });
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; }, 3500);
        setTimeout(() => t.remove(), 4000);
    }

    // ═══════════════════════════════════════════════════════════
    //  INITIALIZATION
    // ═══════════════════════════════════════════════════════════

    function exposeTestAPI() {
        globalThis.__GCE_TEST_API__ = Object.freeze({
            VERSION,
            SELECTORS,
            debugStats,
            isPotentialAIModeURL,
            isConversationRouteCandidate,
            deriveRouteKey,
            getConversationHost,
            getConversationSegments,
            findResponseBlocks,
            findPromptForResponseBlock,
            findCanvasBlocks,
            associateCanvasesWithSegments,
            snapshotConversationSegment,
            buildSegmentOrderKey,
            getMountedTurnElements,
            extractUserText,
            extractTurnDate,
            extractCitationMap,
            aimDomToMarkdown,
            normalizeMarkdown,
            snapshotTurn,
            captureMountedTurns,
            extractConversationTurns,
            getCachedTurns,
            summarizeConversation,
            buildConversationMarkdown,
            renderMarkdownPreview,
            openExportPanel,
            hasExportableConversation,
            scanCanvases,
            buildExportHTML,
            reconcileTargetState,
            reconcileRoute,
            resetRouteState,
            hydrateConversation,
            scheduleDiscovery,
            startObserver,
            stopObserver,
            getRegistry: () => registry.map(({ id, widgetHTML, title, type }) => ({ id, widgetHTML, title, type })),
            getUIState: () => ({
                fab: !!document.querySelector('.gce-fab'),
                badge: document.querySelector('.gce-fab-badge')?.textContent || '',
                dot: document.querySelector('.gce-fab-dot')?.classList.contains('on') || false,
                title: document.querySelector('.gce-fab')?.getAttribute('aria-label') || ''
            })
        });
    }

    if (TEST_MODE) {
        exposeTestAPI();
        return;
    }

    function scheduleRouteReconcile() {
        setTimeout(reconcileRoute, 0);
    }

    for (const method of ['pushState', 'replaceState']) {
        const original = history[method];
        history[method] = function (...args) {
            const result = original.apply(this, args);
            scheduleRouteReconcile();
            return result;
        };
    }
    window.addEventListener('popstate', scheduleRouteReconcile);
    installScrollListener();

    currentRouteKey = deriveRouteKey();
    discoveryDeadline = isPotentialAIModeURL() ? Number.POSITIVE_INFINITY : Date.now() + 10000;
    reconcileRoute();
    routeTimer = setInterval(() => {
        const routeChanged = lastLocationHref !== location.href || deriveRouteKey() !== currentRouteKey;
        if (routeChanged) {
            discoveryDeadline = isPotentialAIModeURL() ? Number.POSITIVE_INFINITY : Date.now() + 10000;
            reconcileRoute();
        } else if (observerRoot && observerRoot !== document.documentElement && !document.contains(observerRoot)) {
            turnCache.clear();
            reconcileTargetState();
            startObserver(document.documentElement);
        } else if (!fabEl && !getConversationHost() && Date.now() >= discoveryDeadline) {
            stopObserver();
        }
    }, 500);

})();
