const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const siteData = require('../assets/data/site.json');
const {
  bootstrapDrawer,
  buildNavigationLinks,
  currentPathFromLocation,
  renderNavigation,
} = require('../assets/app.js');

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

test('site navigation uses verified Superpowers lifecycle labels', () => {
  const lifecycleLabels = siteData.pages
    .filter((page) => page.path.startsWith('phases/'))
    .map((page) => page.label);

  assert.deepEqual(lifecycleLabels, expectedLifecycle);
});

test('visual system CSS exposes lifecycle console contracts', () => {
  const css = fs.readFileSync(path.join(ROOT, 'assets/styles.css'), 'utf8');

  assert.match(css, /--accent-teal\s*:/);
  assert.match(css, /--accent-orange\s*:\s*#ad521b/i);
  assert.match(css, /\.sidebar\b/);
  assert.match(css, /\.drawer-toggle\b/);
  assert.match(css, /@media\s*\(max-width:\s*860px\)/);
  assert.doesNotMatch(css, /body\s*\{[^}]*overflow-x\s*:\s*hidden/i);
  assert.match(css, /max-width\s*:\s*100%/);
  assert.match(css, /min-width\s*:\s*0/);
  assert.match(css, /grid-template-columns\s*:\s*repeat\(auto-fit,\s*minmax\(min\(100%,/);
  assert.match(css, /@media\s*\(max-width:\s*860px\)\s*\{[\s\S]*\.sidebar\s*\{[^}]*transform\s*:\s*translateX\(-105%\)/);
  assert.match(css, /@media\s*\(max-width:\s*860px\)\s*\{[\s\S]*\.app-shell\[data-drawer-open="true"\]\s+\.sidebar\s*\{[^}]*transform\s*:\s*translateX\(0\)/);
});

test('rendered navigation includes aria-current only on the current page', () => {
  const markup = renderNavigation({
    pages: siteData.pages,
    base: '..',
    currentPath: 'phases/discovery.html',
    pageLabel: 'Specification',
  });

  assert.match(markup, /<a href="\.\.\/index\.html">Home<\/a>/);
  assert.match(markup, /<a href="\.\.\/simulation\.html">Simulation<\/a>/);
  assert.match(markup, /<a href="\.\.\/artifacts\.html">Artifacts<\/a>/);
  assert.match(markup, /<a href="\.\.\/phases\/discovery\.html" aria-current="page">Specification<\/a>/);
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

test('bootstrapDrawer toggles the mobile drawer and closes on backdrop click', () => {
  function createElement(attributes = {}) {
    return {
      attributes,
      hidden: false,
      listeners: {},
      getAttribute(name) {
        return this.attributes[name] || null;
      },
      setAttribute(name, value) {
        this.attributes[name] = String(value);
      },
      removeAttribute(name) {
        delete this.attributes[name];
      },
      addEventListener(name, handler) {
        this.listeners[name] = handler;
      },
    };
  }

  const toggle = createElement({ 'aria-expanded': 'false' });
  const shell = createElement();
  const backdrop = createElement();
  const sidebar = createElement();
  backdrop.hidden = true;
  const documentStub = {
    querySelector(selector) {
      return {
        '[data-drawer-toggle]': toggle,
        '[data-app-shell]': shell,
        '[data-drawer-backdrop]': backdrop,
        '[data-sidebar]': sidebar,
      }[selector];
    },
  };
  const previousWindow = global.window;
  global.window = {
    matchMedia(query) {
      assert.equal(query, '(max-width: 860px)');
      return {
        matches: true,
        addEventListener() {},
      };
    },
  };

  try {
    assert.equal(bootstrapDrawer(documentStub), true);

    assert.equal(sidebar.attributes.inert, '');
    assert.equal(sidebar.getAttribute('aria-hidden'), 'true');

    toggle.listeners.click();
    assert.equal(shell.getAttribute('data-drawer-open'), 'true');
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');
    assert.equal(backdrop.hidden, false);
    assert.equal('inert' in sidebar.attributes, false);
    assert.equal(sidebar.getAttribute('aria-hidden'), 'false');

    backdrop.listeners.click();
    assert.equal(shell.getAttribute('data-drawer-open'), 'false');
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(backdrop.hidden, true);
    assert.equal(sidebar.attributes.inert, '');
    assert.equal(sidebar.getAttribute('aria-hidden'), 'true');
  } finally {
    global.window = previousWindow;
  }
});

test('bootstrapDrawer initializes desktop drawer as closed and interactive', () => {
  function createElement(attributes = {}) {
    return {
      attributes,
      hidden: false,
      listeners: {},
      getAttribute(name) {
        return this.attributes[name] || null;
      },
      setAttribute(name, value) {
        this.attributes[name] = String(value);
      },
      removeAttribute(name) {
        delete this.attributes[name];
      },
      addEventListener(name, handler) {
        this.listeners[name] = handler;
      },
    };
  }

  const toggle = createElement({ 'aria-expanded': 'true' });
  const shell = createElement({ 'data-drawer-open': 'true' });
  const backdrop = createElement();
  const sidebar = createElement({ inert: '', 'aria-hidden': 'true' });
  backdrop.hidden = false;
  const documentStub = {
    querySelector(selector) {
      return {
        '[data-drawer-toggle]': toggle,
        '[data-app-shell]': shell,
        '[data-drawer-backdrop]': backdrop,
        '[data-sidebar]': sidebar,
      }[selector];
    },
  };
  const previousWindow = global.window;
  global.window = {
    matchMedia(query) {
      assert.equal(query, '(max-width: 860px)');
      return {
        matches: false,
        addEventListener() {},
      };
    },
  };

  try {
    assert.equal(bootstrapDrawer(documentStub), true);

    assert.equal(shell.getAttribute('data-drawer-open'), 'false');
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(backdrop.hidden, true);
    assert.equal('inert' in sidebar.attributes, false);
    assert.equal(sidebar.getAttribute('aria-hidden'), 'false');
  } finally {
    global.window = previousWindow;
  }
});

test('bootstrapDrawer closes an open mobile drawer when viewport changes to desktop', () => {
  function createElement(attributes = {}) {
    return {
      attributes,
      hidden: false,
      listeners: {},
      getAttribute(name) {
        return this.attributes[name] || null;
      },
      setAttribute(name, value) {
        this.attributes[name] = String(value);
      },
      removeAttribute(name) {
        delete this.attributes[name];
      },
      addEventListener(name, handler) {
        this.listeners[name] = handler;
      },
    };
  }

  let mediaChangeHandler;
  const mediaQuery = {
    matches: true,
    addEventListener(name, handler) {
      if (name === 'change') {
        mediaChangeHandler = handler;
      }
    },
  };
  const toggle = createElement({ 'aria-expanded': 'false' });
  const shell = createElement();
  const backdrop = createElement();
  const sidebar = createElement();
  backdrop.hidden = true;
  const documentStub = {
    querySelector(selector) {
      return {
        '[data-drawer-toggle]': toggle,
        '[data-app-shell]': shell,
        '[data-drawer-backdrop]': backdrop,
        '[data-sidebar]': sidebar,
      }[selector];
    },
  };
  const previousWindow = global.window;
  global.window = {
    matchMedia(query) {
      assert.equal(query, '(max-width: 860px)');
      return mediaQuery;
    },
  };

  try {
    assert.equal(bootstrapDrawer(documentStub), true);

    toggle.listeners.click();
    assert.equal(shell.getAttribute('data-drawer-open'), 'true');
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');
    assert.equal(backdrop.hidden, false);

    mediaQuery.matches = false;
    mediaChangeHandler();

    assert.equal(shell.getAttribute('data-drawer-open'), 'false');
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(backdrop.hidden, true);
    assert.equal('inert' in sidebar.attributes, false);
    assert.equal(sidebar.getAttribute('aria-hidden'), 'false');
  } finally {
    global.window = previousWindow;
  }
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
