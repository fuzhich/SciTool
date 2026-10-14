# 工作流约定（Workflow）

本文档定义 AI 助手与开发者之间的协作工作流。

## 1. 会话开始（Session Start）

1. 阅读 `dev/design/rules.md` 确认开发规则。
2. 阅读 `dev/memory/progress.md` 与 `dev/memory/pending_decisions.md`，掌握最新进度与待决事项。
3. 检查 git 状态，确认与 `dev/memory/latest_commit.md` 记录一致。

## 2. 开发循环（Development Loop）

```
需求确认 → 设计决策记录 → 实现 → 测试 → 提交 → 进度更新
```

- **需求确认**：需求不明确时，先写入 `dev/memory/pending_decisions.md`，通过提问向开发者确认。
- **设计决策**：涉及架构、技术选型、数据格式等重大决策，先在 `dev/memory/design_decisions.md` 记录（含日期、背景、选项对比、结论、理由），再实施。
- **实现**：小步提交，每完成一个可运行的功能点即提交。
- **测试**：运行测试与环境规则一致（conda `agent-tool`）。
- **提交**：按 `rules.md` 的提交信息格式提交，并同步更新 `dev/memory/latest_commit.md`。
- **进度更新**：更新 `dev/memory/timeline.md`（时间步简表）与 `dev/memory/progress.md`（工作进度汇总）。

## 3. 会话结束（Session End）

1. 确认所有变更已提交或已明确告知开发者未提交内容。
2. 更新 `dev/memory/timeline.md` 添加本次会话记录。
3. 更新 `dev/memory/progress.md` 汇总当前进度与下一步计划。
4. 如有未决问题，确认已写入 `dev/memory/pending_decisions.md`。

## 4. 沟通约定

- 开发者提问优先直接回答；涉及需决策的问题，给出**推荐方案 + 备选方案**及权衡。
- 任何写入 `dev/secret/` 的敏感信息，回答中不得回显明文。
- 遇到环境、权限、网络等问题时，主动向开发者说明问题与可选解决途径。

## 5. 版本管理约定

- 使用 GitHub 远程仓库 `SciTool` 作为唯一远程。
- 分支策略（初期）：单分支 `main` 直接开发；待项目规模扩大后改为 feature 分支 + PR。
- 每次推送前确保 `dev/secret/` 未被跟踪（`git check-ignore dev/secret/` 应返回该路径）。
