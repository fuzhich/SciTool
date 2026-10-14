import { app, shell, BrowserWindow } from 'electron'
import { SDK_VERSION } from '@scitool/sdk'
import { existsSync } from 'fs'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { ensureAppsDir, installApp, launchApp, uninstallApp } from './app-manager'
import { appDir } from './paths'
import { registerSdkServices } from './sdk-service'
import { registerShellServices, setShellWindow } from './shell-service'
import { writeLog } from './logger'
import { applyDataDir, moveDataDir } from './data-dir'
import { closeDb, getDb } from './db'

function createShellWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1120,
    height: 740,
    minWidth: 880,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    title: 'SciTool',
    backgroundColor: '#fafafa',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    setShellWindow(null)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  setShellWindow(mainWindow)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

applyDataDir()

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.scitool.platform')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ensureAppsDir()
  getDb()
  registerSdkServices()
  registerShellServices()
  createShellWindow()
  writeLog('platform', 'info', `SciTool platform started, SDK v${SDK_VERSION}, dataDir=${app.getPath('userData')}`)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createShellWindow()
  })

  const smokeZip = process.env['SCITOOL_SMOKE_ZIP']
  if (smokeZip) {
    void (async () => {
      try {
        const record = await installApp(smokeZip)
        writeLog('smoke', 'info', `installed: ${record.id}@${record.version}`)
        const win = await launchApp(record.id)
        writeLog('smoke', 'info', `launched: ${record.id}`)
        win.webContents.on('preload-error', (_e, path, error) => {
          writeLog('smoke', 'error', `preload-error: ${path} -> ${error.message}`)
        })
        setTimeout(async () => {
          try {
            const probe = await win.webContents.executeJavaScript(
              `JSON.stringify({ sdkType: typeof window.sdk, appId: window.sdk ? window.sdk.appId : null })`
            )
            writeLog('smoke', 'info', `probe: ${probe}`)
          } catch (err) {
            writeLog('smoke', 'error', `probe failed: ${err instanceof Error ? err.message : String(err)}`)
          }
        }, 4000)
        setTimeout(async () => {
          try {
            await win.webContents.executeJavaScript(
              `window.sdk.events.subscribe('papers', (e) => { (window.__evtLog = window.__evtLog || []).push(e.type + ':' + e.doc.id) }).then(() => { window.__subOk = true })`
            )
            writeLog('smoke', 'info', 'shared events subscribed')
          } catch (err) {
            writeLog('smoke', 'error', `subscribe failed: ${err instanceof Error ? err.message : String(err)}`)
          }
        }, 5500)
        setTimeout(async () => {
          try {
            const sharedProbe = await win.webContents.executeJavaScript(`(async () => {
              const put = await window.sdk.sharedData.put('papers/smoke-1', { hello: 'world' }, { domain: 'papers' })
              const get = await window.sdk.sharedData.get('papers/smoke-1')
              const conflict = await window.sdk.sharedData.put('papers/smoke-1', { x: 1 }, { domain: 'papers', expectedRevision: 99 })
              const list = await window.sdk.sharedData.list({ domain: 'papers' })
              await window.sdk.storage.set('smoke', 1)
              const sget = await window.sdk.storage.get('smoke')
              return JSON.stringify({ putRev: put.ok ? put.data.revision : put.error, getData: get.ok ? get.data.data : get.error, conflictErr: conflict.error, count: list.ok ? list.data.length : -1, storage: sget.ok ? sget.data : sget.error })
            })()`)
            writeLog('smoke', 'info', `sharedProbe: ${sharedProbe}`)
          } catch (err) {
            writeLog('smoke', 'error', `shared probe failed: ${err instanceof Error ? err.message : String(err)}`)
          }
        }, 6500)
        setTimeout(async () => {
          try {
            const evtLog = await win.webContents.executeJavaScript(`JSON.stringify(window.__evtLog || [])`)
            writeLog('smoke', 'info', `eventLog: ${evtLog}`)
          } catch (err) {
            writeLog('smoke', 'error', `event log failed: ${err instanceof Error ? err.message : String(err)}`)
          }
        }, 7500)
        setTimeout(async () => {
          try {
            await uninstallApp(record.id)
            const dirGone = !existsSync(appDir(record.id))
            writeLog('smoke', 'info', `uninstalled: ${record.id}, dir removed: ${dirGone}`)
          } catch (err) {
            writeLog('smoke', 'error', `uninstall failed: ${err instanceof Error ? err.message : String(err)}`)
          }
        }, 8000)
        const smokeMove = process.env['SCITOOL_SMOKE_MOVE']
        if (smokeMove) {
          setTimeout(() => {
            try {
              const moved = moveDataDir(smokeMove, false)
              writeLog('smoke', 'info', `data dir moved to: ${moved}`)
            } catch (err) {
              writeLog('smoke', 'error', `move failed: ${err instanceof Error ? err.message : String(err)}`)
            }
          }, 10000)
        }
        setTimeout(() => {
          writeLog('smoke', 'info', 'smoke test finished')
          app.exit(0)
        }, 15000)
      } catch (err) {
        writeLog('smoke', 'error', err instanceof Error ? err.message : String(err))
        app.exit(1)
      }
    })()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  closeDb()
})
