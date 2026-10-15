const zh = {
  app: {
    name: '实验管理',
    tagline: 'Experiment Manager',
    mockBadge: 'mock SDK',
    mockBanner: '浏览器预览模式：平台不在场，使用内存 mock SDK，数据不会持久化。',
    sdkMissing: '未检测到 window.sdk —— 应用需由平台启动，SDK 由平台 preload 注入。'
  },
  tree: {
    newFolder: '新建文件夹',
    newExp: '新建实验',
    rename: '重命名',
    move: '移动到…',
    delete: '删除',
    newSubfolder: '新建子文件夹',
    folderPlaceholder: '文件夹名称',
    expTitlePlaceholder: '实验标题',
    create: '创建',
    cancel: '取消',
    ok: '确定',
    renameTitle: '重命名',
    moveTitle: '移动「{{name}}」到',
    moveRoot: '（根目录）',
    moveEmpty: '暂无可用目标文件夹',
    deleteFolderConfirm: '删除文件夹「{{name}}」？其中的子文件夹与实验将移到上级目录。',
    deleteExpConfirm: '确定删除实验「{{name}}」？此操作不可恢复。',
    untitled: '未命名实验',
    loadError: '加载失败'
  },
  doc: {
    emptyTitle: '未选择实验',
    emptyDesc: '从左侧选择实验文件，或点「新建实验」开始记录。',
    sheet: '表',
    dropHint: '将 CSV / Excel / 图片拖入此处，自动渲染为表格块 / 图片块；点击空白处光标落到最近块的末尾继续输入',
    tableUntitled: '未命名表格',
    addRow: '添加行',
    delRow: '删行',
    upload: '上传图片',
    imageTooBig: '图片超过 5MB 限制，未添加',
    imageInvalid: '仅支持 CSV、Excel 与图片文件',
    tableEmpty: '表格内容为空，未添加',
    moveUp: '上移',
    moveDown: '下移',
    deleteBlock: '删除块',
    exportCsv: '导出 CSV',
    exportXlsx: '导出 XLSX',
    exportImage: '导出图片'
  },
  table: {
    rowCount: '共 {{count}} 行',
    expand: '展开全部',
    collapse: '收起'
  },
  panel: {
    expand: '实验信息',
    collapse: '收起',
    fieldTitle: '标题',
    fieldType: '类型',
    typeHint: '如「细胞培养」「Western blot」',
    settings: '实验设置',
    addSetting: '添加设置项',
    colName: '名称',
    colValue: '值',
    colUnit: '单位',
    remove: '移除',
    notes: '备注',
    notesPlaceholder: '实验备注（markdown）…',
    created: '创建于',
    updated: '更新于'
  },
  save: {
    save: '保存',
    exportAll: '导出全部',
    exported: '已导出：{{path}}',
    exportCanceled: '已取消导出',
    zoomIn: '放大',
    zoomOut: '缩小',
    zoomReset: '点击复位 100%',
    saved: '已保存',
    unsaved: '未保存',
    failed: '保存失败',
    conflict: '文档已在别处修改，请刷新后重试'
  },
  md: {
    preview: '预览',
    edit: '编辑'
  }
}

export default zh
export type Dict = typeof zh
