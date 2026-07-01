// ==UserScript==
// @name              Google AI Canvas Exporter
// @description       Export Google AI Search mode conversations as clean Markdown and interactive canvas widgets as self-contained offline HTML. Conversation export captures all user/AI turns with inline citations, compact reference blocks, YAML frontmatter, and smart filenames. Canvas export detects Widget Shell V2 in sandboxed scf.usercontent.goog iframes, strips CSP/sandbox artifacts, extracts WidgetHelpers + CDN deps, and supports batch download via a unified floating export panel.
// @author            lowestprime x Claude Opus 4.6 Max Agent
// @namespace         https://greasyfork.org/en/users/823161-lowestprime
// @license           MIT
// @version           5.0.1
// @match             *://www.google.com/search*
// @match             *://*.google.com/search*
// @grant             none
// @run-at            document-idle
// @icon              data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22bg%22%20x1%3D%226%22%20y1%3D%224%22%20x2%3D%2258%22%20y2%3D%2260%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%235BA3FF%22%2F%3E%3Cstop%20offset%3D%220.55%22%20stop-color%3D%22%235292F9%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%237C4DFF%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22panel%22%20x1%3D%2212%22%20y1%3D%2215%22%20x2%3D%2238%22%20y2%3D%2239%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23182742%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%230A1220%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2215%22%20fill%3D%22url%28%23bg%29%22%2F%3E%3Crect%20x%3D%225%22%20y%3D%2210%22%20width%3D%2228%22%20height%3D%2224%22%20rx%3D%226%22%20fill%3D%22%23091221%22%20fill-opacity%3D%22.24%22%20stroke%3D%22%23FFF%22%20stroke-opacity%3D%22.12%22%20stroke-width%3D%221.4%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2215%22%20width%3D%2228%22%20height%3D%2224%22%20rx%3D%226%22%20fill%3D%22url%28%23panel%29%22%20stroke%3D%22%23FFF%22%20stroke-opacity%3D%22.22%22%20stroke-width%3D%221.6%22%2F%3E%3Crect%20x%3D%2214%22%20y%3D%2219%22%20width%3D%2218%22%20height%3D%223%22%20rx%3D%221.5%22%20fill%3D%22%23FFF%22%20fill-opacity%3D%22.14%22%2F%3E%3Cpath%20d%3D%22M15%2033.5%2020.2%2028.8%2024.7%2031.7%2030.3%2024.8%2034%2027.2%22%20fill%3D%22none%22%20stroke%3D%22%2374F3D6%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M36%2031.5h7.5%22%20fill%3D%22none%22%20stroke%3D%22%23FFF%22%20stroke-width%3D%223.2%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22m40.7%2027.2%205.8%204.3-5.8%204.3%22%20fill%3D%22none%22%20stroke%3D%22%23FFF%22%20stroke-width%3D%223.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M44%2014h11c2.2%200%204%201.8%204%204v24c0%202.2-1.8%204-4%204H44c-2.2%200-4-1.8-4-4V18c0-2.2%201.8-4%204-4Z%22%20fill%3D%22%23FFF%22%2F%3E%3Cpath%20d%3D%22M52%2014v6c0%201.7%201.3%203%203%203h4%22%20fill%3D%22none%22%20stroke%3D%22%23D8E6FF%22%20stroke-width%3D%222.2%22%2F%3E%3Cpath%20d%3D%22M45.8%2028.2h8m-8%205h8m-8%205h4.8%22%20fill%3D%22none%22%20stroke%3D%22%235292F9%22%20stroke-width%3D%222.3%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E
// ==/UserScript==

