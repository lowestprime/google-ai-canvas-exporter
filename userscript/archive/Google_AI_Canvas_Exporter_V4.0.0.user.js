// ==UserScript==
// @name              Google AI Canvas Exporter
// @description       One-click export of Google AI Search interactive canvas widgets—simulations, charts, 3D scenes, and physics demos—as self-contained offline HTML. Detects Widget Shell V2 in sandboxed scf.usercontent.goog iframes, strips CSP/sandbox artifacts, extracts WidgetHelpers, app logic, and CDN deps (D3, Plot, Three.js, Matter.js, KaTeX, anime.js), fixes Ghost UI duplication, injects fallback fonts, and supports dark/light mode plus full-viewport export.
// @author            lowestprime x Claude Opus 4.6 Max Agent
// @namespace         https://greasyfork.org/en/users/823161-lowestprime
// @license           MIT
// @version           4.0.0
// @match             *://www.google.com/search*
// @match             *://*.google.com/search*
// @grant             none
// @run-at            document-idle
// @icon              data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22bg%22%20x1%3D%226%22%20y1%3D%224%22%20x2%3D%2258%22%20y2%3D%2260%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%235BA3FF%22%2F%3E%3Cstop%20offset%3D%220.55%22%20stop-color%3D%22%235292F9%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%237C4DFF%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22panel%22%20x1%3D%2212%22%20y1%3D%2215%22%20x2%3D%2238%22%20y2%3D%2239%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23182742%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%230A1220%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2215%22%20fill%3D%22url%28%23bg%29%22%2F%3E%3Crect%20x%3D%225%22%20y%3D%2210%22%20width%3D%2228%22%20height%3D%2224%22%20rx%3D%226%22%20fill%3D%22%23091221%22%20fill-opacity%3D%22.24%22%20stroke%3D%22%23FFF%22%20stroke-opacity%3D%22.12%22%20stroke-width%3D%221.4%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2215%22%20width%3D%2228%22%20height%3D%2224%22%20rx%3D%226%22%20fill%3D%22url%28%23panel%29%22%20stroke%3D%22%23FFF%22%20stroke-opacity%3D%22.22%22%20stroke-width%3D%221.6%22%2F%3E%3Crect%20x%3D%2214%22%20y%3D%2219%22%20width%3D%2218%22%20height%3D%223%22%20rx%3D%221.5%22%20fill%3D%22%23FFF%22%20fill-opacity%3D%22.14%22%2F%3E%3Cpath%20d%3D%22M15%2033.5%2020.2%2028.8%2024.7%2031.7%2030.3%2024.8%2034%2027.2%22%20fill%3D%22none%22%20stroke%3D%22%2374F3D6%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M36%2031.5h7.5%22%20fill%3D%22none%22%20stroke%3D%22%23FFF%22%20stroke-width%3D%223.2%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22m40.7%2027.2%205.8%204.3-5.8%204.3%22%20fill%3D%22none%22%20stroke%3D%22%23FFF%22%20stroke-width%3D%223.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M44%2014h11c2.2%200%204%201.8%204%204v24c0%202.2-1.8%204-4%204H44c-2.2%200-4-1.8-4-4V18c0-2.2%201.8-4%204-4Z%22%20fill%3D%22%23FFF%22%2F%3E%3Cpath%20d%3D%22M52%2014v6c0%201.7%201.3%203%203%203h4%22%20fill%3D%22none%22%20stroke%3D%22%23D8E6FF%22%20stroke-width%3D%222.2%22%2F%3E%3Cpath%20d%3D%22M45.8%2028.2h8m-8%205h8m-8%205h4.8%22%20fill%3D%22none%22%20stroke%3D%22%235292F9%22%20stroke-width%3D%222.3%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E
// @downloadURL https://update.greasyfork.org/scripts/572688/Google%20AI%20Canvas%20Exporter.user.js
// @updateURL https://update.greasyfork.org/scripts/572688/Google%20AI%20Canvas%20Exporter.meta.js
// ==/UserScript==

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    //  CONSTANTS & STATE
    // ═══════════════════════════════════════════════════════════

    const TAG = '[GCE]';
    const VERSION = '4.0.0';
    const WH_APIS = [
        'WH.createApp', 'WH.initCanvas', 'WH.initD3',
        'WH.initPlot', 'WH.initThree', 'WH.initPhysics'
    ];
    const DEFAULT_FONTS = [
        'https://fonts.googleapis.com/css2?family=Material+Icons',
        'https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap',
        'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
    ];
    const TAGGED = new WeakSet();
    const registry = [];
    let fabEl = null;

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
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function generateTimestamp() {
        const now = new Date();
        const p = (n) => String(n).padStart(2, '0');
        const h = now.getHours();
        const tz = Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
            .formatToParts(now)
            .find(x => x.type === 'timeZoneName')?.value || 'UTC';
        return `${p(now.getMonth() + 1)}${p(now.getDate())}${now.getFullYear()}_` +
               `${p(h % 12 || 12)}${p(now.getMinutes())}${p(now.getSeconds())}_` +
               `${h >= 12 ? 'PM' : 'AM'}-${tz}`;
    }

    function makeFilename(title) {
        const safe = title.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'Simulation';
        return safe.replace(/ /g, '_') + '_' + generateTimestamp();
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
    //  DETECTION — find canvas iframes and extract widget HTML
    //  from adjacent <!--TgQPHd|[…]--> DOM comments
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
            } else {
                console.log(TAG, 'Found canvas iframe but no widget data in adjacent comments');
            }
        }
        if (added > 0) {
            ensureFAB();
            updateFABBadge();
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  UI STYLES — injected once into google.com
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
@keyframes gce-pop{0%,100%{box-shadow:0 4px 16px rgba(82,146,249,.4)}
  50%{box-shadow:0 4px 24px rgba(82,146,249,.7),0 0 0 8px rgba(82,146,249,.12)}}
.gce-fab.gce-pop{animation:gce-pop 1.5s ease-in-out 3}
.gce-ov{position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.6);display:flex;
  align-items:center;justify-content:center;backdrop-filter:blur(4px);
  font-family:'Google Sans',Roboto,sans-serif}
