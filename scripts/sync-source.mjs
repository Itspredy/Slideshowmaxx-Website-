import { access, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(projectRoot, '..', 'LandingPage');
try {
  await access(join(sourceRoot, 'index.html'));
} catch {
  console.log('Sibling LandingPage source not found; using committed Next.js page files.');
  process.exit(0);
}
const html = await readFile(join(sourceRoot, 'index.html'), 'utf8');
const bodyMatch = html.match(/<body(?:\s[^>]*)?>([\s\S]*?)<\/body>/i);
if (!bodyMatch) throw new Error('The source landing page has no body.');

const sourceScriptTag = '<script src="script.js"></script>';
if (!bodyMatch[1].includes(sourceScriptTag)) {
  throw new Error('The source script tag was not found.');
}
const pageBody = bodyMatch[1].replace(sourceScriptTag, '');
const pageContent = `// Generated from ../LandingPage/index.html. Edit the original page.\nconst pageContent = ${JSON.stringify(pageBody)};\nexport default pageContent;\n`;

const sourceStyles = await readFile(join(sourceRoot, 'styles.css'), 'utf8');
const styles = sourceStyles.replaceAll("url('assets/", "url('/assets/");

await mkdir(join(projectRoot, 'app'), { recursive: true });
await mkdir(join(projectRoot, 'public'), { recursive: true });
await writeFile(join(projectRoot, 'app', 'page-content.js'), pageContent);
await writeFile(join(projectRoot, 'app', 'globals.css'), `${styles}\n.next-page-content{display:contents}\n`);
await cp(join(sourceRoot, 'script.js'), join(projectRoot, 'public', 'script.js'));
await cp(join(sourceRoot, 'assets'), join(projectRoot, 'public', 'assets'), { recursive: true, force: true });

console.log('Synced the original landing page markup, styles, script, and assets.');
