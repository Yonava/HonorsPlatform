import { useDocumentCache } from '../../store/useDocumentCache'
import { getPanel } from '../../Panels'
import { computed } from 'vue'

export function useStudentMatcher(studentId: string) {

  const studentPanel = getPanel('STUDENTS')
  const graduatePanel = getPanel('GRADUATES')

  const { Students, Graduates } = useDocumentCache()

  const student = computed(() => {
    const studentMatch = Students.list.find(s => s.id === studentId)
    if (!studentMatch?.id) {
      return null
    }
    return studentMatch ?? null
  })

  const graduate = computed(() => {
    const graduateMatch = Graduates.list.find(g => g.id === studentId)
    if (!graduateMatch?.id) {
      return null
    }
    return graduateMatch ?? null
  })

  const idText = computed(() => {
    return studentId ? `ID ${studentId}` : 'No ID'
  })

  const studentMatch = computed(() => {
    if (student.value) {
      return {
        text: student.value.name || 'No Name',
        style: {
          fontWeight: 400
        },
        tooltip: `${studentPanel.title.singular} Name - ${idText.value}`,
        icon: studentPanel.icon
      }
    } else if (graduate.value) {
      return {
        text: graduate.value.name || 'No Name',
        style: {
          color: 'red',
          fontWeight: 900
        },
        tooltip: `${graduatePanel.title.singular} Name - ${idText.value}`,
        icon: graduatePanel.icon
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