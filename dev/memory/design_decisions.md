# 设计决策记录（Design Decision Records）

记录重大设计决策：日期、背景、候选方案、结论、理由。

## 模板

```
## [编号] 决策标题（日期）

- **背景**：为什么需要做这个决策
- **候选方案**：
  - 方案A：...（优点/缺点）
  - 方案B：...（优点/缺点）
- **结论**：选定方案
- **理由**：选择依据
```

---

## 已记录决策

### [D1] 产品定位：科研工具箱平台（2026-10-14）

- **背景**：确定 SciTool 的产品形态
- **结论**：类 Anaconda 的工具箱平台 —— 可添加各种应用，应用彼此独立，但通过平台共享部分数据；应用皆服务于科研，覆盖论文生产全流程（文献→写作→投稿等）
- **理由**：开发者原始需求，目标用户为科研人员

### [D5] 应用形态澄清：统一框架下的自研应用（2026-10-14）

- **背景**：开发者澄清"应用"的含义（2026-10-14 会话）
- **结论**：
  - SciTool 是一个**应用集合/入口**：科研人员无需逐个安装应用、到处寻找打开，在平台内即可快速找到并使用
  - 应用**不是**网络上现成的软件，而是在 SciTool 统一框架下开发的**个性化自研应用**
  - 统一框架 ⇒ 应用间可共享部分数据；共享数据的具体设计**后置**到开发具体应用时再思考
- **理由**：开发者口述需求

### [D2] 目标平台：仅 Windows（2026-10-14）

- **背景**：确定目标平台范围
- **结论**：仅支持 Windows 桌面
- **理由**：开发者指定；平台锁定后无需考虑跨平台复杂度，可选用 Windows 原生能力

### [D3] 排除 Python 系方案（2026-10-14）

- **背景**：技术栈初步筛选
- **候选方案**：PySide6/PyQt6（Python 系） vs 成熟非 Python 方案
- **结论**：排除 Python 系
- **理由**：Python 开发简便，但不适合中大型桌面应用（性能、打包、维护性）

### [D4] 开发者背景（2026-10-14）

- **背景**：了解开发者技术背景以匹配技术栈
- **结论**：开发者熟悉前后端 Web 开发；期望现代化前端风格；对桌面技术栈无明确偏好
- **理由**：开发者自述

### [D6] MVP 范围：先搭平台，不捆绑应用（2026-10-14）

- **背景**：确定 MVP 边界
- **结论**：MVP 优先搭建平台本身 —— 应用框架（SDK）、应用中心（安装/管理/启动）、运行时（独立窗口进程）、数据共享基础设施；**不内置任何具体应用**
- **理由**：开发者指定（2026-10-14 会话）

### [D7] 应用窗口形态：独立窗口进程（2026-10-14）

- **背景**：确定应用运行形态
- **结论**：平台壳作为启动器/应用中心；每个应用以独立窗口、独立进程运行，互不影响，可多开并排使用；数据共享经平台桥接 API
- **理由**：开发者确认（2026-10-14 会话）

### [D8] 界面语言：中英双语 i18n（2026-10-14）

- **背景**：确定界面语言策略
- **结论**：初期即实现中英双语切换（i18n 为架构级能力，文案资源随开发同步维护）
- **理由**：开发者确认（2026-10-14 会话）

### [D9] 视觉风格：极简现代风（2026-10-14）

- **背景**：确定 UI 视觉方向
- **结论**：类 Notion/Linear 极简现代风 —— 大量留白、柔和中性色、圆角卡片、细腻阴影
- **理由**：开发者确认（2026-10-14 会话）

### [D10] 实施细节决策 A1–A4（2026-10-14）

- **背景**：架构草案 v0.1 审阅
- **结论**：
  - A1：需要最小示例应用（仅开发期验证 SDK 与安装/启动链路，不随产品发布）
  - A2：包管理用 pnpm（monorepo）
  - A3：UI 组件用 Tailwind CSS + 自研 shadcn 风格基础组件
  - A4：MVP 应用安装源仅支持本地 .zip 包，远程应用市场后置
- **理由**：开发者确认（2026-10-14 会话）

### [D11] 架构修订：采纳同类产品调研模式（2026-10-14）

- **背景**：开发者要求参考 GitHub 上同类产品（star 多/权威）的架构设计，保证拓展性与稳定性
- **调研对象**：Rubick / uTools（Electron 工具箱平台）、VS Code / Theia（插件架构权威）、Joplin / Zotero（插件化桌面应用）
- **采纳**：声明式 manifest、独立进程隔离（Extension Host 模式）、SDK 只增不改+minSdkVersion、数据经平台 API 访问（学 Joplin 不学 Zotero）、事件总线（Zotero Notifier）、应用中心=注册中心、轻量服务注册表
- **规避**：preload 全量权限（改权限清单+白名单）、UI 锁死宿主面板、应用同进程、更新机制缺失、API 无版本管理
- **产出**：architecture.md v0.2

### [D12] M1 实施中的技术要点（2026-10-14）

