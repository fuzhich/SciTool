import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// 将已构建的默认应用 zip 拷入 resources/default-apps（electron-builder extraResources 打包用）
const root = dirname(dirname(fileURLToPath(import.meta.url)))
const src = join(root, '../apps/dev-guide/dist/dev-guide.zip')
const destDir = join(root, 'resources/default-apps')

if (!existsSync(src)) {
  console.error(`默认应用包不存在：${src}`)
  console.error('请先构建：pnpm --filter @scitool/dev-guide package')
  process.exit(1)
}
mkdirSync(destDir, { recursive: true })
copyFileSync(src, join(destDir, 'dev-guide.zip'))
console.log('Copied default app zip:', src)
