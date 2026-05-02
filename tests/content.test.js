const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PHASES_PATH = path.join(ROOT, 'assets/data/phases.json');

const expectedSlugs = [
  'fundamentals',
  'discovery',
  'specification',
  'implementation-planning',
  'workspace-setup',
  'tdd',
  'systematic-debugging',
  'code-review',
  'verification',
  'completion',
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

test('phase data includes required sections for each phase', () => {
  assert.equal(fs.existsSync(PHASES_PATH), true, 'assets/data/phases.json should exist');

  const phases = readJson(PHASES_PATH);
  assert.equal(Array.isArray(phases), true, 'phases data should be an array');
  assert.deepEqual(
    phases.map((phase) => phase.slug),
    expectedSlugs,
    'phase data should include all phase slugs in site order',
  );

  for (const phase of phases) {
    assert.equal(typeof phase.title, 'string', `${phase.slug} should include title`);
    assert.ok(phase.title.trim(), `${phase.slug} title should not be empty`);
    assert.equal(typeof phase.goal, 'string', `${phase.slug} should include goal`);
    assert.ok(phase.goal.trim(), `${phase.slug} goal should not be empty`);

    for (const section of ['inputs', 'outputs', 'antipatterns', 'doneCriteria']) {
      assert.equal(Array.isArray(phase[section]), true, `${phase.slug} ${section} should be an array`);
      assert.ok(phase[section].length > 0, `${phase.slug} ${section} should not be empty`);
      assert.ok(
        phase[section].every((item) => typeof item === 'string' && item.trim()),
        `${phase.slug} ${section} entries should be non-empty strings`,
      );
    }
  }
});

for (const slug of expectedSlugs) {
  test(`${slug} page exposes phase slug for shared renderer`, () => {
    const pagePath = path.join(ROOT, 'phases', `${slug}.html`);
    const html = fs.readFileSync(pagePath, 'utf8');

    assert.match(html, /data-phase-root/, `${slug} should include a phase content root`);
    assert.match(html, new RegExp(`data-phase-slug=["']${slug}["']`), `${slug} should identify its phase slug`);
  });
}
