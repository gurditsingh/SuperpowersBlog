const test = require('node:test');
const assert = require('node:assert/strict');

async function loadEvaluateScenario() {
  const app = await import('../assets/app.js');
  return app.evaluateScenario || app.default?.evaluateScenario;
}

test('evaluateScenario returns deterministic phase-oriented warnings for fixed input', async () => {
  const evaluateScenario = await loadEvaluateScenario();
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
    ['discovery', 'plan', 'verification'],
  );

  const resultText = JSON.stringify(resultA);
  assert.match(resultText, /Delta Lake/);
  assert.match(resultText, /Unity Catalog/);
  assert.match(resultText, /Lakebase/);
});
