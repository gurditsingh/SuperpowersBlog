const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PHASES_PATH = path.join(ROOT, 'assets/data/phases.json');
const { bootstrapPhaseRoot, renderPhasePage } = require('../assets/app.js');

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

function createPhaseDocument(slug = 'discovery') {
  const attributes = {
    'data-phase-slug': slug,
    'data-phase-base': '..',
  };
  const root = {
    innerHTML: '',
    attributes,
    getAttribute(name) {
      return this.attributes[name] || null;
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
  };

  return {
    root,
    doc: {
      querySelector(selector) {
        return selector === '[data-phase-root]' ? root : null;
      },
    },
  };
}

test('renderPhasePage emits required sections and escapes phase content', () => {
  const markup = renderPhasePage({
    slug: 'unsafe-phase',
    title: 'Phase <script>alert("x")</script>',
    kicker: 'Kicker <strong>unsafe</strong>',
    goal: 'Goal uses <img src=x onerror=alert("x")>',
    inputs: ['Input <one>'],
    outputs: ['Output & value'],
    antipatterns: ['Antipattern "quoted"'],
    doneCriteria: ['Done <criteria>'],
  });

  assert.match(markup, />Inputs<\/h2>/);
  assert.match(markup, />Outputs<\/h2>/);
  assert.match(markup, />Antipatterns<\/h2>/);
  assert.match(markup, />Done Criteria<\/h2>/);
  assert.match(markup, /Phase &lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  assert.match(markup, /Goal uses &lt;img src=x onerror=alert\(&quot;x&quot;\)&gt;/);
  assert.match(markup, /Output &amp; value/);
  assert.doesNotMatch(markup, /<script>/);
  assert.doesNotMatch(markup, /<img src=x/);
});

test('bootstrapPhaseRoot renders visible fallback when phase data response is not ok', async () => {
  const originalFetch = global.fetch;
  const { doc, root } = createPhaseDocument('discovery');
  global.fetch = async () => ({ ok: false, status: 404 });

  try {
    const result = await bootstrapPhaseRoot(doc);

    assert.equal(result, false);
    assert.equal(root.attributes['data-phase-error'], 'true');
    assert.match(root.innerHTML, /Phase content unavailable/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('bootstrapPhaseRoot renders visible fallback when phase slug is unknown', async () => {
  const originalFetch = global.fetch;
  const { doc, root } = createPhaseDocument('missing-phase');
  global.fetch = async () => ({
    ok: true,
    json: async () => [{ slug: 'discovery', title: 'Discovery' }],
  });

  try {
    const result = await bootstrapPhaseRoot(doc);

    assert.equal(result, false);
    assert.equal(root.attributes['data-phase-error'], 'true');
    assert.match(root.innerHTML, /Phase content unavailable/);
  } finally {
    global.fetch = originalFetch;
  }
});

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
