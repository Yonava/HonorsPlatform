import { Student } from './SheetTypes'
import { unmapGraduates } from './DataMappers'
import { getEvery, Range, replaceRange, getHeaderRowCache, moveRowToRange } from './SheetsAPI'
import { switchPanel, PanelType, Panel } from './SwitchPanel'

export async function moveToGraduates(student: Student) {
  await moveRowToRange(
    Range.STUDENTS,
    Range.GRADUATES,
    student.row,
    unmapGraduates([{
      row: student.row,
      id: student.id,
      name: student.name,
      phone: '',
      email: student.email,
      graduationDate: new Date().toLocaleDateString(),
      note: student.note,
    }])
  )
}

export async function incrementStudentYear() {
  const { map, unmap } = switchPanel(PanelType.STUDENTS).mappers as Panel<Student>['mappers']
  const students = await map(await getEvery(Range.STUDENTS))

  for await (const student of students) {
    if (!student.year) {
      continue
    }
    const year = student.year.toLowerCase();
    switch (year) {
      case 'freshman':
        student.year = 'Sophomore'
        break
      case 'sophomore':
        student.year = 'Junior'
        break
      case 'junior':
        student.year = 'Senior'
        break
      case 'senior':
        await moveToGraduates(student)
        console.log(student.name + ' graduated!')
        break
    }
  }

  const data = await unmap(students)
  const headerRow = await getHeaderRowCache(Range.STUDENTS)
  await replaceRange(Range.STUDENTS, [headerRow, ...data])
}