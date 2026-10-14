export const SHELL_CHANNELS = {
  appsList: 'platform:apps:list',
  appsInstall: 'platform:apps:install',
  appsUninstall: 'platform:apps:uninstall',
  appsLaunch: 'platform:apps:launch',
  pickZip: 'platform:pick:zip',
  settingsGet: 'platform:settings:get',
  settingsSet: 'platform:settings:set',
  dataDirGet: 'platform:data-dir:get',
  dataDirPick: 'platform:data-dir:pick',
  dataDirMove: 'platform:data-dir:move',
  updateStatusGet: 'platform:update:status',
  updateCheck: 'platform:update:check',
  updateDownload: 'platform:update:download',
  updateInstall: 'platform:update:install',
  updateStatusChanged: 'platform:update:status-changed',
  appUpdateCheck: 'platform:app-update:check',
  onAppsChanged: 'platform:apps:changed'
} as const
