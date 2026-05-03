# About Author Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `About` author profile page to the static GitHub Pages site and place it in the Primary navigation section.

**Architecture:** This remains a vanilla static site. Add one root HTML page, one site-data navigation entry, small reusable CSS utilities for profile grids, and regression tests that validate navigation, content, accessibility landmarks, and GitHub Pages-safe paths.

**Tech Stack:** Static HTML, CSS, JavaScript navigation renderer in `assets/app.js`, JSON navigation data, Node built-in test runner.

---

## File Structure

- Create: `about.html`
  - Static root-level About page using the existing shared navigation root and site shell.
  - Contains author profile, capability grid, grouped platform experience, and GitHub CTA.
- Modify: `assets/data/site.json`
  - Add `{ "id": "about", "path": "about.html", "label": "About" }` immediately after Home so it renders in the Primary menu.
- Modify: `assets/styles.css`
  - Add small reusable About-page utilities only if existing `.phase-grid` / `.phase-section` components are not enough.
  - Keep responsive behavior compatible with existing mobile drawer breakpoints.
- Modify: `tests/nav.test.js`
  - Add `about.html` to required page checks.
  - Verify Primary navigation order includes Home, About, Artifacts, Simulation before lifecycle pages.
  - Verify `about.html` receives `aria-current="page"`.
- Modify: `tests/content.test.js`
  - Add About-page content and CTA assertions.
  - Existing landmark and path-safety tests should automatically cover `about.html` once the file exists.

---

### Task 1: Add Failing Tests For About Page Navigation And Content

**Files:**
- Modify: `tests/nav.test.js`
- Modify: `tests/content.test.js`

- [ ] **Step 1: Add `about.html` to required page checks in `tests/nav.test.js`**

Update the `requiredPages` array near the top of `tests/nav.test.js` to include About after Home:

```js
const requiredPages = [
  { path: 'index.html', scriptSrc: 'assets/app.js' },
  { path: 'about.html', scriptSrc: 'assets/app.js' },
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
```

- [ ] **Step 2: Add Primary navigation order test in `tests/nav.test.js`**

Add this test after `site navigation uses verified Superpowers lifecycle labels`:

```js
test('primary navigation includes About after Home', () => {
  assert.deepEqual(
    siteData.pages.slice(0, 4).map((page) => ({ id: page.id, path: page.path, label: page.label })),
    [
      { id: 'home', path: 'index.html', label: 'Home' },
      { id: 'about', path: 'about.html', label: 'About' },
      { id: 'artifacts', path: 'artifacts.html', label: 'Artifacts' },
      { id: 'simulation', path: 'simulation.html', label: 'Simulation' },
    ],
  );
});
```

- [ ] **Step 3: Update rendered navigation test in `tests/nav.test.js`**

In `rendered navigation includes aria-current only on the current page`, add an About assertion:

```js
assert.match(markup, /<a href="\.\.\/about\.html">About<\/a>/);
```

Add a new test after it:

```js
test('rendered navigation marks About current on about page', () => {
  const markup = renderNavigation({
    pages: siteData.pages,
    base: '.',
    currentPath: 'about.html',
    pageLabel: 'About',
  });

  assert.match(markup, /<a href="\.\/about\.html" aria-current="page">About<\/a>/);
  assert.equal(markup.match(/aria-current="page"/g)?.length, 1);
});
```

- [ ] **Step 4: Add About page content test in `tests/content.test.js`**

Add this test near the homepage/simulation page tests:

