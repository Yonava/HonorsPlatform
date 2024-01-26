import { Student, Graduate } from '../SheetTypes'
import { unmapGraduates } from '../DataMappers'
import { replaceRange, getHeaderRowCache, postInRange } from '../SheetsAPI'
import { panels } from '../Panels'
import { useDocumentCache } from '../store/useDocumentCache'

export const statusOptions = [
  {
    status: 'Active',
    tooltip: 'Actively Engaging In Program',
    icon: 'account-check',
    color: 'green',
  },
  {
    status: 'Inactive',
    tooltip: 'Currently Inactive In Program',
    icon: 'account-remove',
    color: 'red',
  },
  {
    status: 'Pending',
    tooltip: 'Student Is Not Yet Active In Program',
    icon: 'account-question',
    color: 'grey',
  },
  {
    status: 'Request Delete',
    tooltip: 'This Student Has Been Flagged For Removal',
    icon: 'account-off',
    color: 'purple',
  }
] as const

export type StatusOption = typeof statusOptions[number]['status'] | ''

export const yearOptions = [
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Associate Freshman',
  'Associate Sophomore',
  'Associate Junior',
  'Associate Senior',
] as const

export type YearOption = typeof yearOptions[number] | ''

// maps name to material icon
export const athleticOptions = {
  '': 'close',
  'Basketball (M)': 'basketball',
  'Basketball (F)': 'basketball',
  'Cheerleading (M/F)': 'bullhorn-variant',
  'Cross Country (M)': 'run',
  'Cross Country (F)': 'run',
  'Field Hockey (F)': 'hockey-sticks',
  'Golf (M)': 'golf',
  'Ice Hockey (M)': 'hockey-sticks',
  'Lacrosse (F)': 'racquetball',
  'Soccer (M)': 'soccer',
  'Soccer (F)': 'soccer',
  'Softball (F)': 'baseball-bat',
  'Tennis (M)': 'tennis',
  'Tennis (F)': 'tennis',
  'Track & Field (F)': 'shoe-sneaker',
  'Volleyball (F)': 'volleyball'
} as const

export const studentIdRule = (studentId: string, studentSysId: string) => {
  if (!studentId) {
    return true;
  }

  // make sure the student id is 7 digits
  if (!/^\d{7}$/.test(studentId)) {
    return 'Invalid Student ID';
  }

  const { Students, Graduates } = useDocumentCache()
  const allStudents = [...Students.list, ...Graduates.list]

  const duplicateIdInStudents = allStudents.find(
    (item) => item.id === studentId
  );

  const notThisStudent = duplicateIdInStudents && duplicateIdInStudents.sysId !== studentSysId

  if (duplicateIdInStudents && notThisStudent) {
    return 'ID already in use' + (duplicateIdInStudents.name ? ` by ${duplicateIdInStudents.name}` : '');
  }

  return true;
}

export function studentToGraduate(student: Student): Graduate {
  return {
    row: student.row,
    sysId: student.sysId,
    id: student.id,
    name: student.name,
    phone: '',
    email: student.email,
    graduationDate: new Date().toLocaleDateString(),
    note: student.note,
  }
}

export function graduateToStudent(graduate: Graduate): Student {
  return {
    row: graduate.row,
    sysId: graduate.sysId,
    id: graduate.id,
    name: graduate.name,
    email: graduate.email,
    points: 0,
    activeStatus: "Active",
    year: "Senior",
    athletics: "",
    note: graduate.note,
  }
}

export async function moveToGraduates(student: Student) {
  const { moveItemBetweenLists } = useDocumentCache()
  try {
    await moveItemBetweenLists({
      item: studentToGraduate(student),
      oldPanelName: 'STUDENTS',
      newPanelName: 'GRADUATES',
    })
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function moveToStudents(graduate: Graduate) {
  const { moveItemBetweenLists } = useDocumentCache()
  try {
    await moveItemBetweenLists({
      item: graduateToStudent(graduate),
      oldPanelName: 'GRADUATES',
      newPanelName: 'STUDENTS',
    })
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function incrementStudentYear(students: Student[] = useDocumentCache().Students.list) {
  const { unmap } = panels['STUDENTS'].mappers
  const { forceConnectedClientsToRefresh } = useDocumentCache()
  const graduatingSeniors: Student[] = []
  const failedToIncrement: Student[] = []

  try {
    await getHeaderRowCache('Students')
  } catch (e) {
    return Promise.reject(e)
  }

  const newStudentYear = (year: YearOption) => {
    if (year.includes('Senior')) {
      return 'Graduate'
    }

    if (!year) {
      console.error('newStudentYear warning! Triggered with no year.')
      return ''
    }

    const index = yearOptions.indexOf(year)
    return yearOptions[index + 1]
  }

  const hasValidYear = (student: Student) => {
    if (!student.year) {
      return false
    }
    return yearOptions.some(year => student.year === year)
  }

  students.forEach(student => {
    if (!hasValidYear(student)) {
      failedToIncrement.push(student)
      return
    }

    const incrementedStudentYear = newStudentYear(student.year)

    if (incrementedStudentYear === 'Graduate') {
      graduatingSeniors.push(student)
    } else {
      student.year = incrementedStudentYear
    }
  })

  if (graduatingSeniors.length > 0) {
    graduatingSeniors.forEach(student => {
      const indexOfGrad = students.findIndex(s => s.sysId === student.sysId)
      students.splice(indexOfGrad, 1)
    })
    await postInRange('Graduates', unmapGraduates(graduatingSeniors.map(studentToGraduate)))
  }

  // assign data to all students minus the graduating seniors
  const allStudents = useDocumentCache().Students.list.filter(student => !graduatingSeniors.some(grad => grad.sysId === student.sysId))

  const data = await unmap(allStudents)
  const studentHeaderRow = await getHeaderRowCache('Students')
  await replaceRange('Students', [studentHeaderRow, ...data])

  await forceConnectedClientsToRefresh()

  return {
    graduatingSeniors,
    failedToIncrement
  }
}