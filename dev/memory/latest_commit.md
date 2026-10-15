# 最新提交摘要（Latest Commit Summary）

| 字段 | 内容 |
|------|------|
| 时间 | 2026-10-15 |
| Hash | d7cbebf（平台）/ 4dce5c0（应用） |
| 提交信息 | feat: SDK 0.3.0 saveTextFile + 平台默认应用 seed；DevGuide「AI 提示词」页（D19） |
| 变更内容 | SDK 新增 sdk.ui.saveTextFile（原生保存对话框，ui 权限）；registerSdkHandler 改 async；default-apps.ts 首启 seed 机制（platform_meta 标记、卸载不重装）；electron-builder extraResources + copy-default-apps 脚本；DevGuide 导出 markdown 开发任务书（可选路径 + 浏览器下载回退） |
| 涉及文件 | packages/sdk/*、packages/shell/src/main/{default-apps,index,permission-gateway,sdk-service}.ts、electron-builder.yml、packages/apps/dev-guide/{src/lib/dev-prompt.ts,src/pages/ExportPromptPage.tsx,src/App.tsx,src/components/Sidebar.tsx,src/i18n/*} |
