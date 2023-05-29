import StudentListItem from './components/ListItem/StudentListItem.vue';
import StudentDetail from './components/Detail/StudentDetail.vue';
import AddStudent from './components/Add/AddStudent.vue';

import ModuleListItem from './components/ListItem/ModuleListItem.vue';
import ModuleDetail from './components/Detail/ModuleDetail.vue';
import AddModule from './components/Add/AddModule.vue';

import CompletedModuleDetail from '../src/components/Detail/CompletedModuleDetail.vue';
import CompletedModuleListItem from './components/ListItem/CompletedModuleListItem.vue';
import AddCompletedModule from './components/Add/AddCompletedModule.vue';

import GraduateListItem from './components/ListItem/GraduateListItem.vue';
import GraduateDetail from './components/Detail/GraduateDetail.vue';
import AddGraduate from './components/Add/AddGraduate.vue';

import ThesisDetail from './components/Detail/ThesisDetail.vue';
import ThesisListItem from './components/ListItem/ThesisListItem.vue';
import AddThesis from './components/Add/AddThesis.vue';

import { markRaw } from 'vue';
import { Range } from './SheetsAPI';

import { tools } from './AdditionalTools';
import { sortOptions } from './SortOptions'
import { addActions } from './AddActions';

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

export const panels = {
  STUDENTS: {
    add: addActions.STUDENTS,
    tools: tools.STUDENTS,
    components: {
      detail: markRaw(StudentDetail),
      list: markRaw(StudentListItem),
    },
    title: {
      singular: 'Student',
      plural: 'Students'
    },
    color: 'blue',
    icon: 'mdi-account-group',
    sheetRange: Range.STUDENTS,
    mappers: {
      map: mapStudents,
      unmap: unmapStudents
    },
    sortOptions: sortOptions.STUDENTS
  },
  GRADUATES: {
    add: addActions.GRADUATES,
    tools: tools.GRADUATES,
    components: {
      detail: markRaw(GraduateDetail),
      list: markRaw(GraduateListItem),
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
    sortOptions: sortOptions.GRADUATES
  },
  MODULES: {
    tools: tools.MODULES,
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
    sheetRange: Range.MODULES,
    mappers: {
      map: mapModules,
      unmap: unmapModules
    },
    sortOptions: sortOptions.MODULES
  },
  COMPLETED_MODULES: {
    tools: tools.COMPLETED_MODULES,
    components: {
      detail: markRaw(CompletedModuleDetail),
      list: markRaw(CompletedModuleListItem),
    },
    title: {
      singular: 'Completed Module',
      plural: 'Completed Modules'
    },
    color: 'red',
    icon: 'mdi-book',
    sheetRange: Range.COMPLETED_MODULES,
    mappers: {
      map: mapCompletedModules,
      unmap: unmapCompletedModules
    },
    sortOptions: sortOptions.COMPLETED_MODULES,
  },
  THESES: {
    tools: tools.THESES,
    components: {
      detail: markRaw(ThesisDetail),
      list: markRaw(ThesisListItem),
    },
    title: {
      singular: 'Thesis',
      plural: 'Theses'
    },
    color: 'green',
    icon: 'mdi-application-edit-outline',
    sheetRange: Range.THESES,
    mappers: {
      map: mapTheses,
      unmap: unmapTheses
    },
    sortOptions: sortOptions.THESES
  }
} as const;

export type PanelName = keyof typeof panels;
export type Panel = typeof panels[PanelName];
export const getPanel = (panelName: PanelName) => panels[panelName];