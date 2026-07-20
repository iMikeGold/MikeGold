import "server-only";

import { internalWorkRecords } from "@/system/generated/internal-work-records.generated";
import type { ProjectId, WorkId } from "@/system/core/ids";

export const getAllInternalWork = () => internalWorkRecords;
export const getInternalWorkById = (id: WorkId) =>
  internalWorkRecords.find((work) => work.id === id) ?? null;
export const getInternalWorkForProject = (projectId: ProjectId) =>
  internalWorkRecords.filter((work) => work.projectId === projectId);
