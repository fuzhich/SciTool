import { create } from 'zustand'
import type { AppRecord, PlatformSettings } from '@scitool/sdk'

interface AppStoreState {
  apps: AppRecord[]
  settings: PlatformSettings
  loading: boolean
  load: () => Promise<void>
  refreshApps: () => Promise<void>
  updateSettings: (patch: Partial<PlatformSettings>) => Promise<void>
}

export const useAppStore = create<AppStoreState>((set) => ({
  apps: [],
  settings: { language: 'zh', theme: 'light' },
  loading: true,

  load: async () => {
    const [settingsRes, appsRes] = await Promise.all([window.api.settings.get(), window.api.apps.list()])
    set({
      settings: settingsRes.ok && settingsRes.data ? settingsRes.data : { language: 'zh', theme: 'light' },
      apps: appsRes.ok && appsRes.data ? appsRes.data : [],
      loading: false
    })
  },

  refreshApps: async () => {
    const res = await window.api.apps.list()
    if (res.ok && res.data) set({ apps: res.data })
  },

  updateSettings: async (patch) => {
    const res = await window.api.settings.set(patch)
    if (res.ok && res.data) set({ settings: res.data })
  }
}))
