import { readFileSync } from 'node:fs';
import { client } from './github.mjs';

const config = JSON.parse(readFileSync(new URL('../../.github/automation.json', import.meta.url), 'utf8'));
if (config.mode !== 'api') throw new Error('Legacy native-review setup is disabled in subscription mode. Follow docs/automation.md for chat-compatible branch protection.');
const api = client();
const repo = `/repos/${config.repository}`;
const owner = await api('/user');
if (owner.login !== config.approver) throw new Error('Repository setup requires the owner identity.');
await api(`${repo}/branches/${config.baseBranch}/protection`, {
  method: 'PUT', body: {
    required_status_checks: { strict: true, contexts: config.requiredChecks },
    enforce_admins: true,
    required_pull_request_reviews: { dismiss_stale_reviews: true, required_approving_review_count: 1, require_code_owner_reviews: false },
    restrictions: null, allow_force_pushes: false, allow_deletions: false,
    required_conversation_resolution: true,
  },
});
console.log('master protected: owner approval, current CI, stale approval dismissal, no force pushes.');
