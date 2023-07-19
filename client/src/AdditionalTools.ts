import { useDialog } from './store/useDialog'
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
        useDialog().open({
          component: {
            render: IncrementStudentYearDialog
          }
        })
      }
    },
    {
      name: 'Create Temporary Sheet',
      handler: async () => {
        useDialog().open({
          component: {
            render: CreateTempSheet
          }
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
          component: {
            render: CreateTempSheet
          }
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
          component: {
            render: CreateTempSheet
          }
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
          component: {
            render: CreateTempSheet
          }
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
          component: {
            render: CreateTempSheet
          }
        })
      }
    }
  ],
}