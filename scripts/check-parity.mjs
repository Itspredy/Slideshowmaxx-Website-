import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(projectRoot, '..', 'LandingPage');

function assertSame(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} differs from the original landing page.`);
}

const originalHtml = await readFile(join(sourceRoot, 'index.html'), 'utf8');
const body = originalHtml.match(/<body(?:\s[^>]*)?>([\s\S]*?)<\/body>/i)?.[1];
if (!body) throw new Error('Original page body missing.');
const expectedBody = body.replace('<script src="script.js"></script>', '');
const generatedModule = await readFile(join(projectRoot, 'app', 'page-content.js'), 'utf8');
const encodedBody = generatedModule.match(/^const pageContent = (.+);$/m)?.[1];
if (!encodedBody) throw new Error('Generated page content missing.');
assertSame(JSON.parse(encodedBody), expectedBody, 'Page HTML and visible copy');

const originalCss = await readFile(join(sourceRoot, 'styles.css'), 'utf8');
const expectedCss = `${originalCss.replaceAll("url('assets/", "url('/assets/")}\n.next-page-content{display:contents}\n`;
assertSame(await readFile(join(projectRoot, 'app', 'globals.css'), 'utf8'), expectedCss, 'Stylesheet');
assertSame(await readFile(join(projectRoot, 'public', 'script.js'), 'utf8'), await readFile(join(sourceRoot, 'script.js'), 'utf8'), 'Interaction script');

async function compareAssets(relative = '') {
  const sourceDir = join(sourceRoot, 'assets', relative);
  const targetDir = join(projectRoot, 'public', 'assets', relative);
  const sourceEntries = await readdir(sourceDir, { withFileTypes: true });
  const targetEntries = await readdir(targetDir, { withFileTypes: true });
  assertSame(sourceEntries.map(entry => entry.name).sort().join('\n'), targetEntries.map(entry => entry.name).sort().join('\n'), `Assets in ${relative || 'root'}`);
  let files = 0;
  for (const entry of sourceEntries) {
    const path = join(relative, entry.name);
    if (entry.isDirectory()) {
      files += await compareAssets(path);
    } else {
      const original = await readFile(join(sourceRoot, 'assets', path));
      const copied = await readFile(join(projectRoot, 'public', 'assets', path));
      if (!original.equals(copied)) throw new Error(`Asset differs: ${path}`);
      files += 1;
    }
  }
  return files;
}

const assetCount = await compareAssets();
const references = [...originalHtml.matchAll(/(?:src|href)="(assets\/[^\"]+)"/g)].map(match => match[1]);
for (const reference of references) {
  await readFile(join(projectRoot, 'public', reference));
}
console.log(`Page text, CSS, script, ${assetCount} assets, and ${references.length} HTML asset references match.`);
