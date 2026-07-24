import "server-only";

import type { PublicHat } from "@/system/hats/hat.types";
import type { PublicWorkProjection } from "@/system/work/work.types";
import { claimsForWork, evidenceForClaim, type WorkClaim } from "@/system/services/claim-provenance";
import {
  CONCEPT_BY_SLUG, SEMANTIC_KNOWLEDGE_VERSION, expandBroaderConcepts, expandConcepts, hatSemanticCoverage, hatSemanticSource, interpretConcepts,
  tokeniseSemanticInput, workCandidatesForConcepts, workCandidatesForHats, workSemanticSignature,
} from "@/system/services/semantic-ontology";
import moduleKnowledge from "../../../records/concepts/service-modules.json";
import knowledgeManifest from "../../../records/concepts/knowledge-manifest.json";
import capabilityCoveragePolicy from "../../../records/concepts/capability-coverage-policy.json";

type ModuleStatus = "required" | "recommended" | "dependency";
type PresentationClass =
  | "demonstrated-capability" | "previous-application" | "relevant-experience"
  | "connected-work" | "capability-connected-work" | "connected-system-experience"
  | "comparable-context" | "supporting-work" | "archive-connection";
type ModuleDefinition = {
  id: string; name: string; activation: string[]; required: string[]; supporting: string[];
  activationCompositions?: Array<{ allOf: string[] }>;
  outcomes: string[]; deliverables: string[]; dependencies?: string[];
  stages: string[]; questions: string[];
};
type HatResolution = {
  slug: string; role: "lead" | "core" | "supporting" | "recommended";
  score: number; selected: true; evidenced: boolean; inferred: boolean;
  requirementSlugs: string[]; claimIds: string[]; reasons: string[];
};

export type ServiceConfiguration = {
  title: string; summary: string;
  queryMode: "capability-role-lookup" | "service-object-exploration" | "task-deliverable-request" | "problem-outcome-request" | "environment-refinement" | "archive-experience-lookup";
  publicStatus: "direct-match" | "broad-match" | "exploratory-route" | "provisional-route" | "clarification-required";
  interpretedIntent: {
    concepts: Array<{ slug: string; label: string; kind: string; sourcePhrase: string; confidence: number; alternatives: string[] }>;
    unresolvedTerms: string[]; ambiguities: string[];
  };
  modules: Array<{ id: string; name: string; reason: string; status: ModuleStatus; deliverables: string[] }>;
  scope: { objective: string; includedSystems: string[]; outcomes: string[]; assumptions: string[]; exclusions: string[]; questions: string[] };
  deliveryPhases: Array<{ name: string; purpose: string; moduleIds: string[] }>;
  capabilityRequirements: Array<{ conceptSlug: string; role: "required" | "recommended"; selectedHatSlugs: string[]; evidencedHatSlugs: string[]; inferredHatSlugs: string[] }>;
  capabilityConfiguration: HatResolution[];
  relevantWork: Array<{
    workSlug: string; projectSlug: string; presentationClass: PresentationClass;
    generatedSummary: string; reasons: string[]; score: number;
    matchedClaimIds: string[]; matchedConcepts: string[]; matchedHatSlugs: string[];
    scoreComponents: { responsibility: number; environment: number; capability: number; evidence: number };
    evidenceCoverage: number; publicEvidenceCoverage: number; relationshipSource: "confirmed-claims" | "derived-candidate";
    admissionTrace: {
      candidateSource: "confirmed-claim" | "derived-semantic-signature";
      baseAdmissionScore: number;
      admittedBy: string[];
      boosts: Array<{ source: "hat-relationship" | "environment" | "quality" | "evidence"; score: number }>;
    };
  }>;
  confidence: { level: "insufficient" | "provisional" | "strong"; explanation: string };
  diagnostics: {
    recognisedPhrases: string[]; activatedModules: string[]; addedDependencies: string[];
    unresolvedTerms: string[]; modifierBindings: string[]; rawQuery: string; normalisedQuery: string;
    analysisId: string; analysisHash: string; engineVersion: string; knowledgeVersion: string; knowledgeHash: string;
  };
};

