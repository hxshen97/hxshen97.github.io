import { requiredChecks } from './merge-policy.mjs';

// This checks evidence, not provenance. The caller must obtain approval from
// a real owner message, never from a model-produced file or repository content.
export function chatMergeDecision({ pr, approval, checks, approver, reviews = [] }) {
  if (pr.state !== 'open' || pr.draft || pr.base.ref !== 'master') return { allowed: false, reason: 'PR is not ready' };
  if (pr.head.repo?.full_name !== pr.base.repo?.full_name || !pr.head.ref.startsWith('codex/')) {
    return { allowed: false, reason: 'unexpected source branch' };
  }
  if (!approval || approval.source !== 'user_chat' || approval.reviewer !== approver || approval.decision !== 'approved') {
    return { allowed: false, reason: 'real owner chat approval is required' };
  }
  if (approval.prNumber !== pr.number || approval.headSha !== pr.head.sha) {
    return { allowed: false, reason: 'approval must refer to this PR and current head' };
  }
  const latestByUser = new Map();
  for (const review of [...reviews].sort((a, b) => a.id - b.id)) {
    if (['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(review.state)) latestByUser.set(review.user.login, review);
  }
  if ([...latestByUser.values()].some(review => review.state === 'CHANGES_REQUESTED')) {
    return { allowed: false, reason: 'unresolved request for changes' };
  }
  for (const name of requiredChecks) {
    const check = checks.filter(check => check.name === name).sort((a, b) => b.id - a.id)[0];
    if (!check || check.head_sha !== pr.head.sha || check.app?.slug !== 'github-actions' || check.status !== 'completed' || check.conclusion !== 'success') {
      return { allowed: false, reason: `${name} must succeed on the approved head` };
    }
  }
  return { allowed: true, sha: pr.head.sha };
}
