import assert from 'node:assert/strict';
import { loadUserscript, readRepoFile } from './load-userscript.mjs';

const fixtures = [
    'dev_artifacts/Fix_Chrome_Beta_Download_Location_Input_Example.html',
    'dev_artifacts/Fix_Chrome_Beta_Download_Location_Single_File_Export.html'
];

for (const fixture of fixtures) {
    const { dom, api } = loadUserscript(readRepoFile(fixture));
    const turns = api.extractConversationTurns();
    assert.equal(turns.length, 5, `${fixture} must expose all five .CKgc1d turns`);
    assert.equal(turns.filter(turn => turn.prompt).length, 5, `${fixture} must expose five prompts`);
    assert.equal(turns.filter(turn => turn.bodyMarkdown).length, 5, `${fixture} must expose five responses`);
    assert.ok(turns.every(turn => turn.references.every(ref => ref.href !== 'https://www.google.com/')),
        `${fixture} must reject internal Google origin records`);

    const markdown = api.buildConversationMarkdown({
        turns,
        title: 'Fix Chrome Beta Download Location',
        frontmatter: false,
        turnDates: true,
        srcURL: 'https://www.google.com/search?udm=50&q=fixture'
    });
    assert.equal((markdown.match(/You said:/g) || []).length, 5, `${fixture} must render five prompts`);
    assert.doesNotMatch(markdown, /Copied|CopyEdit|Show all|faviconV2|encrypted-tbn|data:image/i);
    assert.doesNotMatch(markdown, /\n\s*(?:-|\d+\.)\s*\n/, 'empty list sentinels must not survive');
    assert.doesNotMatch(markdown, /\n{3,}/, 'normalization must cap blank lines');
    dom.window.close();
    console.log(`[PASS] ${fixture}: 5 ordered turns and clean Markdown`);
}

const formalFixture = 'dev_artifacts/Single_File_Export_Formal_Classification_of_Fine_Hardwood_Furniture_Google_Search_07042026_114124_AM-PST.html';
{
    const { dom, api } = loadUserscript(readRepoFile(formalFixture),
        'https://www.google.com/search?udm=50&q=Formal+Classification+of+Fine+Hardwood+Furniture');
    const turns = api.extractConversationTurns();
    const summary = api.summarizeConversation(turns);
    assert.equal(turns.length, 2, 'Formal Classification must expose two ordered mixed-content segments');
    assert.equal(summary.promptCount, 2);
    assert.equal(summary.responseCount, 2);
    assert.equal(summary.canvasCount, 1);
    const markdown = api.buildConversationMarkdown({
        turns,
        title: 'Formal Classification of Fine Hardwood Furniture',
        frontmatter: true,
        turnDates: true
    });
    assert.match(markdown, /turns: 2/);
    assert.match(markdown, /simulate the physics of splayed legs vs straight legs for stability/);
    assert.match(markdown, /The Mechanics of Stability/);
    assert.match(markdown, /> \[Interactive Canvas: Stability Physics: Splay Angle Simulator\]/);
    assert.doesNotMatch(markdown, /Copied|Copy Edit|Share public link|AI-generated, may include mistakes|Privacy Policy|Show all/);
    dom.window.close();
    console.log(`[PASS] ${formalFixture}: 2 prompts, 2 responses, 1 canvas, clean Markdown`);
}

console.log('[PASS] production userscript fixture validation complete');
