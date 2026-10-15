export const SDK_CHANNELS = {
  storageGet: 'sdk:storage:get',
  storageSet: 'sdk:storage:set',
  storageRemove: 'sdk:storage:remove',
  settingsGet: 'sdk:settings:get',
  log: 'sdk:log',
  uiNotify: 'sdk:ui:notify',
  uiMinimize: 'sdk:ui:minimize',
  uiClose: 'sdk:ui:close',
  uiMaximize: 'sdk:ui:maximize',
  uiSaveTextFile: 'sdk:ui:save-text-file',
  sharedDataGet: 'sdk:shared-data:get',
  sharedDataPut: 'sdk:shared-data:put',
  sharedDataList: 'sdk:shared-data:list',
  sharedDataRemove: 'sdk:shared-data:remove',
  eventsSubscribe: 'sdk:events:subscribe',
  eventsUnsubscribe: 'sdk:events:unsubscribe',
  eventsNotify: 'sdk:events:notify'
} as const

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

export const APP_ID_ARG = 'scitool-app-id'
