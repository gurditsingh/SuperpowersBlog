# Superpowers Blog Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the existing static GitHub Pages site into a polished Superpowers-first lifecycle console with desktop left navigation, mobile drawer navigation, responsive layouts, and rewritten content based on the verified 10-stage Superpowers lifecycle.

**Architecture:** Keep the current static HTML/CSS/JS structure and data-driven rendering model. Update `assets/data/site.json`, `assets/data/phases.json`, `assets/data/scenario.json`, and `assets/data/artifacts.json` so Superpowers lifecycle content is the source of truth, then update `assets/app.js` renderers and `assets/styles.css` layout rules to produce the new left-nav console interface. Preserve Node-based contract tests and add focused assertions for lifecycle labels, Superpowers-first language, drawer controls, left navigation, and relative links.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript UMD module, JSON data files, Node.js built-in test runner (`node --test`).

---

## File Structure
- Modify: `assets/data/site.json` - rename navigation labels to verified lifecycle stages and keep the primary links plus lifecycle links in one ordered page list.
- Modify: `assets/data/phases.json` - rewrite stage content around Superpowers skills, artifacts, failure modes, and ingestion-pipeline examples.
- Modify: `assets/data/scenario.json` - reframe Databricks as a sample ingestion-pipeline project, not the site subject.
- Modify: `assets/data/artifacts.json` - reframe artifact sections as Superpowers-produced evidence.
- Modify: `assets/app.js` - render left navigation shell, mobile drawer controls, lifecycle homepage, lifecycle pages, redesigned playground, and reframed artifacts.
- Modify: `assets/styles.css` - implement Superpowers Lifecycle Console visual system, fixed desktop sidebar, mobile drawer, responsive grids, panels, and focus states.
- Modify: `index.html`, `artifacts.html`, `simulation.html`, `phases/*.html` - preserve skip links, `main-content` landmarks, `data-nav-root`, page-specific roots, and script paths while renderer output changes.
- Modify: `tests/nav.test.js` - verify left navigation, mobile drawer controls, relative paths, active links, and landmarks.
- Modify: `tests/content.test.js` - verify lifecycle stage labels, Superpowers-first phase structure, homepage lifecycle content, and artifact reframing.
- Modify: `tests/simulation.test.js` - verify playground copy and output use Superpowers lifecycle language while preserving deterministic behavior.

### Task 1: Replace Phase Framing With Verified Lifecycle Data

**Files:**
- Modify: `assets/data/site.json`
- Modify: `assets/data/phases.json`
- Modify: `tests/content.test.js`
- Modify: `tests/nav.test.js`

- [ ] **Step 1: Write the failing lifecycle data tests**

Add these tests:

