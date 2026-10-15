# 验证证据

## 第三轮：React / GPU 动画真实首页 · 2026-10-15

预览 http://127.0.0.1:4393/ 与 /zh/。生产静态首页已在试验分支接入 React 动画岛，不是旧 Canvas 概念页；尚未合入或部署。

| 场景 | 实际结果 | 证据 |
| --- | --- | --- |
| npm.cmd run verify | 通过 | .tools/gpu-verify-final.log；44/44 单元测试，56/56 桌面/手机浏览器测试，类型、构建、完整性、公式/草稿检查通过 |
| GPU 场景实际运行 | 通过 | 本机 Chrome Three.js r186 生成真实 WebGL canvas，帧计数持续增长，无页面或着色器异常 |
| 形态插值与控制 | 通过 | 新增 tests/e2e/motion.spec.ts；环面结到轨道/波场 uniform 到达 1.000/2.000，暂停后帧计数不增加，系统减弱动画使脉冲禁用 |
| 无 WebGL 回退 | 通过 | 新增双语 E2E 强制禁用 WebGL，静态图可见、姓名和简历入口正常 |
| 无 JS 阅读、六模块双语功能 | 通过 | 原有测试保持未改，语言切换、路由、项目筛选、邮件、PDF 撤下行为通过 |
| 离屏停止与真实上下文丢失 | 通过 | 独立脚本 .tools/final-gpu-check.mjs，联系区停止绘制，实际 WEBGL_lose_context 后切到静态图并停止场景 |
| 最后 CSS 修正与视觉复核 | 通过 | 完整 verify 后仅加强卡片链接标题颜色选择器；重新 build，通过计算样式与桌面/手机截图检查，无溢出。未为该 CSS 重复整套测试 |
| git diff --check | 通过 | 规范变更文件换行；不更改任何内容基线或现有测试 |

最终截图：.tools/gpu-home-desktop.png、gpu-home-mobile.png、gpu-orbit.png。修复了场景负外边距遮挡 CTA、旧组件局部 CSS 导致标题/图标过暗的问题。第一轮类型检查在新增测试的 this 标注处失败，已修复；第二轮因 CTA 遮挡失败。第二轮运行后段与开发构建重叠导致三个临时 404，该轮结果不作为通过证据；最终重跑完整 verify 为 56/56。没有降低门禁。

### 成本、限制与交付状态

- 桌面 24000 个 GPU 粒子，移动/低核心设备 7000 个且关闭 Bloom；场景按需导入，只有可见/前台/未暂停/非减弱动画时连续调度。
- 构建场景块约 1011 kB、gzip 273 kB；React 客户端约 66 kB gzip，控制/GSAP 约 50 kB gzip。保留 Vite 大块警告，没有调高阈值掩盖成本。
- npm audit 报告 21 项依赖告警（含 Astro critical）；受影响的包名全部在本轮之前的锁文件中存在，不属于新动画库名单。此证据不等于风险未变化或已解决。本轮未擅自进行 Astro 7 等大版本安全迁移，需另行分析静态部署暴露范围与升级兼容性。
- 未测真实低端手机的 FPS/耗电；不声称 WebGPU 或所有设备 60 FPS。场景是数学形态示意，不是研究计算结果。
- README 与 AGENTS.md 仅同步架构描述，审批权限和验收门禁不变；由于涉及控制指南，交付保留 Draft PR。
- 实现后进行了代码只读复核和单独浏览器验收，但本轮未执行另一模型的独立只读审查，不能将自查当作独立审查。远程 CI 结果以 PR 当前 head 为准，Draft 不代表可合入。

## 第二轮强化预览 · 2026-10-15

新增 motion-study.html，预览入口 http://127.0.0.1:4392/，本地服务 .tools/serve-motion-study.mjs 只提供原型和第一轮概念板。生产网站未替换、未部署。

