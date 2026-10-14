import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// 生成应用自更新测试夹具：
// test-update/update-manifest.json  更新清单（指向 0.2.1 安装包）
// test-update/sample-app-0.2.1.zip  升级版安装包
// test-update/latest.yml            平台自更新测试用（版本 99.0.0）

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const fixtures = join(root, 'test-update')
rmSync(fixtures, { recursive: true, force: true })
mkdirSync(fixtures, { recursive: true })

// 1. 构造 0.2.1 版应用包（src + 版本提升的 manifest，去掉 update.url）
const stage = join(root, '.update-stage')
rmSync(stage, { recursive: true, force: true })
mkdirSync(stage, { recursive: true })
cpSync(join(root, 'src'), join(stage, 'src'), { recursive: true })
const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf-8'))
manifest.version = '0.2.1'
delete manifest.update
writeFileSync(join(stage, 'manifest.json'), JSON.stringify(manifest, null, 2))

const zip = join(fixtures, 'sample-app-0.2.1.zip')
execSync(
  `powershell -NoProfile -Command "Compress-Archive -Path '${join(stage, 'src', '*')}','${join(stage, 'manifest.json')}' -DestinationPath '${zip}' -Force"`
)
rmSync(stage, { recursive: true, force: true })

// 2. 更新清单
writeFileSync(
  join(fixtures, 'update-manifest.json'),
  JSON.stringify({ version: '0.2.1', url: 'http://127.0.0.1:9851/sample-app-0.2.1.zip' }, null, 2)
)

// 3. 平台更新测试用的 latest.yml（版本 99.0.0，不提供真实安装包，仅验证检查/下载状态流转）
writeFileSync(
  join(fixtures, 'latest.yml'),
  [
    'version: 99.0.0',
    'files:',
    '  - url: SciTool-99.0.0-setup.exe',
    '    sha512: abc',
    '    size: 1',
    'path: SciTool-99.0.0-setup.exe',
    'sha512: abc',
    'releaseDate: "2026-10-14T00:00:00.000Z"'
  ].join('\n')
)

console.log('Fixtures ready:', fixtures)
