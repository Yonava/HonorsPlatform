import { useDialog } from '@store/useDialog'
import { useDocumentCache } from '@store/useDocumentCache'
import IncrementStudentYearDialog from './components/IncrementStudentYear.vue'
import CreateTempSheet from './components/CreateTempSheet.vue'
import type { PanelName } from './Panels'

type Tool = {
  name: string,
  handler: () => void,
  icon: string
  disableInReadOnly?: boolean,
  tooltip?: string,
}

type Tools = {
  [key in (PanelName | 'ALL')]: Tool[]
}

export const tools: Tools = {
  ALL: [
    {
      name: 'Suggested Deletions',
      icon: 'mdi-delete-alert',
      disableInReadOnly: true,
      handler: () => {
        useDialog().setPanelCover('open')
      }
    },
    {
      name: 'Create Temporary Sheet',
      disableInReadOnly: true,
      icon: 'mdi-google-spreadsheet',
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
      icon: 'mdi-refresh',
      handler: () => {
        useDocumentCache().getAllDocuments({
          forceCacheRefresh: true,
        });
      }
    }
  ],
  STUDENTS: [
    {
      name: 'Increment Student Year',
      icon: 'mdi-numeric-positive-1',
      disableInReadOnly: true,
      handler: async () => {
        useDialog().open({
          component: {
            render: IncrementStudentYearDialog
          }
        })
      }
    },
  ],
  GRADUATES: [],
  MODULES: [],
  COMPLETED_MODULES: [],
  THESES: [],
  GRADUATE_ENGAGEMENTS: []
}