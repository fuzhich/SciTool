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

### [D16] M3 打磨：更新通道与暗色主题（2026-10-14）

- **背景**：M3 里程碑——更新通道、暗色主题、设置页完善
- **结论**：
  - **平台自更新**：electron-updater 6 + generic/github provider（publish 配置指向 github: fuzhich/SciTool）；自动检查关闭（autoDownload=false），设置页手动「检查更新→下载→重启安装」；状态机（checking/available/not-available/downloading/downloaded/error）广播到壳层 UI；开发模式 forceDevUpdateConfig + dev-app-update.yml；冒烟验证检查链路（本地 server 发现 99.0.0）
  - **应用自更新**：manifest `update.url` → 更新清单 `{version, url}` → 版本比较 → 下载 zip → **先关闭该应用运行窗口**（防文件锁）→ 替换安装；应用卡片「检查更新」按钮；冒烟全链路验证 0.2.0→0.2.1
  - **暗色主题**：Tailwind v4 `@custom-variant dark` class 模式；全部组件 dark: 适配；标题栏主题切换按钮 + 设置页主题区；主题持久化于 settings
  - **设置页**：主题切换、关于（版本显示）、检查更新（状态+下载+重启安装）、数据目录迁移
  - **坑**：electron-updater 请求 latest.yml 带查询参数，测试 server 需剥离 query string；子应用更新时运行中的窗口会锁文件（Windows），必须先关窗
- **遗留**：
  - 暗色主题视觉效果待开发者目验
  - 代码签名证书购买（SmartScreen 消除）为外部事项 —— 开发者已决定**不签名**（自用/内部分发）
  - 卸载保护（data-backup）实测

### [D17] v0.1.0 发布（2026-10-14）

- **背景**：开发者确认发布 GitHub Release 作为真实更新源
- **结论**：
  - 已发布 **v0.1.0**：https://github.com/fuzhich/SciTool/releases/tag/v0.1.0 （公开）
  - 资产：SciTool-0.1.0-setup.exe（103MB）+ latest.yml（更新清单）+ blockmap
  - 发布方式：`GH_TOKEN=$(gh auth token) electron-builder --win --publish always`
  - **坑**：electron-builder 每次发布会创建**两个草稿** release 且文件分散其上（原因未明，疑似多次 publish 流程触发）；工作流：发布后检查 `gh api repos/fuzhich/SciTool/releases`，删除残缺草稿、保留文件齐全的并 `draft=false`，缺的资产用 `gh release upload --clobber` 补齐；**切勿用管道 head 截断发布命令输出**（SIGPIPE 会杀死上传流程）
  - **网络**：electron-updater v6 走 Electron net 模块（遵循系统代理），本机系统代理可用，更新检查应可达 GitHub；app-updater 用的 Node fetch 不遵循系统代理（子应用更新源建议选国内可达主机）

### [D18] 第一个真实应用：开发指南 DevGuide（2026-10-15）

