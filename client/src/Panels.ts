import StudentListItem from './components/ListItem/StudentListItem.vue';
import StudentDetail from './components/Detail/StudentDetail.vue';
import EmbeddedModuleList from './components/Detail/Embedded/Student/EmbeddedModuleList.vue';
import EmbeddedModuleDetail from './components/Detail/Embedded/Student/EmbeddedModuleDetail.vue';

import ModuleListItem from './components/ListItem/ModuleListItem.vue';
import ModuleDetail from './components/Detail/ModuleDetail.vue';

import CompletedModuleDetail from '../src/components/Detail/CompletedModuleDetail.vue';
import CompletedModuleListItem from './components/ListItem/CompletedModuleListItem.vue';

import GraduateListItem from './components/ListItem/GraduateListItem.vue';
import GraduateDetail from './components/Detail/GraduateDetail.vue';
import EmbeddedEventDetail from './components/Detail/Embedded/Graduate/EmbeddedEventDetail.vue';
import EmbeddedEventList from './components/Detail/Embedded/Graduate/EmbeddedEventList.vue';

import ThesisDetail from './components/Detail/ThesisDetail.vue';
import ThesisListItem from './components/ListItem/ThesisListItem.vue';

import GraduateEngagementDetail from './components/Detail/GraduateEngagementDetail.vue';
import GraduateEngagementListItem from './components/ListItem/GraduateEngagementListItem.vue';

import { markRaw } from 'vue';

import * as types from './SheetTypes';

import { tools } from './AdditionalTools';
import { sortOptions } from './SortOptions'
import { addActions } from './AddActions';

import {
  mapStudents,
  unmapStudents,
  mapGraduates,
  unmapGraduates,
  mapGradEngagements,
  unmapGradEngagements,
  mapModules,
  unmapModules,
  mapCompletedModules,
  unmapCompletedModules,
  mapTheses,
  unmapTheses
} from './DataMappers';

export const panels = {
  STUDENTS: {
    panelName: 'STUDENTS',
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
    icon: 'mdi-account',
    sheetRange: 'Students',
    mappers: {
      map: mapStudents,
      unmap: unmapStudents
    },
    dependencies: ['MODULES', 'COMPLETED_MODULES', 'GRADUATES', 'THESES'],
    embedded: {
      panel: 'MODULES',
      text: {
        title: 'Modules In Progress',
        add: 'Add Module',
        noItemsToDisplay: 'No modules currently in progress.'
      },
      filterBy: {
        inner: 'studentSysId',
        outer: 'sysId'
      },
      detail: markRaw(EmbeddedModuleDetail),
      list: markRaw(EmbeddedModuleList),
    },
    sortOptions: sortOptions.STUDENTS,
    properties: {
      title: 'name',
    }
  },
  MODULES: {
    panelName: 'MODULES',
    add: addActions.MODULES,
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
    sheetRange: 'Modules',
    mappers: {
      map: mapModules,
      unmap: unmapModules
    },
    dependencies: ['STUDENTS', 'GRADUATES', 'COMPLETED_MODULES'],
    sortOptions: sortOptions.MODULES,
    properties: {
      title: 'courseCode'
    }
  },
  COMPLETED_MODULES: {
    panelName: 'COMPLETED_MODULES',
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
    sheetRange: 'Completed Modules',
    mappers: {
      map: mapCompletedModules,
      unmap: unmapCompletedModules
    },
    dependencies: ['STUDENTS', 'GRADUATES', 'MODULES'],
    sortOptions: sortOptions.COMPLETED_MODULES,
    properties: {
      title: 'courseCode'
    }
  },
  THESES: {
    panelName: 'THESES',
    add: addActions.THESES,
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
    sheetRange: 'Theses',
    mappers: {
      map: mapTheses,
      unmap: unmapTheses
    },
    dependencies: ['STUDENTS', 'GRADUATES'],
    sortOptions: sortOptions.THESES,
    properties: {
      title: 'title'
    }
  },
  GRADUATES: {
    panelName: 'GRADUATES',
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
    sheetRange: 'Graduates',
    mappers: {
      map: mapGraduates,
      unmap: unmapGraduates
    },
    dependencies: ['GRADUATE_ENGAGEMENTS'],
    embedded: {
      panel: "GRADUATE_ENGAGEMENTS",
      text: {
        title: 'Engagement Tracking',
        add: 'Add Event',
        noItemsToDisplay: 'No engagements currently recorded.'
      },
      filterBy: {
        inner: 'studentSysId',
        outer: 'sysId'
      },
      detail: markRaw(EmbeddedEventDetail),
      list: markRaw(EmbeddedEventList),
    },
    sortOptions: sortOptions.GRADUATES,
    properties: {
      title: 'name'
    }
  },
  GRADUATE_ENGAGEMENTS: {
    panelName: 'GRADUATE_ENGAGEMENTS',
    add: addActions.GRADUATE_ENGAGEMENTS,
    tools: [],
    components: {
      detail: markRaw(GraduateEngagementDetail),
      list: markRaw(GraduateEngagementListItem),
    },
    title: {
      singular: 'Graduate Engagement',
      plural: 'Graduate Engagements'
    },
    color: 'pink',
    icon: 'mdi-account-tie',
    sheetRange: 'Grad Engagements',
    mappers: {
      map: mapGradEngagements,
      unmap: unmapGradEngagements
    },
    dependencies: ['GRADUATES'],
    sortOptions: sortOptions.GRADUATE_ENGAGEMENTS,
    properties: {
      title: 'event'
    }
  },
} as const;

export type PanelName = keyof typeof panels;

export type PanelRange = typeof panels[PanelName]['sheetRange'];

export type GetSheetItemType<T extends PanelRange> = T extends 'Students' ? types.Student : T extends 'Modules' ? types.Module : T extends 'Completed Modules' ? types.CompletedModule : T extends 'Graduates' ? types.Graduate : T extends 'Theses' ? types.Thesis : T extends 'Grad Engagements' ? types.GradEngagement : never;

export type Panel = typeof panels[PanelName];
export const getPanel = (panelName: PanelName) => panels[panelName];
export const version = 'prerelease v0.87.2 (beta)'