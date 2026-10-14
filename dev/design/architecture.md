# 整体设计架构（Architecture）

> 状态：**草案 v0.2** —— 基于已确认决策（D1–D10）与同类产品架构调研修订，待开发者审阅。

## 1. 已确认决策摘要

| 编号 | 决策 | 结论 |
|------|------|------|
| D1/D5 | 产品定位 | 类 Anaconda 科研工具箱平台：统一框架下自研应用，快速找到并使用，应用间可共享数据 |
| D2 | 目标平台 | 仅 Windows |
| D3/D5 | 技术栈 | 排除 Python 系；Electron + React + TypeScript |
| D6 | MVP 范围 | 先搭平台，不捆绑具体应用 |
| D7 | 窗口形态 | 平台壳为启动器；应用为独立窗口、独立进程 |
| D8 | 界面语言 | 中英双语 i18n |
| D9 | 视觉风格 | 极简现代风（类 Notion/Linear） |
| D10 | 实施细节 | 示例应用（开发期）、pnpm、Tailwind 自研组件、MVP 仅本地 zip 安装 |

## 2. 同类产品架构调研结论（2026-10-14）

调研对象：Rubick / uTools（Electron 工具箱平台，直接对标）、VS Code / Theia（插件架构权威）、Joplin / Zotero（插件化桌面应用，Zotero 同属科研领域）。

### 2.1 借鉴的模式

| 模式 | 来源 | SciTool 采纳方式 |
|------|------|------------------|
| 声明式应用清单（manifest）驱动一切 | uTools plugin.json / VS Code package.json | 应用清单含：id、名称、版本、图标、入口、权限、minSdkVersion |
| 独立进程隔离（Extension Host 模式） | VS Code / Joplin PluginRunner | 每应用独立窗口+独立进程；崩溃不影响平台与其他应用，支持自动重启（退避策略） |
| SDK 只增不改 + 最低版本声明 | VS Code engines / Joplin app_min_version | SDK 语义化版本；清单声明 `minSdkVersion`，不符拒载 |
| RPC + 可序列化 DTO 通信 | VS Code | 应用↔平台仅经 IPC 通道传结构化数据，禁止直接传对象引用 |
| 数据经平台 API 访问，禁止直连底层库 | Joplin（学它，不学 Zotero） | 应用经 SDK 数据 API 访问共享数据，带命名空间权限域 |
| 事件总线（Notifier 模式） | Zotero | 跨应用数据流转基于订阅（如"PDF 批注→写作"），是生态繁荣的隐性基石 |
| 应用中心 = 注册中心，市场清单与包源解耦 | Joplin 市场 / Rubick | M1 本地安装即校验+注册；远程市场后置但架构预留 |
| 服务注册表（轻量 DI 思想） | Theia | 平台核心服务以"接口+注册表"组织，扩展点明确 |

### 2.2 明确避免的坑

| 坑 | 来源 | SciTool 对策 |
|----|------|--------------|
| preload 全量 Node 权限、无权限声明（信任开发者模型） | Rubick / uTools | 应用清单声明权限，主进程按白名单放行 IPC |
| 应用 UI 锁死在宿主面板内，仅适合轻工具 | uTools | 应用均为完整独立窗口（已定 D7） |
| 应用与宿主同进程，异常拖垮宿主 | Zotero（同进程模式） | 独立进程（见 2.1） |
| 更新机制缺失，事后补救 | Rubick | 应用清单预留更新元数据字段，M3 实现更新通道 |
| API 无版本管理，宿主大版本升级插件全量重写 | Zotero Z6→Z7 | SDK 语义化版本 + 弃用缓冲期 |

## 3. 总体架构

```
┌──────────────────────────────────────────────────────────┐
│                    平台壳（Platform Shell）               │
│  ┌──────────────┐   ┌─────────────────────────────────┐  │
│  │ 渲染进程      │   │ 主进程（Platform Core）           │  │
│  │ React + TS   │◄─►│ · 应用注册表（校验/安装/卸载）      │  │
│  │ 应用中心 UI   │IPC│ · 应用生命周期管理（启动/崩溃恢复） │  │
│  └──────────────┘   │ · 权限网关（按清单白名单放行）      │  │
│                     │ · 数据服务（M2：SQLite+事件总线）   │  │
│                     │ · 设置/日志/更新通道               │  │
│                     └───────────┬─────────────────────┘  │
└─────────────────────────────────┼────────────────────────┘
                    IPC 白名单（SDK 通道，按权限放行）
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
   ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
   │  应用 A      │        │  应用 B      │        │  应用 C      │
   │ 独立窗口+进程 │        │ 独立窗口+进程 │        │ 独立窗口+进程 │
   │ SDK (TS 类型)│        │ SDK (TS 类型)│        │ SDK (TS 类型)│
   └─────────────┘        └─────────────┘        └─────────────┘
```

## 4. 应用模型（App Model）

### 4.1 应用清单 manifest.json（核心设计）

```jsonc
{
  "id": "com.example.paper-notes",     // 全局唯一，反域名格式
  "name": { "zh": "论文笔记", "en": "Paper Notes" },
  "version": "1.0.0",                  // 语义化版本
  "minSdkVersion": "1.0.0",            // 最低 SDK 版本，不符拒载
  "description": { "zh": "...", "en": "..." },
  "icon": "assets/icon.png",
  "entry": "index.html",               // 应用入口页面
  "preload": "preload.js",             // 应用 preload（封装 SDK 调用）
  "permissions": ["storage", "log", "ui"],  // 权限声明（白名单依据）
  "update": { "url": "https://..." }   // 更新元数据（预留，M3 启用）
}
```

