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

  students.forEach((student, index) => {
    if (!student.year) {
      failedToIncrement.push(student)
      return
    }
    const year = student.year.toLowerCase();
    if (year === 'senior') {
      graduatingSeniors.push(student)
      students.splice(index, 1)
    } else if (year === 'junior') {
      student.year = 'Senior'
    } else if (year === 'sophomore') {
      student.year = 'Junior'
    } else if (year === 'freshman') {
      student.year = 'Sophomore'
    } else {
      failedToIncrement.push(student)
    }
  })

  if (graduatingSeniors.length > 0) {
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