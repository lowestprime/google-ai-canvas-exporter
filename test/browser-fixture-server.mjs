import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const userscript = readFileSync(resolve(root, 'userscript/Google_AI_Canvas_Exporter.user.js'), 'utf8');
const conversation = readFileSync(resolve(root, 'test/fixtures/conversation-formatting.html'), 'utf8');
const formalClassification = readFileSync(resolve(
    root,
    'dev_artifacts/Single_File_Export_Formal_Classification_of_Fine_Hardwood_Furniture_Google_Search_07042026_114124_AM-PST.html'
), 'utf8');
const port = Number(process.env.PORT || 4173);

function injectUserscript(html, { archivedPage = false } = {}) {
    const inertHTML = archivedPage
        ? html.replace(/<script(?=[\s>])/gi, '<script type="application/x-gce-archive"')
        : html;
    const injection = archivedPage
        ? `<script>document.querySelectorAll(".gce-fab,#gce-overlay,#gce-styles,.gce-toast").forEach(node=>node.remove())</script><script>${userscript}</script>`
        : '<script src="/userscript.js"></script>';
    const bodyEnd = inertHTML.toLowerCase().lastIndexOf('</body>');
    return bodyEnd < 0
        ? `${inertHTML}${injection}`
        : `${inertHTML.slice(0, bodyEnd)}${injection}${inertHTML.slice(bodyEnd)}`;
}

createServer((request, response) => {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    if (url.pathname === '/userscript.js') {
        response.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
        response.end(userscript);
        return;
    }

    const isThread = url.pathname === '/search' && url.searchParams.get('udm') === '50'
        && !!url.searchParams.get('q');
    const isFormalClassification = isThread && (
        url.searchParams.get('fixture') === 'formal'
        || /formal classification/i.test(url.searchParams.get('q'))
    );
    let html = isThread
        ? (isFormalClassification ? formalClassification : conversation)
        : '<!doctype html><html><head><title>GCE Browser Gate</title></head><body><main>Browser gate fixture</main></body></html>';
    html = injectUserscript(html, { archivedPage: isFormalClassification });
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(html);
}).listen(port, '127.0.0.1', () => {
    console.log(`GCE fixture server http://127.0.0.1:${port}/search`);
});
