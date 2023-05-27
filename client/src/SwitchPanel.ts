import StudentListItem from './components/ListItem/StudentListItem.vue';
import StudentDetail from './components/Detail/StudentDetail.vue';

import ModuleListItem from './components/ListItem/ModuleListItem.vue';
import ModuleDetail from './components/Detail/ModuleDetail.vue';

import CompletedModuleDetail from '../src/components/Detail/CompletedModuleDetail.vue';
import CompletedModuleListItem from './components/ListItem/CompletedModuleListItem.vue';

import GraduateListItem from './components/ListItem/GraduateListItem.vue';
import GraduateDetail from './components/Detail/GraduateDetail.vue';

import ThesisDetail from './components/Detail/ThesisDetail.vue';
import ThesisListItem from './components/ListItem/ThesisListItem.vue';

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

export const panels = {
  STUDENTS: {
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
  },
  GRADUATES: {
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
  },
  MODULES: {
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
  },
  COMPLETED_MODULES: {
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
  },
  THESES: {
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
  }
} as const;