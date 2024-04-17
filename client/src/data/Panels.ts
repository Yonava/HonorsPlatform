import StudentListItem from '../components/ListItem/StudentListItem.vue';
import StudentDetail from '../components/Detail/StudentDetail.vue';
import EmbeddedModuleList from '../components/Detail/Embedded/Student/EmbeddedModuleList.vue';
import EmbeddedModuleDetail from '../components/Detail/Embedded/Student/EmbeddedModuleDetail.vue';

import ModuleListItem from '../components/ListItem/ModuleListItem.vue';
import ModuleDetail from '../components/Detail/ModuleDetail.vue';

import CompletedModuleDetail from '../../src/components/Detail/CompletedModuleDetail.vue';
import CompletedModuleListItem from '../components/ListItem/CompletedModuleListItem.vue';

import GraduateListItem from '../components/ListItem/GraduateListItem.vue';
import GraduateDetail from '../components/Detail/GraduateDetail.vue';
import EmbeddedEventDetail from '../components/Detail/Embedded/Graduate/EmbeddedEventDetail.vue';
import EmbeddedEventList from '../components/Detail/Embedded/Graduate/EmbeddedEventList.vue';

import ThesisDetail from '../components/Detail/ThesisDetail.vue';
import ThesisListItem from '../components/ListItem/ThesisListItem.vue';

import GraduateEngagementDetail from '../components/Detail/GraduateEngagementDetail.vue';
import GraduateEngagementListItem from '../components/ListItem/GraduateEngagementListItem.vue';

import { markRaw } from 'vue';

import { sortOptions } from '../SortOptions'

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

import * as Items from '@apptypes/sheetItems'

export const panels = {
  STUDENTS: {
    panelName: 'STUDENTS',
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
    propIcons: {
      'id': 'numeric',
      'name': 'account',
      'email': 'email',
      'points': 'ticket',
      'year': 'calendar',
    } as Record<keyof Items.Student, string>,
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
    } as Record<string, keyof Items.Student>
  },
  MODULES: {
    panelName: 'MODULES',
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
    propIcons: {
      'studentSysId': 'account',
      'courseCode': 'book-open-variant',
      'term': 'calendar',
      'instructor': 'account',
      'docuSignCreated': 'calendar',
      'docuSignCompleted': 'calendar',
    } as Record<keyof Items.Module, string>,
    mappers: {
      map: mapModules,
      unmap: unmapModules
    },
    dependencies: ['STUDENTS', 'GRADUATES', 'COMPLETED_MODULES'],
    sortOptions: sortOptions.MODULES,
    properties: {
      title: 'courseCode'
    } as Record<string, keyof Items.Module>
  },
  COMPLETED_MODULES: {
    panelName: 'COMPLETED_MODULES',
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
    propIcons: {
      'studentSysId': 'account',
      'courseCode': 'book',
      'term': 'calendar',
      'instructor': 'account',
      'docuSignCreated': 'calendar',
      'docuSignCompleted': 'calendar',
      'dateCompleted': 'calendar',
      'grade': 'numeric',
    } as Record<keyof Items.CompletedModule, string>,
    mappers: {
      map: mapCompletedModules,
      unmap: unmapCompletedModules
    },
    dependencies: ['STUDENTS', 'GRADUATES', 'MODULES'],
    sortOptions: sortOptions.COMPLETED_MODULES,
    properties: {
      title: 'courseCode'
    } as Record<string, keyof Items.CompletedModule>
  },
  THESES: {
    panelName: 'THESES',
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
    propIcons: {
      'studentSysId': 'account',
      'title': 'application-edit-outline',
      'proposalReceived': 'calendar',
      'breakoutRoom': 'calendar',
      'decision': 'calendar',
      'term': 'calendar',
      'mentor': 'account',
      'mentorEmail': 'email',
      'draftReceived': 'calendar',
    } as Record<keyof Items.Thesis, string>,
    mappers: {
      map: mapTheses,
      unmap: unmapTheses
    },
    dependencies: ['STUDENTS', 'GRADUATES'],
    sortOptions: sortOptions.THESES,
    properties: {
      title: 'title'
    } as Record<string, keyof Items.Thesis>
  },
  GRADUATES: {
    panelName: 'GRADUATES',
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
    propIcons: {
      'id': 'numeric',
      'name': 'account',
      'phone': 'phone',
      'email': 'email',
      'graduationDate': 'calendar',
    } as Record<keyof Items.Graduate, string>,
    listItem: {
      title: {
        primary: 'name',
        secondary: 'id'
      },
      emblem: 'graduationDate',
      bottomCorner: ['email', 'phone']
    },
    mappers: {
      map: mapGraduates,
      unmap: unmapGraduates
    },
    dependencies: ['GRADUATE_ENGAGEMENTS'],
    embedded: {
      panel: "GRADUATE_ENGAGEMENTS",
      text: {
        title: 'Engagements',
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
    } as Record<string, keyof Items.Graduate>
  },
  GRADUATE_ENGAGEMENTS: {
    panelName: 'GRADUATE_ENGAGEMENTS',
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
    propIcons: {
      'studentSysId': 'account',
      'event': 'account-tie',
      'dateTime': 'calendar',
    } as Record<keyof Items.GradEngagement, string>,
    mappers: {
      map: mapGradEngagements,
      unmap: unmapGradEngagements
    },
    dependencies: ['GRADUATES'],
    sortOptions: sortOptions.GRADUATE_ENGAGEMENTS,
    properties: {
      title: 'event'
    } as Record<string, keyof Items.GradEngagement>
  },
} as const;

export type PanelToSheetType = {
  STUDENTS: Items.Student,
  MODULES: Items.Module,
  COMPLETED_MODULES: Items.CompletedModule,
  THESES: Items.Thesis,
  GRADUATES: Items.Graduate,
  GRADUATE_ENGAGEMENTS: Items.GradEngagement
}

export type PanelObject = typeof panels
export type PanelName = keyof PanelObject;

export type PanelRange = PanelObject[PanelName]['sheetRange'];

export type Panel = PanelObject[PanelName];
export const getPanel = <T extends PanelName>(panelName: T) => panels[panelName];

export const version = 'prerelease v0.93.6 (beta)';