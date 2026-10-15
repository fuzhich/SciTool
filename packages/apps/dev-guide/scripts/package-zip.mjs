import { execSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const dist = join(root, 'dist')
const zip = join(dist, 'dev-guide.zip')

rmSync(zip, { force: true })
mkdirSync(dist, { recursive: true })

// zip 根目录平铺 manifest.json 与构建产物（manifest.entry 指向根下 index.html）
const cmd = `powershell -NoProfile -Command "Compress-Archive -Path '${join(dist, '*')}','${join(root, 'manifest.json')}' -DestinationPath '${zip}' -Force"`
execSync(cmd, { stdio: 'inherit' })
console.log('Packaged:', zip)
