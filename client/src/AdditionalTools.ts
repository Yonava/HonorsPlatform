import { useDialog } from '@store/useDialog'
import { useDocumentCache } from '@store/useDocumentCache'
import IncrementStudentYearDialog from './components/IncrementStudentYear.vue'
import CreateTempSheet from './components/CreateTempSheet.vue'
import type { PanelName } from './Panels'

type Tool = {
  name: string,
  handler: () => void,
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
      disableInReadOnly: true,
      handler: () => {
        useDialog().setPanelCover('open')
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
  STUDENTS: [
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
  ],
  GRADUATES: [],
  MODULES: [],
  COMPLETED_MODULES: [],
  THESES: [],
  GRADUATE_ENGAGEMENTS: []
}