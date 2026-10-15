# 发版流程备忘（Release Checklist）

> 依据 D13（NSIS 打包）与 D17（v0.1.0 发布实践）整理，每次发版按此执行。

## 1. 发布前检查

- [ ] 工作区干净，所有改动已提交（`git status`）
- [ ] `git check-ignore dev/secret/` 确认 secret 目录被忽略
- [ ] 冒烟测试双绿（dev 模式 + 打包模式）
- [ ] 版本号已更新：`packages/shell/package.json` 的 `version`（electron-builder 以它为准，NSIS 产物名 `SciTool-${version}-setup.exe`）
- [ ] `npm run build` 通过（内含 typecheck）

## 2. 构建并发布到 GitHub Release

```bash
# gh CLI 在 conda agent-tool 环境，用绝对路径
cd packages/shell
GH_TOKEN=$(/d/SDK/MiniConda/envs/agent-tool/Library/bin/gh auth token) \
  npm run build:win -- --publish always
```

- 发布配置在 `packages/shell/electron-builder.yml` 的 `publish`（github / fuzhich / SciTool），无需命令行指定 provider。
- 产物：NSIS 安装器 + `latest.yml` + `blockmap`（后者为增量更新所需）。

## 3. 双草稿坑处理（D17 实测）

electron-builder 每次发布可能创建**两个草稿 Release**，且资产分散在两个草稿上：

1. 发布后检查：`gh api repos/fuzhich/SciTool/releases`
2. 删除残缺草稿，保留资产齐全的一个并转正式：`gh release edit <tag> --draft=false`
3. 缺失资产用 `gh release upload <tag> <file> --clobber` 补齐
4. **切勿**用管道 `head` 截断发布命令输出（SIGPIPE 会杀死上传流程）

## 4. 发布后验证

- [ ] Release 页含完整资产：`SciTool-x.y.z-setup.exe` + `latest.yml` + `blockmap`
- [ ] 已安装版本：设置 → 检查更新 → 显示「已是最新版本」（验证更新源可达 GitHub Release）

## 5. 网络注意

- **平台更新**（electron-updater v6）：走 Electron net 模块，遵循系统代理 127.0.0.1:7897，可达 GitHub。
- **应用自更新**（app-updater，Node fetch）：**不**遵循系统代理 —— 应用 `update.url` 应选国内可达主机。
