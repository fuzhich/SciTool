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
  uninstallSuccess: '已卸载：{{name}}'
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
  uninstallSuccess: 'Uninstalled: {{name}}'
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
