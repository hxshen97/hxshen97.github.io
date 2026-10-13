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
test('active workflows only test and deploy, with no model/API/App credentials', () => {
  assert.deepEqual(Object.keys(workflows).sort(), ['ci.yml', 'deploy.yml']);
  const text = JSON.stringify(workflows);
  assert.doesNotMatch(text, /openai\/codex-action|OPENAI_API_KEY|CODEX_API_KEY|AUTOMATION_APP_|GH_TOKEN/);
  assert.equal(workflows['ci.yml'].jobs.quality.name, 'quality');
  assert.equal(workflows['ci.yml'].jobs.browser.name, 'browser');
});
test('subscription configuration uses chat approval and keeps required checks', () => {
  const config = JSON.parse(readFileSync('.github/automation.json', 'utf8'));
  assert.equal(config.mode, 'subscription');
  assert.equal(config.approvalMode, 'chat');
  assert.equal(config.approver, 'hxshen97');
  assert.equal(config.maxAttempts, 3);
  assert.deepEqual(config.requiredChecks, ['quality', 'browser']);
});
