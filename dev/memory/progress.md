# 工作进度汇总（Progress Summary）

## 当前状态（更新于 2026-10-14）

### 已完成

- [x] 建立 dev 目录结构（design / memory / secret）
- [x] 制定开发规则（rules.md）：Python 必须使用 conda `agent-tool` 环境；secret 严禁入库
- [x] 制定工作流约定（workflow.md）
- [x] 建立 memory 进度追踪文档结构
- [x] 初始化 git 仓库与 .gitignore（已验证 dev/secret 被忽略）
- [x] 配置 GitHub 远程仓库：公开仓库 https://github.com/fuzhich/SciTool ，gh CLI（conda agent-tool 环境），登录账号 fuzhich
- [x] 需求确认与决策 D1–D11（产品定位、Electron+React+TS、MVP 范围、窗口形态、i18n、视觉风格、架构调研修订）
- [x] **M1 里程碑完成**：
  - monorepo：packages/shell（Electron 39 + React 19 + electron-vite 5）、packages/sdk（@scitool/sdk 契约层）、packages/apps/sample-app（开发期示例）
  - 主进程：应用注册表（JSON）、应用运行时（zip 安装校验/注册/启动/卸载）、权限网关（manifest 白名单）、崩溃恢复（退避重启）、日志/设置/存储服务
  - 应用窗口：独立进程 + 沙箱 + 独立 session partition + SDK 注入（window.sdk）
  - 应用中心 UI：Tailwind 极简现代风、应用卡片、安装/启动/卸载、中英切换（i18next）
  - 验证：冒烟测试打通 安装→启动→SDK 调用（日志/存储/设置/通知）→卸载 全链路；开发者手动 UI 测试通过
- [x] 环境问题解决：pnpm 12 allowBuilds、ELECTRON_MIRROR 镜像、沙箱 preload chunk 拆分（详见 D12）
- [x] **打包分发**：NSIS 可选目录安装器（SciTool-0.1.0-setup.exe），开发者实测安装到 D:\Apps\SciTool 并启动成功；卸载项注册正常（D13）
- [x] **数据目录方案**：默认 `<安装目录>\data`；设置页迁移（指针+选择性复制+重启）；卸载保留 data（NSIS 脚本）；开发者实测安装后 data 位置正确（D14）
- [x] **M2 里程碑完成**（D15）：
  - SQLite（better-sqlite3）：注册表/私有存储/共享文档入 `data/scitool.db`（WAL）；旧 JSON 自动迁移+备份
  - `sdk.sharedData`：get/put/list/remove，revision 冲突控制，域名权限域（manifest sharedDomains → app_domains 校验）
  - `sdk.events`：域名订阅 → created/updated/removed 事件推送（Notifier 模式），窗口关闭自动清理
  - SDK v0.2.0；修复 M1 遗留 storage.get 解析 bug
  - dev 与打包模式冒烟全绿
- [x] **M3 里程碑完成**（D16）：
  - 平台自更新：electron-updater（generic/github provider）+ 设置页检查/下载/重启安装；冒烟验证检查链路
  - 应用自更新：manifest update.url → 下载替换（先关窗口防锁）；冒烟全链路 0.2.0→0.2.1
  - 暗色主题（Tailwind v4 class 模式）+ 设置页（主题/关于/更新/数据目录）
- [x] **发版流程备忘**：`dev/memory/release_checklist.md`（发布前检查/构建发布/双草稿处理/发布后验证，依据 D13/D17）
- [x] **第一个真实应用：开发指南 DevGuide**（D18）：
  - 定位：平台应用开发框架介绍 + SDK 能力现场演练，代码即后续应用的参考实现
  - 技术栈：React 19 + TS + Vite 7 + Tailwind v4 + i18next（与平台壳同栈）；浏览器 dev 模式挂内存 mock SDK
  - 四章节：概览与架构 / 快速开始 / SDK 六能力交互演练 / manifest 接入清单；权限全量 + devguide 域（write）
  - 打包：vite build（base './'）→ zip 平铺；manifest 校验规则全过
  - 冒烟全绿：安装→启动→React 渲染→SDK 探针→域名授权→共享数据/乐观锁→事件→卸载（harness 新增 SCITOOL_SMOKE_DOMAIN + 渲染探针）
- [x] **DevGuide 提示词导出 + 平台默认安装**（D19）：
  - SDK 0.3.0 新增 `sdk.ui.saveTextFile({ defaultFileName, content })`：原生保存对话框写 UTF-8 文件，取消返回 data:null（ui 权限）；registerSdkHandler 改 async
  - DevGuide 新增「AI 提示词」页：中文 markdown 开发任务书（角色/平台背景/manifest 校验规则/SDK API/开发流程/规范/交付标准/避坑清单），预览 + 导出可选路径；无对话框能力回退浏览器下载（minSdkVersion 保持 0.2.0 示范优雅降级）
  - 默认安装：打包时 dev-guide.zip 经 extraResources 装入 `resources/default-apps/`（shell build:win 自动前置 package + 拷贝）；首启 seedDefaultApps 自动安装并写 platform_meta 标记，**卸载后不重装**；冒烟验证 seed 生效 + 幂等（二次运行 0 seed）
