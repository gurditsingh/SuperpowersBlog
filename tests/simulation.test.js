const test = require('node:test');
const assert = require('node:assert/strict');

async function loadSimulationApi() {
  const app = await import('../assets/app.js');
  return {
    evaluateScenario: app.evaluateScenario || app.default?.evaluateScenario,
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

const requiredGeneratedViews = [
  'discovery output summary',
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

  const resultText = JSON.stringify(resultA);
  for (const viewName of requiredGeneratedViews) {
    assert.match(resultText, new RegExp(viewName, 'i'), `scenario should include ${viewName}`);
  }
  assert.match(resultText, /Delta Lake/);
  assert.match(resultText, /Unity Catalog/);
  assert.match(resultText, /Lakebase/);
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
  for (const viewName of requiredGeneratedViews) {
    assert.match(markup, new RegExp(viewName, 'i'), `markup should render ${viewName}`);
  }
  assert.doesNotMatch(markup, /micro-batch<script>/);
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
