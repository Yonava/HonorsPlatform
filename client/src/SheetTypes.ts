import {
  type StatusOption,
  type YearOption,
  athleticOptions
} from "./StudentTools";

import { sheetProps } from "./DataMappers";

export type SheetItem = Module | Graduate | Student | CompletedModule | Thesis | GradEngagement;

export const grades = [null, "High Pass", "Pass", "Low Pass", "Fail"] as const;
export type Grade = typeof grades[number];


type Primitive = string | number | boolean | null | undefined;

type CustomField = {
  [Property in number]: Primitive;
};

export type SheetEntry = {
  row: number | null | undefined;
  sysId: string;
  note: string;
} & CustomField;

export interface Student extends SheetEntry {
  id: string;
  name: string;
  email: string;
  points: number;
  activeStatus: StatusOption;
  year: YearOption;
  athletics: keyof typeof athleticOptions;
}

export interface Module extends SheetEntry {
  studentSysId: string;
  courseCode: string;
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
}

export interface GradEngagement extends SheetEntry {
  studentSysId: string;
  event: string;
  dateTime: string;
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
}

export interface Announcement {
  sysId: string,
  posterName: string,
  posterPhoto: string,
  content: string,
  datePosted: string,
  expiryDate: string,
  panelType: string,
}