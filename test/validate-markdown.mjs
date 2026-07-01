/**
 * Validates v5 conversation markdown export against Single_File_Export.html fixture.
 * Run: node test/validate-markdown.mjs
 */
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = process.env.GCE_FIXTURE ||
    'C:\\Users\\Cooper\\Desktop\\Fix_Chrome_Beta_Download_Location_Single_File_Export.html';

const DROP_TAGS = new Set([
    'script', 'style', 'svg', 'noscript', 'button', 'nav', 'iframe',
    'input', 'select', 'textarea', 'form'
]);

function textCompact(s) {
    return String(s || '').replace(/\s+/g, ' ').trim();
}

function stripUtm(href) {
    if (!href) return href;
    try {
        const u = new URL(href);
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

function isAIModePage(doc) {
    return !!doc.querySelector('[jsname="coFSxe"], [data-xid="aim-mars-turn-root"]');
}

function getConversationHost(doc) {
    if (!isAIModePage(doc)) return null;
    return doc.querySelector('[jsname="coFSxe"]')
        || doc.querySelector('[jsname="guest_container_"]')
        || null;
}

function extractUserText(turnEl) {
    const el = turnEl.querySelector('.tonYlb .ilZyRc.R7mRQb')
          || turnEl.querySelector('.ilZyRc.R7mRQb')
          || turnEl.querySelector('[data-xid="VpUvz"]')
          || turnEl.querySelector('.tonYlb');
    return el ? textCompact(el.innerText || el.textContent) : '';
}

function extractTurnDate(turnEl) {
    const raw = turnEl.innerText || turnEl.textContent || '';
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

function prepareCloneForMarkdown(root) {
    const clone = root.cloneNode(true);
    clone.querySelectorAll(
        '[data-tpcrb-host], .kWjn6e, [data-xid="m3fCN"], .emqXtf, iframe'
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
    function walk(node, ctx = { inPre: false }) {
        if (!node) return '';
        if (node.nodeType === 3) {
            const t = node.nodeValue || '';
            if (ctx.inPre) return t;
            return escInline(t.replace(/\s+/g, ' '));
        }
        if (node.nodeType !== 1) return '';
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
            if (num && (!label || /^\d+$/.test(label))) return `[${num}](${href})`;
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
        if (tag === 'strong' || tag === 'b') {
            const t = children();
            return t ? `**${t}**` : '';
        }
        if (tag === 'em' || tag === 'i') {
            const t = children();
            return t ? `*${t}*` : '';
        }
        if (tag === 'ul' || tag === 'ol') {
            const items = [...el.children].filter(c => c.tagName?.toLowerCase() === 'li');
            if (!items.length) return children();
            let out = '\n';
            items.forEach((li, i) => {
                const bullet = tag === 'ol' ? `${i + 1}. ` : '- ';
                out += bullet + walk(li, ctx).trim() + '\n';
            });
            return out + '\n';
        }
        if (tag === 'li') return children();
        return children();
    }
    return walk(prepareCloneForMarkdown(root));
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

function extractConversationTurns(doc) {
    const host = getConversationHost(doc);
    if (!host) return [];
    const turns = [];
    const roots = [...host.querySelectorAll('[data-xid="aim-mars-turn-root"]')]
        .filter(el => !el.closest('[data-xid="aim-mars-input-plate"], [data-xid="m3fCN"]'));

    const pushTurn = (user, aiEl, date) => {
        const u = textCompact(user);
        if (!u && !aiEl) return;
        turns.push({ user: u, aiEl, date: date || '' });
    };

    if (roots.length) {
        for (const root of roots) {
            pushTurn(extractUserText(root), root.querySelector('.CKgc1d'), extractTurnDate(root));
        }
    } else {
        const users = [...host.querySelectorAll('.tonYlb')]
            .filter(el => !el.closest('[data-xid="aim-mars-input-plate"], [data-xid="m3fCN"]'));
        const ais = [...host.querySelectorAll('.CKgc1d')]
            .filter(el => !el.closest('[data-xid="aim-mars-input-plate"], [data-xid="m3fCN"]'));
        const n = Math.max(users.length, ais.length);
        for (let i = 0; i < n; i++) {
            const user = users[i] ? extractUserText(users[i]) : '';
            pushTurn(user, ais[i] || null, '');
        }
    }
    return turns.filter(t => t.user || t.aiEl);
}

function buildConversationMarkdown(doc, opts = {}) {
    const turns = opts.turns || extractConversationTurns(doc);
    if (!turns.length) return null;
    const title = opts.title || 'Fix Chrome Beta Download Location';
    const parts = [];
    if (opts.frontmatter !== false) {
        parts.push(
            '---',
            `title: ${title}`,
            `source: ${opts.srcURL || 'https://example.com'}`,
            `exported: Saturday, June 30, 2026 at 10:27:09 AM PDT`,
            `turns: ${turns.length}`,
            `exporter: Google AI Canvas Exporter v5.0.0`,
            '---',
            ''
        );
    }
    turns.forEach((turn, idx) => {
        if (turn.user) parts.push(`You said: ${turn.user}`, '');
        if (opts.turnDates !== false && turn.date) parts.push(turn.date, '');
        if (turn.aiEl) {
            const citeTracker = createCitationTracker();
            let body = normalizeMarkdown(aimDomToMarkdown(turn.aiEl, citeTracker));
            if (body) parts.push(body, '');
            const refs = formatReferences(citeTracker);
            if (refs) parts.push(refs, '');
        }
        if (idx < turns.length - 1) parts.push('---', '');
    });
    return normalizeMarkdown(parts.join('\n'));
}

// ── Run validation ──

const html = readFileSync(FIXTURE, 'utf8');
const dom = new JSDOM(html);
const doc = dom.window.document;

const turns = extractConversationTurns(doc);
const md = buildConversationMarkdown(doc, { turns, title: 'Fix Chrome Beta Download Location' });

const checks = [];
const pass = (name, ok, detail = '') => checks.push({ name, ok, detail });

pass('turns extracted', turns.length >= 1, `found ${turns.length}`);
pass('markdown generated', !!md && md.length > 500, `${md?.length || 0} chars`);
pass('YAML frontmatter', /^---\ntitle:/m.test(md));
pass('You said labels', (md.match(/You said:/g) || []).length >= 1);
pass('no favicon images', !/faviconV2|encrypted-tbn|data:image/i.test(md));
pass('no empty links', !/\[\]\(https?:\/\//.test(md));
pass('no +1 artifacts', !/ \+1\b/.test(md));
pass('has References blocks', md.includes('### References'));
pass('no triple blank lines', !/\n\n\n/.test(md));
pass('filename pattern', /^Fix_Chrome_Beta_Download_Location_[A-Z]{3}_\d{8}_\d{6}-(AM|PM)-/.test(
    makeMarkdownFilename('Fix Chrome Beta Download Location', new Date('2026-06-30T10:27:09-07:00'))
));

const refBlocks = (md.match(/### References/g) || []).length;
const aiTurns = turns.filter(t => t.aiEl).length;
pass('one References per AI turn', refBlocks === aiTurns || (aiTurns === 0 && refBlocks === 0),
    `${refBlocks} refs vs ${aiTurns} AI turns`);

console.log('\n=== GCE v5 Markdown Validation ===\n');
let failed = 0;
for (const c of checks) {
    const icon = c.ok ? 'PASS' : 'FAIL';
    if (!c.ok) failed++;
    console.log(`[${icon}] ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
}

if (process.env.GCE_WRITE) {
    const out = join(__dirname, 'chrome-beta-export-sample.md');
    import('fs').then(fs => fs.writeFileSync(out, md));
    console.log(`\nWrote sample to ${out}`);
}

console.log(`\n${checks.length - failed}/${checks.length} checks passed\n`);
process.exit(failed ? 1 : 0);
