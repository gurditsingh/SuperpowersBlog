# Superpowers Spec-Driven Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully static, multi-page GitHub Pages site that persuades engineers to adopt Superpowers through a Databricks end-to-end scenario and deterministic interactive simulation.

**Architecture:** Plain HTML pages render shared JSON-driven content through a single client-side JS module and shared CSS. Phase pages, artifacts, and simulation pull from centralized data files to keep terminology and examples consistent. Validation scripts run locally to verify navigation, accessibility baseline, and deterministic simulation behavior.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES modules), JSON data files, Node.js built-in test runner (`node --test`).

---

## File Structure
- Create: `index.html` - landing page with phase overview and primary CTA.
- Create: `artifacts.html` - sample spec package viewer.
- Create: `simulation.html` - deterministic interactive playground.
- Create: `phases/fundamentals.html` ... `phases/completion.html` - 10 phase detail pages.
- Create: `assets/styles.css` - shared visual system and responsive layout.
- Create: `assets/app.js` - shared rendering logic, simulation engine, navigation handling.
- Create: `assets/data/site.json` - phase summaries, CTA copy, glossary text.
- Create: `assets/data/scenario.json` - Databricks scenario definitions and branch outcomes.
- Create: `assets/data/artifacts.json` - sample spec package content.
- Create: `tests/nav.test.js` - relative-link and page-structure checks.
- Create: `tests/simulation.test.js` - deterministic simulation outcome checks.
- Create: `tests/content.test.js` - validates Databricks component coverage on all pages.

### Task 1: Scaffold Site and Shared Data Contracts

**Files:**
- Create: `index.html`
- Create: `artifacts.html`
- Create: `simulation.html`
- Create: `phases/*.html`
- Create: `assets/data/site.json`

- [ ] **Step 1: Write the failing test**

```js
// tests/nav.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('all required html pages exist and include shared nav mount', () => {
  const pages = [
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
    'phases/completion.html'
  ];
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    assert.match(html, /data-nav-root/);
    assert.match(html, /assets\/app\.js/);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/nav.test.js`
Expected: FAIL with ENOENT (pages missing)

- [ ] **Step 3: Write minimal implementation**

```html
<!-- Example skeleton for each page -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Superpowers Spec-Driven Development</title>
    <link rel="stylesheet" href="./assets/styles.css" />
  </head>
  <body>
    <header data-nav-root></header>
    <main data-page-root></main>
    <script type="module" src="./assets/app.js"></script>
  </body>
</html>
```

```json
{
  "siteTitle": "Superpowers Spec-Driven Development",
  "primaryCta": "View Full Sample Spec Package",
  "databricksComponents": [
    "Data Lakehouse",
    "Databricks SQL",
    "Delta Lake",
    "Unity Catalog",
    "Lakebase"
  ]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/nav.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add index.html artifacts.html simulation.html phases assets/data/site.json tests/nav.test.js
git commit -m "feat: scaffold static superpowers site structure"
```

### Task 2: Build Shared Visual System and Navigation

**Files:**
- Create: `assets/styles.css`
- Modify: `assets/app.js`
- Modify: all HTML pages to ensure correct relative paths
- Test: `tests/nav.test.js`

- [ ] **Step 1: Write the failing test**

```js
test('navigation links are relative and point to expected pages', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /href="\.\/phases\/discovery\.html"/);
  assert.match(html, /href="\.\/simulation\.html"/);
  assert.match(html, /href="\.\/artifacts\.html"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/nav.test.js`
Expected: FAIL link assertions

- [ ] **Step 3: Write minimal implementation**

```js
// assets/app.js
export function renderNav(rootPath = '.') {
  return `
    <nav class="top-nav">
      <a href="${rootPath}/index.html">Overview</a>
      <a href="${rootPath}/phases/discovery.html">Phases</a>
      <a href="${rootPath}/simulation.html">Playground</a>
      <a href="${rootPath}/artifacts.html">Sample Spec Package</a>
    </nav>
  `;
}
```

```css
:root {
  --bg: #f6f4ee;
  --fg: #162027;
  --accent: #0b6e4f;
  --card: #ffffff;
}
body { margin: 0; font-family: "Source Sans 3", "Segoe UI", sans-serif; background: radial-gradient(circle at 10% 10%, #fff8e8 0, var(--bg) 45%); color: var(--fg); }
.top-nav { display: flex; gap: 1rem; padding: 1rem 1.5rem; position: sticky; top: 0; background: #ffffffd9; backdrop-filter: blur(6px); }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/nav.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add assets/styles.css assets/app.js index.html artifacts.html simulation.html phases tests/nav.test.js
git commit -m "feat: add shared navigation and visual system"
```

