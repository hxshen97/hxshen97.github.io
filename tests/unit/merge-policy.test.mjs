import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeDecision } from '../../scripts/automation/merge-policy.mjs';

const evidence = () => ({
  approver: 'hxshen97', protectedBranch: true,
  pr: { state: 'open', draft: false, user: { login: 'homepage-agent[bot]', type: 'Bot' },
    base: { ref: 'master', repo: { full_name: 'hxshen97/hxshen97.github.io' } },
    head: { ref: 'codex/task-1', sha: 'approved-sha', repo: { full_name: 'hxshen97/hxshen97.github.io' } } },
  reviews: [{ id: 1, user: { login: 'hxshen97' }, state: 'APPROVED', commit_id: 'approved-sha' }],
  checks: ['quality', 'browser'].map((name, i) => ({ id: i + 1, name, head_sha: 'approved-sha', app: { slug: 'github-actions' }, status: 'completed', conclusion: 'success' })),
});

test('owner approval and passing checks authorize exactly one head', () => {
  assert.deepEqual(mergeDecision(evidence()), { allowed: true, sha: 'approved-sha' });
});

for (const [name, mutate] of [
  ['missing approval', e => { e.reviews = []; }],
  ['approval of an older commit', e => { e.pr.head.sha = 'new-sha'; }],
  ['self approval', e => { e.pr.user.login = e.approver; }],
  ['human-authored PR', e => { e.pr.user.type = 'User'; }],
  ['draft PR', e => { e.pr.draft = true; }],
  ['unprotected master', e => { e.protectedBranch = false; }],
  ['failed browser checks', e => { e.checks[1].conclusion = 'failure'; }],
  ['skipped quality checks', e => { e.checks[0].conclusion = 'skipped'; }],
  ['old successful check followed by pending check', e => { e.checks.push({ ...e.checks[0], id: 9, status: 'in_progress', conclusion: null }); }],
  ['spoofed check issuer', e => { e.checks[0].app.slug = 'other-app'; }],
  ['review revoked', e => { e.reviews.push({ ...e.reviews[0], id: 3, state: 'DISMISSED' }); }],
  ['changes requested', e => { e.reviews.push({ ...e.reviews[0], id: 2, state: 'CHANGES_REQUESTED' }); }],
  ['fork branch', e => { e.pr.head.repo.full_name = 'other/fork'; }],
]) {
  test(`blocks ${name}`, () => {
    const input = evidence(); mutate(input);
    assert.equal(mergeDecision(input).allowed, false);
  });
}
