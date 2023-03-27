import { PanelType } from './SwitchPanel';
import { 
  Student,
  Graduate,  
  Module,
  CompletedModule,
} from './SheetTypes';

export type SortOption<T> = {
  label: string,
  icon: {
    asc: string,
    desc: string
  },
  func: {
    asc: (a: T, b: T) => number,
    desc: (a: T, b: T) => number
  }
}

export function switchSortOptions(panel: PanelType) {
  switch (panel) {
    case PanelType.STUDENTS:
      return [
        { 
          label: 'Name', 
          icon: {
            asc: 'mdi-sort-alphabetical-ascending',
            desc: 'mdi-sort-alphabetical-descending'
          },
          func: {
            asc: (a: Student, b: Student) => a.name.localeCompare(b.name),
            desc: (a: Student, b: Student) => b.name.localeCompare(a.name)
          }
        },
        { 
          label: 'Points',
          icon: {
            asc: 'mdi-sort-numeric-ascending',
            desc: 'mdi-sort-numeric-descending'
          },
          func: {
            asc: (a: Student, b: Student) => a.points - b.points,
            desc: (a: Student, b: Student) => b.points - a.points
          }
        },
        { 
          label: 'Active Status', 
          icon: {
            asc: 'mdi-sort-ascending',
            desc: 'mdi-sort-descending'
          },
          func: {
            asc: (a: Student, b: Student) => a.activeStatus.localeCompare(b.activeStatus),
            desc: (a: Student, b: Student) => b.activeStatus.localeCompare(a.activeStatus)
          }
        },
      ];
    case PanelType.GRADUATES:
      return [
        {
          label: 'Name',
          icon: {
            asc: 'mdi-sort-alphabetical-ascending',
            desc: 'mdi-sort-alphabetical-descending'
          },
          func: {
            asc: (a: Graduate, b: Graduate) => a.name.localeCompare(b.name),
            desc: (a: Graduate, b: Graduate) => b.name.localeCompare(a.name)
          }
        },
        {
          label: 'Phone Number',
          icon: {
            asc: 'mdi-sort-numeric-ascending',
            desc: 'mdi-sort-numeric-descending'
          },
          func: {
            asc: (a: Graduate, b: Graduate) => a.phone.localeCompare(b.phone),
            desc: (a: Graduate, b: Graduate) => b.phone.localeCompare(a.phone)
          }
        }
      ]
    case PanelType.MODULES:
      return [
        {
          label: 'Course Code',
          icon: {
            asc: 'mdi-sort-numeric-ascending',
            desc: 'mdi-sort-numeric-descending'
          },
          func: {
            asc: (a: Module, b: Module) => a.courseCode.localeCompare(b.courseCode),
            desc: (a: Module, b: Module) => b.courseCode.localeCompare(a.courseCode)
          }
        },
        {
          label: 'Term',
          icon: {
            asc: 'mdi-sort-numeric-ascending',
            desc: 'mdi-sort-numeric-descending'
          },
          func: {
            asc: (a: Module, b: Module) => a.term.localeCompare(b.term),
            desc: (a: Module, b: Module) => b.term.localeCompare(a.term)
          }
        }
      ]
    case PanelType.COMPLETED_MODULES:
      return []
    default:
      console.warn('No sort options for panel type: ' + panel);
      return [];
  }
}