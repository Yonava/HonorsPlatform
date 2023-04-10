import { getHeaderRow, headerRowMemo, Range } from "./SheetsAPI";
import {
  Student,
  Graduate,
  Module,
  CompletedModule,
  GradEngagement,
  Grade,
  Thesis,
  ThesisDecision,
} from "./SheetTypes";

function removeEmptyObjects(item: Object) {
  return Object
    .values(item)
    .some(value => typeof value === 'string' && value.length > 0);
}

export async function mapStudents(sheetData: string[][]): Promise<Student[]> {
  const headerRow = headerRowMemo[Range.STUDENTS] ?? await getHeaderRow(Range.STUDENTS);
  const categories = headerRow.slice(8);
  return sheetData
    .map((student, index) => ({
      row: index + 2, // + 1 for header row, + 1 for 0-indexing
      id: student[0] ?? '',
      name: student[1] ?? '',
      email: student[2] ?? '',
      points: parseInt(student[3]) ?? 0,
      activeStatus: student[4] ?? '',
      year: student[5] ?? '',
      athletics: student[6] ?? '',
      note: student[7] ?? '',
      misc: categories.reduce((acc: { [key in string]: string }, category: string, index: number) => {
        if (category === '') return acc
        acc[category] = student[index + 8] ?? ''
        return acc
      }, {})
    }))
    .filter(removeEmptyObjects);
}

export async function unmapStudents(students: Student[]): Promise<string[][]> {
  const headerRow = headerRowMemo[Range.STUDENTS] ?? await getHeaderRow(Range.STUDENTS);
  const categories = headerRow.slice(8);
  return students.map((student: Student) => {
    const misc = categories.map((category: string) => student.misc[category] ?? '');
    return [
      student.id,
      student.name,
      student.email,
      student.points ? student.points.toString() : '0',
      student.activeStatus,
      student.year,
      student.athletics,
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

export function unmapModules(modules: Module[]): string[][] {
  return modules.map(module => {
    const { row, ...rest } = module;
    return [
      ...Object.values(rest),
    ];
  });
}

export function mapCompletedModules(sheetData: string[][]): CompletedModule[] {
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
        completedDate: module[7] ?? '',
        grade: (module[8] ?? null) as Grade,
      };
    })
    .filter(removeEmptyObjects);
}

export function unmapCompletedModules(modules: CompletedModule[]): string[][] {
  return modules.map((module) => {
    type StringValues<T> = { [P in keyof T]: string };
    const { row, ...rest } = module;
    return [
      ...Object.values(rest as StringValues<CompletedModule>),
    ];
  });
}


export function mapGraduates(sheetData: string[][]): Graduate[] {
  return sheetData
    .map((graduate, index) => {
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

export function unmapGraduates(graduates: Graduate[]): string[][] {
  return graduates.map((graduate) => {
    const { row, ...rest } = graduate;
    return [
      ...Object.values(rest),
    ];
  });
}

export function mapGradEngagement(sheetData: string[][]): GradEngagement[] {
  return sheetData
    .map((engagement, index) => {
      return {
        row: index + 2,
        gradId: engagement[0] ?? '',
        event: engagement[1] ?? '',
        dateTime: engagement[2] ?? '',
        note: engagement[3] ?? '',
      };
    })
    .filter(removeEmptyObjects);
}

export function unmapGradEngagement(engagements: GradEngagement[]): string[][] {
  return engagements.map((engagement) => {
    return [
      engagement.gradId,
      engagement.event,
      engagement.dateTime,
      engagement.note,
    ];
  });
}

export function mapTheses(sheetData: string[][]): Thesis[] {
  return sheetData
    .map((thesis, index) => {
      return {
        row: index + 2,
        studentId: thesis[0] ?? '',
        name: thesis[1] ?? '',
        email: thesis[2] ?? '',
        title: thesis[3] ?? '',
        proposalReceived: thesis[4] ?? '',
        breakoutRoom: thesis[5] ?? '',
        decision: (thesis[6] ?? ThesisDecision.PENDING) as ThesisDecision,
        term: thesis[7] ?? '',
        mentor: thesis[8] ?? '',
        mentorEmail: thesis[9] ?? '',
        draftReceived: thesis[10] ?? '',
        note: thesis[11] ?? '',
      };
    })
    .filter(removeEmptyObjects);
}

export function unmapTheses(theses: Thesis[]): string[][] {
  return theses.map((thesis) => {
    const { row, ...rest } = thesis;
    return [
      ...Object.values(rest),
    ];
  });
}