.gce-panel{background:#1A1C24;border:1px solid #3a3f50;border-radius:20px;
  box-shadow:0 24px 64px rgba(0,0,0,.6);color:#E6E8F0;width:500px;max-width:95vw;
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
  letter-spacing:.6px;margin-bottom:10px}
.gce-ci{background:#22232B;border:1px solid #2D2F38;border-radius:12px;padding:12px 14px;
  margin-bottom:8px;transition:border-color .15s,opacity .15s}
.gce-ci:hover{border-color:#3a3f50}
.gce-ci.off{opacity:.4;pointer-events:auto}
.gce-cr{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.gce-cr input[type=checkbox]{width:17px;height:17px;accent-color:#5292F9;cursor:pointer;flex-shrink:0}
.gce-ct{font-size:13px;font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gce-badge{font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;white-space:nowrap;
  letter-spacing:.3px}
.gce-fi{width:100%;padding:7px 10px;border-radius:7px;border:1px solid #3a3f50;background:#101218;
  color:#E6E8F0;font:11.5px/1.4 'SF Mono','Roboto Mono',monospace;outline:none;box-sizing:border-box;
  transition:border-color .15s}
.gce-fi:focus{border-color:#5292F9}
.gce-sg{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}
.gce-tg{display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer;user-select:none}
.gce-tg input[type=checkbox]{width:15px;height:15px;accent-color:#5292F9}
.gce-mf{margin-top:10px}
.gce-ml{font-size:10.5px;color:#ADAFB8;margin-bottom:3px;display:block;font-weight:500}
.gce-mi{width:100%;padding:7px 10px;border-radius:7px;border:1px solid #2D2F38;background:#101218;
  color:#ADAFB8;font:11.5px 'Google Sans',sans-serif;outline:none;box-sizing:border-box}
.gce-mi:focus{border-color:#5292F9;color:#E6E8F0}
.gce-pf{padding:14px 22px;border-top:1px solid #2D2F38;display:flex;align-items:center;
  justify-content:space-between;flex-shrink:0}
.gce-sa{font:600 12px 'Google Sans',sans-serif;color:#5292F9;background:none;border:none;
  cursor:pointer;padding:4px 0}
.gce-sa:hover{text-decoration:underline}
.gce-eb{background:linear-gradient(135deg,#5BA3FF,#5292F9);color:#0A0A0A;border:none;
  padding:9px 22px;border-radius:10px;font:700 13px 'Google Sans',sans-serif;cursor:pointer;
  transition:all .15s;box-shadow:0 2px 8px rgba(82,146,249,.3)}
.gce-eb:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(82,146,249,.4)}
.gce-eb:active{transform:translateY(0)}
.gce-eb:disabled{opacity:.5;cursor:not-allowed;transform:none}
.gce-toast{position:fixed;bottom:96px;left:50%;transform:translateX(-50%);z-index:2147483647;
  padding:11px 22px;border-radius:12px;font:600 13px 'Google Sans',sans-serif;
  box-shadow:0 4px 20px rgba(0,0,0,.35);transition:opacity .3s;pointer-events:none}
`;
        document.head.appendChild(s);
    }

    // ═══════════════════════════════════════════════════════════
    //  FAB — floating action button, always visible
    // ═══════════════════════════════════════════════════════════

    function ensureFAB() {
        if (fabEl) return;
        injectStyles();
        fabEl = document.createElement('button');
        fabEl.className = 'gce-fab';
        fabEl.title = 'Google AI Canvas Exporter';
        fabEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span class="gce-fab-badge">0</span>`;
        fabEl.addEventListener('click', e => { e.stopPropagation(); openExportPanel(); });
        document.body.appendChild(fabEl);
    }

    function updateFABBadge() {
        if (!fabEl) return;
        fabEl.querySelector('.gce-fab-badge').textContent = registry.length;
        fabEl.classList.remove('gce-pop');
        void fabEl.offsetWidth;
        fabEl.classList.add('gce-pop');
    }

    // ═══════════════════════════════════════════════════════════
    //  EXPORT PANEL — multi-canvas batch export UI
    // ═══════════════════════════════════════════════════════════

    function openExportPanel() {
        document.getElementById('gce-overlay')?.remove();

        if (registry.length === 0) {
            showToast('No canvases detected yet. Scroll to expose canvas widgets, then try again.', true);
            return;
        }

        const ov = document.createElement('div');
        ov.id = 'gce-overlay';
        ov.className = 'gce-ov';

        const now = new Date();
        const exportDate = now.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        }) + ' ' + now.toLocaleTimeString('en-US');

        const canvasCards = registry.map((c, i) => {
            const col = TYPE_COLORS[c.type] || '#ADAFB8';
            return `<div class="gce-ci" data-idx="${i}">
                <div class="gce-cr">
                    <input type="checkbox" checked data-idx="${i}">
                    <span class="gce-ct" title="${escapeHTML(c.title)}">${escapeHTML(c.title)}</span>
                    <span class="gce-badge" style="background:${col}22;color:${col};border:1px solid ${col}44">${c.type}</span>
                </div>
                <input class="gce-fi" data-idx="${i}" value="${escapeHTML(makeFilename(c.title))}">
            </div>`;
        }).join('');

        ov.innerHTML = `<div class="gce-panel">
            <div class="gce-ph">
                <h3>Export Canvases<small>v${VERSION}</small></h3>
                <button class="gce-x">\u00D7</button>
            </div>
            <div class="gce-body">
                <div class="gce-sl">CANVASES (${registry.length})</div>
                ${canvasCards}

                <div class="gce-sl" style="margin-top:18px">SETTINGS</div>
                <div class="gce-sg">
                    <label class="gce-tg"><input type="checkbox" id="gce-dark" checked> Dark mode</label>
                    <label class="gce-tg"><input type="checkbox" id="gce-full" checked> Full viewport</label>
                    <label class="gce-tg"><input type="checkbox" id="gce-meta" checked> Embed metadata</label>
                </div>

                <div class="gce-mf">
                    <span class="gce-ml">Source URL</span>
                    <input class="gce-mi" id="gce-url" value="${escapeHTML(location.href)}" readonly>
                </div>
                <div class="gce-mf">
                    <span class="gce-ml">Export Date</span>
                    <input class="gce-mi" value="${escapeHTML(exportDate)}" readonly>
                </div>
            </div>
            <div class="gce-pf">
                <button class="gce-sa">Deselect All</button>
                <button class="gce-eb">Export Selected (${registry.length})</button>
            </div>
        </div>`;

        document.body.appendChild(ov);

        ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
        ov.querySelector('.gce-x').onclick = () => ov.remove();

        const updateExportCount = () => {
            const n = ov.querySelectorAll('.gce-cr input[type=checkbox]:checked').length;
            const btn = ov.querySelector('.gce-eb');
            btn.textContent = `Export Selected (${n})`;
            btn.disabled = n === 0;
        };

        ov.querySelectorAll('.gce-cr input[type=checkbox]').forEach(cb => {
            cb.addEventListener('change', () => {
                cb.closest('.gce-ci').classList.toggle('off', !cb.checked);
                updateExportCount();
            });
        });

        let allOn = true;
        const saBtn = ov.querySelector('.gce-sa');
        saBtn.onclick = () => {
            allOn = !allOn;
            saBtn.textContent = allOn ? 'Deselect All' : 'Select All';
            ov.querySelectorAll('.gce-cr input[type=checkbox]').forEach(cb => {
                cb.checked = allOn;
                cb.closest('.gce-ci').classList.toggle('off', !allOn);
            });
            updateExportCount();
        };

        ov.querySelector('.gce-eb').onclick = async () => {
            const isDark = ov.querySelector('#gce-dark').checked;
            const fullVP = ov.querySelector('#gce-full').checked;
            const meta = ov.querySelector('#gce-meta').checked;
            const srcURL = ov.querySelector('#gce-url').value;

            const jobs = [];
            ov.querySelectorAll('.gce-ci').forEach(card => {
                const cb = card.querySelector('input[type=checkbox]');
                if (!cb.checked) return;
                const idx = parseInt(card.dataset.idx);
                const fname = card.querySelector('.gce-fi').value.trim() || 'export';
                jobs.push({ canvas: registry[idx], filename: fname.endsWith('.html') ? fname : fname + '.html' });
            });

            if (jobs.length === 0) return;
            ov.remove();

            for (let i = 0; i < jobs.length; i++) {
                const { canvas, filename } = jobs[i];
                const html = buildExportHTML(canvas.widgetHTML, {
                    title: canvas.title, isDark, fullVP, meta, srcURL
                });
                if (html) downloadFile(html, filename);
                if (i < jobs.length - 1) await new Promise(r => setTimeout(r, 500));
            }

            showToast(`Exported ${jobs.length} canvas${jobs.length > 1 ? 'es' : ''} successfully.`);
        };
    }

    // ═══════════════════════════════════════════════════════════
    //  EXPORT PIPELINE — parse, clean, reconstruct standalone HTML
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

        // A. Font / CSS links
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

        // B. Widget styles
        const styleHTML = [...doc.querySelectorAll('style')]
            .filter(s => !isSandboxArtifact(s))
            .filter(s => isWidgetStyle(s.textContent))
            .map(s => `    <style>\n${s.textContent}\n    </style>`)
            .join('\n');

        // C. CDN dependency scripts
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

        // D. Inline scripts — whitespace-tolerant detection
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
            console.error(TAG, 'No WidgetHelpers or WH API scripts found');
            return null;
        }

        const helperHasLogic = helperScript &&
            WH_APIS.some(api => helperScript.textContent.includes(api));
        const headHelper = helperHasLogic ? null : helperScript;
        const bodyScripts = helperHasLogic
            ? [helperScript, ...logicScripts]
            : logicScripts;

        console.log(TAG, 'Found:', {
            fonts: fontHrefs.size, styles: styleHTML ? 'yes' : 'none',
            cdnScripts: cdnScripts.length, helper: !!helperScript,
            initData: !!initDataScript, logic: logicScripts.length
        });

        // E. Light-mode CSS override
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

        // F. Metadata comment
        const metaComment = opts.meta ? `<!--
  Exported by Google AI Canvas Exporter v${VERSION}
  Canvas: ${opts.title}
  Source: ${opts.srcURL}
  Date:   ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}
-->\n` : '';

        // G. Assemble standalone HTML
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

    function downloadFile(html, filename) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: filename });
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    // ═══════════════════════════════════════════════════════════
    //  TOAST — lightweight feedback notification
    // ═══════════════════════════════════════════════════════════

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

    const observer = new MutationObserver(scan);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    const t0 = Date.now();
    const poll = setInterval(() => {
        scan();
        if (Date.now() - t0 > 60000) clearInterval(poll);
    }, 2000);
    scan();
    setTimeout(scan, 3000);
    setTimeout(scan, 8000);

})();
