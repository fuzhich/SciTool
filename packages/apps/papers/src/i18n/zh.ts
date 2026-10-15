const zh = {
  app: {
    name: '论文管理',
    tagline: 'Paper Manager',
    mockBadge: 'mock SDK',
    mockBanner: '浏览器预览模式：平台不在场，使用内存 mock SDK，数据不会持久化。',
    sdkMissing: '未检测到 window.sdk —— 应用需由平台启动，SDK 由平台 preload 注入。'
  },
  tree: {
    newFolder: '新建文件夹',
    importPdf: '导入论文',
    rename: '重命名',
    move: '移动到…',
    delete: '删除',
    newSubfolder: '新建子文件夹',
    folderPlaceholder: '文件夹名称',
    paperNamePlaceholder: '论文名称',
    create: '创建',
    cancel: '取消',
    ok: '确定',
    renameTitle: '重命名',
    moveTitle: '移动「{{name}}」到',
    moveRoot: '（根目录）',
    moveEmpty: '暂无可用目标文件夹',
    deleteFolderConfirm: '删除文件夹「{{name}}」？其中的子文件夹与论文将移到上级目录。',
    deletePaperConfirm: '确定删除论文「{{name}}」？此操作不可恢复。',
    untitled: '未命名论文',
    loadError: '加载失败'
  },
  detail: {
    emptyTitle: '未选择论文',
    emptyDesc: '从左侧选择论文，或点「导入论文」添加 PDF。',
    dropHint: '将 PDF 拖入此处导入（也可拖到左侧文件夹中）',
    aiToggleTitle: 'AI 识别（从首页文本提取元数据）',
    aiUnavailable: '平台未配置 AI Key（设置 → AI 服务），已回退非 AI 识别',
    extracting: '正在识别元数据…',
    reExtract: '重新识别',
    reExtractConfirm: '将用识别结果覆盖当前元数据，确定继续？',
    extractDone: '识别完成',
    sources: '数据来源',
    failed: '失败步骤',
    noMeta: '未获得自动元数据，请手动填写',
    fieldTitle: '标题',
    fieldAuthors: '作者（逗号分隔）',
    fieldAffiliations: '所属单位（分号分隔）',
    fieldYear: '发布时间',
    fieldVenue: '期刊 / 会议',
    fieldDoi: 'DOI',
    fieldAbstract: '摘要',
    fieldKeywords: '关键词',
    pdfLabel: 'PDF 文件',
    pdfMissing: '未导入 PDF',
    importTooBig: 'PDF 超过 50MB 限制',
    importFailed: '导入失败',
    noAiKey: 'AI 不可用'
  },
  save: {
    save: '保存',
    saved: '已保存',
    unsaved: '未保存',
    failed: '保存失败',
    conflict: '文档已在别处修改，请刷新后重试'
  }
}

export default zh
export type Dict = typeof zh
