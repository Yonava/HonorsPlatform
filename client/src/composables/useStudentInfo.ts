import { computed } from 'vue'
import { getPanel } from '@panels'
import { matchStudent, type StudentMatchError } from '@composables/useStudentMatcher'

export function useStudentInfo(studentSysId: string) {

  const studentMatch = matchStudent(studentSysId)

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

    if ('error' in studentMatch) {
      return studentMatchError(studentMatch.error)
    }

    if (studentMatch.foundIn === 'STUDENTS') {
      return {
        text: studentMatch.name || 'No Name',
        error: false,
        tooltip: idText(studentMatch.id),
        icon: studentPanel.icon
      }
    }

    return {
      text: studentMatch.name || 'No Name',
      error: false,
      tooltip: 'This Student Has Graduated - ' + idText(studentMatch.id),
      icon: graduatePanel.icon
    }

  })

  return {
    studentInfo
  }
}