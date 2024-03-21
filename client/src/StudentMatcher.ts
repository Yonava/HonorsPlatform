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

export const matchStudent = (sysId: string): StudentMatch => {
  const { getItemBySysId } = useDocumentCache()
  const student = getItemBySysId(sysId, 'STUDENTS')

  if (student) {
    return {
      sysId: student.sysId,
      id: student.id,
      name: student.name,
      fullData: student,
      foundIn: 'STUDENTS',
    } as const
  }

  const graduate = getItemBySysId(sysId, 'GRADUATES')

  if (graduate) {
    return {
      sysId: graduate.sysId,
      id: graduate.id,
      name: graduate.name,
      fullData: graduate,
      foundIn: 'GRADUATES',
    } as const
  }

  if (sysId) {
    return {
      error: 'NOT_FOUND'
    } as const
  }

  return {
    error: 'NOT_LINKED'
  } as const
}

export const useStudentMatcher = (sysId: string) => computed(() => matchStudent(sysId))
