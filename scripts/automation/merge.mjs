import { readFileSync } from 'node:fs';
import { client, paginate } from './github.mjs';
import { mergeDecision } from './merge-policy.mjs';

const config = JSON.parse(readFileSync(new URL('../../.github/automation.json', import.meta.url), 'utf8'));
const api = client();
const repo = `/repos/${config.repository}`;
const branch = await api(`${repo}/branches/${config.baseBranch}`);
// Read actual protection, not just the boolean flag. Missing/insufficient rules fail closed.
const protection = await api(`${repo}/branches/${config.baseBranch}/protection`);
const reviewRule = protection.required_pull_request_reviews;
const contexts = protection.required_status_checks?.contexts || [];
if (!branch.protected || !reviewRule?.dismiss_stale_reviews || reviewRule.required_approving_review_count < 1 ||
    !protection.enforce_admins?.enabled || !protection.required_status_checks?.strict ||
    !config.requiredChecks.every(name => contexts.includes(name))) {
  throw new Error('Configure the documented master branch protection before automatic merges.');
}

const target = process.env.PR_NUMBER;
const candidates = target ? [await api(`${repo}/pulls/${Number(target)}`)] : await paginate(api, `${repo}/pulls?state=open&base=${config.baseBranch}`);
for (const pr of candidates) {
  const reviews = await paginate(api, `${repo}/pulls/${pr.number}/reviews`);
  const checks = await paginate(api, `${repo}/commits/${pr.head.sha}/check-runs`, 'check_runs');
  const decision = mergeDecision({ pr, reviews, checks, approver: config.approver, protectedBranch: branch.protected });
  if (!decision.allowed) { console.log(`PR #${pr.number}: ${decision.reason}`); continue; }
  const result = await api(`${repo}/pulls/${pr.number}/merge`, {
    method: 'PUT', body: { sha: decision.sha, merge_method: 'squash' },
  });
  if (!result.merged) throw new Error(`PR #${pr.number} was not merged: ${result.message}`);
  console.log(`Merged PR #${pr.number} at approved head ${decision.sha}.`);
}
