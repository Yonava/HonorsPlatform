import { Student, Graduate } from './SheetTypes'
import { unmapGraduates } from './DataMappers'
import { getEvery, Range, replaceRange, getHeaderRowCache, moveRowToRange, postInRange } from './SheetsAPI'
import { panels } from './Panels'

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

  const years = ['Freshman', 'Sophomore', 'Junior', 'Senior']

  const newStudentYear = (year: string) => {
    let prefix = ''
    let yearText = ''
    const yearArr = year.split(' ')
    if (yearArr.length > 1) {
      prefix = yearArr[0] + ' '
      yearText = yearArr[1]
    } else {
      yearText = yearArr[0]
    }
    const index = years.indexOf(yearText)
    return prefix + (years[index + 1] || 'Graduate')
  }

  const hasValidYear = (student: Student) => {
    if (!student.year) {
      return false
    }
    return years.some(year => student.year.includes(year))
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