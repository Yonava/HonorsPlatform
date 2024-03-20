import { computed, type ComputedRef } from 'vue'
import type { Student, Graduate } from '@apptypes/sheetItems'
import { useDocumentCache } from '@store/useDocumentCache'

export type StudentMatchError = 'NOT_FOUND' | 'NOT_LINKED' | 'STUDENT_SYSID_UNDEFINED'

export type StudentMatch = {
  sysId: string,
  id: string,
  name: string,
  fullData: Student | Graduate,
  foundIn: 'STUDENTS' | 'GRADUATES'
} | {
  error: StudentMatchError
}

export function useStudentMatcher(sysId: string) {
  const { getItemBySysId } = useDocumentCache()

  const student = computed(() => {
    return getItemBySysId(sysId, 'STUDENTS');
  })

  const graduate = computed(() => {
    return getItemBySysId(sysId, 'GRADUATES');
  })

  const studentMatch: ComputedRef<StudentMatch> = computed(() => {
    if (sysId === undefined) {
      return {
        error: 'STUDENT_SYSID_UNDEFINED'
      } as const
    }

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
    } else if (studentSysId) {
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