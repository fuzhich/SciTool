import { execSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const dist = join(root, 'dist')
rmSync(dist, { recursive: true, force: true })
mkdirSync(dist, { recursive: true })

// Windows 项目：用 PowerShell Compress-Archive 打包，zip 根目录含 manifest.json 与 src 内容
const cmd = `powershell -NoProfile -Command "Compress-Archive -Path '${join(root, 'src', '*')}','${join(root, 'manifest.json')}' -DestinationPath '${join(dist, 'sample-app.zip')}' -Force"`
execSync(cmd, { stdio: 'inherit' })
console.log('Packaged:', join(dist, 'sample-app.zip'))
