import { useDocumentCache } from '../../store/useDocumentCache'
import { useSheetManager } from '../../store/useSheetManager'
import { getPanel } from '../../Panels'
import { computed } from 'vue'

export function useStudentMatcher(studentId: string) {

  const { getActivePanel } = useSheetManager()
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
        tooltip: `This Student Has Graduated - ${idText.value}`,
        icon: graduatePanel.icon
      }
    } else if (studentId) {
      return {
        text: 'No Student Found',
        style: {
          color: 'red',
          fontWeight: 900
        },
        tooltip: `No ${studentPanel.title.singular} or ${graduatePanel.title.singular} Found For ${idText.value}`,
        icon: 'mdi-alert-circle'
      }
    } else {
      return {
        text: 'No Student ID',
        style: {
          color: 'red',
          fontWeight: 900
        },
        tooltip: `This ${getActivePanel.title.singular} Does Not Have A Student ID Set`,
        icon: 'mdi-account-off'
      }
    }
  })

  return {
    studentMatch
  }
}