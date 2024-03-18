import type {
  SheetEntry,
  Student,
  Graduate,
  Module,
  CompletedModule,
  GradEngagement,
  Thesis,
} from "@apptypes/sheetItems";

// this file is used to link each column in the Google Sheet to a property in the SheetItem type.
// ORDER MATTERS! DataMapper.ts uses the order of these properties
// to map the data from the sheet item back to the google sheet,
// if the data is out of order, it will not be mapped correctly.

// shared sheet item properties are for properties that exist on all sheet items, sysId will
// be mapped to the index specified in SYS_ID_INDEX while all others will be mapped in order
// behind all other properties specified in the sheetProps object.

// example: shared = ['sysId', 'note'], student = ['id', 'name'] => ['sysId', 'id', 'name', 'note']

// the index where all SheetItems stored on Google Sheets store their unique sysId
export const SYS_ID_INDEX = 0;

const sharedSheetItemProps: (keyof SheetEntry)[] = [
  'sysId',
  'note',
];

export const STUDENTS: (keyof Student)[] = [
  'id',
  'name',
  'email',
  'points',
  'activeStatus',
  'year',
  'athletics'
];

export const GRADUATES: (keyof Graduate)[] = [
  'id',
  'name',
  'phone',
  'email',
  'graduationDate',
];

export const MODULES: (keyof Module)[] = [
  'studentSysId',
  'courseCode',
  'term',
  'instructor',
  'docuSignCreated',
  'docuSignCompleted',
];

export const COMPLETED_MODULES: (keyof CompletedModule)[] = [
  'studentSysId',
  'courseCode',
  'term',
  'instructor',
  'docuSignCreated',
  'docuSignCompleted',
  'dateCompleted',
  'grade',
];

export const GRADUATE_ENGAGEMENTS: (keyof GradEngagement)[] = [
  'studentSysId',
  'event',
  'dateTime',
];

export const THESES: (keyof Thesis)[] = [
  'studentSysId',
  'title',
  'proposalReceived',
  'breakoutRoom',
  'decision',
  'term',
  'mentor',
  'mentorEmail',
  'draftReceived',
];

export const sheetProps = {
  STUDENTS,
  MODULES,
  COMPLETED_MODULES,
  GRADUATES,
  GRADUATE_ENGAGEMENTS,
  THESES,
  SHARED: sharedSheetItemProps,
} as const;