### 4.2 应用生命周期

```
安装：选择 zip → 校验（清单完整性/签名预留）→ 解压至 %APPDATA%/SciTool/apps/<id>/
     → 注册表登记 → 应用中心可见
启动：点击/命令 → 主进程校验权限与版本 → 创建独立 BrowserWindow（独立 session partition）
     → 加载 entry → 注入 SDK preload
运行：应用进程崩溃 → 主进程检测 → 记录日志 → 可自动重启（退避策略，可选配置）
卸载：注册表移除 → 删除应用目录 → 清理应用私有数据
```

### 4.3 应用包格式

- 开发/MVP 阶段：zip（含 manifest.json + entry + preload + assets）
- 目录结构：

```
app-package.zip
├── manifest.json
├── index.html
├── preload.js
└── assets/
```

## 5. App SDK 设计（@scitool/sdk）

### 5.1 设计原则

- **类型化**：SDK 为 TypeScript 包，应用开发获得完整类型提示（对标 utools-api-types 体验）
- **只增不改**：API 语义化版本；弃用先于移除（弃用缓冲期）
- **结构化通信**：所有 IPC 载荷为可序列化 DTO，不传对象引用
- **权限放行**：主进程权限网关按清单 permissions 白名单拦截非法调用

### 5.2 MVP 能力集（M1）

| 命名空间 | 能力 | 权限名 |
|----------|------|--------|
| `sdk.storage` | 应用私有键值存储 | storage |
| `sdk.settings` | 平台设置读取（语言/主题） | settings |
| `sdk.i18n` | 平台语言与本地化资源 | （随 settings） |
| `sdk.log` | 统一日志落盘 | log |
| `sdk.ui` | 窗口控制（最小化/关闭）、通知 | ui |

### 5.3 预留能力（后续版本）

- `sdk.sharedData`：共享数据 API（M2，见 §6）
- `sdk.events`：事件总线订阅（M2）
- `sdk.updater`：应用自更新（M3）

## 6. 数据共享设计（M2 范围，D5 后置原则）

- **存储**：SQLite（better-sqlite3），位于平台数据目录；M1 注册表暂用 JSON，M2 迁移
- **访问方式**：应用**不直连数据库**，一律经 `sdk.sharedData` API 读写；每应用有命名空间与权限域（学 Joplin 而非 Zotero）
- **共享与私有边界**：默认数据为应用私有；跨应用共享需显式声明共享域（如 `papers` 域）
- **变更通知**：`sdk.events` 事件总线，订阅共享域变更（Notifier 模式），支撑"PDF 批注→写作→翻译"流转
- **冲突控制**：文档型数据带 revision 字段（借鉴 uTools 文档库），为未来云同步预留

## 7. 安全设计

- `contextIsolation: true`、`nodeIntegration: false`、应用窗口 `sandbox: true`
- **权限网关**：IPC 通道按 manifest.permissions 白名单放行（对标 Rubick/uTools 教训的修正）
- 每应用独立 session partition，互不共享存储/Cookie
- 严格 CSP；远程内容默认禁用（开发期可配置例外）
- 安装校验：清单字段完整性 + zip 结构校验；代码签名与市场审核机制后置（伴随远程市场）

## 8. 技术选型

| 项 | 选择 | 说明 |
|----|------|------|
| 桌面框架 | Electron（最新稳定版） | 成熟、Node 后端契合开发者背景 |
| 前端 | React 18+ + TypeScript | 已确认 |
| 构建 | electron-vite | 现代、快速、TS 开箱即用 |
| UI 组件 | Tailwind CSS + 自研 shadcn 风格组件 | 极简现代风可控性最高 |
| 数据库 | better-sqlite3（M2 引入） | 同步 API、成熟 |
| i18n | i18next | 生态最成熟 |
| 打包 | electron-builder（NSIS） | Windows 标准分发 |
| 包管理 | pnpm workspaces | monorepo |
| 状态管理 | zustand | 轻量现代 |

## 9. 仓库目录结构（monorepo）

```
SciTools/
├── dev/                    # 开发管理（现有）
├── packages/
│   ├── shell/              # 平台壳（Electron 主进程 + React UI）
│   │   ├── src/main/       # 主进程：注册表/生命周期/权限网关/数据服务
│   │   ├── src/preload/    # 壳层 preload
│   │   └── src/renderer/   # React 应用中心 UI
│   ├── sdk/                # App SDK（应用侧 API + 类型 + IPC 通道定义）
│   └── apps/               # 应用（当前仅示例应用，见 D10-A1）
│       └── sample-app/
└── ...
```

## 10. 里程碑

| 里程碑 | 内容 | 产出 |
|--------|------|------|
| M1 | 平台壳：应用中心 UI、安装/启动/卸载链路（含权限网关与崩溃恢复）、SDK 最小集（storage/settings/i18n/log/ui）、示例应用 | 可运行的平台，完整验证链路 |
| M2 | 数据共享：SQLite、sdk.sharedData（命名空间+权限域）、sdk.events 事件总线 | 应用间数据共享能力 |
| M3 | 打磨与分发：更新通道、完整 i18n 覆盖、错误处理、NSIS 打包 | 可安装的 Windows 发行版 |
