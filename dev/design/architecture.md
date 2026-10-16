# 整体设计架构（Architecture）

> 性质：**as-built**（当前事实，不含历史过程）｜适用：v0.3.0（shell 0.3.0 / SDK 0.7.0）｜更新：2026-10-16｜校验依据：提交 955d368
> 维护约定：架构/选型变更 → 先在 `../memory/design_decisions.md` 记决策编号（D 编号），再实施，再更新本文。历史演进见 `../memory/timeline.md`。

## 1. 平台定位与决策索引

**SciTool = 仅 Windows 的科研工具箱平台**（类 Anaconda 定位）：统一框架下开发/安装个性化自研应用，应用皆为独立窗口+独立进程、经平台共享数据，覆盖论文生产全流程（文献 → 写作 → 投稿）。中英双语，极简现代视觉（类 Notion/Linear）。目标用户为科研人员。

设计与实施决策索引（理由/选项/细节见 `../memory/design_decisions.md`）：

| 编号 | 日期 | 结论（一句话） |
|------|------|----------------|
| D1 | 2026-10-14 | 产品定位：科研工具箱平台 |
| D2 | 2026-10-14 | 仅 Windows |
| D3 | 2026-10-14 | 排除 Python 系技术栈 |
| D4 | 2026-10-14 | 开发者背景：前后端 Web 开发 |
| D5 | 2026-10-14 | 应用 = 统一框架下的自研应用；数据共享后置 |
| D6 | 2026-10-14 | MVP 先搭平台，不内置应用 |
| D7 | 2026-10-14 | 应用 = 独立窗口 + 独立进程 |
| D8 | 2026-10-14 | 中英双语 i18n |
| D9 | 2026-10-14 | 极简现代视觉（类 Notion/Linear） |
| D10 | 2026-10-14 | 实施细节 A1–A4：示例应用 / pnpm / Tailwind 自研组件 / 本地 zip 安装 |
| D11 | 2026-10-14 | 采纳同类产品调研模式（借鉴与规避清单见决策文件附录） |
| D12 | 2026-10-14 | M1 技术要点：镜像/allowBuilds/沙箱 preload 限制/冒烟方式 |
| D13 | 2026-10-14 | 打包：electron-builder + NSIS 可选目录安装器 |
| D14 | 2026-10-14 | 数据目录：默认 `<安装目录>\data`、可迁移、卸载保留 |
| D15 | 2026-10-14 | M2：SQLite + sharedData（revision + 域名权限）+ events |
| D16 | 2026-10-14 | M3：平台/应用自更新通道 + 暗色主题 + 设置页 |
| D17 | 2026-10-14 | v0.1.0 发布 GitHub Release；双草稿发布坑处理 |
| D18 | 2026-10-15 | 首个真实应用 DevGuide（示范栈 = 后续应用模板） |
| D19 | 2026-10-15 | SDK 0.3.0 saveTextFile + 默认应用 seed 机制 |
| D20 | 2026-10-15 | 实验管理设计：expdoc v1 / exps 域 / 里程碑 M4a–M4e |
| D21 | 2026-10-15 | 实验管理重构：块式渲染文档 + 全屏工作区（expdoc v2）+ SDK 0.4.0 maximize |
| D22 | 2026-10-15 | 平台 AI 服务 + SDK 0.5.0 sdk.ai（Key 加密存储、不下发应用） |
| D23 | 2026-10-15 | 论文管理设计 + SDK 0.6.0（fileStore/net/pickFile）；AI 开关与降级路径（D23.1） |
| D24 | 2026-10-15 | 应用市场：GitHub 清单 + Release 资产 |

## 2. 总体架构