| 场景 | 实际结果 | 证据 |
| --- | --- | --- |
| 流场/轨道/晶格切换、连续绘制 | 通过 | .tools/check-motion-study.mjs；三个模式截图 |
| 暂停/继续、系统减弱动画动态切换 | 通过 | 检查绘制帧计数停止和恢复、脉冲禁用状态；嵌入浏览器延迟媒体事件时有低频状态同步，不持续重绘 |
| 图形离屏停止调度 | 通过 | 滚动到联系区后帧计数不再增加 |
| 双语文本与内容链接 | 通过 | 切换到中文后姓名、导航及 /zh/cv/ 链接正确，切回英文恢复 |
| 真实内容与阅读 | 通过 | 原型一个现有项目、三篇现有论文、空博客、真实邮箱；无简历 PDF 链接；不替代完整 CV |
| 手机与无 JavaScript | 通过 | 360px/390px 无横向溢出，无 JS 仍可阅读论文与使用内容链接；修复 360px 图形边距超出 2px 的问题 |
| 桌面/手机视觉检查 | 通过 | .tools/motion-study-desktop.png、motion-study-orbit.png、motion-study-lattice.png、motion-study-project.png、motion-study-mobile.png |
| npm.cmd run verify | 通过 | Node 22.14.0，本机 Chrome；44 个单元测试和 48 个浏览器用例全部通过，其余类型/构建/内容完整性/公式草稿检查通过。日志 .tools/motion-verify.log |
| git diff --check | 通过 | 仅探索文档与原型变更，无生产代码改动 |

首次 verify 在沙箱临时目录创建测试 Git 仓库时权限不足，43/44 单元测试通过，随后阶段没有运行。改在获准的正常本地环境执行同一原始命令，完整通过；未修改门禁。原型独立检查发现并修复窄屏溢出以及缩放后画布应立即绘制的问题，最终独立检查通过，无页面运行异常。

图形是数学空间的视觉示意，不宣称是论文结果或实际计算输出。连续动画与交互已检查，但未做真实低端手机耗电或帧率基准测试。独立模型审查及远程 CI 留待确定风格后的生产实施 PR。

验证日期：2026-10-14。当前为风格选择阶段，未开始全站 UI 实现，未创建实现 PR，也未部署。

| 需求编号 | 命令或场景 | 实际结果 | 证据 |
| --- | --- | --- | --- |
| R1 | git branch --show-current、git status --short | 通过 | codex/geek-ui-exploration；只新增设计技能与探索文档，生产源码无改动 |
| R2 | 原站与官方文档搜索、概念板数量检查 | 通过但有来源读取限制 | references.md 记录十种参考及读取限制 |
| R3 | node .tools/check-geek-board.mjs，使用本机 Chrome | 通过 | 十种概念、十个链接、暂停/继续、390px 无横向溢出、减弱动画、无页面脚本异常 |
| R3 | 桌面/移动全页截图人工查看 | 通过 | .tools/geek-board-desktop.png、.tools/geek-board-mobile.png；仅本地证据 |
| R4 | 官方技能下载、读取及许可证检查 | 通过 | .agents/skills/frontend-design/SKILL.md 与 LICENSE.txt |
| R4 | MagicPath 插件查询 | 未调用 | 找到插件并建议安装，尚未确认安装/连接 |
| 保留行为 | npm.cmd run verify | 通过 | Astro 0 errors、单元测试、静态构建、完整性、公式/草稿检查、48 个桌面/移动浏览器用例全部通过 |

## 环境与已知问题

默认沙箱初始化失败；获自动审查允许后运行本地命令。默认 PATH 只有 Node 24、没有 npm，Playwright 自带浏览器也未安装。完整验收改用仓库已有 .tools/node-v22.14.0-win-x64，设置 PLAYWRIGHT_EXECUTABLE_PATH 指向本机 Chrome，不修改测试配置或降低门禁。

Astro 有一个既有 PublicationCard 的 abstract 未使用提示；博客无正式文章为现有状态。Arwes 首页及 Robby 动态页的在线读取超时，详情见 references.md；概念预览不是原站截图。MagicPath 的实际使用仍等待用户安装/连接，不能将技能安装等同于外部插件已连接。

已执行概念板浏览器检查与截图查看；未执行独立模型审查和远程 CI，留待用户选定风格后的实现阶段。后续新增代码必须再次完整验收。选型板本地预览为 http://127.0.0.1:4391/，需要本机会话持续运行；HTML 文件可直接打开。
