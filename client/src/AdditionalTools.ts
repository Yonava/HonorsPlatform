import { useDialog } from './store/useDialog'
import { useDocumentCache } from './store/useDocumentCache'
import { useSheetManager } from './store/useSheetManager'
import IncrementStudentYearDialog from './components/IncrementStudentYear.vue'
import CreateTempSheet from './components/CreateTempSheet.vue'


import { warn } from './Warn'

export const tools = {
  STUDENTS: [
    {
      name: 'Warn Me',
      handler: async () => {
        try {
          await warn()
        } catch (e: any) {
          if (e === 'CANCELLED_BACKGROUND') {
            console.log('warn was cancelled in the background')
          } else {
            useDialog().open({
              persistent: true,
              body: {
                title: 'You Cancelled On Me',
                description: 'Not in the background!!!!',

              }
            })
          }
        }
      }
    },
    {
      name: 'Toggle Read-Only Mode',
      handler: () => {
        useSheetManager().toggleReadOnlyMode()
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