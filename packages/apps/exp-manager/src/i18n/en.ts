import type { Dict } from './zh'

const en: Dict = {
  app: {
    name: 'Experiments',
    tagline: 'Experiment Manager',
    mockBadge: 'mock SDK',
    mockBanner: 'Browser preview: platform is absent, using in-memory mock SDK. Data will not persist.',
    sdkMissing: 'window.sdk not found — apps must be launched by the platform, which injects the SDK via preload.'
  },
  tree: {
    newFolder: 'New folder',
    newExp: 'New experiment',
    rename: 'Rename',
    move: 'Move to…',
    delete: 'Delete',
    newSubfolder: 'New subfolder',
    folderPlaceholder: 'Folder name',
    expTitlePlaceholder: 'Experiment title',
    create: 'Create',
    cancel: 'Cancel',
    ok: 'OK',
    renameTitle: 'Rename',
    moveTitle: 'Move "{{name}}" to',
    moveRoot: '(root)',
    moveEmpty: 'No target folder available',
    deleteFolderConfirm: 'Delete folder "{{name}}"? Subfolders and experiments inside will move to its parent.',
    deleteExpConfirm: 'Delete experiment "{{name}}"? This cannot be undone.',
    untitled: 'Untitled experiment',
    loadError: 'Failed to load'
  },
  doc: {
    emptyTitle: 'No experiment selected',
    emptyDesc: 'Pick an experiment file on the left, or click "New experiment" to start.',
    dropHint: 'Drop CSV / Excel / images here to render table / image blocks; clicking empty space moves the cursor to the end of the nearest block',
    tableUntitled: 'Untitled table',
    addRow: 'Add row',
    delRow: 'Del row',
    upload: 'Upload image',
    imageTooBig: 'Image exceeds the 5MB limit, skipped',
    imageInvalid: 'Only CSV, Excel and image files are supported',
    tableEmpty: 'Table is empty, skipped',
    moveUp: 'Move up',
    moveDown: 'Move down',
    deleteBlock: 'Delete block'
  },
  table: {
    rowCount: '{{count}} rows',
    expand: 'Expand all',
    collapse: 'Collapse'
  },
  panel: {
    expand: 'Experiment info',
    collapse: 'Collapse',
    fieldTitle: 'Title',
    fieldType: 'Type',
    typeHint: 'e.g. "Cell culture", "Western blot"',
    settings: 'Experiment settings',
    addSetting: 'Add setting',
    colName: 'Name',
    colValue: 'Value',
    colUnit: 'Unit',
    remove: 'Remove',
    notes: 'Notes',
    notesPlaceholder: 'Experiment notes (markdown)…',
    created: 'Created',
    updated: 'Updated'
  },
  save: {
    save: 'Save',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    zoomReset: 'Click to reset 100%',
    saved: 'Saved',
    unsaved: 'Unsaved',
    failed: 'Save failed',
    conflict: 'The doc was modified elsewhere — refresh and retry'
  },
  md: {
    preview: 'Preview',
    edit: 'Edit'
  }
}

export default en
