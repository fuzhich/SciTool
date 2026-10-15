export interface MarketApp {
  id: string
  name: { zh: string; en: string }
  description: { zh: string; en: string }
  version: string
  minSdkVersion: string
  zipUrl: string
  size: number
}

export interface MarketManifest {
  version: number
  apps: MarketApp[]
}
