# 自动开发实施方案

采用已在聊天提出并由用户要求执行的方案：Codex 负责分析 / 编码，干净 runner 负责验收，独立 Codex 调用只读审查，确定性 GitHub 脚本负责 PR 和审批后合入。

1. AGENTS.md 明确自动提交 / 推送开发分支权限与 master 审批边界；标准文档在 docs/templates 中。
2. Issue 模板和 intake 将所有者原始需求转为 JSON 上下文；所有 shell 参数是固定路径，需求文本不会拼接进 shell。
3. 可复用 agent-round 生成代码并上传源文件，另一个无密钥 runner 根据 master 的控制脚本执行验收。保留源码删除语义：新源码下载到空目录，用 git reset --mixed 恢复原索引后比较变更。
4. 模型只读审查返回 schema 约束的 verdict/findings；三轮仍未通过时保持 Draft PR。源文件与失败日志供下一轮修复。
5. 发布器以独立 App 身份推送固定 codex/task 分支，使用精确租约保护并发更新。模型无 GitHub 写令牌。
6. 合入器只执行 master 代码，核验原生分支保护、所有者对最新 head 的批准以及 GitHub Actions 的 quality/browser 成功检查，再以 SHA 条件 Squash Merge。
7. Node 固定22.14.0；部署先验证再上传 Pages artifact，发布后验证十二个模块入口及两份 PDF。

已有主页布局、路由和数据不改；只修复英文博客 locale 比较的既有 TypeScript 错误。内容基线文本统一 LF，二进制原样哈希。

### 限制与回退

缺少 API / App 凭据时无法运行模型流水线；master 未保护时合入器拒绝工作。当前不自动解决所有跨 PR 基线变化 / 合并冲突，也不自动绕过分支保护；需要继续开发的冲突和失败以 Draft PR / 日志呈现。第一轮验证只针对本 PR 的本地代码、工作流语法与测试，不等同于整条远程流程运行通过。

回退使用 revert PR 删除新增基础设施并恢复旧部署流程；仍等待代码审批。站点内容与 PDF 均未迁移或修改。
