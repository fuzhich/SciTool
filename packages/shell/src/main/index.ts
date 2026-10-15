import { app, shell, BrowserWindow } from 'electron'
import { SDK_VERSION } from '@scitool/sdk'
import { createServer } from 'http'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { ensureAppsDir, installApp, launchApp, uninstallApp } from './app-manager'
import { seedDefaultApps } from './default-apps'
import { appDir } from './paths'
import { registerSdkServices } from './sdk-service'
import { registerShellServices, setShellWindow } from './shell-service'
import { writeLog } from './logger'
import { applyDataDir, moveDataDir } from './data-dir'
import { closeDb, getDb } from './db'
import { checkForUpdates, initUpdater, onUpdateStatus, setUpdateFeed } from './updater'
import { broadcastUpdateStatus } from './shell-service'

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
  initUpdater()
  onUpdateStatus(() => broadcastUpdateStatus())
  const smokeUpdateUrl = process.env['SCITOOL_SMOKE_UPDATE_URL']
  if (smokeUpdateUrl) setUpdateFeed(smokeUpdateUrl)
  createShellWindow()
  writeLog('platform', 'info', `SciTool platform started, SDK v${SDK_VERSION}, dataDir=${app.getPath('userData')}`)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createShellWindow()
  })

  const smokeZip = process.env['SCITOOL_SMOKE_ZIP']
  const smokeDomain = process.env['SCITOOL_SMOKE_DOMAIN'] ?? 'papers'
  if (smokeZip) {
    void (async () => {
      try {
        await seedDefaultApps()
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
              `JSON.stringify({ sdkType: typeof window.sdk, appId: window.sdk ? window.sdk.appId : null, rootChildren: document.getElementById('root') ? document.getElementById('root').children.length : -1 })`
            )
            writeLog('smoke', 'info', `probe: ${probe}`)
          } catch (err) {
            writeLog('smoke', 'error', `probe failed: ${err instanceof Error ? err.message : String(err)}`)
          }
        }, 4000)
        setTimeout(async () => {
          try {
            await win.webContents.executeJavaScript(
              `window.sdk.events.subscribe('${smokeDomain}', (e) => { (window.__evtLog = window.__evtLog || []).push(e.type + ':' + e.doc.id) }).then(() => { window.__subOk = true })`
            )
            writeLog('smoke', 'info', 'shared events subscribed')
          } catch (err) {
            writeLog('smoke', 'error', `subscribe failed: ${err instanceof Error ? err.message : String(err)}`)
          }
        }, 5500)
        setTimeout(async () => {
          try {
            const sharedProbe = await win.webContents.executeJavaScript(`(async () => {
              const put = await window.sdk.sharedData.put('${smokeDomain}/smoke-1', { hello: 'world' }, { domain: '${smokeDomain}' })
              const get = await window.sdk.sharedData.get('${smokeDomain}/smoke-1')
              const conflict = await window.sdk.sharedData.put('${smokeDomain}/smoke-1', { x: 1 }, { domain: '${smokeDomain}', expectedRevision: 99 })
              const list = await window.sdk.sharedData.list({ domain: '${smokeDomain}' })
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
        // UI 交互探针（SCITOOL_SMOKE_UI=1）：创建文档后实测文档区布局与合成点击/拖放
        if (process.env['SCITOOL_SMOKE_UI']) {
          setTimeout(async () => {
            try {
              const uiProbe = await win.webContents.executeJavaScript(`(async () => {
                const res = {}
                const wait = (ms) => new Promise((r2) => setTimeout(r2, ms))
                const blocks = () => Array.from(document.querySelectorAll('[data-block]'))
                const findBtn = (texts) => Array.from(document.querySelectorAll('button')).find((b) => texts.includes((b.textContent || '').trim()))
                // 清空缓存走全新路径（面板位置从无到有）
                localStorage.clear()
                // 1) 新建实验并打开文档
                findBtn(['＋ 新建实验', '+ 新建实验', '＋ New experiment', '+ New experiment'])?.click()
                await wait(400)
                const input = document.querySelector('input')
                if (input) {
                  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
                  setter.call(input, 'UI 探针实验')
                  input.dispatchEvent(new Event('input', { bubbles: true }))
                  await wait(150)
                  findBtn(['创建', 'Create'])?.click()
                  await wait(800)
                }
                res.blocksAfterCreate = blocks().length
                // 2) 文档区高度 vs 视口高度
                const docArea = document.querySelector('[class*="cursor-text"]')
                res.docAreaH = docArea ? Math.round(docArea.getBoundingClientRect().height) : -1
                res.viewportH = window.innerHeight
                // 3) 内容下方 120px 处命中元素 + 合成点击
                const last0 = blocks()[blocks().length - 1]
                let x = 400
                let y = Math.round(window.innerHeight - 120)
                if (last0) {
                  const r = last0.getBoundingClientRect()
                  x = Math.round(r.left + r.width / 2)
                  y = Math.round(r.bottom + 120)
                }
                const hit = document.elementFromPoint(x, y)
                res.hitBelow = hit ? (typeof hit.className === 'string' ? hit.className.slice(0, 70) : hit.tagName) : null
                hit?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: x, clientY: y }))
                await wait(300)
                res.blocksAfterClick = blocks().length
                res.activeTag = document.activeElement ? document.activeElement.tagName : null
                // 4) 合成拖放 CSV 到同一空白区
                const dt = new DataTransfer()
                dt.items.add(new File(['a,b\\n1,2'], 't.csv', { type: 'text/csv' }))
                const hit2 = document.elementFromPoint(x, y)
                hit2?.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt, clientX: x, clientY: y }))
                await wait(900)
                res.blocksAfterDrop = blocks().length
                res.hasTable = blocks().some((b) => b.querySelector('table'))
                // 5) 实验信息面板可见性（全新路径）
                await wait(300)
                const panelTitle = Array.from(document.querySelectorAll('h3')).find(
                  (h) => (h.textContent || '').includes('实验信息') || (h.textContent || '').includes('Experiment info')
                )
                if (panelTitle) {
                  const r = panelTitle.getBoundingClientRect()
                  res.panelRect = { x: Math.round(r.left), y: Math.round(r.top) }
                  res.panelVisible = r.left >= 0 && r.top >= 0 && r.left < window.innerWidth && r.top < window.innerHeight
                  const collapseBtn = Array.from(document.querySelectorAll('button')).find(
                    (b) => (b.getAttribute('title') || '') === '收起' || (b.getAttribute('title') || '') === 'Collapse'
                  )
                  collapseBtn?.click()
                  await wait(300)
                  const pill = Array.from(document.querySelectorAll('button')).find(
                    (b) => (b.textContent || '').includes('实验信息') || (b.textContent || '').includes('Experiment info')
                  )
                  if (pill) {
                    const pr = pill.getBoundingClientRect()
                    res.pillVisible = pr.left >= 0 && pr.top >= 0 && pr.left < window.innerWidth && pr.top < window.innerHeight
                  } else {
                    res.pillVisible = false
                  }
                } else {
                  res.panelVisible = false
                  res.panelNotFound = true
                }
                res.savedPos = localStorage.getItem('scitool-metapanel-pos')
                return JSON.stringify(res)
              })()`)
              writeLog('smoke', 'info', `uiProbe: ${uiProbe}`)
            } catch (err) {
              writeLog('smoke', 'error', `uiProbe failed: ${err instanceof Error ? err.message : String(err)}`)
            }
          }, 9500)
        }
        setTimeout(async () => {
          try {
            await uninstallApp(record.id)
            const dirGone = !existsSync(appDir(record.id))
            writeLog('smoke', 'info', `uninstalled: ${record.id}, dir removed: ${dirGone}`)
          } catch (err) {
            writeLog('smoke', 'error', `uninstall failed: ${err instanceof Error ? err.message : String(err)}`)
          }
        }, process.env['SCITOOL_SMOKE_APP_UPDATE_FIXTURES'] || process.env['SCITOOL_SMOKE_UI'] ? 14000 : 8000)
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
        const appUpdateFixtures = process.env['SCITOOL_SMOKE_APP_UPDATE_FIXTURES']
        const fixturesDir =
          appUpdateFixtures || process.env['SCITOOL_SMOKE_PLATFORM_UPDATE_FIXTURES']
        if (fixturesDir) {
          const server = createServer((req, res) => {
            const name = ((req.url ?? '/').split('?')[0].replace(/^\//, '') || 'update-manifest.json')
            try {
              const buf = readFileSync(join(fixturesDir, name))
              res.writeHead(200)
              res.end(buf)
            } catch {
              res.writeHead(404)
              res.end()
            }
          })
          server.listen(9851, '127.0.0.1')
        }
        if (appUpdateFixtures) {
          setTimeout(async () => {
            try {
              const { checkAppUpdate } = await import('./app-updater')
              const result = await checkAppUpdate('com.scitool.sample')
              writeLog('smoke', 'info', `appUpdate: ${JSON.stringify(result)}`)
            } catch (err) {
              writeLog('smoke', 'error', `appUpdate failed: ${err instanceof Error ? err.message : String(err)}`)
            }
          }, 7000)
        }
        if (process.env['SCITOOL_SMOKE_PLATFORM_UPDATE']) {
          setTimeout(async () => {
            try {
              const status = await checkForUpdates()
              writeLog('smoke', 'info', `platformUpdate: ${JSON.stringify(status)}`)
            } catch (err) {
              writeLog('smoke', 'error', `platformUpdate failed: ${err instanceof Error ? err.message : String(err)}`)
            }
          }, 12000)
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
  } else {
    void seedDefaultApps()
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
