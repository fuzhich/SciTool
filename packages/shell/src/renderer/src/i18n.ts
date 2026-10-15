import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { PlatformLanguage } from '@scitool/sdk'

const zh = {
  appName: 'SciTool',
  slogan: '科研工具箱平台',
  actions: '操作',
  install: '安装应用',
  launch: '启动',
  uninstall: '卸载',
  emptyTitle: '还没有安装任何应用',
  emptyDesc: '点击右上角「安装应用」，从本地 .zip 包安装你的第一个科研应用',
  appCount: '{{count}} 个应用',
  version: '版本',
  permissions: '权限',
  language: '语言',
  theme: '主题',
  light: '浅色',
  dark: '深色',
  confirmUninstall: '确定卸载「{{name}}」？应用数据将被删除。',
  errors: {
    launch: '启动失败',
    install: '安装失败',
    uninstall: '卸载失败',
    load: '加载失败'
  },
  installSuccess: '安装成功：{{name}}',
  uninstallSuccess: '已卸载：{{name}}',
  settings: '设置',
  close: '关闭',
  details: '应用详情',
  installedAt: '安装时间',
  aiService: 'AI 服务',
  aiDesc: '统一配置 AI API Key，供需要 AI 能力的应用经平台代理调用（Key 不会下发给应用）。',
  aiKey: 'API Key',
  aiKeyPlaceholder: '留空保持原 Key',
  aiBaseUrl: 'Base URL',
  aiModel: '模型',
  aiCustom: '自定义',
  aiSave: '保存并验证',
  aiChecking: '正在验证…',
  aiValid: '验证通过，已保存',
  aiInvalid: '验证失败',
  dataDir: '数据目录',
  dataDirDesc: '应用数据、已安装应用与共享数据库的存放位置',
  dataDirCurrent: '当前位置',
  changeDataDir: '更改数据目录…',
  dataDirMoveConfirm:
    '将把所有数据迁移到以下位置并重启应用：\n\n{{path}}\n\n请确保该文件夹为空。迁移后原数据目录会保留作为备份，可手动删除。',
  dataDirMoving: '正在迁移数据…',
  dataDirMoveOk: '迁移成功，应用即将重启',
  about: '关于',
  versionLabel: '当前版本',
  checkUpdate: '检查更新',
  updateChecking: '正在检查更新…',
  updateAvailable: '发现新版本 {{version}}',
  updateNotAvailable: '已是最新版本',
  updateDownloading: '正在下载更新 {{percent}}%',
  updateDownloaded: '新版本已就绪，将在退出时自动安装',
  updateInstallNow: '立即重启安装',
  updateDownloadBtn: '下载更新',
  updateError: '更新失败',
  appUpdateCheck: '检查更新',
  appUpdated: '「{{name}}」已更新到 v{{version}}',
  appUpdateNone: '「{{name}}」已是最新版本',
  appUpdateFailed: '应用更新失败'
}

const en = {
  appName: 'SciTool',
  slogan: 'Research Toolbox Platform',
  actions: 'Actions',
  install: 'Install App',
  launch: 'Launch',
  uninstall: 'Uninstall',
  emptyTitle: 'No apps installed yet',
  emptyDesc: 'Click "Install App" to install your first research app from a local .zip package',
  appCount: '{{count}} apps',
  version: 'Version',
  permissions: 'Permissions',
  language: 'Language',
  theme: 'Theme',
  light: 'Light',
  dark: 'Dark',
  confirmUninstall: 'Uninstall "{{name}}"? App data will be removed.',
  errors: {
    launch: 'Launch failed',
    install: 'Install failed',
    uninstall: 'Uninstall failed',
    load: 'Load failed'
  },
  installSuccess: 'Installed: {{name}}',
  uninstallSuccess: 'Uninstalled: {{name}}',
  settings: 'Settings',
  close: 'Close',
  details: 'App details',
  installedAt: 'Installed',
  aiService: 'AI Service',
  aiDesc: 'Configure an AI API key once; apps with AI features call the provider through the platform proxy (the key is never exposed to apps).',
  aiKey: 'API Key',
  aiKeyPlaceholder: 'Leave empty to keep current key',
  aiBaseUrl: 'Base URL',
  aiModel: 'Model',
  aiCustom: 'Custom',
  aiSave: 'Save & verify',
  aiChecking: 'Verifying…',
  aiValid: 'Verified and saved',
  aiInvalid: 'Verification failed',
  dataDir: 'Data Directory',
  dataDirDesc: 'Where app data, installed apps and the shared database live',
  dataDirCurrent: 'Current location',
  changeDataDir: 'Change data directory…',
  dataDirMoveConfirm:
    'All data will be migrated to the following location and the app will restart:\n\n{{path}}\n\nMake sure the folder is empty. The old data directory is kept as a backup; you may delete it manually.',
  dataDirMoving: 'Migrating data…',
  dataDirMoveOk: 'Migration complete, restarting…',
  about: 'About',
  versionLabel: 'Version',
  checkUpdate: 'Check for updates',
  updateChecking: 'Checking for updates…',
  updateAvailable: 'New version {{version}} available',
  updateNotAvailable: 'You are up to date',
  updateDownloading: 'Downloading update {{percent}}%',
  updateDownloaded: 'Update ready, will install on exit',
  updateInstallNow: 'Restart and install',
  updateDownloadBtn: 'Download update',
  updateError: 'Update failed',
  appUpdateCheck: 'Check update',
  appUpdated: '"{{name}}" updated to v{{version}}',
  appUpdateNone: '"{{name}}" is up to date',
  appUpdateFailed: 'App update failed'
}

export type Translation = typeof zh

export async function initI18n(language: PlatformLanguage): Promise<void> {
  await i18n.use(initReactI18next).init({
    resources: {
      zh: { translation: zh },
      en: { translation: en }
    },
    lng: language,
    fallbackLng: 'zh',
    interpolation: { escapeValue: false }
  })
}

export default i18n
