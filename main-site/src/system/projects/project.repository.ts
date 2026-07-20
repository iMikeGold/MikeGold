import "server-only";

import { internalProjectRecords } from "@/system/generated/internal-project-records.generated";
import type { ProjectId } from "@/system/core/ids";

export const getAllInternalProjects = () => internalProjectRecords;
export const getInternalProjectById = (id: ProjectId) =>
  internalProjectRecords.find((project) => project.id === id) ?? null;
export const getInternalProjectBySlug = (slug: string) =>
  internalProjectRecords.find((project) => project.slug === slug) ?? null;