```js
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

test('site navigation uses verified Superpowers lifecycle labels', () => {
  const lifecycleLabels = siteData.pages
    .filter((page) => page.path.startsWith('phases/'))
    .map((page) => page.label);

  assert.deepEqual(lifecycleLabels, expectedLifecycle);
});

test('phase data uses Superpowers-first lifecycle structure', () => {
  const phases = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/phases.json'), 'utf8'));

  assert.deepEqual(phases.map((phase) => phase.title), expectedLifecycle);
  for (const phase of phases) {
    assert.ok(phase.skillMapping?.length, `${phase.slug} should map to Superpowers skill(s)`);
    assert.ok(phase.artifactEvidence?.length, `${phase.slug} should describe artifact or evidence`);
    assert.ok(phase.failurePrevented?.length, `${phase.slug} should describe prevented failure`);
    assert.match(JSON.stringify(phase), /Superpowers|spec-driven|coding agents/i);
    assert.match(JSON.stringify(phase.example || {}), /ingestion pipeline/i);
  }
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `node --test tests/content.test.js tests/nav.test.js`

Expected: FAIL because current labels still use `Home`, `Discovery`, `Phase 0 - Fundamentals`, and phase data lacks `skillMapping`, `artifactEvidence`, `failurePrevented`, and `example`.

- [ ] **Step 3: Update navigation and phase data**

Set phase labels in `assets/data/site.json` to:

```json
[
  { "path": "phases/fundamentals.html", "label": "Brainstorm / Design" },
  { "path": "phases/discovery.html", "label": "Specification" },
  { "path": "phases/specification.html", "label": "Workspace Isolation" },
  { "path": "phases/implementation-planning.html", "label": "Implementation Planning" },
  { "path": "phases/workspace-setup.html", "label": "Execution" },
  { "path": "phases/tdd.html", "label": "Test-Driven Development" },
  { "path": "phases/systematic-debugging.html", "label": "Systematic Debugging" },
  { "path": "phases/code-review.html", "label": "Code Review" },
  { "path": "phases/verification.html", "label": "Verification" },
  { "path": "phases/completion.html", "label": "Branch Completion" }
]
```

Rewrite each phase object in `assets/data/phases.json` with this shape:

```json
{
  "slug": "fundamentals",
  "title": "Brainstorm / Design",
  "kicker": "Start with intent, not code",
  "goal": "Use Superpowers brainstorming to clarify the real goal, constraints, alternatives, risks, and success criteria before implementation begins.",
  "skillMapping": ["superpowers:brainstorming"],
  "artifactEvidence": ["Approved design sections", "Captured assumptions", "Success criteria"],
  "failurePrevented": ["The agent starts coding from a vague prompt and builds the wrong thing."],
  "example": {
    "task": "Need to build an ingestion pipeline",
    "superpowersMove": "Ask what data arrives, who consumes it, what freshness matters, and what failure behavior is acceptable before proposing implementation."
  },
  "inputs": ["Initial feature idea", "User goals", "Known constraints"],
  "outputs": ["Approved design", "Spec-ready decisions", "Open questions resolved"],
  "antipatterns": ["Coding before clarifying the outcome"],
  "doneCriteria": ["The user has approved the design direction and scope."]
}
```

Use the same fields for all 10 stages with stage-specific content.

- [ ] **Step 4: Run tests to verify pass**

Run: `node --test tests/content.test.js tests/nav.test.js`

Expected: PASS for lifecycle data tests and existing content/nav tests.

- [ ] **Step 5: Commit**

```bash
git add assets/data/site.json assets/data/phases.json tests/content.test.js tests/nav.test.js
git commit -m "feat: replace phase data with verified superpowers lifecycle"
```

### Task 2: Implement Left Navigation Shell and Mobile Drawer

**Files:**
- Modify: `assets/app.js`
- Modify: `assets/styles.css`
- Modify: `tests/nav.test.js`

- [ ] **Step 1: Write failing navigation shell tests**

Add tests:

```js
test('rendered navigation uses left sidebar and mobile drawer controls', () => {
  const markup = renderNavigation({
    pages: siteData.pages,
    base: '.',
    currentPath: 'index.html',
    pageLabel: 'Superpowers Lifecycle',
  });

  assert.match(markup, /class="app-shell"/);
  assert.match(markup, /class="sidebar-nav"/);
  assert.match(markup, /data-drawer-toggle/);
  assert.match(markup, /aria-controls="site-navigation"/);
  assert.match(markup, /id="site-navigation"/);
});

