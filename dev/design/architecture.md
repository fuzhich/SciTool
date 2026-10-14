# 整体设计架构（Architecture）

> 状态：**待定** —— 等待开发者提供应用需求（功能定位、目标用户、核心功能）后填充。

## 1. 已确认信息

- 产品形态：桌面应用（Desktop Application）
- 项目名称：SciTool

## 2. 待确认事项

- [ ] 应用的核心功能与定位（科学工具？通用工具箱？）
- [ ] 技术栈选型：
  - 原生方案：PySide6 / PyQt6、Tauri、Electron、WPF、WinForms
  - 影响因素：开发者的技术栈熟悉度、是否需要跨平台、打包体积、界面美观度要求
- [ ] 目标平台：仅 Windows / 跨平台
- [ ] 打包与分发方式

## 3. 初步建议

| 方案 | 优点 | 缺点 |
|------|------|------|
| PySide6（Python） | 与现有 conda 环境契合、开发快、生态成熟 | 打包体积大、性能一般 |
| Tauri（Rust + Web） | 体积小、界面现代 | 需 Rust 工具链、前端知识 |
| Electron | 生态最大、界面现代 | 体积大、内存占用高 |
| WPF / WinUI（C#） | Windows 原生体验好 | 仅限 Windows |

建议待核心功能确认后再做最终技术选型，相关讨论记录在 `dev/memory/design_decisions.md`。
