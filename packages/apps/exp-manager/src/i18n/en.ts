import type { Dict } from './zh'

const en: Dict = {
  app: {
    name: 'Experiments',
    tagline: 'Experiment Manager',
    mockBadge: 'mock SDK',
    mockBanner: 'Browser preview: platform is absent, using in-memory mock SDK. Data will not persist.',
    sdkMissing: 'window.sdk not found — apps must be launched by the platform, which injects the SDK via preload.'
  },
  home: {
    title: 'Experiments',
    newExp: 'New experiment',
    emptyTitle: 'No experiment docs yet',
    emptyDesc: 'Click "New experiment" to create your first doc: settings, tabular data, figures, results and notes.',
    colType: 'Type',
    colUpdated: 'Updated',
    untitled: 'Untitled experiment',
    deleteConfirm: 'Delete experiment "{{name}}"? This cannot be undone.',
    loadError: 'Failed to load',
    delete: 'Delete'
  },
  editor: {
    back: 'Back',
    save: 'Save',
    saved: 'Saved',
    saveFailed: 'Save failed',
    unsaved: 'Unsaved changes',
    conflict: 'The doc was modified elsewhere — refresh and retry',
    notFound: 'Doc not found or deleted',
    loadFailed: 'Failed to load',
    sectionBasic: 'Basic info',
    fieldTitle: 'Title',
    fieldType: 'Experiment type',
    typeHint: 'Free text, e.g. "Cell culture", "Western blot" (type templates come in a later version)',
    sectionSettings: 'Experiment settings',
    addSetting: 'Add setting',
    colName: 'Name',
    colValue: 'Value',
    colUnit: 'Unit',
    remove: 'Remove',
    sectionTables: 'Tables',
    addTable: 'Add table',
    tableName: 'Table name',
    addColumn: 'Add column',
    addRow: 'Add row',
    delRow: 'Del row',
    emptyTable: 'No columns — click "Add column" first',
    tableUntitled: 'Untitled table',
    sectionImages: 'Figures',
    upload: 'Upload image',
    imageName: 'Name',
    imageCaption: 'Caption',
    imageTooBig: 'Image exceeds the 5MB limit, skipped',
    imageInvalid: 'Only image files are supported',
    imageRemoveConfirm: 'Remove figure "{{name}}"?',
    sectionResults: 'Results',
    addResult: 'Add result',
    resultTitle: 'Title',
    sectionNotes: 'Notes',
    notesPlaceholder: 'Experiment notes (markdown supported)…'
  },
  md: {
    preview: 'Preview',
    edit: 'Edit'
  }
}

export default en
