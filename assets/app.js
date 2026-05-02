(function navigationModule(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }

  root.SuperpowerBlogNav = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function createNavigationModule() {
  function stripLeadingDotSlash(path) {
    return String(path || '').replace(/^\.?\//, '');
  }

  function normalizeBasePrefix(base) {
    if (!base || base === '.') {
      return './';
    }

    return String(base).replace(/\/+$/, '') + '/';
  }

  function normalizeCurrentPath(currentPath) {
    var normalized = stripLeadingDotSlash(currentPath || 'index.html');
    if (normalized === '') {
      return 'index.html';
    }
    return normalized;
  }

  function buildNavigationLinks(pages, base, currentPath) {
    var prefix = normalizeBasePrefix(base);
    var normalizedCurrentPath = normalizeCurrentPath(currentPath);

    return pages.map(function (page) {
      var path = stripLeadingDotSlash(page.path);
      return {
        href: prefix + path,
        label: page.label,
        isCurrent: path === normalizedCurrentPath
      };
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderList(items) {
    return '<ul>' + items.map(function (item) {
      return '<li>' + escapeHtml(item) + '</li>';
    }).join('') + '</ul>';
  }

  function renderPhaseSection(title, items) {
    return (
      '<section class="phase-section">' +
      '<h2>' + escapeHtml(title) + '</h2>' +
      renderList(items) +
      '</section>'
    );
  }

  function renderNavigation(options) {
    var links = buildNavigationLinks(options.pages, options.base, options.currentPath);
    var pageLabel = options.pageLabel || 'Superpowers Blog';
    var navMarkup = links
      .map(function (link) {
        var currentAttr = link.isCurrent ? ' aria-current="page"' : '';
        return '<a href="' + escapeHtml(link.href) + '"' + currentAttr + '>' + escapeHtml(link.label) + '</a>';
      })
      .join('');

    return (
      '<div class="site-shell">' +
      '<nav class="site-nav" aria-label="Primary">' + navMarkup + '</nav>' +
      '<h1 class="page-title">' + escapeHtml(pageLabel) + '</h1>' +
      '<p class="page-subtitle">Spec-driven blog work in progress.</p>' +
      '</div>'
    );
  }

  function renderPhasePage(phase) {
    return (
      '<article class="site-shell phase-page" data-rendered-phase="' + escapeHtml(phase.slug) + '">' +
      '<p class="phase-kicker">' + escapeHtml(phase.kicker || 'Superpowers phase') + '</p>' +
      '<h1 class="phase-title">' + escapeHtml(phase.title) + '</h1>' +
      '<p class="phase-goal">' + escapeHtml(phase.goal) + '</p>' +
      '<div class="phase-grid">' +
      renderPhaseSection('Inputs', phase.inputs || []) +
      renderPhaseSection('Outputs', phase.outputs || []) +
      renderPhaseSection('Antipatterns', phase.antipatterns || []) +
      renderPhaseSection('Done Criteria', phase.doneCriteria || []) +
      '</div>' +
      '</article>'
    );
  }

  function renderScenarioComponents(components) {
    return '<div class="phase-grid">' + (components || []).map(function (component) {
      return (
        '<section class="phase-section">' +
        '<h3>' + escapeHtml(component.name) + '</h3>' +
        '<p>' + escapeHtml(component.role) + '</p>' +
        '</section>'
      );
    }).join('') + '</div>';
  }

  function renderArtifactSection(section) {
    return (
      '<section class="phase-section">' +
      '<h2>' + escapeHtml(section.title) + '</h2>' +
      '<p>' + escapeHtml(section.summary || '') + '</p>' +
      renderList(section.items || []) +
      '</section>'
    );
  }

  function renderArtifactsPage(scenario, artifacts) {
    var flow = scenario.dataFlow || scenario.flow || [];
    return (
      '<article class="site-shell phase-page artifacts-page">' +
      '<p class="phase-kicker">Databricks sample scenario</p>' +
      '<h1 class="phase-title">' + escapeHtml(scenario.title) + '</h1>' +
      '<p class="phase-goal">' + escapeHtml(scenario.summary) + '</p>' +
      '<section class="phase-section">' +
      '<h2>Scenario</h2>' +
      '<p>' + escapeHtml(scenario.businessGoal || '') + '</p>' +
      renderList(flow) +
      '</section>' +
      '<section class="phase-section">' +
      '<h2>Databricks Components</h2>' +
      renderScenarioComponents(scenario.components || []) +
      '</section>' +
      '<section class="phase-section">' +
      '<h2>' + escapeHtml(artifacts.title || 'Sample spec package') + '</h2>' +
      '<p>' + escapeHtml(artifacts.summary || '') + '</p>' +
      '</section>' +
      (artifacts.sections || []).map(renderArtifactSection).join('') +
      '</article>'
    );
  }

  function renderPhaseFallback() {
    return (
      '<article class="site-shell phase-page phase-page--fallback">' +
      '<h1 class="phase-title">Phase content unavailable</h1>' +
      '<p class="phase-goal">The structured phase content could not be loaded. Try refreshing the page.</p>' +
      '</article>'
    );
  }

  function renderArtifactsFallback() {
    return (
      '<article class="site-shell phase-page phase-page--fallback">' +
      '<h1 class="phase-title">Artifacts unavailable</h1>' +
      '<p class="phase-goal">The Databricks scenario and sample spec package could not be loaded. Try refreshing the page.</p>' +
      '</article>'
    );
  }

  var scenarioConcepts = {
    lakehouse: 'Data Lakehouse',
    storage: 'Delta Lake',
    governance: 'Unity Catalog',
    analytics: 'Databricks SQL',
    serving: 'Lakebase'
  };

  function normalizeScenarioInput(input) {
    var value = input || {};
    return {
      mode: value.mode || 'micro-batch',
      governance: value.governance || 'strict',
      quality: value.quality || 'high',
      tradeoff: value.tradeoff || 'latency'
    };
  }

  function evaluateScenario(input) {
    var normalized = normalizeScenarioInput(input);
    var warnings = [];

    if (normalized.mode === 'micro-batch' && normalized.tradeoff === 'latency') {
      warnings.push('Micro-batch ingestion can satisfy analytics freshness, but Lakebase lookup latency needs an explicit synchronization budget.');
    }

    if (normalized.governance === 'strict') {
      warnings.push('Strict Unity Catalog grants protect receipt PII, but access reviews must be planned before broad Databricks SQL rollout.');
    }

    if (normalized.quality === 'high') {
      warnings.push('High quality gates should quarantine malformed receipts before silver Delta Lake tables are promoted.');
    }

    return {
      input: normalized,
      scenario: {
        id: 'retail-receipts-databricks',
        title: 'Retail receipts to analytics on Databricks',
        concepts: [
          scenarioConcepts.lakehouse,
          scenarioConcepts.storage,
          scenarioConcepts.governance,
          scenarioConcepts.analytics,
          scenarioConcepts.serving
        ]
      },
      phases: [
        {
          id: 'discovery',
          title: 'Discovery',
          output: 'Confirm finance, merchandising, and support need governed receipt analytics plus operational lookup on the Data Lakehouse.',
          concepts: [scenarioConcepts.lakehouse, scenarioConcepts.analytics]
        },
        {
          id: 'plan',
          title: 'Plan',
          output: 'Route bronze receipt events through Delta Lake quality gates, classify sensitive fields in Unity Catalog, and publish support-ready records to Lakebase.',
          concepts: [scenarioConcepts.storage, scenarioConcepts.governance, scenarioConcepts.serving]
        },
        {
          id: 'verification',
          title: 'Verification',
          output: 'Verify freshness, quarantine rate, dashboard reconciliation, lineage, and serving sync before sign-off.',
          concepts: [scenarioConcepts.storage, scenarioConcepts.governance, scenarioConcepts.analytics, scenarioConcepts.serving]
        }
      ],
      verification: {
        status: warnings.length ? 'PASS_WITH_WARNINGS' : 'PASS',
        warnings: warnings,
        checks: [
          'Receipt freshness budget is explicit.',
          'Unity Catalog lineage and grants are reviewed.',
          'Delta Lake quarantine behavior is specified.',
          'Lakebase synchronization failure behavior is documented.'
        ]
      }
    };
  }

  function renderSimulationResult(result) {
    return (
      '<article class="phase-page simulation-result">' +
      '<p class="phase-kicker">Deterministic simulation result</p>' +
      '<h2 class="phase-title">' + escapeHtml(result.verification.status) + '</h2>' +
      '<p class="phase-goal">' + escapeHtml(result.scenario.title) + '</p>' +
      '<section class="phase-section">' +
      '<h3>Scenario Concepts</h3>' +
      renderList(result.scenario.concepts) +
      '</section>' +
      '<div class="phase-grid">' + result.phases.map(function (phase) {
        return (
          '<section class="phase-section">' +
          '<h3>' + escapeHtml(phase.title) + '</h3>' +
          '<p>' + escapeHtml(phase.output) + '</p>' +
          renderList(phase.concepts) +
          '</section>'
        );
      }).join('') + '</div>' +
      '<section class="phase-section">' +
      '<h3>Verification Checks</h3>' +
      renderList(result.verification.checks) +
      '</section>' +
      '<section class="phase-section">' +
      '<h3>Warnings</h3>' +
      renderList(result.verification.warnings) +
      '</section>' +
      '</article>'
    );
  }

  function readSimulationInput(form) {
    return {
      mode: form.elements.mode.value,
      governance: form.elements.governance.value,
      quality: form.elements.quality.value,
      tradeoff: form.elements.tradeoff.value
    };
  }

  function bootstrapSimulationRoot(doc) {
    var form = doc.querySelector('[data-simulation-form]');
    var resultRoot = doc.querySelector('[data-simulation-result]');
    if (!form || !resultRoot) {
      return false;
    }

    function renderCurrentScenario() {
      resultRoot.innerHTML = renderSimulationResult(evaluateScenario(readSimulationInput(form)));
      resultRoot.setAttribute('data-simulation-rendered', 'true');
    }

    form.addEventListener('change', renderCurrentScenario);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      renderCurrentScenario();
    });
    renderCurrentScenario();
    return true;
  }

  function currentPathFromLocation(pathname, pages) {
    var rawPath = String(pathname || '');
    var endedWithSlash = rawPath.slice(-1) === '/';
    var path = rawPath.replace(/\/+$/, '');
    if (!path || path === '') {
      return 'index.html';
    }

    if (endedWithSlash) {
      return 'index.html';
    }

    for (var index = 0; index < pages.length; index += 1) {
      var pagePath = stripLeadingDotSlash(pages[index].path);
      if (path === '/' + pagePath || path.slice(-pagePath.length - 1) === '/' + pagePath) {
        return pagePath;
      }
    }

    return path.split('/').pop() || 'index.html';
  }

  function bootstrapNavigationRoot(doc, locationObject) {
    var navRoot = doc.querySelector('[data-nav-root]');
    if (!navRoot) {
      return Promise.resolve(false);
    }

    var base = navRoot.getAttribute('data-nav-base') || '.';
    var pageLabel = navRoot.getAttribute('data-page-label') || 'Superpowers Blog';
    var dataUrl = normalizeBasePrefix(base) + 'assets/data/site.json';

    return fetch(dataUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Unable to load navigation data: ' + response.status);
        }
        return response.json();
      })
      .then(function (siteData) {
        var currentPath = currentPathFromLocation(locationObject.pathname, siteData.pages);
        navRoot.innerHTML = renderNavigation({
          pages: siteData.pages,
          base: base,
          currentPath: currentPath,
          pageLabel: pageLabel
        });
        navRoot.setAttribute('data-nav-bootstrapped', 'true');
        return true;
      });
  }

  function bootstrapPhaseRoot(doc) {
    var phaseRoot = doc.querySelector('[data-phase-root]');
    if (!phaseRoot) {
      return Promise.resolve(false);
    }

    var slug = phaseRoot.getAttribute('data-phase-slug');
    var base = phaseRoot.getAttribute('data-phase-base') || phaseRoot.getAttribute('data-nav-base') || '.';
    var dataUrl = normalizeBasePrefix(base) + 'assets/data/phases.json';

    return fetch(dataUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Unable to load phase data: ' + response.status);
        }
        return response.json();
      })
      .then(function (phases) {
        var phase = phases.find(function (item) {
          return item.slug === slug;
        });
        if (!phase) {
          throw new Error('Unknown phase slug: ' + slug);
        }

        phaseRoot.innerHTML = renderPhasePage(phase);
        phaseRoot.setAttribute('data-phase-bootstrapped', 'true');
        return true;
      })
      .catch(function () {
        phaseRoot.innerHTML = renderPhaseFallback();
        phaseRoot.setAttribute('data-phase-error', 'true');
        return false;
      });
  }

  function bootstrapArtifactsRoot(doc) {
    var artifactsRoot = doc.querySelector('[data-artifacts-root]');
    if (!artifactsRoot) {
      return Promise.resolve(false);
    }

    var base = artifactsRoot.getAttribute('data-artifacts-base') || artifactsRoot.getAttribute('data-nav-base') || '.';
    var prefix = normalizeBasePrefix(base);

    return Promise.all([
      fetch(prefix + 'assets/data/scenario.json'),
      fetch(prefix + 'assets/data/artifacts.json')
    ])
      .then(function (responses) {
        return Promise.all(responses.map(function (response) {
          if (!response.ok) {
            throw new Error('Unable to load artifacts data: ' + response.status);
          }
          return response.json();
        }));
      })
      .then(function (payloads) {
        artifactsRoot.innerHTML = renderArtifactsPage(payloads[0], payloads[1]);
        artifactsRoot.setAttribute('data-artifacts-bootstrapped', 'true');
        return true;
      })
      .catch(function () {
        artifactsRoot.innerHTML = renderArtifactsFallback();
        artifactsRoot.setAttribute('data-artifacts-error', 'true');
        return false;
      });
  }

  return {
    buildNavigationLinks: buildNavigationLinks,
    currentPathFromLocation: currentPathFromLocation,
    normalizeBasePrefix: normalizeBasePrefix,
    renderNavigation: renderNavigation,
    renderArtifactsPage: renderArtifactsPage,
    renderSimulationResult: renderSimulationResult,
    renderPhasePage: renderPhasePage,
    bootstrapArtifactsRoot: bootstrapArtifactsRoot,
    bootstrapNavigationRoot: bootstrapNavigationRoot,
    bootstrapPhaseRoot: bootstrapPhaseRoot,
    bootstrapSimulationRoot: bootstrapSimulationRoot,
    evaluateScenario: evaluateScenario
  };
});

if (typeof document !== 'undefined' && typeof fetch === 'function') {
  globalThis.SuperpowerBlogNav.bootstrapNavigationRoot(document, window.location).catch(function (error) {
    console.error(error);
  });
  globalThis.SuperpowerBlogNav.bootstrapPhaseRoot(document).catch(function (error) {
    console.error(error);
  });
  globalThis.SuperpowerBlogNav.bootstrapArtifactsRoot(document).catch(function (error) {
    console.error(error);
  });
  globalThis.SuperpowerBlogNav.bootstrapSimulationRoot(document);
}
