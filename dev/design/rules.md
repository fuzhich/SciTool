# 开发规则（Development Rules）

本文件规定开发过程中必须遵守的硬性规则。AI 助手与开发者均须遵守。

## 1. 环境规则

- **Python 环境**：所有 Python 相关操作（运行脚本、安装依赖、调试）必须使用 conda 环境 `agent-tool`（conda 位于 `D:\SDK\MiniConda`；gh CLI 也装在该环境）。
  - 调用方式（推荐，非交互式最稳）：`conda run --no-capture-output -n agent-tool python ...`；亦可用 `conda activate agent-tool`
  - 严禁在 `base` 或其他环境中运行 Python 代码，也不要 pip install 到 base。
  - Node / pnpm 等前端工具链用系统环境，与 conda 无关。
- **项目根目录**：`D:\Projects\SciTools`

## 2. 目录规则

- 仓库目录结构以 `design/architecture.md` §8 为**唯一事实源**；dev/ 各文件职责见 `dev/README.md`。
- `dev/secret/` 为私人信息目录，**严禁**提交到 Git/GitHub。

## 3. 版本控制规则

- `dev/secret/` 及其下所有内容 **严禁** 提交到 Git/GitHub（已在 .gitignore 中忽略）。
- 提交前必须检查：`git status` 中不得出现 secret 相关文件。
- 提交信息格式：`<type>: <简述>`，type 可选：`feat` / `fix` / `docs` / `refactor` / `test` / `chore`。
- 禁止将令牌（token）、密码写入任何会进入版本库的文件。

## 4. 开发流程规则

- 每次开发会话前，先阅读 `dev/memory/` 下的最新进度文档，了解当前状态。
- 每次开发会话后，更新 `dev/memory/` 下的进度文档。
- 重大设计决策必须先记录到 `dev/memory/design_decisions.md` 再实施。
- 不确定的需求或方案，写入 `dev/memory/pending_decisions.md` 并询问开发者，**不得自行假设**。

## 5. 保密规则

- 秘密信息只允许存放在 `dev/secret/` 中。
- 需要读取秘密信息时，直接读取该目录下对应文件，不得在聊天输出或代码中明文回显。
