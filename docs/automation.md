# 自动开发操作说明

## 日常使用

首次配置完成后，仓库所有者只需在 GitHub 使用“自动开发需求” Issue 模板提出需求（标题保留 `[需求]`），或运行 Agent development 的 workflow_dispatch 提交需求。

流程自动记录需求与方案、开发、独立验收、模型只读审查，最多修复三轮，再以 GitHub App 身份推送开发分支并创建 PR。通过的工作转为 Ready for review；失败的工作保留 Draft PR 和日志。成功仅表示自动验证通过，仍必须等待你批准当前提交。

你在 PR 中选择 Approve 后，合入流程检查 `quality`、`browser`、当前 SHA 和实际分支保护，再 Squash Merge 到 master。GitHub App 的合入会触发 Pages 发布；发布任务验证十二个模块入口和两份 PDF。Request changes 会自动开启最多三轮的新修复任务，无需另写开发指令。

Issue 仅接收 hxshen97 提出的 `[需求]` 需求；审查反馈也必须来自 hxshen97。引用、第三方评论和模型意见均不是审批信号。

## 一次性配置

1. 在 GitHub 创建独立 GitHub App，关闭不需要的 webhook，仅安装到 hxshen97.github.io。仓库权限：Contents write、Pull requests write、Checks read、Administration read；Metadata 默认只读。App 不需要绕过分支保护的权限，也不需要 Workflows write。
2. 在仓库 Settings → Secrets and variables → Actions 中添加 secrets `OPENAI_API_KEY`、`AUTOMATION_APP_PRIVATE_KEY`，添加 variable `AUTOMATION_APP_ID`。不要把密钥放进聊天、Issue、PR 或仓库文件。OpenAI API 用量独立配置费用限额。
3. 开启 GitHub Actions；Pages 的 Source 设为 GitHub Actions。App 推送会触发 PR CI，合入会触发 Pages；不使用 GITHUB_TOKEN 写入来避免后续事件不触发。
4. 当前基础设施 PR 合入并有 CI 结果后，保护 master：Require a pull request、至少一人批准、Dismiss stale approvals、必需检查 quality/browser、Require branches up to date、Require conversation resolution、规则适用于管理员、禁止 force push / deletion。确保 hxshen97 是批准人。
5. 可以使用 `GH_TOKEN=<所有者管理凭据> node scripts/automation/configure-repository.mjs` 一次性设置上述 classic branch protection。令牌通过本地环境提供；脚本不输出令牌，不负责读取或保存密钥。
6. 用一个小需求验证 App 建 PR → CI → Approve → 自动合入 → 发布。在这次验证通过前，不能把系统标记为已全面启用。

这里的 App Administration read 用于核查真实保护规则；配置脚本需要所有者管理权限，两者不能混用。

## 工作流和权限

| 文件 | 用途 |
| --- | --- |
| agent-dev.yml | 可信需求入口、三轮调度和机器人提交 PR |
| agent-round.yml | 生成代码 → 无密钥独立验证 → 只读模型审查 |
| ci.yml | 每个 PR 的 quality / browser 检查与截图报告 |
| merge.yml | 当前提交的用户审批、CI 和保护检查，原子 SHA 合入 |
| deploy.yml | master 构建、Pages 发布及线上验证 |

Actions 全部固定到提交 SHA。生成和审查采用官方 Codex Action；真实 API 密钥由它的代理管理，GitHub 写令牌仅出现在独立发布与合入任务。Codex 之后仅运行固定版本的产物传输 Action，不在同一任务中执行模型生成的代码。验证在新的 runner 上执行，不注入 API 密钥或 App 私钥。

推送开发分支使用 force-with-lease，仅允许固定 `codex/task-*` 分支；原任务分支被别人更新时拒绝覆盖。合入使用 GitHub API 的 `sha` 参数，拒绝审批后 head 被替换的竞态。

## 内容与测试

`tests/baseline/content.json` 对现有 Markdown、简历 YAML、PDF 和头像记录哈希；文本先统一换行，兼容 Windows / Linux。自动任务不能自行重写基线。需要更新既有个人内容时，在明确的内容更新 PR 中同步审查新基线。

`npm run verify` 检查类型、单元测试、静态构建、内容/路由完整性、博客公式/草稿以及桌面和移动端。博客测试只在临时构建目录中使用 fixture，退出时删除临时源文章，不进入生产 dist。浏览器报告及截图上传为 Actions artifacts。

本地先使用 `.nvmrc` 的 Node 版本、`npm ci`、`npx playwright install chromium`。可用 `PLAYWRIGHT_EXECUTABLE_PATH` 指定兼容的本地 Chromium；CI 始终安装 Playwright 配套浏览器。

## 失败与边界

- 三轮仍失败：保留 Draft PR、方案、验证日志及审查反馈，不合入。
- API、凭据或 runner 故障：失败并保留已有产物，不虚报通过；可重跑任务。
- 在运行期间分支被其他操作更新：推送租约失败，不覆盖更新。
- master 变化导致 PR 落后或冲突：保护规则阻止合入；修改反馈触发的修复任务从最新 master 取上下文，但当前版本尚不自动处理所有跨 PR 基线更新场景。
- 部署验证最多尝试三次；失败令部署任务失败，不报告上线完成。不会未经审批回退 master；回退同样使用 PR。
- 修改自动化、已有测试或基线的任务需基础设施代码审查；普通自动任务可新增测试。
- 费用限制由 API 平台配置；工作流另设每任务超时和最多三轮，不提供精确费用预测。

## 首次基础设施 PR 的审批

尚未配置 App 时，当前 GitHub 连接使用 hxshen97 身份，首次 PR 也会由 hxshen97 创建。GitHub 不允许作者批准自己的 PR，因此本次通过聊天明确批准后由代理合入，或由你在检查后点击 Merge，作为一次性代码审批。后续任务必须由 App 建 PR，才能使用原生 Approve 门禁。本次不会提前合入 master 或启用部署。

官方参考：[Codex Action](https://learn.chatgpt.com/docs/github-action)、[GitHub token 与后续事件](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)、[分支保护](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)。