```
┌──────────────────────────────────────────────────────────────┐
│                      平台壳（Platform Shell）                 │
│  ┌────────────────┐      ┌─────────────────────────────────┐ │
│  │ 渲染进程        │      │ 主进程（Platform Core）          │ │
│  │ React 19 + TS  │◄────►│ · 应用注册表（安装/校验/卸载）    │ │
│  │ 应用中心 / 市场 │ IPC  │ · 应用生命周期（启动/崩溃恢复）   │ │
│  │ 设置 / 中英主题 │      │ · 权限网关（按清单白名单放行）    │ │
│  └────────────────┘      │ · 数据服务（SQLite + 事件总线）   │ │
│                          │ · fileStore / net / AI 代理      │ │
│                          │ · 市场服务 / 更新通道 / 日志设置  │ │
└──────────────────────────┴────────────────┬───────────────────┘
                     IPC 白名单（SDK 通道，按权限放行）
          ┌──────────────┬──────────────────┼──────────────┐
          ▼              ▼                  ▼              ▼
    ┌──────────┐   ┌──────────┐      ┌──────────┐   ┌──────────┐
    │ DevGuide │   │ 实验管理  │      │ 论文管理  │   │  …应用   │
    │ 独立窗口  │   │ 独立窗口  │      │ 独立窗口  │   │ 独立窗口  │
    │ 独立进程  │   │ 独立进程  │      │ 独立进程  │   │ 独立进程  │
    └──────────┘   └──────────┘      └──────────┘   └──────────┘
        每个应用：独立 BrowserWindow + 独立 session partition + SDK preload 注入
```

## 3. 应用模型（App Model）

### 3.1 应用清单 manifest.json（字段以 `packages/sdk/src/shared/types.ts` 的 `AppManifest` 为准）

```jsonc
{
  "id": "com.example.paper-notes",       // 全局唯一，反域名格式，不可变
  "name": { "zh": "论文笔记", "en": "Paper Notes" },
  "version": "1.0.0",                    // 语义化版本
  "minSdkVersion": "1.0.0",              // 最低 SDK 版本，不符拒载
  "description": { "zh": "...", "en": "..." },
  "icon": "assets/icon.png",             // 可选
  "entry": "index.html",                 // 应用入口页面
  "permissions": ["storage", "log", "ui"],            // 权限声明（白名单依据）
  "sharedDomains": [{ "domain": "papers", "access": "write" }], // 共享域授权，可选
  "update": { "url": "https://..." }     // 应用自更新清单地址，可选
}
```

### 3.2 应用包与安装

- 包格式：zip（manifest.json + entry 页面 + assets）；市场安装源 = GitHub Release 资产
- 安装：选择 zip / 市场下载 → 结构校验 → 解压至 `apps/<id>/` → 注册表登记 → 应用中心可见
- **默认应用 seed**：安装器把 `resources/default-apps/*.zip` 打包分发；平台首启安装并在 `platform_meta` 写标记；用户卸载后不重装

### 3.3 生命周期

```
启动：校验权限与版本 → 独立 BrowserWindow（独立 session partition）→ 注入 SDK preload
运行：崩溃 → 主进程检测 → 日志 → 自动重启（退避策略）
更新：manifest.update.url → 清单 {version, url} → 版本比较 → 下载 zip → 先关应用窗口 → 替换
卸载：注册表移除 → 删除应用目录 → 清理应用私有数据（shared_docs 保留）
```

## 4. App SDK（@scitool/sdk 0.7.0）

**设计原则**：类型化（TS 完整提示）；只增不改（语义化版本 + minSdkVersion 拒载）；结构化通信（IPC 只传可序列化 DTO）；权限放行（主进程网关按 manifest 白名单拦截）。所有调用返回 `SdkResult { ok, data?, error? }`。

| 命名空间 | API | 权限 |
|----------|-----|------|
| `sdk.storage` | `get / set / remove`（应用私有键值） | `storage` |
| `sdk.settings` | `get`（语言/主题）/ `getLanguage` | `settings` |
| `sdk.log` | `log(level, message, data?)`（统一落盘） | `log` |
| `sdk.ui` | `notify / minimize / close / maximize`；`saveTextFile`（文本导出）；`pickFile`（文件选择）；`saveFile`（二进制保存，base64） | `ui` |
| `sdk.sharedData` | `get / put(expectedRevision) / list / remove`（共享域文档，乐观锁） | `sharedData` + 域名授权 |
| `sdk.events` | `subscribe(domain, callback)` → 退订函数（created/updated/removed） | `events` |
| `sdk.ai` | `available()` / `chat(messages, options)`（平台代理转发 OpenAI 兼容接口） | `ai` |
| `sdk.fileStore` | `put / get / remove / list`（应用私有二进制，≤50MB/文件） | `fileStore` |
| `sdk.net` | `get(url, headers?)`（主进程代理，无 CORS，走系统代理） | `net` |

