import { getHeaderRow, headerRows } from "./SheetsAPI";

function removeEmptyRows(item: Object) {
  return Object
    .values(item)
    .some(value => typeof value === 'string' && value.length > 0);
}

export async function mapStudents(sheetData: any[][]): Promise<Object[]> {
  // get header row categories
  const studentRange = 'Students';
  const headerRow = await getHeaderRow(studentRange);
  const categories = headerRow.slice(6);
  return sheetData
    .map((student, index) => ({
      row: index + 2, // + 1 for header row, + 1 for 0-indexing
      name: student[0] ?? '',
      id: student[1] ?? '',
      email: student[2] ?? '',
      points: student[3] ?? 0,
      activeStatus: student[4] ?? '',
      note: student[5] ?? '',
      misc: categories.reduce((acc: any, category: any, index: number) => {
        if (category === '') return acc
        acc[category] = student[index + 6] ?? ''
        return acc
      }, {})
    }))
    .filter(removeEmptyRows);
}

export async function unmapStudents(students: Object[]): Promise<any[][]> {
  const studentRange = 'Students';
  const headerRow = headerRows[studentRange] ?? await getHeaderRow(studentRange);
  const categories = headerRow.slice(6);
  return students.map((student: any) => {
    const misc = categories.map((category: string) => student.misc[category] ?? '');
    return [
      student.name,
      student.id,
      student.email,
      student.points,
      student.activeStatus,
      student.note,
      ...misc,
    ];
  });
}

export function mapModules(sheetData: any[][]): Object[] {
  return sheetData
    .map((module, index) => {
      return {
        row: index + 2,
        studentId: module[0] ?? '',
        courseCode: module[1] ?? '',
        description: module[2] ?? '',
        term: module[3] ?? '',
      };
    })
    .filter(removeEmptyRows);
}

export function mapGraduates(sheetData: any[][]): Object[] {
  return sheetData
    .map((graduate: any, index: number) => {
      return {
        row: index + 2,
        name: graduate[0],
        phone: graduate[1],
      };
    })
    .filter(removeEmptyRows);
}