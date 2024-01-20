import { useDocumentCache } from '@store/useDocumentCache'
import { panels } from '@panels'

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

  const studentsWorkingOnModules = {
    name: 'Students Working on Modules',
    color: panels['MODULES'].color,
    recipientSysIds: Modules.list.map(module => module.studentSysId)
  }

  const studentsWithOver1000Points = {
    name: 'Students with over 1000 points',
    color: 'red',
    recipientSysIds: Students.list.filter(student => student.points > 1000).map(student => student.sysId)
  }

  const studentsEngagedInAthletics = {
    name: 'Students Engaged in Athletics',
    color: 'green',
    recipientSysIds: Students.list.filter(student => student.athletics).map(student => student.sysId)
  }

  return [
    allStudents,
    allGraduates,
    studentsWorkingOnModules,
    studentsWithOver1000Points,
    studentsEngagedInAthletics
  ] as const;
}

export const listColors = [
  'red',
  'green',
  'blue',
  'yellow',
  'purple',
  'orange',
  'pink',
  'teal',
  'cyan',
  'grey'
] as const;

export type ListColor = typeof listColors[number]

export type MailingList = {
  name: string
  id: string
  recipientSysIds: string[]
  color: ListColor
}

export type Audience = ReturnType<typeof getMailingListAudiences>[number]