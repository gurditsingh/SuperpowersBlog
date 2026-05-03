const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PHASES_PATH = path.join(ROOT, 'assets/data/phases.json');
const siteData = require('../assets/data/site.json');
const { bootstrapPhaseRoot, renderArtifactsPage, renderPhasePage } = require('../assets/app.js');

const expectedLifecycle = [
  'Brainstorm / Design',
  'Specification',
  'Workspace Isolation',
  'Implementation Planning',
  'Execution',
  'Test-Driven Development',
  'Systematic Debugging',
  'Code Review',
  'Verification',
  'Branch Completion',
];

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
    skillMapping: ['Superpowers <skill>'],
    artifactEvidence: ['Artifact & evidence'],
    failurePrevented: ['Failure "prevented"'],
    example: {
      task: 'Need to build an ingestion pipeline',
      superpowersMove: 'Write a spec before coding',
    },
    inputs: ['Input <one>'],
    outputs: ['Output & value'],
    antipatterns: ['Antipattern "quoted"'],
    doneCriteria: ['Done <criteria>'],
  });

  assert.match(markup, />Superpowers skill<\/h2>/);
  assert.match(markup, />Artifact \/ evidence<\/h2>/);
  assert.match(markup, />Failure prevented<\/h2>/);
  assert.match(markup, /Need to build an ingestion pipeline/);
  assert.match(markup, /Superpowers &lt;skill&gt;/);
  assert.match(markup, /Artifact &amp; evidence/);
  assert.match(markup, /Failure &quot;prevented&quot;/);
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
    json: async () => [{ slug: 'discovery', title: 'Specification' }],
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

