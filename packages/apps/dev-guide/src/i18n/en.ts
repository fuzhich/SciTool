import type { Dict } from './zh'

const en: Dict = {
  nav: {
    overview: 'Overview',
    quickstart: 'Quick Start',
    playground: 'SDK Playground',
    manifest: 'Manifest'
  },
  app: {
    name: 'DevGuide',
    tagline: 'SciTool App DevGuide',
    mockBadge: 'mock SDK',
    mockBanner: 'Browser preview: platform is absent, using in-memory mock SDK. Calls do not reach the real platform.',
    sdkMissing: 'window.sdk not found — apps must be launched by the platform, which injects the SDK via preload.'
  },
  overview: {
    title: 'Overview & Architecture',
    desc: 'How the platform runs apps, and the contract between app and platform.',
    intro1:
      'SciTool is a Windows research-toolbox platform: it runs multiple independent apps under one framework, with data shared between apps through the platform (Anaconda-like positioning).',
    intro2:
      'A SciTool app = a static zip web bundle + a manifest.json. The platform handles install, launch, permission control and data services; the app focuses on its own features.',
    runtimeTitle: 'Runtime Model',
    runtimeCards: [
      {
        title: 'Separate process',
        desc: 'Each app runs in its own window and process; a crash never affects the platform or other apps (auto-restart once)'
      },
      {
        title: 'Sandboxed',
        desc: 'nodeIntegration off, sandbox on, contextIsolation on — apps have no Node access'
      },
      {
        title: 'Isolated session',
        desc: 'Session partition is per-app; cookies / local storage are invisible to each other'
      },
      {
        title: 'SDK injection',
        desc: 'The platform preload injects window.sdk, gating every call by manifest permissions'
      }
    ],
    flowTitle: 'Call Chain',
    flowApps: 'Apps A / B / C (separate processes)',
    flowSdk: 'window.sdk (IPC)',
    flowGate: 'Permission gate (allowlist + domain grants)',
    flowServices: 'Platform services: storage / settings / log / shared data / events',
    gatesTitle: 'Two Permission Gates',
    gate1Title: 'Gate 1: IPC allowlist',
    gate1Desc:
      'manifest.permissions declares capabilities (storage / settings / log / ui / sharedData / events). The main process allows IPC channels by that allowlist; undeclared calls get permission denied.',
    gate2Title: 'Gate 2: domain grants',
    gate2Desc:
      'sharedData and events additionally require manifest.sharedDomains declaring domains with read / write levels. Unauthorized domains are always rejected; write implies read.',
    dataTitle: 'Data Sharing Model',
    dataDesc:
      'Documents carry revision numbers for optimistic locking, with an event bus (Notifier pattern) for cross-app flows: e.g. "Paper Manager" writes the papers domain, "Writer" reads and subscribes to it — paper changes are pushed to the writer in real time.'
  },
  quickstart: {
    title: 'Quick Start',
    desc: 'Five steps to integrate with the platform. This app (packages/apps/dev-guide) is a complete reference implementation.',
    step1Title: 'Create the package',
    step1Desc:
      'Create an app package under packages/apps/ in the monorepo. React + TS + Vite + Tailwind is the showcased stack; the platform does not enforce any stack as long as it produces static files.',
    step2Title: 'Write the manifest',
    step2Desc:
      'Declare id / bilingual name / version / minSdkVersion / entry / permissions / shared domains. The platform validates each field at install time — see the Manifest page.',
    step3Title: 'Develop the UI',
    step3Desc:
      'A pure static frontend; every platform capability goes through window.sdk. In browser vite dev the platform is absent — mount an in-memory mock SDK for preview (see src/lib/sdk.ts in this app).',
    step4Title: 'Build & package',
    step4Desc:
      'Run vite build (base: \'./\' for relative paths under file://), then flatten manifest.json and build output into a zip.',
    step5Title: 'Install & run',
    step5Desc:
      'App Center → "Install local package" → pick the zip → Launch. Re-installing an app with the same id updates it.',
    manifestTitle: 'Manifest example',
    treeTitle: 'Zip layout',
    buildTitle: 'Packaging script (simplified from this app\'s scripts/package-zip.mjs)',
    cycleTitle: 'Dev loop',
    cycleDesc:
      'Edit → re-package the zip → re-install in App Center → launch to verify. This app\'s own dev mode: pnpm --filter @scitool/dev-guide dev (browser + mock SDK, WYSIWYG UI).',
    refTitle: 'Key points',
    refItems: [
      'base: \'./\' is required, otherwise assets 404 under file://',
      'The zip root must contain manifest.json and the entry file flat — do not nest them in a folder',
      'Bilingual: write name / description in both languages; follow sdk.settings.getLanguage() for UI language and settings.get() for theme'
    ]
  },
  playground: {
    title: 'SDK Playground',
    desc: 'Six capabilities invoked live, with results shown in real time. Every call passes the permission gate — undeclared capabilities are rejected.',
    tabStorage: 'Storage',
    tabSettings: 'Settings',
    tabLog: 'Log',
    tabUi: 'UI',
    tabSharedData: 'Shared Data',
    tabEvents: 'Events',
    permission: 'Permission',
    domain: 'Domain',
    domainDevguide: 'devguide (write)',
    hintStorage:
      'App-private key-value storage: isolated per app (SQLite kv_store table), visible only to this app, removed on uninstall. Values can be any JSON-serializable data.',
    hintSettings:
      'Platform settings are read-only: language (zh / en), theme (light / dark). Apps cannot modify platform settings — adapt UI language and colors accordingly.',
    hintLog: 'Logs are written to the platform log files (data/logs/) with the app id prefix. Check them together with platform logs when debugging.',
    hintUi: 'notify shows a system notification; minimize / close control this app\'s window.',
    hintSharedData:
      'Cross-app document storage: ids are globally unique; revision optimistic locking prevents overwriting others\' changes; this app holds write access to the devguide domain (manifest.sharedDomains).',
    hintEvents:
      'Subscribe to domain change events: created / updated / removed. "Put test doc" below triggers events — this app writes and receives its own events (self-loop demo); in cross-app scenarios another app writing devguide is received the same way. Subscriptions auto-clean on window close.',
    fieldKey: 'Key',
    fieldValue: 'Value',
    fieldId: 'Doc id',
    fieldData: 'Data (JSON)',
    fieldExpectedRevision: 'expectedRevision (optional)',
    btnSet: 'Set',
    btnGet: 'Get',
    btnRemove: 'Remove',
    btnNotify: 'Notify',
    btnMinimize: 'Minimize',
    btnClose: 'Close window',
    btnPut: 'Put',
    btnList: 'List',
    btnSubscribe: 'Subscribe devguide',
    btnUnsubscribe: 'Unsubscribe',
    btnEmitTest: 'Put test doc',
    statusSubscribed: 'Subscribed to devguide',
    statusUnsubscribed: 'Not subscribed',
    logLevel: 'Level',
    logMessage: 'Message',
    btnWriteLog: 'Write log',
    logWritten: 'Written to platform log',
    readOnlyTitle: 'Current platform settings',
    languageLabel: 'Language',
    themeLabel: 'Theme',
    value: 'Value',
    outputTitle: 'Results'
  },
  manifest: {
    title: 'Manifest Checklist',
    desc: 'Field rules validated by the platform at install time, and the basis for troubleshooting install failures.',
    fieldTitle: 'Field rules',
    fieldCol: 'Field',
    requiredCol: 'Required',
    ruleCol: 'Rule',
    exampleCol: 'Example',
    fields: [
      {
        field: 'id',
        required: 'Yes',
        rule: '3–64 chars, lowercase letters/digits/._-, reverse-domain style, globally unique',
        example: 'com.fuzhich.paper-notes'
      },
      {
        field: 'name',
        required: 'Yes',
        rule: 'Bilingual name: zh and en',
        example: '{ "zh": "论文笔记", "en": "Paper Notes" }'
      },
      { field: 'version', required: 'Yes', rule: 'x.y.z semantic version', example: '1.0.0' },
      {
        field: 'minSdkVersion',
        required: 'Yes',
        rule: 'Checked at launch: rejected if higher than platform SDK (currently 0.2.0)',
        example: '0.2.0'
      },
      {
        field: 'description',
        required: 'zh required',
        rule: 'App description, bilingual recommended',
        example: '{ "zh": "文献管理", "en": "Paper Manager" }'
      },
      {
        field: 'entry',
        required: 'Yes',
        rule: 'Relative path to the entry page; traversal (../) rejected at install',
        example: 'index.html'
      },
      {
        field: 'permissions',
        required: 'Yes',
        rule: 'Only the 6 known permissions (see below); unknown names rejected',
        example: '["storage", "ui"]'
      },
      {
        field: 'sharedDomains',
        required: 'No',
        rule: 'Cross-app data domain grants: domain starts with a lowercase letter, access is read / write',
        example: '[{ "domain": "papers", "access": "write" }]'
      },
      {
        field: 'update',
        required: 'No',
        rule: 'App self-update manifest URL, format { version, url }',
        example: '{ "url": "https://host/app-update.json" }'
      },
      { field: 'icon', required: 'No', rule: 'Icon path shown in App Center', example: 'assets/icon.png' }
    ],
    permTitle: 'Permission ↔ capability',
    permCol: 'Permission',
    abilityCol: 'Capability',
    permissions: [
      { perm: 'storage', ability: 'sdk.storage.get / set / remove — app-private key-value storage' },
      { perm: 'settings', ability: 'sdk.settings.get / getLanguage — platform language & theme (read-only)' },
      { perm: 'log', ability: 'sdk.log — unified logging to platform logs' },
      { perm: 'ui', ability: 'sdk.ui.notify / minimize / close — notifications & window control' },
      {
        perm: 'sharedData',
        ability: 'sdk.sharedData.get / put / list / remove — cross-app documents (also needs domain grant)'
      },
      { perm: 'events', ability: 'sdk.events.subscribe — domain change events (also needs domain grant)' }
    ],
    troubleTitle: 'Common install / launch failures',
    troubles: [
      '"应用 id 非法" — id contains uppercase, spaces or Chinese; use reverse-domain style (com.xxx.yyy)',
      '"应用名称缺失（zh/en）" — name must provide both zh and en',
      '"版本号需为 x.y.z" — version has a v prefix or wrong segment count',
      '"未知权限声明" — permissions contain names outside the 6 known ones (case-sensitive)',
      '"入口文件不存在 / entry 路径非法" — the zip has a nested folder, or entry does not match the actual file name',
      '"应用要求 SDK >= x.y.z" — platform SDK is lower than minSdkVersion; upgrade the platform',
      '"permission denied / 应用未获授权访问域名" — calling an undeclared capability, or accessing an ungranted shared domain'
    ]
  },
  code: {
    storage: `await sdk.storage.set('lastProject', { id: 3 })
const res = await sdk.storage.get('lastProject')  // { ok: true, data: { id: 3 } }
await sdk.storage.remove('lastProject')`,
    settings: `const settings = await sdk.settings.get()
// { ok: true, data: { language: 'zh', theme: 'dark' } }
const lang = await sdk.settings.getLanguage()
// { ok: true, data: 'zh' }`,
    log: `await sdk.log('info', 'paper import done', { count: 12 })
// level: 'debug' | 'info' | 'warn' | 'error'`,
    ui: `await sdk.ui.notify({ title: 'Import done', body: '12 papers imported' })
await sdk.ui.minimize()
await sdk.ui.close()`,
    sharedData: `await sdk.sharedData.put('note-1', { title: 'Hello' },
  { domain: 'devguide' })

const doc = await sdk.sharedData.get('note-1')

// Optimistic lock: update only if revision is still 1, else fail
await sdk.sharedData.put('note-1', { title: 'Hi' },
  { domain: 'devguide', expectedRevision: 1 })

const all = await sdk.sharedData.list({ domain: 'devguide' })

await sdk.sharedData.remove('note-1')`,
    events: `const res = await sdk.events.subscribe('devguide', (event) => {
  console.log(event.type, event.doc)
  // type: 'created' | 'updated' | 'removed'
})

const unsubscribe = res.data   // call when no longer needed`,
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
├── manifest.json      # app manifest (required)
├── index.html         # entry page (vite build output)
└── assets/            # js / css / images`,
    buildScript: `# 1) Build: vite outputs relative-path assets to dist/
npm run build

# 2) Package: flatten manifest.json + dist/* into a zip
powershell -NoProfile -Command "Compress-Archive -Path 'dist\\*','manifest.json' \\
  -DestinationPath 'dev-guide.zip' -Force"`
  }
}

export default en