const moduleRecords = [...(moduleKnowledge.modules as ModuleDefinition[])].sort((a, b) => a.id.localeCompare(b.id));
const moduleById = new Map(moduleRecords.map((module) => [module.id, module]));
const ENGINE_VERSION = "semantic-service-engine/2.5";
const KNOWLEDGE_VERSION = `${SEMANTIC_KNOWLEDGE_VERSION}/${moduleKnowledge.knowledgeVersion}`;
const CAPABILITY_COVERAGE_WEIGHT = capabilityCoveragePolicy.weights;
const canonicalise = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalise).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  if (value && typeof value === "object") return Object.fromEntries(
    Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalise(item)]),
  );
  return value;
};
const stableHash = (value: unknown) => queryHash(JSON.stringify(canonicalise(value)));
const KNOWLEDGE_HASH = knowledgeManifest.canonicalKnowledgeHash;

const FILLER = new Set(["a", "an", "and", "for", "i", "need", "the", "to", "want", "with", "please", "some"]);
const words = (value: string) => tokeniseSemanticInput(value).filter((item) => !FILLER.has(item));
const labels = (slugs: Iterable<string>) => [...slugs].map((slug) => CONCEPT_BY_SLUG.get(slug)?.label ?? slug);
const presentationLabel: Record<PresentationClass, string> = {
  "demonstrated-capability": "Demonstrated capability", "previous-application": "Previous application",
  "relevant-experience": "Relevant experience", "connected-work": "Connected work",
  "capability-connected-work": "Capability-connected work",
  "connected-system-experience": "Connected system experience",
  "comparable-context": "Comparable delivery context", "supporting-work": "Supporting work",
  "archive-connection": "Archive connection",
};

function classifyEvidence(claims: WorkClaim[]) {
  const links = claims.flatMap((claim) => evidenceForClaim(claim.id));
  const publicLinks = links.filter((link) => link.publicVisibility);
  const maximumRole = (items: typeof links) => items.some((item) => item.supportRole === "direct") ? "direct"
    : items.some((item) => item.supportRole === "corroborating") ? "corroborating"
      : items.some((item) => item.supportRole === "contextual") ? "contextual" : "illustrative";
  return {
    role: maximumRole(links),
    coverage: links.length ? links.reduce((sum, item) => sum + item.strength, 0) / claims.length : 0,
    publicCoverage: publicLinks.length ? publicLinks.reduce((sum, item) => sum + item.strength, 0) / claims.length : 0,
  };
}

