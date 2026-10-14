export const SHELL_CHANNELS = {
  appsList: 'platform:apps:list',
  appsInstall: 'platform:apps:install',
  appsUninstall: 'platform:apps:uninstall',
  appsLaunch: 'platform:apps:launch',
  pickZip: 'platform:pick:zip',
  settingsGet: 'platform:settings:get',
  settingsSet: 'platform:settings:set',
  onAppsChanged: 'platform:apps:changed'
} as const
