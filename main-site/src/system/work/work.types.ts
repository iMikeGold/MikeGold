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
  capabilityGroupIds: CapabilityGroupId[];
  startedAt?: string;
  completedAt?: string;
  stages?: WorkStage[];
}

export interface PublicWorkProjection {
  slug: string;
  projectSlug: string;
  title: string;
  summary: string;
  status: WorkStatus;
  capabilityGroupIds: CapabilityGroupId[];
  stages?: WorkStage[];
  appliedHatSlugs: string[];
  evidenceSlugs: string[];
}
