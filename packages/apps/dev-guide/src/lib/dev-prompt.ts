// AI 前置提示词（开发任务书）：导出为 markdown，粘贴给 AI 后再追加新应用需求。
// 注意：模板内不使用反引号与 ${，避免转义问题；代码用缩进块呈现。
export function buildDevPrompt(sdkVersion: string): string {
  return `# SciTool 应用开发任务书（AI 前置提示词）

> 用途：将本任务书粘贴给 AI 助手，再在其后追加你的新应用需求，即可获得符合平台约束的开发方案与可安装的应用包。
> 适用平台：SciTool SDK ${sdkVersion}

## 1. 角色与目标

你是一名资深桌面应用工程师，精通 Electron 生态与前端工程。你的任务：为 SciTool 平台开发一个新应用，最终交付一个可安装、可运行、符合接入约束的 zip 应用包。开发前先通读本任务书；任何与本任务书冲突的假设一律以本任务书为准。

## 2. 平台背景（一句话架构）

- SciTool 是 Windows 科研工具箱平台（类 Anaconda 定位）：平台壳 + 独立应用，应用之间经平台共享数据。
- 平台技术栈：Electron 39 + React 19 + TypeScript + Vite + Tailwind v4，pnpm monorepo。
- 应用模型：应用 = zip 静态网页包 + manifest.json。平台负责安装（校验）、启动（独立窗口/独立进程/沙箱）、权限管控、数据服务（SQLite）、日志与更新通道。
- 应用不得直连平台数据库，一律经 window.sdk 访问平台能力。

## 3. 硬性接入约束（违反即安装失败或运行报错）

### 3.1 manifest.json 校验规则（逐字段）

| 字段 | 必填 | 规则 |
|------|------|------|
| id | 是 | 3–64 位，正则 ^[a-z0-9][a-z0-9._-]{2,63}$，反域名格式（如 com.fuzhich.paper-notes），全局唯一 |
| name | 是 | { zh, en } 双语，均为非空字符串 |
| version | 是 | x.y.z 语义化（正则 ^\\d+\\.\\d+\\.\\d+$） |
| minSdkVersion | 是 | 不高于平台 SDK 版本（当前 ${sdkVersion}），否则启动被拒 |
| description | zh 必填 | 建议 { zh, en } 双语 |
| entry | 是 | 入口页面相对路径（如 index.html）；路径越界（../）拒绝安装；文件必须真实存在于包内 |
| permissions | 是 | 数组，仅允许 storage / settings / log / ui / sharedData / events / ai / fileStore / net 九种；未知权限名拒绝安装 |
| sharedDomains | 否 | [{ domain, access }]；domain 正则 ^[a-z][a-z0-9-]{0,63}$；access 为 read 或 write |
| update | 否 | { url }：应用自更新清单地址，清单格式 { version, url } |
| icon | 否 | 应用中心图标路径 |

### 3.2 运行时约束

- 应用是纯静态前端：无 Node API、无 require；nodeIntegration 关闭、sandbox 开启、contextIsolation 开启（平台固定，不可配置）。
- 唯一平台交互入口：window.sdk（平台 preload 统一注入，应用不得自带 preload）。
- 权限双闸：① manifest.permissions 白名单（IPC 通道级，未声明调用返回 permission denied）；② manifest.sharedDomains 域名授权（数据级，write 自动含 read）。
- 中英双语：name / description 双写；UI 语言跟随 sdk.settings.getLanguage()（zh / en）。
- 主题跟随：sdk.settings.get() 返回 theme（light / dark），根元素切换 .dark class（Tailwind v4 class 模式）。
- 入口以 file:// 加载：构建必须 base: './' 相对路径，否则资源 404。
- zip 结构：manifest.json 与入口/资源平铺于根目录，不得多嵌套一层目录。
- 崩溃恢复：渲染进程崩溃平台自动重启 1 次；窗口关闭自动清理事件订阅。

## 4. SDK API（全部返回 Promise<SdkResult>，不抛异常，错误进 res.error）

SdkResult<T> = { ok: boolean; data?: T; error?: string }

| 能力 | 权限 | API |
|------|------|-----|
| 标识 | — | sdk.version、sdk.appId |
| 私有存储 | storage | sdk.storage.get(key) / set(key, value) / remove(key)；按应用隔离（SQLite kv_store），卸载清除 |
| 平台设置 | settings | sdk.settings.get() 返回 { language, theme }；sdk.settings.getLanguage()；只读 |
| 日志 | log | sdk.log(level, message, data?)；level 取 debug / info / warn / error；落平台日志文件 |
| 界面 | ui | sdk.ui.notify({ title, body }) 系统通知；sdk.ui.minimize() / close() 窗口控制；sdk.ui.saveTextFile({ defaultFileName, content }) 弹原生保存对话框并写 UTF-8 文件，用户取消时 data 为 null |
| 共享数据 | sharedData + 域名授权 | sdk.sharedData.get(id) / put(id, data, { domain, expectedRevision? }) / list({ domain? }) / remove(id, expectedRevision?)；文档带 revision 乐观锁，并发写必须传 expectedRevision |
| 事件 | events + 域名授权 | sdk.events.subscribe(domain, callback) 返回退订函数；事件类型 created / updated / removed |
| AI | ai | sdk.ai.available() 平台是否已配置 Key；sdk.ai.chat(messages, { model?, temperature?, maxTokens? }) 经平台代理调用 OpenAI 兼容服务，返回 { content, model, usage }。Key 由平台设置页统一配置，永不下发应用 |
| 二进制文件 | fileStore | sdk.fileStore.put(name, Uint8Array) 返回文件 id；get(id) / remove(id) / list()。应用私有目录隔离，单文件 ≤50MB。PDF 等大二进制不要塞 sharedData（SQLite 文本库） |
| 网络代理 | net | sdk.net.get(url, headers?) 经平台主进程请求，无 CORS 限制且走系统代理，返回 { status, text }。学术 API（Crossref/Semantic Scholar/arXiv）经此访问 |
| 文件选择 | ui | sdk.ui.pickFile(filters?) 弹文件选择对话框返回 { name, data }，取消返回 null |

### 4.1 调用约定

- 每次调用检查 res.ok；res.ok === false 时读取 res.error 并展示给用户。
- sdk.storage.get 键不存在时返回 { ok: true, data: null }，用 data === null 判断。
- 调用未声明权限的能力会被权限网关拒绝——manifest 按需声明，不要多声明。

## 5. 推荐开发流程与技术栈

### 5.1 常用技术栈（平台实战验证，两个真实应用均基于此）

- 框架：React 19 + TypeScript + Vite 7 + Tailwind CSS v4（与平台壳同栈，electron-vite 工程可整骨架复用）。
- 国际化：i18next + react-i18next（zh.ts 定义字典结构 export type Dict，en.ts 按类型对齐）。
- Markdown 渲染：marked；Excel/CSV 解析：SheetJS（xlsx，取首个工作表 sheet_to_json header:1）+ 自研 CSV 状态机（引号/转义/换行）；打包：JSZip（导出 zip 场景）。
- 组件策略：UI 基础件自研（Card/Badge/Modal/按钮/内联编辑），延续平台 zinc 色系与圆角层级；不引入重型组件库。
- 文档类数据：自研 JSON schema 引擎（版本化 + migrate 钩子 + validate 纯函数），不引入数据库/ORM。

### 5.2 实战开发步骤

1. 位置：monorepo 内 packages/apps/<app-id>/；直接复制 dev-guide 或 exp-manager 的工程骨架（package.json / vite.config / tsconfig / scripts/package-zip.mjs）。
2. 写 manifest：权限按需最小声明 + sharedDomains；id 反域名。
3. 浏览器 mock 开发：src/lib/sdk.ts 挂内存 mock SDK（storage/sharedData/events 全模拟），vite dev 所见即所得，不必反复打包安装；正式运行自动切平台注入的 window.sdk。
4. 数据层接口化：文档引擎 parse/serialize/validate/migrate 纯函数模块；仓库层统一走 sharedData + expectedRevision 乐观锁，保存冲突提示「文档已在别处修改，刷新重试」。
5. 平台实测：npm run package 打 zip（manifest 与产物平铺）→ 应用中心安装 → 手动走主流程。
6. 冒烟：平台包目录 SCITOOL_SMOKE_ZIP=zip路径 SCITOOL_SMOKE_DOMAIN=应用域 pnpm dev，自动验证 安装→启动→SDK 探针→域授权→共享数据→卸载 全链路。
7. 收尾：typecheck → manifest 对照 3.1 逐字段校验 → 双语完整 → 暗色目验 → 卸载验证。

## 6. UI 风格规范（与平台一致）

新应用 UI 必须与平台壳保持同一视觉语言。参考实现：packages/apps/dev-guide 与 packages/apps/exp-manager（可直接对照其组件写法）。

### 6.1 色彩

- 中性色一律用 Tailwind zinc 色阶：浅色模式页面底 zinc-50、卡片底 white、正文 zinc-900、次要文字 zinc-500/zinc-400；暗色模式页面底 zinc-950、卡片底 zinc-900、正文 zinc-100、次要文字 zinc-400/zinc-500。
- 主色 blue-600（主按钮/选中态/链接），hover 用 blue-500；危险操作 red-500；成功 emerald-600；警告 amber-600。
- 暗色下主色文字可用 blue-400，弱化背景用 blue-950/60 等透明度写法。

### 6.2 形状与字号层级

- 卡片圆角 rounded-xl（大容器）/ rounded-lg（按钮、输入框、徽章）。
- 卡片边框：浅色 zinc-200 / 暗色 zinc-800；用 1px 边框 + 白底分区，不用重阴影。
- 字号层级：页面标题 text-lg 半粗、区块标题 14–15px 半粗、正文 13px、辅助信息 11–12px。
- 按钮：主按钮白字蓝底；次按钮 ghost（hover 显 zinc-100 / dark zinc-800 底）；危险按钮红字。统一 rounded-lg px-3 py-1.5 text-[12.5px]；disabled 降透明度并禁点击。

### 6.3 布局

- 内容区 max-w-3xl 居中 + 左右留白 px-8，纵向留白 py-6~8。
- 页面顶部 sticky header：毛玻璃 backdrop-blur + 底部 1px 边框。
- 表单/字段：标签 12px zinc-500；输入框统一 rounded-lg 边框样式，focus 边框转 blue-400。
- 空状态：居中图标 + 标题 + 一句引导文案。

### 6.4 暗色适配（必须）

- Tailwind v4 class 模式：根元素按 sdk.settings.get() 的 theme 切换 .dark class；style.css 定义 @custom-variant dark。
- 每个颜色类都必须写 dark: 变体，禁止只适配浅色。
- :root / .dark 设置 color-scheme（滚动条与表单控件跟随主题）。

### 6.5 字体与双语

- 字体栈：'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif；等宽内容用 Consolas/monospace。
- 中英双语：i18n/zh.ts 定义字典结构（export type Dict = typeof zh），en.ts 按类型对齐；代码示例等语言中性内容放组件常量，不进字典。

### 6.6 交互细节

- 可点击元素必须有 hover 反馈（transition-colors + hover 变体）与 disabled 状态。
- 破坏性操作（删除等）先 window.confirm 确认。
- 异步操作进行中禁用按钮并显示进行态（…）。
- 编辑体验优先无缝：多行文本用无边框透明自动伸缩 textarea（受控）实现「直接在页面上打字」，失焦渲染；纯文本小字段（图注/表注/列名）用非受控 contentEditable（挂载时写入一次，避免 React 重置光标）。避免「点一下弹一个输入框」的表单感。
- 文档类应用的排版参考顶会：正文衬线（Georgia/Times/宋体栈）两端对齐、图表自动编号（Figure/Table 按文档顺序）、图注下图居中、表注上表。

## 6.7 代码与协作规范

- 提交信息：type: 简述，type 取 feat / fix / docs / refactor / test / chore，中文简述。
- 重大设计决策先写入 dev/memory/design_decisions.md 再实施。
- 文档引擎类模块（如 expdoc）保持纯函数接口（parse/serialize/validate/migrate），外部与 AI 只经统一入口。

## 7. 交付完成标准（必须全部满足后再交付）

- [ ] npm run typecheck 通过
- [ ] manifest 逐字段对照 3.1 校验通过
- [ ] zh / en 双语完整（名称、描述、UI 文案）
- [ ] zip 平铺打包成功；应用中心安装无报错
- [ ] 启动后 window.sdk 存在且 sdk.appId 与 manifest.id 一致
- [ ] 每个声明权限的能力均有真实调用验证；res.ok 处理正确
- [ ] 暗色主题目验通过（平台切主题后应用跟随）
- [ ] UI 风格对照第 6 节目验（zinc 色系 / 圆角层级 / 暗色全适配 / 双语）
- [ ] 卸载链路验证（应用中心卸载无残留报错）

## 8. 避坑清单（来自平台实测）

- vite base 忘记 './' → file:// 下资源 404。
- zip 多嵌套一层目录 → entry 找不到，安装报「入口文件不存在」。
- permissions 写错大小写或未知权限名 → 拒绝安装（注意是 storage 不是 Storage）。
- 调用 sharedData / events 前未在 sharedDomains 声明该域名 → 域名拒绝。
- put 不带 expectedRevision 会静默覆盖他人修改——并发写场景必须带。
- 应用内 Node fetch（自更新等）不遵循系统代理，更新源需选国内可达主机。
- 拖拽 drop 失效：dragover 处理器必须每一次事件都 preventDefault，只在状态变化时调用会导致目标元素无法接收拖入（实战踩坑）；dragLeave 用 relatedTarget 判包含，避免行内移动时高亮闪烁。
- contentEditable 光标怪癖：回车多出行、React 重渲染重置光标——多行编辑用受控 textarea，纯文本小字段用非受控 contentEditable（挂载时写入一次）。
- 文档版本迁移函数必须补全 format/version 字段，否则旧文档一进列表就抛校验错误拖垮整个列表；列表加载对单个坏文档 try/catch 跳过（容错）。
- 树形结构移动必须防环：文件夹不能移入自身或其后代（沿父链向上校验）。
- CSV 导出加 UTF-8 BOM（﻿ 前缀），否则 Excel 打开中文乱码。
- 大表格渲染：表头 sticky + 数值列右对齐（tabular-nums）+ 超长只展示部分行（展开/收起）。
- 自动编号（Figure/Table）按文档块顺序动态计算，块移动时编号自动重排，不要存进数据。
- 全屏工作区类应用：启动调用 sdk.ui.maximize()（SDK 0.4.0+），用特性检测保证旧平台优雅降级；minSdkVersion 保持能运行的最低版本。`
}
