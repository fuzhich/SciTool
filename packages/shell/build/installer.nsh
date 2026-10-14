; SciTool 自定义卸载逻辑：卸载时保留用户数据目录（安装目录/data）
; 数据迁移到 %LOCALAPPDATA%\SciTool\data-backup 并提示用户
!macro customUnInstall
  ${If} ${FileExists} "$INSTDIR\data\*.*"
    CreateDirectory "$LOCALAPPDATA\SciTool"
    RMDir /r "$LOCALAPPDATA\SciTool\data-backup"
    CopyFiles /SILENT "$INSTDIR\data\*" "$LOCALAPPDATA\SciTool\data-backup"
    RMDir /r "$INSTDIR\data"
    MessageBox MB_OK|MB_ICONINFORMATION "SciTool 用户数据已保留在：$\r$\n$LOCALAPPDATA\SciTool\data-backup$\r$\n如需彻底删除，请手动移除该文件夹。$\r$\n$\r$\nSciTool user data has been preserved at:$\r$\n$LOCALAPPDATA\SciTool\data-backup$\r$\nRemove it manually if you want to delete it completely." /SD IDOK
  ${EndIf}
!macroend
