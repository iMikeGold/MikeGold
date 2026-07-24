import "server-only";

import type { PublicHat } from "@/system/hats/hat.types";
import type { PublicWorkProjection } from "@/system/work/work.types";
import coreConcepts from "../../../records/concepts/semantic-concepts-core.json";
import conceptExtensions from "../../../records/concepts/semantic-concept-extensions.json";
import workIndexData from "../../../records/generated/service-engine/work-semantic-index.json";
import hatIndexData from "../../../records/generated/service-engine/hat-semantic-index.json";
import conceptToWorkData from "../../../records/generated/service-engine/concept-to-work-index.json";
import hatToWorkData from "../../../records/generated/service-engine/hat-to-work-index.json";

export type ConceptKind =
  | "object" | "activity" | "outcome" | "environment" | "constraint"
  | "quality" | "deliverable" | "system-layer" | "medium" | "workflow";

export type SemanticConcept = {
  slug: string;
  label: string;
  definition: string;
  kind: ConceptKind;
  phrases: string[];
  lexicalEntries?: Array<{ phrase: string; relationship: "ALIAS_OF" | "MISSPELLING_OF" | "ABBREVIATION_OF" }>;
  typedRelationships?: Array<{
    type: "PARENT_OF" | "CHILD_OF" | "PART_OF" | "REQUIRES" | "USED_IN" | "OVERLAPS_WITH" | "CONTRASTS_WITH" | "AMBIGUOUS_SENSE";
    targetConceptSlug: string;
    traversal: "activating" | "non-activating" | "disambiguation-only";
  }>;
  related?: string[];
  broaderConceptSlugs?: string[];
  narrowerConceptSlugs?: string[];
  breadth?: "specific" | "category" | "umbrella";
  ambiguityPolicy?: { requiresResolution: boolean; promptMode?: "choose-branch" | "request-object" | "request-outcome" };
  modifierPolicy?: { canModifyKinds?: ConceptKind[]; requiresTarget?: boolean };
  senseBindings?: Array<{ targetConceptSlugs: string[]; resolvedConceptSlugs: string[] }>;
  commonRequirementConceptSlugs?: string[];
  possibleModuleSlugs?: string[];
  language?: { scope?: string; outcome?: string; question?: string };
};

export type SemanticSignature = {
  concepts: string[];
  source: "authored" | "derived";
};

const mergedConcepts = new Map<string, SemanticConcept>();
for (const record of [...coreConcepts.concepts, ...conceptExtensions.concepts]) {
  if (mergedConcepts.has(record.slug)) throw new Error(`Duplicate semantic concept slug: ${record.slug}`);
  const related = "relatedConceptSlugs" in record ? record.relatedConceptSlugs : undefined;
  mergedConcepts.set(record.slug, { ...record, ...(related ? { related } : {}) } as SemanticConcept);
}
export const SEMANTIC_CONCEPTS = [...mergedConcepts.values()].sort((a, b) => a.slug.localeCompare(b.slug));
export const SEMANTIC_KNOWLEDGE_VERSION = `${coreConcepts.knowledgeVersion}/${conceptExtensions.knowledgeVersion}`;

export const CONCEPT_BY_SLUG = new Map(SEMANTIC_CONCEPTS.map((item) => [item.slug, item]));

const indexedWork = workIndexData.work as Record<string, { projectSlug: string; concepts: string[]; source: "authored" | "derived" }>;
type CoverageRelationship = "direct" | "core" | "supporting" | "contextual";
const indexedHats = hatIndexData.hats as Record<string, {
  coverage: Record<CoverageRelationship, string[]>;
  source: string;
}>;
const conceptToWork = conceptToWorkData.concepts as Record<string, string[]>;
const hatToWork = hatToWorkData.hats as Record<string, string[]>;
export const tokeniseSemanticInput = (value: string) =>
  value.toLowerCase().match(/[a-z0-9]+/g) ?? [];

function withinOneEdit(left: string, right: string) {
  if (left === right) return true;
  if (Math.abs(left.length - right.length) > 1) return false;
  let leftIndex = 0;
  let rightIndex = 0;
  let edits = 0;
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] === right[rightIndex]) {
      leftIndex++;
      rightIndex++;
      continue;
    }
    if (++edits > 1) return false;
    if (left.length > right.length) leftIndex++;
    else if (right.length > left.length) rightIndex++;
    else if (
      left[leftIndex] === right[rightIndex + 1]
      && left[leftIndex + 1] === right[rightIndex]
    ) {
      leftIndex += 2;
      rightIndex += 2;
    } else {
      leftIndex++;
      rightIndex++;
    }
  }
  return edits + Number(leftIndex < left.length || rightIndex < right.length) <= 1;
}

