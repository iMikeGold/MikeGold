import type { EvidenceId } from "@/system/core/ids";
import type { BaseRecord } from "@/system/core/record";
import type { Visibility } from "@/system/core/visibility";

export const EVIDENCE_TYPES = [
  "image",
  "video",
  "document",
  "diagram",
  "website",
  "code",
  "placeholder",
] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export interface InternalEvidenceRecord
  extends BaseRecord<EvidenceId, "evidence"> {
  slug: string;
  title: string;
  description?: string;
  evidenceType: EvidenceType;
  visibility: Visibility;
  assetPath?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  sourceTitle?: string;
  sourceAuthor?: string;
  placeholder: boolean;
}

export interface PublicEvidenceProjection {
  slug: string;
  title: string;
  description?: string;
  evidenceType: EvidenceType;
  assetPath?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  sourceTitle?: string;
  sourceAuthor?: string;
  placeholder: boolean;
}
