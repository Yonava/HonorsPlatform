import StudentListItem from '../src/components/StudentListItem.vue';
import StudentDetail from '../src/components/StudentDetail.vue';

import ModuleListItem from '../src/components/ModuleListItem.vue';
import ModuleDetail from '../src/components/ModuleDetail.vue';

import CompletedModuleDetail from '../src/components/CompletedModuleDetail.vue';
import CompletedModuleListItem from '../src/components/CompletedModuleListItem.vue';

import GraduateListItem from '../src/components/GraduateListItem.vue';
import GraduateDetail from '../src/components/GraduateDetail.vue';

import { markRaw } from 'vue';
import { Range } from './SheetsAPI';
import { 
  mapStudents,
  unmapStudents,
  mapGraduates, 
  unmapGraduates,
  mapModules,
  unmapModules,
  mapCompletedModules,
  unmapCompletedModules
} from './DataMappers';
import { SheetEntry } from './SheetTypes';

export enum PanelType {
  STUDENTS = 'students',
  GRADUATES = 'graduates',
  MODULES = 'modules',
  COMPLETED_MODULES = 'completedModules'
}

// i don't think this does anything
type Component = typeof StudentDetail

export type Panel<T extends SheetEntry> = {
  components: {
    detail: Component,
    list: Component
  },
  title: string,
  color: string,
  icon: string,
  keys: string[],
  sheetRange: Range,
  mappers: {
    map: (data: string[][]) => T[] | Promise<T[]>,
    unmap: (data: T[]) => string[][] | Promise<string[][]>
  },
  type: PanelType
};

export function switchPanel(panel: PanelType) {
  switch (panel) {
    case PanelType.GRADUATES:
      return {
        components: {
          detail: markRaw(GraduateDetail),
          list: markRaw(GraduateListItem)
        },
        title: 'Graduates',
        color: 'purple',
        icon: 'mdi-account-school',
        sheetRange: Range.GRADUATES,
        mappers: {
          map: mapGraduates,
          unmap: unmapGraduates
        },
        keys: ['name', 'phone'],
        type: PanelType.GRADUATES
      };
    case PanelType.STUDENTS:
      return {
        components: {
          detail: markRaw(StudentDetail),
          list: markRaw(StudentListItem)
        },
        title: 'Students',
        color: 'blue',
        icon: 'mdi-account-group',
        keys: ['id'],
        sheetRange: Range.STUDENTS,
        mappers: {
          map: mapStudents,
          unmap: unmapStudents
        },
        type: PanelType.STUDENTS
      };
    case PanelType.MODULES:
      return {
        components: {
          detail: markRaw(ModuleDetail),
          list: markRaw(ModuleListItem)
        },
        title: 'Modules',
        color: 'orange',
        icon: 'mdi-book-open-variant',
        keys: ['studentId', 'courseCode'],
        sheetRange: Range.MODULES,
        mappers: {
          map: mapModules,
          unmap: unmapModules
        },
        type: PanelType.MODULES
      };
    case PanelType.COMPLETED_MODULES:
      return {
        components: {
          detail: markRaw(CompletedModuleDetail),
          list: markRaw(CompletedModuleListItem)
        },
        title: 'Completed Modules',
        color: 'red',
        icon: 'mdi-book',
        sheetRange: Range.COMPLETED_MODULES,
        keys: ['studentId', 'courseCode'],
        mappers: {
          map: mapCompletedModules,
          unmap: unmapCompletedModules
        },
        type: PanelType.COMPLETED_MODULES
      };
    default:
      throw new Error(`switchPanel: Invalid panel type ${panel}`);
  }
}