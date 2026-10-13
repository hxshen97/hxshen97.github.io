export const requiredChecks = ['quality', 'browser'];

// The caller obtains all evidence from GitHub, never from PR text or a model.
export function mergeDecision({ pr, reviews, checks, approver, protectedBranch }) {
  if (!protectedBranch) return { allowed: false, reason: 'master must be protected' };
  if (pr.state !== 'open' || pr.draft || pr.base.ref !== 'master') return { allowed: false, reason: 'PR is not ready' };
  if (pr.head.repo?.full_name !== pr.base.repo?.full_name || !pr.head.ref.startsWith('codex/')) {
    return { allowed: false, reason: 'unexpected source branch' };
  }
  if (pr.user.login === approver) return { allowed: false, reason: 'author cannot approve their own PR' };
  if (pr.user.type !== 'Bot') return { allowed: false, reason: 'automatic merges require a bot-authored PR' };
  const latestReview = reviews
    .filter(review => review.user.login === approver && ['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(review.state))
    .sort((a, b) => b.id - a.id)[0];
  if (latestReview?.state !== 'APPROVED' || latestReview.commit_id !== pr.head.sha) {
    return { allowed: false, reason: 'latest head requires owner approval' };
  }
  // A later request for changes from another reviewer is also a blocker.
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