- **背景**：M4 启动。开发者决定第一个真实应用为「开发指南」——介绍平台应用开发框架与接入要求，代码本身作为后续应用的参考实现；要求"像真正的应用"而非简单面板。发版流程备忘同时落地 `dev/memory/release_checklist.md`。
- **结论**：
  - 应用标识：id `com.scitool.dev-guide`，名称「开发指南 / DevGuide」，v1.0.0，minSdkVersion 0.2.0
  - 技术栈（示范栈）：React 19 + TS + Vite 7 + Tailwind v4（与平台壳同栈，含完整构建链路）；i18n 用 i18next + react-i18next（平台惯例）
  - 内容四章节：概览与架构 / 快速开始 / SDK 能力交互演练（6 能力现场调用）/ manifest 接入清单（校验规则对照 + 排查）
  - 权限：全量 6 权限（演示全部能力）；sharedDomains 声明 `devguide`（write）——演练用域，演示事件总线自闭环
  - 开发模式：浏览器 vite dev 时用内存 mock SDK（window.sdk 缺失时），正式运行走平台注入
  - 打包：vite 构建（base './'，相对路径适配 file://）→ PowerShell Compress-Archive 平铺 dist/* + manifest.json → dev-guide.zip
  - 工作区调整：pnpm-workspace.yaml 增加 `packages/apps/*`（原仅 packages/*，应用子目录未纳入 workspace）
  - 冒烟 harness 扩展：`SCITOOL_SMOKE_DOMAIN` 环境变量（默认 papers），使共享数据探针适配任意应用的域名授权
  - 视觉：沿用壳层 zinc 色系 + 蓝 accent + 深浅主题（.dark class），字体 Segoe UI/PingFang SC
- **理由**：与平台同栈的参考实现最利于后续应用复制模式；manifest 即"全权限示例"；mock SDK 让应用可脱离平台在浏览器开发调试。

### [D19] DevGuide 提示词导出 + 平台默认安装（2026-10-15）

- **背景**：开发者要求：① DevGuide 增加「导出 AI 开发提示词」功能（markdown 任务书，作为后续应用开发的 AI 前置提示词），导出时可选保存路径；② DevGuide 设为平台默认安装应用（用户可卸载）。
- **结论**：
  - **SDK 0.3.0 新增 `sdk.ui.saveTextFile({ defaultFileName, content })`**（权限 `ui`）：主进程弹原生保存对话框（parent 为调用窗口），写 UTF-8 文件；用户取消返回 `{ ok: true, data: null }`；SDK 语义化版本 0.2.0 → 0.3.0（只增不改）。应用沙箱无 Node 能力，保存对话框必须由平台提供。
  - **registerSdkHandler 改为 async**：`ipcMain.handle` 支持异步 handler，wrapper 用 `await` 以正确捕获异步 handler 的 rejection。
  - **DevGuide 新增「AI 提示词」页**（第五导航项）：`src/lib/dev-prompt.ts` 生成中文 markdown 任务书（角色/平台背景/硬性接入约束含 manifest 正则/SDK API 全量/开发流程/代码规范/交付完成标准/避坑清单），页面预览 + 导出。应用侧特性检测：无 `saveTextFile` 时回退浏览器 Blob 下载（mock 模式同）；minSdkVersion 保持 0.2.0 —— 示范优雅降级。
  - **默认安装 seed 机制**：打包时把 dev-guide.zip 经 extraResources 装入安装目录 `resources/default-apps/`（shell build:win 前先 `pnpm --filter @scitool/dev-guide package` 并拷贝 zip）；平台启动时 `seedDefaultApps()`：`platform_meta` 表无 `default_apps_seeded` 标记时安装该目录全部 zip 并写标记（**仅在目录存在时写标记**，失败/缺失不写以便重试）；用户卸载后不重装；dev 模式从 `packages/apps/dev-guide/dist/` 读取，缺失则跳过。冒烟模式下 seed 先行、再跑安装探针（避免同 id 并发安装）。
- **理由**：平台内置应用走「内置包 + 一次性 seed」是 VS Code 类产品的成熟模式，meta 表已存在天然承载标记；saveTextFile 归属 `ui` 权限避免新增权限类型；DevGuide 保持 0.2.0 minSdkVersion + 特性检测，向后续应用示范「新能力可用但非必需」的兼容写法。

### [D20] 实验管理应用设计（2026-10-15）

- **背景**：开发者发起第二个应用「实验管理」：自有实验文档格式（解析为可视化可编辑页：设置/表格/统计图/结果/备注）、文件夹系统（按 project 组织，新建/删除/移动）、两级导出（元素 CSV/PNG + 整体 zip+md）、接口化设计为 AI 阶段预留。
- **结论**（P12–P15 已确认）：
  - **应用标识**：id `com.scitool.exp-manager`，名称「实验管理 / Experiments」，v1.0.0，minSdkVersion 0.2.0；permissions 全量 + sharedDomains `[{ domain: "exps", access: "write" }]`。
  - **文档格式 expdoc v1**（JSON，接口化核心）：`{ format: "scitool-expdoc", version: 1, id, type, title, folderId, createdAt, updatedAt, settings[], tables[], images[], results[], notes }`。
    - settings：`{id, name, value, unit}` 键值行；tables：`{id, name, columns[{id,name,unit}], rows[按列 id 键值]}`；images：`{id, name, caption, mimeType, dataBase64}`（**首期无内置统计图生成，走图片上传**，用户原话；单图上限 5MB）；results：`{id, title, content(markdown)}[]`；notes：markdown。
    - 版本化 + `parseDoc`（parse → migrate → validate）纯函数接口；**AI 阶段 schema v2 扩展 charts[]（ECharts spec），迁移钩子已预留**。
  - **存储后端**：sharedData 域 `exps` 虚拟文件夹树。文件夹与实验均为 sharedData 文档（kind 区分）；实验文档 id = expdoc.id；保存用 expectedRevision 乐观锁（冲突提示刷新）；任意嵌套树（folderId: string|null）；删除文件夹时子项上移一级（confirm）；移动经目标文件夹选择对话框（v1 不做拖拽）。卸载应用数据不丢（shared_docs 保留，重装恢复域名授权）。
  - **里程碑**：M4a 文档引擎 + 编辑页（设置/表格/图片/结果/备注）；M4b 文件夹树（嵌套/新建/删除/移动）；M4c 导出（CSV 带 BOM/图片原样/zip+md+expdoc.json）+ 导入 + 平台 SDK 0.4.0 `sdk.ui.saveFile`（base64 二进制保存对话框，zip/png 导出必需）；M4e 实验类型模板体系（延后）。
  - **技术栈**：沿用 DevGuide 示范栈 + marked（markdown 预览）；**不引入 ECharts**（首期）；JSZip 留待 M4c。
  - **AI 接口预留**：expdoc schema 即契约（版本化+迁移）；导出 zip 内含原始 expdoc.json 供 AI 消费；导入与导出对称（AI 产出回流）；文档引擎 parse/serialize/validate/migrate 纯函数模块化，后续 AI 分析脚本作为新 pipeline 插入。
- **理由**：上传图片替代内置图表生成大幅降低首期复杂度且满足当前诉求；虚拟文件夹零平台改动并保留平台数据层优势（事件总线/乐观锁/卸载不丢）；JSON 文档天然是 AI 可消费的接口。

### [D21] 实验管理重构：块式渲染文档 + 全屏工作区（2026-10-15）

- **背景**：开发者反馈 M4a 表单式编辑器不符合预期，重新定义交互：实验文件是渲染文档（类 Notion/Typora），默认全屏，左文件树右文档，左上角悬浮面板承载元数据/设置/备注。
- **结论**：
  - **布局**：应用启动调用 `sdk.ui.maximize()`（**SDK 0.4.0 新增**，ui 权限）；整屏两栏——左侧嵌套文件夹树（M4b 并入主布局），右侧文档区；元数据悬浮面板**固定左上角 + 可折叠**（用户确认）
  - **expdoc v2 schema**：`{ format, version:2, id, folderId, createdAt, updatedAt, meta:{title,type,settings,notes}, blocks[] }`；blocks 为有序块序列：**text**（markdown，点击编辑、失焦渲染）/ **table**（CSV 拖入解析渲染，单元格就地编辑 + 行增删）/ **image**（拖拽为主 + 上传按钮兜底，base64 内嵌 ≤5MB）；实验结果归入正文文本块（用户确认）
  - **迁移 v1→v2**：tables→表格块、images→图片块、results→文本块（标题为一级标题）、settings/notes→meta、title/type→meta
  - **拖拽插入**：CSV/图片拖入文档按鼠标位置插入对应块
  - **块操作**：hover 菜单（上移/下移/删除/在其后插入文本块）
  - **文件树操作**：新建嵌套文件夹/重命名/删除（子项上移一级）/移动到（目标选择对话框）；新建实验（选目标文件夹）
  - **CSV 解析**：自研小型状态机（引号/逗号/换行），表头为列名，表格块名默认取文件名
- **理由**：块模型贴近科研记录习惯（表格与图片穿插文本），块序列可直接序列化为 markdown（导出更顺），AI 阶段可产出块级内容回流。

### [D22] 平台 AI 服务配置与应用代理调用（2026-10-15）

- **背景**：开发者要求平台级 AI 配置（API Key 统一填入），满足部分应用的 AI 需求；保存时自动检测 Key 有效性；应用经平台配置使用 AI。
- **结论**：
  - **设置页新增「AI 服务」区**：提供商预设（DeepSeek 默认 / OpenAI / 自定义）、Base URL、模型名、API Key（密码框，留空 = 保持原 Key）
  - **Key 安全**：Electron safeStorage（Windows DPAPI）加密后存 `ai-config.json`（与 settings.json 同级）；**明文与密文 Key 均永不下发应用**，应用仅见 available 布尔值与对话结果
  - **保存即验证**：GET `{baseUrl}/models`（Bearer 认证，15s 超时），有效才落盘；失败提示原因且不保存
  - **SDK 0.5.0 `sdk.ai`**（新权限 `ai`，manifest 白名单同步扩展）：
    - `available()` → 平台是否已配置可用 Key（返回布尔）
    - `chat(messages, { model?, temperature?, maxTokens? })` → 平台代理转发 OpenAI 兼容 `/chat/completions`（**net.fetch 走系统代理**），返回 `{ content, model, usage }`
  - **理由**：应用沙箱不能持 Key（防外泄），平台代理是唯一合理形态；net.fetch 遵循系统代理（Node fetch 不遵循，openai 域名必须走代理）；safeStorage 是 Windows 零成本原生加密。

### [D23] 论文管理应用设计（2026-10-15）

- **背景**：第三个应用「论文管理」：文件树管理论文 + PDF 导入自定义命名；开启 AI 后自动识别论文信息并结合网络信息构建元数据（作者/单位/时间/期刊）；单体知识库：团队近年发文、研究路径、引用网络溯源、复现线索（代码/数据集）。开发者确认按推荐方案执行。
- **结论**：
  - **AI 与学术 API 分工（核心原则）**：事实性数据（引用关系、作者论文、DOI 校准）必须来自学术 API（Semantic Scholar / Crossref，均免费）；AI 只做提取候选与总结解读，绝不生成引用关系（防幻觉）。
  - **三通道元数据链**：PDF 首页文本 → AI 提取 {标题, DOI} 候选 → Crossref（按 DOI）/ S2（按标题）权威校准 → 人工可编辑兜底。
  - **平台 SDK 0.6.0 三件套**（前置）：
    - `sdk.fileStore.put/get/remove/list`（新权限 `fileStore`）：应用私有二进制文件存储（`data/app-files/<appId>/`，uuid 前缀文件名 + 防穿越，单文件上限 50MB）——PDF 不落 sharedData 文本库
    - `sdk.net.get(url, headers?)`（新权限 `net`）：主进程 net.fetch 代理（无 CORS 限制、走系统代理），返回 {status, text}；仅 http(s)、30s 超时
    - `sdk.ui.pickFile(filters?)`（ui 权限）：文件选择对话框，返回 {name, data}（主进程读文件）
  - **文档模型**（沿用 expdoc 版本化 JSON 引擎模式）：`meta`（标题/作者/单位/年份/期刊/DOI 等）+ `pdfRef`（fileStore id）+ `citations`{refs/citedBy/fetchedAt} + `knowledge`{summary/trajectory/teamProfile/provenance/reproClues/generatedAt}——AI 结果落盘缓存，可重新生成。
  - **分阶段**：M5a 树+PDF 导入+三通道元数据链+可编辑面板；M5b S2 引用网络+两级辐射图（自研 SVG）；M5c 知识库四件套（摘要/研究路径/团队画像/溯源复现）；M5d 打磨（按需全文解析、规模测试）。
  - **技术要点**：PDF 解析用 pdfjs-dist（渲染进程）；元数据只依赖首页文本（双栏解析噪音规避）；S2 无 key 限额低，预留 key 配置位；图谱自研同心圆两级布局，不引物理引擎。
- **理由**：AI 幻觉在学术数据上是致命的，事实源必须 API 化；PDF 二进制必须平台文件存储承载；net 代理补齐 CORS 与系统代理问题。

### [D23 补充] 论文管理 AI 开关与降级路径（2026-10-15）

- **背景**：开发者补充要求：应用应具有「开启 AI」功能开关；无 AI 情况下基本功能应正常可用。
- **结论**：
  - **AI 开关**：应用顶部常驻开关（存 sdk.storage 键 `aiEnabled`，默认开）；开关开启且 `sdk.ai.available()` 为真时 AI 功能生效；未配置 Key 时开关自动禁用并提示「平台未配置 AI Key」
  - **无 AI 降级路径**：PDF 导入后自动走「pdfjs 内嵌元数据（Title/Author/DOI）→ DOI 有则 Crossref 权威校准 → 无 DOI 则留空待手填」——导入/树/命名/手填元数据等基本功能完全不依赖 AI
  - **AI 增强路径**（开关开）：内嵌元数据缺失时，解析首页文本交 AI 提取 {title, doi} 候选 → Crossref 校准 → 回填
- **理由**：基本功能可用性是底线（用户原话）；AI 只是增强层。

### [D24] 应用市场：GitHub 清单 + Release 资产（2026-10-15）

- **背景**：开发者确认应用生态是平台核心，SciTool 本体应有应用市场，直接访问其 GitHub 仓库安装应用；已确认 GitHub 存储无压力（仓库单文件 100MB、Release 资产单文件 2GB）。
- **结论**：
  - **市场清单 apps-market.json**：提交在仓库根（main 分支），市场页经 raw.githubusercontent.com 直链拉取（无 API 速率限制）；清单含 id/双语名称/描述/版本/minSdkVersion/zipUrl/size，zipUrl 指向 Release 资产（版本锚定）
  - **平台市场服务**（纯平台侧，不动 SDK）：主进程 market-service.ts——清单拉取（net.fetch 走系统代理）+ zip 下载到临时目录 + 复用 installApp 校验链路；shell 通道 marketFetch/marketInstall
  - **市场页 UI**：应用中心加「市场」标签页——应用列表（名称/描述/版本/大小）+ 状态（未安装→安装 / 有新版→更新 / 最新→打开）；安装后广播刷新
  - **版本比较**：复用 compareVersions；市场安装 = 覆盖安装（同一注册表链路）
  - **清单维护**：每次发版更新清单 zipUrl 至新 release
- **理由**：raw 直链免 API 限流且「永远指向 main 最新」；zip 走 Release 资产不膨胀仓库；清单与包源解耦（D11 预留）支持未来应用分散到独立仓库。
