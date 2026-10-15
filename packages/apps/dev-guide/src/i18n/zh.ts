const zh = {
  nav: {
    overview: '概览与架构',
    quickstart: '快速开始',
    playground: 'SDK 演练',
    manifest: 'manifest 清单',
    prompt: 'AI 提示词'
  },
  app: {
    name: '开发指南',
    tagline: 'SciTool App DevGuide',
    mockBadge: 'mock SDK',
    mockBanner: '浏览器预览模式：平台不在场，使用内存 mock SDK，操作不会落到真实平台。',
    sdkMissing: '未检测到 window.sdk —— 应用需由平台启动，SDK 由平台 preload 注入。'
  },
  overview: {
    title: '概览与架构',
    desc: '了解 SciTool 平台如何运行应用，以及应用与平台之间的契约。',
    intro1:
      'SciTool 是 Windows 科研工具箱平台：统一框架下运行多个独立应用，应用之间经平台共享数据（类 Anaconda 定位）。',
    intro2: '一个 SciTool 应用 = 一个 zip 静态网页包 + 一份 manifest.json。平台负责安装、启动、权限管控与数据服务，应用专注业务功能。',
    runtimeTitle: '运行时模型',
    runtimeCards: [
      {
        title: '独立进程',
        desc: '每个应用独立窗口 + 独立进程，崩溃不影响平台与其他应用（自动重启 1 次）'
      },
      {
        title: '沙箱隔离',
        desc: 'nodeIntegration 关闭、sandbox 开启、contextIsolation 开启 —— 应用无 Node 能力'
      },
      {
        title: '独立存储分区',
        desc: 'session partition 按应用隔离，Cookie / 本地存储互不可见'
      },
      {
        title: 'SDK 注入',
        desc: '平台 preload 统一注入 window.sdk，按清单声明的权限放行调用'
      }
    ],
    flowTitle: '调用链路',
    flowApps: '应用 A / B / C（独立进程）',
    flowSdk: 'window.sdk（IPC）',
    flowGate: '权限网关（白名单 + 域名授权）',
    flowServices: '平台服务：存储 / 设置 / 日志 / 共享数据 / 事件',
    gatesTitle: '权限双闸',
    gate1Title: '第一道：IPC 白名单',
    gate1Desc:
      'manifest.permissions 声明能力（storage / settings / log / ui / sharedData / events），主进程按通道白名单放行；未声明的调用直接返回 permission denied。',
    gate2Title: '第二道：域名授权',
    gate2Desc:
      'sharedData 与 events 额外要求 manifest.sharedDomains 声明域名与级别（read / write），未授权域名一律拒绝；write 授权自动含读。',
    dataTitle: '数据共享模型',
    dataDesc:
      '文档型数据带 revision 乐观锁，配合事件总线（Notifier 模式）支撑跨应用流转：如「文献管理」写 papers 域，「写作」读并订阅 papers 域，文献变更实时推送给写作应用。'
  },
  quickstart: {
    title: '快速开始',
    desc: '五个步骤接入平台。本应用（packages/apps/dev-guide）即是一份完整参考实现。',
    step1Title: '建包',
    step1Desc:
      '在 monorepo 的 packages/apps/ 下创建应用包。React + TS + Vite + Tailwind 为示范栈，平台不强制栈，任何能产出静态文件的方案均可。',
    step2Title: '写 manifest',
    step2Desc: '声明 id / 双语名称 / 版本 / minSdkVersion / 入口 / 权限 / 共享域名。安装时平台逐项校验，规则见 manifest 清单页。',
    step3Title: '开发 UI',
    step3Desc:
      '纯静态前端，全部平台能力经 window.sdk 调用。浏览器 vite dev 时平台不在场，可挂载内存 mock SDK 预览（见本应用 src/lib/sdk.ts）。',
    step4Title: '构建打包',
    step4Desc: 'vite build（base: \'./\' 相对路径，适配 file:// 加载）后，把 manifest.json 与构建产物平铺压缩为 zip。',
    step5Title: '安装运行',
    step5Desc: '平台应用中心 →「安装本地包」→ 选择 zip → 点击启动。覆盖安装同 id 应用即完成更新。',
    manifestTitle: 'manifest 示例',
    treeTitle: 'zip 包结构',
    buildTitle: '打包脚本（本应用 scripts/package-zip.mjs 的精简版）',
    cycleTitle: '调试循环',
    cycleDesc:
      '改代码 → 重新打包 zip → 应用中心覆盖安装 → 启动验证。本应用自身的 dev 模式：pnpm --filter @scitool/dev-guide dev（浏览器 + mock SDK，UI 所见即所得）。',
    refTitle: '参考要点',
    refItems: [
      'base: \'./\' 必须设置，否则 file:// 下资源路径会指向根目录而 404',
      'zip 根目录必须平铺 manifest.json 与入口文件，不要多嵌套一层目录',
      '中英双语：name / description 双写；UI 语言跟随 sdk.settings.getLanguage()，主题跟随 settings.get()'
    ]
  },
  playground: {
    title: 'SDK 演练',
    desc: '六个能力现场调用，结果实时展示。每次调用都会经过权限网关 —— 未在 manifest 声明的能力会被拒绝。',
    tabStorage: '存储',
    tabSettings: '设置',
    tabLog: '日志',
    tabUi: '界面',
    tabSharedData: '共享数据',
    tabEvents: '事件',
    permission: '所需权限',
    domain: '域名',
    domainDevguide: 'devguide（write）',
    hintStorage: '应用私有键值存储：按应用隔离（SQLite kv_store 表），仅本应用可见，卸载时清除。value 可以是任意可 JSON 序列化的数据。',
    hintSettings: '平台设置只读：language（zh / en）、theme（light / dark）。应用不能修改平台设置，应据此适配 UI 语言与配色。',
    hintLog: '日志统一写入平台日志文件（data/logs/），带应用前缀。排查应用问题时与平台日志一起查看。',
    hintUi: 'notify 弹系统通知；minimize / close 控制应用自身窗口。',
    hintSharedData:
      '跨应用文档存储：id 全局唯一；revision 乐观锁防止覆盖他人修改；本应用对 devguide 域持有 write 授权（manifest.sharedDomains）。',
    hintEvents:
      '订阅域变更事件：created / updated / removed。下方「写入测试文档」即触发事件 —— 本应用自己写、自己收（自闭环演示）；跨应用时另一应用写 devguide 域同样实时收到。窗口关闭自动退订。',
    fieldKey: '键',
    fieldValue: '值',
    fieldId: '文档 id',
    fieldData: '数据（JSON）',
    fieldExpectedRevision: 'expectedRevision（可选）',
    btnSet: '写入 set',
    btnGet: '读取 get',
    btnRemove: '删除 remove',
    btnNotify: '系统通知 notify',
    btnMinimize: '最小化 minimize',
    btnClose: '关闭窗口 close',
    btnPut: '写入 put',
    btnList: '列表 list',
    btnSubscribe: '订阅 devguide',
    btnUnsubscribe: '退订',
    btnEmitTest: '写入测试文档',
    statusSubscribed: '已订阅 devguide 域',
    statusUnsubscribed: '未订阅',
    logLevel: '级别',
    logMessage: '消息',
    btnWriteLog: '写日志',
    logWritten: '已写入平台日志',
    readOnlyTitle: '当前平台设置',
    languageLabel: '语言',
    themeLabel: '主题',
    value: '值',
    outputTitle: '调用结果'
  },
  manifest: {
    title: 'manifest 清单',
    desc: '安装时平台逐项校验的字段规则对照表，也是安装失败时的排查依据。',
    fieldTitle: '字段规则',
    fieldCol: '字段',
    requiredCol: '必填',
    ruleCol: '规则',
    exampleCol: '示例',
    fields: [
      {
        field: 'id',
        required: '是',
        rule: '3–64 位，小写字母/数字/._-，反域名格式，全局唯一',
        example: 'com.fuzhich.paper-notes'
      },
      { field: 'name', required: '是', rule: 'zh / en 双语名称', example: '{ "zh": "论文笔记", "en": "Paper Notes" }' },
      { field: 'version', required: '是', rule: 'x.y.z 语义化版本', example: '1.0.0' },
      {
        field: 'minSdkVersion',
        required: '是',
        rule: '启动时校验：高于平台 SDK 版本（当前 0.2.0）拒启动',
        example: '0.2.0'
      },
      {
        field: 'description',
        required: 'zh 必填',
        rule: '应用简介，建议双语',
        example: '{ "zh": "文献管理", "en": "Paper Manager" }'
      },
      {
        field: 'entry',
        required: '是',
        rule: '入口页面相对路径，禁止越界（../ 拒绝安装）',
        example: 'index.html'
      },
      {
        field: 'permissions',
        required: '是',
        rule: '仅允许 6 种已知权限（见下表），出现未知权限名即拒装',
        example: '["storage", "ui"]'
      },
      {
        field: 'sharedDomains',
        required: '否',
        rule: '跨应用数据域授权：域名小写字母开头，access 为 read / write',
        example: '[{ "domain": "papers", "access": "write" }]'
      },
      {
        field: 'update',
        required: '否',
        rule: '应用自更新清单地址，清单格式 { version, url }',
        example: '{ "url": "https://host/app-update.json" }'
      },
      { field: 'icon', required: '否', rule: '应用中心图标路径', example: 'assets/icon.png' }
    ],
    permTitle: '权限 ↔ 能力对照',
    permCol: '权限',
    abilityCol: '能力',
    permissions: [
      { perm: 'storage', ability: 'sdk.storage.get / set / remove —— 应用私有键值存储' },
      { perm: 'settings', ability: 'sdk.settings.get / getLanguage —— 平台语言与主题（只读）' },
      { perm: 'log', ability: 'sdk.log —— 统一日志落盘' },
      { perm: 'ui', ability: 'sdk.ui.notify / minimize / maximize / close / saveTextFile —— 通知、窗口控制与文件保存对话框' },
      { perm: 'sharedData', ability: 'sdk.sharedData.get / put / list / remove —— 跨应用文档（还需域名授权）' },
      { perm: 'events', ability: 'sdk.events.subscribe —— 域变更事件订阅（还需域名授权）' },
      { perm: 'ai', ability: 'sdk.ai.available / chat —— 经平台代理调用 AI（Key 由平台统一配置，不下发应用）' }
    ],
    troubleTitle: '常见安装 / 启动失败排查',
    troubles: [
      '「应用 id 非法」—— id 含大写、空格或中文；应为反域名格式（com.xxx.yyy）',
      '「应用名称缺失（zh/en）」—— name 未同时提供 zh 与 en',
      '「版本号需为 x.y.z」—— 版本号带 v 前缀或位数不对',
      '「未知权限声明」—— permissions 里写了 6 种之外的名字（注意大小写）',
      '「入口文件不存在 / entry 路径非法」—— zip 嵌套了目录，或 entry 与实际文件名不一致',
      '「应用要求 SDK >= x.y.z」—— 平台 SDK 版本低于 minSdkVersion，需升级平台',
      '「permission denied / 应用未获授权访问域名」—— 调用了未声明权限的能力，或访问了未授权的共享域'
    ]
  },
  prompt: {
    title: 'AI 开发提示词',
    desc: '导出一份 markdown 任务书，作为 AI 助手的「前置提示词」：粘贴给 AI 后再追加新应用需求，即可获得符合平台约束的开发方案。',
    usageTitle: '使用方法',
    usageItems: [
      '点击下方「导出 .md 文件」保存任务书（可选择保存路径）',
      '新开 AI 会话：先粘贴任务书，再描述你的应用需求',
      '让 AI 按任务书第 7 节「交付完成标准」逐项自检'
    ],
    previewTitle: '内容预览',
    btnExport: '导出 .md 文件',
    exported: '已保存',
    canceled: '已取消保存',
    fallbackSaved: '当前环境无保存对话框能力，已通过浏览器下载导出'
  },
  code: {
    storage: `await sdk.storage.set('lastProject', { id: 3 })
const res = await sdk.storage.get('lastProject')  // { ok: true, data: { id: 3 } }
await sdk.storage.remove('lastProject')`,
    settings: `const settings = await sdk.settings.get()
// { ok: true, data: { language: 'zh', theme: 'dark' } }
const lang = await sdk.settings.getLanguage()
// { ok: true, data: 'zh' }`,
    log: `await sdk.log('info', '文献导入完成', { count: 12 })
// level: 'debug' | 'info' | 'warn' | 'error'`,
    ui: `await sdk.ui.notify({ title: '导入完成', body: '12 篇文献已入库' })
await sdk.ui.minimize()
await sdk.ui.close()`,
    sharedData: `await sdk.sharedData.put('note-1', { title: 'Hello' },
  { domain: 'devguide' })

const doc = await sdk.sharedData.get('note-1')

// 乐观锁：仅当 revision 仍为 1 时更新，冲突则失败
await sdk.sharedData.put('note-1', { title: 'Hi' },
  { domain: 'devguide', expectedRevision: 1 })

const all = await sdk.sharedData.list({ domain: 'devguide' })

await sdk.sharedData.remove('note-1')`,
    events: `const res = await sdk.events.subscribe('devguide', (event) => {
  console.log(event.type, event.doc)
  // type: 'created' | 'updated' | 'removed'
})

const unsubscribe = res.data   // 不再需要时调用`,
    manifestExample: `{
  "id": "com.fuzhich.paper-notes",
  "name": { "zh": "论文笔记", "en": "Paper Notes" },
  "version": "1.0.0",
  "minSdkVersion": "0.2.0",
  "description": { "zh": "文献管理与论文笔记", "en": "Paper manager" },
  "entry": "index.html",
  "permissions": ["storage", "settings", "log", "ui", "sharedData", "events"],
  "sharedDomains": [{ "domain": "papers", "access": "write" }],
  "update": { "url": "https://host/app-update.json" }
}`,
    zipTree: `app-package.zip
├── manifest.json      # 应用清单（必填）
├── index.html         # 入口页面（vite 构建产物）
└── assets/            # js / css / 图片等资源`,
    buildScript: `# 1) 构建：vite 输出相对路径资源到 dist/
npm run build

# 2) 打包：manifest.json 与 dist/* 平铺压缩为 zip
powershell -NoProfile -Command "Compress-Archive -Path 'dist\\*','manifest.json' \\
  -DestinationPath 'dev-guide.zip' -Force"`
  }
}

export default zh
export type Dict = typeof zh