```js
test('about page presents the author profile and GitHub CTA', () => {
  const html = fs.readFileSync(path.join(ROOT, 'about.html'), 'utf8');

  assert.match(html, /About the Author/i);
  assert.match(html, /Data Architect/i);
  assert.match(html, /Technology Architect/i);
  assert.match(html, /12 years of experience/i);
  assert.match(html, /enterprise data engineering/i);
  assert.match(html, /cloud migration/i);
  assert.match(html, /modern data platform design/i);
  assert.match(html, /Data Architecture &amp; Platform Design/);
  assert.match(html, /Cloud Data Engineering/);
  assert.match(html, /ETL Modernization/);
  assert.match(html, /Big Data &amp; PySpark/);
  assert.match(html, /Databricks &amp; Lakehouse/);
  assert.match(html, /Data Migration/);
  assert.match(html, /Data Quality &amp; Validation/);
  assert.match(html, /Orchestration &amp; Operations/);
  assert.match(html, /Database &amp; SQL Expertise/);
  assert.match(html, /AI Engineering/);
  assert.match(html, /AWS/);
  assert.match(html, /Azure/);
  assert.match(html, /Snowflake/);
  assert.match(html, /Oracle/);
  assert.match(html, /SQL Server/);
  assert.match(html, /Java/);
  assert.match(html, /Scala/);
  assert.match(html, /Python/);
  assert.match(html, /AI agents/);
  assert.match(html, /reusable skills/);
  assert.match(html, /MCP servers/);
  assert.match(html, /semantic layers/);
  assert.match(html, /AI-driven data engineering workflows/);
  assert.match(html, /href="https:\/\/github\.com\/gurditsingh"/);
  assert.match(html, /View GitHub work/i);
  assert.match(html, /id="main-content"/);
  assert.match(html, /data-nav-root/);
  assert.match(html, /data-page-label="About"/);
});
```

- [ ] **Step 5: Run tests and verify they fail for the expected reason**

Run:

```bash
node --test tests/nav.test.js tests/content.test.js
```

Expected: FAIL because `about.html` does not exist and `siteData.pages` does not include About yet.

- [ ] **Step 6: Commit the failing tests**

```bash
git add tests/nav.test.js tests/content.test.js
git commit -m "test: cover about author page"
```

---

### Task 2: Implement About Page, Primary Navigation Entry, And Reusable Styling

**Files:**
- Create: `about.html`
- Modify: `assets/data/site.json`
- Modify: `assets/styles.css`

- [ ] **Step 1: Add About to `assets/data/site.json`**

Update the first entries in `pages` to this order:

```json
{
  "title": "Superpowers Spec-Driven Blog",
  "pages": [
    { "id": "home", "path": "index.html", "label": "Home" },
    { "id": "about", "path": "about.html", "label": "About" },
    { "id": "artifacts", "path": "artifacts.html", "label": "Artifacts" },
    { "id": "simulation", "path": "simulation.html", "label": "Simulation" },
    { "id": "fundamentals", "path": "phases/fundamentals.html", "label": "Brainstorm / Design" },
    { "id": "discovery", "path": "phases/discovery.html", "label": "Specification" },
    { "id": "specification", "path": "phases/specification.html", "label": "Workspace Isolation" },
    { "id": "implementation-planning", "path": "phases/implementation-planning.html", "label": "Implementation Planning" },
    { "id": "workspace-setup", "path": "phases/workspace-setup.html", "label": "Execution" },
    { "id": "tdd", "path": "phases/tdd.html", "label": "Test-Driven Development" },
    { "id": "systematic-debugging", "path": "phases/systematic-debugging.html", "label": "Systematic Debugging" },
    { "id": "code-review", "path": "phases/code-review.html", "label": "Code Review" },
    { "id": "verification", "path": "phases/verification.html", "label": "Verification" },
    { "id": "completion", "path": "phases/completion.html", "label": "Branch Completion" }
  ]
}
```

- [ ] **Step 2: Create `about.html`**

