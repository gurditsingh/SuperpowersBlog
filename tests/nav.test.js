const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const siteData = require('../assets/data/site.json');
const { buildNavigationLinks, currentPathFromLocation, renderNavigation } = require('../assets/app.js');

function collectHtmlPages(dir = ROOT) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return collectHtmlPages(fullPath);
      }
      return entry.isFile() && entry.name.endsWith('.html') ? [path.relative(ROOT, fullPath)] : [];
    })
    .sort();
}

const requiredPages = [
  { path: 'index.html', scriptSrc: 'assets/app.js' },
  { path: 'artifacts.html', scriptSrc: 'assets/app.js' },
  { path: 'simulation.html', scriptSrc: 'assets/app.js' },
  { path: 'phases/fundamentals.html', scriptSrc: '../assets/app.js' },
  { path: 'phases/discovery.html', scriptSrc: '../assets/app.js' },
  { path: 'phases/specification.html', scriptSrc: '../assets/app.js' },
  { path: 'phases/implementation-planning.html', scriptSrc: '../assets/app.js' },
  { path: 'phases/workspace-setup.html', scriptSrc: '../assets/app.js' },
  { path: 'phases/tdd.html', scriptSrc: '../assets/app.js' },
  { path: 'phases/systematic-debugging.html', scriptSrc: '../assets/app.js' },
  { path: 'phases/code-review.html', scriptSrc: '../assets/app.js' },
  { path: 'phases/verification.html', scriptSrc: '../assets/app.js' },
  { path: 'phases/completion.html', scriptSrc: '../assets/app.js' },
];

test('assets/app.js exists', () => {
  const appJsPath = path.join(ROOT, 'assets/app.js');
  assert.equal(fs.existsSync(appJsPath), true, 'assets/app.js should exist');
});

test('index navigation includes required links', () => {
  const indexPath = path.join(ROOT, 'index.html');
  const content = fs.readFileSync(indexPath, 'utf8');

  assert.match(content, /href=["']\.\/phases\/discovery\.html["']/);
  assert.match(content, /href=["']\.\/simulation\.html["']/);
  assert.match(content, /href=["']\.\/artifacts\.html["']/);
});

test('html pages do not use absolute root paths for links or assets', () => {
  const pages = collectHtmlPages();
  assert.ok(pages.length > 0, 'expected at least one HTML page to validate');

  for (const page of pages) {
    const content = fs.readFileSync(path.join(ROOT, page), 'utf8');

    assert.doesNotMatch(content, /\bhref\s*=\s*["']\//i, `${page} should not use root-relative href attributes`);
    assert.doesNotMatch(content, /\bsrc\s*=\s*["']\//i, `${page} should not use root-relative src attributes`);
  }
});

test('generated root navigation includes every site page with root-relative hrefs', () => {
  const links = buildNavigationLinks(siteData.pages, '.', 'simulation.html');

  assert.deepEqual(
    links.map(({ href, label }) => ({ href, label })),
    siteData.pages.map((page) => ({ href: `./${page.path}`, label: page.label })),
  );
  assert.equal(
    links.find((link) => link.href === './simulation.html')?.isCurrent,
    true,
    'current root page should be marked current',
  );
});

test('generated phase navigation uses data-nav-base prefix and marks current phase', () => {
  const links = buildNavigationLinks(siteData.pages, '..', 'phases/tdd.html');

  assert.deepEqual(
    links.map(({ href, label }) => ({ href, label })),
    siteData.pages.map((page) => ({ href: `../${page.path}`, label: page.label })),
  );
  assert.equal(
    links.find((link) => link.href === '../phases/tdd.html')?.isCurrent,
    true,
    'current phase page should be marked current',
  );
});

test('rendered navigation includes aria-current only on the current page', () => {
  const markup = renderNavigation({
    pages: siteData.pages,
    base: '..',
    currentPath: 'phases/discovery.html',
    pageLabel: 'Discovery',
  });

  assert.match(markup, /<a href="\.\.\/index\.html">Home<\/a>/);
  assert.match(markup, /<a href="\.\.\/simulation\.html">Simulation<\/a>/);
  assert.match(markup, /<a href="\.\.\/artifacts\.html">Artifacts<\/a>/);
  assert.match(markup, /<a href="\.\.\/phases\/discovery\.html" aria-current="page">Discovery<\/a>/);
  assert.equal(markup.match(/aria-current="page"/g)?.length, 1);
});

test('github pages project-root directory URL resolves to home', () => {
  assert.equal(currentPathFromLocation('/SuperpowerBlog/', siteData.pages), 'index.html');
});

test('rendered navigation marks home current for github pages project-root URL', () => {
  const currentPath = currentPathFromLocation('/SuperpowerBlog/', siteData.pages);
  const markup = renderNavigation({
    pages: siteData.pages,
    base: '.',
    currentPath,
    pageLabel: 'Superpowers Blog Home',
  });

  assert.equal(markup.match(/aria-current="page"/g)?.length, 1);
  assert.match(markup, /<a href="\.\/index\.html" aria-current="page">Home<\/a>/);
});

for (const page of requiredPages) {
  test(`${page.path} exposes skip link and main-content landmark`, () => {
    const content = fs.readFileSync(path.join(ROOT, page.path), 'utf8');

    assert.match(content, /href=["']#main-content["']/, `${page.path} should include a skip link to main content`);
    assert.match(content, /<main\b[^>]*\bid=["']main-content["']/, `${page.path} should expose main id="main-content"`);
  });
}

for (const page of requiredPages) {
  test(`${page.path} exists and includes nav root and exact app script`, () => {
    const fullPath = path.join(ROOT, page.path);
    assert.equal(fs.existsSync(fullPath), true, `${page.path} should exist`);

    const content = fs.readFileSync(fullPath, 'utf8');
    assert.match(content, /data-nav-root/, `${page.path} should include data-nav-root`);
    assert.match(
      content,
      new RegExp(`<script\\s+src=["']${page.scriptSrc}["']><\\/script>`),
      `${page.path} should include exact script src="${page.scriptSrc}"`,
    );
  });
}
