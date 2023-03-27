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

export enum PanelType {
  STUDENTS = 'students',
  GRADUATES = 'graduates',
  MODULES = 'modules',
  COMPLETED_MODULES = 'completedModules'
}

export type Panel = {
  components: {
    detail: any,
    list: any
  },
  title: string,
  color: string,
  icon: string,
  keys: string[],
  sheetRange: Range,
  mappers: {
    map: (data: any[][]) => Object[] | Promise<Object[]>,
    unmap: (data: Object[]) => any[][] | Promise<any[][]>
  },
  type: PanelType
};

export function switchPanel(panel: PanelType): Panel {
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
        sheetRange: Range.Graduates,
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
        sheetRange: Range.Students,
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
        sheetRange: Range.Modules,
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
        sheetRange: Range.CompletedModules,
        keys: ['studentId', 'courseCode'],
        mappers: {
          map: mapCompletedModules,
          unmap: unmapCompletedModules
        },
        type: PanelType.COMPLETED_MODULES
      };
    default:
      throw new Error('switchPanel: Invalid panel type');
  }
}