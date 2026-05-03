const test = require('node:test');
const assert = require('node:assert/strict');
const siteData = require('../assets/data/site.json');

async function loadSimulationApi() {
  const app = await import('../assets/app.js');
  return {
    evaluateScenario: app.evaluateScenario || app.default?.evaluateScenario,
    getSimulationStepperState: app.getSimulationStepperState || app.default?.getSimulationStepperState,
    getNextSimulationPhaseIndex: app.getNextSimulationPhaseIndex || app.default?.getNextSimulationPhaseIndex,
    renderSimulationResult: app.renderSimulationResult || app.default?.renderSimulationResult,
  };
}

const expectedPhaseIds = [
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

const expectedLifecycleLabels = siteData.pages
  .filter((page) => page.path.startsWith('phases/'))
  .map((page) => page.label);

const requiredGeneratedViews = [
  'brainstorm / design output summary',
  'spec boundary choices',
  'task plan breakdown',
  'test-first sequence',
  'debugging path',
  'review findings snapshot',
  'verification outcome report',
];

test('evaluateScenario returns deterministic full Superpowers workflow for fixed input', async () => {
  const { evaluateScenario } = await loadSimulationApi();
  const input = {
    mode: 'micro-batch',
    governance: 'strict',
    quality: 'high',
    tradeoff: 'latency',
  };

  const resultA = evaluateScenario(input);
  const resultB = evaluateScenario(input);

  assert.deepEqual(resultA, resultB);
  assert.equal(resultA.verification.status, 'PASS_WITH_WARNINGS');
  assert.deepEqual(
    resultA.phases.map((phase) => phase.id),
    expectedPhaseIds,
  );
  assert.deepEqual(
    resultA.phases.map((phase) => phase.title),
    expectedLifecycleLabels,
  );

  const resultText = JSON.stringify(resultA);
  for (const viewName of requiredGeneratedViews) {
    assert.match(resultText, new RegExp(viewName, 'i'), `scenario should include ${viewName}`);
  }
  assert.match(resultText, /Delta Lake/);
  assert.match(resultText, /Unity Catalog/);
  assert.match(resultText, /Lakebase/);
});

test('evaluateScenario generated output is Superpowers-first for the ingestion pipeline sample', async () => {
  const { evaluateScenario } = await loadSimulationApi();
  const result = evaluateScenario({
    mode: 'micro-batch',
    governance: 'strict',
    quality: 'high',
    tradeoff: 'latency',
  });
  const generatedOutput = JSON.stringify(result.generatedViews);

  assert.match(generatedOutput, /Superpowers/i);
  assert.match(generatedOutput, /spec-driven/i);
  assert.match(generatedOutput, /ingestion pipeline/i);
});

test('renderSimulationResult emits all phase ids and generated views safely', async () => {
  const { evaluateScenario, renderSimulationResult } = await loadSimulationApi();
  const result = evaluateScenario({
    mode: 'micro-batch<script>',
    governance: 'strict',
    quality: 'high',
    tradeoff: 'latency',
  });

  const markup = renderSimulationResult(result);

  for (const phaseId of expectedPhaseIds) {
    assert.match(markup, new RegExp(`data-phase-id="${phaseId}"`), `markup should include ${phaseId}`);
  }
  for (const phaseLabel of expectedLifecycleLabels) {
    assert.match(markup, new RegExp(phaseLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `markup should render ${phaseLabel}`);
  }
  for (const viewName of requiredGeneratedViews) {
    assert.match(markup, new RegExp(viewName, 'i'), `markup should render ${viewName}`);
  }
  assert.doesNotMatch(markup, /micro-batch<script>/);
});

test('simulation stepper initial state starts at fundamentals and disables Previous', async () => {
  const { evaluateScenario, getSimulationStepperState, renderSimulationResult } = await loadSimulationApi();
  const result = evaluateScenario({
    mode: 'micro-batch',
    governance: 'strict',
    quality: 'high',
    tradeoff: 'latency',
  });

  const state = getSimulationStepperState(result, 0);
  const markup = renderSimulationResult(result, { phaseIndex: 0 });

  assert.equal(state.currentIndex, 0);
  assert.equal(state.currentPhase.id, 'fundamentals');
  assert.equal(state.canGoPrevious, false);
  assert.equal(state.canGoNext, true);
  assert.equal(state.progressText, 'Phase 1 of 10');
  assert.match(markup, /data-active-phase-id="fundamentals"/);
  assert.match(markup, /<button type="button" data-simulation-step="previous" disabled>Previous<\/button>/);
  assert.match(markup, /Phase 1 of 10/);
});

test('simulation stepper Next eventually reaches completion and disables Next', async () => {
  const { evaluateScenario, getSimulationStepperState, getNextSimulationPhaseIndex, renderSimulationResult } =
    await loadSimulationApi();
  const result = evaluateScenario({
    mode: 'micro-batch',
    governance: 'strict',
    quality: 'high',
    tradeoff: 'latency',
  });
  let phaseIndex = 0;

  while (getSimulationStepperState(result, phaseIndex).canGoNext) {
    phaseIndex = getNextSimulationPhaseIndex(result, phaseIndex, 'next');
  }

  const state = getSimulationStepperState(result, phaseIndex);
  const markup = renderSimulationResult(result, { phaseIndex });

  assert.equal(state.currentIndex, expectedPhaseIds.length - 1);
  assert.equal(state.currentPhase.id, 'completion');
  assert.equal(state.canGoPrevious, true);
  assert.equal(state.canGoNext, false);
  assert.equal(state.progressText, 'Phase 10 of 10');
  assert.match(markup, /data-active-phase-id="completion"/);
  assert.match(markup, /<button type="button" data-simulation-step="next" disabled>Next<\/button>/);
});

test('simulation stepper preserves generated views in rendered result', async () => {
  const { evaluateScenario, renderSimulationResult } = await loadSimulationApi();
  const result = evaluateScenario({
    mode: 'batch',
    governance: 'strict',
    quality: 'high',
    tradeoff: 'cost',
  });

  const markup = renderSimulationResult(result, { phaseIndex: expectedPhaseIds.length - 1 });

  for (const viewName of requiredGeneratedViews) {
    assert.match(markup, new RegExp(viewName, 'i'), `markup should render ${viewName}`);
  }
  assert.match(markup, /data-generated-view="brainstorm-design-output-summary"/);
  assert.match(markup, /data-failure-mode-impact/);
  assert.match(markup, /Superpowers vs\. Non-Spec Delivery/);
});

test('evaluateScenario includes Superpowers comparison for strict batch cost scenario', async () => {
  const { evaluateScenario } = await loadSimulationApi();

  const result = evaluateScenario({
    mode: 'batch',
    governance: 'strict',
    quality: 'high',
    tradeoff: 'cost',
  });

  assert.ok(result.comparison);
  assert.ok(result.comparison.withSuperpowers);
  assert.ok(result.comparison.withoutSuperpowers);
});

test('renderSimulationResult preserves skipPhaseImpact toggle behavior', async () => {
  const { evaluateScenario, renderSimulationResult } = await loadSimulationApi();
  const result = evaluateScenario({
    mode: 'batch',
    governance: 'standard',
    quality: 'standard',
    tradeoff: 'throughput',
  });

  assert.match(renderSimulationResult(result), /data-failure-mode-impact/);
  assert.doesNotMatch(renderSimulationResult(result, { showFailureImpact: false }), /data-failure-mode-impact/);
});