- 权限全集共 9 种（含 `settings`/`log`），与 manifest.permissions 白名单一一对应
- **版本沿革**：0.2.0 M2 基线（sharedData/events）→ 0.3.0 `saveTextFile` → 0.4.0 `maximize` → 0.5.0 `ai` → 0.6.0 `fileStore`/`net`/`pickFile` → 0.7.0 `saveFile`
- 无 `sdk.i18n` 命名空间：语言经 `settings.getLanguage` 获取，应用侧用 i18next 自管文案资源
- 应用无 Node 能力（沙箱）：一切平台能力（文件对话框、网络、AI）必须经上述 API

## 5. 数据层

- **SQLite**（better-sqlite3，WAL）：`data/scitool.db`，表：
  | 表 | 内容 |
  |----|------|
  | `platform_meta` | 迁移/seed 标记 |
  | `apps` | 应用注册表 |
  | `app_domains` | 共享域授权记录（安装时校验 manifest.sharedDomains 后写入） |
  | `kv_store` | 应用私有键值存储 |
  | `shared_docs` | 共享域文档（id/app_id/domain/revision/data/时间戳） |
- **访问规则**：应用不直连数据库，一律经 `sdk.sharedData`；默认私有，跨应用共享需 manifest 显式声明共享域
- **冲突控制**：`put` 带 `expectedRevision` 乐观锁，不匹配即拒绝；revision 跨重启持续递增
- **变更通知**：`sdk.events` 域名订阅（Notifier 模式），窗口关闭自动清理
- **文件存储**：`data/app-files/<appId>/`（uuid 前缀文件名、防穿越、单文件 ≤50MB）——PDF 等二进制走 `sdk.fileStore`，不进 SQLite
- **数据目录**（解析优先级）：迁移指针（`%APPDATA%/SciTool{,-dev}/datadir.json`）> `<安装目录>/data` > AppData 兜底；开发模式为 `%APPDATA%/@scitool/shell`；设置页可迁移（选择性复制 + 重启生效）；卸载时 data 移至 `%LOCALAPPDATA%\SciTool\data-backup`
- 旧 JSON 数据（registry.json、app-storage）首启自动迁入 SQLite，原文件移至 `legacy-json-backup/`

## 6. 安全设计

- 应用窗口：`contextIsolation: true`、`nodeIntegration: false`、`sandbox: true`、每应用独立 session partition
- 权限网关：IPC 通道按 manifest.permissions 白名单放行
- 严格 CSP；无 Node 能力泄漏至应用
- **AI Key**：Electron safeStorage（Windows DPAPI）加密存 `ai-config.json`；明文与密文均不下发应用，应用仅见 `available()` 布尔值
- 安装校验：清单字段完整性 + zip 结构校验；代码签名与市场审核**已决定不做**（自用/内部分发，接受 SmartScreen 提示）

## 7. 技术栈

| 项 | 选择 | 版本 |
|----|------|------|
| 桌面框架 | Electron | ^39.2.6 |
| 前端 | React + TypeScript | ^19.2.1 / ^5.9.3 |
| 构建 | electron-vite / Vite | ^5.0.0 / ^7.2.6 |
| UI | Tailwind CSS v4 + 自研 shadcn 风格组件 | ^4.1.11 |
| 数据库 | better-sqlite3 | ^13.0.3 |
| i18n | i18next + react-i18next | ^25.6.0 / ^16.3.0 |
| 状态管理 | zustand | ^5.0.8 |
| 打包 | electron-builder（NSIS） | ^26.0.12 |
| 包管理 | pnpm workspaces（monorepo） | — |
| 应用侧依赖（范例） | JSZip / xlsx(SheetJS) / marked / pdfjs-dist | 见各应用 package.json |

