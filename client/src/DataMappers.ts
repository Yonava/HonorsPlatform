import { getHeaderRow, headerRowMemo } from "./SheetsAPI";

function removeEmptyRows(item: Object) {
  return Object
    .values(item)
    .some(value => typeof value === 'string' && value.length > 0);
}

export async function mapStudents(sheetData: any[][]): Promise<any[]> {
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
  const headerRow = headerRowMemo[studentRange] ?? await getHeaderRow(studentRange);
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

export function mapModules(sheetData: any[][]): any[] {
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

export function unmapModules(modules: Object[]): any[][] {
  return modules.map((module: any) => [
    module.studentId,
    module.courseCode,
    module.description,
    module.term,
  ]);
}

export function mapGraduates(sheetData: any[][]): any[] {
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

export function unmapGraduates(graduates: Object[]): any[][] {
  return graduates.map((graduate: any) => [
    graduate.name,
    graduate.phone,
  ]);
}