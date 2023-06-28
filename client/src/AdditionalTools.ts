import { useDialog } from './store/useDialog'
import { warn } from './Warn'
import IncrementStudentYearDialog from './components/IncrementStudentYear.vue'
import CreateTempSheet from './components/CreateTempSheet.vue'

export const tools = {
  STUDENTS: [
    {
      name: 'Suggested Deletions',
      handler: () => { useDialog().setPanelCover('open') }
    },
    {
      name: 'Increment Student Year',
      handler: async () => {
        await warn()
        useDialog().open({
          component: IncrementStudentYearDialog
        })
      }
    },
    {
      name: 'Create Temporary Sheet',
      handler: async () => {
        useDialog().open({
          component: CreateTempSheet
        })
      }
    }
  ],
  GRADUATES: [
    {
      name: 'Suggested Deletions',
      handler: () => { useDialog().setPanelCover('open') }
    },
    {
      name: 'Create Temporary Sheet',
      handler: async () => {
        useDialog().open({
          component: CreateTempSheet
        })
      }
    }
  ],
  MODULES: [
    {
      name: 'Suggested Deletions',
      handler: () => { useDialog().setPanelCover('open') }
    },
    {
      name: 'Create Temporary Sheet',
      handler: async () => {
        useDialog().open({
          component: CreateTempSheet
        })
      }
    }
  ],
  COMPLETED_MODULES: [
    {
      name: 'Suggested Deletions',
      handler: () => { useDialog().setPanelCover('open') }
    },
    {
      name: 'Create Temporary Sheet',
      handler: async () => {
        useDialog().open({
          component: CreateTempSheet
        })
      }
    }
  ],
  THESES: [
    {
      name: 'Suggested Deletions',
      handler: () => { useDialog().setPanelCover('open') }
    },
    {
      name: 'Create Temporary Sheet',
      handler: async () => {
        useDialog().open({
          component: CreateTempSheet
        })
      }
    }
  ],
}