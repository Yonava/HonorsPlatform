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

import { Module, CompletedModule, Thesis, Student, Graduate } from './SheetTypes';

import { markRaw } from 'vue';
import { Range } from './SheetsAPI';

import { tools } from './AdditionalTools';

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
    tools: tools.STUDENTS,
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
    sheetRange: Range.STUDENTS,
    mappers: {
      map: mapStudents,
      unmap: unmapStudents
    },
    sortOptions: [
      {
        label: 'Name',
        icon: {
          asc: 'mdi-sort-alphabetical-ascending',
          desc: 'mdi-sort-alphabetical-descending'
        },
        func: (a: Student, b: Student) => a.name.localeCompare(b.name)
      },
      {
        label: 'Points',
        icon: {
          asc: 'mdi-sort-numeric-ascending',
          desc: 'mdi-sort-numeric-descending'
        },
        func: (a: Student, b: Student) => {
          const A = a.points || 0;
          const B = b.points || 0;
          return B - A;
        }
      },
      {
        label: 'Active Status',
        icon: {
          asc: 'mdi-sort-ascending',
          desc: 'mdi-sort-descending'
        },
        func: (a: Student, b: Student) => a.activeStatus.localeCompare(b.activeStatus)
      },
      {
        label: 'Year',
        icon: {
          asc: 'mdi-calendar-star',
          desc: 'mdi-calendar-remove'
        },
        func: (a: Student, b: Student) => {
          const yearMap: { [key: string]: number } = {
            'Freshman': 1,
            'Sophomore': 2,
            'Junior': 3,
            'Senior': 4,
            'Other': 5
          };
          return yearMap[a.year] - yearMap[b.year];
        },
      },
    ]
  },
  GRADUATES: {
    tools: tools.GRADUATES,
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
    sortOptions: [
      {
        label: 'Name',
        icon: {
          asc: 'mdi-sort-alphabetical-ascending',
          desc: 'mdi-sort-alphabetical-descending'
        },
        func: (a: Graduate, b: Graduate) => a.name.localeCompare(b.name)
      },
      {
        label: 'Phone Number',
        icon: {
          asc: 'mdi-sort-numeric-ascending',
          desc: 'mdi-sort-numeric-descending'
        },
        func: (a: Graduate, b: Graduate) => a.phone.localeCompare(b.phone)
      },
      {
        label: 'Grad Date',
        icon: {
          asc: 'mdi-calendar-star',
          desc: 'mdi-calendar-remove'
        },
        func: (a: Graduate, b: Graduate) => {
          const dateA = new Date(a.graduationDate);
          const dateB = new Date(b.graduationDate);
          return dateA.getTime() - dateB.getTime();
        }
      }
    ]
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
    sortOptions: [{
      label: 'Course Code',
      icon: {
        asc: 'mdi-sort-numeric-ascending',
        desc: 'mdi-sort-numeric-descending'
      },
      func: (a: Module, b: Module) => a.courseCode.localeCompare(b.courseCode)
    },
    {
      label: 'Term',
      icon: {
        asc: 'mdi-sort-alphabetical-ascending',
        desc: 'mdi-sort-alphabetical-descending'
      },
      func: (a: Module, b: Module) => a.term.localeCompare(b.term)
    },
    {
      label: 'Instructor',
      icon: {
        asc: 'mdi-human-male-board',
        desc: 'mdi-human-male-board',
      },
      func: (a: Module, b: Module) => a.instructor.localeCompare(b.instructor)
    },
    {
      label: 'DocuSign',
      icon: {
        asc: 'mdi-file-document-outline',
        desc: 'mdi-file-document',
      },
      func: (a: Module, b: Module) => {
        if (!a.docuSignCreated && !a.docuSignCompleted) return 1;
        if (!b.docuSignCreated && !b.docuSignCompleted) return -1;
        if (a.docuSignCompleted === '') return 1;
        if (b.docuSignCompleted === '') return -1;
        return b.docuSignCompleted.localeCompare(a.docuSignCompleted);
      }
    }]
  },
  COMPLETED_MODULES: {
    tools: tools.COMPLETED_MODULES,
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
    mappers: {
      map: mapCompletedModules,
      unmap: unmapCompletedModules
    },
    sortOptions: [{
      label: 'Completed Date',
      icon: {
        asc: 'mdi-calendar-check',
        desc: 'mdi-calendar-remove'
      },
      func: (a: CompletedModule, b: CompletedModule) => {
        // put empty strings last
        if (a.completedDate === '') return 1;
        if (b.completedDate === '') return -1;
        const aDate = new Date(a.completedDate);
        const bDate = new Date(b.completedDate);
        return aDate.getTime() - bDate.getTime();
      }
    },
    {
      label: 'Instructor',
      icon: {
        asc: 'mdi-human-male-board',
        desc: 'mdi-human-male-board',
      },
      func: (a: CompletedModule, b: CompletedModule) => a.instructor.localeCompare(b.instructor)
    },
    {
      label: 'Course Code',
      icon: {
        asc: 'mdi-sort-numeric-ascending',
        desc: 'mdi-sort-numeric-descending'
      },
      func: (a: CompletedModule, b: CompletedModule) => a.courseCode.localeCompare(b.courseCode)
    }],
  },
  THESES: {
    tools: tools.THESES,
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
    mappers: {
      map: mapTheses,
      unmap: unmapTheses
    },
    sortOptions: [
      {
        label: 'Decision',
        icon: {
          asc: 'mdi-check',
          desc: 'mdi-close'
        },
        func: (a: Thesis, b: Thesis) => a.decision.localeCompare(b.decision)
      },
      {
        label: 'Term',
        icon: {
          asc: 'mdi-sort-alphabetical-ascending',
          desc: 'mdi-sort-alphabetical-descending'
        },
        func: (a: Thesis, b: Thesis) => a.term.localeCompare(b.term)
      },
      {
        label: 'Student Name',
        icon: {
          asc: 'mdi-sort-alphabetical-ascending',
          desc: 'mdi-sort-alphabetical-descending'
        },
        func: (a: Thesis, b: Thesis) => a.name.localeCompare(b.name)
      },
      {
        label: 'Faculty Mentor',
        icon: {
          asc: 'mdi-human-male-board',
          desc: 'mdi-human-male-board',
        },
        func: (a: Thesis, b: Thesis) => a.mentor.localeCompare(b.mentor)
      }
    ]
  }
} as const;

export type PanelName = keyof typeof panels;
export type Panel = typeof panels[PanelName];
export const getPanel = (panelName: PanelName) => panels[panelName];