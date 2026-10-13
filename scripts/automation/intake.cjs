const fs = require('node:fs');

module.exports = async ({ github, context, core }) => {
  const config = JSON.parse(fs.readFileSync('.github/automation.json', 'utf8'));
  const { owner, repo } = context.repo;
  if (`${owner}/${repo}` !== config.repository || context.actor !== config.approver) {
    throw new Error('Only the configured owner can submit requirements or revision reviews.');
  }
  let request, title, branch, taskId, prNumber = null;
  if (context.eventName === 'issues') {
    const issue = context.payload.issue;
    if (issue.user.login !== config.approver || !issue.title.startsWith('[需求]')) {
      core.setOutput('accepted', 'false'); return;
    }
    request = issue.body || ''; title = issue.title;
    branch = `codex/task-issue-${issue.number}`; taskId = `issue-${issue.number}`;
  } else if (context.eventName === 'pull_request_review') {
    if (context.payload.review.state !== 'changes_requested') { core.setOutput('accepted', 'false'); return; }
    const { data: pr } = await github.rest.pulls.get({ owner, repo, pull_number: context.payload.pull_request.number });
    if (pr.state !== 'open' || pr.base.ref !== config.baseBranch || pr.head.repo.full_name !== config.repository ||
        !/^codex\/task-/.test(pr.head.ref) || pr.user.type !== 'Bot') throw new Error('Unexpected revision PR.');
    if (context.payload.review.commit_id !== pr.head.sha) throw new Error('Review is for an outdated head.');
    const comments = await github.paginate(github.rest.pulls.listReviewComments, { owner, repo, pull_number: pr.number });
    request = `Address owner review on PR #${pr.number}:\n${context.payload.review.body || ''}\n` +
      comments.filter(item => item.user.login === config.approver && item.pull_request_review_id === context.payload.review.id)
        .map(item => `${item.path}:${item.line || item.original_line}: ${item.body}`).join('\n');
    title = pr.title; branch = pr.head.ref; taskId = branch.replace('codex/task-', ''); prNumber = pr.number;
  } else {
    request = context.payload.inputs.requirement;
    title = request.split('\n')[0].slice(0, 100);
    branch = `codex/task-run-${context.runId}`; taskId = `run-${context.runId}`;
  }
  if (!request?.trim()) throw new Error('A non-empty requirement is needed.');
  const { data: base } = await github.rest.git.getRef({ owner, repo, ref: `heads/${config.baseBranch}` });
  let sourceSha = base.object.sha, expectedHead = '';
  try {
    const { data: source } = await github.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
    expectedHead = source.object.sha; sourceSha = expectedHead;
  } catch (error) { if (error.status !== 404) throw error; }
  fs.mkdirSync('.automation', { recursive: true });
  fs.writeFileSync('.automation/context.json', JSON.stringify({ request, title, branch, taskId, prNumber, sourceSha, baseSha: base.object.sha, expectedHead, repository: config.repository }, null, 2));
  core.setOutput('accepted', 'true');
  core.setOutput('source_sha', sourceSha);
};