## 8. 仓库目录结构（唯一目录树事实源）

```
SciTools/
├── dev/                        # 人机共用管理目录（导航见 dev/README.md）
│   ├── design/                 # 架构（本文件）/ 规则 / 工作流
│   ├── memory/                 # 决策记录 / 进度快照 / 时间线 / 发版清单
│   └── secret/                 # 私人信息（严禁入库，git 已忽略）
├── packages/
│   ├── shell/                  # 平台壳（Electron 主进程 + React 渲染进程）
│   │   └── src/{main, preload, renderer, shared}
│   ├── sdk/                    # @scitool/sdk 契约包（类型 + IPC 通道 + createSdk）
│   └── apps/
│       ├── dev-guide/          # 开发指南（1.0.0）
│       ├── exp-manager/        # 实验管理（1.1.0）
│       ├── papers/             # 论文管理（1.0.0）
│       └── sample-app/         # 开发期示例（不发布）
├── apps-market.json            # 应用市场清单（平台经 raw 直链拉取）
└── pnpm-workspace.yaml
```

## 9. 里程碑与版本现状

**平台线**（平台壳能力）：

| 里程碑 | 内容 | 状态 |
|--------|------|------|
| M1 | 平台壳：应用中心、安装/启动/卸载、权限网关、SDK 最小集 | ✅ 2026-10-14 |
| M2 | 数据共享：SQLite、sharedData、events 事件总线 | ✅ 2026-10-14 |
| M3 | 打磨与分发：自更新通道、暗色主题、设置页、NSIS 打包 | ✅ 2026-10-14 |
| 发布线 | v0.1.0（平台首发）→ v0.2.0（+三应用 zip）→ v0.3.0（实验管理 v1.1.0 + 市场） | ✅ 三次发布 |

> 早期计划的"平台 M4（真实发布/签名/市场）"已演进落地：真实发布 = D17 起常态；应用市场 = D24 已上线；代码签名 = 已决定不做。

**应用线**：

| 应用 | 里程碑 | 状态 |
|------|--------|------|
| DevGuide 1.0.0 | D18/D19（含 AI 提示词导出、平台默认安装） | ✅ 完成 |
| 实验管理 1.1.0 | M4a 文档引擎（expdoc v3）✅ / M4b 文件夹树 ✅ / M4c 导出 ✅ / M4e 实验模板体系 | M4a–c 完成，M4e 延后 |
| 论文管理 1.0.0 | M5a 树+PDF 导入+三通道元数据链 ✅ / M5b 引用网络 / M5c 知识库四件套 / M5d 打磨 | M5a 完成，M5b/M5c 进行中 |

**当前版本**：shell 0.3.0｜SDK 0.7.0｜dev-guide 1.0.0｜exp-manager 1.1.0｜papers 1.0.0｜市场清单 3 应用。发版流程见 `../memory/release_checklist.md`。

## 10. 开发命令速查

| 场景 | 命令（仓库根执行） |
|------|--------------------|
| 开发运行平台 | `pnpm dev` |
| 类型检查 | `pnpm typecheck` |
| 构建平台 | `pnpm build` |
| 打包 Windows 安装器 | `pnpm build:win`（自动前置应用打包 + default-apps 拷贝） |
| 构建应用 zip | `pnpm --filter @scitool/<app> package`（dev-guide / exp-manager / papers） |
| 应用浏览器调试 | `pnpm --filter @scitool/<app> dev`（内存 mock SDK） |
| 冒烟测试（安装→启动→SDK 探针→卸载） | `SCITOOL_SMOKE_ZIP=<zip 路径> pnpm dev`；可选 `SCITOOL_SMOKE_DOMAIN`（共享域，默认 papers）、`SCITOOL_SMOKE_UI`（真实交互探针） |
| 发版 | 按 `../memory/release_checklist.md` |

- 开发模式数据目录：`%APPDATA%/@scitool/shell`（打包后 `%APPDATA%/SciTool` 或 `<安装目录>/data`）
- 依赖安装卡住先试 `ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/`（详见 D12）