export function analyseServiceIntent(hats: PublicHat[], work: PublicWorkProjection[], query: string): ServiceConfiguration {
  const interpretation = interpretConcepts(query);
  const lexicalConcepts = interpretation.direct.map(({ item }) => item);
  const directSlugs = new Set(interpretation.direct.map(({ item }) => item.slug));
  const senseBindings = lexicalConcepts.flatMap((modifier) => {
    if (!modifier.senseBindings?.length) return [];
    const candidateTargets = lexicalConcepts.filter((candidate) =>
      candidate.slug !== modifier.slug
      && (modifier.modifierPolicy?.canModifyKinds ?? []).includes(candidate.kind),
    );
    return candidateTargets.flatMap((target) => {
      const targetGraph = expandConcepts([target.slug], 2);
      const binding = modifier.senseBindings?.find((candidate) =>
        candidate.targetConceptSlugs.some((slug) => targetGraph.has(slug)),
      );
      return binding ? [{ modifier, target, resolvedConceptSlugs: binding.resolvedConceptSlugs }] : [];
    });
  });
  for (const binding of senseBindings) {
    if (!binding.resolvedConceptSlugs.includes(binding.modifier.slug)) directSlugs.delete(binding.modifier.slug);
    binding.resolvedConceptSlugs.forEach((slug) => directSlugs.add(slug));
  }
  const replacedModifiers = new Set(senseBindings.filter((binding) => !binding.resolvedConceptSlugs.includes(binding.modifier.slug)).map((binding) => binding.modifier.slug));
  const directConcepts = [
    ...lexicalConcepts.filter((concept) => !replacedModifiers.has(concept.slug)),
    ...senseBindings.flatMap((binding) => binding.resolvedConceptSlugs).map((slug) => CONCEPT_BY_SLUG.get(slug)).filter((concept): concept is NonNullable<typeof concept> => Boolean(concept)),
  ].filter((concept, index, concepts) => concepts.findIndex((candidate) => candidate.slug === concept.slug) === index);
  const sourceByConcept = new Map(interpretation.direct.map(({ item, matches, confidence }) => [
    item.slug,
    { sourcePhrase: matches[0], confidence },
  ]));
  for (const binding of senseBindings) {
    const source = sourceByConcept.get(binding.modifier.slug);
    if (source) binding.resolvedConceptSlugs.forEach((slug) => sourceByConcept.set(slug, source));
  }
  const expandedIntent = expandConcepts(directSlugs);
  const hasRole = directConcepts.some((item) => item.slug.endsWith("-role"))
    || directSlugs.has("audio-engineering")
    || directSlugs.has("studio-engineering")
    || directSlugs.has("logo-design");
  const hasActivity = directConcepts.some((item) => item.kind === "activity");
  const hasUmbrella = directConcepts.some((item) => item.breadth === "umbrella");
  const queryMode: ServiceConfiguration["queryMode"] = hasRole
    ? "capability-role-lookup"
    : hasActivity
      ? "task-deliverable-request"
      : hasUmbrella
        ? "service-object-exploration"
        : directConcepts.some((item) => item.kind === "outcome")
          ? "problem-outcome-request"
          : directConcepts.some((item) => item.kind === "environment")
            ? "environment-refinement"
            : "archive-experience-lookup";
  const ambiguousConcepts = directConcepts.filter((item) => item.ambiguityPolicy?.requiresResolution);
  const boundModifiers = lexicalConcepts
    .filter((item) => item.kind === "quality" || item.kind === "constraint")
    .map((modifier) => {
      const target = directConcepts.find((candidate) =>
        candidate.slug !== modifier.slug &&
        (modifier.modifierPolicy?.canModifyKinds ?? ["object", "workflow", "activity", "outcome", "system-layer"]).includes(candidate.kind),
      );
      return { modifier, target };
    });
  const moduleHints = new Set([...expandBroaderConcepts(directSlugs)].flatMap((slug) => CONCEPT_BY_SLUG.get(slug)?.possibleModuleSlugs ?? []));
  const hasObjectAnchor = [...directSlugs].some((slug) =>
    ["object", "workflow", "system-layer", "activity"].includes(CONCEPT_BY_SLUG.get(slug)?.kind ?? ""),
  );
  const ranked = moduleRecords.map((module) => {
    const direct = module.activation.filter((slug) => directSlugs.has(slug));
    const compositionMatches = (module.activationCompositions ?? []).filter((composition) =>
      composition.allOf.every((slug) => directSlugs.has(slug)),
    );
    const qualityOnly = direct.length > 0 && direct.every((slug) => CONCEPT_BY_SLUG.get(slug)?.kind === "quality");
    const score = qualityOnly
      ? (hasObjectAnchor ? direct.length * 18 : 0)
      : direct.length * 40 + compositionMatches.length * 45 + (moduleHints.has(module.id) ? 35 : 0);
    return { module, direct, compositionMatches, qualityOnly, score };
  }).filter(({ score }) => score >= 10).sort((a, b) => b.score - a.score);

  const unresolvedTerms = interpretation.tokens
    .filter((token, index) => !interpretation.consumedTokenIndexes.has(index) && !FILLER.has(token) && token !== "is")
    .sort();
  const hasTaskSubject = directConcepts.some((concept) =>
    ["object", "workflow", "system-layer", "outcome", "medium", "deliverable"].includes(concept.kind),
  );
  const activityOnlyUnresolvedTask = queryMode === "task-deliverable-request"
    && hasActivity
    && !hasTaskSubject
    && unresolvedTerms.length > 0;
  if (!directConcepts.length) return {
    title: "Clarify the intended outcome", summary: "The engine has not yet resolved a coherent responsibility and operating context from this description.",
    queryMode,
    publicStatus: "clarification-required",
    interpretedIntent: {
      concepts: directConcepts.map((item) => ({ slug: item.slug, label: item.label, kind: item.kind, sourcePhrase: sourceByConcept.get(item.slug)?.sourcePhrase ?? item.label, confidence: sourceByConcept.get(item.slug)?.confidence ?? 0.92, alternatives: labels(item.related ?? []) })),
      unresolvedTerms, ambiguities: [],
    },
    modules: [], scope: { objective: "", includedSystems: [], outcomes: [], assumptions: [], exclusions: [], questions: ["What must the finished system enable, and where will it operate?"] },
    deliveryPhases: [], capabilityRequirements: [], capabilityConfiguration: [], relevantWork: [],
    confidence: { level: "insufficient", explanation: "No responsibility-bearing concept currently activates a defined delivery route." },
    diagnostics: {
      recognisedPhrases: interpretation.direct.flatMap(({ matches }) => matches).sort(),
      activatedModules: [], addedDependencies: [], unresolvedTerms,
      modifierBindings: [
        ...boundModifiers.filter(({ target }) => target).map(({ modifier, target }) => `${modifier.slug} → ${target!.slug}`),
        ...senseBindings.map(({ modifier, target, resolvedConceptSlugs }) => `${modifier.slug} → ${target.slug} → ${resolvedConceptSlugs.join("+")}`),
      ].sort(),
      rawQuery: query, normalisedQuery: words(query).join(" "), analysisId: queryHash(query),
      analysisHash: stableHash({ query, engineVersion: ENGINE_VERSION, knowledgeHash: KNOWLEDGE_HASH }),
      engineVersion: ENGINE_VERSION, knowledgeVersion: KNOWLEDGE_VERSION, knowledgeHash: KNOWLEDGE_HASH,
    },
  };

  const selected = ranked.filter(({ score }) => score >= Math.max(10, ranked[0].score * 0.25));
  const selectedIds = new Set(selected.map(({ module }) => module.id));
  const addedDependencies: string[] = [];
  for (const { module } of [...selected]) for (const dependencyId of module.dependencies ?? []) {
    if (selectedIds.has(dependencyId)) continue;
    const dependency = moduleById.get(dependencyId);
    if (dependency) { selected.push({ module: dependency, direct: [], compositionMatches: [], qualityOnly: false, score: 1 }); selectedIds.add(dependencyId); addedDependencies.push(dependencyId); }
  }

  const commonRequirements = directConcepts.flatMap((item) => item.commonRequirementConceptSlugs ?? []);
  const directRequirementSlugs = directConcepts
    .filter((item) => !item.slug.endsWith("-role") && !["environment", "quality", "constraint"].includes(item.kind))
    .map((item) => item.slug);
  const requiredSlugs = new Set([
    ...selected.filter(({ score, qualityOnly }) => score > 1 && !qualityOnly).flatMap(({ module }) => module.required),
    ...commonRequirements,
    ...directRequirementSlugs,
  ]);
  const recommendedSlugs = new Set(
    selected
      .flatMap(({ module, qualityOnly }) => [...module.supporting, ...(qualityOnly ? module.required : [])])
      .filter((slug) => !requiredSlugs.has(slug)),
  );
  const directCandidateSlugs = workCandidatesForConcepts(directSlugs);
  const directWork = work.filter((item) => directCandidateSlugs.has(item.slug)).map((item) => {
    const claims = claimsForWork(item.slug);
    const semantic = workSemanticSignature(item);
    const claimConcepts = new Set(claims.flatMap((claim) => claim.conceptSlugs));
    const sourceConcepts = claims.length ? claimConcepts : new Set(semantic.concepts);
    const directMatches = [...directSlugs].filter((slug) => sourceConcepts.has(slug));
    const responsibilityMatches = directMatches.filter((slug) =>
      !["environment", "quality"].includes(CONCEPT_BY_SLUG.get(slug)?.kind ?? "")
      && !slug.endsWith("-role"),
    );
    const environmentMatches = directMatches.filter((slug) => CONCEPT_BY_SLUG.get(slug)?.kind === "environment");
    const qualityMatches = directMatches.filter((slug) => CONCEPT_BY_SLUG.get(slug)?.kind === "quality");
    const matchedClaims = claims.filter((claim) => claim.conceptSlugs.some((slug) => directSlugs.has(slug)));
    const matchedHats = [...new Set(matchedClaims.flatMap((claim) => claim.hatAssignments.map((assignment) => assignment.hatSlug)))];
    const evidence = classifyEvidence(matchedClaims);
    const baseResponsibility = responsibilityMatches.reduce((score, slug) =>
      score + (CONCEPT_BY_SLUG.get(slug)?.kind === "medium" ? 8 : 36), 0);
    const qualityBoost = baseResponsibility ? qualityMatches.length * 8 : 0;
    const responsibility = baseResponsibility + qualityBoost;
    const environment = environmentMatches.length * 10;
    const capability = matchedHats.length ? Math.min(18, matchedHats.length * 3) : 0;
    const evidenceScore = evidence.publicCoverage * 8;
    const score = responsibility + environment + capability + evidenceScore;
    const presentationClass: PresentationClass = !claims.length ? "archive-connection"
      : responsibility >= 50 && evidence.role === "direct" ? "demonstrated-capability"
      : responsibility >= 36 && evidence.role === "corroborating" ? "previous-application"
        : responsibility >= 36 ? "relevant-experience"
          : responsibility > 0 ? "connected-work"
            : environment > 0 ? "comparable-context" : "supporting-work";
    return { item, claims, matchedClaims, directMatches, responsibilityMatches, matchedHats, evidence, baseResponsibility, qualityBoost, responsibility, environment, capability, evidenceScore, score, presentationClass, semantic };
  }).filter((result) => !activityOnlyUnresolvedTask && (result.claims.length
    ? result.responsibilityMatches.length > 0 && result.responsibility >= 8 && result.score >= 16
    : result.responsibilityMatches.length > 0 && result.responsibility >= 8 && (
      result.responsibilityMatches.length >= 2
      || [...directSlugs].filter((slug) => {
        const kind = CONCEPT_BY_SLUG.get(slug)?.kind;
        return !["environment", "quality"].includes(kind ?? "") && !slug.endsWith("-role");
      }).length === 1
    )))
    .sort((a, b) => b.score - a.score || a.item.slug.localeCompare(b.item.slug));

  const matchedClaims = directWork.flatMap((result) => result.matchedClaims);
  const assignmentByHat = new Map<string, { claims: Set<string>; roles: Set<string>; weight: number }>();
  for (const claim of matchedClaims) for (const assignment of claim.hatAssignments) {
    const current = assignmentByHat.get(assignment.hatSlug) ?? { claims: new Set(), roles: new Set(), weight: 0 };
    current.claims.add(claim.id); current.roles.add(assignment.role); current.weight = Math.max(current.weight, assignment.weight);
    assignmentByHat.set(assignment.hatSlug, current);
  }
  const requirements = [...requiredSlugs, ...recommendedSlugs];
  const uncovered = new Set(requiredSlugs);
  const capabilityConfiguration: HatResolution[] = [];
  const candidates = hats.map((hat) => {
    const semanticCoverage = hatSemanticCoverage(hat.slug);
    const coverage = requirements.filter((slug) => ["direct", "core"].includes(semanticCoverage.get(slug) ?? ""));
    const hasCapabilityAdmission = coverage.length > 0;
    const relationshipScore = hasCapabilityAdmission
      ? requirements.reduce((score, slug) => {
        const relationship = semanticCoverage.get(slug);
        return score + (relationship ? CAPABILITY_COVERAGE_WEIGHT[relationship] : 0);
      }, 0)
      : 0;
    const assignment = assignmentByHat.get(hat.slug);
    const directFit = [...directSlugs].filter((slug) =>
      ["direct", "core"].includes(semanticCoverage.get(slug) ?? "") && !slug.endsWith("-role"),
    ).length;
    const directFitPower = [...directSlugs].reduce((score, slug) => {
      const relationship = semanticCoverage.get(slug);
      return score + (relationship && !slug.endsWith("-role") ? CAPABILITY_COVERAGE_WEIGHT[relationship] : 0);
    }, 0);
    const semanticSource = hatSemanticSource(hat.slug);
    return {
      hat,
      coverage,
      assignment,
      directFit,
      semanticSource,
      score: coverage.filter((slug) => requiredSlugs.has(slug)).length * 25
        + coverage.length * 6
        + relationshipScore * 20
        + directFitPower * 80
        + (assignment?.weight ?? 0) * 12
        + (semanticSource === "confirmed" || semanticSource === "authored" ? 50 : 0),
    };
  }).filter(({ coverage }) => coverage.length).sort((a, b) => b.score - a.score || a.hat.name.localeCompare(b.hat.name));
  for (const candidate of candidates) {
    const newlyCovered = candidate.coverage.filter((slug) => uncovered.has(slug));
    const confirmedComplement = candidate.assignment && candidate.coverage.some((slug) => recommendedSlugs.has(slug));
    const roleExploration = queryMode === "capability-role-lookup" && candidate.directFit > 0 && capabilityConfiguration.length < 5;
    if (!newlyCovered.length && !confirmedComplement && !roleExploration) continue;
    const assignedRoles = candidate.assignment?.roles ?? new Set<string>();
    const role: HatResolution["role"] = assignedRoles.has("lead") && newlyCovered.length ? "lead"
      : newlyCovered.length >= 2 || assignedRoles.has("core") ? "core"
        : newlyCovered.length ? "supporting" : "recommended";
    const reasons = [
      ...newlyCovered.map((slug) => `Covers the ${CONCEPT_BY_SLUG.get(slug)?.label.toLowerCase() ?? slug} requirement.`),
      ...candidate.coverage.filter((slug) => recommendedSlugs.has(slug)).slice(0, 1).map((slug) => `Strengthens ${CONCEPT_BY_SLUG.get(slug)?.label.toLowerCase() ?? slug}.`),
      ...(!newlyCovered.length && roleExploration
        ? [`Matches the composed ${directConcepts.filter((item) => !item.slug.endsWith("-role") && item.kind !== "environment").map((item) => item.label.toLowerCase()).join(" and ")} capability.`]
        : []),
    ];
    if (!reasons.length) continue;
    capabilityConfiguration.push({
      slug: candidate.hat.slug, role, score: candidate.score, selected: true,
      evidenced: Boolean(candidate.assignment), inferred: !candidate.assignment,
      requirementSlugs: candidate.coverage, claimIds: [...(candidate.assignment?.claims ?? [])], reasons,
    });
    newlyCovered.forEach((slug) => uncovered.delete(slug));
    if (!uncovered.size && capabilityConfiguration.filter((item) => item.role === "recommended").length >= 1) break;
  }
  const capabilityRequirements = requirements.map((conceptSlug) => {
    const covering = capabilityConfiguration.filter((item) => item.requirementSlugs.includes(conceptSlug));
    return {
      conceptSlug, role: requiredSlugs.has(conceptSlug) ? "required" as const : "recommended" as const,
      selectedHatSlugs: covering.map((item) => item.slug),
      evidencedHatSlugs: covering.filter((item) => item.evidenced).map((item) => item.slug),
      inferredHatSlugs: covering.filter((item) => item.inferred).map((item) => item.slug),
    };
  });
  const directWorkSlugs = new Set(directWork.map((item) => item.item.slug));
  const selectedHatSlugs = new Set(capabilityConfiguration.map((item) => item.slug));
  const lowerTierCandidateSlugs = new Set([
    ...workCandidatesForConcepts(directSlugs),
    ...workCandidatesForHats(selectedHatSlugs),
  ]);
  const lowerTierWork = work
    .filter((item) => lowerTierCandidateSlugs.has(item.slug) && !directWorkSlugs.has(item.slug))
    .map((item) => {
      const matchedHatSlugs = item.appliedHatSlugs.filter((slug) => selectedHatSlugs.has(slug));
      const signature = workSemanticSignature(item);
      const systemMatches = signature.concepts.filter((slug) =>
        directSlugs.has(slug)
        && !["environment", "workflow", "quality"].includes(CONCEPT_BY_SLUG.get(slug)?.kind ?? ""),
      );
      const capabilityScore = matchedHatSlugs.length * 9;
      const systemScore = systemMatches.length * 18;
      return { item, matchedHatSlugs, systemMatches, capabilityScore, systemScore, score: capabilityScore + systemScore };
    })
    // A selected Hat may strengthen an already relevant contribution, but it
    // is never an admission ticket into the historical Work projection.
    .filter((item) => !activityOnlyUnresolvedTask && item.systemScore >= 36)
    .sort((a, b) => b.score - a.score || a.item.slug.localeCompare(b.item.slug))
    .slice(0, 5);

  const conceptLabels = directConcepts.map((item) => item.label);
  const activated = selected.filter(({ score }) => score > 1);
  const level = directSlugs.size >= 3 && activated.length >= 2 ? "strong" : "provisional";
  const summary = `A connected route combining ${conceptLabels.slice(0, 5).join(", ").toLowerCase()}.`;
  const environments = directConcepts.filter((item) => item.kind === "environment");
  return {
    title: activated.slice(0, 2).map(({ module }) => module.name).join(" + ")
      || (queryMode === "capability-role-lookup"
        ? `${directConcepts.filter((item) => !item.slug.endsWith("-role") && item.kind !== "environment").map((item) => item.label).join(" ")} capability match`
        : conceptLabels.slice(0, 2).join(" + ")),
    summary,
    queryMode,
    publicStatus: activityOnlyUnresolvedTask ? "clarification-required"
      : queryMode === "capability-role-lookup" ? "broad-match"
      : queryMode === "service-object-exploration" ? "exploratory-route"
        : ambiguousConcepts.length ? "exploratory-route"
          : activated.length ? "direct-match"
          : "broad-match",
    interpretedIntent: {
      concepts: directConcepts.map((item) => ({ slug: item.slug, label: item.label, kind: item.kind, sourcePhrase: sourceByConcept.get(item.slug)?.sourcePhrase ?? item.label, confidence: sourceByConcept.get(item.slug)?.confidence ?? 0.92, alternatives: labels(item.related ?? []) })),
      unresolvedTerms,
      ambiguities: [
        ...(activityOnlyUnresolvedTask
          ? [`${directConcepts.filter((concept) => concept.kind === "activity").map((concept) => concept.label).join(" and ")} needs a recognised object, outcome or system boundary before historical Work can be matched.`]
          : []),
        ...ambiguousConcepts
          .filter((item) => !(item.narrowerConceptSlugs ?? []).some((slug) => directSlugs.has(slug)))
          .map((item) => item.language?.question ?? `${item.label} is broad; confirm which narrower function is primary.`),
        ...boundModifiers
          .filter(({ modifier, target }) => modifier.modifierPolicy?.requiresTarget && !target)
          .map(({ modifier }) => `${modifier.label} needs an object, activity or outcome to modify.`),
      ],
    },
    modules: selected.map(({ module, direct, compositionMatches, qualityOnly, score }) => ({
      id: module.id, name: module.name, status: score === 1 ? "dependency" : direct.length && !qualityOnly ? "required" : "recommended",
      reason: score === 1 ? `Added because ${selected.find((item) => (item.module.dependencies ?? []).includes(module.id))?.module.name ?? "the configured route"} depends on it.`
        : `Responds to ${labels(direct.length
          ? direct
          : compositionMatches.length
            ? compositionMatches.flatMap((composition) => composition.allOf)
            : directConcepts.filter((concept) => concept.possibleModuleSlugs?.includes(module.id)).map((concept) => concept.slug)).join(" and ")}.`,
      deliverables: module.deliverables,
    })),
    scope: {
      objective: [...new Set(activated.flatMap(({ module }) => module.outcomes))].join("; "),
      includedSystems: conceptLabels,
      outcomes: [...new Set(activated.flatMap(({ module }) => module.outcomes))],
      assumptions: environments.length
        ? [`The provisional operating context is ${environments.map((item) => item.label.toLowerCase()).join(", ")}.`]
        : ["The operating environment and ownership boundaries will be confirmed during discovery."],
      exclusions: ["Functions and third-party systems not resolved by the interpreted configuration remain outside the provisional boundary."],
      questions: [...new Set(selected.flatMap(({ module }) => module.questions))],
    },
    deliveryPhases: selected.flatMap(({ module }) => module.stages.map((stage) => ({ stage, moduleId: module.id })))
      .reduce<Array<{ name: string; purpose: string; moduleIds: string[] }>>((phases, item) => {
        const existing = phases.find((phase) => phase.name === item.stage);
        if (existing) existing.moduleIds.push(item.moduleId);
        else phases.push({ name: item.stage, purpose: `Apply ${selected.filter(({ module }) => module.stages.includes(item.stage)).map(({ module }) => module.name.toLowerCase()).join(", ")} during ${item.stage.replaceAll("-", " ")}.`, moduleIds: [item.moduleId] });
        return phases;
      }, []),
    capabilityRequirements,
    capabilityConfiguration,
    relevantWork: [
      ...directWork.slice(0, 7).map((result) => ({
        workSlug: result.item.slug, projectSlug: result.item.projectSlug, presentationClass: result.presentationClass,
        generatedSummary: result.matchedClaims[0]?.statement ?? result.item.summary,
        reasons: [
          ...labels(result.directMatches).map((label) => `Matches ${label.toLowerCase()}.`),
          ...(result.claims.length ? ["Connected through confirmed Work claims."] : ["Derived migration candidate; not yet confirmed as canonical semantic truth."]),
        ],
        score: Number(result.score.toFixed(1)), matchedClaimIds: result.matchedClaims.map((claim) => claim.id),
        matchedConcepts: result.directMatches, matchedHatSlugs: result.matchedHats,
        scoreComponents: { responsibility: result.responsibility, environment: result.environment, capability: result.capability, evidence: Number(result.evidenceScore.toFixed(1)) },
        evidenceCoverage: Number(result.evidence.coverage.toFixed(2)), publicEvidenceCoverage: Number(result.evidence.publicCoverage.toFixed(2)),
        relationshipSource: result.claims.length ? "confirmed-claims" as const : "derived-candidate" as const,
        admissionTrace: {
          candidateSource: result.claims.length ? "confirmed-claim" as const : "derived-semantic-signature" as const,
          baseAdmissionScore: result.baseResponsibility,
          admittedBy: result.responsibilityMatches,
          boosts: [
            ...(result.environment ? [{ source: "environment" as const, score: result.environment }] : []),
            ...(result.qualityBoost ? [{ source: "quality" as const, score: result.qualityBoost }] : []),
            ...(result.capability ? [{ source: "hat-relationship" as const, score: result.capability }] : []),
            ...(result.evidenceScore ? [{ source: "evidence" as const, score: Number(result.evidenceScore.toFixed(1)) }] : []),
          ],
        },
      })),
      ...lowerTierWork.map((result) => ({
        workSlug: result.item.slug, projectSlug: result.item.projectSlug,
        presentationClass: (result.systemScore ? "connected-system-experience" : "capability-connected-work") as PresentationClass,
        generatedSummary: result.systemScore
          ? `${result.item.summary} Connected through ${labels(result.systemMatches).join(", ").toLowerCase()}.`
          : `${result.item.summary} Connected through capabilities selected for this route.`,
        reasons: [
          ...(result.matchedHatSlugs.length ? [`Selected capabilities previously applied here: ${result.matchedHatSlugs.join(", ")}.`] : []),
          ...(result.systemMatches.length ? [`System concepts: ${labels(result.systemMatches).join(", ")}.`] : []),
        ],
        score: result.score, matchedClaimIds: [], matchedConcepts: result.systemMatches,
        matchedHatSlugs: result.matchedHatSlugs,
        scoreComponents: { responsibility: 0, environment: 0, capability: result.capabilityScore, evidence: 0 },
        evidenceCoverage: 0, publicEvidenceCoverage: 0, relationshipSource: "derived-candidate" as const,
        admissionTrace: {
          candidateSource: "derived-semantic-signature" as const,
          baseAdmissionScore: result.systemScore,
          admittedBy: result.systemMatches,
          boosts: result.capabilityScore
            ? [{ source: "hat-relationship" as const, score: result.capabilityScore }]
            : [],
        },
      })),
    ],
    confidence: { level, explanation: level === "strong" ? "The description resolves a coherent set of responsibilities, operating conditions and delivery dependencies." : "A viable route is available; resolving the listed questions will sharpen its boundary." },
    diagnostics: {
      recognisedPhrases: interpretation.direct.flatMap(({ matches }) => matches).sort(),
      activatedModules: activated.map(({ module }) => module.id).sort(), addedDependencies: [...addedDependencies].sort(),
      unresolvedTerms,
      rawQuery: query, normalisedQuery: words(query).join(" "), analysisId: queryHash(query),
      analysisHash: stableHash({
        query,
        concepts: directConcepts.map((item) => item.slug),
        modules: selected.map(({ module }) => module.id),
        requirements: requirements,
        capabilities: capabilityConfiguration.map((item) => item.slug),
        work: [...directWork.map((item) => item.item.slug), ...lowerTierWork.map((item) => item.item.slug)],
        engineVersion: ENGINE_VERSION,
        knowledgeHash: KNOWLEDGE_HASH,
      }),
      modifierBindings: [
        ...boundModifiers.filter(({ target }) => target).map(({ modifier, target }) => `${modifier.slug} → ${target!.slug}`),
        ...senseBindings.map(({ modifier, target, resolvedConceptSlugs }) => `${modifier.slug} → ${target.slug} → ${resolvedConceptSlugs.join("+")}`),
      ].sort(),
      engineVersion: ENGINE_VERSION,
      knowledgeVersion: KNOWLEDGE_VERSION,
      knowledgeHash: KNOWLEDGE_HASH,
    },
  };
}

function queryHash(query: string) {
  let hash = 2166136261;
  for (const character of query.trim().toLowerCase()) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `q-${(hash >>> 0).toString(16)}`;
}


export { presentationLabel };
