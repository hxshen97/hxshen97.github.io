# AGENTS.md — 个人主页仓库协作与重构指南

## 项目目标与本次初始化范围

这是 hxshen97 的个人主页代码仓库，远程仓库为 https://github.com/hxshen97/hxshen97.github.io，站点地址为 https://hxshen97.github.io。

重构目标是改善代码结构、模块复用和内容维护体验，同时完整保留现有个人信息、功能和中文 / 英文两个版本。本指南同时约束需求分析、方案、开发、测试、PR 与审批后合入的自动化流程。

## 必须保留的模块

| 模块 | 英文路由 | 中文路由 | 保留要求 |
| --- | --- | --- | --- |
| 个人主页概览 | `/` | `/zh/` | 个人介绍、头像、主要入口，以及精选项目、学术成果和最新文章展示 |
| 相关项目 | `/projects/` | `/zh/projects/` | 项目列表、详情页、标签筛选、仓库 / 演示链接、精选标记 |
| 博客文章 | `/blog/` | `/zh/blog/` | 文章列表与详情、日期排序、标签筛选、草稿过滤、Markdown 与 LaTeX 数学公式 |
| 学术成果 | `/publications/` | `/zh/publications/` | 标题、作者、发表渠道、年份、标签及可选论文链接、摘要 |
| 个人求职简历 | `/cv/` | `/zh/cv/` | 教育、工作经历、荣誉、技能及现有其他内容；英文和中文 PDF 下载 |
| 联系方式 | `/contact/` | `/zh/contact/` | 现有邮箱及社交 / 外部链接、侧栏联系入口 |

- 保留已有内容文件、静态资源、内容 slug 和双语详情页地址。当前没有文章数据时，也必须保留博客模块与新增文章能力。
- 不因模块抽取、设计调整或内容迁移删除信息、缩减功能，或把真实个人信息替换为示例文本。
- 不擅自更改姓名、学历、工作经历、论文信息、联系方式等事实；有矛盾时保留原值，在 PR 中列出差异供代码审批，不编造事实。
- 路由如需变更，必须提供旧地址兼容方案，并验证 GitHub Pages 下的行为。

## 已有技术栈与目录

- Astro 5、TypeScript、Astro 组件和 CSS；当前没有 React / Vue 等组件框架。
- 静态输出：`astro.config.mjs` 使用 `output: 'static'`、`trailingSlash: 'always'`。
- 内容集合：`src/content.config.ts` 定义 Zod schema；Markdown 存放在 `src/content/`。
- 数学渲染：`remark-math` 和 `rehype-katex`。
- 简历 PDF：`js-yaml` 读取数据，Puppeteer 将 HTML 模板输出为 PDF。

| 位置 | 职责 |
| --- | --- |
| `src/pages/` | 英文页面、动态详情页及 `zh/` 中文镜像路由 |
| `src/components/` | 侧栏、导航、项目 / 文章 / 学术成果卡片、标签与筛选 |
| `src/layouts/SidebarLayout.astro` | 共享布局 |
| `src/i18n/ui.ts` | `en` / `zh` 字典、`t`、`localizedPath`、`langSwitchPaths` |
| `src/styles/global.css` | 全局样式和主题变量 |
| `src/content/projects/` | 项目 Markdown |
| `src/content/publications/` | 学术成果 Markdown |
| `src/content/blog/` | 博客内容约定目录；可在新增文章时建立 |
| `cv/data.yaml`、`cv/data-zh.yaml` | 英文 / 中文 PDF 简历数据 |
| `cv/template.html`、`cv/generate.js` | PDF 模板与生成脚本 |
| `public/` | 头像、图标、`cv.pdf`、`cv-zh.pdf` 等公开资源 |
| `.github/workflows/deploy.yml` | GitHub Pages 部署流程 |
| `docs/superpowers/` | 既有设计与实现记录，阅读时需与实际代码核对 |

## 重构原则

1. 先梳理现有路由、内容来源和交互行为，再按模块逐步修改，保持每一步可构建、可审查。
2. 优先保留 Astro 静态架构。通过共享组件、布局和数据模型减少英文 / 中文页面的重复实现；路由文件可作为薄入口。
3. 分离内容、展示和交互。个人信息和简历数据可逐步集中管理，但迁移前核对网页简历与 YAML 数据，避免覆盖独有内容。
4. 保持内容集合 schema 与已有 Markdown 兼容；字段调整需要同步迁移、类型与所有消费页面。
5. 优先复用既有组件、样式变量和工具函数，避免只在某一个语言版本修复问题。
6. 不为结构整理引入无必要的依赖或前端框架。依赖变化需说明用途，并同步 `package-lock.json`。
7. 保持桌面与移动端导航、侧栏展开 / 收起、键盘操作、可见焦点、语义化结构和图片替代文本。
8. 保留现有简洁视觉方向；`DESIGN.md` 是设计参考。结构重构不自动授权大幅改版，用户新要求优先。
9. 不覆盖用户已有改动。用户已授权需求到 PR 的自动开发：允许创建 `codex/` 分支、提交、推送开发分支和创建 / 更新 PR。未经用户批准当前提交，不得合入或直接推送 `master`；推送 `master` 会触发部署。

