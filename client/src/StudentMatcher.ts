import { computed, type ComputedRef } from 'vue'
import { useDocumentCache } from '@store/useDocumentCache'
import { Student, Graduate } from './SheetTypes'

type StudentMatchError = 'NOT_FOUND' | 'NOT_LINKED' | 'STUDENT_SYSID_UNDEFINED'

type StudentMatch = ComputedRef<{
  // if there is an error, it will be the only property
  error?: StudentMatchError,

  // if there is no error, there will be these properties
  sysId?: string,
  id?: string,
  name?: string,
  fullData?: Student | Graduate,
  foundIn?: 'STUDENTS' | 'GRADUATES'
}>

export function useStudentMatcher(studentSysId: string) {
  const { getItemBySysId } = useDocumentCache()

  const student = computed(() => {
    return getItemBySysId(studentSysId, 'STUDENTS') as Student
  })

  const graduate = computed(() => {
    return getItemBySysId(studentSysId, 'GRADUATES') as Graduate
  })

  const studentMatch: StudentMatch = computed(() => {
    if (studentSysId === undefined) {
      return {
        error: 'STUDENT_SYSID_UNDEFINED'
      }
    }

    if (student.value) {
      return {
        sysId: student.value.sysId,
        id: student.value.id,
        name: student.value.name,
        fullData: student.value,
        foundIn: 'STUDENTS',
      }
    } else if (graduate.value) {
      return {
        sysId: graduate.value.sysId,
        id: graduate.value.id,
        name: graduate.value.name,
        fullData: graduate.value,
        foundIn: 'GRADUATES',
      }
    }
    else if (studentSysId) {
      return {
        error: 'NOT_FOUND'
      }
    } else {
      return {
        error: 'NOT_LINKED'
      }
    }
  })

  return {
    studentMatch
  }
}