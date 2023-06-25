import { useDialog } from './store/useDialog'
import { useSheetManager } from './store/useSheetManager'
import { warn } from './Warn'
import IncrementStudentYearDialog from './components/IncrementStudentYear.vue'
import CreateTempSheet from './components/CreateTempSheet.vue'

export const tools = {
  STUDENTS: [
    {
      name: 'Cover Panel',
      handler: async () => {
        useSheetManager().setPanelCover(!useSheetManager().panelCover)
      }
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
      name: 'Create Temporary Sheet',
      handler: async () => {
        useDialog().open({
          component: CreateTempSheet
        })
      }
    }
  ],
}