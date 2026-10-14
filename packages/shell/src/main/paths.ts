import { app } from 'electron'
import { join } from 'path'

export const dataDir = (): string => app.getPath('userData')
export const appsDir = (): string => join(dataDir(), 'apps')
export const appDir = (appId: string): string => join(appsDir(), appId)
export const registryFile = (): string => join(dataDir(), 'registry.json')
export const settingsFile = (): string => join(dataDir(), 'settings.json')
export const appStorageDir = (): string => join(dataDir(), 'app-storage')
export const logsDir = (): string => join(dataDir(), 'logs')
