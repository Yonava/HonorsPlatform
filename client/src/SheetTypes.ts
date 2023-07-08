import { StatusOption, YearOption } from "./StudentTools";

export type SheetItem = Module | Graduate | Student | CompletedModule | Thesis | GradEngagement;

export const grades = [null, "High Pass", "Pass", "Low Pass", "Fail"] as const;
export type Grade = typeof grades[number];

export interface SheetEntry {
  row: number | null | undefined;
  sysId: string;
}

export interface Module extends SheetEntry {
  studentSysId: string;
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
  activeStatus: StatusOption;
  year: YearOption;
  athletics: string;
  note: string;
  misc: {
    [key: string]: string
  };
}

export interface GradEngagement extends SheetEntry {
  studentSysId: string;
  event: string;
  dateTime: string;
  note: string;
}

export type ThesisDecision = "Approved" | "Rejected" | "Pending";

export interface Thesis extends SheetEntry {
  studentSysId: string;
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