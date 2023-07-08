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
} from "./SheetTypes";
import { YearOption, StatusOption } from "./StudentTools";

function removeEmptyObjects(item: Object) {
  return Object
    .values(item)
    .some(value => typeof value === 'string' && value.length > 0);
}

export async function mapStudents(sheetData: string[][]): Promise<Student[]> {
  const headerRow = await getHeaderRowCache('Students');
  const categories = headerRow.slice(9);
  return sheetData
    .map((student, index) => ({
      row: index + 2, // + 1 for header row, + 1 for 0-indexing
      sysId: student[0] ?? '',
      id: student[1] ?? '',
      name: student[2] ?? '',
      email: student[3] ?? '',
      points: parseInt(student[4]) || 0,
      activeStatus: (student[5] ?? '') as StatusOption,
      year: (student[6] ?? '') as YearOption,
      athletics: student[7] ?? '',
      note: student[8] ?? '',
      misc: categories.reduce((acc: { [key in string]: string }, category: string, index: number) => {
        if (category === '') {
          return acc;
        }
        acc[category] = student[index + 9] ?? ''
        return acc;
      }, {})
    }))
    .filter(removeEmptyObjects);
}

export async function unmapStudents(students: Student[]): Promise<string[][]> {
  const headerRow = await getHeaderRowCache('Students');
  const categories = headerRow.slice(9);
  return students.map((student: Student) => {
    const misc = categories.map((category: string) => student.misc[category] ?? '');
    return [
      student.sysId,
      student.id,
      student.name,
      student.email,
      student.points ? student.points.toString() : '0',
      student.activeStatus,
      student.year,
      student.athletics,
      student.note,
      ...misc,
    ]
  });
}

export function mapModules(sheetData: string[][]): Module[] {
  return sheetData
    .map((module, index) => {
      return {
        row: index + 2,
        sysId: module[0] ?? '',
        studentSysId: module[1] ?? '',
        courseCode: module[2] ?? '',
        description: module[3] ?? '',
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
        description: module[3] ?? '',
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