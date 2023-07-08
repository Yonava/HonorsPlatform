import { useDocumentCache } from '../../store/useDocumentCache'
import { useSheetManager } from '../../store/useSheetManager'
import { getPanel } from '../../Panels'
import { computed } from 'vue'

export function useStudentMatcher(studentSysId: string) {

  const { getActivePanel } = useSheetManager()
  const studentPanel = getPanel('STUDENTS')
  const graduatePanel = getPanel('GRADUATES')

  const { getItemBySysId } = useDocumentCache()

  const student = computed(() => {
    return getItemBySysId(studentSysId, 'STUDENTS')
  })

  const graduate = computed(() => {
    return getItemBySysId(studentSysId, 'GRADUATES')
  })

  const idText = computed(() => {
    return studentSysId ? `ID ${studentSysId}` : 'No ID'
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
    } else if (studentSysId) {
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