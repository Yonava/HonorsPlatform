import { useStudentMatcher } from '../../StudentMatcher'
import { computed } from 'vue'
import { getPanel } from '../../Panels'

export function useStudentInfo(studentSysId: string) {

  const { studentMatch } = useStudentMatcher(studentSysId)

  const studentPanel = getPanel('STUDENTS')
  const graduatePanel = getPanel('GRADUATES')

  const idText = computed(() => {
    if (studentMatch.value) {
      return `ID ${studentMatch.value.id}`
    } else {
      return 'No ID'
    }
  })

  const studentInfo = computed(() => {
    if (studentMatch.value.error === 'NOT_FOUND') {
      return {
        text: 'No Student Found',
        style: {
          color: 'red',
          fontWeight: 900
        },
        tooltip: `Could Not Find Student`,
        icon: 'mdi-alert-circle'
      }
    } else if (studentMatch.value.error === 'NOT_LINKED') {
      return {
        text: 'No Student Linked',
        style: {
          color: 'red',
          fontWeight: 900
        },
        tooltip: 'Not Linked To A Student or Graduate',
        icon: 'mdi-account-off'
      }
    } else if (studentMatch.value.foundIn === 'STUDENTS') {
      return {
        text: studentMatch.value.name || 'No Name',
        style: {
          fontWeight: 400
        },
        tooltip: idText.value,
        icon: studentPanel.icon
      }
    } else if (studentMatch.value.foundIn === 'GRADUATES') {
      return {
        text: studentMatch.value.name || 'No Name',
        style: {
          color: 'red',
          fontWeight: 900
        },
        tooltip: 'This Student Has Graduated - ' + idText.value,
        icon: graduatePanel.icon
      }
    } else {
      return {
        text: 'Problem Linking Student',
        style: {
          color: 'red',
          fontWeight: 900
        },
        tooltip: 'Contact Developer',
        icon: 'mdi-alert-circle'
      }
    }
  })

  return {
    studentInfo
  }
}