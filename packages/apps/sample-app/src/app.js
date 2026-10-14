const I18N = {
  zh: {
    title: 'SciTool 示例应用',
    subtitle: '开发期验证用：SDK 存储 / 设置 / 日志 / 通知',
    btnSet: '写入存储',
    btnGet: '读取存储',
    btnLog: '写日志',
    btnNotify: '发通知',
    storageKey: 'key',
    storageValue: 'value',
    appId: 'appId',
    sdkVersion: 'SDK version',
    language: '平台语言',
    theme: '主题',
    hint: '点击按钮查看 SDK 调用结果…',
    sdkMissing: 'window.sdk 不存在 —— 应用未通过平台启动或 SDK 注入失败',
    ok: '成功',
    fail: '失败'
  },
  en: {
    title: 'SciTool Sample App',
    subtitle: 'Dev-only: SDK storage / settings / log / notify',
    btnSet: 'Set storage',
    btnGet: 'Get storage',
    btnLog: 'Write log',
    btnNotify: 'Notify',
    storageKey: 'key',
    storageValue: 'value',
    appId: 'appId',
    sdkVersion: 'SDK version',
    language: 'Platform language',
    theme: 'Theme',
    hint: 'Click buttons to see SDK results…',
    sdkMissing: 'window.sdk missing — app was not launched by the platform or SDK injection failed',
    ok: 'OK',
    fail: 'Failed'
  }
}

let t = I18N.zh

function $(id) {
  return document.getElementById(id)
}

function log(message) {
  const out = $('output')
  out.textContent += '\n' + message
  out.scrollTop = out.scrollHeight
}

function label(key) {
  return t[key] ?? key
}

async function init() {
  const sdk = window.sdk
  if (!sdk) {
    $('output').textContent = I18N.zh.sdkMissing + ' / ' + I18N.en.sdkMissing
    return
  }

  const langRes = await sdk.settings.getLanguage()
  const settingsRes = await sdk.settings.get()
  await sdk.log('info', 'sample-app started', {
    language: langRes.ok ? langRes.data : langRes.error,
    theme: settingsRes.ok ? settingsRes.data.theme : settingsRes.error
  })
  t = langRes.ok && langRes.data === 'en' ? I18N.en : I18N.zh
  document.documentElement.lang = t === I18N.zh ? 'zh' : 'en'

  $('title').textContent = label('title')
  $('subtitle').textContent = label('subtitle')
  $('app-id').textContent = sdk.appId
  $('sdk-version').textContent = sdk.version
  $('language').textContent = langRes.ok ? langRes.data : String(langRes.error)
  $('theme').textContent = settingsRes.ok ? settingsRes.data.theme : String(settingsRes.error)
  $('storage-key').placeholder = label('storageKey')
  $('storage-value').placeholder = label('storageValue')
  $('btn-set').textContent = label('btnSet')
  $('btn-get').textContent = label('btnGet')
  $('btn-log').textContent = label('btnLog')
  $('btn-notify').textContent = label('btnNotify')
  $('output').textContent = label('hint')

  $('btn-set').addEventListener('click', async () => {
    const res = await sdk.storage.set($('storage-key').value, $('storage-value').value)
    log(`[storage.set] ${res.ok ? label('ok') : label('fail')}${res.error ? ': ' + res.error : ''}`)
  })
  $('btn-get').addEventListener('click', async () => {
    const res = await sdk.storage.get($('storage-key').value)
    log(`[storage.get] ${res.ok ? label('ok') : label('fail')}: ${JSON.stringify(res.data)}`)
  })
  $('btn-log').addEventListener('click', async () => {
    const res = await sdk.log('info', 'sample-app button click')
    log(`[log] ${res.ok ? label('ok') : label('fail')}`)
  })
  $('btn-notify').addEventListener('click', async () => {
    const res = await sdk.ui.notify({ title: label('title'), body: new Date().toLocaleString() })
    log(`[notify] ${res.ok ? label('ok') : label('fail')}`)
  })
}

init()
