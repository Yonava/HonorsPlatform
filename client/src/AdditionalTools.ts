import { useDialog } from '@store/useDialog'
import { useDocumentCache } from '@store/useDocumentCache'
import IncrementStudentYearDialog from './components/IncrementStudentYear.vue'
import CreateTempSheet from './components/CreateTempSheet.vue'
import type { PanelName } from '@panels'

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
      handler: () => useDialog().setPanelCover('open'),
      tooltip: 'View auto curated suggestions on which items to delete'
    },
    {
      name: 'Create Temporary Sheet',
      disableInReadOnly: true,
      icon: 'mdi-google-spreadsheet',
      handler: () => useDialog().open({ component: CreateTempSheet }),
      tooltip: 'Create a temporary sheet with selected data'
    },
    {
      name: 'Refresh Data',
      icon: 'mdi-refresh',
      handler: () => {
        useDocumentCache().getAllDocuments({
          forceCacheRefresh: true,
        });
      },
      tooltip: 'Force a refresh to get the latest data'
    }
  ],
  STUDENTS: [
    {
      name: 'Increment Student Year',
      icon: 'mdi-numeric-positive-1',
      disableInReadOnly: true,
      handler: () => useDialog().open({ component: IncrementStudentYearDialog }),
      tooltip: 'Move all selected students to the next year (e.g. from freshmen to sophomore)'
    },
  ],
  GRADUATES: [],
  MODULES: [],
  COMPLETED_MODULES: [],
  THESES: [],
  GRADUATE_ENGAGEMENTS: []
}