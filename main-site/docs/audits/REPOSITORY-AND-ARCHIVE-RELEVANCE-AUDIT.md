# Repository and archive-relevance audit

## Work admission defect

The lower-tier retrieval path previously unioned:

```text
Work candidates for matched concepts
+ Work candidates connected to selected Hats
```

It then admitted a candidate when either semantic system score or selected-Hat score crossed its threshold. This made a Hat relationship behave as proof.

The corrected invariant is:

```text
contribution-level semantic/context admission
→ optional Hat/capability boost
→ provenance tier
```

If base admission is zero, Hat, capability and attribute boosts are zero and the Work is excluded. Internal `admissionTrace` now records candidate source, base score, matching concepts, boosts and provenance. It is not included in the explicit public DTO.

Regression cases prohibit 2XU, BambooGraph and Bonsai Tree of Life for audio-over-IP playback, and prohibit Bristow/2XU for live media systems without matching claims.

## Five-query private trace

Run with:

```bash
npm run services:trace-admission
```

The trace imports the production analyser, remains server/test-only and is omitted from the public mapper.

### `field comms live sport`

- Confirmed matching claims: 2.
- Admitted Work Contributions: 2.
- Projects represented: Philadelphia Eagles and Houston Texans.
- Both are admitted by `field-communications` at base score `36`.
- `live-sport` adds an environment boost only after admission.
- Confirmed Hat assignments and Evidence add later boosts.

### `build over ip audio playback system`

- Interpreted: physical playback system + audio medium + build activity.
- Missing: a canonical IP/networked-media interpretation (`ip` and `over` remain unresolved).
- Work returned: 0.
- 2XU, BambooGraph and Bonsai are excluded despite selected-Hat links because base admission is zero.
- Classification: missing semantic concept/phrase composition plus missing contribution claims for any genuinely relevant archive Work; not permission to broaden retrieval.

### `live media system`

- Interpreted: media system + operational state.
- Work returned: 0.
- Bristow and 2XU are excluded because neither has an admitted media-system claim.
- Classification: useful honest capability exploration with an archive-claim gap.

### `complex product design language interpretation`

- Only `design-activity` resolves.
- `complex`, `product`, `language` and `interpretation` remain unresolved.
- Seven generic derived archive candidates tie at base score `36`.
- Classification: missing reusable semantic concepts/composition and over-broad derived activity admission. The archive should not be tuned until the interpreter can express product definition, meaning, visual/identity language and interpretation.

### `camera operator`

- No concepts, module, capability or Work resolve.
- Classification: missing role/domain semantic records, missing tiered Hat coverage and missing confirmed camera/multicamera contribution claims.
- This is not a clarification problem and must not be repaired with a complete-query conditional.

## NFL index regression found by the quarantine

The query `Primary and backup communications paths with audio routed to transmission` initially admitted only the Philadelphia broadcast contribution. The confirmed field claims existed, but their concept slugs were absent from the generated `concept-to-work` index.

Index generation now unions confirmed claim concepts into each Work semantic signature before constructing the candidate index. The result is:

```text
confirmed matching claims → contribution candidates
→ contribution-level admission and scoring
→ Project grouping only during public projection
```

The 57-query matrix again proves at least two responsibility-bearing NFL contributions for all five positive queries without restoring Hat-only admission.

## Record-layer map

| Layer | Approximate records | Classification |
|---|---:|---|
| `records/hats` | 105 | Canonical authored Hat records |
| `records/projects` | 46 | Canonical authored Project records |
| `records/work` | 69 | Canonical authored Work Contribution records |
| `records/evidence` | 177 | Canonical authored Evidence records |
| `records/relationships` | 325 | Legacy one-edge-per-file canonical/compatibility layer |
| `records/claims` | 1 dataset / 3 confirmed claims | New canonical claim vertical slice |
| `records/concepts` | 8+ datasets | Canonical knowledge, schemas/manifests and policies |
| `records/generated/service-engine` | generated | Deterministic private retrieval indexes |
| `src/system/generated` | generated | Public/internal TypeScript projections |

The relationship filenames encode mutable display facts—project titles, Work titles, Hat names and evidence paths—but record IDs and references inside the files are already UUID/slug based. Filenames are therefore operational baggage, not the only identity boundary. Do not mass-rename until loaders are migrated to a consolidated relationship dataset.

## Proposed neutral hierarchy

```text
WorkContext / BodyOfWork
  → Project
    → WorkContribution
      → Claim
        → EvidenceLink
          → Evidence
```

`WorkContext` supports employment, client engagement, commission, campaign, self-directed initiative, product programme, brand programme, event engagement and research programme.

Client, brand, commissioning market, delivery location, event location and title become editable fields. Opaque stable IDs must not embed those facts.

## Evidence role

Evidence links require explicit roles:

- direct proof
- process evidence
- result evidence
- supporting context
- presentation media
- historical reference
- documentation pending

Evidence strengthens a declared claim. Filenames and media presence never infer unrelated capability.

## Migration order

1. Preserve canonical authored records and deterministic generated indexes.
2. Add `WorkContext` without changing public routes.
3. Progressively author contribution-level claims for high-query domains.
4. Move relationship edges into validated consolidated datasets keyed by stable IDs.
5. Keep unmigrated prose matches as low-confidence migration candidates.
6. Generate compatibility projections until all consumers use the new graph.
7. Delete legacy edge files only after reference parity, hash stability and route checks.

No destructive record consolidation is approved by this audit.
