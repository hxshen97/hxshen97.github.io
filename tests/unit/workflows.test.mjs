import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import yaml from 'js-yaml';

const workflows = Object.fromEntries(readdirSync('.github/workflows').filter(name => name.endsWith('.yml'))
  .map(name => [name, yaml.load(readFileSync(`.github/workflows/${name}`, 'utf8'))]));
test('all Actions are pinned and every executable job has a time limit', () => {
  for (const [name, workflow] of Object.entries(workflows)) {
    assert.equal(workflow.permissions.contents, 'read', name);
    for (const job of Object.values(workflow.jobs)) {
      if (job.uses) continue;
      assert.ok(job['timeout-minutes'] > 0 && job['timeout-minutes'] <= 25, name);
      for (const step of job.steps || []) {
        if (step.uses) assert.match(step.uses, /^[\w-]+\/[\w-]+@[a-f0-9]{40}$/, name);
      }
    }
  }
});
test('generation and validation jobs do not receive App private keys or write tokens', () => {
  const workflow = workflows['agent-round.yml'];
  assert.deepEqual(Object.keys(workflow.on.workflow_call.secrets), ['OPENAI_API_KEY']);
  for (const job of Object.values(workflow.jobs)) {
    assert.equal(job.env?.GH_TOKEN, undefined);
    for (const step of job.steps || []) {
      assert.equal(step.env?.GH_TOKEN, undefined);
      assert.equal(step.env?.OPENAI_API_KEY, undefined);
      assert.equal(step.env?.CODEX_API_KEY, undefined);
    }
  }
  assert.ok(!JSON.stringify(workflow.jobs.validate).includes('secrets.'));
});
test('merge executes only master code and uses owner approval policy', () => {
  const steps = workflows['merge.yml'].jobs.merge.steps;
  const checkout = steps.find(step => step.uses?.startsWith('actions/checkout@'));
  assert.equal(checkout.with.ref, 'master');
  assert.ok(steps.some(step => step.run === 'node scripts/automation/merge.mjs'));
  const config = JSON.parse(readFileSync('.github/automation.json', 'utf8'));
  assert.equal(config.approver, 'hxshen97');
  assert.equal(config.maxAttempts, 3);
  assert.deepEqual(config.requiredChecks, ['quality', 'browser']);
});
