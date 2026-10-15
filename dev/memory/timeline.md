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
| 2026-10-15 | **里程碑：实验管理 v2 达成** —— 开发者验收「非常漂亮，又一里程碑」；无缝编辑 + 顶会排版 + 直接交互三线打磨完成 | — | 完成 |
| 2026-10-15 | DevGuide 任务书沉淀两个应用实战经验：技术栈清单（5.1）、实战六步（5.2）、无缝编辑与顶会排版要点（6.6）、避坑清单扩充 9 条实测坑 | — | 完成 |
| 2026-10-15 | 应用中心改版：极简磁贴（图标+名称）+ 单击右侧详情侧栏（版本/权限/安装时间/操作）+ 双击启动 | — | 完成 |
| 2026-10-15 | 平台 AI 服务（D22）：设置页 AI 配置（DeepSeek/OpenAI/自定义预设 + Key safeStorage 加密 + 保存即验证）；SDK 0.5.0 sdk.ai（新 ai 权限，平台代理转发，Key 不下发应用） | 决策 D22、ai-config.ts、ai-service.ts | 完成 |
| 2026-10-15 | 平台 AI 服务（D22）：设置页 AI 配置（DeepSeek/OpenAI/自定义预设 + Key safeStorage 加密 + 保存即验证）；SDK 0.5.0 sdk.ai（新 ai 权限，平台代理转发，Key 不下发应用） | 决策 D22、ai-config.ts、ai-service.ts | 完成 |
| 2026-10-15 | 平台 SDK 0.6.0（D23 前置）：fileStore 应用私有二进制存储（≤50MB/文件）、net 主进程网络代理（无 CORS/走系统代理）、ui.pickFile 文件选择；权限扩展至 9 种；DevGuide 任务书同步 | 决策 D23、file-store.ts、net-service.ts | 完成 |
| 2026-10-15 | 论文管理 M5a（D23）：PDF 导入（pickFile/拖拽 → fileStore）+ 三通道元数据提取（pdfjs 内嵌元数据/DOI→Crossref 校准无 AI 可用，AI 首页文本提取增强）+ AI 开关与降级路径 + 元数据可编辑面板；冒烟全绿 | packages/apps/papers | 完成 |
| 2026-10-15 | **v0.2.0 发布**：安装器 SciTool-0.2.0-setup.exe + 更新源上线 GitHub Release（含 dev-guide/exp-manager/papers 三个应用 zip 资产）；按 release_checklist 处理双草稿（删残缺草稿+补 blockmap+转正式） | — | 完成 |
| 2026-10-15 | 应用市场（D24）：apps-market.json 清单入库（zipUrl 锚定 v0.2.0 资产）、平台市场服务（raw 清单拉取 + zip 下载 + installApp 复用）、应用中心「市场」标签页（安装/更新/打开状态）；冒烟全绿 | 决策 D24、market-service.ts、market-view.tsx | 完成 |
| 2026-10-15 | 应用中心布局改版：应用/市场移至左侧边栏（品牌+导航+版本脚注），市场页新增搜索栏（按中英名称/描述过滤） | — | 完成 |
| 2026-10-15 | 实验管理：点击空白处光标定位到最近块末尾（文本进编辑态/表格图片后新建并聚焦/空文档从开头）+ Ctrl+滚轮缩放（50%–200%）与右下角固定缩放指示器（± 按钮、点百分比复位） | — | 完成 |
| 2026-10-15 | 实验管理 Word 式编辑：点击空白定位到上方最近块末尾（文本进编辑/图表后新建并聚焦）；点击文本块按点击坐标映射光标（caretRangeFromPoint 比例映射）；表格/图片块点击选中（高亮环）+ Backspace/Delete 删除；行首退格并入上一行、行尾 Delete 并入下一行 | — | 完成 |
| 2026-10-15 | 实验管理空白点击修复：移除 12px 忽略区（块间 10px 间隙完全落在忽略区内是「图片后无法输入」根因）；空白点击一律定位上方最近块（空白归属其上方内容，Word 语义）；非文本块后已有空文本块时复用聚焦不重复建行；拖入图片/表格落为末块时自动补空文本块 | — | 完成 |
| 2026-10-15 | 实验管理文本编辑架构重构：常驻透明 textarea + 底层渲染 markdown（光标行为完全原生，Word 式点击定位/选择/拖选）；渲染层归零段落边距、正文块内标题等字号加粗、取消两端对齐保证两层逐行对齐；图片/表格/图注表注模块设计不变 | — | 完成 |
| 2026-10-15 | 实验管理可交互区域修复：缩放容器补 min-h-full 打通高度链（此前文档区高度只到最后一个块，内容下方空白无法点击/拖放——「图片拖不到文本下方」根因）；点击处理上移至外层容器覆盖全部空白 | — | 完成 |
| 2026-10-15 | 实验管理悬浮面板改版：默认顶部居中、可拖拽（拖到哪停在哪，localStorage 持久化）、收起按钮更明显（蓝底 i 徽标胶囊/边框加粗 — 按钮） | — | 完成 |
| 2026-10-15 | **v0.3.0 发布**：实验管理 v1.1.0（Word 式编辑架构/缩放/可拖拽悬浮面板）+ 应用市场侧栏与搜索；修复悬浮面板初始化死锁（ref 未挂载导致位置永远算不出、面板不渲染）与文档交互区高度链；新增 SCITOOL_SMOKE_UI 真实交互探针并实测通过 | — | 完成 |
| 2026-10-15 | 实验管理多子表支持：expdoc v3（TableBlock 升级 sheets[] + activeSheet，v2→v3 自动迁移）；xlsx 解析全部工作表（跳空表）、CSV 单表；表格块显示表标签页（>1 表时，默认第一个可切换，选中态高亮），行数/编辑/增删行作用于当前表 | — | 完成 |
