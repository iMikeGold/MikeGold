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

export const EVIDENCE_ROLES = [
  "cover",
  "interface",
  "identity",
  "process",
  "application",
  "reference",
] as const;

export type EvidenceRole = (typeof EVIDENCE_ROLES)[number];

export const EVIDENCE_FACETS = [
  "project-overview", "website", "web-interface", "application-interface",
  "identity-system", "logo", "brand-application", "product-model",
  "system-architecture", "information-architecture", "process", "deployment",
  "infrastructure", "operations", "hardware", "electronics", "installation",
  "live-audio", "recording", "broadcast", "video", "photography", "editorial",
  "media-output",
] as const;
export type EvidenceFacet = (typeof EVIDENCE_FACETS)[number];

export const EVIDENCE_DISPLAY_ROLES = [
  "project-cover", "lens-card", "work-hero", "supporting", "gallery", "archive",
] as const;
export type EvidenceDisplayRole = (typeof EVIDENCE_DISPLAY_ROLES)[number];

export interface EvidencePresentation {
  facets: EvidenceFacet[];
  displayRoles: EvidenceDisplayRole[];
  visualQuality?: "hero" | "standard" | "supporting" | "archive";
  focalPoint?: { x: number; y: number };
  aspectPreference?: "landscape" | "portrait" | "square" | "any";
}

export interface InternalEvidenceRecord
  extends BaseRecord<EvidenceId, "evidence"> {
  slug: string;
  title: string;
  description?: string;
  evidenceType: EvidenceType;
  role?: EvidenceRole;
  sequence?: number;
  previewSequence?: number;
  phase?: string;
  period?: string;
  visibility: Visibility;
  assetPath?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  presentation?: EvidencePresentation;
  sourceTitle?: string;
  sourceAuthor?: string;
  placeholder: boolean;
}

export interface PublicEvidenceProjection {
  slug: string;
  title: string;
  description?: string;
  evidenceType: EvidenceType;
  role?: EvidenceRole;
  sequence?: number;
  previewSequence?: number;
  phase?: string;
  period?: string;
  assetPath?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  presentation?: EvidencePresentation;
  sourceTitle?: string;
  sourceAuthor?: string;
  placeholder: boolean;
}
