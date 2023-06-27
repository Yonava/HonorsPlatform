import { Module, CompletedModule } from '../../SheetTypes'
import { useDocumentCache } from '../../store/useDocumentCache'
import { computed } from 'vue'

export function useStudentModuleMatcher(modules: Module | CompletedModule) {

  const { Students } = useDocumentCache()

  const student = computed(() => {
    const studentMatch = Students.list.find(s => s.id === modules.studentId)
    if (!studentMatch?.id) {
      return null
    }
    return studentMatch ?? null
  })

  const studentId = computed(() => {
    if (student.value || Students.list.length === 0) {
      return {
        tooltip: 'Student ID',
        style: {
          fontWeight: 400
        }
      }
    } else {
      return {
        tooltip: 'No Student Linked',
        style: {
          color: 'red',
          fontWeight: 900
        }
      }
    }
  })

  return {
    student,
    studentId
  }
}