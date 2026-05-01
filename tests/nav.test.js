const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const requiredPages = [
  'index.html',
  'artifacts.html',
  'simulation.html',
  'phases/fundamentals.html',
  'phases/discovery.html',
  'phases/specification.html',
  'phases/implementation-planning.html',
  'phases/workspace-setup.html',
  'phases/tdd.html',
  'phases/systematic-debugging.html',
  'phases/code-review.html',
  'phases/verification.html',
  'phases/completion.html',
];

for (const page of requiredPages) {
  test(`${page} exists and includes nav root and app script`, () => {
    const fullPath = path.join(ROOT, page);
    assert.equal(fs.existsSync(fullPath), true, `${page} should exist`);

    const content = fs.readFileSync(fullPath, 'utf8');
    assert.match(content, /data-nav-root/, `${page} should include data-nav-root`);
    assert.match(content, /<script[^>]*src=["'][^"']*assets\/app\.js["'][^>]*>/, `${page} should include assets/app.js script reference`);
  });
}
