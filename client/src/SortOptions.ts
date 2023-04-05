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
            asc: (a: Student, b: Student) => {
              const A = a.points || 0;
              const B = b.points || 0;
              return A - B;
            },
            desc: (a: Student, b: Student) => {
              const A = a.points || 0;
              const B = b.points || 0;
              return B - A;
            }
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
        {
          label: 'Year',
          icon: {
            asc: 'mdi-calendar-star',
            desc: 'mdi-calendar-remove'
          },
          func: {
            asc: (a: Student, b: Student) => {
              const yearMap: { [key: string]: number } = {
                'Freshman': 1,
                'Sophomore': 2,
                'Junior': 3,
                'Senior': 4,
              };
              return yearMap[a.year] - yearMap[b.year];
            },
            desc: (a: Student, b: Student) => {
              const yearMap: { [key: string]: number } = {
                'Freshman': 1,
                'Sophomore': 2,
                'Junior': 3,
                'Senior': 4,
              };
              return yearMap[b.year] - yearMap[a.year];
            }
          },
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
        },
        {
          label: 'Grad Date',
          icon: {
            asc: 'mdi-calendar-star',
            desc: 'mdi-calendar-remove'
          },
          func: {
            asc: (a: Graduate, b: Graduate) => {
              const dateA = new Date(a.graduationDate);
              const dateB = new Date(b.graduationDate);
              return dateA.getTime() - dateB.getTime();
            },
            desc: (a: Graduate, b: Graduate) => {
              const dateA = new Date(a.graduationDate);
              const dateB = new Date(b.graduationDate);
              return dateB.getTime() - dateA.getTime();
            }
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
            asc: 'mdi-sort-alphabetical-ascending',
            desc: 'mdi-sort-alphabetical-descending'
          },
          func: {
            asc: (a: Module, b: Module) => a.term.localeCompare(b.term),
            desc: (a: Module, b: Module) => b.term.localeCompare(a.term)
          }
        },
        {
          label: 'Instructor',
          icon: {
            asc: 'mdi-human-male-board',
            desc: 'mdi-human-male-board',
          },
          func: {
            asc: (a: Module, b: Module) => a.instructor.localeCompare(b.instructor),
            desc: (a: Module, b: Module) => b.instructor.localeCompare(a.instructor)
          }
        },
        {
          label: 'DocuSign',
          icon: {
            asc: 'mdi-file-document-outline',
            desc: 'mdi-file-document',
          },
          func: {
            asc: (a: Module, b: Module) => {
              if (!a.docuSignCreated && !a.docuSignCompleted) return 1;
              if (!b.docuSignCreated && !b.docuSignCompleted) return -1;
              if (a.docuSignCompleted === '') return 1;
              if (b.docuSignCompleted === '') return -1;
              return b.docuSignCompleted.localeCompare(a.docuSignCompleted);
            },
            desc: (a: Module, b: Module) => {
              if (!a.docuSignCreated && !a.docuSignCompleted) return -1;
              if (!b.docuSignCreated && !b.docuSignCompleted) return 1;
              if (a.docuSignCompleted === '') return -1;
              if (b.docuSignCompleted === '') return 1;
              return b.docuSignCompleted.localeCompare(a.docuSignCompleted);
            }
          }
        }
      ]
    case PanelType.COMPLETED_MODULES:
      return [
        {
          label: 'Completed Date',
          icon: {
            asc: 'mdi-calendar-check',
            desc: 'mdi-calendar-remove'
          },
          func: {
            asc: (a: CompletedModule, b: CompletedModule) => {
              // put empty strings last
              if (a.completedDate === '') return 1;
              if (b.completedDate === '') return -1;
              const aDate = new Date(a.completedDate);
              const bDate = new Date(b.completedDate);
              return aDate.getTime() - bDate.getTime();
            },
            desc: (a: CompletedModule, b: CompletedModule) => {
              // put empty strings first
              if (a.completedDate === '') return -1;
              if (b.completedDate === '') return 1;
              const aDate = new Date(a.completedDate);
              const bDate = new Date(b.completedDate);
              return bDate.getTime() - aDate.getTime();
            }
          }
        },
        {
          label: 'Instructor',
          icon: {
            asc: 'mdi-human-male-board',
            desc: 'mdi-human-male-board',
          },
          func: {
            asc: (a: CompletedModule, b: CompletedModule) => a.instructor.localeCompare(b.instructor),
            desc: (a: CompletedModule, b: CompletedModule) => b.instructor.localeCompare(a.instructor)
          }
        },
        {
          label: 'Course Code',
          icon: {
            asc: 'mdi-sort-numeric-ascending',
            desc: 'mdi-sort-numeric-descending'
          },
          func: {
            asc: (a: CompletedModule, b: CompletedModule) => a.courseCode.localeCompare(b.courseCode),
            desc: (a: CompletedModule, b: CompletedModule) => b.courseCode.localeCompare(a.courseCode)
          }
        }
      ]
    default:
      console.warn('No sort options for panel type: ' + panel);
      return [];
  }
}