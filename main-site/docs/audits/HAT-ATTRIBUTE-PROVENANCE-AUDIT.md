# Hat attribute provenance audit

## Finding

The six-axis Hat profiles are deterministic but are not canonical Hat attributes.

| Fact | Result |
|---|---:|
| Hat records | 105 |
| Individually authored vectors | 0 |
| Stored profile-provenance fields | 0 |
| Stored per-axis explanations | 0 |
| Runtime keyword-derived vectors | 105 |
| Unique exact vectors | 105 |
| Exact duplicate vector groups | 0 |
| Near-duplicate pairs (Euclidean distance ≤ 0.35) | 44 |

Every vector is reconstructed from mutable Hat names, types, categories, descriptions, overviews and tags. Editing prose can therefore change the polygon without an explicit semantic-profile review.

## Current calculation

For each axis, the runtime scans a fixed keyword list. Core, adjacent and meta tags contribute `1.0`, `0.6` and `0.3`; a prose hit contributes `0.8`. No hit receives a fallback evidence value of `0.08`.

The final axis is:

```text
(semantic evidence × 0.76 + general Hat weight × 0.24) × 10
```

General Hat weight is:

```text
base × 0.50 + experience × 0.30 + rarity × 0.20
```

The 24% constant was introduced in the early visual model as a common baseline/cushion. It currently alters profile construction itself, not only presentation. It makes base, experience and rarity reshape all six orientation axes equally.

The audit script reports both the current vector and the vector produced by renormalising semantic evidence to 100%, plus the per-axis delta:

```bash
npm run hats:audit-attributes
```

### Requested samples

| Hat | Legacy vector | Without 24% general weight | Delta caused by blend |
|---|---|---|---|
| Operations Engineer | 7.940 / 7.940 / 7.940 / 7.940 / 7.940 / 2.468 | 10 / 10 / 10 / 10 / 10 / 0.8 | -2.060 / -2.060 / -2.060 / -2.060 / -2.060 / +1.668 |
| Data Engineer | 8.173 / 8.173 / 8.173 / 2.701 / 6.273 / 2.701 | 10 / 10 / 10 / 0.8 / 7.5 / 0.8 | -1.827 / -1.827 / -1.827 / +1.901 / -1.227 / +1.901 |
| Web Design Engineer | 2.324 / 7.796 / 2.324 / 2.324 / 2.324 / 2.324 | 0.8 / 10 / 0.8 / 0.8 / 0.8 / 0.8 | +1.524 / -2.204 / +1.524 / +1.524 / +1.524 / +1.524 |

Removing the blend does not make the vectors canonical. It reveals that the keyword evidence is itself coarse and frequently saturates at `10`. The replacement must not merely delete `0.24` and bless the remainder.

## Distribution

Most frequent exact axis values include:

| Value | Occurrences |
|---:|---:|
| 8.060 | 16 |
| 8.072 | 14 |
| 2.588 | 13 |
| 7.940 | 11 |
| 2.516 | 11 |
| 8.120 | 10 |
| 2.600 | 10 |
| 2.394 | 10 |

Family axis means:

| Family | Hats | Depth | Creativity | Scale | Interaction | Structure | Influence |
|---|---:|---:|---:|---:|---:|---:|---:|
| Creative | 42 | 6.129 | 8.102 | 5.323 | 5.649 | 3.842 | 3.760 |
| Design | 9 | 6.278 | 8.046 | 5.006 | 3.733 | 3.311 | 4.914 |
| Engineering | 54 | 7.994 | 5.597 | 6.000 | 4.982 | 5.012 | 3.165 |

Per-axis population variance:

| Depth | Creativity | Scale | Interaction | Structure | Influence |
|---:|---:|---:|---:|---:|---:|
| 4.424 | 5.288 | 7.512 | 7.471 | 6.343 | 4.679 |

## The `82 / 80 / 80` bars

The Registry family percentage was the arithmetic mean of general Hat weight:

```text
Creative     42 Hats → 0.819666… → 82%
Design        9 Hats → 0.795555… → 80%
Engineering  54 Hats → 0.800222… → 80%
```

It was not capability strength, population, profile completion, evidence, proficiency or attribute orientation. The bars have been removed. The family headings retain honest Hat counts.

## Consumer trace and quarantine

