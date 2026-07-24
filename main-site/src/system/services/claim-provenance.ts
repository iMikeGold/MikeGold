import "server-only";

import claimData from "../../../records/claims/service-engine-vertical-slice.json";

export type WorkClaim = {
  id: string;
  workSlug: string;
  claimType: "activity" | "responsibility" | "deliverable" | "outcome" | "stage-participation" | "capability-application";
  statement: string;
  conceptSlugs: string[];
  stageKeys: string[];
  hatAssignments: Array<{
    hatSlug: string;
    role: "lead" | "core" | "supporting" | "advisory";
    weight: number;
  }>;
  status: "authored" | "confirmed" | "inferred" | "disputed";
  confidence: number;
  visibility: "public" | "internal" | "private";
};

export type EvidenceClaimLink = {
  evidenceSlug: string;
  claimId: string;
  supportRole: "direct" | "corroborating" | "contextual" | "illustrative";
  strength: number;
  rationale: string;
  publicVisibility: boolean;
};

export const workClaims = claimData.claims as WorkClaim[];
export const evidenceClaimLinks = claimData.evidenceClaimLinks as EvidenceClaimLink[];

export function claimsForWork(workSlug: string) {
  return workClaims.filter((claim) => claim.workSlug === workSlug && claim.status !== "disputed");
}

export function evidenceForClaim(claimId: string) {
  return evidenceClaimLinks.filter((link) => link.claimId === claimId);
}