## 双语约束

- 默认语言是英文，中文使用 `/zh/` 前缀；六个模块均需可在两种语言下访问。
- 新增或修改 UI 文案时同步维护 `src/i18n/ui.ts` 的两套字典，不能把回退到英文当作翻译完成。
- 共享组件显式接收语言参数；内部页面链接优先使用 `localizedPath`，语言切换使用 `langSwitchPaths`。
- 切换语言应到达当前页面的对应版本，详情页保留同一个内容 slug。
- 页面链接保留末尾 `/`；PDF、图片等文件资源链接使用实际文件路径，不附加 `/`。
- 内容集合目前在两种语言页面中共享 Markdown；已有中文简历等页面含独立中文内容。不能声称所有正文都已翻译，也不能在重构中丢弃已有译文。
- 保留中文 / 英文页面语言标记、页面标题和描述；元数据调整同步检查两个版本。
- 维护 `/cv.pdf` 与 `/cv-zh.pdf`，分别对应英文和中文下载入口。

## 本地命令与验证

项目 `package.json` 声明 Node.js >= 22.12.0，包管理使用 npm。

```sh
npm ci                 # 根据锁文件安装依赖
npm run dev            # 本地开发，默认 http://localhost:4321
npm run astro -- check # Astro / TypeScript 检查
npm test               # 双语工具与审批门禁测试
npm run test:integrity # 内容、资源和路由完整性
npm run test:blog      # 临时文章检查公式与草稿；不会进入生产构建
npm run test:e2e       # 已构建网站的桌面 / 移动端浏览器测试
npm run verify        # 完整本地验收流程；首次先 npx playwright install chromium
npm run build          # 静态构建，输出 dist/
npm run preview        # 预览生产构建
npm run cv             # 生成 public/cv.pdf 与 public/cv-zh.pdf
```

- 仅修改指南文件时检查文档内容与 diff，无需安装依赖或重新生成 PDF。
- 修改代码、路由、内容 schema 或配置后，执行 `npm run verify`。当前没有独立 lint 脚本；CI 的必要门禁名为 `quality` 和 `browser`。
- 页面或交互变化后，在生产预览中检查六个模块的中英文版本、语言切换、详情链接、标签筛选和移动端导航；涉及公式时检查公式显示。
- 修改简历数据、模板或生成器后再执行 `npm run cv`，查看两份 PDF 的文字、分页、链接和字体，再验证下载入口。
- 检查已有内容数量及关键字段是否在迁移前后一致；重点防止草稿公开、论文链接丢失、简历信息遗漏。
- 若缺少运行环境或检查失败，记录具体原因和未完成验证，不把“未运行”写成“通过”。

## 部署与已知待处理事项

- GitHub Actions 在推送 `master` 时构建并发布 `dist/` 到 GitHub Pages。
- 保持站点地址、静态输出和尾斜杠策略兼容现有部署。
- 本地、CI 与部署统一使用 `.nvmrc` 的 Node 22.14.0；仍满足 `package.json` 的 Node >= 22.12.0 要求。
- 网页简历内容与 PDF YAML 数据分开维护，后续抽取共享数据前应核对差异。
- 博客模块已有列表与详情路由，但当前未发现博客 Markdown 文件；不能为填充页面而编造文章。

## 每次交付要求

简洁说明修改了什么、保留了哪些行为、执行了哪些验证，以及仍有哪些已知问题。若变更影响内容维护方式、命令或架构，同步更新 README 和本指南，避免文档与实现脱节。

## 自动开发规则

- 原始需求是唯一需求输入；常规需求分析、方案和实现选择不另设人工审批。合理假设记入 `docs/changes/<编号>/requirements.md`。
- 开发前生成 `requirements.md`、`design.md`，交付前更新 `validation.md`。参照 `docs/templates/` 和 `docs/automation.md`。
- 开发、独立验收和模型只读审查分开执行；失败最多自动修复三轮，仍失败保留 Draft PR 与证据。
- 正式审批人为 `hxshen97`。自动合入只接受机器人创建、当前 head SHA 已被该用户批准且 CI 通过的 PR；提交变化后必须重新审批。
- GitHub App 写入身份只用于独立发布 / 合入任务；生成代码和测试的进程不获得 GitHub 写令牌，API 密钥由官方 Codex Action 代理管理。
- 不得降低验收要求、跳过测试或修改自动化自身权限以完成需求。自动任务可新增功能测试；已有测试、内容基线和控制文件变更需保留 Draft PR 供基础设施审查。
- 普通内容变更若触及被保护的既有 Markdown / YAML / PDF / 头像，需要在代码审批中明确审查基线变化，不能自动放宽内容保留检查。
- 自动化启用前需要一次性配置密钥、App 与分支保护；未配置时必须诚实报告，不能宣称已完成端到端运行。
