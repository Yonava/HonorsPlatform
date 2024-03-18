import type {
  Student,
  Graduate,
  Module,
  CompletedModule,
  GradEngagement,
  Thesis,
  SheetEntry,
  SheetItem,
} from "@apptypes/sheetItems";
import { serveDupSysIdDialog } from "@data/DupSysIdDialog";
import type { PanelName } from "@panels";
import { SYS_ID_INDEX, sheetProps } from "@data/SheetItemProps";

export const getNonCustomProps = (panelName: PanelName) => {
  return [
    ...sheetProps[panelName],
    ...sheetProps.SHARED,
  ]
}

export const map = <T extends SheetItem>(spreadsheetMatrix: string[][], headerRow: readonly (keyof T)[]) => {
  const spreadsheetMatrixCopy = [...spreadsheetMatrix];

  // duplicate sysId detection
  const seenSysIds = new Set<string>();
  const duplicateSysIds = new Set<string>();

  spreadsheetMatrixCopy
    .filter(([sysId]) => !!sysId)
    .map(([sysId, ...rest]) => {
      if (seenSysIds.has(sysId)) {
        console.error(`Duplicate sysId: ${sysId}. ${String(headerRow[1])}: ${rest[1]}`);
        duplicateSysIds.add(sysId);
      }
      seenSysIds.add(sysId);
      return sysId;
    });

  if (duplicateSysIds.size > 0) {
    serveDupSysIdDialog();
  }

  return spreadsheetMatrix
    .filter((row) => {
      if (row.length === 0) {
        return false;
      }
      return !!row[SYS_ID_INDEX];
    })
    .map((row) => ({

      // the row number on the spreadsheet: + 1 for header row, + 1 for 0-indexing
      row: spreadsheetMatrixCopy.findIndex(([sysId]) => {
        return sysId === row[SYS_ID_INDEX];
      }) + 2,

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
      note: row[headerRow.length + 1] ?? '',

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

export const unmap = <T extends SheetItem>(sheetItems: T[], headerRow: readonly (keyof T)[]) => {
  const matrix: string[][] = []

  for (const item of sheetItems) {

    const nonCustomFields = headerRow
      .map((key) => item[key]?.toString() ?? '');

    const row = [
      item.sysId,
      ...nonCustomFields,
      item.note ?? '',
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

export const mappers = {
  STUDENTS: {
    map: mapStudents,
    unmap: unmapStudents,
  },
  MODULES: {
    map: mapModules,
    unmap: unmapModules,
  },
  COMPLETED_MODULES: {
    map: mapCompletedModules,
    unmap: unmapCompletedModules,
  },
  GRADUATES: {
    map: mapGraduates,
    unmap: unmapGraduates,
  },
  GRADUATE_ENGAGEMENTS: {
    map: mapGradEngagements,
    unmap: unmapGradEngagements,
  },
  THESES: {
    map: mapTheses,
    unmap: unmapTheses,
  },
} as const;
