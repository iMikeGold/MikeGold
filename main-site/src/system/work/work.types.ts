import type { ProjectId, WorkId } from "@/system/core/ids";
import type { BaseRecord } from "@/system/core/record";
import type { Visibility } from "@/system/core/visibility";
import type { CapabilityGroupId } from "@/system/work/capability-groups";

export const WORK_STATUSES = [
  "planned",
  "in-progress",
  "documented",
  "completed",
  "historical",
] as const;

export type WorkStatus = (typeof WORK_STATUSES)[number];

export interface WorkStage {
  key: string;
  label: string;
  summary?: string;
  status: "planned" | "in-progress" | "completed" | "historical";
}

export interface InternalWorkRecord extends BaseRecord<WorkId, "work"> {
  projectId: ProjectId;
  slug: string;
  title: string;
  summary: string;
  status: WorkStatus;
  visibility: Visibility;
  sequence?: number;
  capabilityGroupIds: CapabilityGroupId[];
  startedAt?: string;
  completedAt?: string;
  stages?: WorkStage[];
  lensSummaries?: Partial<Record<CapabilityGroupId, string>>;
}

export interface PublicWorkProjection {
  slug: string;
  projectSlug: string;
  title: string;
  summary: string;
  status: WorkStatus;
  sequence?: number;
  capabilityGroupIds: CapabilityGroupId[];
  stages?: WorkStage[];
  appliedHatSlugs: string[];
  evidenceSlugs: string[];
  evidenceLinks: PublicWorkEvidenceLink[];
  lensSummaries?: Partial<Record<CapabilityGroupId, string>>;
}

export interface PublicWorkEvidenceLink {
  evidenceSlug: string;
  role: "primary" | "supporting";
  supportedLensIds?: CapabilityGroupId[];
  displayRoles?: import("@/system/evidence/evidence.types").EvidenceDisplayRole[];
  priority?: number;
}

export interface PublicWorkCardProjection {
  projectSlug: string;
  lensId?: CapabilityGroupId;
  projectName: string;
  contributionTitle: string;
  summary: string;
  relevantWorkSlugs: string[];
  leadHatSlugs: string[];
  supportingHatSlugs: string[];
  primaryVisual?: { evidenceSlug: string; src: string; alt: string; evidenceType: import("@/system/evidence/evidence.types").EvidenceType };
  supportingVisuals: Array<{ evidenceSlug: string; src: string; alt: string; evidenceType: import("@/system/evidence/evidence.types").EvidenceType }>;
  relevanceReasons: string[];
  href: string;
}
