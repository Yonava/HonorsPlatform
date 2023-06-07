import { useDialog } from './store/useDialog'
import { warn } from './Warn'
import IncrementStudentYearDialog from './components/IncrementStudentYear.vue'
import CreateTempSheet from './components/CreateTempSheet.vue'

export const tools = {
  STUDENTS: [
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
  GRADUATES: [],
  MODULES: [],
  COMPLETED_MODULES: [],
  THESES: [],
}