import { athleticOptions } from "@utils/students";
import type { StatusOption, YearOption } from "@utils/students";
import type { Grade, Primitive, ThesisDecision } from "./misc";

export type SheetItem = Module | Graduate | Student | CompletedModule | Thesis | GradEngagement;

type CustomField = {
  [Property in number]: Primitive;
};

export interface SheetEntry extends CustomField {
  row: number | null | undefined;
  sysId: string;
  note: string;
}

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