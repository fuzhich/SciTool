const zh = {
  app: {
    name: '实验管理',
    tagline: 'Experiment Manager',
    mockBadge: 'mock SDK',
    mockBanner: '浏览器预览模式：平台不在场，使用内存 mock SDK，数据不会持久化。',
    sdkMissing: '未检测到 window.sdk —— 应用需由平台启动，SDK 由平台 preload 注入。'
  },
  home: {
    title: '实验',
    newExp: '新建实验',
    emptyTitle: '还没有实验文档',
    emptyDesc: '点击「新建实验」创建第一个实验文档，记录实验设置、表格数据、统计图、结果与备注。',
    colType: '类型',
    colUpdated: '更新时间',
    untitled: '未命名实验',
    deleteConfirm: '确定删除实验「{{name}}」？此操作不可恢复。',
    loadError: '加载失败',
    delete: '删除'
  },
  editor: {
    back: '返回',
    save: '保存',
    saved: '已保存',
    saveFailed: '保存失败',
    unsaved: '有未保存的修改',
    conflict: '文档已在别处修改，请刷新后重试',
    notFound: '文档不存在或已删除',
    loadFailed: '加载失败',
    sectionBasic: '基本信息',
    fieldTitle: '标题',
    fieldType: '实验类型',
    typeHint: '自由文本，如「细胞培养」「Western blot」（类型模板体系后续版本提供）',
    sectionSettings: '实验设置',
    addSetting: '添加设置项',
    colName: '名称',
    colValue: '值',
    colUnit: '单位',
    remove: '移除',
    sectionTables: '表格',
    addTable: '添加表格',
    tableName: '表格名称',
    addColumn: '添加列',
    addRow: '添加行',
    delRow: '删行',
    emptyTable: '暂无列 —— 先点击「添加列」',
    tableUntitled: '未命名表格',
    sectionImages: '统计图',
    upload: '上传图片',
    imageName: '名称',
    imageCaption: '注释',
    imageTooBig: '图片超过 5MB 限制，未添加',
    imageInvalid: '仅支持图片文件',
    imageRemoveConfirm: '确定移除图片「{{name}}」？',
    sectionResults: '实验结果',
    addResult: '添加结果',
    resultTitle: '标题',
    sectionNotes: '备注',
    notesPlaceholder: '实验备注（支持 markdown）…'
  },
  md: {
    preview: '预览',
    edit: '编辑'
  }
}

export default zh
export type Dict = typeof zh