Create the file with this content:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>About the Author</title>
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <header data-nav-root data-nav-base="." data-page-label="About"></header>
  <main id="main-content" class="site-shell about-page">
    <section class="phase-page about-hero">
      <p class="phase-kicker">About the Author</p>
      <h1 class="phase-title">Data architect building practical, future-ready platforms</h1>
      <p class="phase-goal">A Data Architect / Technology Architect with 12 years of experience in enterprise data engineering, cloud migration, and modern data platform design.</p>
      <p>
        <a class="button-link" href="https://github.com/gurditsingh">View GitHub work</a>
        <a href="./index.html">Return to Superpowers lifecycle</a>
      </p>
    </section>

    <section class="phase-section about-profile-card">
      <h2>Architecture Profile</h2>
      <p>Experienced in designing and implementing scalable ETL frameworks, data lakehouse solutions, cloud-native data pipelines, and migration strategies across AWS, Azure, Databricks, Snowflake, Oracle, SQL Server, big data ecosystems, and open table formats.</p>
      <p>The work is centered on reliable, governed, production-ready delivery: clear platform boundaries, reusable engineering patterns, strong validation, operational discipline, and architecture decisions that teams can maintain after launch.</p>
      <p>Current focus includes building future-ready solutions around AI agents, reusable skills, MCP servers, semantic layers, and AI-driven data engineering workflows.</p>
    </section>

    <section class="phase-section">
      <h2>High-Level Experience</h2>
      <div class="about-capability-grid" aria-label="High-level experience areas">
        <span>Data Architecture &amp; Platform Design</span>
        <span>Cloud Data Engineering</span>
        <span>ETL Modernization</span>
        <span>Big Data &amp; PySpark</span>
        <span>Databricks &amp; Lakehouse</span>
        <span>Data Migration</span>
        <span>Data Quality &amp; Validation</span>
        <span>Orchestration &amp; Operations</span>
        <span>Database &amp; SQL Expertise</span>
        <span>AI Engineering</span>
      </div>
    </section>

    <section class="phase-grid about-platform-grid" aria-label="Platform experience groups">
      <article class="phase-section">
        <h2>Cloud &amp; Lakehouse</h2>
        <ul>
          <li>AWS</li>
          <li>Azure</li>
          <li>Databricks</li>
          <li>Snowflake</li>
          <li>Open table formats</li>
        </ul>
      </article>
      <article class="phase-section">
        <h2>Engineering Stack</h2>
        <ul>
          <li>Java</li>
          <li>Scala</li>
          <li>Python</li>
          <li>Big data ecosystems</li>
          <li>Cloud-native data pipelines</li>
        </ul>
      </article>
      <article class="phase-section">
        <h2>Database &amp; Operations</h2>
        <ul>
          <li>Oracle</li>
          <li>SQL Server</li>
          <li>Data quality and validation</li>
          <li>Orchestration and operations</li>
          <li>Migration strategy and execution</li>
        </ul>
      </article>
      <article class="phase-section">
        <h2>AI-Ready Architecture</h2>
        <ul>
          <li>AI agents</li>
          <li>Reusable skills</li>
          <li>MCP servers</li>
          <li>Semantic layers</li>
          <li>AI-driven data engineering workflows</li>
        </ul>
      </article>
    </section>
  </main>
  <script src="assets/app.js"></script>
</body>
</html>
```

- [ ] **Step 3: Add small About-page CSS utilities to `assets/styles.css`**

Add this block after the existing `.phase-grid--secondary .phase-section` rule:

```css
.about-capability-grid {
  display: grid;
  gap: 0.65rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
  margin-top: 1rem;
}

.about-capability-grid span {
  background: rgb(15 127 120 / 8%);
  border: 1px solid rgb(15 127 120 / 22%);
  border-radius: 999px;
  color: var(--ink);
  font-size: 0.86rem;
  font-weight: 850;
  padding: 0.62rem 0.82rem;
}

.about-platform-grid .phase-section {
  border-top: 4px solid var(--accent-teal);
}

.about-profile-card {
  border-top: 4px solid var(--accent-orange);
}
```

- [ ] **Step 4: Run targeted tests and verify the failing tests now pass**

Run:

```bash
node --test tests/nav.test.js tests/content.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit implementation**

```bash
git add about.html assets/data/site.json assets/styles.css
git commit -m "feat: add about author page"
```

---

### Task 3: Final Verification And Branch Status

**Files:**
- Verify only; no planned file edits.

- [ ] **Step 1: Run full static-site tests**

Run:

```bash
node --test tests/nav.test.js tests/content.test.js tests/simulation.test.js
```

Expected: all tests pass.

- [ ] **Step 2: Run JavaScript syntax check**

Run:

```bash
node --check assets/app.js
```

Expected: no output and exit code 0.

- [ ] **Step 3: Run whitespace/path diff check**

Run:

```bash
git diff --check
```

Expected: no output and exit code 0.

- [ ] **Step 4: Confirm working tree and branch status**

Run:

```bash
git status --short --branch
```

Expected: clean working tree on `feature/superpowers-spec-driven-blog-spec`, ahead of origin by the new commits.

- [ ] **Step 5: Commit verification fix only if files changed**

If Task 3 produces no file changes, do not create a commit. If a test or formatting fix was required, first inspect the specific changed files with `git status --short`, then stage only those files. For the expected About-page file set, use:

```bash
git add about.html assets/data/site.json assets/styles.css tests/nav.test.js tests/content.test.js
git commit -m "fix: verify about author page"
```