export function expandConcepts(slugs: Iterable<string>, depth = 1): Set<string> {
  const expanded = new Set(slugs);
  let frontier = [...expanded];
  for (let step = 0; step < depth; step++) {
    const next = frontier.flatMap((slug) => {
      const concept = CONCEPT_BY_SLUG.get(slug);
      return [...(concept?.related ?? []), ...(concept?.broaderConceptSlugs ?? [])].sort();
    }).filter((slug) => !expanded.has(slug));
    next.forEach((slug) => expanded.add(slug));
    frontier = next;
  }
  return expanded;
}

export function expandBroaderConcepts(slugs: Iterable<string>): Set<string> {
  const expanded = new Set(slugs);
  const frontier = [...expanded];
  while (frontier.length) {
    const slug = frontier.shift()!;
    for (const broader of [...(CONCEPT_BY_SLUG.get(slug)?.broaderConceptSlugs ?? [])].sort()) {
      if (expanded.has(broader)) continue;
      expanded.add(broader);
      frontier.push(broader);
    }
  }
  return expanded;
}

export function interpretConcepts(input: string) {
  const tokens = tokeniseSemanticInput(input);
  const candidates = SEMANTIC_CONCEPTS.flatMap((item) =>
    item.phrases.flatMap((phrase) => {
      const phraseTokens = tokeniseSemanticInput(phrase);
      if (!phraseTokens.length || phraseTokens.length > tokens.length) return [];
      const matches: Array<{ start: number; end: number; exact: boolean; fuzzy: boolean }> = [];
      for (let start = 0; start <= tokens.length - phraseTokens.length; start++) {
        const querySlice = tokens.slice(start, start + phraseTokens.length);
        const exact = querySlice.every((token, index) => token === phraseTokens[index]);
        const finalToken = querySlice.at(-1) ?? "";
        const prefix = !exact
          && finalToken.length >= 3
          && querySlice.slice(0, -1).every((token, index) => token === phraseTokens[index])
          && (phraseTokens.at(-1)?.startsWith(finalToken) ?? false);
        const typo = !exact && !prefix
          && finalToken.length >= 5
          && querySlice.slice(0, -1).every((token, index) => token === phraseTokens[index])
          && withinOneEdit(finalToken, phraseTokens.at(-1) ?? "");
        if (exact || prefix || typo) matches.push({ start, end: start + phraseTokens.length, exact, fuzzy: prefix || typo });
      }
      return matches.map((match) => ({ item, phrase, ...match, length: phraseTokens.length }));
    }),
  ).sort((left, right) =>
    right.length - left.length
    || Number(right.exact) - Number(left.exact)
    || (left.item.breadth === "umbrella" ? 1 : 0) - (right.item.breadth === "umbrella" ? 1 : 0)
    || left.item.slug.localeCompare(right.item.slug),
  );
  const consumed = new Set<number>();
  const accepted: typeof candidates = [];
  for (const candidate of candidates) {
    const span = Array.from({ length: candidate.end - candidate.start }, (_, index) => candidate.start + index);
    if (span.some((index) => consumed.has(index))) continue;
    accepted.push(candidate);
    span.forEach((index) => consumed.add(index));
  }
  const direct = accepted.map(({ item, phrase, start, end, exact, fuzzy }) => ({
    item,
    matches: [tokens.slice(start, end).join(" ")],
    canonicalPhrase: phrase,
    span: { start, end },
    confidence: exact ? 0.98 : fuzzy ? 0.78 : 0.7,
  }));
  return {
    tokens,
    consumedTokenIndexes: consumed,
    direct,
    expanded: expandConcepts(direct.map(({ item }) => item.slug)),
  };
}

export function workSemanticSignature(work: PublicWorkProjection): SemanticSignature {
  const signature = indexedWork[work.slug];
  if (!signature) throw new Error(`Work ${work.slug} is missing from the generated Service Engine index.`);
  return { concepts: signature.concepts, source: signature.source };
}

export function hatSemanticConcepts(hat: PublicHat): Set<string> {
  const signature = indexedHats[hat.slug];
  if (!signature) throw new Error(`Hat ${hat.slug} is missing from the generated Service Engine index.`);
  return new Set(Object.values(signature.coverage).flat());
}

export const hatSemanticSource = (hatSlug: string) => indexedHats[hatSlug]?.source ?? "missing";
export const hatSemanticCoverage = (hatSlug: string) => {
  const coverage = indexedHats[hatSlug]?.coverage;
  if (!coverage) return new Map<string, CoverageRelationship>();
  return new Map(
    (["contextual", "supporting", "core", "direct"] as CoverageRelationship[])
      .flatMap((relationship) => coverage[relationship].map((slug) => [slug, relationship] as const)),
  );
};

export const workCandidatesForConcepts = (slugs: Iterable<string>) =>
  new Set([...slugs].flatMap((slug) => conceptToWork[slug] ?? []));

export const workCandidatesForHats = (slugs: Iterable<string>) =>
  new Set([...slugs].flatMap((slug) => hatToWork[slug] ?? []));
