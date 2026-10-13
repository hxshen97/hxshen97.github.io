# 旧 API 流程归档

这些文件已从 .github/workflows/ 和 .github/codex/ 移出，GitHub Actions 不会注册或执行它们。

当前模式为 subscription / chat：在本地 Codex 使用 ChatGPT 登录与订阅额度，GitHub 仅做 CI 和部署。按 docs/automation.md 使用聊天代码审批。

api-workflows/ 和 api-prompts/ 保留 PR #1 的历史方案，不代表当前功能。旧 App 发布、合入和管理脚本也通过 mode 检查禁止在订阅模式运行。

今后如需恢复，必须明确授权 API 预算、恢复工作流及提示词到原位置、切换 mode 并配置对应身份和保护规则，另提 PR 审批；禁止自动恢复或自动切换 API 计费。
