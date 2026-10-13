# 验证记录

日期：2026-10-14（Asia/Shanghai）。

## 已完成

- Astro / TypeScript 检查：通过，0 错误；已有 PublicationCard 未使用 abstract 提示保留。
- 静态生产构建：通过，14 个页面。
- 内容完整性：已有项目、三篇学术成果、双语 YAML / PDF、头像哈希及十二个模块入口、项目详情通过。
- 临时博客构建：中英文公开文章与公式正常，草稿不出现在列表或详情；临时源文件已清理，生产 dist 不含测试文章。
- 桌面 / 移动端浏览器：最初36项中34项通过；2项失败源于测试错误地假定中英文邮箱相同。核对原始代码后分别记录原值，受影响的4项场景重跑全部通过。
- actionlint：工作流语法通过（本地未安装 shellcheck / pyflakes，因此这两种辅助检查未运行）。
- 单元测试涵盖语言工具、审批版本、检查失败 / 跳过、作者身份、门禁工作流和需求入口；最终数量见 PR 说明。

## 已知问题

- 英文页面 / 侧栏邮箱为 hxshen_fdu@outlook.com，中文联系方式页为 hxshen97_fdu@outlook.com。本次保留原值，未决定哪个正确。
- npm audit --omit=dev 显示既有依赖22项问题（5 low、4 moderate、12 high、1 critical），其中 Astro 的修复建议涉及大版本升级。未为基础设施任务擅自迁移框架；不宣称依赖审计通过。
- 目前没有博客正文数据；fixture 仅用于测试，不添加虚构个人文章。

## 未运行 / 未启用

- 用户尚未配置 OPENAI_API_KEY、AUTOMATION_APP_PRIVATE_KEY 和 AUTOMATION_APP_ID，故模型三轮流程、机器人建 PR 及审批后自动合入未端到端运行。
- 尚未配置远程分支保护；此次先交付代码及 PR。
- 未批准 master 合入，未执行部署 / 线上验证；不把当前线上站点当作本 PR 的部署结果。
- 本地 Chromium 下载器遇到 TLS 失败，使用系统下载工具取得同一 Playwright 版本的 Chromium，通过 PLAYWRIGHT_EXECUTABLE_PATH 运行。CI 仍使用标准安装方式。

浏览器截图 / 报告保存在忽略的 test-results 与 playwright-report；PR CI 运行后上传 GitHub artifacts。
