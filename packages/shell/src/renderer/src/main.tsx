import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initI18n } from './i18n'

async function bootstrap(): Promise<void> {
  const res = await window.api.settings.get()
  const lang = res.ok && res.data ? res.data.language : 'zh'
  await initI18n(lang)
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

void bootstrap()
