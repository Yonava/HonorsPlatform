export type SheetItem = Module | Graduate | Student | CompletedModule;

export interface SheetEntry {
  row: number;
}

export interface Module extends SheetEntry {
  studentId: string;
  courseCode: string;
  description: string;
  term: string;
  instructor: string;
  docuSignCreated: string;
  docuSignCompleted: string;
}

export interface CompletedModule extends Module {
  completedDate: string;
  grade: string;
}

export interface Graduate extends SheetEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  graduationDate: string;
  note: string;
}

export interface Student extends SheetEntry {
  id: string;
  name: string;
  email: string;
  points: number;
  activeStatus: string;
  year: string;
  note: string;
  misc: { 
    [key: string]: string 
  };
}

export interface GradEngagement extends SheetEntry {
  gradId: string;
  event: string;
  dateTime: string;
  note: string;
}