test('bootstrapPhaseRoot renders visible fallback when fetching phase data rejects', async () => {
  const originalFetch = global.fetch;
  const { doc, root } = createPhaseDocument('discovery');
  global.fetch = async () => {
    throw new Error('network');
  };

  try {
    const result = await bootstrapPhaseRoot(doc);

    assert.equal(result, false);
    assert.equal(root.attributes['data-phase-error'], 'true');
    assert.match(root.innerHTML, /Phase content unavailable/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('bootstrapPhaseRoot renders visible fallback when phase data JSON is invalid', async () => {
  const originalFetch = global.fetch;
  const { doc, root } = createPhaseDocument('discovery');
  global.fetch = async () => ({
    ok: true,
    json: async () => {
      throw new SyntaxError('bad json');
    },
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

const SCENARIO_PATH = path.join(ROOT, 'assets/data/scenario.json');
const ARTIFACTS_PATH = path.join(ROOT, 'assets/data/artifacts.json');
const requiredDatabricksComponents = [
  'Data Lakehouse',
  'Databricks SQL',
  'Delta Lake',
  'Unity Catalog',
  'Lakebase',
];
const requiredArtifactSections = [
  'Brainstorm / Design brief',
  'Formal specification excerpt',
  'Implementation plan excerpt',
  'TDD matrix',
  'Debug log narrative',
  'Review findings and dispositions',
  'Verification checklist and sign-off criteria',
];

function collectText(value) {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(collectText).join(' ');
  }
  if (value && typeof value === 'object') {
    return Object.values(value).map(collectText).join(' ');
  }
  return '';
}

test('phase data uses Superpowers-first lifecycle structure', () => {
  const phases = readJson(PHASES_PATH);

  assert.deepEqual(phases.map((phase) => phase.title), expectedLifecycle);
  for (const phase of phases) {
    for (const field of [
      'slug',
      'title',
      'kicker',
      'goal',
      'skillMapping',
      'artifactEvidence',
      'failurePrevented',
      'example',
      'inputs',
      'outputs',
      'antipatterns',
      'doneCriteria',
    ]) {
      assert.ok(Object.hasOwn(phase, field), `${phase.slug} should include ${field}`);
    }
    assert.ok(phase.skillMapping?.length, `${phase.slug} should map to Superpowers skill(s)`);
    assert.ok(phase.artifactEvidence?.length, `${phase.slug} should describe artifact or evidence`);
    assert.ok(phase.failurePrevented?.length, `${phase.slug} should describe prevented failure`);
    const phaseText = JSON.stringify(phase);
    assert.match(phaseText, /Superpowers/i);
    assert.match(phaseText, /spec-driven/i);
    assert.match(phaseText, /coding-agent|coding agents/i);
    assert.match(JSON.stringify(phase.example || {}), /ingestion pipeline/i);
  }
});

test('Databricks scenario and artifacts data include all required components', () => {
  assert.equal(fs.existsSync(SCENARIO_PATH), true, 'assets/data/scenario.json should exist');
  assert.equal(fs.existsSync(ARTIFACTS_PATH), true, 'assets/data/artifacts.json should exist');

  const scenarioText = collectText(readJson(SCENARIO_PATH));
  const artifacts = readJson(ARTIFACTS_PATH);
  const artifactsText = collectText(artifacts);

  for (const component of requiredDatabricksComponents) {
    assert.match(scenarioText, new RegExp(component), `scenario should mention ${component}`);
    assert.match(artifactsText, new RegExp(component), `artifacts should mention ${component}`);
  }

  assert.deepEqual(
    artifacts.sections.map((section) => section.title),
    requiredArtifactSections,
    'artifacts should include the complete sample spec package section set',
  );
});

test('scenario summary frames Databricks as a Superpowers sample project', () => {
  const scenario = readJson(SCENARIO_PATH);

  assert.match(scenario.summary, /Databricks ingestion pipeline/i);
  assert.match(scenario.summary, /sample project/i);
  assert.match(scenario.summary, /Superpowers/i);
  assert.doesNotMatch(scenario.summary, /end-to-end Databricks platform/i);
});

test('scenario simulation defaults use the verified Superpowers lifecycle', () => {
  const scenario = readJson(SCENARIO_PATH);
  const lifecyclePages = siteData.pages.filter((page) => page.path.startsWith('phases/'));

  assert.deepEqual(
    scenario.simulationDefaults.phases.map((phase) => phase.id),
    lifecyclePages.map((page) => page.id),
  );
  assert.deepEqual(
    scenario.simulationDefaults.phases.map((phase) => phase.label),
    lifecyclePages.map((page) => page.label),
  );
  assert.doesNotMatch(
    scenario.simulationDefaults.phases.map((phase) => `${phase.label} ${phase.focus}`).join(' '),
    /Discovery|Environment and Workspace Setup|\bFundamentals\b/i,
  );
});

test('artifact package is framed as Superpowers lifecycle evidence', () => {
  const artifacts = readJson(ARTIFACTS_PATH);
  const sectionText = collectText(artifacts.sections);

  assert.match(artifacts.title, /Superpowers Sample Spec Package/i);
  assert.match(artifacts.summary, /evidence produced by the Superpowers lifecycle/i);
  assert.match(sectionText, /lifecycle|Brainstorm|Specification|Planning|TDD|Debugging|Review|Verification/i);
});

test('renderArtifactsPage emits the Superpowers sample package and spec sections safely', () => {
  assert.equal(typeof renderArtifactsPage, 'function', 'assets/app.js should export renderArtifactsPage');

  const markup = renderArtifactsPage(
    {
      title: 'Sample Project: Ingestion Pipeline',
      summary: 'A Data Lakehouse path using Delta Lake and Unity Catalog.',
      components: [{ name: 'Lakebase', role: 'Serves operational receipt lookups.' }],
      flow: ['Databricks SQL dashboards publish governed KPIs.'],
    },
    {
      sections: [
        {
          title: 'Brainstorm / Design brief',
          summary: 'Stakeholders align on scope.',
          items: ['Formal specification excerpt <unsafe>'],
        },
      ],
    },
  );

  assert.match(markup, /Superpowers sample package/i);
  assert.match(markup, /Sample Project: Ingestion Pipeline/);
  assert.match(markup, /Data Lakehouse/);
  assert.match(markup, /Databricks SQL/);
  assert.match(markup, /Delta Lake/);
  assert.match(markup, /Unity Catalog/);
  assert.match(markup, /Lakebase/);
  assert.match(markup, /Brainstorm \/ Design brief/);
  assert.match(markup, /Formal specification excerpt &lt;unsafe&gt;/);
  assert.doesNotMatch(markup, /<unsafe>/);
});

test('homepage presents the Superpowers lifecycle landing page', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const homepagePhaseLabels = siteData.pages
    .filter((page) => page.path.startsWith('phases/'))
    .map((page) => page.label);

  assert.match(html, /Superpowers spec-driven development/i);
  assert.match(html, /Superpowers spec-driven development for coding agents/i);
  assert.match(html, /why spec-driven development matters/i);
  assert.match(html, /feedback loop/i);
  assert.match(html, /Systematic Debugging[\s\S]*Code Review[\s\S]*Verification/i);
  assert.match(html, /Specification or Implementation Planning/i);

  for (const label of homepagePhaseLabels) {
    assert.match(html, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `homepage should include ${label}`);
  }

  assert.match(html, /id=["']main-content["']/);
  assert.match(html, /data-nav-root/);
  assert.match(html, /href=["']\.\/artifacts\.html["']/);
  assert.match(html, /View Full Sample Spec Package/);
  assert.match(html, /href=["']\.\/simulation\.html["']/);
  assert.doesNotMatch(html, /Databricks end-to-end data platform delivery/);
});

test('simulation page exposes an accessible live output region', () => {
  const html = fs.readFileSync(path.join(ROOT, 'simulation.html'), 'utf8');

  assert.match(html, /data-simulation-result/);
  assert.match(html, /role=["']region["']/);
  assert.match(html, /aria-live=["']polite["']/);
  assert.match(html, /aria-atomic=["']false["']/);
  assert.match(html, /aria-label=["']Simulation output["']/);
});