### Task 3: Implement Phase Content Pages (Fundamentals + Phases 1-9)

**Files:**
- Create: `assets/data/phases.json`
- Modify: `assets/app.js`
- Modify: `phases/*.html`
- Test: `tests/content.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/content.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('phase data includes required sections for each phase', () => {
  const phases = JSON.parse(readFileSync('assets/data/phases.json', 'utf8'));
  for (const phase of phases) {
    assert.ok(phase.goal);
    assert.ok(phase.inputs?.length);
    assert.ok(phase.outputs?.length);
    assert.ok(phase.antipatterns?.length);
    assert.ok(phase.doneCriteria?.length);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/content.test.js`
Expected: FAIL missing phases data

- [ ] **Step 3: Write minimal implementation**

```json
[
  {
    "slug": "discovery",
    "title": "Phase 1 — Discovery",
    "goal": "Clarify business and platform constraints before writing solutions.",
    "inputs": ["Stakeholder goals", "SLA targets", "Governance constraints"],
    "outputs": ["Risk register", "Success criteria", "Assumption log"],
    "antipatterns": ["Skipping risk analysis"],
    "doneCriteria": ["Goals and constraints are measurable and approved"]
  }
]
```

```js
export function renderPhasePage(phase) {
  return `<section><h1>${phase.title}</h1><p>${phase.goal}</p></section>`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/content.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add assets/data/phases.json assets/app.js phases tests/content.test.js
git commit -m "feat: add phase pages with structured superpowers content"
```

### Task 4: Implement Databricks Scenario and Artifacts Viewer

**Files:**
- Create: `assets/data/scenario.json`
- Create: `assets/data/artifacts.json`
- Modify: `artifacts.html`
- Modify: `assets/app.js`
- Test: `tests/content.test.js`

- [ ] **Step 1: Write the failing test**

```js
test('artifacts and scenario include all required Databricks components', () => {
  const scenario = JSON.parse(readFileSync('assets/data/scenario.json', 'utf8'));
  const artifacts = JSON.parse(readFileSync('assets/data/artifacts.json', 'utf8'));
  for (const name of ['Data Lakehouse', 'Databricks SQL', 'Delta Lake', 'Unity Catalog', 'Lakebase']) {
    assert.match(JSON.stringify(scenario), new RegExp(name));
    assert.match(JSON.stringify(artifacts), new RegExp(name));
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/content.test.js`
Expected: FAIL missing scenario/artifact data

- [ ] **Step 3: Write minimal implementation**

```json
{
  "program": "Retail receipts to analytics on Databricks",
  "components": {
    "Data Lakehouse": "Bronze/Silver/Gold architecture",
    "Delta Lake": "Contracts, schema evolution, quality guards",
    "Unity Catalog": "Domains, access policies, lineage",
    "Databricks SQL": "Analytics dashboards and semantic models",
    "Lakebase": "Operational serving endpoints"
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/content.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add assets/data/scenario.json assets/data/artifacts.json artifacts.html assets/app.js tests/content.test.js
git commit -m "feat: add databricks scenario and sample spec package viewer"
```

### Task 5: Build Deterministic Simulation Playground

**Files:**
- Modify: `simulation.html`
- Modify: `assets/app.js`
- Modify: `assets/data/scenario.json`
- Test: `tests/simulation.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/simulation.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateScenario } from '../assets/app.js';

test('simulation returns deterministic output for fixed input', () => {
  const input = {
    mode: 'micro-batch',
    governance: 'strict',
    quality: 'high',
    tradeoff: 'latency'
  };
  const resultA = evaluateScenario(input);
  const resultB = evaluateScenario(input);
  assert.deepEqual(resultA, resultB);
  assert.equal(resultA.verification.status, 'PASS_WITH_WARNINGS');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/simulation.test.js`
Expected: FAIL `evaluateScenario` missing

- [ ] **Step 3: Write minimal implementation**

