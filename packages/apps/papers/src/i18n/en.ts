import type { Dict } from './zh'

const en: Dict = {
  app: {
    name: 'Papers',
    tagline: 'Paper Manager',
    mockBadge: 'mock SDK',
    mockBanner: 'Browser preview: platform is absent, using in-memory mock SDK. Data will not persist.',
    sdkMissing: 'window.sdk not found — apps must be launched by the platform, which injects the SDK via preload.'
  },
  tree: {
    newFolder: 'New folder',
    importPdf: 'Import paper',
    rename: 'Rename',
    move: 'Move to…',
    delete: 'Delete',
    newSubfolder: 'New subfolder',
    folderPlaceholder: 'Folder name',
    paperNamePlaceholder: 'Paper name',
    create: 'Create',
    cancel: 'Cancel',
    ok: 'OK',
    renameTitle: 'Rename',
    moveTitle: 'Move "{{name}}" to',
    moveRoot: '(root)',
    moveEmpty: 'No target folder available',
    deleteFolderConfirm: 'Delete folder "{{name}}"? Subfolders and papers inside will move to its parent.',
    deletePaperConfirm: 'Delete paper "{{name}}"? This cannot be undone.',
    untitled: 'Untitled paper',
    loadError: 'Failed to load'
  },
  detail: {
    emptyTitle: 'No paper selected',
    emptyDesc: 'Pick a paper on the left, or click "Import paper" to add a PDF.',
    dropHint: 'Drop a PDF here to import (or onto a folder on the left)',
    aiToggleTitle: 'AI extraction (metadata from first-page text)',
    aiUnavailable: 'No AI key configured on the platform (Settings → AI Service); falling back to non-AI extraction',
    extracting: 'Extracting metadata…',
    reExtract: 'Re-extract',
    reExtractConfirm: 'Extraction will overwrite current metadata. Continue?',
    extractDone: 'Extraction done',
    sources: 'Data sources',
    failed: 'Failed steps',
    noMeta: 'No automatic metadata obtained — fill in manually',
    fieldTitle: 'Title',
    fieldAuthors: 'Authors (comma separated)',
    fieldAffiliations: 'Affiliations (semicolon separated)',
    fieldYear: 'Published',
    fieldVenue: 'Journal / Conference',
    fieldDoi: 'DOI',
    fieldAbstract: 'Abstract',
    fieldKeywords: 'Keywords',
    pdfLabel: 'PDF file',
    pdfMissing: 'No PDF imported',
    importTooBig: 'PDF exceeds the 50MB limit',
    importFailed: 'Import failed',
    noAiKey: 'AI unavailable'
  },
  save: {
    save: 'Save',
    saved: 'Saved',
    unsaved: 'Unsaved',
    failed: 'Save failed',
    conflict: 'The doc was modified elsewhere — refresh and retry'
  }
}

export default en