| Consumer | Current role | Safety decision |
|---|---|---|
| Individual polygon | Visual shape | Retained as legacy visualisation |
| Combined polygon | `78%` mean + `22%` axis maximum | Retained as legacy visualisation |
| Principal seven visible layers | Marginal profile distance | Visual explanation only; not capability truth |
| Contextual tile colour | Intrinsic/stack/distinctive formula | Legacy visual state; must not be described as verified dominance |
| Drawer interpretation | Public “led by” wording | Defective for tied maxima; redesign required |
| Related Hat ranking | Previously used gap/distinctiveness | Quarantined; declared relationships only |
| Service capability admission | Tiered semantic coverage | Does not use six-axis profile |
| Service capability ordering | Semantic coverage/module fit | Does not use six-axis profile |
| Work admission/scoring | Claims and semantic signatures | Does not use six-axis profile |
| Provenance | Confirmed claims/evidence links | Does not use six-axis profile |

The fixed `PROFILE_AXES` order remains a deterministic tie-break for rendering, but it must not be presented as semantic dominance. Operations Engineer is five-way balanced; Operations + Data is co-led by Depth, Creativity and Scale.

## Replacement model

### `HatDefinition`

Universal capability meaning:

```ts
interface HatDefinition {
  hatId: string;
  title: string;
  family: "creative" | "design" | "engineering";
  coverage: HatConceptCoverage[];
  orientation: HatAxisVector;
  orientationProvenance: "individually-authored" | "concept-derived" | "pending-review";
  axisExplanations: Record<ProfileAxis, string>;
}
```

### `PersonalHatAttainment`

Mike Gold’s evidenced relationship to that capability:

```ts
interface PersonalHatAttainment {
  principalId: string;
  hatId: string;
  proficiency: "awareness" | "working" | "practised" | "advanced" | "specialist" | "expert";
  confidence: "low" | "medium" | "high" | "verified";
  currencyReviewedAt?: string;
  credentialIds: string[];
  recognitionIds: string[];
  confirmedWorkClaimIds: string[];
  evidenceIds: string[];
  demonstratedAxisModifiers: Partial<HatAxisVector>;
}
```

`CredentialRecord` and `RecognitionRecord` remain separate authored facts. A doctorate, certificate or award may strengthen personal proficiency, confidence or explicitly assessed demonstrated dimensions. It never mutates the universal Hat definition and never admits an irrelevant Hat into an enquiry.

## Three sample ledger interpretations

### Operations Engineer

- Canonical coverage: not yet fully authored for orientation purposes.
- Legacy visual vector: `7.940 / 7.940 / 7.940 / 7.940 / 7.940 / 2.468`.
- Honest interpretation: five-axis balance created by keyword saturation, not five independently verified equal strengths.
- Personal proficiency: not modelled.
- Credentials and recognition: not modelled.
- Confirmed claims: supporting assignment exists in the NFL field-communications vertical slice.
- Review required: author semantic orientation and axis explanations independently from that Work claim.

### Data Engineer

- Legacy visual vector: `8.173 / 8.173 / 8.173 / 2.701 / 6.273 / 2.701`.
- The three-way maximum is a keyword/template effect and must be described as co-led if shown.
- Personal proficiency, credentials and recognition: not modelled.
- Confirmed Work claims: none in the current confirmed vertical slice.
- Review required: distinguish universal data-engineering orientation from Mike’s attained and evidenced proficiency.

### Web Design Engineer

- Tiered semantic coverage exists and is the source of enquiry eligibility.
- Legacy visual vector: `2.324 / 7.796 / 2.324 / 2.324 / 2.324 / 2.324`.
- Personal proficiency, awards and credentials: not modelled.
- A future web-design award should update recognition and demonstrated attainment, not the universal Web Design Engineer definition.
- Review required: author orientation from canonical concepts and explain each axis.

## Migration

1. Freeze current vectors as `runtime-keyword-derived-legacy`.
2. Author and validate concept-to-axis orientations with explanations and provenance.
3. Derive proposed Hat orientation from tiered coverage for review.
4. Approve each Hat orientation; do not infer personal proficiency from the same vector.
5. Add personal attainment, credentials and recognition as separate records.
6. Replace public numeric precision with qualitative/traceable descriptions.
7. Restore attribute-based secondary ranking only after canonical provenance and regression review.

The generated current-state ledger is at `docs/generated/HAT-CAPABILITY-LEDGER.md`; its CSV companion is `generated/hat-capability-ledger.csv`.