(function () {
    'use strict';

    const TAG = '[GCE]';
    const VERSION = '5.0.1';
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
    const TAGGED = new WeakSet();
    const registry = [];
    let fabEl = null;
    let cachedTurnCount = 0;
    let lastBadgeCanvas = -1;
    let lastBadgeTurn = -1;
    let badgeTimer = null;

    console.log(TAG, `v${VERSION} active on`, location.hostname);

    // ═══════════════════════════════════════════════════════════
    //  UTILITIES
    // ═══════════════════════════════════════════════════════════

    function decodeEntities(text) {
        const el = document.createElement('textarea');
        el.innerHTML = text;
        return el.value;
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

    function isAIModePage() {
        return new URLSearchParams(location.search).get('udm') === '50'
            || !!document.querySelector('[jsname="coFSxe"], [data-xid="aim-mars-turn-root"]');
    }

    function getConversationHost() {
        if (!isAIModePage()) return null;
        return document.querySelector('[jsname="coFSxe"]')
            || document.querySelector('[jsname="guest_container_"]')
            || null;
    }

    function getCheapTurnCount() {
        const host = getConversationHost();
        if (!host) return 0;
        let count = 0;
        for (const el of host.querySelectorAll('[data-xid="aim-mars-turn-root"]')) {
            if (!el.closest('[data-xid="aim-mars-input-plate"], [data-xid="m3fCN"]')) count++;
        }
        return count;
    }

    function scheduleBadgeUpdate() {
        clearTimeout(badgeTimer);
        badgeTimer = setTimeout(refreshBadgeState, 400);
    }

    function refreshBadgeState() {
        if (!fabEl) return;
        cachedTurnCount = isAIModePage() ? getCheapTurnCount() : 0;
        updateFABBadge();
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

        if (turns?.[0]?.user) {
            const u = turns[0].user;
            return u.length > 80 ? u.slice(0, 77) + '...' : u;
        }
        return 'AI_Mode_Thread';
    }

    function extractUserText(turnEl) {
        const el = turnEl.querySelector('.tonYlb .ilZyRc.R7mRQb')
              || turnEl.querySelector('.ilZyRc.R7mRQb')
              || turnEl.querySelector('[data-xid="VpUvz"]')
              || turnEl.querySelector('.tonYlb');
        return el ? textCompact(el.textContent) : '';
    }

    function extractTurnDate(turnEl) {
        const dateEl = turnEl.querySelector('time, [data-xid="DChuCc"]');
        const raw = dateEl
            ? (dateEl.textContent || '')
            : (turnEl.textContent || '').slice(0, 500);
        const m = raw.match(
            /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/
        );
        return m ? m[0] : '';
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

    function createCitationTracker() {
        const map = new Map();
        const refs = new Map();
        let n = 1;
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
            refs
        };
    }

    function inlineCite(num, href) {
        return `[${num}](${href})`;
    }

    function prepareCloneForMarkdown(root) {
        const clone = root.cloneNode(true);
        clone.querySelectorAll(
            '[data-tpcrb-host], .kWjn6e, [data-xid="m3fCN"], ' +
            '.emqXtf, iframe, [data-inline-canvas], .Lucn7c, .ZAjsj'
        ).forEach(n => n.remove());
        clone.querySelectorAll('img').forEach(img => {
            if (shouldDropImage(img)) img.remove();
        });
        clone.querySelectorAll('svg').forEach(s => s.remove());
        return clone;
    }

    function aimDomToMarkdown(root, citeTracker) {
        if (!root) return '';

        function escInline(s) {
            return String(s ?? '').replace(/[`*_[\]]/g, m => '\\' + m);
        }

        function walk(node, ctx = { inPre: false, inTable: false }) {
            if (!node) return '';
            if (node.nodeType === Node.TEXT_NODE) {
                const t = node.nodeValue || '';
                if (ctx.inPre) return t;
                return escInline(t.replace(/\s+/g, ' '));
            }
            if (node.nodeType !== Node.ELEMENT_NODE) return '';

            const el = node;
            const tag = el.tagName.toLowerCase();
            if (DROP_TAGS.has(tag)) return '';
            if (el.closest('[data-tpcrb-host], .kWjn6e')) return '';
            if (tag === 'img') return shouldDropImage(el) ? '' : '';

            const children = () => Array.from(el.childNodes).map(c => walk(c, ctx)).join('');

            if (tag === 'a') {
                const href = normUrl(el.getAttribute('href') || '');
                if (!href || isNoiseLink(href, textCompact(el.textContent))) return children();
                const label = textCompact(el.textContent);
                const num = citeTracker.add(href);
                if (num && (!label || /^\d+$/.test(label))) return inlineCite(num, href);
                if (!label) return `[${getDomain(href)}](${href})`;
                return `[${escInline(label)}](${href})`;
            }

            if (/^h[1-6]$/.test(tag)) {
                const lvl = Number(tag[1]);
                const t = textCompact(children());
                return t ? `\n${'#'.repeat(lvl)} ${t}\n\n` : '';
            }
            if (tag === 'p') {
                const t = textCompact(children());
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
                const inner = children().trim().split('\n').map(l => l.trim() ? `> ${l}` : '>').join('\n');
                return inner ? `\n${inner}\n\n` : '';
            }
            if (tag === 'ul' || tag === 'ol') {
                const items = [...el.children].filter(c => c.tagName?.toLowerCase() === 'li');
                if (!items.length) return children();
                let out = '\n';
                items.forEach((li, i) => {
                    const bullet = tag === 'ol' ? `${i + 1}. ` : '- ';
                    const body = walk(li, { ...ctx, inTable: false }).trim();
                    out += bullet + body + '\n';
                });
                return out + '\n';
            }
            if (tag === 'li') return children();
            if (tag === 'table') {
                const rows = [];
                for (const tr of el.querySelectorAll('tr')) {
                    const cells = [...tr.querySelectorAll('th,td')].map(td =>
                        textCompact(walk(td, { ...ctx, inTable: true }))
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
        return String(md || '')
            .replace(/\r\n/g, '\n')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/!\[[^\]]*\]\([^)]*(?:faviconV2|encrypted-tbn|data:image)[^)]*\)/gi, '')
            .replace(/\[\]\((https?:\/\/[^)]+)\)/g, (_, u) => `[${getDomain(u)}](${u})`)
            .replace(/ \+1\b/g, '')
            .replace(/\\_/g, '_')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/([^\n])\n(\d+\. )/g, '$1\n\n$2')
            .trim();
    }

    function formatReferences(citeTracker) {
        if (!citeTracker.refs.size) return '';
        const lines = ['### References', ''];
        for (const [num, ref] of [...citeTracker.refs.entries()].sort((a, b) => a[0] - b[0])) {
            lines.push(`[${num}] [${ref.name}](${ref.href})`);
        }
        return lines.join('\n');
    }

    function findCanvasPlaceholder(turnEl) {
        if (!turnEl.querySelector(
            'iframe[src*="scf.usercontent"], iframe.lQ27pc, [data-inline-canvas], .emqXtf'
        )) return '';
        for (const c of registry) {
            const hint = turnEl.querySelector('.tonYlb, [data-xid="VpUvz"]');
            if (hint?.textContent?.includes(c.title)) return c.title;
        }
        return 'Interactive Canvas';
    }

    function extractConversationTurns() {
        const host = getConversationHost();
        if (!host) return [];
        const turns = [];
        const roots = [...host.querySelectorAll('[data-xid="aim-mars-turn-root"]')]
            .filter(el => !el.closest('[data-xid="aim-mars-input-plate"], [data-xid="m3fCN"]'));

        const pushTurn = (user, aiEl, date, canvasTitle) => {
            const u = textCompact(user);
            if (!u && !aiEl) return;
            turns.push({ user: u, aiEl, date: date || '', canvasTitle: canvasTitle || '' });
        };

        if (roots.length) {
            for (const root of roots) {
                const user = extractUserText(root);
                const aiEl = root.querySelector('.CKgc1d');
                pushTurn(user, aiEl, extractTurnDate(root), findCanvasPlaceholder(root));
            }
        } else {
            const users = [...host.querySelectorAll('.tonYlb')]
                .filter(el => !el.closest('[data-xid="aim-mars-input-plate"], [data-xid="m3fCN"]'));
            const ais = [...host.querySelectorAll('.CKgc1d')]
                .filter(el => !el.closest('[data-xid="aim-mars-input-plate"], [data-xid="m3fCN"]'));
            const n = Math.max(users.length, ais.length);
            for (let i = 0; i < n; i++) {
                const user = users[i] ? extractUserText(users[i].closest('[data-xid="aim-mars-turn-root"]') || users[i]) : '';
                const aiEl = ais[i] || null;
                const container = users[i]?.closest('[data-xid="aim-mars-turn-root"]') || ais[i];
                pushTurn(user, aiEl, container ? extractTurnDate(container) : '', container ? findCanvasPlaceholder(container) : '');
            }
        }

        return turns.filter(t => t.user || t.aiEl);
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
                `title: ${title}`,
                `source: ${opts.srcURL || location.href}`,
                `exported: ${exported}`,
                `turns: ${turns.length}`,
                `exporter: Google AI Canvas Exporter v${VERSION}`,
                '---',
                ''
            );
        }

        turns.forEach((turn, idx) => {
            if (turn.user) parts.push(`You said: ${turn.user}`, '');
            if (opts.turnDates !== false && turn.date) {
                parts.push(turn.date, '');
            }

            if (turn.aiEl) {
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
        return cachedTurnCount > 0 || getCheapTurnCount() > 0;
    }

    // ═══════════════════════════════════════════════════════════
    //  CANVAS DETECTION
    // ═══════════════════════════════════════════════════════════

    function findCanvasIframes() {
        return [...document.querySelectorAll(
            'iframe[src*="scf.usercontent.goog"], iframe.lQ27pc'
        )].filter(f => !TAGGED.has(f));
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
            const raw = walker.currentNode.textContent;
            if (!raw.startsWith('TgQPHd|')) continue;
            const rawJson = raw.slice(7);
            if (rawJson === '[]') continue;
            const json = decodeEntities(rawJson);
            try {
                const parsed = JSON.parse(json);
                if (!Array.isArray(parsed)) continue;
                const htmlStr = findHTMLString(parsed);
                if (htmlStr) {
                    console.log(TAG, 'Extracted widget HTML from TgQPHd comment (' + htmlStr.length + ' chars)');
                    return htmlStr;
                }
            } catch (e) {
                console.warn(TAG, 'Comment JSON parse failed:', e.message?.slice(0, 80));
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

    function scan() {
        const iframes = findCanvasIframes();
        let added = 0;
        for (const iframe of iframes) {
            TAGGED.add(iframe);
            const widgetHTML = extractWidgetHTMLFromComment(iframe);
            if (widgetHTML) {
                const doc = new DOMParser().parseFromString(widgetHTML, 'text/html');
                const title = extractTitle(doc);
                const isDupe = registry.some(c =>
                    c.title === title && Math.abs(c.widgetHTML.length - widgetHTML.length) < 100
                );
                if (isDupe) continue;
                registry.push({
                    id: registry.length,
                    widgetHTML,
                    title,
                    type: detectType(widgetHTML)
                });
                added++;
                console.log(TAG, `Canvas registered: "${title}" [${detectType(widgetHTML)}]`);
            }
        }
        if (added > 0) scheduleBadgeUpdate();
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
  box-shadow:0 24px 64px rgba(0,0,0,.6);color:#E6E8F0;width:540px;max-width:95vw;
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
.gce-prev{width:100%;height:120px;padding:10px;border-radius:8px;border:1px solid #2D2F38;
  background:#101218;color:#ADAFB8;font:11px/1.45 'SF Mono','Roboto Mono',monospace;
  resize:vertical;box-sizing:border-box;margin-top:8px}
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

    function updateFABBadge() {
        if (!fabEl) return;
        const canvases = registry.length;
        const turnCount = cachedTurnCount;
        const conv = turnCount > 0;
        fabEl.querySelector('.gce-fab-badge').textContent = canvases || (conv ? turnCount : 0);
        fabEl.querySelector('.gce-fab-dot').classList.toggle('on', conv);
        if (canvases !== lastBadgeCanvas || turnCount !== lastBadgeTurn) {
            lastBadgeCanvas = canvases;
            lastBadgeTurn = turnCount;
            fabEl.classList.remove('gce-pop');
            void fabEl.offsetWidth;
            if (canvases > 0 || conv) fabEl.classList.add('gce-pop');
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  UNIFIED EXPORT PANEL
    // ═══════════════════════════════════════════════════════════

    function openExportPanel() {
        document.getElementById('gce-overlay')?.remove();

        const turns = extractConversationTurns();
        const hasConv = turns.length > 0;
        const hasCanvas = registry.length > 0;

        if (!hasConv && !hasCanvas) {
            showToast('Nothing to export yet. Open an AI Mode thread or scroll to load canvases.', true);
            return;
        }

        const threadTitle = extractThreadTitle(turns);
        const mdFilename = makeMarkdownFilename(threadTitle);

        const ov = document.createElement('div');
        ov.id = 'gce-overlay';
        ov.className = 'gce-ov';

        const now = new Date();
        const exportDate = now.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        }) + ' ' + now.toLocaleTimeString('en-US');

        const convWarn = hasConv && turns.length < 2
            ? '<div class="gce-warn">Only ' + turns.length + ' turn detected. Scroll through the full thread before exporting to load all turns.</div>'
            : '';

        const convSection = hasConv ? `
            <div class="gce-sl">CONVERSATION <span class="gce-pill">${turns.length} turn${turns.length !== 1 ? 's' : ''}</span></div>
            ${convWarn}
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
                <textarea class="gce-prev" id="gce-md-preview" readonly>Generating preview…</textarea>
                <div class="gce-sg">
                    <label class="gce-tg"><input type="checkbox" id="gce-md-fm" checked> YAML frontmatter</label>
                    <label class="gce-tg"><input type="checkbox" id="gce-md-dates" checked> Turn dates</label>
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
        ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
        ov.querySelector('.gce-x').onclick = () => ov.remove();

        if (hasConv) {
            const previewEl = ov.querySelector('#gce-md-preview');
            const genPreview = () => {
                if (!document.body.contains(ov) || !previewEl) return;
                const md = buildConversationMarkdown({
                    turns, title: threadTitle, frontmatter: true,
                    turnDates: true, srcURL: location.href
                }) || '';
                previewEl.value = md.slice(0, 3000);
            };
            const idle = window.requestIdleCallback || (cb => setTimeout(cb, 0));
            idle(genPreview);
        }

        const titleInput = ov.querySelector('#gce-thread-title');
        const mdNameInput = ov.querySelector('#gce-md-name');
        if (titleInput && mdNameInput) {
            titleInput.addEventListener('input', () => {
                mdNameInput.value = makeMarkdownFilename(titleInput.value.trim());
            });
        }

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
            const srcURL = ov.querySelector('#gce-url')?.value || location.href;
            const jobs = [];

            const wantConv = (mode === 'all' || mode === 'conv') && hasConv &&
                (mode !== 'all' || ov.querySelector('#gce-inc-conv')?.checked !== false);
            if (wantConv) {
                const title = ov.querySelector('#gce-thread-title')?.value.trim() || threadTitle;
                const md = buildConversationMarkdown({
                    turns,
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
                showToast('Nothing selected to export.', true);
                return;
            }

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
            showToast(`Exported ${parts.join(' + ')} successfully.`);
        }

        ov.querySelector('#gce-export-all')?.addEventListener('click', () => runExport('all'));
        ov.querySelector('#gce-conv-only')?.addEventListener('click', () => runExport('conv'));
        ov.querySelector('#gce-canvas-only')?.addEventListener('click', () => runExport('canvas'));
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

    ensureFAB();

    const observer = new MutationObserver(scan);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    const t0 = Date.now();
    const poll = setInterval(() => {
        scan();
        if (isAIModePage()) scheduleBadgeUpdate();
        if (Date.now() - t0 > 60000) clearInterval(poll);
    }, 2000);

    scan();
    scheduleBadgeUpdate();
    setTimeout(scan, 3000);
    setTimeout(scan, 8000);
    setTimeout(scheduleBadgeUpdate, 3000);
    setTimeout(scheduleBadgeUpdate, 8000);

})();
