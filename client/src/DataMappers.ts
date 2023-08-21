import { getHeaderRowCache } from "./SheetsAPI";
import {
  Student,
  Graduate,
  Module,
  CompletedModule,
  GradEngagement,
  Grade,
  Thesis,
  ThesisDecision,
  SheetEntry,
} from "./SheetTypes";

import {
  type YearOption,
  type StatusOption,
  athleticOptions,
} from "./StudentTools";

function removeEmptyObjects(item: Object) {
  return Object
    .values(item)
    .some(value => typeof value === 'string' && value.length > 0);
}

// the index where all SheetItems stored on Google Sheets must have their unique sysId
const SYS_ID_INDEX = 0;

const sheetItemHeaders: (keyof SheetEntry)[] = [
  'sysId',
  'note',
];

const studentHeaders: (keyof Student)[] = [
  'id',
  'name',
  'email',
  'points',
  'activeStatus',
  'year',
  'athletics'
];

export const getNonCustomHeaderCount = () => {
  return sheetItemHeaders.length + studentHeaders.length;
}

export function mapStudents(matrix: string[][]): Student[] {
  return matrix
    .filter((row) => !!row[SYS_ID_INDEX])
    .map((row, index) => ({

      // the row number on the spreadsheet: + 1 for header row, + 1 for 0-indexing
      row: index + 2,

      // sysId is the first column of all SheetItems
      sysId: row[SYS_ID_INDEX],

      // student fields
      ...studentHeaders.reduce((acc, curr, index) => {
        return {
          ...acc,
          [curr]: row[index + 1] ?? '',
        };
      }, {} as Record<keyof Omit<Student, keyof SheetEntry>, any>),

      // note is the last column of all SheetItems
      note: row[studentHeaders.length + 1],

      // custom fields
      ...row.reduce((acc, curr, index) => {
        const numberOfFields = studentHeaders.length + sheetItemHeaders.length;
        if (index < numberOfFields) {
          return acc;
        }
        return {
          ...acc,
          [index]: row[index] ?? '',
        };
      }, {}),

    }))
}

export function unmapStudents(students: Student[]): string[][] {
  const matrix: string[][] = []
  for (const student of students) {
    console.log(student);
    const row = [
      student.sysId,
      ...studentHeaders.map((key) => {
        const res = student[key]?.toString() ?? ''
        console.log(res, key);
        return res;
      }),
      student.note,
    ];
    matrix.push(row);
  }

  console.log(matrix);
  return matrix;
}

export function mapModules(sheetData: string[][]): Module[] {
  return sheetData
    .map((module, index) => {
      return {
        row: index + 2,
        sysId: module[0] ?? '',
        studentSysId: module[1] ?? '',
        courseCode: module[2] ?? '',
        note: module[3] ?? '',
        term: module[4] ?? '',
        instructor: module[5] ?? '',
        docuSignCreated: module[6] ?? '',
        docuSignCompleted: module[7] ?? '',
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
        sysId: module[0] ?? '',
        studentSysId: module[1] ?? '',
        courseCode: module[2] ?? '',
        note: module[3] ?? '',
        term: module[4] ?? '',
        instructor: module[5] ?? '',
        docuSignCreated: module[6] ?? '',
        docuSignCompleted: module[7] ?? '',
        completedDate: module[8] ?? '',
        grade: (module[9] ?? null) as Grade,
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
        sysId: graduate[0] ?? '',
        id: graduate[1] ?? '',
        name: graduate[2] ?? '',
        phone: graduate[3] ?? '',
        email: graduate[4] ?? '',
        graduationDate: graduate[5] ?? '',
        note: graduate[6] ?? '',
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

export function mapGradEngagements(sheetData: string[][]): GradEngagement[] {
  return sheetData
    .map((engagement, index) => {
      return {
        row: index + 2,
        sysId: engagement[0] ?? '',
        studentSysId: engagement[1] ?? '',
        event: engagement[2] ?? '',
        dateTime: engagement[3] ?? '',
        note: engagement[4] ?? '',
      };
    })
    .filter(removeEmptyObjects);
}

export function unmapGradEngagements(engagements: GradEngagement[]): string[][] {
  return engagements.map((engagement) => {
    return [
      engagement.sysId,
      engagement.studentSysId,
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
        sysId: thesis[0] ?? '',
        studentSysId: thesis[1] ?? '',
        title: thesis[2] ?? '',
        proposalReceived: thesis[3] ?? '',
        breakoutRoom: thesis[4] ?? '',
        decision: (thesis[5] ?? '') as ThesisDecision,
        term: thesis[6] ?? '',
        mentor: thesis[7] ?? '',
        mentorEmail: thesis[8] ?? '',
        draftReceived: thesis[9] ?? '',
        note: thesis[10] ?? '',
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