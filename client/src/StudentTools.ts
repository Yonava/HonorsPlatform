import { Student, Graduate } from './SheetTypes'
import { unmapGraduates } from './DataMappers'
import { getEvery, replaceRange, getHeaderRowCache, postInRange } from './SheetsAPI'
import { panels } from './Panels'
import { useDocumentCache } from './store/useDocumentCache'

export const statusOptions = {
  'Active': 'account-check',
  'Inactive': 'account-remove',
  'Pending': 'account-question',
}

export const yearOptions = [
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Associate Freshman',
  'Associate Sophomore',
  'Associate Junior',
  'Associate Senior',
]

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
    id: graduate.id.startsWith("G") ? "" : graduate.id,
    name: graduate.name,
    email: graduate.email,
    points: 0,
    activeStatus: "Active",
    year: "",
    athletics: "",
    note: graduate.note,
    misc: {},
  }
}

export async function moveToGraduates(student: Student) {
  const { moveItemBetweenLists } = useDocumentCache()
  await moveItemBetweenLists(
    student,
    studentToGraduate(student),
    panels['STUDENTS'],
    panels['GRADUATES']
  )
}

export async function moveToStudents(graduate: Graduate) {
  const { moveItemBetweenLists } = useDocumentCache()
  await moveItemBetweenLists(
    graduate,
    graduateToStudent(graduate),
    panels['GRADUATES'],
    panels['STUDENTS']
  )
}

export async function incrementStudentYear() {
  const { map, unmap } = panels['STUDENTS'].mappers
  const { addItemsToCache, removeItemsFromCache } = useDocumentCache()
  const students = await map(await getEvery('Students'))
  const graduatingSeniors: Student[] = []
  const failedToIncrement: Student[] = []

  const newStudentYear = (year: string) => {
    if (year.includes('Senior')) {
      return 'Graduate'
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
    // @ts-ignore
    // TODO: fix type system for StudentYear in SheetTypes
    student.year = newStudentYear(student.year)

    if (student.year.includes('Graduate')) {
      graduatingSeniors.push(student)
    }
  })

  removeItemsFromCache(graduatingSeniors, panels['STUDENTS'])
  addItemsToCache(graduatingSeniors.map(studentToGraduate), panels['GRADUATES'])

  if (graduatingSeniors.length > 0) {
    graduatingSeniors.forEach(student => {
      const indexOfGrad = students.findIndex(s => s.sysId === student.sysId)
      students.splice(indexOfGrad, 1)
    })
    await postInRange('Graduates', unmapGraduates(graduatingSeniors.map(studentToGraduate)))
  }

  const data = await unmap(students)
  const headerRow = await getHeaderRowCache('Students')
  await replaceRange('Students', [headerRow, ...data])

  console.log('Batch job "incrementStudentYear" complete!')

  return {
    graduatingSeniors,
    failedToIncrement
  }
}