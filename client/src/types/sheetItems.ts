import { athleticOptions } from "@utils/students";
import type { StatusOption, YearOption } from "@utils/students";
import type { StudentEmail, FacultyEmail } from "@utils/emails";
import type { Grade, Primitive, ThesisDecision } from "@apptypes/misc";

export type SheetItem = Module | Graduate | Student | CompletedModule | Thesis | GradEngagement;
export type JointSheetItem = Module & Graduate & Student & CompletedModule & Thesis & GradEngagement;
export type SheetItemKeys = keyof JointSheetItem;

type InObj<T, O extends Record<any, any>> = T extends keyof O ? true : never

export type ExcludeByProp<
  T extends SheetItemKeys,
  O extends SheetItem = SheetItem
> = O extends SheetItem ? InObj<T, O> extends never ? O : never : never

export type IncludeByProp<
  T extends SheetItemKeys,
  O extends SheetItem = SheetItem
> = O extends SheetItem ? InObj<T, O> extends never ? never : O : never

type CustomField = {
  [K in number]: Primitive;
};

export interface SheetEntry extends CustomField {
  row: number | null | undefined;
  sysId: string;
  note: string;
}

export interface Student<T extends string = string> extends SheetEntry {
  id: string;
  name: T;
  email: StudentEmail<T>;
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
  dateCompleted: string;
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

export interface Thesis<T extends string = string> extends SheetEntry {
  studentSysId: string;
  title: string;
  proposalReceived: string;
  breakoutRoom: string;
  decision: ThesisDecision;
  term: string;
  mentor: T;
  mentorEmail: FacultyEmail<T>;
  draftReceived: string;
}