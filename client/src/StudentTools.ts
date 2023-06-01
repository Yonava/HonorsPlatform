import { Student, Graduate } from './SheetTypes'
import { unmapGraduates } from './DataMappers'
import { getEvery, Range, replaceRange, getHeaderRowCache, moveRowToRange, postInRange } from './SheetsAPI'
import { panels } from './Panels'

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

export async function moveToGraduates(student: Student) {
  await moveRowToRange(
    Range.STUDENTS,
    Range.GRADUATES,
    student.row,
    unmapGraduates([studentToGraduate(student)])
  )
}

export async function incrementStudentYear() {
  const { map, unmap } = panels['STUDENTS'].mappers
  const students = await map(await getEvery(Range.STUDENTS))
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

  if (graduatingSeniors.length > 0) {
    graduatingSeniors.forEach(student => {
      const indexOfGrad = students.findIndex(s => s.sysId === student.sysId)
      students.splice(indexOfGrad, 1)
    })
    await postInRange(Range.GRADUATES, unmapGraduates(graduatingSeniors.map(studentToGraduate)))
  }

  const data = await unmap(students)
  const headerRow = await getHeaderRowCache(Range.STUDENTS)
  await replaceRange(Range.STUDENTS, [headerRow, ...data])

  console.log('Batch job "incrementStudentYear" complete!')

  return {
    graduatingSeniors,
    failedToIncrement
  }
}