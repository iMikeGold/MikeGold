export const RECORD_TYPES = [
  "hat",
  "project",
  "work",
  "evidence",
  "relationship",
  "event",
  "deployment",
] as const;

export type RecordType = (typeof RECORD_TYPES)[number];
