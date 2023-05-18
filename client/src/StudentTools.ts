import { Student } from './SheetTypes'
import { getEvery, Range, replaceRange, getHeaderRowCache } from './SheetsAPI'
import { switchPanel, PanelType, Panel } from './SwitchPanel'

export async function incrementStudentYear() {
  const { map, unmap } = switchPanel(PanelType.STUDENTS).mappers as Panel<Student>['mappers']
  const students = await map(await getEvery(Range.STUDENTS))

  students.forEach(student => {
    if (!student.year) return
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
        console.log('graduated ' + student.name)
        break
    }
  })

  const data = await unmap(students)
  const headerRow = await getHeaderRowCache(Range.STUDENTS)
  await replaceRange(Range.STUDENTS, [headerRow, ...data])
}