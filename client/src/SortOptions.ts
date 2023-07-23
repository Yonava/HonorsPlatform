import { Student, Graduate, Module, CompletedModule, Thesis, GradEngagement } from './SheetTypes';

export const sortOptions = {
  STUDENTS: [
    {
      label: 'Name',
      tooltip: 'Sort by name',
      icon: {
        asc: 'mdi-sort-alphabetical-ascending',
        desc: 'mdi-sort-alphabetical-descending'
      },
      func: (a: Student, b: Student) => a.name.localeCompare(b.name)
    },
    {
      label: 'Points',
      tooltip: 'Sort by number of points',
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
      tooltip: 'Sort by students\' status in the program',
      icon: {
        asc: 'mdi-sort-ascending',
        desc: 'mdi-sort-descending'
      },
      func: (a: Student, b: Student) => a.activeStatus.localeCompare(b.activeStatus)
    },
    {
      label: 'Year',
      tooltip: 'Sort by class year',
      icon: {
        asc: 'mdi-calendar-import',
        desc: 'mdi-calendar-export'
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

        const yearA = yearMap[a.year] || -Infinity;
        const yearB = yearMap[b.year] || -Infinity;

        return yearA - yearB;
      }
    },
  ],
  GRADUATES: [
    {
      label: 'Name',
      tooltip: 'Sort by name',
      icon: {
        asc: 'mdi-sort-alphabetical-ascending',
        desc: 'mdi-sort-alphabetical-descending'
      },
      func: (a: Graduate, b: Graduate) => a.name.localeCompare(b.name)
    },
    {
      label: 'Phone Number',
      tooltip: 'Sort by phone number',
      icon: {
        asc: 'mdi-sort-numeric-ascending',
        desc: 'mdi-sort-numeric-descending'
      },
      func: (a: Graduate, b: Graduate) => a.phone.localeCompare(b.phone)
    },
    {
      label: 'Grad Date',
      tooltip: 'Sort by graduation date',
      icon: {
        asc: 'mdi-calendar-import',
        desc: 'mdi-calendar-export'
      },
      func: (a: Graduate, b: Graduate) => {
        const dateA = new Date(a.graduationDate);
        const dateB = new Date(b.graduationDate);

        if (isNaN(dateA.getTime())) {
          return -1;
        }

        if (isNaN(dateB.getTime())) {
          return 1;
        }

        return dateA.getTime() - dateB.getTime();
      }
    }
  ],
  MODULES: [
    {
      label: 'Course Code',
      tooltip: 'Sort by course code',
      icon: {
        asc: 'mdi-sort-numeric-ascending',
        desc: 'mdi-sort-numeric-descending'
      },
      func: (a: Module, b: Module) => a.courseCode.localeCompare(b.courseCode)
    },
    {
      label: 'Term',
      tooltip: 'Sort by term (semester code)',
      icon: {
        asc: 'mdi-sort-alphabetical-ascending',
        desc: 'mdi-sort-alphabetical-descending'
      },
      func: (a: Module, b: Module) => a.term.localeCompare(b.term)
    },
    {
      label: 'Instructor',
      tooltip: 'Sort by instructor',
      icon: {
        asc: 'mdi-human-male-board',
        desc: 'mdi-human-male-board',
      },
      func: (a: Module, b: Module) => a.instructor.localeCompare(b.instructor)
    },
    {
      label: 'DocuSign',
      tooltip: 'Sort by DocuSign status',
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
      label: 'Date Completed',
      tooltip: 'Sort by date completed',
      icon: {
        asc: 'mdi-calendar-import',
        desc: 'mdi-calendar-export'
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
      tooltip: 'Sort by instructor',
      icon: {
        asc: 'mdi-human-male-board',
        desc: 'mdi-human-male-board',
      },
      func: (a: CompletedModule, b: CompletedModule) => a.instructor.localeCompare(b.instructor)
    },
    {
      label: 'Course Code',
      tooltip: 'Sort by course code',
      icon: {
        asc: 'mdi-sort-numeric-ascending',
        desc: 'mdi-sort-numeric-descending'
      },
      func: (a: CompletedModule, b: CompletedModule) => a.courseCode.localeCompare(b.courseCode)
    },
    {
      label: 'Term',
      tooltip: 'Sort by term (semester code)',
      icon: {
        asc: 'mdi-sort-alphabetical-ascending',
        desc: 'mdi-sort-alphabetical-descending'
      },
      func: (a: CompletedModule, b: CompletedModule) => a.term.localeCompare(b.term)
    },
  ],
  THESES: [
    {
      label: 'Decision',
      tooltip: 'Sort by decision regarding thesis approval',
      icon: {
        asc: 'mdi-check',
        desc: 'mdi-close'
      },
      func: (a: Thesis, b: Thesis) => a.decision.localeCompare(b.decision)
    },
    {
      label: 'Term',
      tooltip: 'Sort by term (semester code)',
      icon: {
        asc: 'mdi-sort-alphabetical-ascending',
        desc: 'mdi-sort-alphabetical-descending'
      },
      func: (a: Thesis, b: Thesis) => a.term.localeCompare(b.term)
    },
    {
      label: 'Faculty Mentor',
      tooltip: 'Sort by faculty mentor',
      icon: {
        asc: 'mdi-human-male-board',
        desc: 'mdi-human-male-board',
      },
      func: (a: Thesis, b: Thesis) => a.mentor.localeCompare(b.mentor)
    }
  ],
  GRADUATE_ENGAGEMENTS: [
    {
      label: 'Event',
      tooltip: 'Sort by name of event',
      icon: {
        asc: 'mdi-sort-alphabetical-ascending',
        desc: 'mdi-sort-alphabetical-descending'
      },
      func: (a: GradEngagement, b: GradEngagement) => a.event.localeCompare(b.event)
    },
    {
      label: 'Date',
      tooltip: 'Sort by date of event',
      icon: {
        asc: 'mdi-calendar-import',
        desc: 'mdi-calendar-export'
      },
      func: (a: GradEngagement, b: GradEngagement) => {
        const aDate = new Date(a.dateTime);
        const bDate = new Date(b.dateTime);
        return aDate.getTime() - bDate.getTime();
      }
    }
  ]
}