- [x] **实验管理应用 M4a**（D20，P12–P15 已结案）：
  - expdoc v1 文档引擎（接口化）：types/validate/migrate/factory 纯函数模块，parseDoc/serializeDoc 统一入口，版本迁移钩子预留（AI 阶段 v2 扩展 charts）
  - 仓库层：sharedData 域 exps（文件夹/文档 kind 区分），expectedRevision 乐观锁，listNodes/移动/删除文件夹子项上移逻辑就绪
  - 编辑页：基本信息/实验设置行/可编辑表格（列增删改+行增删）/统计图上传（≤5MB base64）/结果 markdown 块/备注 markdown（预览切换）+ 保存 dirty 提示与冲突提示
  - Home 列表页：新建/打开/删除；i18n 双语；浏览器 mock SDK
  - 冒烟全绿（SCITOOL_SMOKE_DOMAIN=exps：安装→启动→React 渲染→域授权→共享数据/乐观锁→事件→卸载）

### 进行中

- **M4b 实验管理文件夹树**：嵌套文件夹 UI（新建/重命名/删除子项上移/移动选择对话框），Home 页树+列表布局

### 待开发者验证

**实验管理 M4a UI 测试**（zip：`packages/apps/exp-manager/dist/exp-manager.zip`）：

- [ ] 应用中心安装 → 新建实验 → 编辑各分区（设置/表格列行/上传统计图/结果 markdown 预览/备注）→ 保存后返回列表 → 重新打开数据完好
- [ ] 保存冲突提示：两窗口打开同一文档分别修改保存，后保存者应看到冲突提示
- [ ] 暗色主题下编辑页视觉效果

**DevGuide 应用 UI 测试**（构建 zip：`pnpm --filter @scitool/dev-guide package`，或直接用已构建的 `packages/apps/dev-guide/dist/dev-guide.zip`）：

- [ ] 应用中心安装 dev-guide.zip → 启动，五个章节浏览正常（中英文）
- [ ] SDK 演练逐项点击：存储/设置/日志/通知/共享数据（put 后 list 可见、expectedRevision 冲突报错）/事件（订阅后写测试文档收到 created/updated）
- [ ] 语言跟随：平台切换语言后重启应用，界面语言切换；主题跟随暗色
- [ ] 「AI 提示词」页导出 .md：保存对话框可选路径，导出的 markdown 内容完整
- [ ] 浏览器 dev 模式抽查（mock SDK 横幅出现）：`pnpm --filter @scitool/dev-guide dev`

**默认安装验证**（需重新打包安装器，见 release_checklist）：

- [ ] 新安装器覆盖安装后首次启动，应用中心自动出现「开发指南」
- [ ] 卸载「开发指南」后重启平台，不应自动重现

**M3 遗留测试清单**：

- [ ] 重装 M3 新安装器（覆盖安装 D:\Apps\SciTool，data 应保留）
- [ ] 设置 → 检查更新 → 应显示「已是最新版本」（验证更新通道可达 GitHub Release v0.1.0）
- [ ] 暗色主题视觉目验（标题栏 🌙 切换）
- [ ] 卸载保护实测：卸载 → data 应出现在 `%LOCALAPPDATA%\SciTool\data-backup` 并弹提示

### 待办（下一步 · M4 分发）

- [ ] 远程应用市场（架构已预留：市场清单与包源解耦）
- [ ] 第一个真实科研应用（候选：文献管理 / PDF 批注 / 写作 / 翻译；可参考 DevGuide 的实现模式）
- [ ] 代码签名：开发者已决定**不需要**（自用/内部分发）

## 历史进度

- 2026-10-14 会话一：项目初始化 + 版本控制验证
- 2026-10-14 会话二：需求确认（D1–D11）+ 架构调研（v0.2）
- 2026-10-14 会话三：M1 实施与全链路验证（D12）
- 2026-10-14 会话四：打包分发 + 数据目录方案（D13、D14）
- 2026-10-14 会话五：M2 数据共享 + M3 打磨 + v0.1.0 发布（D15–D17）
- 2026-10-15 会话六：第一个真实应用 DevGuide + 发版流程备忘（D18）
- 2026-10-15 会话七：DevGuide 提示词导出 + 平台默认安装（D19，SDK 0.3.0）
- 2026-10-15 会话八：实验管理应用 M4a——expdoc 文档引擎 + 仓库层 + 编辑页/列表页（D20）
