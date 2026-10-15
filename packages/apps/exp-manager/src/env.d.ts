/// <reference types="vite/client" />
import type { Sdk } from '@scitool/sdk'

declare global {
  interface Window {
    // 由平台 preload 注入（浏览器 dev 模式为 undefined，此时使用 mock SDK）
    sdk?: Sdk
  }
}

export {}
