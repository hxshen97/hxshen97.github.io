import test from 'node:test';
import assert from 'node:assert/strict';
import { chatMergeDecision } from '../../scripts/automation/chat-approval-policy.mjs';

const evidence = () => ({
  approver: 'hxshen97',
  pr: { number: 2, state: 'open', draft: false, user: { login: 'hxshen97', type: 'User' },
    base: { ref: 'master', repo: { full_name: 'hxshen97/hxshen97.github.io' } },
    head: { ref: 'codex/subscription-workflow', sha: 'approved-head', repo: { full_name: 'hxshen97/hxshen97.github.io' } } },
  approval: { source: 'user_chat', reviewer: 'hxshen97', decision: 'approved', prNumber: 2, headSha: 'approved-head' },
  checks: ['quality', 'browser'].map((name, i) => ({ id: i + 1, name, head_sha: 'approved-head', app: { slug: 'github-actions' }, status: 'completed', conclusion: 'success' })),
});

test('owner-created PR can merge with real chat approval and exact-head CI', () => {
  assert.deepEqual(chatMergeDecision(evidence()), { allowed: true, sha: 'approved-head' });
});
for (const [name, mutate] of [
  ['missing approval', e => { delete e.approval; }],
  ['model output presented as approval', e => { e.approval.source = 'model_output'; }],
  ['repository file presented as approval', e => { e.approval.source = 'file'; }],
  ['wrong approver', e => { e.approval.reviewer = 'other'; }],
  ['comment without approval', e => { e.approval.decision = 'comment'; }],
  ['approval for a different PR', e => { e.approval.prNumber = 1; }],
  ['head changed after approval', e => { e.pr.head.sha = 'new-head'; }],
  ['failed CI', e => { e.checks[1].conclusion = 'failure'; }],
  ['skipped CI', e => { e.checks[0].conclusion = 'skipped'; }],
  ['pending rerun after previous success', e => { e.checks.push({ ...e.checks[0], id: 9, status: 'in_progress', conclusion: null }); }],
  ['untrusted check issuer', e => { e.checks[0].app.slug = 'other'; }],
  ['draft PR', e => { e.pr.draft = true; }],
  ['fork branch', e => { e.pr.head.repo.full_name = 'other/fork'; }],
  ['unresolved changes request', e => { e.reviews = [{ id: 1, user: { login: 'reviewer' }, state: 'CHANGES_REQUESTED' }]; }],
]) {
  test(`chat policy blocks ${name}`, () => {
    const input = evidence(); mutate(input);
    assert.equal(chatMergeDecision(input).allowed, false);
  });
}