test('rendered navigation groups primary links and lifecycle links', () => {
  const markup = renderNavigation({
    pages: siteData.pages,
    base: '..',
    currentPath: 'phases/tdd.html',
    pageLabel: 'Test-Driven Development',
  });

  assert.match(markup, /Primary/);
  assert.match(markup, /Lifecycle/);
  assert.match(markup, /Test-Driven Development/);
  assert.equal(markup.match(/aria-current="page"/g)?.length, 1);
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `node --test tests/nav.test.js`

Expected: FAIL because current navigation renders `.site-shell` and `.site-nav`, not the app shell/sidebar/drawer controls.

- [ ] **Step 3: Implement navigation markup and drawer behavior**

Update `renderNavigation(options)` to return this structure:

```js
return (
  '<div class="app-shell" data-app-shell>' +
  '<button class="drawer-toggle" type="button" data-drawer-toggle aria-controls="site-navigation" aria-expanded="false">Menu</button>' +
  '<div class="drawer-backdrop" data-drawer-backdrop hidden></div>' +
  '<aside class="sidebar" id="site-navigation" data-sidebar>' +
  '<a class="brand-mark" href="' + escapeHtml(resolveHomeHref) + '">SuperpowersBlog</a>' +
  '<nav class="sidebar-nav" aria-label="Primary">' + primaryMarkup + '</nav>' +
  '<nav class="sidebar-nav sidebar-nav--lifecycle" aria-label="Lifecycle">' + lifecycleMarkup + '</nav>' +
  '</aside>' +
  '</div>'
);
```

Add a `bootstrapDrawer()` function that:

```js
function bootstrapDrawer() {
  var toggle = document.querySelector('[data-drawer-toggle]');
  var shell = document.querySelector('[data-app-shell]');
  var backdrop = document.querySelector('[data-drawer-backdrop]');
  if (!toggle || !shell || !backdrop) return;

  function setOpen(isOpen) {
    shell.setAttribute('data-drawer-open', String(isOpen));
    toggle.setAttribute('aria-expanded', String(isOpen));
    backdrop.hidden = !isOpen;
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  backdrop.addEventListener('click', function () {
    setOpen(false);
  });
}
```

Call `bootstrapDrawer()` after rendering nav.

- [ ] **Step 4: Add left-nav and drawer CSS**

Implement:

```css
.app-shell { min-height: 100vh; }
.sidebar { position: fixed; inset: 0 auto 0 0; width: 18rem; overflow-y: auto; }
.site-shell { margin-left: 18rem; max-width: none; width: auto; }
.drawer-toggle { display: none; }
@media (max-width: 860px) {
  .drawer-toggle { display: inline-flex; position: sticky; top: 0; z-index: 30; }
  .sidebar { transform: translateX(-100%); transition: transform 160ms ease; z-index: 40; }
  .app-shell[data-drawer-open="true"] .sidebar { transform: translateX(0); }
  .site-shell { margin-left: 0; }
  .drawer-backdrop:not([hidden]) { position: fixed; inset: 0; z-index: 35; }
}
```

Use final polished colors and spacing from the redesign spec rather than copying these minimal declarations exactly.

- [ ] **Step 5: Run tests to verify pass**

Run: `node --test tests/nav.test.js tests/content.test.js tests/simulation.test.js`

Expected: PASS all suites.

- [ ] **Step 6: Commit**

```bash
git add assets/app.js assets/styles.css tests/nav.test.js
git commit -m "feat: add left navigation shell and mobile drawer"
```

### Task 3: Redesign Visual System and Responsive Layout

**Files:**
- Modify: `assets/styles.css`
- Modify: `tests/nav.test.js`

- [ ] **Step 1: Write failing CSS contract tests**

Add tests that read `assets/styles.css`:

```js
test('visual system defines lifecycle console layout tokens and responsive drawer rules', () => {
  const css = fs.readFileSync(path.join(ROOT, 'assets/styles.css'), 'utf8');

  assert.match(css, /--accent-teal/);
  assert.match(css, /--accent-orange/);
  assert.match(css, /\.sidebar\b/);
  assert.match(css, /\.drawer-toggle\b/);
  assert.match(css, /@media\s*\(max-width:\s*860px\)/);
  assert.match(css, /overflow-x:\s*hidden/);
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test tests/nav.test.js`

Expected: FAIL until the CSS tokens and drawer responsive rules exist.

- [ ] **Step 3: Implement polished console visual system**

Replace the basic visual system with:

```css
:root {
  --bg: #f5f7fb;
  --surface: #ffffff;
  --surface-strong: #eef3f8;
  --ink: #101826;
  --muted: #607086;
  --border: #d7e0ea;
  --accent-teal: #087f7a;
  --accent-orange: #d76f21;
  --focus: #0b63ce;
}

body {
  overflow-x: hidden;
  background:
    linear-gradient(180deg, #f9fbff 0%, var(--bg) 42%, #edf3f8 100%);
  color: var(--ink);
}
```

Add styles for:

- `.sidebar`, `.brand-mark`, `.nav-group-title`, `.sidebar-nav`
- `.lifecycle-card`, `.phase-section`, `.console-panel`, `.hero-panel`
- `.simulation-stepper`, `.simulation-active-phase`, `.artifact-section`
- responsive single-column grids
- focus states for links/buttons

Keep cards at `6px-8px` border radius.

- [ ] **Step 4: Run tests to verify pass**

Run: `node --test tests/nav.test.js tests/content.test.js tests/simulation.test.js`

Expected: PASS all suites.

- [ ] **Step 5: Commit**

```bash
git add assets/styles.css tests/nav.test.js
git commit -m "style: apply superpowers lifecycle console visual system"
```

### Task 4: Rewrite Homepage Around Superpowers Lifecycle

**Files:**
- Modify: `index.html`
- Modify: `assets/app.js`
- Modify: `tests/content.test.js`

- [ ] **Step 1: Write failing homepage content tests**

Add tests:

```js
test('homepage is Superpowers-first and includes lifecycle feedback loops', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  assert.match(html, /Superpowers spec-driven development/i);
  assert.match(html, /Brainstorm \/ Design/i);
  assert.match(html, /Branch Completion/i);
  assert.match(html, /feedback loop/i);
  assert.match(html, /View Full Sample Spec Package/i);
  assert.doesNotMatch(html, /Databricks end-to-end data platform delivery/i);
});
```

If homepage content remains mostly rendered by `assets/app.js`, import the relevant renderer and test its markup instead of only static HTML.

- [ ] **Step 2: Run test to verify failure**

Run: `node --test tests/content.test.js`

Expected: FAIL because homepage content still uses older static copy or does not include lifecycle feedback loop language.

- [ ] **Step 3: Implement homepage redesign**

Update `index.html` or a `renderHomePage()` helper to include:

```html
<section class="hero-panel">
  <p class="eyebrow">Superpowers lifecycle console</p>
  <h1>Superpowers spec-driven development for coding agents</h1>
  <p>Move agents from prompt-and-hope coding to a governed lifecycle of design, specification, planning, TDD, review, and evidence.</p>
  <a class="button button-primary" href="./artifacts.html">View Full Sample Spec Package</a>
  <a class="button button-secondary" href="./simulation.html">Open Lifecycle Playground</a>
</section>
```

Add lifecycle map cards for all 10 stages and explicit feedback-loop text:

```html
<p>Feedback loops route Systematic Debugging, Code Review, and Verification findings back into Specification or Implementation Planning when evidence changes the design.</p>
```

- [ ] **Step 4: Run tests to verify pass**

Run: `node --test tests/content.test.js tests/nav.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/app.js tests/content.test.js
git commit -m "feat: rewrite homepage around superpowers lifecycle"
```

### Task 5: Redesign Lifecycle Page Renderer

**Files:**
- Modify: `assets/app.js`
- Modify: `assets/styles.css`
- Modify: `tests/content.test.js`

- [ ] **Step 1: Write failing renderer tests**

Add:

```js
test('renderPhasePage emits lifecycle stage structure', () => {
  const markup = renderPhasePage({
    slug: 'verification',
    title: 'Verification',
    kicker: 'Evidence before claims',
    goal: 'Require fresh evidence before saying work is complete.',
    skillMapping: ['superpowers:verification-before-completion'],
    artifactEvidence: ['Fresh test output'],
    failurePrevented: ['The agent claims success from stale assumptions.'],
    example: {
      task: 'Need to build an ingestion pipeline',
      superpowersMove: 'Run the verification command and read the output before reporting completion.'
    },
    inputs: ['Acceptance criteria'],
    outputs: ['Verification report'],
    antipatterns: ['Saying should pass'],
    doneCriteria: ['Current test output is captured.']
  });

  assert.match(markup, /Superpowers skill/);
  assert.match(markup, /Artifact \/ evidence/);
  assert.match(markup, /Failure prevented/);
  assert.match(markup, /Need to build an ingestion pipeline/);
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test tests/content.test.js`

Expected: FAIL because current renderer only emits Inputs, Outputs, Antipatterns, and Done Criteria.

- [ ] **Step 3: Update `renderPhasePage()`**

Render lifecycle pages with sections:

```js
'<section class="phase-section phase-section--skill"><h2>Superpowers skill</h2>' + renderList(phase.skillMapping || []) + '</section>' +
'<section class="phase-section phase-section--evidence"><h2>Artifact / evidence</h2>' + renderList(phase.artifactEvidence || []) + '</section>' +
'<section class="phase-section phase-section--failure"><h2>Failure prevented</h2>' + renderList(phase.failurePrevented || []) + '</section>' +
'<section class="phase-section phase-section--example"><h2>Example: ingestion pipeline</h2><p><strong>' + escapeHtml(phase.example.task) + '</strong></p><p>' + escapeHtml(phase.example.superpowersMove) + '</p></section>'
```

Keep existing inputs/outputs/done criteria where useful, but make the new lifecycle sections prominent.

- [ ] **Step 4: Run tests**

Run: `node --test tests/content.test.js tests/nav.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add assets/app.js assets/styles.css tests/content.test.js
git commit -m "feat: redesign lifecycle stage pages"
```

### Task 6: Reframe Playground and Artifacts Around Superpowers Outputs

**Files:**
- Modify: `assets/data/scenario.json`
- Modify: `assets/data/artifacts.json`
- Modify: `assets/app.js`
- Modify: `tests/content.test.js`
- Modify: `tests/simulation.test.js`

- [ ] **Step 1: Write failing Superpowers-first tests**

Add tests:

```js
test('scenario frames Databricks as a sample project, not the site subject', () => {
  const scenario = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/scenario.json'), 'utf8'));
  assert.match(scenario.summary, /sample project/i);
  assert.match(scenario.summary, /Superpowers/i);
  assert.doesNotMatch(scenario.summary, /end-to-end Databricks platform/i);
});

test('simulation output is framed as Superpowers lifecycle evidence', () => {
  const result = evaluateScenario({ mode: 'micro-batch', governance: 'strict', quality: 'high', tradeoff: 'latency' });
  const text = JSON.stringify(result);

  assert.match(text, /Superpowers/i);
  assert.match(text, /spec-driven/i);
  assert.match(text, /ingestion pipeline/i);
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `node --test tests/content.test.js tests/simulation.test.js`

Expected: FAIL until scenario/artifacts/simulation copy is reframed.

- [ ] **Step 3: Rewrite scenario and artifact copy**

Update `assets/data/scenario.json`:

```json
{
  "title": "Sample Project: Ingestion Pipeline",
  "summary": "A Databricks ingestion pipeline is used as a sample project to show how Superpowers turns a vague coding-agent request into governed spec-driven delivery.",
  "businessGoal": "Demonstrate Superpowers artifacts and quality gates using a concrete data engineering example."
}
```

Keep Databricks components, but ensure their role descriptions explain the Superpowers concept they illustrate.

Update `assets/data/artifacts.json` so each section title or summary connects to lifecycle stages:

```json
{
  "title": "Superpowers Sample Spec Package",
  "summary": "A compact evidence package produced by the Superpowers lifecycle for the ingestion pipeline example."
}
```

Update `evaluateScenario()` generated views so the language is "Superpowers output" first and Databricks example second.

- [ ] **Step 4: Update artifact renderer labels**

Change artifacts kicker from:

```js
'<p class="phase-kicker">Databricks sample scenario</p>'
```

to:

```js
'<p class="phase-kicker">Superpowers sample package</p>'
```

- [ ] **Step 5: Run tests**

Run: `node --test tests/content.test.js tests/simulation.test.js tests/nav.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add assets/data/scenario.json assets/data/artifacts.json assets/app.js tests/content.test.js tests/simulation.test.js
git commit -m "feat: reframe playground and artifacts around superpowers"
```

### Task 7: Final Responsive and GitHub Pages Verification

**Files:**
- Modify: `tests/nav.test.js`
- Modify: `README.md`
- Modify: `assets/styles.css` if verification exposes CSS contract gaps

- [ ] **Step 1: Add final responsive/readiness tests**

Add:

```js
test('css includes mobile drawer and desktop left navigation breakpoints', () => {
  const css = fs.readFileSync(path.join(ROOT, 'assets/styles.css'), 'utf8');

  assert.match(css, /\.sidebar\s*\{/);
  assert.match(css, /position:\s*fixed/);
  assert.match(css, /\.drawer-backdrop/);
  assert.match(css, /max-width:\s*860px/);
  assert.match(css, /grid-template-columns:\s*1fr/);
});
```

- [ ] **Step 2: Run final tests**

Run:

```bash
node --test tests/nav.test.js tests/content.test.js tests/simulation.test.js
node --check assets/app.js
git diff --check
```

Expected:

- `node --test`: all tests pass
- `node --check`: no output, exit 0
- `git diff --check`: no whitespace errors

- [ ] **Step 3: Update README local preview guidance**

Add the local preview section after Local Verification:

```md
## Local Preview

Run:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/index.html`.
```

- [ ] **Step 4: Commit**

```bash
git add README.md assets/styles.css tests/nav.test.js
git commit -m "chore: verify responsive github pages redesign"
```
