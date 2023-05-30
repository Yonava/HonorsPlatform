import { Student, Graduate, Module, CompletedModule, Thesis } from './SheetTypes';

export const sortOptions = {
  STUDENTS: [
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
          'Associate Freshman': 2,
          'Sophomore': 3,
          'Associate Sophomore': 4,
          'Junior': 5,
          'Associate Junior': 6,
          'Senior': 7,
          'Associate Senior': 8,
        };

        const yearA = yearMap[a.year] || Infinity;
        const yearB = yearMap[b.year] || Infinity;

        return yearA - yearB;
      }
    },
  ],
  GRADUATES: [
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
  ],
  MODULES: [
    {
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
        if (!a.docuSignCreated && !a.docuSignCompleted) {
          return 1;
        }
        if (!b.docuSignCreated && !b.docuSignCompleted) {
          return -1;
        }
        if (a.docuSignCompleted === '') {
          return 1;
        }
        if (b.docuSignCompleted === '') {
          return -1;
        }
        if (a.docuSignCreated === '') {
          return 1;
        }
        return b.docuSignCompleted.localeCompare(a.docuSignCompleted);
      }
    }
  ],
  COMPLETED_MODULES: [
    {
      label: 'Completed Date',
      icon: {
        asc: 'mdi-calendar-check',
        desc: 'mdi-calendar-remove'
      },
      func: (a: CompletedModule, b: CompletedModule) => {
        // put empty strings last
        if (a.completedDate === '') {
          return 1;
        }
        if (b.completedDate === '') {
          return -1;
        }
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
    }
  ],
  THESES: [
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