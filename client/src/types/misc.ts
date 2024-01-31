export const grades = ["High Pass", "Pass", "Low Pass", "Fail", null] as const;
export type Grade = typeof grades[number];

export type Primitive = string | number | boolean | null | undefined;

export const thesisDecisions = ["Pending", "Approved", "Rejected"] as const;
export type ThesisDecision = typeof thesisDecisions[number];

export interface Announcement {
  sysId: string,
  posterName: string,
  posterPhoto: string,
  content: string,
  datePosted: string,
  expiryDate: string,
  panelType: string,
}
