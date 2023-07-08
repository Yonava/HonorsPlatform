import { computed } from 'vue'
import { useDocumentCache } from './store/useDocumentCache'
import { Student, Graduate } from './SheetTypes'

export function useStudentMatcher(studentSysId: string) {
  const { getItemBySysId } = useDocumentCache()

  const student = computed(() => {
    return getItemBySysId(studentSysId, 'STUDENTS') as Student
  })

  const graduate = computed(() => {
    return getItemBySysId(studentSysId, 'GRADUATES') as Graduate
  })

  const studentMatch = computed(() => {
    if (student.value) {
      return {
        sysId: student.value.sysId,
        id: student.value.id,
        name: student.value.name,
        fullData: student.value,
        foundIn: 'STUDENTS',
      } as const
    } else if (graduate.value) {
      return {
        sysId: graduate.value.sysId,
        id: graduate.value.id,
        name: graduate.value.name,
        fullData: graduate.value,
        foundIn: 'GRADUATES',
      } as const
    }
    else if (studentSysId) {
      return {
        error: 'NOT_FOUND'
      } as const
    } else {
      return {
        error: 'NOT_LINKED'
      } as const
    }
  })

  return {
    studentMatch
  }
}