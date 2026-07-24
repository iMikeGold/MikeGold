# Capability State Model — Proposed, Not Applied

The current six-axis vectors remain legacy visual derivations. This proposal separates universal role demand from Mike Gold's accumulated state.

## Axis rubric

- **Depth** — specialist complexity, technical resolution and domain mastery.
- **Creativity** — synthesis, invention, interpretation and expressive decision-making.
- **Scale** — scope breadth, system reach, coordination and operating extent.
- **Interaction** — real-time behaviour, responsiveness, human involvement and feedback.
- **Structure** — method, sequencing, standards, repeatability, documentation and control.
- **Outcome Influence** (public label may remain “Influence”) — control over final outcome, meaning, experience, adoption or impact.

## Proposed records

```ts
type AxisVector = {
  depth: number;
  creativity: number;
  scale: number;
  interaction: number;
  structure: number;
  outcomeInfluence: number;
};

interface HatDefinition {
  hatId: string;
  definition: string;
  scopeBoundary: string;
  coverage: Array<{
    conceptSlug: string;
    relationship: "direct" | "core" | "supporting" | "contextual";
  }>;
  orientation: AxisVector;
  axisExplanations: Record<keyof AxisVector, string>;
  orientationProvenance: "authored" | "concept-derived-reviewed" | "legacy-provisional";
  reviewStatus: "proposed" | "reviewed" | "approved";
}

interface PersonalHatState {
  principalId: string;
  hatId: string;
  proficiency: "awareness" | "working" | "practised" | "advanced" | "specialist" | "expert";
  attainedProfile: AxisVector;
  confidence: "self-attested" | "claim-supported" | "evidence-supported" | "credential-verified" | "externally-recognised";
  currency: number;
  appliedEventIds: string[];
  lastReviewedAt: string;
}

interface WorkContributionAssessment {
  workId: string;
  relevantHatIds: string[];
  demonstratedAxes: Partial<AxisVector>;
  responsibility: number;
  complexity: number;
  novelty: number;
  verification: number;
  claimIds: string[];
  evidenceIds: string[];
  status: "proposed" | "confirmed" | "rejected";
}

interface CapabilityEvent {
  eventId: string;
  type: "work-completed" | "credential-earned" | "award-received" | "training-completed" | "publication" | "validated-outcome" | "practice" | "manual-assessment";
  occurredAt: string;
  relevantHatIds: string[];
  conceptSlugs: string[];
  axisContributions: Partial<AxisVector>;
  responsibility: number;
  complexity: number;
  verification: number;
  novelty: number;
  recency: number;
  sourceClaimIds: string[];
  evidenceIds: string[];
  status: "proposed" | "confirmed" | "rejected";
}
```

## Later progression rule

An event may be proposed automatically but must be confirmed before application. Its contribution will be deterministic, provenance-bearing and bounded by diminishing returns:

`delta = assessed contribution × responsibility × complexity × verification × novelty × recency × remaining headroom`.

Equivalent repeated evidence must be detected and capped. Missing Evidence lowers confidence; it does not erase a historically confirmed capability. An event can strengthen only explicitly relevant Hats and cannot create Service or Work semantic eligibility.

## Public visual contract during migration

- Stable tile/outline colour identifies the selected Hat layer.
- A small marker describes contextual contribution only as part of the **current visual model**.
- The filled polygon shows the combined legacy visual profile.
- Fine outlines show individual selected-Hat legacy profiles.
- Exact and near ties are balanced/co-dominant; fixed axis order is never public meaning.

Future drawer modes are deliberately separate: **This Hat**, **My capability**, and **Current stack**.

