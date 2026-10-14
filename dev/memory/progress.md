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

### 进行中

（无）

### 待办（下一步 · M4 分发）

- [ ] 真实发布：GitHub Releases 作为更新源（需开发者确认后执行 electron-builder --publish）
- [ ] 代码签名证书购买（SmartScreen 消除，约 ¥1000-3000/年）
- [ ] 卸载保护实测（卸载 → data-backup 链路）
- [ ] 暗色主题视觉目验
- [ ] 远程应用市场（架构已预留：市场清单与包源解耦）

## 历史进度

- 2026-10-14 会话一：项目初始化 + 版本控制验证
- 2026-10-14 会话二：需求确认（D1–D11）+ 架构调研（v0.2）
- 2026-10-14 会话三：M1 实施与全链路验证（D12）