```js
export function evaluateScenario(input) {
  const strict = input.governance === 'strict';
  const highQuality = input.quality === 'high';
  return {
    discovery: { risk: strict ? 'catalog-policy-delay' : 'scope-creep' },
    plan: { tracks: ['ingestion', 'delta-contracts', 'sql-serving', 'lakebase-serving'] },
    verification: {
      status: strict && highQuality ? 'PASS_WITH_WARNINGS' : 'CONDITIONAL_PASS',
      notes: ['Deterministic simulation output']
    }
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/simulation.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add simulation.html assets/app.js assets/data/scenario.json tests/simulation.test.js
git commit -m "feat: add deterministic superpowers simulation playground"
```

### Task 6: Add Comparison View and Failure-Mode Toggle

**Files:**
- Modify: `simulation.html`
- Modify: `assets/app.js`
- Modify: `assets/styles.css`
- Test: `tests/simulation.test.js`

- [ ] **Step 1: Write the failing test**

```js
test('comparison output includes with/without superpowers metrics', () => {
  const result = evaluateScenario({ mode: 'batch', governance: 'strict', quality: 'high', tradeoff: 'cost' });
  assert.ok(result.comparison);
  assert.ok(result.comparison.withSuperpowers);
  assert.ok(result.comparison.withoutSuperpowers);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/simulation.test.js`
Expected: FAIL `comparison` missing

- [ ] **Step 3: Write minimal implementation**

```js
comparison: {
  withSuperpowers: { reworkHours: 18, slaRisk: 'low', qualityIncidents: 1 },
  withoutSuperpowers: { reworkHours: 73, slaRisk: 'high', qualityIncidents: 6 }
},
skipPhaseImpact: {
  phase: 'Specification',
  effect: 'Delta contract drift reaches Databricks SQL dashboards'
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/simulation.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add simulation.html assets/app.js assets/styles.css tests/simulation.test.js
git commit -m "feat: add superpowers vs non-spec comparison and skip-phase impact"
```

### Task 7: Accessibility and Responsive Hardening

**Files:**
- Modify: `assets/styles.css`
- Modify: `index.html`
- Modify: `simulation.html`
- Modify: `artifacts.html`
- Test: `tests/nav.test.js`

- [ ] **Step 1: Write the failing test**

```js
test('core pages include skip link and semantic landmark structure', () => {
  for (const page of ['index.html', 'simulation.html', 'artifacts.html']) {
    const html = readFileSync(page, 'utf8');
    assert.match(html, /href="#main-content"/);
    assert.match(html, /<main[^>]*id="main-content"/);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/nav.test.js`
Expected: FAIL missing skip link/landmarks

- [ ] **Step 3: Write minimal implementation**

```html
<a class="skip-link" href="#main-content">Skip to content</a>
<main id="main-content" data-page-root></main>
```

```css
@media (max-width: 900px) {
  .phase-grid { grid-template-columns: 1fr; }
  .comparison { grid-template-columns: 1fr; }
}
.skip-link { position: absolute; left: -999px; }
.skip-link:focus { left: 1rem; top: 1rem; background: #fff; padding: 0.5rem; }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/nav.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add index.html simulation.html artifacts.html assets/styles.css tests/nav.test.js
git commit -m "fix: improve accessibility landmarks and responsive layout"
```

### Task 8: Final Verification and GitHub Pages Readiness

**Files:**
- Modify: `README.md`
- Modify: `tests/nav.test.js`
- Modify: `tests/content.test.js`
- Modify: `tests/simulation.test.js`

- [ ] **Step 1: Write the failing test**

```js
test('no absolute root paths are used in links or assets', () => {
  const pages = ['index.html', 'artifacts.html', 'simulation.html'];
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    assert.doesNotMatch(html, /href="\//);
    assert.doesNotMatch(html, /src="\//);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/nav.test.js`
Expected: FAIL if any absolute path remains

- [ ] **Step 3: Write minimal implementation**

```md
## Local verification

Run:
- `node --test tests/nav.test.js`
- `node --test tests/content.test.js`
- `node --test tests/simulation.test.js`

## GitHub Pages publishing
- Push `main` and configure Pages source to branch root.
- Ensure all links are relative (`./` or `../`).
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/nav.test.js && node --test tests/content.test.js && node --test tests/simulation.test.js`
Expected: PASS all suites

- [ ] **Step 5: Commit**

```bash
git add README.md tests/nav.test.js tests/content.test.js tests/simulation.test.js
git commit -m "chore: finalize github pages readiness and verification docs"
```
