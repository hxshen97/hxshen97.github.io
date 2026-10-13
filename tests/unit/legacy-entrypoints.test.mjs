import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

for (const script of ['merge.mjs', 'publish.mjs', 'configure-repository.mjs']) {
  test(`subscription mode refuses the legacy ${script} entrypoint before credentials are needed`, () => {
    const environment = { ...process.env };
    delete environment.GH_TOKEN;
    delete environment.CONTEXT_FILE;
    const result = spawnSync(process.execPath, [`scripts/automation/${script}`], { encoding: 'utf8', env: environment });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /subscription mode|subscription/);
    assert.doesNotMatch(result.stderr, /GH_TOKEN is required|GitHub GET|GitHub POST|GitHub PUT/);
  });
}
