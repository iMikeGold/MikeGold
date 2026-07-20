import "server-only";

import { internalRelationshipRecords } from "@/system/generated/internal-relationship-records.generated";
import type { UUID } from "@/system/core/ids";

export const getAllInternalRelationships = () => internalRelationshipRecords;
export const getRelationshipsFrom = (sourceId: UUID) =>
  internalRelationshipRecords.filter(
    (relationship) => relationship.sourceId === sourceId,
  );
export const getRelationshipsTo = (targetId: UUID) =>
  internalRelationshipRecords.filter(
    (relationship) => relationship.targetId === targetId,
  );
