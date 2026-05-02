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

  function renderMetricList(metrics) {
    return '<dl class="simulation-metrics">' + Object.keys(metrics).map(function (key) {
      return (
        '<div>' +
        '<dt>' + escapeHtml(key) + '</dt>' +
        '<dd>' + escapeHtml(metrics[key]) + '</dd>' +
        '</div>'
      );
    }).join('') + '</dl>';
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

  function buildScenarioComparison(normalized) {
    var batchCostControl = normalized.mode === 'batch' && normalized.tradeoff === 'cost';
    var strictHighControl = normalized.governance === 'strict' && normalized.quality === 'high';

    return {
      withSuperpowers: {
        label: 'With Superpowers specification',
        metrics: {
          reworkHours: batchCostControl ? 10 : 14,
          slaRisk: strictHighControl ? 'Low' : 'Medium',
          qualityIncidents: strictHighControl ? 1 : 2
        },
        summary: 'Discovery, Specification, Planning, TDD, and Verification keep Delta contracts, Unity Catalog grants, and Databricks SQL acceptance checks aligned before release.'
      },
      withoutSuperpowers: {
        label: 'Without specification discipline',
        metrics: {
          reworkHours: batchCostControl ? 42 : 32,
          slaRisk: strictHighControl ? 'High' : 'Medium-high',
          qualityIncidents: strictHighControl ? 7 : 5
        },
        summary: 'Teams optimize ingestion cost first, then discover dashboard reconciliation gaps after malformed receipt fields have already reached shared analytics surfaces.'
      }
    };
  }

  function buildSkipPhaseImpact() {
    return {
      phase: 'Specification',
      effect: 'Skipping Specification lets Delta contract drift reach Databricks SQL dashboards before Unity Catalog lineage and dashboard reconciliation catch it.',
      affectedSystems: ['Delta Lake', 'Unity Catalog', 'Databricks SQL'],
      mitigation: 'Lock the receipt schema, quality thresholds, lineage expectations, and dashboard acceptance checks before implementation planning.'
    };
  }

  function buildGeneratedViews(normalized, warnings) {
    var deliveryProfile = normalized.mode + ' delivery with ' + normalized.governance + ' governance, ' + normalized.quality + ' quality, and a ' + normalized.tradeoff + ' optimization posture';

    return [
      {
        id: 'discovery-output-summary',
        title: 'Discovery output summary',
        items: [
          'Finance, merchandising, and support need governed receipt analytics plus operational lookup on the Data Lakehouse.',
          'Success means trusted Delta Lake tables, Databricks SQL reconciliation, and Lakebase lookup behavior are defined before build.',
          'Chosen scenario profile: ' + deliveryProfile + '.'
        ]
      },
      {
        id: 'spec-boundary-choices',
        title: 'Spec boundary choices',
        items: [
          'In scope: bronze receipt ingestion, silver validation, gold reporting marts, Unity Catalog access rules, and Lakebase serving sync.',
          'Out of scope: loyalty personalization, refunds workflow automation, and non-receipt customer 360 expansion.',
          'Acceptance boundaries cover schema drift, quarantine behavior, freshness budgets, lineage, and dashboard reconciliation.'
        ]
      },
      {
        id: 'task-plan-breakdown',
        title: 'Task plan breakdown',
        items: [
          'Create Delta Lake contracts and fixtures before transformation work.',
          'Implement ingestion, validation, governance, SQL dashboard, and Lakebase sync tasks in dependency order.',
          'Attach every task to at least one test, review checkpoint, or verification command.'
        ]
      },
      {
        id: 'test-first-sequence',
        title: 'Test-first sequence',
        items: [
          'RED: malformed receipts are quarantined before silver promotion.',
          'GREEN: validation logic writes accepted and rejected records to the expected Delta paths.',
          'REFACTOR: keep quality rules readable while preserving Databricks SQL acceptance checks.'
        ]
      },
      {
        id: 'debugging-path',
        title: 'Debugging path',
        items: [
          'Reproduce dashboard reconciliation drift with a focused receipt fixture.',
          'Inspect Delta quality results, Unity Catalog lineage, and Lakebase sync timing separately.',
          'Fix the proven root cause only, then rerun the failing test and workflow verification.'
        ]
      },
      {
        id: 'review-findings-snapshot',
        title: 'Review findings snapshot',
        items: [
          'High: reject schema drift before shared Databricks SQL surfaces consume receipt totals.',
          'Medium: document Unity Catalog grant review ownership before broad dashboard rollout.',
          'Low: keep sample artifact links relative for GitHub Pages deployment.'
        ]
      },
      {
        id: 'verification-outcome-report',
        title: 'Verification outcome report',
        items: [
          'Status: ' + (warnings.length ? 'PASS_WITH_WARNINGS' : 'PASS') + '.',
          'Checks cover freshness, quarantine rate, dashboard reconciliation, lineage, and Lakebase synchronization.',
          warnings.length ? 'Residual warnings: ' + warnings.join(' ') : 'No residual warnings for the selected deterministic profile.'
        ]
      }
    ];
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

    var generatedViews = buildGeneratedViews(normalized, warnings);

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
          id: 'fundamentals',
          title: 'Fundamentals',
          output: 'Anchor the team on spec-driven development: discovery precedes specification, tests precede implementation, and verification precedes completion claims.',
          concepts: [scenarioConcepts.lakehouse]
        },
        {
          id: 'discovery',
          title: 'Discovery',
          output: 'Confirm finance, merchandising, and support need governed receipt analytics plus operational lookup on the Data Lakehouse.',
          concepts: [scenarioConcepts.lakehouse, scenarioConcepts.analytics]
        },
        {
          id: 'specification',
          title: 'Specification',
          output: 'Lock receipt schemas, quality thresholds, lineage expectations, access rules, SLA targets, and dashboard acceptance checks before planning work.',
          concepts: [scenarioConcepts.storage, scenarioConcepts.governance, scenarioConcepts.analytics]
        },
        {
          id: 'implementation-planning',
          title: 'Implementation Planning',
          output: 'Break the specification into ordered ingestion, validation, governance, SQL analytics, and Lakebase serving tasks.',
          concepts: [scenarioConcepts.storage, scenarioConcepts.governance, scenarioConcepts.serving]
        },
        {
          id: 'workspace-setup',
          title: 'Environment and Workspace Setup',
          output: 'Confirm repository state, preserve relative GitHub Pages paths, and isolate scoped changes before implementation begins.',
          concepts: [scenarioConcepts.lakehouse]
        },
        {
          id: 'tdd',
          title: 'Test-Driven Development',
          output: 'Write failing tests for receipt validation, Delta quarantine behavior, dashboard reconciliation, and serving synchronization before code changes.',
          concepts: [scenarioConcepts.storage, scenarioConcepts.analytics, scenarioConcepts.serving]
        },
        {
          id: 'systematic-debugging',
          title: 'Systematic Debugging',
          output: 'When tests or jobs fail, isolate whether the cause is schema drift, quality rules, grants, dashboard SQL, or serving sync timing.',
          concepts: [scenarioConcepts.storage, scenarioConcepts.governance, scenarioConcepts.analytics, scenarioConcepts.serving]
        },
        {
          id: 'code-review',
          title: 'Code Review',
          output: 'Review the diff against the spec, tests, governance expectations, relative paths, and residual Databricks risks.',
          concepts: [scenarioConcepts.governance, scenarioConcepts.analytics]
        },
        {
          id: 'verification',
          title: 'Verification',
          output: 'Verify freshness, quarantine rate, dashboard reconciliation, lineage, and serving sync before sign-off.',
          concepts: [scenarioConcepts.storage, scenarioConcepts.governance, scenarioConcepts.analytics, scenarioConcepts.serving]
        },
        {
          id: 'completion',
          title: 'Completion',
          output: 'Package the branch with a scoped commit, passing test evidence, review disposition, changed files, and next-step status.',
          concepts: [scenarioConcepts.lakehouse]
        }
      ],
      generatedViews: generatedViews,
      verification: {
        status: warnings.length ? 'PASS_WITH_WARNINGS' : 'PASS',
        warnings: warnings,
        checks: [
          'Receipt freshness budget is explicit.',
          'Unity Catalog lineage and grants are reviewed.',
          'Delta Lake quarantine behavior is specified.',
          'Lakebase synchronization failure behavior is documented.'
        ]
      },
      comparison: buildScenarioComparison(normalized),
      skipPhaseImpact: buildSkipPhaseImpact()
    };
  }

  function renderComparisonSide(side) {
    return (
      '<section class="phase-section simulation-comparison-card">' +
      '<h3>' + escapeHtml(side.label) + '</h3>' +
      renderMetricList(side.metrics || {}) +
      '<p>' + escapeHtml(side.summary) + '</p>' +
      '</section>'
    );
  }

  function renderSkipPhaseImpact(impact) {
    if (!impact) {
      return '';
    }

    return (
      '<section class="phase-section simulation-failure-mode" data-failure-mode-impact>' +
      '<h3>Failure-Mode Impact</h3>' +
      '<p><strong>Skipped phase:</strong> ' + escapeHtml(impact.phase) + '</p>' +
      '<p>' + escapeHtml(impact.effect) + '</p>' +
      '<h4>Affected Databricks systems</h4>' +
      renderList(impact.affectedSystems || []) +
      '<p><strong>Mitigation:</strong> ' + escapeHtml(impact.mitigation || '') + '</p>' +
      '</section>'
    );
  }

  function renderGeneratedView(view) {
    return (
      '<section class="phase-section simulation-generated-view" data-generated-view="' + escapeHtml(view.id) + '">' +
      '<h3>' + escapeHtml(view.title) + '</h3>' +
      renderList(view.items || []) +
      '</section>'
    );
  }

  function clampPhaseIndex(result, phaseIndex) {
    var phases = result && Array.isArray(result.phases) ? result.phases : [];
    var lastIndex = Math.max(phases.length - 1, 0);
    var requestedIndex = Number.isFinite(Number(phaseIndex)) ? Number(phaseIndex) : 0;
    return Math.min(Math.max(Math.floor(requestedIndex), 0), lastIndex);
  }

  function getSimulationStepperState(result, phaseIndex) {
    var phases = result && Array.isArray(result.phases) ? result.phases : [];
    var total = phases.length;
    var currentIndex = clampPhaseIndex(result, phaseIndex);
    var currentPhase = phases[currentIndex] || null;

    return {
      currentIndex: currentIndex,
      currentPhase: currentPhase,
      total: total,
      canGoPrevious: currentIndex > 0,
      canGoNext: total > 0 && currentIndex < total - 1,
      progressText: total > 0 ? 'Phase ' + (currentIndex + 1) + ' of ' + total : 'No phases available'
    };
  }

  function getNextSimulationPhaseIndex(result, phaseIndex, direction) {
    var state = getSimulationStepperState(result, phaseIndex);
    var delta = direction === 'previous' ? -1 : 1;
    return clampPhaseIndex(result, state.currentIndex + delta);
  }

  function renderSimulationStepper(state) {
    return (
      '<section class="phase-section simulation-stepper" data-simulation-stepper>' +
      '<div>' +
      '<h3>Current Simulation Phase</h3>' +
      '<p data-simulation-progress>' + escapeHtml(state.progressText) + '</p>' +
      '</div>' +
      '<div class="simulation-stepper-controls">' +
      '<button type="button" data-simulation-step="previous"' + (state.canGoPrevious ? '' : ' disabled') + '>Previous</button>' +
      '<button type="button" data-simulation-step="next"' + (state.canGoNext ? '' : ' disabled') + '>Next</button>' +
      '</div>' +
      '</section>'
    );
  }

  function renderActiveSimulationPhase(phase) {
    if (!phase) {
      return (
        '<section class="phase-section simulation-active-phase" data-active-phase-id="">' +
        '<h3>No active phase</h3>' +
        '<p>The simulation has no phase data to display.</p>' +
        '</section>'
      );
    }

    return (
      '<section class="phase-section simulation-active-phase" data-active-phase-id="' + escapeHtml(phase.id) + '">' +
      '<h3>' + escapeHtml(phase.title) + '</h3>' +
      '<p>' + escapeHtml(phase.output) + '</p>' +
      renderList(phase.concepts || []) +
      '</section>'
    );
  }

  function renderPhaseSummary(phase, index, state) {
    var status = index < state.currentIndex ? 'completed' : (index === state.currentIndex ? 'active' : 'upcoming');
    return (
      '<section class="phase-section simulation-phase-summary" data-phase-id="' + escapeHtml(phase.id) + '" data-phase-status="' + escapeHtml(status) + '">' +
      '<h3>' + escapeHtml(index + 1) + '. ' + escapeHtml(phase.title) + '</h3>' +
      '<p>' + escapeHtml(status) + '</p>' +
      '</section>'
    );
  }

  function renderSimulationResult(result, options) {
    var renderOptions = options || {};
    var showFailureImpact = renderOptions.showFailureImpact !== false;
    var stepperState = getSimulationStepperState(result, renderOptions.phaseIndex || 0);
    return (
      '<article class="phase-page simulation-result">' +
      '<p class="phase-kicker">Deterministic simulation result</p>' +
      '<h2 class="phase-title">' + escapeHtml(result.verification.status) + '</h2>' +
      '<p class="phase-goal">' + escapeHtml(result.scenario.title) + '</p>' +
      '<section class="phase-section">' +
      '<h3>Scenario Concepts</h3>' +
      renderList(result.scenario.concepts) +
      '</section>' +
      renderSimulationStepper(stepperState) +
      renderActiveSimulationPhase(stepperState.currentPhase) +
      '<section class="phase-section simulation-phase-roadmap">' +
      '<h3>Phase Roadmap</h3>' +
      '<div class="phase-grid">' + result.phases.map(function (phase, index) {
        return renderPhaseSummary(phase, index, stepperState);
      }).join('') + '</div>' +
      '</section>' +
      '<section class="phase-section simulation-generated-views">' +
      '<h3>Generated Superpowers Views</h3>' +
      '<div class="phase-grid">' +
      (result.generatedViews || []).map(renderGeneratedView).join('') +
      '</div>' +
      '</section>' +
      '<section class="phase-section">' +
      '<h3>Verification Checks</h3>' +
      renderList(result.verification.checks) +
      '</section>' +
      '<section class="phase-section">' +
      '<h3>Warnings</h3>' +
      renderList(result.verification.warnings) +
      '</section>' +
      '<section class="phase-section simulation-comparison">' +
      '<h3>Superpowers vs. Non-Spec Delivery</h3>' +
      '<div class="phase-grid">' +
      renderComparisonSide(result.comparison.withSuperpowers) +
      renderComparisonSide(result.comparison.withoutSuperpowers) +
      '</div>' +
      '</section>' +
      (showFailureImpact ? renderSkipPhaseImpact(result.skipPhaseImpact) : '') +
      '</article>'
    );
  }

  function readSimulationInput(form) {
    return {
      mode: form.elements.mode.value,
      governance: form.elements.governance.value,
      quality: form.elements.quality.value,
      tradeoff: form.elements.tradeoff.value,
      showFailureImpact: form.elements.showFailureImpact ? form.elements.showFailureImpact.checked : true
    };
  }

  function bootstrapSimulationRoot(doc) {
    var form = doc.querySelector('[data-simulation-form]');
    var resultRoot = doc.querySelector('[data-simulation-result]');
    if (!form || !resultRoot) {
      return false;
    }
    var phaseIndex = 0;

    function renderCurrentScenario() {
      var input = readSimulationInput(form);
      var result = evaluateScenario(input);
      phaseIndex = clampPhaseIndex(result, phaseIndex);
      resultRoot.innerHTML = renderSimulationResult(result, {
        showFailureImpact: input.showFailureImpact,
        phaseIndex: phaseIndex
      });
      resultRoot.setAttribute('data-simulation-rendered', 'true');
    }

    form.addEventListener('change', function () {
      phaseIndex = 0;
      renderCurrentScenario();
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      phaseIndex = 0;
      renderCurrentScenario();
    });
    resultRoot.addEventListener('click', function (event) {
      var control = event.target && event.target.closest ? event.target.closest('[data-simulation-step]') : null;
      if (!control) {
        return;
      }

      phaseIndex = getNextSimulationPhaseIndex(
        evaluateScenario(readSimulationInput(form)),
        phaseIndex,
        control.getAttribute('data-simulation-step')
      );
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
    getSimulationStepperState: getSimulationStepperState,
    getNextSimulationPhaseIndex: getNextSimulationPhaseIndex,
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
