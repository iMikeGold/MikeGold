# Semantic Vocabulary Candidate Crawler

Status: design only. This crawler must never mutate canonical knowledge.

## Inputs

- canonical Hat definitions and tiered coverage;
- Work Contribution titles, summaries and confirmed claims;
- Service modules and requirement concepts;
- Project descriptions;
- the maintained query acceptance matrix;
- existing concept phrases and lexical metadata;
- optional controlled external dictionaries, recorded with licence/source provenance.

## Candidate output

Each finding enters a review queue:

```ts
interface VocabularyCandidate {
  candidateId: string;
  phrase: string;
  proposedRelationship:
    | "ALIAS_OF"
    | "MISSPELLING_OF"
    | "ABBREVIATION_OF"
    | "PARENT_OF"
    | "CHILD_OF"
    | "PART_OF"
    | "REQUIRES"
    | "USED_IN"
    | "OVERLAPS_WITH"
    | "CONTRASTS_WITH"
    | "AMBIGUOUS_SENSE";
  proposedConceptSlug?: string;
  sourceLocations: string[];
  examples: string[];
  collisionConceptSlugs: string[];
  confidence: number;
  rationale: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
}
```

## Candidate analyses

- unmapped repeated phrases;
- likely spelling variants and abbreviations;
- phrase collisions and incompatible senses;
- concepts with duplicate definitions;
- orphan concepts with no module, Hat or confirmed Work consumer;
- Hats with no direct/core structured coverage;
- confirmed claims containing unresolved terminology;
- test-query vocabulary with no reusable canonical mapping.

## Non-authority boundary

The crawler cannot:

- create or edit canonical concepts;
- activate or change Service modules;
- author Hat coverage;
- admit or score Work;
- change a Work claim;
- change a personal capability state or polygon value.

Approval is a separate, explicit record operation. `PART_OF`, `USED_IN` and `OVERLAPS_WITH` candidates default to `non-activating`; no review action may silently convert them into lexical aliases.

## Seed strategy

The vocabulary is seeded across service objects, activities, outcomes, environments/constraints, Hats, Work claims and real user language. Hat titles are one input, not the root ontology.

## Acceptance fixtures

- `PA` remains ambiguous until audio/event context supports public-address.
- `live` binds to its target before choosing operational state or live environment.
- `checkout-system PART_OF ecommerce-storefront` never expands into the whole storefront.
- `product-catalogue PART_OF ecommerce-storefront` never implies payment.
- a phrase collision between physical and digital `storefront` must be disambiguated.
- a candidate cannot affect production analysis until explicitly approved and the canonical knowledge hash is regenerated.

