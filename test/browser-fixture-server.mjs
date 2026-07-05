import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const userscript = readFileSync(resolve(root, 'userscript/Google_AI_Canvas_Exporter.user.js'), 'utf8');
const conversation = readFileSync(resolve(root, 'test/fixtures/conversation-formatting.html'), 'utf8');
const port = Number(process.env.PORT || 4173);

createServer((request, response) => {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    if (url.pathname === '/userscript.js') {
        response.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
        response.end(userscript);
        return;
    }

    const isThread = url.pathname === '/search' && url.searchParams.get('udm') === '50'
        && !!url.searchParams.get('q');
    let html = isThread
        ? conversation
        : '<!doctype html><html><head><title>GCE Browser Gate</title></head><body><main>Browser gate fixture</main></body></html>';
    html = html.replace('</body>', '<script src="/userscript.js"></script></body>');
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(html);
}).listen(port, '127.0.0.1', () => {
    console.log(`GCE fixture server http://127.0.0.1:${port}/search`);
});
