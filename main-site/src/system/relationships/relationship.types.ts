import type { RelationshipId, UUID } from "@/system/core/ids";
import type { BaseRecord } from "@/system/core/record";
import type { RecordType } from "@/system/core/record-types";

export const RELATIONSHIP_TYPES = [
  "applied-in",
  "evidenced-by",
  "related-to",
  "supersedes",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export interface InternalRelationshipRecord
  extends BaseRecord<RelationshipId, "relationship"> {
  sourceId: UUID;
  sourceType: RecordType;
  relationshipType: RelationshipType;
  targetId: UUID;
  targetType: RecordType;
  role?: "primary" | "supporting";
  note?: string;
}
