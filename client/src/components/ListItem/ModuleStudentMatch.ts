import { Module, CompletedModule } from '../../SheetTypes'
import { useDocumentCache } from '../../store/useDocumentCache'
import { computed } from 'vue'

export function useStudentModuleMatcher(module: Module | CompletedModule) {

  const { Students, Graduates } = useDocumentCache()

  const student = computed(() => {
    const studentMatch = Students.list.find(s => s.id === module.studentId)
    if (!studentMatch?.id) {
      return null
    }
    return studentMatch ?? null
  })

  const graduate = computed(() => {
    const graduateMatch = Graduates.list.find(g => g.id === module.studentId)
    if (!graduateMatch?.id) {
      return null
    }
    return graduateMatch ?? null
  })

  const idText = computed(() => {
    return module.studentId ? `ID ${module.studentId}` : 'No ID'
  })

  const studentMatch = computed(() => {
    if (student.value) {
      return {
        text: student.value.name || 'No Name',
        style: {
          fontWeight: 400
        },
        tooltip: 'Student Name - ' + idText.value,
        icon: 'mdi-account'
      }
    } else if (graduate.value) {
      return {
        text: graduate.value.name || 'No Name',
        style: {
          color: 'red',
          fontWeight: 900
        },
        tooltip: 'Graduate Name - ' + idText.value,
        icon: 'mdi-account-school'
      }
    } else {
      return {
        text: 'No Student Linked',
        style: {
          color: 'red',
          fontWeight: 900
        },
        tooltip: idText.value,
        icon: 'mdi-account-off'
      }
    }
  })

  return {
    studentMatch
  }
}