export type SheetItem = Module | Graduate | Student | CompletedModule | Thesis;

export type Grade = "High Pass" | "Pass" | "Low Pass" | "Fail" | null;

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
  grade: Grade;
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
  athletics: string;
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

export enum ThesisDecision {
  APPROVED = "Approved",
  REJECTED = "Rejected",
  PENDING = "Pending"
}

export interface Thesis extends SheetEntry {
  studentId: string;
  name: string;
  email: string;
  title: string;
  proposalReceived: string;
  breakoutRoom: string;
  decision: ThesisDecision;
  term: string;
  mentor: string;
  mentorEmail: string;
  draftReceived: string;
  note: string;
}