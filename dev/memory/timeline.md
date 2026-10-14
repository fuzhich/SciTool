# 时间步简表（Timeline）

按时间顺序记录每次工作会话的简要摘要。

| 时间 | 会话内容 | 产出 | 状态 |
|------|----------|------|------|
| 2026-10-14 | 项目初始化：建立 dev 目录结构（design/memory/secret）、制定开发规则与工作流、初始化 git 仓库、配置 GitHub 远程 | rules.md、workflow.md、architecture.md、memory 文档结构、.gitignore | 完成 |
| 2026-10-14 | 版本控制验证：conda 安装 gh CLI 至 agent-tool 环境、设备码登录（账号 fuzhich）、创建公开仓库 SciTool 并推送 main | 仓库 https://github.com/fuzhich/SciTool | 完成 |
| 2026-10-14 | 需求确认：产品定位（科研工具箱平台）、技术栈（Electron + React + TS）、MVP 范围（先搭平台）、窗口形态（独立进程）、i18n（中英）、视觉（极简现代风）；产出架构草案 v0.1 | 决策 D1–D9、architecture.md | 完成 |
| 2026-10-14 | 架构调研：并行调研 Rubick/uTools、VS Code/Theia、Joplin/Zotero 六产品架构，提炼借鉴与避坑清单，产出架构草案 v0.2 | 决策 D11、architecture.md v0.2 | 完成 |
| 2026-10-14 | M1 实施：monorepo 搭建（shell/sdk/sample-app）、主进程（注册表/权限网关/生命周期/崩溃恢复）、SDK 最小集、应用中心 UI（Tailwind 极简风+中英 i18n）、冒烟测试验证 安装→启动→SDK→卸载 全链路 | packages/ 全部源码、决策 D12 | 完成 |
| 2026-10-14 | 打包分发：NSIS 可选目录安装器配置与构建（93.8MB），开发者手动安装至 D:\Apps\SciTool 验证成功 | SciTool-0.1.0-setup.exe、决策 D13 | 完成 |
| 2026-10-14 | 数据目录方案：默认安装目录/data、设置页迁移（指针文件+选择性复制+重启）、NSIS 卸载保留 data；开发者实测安装后 data 位置正确 | 决策 D14、data-dir.ts、installer.nsh | 完成 |
| 2026-10-14 | M2 实施：SQLite（注册表/存储/共享文档）、sdk.sharedData（revision+域名权限）、sdk.events 事件总线、旧数据迁移、SDK v0.2.0；dev 与打包模式冒烟全绿 | 决策 D15、db.ts、shared-data.ts、event-bus.ts | 完成 |
