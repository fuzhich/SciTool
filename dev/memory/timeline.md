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
| 2026-10-14 | M3 实施：平台自更新（electron-updater+设置页）、应用自更新（update.url 全链路）、暗色主题、设置页完善；冒烟验证更新链路 | 决策 D16、updater.ts、app-updater.ts | 完成 |
| 2026-10-14 | v0.1.0 正式发布 GitHub Release（安装包+latest.yml 更新源上线），处理 electron-builder 双草稿坑 | 决策 D17 | 完成 |
| 2026-10-15 | 第一个真实应用 DevGuide：React+TS+Vite 参考实现（概览/快速开始/SDK 六能力演练/manifest 清单，mock SDK 浏览器预览），工作区纳入 packages/apps/*，冒烟 harness 支持 SCITOOL_SMOKE_DOMAIN + 渲染探针，发版流程备忘落地 release_checklist.md | packages/apps/dev-guide、决策 D18 | 完成 |
| 2026-10-15 | SDK 0.3.0（sdk.ui.saveTextFile 原生保存对话框）、DevGuide「AI 提示词」页（markdown 开发任务书导出，可选保存路径 + 浏览器下载回退）、平台默认安装 seed 机制（extraResources 内置 zip + 首启自动安装 + platform_meta 标记，卸载不重装）；冒烟验证 seed 生效与幂等 | 决策 D19、default-apps.ts | 完成 |
| 2026-10-15 | 实验管理应用 M4a：expdoc v1 文档引擎（接口化 + 版本迁移钩子）、exps 域仓库层（乐观锁）、编辑页（设置/表格/统计图上传/结果/备注）与 Home 列表页、双语 i18n；P12–P15 决策结案；冒烟全绿 | packages/apps/exp-manager、决策 D20 | 完成 |
| 2026-10-15 | 实验管理重构（D21）：expdoc v2 块模型（text/table/image 有序块 + meta 悬浮面板，v1 自动迁移）、全屏两栏工作区（嵌套文件夹树并入 + 拖拽插入块 + 单元格就地编辑）、SDK 0.4.0 maximize、自研 CSV 解析器；冒烟全绿 | 决策 D21 | 完成 |
| 2026-10-15 | 实验管理修复轮：迁移 bug（v1→v2 缺 format/version 导致树加载失败）+ 面板/保存按钮固定 + Ctrl+S + 点击空白即输入 + xlsx 支持 | — | 完成 |
| 2026-10-15 | 实验管理交互打磨：文本块无缝内联编辑（类 Typora，Enter 新建块）、文档区加宽至 1400px、表格规范化（格子统一/数值右对齐/表头 sticky/大表折叠展示） | — | 完成 |
| 2026-10-15 | 实验管理顶会式模块排版：图注（图下方居中/小号灰字）与表注（表上方）无缝内联编辑 + Figure/Table 自动编号 + 文本块去占位词 | — | 完成 |
| 2026-10-15 | 实验管理：树拖拽移动（含环防护）、点文件夹行开合、表格列名内联编辑、文本块改 textarea 根治回车两行问题 | — | 完成 |
| 2026-10-15 | 实验管理修复：拖入文件夹失效（dragover 每次必须 preventDefault）、点击误插新行（内容区限定 + 12px 边界） | — | 完成 |
| 2026-10-15 | 实验管理：顶会式正文排版（衬线 14px/1.7 行高/两端对齐）、行距收紧、空行退格合并回上一行末尾 | — | 完成 |
