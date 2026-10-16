# dev/ —— 人机共用开发记忆库（导航）

> 本目录是 SciTool 的开发管理中枢，供**开发者与 AI agent 共同**阅读维护。
> 设计原则：`design/` 记录「当前事实」（as-built，改了代码就改这里）；`memory/` 记录「过程」（历史、决策、进度快照）。

## 阅读顺序（AI 会话开始时 / 新成员加入时）

1. 本文件（导航）
2. `design/rules.md` —— 硬性规则
3. `memory/progress.md` —— 当前进度快照
4. `memory/pending_decisions.md` —— 待决事项

按需查阅：`design/architecture.md`（架构现状）、`memory/design_decisions.md`（决策史，D 编号）、`memory/release_checklist.md`（发版时）。

## 文件地图

| 文件 | 性质 | 何时读 | 何时写 |
|------|------|--------|--------|
| `design/architecture.md` | as-built 架构事实 | 涉及平台结构/SDK/数据/打包时 | 架构变更（先记 D 编号）后 |
| `design/rules.md` | 硬性规则 | 每次会话开始 | 规则变更时 |
| `design/workflow.md` | 协作工作流 | 每次会话开始 | 工作流调整时 |
| `memory/progress.md` | 当前快照（不重述历史） | 每次会话开始 | 每次会话结束 |
| `memory/timeline.md` | 历史流水（**唯一历史源**） | 追溯"何时做了什么" | 每次会话结束追加一行 |
| `memory/design_decisions.md` | 决策记录（**唯一决策源**，D 编号） | 追溯"为什么这么设计" | 重大决策先记后做 |
| `memory/pending_decisions.md` | 待决事项 | 会话开始 / 遇到不确定 | 提出新问题 / 结案时 |
| `memory/release_checklist.md` | 发版操作手册 | 发版时 | 发版流程变化时 |
| `secret/` | 私人信息（严禁入库） | 需要凭据时 | —（回答中不得回显明文） |

## 单一事实源（避免同一事实多处漂移）

| 事实 | 唯一来源 |
|------|----------|
| 版本号 | 各 `packages/*/package.json` + `apps-market.json` |
| 目录结构 | `design/architecture.md` §8 |
| 发版步骤 | `memory/release_checklist.md` |
| 设计依据 | `memory/design_decisions.md`（D 编号） |
| 历史事件 | `memory/timeline.md`（progress.md 只写当下） |
| SDK 能力 | `design/architecture.md` §4（以 `packages/sdk/src/shared/types.ts` 为代码源） |

## 术语表

| 术语 | 含义 |
|------|------|
| 平台壳 / shell | Electron 平台本体（packages/shell）：应用中心、市场、运行时、设置 |
| 应用 / app | 独立窗口+独立进程的子程序（packages/apps/*），经 SDK 使用平台能力 |
| SDK | `@scitool/sdk` 契约包；清单 `minSdkVersion` 不符拒载 |
| 权限 | manifest.permissions 共 9 种：storage / settings / log / ui / sharedData / events / ai / fileStore / net |
| 共享域 domain | 跨应用数据命名空间，manifest.sharedDomains 静态声明 + 安装时校验 |
| 里程碑 | 平台线 M1–M3（壳/数据/分发）；应用线 M4x（实验管理）、M5x（论文管理） |
| 冒烟探针 | `SCITOOL_SMOKE_*` 环境变量驱动的自动链路验证（见 architecture §10） |
| expdoc / paperdoc | 实验管理 / 论文管理的版本化 JSON 文档格式（AI 接口预留） |

## 维护约定（人与 AI 一致执行）

- 时间戳统一 `YYYY-MM-DD`（如 `2026-10-16`）；每个文件头部标注「性质 + 更新时间」
- 改代码的会话：结束前同步 `progress.md`（快照）+ `timeline.md`（追加一行）
- 架构/技术选型变更：先在 `design_decisions.md` 记 D 编号（背景/选项/结论/理由），再实施，再更新 `architecture.md`
- 不确定的需求：写入 `pending_decisions.md` 询问开发者，**不得自行假设**
- 敏感信息只进 `secret/`；任何文档、聊天输出不得回显明文
- Python 工具链用 conda `agent-tool` 环境；Node/pnpm 用系统环境（详见 rules.md）
