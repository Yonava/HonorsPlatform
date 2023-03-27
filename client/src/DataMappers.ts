import { getHeaderRow, headerRowMemo, Range } from "./SheetsAPI";
import {
  Student,
  Graduate,
  Module,
  CompletedModule,
  SheetEntry,
} from "./SheetTypes";

function removeEmptyObjects(item: Object) {
  return Object
    .values(item)
    .some(value => typeof value === 'string' && value.length > 0);
}

export async function mapStudents(sheetData: string[][]): Promise<Student[]> {
  const headerRow = headerRowMemo[Range.STUDENTS] ?? await getHeaderRow(Range.STUDENTS);
  const categories = headerRow.slice(7);
  return sheetData
    .map((student, index) => ({
      row: index + 2, // + 1 for header row, + 1 for 0-indexing
      id: student[0] ?? '',
      name: student[1] ?? '',
      email: student[2] ?? '',
      points: parseInt(student[3]) ?? 0,
      activeStatus: student[4] ?? '',
      year: student[5] ?? '',
      note: student[6] ?? '',
      misc: categories.reduce((acc: { [key in string]: string }, category: string, index: number) => {
        if (category === '') return acc
        acc[category] = student[index + 7] ?? ''
        return acc
      }, {})
    }))
    .filter(removeEmptyObjects);
}

export async function unmapStudents(students: Omit<Student, 'row'>[]): Promise<string[][]> {
  const headerRow = headerRowMemo[Range.STUDENTS] ?? await getHeaderRow(Range.STUDENTS);
  const categories = headerRow.slice(7);
  return students.map((student) => {
    const misc = categories.map((category: string) => student.misc[category] ?? '');
    return [
      student.id,
      student.name,
      student.email,
      student.points.toString(),
      student.activeStatus,
      student.year,
      student.note,
      ...misc,
    ];
  });
}

export function mapModules(sheetData: string[][]): Module[] {
  return sheetData
    .map((module, index) => {
      return {
        row: index + 2,
        studentId: module[0] ?? '',
        courseCode: module[1] ?? '',
        description: module[2] ?? '',
        term: module[3] ?? '',
        instructor: module[4] ?? '',
        docuSignCreated: module[5] ?? '',
        docuSignCompleted: module[6] ?? '',
      };
    })
    .filter(removeEmptyObjects);
}

export function unmapModules(modules: Omit<Module, 'row'>[]): string[][] {
  return modules.map((module) => {
    return [
      ...Object.values(module),
    ];
  });
}

export function mapCompletedModules(sheetData: string[][]): CompletedModule[] {
  return sheetData
    .map((module: string[], index: number) => {
      return {
        row: index + 2,
        studentId: module[0] ?? '',
        courseCode: module[1] ?? '',
        description: module[2] ?? '',
        term: module[3] ?? '',
        instructor: module[4] ?? '',
        docuSignCreated: module[5] ?? '',
        docuSignCompleted: module[6] ?? '',
        completedDate: module[7] ?? '',
        grade: module[8] ?? '',
      };
    })
    .filter(removeEmptyObjects);
}

export function unmapCompletedModules(modules: Omit<CompletedModule, 'row'>[]): string[][] {
  return modules.map((module) => {
    return [
      ...Object.values(module),
    ];
  });
}

export function mapGraduates(sheetData: string[][]): Graduate[] {
  return sheetData
    .map((graduate: string[], index: number) => {
      return {
        row: index + 2,
        id: graduate[0] ?? '',
        name: graduate[1] ?? '',
        phone: graduate[2] ?? '',
        email: graduate[3] ?? '',
        graduationDate: graduate[4] ?? '',
        note: graduate[5] ?? '',
      };
    })
    .filter(removeEmptyObjects);
}

export function unmapGraduates(graduates: Omit<Graduate, 'row'>[]): string[][] {
  return graduates.map((graduate) => {
    return [
      ...Object.values(graduate),
    ];
  });
}