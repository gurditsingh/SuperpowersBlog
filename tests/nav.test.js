const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

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
