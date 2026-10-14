import { contextBridge, ipcRenderer } from 'electron'
import { APP_ID_ARG, createSdk } from '@scitool/sdk'

const arg = process.argv.find((a) => a.startsWith(`--${APP_ID_ARG}=`))
const appId = arg ? arg.slice(`--${APP_ID_ARG}=`.length) : 'unknown'

const sdk = createSdk(appId, {
  invoke: <T>(channel: string, payload?: unknown): Promise<T> => ipcRenderer.invoke(channel, payload),
  on: (channel: string, listener: (payload: unknown) => void): (() => void) => {
    const wrapped = (_e: Electron.IpcRendererEvent, payload: unknown): void => listener(payload)
    ipcRenderer.on(channel, wrapped)
    return () => {
      ipcRenderer.removeListener(channel, wrapped)
    }
  }
})

contextBridge.exposeInMainWorld('sdk', sdk)
