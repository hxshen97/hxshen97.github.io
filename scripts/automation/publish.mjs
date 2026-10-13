import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { client, paginate } from './github.mjs';

const config = JSON.parse(readFileSync(new URL('../../.github/automation.json', import.meta.url), 'utf8'));
if (config.mode !== 'api') throw new Error('Legacy App publisher is disabled. Create PRs through the connected GitHub tools in subscription mode.');

const context = JSON.parse(readFileSync(process.env.CONTEXT_FILE, 'utf8'));
const work = process.env.WORK_DIRECTORY;
const passed = process.env.PASSED === 'true';
assert.equal(context.repository, 'hxshen97/hxshen97.github.io');
assert.match(context.branch, /^codex\/task-(issue-\d+|run-\d+)$/);
const api = client();
const repo = `/repos/${context.repository}`;
const git = (...args) => execFileSync('git', args, { cwd: work, encoding: 'utf8' });

// Keep even unsuccessful work concrete and reviewable, with honest diagnostics.
const directory = `${work}/docs/changes/${context.taskId}`;
mkdirSync(directory, { recursive: true });
for (const name of ['requirements', 'design', 'validation']) {
  if (!existsSync(`${directory}/${name}.md`)) writeFileSync(`${directory}/${name}.md`, `# ${name}\n\nAutomatic execution did not complete this document.\n\n${name === 'requirements' ? context.request : 'See the workflow logs. This PR must remain a draft.'}\n`);
}
git('add', '-A');
if (!git('diff', '--cached', '--name-only').trim()) { console.log('No changes to publish.'); process.exit(0); }
git('-c', 'user.name=Homepage Automation', '-c', 'user.email=homepage-automation@users.noreply.github.com',
  'commit', '-m', `${context.title}\n\nAutomated task ${context.taskId}; validation=${passed ? 'passed' : 'blocked'}`);
const head = git('rev-parse', 'HEAD').trim();
execFileSync('git', ['push', `--force-with-lease=refs/heads/${context.branch}:${context.expectedHead}`, 'origin', `HEAD:refs/heads/${context.branch}`], {
  cwd: work, stdio: 'inherit', env: { ...process.env, GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: 'http.https://github.com/.extraheader',
    GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${Buffer.from(`x-access-token:${process.env.GH_TOKEN}`).toString('base64')}` },
});
const runUrl = `https://github.com/${context.repository}/actions/runs/${process.env.GITHUB_RUN_ID}`;
const body = [
  context.request,
  '\n## Implementation and evidence',
  ...['requirements', 'design', 'validation'].map(name => `- [${name}](https://github.com/${context.repository}/blob/${head}/docs/changes/${context.taskId}/${name}.md)`),
  `- [Workflow, test reports, screenshots and model review](${runUrl})`,
  `- Automated validation: ${passed ? 'passed; PR CI must also pass before merge' : 'blocked after at most three rounds; retained as draft'}`,
  '\nOwner approval must refer to this head. Approval never authorizes future commits.',
].join('\n');
const existing = await paginate(api, `${repo}/pulls?state=open&head=hxshen97:${encodeURIComponent(context.branch)}`);
let pr;
if (existing.length) {
  pr = await api(`${repo}/pulls/${existing[0].number}`, { method: 'PATCH', body: { body } });
} else {
  pr = await api(`${repo}/pulls`, { method: 'POST', body: { title: context.title, head: context.branch, base: 'master', body, draft: true } });
}
const mutation = passed ? 'markPullRequestReadyForReview' : 'convertPullRequestToDraft';
if (pr.draft === passed) await api('/graphql', { method: 'POST', body: {
  query: `mutation($id: ID!) { ${mutation}(input: {pullRequestId: $id}) { pullRequest { isDraft } } }`, variables: { id: pr.node_id },
} }).then(result => { if (result.errors) throw new Error(JSON.stringify(result.errors)); });
if (passed) await api(`${repo}/pulls/${pr.number}/requested_reviewers`, { method: 'POST', body: { reviewers: ['hxshen97'] } });
console.log(`PR: ${pr.html_url}; validation=${passed}; head=${head}`);
