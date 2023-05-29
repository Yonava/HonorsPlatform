import { useDialog } from './store/useDialog'
import { warn } from './Warn'
import IncrementStudentYearDialog from './components/IncrementStudentYear.vue'

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
    }
  ],
  GRADUATES: [],
  MODULES: [],
  COMPLETED_MODULES: [],
  THESES: [],
}