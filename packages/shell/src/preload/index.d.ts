import type { ShellApi } from './index'

declare global {
  interface Window {
    api: ShellApi
  }
}
