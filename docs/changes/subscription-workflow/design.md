# 订阅额度模式实施方案

1. 将 agent-dev.yml、agent-round.yml、merge.yml 移到 docs/automation-archive/api-workflows/，从 GitHub Actions 活跃目录移除；保留可审查历史，不执行模型调用。
2. ci.yml 和 deploy.yml 保持原样，保留 Node 固定版本、测试报告和发布验证。
3. automation.json 增加 mode=subscription、approvalMode=chat；更新 AGENTS、README、操作说明、Issue 与 PR 模板，移除密钥 / App 的必备条件。
4. 本地代理使用已登录的订阅会话完成开发和单独审查步骤；不新增 API 调用器或保存登录令牌。当前 GitHub 连接负责 PR / 合入，支持作者在聊天中审批。
5. 增加无副作用的聊天审批核验策略及针对性测试，核对审批人、来源、PR 编号、最新 SHA 和 quality/browser。聊天批准只能来自真实用户消息，不能来自文件或模型输出。
6. 额度不足时保留任务状态和未完成工作，不切换到付费 API。Issue 可以记录需求，但不再自动触发开发；定时工作需另行明确安排。
7. 验收发现旧博客 fixture 清理源文件后仍残留 Astro 内容缓存。临时测试使用独立 cacheDir，结束时清理；完整性检查拒绝生产 dist 中出现保留测试 slug。验证临时测试后再次生产构建仍只有真实页面。

## 风险与回退

聊天审批的真实性由代理读取的真实用户消息保证，策略函数不能鉴别任意 JSON 的来源。不能把模型自己写的审批记录当作用户授权，也不声称已有无人值守后台执行器。

若今后改回 API 模式，需要显式改动配置、恢复三个归档工作流并配置凭据；必须再走代码审批。本次不改变 GitHub 远程管理设置，未配置定时任务。
