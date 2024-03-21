import { computed } from 'vue'
import { getPanel } from '@panels'
import { useStudentMatcher, type StudentMatchError } from '../../StudentMatcher'

export function useStudentInfo(studentSysId: string) {

  const studentMatch = useStudentMatcher(studentSysId)

  const studentPanel = getPanel('STUDENTS')
  const graduatePanel = getPanel('GRADUATES')

  const idText = (id: string) => {
    return id ? `ID ${id}` : 'No ID'
  }

  const studentMatchError = (error: StudentMatchError) => {
    if (error === 'NOT_FOUND') {
      return {
        text: 'No Student Found',
        error: true,
        tooltip: `Could Not Find Student`,
        icon: 'mdi-alert-circle'
      }
    } else if (error === 'NOT_LINKED') {
      return {
        text: 'No Student Linked',
        error: true,
        tooltip: 'Not Linked To A Student or Graduate',
        icon: 'mdi-account-off'
      }
    } else {
      return {
        text: 'Problem Linking Student',
        error: true,
        tooltip: 'Contact Developer',
        icon: 'mdi-alert-circle'
      }
    }
  }

  const studentInfo = computed(() => {

    if ('error' in studentMatch.value) {
      return studentMatchError(studentMatch.value.error)
    }

    if (studentMatch.value.foundIn === 'STUDENTS') {
      return {
        text: studentMatch.value.name || 'No Name',
        error: false,
        tooltip: idText(studentMatch.value.id),
        icon: studentPanel.icon
      }
    }

    return {
      text: studentMatch.value.name || 'No Name',
      error: false,
      tooltip: 'This Student Has Graduated - ' + idText(studentMatch.value.id),
      icon: graduatePanel.icon
    }

  })

  return {
    studentInfo
  }
}