- **背景**：M1 实施过程中踩坑与解决，记录以防复发
- **要点**：
  1. pnpm 11/12 弃用 `onlyBuiltDependencies`，须在 pnpm-workspace.yaml 用 `allowBuilds` 映射，否则 Electron 二进制不会下载（报 ERR_PNPM_IGNORED_BUILDS）
  2. Electron 二进制下载：`ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/` 环境变量直连最快（2.5MB/s）；`.npmrc` 中的 electron_mirror 不被 @electron/get 读取；系统代理 127.0.0.1:7897 可用但绕 npmmirror 会 ECONNRESET，走 GitHub 会超时（20.205.243.166 直连不通）
  3. 沙箱化 preload（sandbox: true）**不能 require 本地 chunk 文件**：多个 preload 入口共享 @scitool/sdk 模块时 rollup 会拆出 chunks/ 共享块，导致 SDK 注入静默失败（window.sdk undefined）。解法：壳层 preload 只 `import type` SDK 类型、通道常量放 shell 本地（src/shared/shell-channels.ts），保证 app-preload 是 SDK 唯一运行时导入方 → 无 chunk 拆分
  4. workspace 内 TS 源包（@scitool/sdk 的 main 指向 src/index.ts）必须用 externalizeDepsPlugin({ exclude: ['@scitool/sdk'] }) 强制打进 bundle，否则运行时按 ESM 解析 TS 源码报 ERR_MODULE_NOT_FOUND
  5. 冒烟测试方式：`SCITOOL_SMOKE_ZIP=<zip> pnpm dev` 自动执行 安装→启动→SDK 探针→卸载 验证链路；开发模式 userData 目录为 %APPDATA%/@scitool/shell（打包后为 %APPDATA%/SciTool）

### [D13] 打包分发方案（2026-10-14）

- **背景**：需求——最终产物为 installer.exe，可选定安装目录，安装后有 exe 直接打开
- **结论**：electron-builder + NSIS 经典安装器：
  - `oneClick: false` + `allowToChangeInstallationDirectory: true` + `perMachine: false`（每用户安装，无需管理员）
  - 安装器语言 zh_CN 默认 + en_US，桌面快捷方式 always
  - 产物：`dist/SciTool-<version>-setup.exe` + `dist/win-unpacked/SciTool.exe`
  - **坑**：artifactName 用 `${name}` 会得到 `@scitool\shell-setup.exe`（包名含斜杠→子目录，NSIS 写文件失败），必须用 `${productName}`
  - 镜像：electron-builder 下载 electron/NSIS/winCodeSign 需 `ELECTRON_MIRROR` + `ELECTRON_BUILDER_BINARIES_MIRROR` 环境变量，或 electron-builder.yml 的 `electronDownload.mirror`；git-bash 下静默安装 `/D` 参数传 Unix 路径会失败（安装向导交互模式正常）
  - **已验证**：开发者手动安装到 D:\Apps\SciTool 成功，启动正常，卸载项已注册
- **遗留**：exe 未签名（无证书），其他机器首次运行会有 SmartScreen 提示；代码签名证书与自动更新属 M3 范围

### [D14] 数据目录方案：默认安装目录/data + 可迁移（2026-10-14）

- **背景**：开发者要求数据不放在 C 盘 AppData，默认随安装目录存放（绿色便携风格），且支持自定义迁移
- **结论**：
  - **默认数据目录 = `<安装目录>\data`**（打包模式）；开发模式维持 `%APPDATA%/@scitool/shell`
  - **解析优先级**：迁移指针文件（`%APPDATA%/SciTool{,-dev}/datadir.json`）> 安装目录/data > AppData 兜底（无写权限时）
  - **迁移**：设置页「数据目录」→ 选择新目录（必须为空、不可嵌套/上级）→ 选择性复制核心数据（apps/app-storage/logs/data/registry.json/settings.json）→ 写指针 → 重启生效；原目录保留作备份
  - **坑**：整体复制 userData 会因 Chromium 缓存文件被运行中的应用锁定而 EACCES —— 必须选择性迁移，跳过 Cache/GPUCache 等可再生目录
  - **卸载保护**：NSIS include 脚本（build/installer.nsh）customUnInstall —— 卸载时把 data 移到 `%LOCALAPPDATA%\SciTool\data-backup` 并弹提示
- **验证**：打包模式数据落于安装目录/data（开发者手动安装实测）；迁移链路（复制+指针+重启生效）冒烟通过；卸载保护脚本已随安装器打包（卸载流程建议后续实测）

### [D15] M2 数据共享实现（2026-10-14）

- **背景**：M2 里程碑——SQLite 引入、共享数据 API、事件总线
- **结论**：
  - **存储**：better-sqlite3 13（预编译二进制经系统代理下载，electron ABI 经 install-app-deps 重编译）；数据库 `data/scitool.db`（WAL 模式）
  - **Schema**：`platform_meta`（迁移标记）、`apps`（注册表，替代 registry.json）、`app_domains`（域名授权）、`kv_store`（应用私有存储，替代 app-storage/*.json）、`shared_docs`（共享文档：id/app_id/domain/revision/data/时间戳）
  - **旧数据迁移**：首次启动自动迁移 registry.json + app-storage → SQLite，原文件移至 `legacy-json-backup/`；幂等（platform_meta 标记）
  - **sdk.sharedData**：get/put/list/remove；put 带 revision 冲突检测（expectedRevision 不匹配即拒绝）；**域名权限域**：应用经 manifest `sharedDomains: [{domain, access}]` 声明授权（安装时校验），运行时按 app_domains 校验读写
  - **sdk.events**：订阅域名 → 文档 created/updated/removed 事件推送到订阅窗口（Notifier 模式）；窗口关闭自动清理订阅；跨重启 revision 持续递增（WAL 持久化）
  - **SDK v0.2.0**：minSdkVersion 校验生效（示例应用升 0.2.0）
  - **修复 M1 遗留 bug**：storage.get 客户端响应解析错误（envelope 未解包，恒返 null）——M1 冒烟未覆盖读路径，M2 冒烟补齐
- **验证**：dev 与打包模式冒烟全绿（读写/冲突/事件/迁移/存储）
