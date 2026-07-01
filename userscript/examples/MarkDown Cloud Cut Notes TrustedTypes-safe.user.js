// ==UserScript==
// @name              MarkDown Cloud Cut Notes (TrustedTypes-safe)
// @description       Web clipper that exports selected DOM to Markdown without using innerHTML/jQuery (works on strict Trusted Types pages like Gemini).
// @namespace         https://example.local/userscripts
// @version           2026.01.03.0001
// @match             *://*/*
// @grant             GM_addStyle
// @grant             GM_setClipboard
// @grant             GM_setValue
// @grant             GM_getValue
// @grant             GM_registerMenuCommand
// ==/UserScript==

(() => {
  'use strict';

  // -----------------------
  // GM compatibility
  // -----------------------
  const hasGM = typeof GM === 'object' && GM !== null;

  const gmAddStyle = (css) => {
    try {
      if (typeof GM_addStyle === 'function') return GM_addStyle(css);
      if (hasGM && typeof GM.addStyle === 'function') return GM.addStyle(css);
    } catch (_) {}
    const style = document.createElement('style');
    style.textContent = css; // SAFE (not a Trusted Types sink)
    (document.head || document.documentElement).appendChild(style);
    return style;
  };

  const gmSetClipboard = async (text) => {
    try {
      if (typeof GM_setClipboard === 'function') return GM_setClipboard(text);
      if (hasGM && typeof GM.setClipboard === 'function') return GM.setClipboard(text, 'text/plain');
    } catch (_) {}

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch (_) {}

    // last-resort fallback
    try {
      const ta = document.createElement('textarea');
      ta.value = String(text ?? '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      ta.remove();
    } catch (e) {
      console.warn('[H2M] Clipboard fallback failed', e);
    }
  };

  const gmSetValue = async (key, value) => {
    try {
      if (typeof GM_setValue === 'function') return GM_setValue(key, value);
      if (hasGM && typeof GM.setValue === 'function') return GM.setValue(key, value);
    } catch (_) {}
    try {
      localStorage.setItem('h2m_' + key, JSON.stringify(value));
    } catch (e) {
      console.warn('[H2M] setValue fallback failed', e);
    }
  };

  const gmGetValue = async (key, defaultValue) => {
    try {
      if (typeof GM_getValue === 'function') return GM_getValue(key, defaultValue);
      if (hasGM && typeof GM.getValue === 'function') return await GM.getValue(key, defaultValue);
    } catch (_) {}
    try {
      const raw = localStorage.getItem('h2m_' + key);
      return raw != null ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  const gmRegisterMenuCommand = (title, fn) => {
    try {
      if (typeof GM_registerMenuCommand === 'function') GM_registerMenuCommand(title, fn);
      else if (hasGM && typeof GM.registerMenuCommand === 'function') GM.registerMenuCommand(title, fn);
    } catch (e) {
      // ignore
    }
  };

  // -----------------------
  // Strict Trusted Types: do NOT use innerHTML/outerHTML assignment/insertAdjacentHTML
  // -----------------------
  const isTouch = (() => {
    const ua = (navigator && navigator.userAgent) || '';
    return ('ontouchstart' in window) || (navigator && navigator.maxTouchPoints > 0) || /iPad|iPhone|iPod/i.test(ua);
  })();

  // -----------------------
  // UI + state
  // -----------------------
  let selecting = false;
  let currentEl = null;
  let confirmEl = null;
  let confirmTimer = null;

  const CSS = `
    .h2m-selection-box { outline: 3px dashed #ff2d2d !important; outline-offset: 2px !important; }
    .h2m-no-scroll { overflow: hidden !important; }
    .h2m-fab {
      position: fixed; right: 12px; bottom: 80px;
      width: 42px; height: 42px; border-radius: 999px;
      border: none; background: #111827; color: #f9fafb;
      font-size: 13px; font-weight: 700;
      z-index: 2147483647;
      box-shadow: 0 10px 25px rgba(0,0,0,.25);
      -webkit-tap-highlight-color: transparent;
    }
    .h2m-fab.h2m-fab-active { background: #2563eb; }
    .h2m-toast {
      position: fixed; right: 12px; bottom: 132px;
      max-width: 270px;
      background: rgba(17,24,39,.96);
      color: #e5e7eb;
      padding: 8px 10px;
      border-radius: 10px;
      font-size: 12px;
      line-height: 1.35;
      z-index: 2147483647;
      box-shadow: 0 10px 25px rgba(0,0,0,.3);
      white-space: pre-wrap;
    }

    .h2m-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.5);
      z-index: 2147483000;
      display: flex; align-items: center; justify-content: center;
      padding: 14px;
    }
    .h2m-modal {
      width: min(980px, 96vw);
      height: min(720px, 86vh);
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,.35);
      display: grid;
      grid-template-rows: auto 1fr auto;
    }
    .h2m-modal-header {
      padding: 10px 12px;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid #e5e7eb;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    }
    .h2m-modal-title { font-weight: 700; font-size: 14px; color: #111827; }
    .h2m-close {
      border: none; background: #ef4444; color: #fff;
      width: 28px; height: 28px; border-radius: 999px;
      font-weight: 800; cursor: pointer;
    }
    .h2m-body {
      display: grid;
      grid-template-columns: 1fr;
      height: 100%;
    }
    .h2m-textarea {
      width: 100%; height: 100%;
      padding: 12px;
      border: none;
      outline: none;
      resize: none;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 12.5px;
      line-height: 1.45;
    }
    .h2m-actions {
      padding: 10px 12px;
      display: flex; flex-wrap: wrap; gap: 10px;
      justify-content: flex-end;
      border-top: 1px solid #e5e7eb;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    }
    .h2m-btn {
      border: none;
      background: #16a34a;
      color: #fff;
      padding: 10px 12px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
    }
    .h2m-btn-secondary { background: #334155; }
    .h2m-btn-danger { background: #dc2626; }
    .h2m-input {
      width: 100%;
      padding: 10px 10px;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      font-size: 13px;
      margin-top: 6px;
      margin-bottom: 10px;
    }
    .h2m-label {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      font-size: 13px;
      color: #111827;
      font-weight: 700;
      margin-top: 10px;
    }
  `;
  gmAddStyle(CSS);

  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'h2m-fab';
  fab.textContent = 'MD';
  (document.body || document.documentElement).appendChild(fab);

  let toastEl = null;
  const showToast = (msg, ms = 1800) => {
    try {
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.className = 'h2m-toast';
        document.body.appendChild(toastEl);
      }
      toastEl.textContent = String(msg ?? '');
      toastEl.style.display = 'block';
      if (ms != null) {
        setTimeout(() => {
          if (toastEl) toastEl.style.display = 'none';
        }, ms);
      }
    } catch (_) {}
  };

  const clearHighlight = () => {
    if (currentEl && currentEl.classList) currentEl.classList.remove('h2m-selection-box');
    currentEl = null;
  };

  const highlight = (el) => {
    if (!el || !el.classList) return;
    if (currentEl === el) return;
    clearHighlight();
    currentEl = el;
    currentEl.classList.add('h2m-selection-box');
  };

  const startSelecting = () => {
    selecting = true;
    fab.classList.add('h2m-fab-active');
    document.body.classList.add('h2m-no-scroll');
    clearHighlight();
    confirmEl = null;
    if (confirmTimer) { clearTimeout(confirmTimer); confirmTimer = null; }
    showToast(isTouch ? 'Selection ON.\nTap an element to highlight.\nTap the same element again to export.' : 'Selection ON.\nHover to highlight, click to export.\nEsc to cancel.', 2400);
  };

  const endSelecting = () => {
    selecting = false;
    fab.classList.remove('h2m-fab-active');
    document.body.classList.remove('h2m-no-scroll');
    clearHighlight();
    confirmEl = null;
    if (confirmTimer) { clearTimeout(confirmTimer); confirmTimer = null; }
    showToast('Selection OFF.', 900);
  };

  const toggleSelecting = () => (selecting ? endSelecting() : startSelecting());

  fab.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSelecting();
  }, true);

  gmRegisterMenuCommand('Convert to Markdown (toggle selection)', toggleSelecting);
  gmRegisterMenuCommand('Configure GitHub (optional)', () => showGitHubConfigModal());

  // -----------------------
  // DOM -> Markdown (no Turndown, no parsing, no innerHTML)
  // -----------------------
  const mdEscapeText = (s) => {
    // conservative escaping
    return String(s ?? '')
      .replace(/\r\n/g, '\n')
      .replace(/[\\`*_{}[\]()#+\-.!|>]/g, (m) => '\\' + m);
  };

  const mdEscapeInline = (s) => {
    // less aggressive for inline text; still escape backticks/asterisks/brackets
    return String(s ?? '')
      .replace(/\r\n/g, '\n')
      .replace(/[`*_[\]]/g, (m) => '\\' + m);
  };

  const normalizeBlankLines = (md) => {
    const x = String(md ?? '')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return x + '\n';
  };

  const getText = (node) => (node && node.textContent != null ? node.textContent : '');

  const nodeToMarkdown = (node, ctx = { listDepth: 0, inPre: false }) => {
    if (!node) return '';

    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.nodeValue || '';
      if (ctx.inPre) return t;
      // collapse whitespace but preserve single spaces
      return mdEscapeInline(t.replace(/\s+/g, ' '));
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node;
    const tag = (el.tagName || '').toLowerCase();

    if (tag === 'script' || tag === 'style' || tag === 'noscript') return '';

    // Helpers
    const children = Array.from(el.childNodes || []);
    const childrenInline = () => children.map((c) => nodeToMarkdown(c, ctx)).join('').trim();
    const childrenBlock = () => children.map((c) => nodeToMarkdown(c, ctx)).join('').trim();

    // Block elements
    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag.slice(1));
      const text = childrenInline();
      return `\n${'#'.repeat(level)} ${text}\n\n`;
    }

    if (tag === 'p') {
      const text = childrenInline();
      return text ? `\n${text}\n\n` : '\n';
    }

    if (tag === 'br') return '  \n';

    if (tag === 'hr') return '\n---\n\n';

    if (tag === 'pre') {
      const code = getText(el).replace(/\r\n/g, '\n');
      return `\n\`\`\`\n${code}\n\`\`\`\n\n`;
    }

    if (tag === 'code') {
      if (ctx.inPre) return getText(el);
      const code = getText(el).replace(/\r\n/g, '\n');
      const safe = code.replace(/`/g, '\\`');
      return '`' + safe + '`';
    }

    if (tag === 'blockquote') {
      const inner = children.map((c) => nodeToMarkdown(c, ctx)).join('');
      const lines = inner.split('\n').map((ln) => (ln.trim() ? `> ${ln}` : '>')).join('\n');
      return `\n${lines}\n\n`;
    }

    if (tag === 'a') {
      const href = el.getAttribute('href') || '';
      const label = childrenInline() || mdEscapeInline(href);
      if (!href) return label;
      return `[${label}](${href})`;
    }

    if (tag === 'img') {
      const alt = el.getAttribute('alt') || '';
      const src = el.getAttribute('src') || '';
      if (!src) return '';
      return `![${mdEscapeInline(alt)}](${src})`;
    }

    if (tag === 'strong' || tag === 'b') {
      const t = childrenInline();
      return t ? `**${t}**` : '';
    }

    if (tag === 'em' || tag === 'i') {
      const t = childrenInline();
      return t ? `*${t}*` : '';
    }

    if (tag === 'ul' || tag === 'ol') {
      const isOl = tag === 'ol';
      const items = Array.from(el.children || []).filter((c) => (c.tagName || '').toLowerCase() === 'li');

      const nextCtx = { ...ctx, listDepth: ctx.listDepth + 1 };
      let out = '\n';
      items.forEach((li, idx) => {
        const bullet = isOl ? `${idx + 1}. ` : `- `;
        const indent = '  '.repeat(Math.max(0, ctx.listDepth));
        const liMd = nodeToMarkdown(li, nextCtx).trim();

        // Split multiline list item properly
        const lines = liMd.split('\n');
        out += indent + bullet + (lines[0] || '') + '\n';
        for (let i = 1; i < lines.length; i++) {
          out += indent + '  ' + lines[i] + '\n';
        }
      });
      out += '\n';
      return out;
    }

    if (tag === 'li') {
      // Render LI contents without adding its own bullet (parent handles it)
      // Preserve nested lists as block
      let out = '';
      for (const c of children) {
        const ctag = c.nodeType === Node.ELEMENT_NODE ? (c.tagName || '').toLowerCase() : '';
        if (ctag === 'ul' || ctag === 'ol') {
          out += '\n' + nodeToMarkdown(c, ctx) + '\n';
        } else {
          out += nodeToMarkdown(c, ctx);
        }
      }
      return out.trim();
    }

    if (tag === 'table') {
      // Basic table support: first row headers if th exists
      const rows = Array.from(el.querySelectorAll('tr'));
      if (!rows.length) return '';

      const rowCells = rows.map((tr) =>
        Array.from(tr.children).filter((c) => {
          const t = (c.tagName || '').toLowerCase();
          return t === 'td' || t === 'th';
        })
      );

      const mdRows = rowCells.map((cells) =>
        cells.map((cell) => {
          const txt = getText(cell).replace(/\s+/g, ' ').trim();
          // table pipes need escaping
          return mdEscapeText(txt).replace(/\|/g, '\\|');
        })
      );

      const headerIdx = rowCells[0].some((c) => (c.tagName || '').toLowerCase() === 'th') ? 0 : null;
      const cols = Math.max(...mdRows.map((r) => r.length));

      const padRow = (r) => {
        const rr = r.slice();
        while (rr.length < cols) rr.push('');
        return rr;
      };

      const head = padRow(headerIdx === 0 ? mdRows[0] : mdRows[0]);
      const sep = new Array(cols).fill('---');
      const body = mdRows.slice(headerIdx === 0 ? 1 : 1).map(padRow);

      let out = '\n';
      out += '| ' + head.join(' | ') + ' |\n';
      out += '| ' + sep.join(' | ') + ' |\n';
      body.forEach((r) => {
        out += '| ' + r.join(' | ') + ' |\n';
      });
      out += '\n';
      return out;
    }

    // Default: treat div/section/article as blocks, others inline-ish
    if (tag === 'div' || tag === 'section' || tag === 'article' || tag === 'main' || tag === 'header' || tag === 'footer') {
      const inner = children.map((c) => nodeToMarkdown(c, ctx)).join('');
      return inner ? `\n${inner}\n` : '';
    }

    // fallback: just recurse
    return children.map((c) => nodeToMarkdown(c, ctx)).join('');
  };

  const convertElementToMarkdown = (el) => {
    // Clone so we can strip our selection class if present
    const clone = el.cloneNode(true);
    try {
      clone.classList.remove('h2m-selection-box');
    } catch (_) {}
    const md = nodeToMarkdown(clone, { listDepth: 0, inPre: false });
    return normalizeBlankLines(md);
  };

  // -----------------------
  // Markdown modal (DOM-built, no HTML strings)
  // -----------------------
  const makeButton = (label, cls) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.textContent = label;
    return b;
  };

  const showMarkdownModal = (markdown) => {
    const overlay = document.createElement('div');
    overlay.className = 'h2m-overlay';

    const modal = document.createElement('div');
    modal.className = 'h2m-modal';

    const header = document.createElement('div');
    header.className = 'h2m-modal-header';

    const title = document.createElement('div');
    title.className = 'h2m-modal-title';
    title.textContent = 'Markdown export';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'h2m-close';
    closeBtn.textContent = '×';

    header.appendChild(title);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'h2m-body';

    const ta = document.createElement('textarea');
    ta.className = 'h2m-textarea';
    ta.value = String(markdown ?? '');

    body.appendChild(ta);

    const actions = document.createElement('div');
    actions.className = 'h2m-actions';

    const copyBtn = makeButton('Copy', 'h2m-btn');
    const dlBtn = makeButton('Download .md', 'h2m-btn h2m-btn-secondary');
    const ghBtn = makeButton('Send to GitHub Issue', 'h2m-btn');
    const cfgBtn = makeButton('GitHub Config', 'h2m-btn h2m-btn-secondary');
    const cancelBtn = makeButton('Close', 'h2m-btn h2m-btn-danger');

    actions.appendChild(copyBtn);
    actions.appendChild(dlBtn);
    actions.appendChild(ghBtn);
    actions.appendChild(cfgBtn);
    actions.appendChild(cancelBtn);

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const cleanup = () => {
      try { overlay.remove(); } catch (_) {}
    };

    const onEsc = (e) => {
      if (e.key === 'Escape') cleanup();
    };
    document.addEventListener('keydown', onEsc, true);

    closeBtn.addEventListener('click', () => {
      document.removeEventListener('keydown', onEsc, true);
      cleanup();
    });
    cancelBtn.addEventListener('click', () => {
      document.removeEventListener('keydown', onEsc, true);
      cleanup();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.removeEventListener('keydown', onEsc, true);
        cleanup();
      }
    });

    copyBtn.addEventListener('click', async () => {
      await gmSetClipboard(ta.value);
      showToast('Copied.', 900);
    });

    dlBtn.addEventListener('click', () => {
      const blob = new Blob([ta.value], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(document.title || 'clip').replace(/[\\/:*?"<>|]/g, '_')}.md`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });

    cfgBtn.addEventListener('click', async () => {
      await showGitHubConfigModal();
    });

    ghBtn.addEventListener('click', async () => {
      const token = await gmGetValue('github_token', '');
      const owner = await gmGetValue('OWNER', '');
      const repo = await gmGetValue('REPO', '');
      if (!token || !owner || !repo) {
        showToast('GitHub not configured. Open GitHub Config.', 1600);
        return;
      }
      const firstLine = (ta.value.split('\n').find((l) => l.trim()) || 'Web clip').slice(0, 120);
      try {
        await createGitHubIssue({ token, owner, repo, title: firstLine, body: ta.value, labels: ['web-clipper'] });
        showToast('GitHub issue created.', 1500);
      } catch (e) {
        console.error(e);
        showToast('GitHub create failed (see console).', 2000);
      }
    });
  };

  // -----------------------
  // GitHub config modal (DOM-built)
  // -----------------------
  const showGitHubConfigModal = async () => {
    const overlay = document.createElement('div');
    overlay.className = 'h2m-overlay';

    const modal = document.createElement('div');
    modal.className = 'h2m-modal';
    modal.style.height = 'min(520px, 80vh)';

    const header = document.createElement('div');
    header.className = 'h2m-modal-header';

    const title = document.createElement('div');
    title.className = 'h2m-modal-title';
    title.textContent = 'GitHub configuration';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'h2m-close';
    closeBtn.textContent = '×';

    header.appendChild(title);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'h2m-body';
    body.style.padding = '12px';

    const labelToken = document.createElement('div');
    labelToken.className = 'h2m-label';
    labelToken.textContent = 'Personal Access Token (repo scope)';

    const inputToken = document.createElement('input');
    inputToken.className = 'h2m-input';
    inputToken.type = 'password';
    inputToken.autocomplete = 'off';

    const labelOwner = document.createElement('div');
    labelOwner.className = 'h2m-label';
    labelOwner.textContent = 'Owner (username or org)';

    const inputOwner = document.createElement('input');
    inputOwner.className = 'h2m-input';
    inputOwner.type = 'text';
    inputOwner.autocomplete = 'off';

    const labelRepo = document.createElement('div');
    labelRepo.className = 'h2m-label';
    labelRepo.textContent = 'Repository name';

    const inputRepo = document.createElement('input');
    inputRepo.className = 'h2m-input';
    inputRepo.type = 'text';
    inputRepo.autocomplete = 'off';

    inputToken.value = await gmGetValue('github_token', '');
    inputOwner.value = await gmGetValue('OWNER', '');
    inputRepo.value = await gmGetValue('REPO', '');

    body.appendChild(labelToken);
    body.appendChild(inputToken);
    body.appendChild(labelOwner);
    body.appendChild(inputOwner);
    body.appendChild(labelRepo);
    body.appendChild(inputRepo);

    const actions = document.createElement('div');
    actions.className = 'h2m-actions';

    const saveBtn = makeButton('Save', 'h2m-btn');
    const cancelBtn = makeButton('Close', 'h2m-btn h2m-btn-danger');

    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const cleanup = () => { try { overlay.remove(); } catch (_) {} };

    closeBtn.addEventListener('click', cleanup);
    cancelBtn.addEventListener('click', cleanup);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup(); });

    saveBtn.addEventListener('click', async () => {
      const t = inputToken.value.trim();
      const o = inputOwner.value.trim();
      const r = inputRepo.value.trim();
      if (!t || !o || !r) {
        showToast('Token / owner / repo required.', 1500);
        return;
      }
      await gmSetValue('github_token', t);
      await gmSetValue('OWNER', o);
      await gmSetValue('REPO', r);
      showToast('Saved.', 900);
      cleanup();
    });
  };

  const createGitHubIssue = async ({ token, owner, repo, title, body, labels = [] }) => {
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, body, labels })
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}\n${txt}`);
    }
    return await res.json();
  };

  // -----------------------
  // Selection handlers (no jQuery)
  // -----------------------
  document.addEventListener('keydown', (e) => {
    if (!selecting) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      endSelecting();
    }
  }, true);

  // Desktop hover highlight
  document.addEventListener('pointermove', (e) => {
    if (!selecting) return;
    if (isTouch) return;
    const t = e.target;
    if (t && t !== document.documentElement && t !== document.body) highlight(t);
  }, true);

  const tryExport = (target) => {
    if (!target || target === document.documentElement || target === document.body) return;

    if (isTouch) {
      // Two-tap confirm model to avoid accidental exports while scrolling
      if (confirmEl !== target) {
        confirmEl = target;
        highlight(target);
        showToast('Highlighted.\nTap the same element again to export.', 1800);
        if (confirmTimer) clearTimeout(confirmTimer);
        confirmTimer = setTimeout(() => { confirmEl = null; confirmTimer = null; }, 2000);
        return;
      }
      // second tap on same element
    } else {
      highlight(target);
    }

    const md = convertElementToMarkdown(target);
    showMarkdownModal(md);
    endSelecting();
  };

  // Capture taps/clicks while selecting
  document.addEventListener('click', (e) => {
    if (!selecting) return;
    // Don’t allow clicks on our own UI
    const path = e.composedPath ? e.composedPath() : [];
    if (path.includes(fab) || path.some((n) => n && n.classList && (n.classList.contains('h2m-overlay') || n.classList.contains('h2m-modal')))) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    tryExport(e.target);
  }, true);

  // Optional keyboard shortcut: Ctrl+M toggles selection (desktop)
  document.addEventListener('keydown', (e) => {
    const key = (e.key || '').toLowerCase();
    if (e.ctrlKey && !e.altKey && !e.shiftKey && key === 'm') {
      e.preventDefault();
      toggleSelecting();
    }
  }, true);

})();