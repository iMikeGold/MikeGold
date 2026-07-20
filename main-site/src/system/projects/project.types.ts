import type { ProjectId } from "@/system/core/ids";
import type { BaseRecord } from "@/system/core/record";
import type { Visibility } from "@/system/core/visibility";

export const PROJECT_STATUSES = [
  "live",
  "maintained",
  "active-development",
  "prototype",
  "design-development",
  "awaiting-implementation",
  "archived",
  "reserved-concept",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface InternalProjectRecord extends BaseRecord<ProjectId, "project"> {
  slug: string;
  name: string;
  summary: string;
  status: ProjectStatus;
  visibility: Visibility;
  featured: boolean;
  context?: string;
  establishedYear?: number;
  workStarted?: string;
  workEnded?: string;
  liveUrl?: string;
}

export interface PublicProjectProjection {
  slug: string;
  name: string;
  summary: string;
  status: ProjectStatus;
  featured: boolean;
  context?: string;
  establishedYear?: number;
  workPeriod?: string;
  liveUrl?: string;
}
