import StudentListItem from '../src/components/StudentListItem.vue';
import StudentDetail from '../src/components/StudentDetail.vue';

import ModuleListItem from '../src/components/ModuleListItem.vue';
import ModuleDetail from '../src/components/ModuleDetail.vue';

import CompletedModuleDetail from '../src/components/CompletedModuleDetail.vue';
import CompletedModuleListItem from '../src/components/CompletedModuleListItem.vue';

import GraduateListItem from '../src/components/GraduateListItem.vue';
import GraduateDetail from '../src/components/GraduateDetail.vue';

import ThesisDetail from '../src/components/ThesisDetail.vue';
import ThesisListItem from '../src/components/ThesisListItem.vue';

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
  unmapCompletedModules,
  mapTheses,
  unmapTheses
} from './DataMappers';
import { SheetEntry } from './SheetTypes';

export enum PanelType {
  STUDENTS = 'students',
  GRADUATES = 'graduates',
  MODULES = 'modules',
  COMPLETED_MODULES = 'completedModules',
  THESES = 'theses',
}

// i don't think this does anything
type Component = typeof StudentDetail

export type Panel<T extends SheetEntry> = {
  components: {
    detail: Component,
    list: Component
  },
  title: {
    singular: string,
    plural: string
  },
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
        title: {
          singular: 'Graduate',
          plural: 'Graduates'
        },
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
        title: {
          singular: 'Student',
          plural: 'Students'
        },
        color: 'blue',
        icon: 'mdi-account-group',
        keys: ['id', 'name'],
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
        title: {
          singular: 'Module',
          plural: 'Modules'
        },
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
        title: {
          singular: 'Completed Module',
          plural: 'Completed Modules'
        },
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
    case PanelType.THESES:
      return {
        components: {
          detail: markRaw(ThesisDetail),
          list: markRaw(ThesisListItem)
        },
        title: {
          singular: 'Thesis',
          plural: 'Theses'
        },
        color: 'green',
        icon: 'mdi-application-edit-outline',
        sheetRange: Range.THESES,
        keys: ['studentId'],
        mappers: {
          map: mapTheses,
          unmap: unmapTheses
        },
        type: PanelType.THESES
      };
    default:
      throw new Error(`switchPanel: Invalid panel type ${panel}`);
  }
}