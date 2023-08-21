import {
  Student,
  Graduate,
  Module,
  CompletedModule,
  GradEngagement,
  Thesis,
  SheetEntry,
  SheetItem,
} from "./SheetTypes";

import { type PanelName } from "./Panels";

// the index where all SheetItems stored on Google Sheets must have their unique sysId
const SYS_ID_INDEX = 0;

const sharedSheetItemProps: (keyof SheetEntry)[] = [
  'sysId',
  'note',
];

export const sheetProps = {
  STUDENTS: [
    'id',
    'name',
    'email',
    'points',
    'activeStatus',
    'year',
    'athletics'
  ],
  MODULES: [
    'studentSysId',
    'courseCode',
    'term',
    'instructor',
    'docuSignCreated',
    'docuSignCompleted',
  ],
  COMPLETED_MODULES: [
    'studentSysId',
    'courseCode',
    'term',
    'instructor',
    'docuSignCreated',
    'docuSignCompleted',
    'completedDate',
    'grade',
  ],
  GRADUATES: [
    'id',
    'name',
    'phone',
    'email',
    'graduationDate',
  ],
  GRADUATE_ENGAGEMENTS: [
    'studentSysId',
    'event',
    'dateTime',
  ],
  THESES: [
    'studentSysId',
    'title',
    'proposalReceived',
    'breakoutRoom',
    'decision',
    'term',
    'mentor',
    'mentorEmail',
    'draftReceived',
  ],
  SHARED: sharedSheetItemProps,
} as const;

export const getNonCustomProps = (panelName: PanelName) => {
  return [
    ...sheetProps[panelName],
    ...sheetProps.SHARED,
  ]
}

const map = <T extends SheetItem>(spreadsheetMatrix: string[][], headerRow: readonly (keyof T)[]) => {
  return spreadsheetMatrix
    .filter((row) => {
      if (row.length === 0) {
        return false;
      }
      return !!row[SYS_ID_INDEX];
    })
    .map((row, index) => ({

      // the row number on the spreadsheet: + 1 for header row, + 1 for 0-indexing
      row: index + 2,

      // sysId is the first column of all SheetItems
      sysId: row[SYS_ID_INDEX],

      // fields specific to SheetItem T
      ...headerRow.reduce((acc, curr, index) => {
        return {
          ...acc,
          [curr]: row[index + 1] ?? '',
        };
      }, {} as Record<keyof Omit<T, keyof SheetEntry>, any>),

      // note is the last column of all SheetItems
      note: row[headerRow.length + 1],

      // custom fields
      ...row.reduce((acc, curr, index) => {
        const numberOfFields = headerRow.length + sheetProps.SHARED.length;
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

const unmap = <T extends SheetItem>(sheetItems: T[], headerRow: readonly (keyof T)[]) => {
  const matrix: string[][] = []

  for (const item of sheetItems) {

    const nonCustomFields = headerRow
      .map((key) => item[key]?.toString() ?? '');

    const row = [
      item.sysId,
      ...nonCustomFields,
      item.note,
    ];

    const keys = Object.keys(item) as (keyof T)[];

    const customFields = keys
      .filter((key) => !isNaN(parseInt(key.toString())))
      .map((key) => ({
        key: parseInt(key.toString()),
        value: item[key]?.toString() ?? ''
      }));

    for (const { key, value } of customFields) {
      row[key] = value;
    }

    matrix.push(row);
  }

  return matrix;
}

// Will be refactored down further 🦄✨

export const mapStudents = (matrix: string[][]): Student[] => {
  return map<Student>(matrix, sheetProps.STUDENTS);
}

export const unmapStudents = (students: Student[]) => {
  return unmap(students, sheetProps.STUDENTS);
}

export const mapModules = (matrix: string[][]): Module[] => {
  return map<Module>(matrix, sheetProps.MODULES);
}

export const unmapModules = (modules: Module[]) => {
  return unmap(modules, sheetProps.MODULES);
}

export const mapCompletedModules = (matrix: string[][]): CompletedModule[] => {
  return map<CompletedModule>(matrix, sheetProps.COMPLETED_MODULES);
}

export const unmapCompletedModules = (modules: CompletedModule[]) => {
  return unmap(modules, sheetProps.COMPLETED_MODULES);
}

export const mapGraduates = (matrix: string[][]): Graduate[] => {
  return map<Graduate>(matrix, sheetProps.GRADUATES);
}

export const unmapGraduates = (graduates: Graduate[]) => {
  return unmap(graduates, sheetProps.GRADUATES);
}

export const mapGradEngagements = (matrix: string[][]): GradEngagement[] => {
  return map<GradEngagement>(matrix, sheetProps.GRADUATE_ENGAGEMENTS);
}

export const unmapGradEngagements = (engagements: GradEngagement[]) => {
  return unmap(engagements, sheetProps.GRADUATE_ENGAGEMENTS);
}

export const mapTheses = (matrix: string[][]): Thesis[] => {
  return map<Thesis>(matrix, sheetProps.THESES);
}

export const unmapTheses = (theses: Thesis[]) => {
  return unmap(theses, sheetProps.THESES);
}
