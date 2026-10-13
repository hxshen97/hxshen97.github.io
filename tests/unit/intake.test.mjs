import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import intake from '../../scripts/automation/intake.cjs';

const fixture = () => {
  const outputs = {};
  return {
    outputs,
    core: { setOutput: (key, value) => { outputs[key] = value; } },
    context: { repo: { owner: 'hxshen97', repo: 'hxshen97.github.io' }, actor: 'hxshen97', runId: '100', eventName: 'workflow_dispatch', payload: { inputs: { requirement: 'Keep both languages; reorganize components.' } } },
    github: { rest: { git: { getRef: async ({ ref }) => {
      if (ref === 'heads/master') return { data: { object: { sha: 'a'.repeat(40) } } };
      const error = new Error('missing branch'); error.status = 404; throw error;
    } } } },
  };
};
test('owner requirement becomes immutable task metadata without interpolating shell text', async () => {
  const input = fixture();
  input.context.payload.inputs.requirement = 'Literal `$(anything)` is request data.';
  await intake(input);
  const context = JSON.parse(readFileSync('.automation/context.json', 'utf8'));
  assert.equal(context.request, input.context.payload.inputs.requirement);
  assert.equal(context.sourceSha, 'a'.repeat(40));
  assert.equal(context.expectedHead, '');
  assert.equal(context.branch, 'codex/task-run-100');
  assert.equal(input.outputs.accepted, 'true');
});
test('unauthorized actor is rejected before GitHub access', async () => {
  const input = fixture(); input.context.actor = 'outsider';
  await assert.rejects(intake(input), /Only the configured owner/);
});
test('empty requirements fail rather than starting unrestricted work', async () => {
  const input = fixture(); input.context.payload.inputs.requirement = '';
  await assert.rejects(intake(input), /non-empty requirement/);
});
test('ordinary issues are ignored without demanding another user confirmation', async () => {
  const input = fixture(); input.context.eventName = 'issues';
  input.context.payload = { issue: { user: { login: 'hxshen97' }, title: 'Discussion', body: 'Not a development request' } };
  await intake(input); assert.equal(input.outputs.accepted, 'false');
});
