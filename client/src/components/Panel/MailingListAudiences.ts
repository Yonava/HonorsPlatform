import { useDocumentCache } from '../../store/useDocumentCache'
import { panels } from '../../Panels'

export const getMailingListAudiences = () => {
  const { Students, Graduates, Modules } = useDocumentCache()

  const allStudents = {
    name: 'All Students',
    color: panels['STUDENTS'].color,
    recipientSysIds: Students.list.map(student => student.sysId)
  } as const;

  const allGraduates = {
    name: 'All Graduates',
    color: panels['GRADUATES'].color,
    recipientSysIds: Graduates.list.map(graduate => graduate.sysId)
  } as const;

  return [
    allStudents,
    allGraduates,
  ] as const;
}

export type Audience = ReturnType<typeof getMailingListAudiences>[number]