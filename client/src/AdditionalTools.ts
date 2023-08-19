import { useDialog } from './store/useDialog'
import { useDocumentCache } from './store/useDocumentCache'
import { useSheetManager } from './store/useSheetManager'
import IncrementStudentYearDialog from './components/IncrementStudentYear.vue'
import CreateTempSheet from './components/CreateTempSheet.vue'

export const tools = {
  STUDENTS: [
    {
      name: 'Toggle Read-Only Mode',
      handler: () => {
        useSheetManager().readOnlyMode = !useSheetManager().readOnlyMode
      }
    },
    {
      name: 'Suggested Deletions',
      disableInReadOnly: true,
      handler: () => { useDialog().setPanelCover('open') }
    },
    {
      name: 'Increment Student Year',
      disableInReadOnly: true,
      handler: async () => {
        useDialog().open({
          component: {
            render: IncrementStudentYearDialog
          }
        })
      }
    },
    {
      name: 'Create Temporary Sheet',
      disableInReadOnly: true,
      handler: async () => {
        useDialog().open({
          component: {
            render: CreateTempSheet
          }
        })
      }
    },
    {
      name: 'Refresh Data',
      handler: () => {
        useDocumentCache().getAllDocuments({
          forceCacheRefresh: true,
        });
      }
    }
  ],
  GRADUATES: [
    {
      name: 'Toggle Read-Only Mode',
      handler: () => {
        useSheetManager().readOnlyMode = !useSheetManager().readOnlyMode
      }
    },
    {
      name: 'Suggested Deletions',
      disableInReadOnly: true,
      handler: () => { useDialog().setPanelCover('open') }
    },
    {
      name: 'Create Temporary Sheet',
      disableInReadOnly: true,
      handler: async () => {
        useDialog().open({
          component: {
            render: CreateTempSheet
          }
        })
      }
    },
    {
      name: 'Refresh Data',
      handler: () => {
        useDocumentCache().getAllDocuments({
          forceCacheRefresh: true,
        });
      }
    }
  ],
  MODULES: [
    {
      name: 'Toggle Read-Only Mode',
      handler: () => {
        useSheetManager().readOnlyMode = !useSheetManager().readOnlyMode
      }
    },
    {
      name: 'Suggested Deletions',
      disableInReadOnly: true,
      handler: () => { useDialog().setPanelCover('open') }
    },
    {
      name: 'Create Temporary Sheet',
      disableInReadOnly: true,
      handler: async () => {
        useDialog().open({
          component: {
            render: CreateTempSheet
          }
        })
      }
    },
    {
      name: 'Refresh Data',
      handler: () => {
        useDocumentCache().getAllDocuments({
          forceCacheRefresh: true,
        });
      }
    }
  ],
  COMPLETED_MODULES: [
    {
      name: 'Toggle Read-Only Mode',
      handler: () => {
        useSheetManager().readOnlyMode = !useSheetManager().readOnlyMode
      }
    },
    {
      name: 'Suggested Deletions',
      disableInReadOnly: true,
      handler: () => { useDialog().setPanelCover('open') }
    },
    {
      name: 'Create Temporary Sheet',
      disableInReadOnly: true,
      handler: async () => {
        useDialog().open({
          component: {
            render: CreateTempSheet
          }
        })
      }
    },
    {
      name: 'Refresh Data',
      handler: () => {
        useDocumentCache().getAllDocuments({
          forceCacheRefresh: true,
        });
      }
    }
  ],
  THESES: [
    {
      name: 'Toggle Read-Only Mode',
      handler: () => {
        useSheetManager().readOnlyMode = !useSheetManager().readOnlyMode
      }
    },
    {
      name: 'Suggested Deletions',
      disableInReadOnly: true,
      handler: () => { useDialog().setPanelCover('open') }
    },
    {
      name: 'Create Temporary Sheet',
      disableInReadOnly: true,
      handler: async () => {
        useDialog().open({
          component: {
            render: CreateTempSheet
          }
        })
      }
    },
    {
      name: 'Refresh Data',
      handler: () => {
        useDocumentCache().getAllDocuments({
          forceCacheRefresh: true,
        });
      }
    }
  ],
  GRADUATE_ENGAGEMENTS: [
    {
      name: 'Toggle Read-Only Mode',
      handler: () => {
        useSheetManager().readOnlyMode = !useSheetManager().readOnlyMode
      }
    },
    {
      name: 'Suggested Deletions',
      disableInReadOnly: true,
      handler: () => { useDialog().setPanelCover('open') }
    },
    {
      name: 'Create Temporary Sheet',
      disableInReadOnly: true,
      handler: async () => {
        useDialog().open({
          component: {
            render: CreateTempSheet
          }
        })
      }
    },
    {
      name: 'Refresh Data',
      handler: () => {
        useDocumentCache().getAllDocuments({
          forceCacheRefresh: true,
        });
      }
    }
  ]
}