# 验证证据

## 环境与范围

- 日期：2026-10-14；开发分支：codex/apple-homepage；基线提交：e2b6eb387edce09af5f7458739fd06a13604a947。
- 正式本地验收使用 Node 22.14.0（与 .nvmrc 一致）、npm 和现有 Chromium headless shell。
- 初次探索使用内置 Node 24.19.0，随后在固定 Node 22.14.0 上完成正式完整验收。
- 未修改原内容 Markdown、schema、头像、已有测试、内容基线、CI 或审批权限。

## 验收结果

| 需求编号 | 命令或场景 | 实际结果 | 证据 |
| --- | --- | --- | --- |
| R1 | 中英文桌面 / 移动主页截图审查 | 通过；黑白分区、头像比例、文字层级和布局无横向溢出 | 本地 .automation/apple-homepage/screenshots/ |
| R2 | 主页入场、滚动入场、动画结束、动态切换减少动态效果 | 通过 | 新增 tests/e2e/homepage.spec.ts |
| R2 | 禁用 JavaScript，360px 窄屏访问内容 | 通过；标题、项目、论文、文章区域和联系内容可读 | 同上 |
| R3 / R4 | npm run verify（Node 22.14.0） | 通过；44 单元 + 48 桌面 / 移动浏览器测试，类型检查、静态构建、完整性、临时博客公式和草稿检查 | 本地 .automation/apple-homepage/verify-node22.log |
| R3 | 最终主页测试版本，生产空博客构建 | 通过；12 项 | 本地 .automation/apple-homepage/final-homepage-tests.log |
| R3 | 最终主页测试版本，隔离发布文章构建 | 通过；12 项，首页文章列表与博客前四项一致，无 JS 仍可读 | 本地 .automation/apple-homepage/fixture-tests.log；复用 test:blog 的隔离构建，不修改生产内容 |
| R4 | 原有内容和路由完整性 | 通过；六个模块双语入口、详情 slug、资源、联系人与原内容保留 | verify 中 test:integrity |
| R4 | 旧简历 PDF 地址 | 通过；英文 / 中文地址均返回 404，网页无下载链接 | verify 中既有 CV 浏览器测试 |

## 单独只读审查

模型只读审查与开发 / 测试执行分开。发现新增测试固化空博客场景、入口选择器匹配多个链接的问题，已修复；最终复核未发现阻断问题。额外运行隔离有文章场景，避免把当前零文章状态固化为未来 CI 要求。

## 已知问题与未完成验证

- Astro 因当前无博客 Markdown 输出既有空集合提示；不生成示例文章填充主页。
- PublicationCard 中 abstract 变量存在既有未使用提示，类型检查 0 errors、0 warnings、1 hint。
- 共享 Markdown 正文保持原文，不声称中英文正文全部翻译。
- 更新 AGENTS.md 是共享首页维护方式的文档同步，依照控制文件规则保留 Draft PR 供基础设施审查；未修改任何审批规则。
- 本地日志、截图、隔离构建与工具均在 Git 忽略目录，不进入公开仓库。CI 结果以 PR 对应 head 的 quality / browser 为准。
- 尚未合入或部署；需用户批准具体 PR 当前 head，再检查 CI 与审批门禁。
